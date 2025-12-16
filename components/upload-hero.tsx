"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/faq";
import { Play, SkipBack } from "lucide-react";
import { getValidAccessToken } from "@/lib/auth-client";

// --- 类型定义 ---
type Phase = "idle" | "uploading" | "processing" | "done" | "error";
type TrackKey = "inst" | "vocal";

// 轨道高度
const LANE_HEIGHT = 80;

// 配色方案: Vocal -> Purple, Music(Inst) -> Green
const TRACK_COLORS: Record<TrackKey, { bg: string; wave: string }> = {
  inst: { bg: "#2d6a4f", wave: "#74c69d" }, // Music (Green)
  vocal: { bg: "#3e426e", wave: "#a78bfa" }, // Vocal (Purple)
};

// --- 辅助函数 ---
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 10);
  return `0${mins}:${String(secs).padStart(2, "0")}.${ms}`;
}

// --- MixerSlider 组件 ---
function MixerSlider({
  value,
  onLiveChange,
  onCommit,
}: {
  value: number;
  onLiveChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activePathRef = useRef<SVGPolygonElement | null>(null);
  const thumbRef = useRef<SVGRectElement | null>(null);
  const valueRef = useRef<number>(value);

  const W = 40;
  const H = 20;
  const PAD_BOTTOM = 4;
  const H_LEFT = 3; 
  const H_RIGHT = 12;
  const Y_BOTTOM = H - PAD_BOTTOM; 
  const Y_TOP_LEFT = Y_BOTTOM - H_LEFT;
  const Y_TOP_RIGHT = Y_BOTTOM - H_RIGHT;

  const updateVisuals = (v: number) => {
    const x = (v / 100) * W;
    const yTopAtX = Y_TOP_LEFT + (Y_TOP_RIGHT - Y_TOP_LEFT) * (v / 100);

    activePathRef.current?.setAttribute(
      "points", 
      `0,${Y_BOTTOM} ${x},${Y_BOTTOM} ${x},${yTopAtX} 0,${Y_TOP_LEFT}`
    );

    const thumbH = 14;
    const thumbW = 5;
    const thumbY = (H - thumbH) / 2;
    const thumbX = clamp(x - thumbW / 2, 0, W - thumbW); 
    
    thumbRef.current?.setAttribute("x", String(thumbX));
    thumbRef.current?.setAttribute("y", String(thumbY));
  };

  useEffect(() => {
    valueRef.current = value;
    updateVisuals(value);
  }, [value]);

  const updateFromPointer = (clientX: number, commit: boolean) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const v = clamp((x / rect.width) * 100, 0, 100);
    
    valueRef.current = v;
    updateVisuals(v);
    onLiveChange(v);
    if (commit) onCommit(v);
  };

  return (
    <div
      ref={rootRef}
      className="relative h-8 w-14 touch-none select-none cursor-pointer flex items-center justify-center"
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromPointer(e.clientX, false);
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        updateFromPointer(e.clientX, false);
      }}
      onPointerUp={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit(valueRef.current);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
        <polygon 
          points={`0,${Y_BOTTOM} ${W},${Y_BOTTOM} ${W},${Y_TOP_RIGHT} 0,${Y_TOP_LEFT}`} 
          fill="#333333" 
        />
        <polygon 
          ref={activePathRef} 
          points={`0,${Y_BOTTOM} 0,${Y_BOTTOM} 0,${Y_TOP_LEFT} 0,${Y_TOP_LEFT}`} 
          fill="#a1a1aa" 
        />
        <rect 
          ref={thumbRef} 
          width="5" 
          height="14" 
          fill="#ffffff" 
          rx="1.5"
          className="shadow-sm" 
        />
      </svg>
    </div>
  );
}

// --- UploadHero 主组件 ---
export default function UploadHero({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: string;
}) {
  const labels = {
    music: locale === "en" ? "Music" : locale === "ja" ? "音楽" : "音乐",
    vocal: locale === "en" ? "Vocal" : locale === "ja" ? "ボーカル" : "人声",
    play: locale === "en" ? "Play" : locale === "ja" ? "再生" : "播放",
    replay: locale === "en" ? "Re-upload" : locale === "ja" ? "再アップロード" : "重新上传",
    format: locale === "en" ? "Format" : locale === "ja" ? "形式" : "格式",
    uploadingTitle: locale === "en" ? "Uploading…" : locale === "ja" ? "アップロード中…" : "上传中…",
    uploadingDesc:
      locale === "en"
        ? "Preparing your audio for processing."
        : locale === "ja"
          ? "処理の準備をしています。"
          : "正在准备音频并上传，请稍候。",
    processingTitle: locale === "en" ? "Audio processing…" : locale === "ja" ? "音声処理中…" : "音频处理中…",
    processingDesc:
      locale === "en"
        ? "AI is separating vocals and instrumental, this may take up to a minute. Please keep this page open."
        : locale === "ja"
          ? "AI がボーカルと伴奏を分離しています。1 分ほどかかる場合があります。このページを開いたままにしてください。"
          : "人工智能正在分离人声与伴奏，可能需要一分钟。请保持页面开启。",
  };

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [vocalsUrl, setVocalsUrl] = useState<string | null>(null);
  const [instUrl, setInstUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(80);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWave, setHasWave] = useState(false);
  const [hasInstWave, setHasInstWave] = useState(false);
  const [historyRecorded, setHistoryRecorded] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"mp3" | "wav">("mp3");
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);
  const notFoundStreakRef = useRef(0);
  const STORAGE_KEY = "vofl:demix-state";

  const instAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const instWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const instWaveSurferRef = useRef<WaveSurfer | null>(null);
  const rafRef = useRef<number | null>(null); // For animation loop

  const rawApiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const apiBase = (() => {
    const trimmed = String(rawApiBase).replace(/\/+$/, "");
    if (typeof window !== "undefined" && window.location.protocol === "https:" && trimmed.startsWith("http://")) {
      return `https://${trimmed.slice("http://".length)}`;
    }
    return trimmed;
  })();

  const normalizeBackendUrl = (raw?: string | null) => {
    if (!raw) return null;
    const value = String(raw);
    if (!value) return null;
    try {
      const base = new URL(apiBase);
      if (value.startsWith("/")) {
        return `${base.origin}${value}`;
      }
      const u = new URL(value);
      return `${base.origin}${u.pathname}${u.search}`;
    } catch {
      return value;
    }
  };

  async function safeJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  const formatTemplate = (tpl: string, vars: Record<string, string | number | undefined>) => {
    return tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
  };

  const getApiErrorMessage = (res: Response, data: any) => {
    const detail = data?.detail ?? data ?? {};
    const code = detail?.code;
    if (code === "FILE_TOO_LARGE") {
      return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: detail?.max_mb ?? 50 });
    }
    if (code === "DECODE_FAILED") return dictionary.errors.decodeFailed;
    if (code === "DURATION_TOO_SHORT") {
      return formatTemplate(dictionary.errors.durationTooShort, { min_seconds: detail?.min_seconds ?? 15 });
    }
    if (code === "DAILY_LIMIT_REACHED") {
      return formatTemplate(dictionary.errors.dailyLimitReached, { limit: detail?.limit ?? 10 });
    }
    if (code === "UNSUPPORTED_FILE_TYPE") return dictionary.errors.unsupportedFileType;
    if (res.status === 413) return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: 50 });
    return dictionary.errors.uploadFailed;
  };

  const isAbortError = (err: unknown) => {
    return err instanceof DOMException && err.name === "AbortError";
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getValidAccessToken();
      if (!token) {
        if (!cancelled) setSubscriptionActive(null);
        return;
      }
      try {
        const res = await fetch("/api/billing/status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await safeJson(res)) as any;
        if (!cancelled) {
          const active = !!data?.active;
          setSubscriptionActive(active);
          setDownloadFormat(active ? "wav" : "mp3");
        }
      } catch {
        if (!cancelled) setSubscriptionActive(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ... (State restoration logic kept same) ...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {
        taskId?: string;
        phase?: Phase;
        vocalsUrl?: string;
        instUrl?: string;
        position?: number;
        savedAt?: number;
        startedAt?: number;
      };
      const maxAgeMs = 12 * 60 * 60 * 1000;
      if (saved.savedAt && Date.now() - saved.savedAt > maxAgeMs) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (saved.taskId && saved.phase) {
        setTaskId(saved.taskId);
        setPhase(saved.phase);
        setVocalsUrl(normalizeBackendUrl(saved.vocalsUrl) || null);
        setInstUrl(normalizeBackendUrl(saved.instUrl) || null);
        setPosition(saved.position || 0);
        setProcessingStartedAt(typeof saved.startedAt === "number" ? saved.startedAt : saved.savedAt || null);
      }
    } catch (err) {
      console.error("restore state failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase === "processing" || phase === "done") {
      const payload = {
        taskId,
        phase,
        vocalsUrl,
        instUrl,
        position,
        startedAt: processingStartedAt ?? undefined,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [phase, taskId, vocalsUrl, instUrl, position, processingStartedAt]);

  // ... (Polling logic kept same) ...
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === "processing" && taskId) {
      notFoundStreakRef.current = 0;
      timer = setInterval(async () => {
        try {
          if (processingStartedAt && Date.now() - processingStartedAt > 20 * 60 * 1000) {
            setPhase("error");
            setMessage(dictionary.errors.processingTimeout);
            if (timer) clearInterval(timer);
            return;
          }
          const token = await getValidAccessToken();
          if (!token) {
            setPhase("error");
            setMessage(dictionary.errors.needLogin);
            clearInterval(timer!);
            return;
          }
          const res = await fetch(`${apiBase}/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 404) {
            notFoundStreakRef.current += 1;
            if (notFoundStreakRef.current < 3) return;
            setPhase("error");
            setMessage(dictionary.errors.taskNotFoundOrExpired);
            if (timer) clearInterval(timer);
            return;
          }
          if (!res.ok) {
            setPhase("error");
            setMessage(dictionary.errors.uploadFailed);
            if (timer) clearInterval(timer);
            return;
          }
          notFoundStreakRef.current = 0;
          const data = await safeJson(res);
          setPosition(data.position ?? 0);
          if (data.status === "completed") {
            setVocalsUrl(normalizeBackendUrl(data.vocals_url || data.vocalsUrl));
            setInstUrl(normalizeBackendUrl(data.instrumental_url || data.instrumentalUrl));
            setPhase("done");
            setMessage("");
            if (timer) clearInterval(timer);
            setHistoryRecorded(false);
            try {
              await fetch("/api/jobs", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  external_task_id: taskId,
                  source_url: `task:${taskId}`,
                  status: "completed",
                  model: "demix",
                  progress: 1,
                  result_url: data.vocals_url || data.vocalsUrl || null,
                }),
              });
            } catch (err) {
              if (!isAbortError(err)) console.error("update job failed", err);
            }
          } else if (data.status === "failed") {
            setPhase("error");
            setMessage(data.error || "处理失败");
            if (timer) clearInterval(timer);
            try {
              await fetch("/api/jobs", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  external_task_id: taskId,
                  source_url: `task:${taskId}`,
                  status: "failed",
                  model: "demix",
                  progress: 1,
                  result_url: null,
                }),
              });
            } catch (err) {
              if (!isAbortError(err)) console.error("update job failed", err);
            }
          }
        } catch (err) {
          if (!isAbortError(err)) {
            setPhase("error");
            setMessage("轮询失败，请稍后重试");
          }
          if (timer) clearInterval(timer);
        }
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, taskId, apiBase, processingStartedAt, dictionary.errors.needLogin, dictionary.errors.processingTimeout, dictionary.errors.taskNotFoundOrExpired, dictionary.errors.uploadFailed]);

  // --- WaveSurfer Initializations (流畅播放优化) ---

  // 1. Vocal Track
  useEffect(() => {
    if (phase !== "done" || !vocalWaveContainerRef.current || !vocalAudioRef.current || !vocalsUrl) return;
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
      waveSurferRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: vocalWaveContainerRef.current,
      backend: "MediaElement",
      media: vocalAudioRef.current,
      height: LANE_HEIGHT,
      waveColor: TRACK_COLORS.vocal.wave,
      progressColor: "rgba(255,255,255,0.4)",
      cursorColor: "#ffffff",
      cursorWidth: 0,
      
      barWidth: undefined,
      barGap: undefined,
      barRadius: undefined,
      
      normalize: true,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
      autoScroll: false,
    });

    ws.load(vocalsUrl);
    ws.setVolume(voiceVolume / 100);
    if (vocalAudioRef.current) vocalAudioRef.current.volume = voiceVolume / 100;

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setHasWave(true);
    });
    ws.on("finish", () => setIsPlaying(false));
    
    // **移除 audioprocess 事件中的 setCurrentTime**
    // 之前这里高频调用 setCurrentTime 导致 React 重渲染卡顿
    
    waveSurferRef.current = ws;
    return () => {
      ws.destroy();
      waveSurferRef.current = null;
      setHasWave(false);
    };
  }, [phase, vocalsUrl]);

  // 2. Inst Track
  useEffect(() => {
    if (phase !== "done" || !instWaveContainerRef.current || !instAudioRef.current || !instUrl) return;
    if (instWaveSurferRef.current) {
      instWaveSurferRef.current.destroy();
      instWaveSurferRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: instWaveContainerRef.current,
      backend: "MediaElement",
      media: instAudioRef.current,
      height: LANE_HEIGHT,
      waveColor: TRACK_COLORS.inst.wave,
      progressColor: "rgba(255,255,255,0.4)",
      cursorColor: "#ffffff",
      cursorWidth: 0,
      
      barWidth: undefined,
      barGap: undefined,
      barRadius: undefined,
      
      normalize: true,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
      autoScroll: false,
    });

    ws.load(instUrl);
    ws.setVolume(musicVolume / 100);
    if (instAudioRef.current) instAudioRef.current.volume = musicVolume / 100;

    ws.on("ready", () => setHasInstWave(true));
    ws.on("finish", () => setIsPlaying(false));
    
    instWaveSurferRef.current = ws;
    return () => {
      ws.destroy();
      instWaveSurferRef.current = null;
      setHasInstWave(false);
    };
  }, [phase, instUrl]);

  // Volume Sync
  useEffect(() => {
    if (instAudioRef.current) instAudioRef.current.volume = musicVolume / 100;
    if (instWaveSurferRef.current) instWaveSurferRef.current.setVolume(musicVolume / 100);
  }, [musicVolume]);

  useEffect(() => {
    if (vocalAudioRef.current) vocalAudioRef.current.volume = voiceVolume / 100;
    if (waveSurferRef.current) waveSurferRef.current.setVolume(voiceVolume / 100);
  }, [voiceVolume]);

  const setTrackVolumeLive = (track: TrackKey, v: number, commit: boolean) => {
    const value = clamp(Math.round(v), 0, 100);
    if (track === "vocal") {
      if (vocalAudioRef.current) vocalAudioRef.current.volume = value / 100;
      if (waveSurferRef.current) waveSurferRef.current.setVolume(value / 100);
      if (commit) setVoiceVolume(value);
      return;
    }
    if (instAudioRef.current) instAudioRef.current.volume = value / 100;
    if (instWaveSurferRef.current) instWaveSurferRef.current.setVolume(value / 100);
    if (commit) setMusicVolume(value);
  };

  const seekAll = (t: number) => {
    const time = clamp(t, 0, duration || 0);
    if (instAudioRef.current) instAudioRef.current.currentTime = time;
    if (vocalAudioRef.current) vocalAudioRef.current.currentTime = time;
    setCurrentTime(time); // Update UI timestamp once on seek
  };

  const togglePlay = () => {
    const inst = instAudioRef.current;
    const vocal = vocalAudioRef.current;
    if (!inst && !vocal) return;
    if (isPlaying) {
      inst?.pause();
      vocal?.pause();
      setIsPlaying(false);
    } else {
      const t = vocal?.currentTime || currentTime || 0;
      if (vocal) vocal.currentTime = t;
      if (inst) inst.currentTime = t;
      Promise.allSettled([vocal?.play(), inst?.play()]).then(() => setIsPlaying(true));
    }
  };

  const resetPlayhead = () => {
    seekAll(0);
  };

  // 优化后的播放进度循环：只在 requestAnimationFrame 中更新 UI 的时间戳，或者降低更新频率
  useEffect(() => {
    const loop = () => {
      const vocal = vocalAudioRef.current;
      if (vocal && !vocal.paused) {
        // 直接读取 currentTime，但不调用 setState 触发全量渲染
        // 这里如果是为了更新数字时间显示，每秒更新 10-20 次足够了，或者使用 ref 直接操作 DOM 文本节点
        // 简单方案：仍然 setState，但组件结构要轻量化。
        // 由于我们在 renderDone 中把布局变得很重，频繁 render 会卡顿。
        // 解决方案：使用 CSS 动画驱动进度条，或者独立出一个 TimeDisplay 组件使用 React.memo
        setCurrentTime(vocal.currentTime);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(loop);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    // Record history
    const record = async () => {
      if (phase !== "done" || !vocalsUrl || !instUrl || historyRecorded || !taskId) return;
      const token = await getValidAccessToken();
      if (!token) return;
      try {
        const res = await fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task_id: taskId,
            vocals_url: vocalsUrl,
            instrumental_url: instUrl,
            duration: duration || null,
          }),
        });
        await safeJson(res);
        setHistoryRecorded(true);
      } catch (err) {
        if (!isAbortError(err)) console.error("record history failed", err);
      }
    };
    record();
  }, [phase, vocalsUrl, instUrl, taskId, historyRecorded, duration]);

  const handleUpload = async (file: File) => {
    const token = await getValidAccessToken();
    if (!token) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    setPhase("uploading");
    setMessage("");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    // ... (upload logic kept same) ...
    try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${apiBase}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await safeJson(res);
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/${locale}/auth/login`);
            return;
          }
          throw new Error(getApiErrorMessage(res, data));
        }
        setTaskId(data.task_id);
        setPosition(data.position ?? 0);
        if (typeof data?.priority === "boolean") {
          setSubscriptionActive(data.priority);
          setDownloadFormat(data.priority ? "wav" : "mp3");
        }
        setProcessingStartedAt(Date.now());
        setPhase("processing");
        try {
          await fetch("/api/jobs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              external_task_id: data.task_id,
              source_url: file.name,
              status: "queued",
              model: "demix",
              progress: 0,
              result_url: null,
            }),
          });
        } catch (err) {
          if (!isAbortError(err)) console.error("record job failed", err);
        }
      } catch (err: any) {
        if (!isAbortError(err)) {
          setPhase("error");
          setMessage(err.message || dictionary.errors.uploadFailed);
        }
      }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDownload = async (url: string | null, name: string) => {
    if (!url || !taskId) return;
    try {
      const token = await getValidAccessToken();
      if (!token) {
        router.push(`/${locale}/auth/login`);
        return;
      }
      const isSubscribed = subscriptionActive === true;
      const fmt: "mp3" | "wav" = isSubscribed ? downloadFormat : "mp3";
      if (!isSubscribed && fmt === "wav") {
        setMessage(dictionary.errors.wavDownloadRequiresSubscription);
        router.push(`/${locale}/billing`);
        return;
      }
      const stem = name.includes("instrumental") ? "instrumental" : "vocals";
      const res = await fetch(`${apiBase}/download/${taskId}/${stem}?format=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await safeJson(res);
        const detail = data?.detail ?? data ?? {};
        if (detail?.code === "WAV_REQUIRES_SUBSCRIPTION") {
          setMessage(dictionary.errors.wavDownloadRequiresSubscription);
          router.push(`/${locale}/billing`);
          return;
        }
        throw new Error(dictionary.errors.uploadFailed);
      }
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      const baseName = name.replace(/\.(wav|mp3)$/i, "");
      a.download = `${baseName}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("download failed", err);
    }
  };

  const renderDone = () => {
    // 进度百分比，用于定位 Playhead
    // 使用 duration 作为分母，如果 duration 为 0 防止除零
    const playheadPercent = duration ? Math.min(1, currentTime / duration) : 0;

    const tracks: {
      key: TrackKey;
      label: string;
      volume: number;
      waveContainerRef: React.RefObject<HTMLDivElement | null>;
      waveOpacity: boolean;
    }[] = [
      { 
        key: "inst", 
        label: labels.music, 
        volume: musicVolume, 
        waveContainerRef: instWaveContainerRef,
        waveOpacity: hasInstWave
      },
      { 
        key: "vocal", 
        label: labels.vocal, 
        volume: voiceVolume, 
        waveContainerRef: vocalWaveContainerRef,
        waveOpacity: hasWave
      }
    ];

    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] text-foreground">
        <audio ref={instAudioRef} src={instUrl || undefined} />
        <audio ref={vocalAudioRef} src={vocalsUrl || undefined} />
        
        <main className="flex w-full flex-1 flex-col items-center justify-center px-2 pb-44 pt-12 sm:px-4 sm:pb-32 sm:pt-14">
          <div className="w-full max-w-[1600px] overflow-x-auto overflow-y-hidden shadow-2xl shadow-black/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-hidden">
            <div className="flex min-w-[880px] flex-col sm:min-w-0">
              {tracks.map((track, index) => {
                const colors = TRACK_COLORS[track.key];
                const isLast = index === tracks.length - 1;

                return (
                  <div key={track.key} className="flex w-full" style={{ height: LANE_HEIGHT }}>
                    {/* Left: Control Panel */}
                    <div 
                      className="w-32 shrink-0 border-b border-black/20 px-3 sm:w-48 sm:px-4 flex items-center justify-between gap-2"
                      style={{ backgroundColor: '#18181b', borderRight: '1px solid #333' }}
                    >
                      <span className="min-w-0 truncate text-xs font-medium tracking-wide text-gray-300 sm:text-sm">
                        {track.label}
                      </span>
                      <MixerSlider
                        value={track.volume}
                        onLiveChange={(v) => setTrackVolumeLive(track.key, v, false)}
                        onCommit={(v) => setTrackVolumeLive(track.key, v, true)}
                      />
                    </div>

                    {/* Right: Waveform */}
                    <div 
                      className="relative flex-1 cursor-pointer"
                      style={{ backgroundColor: colors.bg }}
                      onPointerDown={(e) => {
                        if (!duration) return;
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        const x = clamp(e.clientX - rect.left, 0, rect.width);
                        seekAll((x / rect.width) * duration);
                      }}
                    >
                      <div 
                        ref={track.waveContainerRef} 
                        className="absolute inset-0" 
                        style={{ opacity: track.waveOpacity ? 1 : 0 }} 
                      />
                      
                      {/* Playhead Line */}
                      <div
                        className="pointer-events-none absolute top-0 bottom-0 w-[1px] bg-white z-10"
                        style={{ left: `${playheadPercent * 100}%` }}
                      />
                      
                      {/* Timestamp (only on last track) */}
                      {isLast && (
                        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60 z-20">
                           {formatTime(currentTime)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center gap-3 border-t border-border bg-[#17171e] px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:h-[90px] sm:flex-row sm:justify-between sm:gap-0 sm:px-6 sm:py-0">
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={togglePlay}
            >
              <Play className="h-4 w-4" />
              {isPlaying ? (locale === "en" ? "Pause" : locale === "ja" ? "一時停止" : "暂停") : labels.play}
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              onClick={resetPlayhead}
            >
              <SkipBack className="h-4 w-4" />
            </button>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-black/10 px-2 py-1 text-sm text-foreground">
              <span className="px-2 text-muted-foreground">{labels.format}</span>
              <button
                className={
                  "rounded-full px-3 py-1 transition-colors " +
                  ((subscriptionActive !== true || downloadFormat === "mp3")
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5")
                }
                onClick={() => setDownloadFormat("mp3")}
              >
                {dictionary.errors.mp3}
              </button>
              {subscriptionActive !== true ? (
                <HoverCard openDelay={150}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      aria-disabled="true"
                      className="cursor-not-allowed rounded-full px-3 py-1 text-slate-400"
                      onClick={() => {
                        setMessage(dictionary.errors.wavDownloadRequiresSubscription);
                        router.push(`/${locale}/billing`);
                      }}
                    >
                      {dictionary.errors.wav}
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent align="end" className="w-72">
                    <div className="text-sm text-foreground">
                      {dictionary.errors.wavDownloadRequiresSubscription}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <button
                  type="button"
                  className={
                    "rounded-full px-3 py-1 transition-colors " +
                    (downloadFormat === "wav"
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5")
                  }
                  onClick={() => setDownloadFormat("wav")}
                >
                  {dictionary.errors.wav}
                </button>
              )}
            </div>
            <Button
              className="rounded-full px-3 sm:px-4"
              variant="secondary"
              onClick={() => handleDownload(instUrl, "instrumental.wav")}
              disabled={!instUrl}
            >
              {locale === "en" ? "Download Inst" : locale === "ja" ? "伴奏をダウンロード" : "下载伴奏"}
            </Button>
            <Button
              className="rounded-full px-3 sm:px-4"
              variant="secondary"
              onClick={() => handleDownload(vocalsUrl, "vocals.wav")}
              disabled={!vocalsUrl}
            >
              {locale === "en" ? "Download Vocal" : locale === "ja" ? "人声をダウンロード" : "下载人声"}
            </Button>
            <Button className="rounded-full px-4 sm:px-6" variant="outline" onClick={() => setPhase("idle")}>
              {labels.replay}
            </Button>
          </div>
        </footer>
      </div>
    );
  };

  // ... (其他 Phase 的渲染保持不变)
  const renderIdle = () => {
    // ... (保持原样)
    const heroCopy = {
      tag: locale === "en" ? "How it works" : locale === "ja" ? "動作モード" : "工作方式",
      title: locale === "en" ? "Remove vocals and isolate" : locale === "ja" ? "ボーカルを分離して抽出" : "移除人声并隔离",
      subtitle: locale === "en" ? "Separate vocals from music with powerful AI." : locale === "ja" ? "強力なAIで音楽から声を分離します。" : "用强大的人工智能算法将声音从音乐中分离出来",
      imageAlt: locale === "en" ? "Audio splitter interface showing music and vocal waveforms" : locale === "ja" ? "音楽とボーカルの波形を表示する分離プレーヤー" : "音频分离播放器界面 - 显示音乐和人声波形",
      button: dictionary.home.uploadCta,
    };
    const playerImageSrc = locale === "en" ? "/remover/player_en.png" : locale === "ja" ? "/remover/player_ja.png" : "/remover/player_zh.png";
    return (
      <>
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#17171e] px-4 py-20 text-white">
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <span className="mb-6 text-sm font-medium tracking-wide text-indigo-300">{heroCopy.tag}</span>
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{heroCopy.title}</h1>
            <p className="mb-12 max-w-2xl text-lg text-slate-300 md:text-xl">{heroCopy.subtitle}</p>
            <div className="mb-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
              <img src={playerImageSrc} alt={heroCopy.imageAlt} className="w-full" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onSelectFile} />
              <Button size="lg" className="rounded-full bg-indigo-600 px-8 py-6 text-base font-medium text-white hover:bg-indigo-700" onClick={() => fileInputRef.current?.click()}>{heroCopy.button}</Button>
              {message && (
                <Alert variant="destructive" className="w-full max-w-3xl">
                  <AlertDescription className="text-foreground">{message}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </section>
        <section className="bg-[#17171e] text-white">
          <Faq title={dictionary.faq.title} items={dictionary.faq.demix} />
        </section>
      </>
    );
  };

  const renderProcessing = () => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#17171e] px-6 text-center text-foreground">
      <div className="relative flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/30 px-10 py-12 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white shadow-lg">♫</div>
        <h2 className="text-3xl font-bold">{phase === "uploading" ? labels.uploadingTitle : labels.processingTitle}</h2>
        <p className="text-base text-muted-foreground">{phase === "uploading" ? labels.uploadingDesc : labels.processingDesc}</p>
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_1.6s_ease_in_out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        </div>
      </div>
    </div>
  );

  if (phase === "uploading" || phase === "processing") return renderProcessing();
  if (phase === "done") return renderDone();
  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-foreground">
        <Alert variant="destructive" className="mb-4 w-full max-w-xl">
          <AlertDescription className="text-foreground">{message || dictionary.errors.unknown}</AlertDescription>
        </Alert>
        <Button onClick={() => setPhase("idle")}>返回重新上传</Button>
      </div>
    );
  }
  return renderIdle();
}
