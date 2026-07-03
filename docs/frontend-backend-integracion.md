# Integracion frontend-backend - Sprint 1

## Objetivo

La pantalla `/perfil-docente` del frontend Next.js consume el endpoint demo del backend Spring Boot para mostrar el Perfil Docente del Sprint 1.

## Endpoint consumido

```http
GET http://localhost:8080/api/v1/docentes/demo/perfil
```

## Variable de entorno

El frontend usa la URL base definida en:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

La variable se configura en `.env.local`. El archivo `.env.example` queda como referencia versionable.

## Cadena de dependencia

```text
src/app/perfil-docente/page.tsx
  -> perfilDocenteService.ts
  -> API REST Spring Boot
```

El mock local se conserva solo como recurso de desarrollo y ya no es la fuente de datos de la pantalla.

## CORS

El backend incluye una configuracion CORS minima para desarrollo. Permite solicitudes `GET` hacia `/api/**` desde:

- `http://localhost:3000`
- `http://localhost:3001`

## Ejecucion local

Backend:

```cmd
cd gestion-docente-fisi-backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```cmd
cd gestion-docente-fisi-frontend
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000/perfil-docente
```

## Backend apagado

Si el backend no esta activo, la pantalla muestra un mensaje institucional indicando que no se pudo cargar el perfil docente y que se debe verificar `http://localhost:8080`.
