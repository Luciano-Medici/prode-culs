# PRODE CULS: front (versión de muestra)

Web estática, sin instalaciones ni compilación.

## Publicar en Netlify
1. Entrá a app.netlify.com > Add new site > Deploy manually.
2. Arrastrá la carpeta `prode-culs` completa (la que tiene `index.html`).
3. Listo. Netlify te da una URL; después se puede conectar un dominio propio.

## Cómo probarla
- Funciona en MODO DEMO: lo que cargás queda guardado solo en ese navegador, y las tablas muestran 40 participantes y 3 jornadas con resultados de ejemplo.
- "Empezar de nuevo" (banner rojo de arriba) borra tu cartilla de prueba.
- En "Mi cartilla" podés probar con el DNI 30000000 (cartilla de ejemplo).
- Para mostrar cómo se ve una jornada cerrada, abrí la URL con `?ahora=2026-12-10T20:00` al final.
- Para medir de dónde entra la gente: el QR del stand con `?origen=stand`, el link de Instagram con `?origen=ig`.

## Qué se edita y dónde
- `js/config.js`: fixture, horarios de cierre, preguntas y respuestas correctas, puntaje, cantidad de puestos marcados en las tablas.
- `bases.html`: bases y condiciones (texto provisorio).
- `img/`: fotos y logos.

## Próximo paso
Conectar Supabase: se completan `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `js/config.js` y se reemplaza `js/data.js`. El resto de la web no cambia.
