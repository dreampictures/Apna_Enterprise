import { useEffect, useRef } from "react";

const LOGICAL = 160;

function getISTDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  return new Date(utc + 5.5 * 60 * 60_000);
}

export default function AnalogClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function setup() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = LOGICAL * dpr;
      canvas!.height = LOGICAL * dpr;
      canvas!.style.width = `${LOGICAL}px`;
      canvas!.style.height = `${LOGICAL}px`;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const S = LOGICAL;
      const cx = S / 2;
      const cy = S / 2;
      const r = S / 2 - 4;

      ctx.clearRect(0, 0, S, S);

      const ist = getISTDate();
      const sec = ist.getSeconds();
      const min = ist.getMinutes();
      const hr = ist.getHours() % 12;

      const secA = (sec / 60) * 2 * Math.PI - Math.PI / 2;
      const minA = ((min + sec / 60) / 60) * 2 * Math.PI - Math.PI / 2;
      const hrA = ((hr + min / 60) / 12) * 2 * Math.PI - Math.PI / 2;

      // White outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Blue face
      const faceR = r - 6;
      const grad = ctx.createRadialGradient(cx, cy * 0.7, 2, cx, cy, faceR);
      grad.addColorStop(0, "#5AAFF0");
      grad.addColorStop(1, "#1E6DBF");
      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner ring hint
      ctx.beginPath();
      ctx.arc(cx, cy, faceR - 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Minute tick marks (skip hour positions)
      for (let i = 0; i < 60; i++) {
        if (i % 5 === 0) continue;
        const a = (i / 60) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx + (faceR - 4) * Math.cos(a), cy + (faceR - 4) * Math.sin(a));
        ctx.lineTo(cx + (faceR - 9) * Math.cos(a), cy + (faceR - 9) * Math.sin(a));
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Numbers 1-12
      const numR = faceR - 19;
      ctx.font = `bold ${S * 0.095}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      for (let i = 1; i <= 12; i++) {
        const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
        ctx.fillText(String(i), cx + numR * Math.cos(a), cy + numR * Math.sin(a));
      }

      // Hand helper — NO shadow (avoids blur)
      function hand(angle: number, len: number, width: number, tail = 0) {
        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(cx - tail * Math.cos(angle), cy - tail * Math.sin(angle));
        ctx!.lineTo(cx + len * Math.cos(angle), cy + len * Math.sin(angle));
        ctx!.strokeStyle = "#ffffff";
        ctx!.lineWidth = width;
        ctx!.lineCap = "round";
        ctx!.stroke();
        ctx!.restore();
      }

      hand(hrA, faceR * 0.44, 5, faceR * 0.10);
      hand(minA, faceR * 0.63, 3.5, faceR * 0.08);

      // Second hand (thin, slightly translucent)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - faceR * 0.15 * Math.cos(secA), cy - faceR * 0.15 * Math.sin(secA));
      ctx.lineTo(cx + faceR * 0.72 * Math.cos(secA), cy + faceR * 0.72 * Math.sin(secA));
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // Centre dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#1E6DBF";
      ctx.fill();
    }

    setup();
    draw();
    const id = setInterval(draw, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }}
      />
      <div
        className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        IST +5:30
      </div>
    </div>
  );
}
