# Mocks Frontend Sprint 1

Documento historico de Fase 8. En esa fase, la pantalla `/perfil-docente` usaba datos simulados locales para funcionar sin depender del backend Spring Boot.

## Origen de datos

El mock principal esta en:

```text
src/features/perfil-docente/mocks/perfilDocente.mock.ts
```

El mock queda conservado como recurso de desarrollo en:

```text
src/features/perfil-docente/mocks/perfilDocente.mock.ts
```

Desde Fase 9, el service `perfilDocenteService.ts` consume el backend Spring Boot mediante `fetch`. La pagina mantiene la dependencia sobre `obtenerPerfilDocente()`, no importa el mock directamente.

## Estado actual

- Se consume la API REST de Spring Boot.
- El mock no se usa como fallback silencioso.
- Los estados disponibles son solo `GENERADO` y `APROBADO`.
- El boton `Ver PDF` es visual y queda marcado como disponible para integracion futura.

## Verificacion

Se verifico lint, build y ejecucion local de Next.js. La integracion actual queda documentada en `docs/frontend-backend-integracion.md`.
