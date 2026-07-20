# Dashboard de finanzas familiares

Aplicación web para consultar saldos, ingresos y gastos familiares en ARS, USD y EUR. Permite importar movimientos desde un CSV, filtrar por cuenta y categoría y visualizar la evolución mensual.

## Estado actual

La aplicación utiliza Supabase para el acceso del administrador, el espacio familiar compartido y los movimientos. La importación de CSV se procesa como un único lote y rechaza archivos duplicados. El administrador puede generar y revocar un enlace familiar de solo lectura, sin cuentas adicionales.

## Desarrollo local

Necesitas Node.js 20.19 o superior.

```bash
npm install
npm run dev
```

Crea primero un archivo `.env.local` (no lo subas a GitHub):

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

Vite mostrará una dirección local, normalmente `http://localhost:5173`.

## Comprobar la compilación

```bash
npm run build
npm run preview
```

Los archivos optimizados se generan en `dist/`.

## Subir a GitHub

1. Crea un repositorio privado llamado `dashboard-finanzas-familiares`.
2. Sube todos los archivos de esta carpeta a la raíz del repositorio.
3. No subas archivos `.env` ni datos financieros reales.

Desde una terminal también puedes usar:

```bash
git init
git add .
git commit -m "Primera versión del dashboard familiar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dashboard-finanzas-familiares.git
git push -u origin main
```

## Publicar en Vercel

1. En Vercel, selecciona **Add New > Project**.
2. Importa el repositorio de GitHub.
3. Vercel reconocerá automáticamente Vite.
4. Comprueba que el comando de build sea `npm run build` y el directorio de salida `dist`.
5. Añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` en **Settings > Environment Variables**.
6. Pulsa **Deploy**.

Cada `push` posterior a la rama `main` generará un nuevo despliegue.

## Preparar Supabase

Ejecuta desde **Supabase > SQL Editor**, en este orden:

1. `supabase/schema.sql`
2. `supabase/002_import_csv.sql`
3. `supabase/003_readonly_share_link.sql`

Los tres scripts terminan correctamente con el mensaje `Success. No rows returned`.

## Compartir el dashboard

Inicia sesión como administrador y pulsa **Compartir > Generar enlace**. Cada enlace contiene un token aleatorio y permite consultar el dashboard sin iniciar sesión, pero no modificar ni importar datos. Al generar otro enlace, el anterior queda invalidado; también puede revocarse manualmente.

## Formato del CSV

La primera fila debe conservar exactamente estos encabezados:

```csv
fecha,descripcion,categoria,cuenta,moneda,tipo,importe
2026-07-15,Supermercado,Alimentación,Banco Galicia,ARS,Gasto,85400
```

Valores admitidos:

- `moneda`: `ARS`, `USD` o `EUR`.
- `tipo`: `Ingreso` o `Gasto`.
- `fecha`: `AAAA-MM-DD` o `DD/MM/AAAA`.

## Privacidad

El repositorio debe mantenerse privado. No incluyas CSV reales, contraseñas, tokens ni claves privadas. La clave publicable de Supabase puede usarse en el navegador porque el acceso real está limitado mediante RLS; nunca uses la clave secreta o `service_role` en Vite.
