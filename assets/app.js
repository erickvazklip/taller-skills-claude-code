(function () {
  "use strict";
  var M = window.MATERIALES || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ICON = '<svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 3v10m0 0 4-4m-4 4-4-4M4 16h12"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function tipo(a) { return a.split(".").pop().toUpperCase(); }

  /* ── índice de todos los archivos por id ── */
  var porId = {};
  ["guias", "skills", "plantillas", "paquetes"].forEach(function (k) { (M[k] || []).forEach(function (m) { porId[m.id] = m; }); });
  if (M.kit) porId.kit = M.kit;

  function boton(m, clase, texto) {
    return '<a class="btn ' + clase + ' dl" href="descargas/' + esc(m.archivo) + '" data-id="' + esc(m.id) + '" download>' +
      ICON + "<span>" + texto + "</span></a>";
  }

  /* ── render de materiales ── */
  var lg = $("#lista-guias");
  if (lg) lg.innerHTML = (M.guias || []).map(function (m) {
    return '<li class="file"><div class="ficon">' + tipo(m.archivo) + '</div><div>' +
      (m.etiqueta ? '<span class="tag">' + esc(m.etiqueta) + "</span>" : "") +
      "<h4>" + esc(m.titulo) + "</h4><p>" + esc(m.desc) + '</p><div class="sz">' + esc(m.archivo) + " · " + esc(m.peso) + "</div></div>" +
      boton(m, "btn-ghost", "Descargar") + "</li>";
  }).join("");

  var lp = $("#lista-paquetes");
  if (lp) lp.innerHTML = (M.paquetes || []).map(function (m) {
    return '<li class="file"><div class="ficon zip">ZIP</div><div><h4>' + esc(m.titulo) + "</h4><p>" + esc(m.desc) +
      '</p><div class="sz">' + esc(m.archivo) + " · " + esc(m.peso) + "</div></div>" + boton(m, "btn-ghost", "Descargar") + "</li>";
  }).join("");

  var ls = $("#lista-skills");
  if (ls) ls.innerHTML = (M.skills || []).map(function (m) {
    var g = m.grado.toLowerCase(), cls = g === "alta" ? "lvl-a" : g === "media" ? "lvl-m" : "lvl-b";
    var cmd = "cp -r " + m.id + " ~/.claude/skills/";
    return '<article class="skill"><div class="skill-top"><h4>' + esc(m.id) + '</h4><span class="lvl ' + cls + '">Libertad ' + esc(m.grado) +
      '</span></div><p class="d">' + esc(m.desc) + '</p><p class="e"><b>Enseña:</b> ' + esc(m.ensena) + '</p><div class="skill-actions">' +
      boton(m, "btn-navy btn-sm", "ZIP") +
      '<div class="cmd"><code>' + esc(cmd) + '</code><button class="copy" data-text="' + esc(cmd) + '" aria-label="Copiar comando de instalación">Copiar</button></div>' +
      "</div></article>";
  }).join("");

  var lt = $("#lista-plantillas");
  if (lt) lt.innerHTML = (M.plantillas || []).map(function (m) {
    return '<article class="tpl"><span class="idx">' + esc(m.id) + "</span><h4>" + esc(m.titulo) + "</h4><p>" + esc(m.desc) + "</p>" +
      boton(m, "btn-ghost btn-sm", "Descargar") + "</article>";
  }).join("");

  if (M.kit) $$("[data-kit-peso]").forEach(function (e) { e.textContent = "ZIP · " + M.kit.peso; });

  /* ── aviso ── */
  var toast = $("#toast"), tt;
  function avisar(t) {
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  /* ── descargas: Drive si hay ID, archivo del sitio si no. Nunca sale de la página ── */
  var marco;
  function descargarDrive(id) {
    if (!marco) { marco = document.createElement("iframe"); marco.hidden = true; marco.title = "descarga"; document.body.appendChild(marco); }
    marco.src = "https://drive.usercontent.google.com/download?id=" + encodeURIComponent(id) + "&export=download&confirm=t";
  }
  function estado(btn, clase, texto) {
    var s = btn.querySelector("span"), orig = btn.getAttribute("data-orig") || s.textContent;
    btn.setAttribute("data-orig", orig);
    btn.classList.remove("busy", "done"); if (clase) btn.classList.add(clase);
    s.textContent = texto || orig;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a.dl"); if (!a) return;
    var m = porId[a.hasAttribute("data-kit") ? "kit" : a.getAttribute("data-id")];
    if (m && m.drive && M.fuente === "drive") { e.preventDefault(); descargarDrive(m.drive); }
    estado(a, "busy", "Descargando…");
    setTimeout(function () {
      estado(a, "done", "Listo");
      avisar("Descargando " + (m ? m.archivo : "archivo"));
      setTimeout(function () { estado(a, null); }, 2200);
    }, 450);
  });

  /* ── respuesta inmediata al presionar ── */
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".btn"); if (!b) return;
    b.classList.add("press");
    var off = function () { b.classList.remove("press"); window.removeEventListener("pointerup", off); window.removeEventListener("pointercancel", off); };
    window.addEventListener("pointerup", off); window.addEventListener("pointercancel", off);
  });

  /* ── copiar ── */
  function copiar(txt, btn) {
    var ok = function () {
      var o = btn.textContent; btn.textContent = "Copiado"; btn.classList.add("ok");
      setTimeout(function () { btn.textContent = o; btn.classList.remove("ok"); }, 1600);
    };
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
    if (!txt) { var src = document.getElementById(b.getAttribute("data-copy")); txt = src ? src.textContent : ""; }
    copiar(txt, b);
  });

  /* ── control segmentado ── */
  var seg = $(".seg"), ind = $(".seg-ind"), tabs = $$('.seg [role="tab"]');
  function mover(tab) {
    if (!ind) return;
    ind.style.width = tab.offsetWidth + "px";
    ind.style.transform = "translateX(" + tab.offsetLeft + "px)";
  }
  function activar(tab, foco) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    mover(tab);
    if (foco) tab.focus();
    var l = tab.offsetLeft - 8, r = tab.offsetLeft + tab.offsetWidth + 8;
    if (l < seg.scrollLeft || r > seg.scrollLeft + seg.clientWidth) seg.scrollTo({ left: l, behavior: "smooth" });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { activar(t); });
    t.addEventListener("keydown", function (e) {
      var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
      if (n === null) return;
      e.preventDefault(); activar(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  if (tabs.length) {
    var actual = function () { mover($('.seg [aria-selected="true"]')); };
    requestAnimationFrame(actual);
    window.addEventListener("resize", actual);
    if (document.fonts) document.fonts.ready.then(actual);
  }

  /* ── barra: translúcida al salir de la portada, sección activa ── */
  var nav = $("#nav"), hero = $(".hero");
  function alScroll() { nav.classList.toggle("solid", window.scrollY > hero.offsetHeight - 70); }
  window.addEventListener("scroll", alScroll, { passive: true }); alScroll();

  var links = $$(".nav-links a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) spy.observe(s); });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".rv").forEach(function (x) { io.observe(x); });
  } else {
    $$(".rv").forEach(function (x) { x.classList.add("in"); });
  }

  /* ── lista de verificación, recordada en este navegador ── */
  var K = "omnisys-skills-checklist", cajas = $$("#chk input");
  var guardado = [];
  try { guardado = JSON.parse(localStorage.getItem(K) || "[]"); } catch (_) {}
  cajas.forEach(function (c, i) { c.checked = !!guardado[i]; });
  function progreso() {
    var n = cajas.filter(function (c) { return c.checked; }).length;
    $("#chk-n").textContent = n;
    $("#chk-bar").style.width = (n / cajas.length * 100) + "%";
    try { localStorage.setItem(K, JSON.stringify(cajas.map(function (c) { return c.checked; }))); } catch (_) {}
    return n;
  }
  cajas.forEach(function (c) {
    c.addEventListener("change", function () {
      if (progreso() === cajas.length && c.checked) avisar("Tu skill está lista para compartirse");
    });
  });
  if (cajas.length) progreso();
})();
