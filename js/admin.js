/* =========================================================
   PRODE CULS · panel de administración
   ========================================================= */
(function () {
  const C = window.CONFIG;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const EQ = C.EQUIPOS;
  const root = $("#adm");

  if (!C.SUPABASE_URL) { root.innerHTML = `<div class="alert">Falta configurar Supabase en js/config.js.</div>`; return; }
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  const S = { email: "", tab: "resultados", res: null, modo: "dia", jornada: null, rows: null, sorteo: null, msg: {}, draft: {} };

  async function rpc(fn, args) { const { data, error } = await sb.rpc(fn, args || {}); if (error) throw error; return data; }
  const errTxt = e => (e && (e.message || e.error_description)) || "Error inesperado";
  const cuartoTxt = c => c === "0" ? "sin gol" : c ? c + "º" : "";
  const fecha = iso => new Date(iso).toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

  /* ---------- acceso ---------- */
  function vLogin(msg) {
    root.innerHTML = `<form class="login" id="login">
      <span class="logo" role="img" aria-label="CULS" style="width:120px;color:var(--negro)"></span>
      <h2 class="h" style="margin:4px 0 6px">Panel del prode</h2>
      <div class="field"><label for="l-mail">Mail</label><input id="l-mail" type="email" autocomplete="username" required></div>
      <div class="field"><label for="l-pass">Contraseña</label><input id="l-pass" type="password" autocomplete="current-password" required></div>
      <button class="cta dark" type="submit">Entrar <span>→</span></button>
      <div class="msg e" id="l-msg">${esc(msg || "")}</div></form>`;
  }

  async function arrancar() {
    const { data } = await sb.auth.getSession();
    if (!data.session) return vLogin();
    S.email = data.session.user.email;
    let ok = false; try { ok = await rpc("es_admin"); } catch (e) {}
    if (!ok) { await sb.auth.signOut(); return vLogin(`${S.email} no está habilitado como administrador.`); }
    await cargar(); render();
  }

  async function cargar() { S.res = await rpc("admin_resumen"); }

  /* ---------- pantallas ---------- */
  function shell(body) {
    const tabs = [["resultados", "Resultados"], ["tablas", "Tablas y sorteo"], ["preguntas", "Preguntas"], ["datos", "Participantes"]];
    return `<div class="top"><div class="t"><span class="logo" role="img" aria-label="CULS"></span>Panel del prode</div>
      <div class="who"><span>${esc(S.email)}</span><button class="btn ghost" type="button" data-salir>Salir</button></div></div>
      <div class="atabs" role="group">${tabs.map(([k, n]) => `<button type="button" data-tab="${k}" aria-pressed="${S.tab === k}">${n}</button>`).join("")}</div>${body}`;
  }

  function vResultados() {
    const byId = Object.fromEntries(S.res.partidos.map(p => [p.id, p]));
    const faltan = C.JORNADAS.flatMap(j => j.partidos).filter(p => !byId[p.id]);
    const aviso = faltan.length ? `<div class="alert">El fixture de la web no coincide con el de la base (faltan: ${faltan.map(p => p.id).join(", ")}). Volvé a correr el archivo SQL actualizado.</div>` : "";
    return `${aviso}<p class="muted">Cargá el resultado de cada partido a los 60 minutos (sin shoot-out) y el cuarto del primer gol. Las tablas de una jornada se calculan cuando están cargados sus dos partidos.</p>` +
      C.JORNADAS.map(j => {
        const cerr = Date.now() >= Date.parse(j.cierre);
        return `<div class="card"><div class="jh"><b>Jornada ${j.n} <span class="muted">${j.fecha}</span></b><span class="st ${cerr ? "ok" : "pend"}">${cerr ? "Cerrada" : "Abierta, cierra " + fecha(j.cierre)}</span></div>` +
          j.partidos.map(m => {
            const p0 = byId[m.id] || {}; const has = p0.l != null; const ms = S.msg[m.id];
            const p = (ms && ms.e && S.draft[m.id]) || p0;
            return `<div class="pr" data-id="${m.id}">
              <div class="eq">${m.cat} <small>${m.hora} h</small></div>
              <div class="gl"><span>${m.local}</span><input type="number" min="0" max="30" inputmode="numeric" data-f="l" value="${p.l != null ? p.l : ""}" aria-label="Goles ${EQ[m.local]}"><span>–</span><input type="number" min="0" max="30" inputmode="numeric" data-f="v" value="${p.v != null ? p.v : ""}" aria-label="Goles ${EQ[m.visita]}"><span>${m.visita}</span></div>
              <select data-f="c" aria-label="Cuarto del primer gol"><option value="">Primer gol</option>${["1", "2", "3", "4", "0"].map(c => `<option value="${c}" ${p.c === c ? "selected" : ""}>${c === "0" ? "Sin gol" : c + "º cuarto"}</option>`).join("")}</select>
              <button class="btn v" type="button" data-guardar="${m.id}">Guardar</button>
              <button class="btn ghost" type="button" data-borrar="${m.id}" ${has ? "" : "disabled"}>Borrar</button>
              <div class="msg ${ms && ms.e ? "e" : ""}" style="grid-column:1/-1">${ms ? esc(ms.t) : has ? `<span class="st ok">Cargado: ${p0.l}–${p0.v}, primer gol ${cuartoTxt(p0.c)}</span>` : `<span class="st pend">Sin resultado</span>`}</div>
            </div>`;
          }).join("") + `</div>`;
      }).join("");
  }

  function jornadasCompletas() {
    const byId = Object.fromEntries(S.res.partidos.map(p => [p.id, p]));
    return C.JORNADAS.filter(j => j.partidos.every(m => byId[m.id] && byId[m.id].l != null)).map(j => j.n);
  }

  function vTablas() {
    const comp = jornadasCompletas();
    if (S.jornada == null) S.jornada = comp[comp.length - 1] || 1;
    const TOP = S.modo === "dia" ? C.TOP_SORTEO_DIA : C.TOP_SPONSOREO;
    const rows = S.rows || [];
    const corte = rows.length >= TOP ? rows[TOP - 1].pts : null;
    const tabla = rows.length ? `<div class="scroll"><table><thead><tr><th>#</th><th>Nombre</th><th>DNI</th><th>Mail</th><th>Instagram</th><th>Pts</th><th>Desempate</th><th>Origen</th><th>Enviada</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr class="${i < TOP ? "tt" : ""} ${i === TOP - 1 ? "cut" : ""}"><td>${r.pos}</td><td>${esc(r.nombre)} ${esc(r.apellido)}</td><td>${esc(r.dni)}</td><td>${esc(r.mail)}</td><td>@${esc(r.ig)}</td><td class="n">${r.pts}</td><td>${r.aciertos}</td><td>${esc(r.origen || "")}</td><td>${fecha(r.creado_en)}</td></tr>`).join("")}
      </tbody></table></div>` : `<p class="muted">Todavía no hay participantes en esta tabla.</p>`;
    const incompleta = S.modo === "dia" && !comp.includes(S.jornada);
    const w = S.sorteo;
    return `<div class="bar">
        <button class="btn ${S.modo === "dia" ? "" : "ghost"}" type="button" data-modo="dia">Del día</button>
        <button class="btn ${S.modo === "general" ? "" : "ghost"}" type="button" data-modo="general">General</button>
        ${S.modo === "dia" ? `<select id="selJ" aria-label="Jornada">${C.JORNADAS.map(j => `<option value="${j.n}" ${S.jornada === j.n ? "selected" : ""}>Jornada ${j.n} (${j.fecha})</option>`).join("")}</select>` : ""}
        <button class="btn ghost" type="button" data-csv-tabla>Descargar CSV</button>
      </div>
      ${incompleta ? `<div class="alert">Esta jornada todavía no tiene cargados todos sus resultados: los puntos aparecen en 0.</div>` : ""}
      <p class="muted">${S.modo === "dia" ? `Los primeros ${TOP} entran al sorteo del premio del día. Si hay empate en el puesto ${TOP}, entran todos los empatados.` : `Los primeros ${TOP} compiten por el año de sponsoreo.`} Desempate: preguntas acertadas y después quién envió antes.</p>
      ${S.modo === "dia" && rows.length && !incompleta ? `<div class="bar"><button class="btn v" type="button" data-sortear>Sortear premio de la jornada ${S.jornada}</button>${corte != null ? `<span class="muted">Participan quienes tienen ${corte} puntos o más.</span>` : ""}</div>` : ""}
      ${w ? `<div class="winner"><span class="st">Ganador del sorteo, jornada ${w.jornada}</span><b>${esc(w.r.nombre)} ${esc(w.r.apellido)}</b>DNI ${esc(w.r.dni)}, ${esc(w.r.mail)}, @${esc(w.r.ig)}<br><span class="muted" style="color:var(--negro)">Sorteado entre ${w.n} participantes el ${fecha(w.t)}. Sacale captura a esta pantalla como registro.</span></div>` : ""}
      ${tabla}`;
  }

  function vPreguntas() {
    return `<p class="muted">La respuesta correcta de cada pregunta define el desempate. Si la cambiás, las tablas se recalculan solas.</p>` +
      C.HISTORIAS.map(h => {
        const cur = S.res.preguntas[h.n]; const ms = S.msg["q" + h.n];
        return `<div class="card"><div class="jh"><b>${esc(h.pregunta)}</b><span class="st ${cur ? "ok" : "pend"}">${cur ? "Definida" : "Sin definir"}</span></div>
          <div class="bar"><select data-q="${h.n}"><option value="">Sin definir</option>${h.opciones.map(o => `<option ${cur === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>
          <button class="btn v" type="button" data-guardarq="${h.n}">Guardar</button><span class="msg ${ms && ms.e ? "e" : ""}">${ms ? esc(ms.t) : ""}</span></div></div>`;
      }).join("");
  }

  function vDatos() {
    const r = S.res;
    const kp = (n, t) => `<div><b>${n}</b>${t}</div>`;
    return `<div class="kpis">${kp(r.participantes, "Participantes")}${Object.entries(r.por_origen).map(([o, n]) => kp(n, "Origen: " + esc(o))).join("")}</div>
      <h2 class="h">Por día de envío</h2><div class="kpis">${Object.entries(r.por_dia).map(([d, n]) => kp(n, d)).join("") || `<p class="muted">Sin datos.</p>`}</div>
      <h2 class="h">Exportar</h2>
      <p class="muted">Una fila por participante con sus datos, puntos, cada pronóstico y cada respuesta. Se abre en Excel o Google Sheets. Conviene bajarlo todas las noches como copia de seguridad.</p>
      <div class="bar"><button class="btn" type="button" data-exportar>Descargar todo (CSV)</button></div>
      <h2 class="h">Borrar datos de prueba</h2>
      <p class="muted">Borra todas las cartillas y todos los resultados cargados. Usalo solo antes de lanzar, después de las pruebas. No se puede deshacer.</p>
      <div class="bar"><input class="inp" id="confBorrar" placeholder="Escribí BORRAR" autocomplete="off"><button class="btn r" type="button" data-borrartodo>Borrar todo</button><span class="msg" id="bMsg"></span></div>`;
  }

  async function render() {
    let body = "";
    if (S.tab === "resultados") body = vResultados();
    else if (S.tab === "tablas") { if (!S.rows) await cargarTabla(); body = vTablas(); }
    else if (S.tab === "preguntas") body = vPreguntas();
    else body = vDatos();
    root.innerHTML = shell(body);
  }

  async function cargarTabla() {
    if (S.modo === "dia" && S.jornada == null) { const c = jornadasCompletas(); S.jornada = c[c.length - 1] || 1; }
    S.rows = await rpc("admin_ranking", { p_jornada: S.modo === "dia" ? S.jornada : null });
  }

  /* ---------- CSV ---------- */
  function csv(nombre, filas) {
    const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const txt = "﻿" + filas.map(f => f.map(q).join(";")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
    a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  }
  const hoy = () => new Date().toISOString().slice(0, 10);

  /* ---------- eventos ---------- */
  document.addEventListener("submit", async e => {
    if (e.target.id !== "login") return; e.preventDefault();
    const m = $("#l-msg"); m.textContent = "Entrando…";
    const { error } = await sb.auth.signInWithPassword({ email: $("#l-mail").value.trim(), password: $("#l-pass").value });
    if (error) { m.textContent = "Mail o contraseña incorrectos."; return; }
    arrancar();
  });

  document.addEventListener("change", async e => {
    if (e.target.id === "selJ") { S.jornada = +e.target.value; S.sorteo = null; S.rows = null; await render(); }
  });

  document.addEventListener("click", async e => {
    const t = e.target.closest("button"); if (!t) return;
    try {
      if (t.hasAttribute("data-salir")) { await sb.auth.signOut(); vLogin(); return; }
      if (t.dataset.tab) { S.tab = t.dataset.tab; S.msg = {}; if (t.dataset.tab === "tablas") S.rows = null; await cargar(); await render(); return; }
      if (t.dataset.modo) { S.modo = t.dataset.modo; S.rows = null; S.sorteo = null; await render(); return; }

      if (t.dataset.guardar || t.dataset.borrar) {
        const id = t.dataset.guardar || t.dataset.borrar; const row = t.closest(".pr");
        let args = { p_id: id, p_l: null, p_v: null, p_c: null };
        if (t.dataset.guardar) {
          const l = row.querySelector('[data-f="l"]').value, v = row.querySelector('[data-f="v"]').value, c = row.querySelector('[data-f="c"]').value;
          if (l === "" || v === "" || !c) { S.msg[id] = { e: 1, t: "Completá los goles de los dos equipos y el cuarto del primer gol." }; await render(); return; }
          args = { p_id: id, p_l: +l, p_v: +v, p_c: c }; S.draft[id] = { l: +l, v: +v, c };
        } else if (!confirm("¿Borrar el resultado de este partido?")) return;
        t.disabled = true;
        await rpc("admin_resultado", args);
        S.msg[id] = { t: t.dataset.guardar ? `Guardado: ${args.p_l}–${args.p_v}, primer gol ${cuartoTxt(args.p_c)}. Las tablas ya se actualizaron.` : "Resultado borrado." };
        await cargar(); await render(); return;
      }

      if (t.dataset.guardarq) {
        const n = +t.dataset.guardarq; const val = root.querySelector(`[data-q="${n}"]`).value;
        await rpc("admin_correcta", { p_n: n, p_correcta: val || null });
        S.msg["q" + n] = { t: "Guardado." }; await cargar(); await render(); return;
      }

      if (t.hasAttribute("data-sortear")) {
        const TOP = C.TOP_SORTEO_DIA; const rows = S.rows || [];
        const corte = rows.length >= TOP ? rows[TOP - 1].pts : 0;
        const cand = rows.filter(r => r.pts > 0 && r.pts >= corte);
        if (!cand.length) { alert("No hay participantes con puntos en esta jornada."); return; }
        if (S.sorteo && !confirm("Ya hiciste un sorteo para esta tabla. ¿Sortear de nuevo?")) return;
        const rnd = new Uint32Array(1); crypto.getRandomValues(rnd);
        S.sorteo = { jornada: S.jornada, r: cand[rnd[0] % cand.length], n: cand.length, t: new Date().toISOString() };
        await render(); return;
      }

      if (t.hasAttribute("data-csv-tabla")) {
        const rows = S.rows || [];
        csv(`prode-culs-${S.modo === "dia" ? "jornada-" + S.jornada : "general"}-${hoy()}.csv`,
          [["Puesto", "Puntos", "Desempate", "Nombre", "Apellido", "DNI", "Mail", "Instagram", "Sigue", "Origen", "Enviada"],
          ...rows.map(r => [r.pos, r.pts, r.aciertos, r.nombre, r.apellido, r.dni, r.mail, "@" + r.ig, r.sigo ? "sí" : "no", r.origen, fecha(r.creado_en)])]);
        return;
      }

      if (t.hasAttribute("data-exportar")) {
        t.disabled = true; const data = await rpc("admin_exportar"); t.disabled = false;
        const ps = C.JORNADAS.flatMap(j => j.partidos.map(m => ({ ...m, j: j.n })));
        csv(`prode-culs-participantes-${hoy()}.csv`,
          [["Puesto", "Puntos", "Desempate", "Nombre", "Apellido", "DNI", "Mail", "Instagram", "Sigue", "Origen", "Enviada",
            ...ps.map(m => `J${m.j} ${m.local}-${m.visita}`), ...C.HISTORIAS.map(h => "Pregunta " + h.n)],
          ...data.map(r => [r.pos, r.pts, r.aciertos, r.nombre, r.apellido, r.dni, r.mail, "@" + r.ig, r.sigo ? "sí" : "no", r.origen, fecha(r.creado_en),
            ...ps.map(m => { const p = r.pronos[m.id]; return p ? `${p.l}-${p.v} (${cuartoTxt(p.c)})` : ""; }),
            ...C.HISTORIAS.map(h => r.resp["h" + h.n] || "")])]);
        return;
      }

      if (t.hasAttribute("data-borrartodo")) {
        const v = $("#confBorrar").value.trim();
        if (v !== "BORRAR") { $("#bMsg").textContent = "Escribí BORRAR en mayúsculas para confirmar."; return; }
        if (!confirm("Se borran TODAS las cartillas y TODOS los resultados. ¿Seguro?")) return;
        const r = await rpc("admin_borrar_todo", { p_confirmar: "BORRAR" });
        await cargar(); await render(); setTimeout(() => { const m = $("#bMsg"); if (m) m.textContent = `Listo: se borraron ${r.borrados} cartillas.`; }, 0);
        return;
      }
    } catch (err) {
      const id = t.dataset.guardar || t.dataset.borrar;
      if (id) { S.msg[id] = { e: 1, t: errTxt(err) }; await render(); }
      else alert(errTxt(err));
    }
  });

  arrancar();
})();
