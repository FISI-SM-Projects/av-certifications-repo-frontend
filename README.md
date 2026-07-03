# Gestion Docente FISI - Frontend

Repositorio frontend del Sistema de Gestion Docente FISI.

Contiene una aplicacion Next.js con TypeScript y Tailwind CSS para la pantalla `/perfil-docente` del Sprint 1.

## Ejecutar

Crear `.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

```cmd
npm install
npm run dev
```

URL local: `http://localhost:3000/perfil-docente`.

## Alcance actual

La pantalla consume el backend Spring Boot mediante `NEXT_PUBLIC_API_URL`.

Fase 7: la interfaz del Perfil Docente fue pulida con estilo institucional oscuro.

Fase 8: el frontend quedo validado para funcionar autonomamente con mocks locales.

Fase 9: el frontend quedo integrado con el backend Spring Boot.
