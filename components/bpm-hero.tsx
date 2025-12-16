"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/faq";

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
  const audioCtxRef = useRef<AudioContext | null>(null);

  const labels = useMemo(
    () => ({
      file: locale === "en" ? "File" : locale === "ja" ? "ファイル" : "文件",
      bpm: "BPM",
      key: locale === "en" ? "Key" : locale === "ja" ? "調" : "调",
      camelot: "Camelot",
      status: locale === "en" ? "Processing…" : locale === "ja" ? "処理中…" : "处理中…",
      upload: dictionary.home.uploadCta,
      sizeError: locale === "en" ? "File is too large (max 50MB)" : locale === "ja" ? "ファイルサイズが大きすぎます（最大50MB）" : "文件过大（最大 50MB）",
      decodeError: locale === "en" ? "Decode failed" : locale === "ja" ? "デコードに失敗しました" : "解码失败",
      analysisError: locale === "en" ? "Analysis failed" : locale === "ja" ? "解析に失敗しました" : "解析失败",
    }),
    [dictionary.home.uploadCta, locale],
  );

  const handleFile = async (file: File) => {
    const tooLarge = file.size > 200 * 1024 * 1024;
    if (tooLarge) {
      setMessage(
        locale === "en"
          ? "File is too large (max 200MB)"
          : locale === "ja"
            ? "ファイルサイズが大きすぎます（最大200MB）"
            : "文件过大（最大200MB）",
      );
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
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: "error", error: labels.decodeError } : row)),
      );
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

  return (
    <>
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] px-4 py-12 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">{dictionary.nav.bpm}</h1>
          <p className="mt-3 text-lg text-slate-300">{dictionary.home.tools.bpm.description}</p>
          <div className="mt-6 flex justify-center">
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
              <div className="px-4 py-6 text-center text-sm text-slate-400">
                {locale === "en"
                  ? "Upload a track to analyze BPM and key"
                  : locale === "ja"
                    ? "トラックをアップロードして BPM とキーを解析"
                    : "上传音频即可分析 BPM 和调性"}
              </div>
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
                    {row.status === "processing" ? "…" : row.key ?? "-"}
                  </div>
                  <div className="text-center text-slate-200">
                    {row.status === "processing" ? "…" : row.camelot ?? "-"}
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

function toMono(audioBuffer: AudioBuffer) {
  const length = audioBuffer.length;
  const tmp = new Float32Array(length);
  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      tmp[i] += data[i];
    }
  }
  for (let i = 0; i < length; i++) {
    tmp[i] /= channels;
  }
  return tmp;
}

function resampleTo(input: Float32Array, fromRate: number, toRate: number) {
  if (fromRate === toRate) return input;
  const ratio = toRate / fromRate;
  const outLength = Math.round(input.length * ratio);
  const output = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const sourcePos = i / ratio;
    const idx = Math.floor(sourcePos);
    const frac = sourcePos - idx;
    const v1 = input[idx] ?? 0;
    const v2 = input[idx + 1] ?? v1;
    output[i] = v1 + (v2 - v1) * frac;
  }
  return output;
}

async function decodeAudioBuffer(arrayBuffer: ArrayBuffer) {
  const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
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
