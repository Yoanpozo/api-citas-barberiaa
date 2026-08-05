const { createClient } = require('@supabase/supabase-js');

// Usa la SERVICE ROLE KEY (no la "anon" key) porque este código corre
// en el servidor, no en el navegador del cliente. La service role key
// se guarda como variable de entorno en Vercel, nunca en el código.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Por ahora este proyecto atiende UN solo negocio (la barbería piloto).
// Cuando se extienda a multi-tenant, este valor dejaría de ser fijo.
const NEGOCIO_ID = process.env.NEGOCIO_ID;

module.exports = { supabase, NEGOCIO_ID };
