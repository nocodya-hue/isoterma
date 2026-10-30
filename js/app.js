/* Isoterma · interacción de la página (sin librerías) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const movil = () => innerWidth <= 760;

  /* ---------- Cabecera y menú ---------- */
  const cab = $('#cabecera'), hero = $('.hero'), barra = $('#barra');
  const alScroll = () => {
    const y = scrollY;
    cab.classList.toggle('solida', y > 24);
    barra.classList.toggle('visible', y > hero.offsetHeight * .7);
  };
  addEventListener('scroll', alScroll, { passive: true }); alScroll();

  const hamb = $('#hamburguesa');
  const cerrarMenu = () => { document.body.classList.remove('menu-abierto'); hamb.setAttribute('aria-expanded', 'false'); hamb.setAttribute('aria-label', 'Abrir menú'); };
  hamb.addEventListener('click', () => {
    const abierto = document.body.classList.toggle('menu-abierto');
    hamb.setAttribute('aria-expanded', String(abierto)); hamb.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('#menu a').forEach(a => a.addEventListener('click', cerrarMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

  /* ---------- Estación: verano o invierno (la decide el <head> por el mes o por ?estacion=) ---------- */
  const raiz = document.documentElement;
  let estacion = raiz.dataset.estacion === 'invierno' ? 'invierno' : 'verano';
  const CLIMA = {
    verano:   { fuera: 34.2, dentro: 24.0, pasos: [34, 32, 30, 28, 26, 24] },
    invierno: { fuera: 5.8,  dentro: 21.0, pasos: [6, 9, 12, 15, 18, 21] },
  };
  const botonesEstacion = $$('.estacion__btn');
  const marcarBotones = () => botonesEstacion.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.poner === estacion)));
  marcarBotones();

  /* ---------- Vídeo del hero: entra cuando la página ya ha cargado ---------- */
  const video = $('.hero__video');
  let videoPedido = false;
  const cargarVideo = () => {
    if (quieto || navigator.connection?.saveData) return;
    videoPedido = true;
    video.classList.remove('en-marcha');
    video.src = video.dataset[estacion + (movil() ? 'Movil' : '')];
    video.addEventListener('playing', () => video.classList.add('en-marcha'), { once: true });
    video.play().catch(() => {});
  };
  if (document.readyState === 'complete') setTimeout(cargarVideo, 400); else addEventListener('load', () => setTimeout(cargarVideo, 400));
  new IntersectionObserver(([e]) => { if (!video.src) return; e.isIntersecting ? video.play().catch(() => {}) : video.pause(); }).observe(hero);

  /* ---------- Corriente de aire del hero: sale de la rejilla del split; el aire frío cae y el caliente acaba subiendo ---------- */
  const svg = $('#isolineas'), media = $('.hero__media'), NS = 'http://www.w3.org/2000/svg';
  const N = 11, lineas = [], grad = $('#grad-aire');
  for (let i = 0; i < N; i++) { const p = document.createElementNS(NS, 'path'); svg.appendChild(p); lineas.push(p); }
  let W = 0, H = 0, ux = 0, uy = 0, uw = 0, enMovil = false;
  let foto = $(`.solo-${estacion} .hero__foto`);
  function medir() {
    W = media.offsetWidth; H = media.offsetHeight; enMovil = movil();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const clave = enMovil ? 'unidadMovil' : 'unidad';
    const [fx, fy, fw] = (svg.dataset[clave + (estacion === 'invierno' ? 'Invierno' : '')] || svg.dataset[clave]).split(' ').map(Number);
    const iw = foto.naturalWidth || (enMovil ? 900 : 1672), ih = foto.naturalHeight || (enMovil ? 1599 : 941), cs = getComputedStyle(foto);
    const [px, py] = cs.objectPosition.split(' ').map(v => parseFloat(v) / 100);
    const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    ux = (W - dw) * px + fx * dw; uy = (H - dh) * py + fy * dh; uw = fw * dw;
    grad.setAttribute('x1', ux); grad.setAttribute('y1', uy); grad.setAttribute('x2', ux - W * (enMovil ? .5 : .26)); grad.setAttribute('y2', uy + H * (enMovil ? .18 : .4));
  }
  medir(); $$('.hero__foto').forEach(f => f.addEventListener('load', medir)); addEventListener('resize', medir);
  const dentro = $('#lectura-dentro'), barraLectura = $('#lectura-barra');
  const T_CALMA = 3400;
  let inicio = performance.now();
  let heroVisible = true, raf = 0;
  const suave = x => 1 - Math.pow(1 - x, 3);
  function dibujar(ahora) {
    const t = ahora - inicio, k = quieto ? 1 : suave(Math.min(1, t / T_CALMA));
    const largo = enMovil ? W * .55 : Math.min(W * .3, 470), caida = H * (enMovil ? .2 : .42), n = enMovil ? 7 : N;
    for (let i = 0; i < N; i++) {
      if (i >= n) { lineas[i].setAttribute('d', ''); continue; }
      const f = i / (n - 1), x0 = ux + (f - .5) * uw * .9, y0 = uy + 2;
      const L = largo * (.7 + .4 * Math.sin(f * Math.PI)), C = caida * (.6 + .55 * f);
      const amp = 3 + 16 * (1 - k * .8), fase = i * 1.3;
      let d = '';
      for (let j = 0; j <= 28; j++) {
        const s = j / 28;
        const ola = amp * s * Math.sin(s * 9 - t * .0021 + fase) * (.6 + .4 * Math.sin(t * .0007 + i));
        const x = x0 - L * s, y = y0 + C * (estacion === 'invierno' ? .8 * s - .45 * s * s : .5 * s + .5 * s * s) + ola;
        d += (j ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      lineas[i].setAttribute('d', d);
    }
    const { fuera, dentro: meta } = CLIMA[estacion], temp = fuera + (meta - fuera) * k;
    dentro.innerHTML = temp.toFixed(1).replace('.', ',') + '<small>°C</small>';
    barraLectura.style.transform = `scaleX(${k})`;
    if (!quieto && heroVisible && !document.hidden) raf = requestAnimationFrame(dibujar); else raf = 0;
  }
  raf = requestAnimationFrame(dibujar);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; if (heroVisible && !raf && !quieto) raf = requestAnimationFrame(dibujar); }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && heroVisible && !raf && !quieto) raf = requestAnimationFrame(dibujar); });

  /* ---------- Apariciones ---------- */
  const ioAparece = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); ioAparece.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.aparece').forEach(el => ioAparece.observe(el));

  /* ---------- Paso a paso: el visor sigue al paso activo ---------- */
  const pasos = $$('.paso'), capas = $$('.visor__capa'), tempVisor = $('#visor-temp'), escala = $('#visor-escala');
  const videoPaso = $('video.visor__capa');
  let activo = -1;
  function activar(n) {
    if (n === activo) return; activo = n;
    pasos.forEach((p, i) => p.classList.toggle('activo', i === n));
    capas.forEach(c => c.classList.toggle('activa', +c.dataset.paso === n));
    tempVisor.textContent = CLIMA[estacion].pasos[n];
    tempVisor.parentElement.style.setProperty('--c-temp', `color-mix(in oklab, var(--fuera) ${100 - n * 20}%, var(--dentro))`);
    escala.style.transform = `scaleX(${Math.max(.02, n / 5)})`;
    if (n === 3 && !quieto && getComputedStyle($('.pasos__visor')).display !== 'none') {
      if (!videoPaso.src) videoPaso.src = videoPaso.dataset.src;
      videoPaso.play().catch(() => {});
    } else if (videoPaso.src) videoPaso.pause();
  }
  const ioPasos = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) activar(+e.target.dataset.paso); }), { rootMargin: '-45% 0px -45% 0px' });
  pasos.forEach(p => ioPasos.observe(p));
  activar(0);

  // Cambio de estación con el interruptor del hero
  function ponerEstacion(e) {
    if (e === estacion) return;
    estacion = e; raiz.dataset.estacion = e; marcarBotones();
    foto = $(`.solo-${estacion} .hero__foto`); medir();
    inicio = performance.now(); if (!raf) raf = requestAnimationFrame(dibujar);
    if (videoPedido) cargarVideo();
    const n = activo; activo = -1; activar(Math.max(0, n));
  }
  botonesEstacion.forEach(b => b.addEventListener('click', () => ponerEstacion(b.dataset.poner)));

  // En móvil el vídeo de la instalación va dentro del propio paso
  const videoMovil = $('.paso__video');
  new IntersectionObserver(([e]) => {
    if (getComputedStyle(videoMovil).display === 'none' || quieto) return;
    if (e.isIntersecting) { if (!videoMovil.src) videoMovil.src = videoMovil.dataset.src; videoMovil.play().catch(() => {}); } else if (videoMovil.src) videoMovil.pause();
  }, { threshold: .25 }).observe(videoMovil);

  /* ---------- Calculadora de presupuesto ---------- */
  const P = window.ISOTERMA, form = $('#calc');
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const rango = (r, m = P.MARGEN) => Array.isArray(r) ? r.slice() : [r, r * m];
  const suma = (a, b, veces = 1) => [a[0] + b[0] * veces, a[1] + b[1] * veces];
  const redondear = ([a, b]) => [Math.floor(a / 10) * 10, Math.ceil(b / 10) * 10];
  const txt = ([a, b]) => `${fmt(a)}–${fmt(b)} €`;

  const DESDE = { split: P.instalacion.split.esencial[0], mantenimiento: P.mantenimiento.puntual.primero[0], diagnostico: P.reparacion.diagnostico[0], acs: P.aerotermia.acs[0] };
  $$('[data-desde]').forEach(el => { const v = DESDE[el.dataset.desde]; if (v) el.textContent = fmt(v) + ' €'; });

  const TAMANOS = ['hasta 15 m²', '15–25 m²', '25–35 m²', 'más de 35 m²'];
  const VIVIENDAS = ['hasta 70 m²', '70–100 m²', '100–140 m²', 'más de 140 m²'];
  const AERO_SUP = ['hasta 90 m²', '90–140 m²', 'más de 140 m²'];
  const DISTANCIAS = ['hasta 3 m', '3–6 m', '6–10 m'];
  const GAMAS = { esencial: 'Esencial', confort: 'Confort', premium: 'Premium' };

  function valores() {
    const fd = new FormData(form), v = Object.fromEntries(fd.entries());
    v.propio = fd.has('propio') ? 'si' : 'no';
    ['retirar', 'bomba', 'altura', 'caldera'].forEach(k => v[k] = fd.has(k));
    return v;
  }

  // Muestra solo los campos que tocan y reparte las letras A, B, C…
  function visibilidad(v) {
    const cumple = cond => cond.split('&').every(c => { const neg = c.includes('!='); const [k, val] = c.split(neg ? '!=' : '='); return neg ? v[k] !== val : v[k] === val; });
    let letra = 0;
    $$('.campo', form).forEach(f => {
      const ver = !f.dataset.si || cumple(f.dataset.si);
      f.hidden = !ver;
      if (ver) f.querySelector('.campo__letra').textContent = String.fromCharCode(65 + letra++);
    });
  }

  function calcular(v) {
    const lineas = [], wa = [];
    let total, etiqueta = 'IVA incluido';
    if (v.servicio === 'instalacion') {
      const I = P.instalacion, gama = v.gama, propio = v.propio === 'si';
      let base, unidades = 1, desc;
      if (v.sistema === 'split') {
        const i = +v.tamano; desc = `Split 1x1 · estancia de ${TAMANOS[i]}`;
        base = propio ? rango(I.soloInstalacion.split) : rango(I.split[gama][i]);
      } else if (v.sistema === 'multisplit') {
        const i = +v.estancias; unidades = i + 2; desc = `Multisplit ${unidades}x1 · ${unidades} estancias`;
        base = propio ? rango(I.soloInstalacion.multisplit[i]) : rango(I.multisplit[gama][i]);
      } else {
        const i = +v.vivienda; desc = `Conductos · vivienda de ${VIVIENDAS[i]}`;
        base = propio ? rango(I.soloInstalacion.conductos) : rango(I.conductos[gama][i]);
      }
      lineas.push([propio ? `${desc} · solo instalación` : `${desc} · gama ${GAMAS[gama]}`, base]);
      wa.push('Servicio: instalación de aire acondicionado', `Sistema: ${desc}`, propio ? 'Equipo: ya lo tengo, solo instalación' : `Gama: ${GAMAS[gama]}`, `Distancia entre unidades: ${DISTANCIAS[+v.distancia]}`);
      total = base;
      const d = +v.distancia;
      if (d > 0) { const r = I.distancia[d]; const u = v.sistema === 'conductos' ? 1 : unidades; total = suma(total, r, u); lineas.push([`Línea de ${DISTANCIAS[d]}${u > 1 ? ` (×${u})` : ''}`, [r[0] * u, r[1] * u]]); }
      const extras = [];
      if (v.retirar) { const u = v.sistema === 'conductos' ? 1 : unidades; total = suma(total, I.retirar, u); lineas.push([`Retirar equipo antiguo${u > 1 ? ` (×${u})` : ''}`, [I.retirar[0] * u, I.retirar[1] * u]]); extras.push('retirar el equipo antiguo'); }
      if (v.bomba) { const u = v.sistema === 'conductos' ? 1 : unidades; total = suma(total, I.bomba, u); lineas.push([`Bomba de condensados${u > 1 ? ` (×${u})` : ''}`, [I.bomba[0] * u, I.bomba[1] * u]]); extras.push('bomba de condensados'); }
      if (v.altura) { total = suma(total, I.altura); lineas.push(['Máquina exterior en altura', I.altura]); extras.push('máquina exterior en tejado o fachada alta'); }
      if (extras.length) wa.push(`Extras: ${extras.join(', ')}`);
      wa.push('Uso: frío en verano y calefacción en invierno');
      lineas.push(['nota', 'Bomba de calor: frío en verano y calefacción en invierno con el mismo equipo.']);
      etiqueta = propio ? 'IVA incluido · solo instalación' : 'IVA incluido · equipo e instalación';
    } else if (v.servicio === 'aerotermia') {
      const A = P.aerotermia;
      if (v.aero === 'acs') { total = rango(A.acs); lineas.push(['Aerotermia para agua caliente', total]); wa.push('Servicio: aerotermia para agua caliente'); }
      else {
        const i = +v.aeroSuperficie; total = rango(A.calefaccion[i]);
        lineas.push([`Agua caliente y calefacción · ${AERO_SUP[i]}`, total.slice()]);
        wa.push(`Servicio: aerotermia para agua caliente y calefacción${v.aero === 'frio' ? ' y frío' : ''}`, `Vivienda: ${AERO_SUP[i]}`);
        if (v.aero === 'frio') { total = suma(total, A.frio); lineas.push(['Suplemento de refrigeración', A.frio]); }
      }
      if (v.caldera) { total = suma(total, A.caldera); lineas.push(['Retirar caldera o termo antiguo', A.caldera]); wa.push('Extras: retirar la caldera o el termo antiguo'); }
      etiqueta = 'IVA incluido · equipo e instalación';
    } else if (v.servicio === 'mantenimiento') {
      const n = Math.max(1, +v.equipos || 1), M = P.mantenimiento[v.plan];
      total = suma(rango(M.primero), M.siguiente, n - 1);
      lineas.push([v.plan === 'anual' ? 'Plan anual · primer equipo' : 'Revisión · primer equipo', rango(M.primero)]);
      if (n > 1) lineas.push([`Equipos adicionales (×${n - 1})`, [M.siguiente[0] * (n - 1), M.siguiente[1] * (n - 1)]]);
      wa.push(`Servicio: mantenimiento (${v.plan === 'anual' ? 'plan anual' : 'revisión puntual'})`, `Equipos interiores: ${n}`);
      etiqueta = v.plan === 'anual' ? 'IVA incluido · al año' : 'IVA incluido · una visita';
    } else {
      const R = P.reparacion, s = R.sintomas[v.sintoma];
      total = rango(s.rango);
      lineas.push([`Reparación habitual · ${s.texto.toLowerCase()}`, total]);
      lineas.push(['Diagnóstico y desplazamiento', R.diagnostico]);
      lineas.push(['nota', s.nota]);
      wa.push('Servicio: reparación', `Qué le pasa: ${s.texto}`);
      etiqueta = 'IVA incluido · precio habitual de la reparación';
    }
    return { total: redondear(total), lineas, wa, etiqueta };
  }

  const pMin = $('#precio-min'), pMax = $('#precio-max'), pBloque = $('.resumen__precio'), lista = $('#resumen-lineas'), iva = $('#resumen-iva'), escalaR = $('#resumen-escala');
  const btnWa = $('#enviar-wa'), barraValor = $('#barra-valor'), barraWa = $('#barra-wa');
  let tocado = false, ultimo = '';
  const posicion = x => Math.max(0, Math.min(1, (Math.log(x) - Math.log(40)) / (Math.log(17000) - Math.log(40))));

  function actualizar() {
    const v = valores(); visibilidad(v);
    const r = calcular(v), [a, b] = r.total;
    const clave = a + '-' + b;
    pMin.textContent = fmt(a); pMax.textContent = fmt(b);
    if (clave !== ultimo && ultimo) { pBloque.classList.remove('cambia'); void pBloque.offsetWidth; pBloque.classList.add('cambia'); }
    ultimo = clave;
    iva.textContent = r.etiqueta;
    lista.innerHTML = r.lineas.map(([t, val]) => t === 'nota' ? `<li class="nota">${val}</li>` : `<li><span>${t}</span><b>${txt(redondear(val))}</b></li>`).join('');
    const x0 = posicion(a), x1 = posicion(b);
    escalaR.style.left = (x0 * 100) + '%'; escalaR.style.width = Math.max(2, (x1 - x0) * 100) + '%';

    const datos = [];
    if (v.nombre?.trim()) datos.push(`Nombre: ${v.nombre.trim()}`);
    if (v.zona?.trim()) datos.push(`Zona: ${v.zona.trim()}`);
    if (v.hora) datos.push(`Mejor hora para llamarme: ${v.hora.toLowerCase()}`);
    const msg = ['Hola, Isoterma. He calculado un presupuesto en vuestra web:', '', ...r.wa.map(l => '• ' + l), '',
      `Precio orientativo: ${fmt(a)}–${fmt(b)} € (${r.etiqueta.replace(" · ", ", ")})`, ...(datos.length ? ['', ...datos] : []), '', '¿Podéis venir a verlo?'].join('\n');
    const url = `https://wa.me/${P.telefono}?text=${encodeURIComponent(msg)}`;
    btnWa.href = url;
    if (tocado) { barraValor.textContent = `${fmt(a)}–${fmt(b)} €`; barraWa.href = url; }
  }
  form.addEventListener('input', () => { tocado = true; actualizar(); });
  form.addEventListener('change', () => { tocado = true; actualizar(); });
  form.addEventListener('submit', e => e.preventDefault());

  // Contador de equipos
  const nEquipos = form.querySelector('input[name="equipos"]'), salida = $('#equipos-num');
  $$('.contador__btn', form).forEach(b => b.addEventListener('click', () => {
    const n = Math.min(12, Math.max(1, +nEquipos.value + +b.dataset.delta));
    nEquipos.value = n; salida.textContent = n; tocado = true; actualizar();
  }));

  // Enlaces de los servicios que abren la calculadora ya elegida
  $$('[data-preset]').forEach(a => a.addEventListener('click', () => {
    const r = form.querySelector(`input[name="servicio"][value="${a.dataset.preset}"]`);
    if (r) { r.checked = true; tocado = true; actualizar(); }
  }));

  actualizar();
})();
