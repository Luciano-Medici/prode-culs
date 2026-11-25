/* =========================================================
   PRODE CULS · configuración
   Todo lo que se cambia sin tocar la lógica está acá:
   fixture, horarios de cierre, preguntas, premios y textos.
   ========================================================= */

window.CONFIG = {
  // Conexión a Supabase. La clave "publishable" es pública: puede ir acá.
  // (Nunca pegar acá la clave "secret" / "service_role".)
  // Si se dejan vacías, la web vuelve al MODO DEMO.
  SUPABASE_URL: "https://wdhtvaybbiawzvpjgbap.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_WEv3LMJcMp6Ejqp3x7i7zw_PxU4FyLg",

  INSTAGRAM: "culshockey",
  WEB: "https://culshockey.com.ar",
  EVENTO: "Pro League",
  SEDE: "Córdoba",
  FECHAS: "08—13.12",

  // Exigir la casilla "Sigo a @culshockey" para poder enviar
  EXIGIR_SEGUIR: true,

  // Cuántos puestos de cada tabla se marcan en la web
  TOP_SORTEO_DIA: 10,        // entran al sorteo del premio del día
  TOP_SPONSOREO: 10,         // compiten por el año de sponsoreo (a definir con CULS)

  // Puntaje
  PUNTOS: { ganador: 1, exacto: 3, cuarto: 1, jornadaPerfecta: 2 },

  EQUIPOS: { ARG: "Argentina", CHN: "China", GBR: "Gran Bretaña", FRA: "Francia" },

  /* FIXTURE DE EJEMPLO: reemplazar por el oficial cuando la FIH lo publique.
     "cierre" es la hora en que se bloquea la jornada (hora argentina, -03:00). */
  JORNADAS: [
    { n: 1, fecha: "Mar 08.12", cierre: "2026-12-08T18:00:00-03:00", img: "j1", color: "verde",
      titulo: ["Quedarte", "quieto no", "es una", "opción."],
      partidos: [
        { id: "1a", cat: "Las Leonas", local: "ARG", visita: "CHN", hora: "19:00" },
        { id: "1b", cat: "Los Leones", local: "ARG", visita: "FRA", hora: "21:30" } ] },
    { n: 2, fecha: "Mié 09.12", cierre: "2026-12-09T18:00:00-03:00", img: "j2", color: "verde",
      titulo: ["El corazón", "también", "juega."],
      partidos: [
        { id: "2a", cat: "Las Leonas", local: "ARG", visita: "GBR", hora: "19:00" },
        { id: "2b", cat: "Los Leones", local: "ARG", visita: "GBR", hora: "21:30" } ] },
    { n: 3, fecha: "Jue 10.12", cierre: "2026-12-10T18:00:00-03:00", img: "j3", color: "rojo",
      titulo: ["El disfrute", "es parte de", "la estrategia/"],
      partidos: [
        { id: "3a", cat: "Femenino", local: "CHN", visita: "GBR", hora: "19:00" },
        { id: "3b", cat: "Masculino", local: "FRA", visita: "GBR", hora: "21:30" } ] },
    { n: 4, fecha: "Vie 11.12", cierre: "2026-12-11T18:00:00-03:00", img: "j4", color: "verde",
      titulo: ["No jugás", "contra otros.", "Jugás con", "otros."],
      partidos: [
        { id: "4a", cat: "Las Leonas", local: "ARG", visita: "CHN", hora: "19:00" },
        { id: "4b", cat: "Los Leones", local: "ARG", visita: "FRA", hora: "21:30" } ] },
    { n: 5, fecha: "Sáb 12.12", cierre: "2026-12-12T18:00:00-03:00", img: "j5", color: "claro",
      titulo: ["Exhalá", "la presión."],
      partidos: [
        { id: "5a", cat: "Las Leonas", local: "ARG", visita: "GBR", hora: "19:00" },
        { id: "5b", cat: "Los Leones", local: "ARG", visita: "GBR", hora: "21:30" } ] },
    { n: 6, fecha: "Dom 13.12", cierre: "2026-12-13T18:00:00-03:00", img: "j6", color: "rojo",
      titulo: ["Ganar el", "partido y ganar", "amigos/"],
      partidos: [
        { id: "6a", cat: "Femenino", local: "CHN", visita: "GBR", hora: "19:00" },
        { id: "6b", cat: "Masculino", local: "FRA", visita: "GBR", hora: "21:30" } ] }
  ],

  /* Historias entre jornadas. La pregunta del final NO suma puntos: desempata.
     "correcta" hay que confirmarla con CULS antes de publicar (null = sin definir). */
  HISTORIAS: [
    { n: 1, img: "h1", cap: "El origen", color: "inv",
      titulo: ["Creímos que", "todo estaba", "inventado."],
      lineas: [["Y aparecieron ellos."], ["Jordan, Aymar, Federer, Woods, Messi, Biles."], ["Irrumpieron en sus deportes", 1], ["y cambiaron el juego.", 1], ["Siempre soñamos con evolucionar el hockey."], ["Con reescribir la forma en que lo vivimos."]],
      bajada: "Así nace CULS, en Córdoba: una marca de hockey hecha por gente que juega, para que el deporte se viva con más libertad.",
      pregunta: "¿En qué año nace CULS?", opciones: ["2023", "2024", "2025", "2026"], correcta: null },
    { n: 2, img: "h2", cap: "La marca", color: "rojo", logo: true,
      titulo: ["Mirá bien", "el logo."],
      bajada: "El logo de CULS es un bloque compacto de letras con bordes redondeados. Si lo mirás de nuevo, la C y la línea de abajo dibujan algo que conocés muy bien.",
      pregunta: "¿Qué se esconde en el logo de CULS?", opciones: ["Una pelota", "Un palo de hockey", "Un arco", "Una cancha"], correcta: "Un palo de hockey" },
    { n: 3, img: "h3", cap: "El producto", color: "verde",
      titulo: ["Lo que no", "se ve, también", "juega."],
      materiales: [["Carbono", "Rigidez y potencia. Golpes más fuertes y precisos."], ["Fibra de vidrio", "Flexibilidad, sensibilidad y durabilidad."], ["Kevlar", "Reduce vibraciones y mejora el control al impactar."]],
      modelos: [["97%", "Adulto"], ["70%", "Adulto"], ["40%", "Niños"]],
      pregunta: "¿Cuánto carbono tiene el palo adulto más potente?", opciones: ["40%", "70%", "97%", "100%"], correcta: "97%" },
    { n: 4, img: "h4", cap: "La comunidad", color: "inv",
      titulo: ["Dentro de", "la cancha 11."],
      lineas: [["Entendimos que jugar no era solo competir,"], ["sino también movernos, relajarnos", 1], ["y disfrutar.", 1], ["Que sumar puntos era tan importante"], ["como sumar amigos."]],
      bajada: "Por eso este prode: para que la Pro League también se juegue afuera de la cancha.",
      pregunta: "Completá: «Dentro de la cancha 11. Afuera…»", opciones: ["los suplentes", "muchos más", "el DT", "nadie"], correcta: "muchos más" },
    { n: 5, img: "h5", cap: "Hecho acá", color: "claro",
      titulo: ["Calidad y", "calidez", "argentina."],
      lineas: [["CULS nace en suelo argentino"], ["y busca transmitir al mundo"], ["la pasión, la unión y la calidez", 1], ["con la que vivimos el hockey,"], ["adentro y afuera de la cancha."]],
      bajada: "Productos hechos en Argentina, para que juegues como un argentino.",
      pregunta: "¿De qué provincia es CULS?", opciones: ["Buenos Aires", "Santa Fe", "Córdoba", "Mendoza"], correcta: "Córdoba" }
  ]
};
