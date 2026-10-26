# EDO Lab — Crecimiento y Decrecimiento Exponencial

Laboratorio educativo en español para resolver **dP/dt = kP**, calcular **k = ln(P(t₁)/P₀) / t₁** y explorar **P(t) = P₀eᵏᵗ**.

## Ejecutar el proyecto

Requiere Node.js 22.12 o posterior; se verificó con Node.js 24.

```bash
npm ci
npm run dev
```

Abre la dirección que muestre Vite. Para obtener y revisar la versión de producción:

```bash
npm run test
npm run build
npm run preview
```

`npm run typecheck` verifica TypeScript sin generar archivos de aplicación. `npm run test:watch` mantiene las pruebas abiertas durante el desarrollo.

## Usar el laboratorio

1. Selecciona crecimiento o decrecimiento.
2. Introduce P₀, t₁ y P(t₁); elige segundos, minutos, horas o días. También puedes cargar el ejemplo del modelo seleccionado.
3. Pulsa **Resolver ecuación**. Cambiar entradas o modelo invalida la solución anterior, evitando mostrar cálculos de otros datos.
4. Abre cada uno de los diez pasos o usa **Mostrar toda la solución**.
5. Ajusta el tiempo máximo, el número de intervalos y los decimales; pulsa **Aplicar**. Los ajustes válidos actualizan la tabla, la animación y la gráfica conjuntamente.
6. Reproduce, pausa o reinicia la animación. La barra temporal admite ratón y teclado; Inicio/Fin llevan a los extremos.
7. Explora la gráfica con el cursor, un toque o su control temporal. La vista permite ampliar la primera o la segunda mitad del horizonte.
8. Descarga la tabla en CSV y la vista actual de la gráfica en PNG de 1800 × 1000 px.

El tema se guarda localmente cuando el navegador permite almacenamiento. Los datos del ejercicio no se envían a ningún servidor. No se necesitan cuentas, claves, base de datos ni backend. Las tipografías y KaTeX se sirven con la aplicación; no se solicitan a Google Fonts ni a un CDN externo.

## Exactitud y límites numéricos

- P₀, P(t₁) y t₁ deben ser positivos, finitos y estar entre 10⁻¹⁰⁰ y 10¹⁰⁰.
- Crecimiento exige P(t₁) > P₀; decrecimiento exige P(t₁) < P₀.
- La igualdad produce k = 0; la interfaz explica que es un modelo constante y no lo presenta como crecimiento o decrecimiento estricto.
- Se aceptan coma decimal y notación científica, pero no expresiones, separadores de miles ni texto arbitrario.
- Para k se usan diferencias de logaritmos, o `log1p` cuando las cantidades son muy próximas. Esto evita desbordar cocientes y perder diferencias pequeñas.
- Los valores de P(t) se evalúan en el dominio logarítmico y se comprueban antes de generar tablas y curvas. Si un horizonte supera el rango seguro, se rechaza con una explicación y se conserva la configuración anterior.
- Por defecto se usan 2t₁ y 10 intervalos (11 puntos). Si 2t₁ excede el rango, el horizonte inicial se limita al máximo seguro y se informa en pantalla.
- El formulario de tabla permite de 1 a 100 intervalos y de 0 a 8 decimales. El CSV conserva la precisión interna, independientemente del redondeo visual.
- El contador utiliza la misma función que la tabla y la curva. Las 96 bacterias como máximo son una representación proporcional, no un conteo de individuos. Su escala se mantiene fija durante cada horizonte.
- Cambiar la unidad de tiempo reinterpreta las cifras; no realiza una conversión implícita.
- Son cálculos de coma flotante IEEE 754, no álgebra simbólica de precisión arbitraria.

### Ejemplos comprobados

| Modelo | P₀ | t₁ | P(t₁) | k aproximada | P(10) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Crecimiento | 100 | 5 | 200 | 0,1386294361 | 400 |
| Decrecimiento | 100 | 5 | 50 | −0,1386294361 | 25 |

## Organización del código

- `src/lib/model.ts`: tipos, validaciones, cálculo, evaluación, muestreo y serialización CSV.
- `src/lib/model.test.ts`: pruebas de ejemplos, condiciones iniciales, valores inválidos, caso constante, coherencia y extremos numéricos.
- `src/components/Formula.tsx`: fórmulas KaTeX con representación accesible MathML.
- `ModelPicker`, `DataForm`, `Results`: selección, entradas y resumen.
- `SolutionSteps`: separación de variables y explicación en diez pasos.
- `ValueTable`: ajustes de horizonte, intervalos, precisión y descarga CSV.
- `Bacteria`: animación proporcional con límite fijo de elementos y preferencia de movimiento reducido.
- `PopulationChart`: gráfica SVG adaptable, ampliación, lectura interactiva y exportación PNG con Canvas.
- `src/App.tsx`: coordinación del estado y navegación.
- `src/styles.css`: temas, diseño responsive desde 320 px, impresión y accesibilidad.

La gráfica se implementa con SVG nativo para evitar otra dependencia de visualización. Las animaciones utilizan CSS y `requestAnimationFrame`.

## GitHub y Vercel

Destino solicitado: https://github.com/andrsbv/edo-primer-orden-lab

El código de esta entrega está preparado para ese repositorio. **No se ha confirmado una publicación en GitHub ni un despliegue en Vercel:** la conexión de GitHub no tenía acceso al repositorio y Vercel devolvió 403 para el equipo del propietario. No existe una URL de producción confirmada en esta entrega.

Cuando los accesos estén habilitados, incorpora estos archivos en la raíz de la rama `main`. Si el repositorio ya contiene código, revísalo y conserva los archivos pertinentes antes de integrar esta versión; no es necesario reemplazar el historial ni forzar una subida.

Para desplegar desde el panel de Vercel:

1. Crea un proyecto importando `andrsbv/edo-primer-orden-lab` desde GitHub.
2. Usa la raíz del repositorio como **Root Directory** y selecciona **Vite**.
3. **Install Command:** `npm ci`.
4. **Build Command:** `npm run build`.
5. **Output Directory:** `dist`.
6. Usa Node.js 24.x y la rama `main` para producción.
7. No agregues variables de entorno. Pulsa **Deploy** y espera el estado **Ready**.
8. Abre la URL real que Vercel asigne y prueba los dos ejemplos, las descargas y la recarga de página.

`vercel.json` incorpora la configuración de compilación y encabezados básicos. Toda la navegación de la aplicación usa anclas dentro de `/`; no requiere rutas de servidor ni redirecciones SPA. La integración de Git de Vercel podrá volver a desplegar los cambios de `main` después de quedar conectada.

## Verificación realizada

Consulta `VERIFICACION.md` para distinguir las comprobaciones ejecutadas de las pendientes de publicación. Las pruebas reducen el riesgo de fallos; no representan una garantía universal de ausencia de bugs en todos los navegadores y dispositivos.
