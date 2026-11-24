/* =========================================================
   PRODE CULS · interfaz
   ========================================================= */
(function () {
  const C = window.CONFIG, D = window.Datos;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad2 = n => String(n).padStart(2, "0");
  const EQ = C.EQUIPOS;
  const qs = new URLSearchParams(location.search);

  /* ---------- reloj: en demo se puede simular el momento con ?ahora=2026-12-10T20:00 ---------- */
  function ahora() {
    if (D.modo === "demo" && qs.get("ahora")) { const t = Date.parse(qs.get("ahora") + (qs.get("ahora").length <= 16 ? ":00-03:00" : "")); if (!isNaN(t)) return t; }
    return Date.now();
  }
  const cerrada = j => ahora() >= Date.parse(j.cierre);
  const horaCierre = j => { const d = new Date(j.cierre); return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Cordoba" }); };

  /* ---------- estado del borrador (queda en el celular hasta enviar) ---------- */
  const KEY = "prode-culs-borrador";
  const st = { i: 0, p: {}, a: {}, f: { nombre: "", apellido: "", dni: "", mail: "", ig: "", sigo: false, acepto: false }, enviada: false, dniEnviado: "", origen: "" };
  try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s) Object.assign(st, s); } catch (e) {}
  if (qs.get("origen")) st.origen = qs.get("origen").slice(0, 30);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };

  /* ---------- pantallas de la cartilla ---------- */
  const S = [{ id: "portada" }, { id: "reglas" }];
  C.JORNADAS.forEach((j, i) => { S.push({ id: "j" + j.n, k: "j", j }); if (C.HISTORIAS[i]) S.push({ id: "h" + C.HISTORIAS[i].n, k: "h", h: C.HISTORIAS[i] }); });
  S.push({ id: "registro" }, { id: "final" });
  const idx = id => S.findIndex(s => s.id === id);

  const tags = a => `<div class="tags"><span class="tag"><b>${a}</b><span>culs →</span></span><span class="tag"><span>prode culs →</span></span></div>`;
  const boxes = (t, c, extra) => `<div class="boxes ${c} ${extra || ""}">${t.map(x => `<span>${x}</span>`).join("")}</div>`;
  const hero = (img, alt, frac) => `<img class="photo" src="img/${img}.jpg" alt="${esc(alt || "")}">`;

  function completo(m) { const p = st.p[m.id]; return p && p.l != null && p.v != null && p.c; }
  function abiertos() { return C.JORNADAS.filter(j => !cerrada(j)).flatMap(j => j.partidos); }
  function faltantes() { const out = []; C.JORNADAS.forEach(j => { if (!cerrada(j) && !j.partidos.every(completo)) out.push(j); }); return out; }

  function predText(m, p) {
    if (!p || p.l == null || p.v == null) return "Cargá el resultado para ver tu pronóstico.";
    const who = p.l > p.v ? `Gana <b>${EQ[m.local]}</b>` : p.l < p.v ? `Gana <b>${EQ[m.visita]}</b>` : "<b>Empate</b>";
    const q = p.c ? (p.c === "0" ? ", sin goles" : `, primer gol en el <b>${p.c}º cuarto</b>`) : ". Falta el cuarto del primer gol";
    return `${who} ${p.l}–${p.v}${q}.`.replace("..", ".");
  }

  /* ----- portada ----- */
  function vPortada() {
    const env = st.enviada;
    return `<div class="cover"><div class="hero" data-trama="0.38">${hero("cover", "Jugadora con palo CULS al hombro")}${tags("00")}
      <div class="titular">
        ${boxes(["Ganá un año", "de sponsoreo/"], "inv")}
        ${boxes(["<s>Cambiá</s> Acertá", "el juego."], "verde", "b2")}
      </div>
      <div class="meta"><div class="marca"><span class="logo" role="img" aria-label="CULS"></span><small>PRODE</small></div><span class="sub">${C.EVENTO}<br>${C.SEDE} ${C.FECHAS}</span></div></div>
      <div class="foot">
        <div class="just">Pronosticá los partidos. Conocé la marca. <span class="hl">Ganá un año de sponsoreo.</span></div>
        ${env ? `<a class="cta" href="#/mi-cartilla">Ver mi cartilla <span>→</span></a>` : `<button class="cta" type="button" data-go="1">${st.i > 1 ? "Seguir mi prode" : "Jugar el prode"} <span>→</span></button>`}
        <div class="alt"><a class="link" href="#/tablas">Ver las tablas</a><a class="link" href="#/mi-cartilla">Ya jugué</a></div>
      </div></div>`;
  }

  /* ----- reglas ----- */
  function vReglas() {
    const P = C.PUNTOS;
    return `<div class="rules"><div class="hero" data-trama="0.33">${hero("rules")}${tags("01")}${boxes(["Cómo se", "juega."], "claro")}</div>
     <div class="pad"><h3 class="sec">Puntos por partido</h3>
     <div class="ptable">
      <div><span>Acertás quién gana o si empatan<small>El resultado de los 60 minutos, sin shoot-out</small></span><strong>${P.ganador}</strong></div>
      <div><span>Resultado exacto<small>Se suma al punto anterior</small></span><strong>+${P.exacto}</strong></div>
      <div><span>Cuarto del primer gol<small>1º, 2º, 3º, 4º o sin goles</small></span><strong>+${P.cuarto}</strong></div>
      <div><span>Jornada perfecta<small>Los dos resultados exactos del día</small></span><strong>+${P.jornadaPerfecta}</strong></div>
     </div>
     <h3 class="sec">Premios</h3>
     <div class="prizes">
      <div class="prize"><span class="n"></span><div><h4>Premio del día</h4><p>Se sortea entre los mejores puntajes de cada jornada.</p></div></div>
      <div class="prize big"><span class="n"></span><div><h4>Un año de sponsoreo CULS</h4><p>Para los primeros puestos de la tabla general.</p></div></div>
     </div>
     <p class="note-s">Cargás toda la cartilla de una vez y la enviás con tus datos. Una vez enviada no se puede cambiar.</p>
     <p class="note-s">Si te sumás con el torneo empezado, las jornadas que ya cerraron quedan bloqueadas y suman 0.</p>
     <p class="note-s">Las preguntas sobre CULS que aparecen entre jornadas no suman puntos: sirven para desempatar.</p>
     </div></div>`;
  }

  /* ----- jornada ----- */
  function vJornada(j) {
    const off = cerrada(j) || st.enviada;
    const ms = j.partidos.map(m => {
      const p = st.p[m.id] || {}; const v = k => p[k] == null ? "–" : p[k];
      const dis = off ? "disabled" : "";
      return `<div class="match ${off ? "locked" : ""}"><div class="top"><span class="cat">${m.cat}</span><span class="time">${m.hora} h</span></div>
       <div class="score">
        <div class="team"><b>${m.local}</b>${EQ[m.local]}</div>
        <div class="step"><button type="button" data-st="${m.id}|l|-1" ${dis} aria-label="Restar gol ${EQ[m.local]}">−</button><output class="${p.l == null ? "empty" : ""}">${v("l")}</output><button type="button" data-st="${m.id}|l|1" ${dis} aria-label="Sumar gol ${EQ[m.local]}">+</button></div>
        <div class="dash">:</div>
        <div class="step"><button type="button" data-st="${m.id}|v|-1" ${dis} aria-label="Restar gol ${EQ[m.visita]}">−</button><output class="${p.v == null ? "empty" : ""}">${v("v")}</output><button type="button" data-st="${m.id}|v|1" ${dis} aria-label="Sumar gol ${EQ[m.visita]}">+</button></div>
        <div class="team r"><b>${m.visita}</b>${EQ[m.visita]}</div>
       </div>
       <div class="q"><div class="lbl"><span>¿En qué cuarto llega el primer gol?</span><span>+${C.PUNTOS.cuarto}</span></div>
        <div class="qchips" role="group" aria-label="Cuarto del primer gol">${["1", "2", "3", "4", "0"].map(q => `<button type="button" data-q="${m.id}|${q}" ${dis} aria-pressed="${p.c === q}">${q === "0" ? "Sin gol" : q + "º"}</button>`).join("")}</div></div>
       <div class="pick">${cerrada(j) ? "Jornada cerrada: este partido ya no se puede pronosticar." : predText(m, p)}</div></div>`;
    }).join("");
    const done = j.partidos.every(completo);
    const foot = cerrada(j) ? '<span class="chip lock">Jornada cerrada</span> Suma 0 puntos para quien se sumó después del cierre.'
      : st.enviada ? '<span class="chip ok">Cartilla enviada</span>'
      : done ? '<span class="chip ok">Jornada cargada</span>' : "Cargá los dos partidos para poder enviar la cartilla.";
    return `<div class="jhero hero" data-trama="0.36">${hero(j.img)}${tags(pad2(j.n) + "/" + pad2(C.JORNADAS.length))}
     <div class="num"><span class="sym"></span><span>Jornada ${pad2(j.n)}</span></div>${boxes(j.titulo, j.color)}</div>
     <div class="jmeta"><span>${j.fecha}</span>${cerrada(j) ? '<span class="close off">Cerrada</span>' : `<span class="close">Cierra ${horaCierre(j)} h</span>`}</div>
     ${ms}<div class="jfoot">${foot}</div>`;
  }

  /* ----- historia ----- */
  function vHistoria(h) {
    const a = st.a["h" + h.n];
    const lines = h.lineas ? `<div class="txt">${h.lineas.map(l => `<div class="just">${l[1] ? `<span class="hl">${l[0]}</span>` : l[0]}</div>`).join("")}</div>` : "";
    const feat = h.logo ? `<div class="feat"><span class="logo" role="img" aria-label="Logo CULS"></span><div class="cap">Bloques con bordes redondeados y contraformas que separan las letras.</div></div>` : "";
    const mats = h.materiales ? `<div class="mats">${h.materiales.map(m => `<div><b>${m[0]}</b><span>${m[1]}</span></div>`).join("")}</div><div class="models">${h.modelos.map(m => `<div><b>${m[0]}</b>${m[1]}</div>`).join("")}</div>` : "";
    return `<div class="story"><div class="shero hero">${hero(h.img)}${tags("H" + h.n)}${boxes(h.titulo, h.color)}</div>
     <div class="chap"><span>Historia ${pad2(h.n)}</span><span>${h.cap}</span></div>
     ${lines}${h.bajada ? `<div class="txt"><p class="lead">${h.bajada}</p></div>` : ""}${feat}${mats}
     <div class="quiz"><div class="h"><span class="sym"></span>Pregunta de desempate</div><p class="qq">${h.pregunta}</p>
      <div class="opts" role="group" aria-label="${esc(h.pregunta)}">${h.opciones.map((o, k) => `<button type="button" data-a="h${h.n}|${k}" ${st.enviada ? "disabled" : ""} aria-pressed="${a === o}">${o}</button>`).join("")}</div>
      <div class="saved">${a ? "Respuesta guardada. Se usa si hay empate en puntos." : "Elegí una opción."}</div></div></div>`;
  }

  /* ----- registro ----- */
  function vRegistro() {
    const f = st.f, ab = abiertos(), cargados = ab.filter(completo).length, pq = C.HISTORIAS.filter(h => st.a["h" + h.n]).length;
    const falt = faltantes(); const sinResp = C.HISTORIAS.filter(h => !st.a["h" + h.n]);
    const miss = falt.length ? `<div class="missing"><b>Te faltan partidos por cargar.</b> Completalos para poder enviar:<ul>${falt.map(j => `<li><button type="button" data-go="${idx("j" + j.n)}">Jornada ${j.n}</button></li>`).join("")}</ul></div>`
      : sinResp.length ? `<div class="missing">Te quedan preguntas de desempate sin responder. Podés enviar igual, pero sirven si empatás en puntos.<ul>${sinResp.map(h => `<li><button type="button" data-go="${idx("h" + h.n)}">Historia ${h.n}</button></li>`).join("")}</ul></div>` : "";
    return `<div class="hero" style="height:150px;background:var(--gris)">${tags("✓")}<div class="boxes claro" style="position:absolute;left:14px;bottom:14px;z-index:3"><span style="font-size:36px">Último</span><span style="font-size:36px">paso/</span></div></div>
     <form class="form" id="frm" novalidate>
      <div class="summary"><div><b>${cargados}/${ab.length}</b>Partidos</div><div><b>${pq}/${C.HISTORIAS.length}</b>Preguntas</div><div><b>${C.JORNADAS.filter(j => !cerrada(j)).length}</b>Jornadas</div></div>
      ${miss}
      <div class="row2">
       <div class="field"><label for="f-nombre">Nombre</label><input id="f-nombre" autocomplete="given-name" value="${esc(f.nombre)}"></div>
       <div class="field"><label for="f-apellido">Apellido</label><input id="f-apellido" autocomplete="family-name" value="${esc(f.apellido)}"></div>
      </div>
      <div class="field"><label for="f-dni">DNI</label><input id="f-dni" inputmode="numeric" autocomplete="off" value="${esc(f.dni)}" placeholder="Sin puntos"></div>
      <div class="field"><label for="f-mail">Mail</label><input id="f-mail" type="email" inputmode="email" autocomplete="email" value="${esc(f.mail)}" placeholder="Para avisarte si ganás"></div>
      <div class="field"><label for="f-ig">Instagram</label><input id="f-ig" autocomplete="off" autocapitalize="off" value="${esc(f.ig)}" placeholder="@usuario"></div>
      <label class="check"><input id="f-sigo" type="checkbox" ${f.sigo ? "checked" : ""}><span>Sigo a <a href="https://instagram.com/${C.INSTAGRAM}" target="_blank" rel="noopener"><b>@${C.INSTAGRAM}</b></a> en Instagram.</span></label>
      <label class="check"><input id="f-acepto" type="checkbox" ${f.acepto ? "checked" : ""}><span>Acepto las <a href="bases.html" target="_blank" rel="noopener">bases y condiciones</a>. Participación gratuita, sin obligación de compra.</span></label>
      <div class="err" id="err" role="alert"></div>
      <button class="cta" type="submit" id="send">Enviar mi cartilla <span>→</span></button>
     </form>`;
  }

  /* ----- final ----- */
  function vFinal() {
    return `<div class="fin"><div class="hero" data-trama="0.4">${hero("fin")}${tags("FIN")}${boxes(["Ya estás", "jugando/"], "verde")}</div>
     <div class="pad">
      <div class="eyebrow">Cartilla enviada</div>
      <div class="notice">Tu prode quedó guardado con el DNI ${esc(st.dniEnviado)}. Ya no se puede modificar.<br><br>Después de cada jornada se actualizan las tablas. El premio del día se sortea entre los mejores puntajes de la jornada, y los primeros de la tabla general compiten por un año de sponsoreo CULS.</div>
      <div class="btns">
       <a class="cta" href="#/tablas">Ver las tablas <span>→</span></a>
       <a class="cta dark" href="#/mi-cartilla">Ver mi cartilla <span>→</span></a>
       <a class="link" href="https://instagram.com/${C.INSTAGRAM}" target="_blank" rel="noopener">Seguí los resultados en @${C.INSTAGRAM}</a>
      </div>
     </div></div>`;
  }

  /* ---------- vistas fuera de la cartilla ---------- */
  const T = { tab: "dia", jornada: null, data: null, res: null };

  async function vTablas() {
    const res = await D.resultados();
    const jugadas = C.JORNADAS.filter(j => j.partidos.every(p => res[p.id])).map(j => j.n);
    if (T.jornada == null || !jugadas.includes(T.jornada)) T.jornada = jugadas[jugadas.length - 1] || null;
    const rk = T.tab === "general" ? await D.ranking(null) : (T.jornada ? await D.ranking(T.jornada) : []);
    const TOP = T.tab === "general" ? C.TOP_SPONSOREO : C.TOP_SORTEO_DIA;
    const visibles = rk.slice(0, 30); const yo = rk.find(r => r.propia);
    const fila = r => `<div class="r ${r.pos <= TOP ? "top" : ""} ${r.propia ? "me" : ""}"><span class="pos">${r.pos}</span><span class="nm">${esc(r.nombre)}${r.propia ? " (vos)" : ""}</span><span class="pt">${r.pts}</span></div>`;
    let body;
    if (!jugadas.length) body = `<div class="empty-s">Todavía no se jugó ninguna jornada.<br>La tabla se actualiza después de cada partido.</div>`;
    else {
      body = `<div class="rank">${visibles.map((r, i) => (i === TOP ? `<div class="cut">Hasta acá: ${T.tab === "general" ? "compiten por el sponsoreo" : "entran al sorteo del día"}</div>` : "") + fila(r)).join("")}
        ${yo && yo.pos > 30 ? `<div class="cut">Tu puesto</div>${fila(yo)}` : ""}</div>`;
    }
    const info = T.tab === "general"
      ? `Suma de todas las jornadas jugadas. Los primeros ${C.TOP_SPONSOREO} compiten por un año de sponsoreo CULS. Desempatan las preguntas sobre CULS y, después, quién envió la cartilla antes.`
      : `Puntos de la jornada ${T.jornada || ""}. Los primeros ${C.TOP_SORTEO_DIA} entran al sorteo del premio del día.`;
    return `<div class="thead">${boxes(["Las", "tablas/"], "inv")}
      <div class="tabs" role="group" aria-label="Tabla"><button type="button" data-tab="dia" aria-pressed="${T.tab === "dia"}">Del día</button><button type="button" data-tab="general" aria-pressed="${T.tab === "general"}">General</button></div></div>
      ${T.tab === "dia" ? `<div class="days" role="group" aria-label="Jornada">${C.JORNADAS.map(j => `<button type="button" data-day="${j.n}" ${jugadas.includes(j.n) ? "" : "disabled"} aria-pressed="${T.jornada === j.n}">J${j.n} ${j.fecha.split(" ")[1]}</button>`).join("")}</div>` : ""}
      ${jugadas.length ? `<div class="tinfo">${info}</div>` : ""}${body}`;
  }

  const M = { dni: "", mail: "", out: null, err: "" };
  function vMi() {
    const r = M.out;
    let res = "";
    if (r) {
      const c = r.cartilla, R = r.res;
      const jor = C.JORNADAS.map(j => {
        const pj = D.puntosJornada(c.pronos, R, j.n);
        const participa = j.partidos.some(p => c.pronos[p.id]);
        const est = !participa ? "No participó" : pj == null ? "Por jugar" : pj + " pts";
        const filas = j.partidos.map(m => {
          const pr = c.pronos[m.id], rr = R[m.id], s = D.puntosPartido(pr, rr);
          const cuarto = x => x === "0" ? "sin gol" : x + "º cuarto";
          return `<div class="mp"><span>${m.local} ${pr ? pr.l + "–" + pr.v : "sin pronóstico"} ${m.visita}${pr ? `<small>Primer gol: ${cuarto(pr.c)}</small>` : ""}${rr ? `<small>Resultado: ${rr.l}–${rr.v}, primer gol ${cuarto(rr.c)}</small>` : ""}</span><span class="p">${rr ? s.pts : ""}</span></div>`;
        }).join("");
        return `<div class="mj"><h4>Jornada ${j.n} <span>${est}</span></h4>${filas}</div>`;
      }).join("");
      res = `<div class="me-head"><div><b>${r.posicion.pts}</b>Puntos</div><div><b>${r.posicion.pos}º</b>de ${r.total}</div><div><b>${r.posicion.jugadas}</b>Jornadas</div></div>
        <p class="note-s">${esc(c.nombre)} ${esc(c.apellido)}</p>${jor}`;
    }
    return `<div class="thead">${boxes(["Mi", "cartilla/"], "inv")}</div>
     <div class="pad">
      <form class="form" id="frmMi" novalidate style="padding:0">
       <div class="field"><label for="m-dni">DNI</label><input id="m-dni" inputmode="numeric" value="${esc(M.dni || st.dniEnviado)}" placeholder="Sin puntos"></div>
       <div class="field"><label for="m-mail">Mail con el que te anotaste</label><input id="m-mail" type="email" inputmode="email" value="${esc(M.mail || (st.enviada ? st.f.mail : ""))}"></div>
       <div class="err" role="alert">${esc(M.err)}</div>
       <button class="cta dark" type="submit">Consultar <span>→</span></button>
       ${D.modo === "demo" ? `<p class="note-s">Versión de muestra: probá con el DNI 30000000 para ver una cartilla de ejemplo.</p>` : ""}
      </form>
      ${res}
     </div>`;
  }

  /* ---------- efecto trama del manual sobre las fotos ---------- */
  function trama(h) {
    const frac = parseFloat(h.dataset.trama); const img = h.querySelector("img.photo"); if (!img) return;
    const draw = () => {
      const W = h.clientWidth, H = h.clientHeight; if (!W || !H || !img.naturalWidth) return; const w = Math.round(W * frac);
      let c = h.querySelector("canvas"); if (!c) { c = document.createElement("canvas"); img.after(c); }
      const dpr = Math.min(2, window.devicePixelRatio || 1); c.width = w * dpr; c.height = H * dpr; c.style.width = w + "px";
      const x = c.getContext("2d"); x.scale(dpr, dpr);
      const o = document.createElement("canvas"); o.width = W; o.height = H; const ox = o.getContext("2d");
      const r = Math.max(W / img.naturalWidth, H / img.naturalHeight), iw = img.naturalWidth * r, ih = img.naturalHeight * r;
      ox.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih); let data; try { data = ox.getImageData(0, 0, w, H).data; } catch (e) { return; }
      x.fillStyle = "#2A2B28"; x.fillRect(0, 0, w, H);
      const step = 8;
      for (let yy = step / 2; yy < H; yy += step) for (let xx = step / 2; xx < w; xx += step) {
        const i = (Math.floor(yy) * w + Math.floor(xx)) * 4; const L = (data[i] * .3 + data[i + 1] * .59 + data[i + 2] * .11) / 255;
        if (L < .18) continue; const k = Math.min(1, (L - .18) / .6);
        x.fillStyle = `rgba(223,224,222,${.25 + .65 * k})`; x.beginPath(); x.arc(xx, yy, .7 + 1.6 * k, 0, 7); x.fill();
        if (k > .55) { x.strokeStyle = `rgba(223,224,222,${.5 * k})`; x.lineWidth = .6; x.beginPath(); x.arc(xx, yy, 3.4, 0, 7); x.stroke(); }
      }
    };
    if (img.complete) draw(); else img.addEventListener("load", draw, { once: true });
  }

  /* ---------- render ---------- */
  function ruta() { const h = location.hash.replace(/^#\/?/, ""); return h === "tablas" ? "tablas" : h === "mi-cartilla" ? "mi" : "cartilla"; }

  async function render(keep) {
    const r = ruta(); const v = $("#view"); const y = window.scrollY;
    let html = "";
    if (r === "cartilla") {
      if (st.enviada && S[st.i].id === "registro") st.i = idx("final");
      const s = S[st.i];
      html = s.id === "portada" ? vPortada() : s.id === "reglas" ? vReglas() : s.k === "j" ? vJornada(s.j) : s.k === "h" ? vHistoria(s.h) : s.id === "registro" ? vRegistro() : vFinal();
    } else if (r === "tablas") html = await vTablas();
    else html = vMi();
    v.innerHTML = html;
    v.querySelectorAll("[data-trama]").forEach(trama);
    window.scrollTo(0, keep ? y : 0);
    nav(r); save();
  }

  function nav(r) {
    const nb = $("#navbar");
    if (r !== "cartilla") {
      nb.hidden = false;
      nb.innerHTML = `<button type="button" data-home>← Prode</button><div class="prog"></div><button type="button" class="next" data-route="${r === "tablas" ? "mi-cartilla" : "tablas"}">${r === "tablas" ? "Mi cartilla" : "Tablas"} →</button>`;
      return;
    }
    const s = S[st.i];
    nb.hidden = s.id === "portada" || s.id === "final";
    nb.innerHTML = `<button id="prev" type="button" aria-label="Pantalla anterior">← Atrás</button>
      <div class="prog" aria-hidden="true">${S.slice(1, -1).map((x, i) => `<i class="${i + 1 <= st.i ? "on" : ""} ${x.k === "j" ? "j" : ""}"></i>`).join("")}</div>
      ${s.id === "registro" ? "" : `<button id="next" class="next" type="button">Siguiente →</button>`}`;
    if (st.enviada && S[st.i + 1] && S[st.i + 1].id === "registro") { const n = $("#next"); if (n) n.textContent = "Listo →"; }
  }

  function go(i) {
    st.i = Math.max(0, Math.min(S.length - 1, i));
    if (st.enviada && S[st.i].id === "registro") st.i = idx("final");
    if (ruta() !== "cartilla") { location.hash = "#/"; return; }
    render();
  }

  /* ---------- eventos ---------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.hasAttribute("data-home")) { st.i = 0; location.hash = "#/"; return; }
    if (t.dataset.route) { location.hash = "#/" + t.dataset.route; return; }
    if (t.dataset.go != null) { go(+t.dataset.go); return; }
    if (t.id === "prev") { go(st.i - 1); return; }
    if (t.id === "next") { go(st.i + 1); return; }
    if (t.dataset.tab) { T.tab = t.dataset.tab; render(true); return; }
    if (t.dataset.day) { T.jornada = +t.dataset.day; render(true); return; }
    if (st.enviada) return;
    if (t.dataset.st) {
      const [id, k, d] = t.dataset.st.split("|"); const p = st.p[id] || (st.p[id] = {});
      let v = p[k] == null ? (+d > 0 ? 1 : 0) : p[k] + (+d); p[k] = Math.max(0, Math.min(15, v));
      const o = k === "l" ? "v" : "l"; if (p[o] == null) p[o] = 0;
      if (p.l + p.v === 0 && !p.c) p.c = "0"; if (p.l + p.v > 0 && p.c === "0") p.c = null;
      render(true); return;
    }
    if (t.dataset.q) { const [id, q] = t.dataset.q.split("|"); const p = st.p[id] || (st.p[id] = {}); p.c = q; if (q === "0") { p.l = 0; p.v = 0; } else if (p.l == null) { p.l = p.l ?? 0; p.v = p.v ?? 0; } render(true); return; }
    if (t.dataset.a) { const [id, k] = t.dataset.a.split("|"); const h = C.HISTORIAS.find(x => "h" + x.n === id); st.a[id] = h.opciones[+k]; render(true); return; }
  });

  const MAP = { "f-nombre": "nombre", "f-apellido": "apellido", "f-dni": "dni", "f-mail": "mail", "f-ig": "ig" };
  document.addEventListener("input", e => { const k = MAP[e.target.id]; if (k) { st.f[k] = e.target.value; e.target.removeAttribute("aria-invalid"); save(); } });
  document.addEventListener("change", e => { if (e.target.id === "f-sigo") st.f.sigo = e.target.checked; if (e.target.id === "f-acepto") st.f.acepto = e.target.checked; save(); });

  const limpiarDni = s => String(s || "").replace(/[.\s-]/g, "");
  const limpiarIg = s => String(s || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "");

  document.addEventListener("submit", async e => {
    e.preventDefault();
    if (e.target.id === "frmMi") {
      M.dni = limpiarDni($("#m-dni").value); M.mail = $("#m-mail").value.trim(); M.err = ""; M.out = null;
      if (!/^\d{7,8}$/.test(M.dni)) { M.err = "Revisá el DNI: son 7 u 8 números, sin puntos."; render(true); return; }
      const r = await D.buscar(M.dni, M.mail);
      if (!r.ok) M.err = r.error === "mail" ? "El mail no coincide con el de esa cartilla." : "No encontramos una cartilla con ese DNI.";
      else M.out = { ...r, res: await D.resultados() };
      render(true); return;
    }
    if (e.target.id !== "frm") return;
    const f = st.f, err = $("#err");
    const marcar = (id, msg) => { const el = $("#" + id); if (el) { el.setAttribute("aria-invalid", "true"); el.focus(); } err.textContent = msg; };
    if (faltantes().length) { err.textContent = "Completá todos los partidos de las jornadas abiertas antes de enviar."; return; }
    if (!f.nombre.trim()) return marcar("f-nombre", "Falta tu nombre.");
    if (!f.apellido.trim()) return marcar("f-apellido", "Falta tu apellido.");
    const dni = limpiarDni(f.dni); if (!/^\d{7,8}$/.test(dni)) return marcar("f-dni", "Revisá el DNI: son 7 u 8 números, sin puntos.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.mail.trim())) return marcar("f-mail", "Revisá el mail: tiene que tener formato nombre@dominio.com.");
    const ig = limpiarIg(f.ig); if (!/^[A-Za-z0-9._]{1,30}$/.test(ig)) return marcar("f-ig", "Revisá tu usuario de Instagram.");
    if (C.EXIGIR_SEGUIR && !f.sigo) { err.textContent = `Para participar tenés que seguir a @${C.INSTAGRAM}.`; return; }
    if (!f.acepto) { err.textContent = "Para participar tenés que aceptar las bases y condiciones."; return; }

    const pronos = {}; abiertos().forEach(m => { const p = st.p[m.id]; pronos[m.id] = { l: p.l, v: p.v, c: p.c }; });
    const btn = $("#send"); btn.disabled = true; btn.firstChild.textContent = "Enviando… ";
    const r = await D.enviarCartilla({ nombre: f.nombre.trim(), apellido: f.apellido.trim(), dni, mail: f.mail.trim().toLowerCase(), ig, sigo: f.sigo, acepto: f.acepto, origen: st.origen || "directo", pronos, resp: { ...st.a } });
    if (!r.ok) {
      btn.disabled = false; btn.firstChild.textContent = "Enviar mi cartilla ";
      err.innerHTML = r.error === "dni" ? `Ya hay una cartilla enviada con ese DNI. Si es la tuya, consultala en <a href="#/mi-cartilla">Mi cartilla</a>.` : "No se pudo enviar. Revisá tu conexión y probá de nuevo.";
      return;
    }
    st.enviada = true; st.dniEnviado = dni; go(idx("final"));
  });

  document.addEventListener("keydown", e => { if (ruta() !== "cartilla" || e.target.matches("input")) return; if (e.key === "ArrowRight" && S[st.i].id !== "registro" && st.i < S.length - 1) go(st.i + 1); if (e.key === "ArrowLeft") go(st.i - 1); });
  let rt; window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => document.querySelectorAll("[data-trama]").forEach(trama), 150); });
  window.addEventListener("hashchange", () => render());

  /* banner del modo demo */
  if (D.modo === "demo") {
    const b = $("#demo"); b.hidden = false;
    b.innerHTML = `Versión de muestra: los datos quedan solo en este celular. <a href="#" id="reset">Empezar de nuevo</a>`;
    b.addEventListener("click", ev => { if (ev.target.id !== "reset") return; ev.preventDefault(); try { localStorage.removeItem(KEY); } catch (e) {} D.borrarDemo(); location.hash = "#/"; location.reload(); });
  }
  render();
})();
