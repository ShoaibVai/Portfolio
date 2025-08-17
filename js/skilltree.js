// Minimal Skill Tree interactivity: draw lines, hover, expand/collapse panels
document.addEventListener('DOMContentLoaded', () => {
  const svg = document.querySelector('.skill-tree-svg');
  const nodes = Array.from(document.querySelectorAll('.skill-node'));
  const center = document.querySelector('.skill-center');

  // icons removed — nodes are label-only; lazy-loading not required

  // utility: element center relative to SVG
  function getElementCenterInSvg(el){
    const r = el.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const x = (r.left + r.width/2) - svgRect.left;
    const y = (r.top + r.height/2) - svgRect.top;
    return {x, y};
  }

  // throttle helper
  function throttle(fn, wait){
    let t = null; let lastArgs = null;
    return function(...a){ lastArgs = a; if(!t){ t = setTimeout(()=>{ fn(...lastArgs); t = null; }, wait); } }
  }

  let hasAnimated = false;
  function drawLines(animate = true){
    if(!svg) return;
    // ensure svg has same pixel size
    const width = svg.clientWidth; const height = svg.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    // clear old
    while(svg.firstChild) svg.removeChild(svg.firstChild);

    const c = getElementCenterInSvg(center);
    nodes.forEach(n => {
      const p = getElementCenterInSvg(n);
      const dx = (p.x - c.x) * 0.35;
      const d = `M ${c.x} ${c.y} C ${c.x + dx} ${c.y} ${p.x - dx} ${p.y} ${p.x} ${p.y}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', d);
  // subtle stroke: semi-transparent and thinner
  path.setAttribute('stroke', 'rgba(126,87,194,0.38)');
  path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      path.style.filter = 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))';
      // initial dasharray based on path length
      svg.appendChild(path);
      // animate stroke only on first run if requested
      if(animate && !hasAnimated){
        const len = path.getTotalLength();
        path.style.strokeDasharray = `${len}`;
        path.style.strokeDashoffset = `${len}`;
        // force reflow then add class to animate
        requestAnimationFrame(()=>{ path.classList.add('drawn'); });
        // when animation ends, convert to dashed discrete style
        path.addEventListener('transitionend', function onEnd(e){
          if(e.propertyName === 'stroke-dashoffset'){
            path.classList.add('discrete');
            path.removeEventListener('transitionend', onEnd);
          }
        });
      } else {
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '0';
        path.classList.add('drawn');
        path.classList.add('discrete');
      }
    });
    if(animate) hasAnimated = true;
  }

  const safeDraw = throttle(()=> drawLines(false), 80);
  window.addEventListener('resize', safeDraw);
  window.addEventListener('scroll', safeDraw);

  // Node interactions: tooltips and panel toggles with ARIA updates
  nodes.forEach(n => {
    const id = n.dataset.id;
    const panel = document.getElementById('panel-' + id);
    // click toggles panel
    n.addEventListener('click', (e)=>{
      const isOpen = n.getAttribute('aria-expanded') === 'true';
      // close all
      nodes.forEach(x => x.setAttribute('aria-expanded','false'));
      document.querySelectorAll('.skill-panel').forEach(p=> p.setAttribute('aria-hidden','true'));
      if(!isOpen){
        n.setAttribute('aria-expanded','true');
        if(panel){ panel.setAttribute('aria-hidden','false'); panel.focus?.(); }
      }
      // redraw connectors to ensure visual alignment
      drawLines(false);
    });
    // keyboard
    n.addEventListener('keydown', (ev)=>{
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); n.click(); }
    });
    // basic hover tooltip accessibility: show tooltip on focus
    n.addEventListener('focus', ()=>{
      const tip = n.querySelector('.node-tooltip'); if(tip) tip.setAttribute('aria-hidden','false');
    });
    n.addEventListener('blur', ()=>{
      const tip = n.querySelector('.node-tooltip'); if(tip) tip.setAttribute('aria-hidden','true');
    });
  });

  // Draw lines and animate on initial load immediately
  // (ensures animation is visible without scrolling into view)
  drawLines(true);
});
