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

## Estructura

`src/app/`

- Rutas, layouts y paginas del App Router.

`src/features/`

- `admin/`: vista administrativa demo.
- `auth/`: sesion simulada, login demo y tipos de usuario.
- `constancias/`: listado, generacion simulada, detalle y servicios de constancias.
- `director/`: vistas de director y consulta de docentes.
- `perfil-docente/`: perfil docente consolidado.

`src/components/`

- `auth/`: guards de sesion y rol.
- `layout/`: shell, sidebar y header.
- `shared/`: componentes compartidos.
- `ui/`: piezas visuales reutilizables.

`src/lib/`

- Configuracion comun, URL de API, cliente HTTP y utilidades.

`public/`

- Recursos estaticos.
