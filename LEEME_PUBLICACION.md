# Crecidas e inundaciones en el Litoral

App en HTML para PC y celular, basada en la infografía del 14/10/2026. Contiene mapa topográfico, 25 estaciones, diez localidades adicionales, reportes de evacuaciones, pronóstico, evolución y fuentes.

## Publicar con actualizaciones automáticas (recomendado)

1. Descomprimí el ZIP en tu PC.
2. Creá un repositorio público en GitHub con la rama principal `main`.
3. Subí **todo el contenido** de la carpeta descomprimida, conservando las carpetas `scripts` y `.github/workflows`. No subas el ZIP como un único archivo al repositorio. `index.html` y `data.json` deben quedar en la raíz.
4. En **Settings → Pages → Build and deployment → Source**, elegí **GitHub Actions**.
5. En **Settings → Actions → General → Workflow permissions**, permití **Read and write permissions** si el repositorio o tu organización no lo permiten ya. Guardá.
6. En **Actions**, abrí **Actualizar fuentes y publicar app** y pulsá **Run workflow → Run workflow**. Si GitHub pide habilitar Actions, habilitalo.
7. Esperá el resultado verde. En **Settings → Pages** aparece el enlace de tu app. Podés copiarlo y abrirlo en el celular.

La tarea queda configurada cada seis horas: 23:17, 05:17, 11:17 y 17:17, hora de Argentina (02:17, 08:17, 14:17 y 20:17 UTC). GitHub puede demorar los disparos programados; no es un servicio de alerta en tiempo real. En repositorios públicos sin actividad, GitHub puede deshabilitar tareas programadas después de 60 días; revisá Actions y habilitalas nuevamente si hace falta.

La actualización automática estará activa **después de subir el paquete y habilitar Actions**; no se activó en tu cuenta desde esta entrega. No necesitás claves de APIs ni copiar credenciales en el HTML. La tarea utiliza el token temporal que GitHub proporciona al propio repositorio.

## Qué se actualiza

- El lector consulta las fuentes configuradas del INA, SMN y su repositorio, municipio de Paso de los Libres, Confirmado y Concordia 24, Open-Meteo / MET Norway y el servicio cartográfico de Esri.
- Los niveles, umbrales, colores y tabla de estaciones cambian cuando el reporte del INA se valida.
- El pronóstico cubre los tres días siguientes. Open-Meteo es la fuente primaria; MET Norway es respaldo y aporta extremos estimados del pronóstico horario.
- Los conteos de evacuación solo reemplazan el dato anterior cuando hay una publicación posterior y cifras inequívocas. Reportes ambiguos quedan marcados para revisión.
- Las diez localidades territoriales originales conservan su fecha hasta verificar una nueva delimitación. Las noticias no se convierten automáticamente en polígonos de inundación.
- La base topográfica regional está incorporada al HTML. Se consulta la disponibilidad de Esri; esta tarea no descarga un mosaico cartográfico nuevo.
- Cada dato mantiene su fecha de publicación y cada consulta su estado. Una falla conserva el último valor válido.

## Si subís solamente index.html

Podés publicar el HTML solo o abrirlo con doble clic. Incluye el mapa y el corte original completo, y permite consultar el pronóstico público cuando el servicio y el navegador lo permiten. **Las actualizaciones de ríos y noticias mientras la app está cerrada requieren el paquete completo con GitHub Actions**.

En la app, **Cargar última actualización** lee el corte publicado en `data.json`; no dispara la tarea de GitHub. Para consultar todas las fuentes inmediatamente, usá **Actions → Run workflow**. Con la app abierta, se cargan los datos publicados cada 60 minutos, configurable en la solapa.

Para conservar una copia exacta del documento inicial, seleccioná **Corte original · 14/10/2026**. También podés descargar el PDF original, los datos JSON o usar EXPORTAR PDF para descargar una página continua sin márgenes exteriores.

## Fuentes de la publicación

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Desarrollado para Técnico Geomático Diego Martín Ortiz.

## Medios desplegados

Los puntos del Ejército Argentino se crean y editan en el mapa. Los totales suman las cantidades por categoría. En esta versión GitHub se guardan en el navegador del dispositivo; no se comparten entre dispositivos. La fecha del encabezado corresponde al día actual en Argentina y las observaciones conservan su propia fecha.
