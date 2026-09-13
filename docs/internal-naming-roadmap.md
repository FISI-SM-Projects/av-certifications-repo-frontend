# Internal naming roadmap

The frontend API client consumes only the final English public API. Spanish page paths and visible copy remain acceptable because the product UI is for Spanish-speaking FISI users.

## Cleaned in this checkpoint

- Confirmed route constants use the final backend contract: `/auth`, `/teachers`, `/certificates`, and `/health`.
- Documented that new API services must not call versioned, Spanish, demo, temporary, or legacy backend paths.

## Remaining internal Spanish names

- UI routes such as `/constancias`, `/perfil-docente`, and `/director`, which are user-facing pages rather than backend API paths.
- View-model types and services such as `PerfilDocenteResponse`, `ConstanciaApiError`, `listarConstancias`, and `obtenerPerfilDocentePorCodigo`.
- UI labels and messages in Spanish.

## Suggested cleanup order

1. Certificate service function names and local view-model aliases.
2. Teacher profile service and type aliases.
3. Director dashboard service models.
4. Shared status helpers and internal storage keys.

## Guardrails

- Do not change user-facing page routes only for technical naming.
- Keep `src/config/apiRoutes.ts` as the source of truth for backend paths.
- Do not reintroduce `/api/v1`, `/docentes`, `/constancias`, `/director`, `/demo`, `/legacy`, or `/temp` as backend API paths.
