const { supabase, NEGOCIO_ID } = require('../lib/supabase');
const { obtenerArgs } = require('../lib/parseBody');

module.exports = async (req, res) => {
  try {
    const { cliente_telefono } = obtenerArgs(req);

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('negocio_id', NEGOCIO_ID)
      .eq('telefono', cliente_telefono)
      .maybeSingle();

    if (!cliente) {
      return res.status(200).json({ tiene_cita: false });
    }

    const { data: cita } = await supabase
      .from('citas')
      .select(`
        id, hora_inicio,
        proveedores ( nombre ),
        servicios ( nombre )
      `)
      .eq('cliente_id', cliente.id)
      .eq('estado', 'confirmada')
      .gte('hora_inicio', new Date().toISOString())
      .order('hora_inicio', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!cita) {
      return res.status(200).json({ tiene_cita: false });
    }

    return res.status(200).json({
      tiene_cita: true,
      cita_id: cita.id,
      hora_inicio: cita.hora_inicio,
      proveedor_nombre: cita.proveedores.nombre,
      servicio_nombre: cita.servicios.nombre,
    });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ tiene_cita: false, error: true });
  }
};
