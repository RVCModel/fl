"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/faq";
import { pickLocale } from "@/i18n/locale-utils";

type Phase = "idle" | "uploading" | "processing";
type ResultRow = {
  id: string;
  name: string;
  bpm?: number;
  key?: string;
  camelot?: string;
  status: "processing" | "done" | "error";
  error?: string;
};

export default function BpmHero({ dictionary, locale }: { dictionary: Dictionary; locale: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>("");
  const [rows, setRows] = useState<ResultRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Record<string, Partial<ResultRow>>>({});
  const workerUrl = "/vendor/key-finder.js";
  const currentTaskRef = useRef<string | null>(null);

  const labels = useMemo(
    () => ({
      file: pickLocale(locale, {
        zh: "文件",
        en: "File",
        ja: "ファイル",
        ko: "파일",
        ru: "Файл",
        de: "Datei",
        pt: "Arquivo",
        it: "File",
        ar: "ملف",
        es: "Archivo",
        fr: "Fichier",
      }),
      bpm: "BPM",
      key: pickLocale(locale, {
        zh: "调性",
        en: "Key",
        ja: "キー",
        ko: "키",
        ru: "Тональность",
        de: "Tonart",
        pt: "Tom",
        it: "Tonalità",
        ar: "المقام",
        es: "Tonalidad",
        fr: "Tonalité",
      }),
      camelot: "Camelot",
      status: pickLocale(locale, {
        zh: "处理中…",
        en: "Processing…",
        ja: "処理中…",
        ko: "처리 중…",
        ru: "Обработка…",
        de: "Wird verarbeitet…",
        pt: "Processando…",
        it: "Elaborazione…",
        ar: "جارٍ المعالجة…",
        es: "Procesando…",
        fr: "Traitement…",
      }),
      upload: dictionary.home.uploadCta,
      sizeError: pickLocale(locale, {
        zh: "文件过大（最大 200MB）",
        en: "File is too large (max 200MB)",
        ja: "ファイルサイズが大きすぎます（最大200MB）",
        ko: "파일이 너무 큽니다(최대 200MB)",
        ru: "Файл слишком большой (макс. 200 МБ)",
        de: "Datei ist zu groß (max. 200 MB)",
        pt: "Arquivo muito grande (máx. 200MB)",
        it: "File troppo grande (max 200MB)",
        ar: "الملف كبير جدًا (الحد الأقصى 200MB)",
        es: "El archivo es demasiado grande (máx. 200MB)",
        fr: "Le fichier est trop volumineux (max 200MB)",
      }),
      decodeError: pickLocale(locale, {
        zh: "解码失败",
        en: "Decode failed",
        ja: "デコードに失敗しました",
        ko: "디코딩에 실패했습니다",
        ru: "Не удалось декодировать",
        de: "Dekodierung fehlgeschlagen",
        pt: "Falha ao decodificar",
        it: "Decodifica non riuscita",
        ar: "فشل فك الترميز",
        es: "Error al decodificar",
        fr: "Échec du décodage",
      }),
      analysisError: pickLocale(locale, {
        zh: "解析失败",
        en: "Analysis failed",
        ja: "解析に失敗しました",
        ko: "분석에 실패했습니다",
        ru: "Ошибка анализа",
        de: "Analyse fehlgeschlagen",
        pt: "Falha na análise",
        it: "Analisi non riuscita",
        ar: "فشل التحليل",
        es: "Error de análisis",
        fr: "Échec de l’analyse",
      }),
      emptyHint: pickLocale(locale, {
        zh: "上传音频文件以分析 BPM 与调性",
        en: "Upload a track to analyze BPM and key",
        ja: "トラックをアップロードして BPM とキーを解析",
        ko: "트랙을 업로드하여 BPM과 키를 분석하세요",
        ru: "Загрузите трек, чтобы определить BPM и тональность",
        de: "Lade einen Track hoch, um BPM und Tonart zu analysieren",
        pt: "Envie uma faixa para analisar BPM e tom",
        it: "Carica una traccia per analizzare BPM e tonalità",
        ar: "ارفع مقطعًا لتحليل BPM والمقام",
        es: "Sube una pista para analizar BPM y tonalidad",
        fr: "Importez un titre pour analyser le BPM et la tonalité",
      }),
      placeholder: "—",
    }),
    [dictionary.home.uploadCta, locale],
  );

  const handleFile = async (file: File) => {
    const tooLarge = file.size > 200 * 1024 * 1024;
    if (tooLarge) {
      setMessage(labels.sizeError);
      return;
    }
    setPhase("uploading");
    setMessage("");
    const id = crypto.randomUUID();
    setRows((prev) => [
      ...prev,
      {
        id,
        name: file.name,
        status: "processing",
      },
    ]);
    currentTaskRef.current = id;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await decodeAudioBuffer(arrayBuffer);
      const channels: Float32Array[] = [];
      for (let i = 0; i < Math.min(audioBuffer.numberOfChannels, 2); i++) {
        channels.push(new Float32Array(audioBuffer.getChannelData(i)));
      }
      if (channels.length === 0) throw new Error("No channels");
      const payload = {
        arrayPCM: channels.length === 1 ? [channels[0], channels[0].slice()] : channels.slice(0, 2),
        sampleRate: audioBuffer.sampleRate,
        id,
      };
      const transfer = payload.arrayPCM.map((c) => c.buffer);
      ensureWorker();
      workerRef.current?.postMessage(payload, transfer);
      setPhase("processing");
    } catch (err) {
      console.error("decode/analyze failed", err);
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: "error", error: labels.decodeError } : row)));
      setMessage(labels.decodeError);
      setPhase("idle");
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const ensureWorker = () => {
    if (workerRef.current) return;
    try {
      workerRef.current = new Worker(workerUrl);
      workerRef.current.onmessage = (event: MessageEvent) => {
        const { feature, value, id } = event.data || {};
        const targetId = id || currentTaskRef.current;
        if (!targetId) return;
        pendingRef.current[targetId] = pendingRef.current[targetId] || {};
        if (feature === "bpm") {
          const raw =
            value && typeof value === "object" && "bpm" in (value as any)
              ? (value as any).bpm
              : Array.isArray(value)
                ? value[0]
                : value;
          const num = typeof raw === "number" ? raw : Number(raw);
          pendingRef.current[targetId].bpm = Number.isFinite(num) ? num : undefined;
        }
        if (feature === "key") {
          if (value && typeof value === "object") {
            const keyName = [value.key, value.scale].filter(Boolean).join(" ");
            pendingRef.current[targetId].key = keyName || undefined;
            pendingRef.current[targetId].camelot = camelotFromKey(value.key, value.scale);
          } else if (typeof value === "string") {
            pendingRef.current[targetId].key = value;
            pendingRef.current[targetId].camelot = camelotFromKey(value);
          }
        }
        const next = pendingRef.current[targetId];
        if (next && next.bpm !== undefined && next.key !== undefined) {
          setRows((prev) =>
            prev.map((row) =>
              row.id === targetId
                ? {
                    ...row,
                    bpm: typeof next.bpm === "number" && Number.isFinite(next.bpm) ? Math.round(next.bpm) : undefined,
                    key: next.key,
                    camelot: next.camelot,
                    status: "done",
                  }
                : row,
            ),
          );
          delete pendingRef.current[targetId];
          setPhase("idle");
        }
      };
      workerRef.current.onerror = () => {
        setMessage(labels.analysisError);
        setPhase("idle");
      };
    } catch (err) {
      console.error("worker init failed", err);
      setMessage(labels.analysisError);
    }
  };

  useEffect(() => {
    return () => {
      try {
        workerRef.current?.terminate();
      } catch {
        // ignore
      }
      workerRef.current = null;
    };
  }, []);

  return (
    <>
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] px-4 py-12 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="text-center">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">{dictionary.nav.bpm}</h1>
            <p className="mt-3 text-lg text-slate-300">{dictionary.home.tools.bpm.description}</p>
            <div className="mt-6 flex justify-center">
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onSelectFile} />
              <Button
                size="lg"
                className="rounded-full bg-indigo-600 px-8 py-6 text-base font-medium text-white hover:bg-indigo-700"
                onClick={() => fileInputRef.current?.click()}
                disabled={phase === "processing"}
              >
                {phase === "processing" ? labels.status : labels.upload}
              </Button>
            </div>
            {message && (
              <div className="mt-3 flex justify-center">
                <Alert variant="destructive" className="w-full max-w-3xl">
                  <AlertDescription className="text-foreground">{message}</AlertDescription>
                </Alert>
              </div>
            )}
          </header>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl">
            <div className="grid grid-cols-4 bg-indigo-600/70 text-sm font-semibold uppercase tracking-wide text-white">
              <div className="px-4 py-3 text-left">{labels.file}</div>
              <div className="px-4 py-3 text-center">{labels.bpm}</div>
              <div className="px-4 py-3 text-center">{labels.key}</div>
              <div className="px-4 py-3 text-center">{labels.camelot}</div>
            </div>
            <div className="divide-y divide-white/5 bg-[#1a1a24]">
              {rows.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">{labels.emptyHint}</div>
              ) : (
                rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-4 items-center px-4 py-3 text-sm text-slate-100">
                    <div className="truncate">{row.name}</div>
                    <div className="text-center text-indigo-200">
                      {row.status === "processing"
                        ? labels.status
                        : typeof row.bpm === "number" && Number.isFinite(row.bpm)
                          ? row.bpm
                          : "-"}
                    </div>
                    <div className="text-center text-slate-200">
                      {row.status === "processing" ? labels.placeholder : row.key ?? "-"}
                    </div>
                    <div className="text-center text-slate-200">
                      {row.status === "processing" ? labels.placeholder : row.camelot ?? "-"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="bg-[#17171e] text-white">
        <Faq title={dictionary.faq.title} items={dictionary.faq.bpm} />
      </section>
    </>
  );
}

async function decodeAudioBuffer(arrayBuffer: ArrayBuffer) {
  const decodeWith = async (ctx: AudioContext) => {
    // slice to avoid neutering the original buffer
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  };
  try {
    const ctx = getAudioCtx();
    return await decodeWith(ctx);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      // retry with a fresh context
      audioCtxSingleton.ctx = null;
      const ctx = getAudioCtx();
      return await decodeWith(ctx);
    }
    throw err;
  }
}

const audioCtxSingleton: { ctx: AudioContext | null } = { ctx: null };
function getAudioCtx() {
  if (!audioCtxSingleton.ctx) {
    const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    audioCtxSingleton.ctx = new AudioCtx();
  }
  return audioCtxSingleton.ctx;
}

function camelotFromKey(key?: string, scale?: string) {
  if (!key) return undefined;
  const normalized = key.replace(" ", "").replace("minor", "m").replace("major", "M").toLowerCase();
  const base = normalized.replace(/m|major|minor/gi, "");
  const isMinor = /m|min/.test(normalized) || scale === "minor";
  const table: Record<string, string> = {
    c: isMinor ? "5A" : "8B",
    "c#": isMinor ? "12A" : "3B",
    db: isMinor ? "12A" : "3B",
    d: isMinor ? "7A" : "10B",
    "d#": isMinor ? "2A" : "5B",
    eb: isMinor ? "2A" : "5B",
    e: isMinor ? "9A" : "12B",
    f: isMinor ? "4A" : "7B",
    "f#": isMinor ? "11A" : "2B",
    gb: isMinor ? "11A" : "2B",
    g: isMinor ? "6A" : "9B",
    "g#": isMinor ? "1A" : "4B",
    ab: isMinor ? "1A" : "4B",
    a: isMinor ? "8A" : "11B",
    "a#": isMinor ? "3A" : "6B",
    bb: isMinor ? "3A" : "6B",
    b: isMinor ? "10A" : "1B",
  };
  return table[base];
}

