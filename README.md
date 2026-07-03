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

## Estructura interna del frontend

El frontend usa Next.js con App Router, TypeScript y Tailwind CSS. A diferencia de un proyecto HTML, CSS y JavaScript tradicional, la aplicacion separa rutas, componentes reutilizables, funcionalidades, servicios, tipos y utilidades compartidas.

Estructura resumida:

```text
src/
|-- app/
|   |-- layout.tsx
|   |-- page.tsx
|   |-- globals.css
|   |-- favicon.ico
|   `-- perfil-docente/
|       |-- page.tsx
|       `-- loading.tsx
|-- components/
|   |-- layout/
|   |-- shared/
|   `-- ui/
|-- features/
|   `-- perfil-docente/
|       |-- components/
|       |-- mocks/
|       |-- services/
|       `-- types/
`-- lib/
    `-- api.ts
```

`app/` define las rutas de Next.js. Cada carpeta dentro de `app/` representa una URL. Por ejemplo, `app/perfil-docente/page.tsx` corresponde a `/perfil-docente`. `layout.tsx` define la estructura comun, `globals.css` contiene estilos globales y `loading.tsx` define el estado de carga. Las paginas deben mantenerse lo mas delgadas posible.

`components/` contiene componentes reutilizables por varias interfaces. `components/layout/` agrupa piezas de estructura visual general, como sidebar y header. `components/shared/` queda reservado para componentes compartidos por distintas funcionalidades. `components/ui/` queda reservado para elementos visuales genericos como botones, tarjetas, badges o tablas.

`features/` contiene modulos funcionales o interfaces completas. `features/perfil-docente/` agrupa todo lo especifico de la interfaz Perfil Docente.

Dentro de una feature, `components/` contiene componentes visuales exclusivos de esa interfaz; `services/` contiene comunicacion con APIs y uso de `fetch`; `types/` define tipos TypeScript y contratos de datos; `mocks/` conserva datos simulados para pruebas o desarrollo, pero no deben usarse silenciosamente como fallback en produccion.

`lib/` contiene utilidades y configuracion compartida. En este proyecto, `lib/api.ts` centraliza la URL base del backend y la configuracion comun para llamadas HTTP.

Flujo de datos en Perfil Docente:

```text
app/perfil-docente/page.tsx
    |
    v
features/perfil-docente/services/perfilDocenteService.ts
    |
    v
API REST Spring Boot
    |
    v
PerfilDocenteResponse
    |
    v
components de Perfil Docente
```

La pagina coordina la interfaz, el service obtiene los datos, los types definen el contrato, los components renderizan la informacion y la URL del backend se centraliza en `lib/api.ts`.

En un proyecto tradicional, una interfaz podria estar agrupada como:

```text
perfil.html
perfil.css
perfil.js
```

En Next.js, la misma interfaz se divide en una ruta dentro de `app/`, componentes React, servicios, tipos TypeScript, estilos globales o utilitarios, y codigo compartido. Esta separacion facilita reutilizacion, pruebas, mantenimiento, escalamiento y trabajo en equipo.

Para agregar una nueva interfaz, crear una ruta en `app/` y una feature con su logica especifica. Por ejemplo:

```text
src/
|-- app/
|   `-- administracion/
|       `-- page.tsx
`-- features/
    `-- administracion/
        |-- components/
        |-- services/
        |-- types/
        `-- mocks/
```

La ruta vive en `app/`, la logica especifica vive en `features/`, los componentes globales viven en `components/` y las utilidades comunes viven en `lib/`. No se debe colocar toda la logica dentro de `page.tsx`.
