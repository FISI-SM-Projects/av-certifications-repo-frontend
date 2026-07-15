# Gestion Docente FISI - Frontend

Frontend web del Sistema de Gestion Docente y Constancias de la FISI. Esta desarrollado con Next.js App Router y queda al cierre del Sprint 2 con autenticacion simulada, rutas por rol y vistas base para docente, director y administrador.

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
/director
/director/docentes
/director/docentes/[teacherCode]
/director/constancias
/admin
```

## Acceso por rol

### DOCENTE

- `/perfil-docente`

### DIRECTOR

- `/director`
- `/director/docentes`
- `/director/docentes/[teacherCode]`
- `/director/constancias`

### ADMIN

- `/admin`
- acceso a vistas de director;
- acceso permitido a `/perfil-docente`.

## Autenticacion simulada

- Los usuarios demo se cargan desde el backend.
- La sesion se guarda en `localStorage`.
- La clave local es `gestion-docente-session`.
- Los guards son visuales y dependen de la sesion simulada.
- El logout elimina la sesion local y redirige a `/login-demo`.
- No hay cookies, tokens, JWT, LDAP ni seguridad real.

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

## Limitaciones

- No hay middleware de seguridad.
- No hay JWT.
- No hay LDAP.
- No hay CRUD administrativo.
- No hay aprobacion real de constancias.
- No hay generacion PDF.
- `/director/constancias` es un placeholder.
- Los modulos admin son solo visuales.
- La validacion visual automatica con navegador integrado puede estar limitada por aislamiento de `localhost`.
- `lint`, `build` y smoke HTTP de rutas fueron validados.

## Pruebas

Verificaciones de cierre del Sprint 2:

- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto.
- Las rutas principales compilan y renderizan.
- Las llamadas al backend fueron validadas con `NEXT_PUBLIC_API_URL=http://localhost:8080`.

El build puede requerir acceso de red si Next.js necesita descargar Google Fonts en un entorno restringido.

## Siguiente sprint

El siguiente sprint deberia implementar el flujo real de constancias: aprobacion, generacion de PDF, estados operativos, trazabilidad visual y reemplazo progresivo de placeholders por datos reales.
