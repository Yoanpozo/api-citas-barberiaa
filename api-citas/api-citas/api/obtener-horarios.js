const { supabase, NEGOCIO_ID } = require('../lib/supabase');
const { slotsLibresProveedor } = require('../lib/disponibilidad');
const { obtenerArgs } = require('../lib/parseBody');

module.exports = async (req, res) => {
  try {
    const { servicio_nombre, proveedor_id } = obtenerArgs(req);

    const { data: serviciosEncontrados, error: errServicio } = await supabase
      .from('servicios')
      .select('id, nombre, duracion_min')
      .eq('negocio_id', NEGOCIO_ID)
      .ilike('nombre', `%${servicio_nombre}%`);

    if (errServicio || !serviciosEncontrados || serviciosEncontrados.length !== 1) {
      console.error('Error buscando servicio:', errServicio, 'servicio_nombre recibido:', servicio_nombre);
      return res.status(200).json({ error: 'No encontré ese servicio.' });
    }

    const servicio = serviciosEncontrados[0];

    let query = supabase
      .from('proveedores')
      .select('id, nombre, horario_semanal')
      .eq('negocio_id', NEGOCIO_ID)
      .eq('activo', true);
    if (proveedor_id) query = query.eq('id', proveedor_id);

    const { data: proveedores } = await query;

    const idsProveedores = proveedores.map((p) => p.id);
    const { data: citas } = await supabase
      .from('citas')
      .select('proveedor_id, hora_inicio, hora_fin')
      .in('proveedor_id', idsProveedores)
      .eq('estado', 'confirmada')
      .gte('hora_inicio', new Date().toISOString());

    let todosLosSlots = [];
    for (const proveedor of proveedores) {
      const citasDelProveedor = citas.filter((c) => c.proveedor_id === proveedor.id);
      const slots = slotsLibresProveedor(proveedor, servicio.duracion_min, citasDelProveedor);
      todosLosSlots.push(...slots);
    }

    todosLosSlots.sort((a, b) => new Date(a.hora_inicio) - new Date(b.hora_inicio));
    todosLosSlots = todosLosSlots.slice(0, 8);

    return res.status(200).json({
      servicio_id: servicio.id,
      duracion_min: servicio.duracion_min,
      horarios_disponibles: todosLosSlots,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ error: 'Ocurrió un problema consultando la disponibilidad.' });
  }
};
