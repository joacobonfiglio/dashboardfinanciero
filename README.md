# Dashboard de finanzas familiares

Aplicación web para consultar saldos, ingresos y gastos familiares en ARS, USD y EUR. Permite importar movimientos desde un CSV, filtrar por cuenta y categoría y visualizar la evolución mensual.

## Estado actual

La versión 1 guarda los movimientos en `localStorage`. Esto significa que los datos permanecen en el navegador que importa el CSV, pero todavía no se sincronizan entre dispositivos.

Antes de utilizarla con información financiera real compartida, la siguiente fase debe incorporar:

- Acceso privado mediante usuario y contraseña.
- Base de datos compartida.
- Permisos para los miembros de la familia.
- Copias de seguridad y registro de cambios.

## Desarrollo local

Necesitas Node.js 20.19 o superior.

```bash
npm install
npm run dev
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
5. Pulsa **Deploy**.

Cada `push` posterior a la rama `main` generará un nuevo despliegue.

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

El repositorio debe mantenerse privado. No incluyas CSV reales, contraseñas, tokens ni claves privadas. El atributo `noindex` evita la indexación habitual, pero no sustituye un sistema de autenticación.
