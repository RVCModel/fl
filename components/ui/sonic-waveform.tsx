"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SonicWaveformCanvasProps = {
  className?: string;
};

export function SonicWaveformCanvas({ className }: SonicWaveformCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const lineCount = 60;
      const segmentCount = 80;
      const baseY = canvas.height / 2;

      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();
        const progress = i / lineCount;
        const colorIntensity = Math.sin(progress * Math.PI);
        const strokeBase = isDark ? "90, 220, 210" : "90, 180, 200";
        const alpha = isDark ? colorIntensity * 0.22 + 0.08 : colorIntensity * 0.18 + 0.08;
        ctx.strokeStyle = `rgba(${strokeBase}, ${alpha})`;
        ctx.lineWidth = 1.5;

        for (let j = 0; j <= segmentCount; j++) {
          const x = (j / segmentCount) * canvas.width;
          const distToMouse = Math.hypot(x - mouse.x, baseY - mouse.y);
          const mouseEffect = Math.max(0, 1 - distToMouse / 400);

          const noise = Math.sin(j * 0.1 + time + i * 0.2) * 12;
          const spike =
            Math.cos(j * 0.2 + time + i * 0.1) * Math.sin(j * 0.05 + time) * 32;
          const y = baseY + noise + spike * (1 + mouseEffect * 2);

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      time += 0.02;
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    resizeCanvas();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={cn("absolute inset-0 z-0 h-full w-full", className)} />;
}

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2 + 0.5,
      duration: 0.8,
      ease: [0.42, 0, 0.58, 1],
    },
  }),
};

export default function SonicWaveformHero() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <SonicWaveformCanvas />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/30 to-transparent" />

      <div className="relative z-20 px-6 text-center">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 backdrop-blur-sm"
        >
          <BarChart2 className="h-4 w-4 text-teal-300" />
          <span className="text-sm font-medium text-gray-200">Real-Time Data Sonification</span>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-5xl font-bold tracking-tighter text-transparent md:text-7xl"
        >
          Sonic Waveform
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto mb-10 max-w-2xl text-lg text-gray-400"
        >
          Translate complex data streams into intuitive, interactive soundscapes. Hear the patterns, feel the insights.
        </motion.p>

        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
          <button className="mx-auto flex items-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-black shadow-lg transition-colors duration-300 hover:bg-gray-200">
            Analyze the Stream
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
