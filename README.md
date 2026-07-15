# Gestion Docente FISI - Frontend

Frontend web del Sistema de Gestion Docente y Constancias de la FISI. Esta desarrollado con Next.js App Router y al cierre del Sprint 3 incluye autenticacion simulada, vistas por rol y flujo docente para constancias por curso y semestrales.

El diseno institucional oscuro se mantiene como base visual, priorizando legibilidad, contraste y continuidad con el Perfil Docente del Sprint 1.

## Tecnologias

- Next.js App Router
- React
- TypeScript
- Tailwind CSS

## Configuracion

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

`.env.local` contiene configuracion local y no se versiona.

## Ejecucion

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

En PowerShell se puede usar `npm.cmd` si `npm.ps1` esta bloqueado por Execution Policy.

## Rutas disponibles

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

## Acceso por rol

### DOCENTE

- `/perfil-docente`
- `/constancias`
- `/constancias/[generationId]`

### DIRECTOR

- `/director`
- `/director/docentes`
- `/director/docentes/[teacherCode]`
- `/director/constancias`

### ADMIN

- `/admin`
- acceso a vistas de director;
- acceso permitido a `/perfil-docente`;
- acceso permitido a `/constancias` para validacion, aunque puede no tener `teacherCode`.

## Autenticacion simulada

- Los usuarios demo se cargan desde el backend.
- La sesion se guarda en `localStorage`.
- La clave local es `gestion-docente-session`.
- Los guards son visuales y dependen de la sesion simulada.
- El logout elimina la sesion local y redirige a `/login-demo`.
- No hay cookies, tokens, JWT, LDAP ni seguridad real.

## Constancias

La ruta `/constancias` permite al docente:

- listar sus ultimas constancias visibles;
- ver resumen de constancias `GENERADO` y `APROBADO`;
- generar una constancia por curso mediante una simulacion de recepcion desde Aula Virtual;
- generar una constancia semestral cuando todos los cursos esperados tienen constancia por curso;
- ver acciones de detalle y descarga.

La ruta `/constancias/[generationId]` muestra:

- metadata publica de la generacion;
- visor PDF mediante `iframe`;
- enlace para abrir el PDF en nueva pestana;
- descarga directa desde backend.

La constancia semestral usa cursos esperados introducidos manualmente y valida visualmente si ya existen constancias por curso en el listado actual. El backend vuelve a validar esta regla.

## Estado funcional

- Login demo por rol.
- Persistencia local de sesion.
- Logout.
- Sidebar y header dinamicos.
- Guards visuales por rol.
- Perfil docente del Sprint 1.
- Dashboard minimo de director.
- Listado de docentes por Departamento Academico.
- Perfil docente en modo consulta para director/admin.
- Placeholder de constancias del director.
- Dashboard admin minimo.
- Listado docente de constancias.
- Generacion simulada por curso.
- Generacion semestral simulada.
- Visor y descarga de PDF.

## Dependencia del backend

El frontend consume la API configurada en:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Endpoints principales usados por el modulo de constancias:

```text
POST /api/v1/constancias/curso
POST /api/v1/constancias/semestral
GET  /api/v1/constancias/docentes/{teacherCode}
GET  /api/v1/constancias/generaciones/{generationId}
GET  /api/v1/constancias/certificados/{certificateKey}/historial
GET  /api/v1/constancias/generaciones/{generationId}/pdf
GET  /api/v1/constancias/generaciones/{generationId}/download
```

## Limitaciones

- Sin Moodle real.
- Sin aprobacion formal por director.
- Sin middleware de seguridad.
- Sin JWT.
- Sin LDAP.
- Sin CRUD administrativo.
- Sin QR.
- Sin firma digital.
- El visor PDF depende de las capacidades del navegador del usuario.
- La validacion visual automatica con navegador integrado puede estar limitada por aislamiento de `localhost`.

## Pruebas

Verificaciones de cierre del Sprint 3:

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- Las rutas principales compilan.

El build puede requerir acceso de red si Next.js necesita descargar Google Fonts en un entorno restringido.

## Siguiente sprint

El siguiente sprint deberia enfocarse en aprobacion por director, seguridad real, integracion Moodle, trazabilidad/auditoria y mejoras UX priorizadas para el flujo de constancias.
