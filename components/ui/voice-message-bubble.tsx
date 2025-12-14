"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceMessageBubbleProps {
  audioSrc: string;
  duration: number; // in seconds
  bubbleColor?: string;
  waveColor?: string;
  className?: string;
}

export default function VoiceMessageBubble({
  audioSrc,
  duration,
  bubbleColor = "#fff",
  waveColor = "#000",
  className,
}: VoiceMessageBubbleProps) {
  const [audio] = React.useState(() => new Audio(audioSrc));
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.pause();
    };
  }, [audio]);

  const togglePlay = () => {
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl p-3 shadow-sm",
        className,
      )}
      style={{ backgroundColor: bubbleColor }}
    >
      <Button
        variant="outline"
        className="rounded-full p-2"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div
        className="relative h-6 flex-1 cursor-pointer"
        onClick={(e) => {
          const rect = (e.target as HTMLDivElement).getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (!audio.duration) return;
          audio.currentTime = (clickX / rect.width) * audio.duration;
        }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-0.5">
          {Array.from({ length: 30 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-sm"
              style={{
                width: 2,
                height: `${4 + Math.random() * 12}px`,
                backgroundColor: waveColor,
              }}
            />
          ))}
        </div>

        <div
          className="absolute left-0 top-0 h-full rounded-sm opacity-30"
          style={{
            width: `${progress}%`,
            backgroundColor: waveColor,
          }}
        />
      </div>

      <span
        className={cn(
          "text-sm font-mono",
          waveColor === "#fff" ? "text-white" : "text-black",
        )}
      >
        {duration}s
      </span>
    </div>
  );
}
