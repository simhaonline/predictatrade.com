(() => {
  'use strict';

  const CONFIG = Object.freeze({
    loopMs: 10000,
    phases: Object.freeze({ noise: 2000, shape: 3000, signal: 3000, settle: 2000 }),
    candleSeed: 1742,
    signalPeriod: 5,
    colors: Object.freeze({ green: '#27b889', red: '#e2575f', amber: '#f0b04a', gold: '#ffd38a' })
  });

  function seededCandles(seed) {
    let value = seed >>> 0;
    const random = () => ((value = (value * 1664525 + 1013904223) >>> 0) / 4294967296);
    const candles = [];
    let close = 54;
    for (let i = 0; i < 26; i += 1) {
      const drift = (random() - .47) * 7 + (i > 14 ? .65 : 0);
      const open = close;
      close = Math.max(20, Math.min(88, close + drift));
      const high = Math.min(94, Math.max(open, close) + 2 + random() * 5);
      const low = Math.max(12, Math.min(open, close) - 2 - random() * 5);
      candles.push({ open, close, high, low });
    }
    return candles;
  }

  function pathFor(values, x0, step, y) {
    return values.map((value, index) => `${index ? 'L' : 'M'} ${x0 + index * step} ${y(value)}`).join(' ');
  }

  function buildGraphic() {
    const candles = seededCandles(CONFIG.candleSeed);
    const x0 = 62;
    const step = 27;
    const y = (value) => 365 - value * 2.9;
    let ema = candles[0].close;
    const signal = candles.map((candle) => { ema += (candle.close - ema) / CONFIG.signalPeriod; return ema; });
    const competitorA = candles.map((candle, i) => candle.close + Math.sin(i * 1.2) * 4);
    const competitorB = candles.map((candle, i) => candle.close - Math.cos(i * .9) * 4);
    const candleSvg = candles.map((candle, i) => {
      const x = x0 + i * step;
      const top = y(Math.max(candle.open, candle.close));
      const bottom = y(Math.min(candle.open, candle.close));
      const cls = candle.close >= candle.open ? 'la-bull' : 'la-bear';
      return `<g class="${cls}"><line class="la-wick" x1="${x}" x2="${x}" y1="${y(candle.high)}" y2="${y(candle.low)}"/><rect class="la-body" x="${x - 6}" y="${top}" width="12" height="${Math.max(5, bottom - top)}"/></g>`;
    }).join('');
    const signalPath = pathFor(signal, x0, step, y);
    const chartWidth = (candles.length - 1) * step;
    return `<svg viewBox="0 0 800 450" role="img" aria-hidden="true" aria-label="Animated illustrative XAUUSD analysis showing candles resolving into a measured signal" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="la-signal-gradient" x1="0" x2="1"><stop offset="0" stop-color="${CONFIG.colors.amber}"/><stop offset="1" stop-color="${CONFIG.colors.gold}"/></linearGradient>
        <filter id="la-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="la-noise-pattern"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" seed="17"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .24 0"/></filter>
      </defs>
      <rect width="800" height="450" fill="#0b0d12"/>
      <g class="la-grid"><path d="M 54 82H746 M54 152H746 M54 222H746 M54 292H746 M54 362H746"/><path d="M 62 64V370 M224 64V370 M386 64V370 M548 64V370 M710 64V370"/></g>
      <g class="la-axis"><text x="62" y="45">XAUUSD / ILLUSTRATIVE VIEW</text><text x="62" y="397">OBSERVE</text><text x="337" y="397">CONTEXTUALISE</text><text x="661" y="397">ACT</text></g>
      <g class="la-competitors"><path class="la-competitor" d="${pathFor(competitorA, x0, step, y)}"/><path class="la-competitor" d="${pathFor(competitorB, x0, step, y)}"/></g>
      <g class="la-candles">${candleSvg}</g>
      <g class="la-noise"><rect width="800" height="450"/></g>
      <path class="la-signal-glow" d="${signalPath}" stroke-dasharray="${chartWidth}"/>
      <path class="la-signal" d="${signalPath}" stroke-dasharray="${chartWidth}" stroke-dashoffset="${chartWidth}"/>
      <g class="la-chips"><rect class="la-chip" x="570" y="78" width="58" height="28" rx="14"/><text class="la-chip-text" x="584" y="96">EMA</text><rect class="la-chip" x="636" y="78" width="58" height="28" rx="14"/><text class="la-chip-text" x="650" y="96">RSI</text><rect class="la-chip" x="702" y="78" width="58" height="28" rx="14"/><text class="la-chip-text" x="713" y="96">MACD</text></g>
      <g class="la-annotation"><line class="la-annotation-line" x1="604" y1="174" x2="674" y2="139"/><rect class="la-annotation-box" x="674" y="118" width="104" height="42" rx="8"/><text class="la-annotation-text" x="688" y="144">MEASURED ↑</text></g>
    </svg>`;
  }

  function mount(host) {
    if (host.dataset.livingAnalysisMounted) return;
    host.dataset.livingAnalysisMounted = 'true';
    host.classList.add('living-analysis');
    const poster = host.querySelector('img') || document.createElement('img');
    poster.className = 'living-analysis-poster';
    poster.src = '/media/pat-hero-signal.webp';
    poster.alt = 'Abstract rising market signal';
    host.replaceChildren(poster);
    const graphic = document.createElement('div');
    graphic.className = 'living-analysis-graphic';
    graphic.innerHTML = buildGraphic();
    host.append(graphic);
    const caption = document.createElement('div');
    caption.className = 'living-analysis-caption';
    caption.setAttribute('aria-live', 'polite');
    caption.textContent = 'READ THE NOISE';
    host.append(caption);
    const note = document.createElement('div');
    note.className = 'living-analysis-note';
    note.textContent = 'SLOW THE INTERPRETATION';
    host.append(note);
    host.classList.add('is-mounted');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { host.classList.add('is-static'); caption.textContent = 'SEE THE SIGNAL'; return; }
    let visible = false;
    let hidden = document.visibilityState === 'hidden';
    let start = 0;
    let frame = 0;
    let lastPhase = '';
    const phases = [['is-noise', 'READ THE NOISE', 0], ['is-shape', 'FIND THE SHAPE', CONFIG.phases.noise], ['is-signal', 'SEE THE SIGNAL', CONFIG.phases.noise + CONFIG.phases.shape], ['is-settle', 'SETTLE', CONFIG.phases.noise + CONFIG.phases.shape + CONFIG.phases.signal]];
    const tick = (now) => {
      if (!visible || hidden) { frame = 0; return; }
      if (!start) start = now;
      const elapsed = (now - start) % CONFIG.loopMs;
      let phase = phases[0];
      for (let i = phases.length - 1; i >= 0; i -= 1) if (elapsed >= phases[i][2]) { phase = phases[i]; break; }
      if (phase[0] !== lastPhase) { host.classList.remove(...phases.map(item => item[0])); host.classList.add(phase[0]); caption.textContent = phase[1]; lastPhase = phase[0]; }
      frame = requestAnimationFrame(tick);
    };
    const setVisibility = (entries) => { visible = entries[0].isIntersecting; if (visible && !frame) frame = requestAnimationFrame(tick); };
    const observer = new IntersectionObserver(setVisibility, { threshold: .15 });
    observer.observe(host);
    document.addEventListener('visibilitychange', () => { hidden = document.visibilityState === 'hidden'; if (!hidden && visible && !frame) frame = requestAnimationFrame(tick); });
    reduced.addEventListener?.('change', (event) => { if (event.matches) { host.classList.remove(...phases.map(item => item[0])); host.classList.add('is-static'); caption.textContent = 'SEE THE SIGNAL'; } });
  }

  const findHosts = () => document.querySelectorAll('[data-living-analysis], .hero-visual');
  const update = () => findHosts().forEach(mount);
  new MutationObserver(update).observe(document.documentElement, { childList: true, subtree: true });
  update();
})();
