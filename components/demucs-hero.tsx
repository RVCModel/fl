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
type StemKey = "vocals" | "drums" | "bass" | "other";

const STEMS: StemKey[] = ["vocals", "drums", "bass", "other"];
const DISPLAY_STEMS: StemKey[] = ["other", "vocals", "bass", "drums"];
const MASTER_STEM: StemKey = "vocals";
const LANE_HEIGHT = 80;

// --- 辅助函数 ---
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const TRACK_COLORS: Record<StemKey, { bg: string; wave: string }> = {
  other: { bg: "#2d6a4f", wave: "#74c69d" },
  vocals: { bg: "#3e426e", wave: "#a78bfa" },
  bass: { bg: "#787536", wave: "#fde047" },
  drums: { bg: "#4a2c35", wave: "#fca5a5" },
};

// --- 组件: MixerSlider ---

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

// --- 主组件 ---

export default function DemucsHero({ dictionary, locale }: { dictionary: Dictionary; locale: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [position, setPosition] = useState<number>(0);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<"mp3" | "wav">("mp3");
  const [processingStartedAt, setProcessingStartedAt] = useState<number | null>(null);

  // 新增：下载状态追踪
  const [downloadingItems, setDownloadingItems] = useState<Record<string, boolean>>({});

  const notFoundStreakRef = useRef(0);
  const STORAGE_KEY = "vofl:demucs-state";

  const ui = pickLocale(locale, {
    zh: {
      howItWorksTag: "工作方式",
      howItWorksTitle: "乐器分离（4轨）",
      howItWorksSubtitle: "使用 Demucs 将音乐分离为人声、鼓、贝斯与其他。",
      previewAlt: "四轨分离预览",
      uploadingTitle: "上传中…",
      processingTitle: "四轨分离中…",
      uploadingDesc: "正在准备音频并上传，请稍候。",
      processingDesc: "AI 正在分离四个轨道，可能需要一分钟。请保持页面开启。",
      queueAheadTpl: "前方排队人数：{position}。",
      queueEtaTpl: "预计等待：{seconds} 秒。",
      formatLabel: "格式",
      downloadTitle: "下载",
      downloadHint: "选择需要下载的音轨。",
      saveLabel: "保存",
      selectedLabel: "已选择",
      reupload: "重新上传",
      uploadFailed: "上传失败",
      tryAgain: "重试",
      missingDemucsDeps: "服务器缺少 Demucs 依赖，请联系管理员。",
      stems: { vocals: "人声", drums: "鼓", bass: "贝斯", other: "伴奏" },
      downloadStems: { vocals: "下载人声", drums: "下载鼓", bass: "下载贝斯", other: "下载伴奏" },
    },
    en: {
      howItWorksTag: "How it works",
      howItWorksTitle: "Separate instruments into 4 stems",
      howItWorksSubtitle: "Split music into vocals, drums, bass and other with Demucs.",
      previewAlt: "Demucs preview",
      uploadingTitle: "Uploading…",
      processingTitle: "Separating 4 stems…",
      uploadingDesc: "Preparing your audio for processing.",
      processingDesc: "AI is separating stems, this may take a minute. Please keep this page open.",
      queueAheadTpl: "Ahead in queue: {position}.",
      queueEtaTpl: "Est. wait: {seconds}s.",
      formatLabel: "Format",
      downloadTitle: "Download",
      downloadHint: "Choose a stem to download.",
      saveLabel: "Save",
      selectedLabel: "Selected",
      reupload: "Re-upload",
      uploadFailed: "Upload failed",
      tryAgain: "Try again",
      missingDemucsDeps: "Server is missing Demucs dependencies. Please contact support.",
      stems: { vocals: "Vocals", drums: "Drums", bass: "Bass", other: "Music" },
      downloadStems: { vocals: "Download Vocals", drums: "Download Drums", bass: "Download Bass", other: "Download Music" },
    },
    ja: {
      howItWorksTag: "動作モード",
      howItWorksTitle: "楽器を4トラックに分離",
      howItWorksSubtitle: "Demucsでボーカル/ドラム/ベース/その他に分離します。",
      previewAlt: "Demucs プレビュー",
      uploadingTitle: "アップロード中…",
      processingTitle: "4トラック分離中…",
      uploadingDesc: "処理の準備をしています。",
      processingDesc: "AI が分離しています。しばらくお待ちください。",
      queueAheadTpl: "前方待ち人数: {position}。",
      queueEtaTpl: "予想到着: {seconds} 秒。",
      formatLabel: "形式",
      downloadTitle: "ダウンロード",
      downloadHint: "ダウンロードするトラックを選択してください。",
      saveLabel: "保存",
      selectedLabel: "選択中",
      reupload: "再アップロード",
      uploadFailed: "アップロード失敗",
      tryAgain: "再試行",
      missingDemucsDeps: "サーバーに Demucs 依存関係がありません。サポートに連絡してください。",
      stems: { vocals: "ボーカル", drums: "ドラム", bass: "ベース", other: "伴奏" },
      downloadStems: { vocals: "ボーカルをDL", drums: "ドラムをDL", bass: "ベースをDL", other: "伴奏をDL" },
    },
    ko: {
      howItWorksTag: "작동 방식",
      howItWorksTitle: "악기를 4개 스템으로 분리",
      howItWorksSubtitle: "Demucs로 보컬/드럼/베이스/기타 스템으로 분리합니다.",
      previewAlt: "Demucs 미리보기",
      uploadingTitle: "업로드 중…",
      processingTitle: "4 스템 분리 중…",
      uploadingDesc: "오디오를 준비하고 업로드하는 중입니다.",
      processingDesc: "AI가 스템을 분리하고 있습니다. 최대 1분 정도 걸릴 수 있어요. 이 페이지를 열어 두세요.",
      queueAheadTpl: "앞에 대기: {position}명.",
      queueEtaTpl: "예상 대기: {seconds}초.",
      formatLabel: "형식",
      downloadTitle: "다운로드",
      downloadHint: "다운로드할 스템을 선택하세요.",
      saveLabel: "저장",
      selectedLabel: "선택됨",
      reupload: "다시 업로드",
      uploadFailed: "업로드 실패",
      tryAgain: "다시 시도",
      missingDemucsDeps: "서버에 Demucs 의존성이 없습니다. 지원팀에 문의해 주세요.",
      stems: { vocals: "보컬", drums: "드럼", bass: "베이스", other: "기타" },
      downloadStems: { vocals: "보컬 다운로드", drums: "드럼 다운로드", bass: "베이스 다운로드", other: "기타 다운로드" },
    },
    ru: {
      howItWorksTag: "Как это работает",
      howItWorksTitle: "Разделение на 4 стема",
      howItWorksSubtitle: "Разделяйте трек на вокал, барабаны, бас и другое с помощью Demucs.",
      previewAlt: "Предпросмотр Demucs",
      uploadingTitle: "Загрузка…",
      processingTitle: "Разделение на 4 стема…",
      uploadingDesc: "Подготавливаем и загружаем аудио.",
      processingDesc: "ИИ разделяет стемы. Это может занять около минуты. Не закрывайте страницу.",
      queueAheadTpl: "Перед вами в очереди: {position}.",
      queueEtaTpl: "Ожидание: ~{seconds}с.",
      formatLabel: "Формат",
      downloadTitle: "Скачать",
      downloadHint: "Выберите стем для скачивания.",
      saveLabel: "Сохранить",
      selectedLabel: "Выбрано",
      reupload: "Загрузить заново",
      uploadFailed: "Ошибка загрузки",
      tryAgain: "Повторить",
      missingDemucsDeps: "На сервере отсутствуют зависимости Demucs. Свяжитесь со службой поддержки.",
      stems: { vocals: "Вокал", drums: "Барабаны", bass: "Бас", other: "Другое" },
      downloadStems: { vocals: "Скачать вокал", drums: "Скачать барабаны", bass: "Скачать бас", other: "Скачать другое" },
    },
    de: {
      howItWorksTag: "So funktioniert’s",
      howItWorksTitle: "Instrumente in 4 Stems trennen",
      howItWorksSubtitle: "Trenne Musik mit Demucs in Vocals, Drums, Bass und Other.",
      previewAlt: "Demucs-Vorschau",
      uploadingTitle: "Wird hochgeladen…",
      processingTitle: "4 Stems werden getrennt…",
      uploadingDesc: "Audio wird vorbereitet und hochgeladen.",
      processingDesc: "KI trennt die Stems. Das kann etwa eine Minute dauern. Bitte Seite geöffnet lassen.",
      queueAheadTpl: "Vor dir in der Warteschlange: {position}.",
      queueEtaTpl: "Geschätzte Wartezeit: {seconds}s.",
      formatLabel: "Format",
      downloadTitle: "Download",
      downloadHint: "Wähle einen Stem zum Herunterladen.",
      saveLabel: "Speichern",
      selectedLabel: "Ausgewählt",
      reupload: "Neu hochladen",
      uploadFailed: "Upload fehlgeschlagen",
      tryAgain: "Erneut versuchen",
      missingDemucsDeps: "Auf dem Server fehlen Demucs-Abhängigkeiten. Bitte Support kontaktieren.",
      stems: { vocals: "Vocals", drums: "Drums", bass: "Bass", other: "Other" },
      downloadStems: { vocals: "Vocals herunterladen", drums: "Drums herunterladen", bass: "Bass herunterladen", other: "Other herunterladen" },
    },
    pt: {
      howItWorksTag: "Como funciona",
      howItWorksTitle: "Separar instrumentos em 4 stems",
      howItWorksSubtitle: "Separe música em vocais, bateria, baixo e outros com Demucs.",
      previewAlt: "Prévia Demucs",
      uploadingTitle: "Enviando…",
      processingTitle: "Separando 4 stems…",
      uploadingDesc: "Preparando e enviando o áudio.",
      processingDesc: "A IA está separando os stems. Pode levar cerca de um minuto. Mantenha esta página aberta.",
      queueAheadTpl: "À sua frente na fila: {position}.",
      queueEtaTpl: "Espera estimada: {seconds}s.",
      formatLabel: "Formato",
      downloadTitle: "Baixar",
      downloadHint: "Escolha um stem para baixar.",
      saveLabel: "Salvar",
      selectedLabel: "Selecionado",
      reupload: "Enviar novamente",
      uploadFailed: "Falha no envio",
      tryAgain: "Tentar novamente",
      missingDemucsDeps: "O servidor está sem dependências do Demucs. Entre em contato com o suporte.",
      stems: { vocals: "Vocal", drums: "Bateria", bass: "Baixo", other: "Outros" },
      downloadStems: { vocals: "Baixar vocal", drums: "Baixar bateria", bass: "Baixar baixo", other: "Baixar outros" },
    },
    it: {
      howItWorksTag: "Come funziona",
      howItWorksTitle: "Separa strumenti in 4 stem",
      howItWorksSubtitle: "Separa musica in voce, batteria, basso e altro con Demucs.",
      previewAlt: "Anteprima Demucs",
      uploadingTitle: "Caricamento…",
      processingTitle: "Separazione 4 stem…",
      uploadingDesc: "Preparazione e caricamento dell’audio.",
      processingDesc: "L’IA sta separando gli stem. Potrebbe richiedere circa un minuto. Tieni aperta questa pagina.",
      queueAheadTpl: "Davanti in coda: {position}.",
      queueEtaTpl: "Attesa stimata: {seconds}s.",
      formatLabel: "Formato",
      downloadTitle: "Scarica",
      downloadHint: "Scegli uno stem da scaricare.",
      saveLabel: "Salva",
      selectedLabel: "Selezionato",
      reupload: "Carica di nuovo",
      uploadFailed: "Caricamento non riuscito",
      tryAgain: "Riprova",
      missingDemucsDeps: "Mancano le dipendenze Demucs sul server. Contatta l’assistenza.",
      stems: { vocals: "Voce", drums: "Batteria", bass: "Basso", other: "Altro" },
      downloadStems: { vocals: "Scarica voce", drums: "Scarica batteria", bass: "Scarica basso", other: "Scarica altro" },
    },
    ar: {
      howItWorksTag: "كيف يعمل",
      howItWorksTitle: "افصل الآلات إلى 4 مسارات",
      howItWorksSubtitle: "افصل الموسيقى إلى غناء وطبول وباص وآخر باستخدام Demucs.",
      previewAlt: "معاينة Demucs",
      uploadingTitle: "جارٍ الرفع…",
      processingTitle: "جارٍ فصل 4 مسارات…",
      uploadingDesc: "جارٍ تجهيز الصوت ورفعه للمعالجة.",
      processingDesc: "يقوم الذكاء الاصطناعي بفصل المسارات. قد يستغرق ذلك حوالي دقيقة. يُرجى إبقاء هذه الصفحة مفتوحة.",
      queueAheadTpl: "عدد المنتظرين قبلك: {position}.",
      queueEtaTpl: "الانتظار المتوقع: {seconds}ث.",
      formatLabel: "التنسيق",
      downloadTitle: "تنزيل",
      downloadHint: "اختر مسارًا للتنزيل.",
      saveLabel: "حفظ",
      selectedLabel: "محدد",
      reupload: "إعادة الرفع",
      uploadFailed: "فشل الرفع",
      tryAgain: "أعد المحاولة",
      missingDemucsDeps: "يفتقد الخادم لاعتمادات Demucs. يرجى التواصل مع الدعم.",
      stems: { vocals: "غناء", drums: "طبول", bass: "باص", other: "أخرى" },
      downloadStems: { vocals: "تنزيل الغناء", drums: "تنزيل الطبول", bass: "تنزيل الباص", other: "تنزيل أخرى" },
    },
    es: {
      howItWorksTag: "Cómo funciona",
      howItWorksTitle: "Separa instrumentos en 4 stems",
      howItWorksSubtitle: "Separa música en voz, batería, bajo y otros con Demucs.",
      previewAlt: "Vista previa Demucs",
      uploadingTitle: "Subiendo…",
      processingTitle: "Separando 4 stems…",
      uploadingDesc: "Preparando y subiendo el audio para procesarlo.",
      processingDesc: "La IA está separando los stems. Puede tardar alrededor de un minuto. Mantén esta página abierta.",
      queueAheadTpl: "Delante en la cola: {position}.",
      queueEtaTpl: "Espera estimada: {seconds}s.",
      formatLabel: "Formato",
      downloadTitle: "Descargar",
      downloadHint: "Elige un stem para descargar.",
      saveLabel: "Guardar",
      selectedLabel: "Seleccionado",
      reupload: "Volver a subir",
      uploadFailed: "Error al subir",
      tryAgain: "Reintentar",
      missingDemucsDeps: "Faltan dependencias de Demucs en el servidor. Contacta con soporte.",
      stems: { vocals: "Voz", drums: "Batería", bass: "Bajo", other: "Otros" },
      downloadStems: { vocals: "Descargar voz", drums: "Descargar batería", bass: "Descargar bajo", other: "Descargar otros" },
    },
    fr: {
      howItWorksTag: "Comment ça marche",
      howItWorksTitle: "Séparez les instruments en 4 stems",
      howItWorksSubtitle: "Séparez la musique en voix, batterie, basse et autres avec Demucs.",
      previewAlt: "Aperçu Demucs",
      uploadingTitle: "Envoi…",
      processingTitle: "Séparation en 4 stems…",
      uploadingDesc: "Préparation et envoi de l’audio.",
      processingDesc: "L’IA sépare les stems. Cela peut prendre environ une minute. Gardez cette page ouverte.",
      queueAheadTpl: "Devant vous dans la file : {position}.",
      queueEtaTpl: "Attente estimée : {seconds}s.",
      formatLabel: "Format",
      downloadTitle: "Télécharger",
      downloadHint: "Choisissez un stem à télécharger.",
      saveLabel: "Enregistrer",
      selectedLabel: "Sélectionné",
      reupload: "Renvoyer",
      uploadFailed: "Échec de l’envoi",
      tryAgain: "Réessayer",
      missingDemucsDeps: "Le serveur n’a pas les dépendances Demucs. Veuillez contacter le support.",
      stems: { vocals: "Voix", drums: "Batterie", bass: "Basse", other: "Autre" },
      downloadStems: { vocals: "Télécharger la voix", drums: "Télécharger la batterie", bass: "Télécharger la basse", other: "Télécharger autre" },
    },
  });

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadStem, setDownloadStem] = useState<StemKey>("vocals");

  const [urls, setUrls] = useState<Record<StemKey, string | null>>({
    vocals: null,
    drums: null,
    bass: null,
    other: null,
  });

  const [activeStem, setActiveStem] = useState<StemKey | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // === Refs ===
  const playheadRefs = useRef<Record<StemKey, HTMLDivElement | null>>({
    vocals: null,
    drums: null,
    bass: null,
    other: null,
  });
  const timeDisplayRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const audioRefs: Record<StemKey, React.RefObject<HTMLAudioElement | null>> = {
    vocals: useRef<HTMLAudioElement | null>(null),
    drums: useRef<HTMLAudioElement | null>(null),
    bass: useRef<HTMLAudioElement | null>(null),
    other: useRef<HTMLAudioElement | null>(null),
  };

  const containerRefs: Record<StemKey, React.RefObject<HTMLDivElement | null>> = {
    vocals: useRef<HTMLDivElement | null>(null),
    drums: useRef<HTMLDivElement | null>(null),
    bass: useRef<HTMLDivElement | null>(null),
    other: useRef<HTMLDivElement | null>(null),
  };

  const wsRefs: Record<StemKey, React.MutableRefObject<WaveSurfer | null>> = {
    vocals: useRef<WaveSurfer | null>(null),
    drums: useRef<WaveSurfer | null>(null),
    bass: useRef<WaveSurfer | null>(null),
    other: useRef<WaveSurfer | null>(null),
  };

  const wsLoadedUrlRef = useRef<Record<StemKey, string | null>>({
    vocals: null,
    drums: null,
    bass: null,
    other: null,
  });

  const [volumes, setVolumes] = useState<Record<StemKey, number>>({
    vocals: 80,
    drums: 80,
    bass: 80,
    other: 80,
  });

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
      if (value.startsWith("/")) return `${base.origin}${value}`;
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
    if (code === "FILE_TOO_LARGE") return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: detail?.max_mb ?? 200 });
    if (code === "DECODE_FAILED") return dictionary.errors.decodeFailed;
    if (code === "DURATION_TOO_SHORT") {
      return formatTemplate(dictionary.errors.durationTooShort, { min_seconds: detail?.min_seconds ?? 15 });
    }
    if (code === "DAILY_LIMIT_REACHED") return formatTemplate(dictionary.errors.dailyLimitReached, { limit: detail?.limit ?? 10 });
    if (code === "UNSUPPORTED_FILE_TYPE") return dictionary.errors.unsupportedFileType;
    if (code === "demucs_not_installed") {
      return ui.missingDemucsDeps;
    }
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

  const stemLabel = (stem: StemKey) => {
    return ui.stems[stem];
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time)) return "00:00.0";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 10);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${ms}`;
  };

  // ... (Load billing, Restore state, Save state effects unchanged)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = await getValidAccessToken();
      if (!token) {
        if (!cancelled) setSubscriptionActive(null);
        return;
      }
      try {
        const res = await fetch("/api/billing/status", { headers: { Authorization: `Bearer ${token}` } });
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
      const saved = JSON.parse(raw) as any;
      if (saved.taskId && saved.phase) {
        setTaskId(saved.taskId);
        setPhase(saved.phase);
        setPosition(saved.position || 0);
        setEtaSeconds(typeof saved.etaSeconds === "number" ? saved.etaSeconds : 0);
        setProcessingStartedAt(typeof saved.startedAt === "number" ? saved.startedAt : saved.savedAt || null);
        const restoredUrls = saved.urls ?? {};
        if (Object.keys(restoredUrls).length) {
          setUrls((prev) => ({
            ...prev,
            ...(Object.fromEntries(
              Object.entries(restoredUrls).map(([k, v]) => [k, normalizeBackendUrl(v as string)])
            ) as any),
          }));
        }
      }
    } catch (err) {
      console.error("restore state failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (phase === "processing" || phase === "done") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          taskId,
          phase,
          urls,
          position,
          etaSeconds,
          startedAt: processingStartedAt ?? undefined,
          savedAt: Date.now(),
        })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [phase, taskId, urls, position, etaSeconds, processingStartedAt]);

  useEffect(() => {
    if (phase !== "processing") setEtaSeconds(0);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    setActiveStem((prev) => prev ?? "vocals");
  }, [phase]);

  // ... (Polling effect unchanged)
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

          const res = await fetch(`${apiBase}/demucs/tasks/${taskId}`, {
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
            setUrls({
              vocals: normalizeBackendUrl(data.vocals_url || data.vocalsUrl),
              drums: normalizeBackendUrl(data.drums_url || data.drumsUrl),
              bass: normalizeBackendUrl(data.bass_url || data.bassUrl),
              other: normalizeBackendUrl(data.other_url || data.otherUrl),
            });
            setActiveStem("vocals");
            setPhase("done");
            setMessage("");
            setEtaSeconds(0);
            if (timer) clearInterval(timer);

             try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ external_task_id: taskId, source_url: `task:${taskId}`, status: "completed", model: "demucs", progress: 1, result_url: data.vocals_url || data.vocalsUrl || null }) }); } catch {}
          } else if (data.status === "failed") {
            setPhase("error");
            setMessage(data.error || "处理失败");
            setEtaSeconds(0);
            if (timer) clearInterval(timer);

             try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ external_task_id: taskId, source_url: `task:${taskId}`, status: "failed", model: "demucs", progress: 1, result_url: null }) }); } catch {}
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

  // ... (Upload handlers unchanged)
  const handleUpload = async (file: File) => {
    setMessage("");
    setPhase("uploading");
    setUrls({ vocals: null, drums: null, bass: null, other: null });
    setTaskId(null);
    setPosition(0);
    setActiveStem(null);
    setProcessingStartedAt(null);

    try {
      const token = await getValidAccessToken();
      if (!token) {
        router.push(`/${locale}/auth/login`);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiBase}/demucs/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await safeJson(res);
      if (!res.ok) {
        if (res.status === 401) { router.push(`/${locale}/auth/login`); return; }
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

      try { await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ external_task_id: data.task_id, source_url: file.name, status: "queued", model: "demucs", progress: 0, result_url: null }) }); } catch (err) { if (!isAbortError(err)) console.error("record job failed", err); }
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

  const setStemVolumeLive = (stem: StemKey, v: number, commit: boolean) => {
    const value = clamp(Math.round(v), 0, 100);
    const audio = audioRefs[stem].current;
    if (audio) audio.volume = value / 100;
    if (commit) {
      setVolumes((prev) => ({ ...prev, [stem]: value }));
    }
  };

  // ... (WaveSurfer Setup unchanged)
  const setupWaveSurfer = (stem: StemKey) => {
    const container = containerRefs[stem].current;
    const audio = audioRefs[stem].current;
    const url = urls[stem];

    if (!container || !audio || !url) return;

    const existing = wsRefs[stem].current;
    const previousUrl = wsLoadedUrlRef.current[stem];

    if (existing && previousUrl === url) return;

    if (existing) existing.destroy();
    container.innerHTML = "";

    const { wave } = TRACK_COLORS[stem];
    const ws = WaveSurfer.create({
      container,
      backend: "MediaElement",
      media: audio,
      height: LANE_HEIGHT,
      waveColor: wave,
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

    try {
      const ret = (ws as any).load(url);
      if (ret && typeof ret.then === "function") {
        ret.catch((err: unknown) => {
          if (!isAbortError(err)) console.error("wavesurfer load failed", err);
        });
      }
    } catch (err) {
      if (!isAbortError(err)) console.error("wavesurfer load failed", err);
    }

    const initialVolume = (volumes[stem] ?? 60) / 100;
    ws.setVolume(initialVolume);
    audio.volume = initialVolume;

    wsRefs[stem].current = ws;
    wsLoadedUrlRef.current[stem] = url;
  };

  useEffect(() => {
    if (phase !== "done") return;
    DISPLAY_STEMS.forEach((stem) => setupWaveSurfer(stem));
  }, [phase, urls.vocals, urls.drums, urls.bass, urls.other]);

  // === 同步可视化逻辑 ===
  const syncVisuals = () => {
    const master = audioRefs[MASTER_STEM].current;
    if (!master) return;
    
    const t = master.currentTime;
    const d = Number.isFinite(master.duration) ? master.duration : (duration || 1);
    const p = d > 0 ? (t / d) * 100 : 0;

    // 1. 同步所有轨道的 Playhead
    STEMS.forEach((stem) => {
      const el = playheadRefs.current[stem];
      if (el) {
        el.style.left = `${p}%`;
      }
    });

    // 2. 同步时间显示
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = formatTime(t);
    }
  };

  const seekAll = (t: number) => {
    const time = clamp(t, 0, duration || 0);
    STEMS.forEach((stem) => {
      const audio = audioRefs[stem].current;
      if (!audio) return;
      try { audio.currentTime = time; } catch {}
    });

    // 更新 State 保持逻辑同步
    setCurrentTime(time);
    // 立即更新视觉
    syncVisuals();
  };

  // === 播放控制循环 ===
  useEffect(() => {
    if (phase !== "done") return;
    const master = audioRefs[MASTER_STEM].current;
    if (!master) return;

    const tick = () => {
      syncVisuals();
      if (!master.paused) {
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
      setCurrentTime(master.currentTime);
      syncVisuals();
    };
    
    const onEnded = () => {
        setIsPlaying(false);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setCurrentTime(0);
        syncVisuals();
    }
    const onMeta = () => setDuration(Number.isFinite(master.duration) ? master.duration : 0);
    
    master.addEventListener("loadedmetadata", onMeta);
    master.addEventListener("ended", onEnded);
    master.addEventListener("play", onPlay);
    master.addEventListener("pause", onPause);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      master.removeEventListener("loadedmetadata", onMeta);
      master.removeEventListener("ended", onEnded);
      master.removeEventListener("play", onPlay);
      master.removeEventListener("pause", onPause);
    };
  }, [phase, urls.vocals]);

  useEffect(() => {
    return () => {
      STEMS.forEach((stem) => {
        wsRefs[stem].current?.destroy();
        wsRefs[stem].current = null;
      });
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pauseAll = () => {
    STEMS.forEach((stem) => {
      const ws = wsRefs[stem].current;
      if (ws?.isPlaying()) ws.pause();
      audioRefs[stem].current?.pause();
    });
  };

  const togglePlay = () => {
    const master = audioRefs[MASTER_STEM].current;
    if (!master) return;

    if (!isPlaying) {
      const t = master.currentTime || 0;
      // 对齐所有轨道
      STEMS.forEach((stem) => {
        const audio = audioRefs[stem].current;
        if (audio && Math.abs(audio.currentTime - t) > 0.1) audio.currentTime = t;
      });
      
      Promise.allSettled(
        STEMS.map(async (stem) => {
          const audio = audioRefs[stem].current;
          if (audio) await audio.play();
        })
      ).catch(console.error);
    } else {
      STEMS.forEach((stem) => audioRefs[stem].current?.pause());
    }
  };

  const resetPlayhead = () => {
    seekAll(0);
  };

  // 修改后的 handleDownload
  const handleDownload = async (stem: StemKey) => {
     if (!taskId) return;
     
     // 标记下载中
     setDownloadingItems((prev) => ({ ...prev, [stem]: true }));

    try {
      const token = await getValidAccessToken();
      if (!token) { router.push(`/${locale}/auth/login`); return; }
      const isSubscribed = subscriptionActive === true;
      const fmt: "mp3" | "wav" = isSubscribed ? downloadFormat : "mp3";

      if (!isSubscribed && fmt === "wav") { setMessage(dictionary.errors.wavDownloadRequiresSubscription); router.push(`/${locale}/billing`); return; }

      const res = await fetch(`${apiBase}/demucs/download/${taskId}/${stem}?format=${fmt}`, { headers: { Authorization: `Bearer ${token}` }, });

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
      a.download = `${stem}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) { 
        console.error("download failed", err); 
    } finally {
        // 重置下载状态
        setDownloadingItems((prev) => ({ ...prev, [stem]: false }));
    }
  };

  const renderIdle = () => {
      const playerImageSrc =
        locale === "zh"
          ? "/remover/player_zh.png"
          : locale === "ja"
            ? "/remover/player_ja.png"
            : "/remover/player_en.png";

      return (
        <>
          <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#17171e] px-4 py-20 text-white">
            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
              <span className="mb-6 text-sm font-medium tracking-wide text-indigo-300">
                {ui.howItWorksTag}
              </span>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {ui.howItWorksTitle}
              </h1>
              <p className="mb-12 max-w-2xl text-lg text-slate-300 md:text-xl">
                {ui.howItWorksSubtitle}
              </p>
              <div className="mb-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
                <img src={playerImageSrc} alt={ui.previewAlt} className="w-full" />
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
            <Faq title={dictionary.faq.title} items={(dictionary.faq as any).demucs || dictionary.faq.demix} />
          </section>
        </>
      );
  };

  const renderProcessing = () => (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#17171e] px-6 text-center text-foreground">
      <div className="relative flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/30 px-10 py-12 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white shadow-lg">♫</div>
        <h2 className="text-3xl font-bold">
          {phase === "uploading"
            ? ui.uploadingTitle
            : ui.processingTitle}
        </h2>
        <p className="text-base text-muted-foreground">
          {phase === "uploading" ? (
            ui.uploadingDesc
          ) : (
            <>
              {ui.processingDesc}
              {position > 0 ? (
                <> {formatTemplate(ui.queueAheadTpl, { position })}</>
              ) : null}
              {etaSeconds > 0 ? (
                <> {formatTemplate(ui.queueEtaTpl, { seconds: Math.max(0, Math.round(etaSeconds)) })}</>
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

  const renderDone = () => {
    const playheadPercent = duration ? Math.min(1, currentTime / duration) : 0;
    const formatLabel = ui.formatLabel;
    const downloadTitle = ui.downloadTitle;
    const downloadHint = ui.downloadHint;
    const saveLabel = ui.saveLabel;
    const selectedLabel = ui.selectedLabel;

    const openDownloadDialog = () => {
      setDownloadStem(activeStem ?? "vocals");
      setDownloadDialogOpen(true);
    };

    const downloadLabel = (stem: StemKey) => {
        return ui.downloadStems[stem];
    };

    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#17171e] text-foreground">
        {/* 修复：移除 src，添加 crossOrigin */}
        {STEMS.map((stem) => (
          <audio key={stem} ref={audioRefs[stem]} crossOrigin="anonymous" />
        ))}
        
        <main className="flex w-full flex-1 flex-col items-center justify-center px-2 pb-44 pt-12 sm:px-4 sm:pb-32 sm:pt-14">
          <div className="w-full max-w-[1600px] overflow-x-auto overflow-y-hidden shadow-2xl shadow-black/50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-hidden">
            <div className="flex min-w-[880px] flex-col sm:min-w-0">
              {DISPLAY_STEMS.map((stem, index) => {
                const colors = TRACK_COLORS[stem];
                const isLast = index === DISPLAY_STEMS.length - 1;

                return (
                  <div key={stem} className="flex w-full" style={{ height: LANE_HEIGHT }}>
                    <div
                      className="w-32 shrink-0 border-b border-black/20 px-3 sm:w-48 sm:px-4 flex items-center justify-between gap-2"
                      style={{ backgroundColor: '#18181b', borderRight: '1px solid #333' }}
                    >
                      <span className="min-w-0 truncate text-xs font-medium tracking-wide text-gray-300 sm:text-sm">
                        {stemLabel(stem)}
                      </span>
                      <MixerSlider
                        value={volumes[stem]}
                        onLiveChange={(v) => setStemVolumeLive(stem, v, false)}
                        onCommit={(v) => setStemVolumeLive(stem, v, true)}
                      />
                    </div>

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
                      <div ref={containerRefs[stem]} className="absolute inset-0" />
                      
                      {/* Playhead Line */}
                      <div
                        // 绑定 Ref 到 playheadRefs
                        ref={(el) => { playheadRefs.current[stem] = el; }}
                        className="pointer-events-none absolute top-0 bottom-0 w-[1px] bg-white z-10"
                        // 初始样式保留，但播放时会被 style 覆盖
                        style={{ left: `${playheadPercent * 100}%` }}
                      />
                      
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
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              onClick={togglePlay}
              disabled={!activeStem}
            >
              <Play className="h-4 w-4" />
              {isPlaying
                ? pickLocale(locale, {
                    zh: "暂停",
                    en: "Pause",
                    ja: "一時停止",
                    ko: "일시정지",
                    ru: "Пауза",
                    de: "Pause",
                    pt: "Pausar",
                    it: "Pausa",
                    ar: "إيقاف مؤقت",
                    es: "Pausar",
                    fr: "Pause",
                  })
                : pickLocale(locale, {
                    zh: "播放",
                    en: "Play",
                    ja: "再生",
                    ko: "재생",
                    ru: "Воспроизвести",
                    de: "Abspielen",
                    pt: "Reproduzir",
                    it: "Riproduci",
                    ar: "تشغيل",
                    es: "Reproducir",
                    fr: "Lire",
                  })}
            </button>
            <button
              className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              onClick={resetPlayhead}
              disabled={!activeStem}
            >
              <SkipBack className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-black/10 px-2 py-1 text-sm text-foreground">
              <span className="px-2 text-muted-foreground">{formatLabel}</span>
              <button
                className={"rounded-full px-3 py-1 transition-colors " + ((subscriptionActive !== true || downloadFormat === "mp3") ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5")}
                onClick={() => setDownloadFormat("mp3")}
              >
                {dictionary.errors.mp3}
              </button>
              {subscriptionActive !== true ? (
                <HoverCard openDelay={150}>
                  <HoverCardTrigger asChild>
                    <button type="button" aria-disabled="true" className="cursor-not-allowed rounded-full px-3 py-1 text-slate-400" onClick={() => { setMessage(dictionary.errors.wavDownloadRequiresSubscription); router.push(`/${locale}/billing`); }}>{dictionary.errors.wav}</button>
                  </HoverCardTrigger>
                  <HoverCardContent align="end" className="w-72">
                    <div className="text-sm text-foreground">{dictionary.errors.wavDownloadRequiresSubscription}</div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <button type="button" className={"rounded-full px-3 py-1 transition-colors " + (downloadFormat === "wav" ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5")} onClick={() => setDownloadFormat("wav")}>{dictionary.errors.wav}</button>
              )}
            </div>

            <Button className="rounded-full px-3 sm:px-4" variant="secondary" onClick={openDownloadDialog} disabled={!taskId}>{downloadTitle}</Button>
            <Button variant="outline" className="rounded-full px-4 sm:px-6" onClick={() => { pauseAll(); setIsPlaying(false); setPhase("idle"); setMessage(""); setTaskId(null); setActiveStem(null); setUrls({ vocals: null, drums: null, bass: null, other: null }); }}>{ui.reupload}</Button>
          </div>
        </footer>

        {/* Download Dialog */}
        <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{downloadTitle}</DialogTitle>
              <DialogDescription>{downloadHint}</DialogDescription>
            </DialogHeader>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-300">{selectedLabel}</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                <span className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: TRACK_COLORS[downloadStem].wave }} />
                {stemLabel(downloadStem)}
              </div>
            </div>

            <div role="radiogroup" aria-label="stems" className="mt-3 space-y-1">
              {DISPLAY_STEMS.map((stem) => {
                const selected = downloadStem === stem;
                return (
                  <button key={stem} type="button" role="radio" aria-checked={selected} className={"flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition " + (selected ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5")} onClick={() => setDownloadStem(stem)}>
                    <span className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: TRACK_COLORS[stem].wave }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{stemLabel(stem)}</div>
                      <div className="text-xs text-slate-300">{downloadLabel(stem)}</div>
                    </div>
                    <div className={selected ? "text-white/80" : "text-white/30"}>{selected ? "›" : ""}</div>
                  </button>
                );
              })}
            </div>
            
            <DialogFooter>
               <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <Button 
                    className="rounded-full px-10" 
                    onClick={() => { 
                        // 不关闭对话框，等待下载开始 
                        // 或者点击后关闭，但按钮本身有 loading 态
                        // 这里逻辑是点击 Save 后开始下载
                        handleDownload(downloadStem); 
                    }}
                    disabled={downloadingItems[downloadStem]}
                  >
                    {downloadingItems[downloadStem] ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {saveLabel}
                        </>
                    ) : (
                        saveLabel
                    )}
                  </Button>
               </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (phase === "idle") return renderIdle();
  if (phase === "uploading" || phase === "processing") return renderProcessing();
  if (phase === "done") return renderDone();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#17171e] px-4 py-16 text-center text-white">
      <h2 className="text-2xl font-bold">{ui.uploadFailed}</h2>
      <p className="mt-3 max-w-xl text-sm text-slate-300">{message || dictionary.errors.uploadFailed}</p>
      <div className="mt-8 flex items-center gap-3">
        <Button variant="secondary" className="rounded-full" onClick={() => { setPhase("idle"); setMessage(""); }}>{ui.tryAgain}</Button>
        <Button className="rounded-full" onClick={() => fileInputRef.current?.click()}>{dictionary.home.uploadCta}</Button>
      </div>
      <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={onSelectFile} />
    </div>
  );
}
