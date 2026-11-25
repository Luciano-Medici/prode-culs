/* =========================================================
   PRODE CULS · capa de datos
   La web solo habla con este objeto `Datos`. Hoy funciona en
   MODO DEMO (todo en el navegador). Cuando se conecte Supabase
   se reemplazan estas funciones y el resto de la web no cambia.
   ========================================================= */

(function () {
  const C = window.CONFIG;
  const PARTIDOS = C.JORNADAS.flatMap(j => j.partidos.map(p => ({ ...p, jornada: j.n })));

  /* ---------- puntaje (la misma regla vivirá en la base de datos) ---------- */
  function puntosPartido(pr, r) {
    if (!pr || pr.l == null || pr.v == null || !r) return { pts: 0, exacto: false, detalle: [] };
    const P = C.PUNTOS, s = Math.sign;
    let pts = 0; const detalle = [];
    if (s(pr.l - pr.v) === s(r.l - r.v)) { pts += P.ganador; detalle.push("ganador"); }
    const exacto = pr.l === r.l && pr.v === r.v;
    if (exacto) { pts += P.exacto; detalle.push("exacto"); }
    if (pr.c && pr.c === r.c) { pts += P.cuarto; detalle.push("cuarto"); }
    return { pts, exacto, detalle };
  }
  function puntosJornada(pronos, resultados, n) {
    const j = C.JORNADAS.find(x => x.n === n);
    if (!j.partidos.every(p => resultados[p.id])) return null; // jornada sin resultados completos
    let total = 0, exactos = 0;
    j.partidos.forEach(p => { const r = puntosPartido(pronos[p.id], resultados[p.id]); total += r.pts; if (r.exacto) exactos++; });
    if (exactos === j.partidos.length) total += C.PUNTOS.jornadaPerfecta;
    return total;
  }
  function aciertosPreguntas(resp) {
    return C.HISTORIAS.filter(h => h.correcta && resp && resp["h" + h.n] === h.correcta).length;
  }
  function nombrePublico(nombre, apellido) {
    const a = (apellido || "").trim();
    return (nombre || "").trim().split(/\s+/)[0] + (a ? " " + a[0].toUpperCase() + "." : "");
  }

  /* ---------- MODO DEMO ---------- */
  const KEY = "prode-culs-demo-cartillas";
  const leer = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const guardar = a => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };

  // generador pseudoaleatorio con semilla, para que los datos de ejemplo sean siempre iguales
  function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  const R = rng(20261208);
  const marcador = () => { const l = Math.floor(R() * 4), v = Math.floor(R() * 3); return { l, v, c: l + v === 0 ? "0" : String(1 + Math.floor(R() * 4)) }; };

  // resultados de ejemplo: jornadas 1 a 3 ya jugadas
  const RESULTADOS_DEMO = {};
  PARTIDOS.filter(p => p.jornada <= 3).forEach(p => { RESULTADOS_DEMO[p.id] = marcador(); });

  const NOMBRES = ["Martina Rossi", "Joaquín Bustos", "Lucía Ferreyra", "Tomás Gaitán", "Camila Díaz", "Valentín Sosa", "Sofía Paredes", "Juan Cruz Molina", "Delfina Ortiz", "Bautista Luna", "Agustina Peralta", "Franco Herrera", "Pilar Aguirre", "Mateo Vega", "Catalina Ríos", "Santino Godoy", "Abril Quiroga", "Lautaro Medina", "Julieta Correa", "Benjamín Castro", "Milagros Arias", "Thiago Romero", "Josefina Cabrera", "Nicolás Funes", "Victoria Ledesma", "Ignacio Pereyra", "Florencia Juárez", "Facundo Ponce", "Rocío Villalba", "Manuel Acosta", "Guadalupe Torres", "Felipe Navarro", "Malena Suárez", "Lorenzo Giménez", "Morena Benítez", "Ramiro Ojeda", "Antonella Vera", "Gonzalo Ibáñez", "Emilia Coria", "Dante Figueroa"];
  const EJEMPLO = NOMBRES.map((n, i) => {
    const [nombre, ...ap] = n.split(" ");
    const pronos = {};
    PARTIDOS.forEach(p => {
      // algunos se sumaron tarde: no tienen las primeras jornadas
      if (i % 7 === 3 && p.jornada === 1) return;
      const r = RESULTADOS_DEMO[p.id];
      pronos[p.id] = r && R() < 0.28 ? { l: r.l, v: r.v, c: R() < 0.5 ? r.c : marcador().c } : marcador();
    });
    const resp = {}; C.HISTORIAS.forEach(h => { resp["h" + h.n] = h.opciones[Math.floor(R() * h.opciones.length)]; });
    return { ejemplo: true, nombre, apellido: ap.join(" "), dni: String(30000000 + i * 137911), enviada: Date.UTC(2026, 11, 7, 12) + i * 3600e3, pronos, resp };
  });

  function todas() { return [...leer(), ...EJEMPLO]; }

  function ranking(lista, resultados, jornada) {
    const filas = lista.map(c => {
      let pts = 0, jugadas = 0;
      const jornadas = jornada ? [jornada] : C.JORNADAS.map(j => j.n);
      jornadas.forEach(n => { const p = puntosJornada(c.pronos, resultados, n); if (p != null) { pts += p; jugadas++; } });
      return { id: c.ejemplo ? null : "demo-" + c.dni, nombre: nombrePublico(c.nombre, c.apellido), dni: c.dni, pts, jugadas, aciertos: aciertosPreguntas(c.resp), enviada: c.enviada, propia: !c.ejemplo };
    });
    // desempate: más puntos, más aciertos en preguntas, cartilla enviada antes
    filas.sort((a, b) => b.pts - a.pts || b.aciertos - a.aciertos || a.enviada - b.enviada);
    filas.forEach((f, i) => { f.pos = i + 1; });
    return filas;
  }

  const demora = (v) => new Promise(r => setTimeout(() => r(v), 250));

  /* ---------- MODO SUPABASE ---------- */
  if (C.SUPABASE_URL) {
    const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
    const cache = {};
    async function rpc(fn, args, cacheSeg) {
      const k = fn + JSON.stringify(args || {});
      if (cacheSeg && cache[k] && Date.now() - cache[k].t < cacheSeg * 1000) return cache[k].v;
      const { data, error } = await sb.rpc(fn, args || {});
      if (error) throw error;
      if (cacheSeg) cache[k] = { t: Date.now(), v: data };
      return data;
    }
    window.Datos = {
      modo: "supabase",
      PARTIDOS, puntosPartido, puntosJornada, nombrePublico,
      async enviarCartilla(c) {
        try { return await rpc("enviar_cartilla", { p: c }); }
        catch (e) { return { ok: false, error: "red" }; }
      },
      resultados: () => rpc("resultados", {}, 30),
      ranking: (jornada) => rpc("ranking", { p_jornada: jornada || null }, 30),
      async buscar(dni, mail) {
        try { return await rpc("buscar_cartilla", { p_dni: dni, p_mail: mail }); }
        catch (e) { return { ok: false, error: "red" }; }
      },
      borrarDemo() {}
    };
    return;
  }

  window.Datos = {
    modo: C.SUPABASE_URL ? "supabase" : "demo",
    PARTIDOS,
    puntosPartido, puntosJornada, nombrePublico,

    async enviarCartilla(c) {
      const lista = leer();
      if (lista.some(x => x.dni === c.dni) || EJEMPLO.some(x => x.dni === c.dni)) return demora({ ok: false, error: "dni" });
      lista.push({ ...c, enviada: Date.now() });
      guardar(lista);
      return demora({ ok: true, id: "demo-" + c.dni });
    },
    async resultados() { return demora({ ...RESULTADOS_DEMO }); },
    async ranking(jornada) { return demora(ranking(todas(), RESULTADOS_DEMO, jornada || null)); },
    async buscar(dni, mail) {
      const c = todas().find(x => x.dni === dni);
      if (!c || (!c.ejemplo && (c.mail || "").toLowerCase() !== (mail || "").toLowerCase())) return demora({ ok: false, error: "no-encontrada" });
      const gen = ranking(todas(), RESULTADOS_DEMO, null);
      return demora({ ok: true, cartilla: c, posicion: gen.find(f => f.dni === dni), total: gen.length });
    },
    borrarDemo() { guardar([]); }
  };
})();
