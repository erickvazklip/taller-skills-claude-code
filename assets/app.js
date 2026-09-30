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
  var P = M.paquetes || {};
  Object.keys(P).forEach(function (k) { porId[P[k].id] = P[k]; });
  (M.material || []).forEach(function (m) { porId[m.id] = m; });

  function boton(m, clase, texto) {
    return '<a class="btn ' + clase + ' dl" href="descargas/' + esc(m.archivo) + '" data-id="' + esc(m.id) + '" download>' +
      ICON + "<span>" + texto + "</span></a>";
  }

  $$("[data-peso]").forEach(function (e) { var m = P[e.getAttribute("data-peso")]; if (m) e.textContent = "ZIP · " + m.peso; });

  /* ── paquete 1: archivo por archivo ── */
  var lm = $("#lista-material");
  if (lm) lm.innerHTML = (M.material || []).map(function (m) {
    return '<li class="file"><div class="ficon' + (tipo(m.archivo) === "PDF" ? " pdf" : "") + '">' + tipo(m.archivo) + '</div><div>' +
      "<h4>" + esc(m.titulo) + "</h4><p>" + esc(m.desc) + '</p><div class="sz">' + esc(m.archivo) + " · " + esc(m.peso) + "</div></div>" +
      boton(m, "btn-ghost btn-sm", "Descargar") + "</li>";
  }).join("");

  /* ── paquete 2: catálogo de skills ── */
  var lk = $("#lista-kit");
  if (lk) lk.innerHTML = (M.kitSkills || []).map(function (c) {
    return '<div class="cat"><div class="cat-h"><h4>' + esc(c.titulo) + '</h4><span>' + c.skills.length + " skills</span></div><ul>" +
      c.skills.map(function (k) {
        var g = k.grado.toLowerCase(), cls = g === "alta" ? "lvl-a" : g === "media" ? "lvl-m" : "lvl-b";
        var cmd = "cp -r kit-skills/" + c.cat + "/" + k.id + " ~/.claude/skills/";
        return '<li><div class="k-top"><code class="k-name">' + esc(k.id) + '</code><span class="lvl ' + cls + '">' + esc(k.grado) + "</span></div>" +
          "<p>" + esc(k.desc) + '</p><button class="copy copy-cmd" data-text="' + esc(cmd) + '" aria-label="Copiar comando para instalar ' + esc(k.id) + '">Copiar instalación</button></li>';
      }).join("") + "</ul></div>";
  }).join("");

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
    var m = porId[a.getAttribute("data-id")];
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
