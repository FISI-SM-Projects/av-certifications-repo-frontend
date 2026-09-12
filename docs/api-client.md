# API client routes

The frontend consumes the versioned backend API under `/api/v1`.

## Official routes

New services should use route constants from `src/config/apiRoutes.ts`.

- `POST /api/v1/auth/login`
- `GET /api/v1/teachers/me`
- `GET /api/v1/teachers/me/courses`

`/api/v1/teachers/me/courses` returns an Apidog-style envelope with `data` and `pagination`; UI services map that response to the current view models.

## Legacy routes

The certificate flow still consumes temporary legacy routes while the certificates API is standardized:

- `/api/v1/constancias/**`
- `/api/v1/director/**`
- `/api/v1/auth/me` for session role context

New frontend services should not introduce new calls to Spanish public paths unless they are explicitly marked legacy in `src/config/apiRoutes.ts`.
