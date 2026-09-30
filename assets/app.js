(function () {
  "use strict";

  var M = window.MATERIALES || {};
  var BASE = document.body.getAttribute("data-base") || "";
  var REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ICON_DL = '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 3v10m0 0 4-4m-4 4-4-4M4 16h12"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ══════════════════════════════════════════════════════════════
     Física
     ══════════════════════════════════════════════════════════════ */

  /* Resorte con los dos parámetros de diseño: `response` (segundos hasta
     el objetivo) y `damping` (1 = sin rebote). Siempre parte del valor
     actual y conserva la velocidad al cambiar de objetivo, así que se puede
     interrumpir y redirigir en cualquier momento. */
  function Spring(o) {
    this.value = o.value || 0; this.target = this.value; this.v = 0;
    this.response = o.response || 0.4; this.damping = o.damping == null ? 1 : o.damping;
    this.rest = o.rest || 0.25; this.onUpdate = o.onUpdate; this.onRest = null; this.raf = 0;
    this.tick = this.tick.bind(this);
  }
  Spring.prototype.to = function (target, o) {
    o = o || {};
    this.target = target;
    if (o.velocity != null) this.v = o.velocity;
    if (o.response) this.response = o.response;
    if (o.damping != null) this.damping = o.damping;
    this.onRest = o.onRest || null;
    // sin movimiento, o con la pestaña oculta (rAF en pausa): llega de inmediato
    if (REDUCE || document.hidden) { var r0 = this.onRest; this.set(target); if (r0) r0(); return; }
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick); }
  };
  Spring.prototype.tick = function (now) {
    var dt = Math.min((now - this.last) / 1000, 1 / 30); this.last = now;
    var w = 2 * Math.PI / this.response, k = w * w, c = 2 * this.damping * w;
    var n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (var i = 0; i < n; i++) { var a = -k * (this.value - this.target) - c * this.v; this.v += a * h; this.value += this.v * h; }
    if (Math.abs(this.v) < this.rest * 4 && Math.abs(this.value - this.target) < this.rest) {
      this.value = this.target; this.v = 0; this.raf = 0; this.onUpdate(this.value);
      var r = this.onRest; this.onRest = null; if (r) r();
      return;
    }
    this.onUpdate(this.value);
    this.raf = requestAnimationFrame(this.tick);
  };
  Spring.prototype.stop = function () { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.onRest = null; };
  Spring.prototype.set = function (v) { this.stop(); this.value = this.target = v; this.v = 0; this.onUpdate(v); };

  /* Historial corto de posiciones para medir la velocidad al soltar. */
  function Tracker() { this.s = []; }
  Tracker.prototype.add = function (x) { var t = performance.now(); this.s.push([x, t]); while (this.s.length > 2 && t - this.s[0][1] > 100) this.s.shift(); };
  Tracker.prototype.velocity = function () {
    var s = this.s; if (s.length < 2) return 0;
    var a = s[0], b = s[s.length - 1], dt = (b[1] - a[1]) / 1000;
    if (performance.now() - b[1] > 80) return 0; // se quedó quieto antes de soltar
    return dt > 0 ? (b[0] - a[0]) / dt : 0;
  };

  /* A dónde llegaría con esa velocidad, como la desaceleración del scroll. */
  function project(v, d) { d = d || 0.998; return (v / 1000) * d / (1 - d); }
  /* Resistencia progresiva más allá del borde. */
  function rubber(x, dim, c) { c = c || 0.55; return (x * dim * c) / (dim + c * Math.abs(x)); }

  /* ══════════════════════════════════════════════════════════════
     Respuesta inmediata al presionar (en pointerdown, no en click)
     ══════════════════════════════════════════════════════════════ */
  var PRESS = ".btn,.pressable,.sk,.copy,.reading a,.chapters a,.play,.sheet-close";
  document.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    var el = e.target.closest(PRESS); if (!el) return;
    el.classList.add("is-pressed");
    var x0 = e.clientX, y0 = e.clientY;
    function off() { el.classList.remove("is-pressed"); window.removeEventListener("pointerup", off); window.removeEventListener("pointercancel", off); window.removeEventListener("pointermove", mv); }
    function mv(ev) { if (Math.abs(ev.clientX - x0) > 10 || Math.abs(ev.clientY - y0) > 10) off(); } // arrastrar cancela la presión
    window.addEventListener("pointerup", off); window.addEventListener("pointercancel", off); window.addEventListener("pointermove", mv);
  }, { passive: true });

  /* ══════════════════════════════════════════════════════════════
     Aviso
     ══════════════════════════════════════════════════════════════ */
  var toast = $("#toast"), tt;
  function avisar(t) {
    if (!toast) return;
    toast.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9"/></svg><span></span>';
    toast.lastChild.textContent = t; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2400);
  }

  /* ══════════════════════════════════════════════════════════════
     Materiales (landing)
     ══════════════════════════════════════════════════════════════ */
  function tipo(a) { return a.split(".").pop().toUpperCase(); }
  var porId = {}, P = M.paquetes || {};
  Object.keys(P).forEach(function (k) { porId[P[k].id] = P[k]; });
  (M.material || []).forEach(function (m) { porId[m.id] = m; });
  $$("[data-peso]").forEach(function (e) { var m = P[e.getAttribute("data-peso")]; if (m) e.textContent = "ZIP · " + m.peso; });

  var lm = $("#lista-material");
  if (lm) lm.innerHTML = (M.material || []).map(function (m) {
    var t = tipo(m.archivo);
    return '<li class="file"><div class="ficon ' + t.toLowerCase() + '">' + t + '</div><div><h4>' + esc(m.titulo) + "</h4><p>" + esc(m.desc) +
      '</p><div class="sz">' + esc(m.archivo) + " · " + esc(m.peso) + '</div></div><a class="btn btn-soft btn-sm dl" href="' + BASE + "descargas/" + esc(m.archivo) +
      '" data-id="' + esc(m.id) + '" download>' + ICON_DL + "<span>Descargar</span></a></li>";
  }).join("");

  function lvl(g) { g = g.toLowerCase(); return g === "alta" ? "lvl-a" : g === "media" ? "lvl-m" : "lvl-b"; }
  var lk = $("#lista-kit");
  if (lk) lk.innerHTML = (M.kitSkills || []).map(function (c) {
    return '<article class="cat card rv"><div class="cat-h"><h3>' + esc(c.titulo) + "</h3><span>" + c.skills.length + " skills</span></div><ul>" +
      c.skills.map(function (k) {
        return '<li><button class="sk" type="button" data-skill="' + esc(k.id) + '" data-cat="' + esc(c.cat) + '" aria-haspopup="dialog"><code>' + esc(k.id) +
          '</code><span class="sk-go"><span class="lvl ' + lvl(k.grado) + '">' + esc(k.grado) + "</span></span><p>" + esc(k.desc) + "</p></button></li>";
      }).join("") + "</ul></article>";
  }).join("");

  /* ══════════════════════════════════════════════════════════════
     Descargas: Drive si hay ID y la fuente es drive; si no, el sitio.
     Nunca se sale de la página.
     ══════════════════════════════════════════════════════════════ */
  var marco;
  function descargarDrive(id) {
    if (!marco) { marco = document.createElement("iframe"); marco.hidden = true; marco.title = "descarga"; document.body.appendChild(marco); }
    marco.src = "https://drive.usercontent.google.com/download?id=" + encodeURIComponent(id) + "&export=download&confirm=t";
  }
  function estado(btn, clase, texto) {
    var s = btn.querySelector("span"); if (!s) return;
    var orig = btn.getAttribute("data-orig") || s.textContent;
    btn.setAttribute("data-orig", orig);
    btn.classList.remove("is-busy", "is-done"); if (clase) btn.classList.add(clase);
    s.textContent = texto || orig;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a.dl"); if (!a) return;
    var m = porId[a.getAttribute("data-id")];
    if (m && m.drive && M.fuente === "drive") { e.preventDefault(); descargarDrive(m.drive); }
    var nombre = m ? m.archivo : decodeURIComponent(a.getAttribute("href").split("/").pop());
    if (!a.classList.contains("btn")) {
      a.classList.add("got"); avisar("Descargando " + nombre);
      setTimeout(function () { a.classList.remove("got"); }, 1800);
      return;
    }
    estado(a, "is-busy", "Descargando…");
    setTimeout(function () {
      estado(a, "is-done", "Listo"); avisar("Descargando " + nombre);
      setTimeout(function () { estado(a, null); }, 2000);
    }, 380);
  });

  /* ══════════════════════════════════════════════════════════════
     Copiar
     ══════════════════════════════════════════════════════════════ */
  function copiar(txt, btn) {
    function ok() {
      if (!btn) return avisar("Copiado");
      var o = btn.getAttribute("data-label") || btn.textContent; btn.setAttribute("data-label", o);
      btn.textContent = "Copiado"; btn.classList.add("ok");
      setTimeout(function () { btn.textContent = o; btn.classList.remove("ok"); }, 1500);
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, function () { avisar("No se pudo copiar"); });
    else {
      var t = document.createElement("textarea"); t.value = txt; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (_) { avisar("No se pudo copiar"); }
      t.remove();
    }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".copy"); if (!b) return;
    var txt = b.getAttribute("data-text");
    if (txt == null) { var src = document.getElementById(b.getAttribute("data-copy")); txt = src ? src.textContent : ""; }
    copiar(txt, b);
  });

  /* ══════════════════════════════════════════════════════════════
     Navegación al estilo apple.com: barra global que se va, barra
     local que se queda y cambia de material según lo que tiene debajo,
     menú de pantalla completa y desplegable de secciones en móvil.
     ══════════════════════════════════════════════════════════════ */
  var lnav = $("#lnav"), menuBtn = $(".menu-btn"), menu = $("#menu");
  if (menuBtn && menu) {
    var menuAbierto = function () { return document.documentElement.classList.contains("menu-open"); };
    var setMenu = function (open) {
      document.documentElement.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) setTimeout(function () { var a = $("a", menu); if (a) a.focus({ preventScroll: true }); }, 180);
    };
    menuBtn.addEventListener("click", function () { setMenu(!menuAbierto()); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuAbierto()) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 833 && menuAbierto()) setMenu(false); });
  }
  if (lnav) {
    var tog = $(".lnav-toggle", lnav);
    var setDrop = function (open) { lnav.classList.toggle("open", open); tog.setAttribute("aria-expanded", open ? "true" : "false"); };
    tog.addEventListener("click", function (e) { e.stopPropagation(); setDrop(!lnav.classList.contains("open")); });
    $$(".lnav-drop a", lnav).forEach(function (a) { a.addEventListener("click", function () { setDrop(false); }); });
    document.addEventListener("click", function (e) { if (!lnav.contains(e.target)) setDrop(false); });
  }

  /* ── todo lo que depende del scroll, en un solo cuadro ── */
  var bloques = $$("main > section, main > nav, footer");
  var lnavLinks = $$(".lnav-links a");
  var secciones = lnavLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var stage = $("#stage"), win = $("#window");
  var palabras = [], words = $("#words");
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + esc(w) + "</span>"; }).join(" ");
    palabras = $$(".w", words);
  }
  var pasos = $$("#stepper li"), linea = $("#timeline"), relleno = linea && $(".fill", linea), hitos = linea ? $$("li", linea) : [];
  var pendiente = false;
  function cuadro() {
    pendiente = false;
    var vh = window.innerHeight;

    // material de la barra local según lo que queda debajo
    if (lnav) {
      var y = lnav.getBoundingClientRect().bottom, oscuro = true;
      for (var i = 0; i < bloques.length; i++) {
        var r = bloques[i].getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { oscuro = bloques[i].matches(".dark,.hero"); break; }
      }
      lnav.classList.toggle("light", !oscuro);
      var activa = -1;
      secciones.forEach(function (s, k) { if (s && s.getBoundingClientRect().top <= 140) activa = k; });
      lnavLinks.forEach(function (a, k) { a.classList.toggle("on", k === activa); });
    }

    // la terminal de la portada crece y se asienta con el scroll
    if (stage && win && !REDUCE) {
      var rs = stage.getBoundingClientRect();
      var p = clamp((vh - rs.top) / (vh * 0.8), 0, 1);
      win.style.transform = "translateY(" + ((1 - p) * 48).toFixed(1) + "px) scale(" + (0.86 + 0.14 * p).toFixed(4) + ")";
    }

    // el manifiesto se enciende palabra por palabra
    if (palabras.length && !REDUCE) {
      var rw = words.getBoundingClientRect();
      var q = clamp((vh * 0.82 - rw.top) / (rw.height + vh * 0.3), 0, 1);
      var n = Math.round(q * palabras.length);
      palabras.forEach(function (w, k) { w.classList.toggle("lit", k < n); });
    }

    // el paso del destilador que está al centro de la pantalla
    if (pasos.length && window.innerWidth > 1068) {
      var mejor = 0, dist = Infinity;
      pasos.forEach(function (li, k) {
        var r = li.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < dist) { dist = d; mejor = k; }
      });
      pasos.forEach(function (li, k) { li.classList.toggle("on", k === mejor); });
    }

    // la línea de 30 días se llena con el avance
    if (linea) {
      var rl = linea.getBoundingClientRect(), marca = vh * 0.62;
      relleno.style.transform = "scaleY(" + clamp((marca - rl.top) / rl.height, 0, 1).toFixed(4) + ")";
      hitos.forEach(function (li) { li.classList.toggle("on", li.getBoundingClientRect().top + 12 < marca); });
    }
  }
  function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(cuadro); } }
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  cuadro();

  /* ══════════════════════════════════════════════════════════════
     Control segmentado · el indicador es un resorte en X y en ancho
     ══════════════════════════════════════════════════════════════ */
  var seg = $(".seg"), ind = $(".seg-ind"), tabs = $$('.seg [role="tab"]');
  if (seg && tabs.length) {
    var sx = new Spring({ response: 0.34, damping: 1, rest: 0.2, onUpdate: function (v) { ind.style.transform = "translateX(" + v + "px)"; } });
    var sw = new Spring({ response: 0.34, damping: 1, rest: 0.2, onUpdate: function (v) { ind.style.width = v + "px"; } });
    var colocar = function (tab, animar) {
      if (animar) { sx.to(tab.offsetLeft); sw.to(tab.offsetWidth); } else { sx.set(tab.offsetLeft); sw.set(tab.offsetWidth); }
    };
    var activar = function (tab, foco) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      colocar(tab, true);
      if (foco) tab.focus({ preventScroll: true });
      var l = tab.offsetLeft - 12, r = tab.offsetLeft + tab.offsetWidth + 12;
      if (l < seg.scrollLeft || r > seg.scrollLeft + seg.clientWidth) seg.scrollTo({ left: l, behavior: REDUCE ? "auto" : "smooth" });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activar(t); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault(); activar(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
    var actual = function () { colocar($('.seg [aria-selected="true"]'), false); };
    requestAnimationFrame(actual);
    window.addEventListener("resize", actual);
    if (document.fonts) document.fonts.ready.then(actual);
  }

  /* ══════════════════════════════════════════════════════════════
     Galería de la agenda, al estilo "conoce lo más destacado":
     una tarjeta al centro, paginación con puntos, recorrido automático
     que se pausa en cuanto la persona toma el control. Con ratón se
     arrastra 1:1 y se lanza con momento; con el dedo usa el scroll nativo.
     ══════════════════════════════════════════════════════════════ */
  var gal = $("#gallery");
  if (gal) {
    var track = $(".gallery-track", gal), tiles = $$(".tile", gal), dots = $(".dots"), play = $(".play");
    var cur = 0, playing = false, inView = false, DUR = 6000, timer = null;
    dots.innerHTML = tiles.map(function (t, i) { return '<button type="button" role="tab" aria-label="Demo ' + (i + 1) + '"><i></i></button>'; }).join("");
    var db = $$("button", dots);
    var sS = new Spring({ response: 0.6, damping: 1, rest: 0.5, onUpdate: function (v) { gal.scrollLeft = v; } });
    var sO = new Spring({ response: 0.4, damping: 1, rest: 0.3, onUpdate: function (v) { track.style.transform = v ? "translateX(" + v + "px)" : ""; } });
    var gmax = function () { return gal.scrollWidth - gal.clientWidth; };
    var gpos = function (i) { var t = tiles[i]; return clamp(t.offsetLeft - (gal.clientWidth - t.offsetWidth) / 2, 0, gmax()); };
    var gnear = function (x) { var b = 0; tiles.forEach(function (t, i) { if (Math.abs(gpos(i) - x) < Math.abs(gpos(b) - x)) b = i; }); return b; };

    var pintarPunto = function () {
      db.forEach(function (d) { var i = $("i", d); i.style.transition = "none"; i.style.width = "0"; });
      var a = db[cur] && $("i", db[cur]); if (!a) return;
      if (playing && inView) { void a.offsetWidth; a.style.transition = "width " + DUR + "ms linear"; a.style.width = "100%"; }
      else a.style.width = "100%";
    };
    var programar = function () {
      clearTimeout(timer);
      if (playing && inView) timer = setTimeout(function () { gir(cur + 1); programar(); }, DUR);
    };
    var marcar = function (i) {
      cur = i;
      db.forEach(function (d, k) { d.classList.toggle("on", k === i); d.setAttribute("aria-selected", k === i ? "true" : "false"); });
      tiles.forEach(function (t, k) { t.classList.toggle("dim", k !== i); t.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      pintarPunto();
    };
    var gir = function (i, v, rebote) {
      i = (i + tiles.length) % tiles.length; marcar(i);
      gal.classList.add("animating");
      sS.value = gal.scrollLeft;
      sS.to(gpos(i), { velocity: v || 0, damping: rebote ? 0.86 : 1, response: 0.6, onRest: function () { gal.classList.remove("animating"); } });
    };
    var setPlaying = function (p) {
      playing = p; play.classList.toggle("paused", !p);
      play.setAttribute("aria-label", p ? "Pausar el recorrido" : "Reproducir el recorrido");
      pintarPunto(); programar();
    };
    var tomarControl = function () { if (playing) setPlaying(false); };

    play.addEventListener("click", function () { if (!playing && cur === tiles.length - 1) gir(0); setPlaying(!playing); });
    db.forEach(function (d, i) { d.addEventListener("click", function () { tomarControl(); gir(i); }); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; pintarPunto(); programar(); }, { threshold: 0.45 }).observe(gal);
    gal.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); tomarControl(); gir(cur + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); tomarControl(); gir(cur - 1); }
    });
    var sync;
    gal.addEventListener("scroll", function () {
      if (sS.raf || gdrag) return;
      clearTimeout(sync); sync = setTimeout(function () { var n = gnear(gal.scrollLeft); if (n !== cur) marcar(n); }, 90);
    }, { passive: true });
    gal.addEventListener("click", function (e) {
      var t = e.target.closest(".tile"); if (!t || e.target.closest("button")) return;
      var i = tiles.indexOf(t); if (i !== cur) { tomarControl(); gir(i); }
    });

    var gdrag = null, gtragar = false;
    gal.addEventListener("pointerdown", function (e) {
      tomarControl();
      if (e.pointerType !== "mouse" || e.button !== 0) { sS.stop(); gal.classList.remove("animating"); return; }
      sS.stop(); sO.stop();
      gdrag = { x0: e.clientX, s0: gal.scrollLeft - sO.value, moved: false, id: e.pointerId, t: new Tracker() };
      gdrag.t.add(e.clientX);
    });
    gal.addEventListener("pointermove", function (e) {
      if (!gdrag || e.pointerId !== gdrag.id) return;
      var dx = e.clientX - gdrag.x0;
      if (!gdrag.moved) {
        if (Math.abs(dx) < 6) return;
        gdrag.moved = true; gal.classList.add("dragging");
        try { gal.setPointerCapture(gdrag.id); } catch (_) {}
      }
      gdrag.t.add(e.clientX);
      var p = gdrag.s0 - dx, m = gmax(), o = 0;
      if (p < 0) { o = rubber(-p, gal.clientWidth); p = 0; }
      else if (p > m) { o = -rubber(p - m, gal.clientWidth); p = m; }
      gal.scrollLeft = p; sO.set(o);
    });
    var gsoltar = function (e) {
      if (!gdrag || e.pointerId !== gdrag.id) return;
      var d = gdrag; gdrag = null;
      if (!d.moved) return;
      gtragar = true; setTimeout(function () { gtragar = false; }, 0);
      gal.classList.add("animating"); gal.classList.remove("dragging");
      var v = -d.t.velocity();
      if (Math.abs(sO.value) > 0.5) { sO.to(0, { damping: 1, response: 0.4 }); gir(gal.scrollLeft <= 1 ? 0 : tiles.length - 1); return; }
      gir(gnear(gal.scrollLeft + project(v)), v, Math.abs(v) > 300);
    };
    gal.addEventListener("pointerup", gsoltar);
    gal.addEventListener("pointercancel", gsoltar);
    gal.addEventListener("click", function (e) { if (gtragar) { e.preventDefault(); e.stopPropagation(); } }, true);
    gal.addEventListener("dragstart", function (e) { e.preventDefault(); });
    window.addEventListener("resize", function () { sS.set(gpos(cur)); });

    marcar(0);
    requestAnimationFrame(function () { gal.scrollLeft = gpos(0); });
    setPlaying(!REDUCE);
  }

  /* ══════════════════════════════════════════════════════════════
     Markdown mínimo para leer skills y corridas dentro de la página
     ══════════════════════════════════════════════════════════════ */
  function inline(s) {
    var codes = [];
    s = s.replace(/``\s?(.+?)\s?``|`([^`]+)`/g, function (_, a, b) { codes.push(a || b); return "\u0000" + (codes.length - 1) + "\u0000"; });
    s = esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[\s(«])\*([^*\s][^*]*?)\*(?=[\s).,;:!?»]|$)/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return "<code>" + esc(codes[+i]) + "</code>"; });
  }
  function lineaCodigo(l, lang) {
    var e = esc(l);
    if (lang === "diff") {
      if (/^(\+\+\+|---|diff |index |@@)/.test(l)) return '<span class="meta">' + e + "</span>";
      if (l[0] === "+") return '<span class="add">' + e + "</span>";
      if (l[0] === "-") return '<span class="del">' + e + "</span>";
    }
    return e;
  }
  var INICIO = /^(```|#{1,4} |>|\||\s*[-*] |\s*\d+\. |(-{3,}|\*{3,})\s*$)/;
  function md(src) {
    var L = src.replace(/\r/g, "").split("\n"), out = [], i = 0, buf, m;
    if (L[0] === "---") {
      var j = L.indexOf("---", 1);
      if (j > 0) {
        out.push('<pre class="fm-block"><code>' + L.slice(0, j + 1).map(function (l) {
          var f = /^([a-z-]+):(.*)$/.exec(l); return f ? '<span class="meta">' + esc(f[1]) + ":</span>" + esc(f[2]) : esc(l);
        }).join("\n") + "</code></pre>");
        i = j + 1;
      }
    }
    while (i < L.length) {
      var l = L[i];
      if (/^\s*$/.test(l)) { i++; continue; }
      if (/^```/.test(l)) {
        var lang = l.slice(3).trim(); buf = []; i++;
        while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]);
        i++;
        out.push("<pre><code>" + buf.map(function (x) { return lineaCodigo(x, lang); }).join("\n") + "</code></pre>");
        continue;
      }
      if (/^( {4}|\t)/.test(l)) {
        buf = [];
        while (i < L.length && (/^( {4}|\t)/.test(L[i]) || (/^\s*$/.test(L[i]) && i + 1 < L.length && /^( {4}|\t)/.test(L[i + 1])))) buf.push(L[i++].replace(/^( {4}|\t)/, ""));
        out.push("<pre><code>" + esc(buf.join("\n")) + "</code></pre>");
        continue;
      }
      if ((m = /^(#{1,4}) (.*)$/.exec(l))) { out.push("<h" + m[1].length + ">" + inline(m[2]) + "</h" + m[1].length + ">"); i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(l)) { out.push("<hr>"); i++; continue; }
      if (/^>/.test(l)) {
        buf = []; while (i < L.length && /^>/.test(L[i])) buf.push(L[i++].replace(/^> ?/, ""));
        out.push("<blockquote>" + md(buf.join("\n")) + "</blockquote>"); continue;
      }
      if (/^\|/.test(l)) {
        buf = []; while (i < L.length && /^\|/.test(L[i])) buf.push(L[i++]);
        var celdas = function (r) { return r.replace(/^\||\|\s*$/g, "").split("|").map(function (c) { return c.trim(); }); };
        var head = celdas(buf[0]), rows = buf.slice(/^\|[\s:|-]+\|?\s*$/.test(buf[1] || "") ? 2 : 1);
        out.push("<table><thead><tr>" + head.map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
          rows.map(function (r) { return "<tr>" + celdas(r).map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>");
        continue;
      }
      if (/^\s*([-*]|\d+\.) /.test(l)) {
        var ord = /^\s*\d+\. /.test(l), items = [];
        while (i < L.length) {
          var x = L[i];
          if (/^\s*([-*]|\d+\.) /.test(x)) { items.push(x.replace(/^\s*([-*]|\d+\.) /, "")); i++; }
          else if (/^\s{2,}\S/.test(x) && items.length) { items[items.length - 1] += " " + x.trim(); i++; }
          else break;
        }
        var tag = ord ? "ol" : "ul";
        out.push("<" + tag + ">" + items.map(function (t) {
          var c = /^\[( |x)\] (.*)$/.exec(t); return "<li>" + (c ? (c[1] === "x" ? "☑ " : "☐ ") + inline(c[2]) : inline(t)) + "</li>";
        }).join("") + "</" + tag + ">");
        continue;
      }
      buf = [];
      while (i < L.length && !/^\s*$/.test(L[i]) && !(buf.length && (INICIO.test(L[i]) || /^( {4}|\t)/.test(L[i])))) buf.push(L[i++].trim());
      out.push("<p>" + inline(buf.join(" ")) + "</p>");
    }
    return out.join("\n");
  }

  /* ══════════════════════════════════════════════════════════════
     Hoja inferior
     Entra y sale por el mismo camino (abajo). El asa se arrastra 1:1,
     resiste hacia arriba, y al soltar decide con la posición proyectada
     por la velocidad, no con la posición actual.
     ══════════════════════════════════════════════════════════════ */
  var sheet, scrim, sBody, sFoot, sTitle, sKick, sClose, sy, disparador = null, abierta = false;
  function crearHoja() {
    scrim = document.createElement("div"); scrim.className = "scrim";
    sheet = document.createElement("div"); sheet.className = "sheet";
    sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true"); sheet.setAttribute("aria-labelledby", "sheet-title");
    sheet.innerHTML =
      '<div class="sheet-grab"><div class="sheet-handle" aria-hidden="true"></div><div class="sheet-head"><div><p class="sheet-kick"></p><h2 class="sheet-title" id="sheet-title"></h2></div>' +
      '<button class="sheet-close" type="button" aria-label="Cerrar"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12"/></svg></button></div></div>' +
      '<div class="sheet-body"><div class="md"></div></div><div class="sheet-foot"></div>';
    document.body.appendChild(scrim); document.body.appendChild(sheet);
    sBody = $(".sheet-body .md", sheet); sFoot = $(".sheet-foot", sheet); sTitle = $(".sheet-title", sheet); sKick = $(".sheet-kick", sheet); sClose = $(".sheet-close", sheet);
    sy = new Spring({
      response: 0.38, damping: 1, rest: 0.4,
      onUpdate: function (y) {
        var h = sheet.offsetHeight || 1;
        sheet.style.transform = "translateY(" + y + "px)";
        scrim.style.opacity = clamp(1 - y / h, 0, 1);
      }
    });
    scrim.addEventListener("click", cerrarHoja);
    sClose.addEventListener("click", cerrarHoja);
    sheet.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); cerrarHoja(); }
      if (e.key === "Tab") {
        var f = $$("a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])", sheet).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });

    var grab = $(".sheet-grab", sheet), d = null;
    grab.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".sheet-close") || e.button !== 0) return;
      sy.stop(); // se puede atrapar a medio vuelo
      d = { y0: e.clientY, v0: sy.value, t: new Tracker(), id: e.pointerId };
      d.t.add(e.clientY);
      try { grab.setPointerCapture(e.pointerId); } catch (_) {}
    });
    grab.addEventListener("pointermove", function (e) {
      if (!d || e.pointerId !== d.id) return;
      d.t.add(e.clientY);
      var raw = d.v0 + (e.clientY - d.y0), h = sheet.offsetHeight;
      sy.set(raw < 0 ? -rubber(-raw, h) : raw);
    });
    function soltar(e) {
      if (!d || e.pointerId !== d.id) return;
      var v = d.t.velocity(), h = sheet.offsetHeight; d = null;
      var destino = sy.value + project(v, 0.99);
      if (destino > h * 0.45) cerrarHoja(null, v);
      else sy.to(0, { velocity: v, damping: Math.abs(v) > 200 ? 0.82 : 1, response: 0.32 });
    }
    grab.addEventListener("pointerup", soltar);
    grab.addEventListener("pointercancel", soltar);
  }
  function abrirHoja(o) {
    if (!sheet) crearHoja();
    disparador = o.trigger || document.activeElement;
    sKick.textContent = o.kicker || ""; sTitle.textContent = o.title || "";
    sBody.innerHTML = o.html || ""; sFoot.innerHTML = o.foot || "";
    sheet.querySelector(".sheet-body").scrollTop = 0;
    document.documentElement.classList.add("sheet-lock");
    scrim.classList.add("open"); sheet.classList.add("open");
    if (!abierta && !sy.raf) sy.set(sheet.offsetHeight);
    abierta = true;
    sy.to(0, { damping: 1, response: 0.4 });
    setTimeout(function () { sClose.focus({ preventScroll: true }); }, 30);
  }
  function cerrarHoja(e, v) {
    if (!sheet || !abierta) return;
    abierta = false;
    sy.to(sheet.offsetHeight + 20, {
      velocity: typeof v === "number" ? v : 0, damping: 1, response: 0.34,
      onRest: function () {
        if (abierta) return;
        scrim.classList.remove("open"); sheet.classList.remove("open");
        document.documentElement.classList.remove("sheet-lock");
        if (disparador && disparador.focus) disparador.focus({ preventScroll: true });
      }
    });
  }

  /* ── datos para la hoja ── */
  var cache = {};
  function datos(nombre) {
    if (!cache[nombre]) cache[nombre] = fetch(BASE + "assets/datos/" + nombre + ".json").then(function (r) { return r.json(); });
    return cache[nombre];
  }
  var kitUrl = BASE + "descargas/kit-asistente-skills-claude-code.zip";

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-skill]");
    if (b) {
      var id = b.getAttribute("data-skill"), cat = b.getAttribute("data-cat");
      datos("skills").then(function (s) {
        var k = s[id]; if (!k) return;
        var c = cat || k.cat, cmd = "cp -r kit-skills/" + c + "/" + id + " ~/.claude/skills/";
        abrirHoja({
          trigger: b, kicker: "Skill del kit · " + c.replace("-", " "), title: id,
          html: md(k.md),
          foot: '<code class="cmdline">' + esc(cmd) + '</code><button class="copy copy-light" type="button" data-text="' + esc(cmd) + '">Copiar instalación</button>' +
            '<button class="copy copy-light" type="button" data-text="' + esc(k.md) + '">Copiar SKILL.md</button>' +
            '<a class="btn btn-red btn-sm dl" data-id="kit" href="' + kitUrl + '" download>' + ICON_DL + "<span>Kit completo</span></a>"
        });
      });
      return;
    }
    var r = e.target.closest("[data-run]");
    if (r) {
      var key = r.getAttribute("data-run");
      datos("corridas").then(function (c) {
        var x = c[key]; if (!x) return;
        abrirHoja({
          trigger: r, kicker: key === "D2" ? "Demo 2 · el archivo que se leyó" : "Corrida capturada", title: x.titulo,
          html: md(x.md),
          foot: '<button class="copy copy-light" type="button" data-text="' + esc(x.md) + '">Copiar texto</button>' +
            (key === "D2" ? "" : '<a class="btn btn-soft btn-sm dl" href="' + BASE + 'webinar/descargas/respaldos.zip" download>' + ICON_DL + "<span>Todas las corridas</span></a>")
        });
      });
    }
  });

  /* ══════════════════════════════════════════════════════════════
     Lista de verificación, recordada en este navegador
     ══════════════════════════════════════════════════════════════ */
  var K = "omnisys-skills-checklist", cajas = $$("#chk input");
  if (cajas.length) {
    var guardado = [];
    try { guardado = JSON.parse(localStorage.getItem(K) || "[]"); } catch (_) {}
    cajas.forEach(function (c, i) { c.checked = !!guardado[i]; });
    var barra = $("#chk-bar");
    var sBar = new Spring({ response: 0.45, damping: 1, rest: 0.002, onUpdate: function (v) { barra.style.transform = "scaleX(" + v + ")"; } });
    var progreso = function (animar) {
      var n = cajas.filter(function (c) { return c.checked; }).length;
      $("#chk-n").textContent = n;
      if (animar) sBar.to(n / cajas.length); else sBar.set(n / cajas.length);
      try { localStorage.setItem(K, JSON.stringify(cajas.map(function (c) { return c.checked; }))); } catch (_) {}
      return n;
    };
    cajas.forEach(function (c) {
      c.addEventListener("change", function () {
        if (progreso(true) === cajas.length && c.checked) avisar("Tu skill está lista para compartirse");
      });
    });
    progreso(false);
  }
})();
