import React, { useEffect, useRef } from 'react';

export default function DotMatrixBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let dots = [];
    const spacing = 20;

    const initDots = () => {
      dots = [];
      for (let x = 0; x < canvas.width + spacing; x += spacing) {
        for (let y = 0; y < canvas.height + spacing; y += spacing) {
          dots.push({
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            offset: Math.random() * Math.PI * 2
          });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    let mouse = { x: -9999, y: -9999 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);

    resize();

    let time = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      dots.forEach(dot => {
        let floatX = Math.sin(time + dot.offset) * 0.8;
        let floatY = Math.cos(time + dot.offset) * 0.8;

        dot.x = dot.baseX + floatX;
        dot.y = dot.baseY + floatY;

        let dx = dot.x - mouse.x;
        let dy = dot.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          let force = (120 - dist) / 120;
          dot.x += dx * force * 0.35;
          dot.y += dy * force * 0.35;
        }

        // Idle: subtle white dots. Near mouse: glow with theme green #c9f28f
        let radius, opacity, r, g, b;

        if (dist < 120) {
          let t = 1 - dist / 120;
          radius = 0.7 + t * 1.1;    // grows toward mouse
          opacity = 0.25 + t * 0.45;
          r = Math.round(255 + t * (201 - 255));  // interpolate white→#c9f28f
          g = Math.round(255 + t * (242 - 255));
          b = Math.round(255 + t * (143 - 255));
        } else {
          radius = 0.7;
          opacity = 0.22;
          r = 255; g = 255; b = 255;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent'  // body supplies the dark bg; canvas is dots only
      }}
    />
  );
}
