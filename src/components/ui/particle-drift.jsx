import { useEffect, useRef } from 'react';

// Canvas particle layer adapted from the supplied Particle Drift source.
export default function ParticleDrift() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*()';
    const mouse = { x: -1000, y: -1000 };
    let width = 0, height = 0, nodes = [], beams = [], frame = 0, lastTime = 0;
    const randomChar = () => chars[Math.floor(Math.random() * chars.length)];

    function draw(delta = 0) {
      ctx.clearRect(0, 0, width, height);
      for (const beam of beams) {
        beam.y -= beam.speed * delta;
        if (beam.y + beam.length < 0) { beam.y = height + 100; beam.x = Math.random() * width; }
        const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length);
        gradient.addColorStop(0, `rgba(121,223,210,${beam.opacity})`);
        gradient.addColorStop(1, 'rgba(39,91,125,0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(beam.x, beam.y); ctx.lineTo(beam.x, beam.y + beam.length); ctx.stroke();
      }
      ctx.font = '11px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.y += node.speed * delta;
        if (node.y > height + 20) { node.y = -20; node.x = Math.random() * width; }
        for (let j = i + 1; j < nodes.length; j++) {
          const next = nodes[j];
          const distance = Math.hypot(node.x - next.x, node.y - next.y);
          if (distance < 120) {
            ctx.strokeStyle = `rgba(121,174,190,${0.17 * (1 - distance / 120)})`;
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(next.x, next.y); ctx.stroke();
          }
        }
        const distance = Math.hypot(mouse.x - node.x, mouse.y - node.y);
        const near = !motion.matches && distance < 180;
        if (delta && (near || Math.random() > 0.98)) node.char = randomChar();
        if (near) {
          ctx.strokeStyle = `rgba(121,223,210,${0.35 * (1 - distance / 180)})`;
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = near ? '#79dfd2' : 'rgba(163,190,205,0.45)';
        ctx.fillText(node.char, node.x, node.y);
      }
    }
    function tick(time) {
      if (time - lastTime >= 1000 / 30) {
        draw(lastTime ? Math.min((time - lastTime) / 1000, 0.06) : 0);
        lastTime = time;
      }
      frame = requestAnimationFrame(tick);
    }
    function restart() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      draw();
      if (!motion.matches && !document.hidden) frame = requestAnimationFrame(tick);
    }
    function resize() {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = width < 768;
      nodes = Array.from({ length: mobile ? 34 : 90 }, () => ({ x: Math.random() * width, y: Math.random() * height, speed: 6 + Math.random() * 24, char: randomChar() }));
      beams = Array.from({ length: mobile ? 8 : 20 }, () => ({ x: Math.random() * width, y: Math.random() * height, length: 50 + Math.random() * 100, speed: 90 + Math.random() * 160, opacity: 0.12 + Math.random() * 0.25 }));
      restart();
    }
    function pointerMove(event) {
      if (event.pointerType !== 'mouse' || motion.matches) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top;
    }
    function clearPointer() { mouse.x = -1000; mouse.y = -1000; }
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener('pointermove', pointerMove, { passive: true });
    window.addEventListener('blur', clearPointer);
    document.documentElement.addEventListener('pointerleave', clearPointer);
    document.addEventListener('visibilitychange', restart);
    motion.addEventListener('change', restart);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('blur', clearPointer);
      document.documentElement.removeEventListener('pointerleave', clearPointer);
      document.removeEventListener('visibilitychange', restart);
      motion.removeEventListener('change', restart);
    };
  }, []);
  return <div className="particle-drift" aria-hidden="true"><canvas ref={canvasRef} /><div className="particle-drift-shade" /></div>;
}
