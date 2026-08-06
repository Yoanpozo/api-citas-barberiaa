// Retell (y otros clientes) a veces mandan el cuerpo de la petición
// como texto plano en vez de JSON ya interpretado. Esta función se
// asegura de que siempre obtengamos un objeto de verdad, sin importar
// cómo haya llegado.
function obtenerArgs(req) {
  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  if (!body || typeof body !== 'object') {
    body = {};
  }

  // Retell manda los parámetros dentro de "args"; si no viene así,
  // usamos el cuerpo directo como respaldo.
  return body.args && typeof body.args === 'object' ? body.args : body;
}

module.exports = { obtenerArgs };
