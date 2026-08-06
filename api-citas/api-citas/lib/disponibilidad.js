// Simplificación: asumimos zona horaria fija (Cuba, UTC-5) en vez de
// una librería de zonas horarias completa. Suficiente para un piloto
// de un solo país/negocio.
const OFFSET_HORAS = -5;

const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

function claveDia(fecha) {
  return DIAS[fecha.getUTCDay()];
}

// Convierte "09:00" + una fecha (día) a un objeto Date en UTC,
// aplicando el offset fijo de la zona horaria del negocio.
function horaEnFecha(fechaBase, horaTexto) {
  const [h, m] = horaTexto.split(':').map(Number);
  const fecha = new Date(Date.UTC(
    fechaBase.getUTCFullYear(),
    fechaBase.getUTCMonth(),
    fechaBase.getUTCDate(),
    h - OFFSET_HORAS,
    m
  ));
  return fecha;
}

// Genera slots candidatos cada 30 min dentro del horario de un día,
// y descarta los que se solapan con citas ya confirmadas.
function slotsLibresDelDia(fechaBase, horarioDia, duracionMin, citasDelProveedor) {
  if (!horarioDia) return []; // el proveedor no trabaja ese día

  const [aperturaTxt, cierreTxt] = horarioDia;
  const apertura = horaEnFecha(fechaBase, aperturaTxt);
  const cierre = horaEnFecha(fechaBase, cierreTxt);

  const slots = [];
  let inicio = new Date(apertura);
  const ahora = new Date();

  while (true) {
    const fin = new Date(inicio.getTime() + duracionMin * 60000);
    if (fin > cierre) break;

    const enElPasado = inicio < ahora;
    const seSolapa = citasDelProveedor.some((cita) => {
      const citaInicio = new Date(cita.hora_inicio);
      const citaFin = new Date(cita.hora_fin);
      return inicio < citaFin && fin > citaInicio;
    });

    if (!enElPasado && !seSolapa) {
      slots.push({ hora_inicio: inicio.toISOString(), hora_fin: fin.toISOString() });
    }

    inicio = new Date(inicio.getTime() + 30 * 60000); // siguiente candidato, cada 30 min
  }

  return slots;
}

// Calcula slots libres para un proveedor en los próximos `diasAdelante` días.
function slotsLibresProveedor(proveedor, duracionMin, citasDelProveedor, diasAdelante = 7) {
  const resultado = [];
  const hoy = new Date();

  for (let i = 0; i < diasAdelante; i++) {
    const fecha = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() + i));
    const horarioDia = proveedor.horario_semanal[claveDia(fecha)];
    const citasEseDia = citasDelProveedor.filter((c) => {
      const d = new Date(c.hora_inicio);
      return d.getUTCFullYear() === fecha.getUTCFullYear() &&
             d.getUTCMonth() === fecha.getUTCMonth() &&
             d.getUTCDate() === fecha.getUTCDate();
    });
    const slots = slotsLibresDelDia(fecha, horarioDia, duracionMin, citasEseDia);
    resultado.push(...slots.map((s) => ({ ...s, proveedor_id: proveedor.id, proveedor_nombre: proveedor.nombre })));
  }

  return resultado;
}

module.exports = { slotsLibresProveedor };
