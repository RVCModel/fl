"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WaveSurfer from "wavesurfer.js";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dictionary } from "@/i18n/dictionaries";
import { Faq } from "@/components/faq";
import { Play, SkipBack, Loader2 } from "lucide-react"; // 新增 Loader2
import { getValidAccessToken } from "@/lib/auth-client";
import { pickLocale } from "@/i18n/locale-utils";

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
  const dragDepthRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const labels = pickLocale(locale, {
    zh: {
      music: "音乐",
      vocal: "人声",
      play: "播放",
      pause: "暂停",
      replay: "重新上传",
      format: "格式",
      uploadingTitle: "上传中…",
      uploadingDesc: "正在准备音频并上传，请稍候。",
      processingTitle: "音频处理中…",
      processingDesc: "人工智能正在分离人声与伴奏，可能需要一分钟。请保持页面开启。",
      queueAheadTpl: "前方排队人数：{position}。",
      queueEtaTpl: "预计等待：{seconds} 秒。",
      downloadInst: "下载伴奏",
      downloadVocal: "下载人声",
      howItWorksTag: "工作方式",
      howItWorksTitle: "移除人声并隔离",
      howItWorksSubtitle: "用强大的人工智能算法将声音从音乐中分离出来",
      howItWorksImageAlt: "音频分离播放器界面 - 显示音乐和人声波形",
    },
    en: {
      music: "Music",
      vocal: "Vocal",
      play: "Play",
      pause: "Pause",
      replay: "Re-upload",
      format: "Format",
      uploadingTitle: "Uploading…",
      uploadingDesc: "Preparing your audio for processing.",
      processingTitle: "Audio processing…",
      processingDesc: "AI is separating vocals and instrumental, this may take up to a minute. Please keep this page open.",
      queueAheadTpl: "Ahead in queue: {position}.",
      queueEtaTpl: "Est. wait: {seconds}s.",
      downloadInst: "Download Inst",
      downloadVocal: "Download Vocal",
      howItWorksTag: "How it works",
      howItWorksTitle: "Remove vocals and isolate",
      howItWorksSubtitle: "Separate vocals from music with powerful AI.",
      howItWorksImageAlt: "Audio splitter interface showing music and vocal waveforms",
    },
    ja: {
      music: "音楽",
      vocal: "ボーカル",
      play: "再生",
      pause: "一時停止",
      replay: "再アップロード",
      format: "形式",
      uploadingTitle: "アップロード中…",
      uploadingDesc: "処理の準備をしています。",
      processingTitle: "音声処理中…",
      processingDesc: "AI がボーカルと伴奏を分離しています。1 分ほどかかる場合があります。このページを開いたままにしてください。",
      queueAheadTpl: "前方待ち人数: {position}。",
      queueEtaTpl: "予想到着: {seconds} 秒。",
      downloadInst: "伴奏をダウンロード",
      downloadVocal: "人声をダウンロード",
      howItWorksTag: "動作モード",
      howItWorksTitle: "ボーカルを分離して抽出",
      howItWorksSubtitle: "強力なAIで音楽から声を分離します。",
      howItWorksImageAlt: "音楽とボーカルの波形を表示する分離プレーヤー",
    },
    ko: {
      music: "음악",
      vocal: "보컬",
      play: "재생",
      pause: "일시정지",
      replay: "다시 업로드",
      format: "형식",
      uploadingTitle: "업로드 중…",
      uploadingDesc: "오디오를 준비하고 업로드하는 중입니다.",
      processingTitle: "오디오 처리 중…",
      processingDesc: "AI가 보컬과 반주를 분리하고 있습니다. 최대 1분 정도 걸릴 수 있어요. 이 페이지를 열어 두세요.",
      queueAheadTpl: "앞에 대기: {position}명.",
      queueEtaTpl: "예상 대기: {seconds}초.",
      downloadInst: "반주 다운로드",
      downloadVocal: "보컬 다운로드",
      howItWorksTag: "작동 방식",
      howItWorksTitle: "보컬을 분리하고 추출",
      howItWorksSubtitle: "강력한 AI로 음악에서 보컬을 분리합니다.",
      howItWorksImageAlt: "음악과 보컬 파형을 보여주는 오디오 분리 인터페이스",
    },
    ru: {
      music: "Музыка",
      vocal: "Вокал",
      play: "Воспроизвести",
      pause: "Пауза",
      replay: "Загрузить заново",
      format: "Формат",
      uploadingTitle: "Загрузка…",
      uploadingDesc: "Подготавливаем и загружаем аудио.",
      processingTitle: "Обработка аудио…",
      processingDesc: "ИИ разделяет вокал и инструментал. Это может занять до минуты. Не закрывайте страницу.",
      queueAheadTpl: "Перед вами в очереди: {position}.",
      queueEtaTpl: "Ожидание: ~{seconds}с.",
      downloadInst: "Скачать инструментал",
      downloadVocal: "Скачать вокал",
      howItWorksTag: "Как это работает",
      howItWorksTitle: "Отделите вокал и инструментал",
      howItWorksSubtitle: "Разделяйте вокал и музыку с помощью мощного ИИ.",
      howItWorksImageAlt: "Интерфейс разделения аудио с волнами музыки и вокала",
    },
    de: {
      music: "Musik",
      vocal: "Vocals",
      play: "Abspielen",
      pause: "Pause",
      replay: "Neu hochladen",
      format: "Format",
      uploadingTitle: "Wird hochgeladen…",
      uploadingDesc: "Audio wird vorbereitet und hochgeladen.",
      processingTitle: "Audio wird verarbeitet…",
      processingDesc: "KI trennt Vocals und Instrumental. Das kann bis zu einer Minute dauern. Bitte Seite geöffnet lassen.",
      queueAheadTpl: "Vor dir in der Warteschlange: {position}.",
      queueEtaTpl: "Geschätzte Wartezeit: {seconds}s.",
      downloadInst: "Instrumental herunterladen",
      downloadVocal: "Vocals herunterladen",
      howItWorksTag: "So funktioniert’s",
      howItWorksTitle: "Vocals entfernen und isolieren",
      howItWorksSubtitle: "Trenne Vocals und Musik mit leistungsstarker KI.",
      howItWorksImageAlt: "Audio-Splitter-Oberfläche mit Wellenformen für Musik und Vocals",
    },
    pt: {
      music: "Música",
      vocal: "Vocal",
      play: "Reproduzir",
      pause: "Pausar",
      replay: "Enviar novamente",
      format: "Formato",
      uploadingTitle: "Enviando…",
      uploadingDesc: "Preparando e enviando o áudio.",
      processingTitle: "Processando áudio…",
      processingDesc: "A IA está separando vocal e instrumental. Isso pode levar até um minuto. Mantenha esta página aberta.",
      queueAheadTpl: "À sua frente na fila: {position}.",
      queueEtaTpl: "Espera estimada: {seconds}s.",
      downloadInst: "Baixar instrumental",
      downloadVocal: "Baixar vocal",
      howItWorksTag: "Como funciona",
      howItWorksTitle: "Remova o vocal e isole",
      howItWorksSubtitle: "Separe vocais da música com IA poderosa.",
      howItWorksImageAlt: "Interface de separação de áudio com formas de onda de música e vocal",
    },
    it: {
      music: "Musica",
      vocal: "Voce",
      play: "Riproduci",
      pause: "Pausa",
      replay: "Carica di nuovo",
      format: "Formato",
      uploadingTitle: "Caricamento…",
      uploadingDesc: "Preparazione e caricamento dell’audio.",
      processingTitle: "Elaborazione audio…",
      processingDesc: "L’IA sta separando voce e base. Potrebbe richiedere fino a un minuto. Tieni aperta questa pagina.",
      queueAheadTpl: "Davanti in coda: {position}.",
      queueEtaTpl: "Attesa stimata: {seconds}s.",
      downloadInst: "Scarica base",
      downloadVocal: "Scarica voce",
      howItWorksTag: "Come funziona",
      howItWorksTitle: "Rimuovi la voce e isola",
      howItWorksSubtitle: "Separa la voce dalla musica con una potente IA.",
      howItWorksImageAlt: "Interfaccia di separazione audio con forme d’onda di musica e voce",
    },
    ar: {
      music: "موسيقى",
      vocal: "غناء",
      play: "تشغيل",
      pause: "إيقاف مؤقت",
      replay: "إعادة الرفع",
      format: "التنسيق",
      uploadingTitle: "جارٍ الرفع…",
      uploadingDesc: "جارٍ تجهيز الصوت ورفعه للمعالجة.",
      processingTitle: "جارٍ معالجة الصوت…",
      processingDesc: "يقوم الذكاء الاصطناعي بفصل الغناء عن الموسيقى. قد يستغرق ذلك حتى دقيقة. يُرجى إبقاء هذه الصفحة مفتوحة.",
      queueAheadTpl: "عدد المنتظرين قبلك: {position}.",
      queueEtaTpl: "الانتظار المتوقع: {seconds}ث.",
      downloadInst: "تنزيل الموسيقى",
      downloadVocal: "تنزيل الغناء",
      howItWorksTag: "كيف يعمل",
      howItWorksTitle: "اعزل الغناء وافصله",
      howItWorksSubtitle: "افصل الغناء عن الموسيقى باستخدام ذكاء اصطناعي قوي.",
      howItWorksImageAlt: "واجهة فصل الصوت تعرض موجات الموسيقى والغناء",
    },
    es: {
      music: "Música",
      vocal: "Voz",
      play: "Reproducir",
      pause: "Pausar",
      replay: "Volver a subir",
      format: "Formato",
      uploadingTitle: "Subiendo…",
      uploadingDesc: "Preparando y subiendo el audio para procesarlo.",
      processingTitle: "Procesando audio…",
      processingDesc: "La IA está separando voz e instrumental. Puede tardar hasta un minuto. Mantén esta página abierta.",
      queueAheadTpl: "Delante en la cola: {position}.",
      queueEtaTpl: "Espera estimada: {seconds}s.",
      downloadInst: "Descargar instrumental",
      downloadVocal: "Descargar voz",
      howItWorksTag: "Cómo funciona",
      howItWorksTitle: "Elimina la voz y aísla",
      howItWorksSubtitle: "Separa la voz de la música con IA potente.",
      howItWorksImageAlt: "Interfaz de separación de audio con formas de onda de música y voz",
    },
    fr: {
      music: "Musique",
      vocal: "Voix",
      play: "Lire",
      pause: "Pause",
      replay: "Renvoyer",
      format: "Format",
      uploadingTitle: "Envoi…",
      uploadingDesc: "Préparation et envoi de l’audio.",
      processingTitle: "Traitement audio…",
      processingDesc: "L’IA sépare la voix et l’instrumental. Cela peut prendre jusqu’à une minute. Gardez cette page ouverte.",
      queueAheadTpl: "Devant vous dans la file : {position}.",
      queueEtaTpl: "Attente estimée : {seconds}s.",
      downloadInst: "Télécharger l’instru",
      downloadVocal: "Télécharger la voix",
      howItWorksTag: "Comment ça marche",
      howItWorksTitle: "Retirez la voix et isolez",
      howItWorksSubtitle: "Séparez la voix de la musique avec une IA puissante.",
      howItWorksImageAlt: "Interface de séparation audio montrant les formes d’onde musique et voix",
    },
  });

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);

  const [vocalsUrl, setVocalsUrl] = useState<string | null>(null);
  const [instUrl, setInstUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [uploadPercent, setUploadPercent] = useState<number>(0);

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

  // 新增：下载状态追踪
  const [downloadingItems, setDownloadingItems] = useState<Record<string, boolean>>({});

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

  const isAbortError = (err: unknown) => {
    if (err instanceof DOMException && err.name === "AbortError") return true;
    if (err && typeof err === "object" && "name" in err && (err as any).name === "AbortError") return true;
    return false;
  };

  const uploadNetworkError = (fileSizeBytes: number) => {
    const base = pickLocale(locale, {
      zh: "网络请求失败，请检查后端服务是否可访问。",
      en: "Network request failed. Please check that the backend is reachable.",
      ja: "ネットワークリクエストに失敗しました。バックエンドに接続できるか確認してください。",
      ko: "네트워크 요청에 실패했습니다. 백엔드에 연결 가능한지 확인해 주세요.",
      ru: "Сетевой запрос не выполнен. Проверьте доступность бэкенда.",
      de: "Netzwerkfehler. Bitte prüfe, ob das Backend erreichbar ist.",
      pt: "Falha na requisição de rede. Verifique se o backend está acessível.",
      it: "Richiesta di rete non riuscita. Verifica che il backend sia raggiungibile.",
      ar: "فشل طلب الشبكة. يرجى التأكد من إمكانية الوصول إلى الخادم الخلفي.",
      es: "Falló la solicitud de red. Comprueba que el backend sea accesible.",
      fr: "Échec de la requête réseau. Vérifiez que le backend est accessible.",
    });

    if (fileSizeBytes < 100 * 1024 * 1024) return base;

    const large = pickLocale(locale, {
      zh: "上传失败：连接被中断（可能是反向代理/平台限制了上传大小，例如 100MB）。请尝试更小的文件，或提高服务器的请求体大小限制。",
      en: "Upload failed: connection was interrupted (a proxy/platform may limit upload size, e.g. 100MB). Try a smaller file or increase the server request body limit.",
      ja: "アップロード失敗：接続が中断されました（プロキシ/プラットフォームが 100MB などの上限を設けている可能性があります）。小さいファイルで試すか、サーバー側の上限を引き上げてください。",
      ko: "업로드 실패: 연결이 중단되었습니다(프록시/플랫폼이 100MB 등 업로드 크기를 제한할 수 있습니다). 더 작은 파일로 시도하거나 서버 제한을 늘려 주세요.",
      ru: "Загрузка не удалась: соединение было прервано (прокси/платформа может ограничивать размер, например 100 МБ). Попробуйте файл меньше или увеличьте лимит на сервере.",
      de: "Upload fehlgeschlagen: Verbindung wurde unterbrochen (Proxy/Plattform kann z. B. auf 100MB begrenzen). Versuche eine kleinere Datei oder erhöhe das Server-Limit.",
      pt: "Falha no upload: a conexão foi interrompida (um proxy/plataforma pode limitar, ex.: 100MB). Tente um arquivo menor ou aumente o limite do servidor.",
      it: "Upload non riuscito: la connessione è stata interrotta (un proxy/piattaforma può limitare, es. 100MB). Prova un file più piccolo o aumenta il limite del server.",
      ar: "فشل الرفع: انقطع الاتصال (قد يفرض وسيط/منصة حدًا مثل 100MB). جرّب ملفًا أصغر أو ارفع حد حجم الطلب على الخادم.",
      es: "La subida falló: la conexión se interrumpió (un proxy/plataforma puede limitar, p. ej. 100MB). Prueba con un archivo más pequeño o aumenta el límite del servidor.",
      fr: "Échec de l’envoi : la connexion a été interrompue (un proxy/plateforme peut limiter, ex. 100 Mo). Essayez un fichier plus petit ou augmentez la limite côté serveur.",
    });
    return large;
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
        vocalsUrl?: string;
        instUrl?: string;
        position?: number;
        etaSeconds?: number;
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
        setEtaSeconds(typeof saved.etaSeconds === "number" ? saved.etaSeconds : 0);
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
        etaSeconds,
        startedAt: processingStartedAt ?? undefined,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [phase, taskId, vocalsUrl, instUrl, position, etaSeconds, processingStartedAt]);

  useEffect(() => {
    if (phase !== "processing") setEtaSeconds(0);
  }, [phase]);

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
          setEtaSeconds(typeof data.eta_seconds === "number" ? data.eta_seconds : 0);

          if (data.status === "completed") {
            setVocalsUrl(normalizeBackendUrl(data.vocals_url || data.vocalsUrl));
            setInstUrl(normalizeBackendUrl(data.instrumental_url || data.instrumentalUrl));
            setPhase("done");
            setMessage("");
            setEtaSeconds(0);
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
            setEtaSeconds(0);
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
    if (phase !== "done" || !vocalWaveContainerRef.current || !vocalAudioRef.current || !vocalsUrl || !taskId) return;

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

    let cancelled = false;
    const load = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("no_token");
        const res = await fetch(`${apiBase}/waveform/demix/${taskId}/vocals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        if (!cancelled && res.ok && Array.isArray(data?.peaks) && typeof data?.duration === "number") {
          const ret = (ws as any).load(vocalsUrl, data.peaks, data.duration);
          if (ret && typeof ret.then === "function") ret.catch(() => {});
          return;
        }
      } catch (err) {
        if (!isAbortError(err)) {
          // fall through to url-only load
        }
      }
      try {
        const ret = (ws as any).load(vocalsUrl);
        if (ret && typeof ret.then === "function") ret.catch(() => {});
      } catch (err) {
        if (!isAbortError(err)) console.error("wavesurfer load failed", err);
      }
    };
    void load();

    ws.setVolume(voiceVolume / 100);
    if (vocalAudioRef.current) vocalAudioRef.current.volume = voiceVolume / 100;

    ws.on("ready", () => {
      setDuration(ws.getDuration());
      setHasWave(true);
    });
    ws.on("finish", () => setIsPlaying(false));

    waveSurferRef.current = ws;
    return () => {
      cancelled = true;
      ws.destroy();
      waveSurferRef.current = null;
      setHasWave(false);
    };
  }, [phase, vocalsUrl, taskId, apiBase]);

  // 2. Inst Track
  useEffect(() => {
    if (phase !== "done" || !instWaveContainerRef.current || !instAudioRef.current || !instUrl || !taskId) return;

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

    let cancelled = false;
    const load = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) throw new Error("no_token");
        const res = await fetch(`${apiBase}/waveform/demix/${taskId}/instrumental`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await safeJson(res);
        if (!cancelled && res.ok && Array.isArray(data?.peaks) && typeof data?.duration === "number") {
          const ret = (ws as any).load(instUrl, data.peaks, data.duration);
          if (ret && typeof ret.then === "function") ret.catch(() => {});
          return;
        }
      } catch (err) {
        if (!isAbortError(err)) {
          // fall through to url-only load
        }
      }
      try {
        const ret = (ws as any).load(instUrl);
        if (ret && typeof ret.then === "function") ret.catch(() => {});
      } catch (err) {
        if (!isAbortError(err)) console.error("wavesurfer load failed", err);
      }
    };
    void load();

    ws.setVolume(musicVolume / 100);
    if (instAudioRef.current) instAudioRef.current.volume = musicVolume / 100;

    ws.on("ready", () => setHasInstWave(true));
    ws.on("finish", () => setIsPlaying(false));

    instWaveSurferRef.current = ws;
    return () => {
      cancelled = true;
      ws.destroy();
      instWaveSurferRef.current = null;
      setHasInstWave(false);
    };
  }, [phase, instUrl, taskId, apiBase]);

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
    setCurrentTime(time);
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

  useEffect(() => {
    const loop = () => {
      const vocal = vocalAudioRef.current;
      if (vocal && !vocal.paused) {
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
    setUploadPercent(0);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    try {
      const initRes = await fetch(`${apiBase}/upload/init`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          size_bytes: file.size,
          chunk_size_bytes: 20 * 1024 * 1024,
        }),
      });
      const initData = await safeJson(initRes);
      if (!initRes.ok) {
        if (initRes.status === 401) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        throw new Error(getApiErrorMessage(initRes, initData));
      }

      const uploadId = String(initData.upload_id || "");
      const chunkSize = Number(initData.chunk_size_bytes || 20 * 1024 * 1024);
      if (!uploadId) throw new Error(dictionary.errors.uploadFailed);
      if (!Number.isFinite(chunkSize) || chunkSize <= 0) throw new Error(dictionary.errors.uploadFailed);

      const totalParts = Math.max(1, Math.ceil(file.size / chunkSize));
      for (let index = 0; index < totalParts; index++) {
        const start = index * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const blob = file.slice(start, end);
        const fd = new FormData();
        fd.append("upload_id", uploadId);
        fd.append("index", String(index));
        fd.append("total_parts", String(totalParts));
        fd.append("filename", file.name);
        fd.append("chunk", blob, file.name);

        const partRes = await fetch(`${apiBase}/upload/chunk`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const partData = await safeJson(partRes);
        if (!partRes.ok) {
          if (partRes.status === 401) {
            router.push(`/${locale}/auth/login`);
            return;
          }
          throw new Error(getApiErrorMessage(partRes, partData));
        }

        setUploadPercent(Math.min(100, Math.round((end / file.size) * 100)));
      }

      const completeRes = await fetch(`${apiBase}/upload/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ upload_id: uploadId }),
      });
      const data = await safeJson(completeRes);
      if (!completeRes.ok) {
        if (completeRes.status === 401) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        throw new Error(getApiErrorMessage(completeRes, data));
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
        const isFetchFailed =
          err instanceof TypeError && typeof err.message === "string" && /failed to fetch/i.test(err.message);
        setMessage(isFetchFailed ? uploadNetworkError(file.size) : err.message || dictionary.errors.uploadFailed);
      }
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  useEffect(() => {
    const preventDefault = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener("dragover", preventDefault, { passive: false });
    window.addEventListener("drop", preventDefault, { passive: false });
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  const resetDragState = () => {
    dragDepthRef.current = 0;
    setIsDragActive(false);
  };

  const onDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      resetDragState();
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    resetDragState();
    if (file) handleUpload(file);
  };

  // 修改后的 handleDownload：增加加载状态
  const handleDownload = async (url: string | null, name: string) => {
    if (!url || !taskId) return;
    
    // 标记该文件正在下载
    setDownloadingItems((prev) => ({ ...prev, [name]: true }));

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
      const a = document.createElement("a");
      const baseName = name.replace(/\.(wav|mp3)$/i, "");
      a.download = `${baseName}.${fmt}`;

      // Use short-lived signed URLs to avoid buffering large downloads in JS (better over Cloudflare Tunnel).
      const linkRes = await fetch(`${apiBase}/download-link/demix/${taskId}/${stem}?format=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const linkData = await safeJson(linkRes);
      if (!linkRes.ok) {
        const detail = linkData?.detail ?? linkData ?? {};
        if (detail?.code === "WAV_REQUIRES_SUBSCRIPTION") {
          setMessage(dictionary.errors.wavDownloadRequiresSubscription);
          router.push(`/${locale}/billing`);
          return;
        }
        throw new Error(dictionary.errors.uploadFailed);
      }

      const href = String(linkData?.url || url);
      a.href = href;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("download failed", err);
    } finally {
      // 无论成功失败，都移除 Loading 状态
      setDownloadingItems((prev) => ({ ...prev, [name]: false }));
    }
  };

  const renderDone = () => {
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
        waveOpacity: hasInstWave,
      },
      {
        key: "vocal",
        label: labels.vocal,
        volume: voiceVolume,
        waveContainerRef: vocalWaveContainerRef,
        waveOpacity: hasWave,
      },
    ];

    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] text-foreground">
        {/* 
            修复关键：移除了 src 属性。
            WaveSurfer 的 ws.load() 会自动设置 src，避免双重加载竞争。
        */}
        <audio ref={instAudioRef} crossOrigin="anonymous" />
        <audio ref={vocalAudioRef} crossOrigin="anonymous" />

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
                      style={{ backgroundColor: "#18181b", borderRight: "1px solid #333" }}
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
              {isPlaying ? labels.pause : labels.play}
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
              disabled={!instUrl || downloadingItems["instrumental.wav"]}
            >
              {downloadingItems["instrumental.wav"] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {labels.downloadInst}
                </>
              ) : (
                labels.downloadInst
              )}
            </Button>

            <Button
              className="rounded-full px-3 sm:px-4"
              variant="secondary"
              onClick={() => handleDownload(vocalsUrl, "vocals.wav")}
              disabled={!vocalsUrl || downloadingItems["vocals.wav"]}
            >
              {downloadingItems["vocals.wav"] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {labels.downloadVocal}
                </>
              ) : (
                labels.downloadVocal
              )}
            </Button>

            <Button className="rounded-full px-4 sm:px-6" variant="outline" onClick={() => setPhase("idle")}>
              {labels.replay}
            </Button>
          </div>
        </footer>
      </div>
    );
  };

  const renderIdle = () => {
    const heroCopy = {
      tag: labels.howItWorksTag,
      title: labels.howItWorksTitle,
      subtitle: labels.howItWorksSubtitle,
      imageAlt: labels.howItWorksImageAlt,
      button: dictionary.home.uploadCta,
    };
    const playerImageSrc =
      locale === "zh" ? "/remover/player_zh.png" : locale === "ja" ? "/remover/player_ja.png" : "/remover/player_en.png";

    return (
      <>
        <section
          className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#17171e] px-4 py-20 text-white ${isDragActive ? "ring-2 ring-indigo-500/60" : ""}`}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {isDragActive && (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-sm">
              <div className="rounded-2xl border border-white/15 bg-[#17171e]/80 px-6 py-4 text-center shadow-2xl">
                <div className="text-base font-semibold text-white">
                  {pickLocale(locale, {
                    zh: "松开鼠标上传音频",
                    en: "Drop to upload audio",
                    ja: "ドロップしてアップロード",
                    ko: "놓아서 업로드",
                    ru: "Отпустите для загрузки",
                    de: "Zum Hochladen ablegen",
                    pt: "Solte para enviar",
                    it: "Rilascia per caricare",
                    ar: "أفلت للرفع",
                    es: "Suelta para subir",
                    fr: "Déposez pour envoyer",
                  })}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {pickLocale(locale, {
                    zh: "支持 mp3 / wav 等常见格式",
                    en: "Supports mp3 / wav and more",
                    ja: "mp3 / wav などに対応",
                    ko: "mp3 / wav 등 지원",
                    ru: "Поддерживает mp3 / wav и другое",
                    de: "Unterstützt mp3 / wav und mehr",
                    pt: "Suporta mp3 / wav e mais",
                    it: "Supporta mp3 / wav e altro",
                    ar: "يدعم mp3 / wav والمزيد",
                    es: "Admite mp3 / wav y más",
                    fr: "Prend en charge mp3 / wav et plus",
                  })}
                </div>
              </div>
            </div>
          )}
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
        <p className="text-base text-muted-foreground">
          {phase === "uploading" ? (
            uploadPercent > 0 ? `${labels.uploadingDesc} (${uploadPercent}%)` : labels.uploadingDesc
          ) : (
            <>
               {labels.processingDesc}
               {position > 0 ? (
                <> {formatTemplate(labels.queueAheadTpl, { position })}</>
               ) : null}
               {etaSeconds > 0 ? (
                <> {formatTemplate(labels.queueEtaTpl, { seconds: Math.max(0, Math.round(etaSeconds)) })}</>
               ) : null}
               {subscriptionActive !== true ? (
                 <>
                   {" "}
                  {pickLocale(locale, {
                    zh: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          订阅
                        </Link>
                        会员免除排队。
                      </>
                    ),
                    en: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Subscribe
                        </Link>{" "}
                        to skip the queue.
                      </>
                    ),
                    ja: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          サブスク
                        </Link>
                        で待ち時間なし。
                      </>
                    ),
                    ko: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          구독
                        </Link>
                        하면 대기 없이 바로 처리됩니다.
                      </>
                    ),
                    ru: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Подписаться
                        </Link>
                        , чтобы пропустить очередь.
                      </>
                    ),
                    de: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Abonnieren
                        </Link>
                        , um die Warteschlange zu überspringen.
                      </>
                    ),
                    pt: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Assinar
                        </Link>{" "}
                        para pular a fila.
                      </>
                    ),
                    it: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Abbonati
                        </Link>{" "}
                        per saltare la coda.
                      </>
                    ),
                    ar: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          اشترك
                        </Link>{" "}
                        لتجاوز قائمة الانتظار.
                      </>
                    ),
                    es: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Suscríbete
                        </Link>{" "}
                        para saltarte la cola.
                      </>
                    ),
                    fr: (
                      <>
                        <Link href={`/${locale}/billing`} className="underline underline-offset-4 hover:text-foreground">
                          Abonnez-vous
                        </Link>{" "}
                        pour éviter la file d’attente.
                      </>
                    ),
                  })}
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
