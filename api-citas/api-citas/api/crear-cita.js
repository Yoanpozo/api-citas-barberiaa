const { supabase, NEGOCIO_ID } = require('../lib/supabase');
const { obtenerArgs } = require('../lib/parseBody');

module.exports = async (req, res) => {
  try {
    const {
      proveedor_id,
      servicio_id,
      hora_inicio,       // ISO string
      cliente_telefono,
      cliente_nombre,
    } = obtenerArgs(req);

    // 1. Buscar o crear el cliente (identificado por teléfono + negocio)
    let { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('negocio_id', NEGOCIO_ID)
      .eq('telefono', cliente_telefono)
      .maybeSingle();

    if (!cliente) {
      const { data: nuevoCliente, error: errCliente } = await supabase
        .from('clientes')
        .insert({ negocio_id: NEGOCIO_ID, telefono: cliente_telefono, nombre: cliente_nombre })
        .select('id')
        .single();
      if (errCliente) throw errCliente;
      cliente = nuevoCliente;
    }

    // 2. Obtener duración del servicio para calcular hora_fin
    const { data: servicio } = await supabase
      .from('servicios')
      .select('duracion_min')
      .eq('id', servicio_id)
      .single();

    const horaInicioDate = new Date(hora_inicio);
    const horaFinDate = new Date(horaInicioDate.getTime() + servicio.duracion_min * 60000);

    // 3. Insertar la cita. Si el horario ya se ocupó, la base de datos
    // rechaza el insert por el constraint EXCLUDE (código 23P01).
    const { data: cita, error: errCita } = await supabase
      .from('citas')
      .insert({
        negocio_id: NEGOCIO_ID,
        proveedor_id,
        cliente_id: cliente.id,
        servicio_id,
        hora_inicio: horaInicioDate.toISOString(),
        hora_fin: horaFinDate.toISOString(),
      })
      .select('id')
      .single();

    if (errCita) {
      if (errCita.code === '23P01') {
        return res.status(200).json({ exito: false, motivo: 'ese_horario_se_acaba_de_ocupar' });
      }
      throw errCita;
    }

    return res.status(200).json({ exito: true, cita_id: cita.id });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ exito: false, motivo: 'error_interno' });
  }
};
