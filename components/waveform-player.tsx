"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type WaveformPlayerProps = {
  url: string;
  label: string;
  waveColor?: string;
  progressColor?: string;
  height?: number;
  className?: string;
  showControls?: boolean;
  showHeader?: boolean;
};

export default function WaveformPlayer({
  url,
  label,
  waveColor = "#6b7280",
  progressColor = "#6366f1",
  height = 80,
  className = "",
  showControls = true,
  showHeader = true,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [duration, setDuration] = useState<string>("00:00");
  const [current, setCurrent] = useState<string>("00:00");

  useEffect(() => {
    if (!containerRef.current) return;
    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      height,
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 1,
      cursorColor: "#fff",
      normalize: true,
    });
    const isAbortError = (err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return true;
      if (err && typeof err === "object" && "name" in err && (err as any).name === "AbortError") return true;
      return false;
    };
    try {
      const ret = (wavesurferRef.current as any).load(url);
      if (ret && typeof ret.then === "function") {
        ret.catch((err: unknown) => {
          if (!isAbortError(err)) console.error("wavesurfer load failed", err);
        });
      }
    } catch (err) {
      if (!isAbortError(err)) console.error("wavesurfer load failed", err);
    }
    wavesurferRef.current.on("ready", () => {
      const dur = wavesurferRef.current?.getDuration() || 0;
      setDuration(formatTime(dur));
    });
    wavesurferRef.current.on("audioprocess", (t: number) => {
      setCurrent(formatTime(t));
    });
    wavesurferRef.current.on("interaction", (progress: number) => {
      const dur = wavesurferRef.current?.getDuration() || 0;
      setCurrent(formatTime(progress * dur));
    });
    return () => {
      wavesurferRef.current?.destroy();
      wavesurferRef.current = null;
    };
  }, [url, waveColor, progressColor, height]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span>
            {current} / {duration}
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
      {showControls && (
        <div className="mt-2">
          <button
            onClick={togglePlay}
            className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-foreground hover:bg-white/20"
          >
            播放 / 暂停
          </button>
        </div>
      )}
    </div>
  );
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
