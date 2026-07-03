# Diseño Perfil Docente - Fase 7

## Objetivo visual

Pulir la pantalla `/perfil-docente` para que tenga una apariencia institucional, oscura y sobria, similar al sistema administrativo de referencia mostrado en las capturas.

## Estructura de pantalla

La pantalla mantiene una distribucion tipo dashboard:

- sidebar izquierda institucional;
- header superior con breadcrumb, titulo y badges;
- cabecera del perfil docente;
- card de datos generales;
- card de resumen de constancias;
- tabla de constancias generadas.

## Componentes principales

- `AppSidebar`
- `AppHeader`
- `PerfilDocenteHeader`
- `DatosDocenteCard`
- `ResumenConstanciasCard`
- `MetricCard`
- `ConstanciasTable`
- `EstadoConstanciaBadge`

## Decisiones de diseño

Se mantiene una paleta oscura con verde institucional, dorado para acentos, bordes sutiles y tarjetas densas de lectura rapida. El perfil docente muestra Departamento Academico como dato institucional principal.

## Datos

Los datos siguen siendo simulados y provienen del mock local `perfilDocente.mock.ts`.

La integracion con el backend Spring Boot queda para una fase posterior.
