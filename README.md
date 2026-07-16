# Gestion Docente FISI - Frontend

Frontend web del Sistema de Gestion Docente y Constancias de la FISI. Esta desarrollado con Next.js App Router, React, TypeScript y Tailwind CSS.

Incluye autenticacion simulada, vistas por rol, perfil docente consolidado, listado de constancias, generacion simulada por curso y semestral, visor PDF y descarga.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- Backend disponible en la URL configurada.

## Instalacion reproducible

```powershell
npm.cmd ci
```

Usar `npm ci` para respetar `package-lock.json`. No compartir ni versionar `node_modules/`.

## Configuracion

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

`NEXT_PUBLIC_API_URL` es la URL publica que usa el navegador para llamar al backend. El fallback local tambien es `http://localhost:8080`.

No versionar `.env` reales.

## Ejecucion

Windows:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

Linux/macOS:

```bash
npm run dev
npm run lint
npm run build
```

El build no depende de Google Fonts ni de descargas de fuentes externas.

## Rutas

```text
/login-demo
/perfil-docente
/constancias
/constancias/[generationId]
/director
/director/docentes
/director/docentes/[teacherCode]
/director/constancias
/admin
```

## Roles y sesion demo

- `DOCENTE`: perfil personal, constancias y visor.
- `DIRECTOR`: dashboard, docentes por departamento y perfil consultado.
- `ADMIN`: vistas administrativas y acceso de validacion.

La sesion demo se guarda en `localStorage`. No hay JWT, cookies seguras, LDAP ni seguridad real.

## Constancias

`/constancias` permite:

- listar ultimas constancias visibles;
- generar constancia por curso desde una simulacion de Aula Virtual;
- generar constancia semestral con cursos esperados;
- abrir detalle;
- descargar PDF.

`/constancias/[generationId]` muestra metadata publica y un visor PDF con `iframe`. La descarga usa directamente el endpoint del backend.

Las fechas de constancias se muestran en `America/Lima` mediante `Intl.DateTimeFormat`.

## HTTP y errores

Las llamadas REST usan un helper comun con:

- URL base centralizada;
- timeout uniforme;
- `AbortController`;
- parsing JSON controlado;
- errores de red y HTTP uniformes;
- validacion ligera de respuestas criticas.

Los endpoints PDF se usan como enlaces directos cuando el navegador debe abrir o descargar el archivo.

## Exportacion limpia

Generar un ZIP compartible sin artefactos locales:

```powershell
.\scripts\export-clean.ps1
```

En Linux/macOS, si `zip` esta disponible:

```bash
./scripts/export-clean.sh
```

El ZIP excluye `.git/`, `node_modules/`, `.next/`, variables `.env`, logs y archivos temporales. No versionar los ZIP generados.

## Verificacion

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run build
```

Las rutas principales compilan durante `npm run build`.

## Limitaciones

- Sin Moodle real.
- Sin aprobacion formal por director.
- Sin middleware de seguridad.
- Sin JWT ni LDAP.
- Sin QR ni firma digital.
- El visor PDF depende de las capacidades del navegador.

Trabajar sobre la rama local `progress` para los bloques de saneamiento previos al Sprint 4.
