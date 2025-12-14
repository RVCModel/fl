"use client";

import { useEffect, useRef, useState } from "react";
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
  const [dryUrl, setDryUrl] = useState<string | null>(null);
  const [residualUrl, setResidualUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [residualVolume, setResidualVolume] = useState(0);
  const [dryVolume, setDryVolume] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasDryWave, setHasDryWave] = useState(false);
  const [hasResidualWave, setHasResidualWave] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"mp3" | "wav">("mp3");
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);
  const STORAGE_KEY = "vofl:dereverb-state";
  const isAbortError = (err: unknown) =>
    err instanceof DOMException && (err.name === "AbortError" || err.name === "NotAllowedError");

  const residualAudioRef = useRef<HTMLAudioElement | null>(null);
  const dryAudioRef = useRef<HTMLAudioElement | null>(null);
  const canvasDryRef = useRef<HTMLCanvasElement | null>(null);
  const dryWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const dryWaveSurferRef = useRef<WaveSurfer | null>(null);
  const residualWaveContainerRef = useRef<HTMLDivElement | null>(null);
  const residualWaveSurferRef = useRef<WaveSurfer | null>(null);

  // Use same-origin proxy in production to avoid Mixed Content (HTTPS page -> HTTP backend).
  const apiBase = "/api/py";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as {
        taskId?: string;
        phase?: Phase;
        dryUrl?: string;
        residualUrl?: string;
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
        setDryUrl(saved.dryUrl || null);
        setResidualUrl(saved.residualUrl || null);
        setPosition(saved.position || 0);
        setProcessingStartedAt(typeof saved.startedAt === "number" ? saved.startedAt : saved.savedAt || null);
      }
    } catch (err) {
      console.error("restore dereverb state failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase === "processing" || phase === "done") {
      const payload = {
        taskId,
        phase,
        dryUrl,
        residualUrl,
        position,
        startedAt: processingStartedAt ?? undefined,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [phase, taskId, dryUrl, residualUrl, position, processingStartedAt]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === "processing" && taskId) {
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
          const res = await fetch(`${apiBase}/dereverb/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 404) {
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
          const data = await safeJson(res);
          setPosition(data.position ?? 0);
          if (data.status === "completed") {
            setDryUrl(data.dereverb_url || data.dereverbUrl);
            setResidualUrl(data.reverb_url || data.reverbUrl);
            setPhase("done");
            setMessage("");
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
                  status: "completed",
                  model: "dereverb",
                  progress: 1,
                  result_url: data.dereverb_url || data.dereverbUrl || null,
                }),
              });
            } catch (err) {
              if (!isAbortError(err)) {
                console.error("update job failed", err);
              }
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
                  model: "dereverb",
                  progress: 1,
                  result_url: null,
                }),
              });
            } catch (err) {
              if (!isAbortError(err)) {
                console.error("update job failed", err);
              }
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

  useEffect(() => {
    if (phase !== "done") return;
    const canvas = canvasDryRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const centerY = rect.height / 2;
    const barWidth = 2;
    const barGap = 2;
    const barCount = Math.floor(rect.width / (barWidth + barGap));
    ctx.fillStyle = "#8b8fd8";
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barGap);
      const noise = Math.sin(i * 0.28) * Math.cos(i * 0.11) + Math.random() * 0.35;
      const amplitude = Math.abs(noise) * 0.75 + 0.15;
      const height = rect.height * amplitude * 0.85;
      ctx.fillRect(x, centerY - height / 2, barWidth, height);
    }
  }, [phase]);

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
      height: 120,
      waveColor: "#8b8fd8",
      progressColor: "#8b8fd8",
      cursorColor: "#ffffff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1.5,
      normalize: true,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
    });
    ws.load(dryUrl);
    ws.setVolume(dryVolume / 100);
    ws.on("audioprocess", () => {
      setCurrentTime(ws.getCurrentTime());
    });
    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setHasDryWave(true);
    });
    ws.on("finish", () => setIsPlaying(false));
    dryWaveSurferRef.current = ws;
    return () => {
      ws.destroy();
      dryWaveSurferRef.current = null;
      setHasDryWave(false);
    };
  }, [phase, dryUrl, dryVolume]);

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
      height: 90,
      waveColor: "#1c8a64",
      progressColor: "#1c8a64",
      cursorColor: "#ffffff",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1.5,
      normalize: true,
      interact: false,
      dragToSeek: false,
      hideScrollbar: true,
    });
    ws.load(residualUrl);
    ws.setVolume(residualVolume / 100);
    ws.on("ready", () => setHasResidualWave(true));
    ws.on("finish", () => setIsPlaying(false));
    residualWaveSurferRef.current = ws;
    return () => {
      ws.destroy();
      residualWaveSurferRef.current = null;
      setHasResidualWave(false);
    };
  }, [phase, residualUrl, residualVolume]);

  useEffect(() => {
    if (residualAudioRef.current) residualAudioRef.current.volume = residualVolume / 100;
    if (residualWaveSurferRef.current) residualWaveSurferRef.current.setVolume(residualVolume / 100);
  }, [residualVolume]);
  useEffect(() => {
    if (dryAudioRef.current) dryAudioRef.current.volume = dryVolume / 100;
    if (dryWaveSurferRef.current) dryWaveSurferRef.current.setVolume(dryVolume / 100);
  }, [dryVolume]);

  const togglePlay = () => {
    const residual = residualAudioRef.current;
    const dry = dryAudioRef.current;
    if (!residual && !dry) return;
    const dryWs = dryWaveSurferRef.current;
    const residualWs = residualWaveSurferRef.current;
    if (isPlaying) {
      residual?.pause();
      dryWs ? dryWs.pause() : dry?.pause();
      residualWs?.pause();
      setIsPlaying(false);
    } else {
      dryWs ? dryWs.play() : dry?.play();
      residualWs ? residualWs.play() : residual?.play();
      setIsPlaying(true);
    }
  };

  const resetPlayhead = () => {
    const residual = residualAudioRef.current;
    const dry = dryAudioRef.current;
    if (residual) residual.currentTime = 0;
    if (dry) dry.currentTime = 0;
    if (dryWaveSurferRef.current) dryWaveSurferRef.current.seekTo(0);
    if (residualWaveSurferRef.current) residualWaveSurferRef.current.seekTo(0);
    setCurrentTime(0);
  };

  useEffect(() => {
    if (phase !== "done") return;
    const dry = dryAudioRef.current;
    const residual = residualAudioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleLoaded = () => {
      if (dry?.duration) setDuration(dry.duration);
      setCurrentTime(0);
    };
    dry?.addEventListener("play", handlePlay);
    dry?.addEventListener("pause", handlePause);
    dry?.addEventListener("ended", handleEnded);
    dry?.addEventListener("loadedmetadata", handleLoaded);
    residual?.addEventListener("ended", handleEnded);
    return () => {
      dry?.removeEventListener("play", handlePlay);
      dry?.removeEventListener("pause", handlePause);
      dry?.removeEventListener("ended", handleEnded);
      dry?.removeEventListener("loadedmetadata", handleLoaded);
      residual?.removeEventListener("ended", handleEnded);
    };
  }, [phase]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const dry = dryAudioRef.current;
      if (dryWaveSurferRef.current) {
        setCurrentTime(dryWaveSurferRef.current.getCurrentTime() || 0);
        setDuration(dryWaveSurferRef.current.getDuration() || duration);
      } else if (dry?.duration) {
        setCurrentTime(dry.currentTime);
        setDuration(dry.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    if (phase === "done") {
      raf = requestAnimationFrame(tick);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [phase]);

  const handleUpload = async (file: File) => {
    const token = await getValidAccessToken();
    if (!token) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    setPhase("uploading");
    setMessage("");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      const usageRes = await fetch("/api/usage/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usage = (await safeJson(usageRes)) as any;
      if (typeof usage?.subscribed === "boolean") {
        setSubscriptionActive(usage.subscribed);
        setDownloadFormat(usage.subscribed ? "wav" : "mp3");
      }
      if (typeof usage?.used === "number" && typeof usage?.limit === "number" && usage.used >= usage.limit) {
        setPhase("idle");
        setMessage(formatTemplate(dictionary.errors.dailyLimitReached, { limit: usage.limit }));
        return;
      }
    } catch {
      // Ignore pre-check failures; backend still enforces limits.
    }
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
            model: "dereverb",
            progress: 0,
            result_url: null,
          }),
        });
      } catch (err) {
        if (!isAbortError(err)) {
          console.error("record job failed", err);
        }
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
    if (file) {
      handleUpload(file);
    }
  };

  const renderIdle = () => {
    const heroCopy = {
      tag: locale === "en" ? "How it works" : locale === "ja" ? "動作モード" : "工作方式",
      title:
        locale === "en"
          ? "Remove reverb, keep clarity"
          : locale === "ja"
            ? "リバーブを抑えてクリアに"
            : "降低混响，保留干声",
      subtitle:
        locale === "en"
          ? "Reduce room reverb and tail while keeping your voice upfront."
          : locale === "ja"
            ? "部屋の残響やテールを抑え、声の輪郭を際立たせます。"
            : "削减房间混响和尾音，让人声更靠前。",
      imageAlt:
        locale === "en"
          ? "Dereverb interface showing dry and residual waveforms"
          : locale === "ja"
            ? "ドライと残響の波形を表示する去リバーブ画面"
            : "去混响界面，显示干声与残余波形",
      button: dictionary.home.uploadCta,
    };
    const playerImageSrc =
      locale === "en"
        ? "/remover/player_en.png"
        : locale === "ja"
          ? "/remover/player_ja.png"
          : "/remover/player_zh.png";

    return (
      <>
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#17171e] px-4 py-20 text-white">
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <span className="mb-6 text-sm font-medium tracking-wide text-indigo-300">{heroCopy.tag}</span>
            <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{heroCopy.title}</h1>
            <p className="mb-12 max-w-2xl text-lg text-slate-300 md:text-xl">{heroCopy.subtitle}</p>

            <div className="mb-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
              <img
                src={playerImageSrc}
                alt={heroCopy.imageAlt}
                className="w-full"
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={onSelectFile}
              />
              <Button
                size="lg"
                className="rounded-full bg-indigo-600 px-8 py-6 text-base font-medium text-white hover:bg-indigo-700"
                onClick={() => fileInputRef.current?.click()}
              >
                {heroCopy.button}
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
          <Faq title={dictionary.faq.title} items={dictionary.faq.dereverb} />
        </section>
      </>
    );
  };

  const renderProcessing = () => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#17171e] px-6 text-center text-foreground">
      <div className="relative flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/30 px-10 py-12 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white shadow-lg">
          ?
        </div>
        <h2 className="text-3xl font-bold">{phase === "uploading" ? labels.uploadingTitle : labels.processingTitle}</h2>
        <p className="text-base text-muted-foreground">
          {phase === "uploading" ? labels.uploadingDesc : labels.processingDesc}
          {position > 0
            ? locale === "en"
              ? ` Queue position: ${position}`
              : locale === "ja"
                ? ` キュー位置: ${position}`
                : ` 当前排队位置：${position}`
            : ""}
        </p>
        <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[pulse_1.6s_ease_in_out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        </div>
      </div>
    </div>
  );

  const VolumeSlider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div
      className="relative h-5 w-8 cursor-pointer"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newValue = Math.max(0, Math.min(100, (x / rect.width) * 100));
        onChange(newValue);
      }}
    >
      <svg viewBox="0 0 32 20" className="h-full w-full">
        <polygon points="0,18 32,0 32,18" fill="#4a4a4a" />
        <polygon points={`0,18 ${(value / 100) * 32},${18 - (value / 100) * 18} ${(value / 100) * 32},18`} fill="#ffffff" />
      </svg>
    </div>
  );

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

      const stem = name.includes("residual") ? "reverb" : "dereverb";
      const res = await fetch(`${apiBase}/dereverb/download/${taskId}/${stem}?format=${fmt}`, {
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
    const playheadPercent = duration ? Math.min(1, currentTime / duration) : 0;
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] text-foreground">
        <audio ref={residualAudioRef} src={residualUrl || undefined} />
        <audio ref={dryAudioRef} src={dryUrl || undefined} />

        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-32 pt-14">
          <div className="relative w-full max-w-6xl rounded-2xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div
              className="absolute -top-7 flex -translate-x-1/2 items-center justify-center rounded-full bg-muted px-3 py-1 text-[11px] font-mono text-muted-foreground shadow"
              style={{ left: `${playheadPercent * 100}%` }}
            >
              {formatTime(currentTime)}
            </div>

            <div className="flex items-stretch gap-4">
              <div className="flex w-24 flex-col justify-between py-3 text-sm text-foreground/90">
                <span className="flex h-1/2 items-center border-b border-border">{labels.wet}</span>
                <span className="flex h-1/2 items-center">{labels.dry}</span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-4">
                  <VolumeSlider value={residualVolume} onChange={setResidualVolume} />
                  <div className="relative h-20 flex-1 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-700 to-emerald-600 shadow-inner">
                    <div ref={residualWaveContainerRef} className="absolute inset-0" style={{ opacity: hasResidualWave ? 1 : 0 }} />
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/80"
                      style={{ left: `${playheadPercent * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <VolumeSlider value={dryVolume} onChange={setDryVolume} />
                  <div className="relative h-28 flex-1 overflow-hidden rounded-lg bg-[#4a4f7c] shadow-inner">
                    <div ref={dryWaveContainerRef} className="absolute inset-0" style={{ opacity: hasDryWave ? 1 : 0 }} />
                    <canvas
                      ref={canvasDryRef}
                      className="absolute inset-0 h-full w-full"
                      style={{ opacity: hasDryWave ? 0 : 0.85 }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-px bg-white/80"
                      style={{ left: `${playheadPercent * 100}%` }}
                    />
                    <div className="absolute -bottom-6 right-1 text-xs font-mono text-muted-foreground">
                      {duration ? formatTime(duration) : "00:00.0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-10 flex h-[90px] items-center justify-between border-t border-border bg-[#17171e] px-6">
          <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-3">
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
              className="rounded-full px-4"
              variant="secondary"
              onClick={() => handleDownload(residualUrl, "residual_reverb.wav")}
              disabled={!residualUrl}
            >
              {locale === "en" ? "Download Residual" : locale === "ja" ? "残響をDL" : "下载残余"}
            </Button>
            <Button
              className="rounded-full px-4"
              variant="secondary"
              onClick={() => handleDownload(dryUrl, "dereverb.wav")}
              disabled={!dryUrl}
            >
              {locale === "en" ? "Download Dry" : locale === "ja" ? "ドライをDL" : "下载干声"}
            </Button>
            <Button className="rounded-full px-6" variant="outline" onClick={() => setPhase("idle")}>
              {labels.replay}
            </Button>
          </div>
        </footer>
      </div>
    );
  };

  if (phase === "uploading" || phase === "processing") {
    return renderProcessing();
  }
  if (phase === "done") {
    return renderDone();
  }
  if (phase === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-foreground">
        <Alert variant="destructive" className="mb-4 w-full max-w-xl">
          <AlertDescription className="text-foreground">
            {message || dictionary.errors.unknown}
          </AlertDescription>
        </Alert>
        <Button onClick={() => setPhase("idle")}>返回重新上传</Button>
      </div>
    );
  }
  return renderIdle();
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ms = Math.floor((time % 1) * 10);
  return `0${mins}:${String(secs).padStart(2, "0")}.${ms}`;
}
