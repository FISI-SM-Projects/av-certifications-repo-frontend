# Gestion Docente FISI - Frontend

Aplicacion web en Next.js App Router para la gestion docente y consulta de constancias.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.

## Levantar el frontend

```powershell
npm ci
npm run dev
```

El frontend queda disponible por defecto en:

```text
http://localhost:3000
```

## Configuracion

- `NEXT_PUBLIC_API_URL`: URL del backend.
- `NEXT_PUBLIC_UI_MODE`: usar `demo` para desarrollo y simulacion, o `production` para una interfaz limpia de usuario final.

## Estructura

`src/app/`

- Rutas, layouts y paginas del App Router.

El resto de `src/` se organiza por capas y dentro de cada capa por modulo funcional.

- `components/`: componentes visuales por modulo, layout y piezas compartidas.
- `services/`: consumo HTTP y servicios de cliente.
- `types/`: contratos TypeScript.
- `hooks/`: hooks reutilizables cuando existan.
- `context/`: providers de contexto, como autenticacion.
- `guards/`: proteccion visual de sesion y roles.
- `lib/`: infraestructura comun, URL de API y cliente HTTP.
- `utils/`: utilidades transversales.
- `mocks/`: datos simulados auxiliares.

`public/`

- Recursos estaticos.
