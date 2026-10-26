# Verificación de EDO Lab

Fecha: 26 de octubre de 2026.

## Comprobaciones ejecutadas

- Instalación de dependencias con npm y archivo de bloqueo.
- Compilación TypeScript estricta y construcción de producción con Vite.
- 38 pruebas Vitest: crecimiento, decrecimiento, P(0), observación, k = 0, validaciones, tabla, CSV, unidades y límites numéricos.
- Inicio del servidor de desarrollo y apertura de la aplicación en Chrome.
- Resolución en la interfaz del ejemplo de crecimiento: k ≈ 0,1386294361 y P(10) = 400.
- Resolución en la interfaz del ejemplo de decrecimiento: k ≈ −0,1386294361 y P(10) = 25.
- Expansión de los diez pasos: ninguna fórmula con error de KaTeX.
- Navegación por anclas a las secciones.
- Cambio de modelo con datos incompatibles: se muestra el error sin corregir silenciosamente los valores.
- Reproducción, pausa y reinicio de animación; lectura de tiempo y cantidad en evolución.
- Control temporal por teclado hasta el final; el contador y la gráfica muestran el mismo instante.
- Ampliación a la segunda mitad de la gráfica.
- Horizonte cero rechazado con un mensaje comprensible, conservando el modelo válido.
- Descarga CSV desde el navegador; contenido comprobado, incluyendo P(10) ≈ 400 con precisión interna.
- Descarga PNG iniciada y completada por el navegador. La copia del PNG no quedó disponible en el entorno de archivos para inspeccionar sus bytes.
- Diseño de escritorio inspeccionado visualmente.
- Vista de prueba de 320 px con pasos abiertos y gráfica: ancho útil 305 px y `scrollWidth` 305 px; sin desbordamiento horizontal de la página. Las fórmulas y la tabla tienen desplazamiento interno cuando hace falta.

## Límites de la verificación

- No se probó en un teléfono físico ni en todos los navegadores.
- El entorno bloqueó el cambio de ancho del contenedor de prueba a 375 px; las vistas adicionales se revisaron en el código CSS, no se verificaron visualmente.
- No se completó una verificación interactiva del tema oscuro ni de su persistencia tras recargar.
- Los registros capturados contenían errores de una extensión del navegador (`chrome-extension://...`), no errores de ejecución de EDO Lab.
- No se validó una URL de producción, porque no fue posible autorizar desde esta sesión el equipo de Vercel ni acceder al repositorio de GitHub indicado.

## Antes de dar por finalizada la publicación

1. Habilitar acceso de la conexión GitHub al repositorio `andrsbv/edo-primer-orden-lab`.
2. Autorizar el equipo correcto de Vercel.
3. Revisar cualquier contenido existente del repositorio, incorporar esta versión y publicar un commit normal en `main`.
4. Desplegar ese commit y comprobar el estado `READY`.
5. Abrir la URL de producción, resolver ambos ejemplos, probar el tema oscuro, recargar y descargar CSV/PNG.
