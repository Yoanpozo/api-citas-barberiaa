const { supabase } = require('../lib/supabase');
const { obtenerArgs } = require('../lib/parseBody');

module.exports = async (req, res) => {
  try {
    const { cita_id } = obtenerArgs(req);

    const { error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', cita_id);

    if (error) throw error;

    return res.status(200).json({ exito: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ exito: false });
  }
};
