"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/faq";
import { Play, SkipBack } from "lucide-react";
import { getValidAccessToken } from "@/lib/auth-client";

type Phase = "idle" | "uploading" | "processing" | "done" | "error";
type TrackKey = "residual" | "dry";

// 保持高度一致
const LANE_HEIGHT = 80;

// 颜色配置
const TRACK_COLORS: Record<TrackKey, { bg: string; wave: string }> = {
  residual: { bg: "#2d6a4f", wave: "#74c69d" }, // Residual (Green)
  dry: { bg: "#3e426e", wave: "#a78bfa" },      // Dry (Purple)
};

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

// --- DereverbHero 主组件 ---
export default function DereverbHero({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: string;
}) {
  const labels = {
    dry: locale === "en" ? "Dry" : locale === "ja" ? "ドライ" : "干声",
    wet: locale === "en" ? "Residual" : locale === "ja" ? "残響" : "残余",
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
    processingTitle:
      locale === "en" ? "Reverb reduction…" : locale === "ja" ? "リバーブ処理中…" : "去混响处理中…",
    processingDesc:
      locale === "en"
        ? "AI is reducing room reverb and tails. Please keep this page open."
        : locale === "ja"
        ? "AI が残響を低減しています。このままページを開いてお待ちください。"
        : "AI 正在降低房间混响与尾音，请保持页面开启。",
  };

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);

  const [dryUrl, setDryUrl] = useState<string | null>(null);
  const [residualUrl, setResidualUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [residualVolume, setResidualVolume] = useState(0);
  const [dryVolume, setDryVolume] = useState(80);

  // currentTime 仍然用于初始渲染和 seek，但播放动画由 ref 控制
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [hasDryWave, setHasDryWave] = useState(false);
  const [hasResidualWave, setHasResidualWave] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"mp3" | "wav">("mp3");
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);

  const notFoundStreakRef = useRef(0);
  const STORAGE_KEY = "vofl:dereverb-state";

  const isAbortError = (err: unknown) => {
    if (err instanceof DOMException && (err.name === "AbortError" || err.name === "NotAllowedError")) return true;
    if (err && typeof err === "object" && "name" in err) {
      const name = (err as any).name;
      if (name === "AbortError" || name === "NotAllowedError") return true;
    }
    return false;
  };

  const residualAudioRef = useRef<HTMLAudioElement | null>(null);
  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const dryWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const dryWaveSurferRef = useRef<WaveSurfer | null>(null);
  const residualWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const residualWaveSurferRef = useRef<WaveSurfer | null>(null);

  // === 动画相关的 Refs ===
  const playheadRefs = useRef<(HTMLDivElement | null)[]>([]); // 存储所有轨道播放头的 ref
  const timeDisplayRef = useRef<HTMLDivElement | null>(null); // 存储时间显示的 ref
  const rafRef = useRef<number | null>(null); // requestAnimationFrame ID

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
      return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: detail?.max_mb ?? 200 });
    }
    if (code === "DECODE_FAILED") return dictionary.errors.decodeFailed;
    if (code === "DURATION_TOO_SHORT") {
      return formatTemplate(dictionary.errors.durationTooShort, { min_seconds: detail?.min_seconds ?? 15 });
    }
    if (code === "DAILY_LIMIT_REACHED") {
      return formatTemplate(dictionary.errors.dailyLimitReached, { limit: detail?.limit ?? 10 });
    }
    if (code === "UNSUPPORTED_FILE_TYPE") return dictionary.errors.unsupportedFileType;
    if (res.status === 413) return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: 200 });
    return dictionary.errors.uploadFailed;
  };

  // ... (Billing Check useEffect - unchanged)
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

  // ... (LocalStorage restore - unchanged)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as any;
      const maxAgeMs = 12 * 60 * 60 * 1000;
      if (saved.savedAt && Date.now() - saved.savedAt > maxAgeMs) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      if (saved.taskId && saved.phase) {
        setTaskId(saved.taskId);
        setPhase(saved.phase);
        setDryUrl(normalizeBackendUrl(saved.dryUrl) || null);
        setResidualUrl(normalizeBackendUrl(saved.residualUrl) || null);
        setPosition(saved.position || 0);
        setEtaSeconds(typeof saved.etaSeconds === "number" ? saved.etaSeconds : 0);
        setProcessingStartedAt(typeof saved.startedAt === "number" ? saved.startedAt : saved.savedAt || null);
      }
    } catch (err) {
      console.error("restore dereverb state failed", err);
    }
  }, []);

  // ... (LocalStorage save - unchanged)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase === "processing" || phase === "done") {
      const payload = {
        taskId,
        phase,
        dryUrl,
        residualUrl,
        position,
        etaSeconds,
        startedAt: processingStartedAt ?? undefined,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [phase, taskId, dryUrl, residualUrl, position, etaSeconds, processingStartedAt]);

  useEffect(() => {
    if (phase !== "processing") setEtaSeconds(0);
  }, [phase]);

  // ... (Polling Logic - unchanged)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === "processing" && taskId) {
      notFoundStreakRef.current = 0;
      timer = setInterval(async () => {
        try {
            // ... (省略部分未变代码，保持原样) ...
            // 完整轮询逻辑，为了简洁这里不重复粘贴，保持和你原代码一致即可
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
            const res = await fetch(`${apiBase}/dereverb/tasks/${taskId}`, {
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
             setEtaSeconds(typeof data.eta_seconds === "number" ? data.eta_seconds : 0);
             if (data.status === "completed") {
               setDryUrl(normalizeBackendUrl(data.dereverb_url || data.dereverbUrl));
               setResidualUrl(normalizeBackendUrl(data.reverb_url || data.reverbUrl));
               setPhase("done");
               setMessage("");
               setEtaSeconds(0);
               if (timer) clearInterval(timer);
               // job update logic...
               try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ external_task_id: taskId, source_url: `task:${taskId}`, status: "completed", model: "dereverb", progress: 1, result_url: data.dereverb_url || data.dereverbUrl || null }) }); } catch {}
             } else if (data.status === "failed") {
               setPhase("error");
               setMessage(data.error || "处理失败");
               setEtaSeconds(0);
               if (timer) clearInterval(timer);
               // job update logic...
               try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ external_task_id: taskId, source_url: `task:${taskId}`, status: "failed", model: "dereverb", progress: 1, result_url: null }) }); } catch {}
             }
        } catch (err) {
           // ...
        }
      }, 2000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, taskId, apiBase, processingStartedAt, dictionary.errors]);

  // --- WaveSurfer Initializations ---
  // (WaveSurfer 逻辑保持不变，除了去掉不必要的 on('process') 监听)

  // 1. Dry Track
  useEffect(() => {
    if (phase !== "done" || !dryWaveContainerRef.current || !dryAudioRef.current || !dryUrl) return;
    if (dryWaveSurferRef.current) {
      dryWaveSurferRef.current.destroy();
      dryWaveSurferRef.current = null;
    }

    const ws = WaveSurfer.create({
      container: dryWaveContainerRef.current,
      backend: "MediaElement",
      media: dryAudioRef.current,
      height: LANE_HEIGHT,
      waveColor: TRACK_COLORS.dry.wave,
      progressColor: "rgba(255,255,255,0.4)",
      cursorColor: "#ffffff",
      cursorWidth: 0,
      normalize: false,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
      autoScroll: false,
    });
    try {
      const ret = (ws as any).load(dryUrl);
      if (ret && typeof ret.then === "function") {
        ret.catch((err: unknown) => {
          if (!isAbortError(err)) console.error("wavesurfer load failed", err);
        });
      }
    } catch (err) {
      if (!isAbortError(err)) console.error("wavesurfer load failed", err);
    }
    ws.setVolume(dryVolume / 100);
    if (dryAudioRef.current) dryAudioRef.current.volume = dryVolume / 100;

    ws.on("ready", () => setHasDryWave(true));
    ws.on("finish", () => setIsPlaying(false));
    dryWaveSurferRef.current = ws;
    return () => {
      ws.destroy();
      dryWaveSurferRef.current = null;
      setHasDryWave(false);
    };
  }, [phase, dryUrl]);

  // 2. Residual Track
  useEffect(() => {
    if (phase !== "done" || !residualWaveContainerRef.current || !residualAudioRef.current || !residualUrl) return;
    if (residualWaveSurferRef.current) {
      residualWaveSurferRef.current.destroy();
      residualWaveSurferRef.current = null;
    }
    const ws = WaveSurfer.create({
      container: residualWaveContainerRef.current,
      backend: "MediaElement",
      media: residualAudioRef.current,
      height: LANE_HEIGHT,
      waveColor: TRACK_COLORS.residual.wave,
      progressColor: "rgba(255,255,255,0.4)",
      cursorColor: "#ffffff",
      cursorWidth: 0,
      normalize: false,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
      autoScroll: false,
    });
    try {
      const ret = (ws as any).load(residualUrl);
      if (ret && typeof ret.then === "function") {
        ret.catch((err: unknown) => {
          if (!isAbortError(err)) console.error("wavesurfer load failed", err);
        });
      }
    } catch (err) {
      if (!isAbortError(err)) console.error("wavesurfer load failed", err);
    }
    ws.setVolume(residualVolume / 100);
    if (residualAudioRef.current) residualAudioRef.current.volume = residualVolume / 100;
    ws.on("ready", () => setHasResidualWave(true));
    ws.on("finish", () => setIsPlaying(false));
    residualWaveSurferRef.current = ws;
    return () => {
      ws.destroy();
      residualWaveSurferRef.current = null;
      setHasResidualWave(false);
    };
  }, [phase, residualUrl]);

  // Sync Volumes - unchanged
  useEffect(() => {
    if (residualAudioRef.current) residualAudioRef.current.volume = residualVolume / 100;
    if (residualWaveSurferRef.current) residualWaveSurferRef.current.setVolume(residualVolume / 100);
  }, [residualVolume]);

  useEffect(() => {
    if (dryAudioRef.current) dryAudioRef.current.volume = dryVolume / 100;
    if (dryWaveSurferRef.current) dryWaveSurferRef.current.setVolume(dryVolume / 100);
  }, [dryVolume]);

  const setTrackVolumeLive = (track: TrackKey, v: number, commit: boolean) => {
    const value = clamp(Math.round(v), 0, 100);
    if (track === "dry") {
      if (dryAudioRef.current) dryAudioRef.current.volume = value / 100;
      if (dryWaveSurferRef.current) dryWaveSurferRef.current.setVolume(value / 100);
      if (commit) setDryVolume(value);
      return;
    }
    if (residualAudioRef.current) residualAudioRef.current.volume = value / 100;
    if (residualWaveSurferRef.current) residualWaveSurferRef.current.setVolume(value / 100);
    if (commit) setResidualVolume(value);
  };

  // === 关键修改：同步可视化逻辑 ===
  const syncVisuals = () => {
    const audio = dryAudioRef.current;
    if (!audio) return;

    const t = audio.currentTime;
    const d = Number.isFinite(audio.duration) ? audio.duration : 0;
    const percent = d > 0 ? (t / d) * 100 : 0;

    // 1. 直接操作 DOM 更新进度条位置 (高性能)
    playheadRefs.current.forEach((ref) => {
      if (ref) {
        ref.style.left = `${percent}%`;
      }
    });

    // 2. 直接操作 DOM 更新时间文字
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = formatTime(t);
    }
  };

  const seekAll = (t: number) => {
    const time = clamp(t, 0, duration || 0);
    if (dryAudioRef.current) dryAudioRef.current.currentTime = time;
    if (residualAudioRef.current) residualAudioRef.current.currentTime = time;
    
    setCurrentTime(time); // 更新 State 保持同步
    syncVisuals(); // 手动调用一次更新视觉，保证拖拽时响应即时
  };

  // === 关键修改：播放控制与循环 ===
  useEffect(() => {
    if (phase !== "done") return;
    const dry = dryAudioRef.current;
    const residual = residualAudioRef.current;
    if (!dry) return;

    // rAF 循环函数
    const tick = () => {
      syncVisuals();
      if (!dry.paused) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPause = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // 暂停时同步一次 State，确保 React 状态正确
      setCurrentTime(dry.currentTime);
      syncVisuals();
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setCurrentTime(0);
      syncVisuals();
    };

    const onMeta = () => setDuration(Number.isFinite(dry.duration) ? dry.duration : 0);

    // 监听器
    dry.addEventListener("play", onPlay);
    dry.addEventListener("pause", onPause);
    dry.addEventListener("ended", onEnded);
    dry.addEventListener("loadedmetadata", onMeta);
    
    // timeupdate 现在只作为后备更新，或者完全移除它的 state 更新功能以避免冲突
    // 这里我们保留它，但只更新 Duration 相关的，不更新 CurrentTime State
    // 或者完全移除对 currentTime 的 state 绑定，除非你其他地方非常需要它
    
    residual?.addEventListener("ended", onEnded);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      dry.removeEventListener("play", onPlay);
      dry.removeEventListener("pause", onPause);
      dry.removeEventListener("ended", onEnded);
      dry.removeEventListener("loadedmetadata", onMeta);
      residual?.removeEventListener("ended", onEnded);
    };
  }, [phase]); // 移除 [phase] 以外的依赖，防止频繁重绑定

  const togglePlay = () => {
    const residual = residualAudioRef.current;
    const dry = dryAudioRef.current;
    if (!residual && !dry) return;

    if (isPlaying) {
      residual?.pause();
      dry?.pause();
      setIsPlaying(false);
    } else {
      // 对齐时间后播放
      const t = dry?.currentTime || 0;
      if (dry && Math.abs((dry.currentTime || 0) - t) > 0.1) dry.currentTime = t;
      if (residual && Math.abs((residual.currentTime || 0) - t) > 0.1) residual.currentTime = t;
      
      Promise.allSettled([dry?.play(), residual?.play()]).catch(console.error);
    }
  };

  const resetPlayhead = () => {
    seekAll(0);
  };

  // ... (Upload and file handlers - unchanged)
  const handleUpload = async (file: File) => {
    // ... 原有逻辑 ...
    const token = await getValidAccessToken();
    if (!token) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    setPhase("uploading");
    setMessage("");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiBase}/dereverb/upload`, {
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
      setEtaSeconds(typeof data.eta_seconds === "number" ? data.eta_seconds : 0);
      if (typeof data?.priority === "boolean") {
        setSubscriptionActive(data.priority);
        setDownloadFormat(data.priority ? "wav" : "mp3");
      }
      setProcessingStartedAt(Date.now());
      setPhase("processing");
      try {
        await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ external_task_id: data.task_id, source_url: file.name, status: "queued", model: "dereverb", progress: 0, result_url: null }),
        });
      } catch (err) { if (!isAbortError(err)) console.error("record job failed", err); }
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

  const resetToIdle = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    residualAudioRef.current?.pause();
    dryAudioRef.current?.pause();
    setIsPlaying(false);
    residualWaveSurferRef.current?.destroy();
    residualWaveSurferRef.current = null;
    dryWaveSurferRef.current?.destroy();
    dryWaveSurferRef.current = null;
    setHasResidualWave(false);
    setHasDryWave(false);
    setTaskId(null);
    setPosition(0);
    setEtaSeconds(0);
    setResidualUrl(null);
    setDryUrl(null);
    setProcessingStartedAt(null);
    setMessage("");
    setCurrentTime(0);
    setDuration(0);
    setResidualVolume(0);
    setDryVolume(60);
    setPhase("idle");
  };

  // ... (handleDownload - unchanged)
  const handleDownload = async (url: string | null, name: string) => {
      // ... 原有逻辑 ...
      if (!url || !taskId) return;
      try {
        const token = await getValidAccessToken();
        if (!token) { router.push(`/${locale}/auth/login`); return; }
        const isSubscribed = subscriptionActive === true;
        const fmt: "mp3" | "wav" = isSubscribed ? downloadFormat : "mp3";
        if (!isSubscribed && fmt === "wav") { setMessage(dictionary.errors.wavDownloadRequiresSubscription); router.push(`/${locale}/billing`); return; }
        const stem = name.includes("residual") ? "reverb" : "dereverb";
        const res = await fetch(`${apiBase}/dereverb/download/${taskId}/${stem}?format=${fmt}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
           const data = await safeJson(res);
           const detail = data?.detail ?? data ?? {};
           if (detail?.code === "WAV_REQUIRES_SUBSCRIPTION") { setMessage(dictionary.errors.wavDownloadRequiresSubscription); router.push(`/${locale}/billing`); return; }
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
      } catch (err) { console.error("download failed", err); }
  };

  // ... (renderIdle, renderProcessing - unchanged)
  const renderIdle = () => {
      // ... 保持原样 ...
      const playerImageSrc = locale === "en" ? "/remover/player_en.png" : locale === "ja" ? "/remover/player_ja.png" : "/remover/player_zh.png";
      return (
        <>
          <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#17171e] px-4 py-20 text-white">
            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
              <span className="mb-6 text-sm font-medium tracking-wide text-indigo-300">
                {locale === "en" ? "How it works" : locale === "ja" ? "動作モード" : "工作方式"}
              </span>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {locale === "en" ? "Remove reverb and tails" : locale === "ja" ? "リバーブを低減" : "去混响（降低尾音）"}
              </h1>
              <p className="mb-12 max-w-2xl text-lg text-slate-300 md:text-xl">
                {locale === "en"
                  ? "Reduce room reverb while keeping the dry signal clear."
                  : locale === "ja"
                    ? "残響を低減し、ドライな音を保ちます。"
                    : "降低房间混响与尾音，保留更清晰的干声。"}
              </p>
              <div className="mb-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
                <img src={playerImageSrc} alt="dereverb preview" className="w-full" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onSelectFile} />
                <Button
                  size="lg"
                  className="rounded-full bg-indigo-600 px-8 py-6 text-base font-medium text-white hover:bg-indigo-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {dictionary.home.uploadCta}
                </Button>
                {message && (
                  <Alert variant="destructive" className="w-full max-w-3xl">
                    <AlertDescription className="text-foreground">{message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </section>
          <section className="bg-[#17171e] text-white">
            <Faq title={dictionary.faq.title} items={(dictionary.faq as any).dereverb || dictionary.faq.demix} />
          </section>
        </>
      );
  };

  const renderProcessing = () => (
     // ... 保持原样 ...
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#17171e] px-6 text-center text-foreground">
      <div className="relative flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/30 px-10 py-12 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white shadow-lg">?</div>
        <h2 className="text-3xl font-bold">{phase === "uploading" ? labels.uploadingTitle : labels.processingTitle}</h2>
        <p className="text-base text-muted-foreground">
          {phase === "uploading" ? (
            labels.uploadingDesc
          ) : (
            <>
              {labels.processingDesc}
              {position > 0 ? (
                locale === "en" ? (
                  <> Ahead in queue: {position}.</>
                ) : locale === "ja" ? (
                  <> 前方待ち人数: {position}。</>
                ) : (
                  <> 前方排队人数：{position}。</>
                )
              ) : null}
              {etaSeconds > 0 ? (
                locale === "en" ? (
                  <> Est. wait: {Math.max(0, Math.round(etaSeconds))}s.</>
                ) : locale === "ja" ? (
                  <> 予想到着: {Math.max(0, Math.round(etaSeconds))} 秒。</>
                ) : (
                  <> 预计等待：{Math.max(0, Math.round(etaSeconds))} 秒。</>
                )
              ) : null}
              {subscriptionActive !== true ? (
                <>
                  {" "}
                  {locale === "en" ? (
                    <>
                      <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                        Subscribe
                      </Link>{" "}
                      to skip the queue.
                    </>
                  ) : locale === "ja" ? (
                    <>
                      <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                        サブスク
                      </Link>
                      で待ち時間なし。
                    </>
                  ) : (
                    <>
                      <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                        订阅
                      </Link>
                      会员免除排队。
                    </>
                  )}
                </>
              ) : null}
            </>
          )}
        </p>
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_1.6s_ease_in_out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        </div>
      </div>
    </div>
  );

  const renderDone = () => {
    const playheadPercent = duration ? Math.min(1, currentTime / duration) : 0;
    
    // 初始化 refs 数组
    playheadRefs.current = [];

    const tracks: {
      key: TrackKey;
      label: string;
      volume: number;
      waveContainerRef: React.RefObject<HTMLDivElement | null>;
      waveOpacity: boolean;
    }[] = [
      { 
        key: "residual", 
        label: labels.wet, 
        volume: residualVolume, 
        waveContainerRef: residualWaveContainerRef,
        waveOpacity: hasResidualWave
      },
      { 
        key: "dry", 
        label: labels.dry, 
        volume: dryVolume, 
        waveContainerRef: dryWaveContainerRef,
        waveOpacity: hasDryWave
      }
    ];

    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] text-foreground">
        <audio ref={residualAudioRef} src={residualUrl || undefined} />
        <audio ref={dryAudioRef} src={dryUrl || undefined} />

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
                        // 绑定 Ref，方便直接操作 DOM
                        ref={(el) => { playheadRefs.current[index] = el; }}
                        className="pointer-events-none absolute top-0 bottom-0 w-[1px] bg-white z-10"
                        // 初始样式（SSR 或暂停时）使用 state，播放时会被 Ref 覆盖
                        style={{ left: `${playheadPercent * 100}%` }}
                      />
                      
                      {/* Timestamp (only on last track) */}
                      {isLast && (
                        <div 
                           ref={timeDisplayRef}
                           className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60 z-20"
                        >
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
        
        {/* Footer */}
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
          {/* ... (Format buttons - unchanged) */}
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-black/10 px-2 py-1 text-sm text-foreground">
              <span className="px-2 text-muted-foreground">{labels.format}</span>
              <button
                className={"rounded-full px-3 py-1 transition-colors " + ((subscriptionActive !== true || downloadFormat === "mp3") ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5")}
                onClick={() => setDownloadFormat("mp3")}
              >
                {dictionary.errors.mp3}
              </button>
              {subscriptionActive !== true ? (
                <HoverCard openDelay={150}>
                  <HoverCardTrigger asChild>
                    <button type="button" className="cursor-not-allowed rounded-full px-3 py-1 text-slate-400" onClick={() => { setMessage(dictionary.errors.wavDownloadRequiresSubscription); router.push(`/${locale}/billing`); }}>{dictionary.errors.wav}</button>
                  </HoverCardTrigger>
                  <HoverCardContent align="end" className="w-72"><div className="text-sm text-foreground">{dictionary.errors.wavDownloadRequiresSubscription}</div></HoverCardContent>
                </HoverCard>
              ) : (
                <button type="button" className={"rounded-full px-3 py-1 transition-colors " + (downloadFormat === "wav" ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5")} onClick={() => setDownloadFormat("wav")}>{dictionary.errors.wav}</button>
              )}
            </div>
            <Button className="rounded-full px-3 sm:px-4" variant="secondary" onClick={() => handleDownload(residualUrl, "residual_reverb.wav")} disabled={!residualUrl}>{locale === "en" ? "Download Residual" : locale === "ja" ? "残響をDL" : "下载残余"}</Button>
            <Button className="rounded-full px-3 sm:px-4" variant="secondary" onClick={() => handleDownload(dryUrl, "dereverb.wav")} disabled={!dryUrl}>{locale === "en" ? "Download Dry" : locale === "ja" ? "ドライをDL" : "下载干声"}</Button>
            <Button className="rounded-full px-4 sm:px-6" variant="outline" onClick={resetToIdle}>{labels.replay}</Button>
          </div>
        </footer>
      </div>
    );
  };

  if (phase === "uploading" || phase === "processing") return renderProcessing();
  if (phase === "done") return renderDone();
  if (phase === "error") return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-foreground">
      <Alert variant="destructive" className="mb-4 w-full max-w-xl"><AlertDescription className="text-foreground">{message || dictionary.errors.unknown}</AlertDescription></Alert>
      <Button onClick={resetToIdle}>返回重新上传</Button>
    </div>
  );
  return renderIdle();
}
