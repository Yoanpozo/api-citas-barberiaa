const { supabase } = require('../lib/supabase');

module.exports = async (req, res) => {
  try {
    const { cita_id } = req.body?.args || req.body || {};

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
