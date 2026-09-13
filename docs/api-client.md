# API client routes

The frontend consumes the final Aula Virtual/Apidog public API directly from the backend host. The public contract does not use an `/api/v1` prefix.

## Official routes

New services should use route constants from `src/config/apiRoutes.ts`.

- `POST /auth/login`
- `GET /teachers`
- `GET /teachers/me`
- `GET /teachers/me/courses`
- `GET /certificates`
- `POST /certificates`
- `GET /certificates/{id}`
- `GET /certificates/{id}/document`
- `GET /certificates/{id}/versions`
- `POST /certificates/{id}/signature`

`/teachers/me/courses` returns an Apidog-style envelope with `data` and `pagination`; UI services map that response to the current view models.
Certificate services consume the official `/certificates/**` family and map the public DTO into the current certificate view model. PDF preview and download use the same document endpoint with `disposition=inline|attachment`.

When the backend reports a partial semester consolidation with HTTP 409, the UI asks for confirmation and repeats `POST /certificates` with `confirmIncomplete=true`.

## Final contract

Frontend services must not call versioned, Spanish, demo, temporary, or legacy public paths.

Examples of disallowed backend API paths: `/api/v1/**`, `/docentes/**`, `/constancias/**`, `/director/**`, `/demo/**`, `/legacy/**`, and `/temp/**`.

Internal Spanish view-model names and Spanish UI routes are tracked in `docs/internal-naming-roadmap.md`; they are not backend API paths.
