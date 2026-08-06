# API de citas — conecta el agente de Retell con Supabase

## Qué es esto

4 endpoints que Retell va a llamar como "funciones" durante la
conversación:

- `POST /api/obtener-horarios` → devuelve horarios libres
- `POST /api/crear-cita` → agenda una cita
- `POST /api/buscar-cita` → busca la cita activa de un cliente
- `POST /api/cancelar-cita` → cancela una cita

## 1. Consigue tus credenciales de Supabase

En el panel de Supabase: **Project Settings → API**.
- `SUPABASE_URL` → el "Project URL"
- `SUPABASE_SERVICE_ROLE_KEY` → la "service_role" key (¡no la "anon"
  key! esta es secreta, nunca la compartas ni la subas a un repo público)

Y el `NEGOCIO_ID`: en el SQL Editor de Supabase corre:
```sql
SELECT id FROM negocios WHERE tipo = 'barberia';
```
Copia el UUID que te devuelve.

## 2. Despliega en Vercel (gratis, sin tarjeta)

1. Crea una cuenta en https://vercel.com (con GitHub es lo más fácil)
2. Sube esta carpeta a un repositorio de GitHub (o usa el botón
   "Add New Project" → "Upload" si Vercel te lo permite sin GitHub)
3. Al importar el proyecto, Vercel te va a pedir las variables de
   entorno — pega ahí `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y
   `NEGOCIO_ID` (los mismos valores del paso 1)
4. Dale a Deploy

Cuando termine, Vercel te da una URL como:
`https://api-citas-barberia.vercel.app`

Tus endpoints quedan en:
- `https://api-citas-barberia.vercel.app/api/obtener-horarios`
- `https://api-citas-barberia.vercel.app/api/crear-cita`
- `https://api-citas-barberia.vercel.app/api/buscar-cita`
- `https://api-citas-barberia.vercel.app/api/cancelar-cita`

## 3. Conecta estas URLs en Retell

En el editor de tu agente, sección **"Functions"** (panel derecho):

1. Añade una función nueva, nómbrala `obtener_horarios_disponibles`
2. Tipo: **Custom Function** (webhook)
3. URL: la de `/api/obtener-horarios` de arriba
4. Parámetros que envía el agente: `servicio_nombre` (texto),
   `proveedor_id` (texto, opcional)
5. Repite para las otras 3 funciones, con sus URLs y parámetros
   correspondientes (`crear_cita` necesita `proveedor_id`,
   `servicio_id`, `hora_inicio`, `cliente_telefono`, `cliente_nombre`;
   `buscar_cita_activa` necesita `cliente_telefono`; `cancelar_cita`
   necesita `cita_id`)

Una vez conectadas, prueba de nuevo la llamada — ahora el agente sí va
a consultar horarios reales de tu base de datos, y la pausa debería
ser de 1-2 segundos, no 15.
