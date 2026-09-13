# API client routes

The frontend consumes the versioned backend API under `/api/v1`.

## Official routes

New services should use route constants from `src/config/apiRoutes.ts`.

- `POST /api/v1/auth/login`
- `GET /api/v1/teachers`
- `GET /api/v1/teachers/me`
- `GET /api/v1/teachers/me/courses`
- `GET /api/v1/certificates`
- `POST /api/v1/certificates`
- `GET /api/v1/certificates/{id}`
- `GET /api/v1/certificates/{id}/document`
- `GET /api/v1/certificates/{id}/versions`
- `POST /api/v1/certificates/{id}/signature`

`/api/v1/teachers/me/courses` returns an Apidog-style envelope with `data` and `pagination`; UI services map that response to the current view models.
Certificate services consume the official `/api/v1/certificates/**` family and map the public DTO into the current certificate view model. PDF preview and download use the same document endpoint with `disposition=inline|attachment`.

When the backend reports a partial semester consolidation with HTTP 409, the UI asks for confirmation and repeats `POST /api/v1/certificates` with `confirmIncomplete=true`.

## Legacy routes

Temporary legacy routes remain available in the backend for compatibility, but current frontend MVP flows should not consume them:

- `/api/v1/auth/me` for session role context

New frontend services should not introduce calls to Spanish public paths such as `/api/v1/constancias/**`, `/api/v1/director/**`, or `/api/v1/docentes/**`.
