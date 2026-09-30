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
  var PRESS = ".btn,.pressable,.sk,.copy,.reading a,.rail-ctrl button,.sheet-close,.docs a";
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
     Barra: material sobre la portada oscura, borde al desplazar,
     sección activa
     ══════════════════════════════════════════════════════════════ */
  var nav = $("#nav"), hero = $(".hero");
  if (nav) {
    var alScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle("scrolled", y > 4);
      nav.classList.toggle("on-dark", !!hero && y < hero.offsetHeight - 56);
    };
    window.addEventListener("scroll", alScroll, { passive: true }); alScroll();
  }
  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (a) { var h = a.getAttribute("href"); if (h[0] !== "#") return; var s = document.getElementById(h.slice(1)); if (s) spy.observe(s); });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    $$(".rv").forEach(function (x) { io.observe(x); });
  } else $$(".rv").forEach(function (x) { x.classList.add("in"); });

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
     Carrusel · con ratón se arrastra 1:1, se lanza con momento y
     aterriza en la tarjeta más cercana al punto proyectado. Con el
     dedo usa el scroll nativo, que ya hace todo esto.
     ══════════════════════════════════════════════════════════════ */
  $$(".rail").forEach(function (rail) {
    var track = $(".rail-track", rail);
    var ctrl = document.querySelector('[data-rail="' + rail.id + '"]');
    var prev = ctrl && $(".prev", ctrl), next = ctrl && $(".next", ctrl);
    var sScroll = new Spring({ response: 0.5, damping: 1, rest: 0.5, onUpdate: function (v) { rail.scrollLeft = v; } });
    var sOver = new Spring({ response: 0.4, damping: 1, rest: 0.3, onUpdate: function (v) { track.style.transform = v ? "translateX(" + v + "px)" : ""; } });

    function max() { return rail.scrollWidth - rail.clientWidth; }
    function puntos() {
      var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      return $$(".demo", track).map(function (c) { return clamp(c.offsetLeft - pad, 0, max()); });
    }
    function cercano(x) { var p = puntos(), best = p[0]; p.forEach(function (q) { if (Math.abs(q - x) < Math.abs(best - x)) best = q; }); return best; }
    function ir(x, v, amortiguado) {
      rail.classList.add("animating");
      sScroll.value = rail.scrollLeft;
      sScroll.to(x, { velocity: v || 0, damping: amortiguado ? 0.86 : 1, response: 0.5, onRest: function () { rail.classList.remove("animating"); botones(); } });
    }
    function botones() {
      if (!prev) return;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= max() - 2;
    }
    rail.addEventListener("scroll", botones, { passive: true }); botones();
    window.addEventListener("resize", botones);

    if (prev) {
      prev.addEventListener("click", function () {
        var p = puntos(), cur = sScroll.raf ? sScroll.target : rail.scrollLeft;
        var dest = p.filter(function (q) { return q < cur - 4; }).pop(); ir(dest == null ? 0 : dest);
      });
      next.addEventListener("click", function () {
        var p = puntos(), cur = sScroll.raf ? sScroll.target : rail.scrollLeft;
        var dest = p.filter(function (q) { return q > cur + 4; })[0]; ir(dest == null ? max() : dest);
      });
    }

    var drag = null, tragarClick = false;
    rail.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) {
        // un dedo toma el control: detén cualquier animación en curso
        sScroll.stop(); rail.classList.remove("animating"); return;
      }
      sScroll.stop(); sOver.stop();
      drag = { x0: e.clientX, s0: rail.scrollLeft - sOver.value, moved: false, id: e.pointerId, t: new Tracker() };
      drag.t.add(e.clientX);
    });
    rail.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return; // histéresis antes de comprometerse al arrastre
        drag.moved = true; rail.classList.add("dragging");
        try { rail.setPointerCapture(drag.id); } catch (_) {}
      }
      drag.t.add(e.clientX);
      var pos = drag.s0 - dx, m = max(), o = 0;
      if (pos < 0) { o = rubber(-pos, rail.clientWidth); pos = 0; }
      else if (pos > m) { o = -rubber(pos - m, rail.clientWidth); pos = m; }
      rail.scrollLeft = pos; sOver.set(o);
    });
    function soltar(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (!d.moved) return;
      tragarClick = true; setTimeout(function () { tragarClick = false; }, 0);
      rail.classList.add("animating"); // el snap nativo no debe saltar antes de que el resorte tome el control
      rail.classList.remove("dragging");
      var v = -d.t.velocity(); // velocidad del scroll, px/s
      if (Math.abs(sOver.value) > 0.5) {
        sOver.to(0, { damping: 1, response: 0.4 });
        ir(rail.scrollLeft <= 1 ? 0 : max(), 0);
        return;
      }
      ir(cercano(rail.scrollLeft + project(v)), v, Math.abs(v) > 300);
    }
    rail.addEventListener("pointerup", soltar);
    rail.addEventListener("pointercancel", soltar);
    rail.addEventListener("click", function (e) { if (tragarClick) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener("dragstart", function (e) { e.preventDefault(); });
    rail.addEventListener("keydown", function (e) {
      if (e.target !== rail) return;
      if (e.key === "ArrowRight" && next) { e.preventDefault(); next.click(); }
      if (e.key === "ArrowLeft" && prev) { e.preventDefault(); prev.click(); }
    });
  });

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
