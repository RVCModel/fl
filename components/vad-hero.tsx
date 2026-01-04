"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import WaveSurfer from "wavesurfer.js"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Faq } from "@/components/faq"
import type { Dictionary } from "@/i18n/dictionaries"
import { getValidAccessToken } from "@/lib/auth-client"
import { Loader2, Pause, Play, ZoomIn, ZoomOut, SkipBack, SkipForward, X, Trash2 } from "lucide-react"

type Phase = "idle" | "uploading" | "processing" | "done" | "error"

type VadSegment = {
  start: number
  end: number
  duration?: number
}

const WAVE_HEIGHT = 128
const VAD_TRACK = { bg: "#1b1b25", wave: "#a78bfa", progress: "#6366f1" }
const DEFAULT_ZOOM = 50

const MARKER_COLORS = {
  default: { bg: "#6366f1", border: "#818cf8", text: "#0f0f1a" },
  selected: { bg: "#a78bfa", border: "#c4b5fd", text: "#0f0f1a" },
  hover: { bg: "#8b5cf6", border: "#a78bfa", text: "#0f0f1a" },
}

function formatTime(time: number) {
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  const ms = Math.floor((time % 1) * 1000)
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`
}

function formatTimeShort(time: number) {
  const mins = Math.floor(time / 60)
  const secs = Math.floor(time % 60)
  const ms = Math.floor((time % 1) * 100)
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(2, "0")}`
}

const sanitizeExportPrefix = (value: string) => value.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 64)
const sanitizeExportSuffix = (value: string) => value.replace(/[^0-9]+/g, "").slice(0, 8)
const sanitizeNumberInput = (value: string) => value.replace(/[^0-9]+/g, "").slice(0, 6)

export default function VadHero({
  dictionary,
  locale,
}: {
  dictionary: Dictionary
  locale: string
}) {
  const isZh = locale === "zh"
  const labels = {
    title: isZh ? "语音标记" : "Speech Markers",
    subtitle: isZh ? "上传音频后自动识别并标记人声区间" : "Upload audio to detect and mark speech segments.",
    upload: isZh ? "上传音频" : "Upload audio",
    uploading: isZh ? "上传中…" : "Uploading…",
    processing: isZh ? "AI 识别中…" : "Detecting speech…",
    drop: isZh ? "拖拽音频到这里或点击上传" : "Drop audio here or click to upload",
    retry: isZh ? "重新上传" : "Re-upload",
    play: isZh ? "播放" : "Play",
    pause: isZh ? "暂停" : "Pause",
    track: isZh ? "主轨道" : "Main Track",
    zoom: isZh ? "缩放" : "Zoom",
    markers: isZh ? "标记" : "Markers",
    markerList: isZh ? "标记列表" : "Marker List",
    name: isZh ? "名称" : "Name",
    start: isZh ? "开始" : "Start",
    end: isZh ? "结束" : "End",
    duration: isZh ? "时长" : "Duration",
    type: isZh ? "类型" : "Type",
    cue: isZh ? "提示点" : "Cue",
    actions: isZh ? "操作" : "Actions",
    delete: isZh ? "删除" : "Delete",
    empty: isZh ? "未检测到人声区间" : "No speech detected.",
    positionTpl: isZh ? "前方排队：{position}" : "Queue: {position}",
    etaTpl: isZh ? "预计：{seconds}s" : "ETA: {seconds}s",
    export: isZh ? "导出设置" : "Export",
    filePrefix: isZh ? "文件前缀" : "Prefix",
    fileSuffix: isZh ? "文件后缀" : "Suffix",
    filePreview: isZh ? "文件预览" : "Preview",
    sampleRate: isZh ? "采样率" : "Sample Rate",
    channels: isZh ? "声道" : "Channels",
    bitDepth: isZh ? "位深度" : "Bit Depth",
    format: isZh ? "格式" : "Format",
    exportAction: isZh ? "导出" : "Export",
    mono: isZh ? "单声道" : "Mono",
    stereo: isZh ? "立体声" : "Stereo",
    custom: isZh ? "自定义" : "Custom",
  }

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const waveContainerRef = useRef<HTMLDivElement | null>(null)
  const timelineContainerRef = useRef<HTMLDivElement | null>(null)
  const markerTrackRef = useRef<HTMLDivElement | null>(null)
  const markerLinesRef = useRef<HTMLDivElement | null>(null)

  const waveSurferRef = useRef<WaveSurfer | null>(null)
  const regionsPluginRef = useRef<any>(null)

  const [phase, setPhase] = useState<Phase>("idle")
  const [taskId, setTaskId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [uploadPercent, setUploadPercent] = useState(0)
  const [position, setPosition] = useState(0)
  const [etaSeconds, setEtaSeconds] = useState(0)

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [segments, setSegments] = useState<VadSegment[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM)
  const [regionsReady, setRegionsReady] = useState(0)
  const [waveReady, setWaveReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [editingCell, setEditingCell] = useState<{ index: number; field: "start" | "end" } | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const [editError, setEditError] = useState("")
  const [exportPrefix, setExportPrefix] = useState("0")
  const [exportSuffix, setExportSuffix] = useState("0")
  const [exportFormat, setExportFormat] = useState<"mp3" | "wav">("mp3")
  const [sampleRatePreset, setSampleRatePreset] = useState("44100")
  const [sampleRateCustom, setSampleRateCustom] = useState("")
  const [bitDepthPreset, setBitDepthPreset] = useState("32")
  const [bitDepthCustom, setBitDepthCustom] = useState("")
  const [channelMode, setChannelMode] = useState<"mono" | "stereo">("mono")
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState("")
  const [exportError, setExportError] = useState("")
  const STORAGE_KEY = "vofl:vad-state"
  const dragDepthRef = useRef(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const scrollLeftRef = useRef(0)
  const scrollRafRef = useRef<number | null>(null)
  const pendingScrollLeftRef = useRef(0)
  const playSegmentRef = useRef<{ start: number; end: number } | null>(null)
  const taskCreatedAtRef = useRef<number | null>(null)

  const rawApiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
  const apiBase = (() => {
    const trimmed = String(rawApiBase).replace(/\/+$/, "")
    if (typeof window !== "undefined" && window.location.protocol === "https:" && trimmed.startsWith("http://")) {
      return `https://${trimmed.slice("http://".length)}`
    }
    return trimmed
  })()

  const normalizeBackendUrl = (url?: string | null) => {
    if (!url) return null
    const raw = String(url)
    if (raw.startsWith("http")) return raw
    if (raw.startsWith("/")) return `${apiBase}${raw}`
    return raw
  }

  async function safeJson(res: Response) {
    try {
      return await res.json()
    } catch {
      return {}
    }
  }

  const formatTemplate = (tpl: string, vars: Record<string, string | number | undefined>) => {
    return tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""))
  }

  const getApiErrorMessage = (res: Response, data: any) => {
    const detail = data?.detail ?? data ?? {}
    const code = detail?.code
    if (code === "FILE_TOO_LARGE")
      return formatTemplate(dictionary.errors.fileTooLarge, { max_mb: detail?.max_mb ?? 200 })
    if (code === "DECODE_FAILED") return dictionary.errors.decodeFailed
    if (code === "DURATION_TOO_SHORT")
      return formatTemplate(dictionary.errors.durationTooShort, { min_seconds: detail?.min_seconds ?? 15 })
    if (code === "UNSUPPORTED_FILE_TYPE") return dictionary.errors.unsupportedFileType
    return dictionary.errors.uploadFailed
  }

  const handleUpload = async (file: File) => {
    const token = await getValidAccessToken()
    if (!token) {
      router.push(`/${locale}/auth/login`)
      return
    }
    taskCreatedAtRef.current = null

    setPhase("uploading")
    setMessage("")
    setUploadPercent(0)
    setAudioUrl(null)
    setSegments([])
    playSegmentRef.current = null
    setExportStatus("")
    setExportError("")
    setExporting(false)

    try {
      const initRes = await fetch(`${apiBase}/vad/upload/init`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, size_bytes: file.size, chunk_size_bytes: 20 * 1024 * 1024 }),
      })
      const initData = await safeJson(initRes)
      if (!initRes.ok) throw new Error(getApiErrorMessage(initRes, initData))

      const uploadId = initData.upload_id
      const chunkSize = initData.chunk_size_bytes
      const totalParts = Math.ceil(file.size / chunkSize)

      for (let i = 0; i < totalParts; i++) {
        const start = i * chunkSize
        const end = Math.min(file.size, start + chunkSize)
        const fd = new FormData()
        fd.append("upload_id", uploadId)
        fd.append("index", String(i))
        fd.append("total_parts", String(totalParts))
        fd.append("filename", file.name)
        fd.append("chunk", file.slice(start, end), file.name)

        const partRes = await fetch(`${apiBase}/vad/upload/chunk`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        if (!partRes.ok) throw new Error(dictionary.errors.uploadFailed)
        setUploadPercent(Math.round((end / file.size) * 100))
      }

      const completeRes = await fetch(`${apiBase}/vad/upload/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ upload_id: uploadId }),
      })
      const data = await safeJson(completeRes)
      if (!completeRes.ok) throw new Error(getApiErrorMessage(completeRes, data))

      setTaskId(data.task_id)
      setPhase("processing")
    } catch (err: any) {
      setPhase("error")
      setMessage(err.message || dictionary.errors.uploadFailed)
    }
  }

  const applyScrollLeft = (left: number) => {
    scrollLeftRef.current = left
    const translate = `translateX(-${left}px)`
    if (markerTrackRef.current) markerTrackRef.current.style.transform = translate
    if (markerLinesRef.current) markerLinesRef.current.style.transform = translate
    if (timelineContainerRef.current) timelineContainerRef.current.style.transform = translate
  }

  const scheduleScrollUpdate = (left: number) => {
    pendingScrollLeftRef.current = left
    if (scrollRafRef.current !== null) return
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null
      applyScrollLeft(pendingScrollLeftRef.current)
    })
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const saved = JSON.parse(raw) as any
      const maxAgeMs = 24 * 60 * 60 * 1000
      if (saved.savedAt && Date.now() - saved.savedAt > maxAgeMs) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }
      if (saved.taskId && saved.phase) {
        taskCreatedAtRef.current = typeof saved.createdAt === "number" ? saved.createdAt : saved.savedAt || null
        setTaskId(saved.taskId)
        setPhase(saved.phase)
        setAudioUrl(normalizeBackendUrl(saved.audioUrl))
        setSegments(Array.isArray(saved.segments) ? saved.segments : [])
        setPosition(saved.position || 0)
        setEtaSeconds(typeof saved.etaSeconds === "number" ? saved.etaSeconds : 0)
      }
    } catch (err) {
      console.error("restore vad state failed", err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (phase === "processing" || phase === "done") {
      if (!taskCreatedAtRef.current) taskCreatedAtRef.current = Date.now()
      const payload = {
        taskId,
        phase,
        audioUrl,
        segments,
        position,
        etaSeconds,
        createdAt: taskCreatedAtRef.current,
        savedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [phase, taskId, audioUrl, segments, position, etaSeconds])

  useEffect(() => {
    if (phase !== "processing" && phase !== "done") return
    const timer = setInterval(() => {
      const createdAt = taskCreatedAtRef.current
      if (!createdAt) return
      if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
        resetToIdle("error", dictionary.errors.taskNotFoundOrExpired)
      }
    }, 60 * 1000)
    return () => clearInterval(timer)
  }, [phase, dictionary.errors.taskNotFoundOrExpired])

  useEffect(() => {
    if (phase !== "processing" || !taskId) return
    const timer = setInterval(async () => {
      const token = await getValidAccessToken()
      try {
        const res = await fetch(`${apiBase}/vad/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await safeJson(res)
        if (data.status === "completed") {
          setAudioUrl(data.input_mp3_url || data.input_url)
          setSegments(data.segments || [])
          setPhase("done")
          clearInterval(timer)
        } else if (data.status === "failed") {
          setPhase("error")
          setMessage(data.error || dictionary.errors.uploadFailed)
          clearInterval(timer)
        } else {
          setPosition(data.position || 0)
          setEtaSeconds(data.eta_seconds || 0)
        }
      } catch {
        /* ignore */
      }
    }, 2000)
    return () => clearInterval(timer)
  }, [phase, taskId, apiBase])

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase !== "done" || !audioUrl || !waveContainerRef.current || !timelineContainerRef.current) return

    if (waveSurferRef.current) {
      waveSurferRef.current.destroy()
      waveSurferRef.current = null
    }

    setWaveReady(false)
    const ws = WaveSurfer.create({
      container: waveContainerRef.current,
      backend: "WebAudio",
      height: WAVE_HEIGHT,
      waveColor: VAD_TRACK.wave,
      progressColor: VAD_TRACK.progress,
      cursorColor: "#c4b5fd",
      cursorWidth: 1,
      minPxPerSec: zoomLevel,
      autoCenter: false,
      autoScroll: true,
      fillParent: true,
      hideScrollbar: false,
      normalize: true,
      interact: true,
    })

    const regions = ws.registerPlugin(RegionsPlugin.create())
    regionsPluginRef.current = regions
    setRegionsReady((v) => v + 1)

    ws.registerPlugin(
      TimelinePlugin.create({
        container: timelineContainerRef.current,
        height: 28,
        timeInterval: 0.5,
        primaryLabelInterval: 5,
        secondaryLabelInterval: 1,
        style: {
          fontSize: "10px",
          color: "#9aa0b5",
        },
      }),
    )

    waveSurferRef.current = ws

    const wrapper = ws.getWrapper()
    const scrollEl = wrapper.parentElement || wrapper
    const handleScroll = () => {
      scheduleScrollUpdate(scrollEl.scrollLeft)
    }
    scrollEl.addEventListener("scroll", handleScroll, { passive: true })

    const offScroll = ws.on("scroll", (_start, _end, left) => {
      const nextLeft = typeof left === "number" ? left : ws.getScroll()
      scheduleScrollUpdate(nextLeft)
    })

    const handleWheel = (e: WheelEvent) => {
      if (!waveSurferRef.current) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        const rect = scrollEl.getBoundingClientRect()
        const x = e.clientX - rect.left
        const scrollLeftVal = ws.getScroll()
        const pointerTime = (scrollLeftVal + x) / ws.options.minPxPerSec

        const delta = e.deltaY > 0 ? -15 : 15
        const newZoom = Math.min(Math.max(ws.options.minPxPerSec + delta, 10), 800)

        ws.zoom(newZoom)
        setZoomLevel(newZoom)

        const newScrollLeft = Math.max(0, pointerTime * newZoom - x)
        ws.setScroll(newScrollLeft)
        scheduleScrollUpdate(newScrollLeft)
      }
    }

    const waveContainer = waveContainerRef.current
    waveContainer.addEventListener("wheel", handleWheel, { passive: false })

    const loadWaveform = async () => {
      let peaks: number[] | number[][] | null = null
      let peakDuration: number | undefined
      const token = await getValidAccessToken()

      if (token) {
        try {
          const res = await fetch(`${apiBase}/waveform/vad/${taskId}/input`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const data = await safeJson(res)
          if (res.ok && data.peaks) {
            peaks = data.peaks
            peakDuration = data.duration
          }
        } catch {
          /* ignore */
        }
      }

      if (token) {
        try {
          const audioRes = await fetch(audioUrl, { headers: { Authorization: `Bearer ${token}` } })
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer()
            const blob = new Blob([arrayBuffer])
            ;(ws as any).loadBlob(blob, peaks ?? undefined, peakDuration)
            return
          }
          if (audioRes.status === 404 || audioRes.status === 410) {
            resetToIdle("error", dictionary.errors.taskNotFoundOrExpired)
            return
          }
        } catch {
          /* ignore */
        }
      }
      try {
        ;(ws as any).load(audioUrl, peaks ?? undefined, peakDuration)
      } catch {
        resetToIdle("error", dictionary.errors.taskNotFoundOrExpired)
      }
    }

    loadWaveform()

    let animationFrameId: number | null = null
    const updateTime = () => {
      if (!waveSurferRef.current) return
      const now = waveSurferRef.current.getCurrentTime()
      const seg = playSegmentRef.current
      if (seg && now >= seg.end) {
        waveSurferRef.current.pause()
        waveSurferRef.current.setTime(seg.end)
        playSegmentRef.current = null
        setCurrentTime(seg.end)
        return
      }
      setCurrentTime(now)
      animationFrameId = requestAnimationFrame(updateTime)
    }

    ws.on("ready", () => {
      setWaveReady(true)
      setDuration(ws.getDuration())
      scheduleScrollUpdate(ws.getScroll())
    })

    ws.on("error", () => {
      resetToIdle("error", dictionary.errors.taskNotFoundOrExpired)
    })

    ws.on("interaction", (newTime) => {
      setCurrentTime(newTime)
    })

    ws.on("play", () => {
      setIsPlaying(true)
      animationFrameId = requestAnimationFrame(updateTime)
    })

    ws.on("pause", () => {
      setIsPlaying(false)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    })

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      waveContainer.removeEventListener("wheel", handleWheel)
      scrollEl.removeEventListener("scroll", handleScroll)
      offScroll()
      ws.destroy()
    }
  }, [phase === "done" ? audioUrl : null])

  useEffect(() => {
    scheduleScrollUpdate(scrollLeftRef.current)
  }, [duration, zoomLevel])

  useEffect(() => {
    const regions = regionsPluginRef.current
    if (!regions || !waveReady) return
    regions.clearRegions()
    segments.forEach((seg, index) => {
      const isSelected = selectedIndex === index
      const isHovered = hoveredIndex === index
      regions.addRegion({
        id: `seg-${index}`,
        start: seg.start,
        end: seg.end,
        color: isSelected
          ? "rgba(99, 102, 241, 0.2)"
          : isHovered
            ? "rgba(139, 92, 246, 0.16)"
            : "rgba(99, 102, 241, 0.1)",
        drag: false,
        resize: false,
      })
    })
  }, [segments, selectedIndex, hoveredIndex, regionsReady, waveReady])

  const handleSegmentClick = (index: number) => {
    setSelectedIndex(index)
    const ws = waveSurferRef.current
    if (!ws) return
    const seg = segments[index]
    ws.setTime(seg.start)
    const newScrollLeft = seg.start * zoomLevel - ws.getWidth() / 2
    const clampedScrollLeft = Math.max(0, newScrollLeft)
    ws.setScroll(clampedScrollLeft)
    scheduleScrollUpdate(clampedScrollLeft)
  }

  const playSegment = (index: number, forceFromStart = false) => {
    const ws = waveSurferRef.current
    if (!ws) return
    const seg = segments[index]
    if (!seg) return
    const now = ws.getCurrentTime()
    setSelectedIndex(index)
    playSegmentRef.current = { start: seg.start, end: seg.end }
    const startTime = forceFromStart || now < seg.start || now >= seg.end ? seg.start : now
    if (startTime === seg.start) {
      ws.setTime(seg.start)
      const newScrollLeft = seg.start * zoomLevel - ws.getWidth() / 2
      const clampedScrollLeft = Math.max(0, newScrollLeft)
      ws.setScroll(clampedScrollLeft)
      scheduleScrollUpdate(clampedScrollLeft)
    }
    ws.play(startTime, seg.end)
  }

  const handleExport = async () => {
    if (!taskId || segments.length === 0) return
    const token = await getValidAccessToken()
    if (!token) {
      router.push(`/${locale}/auth/login`)
      return
    }

    const sampleRateValue = sampleRatePreset === "custom" ? sampleRateCustom.trim() : sampleRatePreset
    const bitDepthValue = bitDepthPreset === "custom" ? bitDepthCustom.trim() : bitDepthPreset

    setExporting(true)
    setExportError("")
    setExportStatus(isZh ? "导出中…" : "Exporting…")

    try {
      const res = await fetch(`${apiBase}/vad/export/${taskId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segments: segments.map((seg) => ({ start: seg.start, end: seg.end })),
          format: exportFormat,
          prefix: exportPrefix,
          suffix: exportSuffix,
          sample_rate: sampleRateValue,
          channels: channelMode,
          bit_depth: bitDepthValue,
        }),
      })
      const data = await safeJson(res)
      if (!res.ok) {
        const detail = data?.detail
        const code = typeof detail === "object" ? detail?.code : null
        const errorText =
          code === "EXPORT_REQUIRES_SUBSCRIPTION"
            ? dictionary.errors.exportLimitReached
            : typeof detail === "string"
              ? detail
              : detail?.message || (isZh ? "导出失败，请稍后重试。" : "Export failed. Please try again.")
        setExportError(errorText)
        setExportStatus("")
        return
      }

      const downloadUrl = data?.download_url || data?.url
      if (downloadUrl) {
        const link = document.createElement("a")
        link.href = downloadUrl
        link.rel = "noopener"
        link.click()
      }
      setExportStatus(isZh ? "导出完成，正在下载…" : "Export ready. Downloading…")
    } catch (err: any) {
      setExportError(err?.message || (isZh ? "导出失败，请稍后重试。" : "Export failed. Please try again."))
      setExportStatus("")
    } finally {
      setExporting(false)
    }
  }

  const resetToIdle = (nextPhase: Phase | React.SyntheticEvent = "idle", notice = "") => {
    const phaseValue = typeof nextPhase === "string" ? nextPhase : "idle"
    setPhase(phaseValue)
    setTaskId(null)
    setAudioUrl(null)
    setSegments([])
    setSelectedIndex(null)
    setHoveredIndex(null)
    setCurrentTime(0)
    setDuration(0)
    setWaveReady(false)
    setMessage(notice)
    setExportStatus("")
    setExportError("")
    setExporting(false)
    taskCreatedAtRef.current = null
  }

  const handleDeleteSegment = (index: number) => {
    if (index < 0) return
    const ws = waveSurferRef.current
    const wasSelected = selectedIndex === index
    if (wasSelected) {
      playSegmentRef.current = null
      ws?.pause()
      setIsPlaying(false)
      setSelectedIndex(null)
    } else if (selectedIndex !== null && selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1)
    }

    if (hoveredIndex !== null && hoveredIndex > index) {
      setHoveredIndex(hoveredIndex - 1)
    } else if (hoveredIndex === index) {
      setHoveredIndex(null)
    }

    if (editingCell) {
      if (editingCell.index === index) {
        setEditingCell(null)
        setEditingValue("")
        setEditError("")
      } else if (editingCell.index > index) {
        setEditingCell({ index: editingCell.index - 1, field: editingCell.field })
      }
    }

    setSegments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSegmentDoubleClick = (index: number) => {
    playSegment(index, true)
  }

  const handlePlayToggle = () => {
    const ws = waveSurferRef.current
    if (!ws) return

    if (isPlaying) {
      ws.pause()
      return
    }

    if (selectedIndex !== null) {
      playSegment(selectedIndex)
      return
    }

    ws.playPause()
  }

  const startEditingCell = (index: number, field: "start" | "end") => {
    const seg = segments[index]
    if (!seg) return
    setSelectedIndex(index)
    setEditingCell({ index, field })
    setEditingValue(field === "start" ? seg.start.toFixed(2) : seg.end.toFixed(2))
    setEditError("")
  }

  const commitEditingCell = () => {
    if (!editingCell) return
    const value = Number(editingValue)
    if (!Number.isFinite(value)) {
      setEditError(isZh ? "请输入有效的时间" : "Enter a valid time")
      return
    }
    if (value < 0) {
      setEditError(isZh ? "时间不能小于 0" : "Time cannot be negative")
      return
    }
    if (duration > 0 && value > duration) {
      setEditError(isZh ? "时间超过音频长度" : "Time exceeds duration")
      return
    }

    setSegments((prev) => {
      const next = [...prev]
      const seg = next[editingCell.index]
      if (!seg) return prev
      const start = editingCell.field === "start" ? value : seg.start
      const end = editingCell.field === "end" ? value : seg.end
      if (end <= start) {
        setEditError(isZh ? "结束时间必须大于开始时间" : "End must be greater than start")
        return prev
      }
      next[editingCell.index] = { ...seg, start, end, duration: end - start }
      return next
    })
    setEditingCell(null)
    setEditingValue("")
    setEditError("")
  }

  const jumpToMarker = (direction: "prev" | "next") => {
    if (segments.length === 0) return
    const ws = waveSurferRef.current
    if (!ws) return

    let newIndex: number
    if (selectedIndex === null) {
      newIndex = direction === "next" ? 0 : segments.length - 1
    } else {
      newIndex =
        direction === "next" ? Math.min(selectedIndex + 1, segments.length - 1) : Math.max(selectedIndex - 1, 0)
    }

    setSelectedIndex(newIndex)
    const seg = segments[newIndex]
    ws.setTime(seg.start)
    const newScrollLeft = seg.start * zoomLevel - ws.getWidth() / 2
    const clampedScrollLeft = Math.max(0, newScrollLeft)
    ws.setScroll(clampedScrollLeft)
    scheduleScrollUpdate(clampedScrollLeft)
  }

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(e.target.value)
    setZoomLevel(newZoom)
    if (waveSurferRef.current) {
      waveSurferRef.current.zoom(newZoom)
      scheduleScrollUpdate(waveSurferRef.current.getScroll())
    }
  }

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current += 1
    setIsDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) setIsDragActive(false)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragDepthRef.current = 0
    setIsDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="min-h-screen bg-[#17171e] text-white select-none font-sans">
      {(phase === "idle" || phase === "error") && (
        <>
          <section
            className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 ${
              isDragActive ? "ring-2 ring-indigo-500/70" : ""
            }`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
          >
            {isDragActive && (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/40 backdrop-blur-sm">
                <div className="rounded-2xl border border-white/15 bg-[#17171e]/80 px-6 py-4 text-center shadow-2xl">
                  <div className="text-base font-semibold text-white">{labels.drop}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {isZh ? "支持 mp3 / wav 等常见格式" : "Supports mp3 / wav and more"}
                  </div>
                </div>
              </div>
            )}
            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
              <span className="mb-6 text-sm font-medium tracking-wide text-indigo-300">
                {isZh ? "工作方式" : "How it works"}
              </span>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">{labels.title}</h1>
              <p className="mb-12 max-w-2xl text-lg text-slate-300 md:text-xl">{labels.subtitle}</p>
              <div className="mb-12 w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40">
                <img src="/vad.png" alt={labels.title} className="w-full" />
              </div>
              <div className="flex flex-col items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <Button
                  size="lg"
                  className="rounded-full bg-indigo-600 px-8 py-6 text-base font-medium text-white hover:bg-indigo-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {labels.upload}
                </Button>
                {phase === "error" && message && (
                  <Alert variant="destructive" className="w-full max-w-3xl">
                    <AlertDescription className="text-foreground">{message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </section>
          <section className="bg-[#17171e] text-white">
            <Faq title={dictionary.faq.title} items={(dictionary.faq as any).vad || dictionary.faq.demix} />
          </section>
        </>
      )}

      {(phase === "uploading" || phase === "processing") && (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-foreground">
          <div className="relative flex max-w-2xl flex-col items-center gap-4 rounded-3xl border border-white/5 bg-black/30 px-10 py-12 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white shadow-lg">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold">{phase === "uploading" ? labels.uploading : labels.processing}</h2>
            <p className="text-base text-muted-foreground">
              {phase === "uploading"
                ? uploadPercent > 0
                  ? `${labels.uploading} (${uploadPercent}%)`
                  : labels.uploading
                : labels.processing}
              {phase === "processing" && position > 0 ? ` ${formatTemplate(labels.positionTpl, { position })}` : ""}
              {phase === "processing" && etaSeconds > 0
                ? ` ${formatTemplate(labels.etaTpl, { seconds: Math.max(0, Math.round(etaSeconds)) })}`
                : ""}
            </p>
            <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-[pulse_1.6s_ease_in_out_infinite] rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
            </div>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="h-screen flex flex-col bg-[#17171e]">
          <header className="flex items-center justify-between px-4 py-2 bg-[#17171e] border-b border-[#2a2a3a]">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-semibold text-[#e6e6e6]">{labels.title}</h1>
              <div className="h-4 w-px bg-[#34344a]" />
              <span className="text-xs text-[#9aa0b5]">
                {segments.length} {labels.markers}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => resetToIdle()}
              aria-label={labels.retry}
              title={labels.retry}
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 flex flex-col bg-[#17171e] border-r border-[#2a2a3a]">
              {/* 面板标题栏 */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#232336] border-b border-[#2a2a3a]">
                <span className="text-xs font-semibold text-[#e6e6e6] uppercase tracking-wide">
                  {labels.markerList}
                </span>
                <span className="text-[10px] text-[#a1a6bf] bg-[#2d2d44] px-2 py-0.5 rounded">{segments.length}</span>
              </div>

              {/* 标记列表 */}
              <div className="flex-1 overflow-y-auto au-scrollbar">
                <div className="sticky top-0 z-10 grid grid-cols-[1fr_80px_80px_60px_44px] gap-px bg-[#17171e] text-[10px] font-medium text-[#9aa0b5] uppercase tracking-wider border-b border-[#2a2a3a]">
                  <div className="bg-[#1f1f2b] px-3 py-2 min-w-0">{labels.name}</div>
                  <div className="bg-[#1f1f2b] px-2 py-2">{labels.start}</div>
                  <div className="bg-[#1f1f2b] px-2 py-2">{labels.end}</div>
                  <div className="bg-[#1f1f2b] px-2 py-2">{labels.duration}</div>
                  <div className="bg-[#1f1f2b] px-2 py-2 flex items-center justify-center">{labels.actions}</div>
                </div>
                {segments.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-xs text-[#7b8198]">{labels.empty}</div>
                ) : (
                  segments.map((seg, i) => {
                    const isSelected = selectedIndex === i
                    const isHovered = hoveredIndex === i
                    const showDelete = isSelected
                    const segDuration = seg.end - seg.start

                    return (
                      <div
                        key={i}
                        onClick={() => handleSegmentClick(i)}
                        onDoubleClick={() => handleSegmentDoubleClick(i)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`grid grid-cols-[1fr_80px_80px_60px_44px] gap-px text-xs cursor-pointer transition-colors ${
                          isSelected ? "bg-[#34365a]" : isHovered ? "bg-[#24243a]" : "bg-[#1b1b25] hover:bg-[#24243a]"
                        }`}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2a3a] min-w-0">
                          {/* AU 风格标记图标 */}
                          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M1 1L6 4L1 7V1Z"
                              fill={isSelected ? MARKER_COLORS.selected.bg : MARKER_COLORS.default.bg}
                              stroke={isSelected ? MARKER_COLORS.selected.border : MARKER_COLORS.default.border}
                              strokeWidth="0.5"
                            />
                            <line
                              x1="1"
                              y1="7"
                              x2="1"
                              y2="11"
                              stroke={isSelected ? MARKER_COLORS.selected.bg : MARKER_COLORS.default.bg}
                              strokeWidth="1"
                              strokeDasharray="2 1"
                            />
                          </svg>
                          <span className={`${isSelected ? "text-white font-medium" : "text-[#d0d3e0]"} tabular-nums`}>
                            {String(i)}
                          </span>
                        </div>
                        <div
                          className={`px-2 py-2 border-b border-[#2a2a3a] font-mono ${isSelected ? "text-white" : "text-[#b0b5c8]"}`}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            startEditingCell(i, "start")
                          }}
                        >
                          {editingCell?.index === i && editingCell.field === "start" ? (
                            <input
                              autoFocus
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value)
                                if (editError) setEditError("")
                              }}
                              onBlur={commitEditingCell}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEditingCell()
                                if (e.key === "Escape") {
                                  setEditingCell(null)
                                  setEditingValue("")
                                  setEditError("")
                                }
                              }}
                              className="w-full h-6 rounded bg-[#141420] border border-[#3a3a52] px-1 text-[11px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                            />
                          ) : (
                            formatTimeShort(seg.start)
                          )}
                        </div>
                        <div
                          className={`px-2 py-2 border-b border-[#2a2a3a] font-mono ${isSelected ? "text-white" : "text-[#b0b5c8]"}`}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            startEditingCell(i, "end")
                          }}
                        >
                          {editingCell?.index === i && editingCell.field === "end" ? (
                            <input
                              autoFocus
                              type="number"
                              step="0.01"
                              min="0"
                              value={editingValue}
                              onChange={(e) => {
                                setEditingValue(e.target.value)
                                if (editError) setEditError("")
                              }}
                              onBlur={commitEditingCell}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitEditingCell()
                                if (e.key === "Escape") {
                                  setEditingCell(null)
                                  setEditingValue("")
                                  setEditError("")
                                }
                              }}
                              className="w-full h-6 rounded bg-[#141420] border border-[#3a3a52] px-1 text-[11px] text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                            />
                          ) : (
                            formatTimeShort(seg.end)
                          )}
                        </div>
                        <div
                          className={`px-2 py-2 border-b border-[#2a2a3a] font-mono text-[10px] ${isSelected ? "text-indigo-300" : "text-[#9aa0b5]"}`}
                        >
                          {segDuration.toFixed(2)}s
                        </div>
                        <div className="flex items-center justify-center border-b border-[#2a2a3a] px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-6 w-6 text-red-400 hover:text-red-300 ${showDelete ? "visible" : "invisible"}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSegment(i)
                            }}
                            title={labels.delete}
                            aria-label={labels.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              {editError && <div className="px-3 py-2 text-[11px] text-red-400">{editError}</div>}
            </div>

            {/* 波形编辑区 */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-[#17171e] border-b border-[#2a2a3a]">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => jumpToMarker("prev")}
                    disabled={!waveReady || segments.length === 0}
                    title={isZh ? "上一个标记" : "Previous Marker"}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant={isPlaying ? "secondary" : "ghost"}
                    className="h-10 w-10 rounded-full"
                    onClick={handlePlayToggle}
                    disabled={!waveReady}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => jumpToMarker("next")}
                    disabled={!waveReady || segments.length === 0}
                    title={isZh ? "下一个标记" : "Next Marker"}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* 时间码显示 */}
                <div className="flex items-center gap-4">
                  <div className="bg-[#141420] px-4 py-1.5 rounded border border-[#2f2f46]">
                    <span className="font-mono text-lg text-[#a78bfa] tracking-wider">{formatTime(currentTime)}</span>
                    <span className="text-[10px] text-[#7b8198] ml-2">/ {formatTime(duration)}</span>
                  </div>
                </div>

                {/* 缩放控制 */}
                <div className="flex items-center gap-2">
                  <ZoomOut className="h-4 w-4 text-[#7b8198]" />
                  <input
                    type="range"
                    min="10"
                    max="800"
                    step="10"
                    value={zoomLevel}
                    onChange={handleZoomChange}
                    className="w-24 h-1 bg-[#34344a] rounded appearance-none cursor-pointer au-slider"
                  />
                  <ZoomIn className="h-4 w-4 text-[#7b8198]" />
                  <span className="text-[10px] text-[#9aa0b5] w-12 text-right">{zoomLevel}px/s</span>
                </div>
              </div>

              {/* 波形显示区 */}
              <div className="h-56 relative bg-[#17171e] overflow-hidden">
                <div className="absolute left-0 right-0 top-0 h-7 bg-[#1f1f2b] border-b border-[#4f46e5] z-20 overflow-hidden">
                  <div
                    ref={markerTrackRef}
                    className="relative h-full will-change-transform"
                    style={{ width: duration > 0 ? `${duration * zoomLevel}px` : "100%" }}
                  >
                    {duration > 0 &&
                      segments.map((seg, index) => {
                        const x = seg.start * zoomLevel
                        const width = Math.max((seg.end - seg.start) * zoomLevel, 8)
                        const isSelected = selectedIndex === index
                        const isHovered = hoveredIndex === index
                        const color = isSelected
                          ? { bg: "#a78bfa", border: "#c4b5fd", text: "#0f0f1a" }
                          : isHovered
                            ? { bg: "#8b5cf6", border: "#a78bfa", text: "#0f0f1a" }
                            : { bg: "#6366f1", border: "#818cf8", text: "#0f0f1a" }

                        return (
                          <div
                            key={index}
                            className="absolute cursor-pointer h-full"
                            style={{ left: x, width, zIndex: isSelected ? 20 : isHovered ? 15 : 10 }}
                            onClick={() => {
                              const ws = waveSurferRef.current
                              if (!ws) return
                              setSelectedIndex(index)
                              ws.setTime(seg.start)
                              setCurrentTime(seg.start)
                            }}
                            onDoubleClick={() => playSegment(index, true)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          >
                            {/* 标记旗帜 */}
                            <div
                              className="absolute top-0 left-0 flex items-center z-30"
                              style={{ transform: "translateX(-1px)" }}
                            >
                              <svg className="w-4 h-5" viewBox="0 0 16 20" fill="none">
                                <path d="M1 0L12 6L1 12V0Z" fill={color.bg} stroke={color.border} strokeWidth="1" />
                                <text
                                  x="4"
                                  y="8"
                                  fill={color.text}
                                  fontSize="6"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  {index}
                                </text>
                              </svg>
                            </div>
                            {/* 范围高亮条 */}
                            <div
                              className="absolute bottom-0 left-0 h-1.5"
                              style={{
                                width: "100%",
                                background: `linear-gradient(90deg, ${color.bg}80, ${color.bg}40)`,
                                borderRadius: "0 2px 2px 0",
                              }}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* 时间轴 */}
                <div className="absolute left-0 right-0 top-7 h-6 bg-[#1b1b26] border-b border-[#2f2f46] z-10 overflow-hidden">
                  <div
                    ref={timelineContainerRef}
                    className="relative h-full will-change-transform"
                    style={{ width: duration > 0 ? `${duration * zoomLevel}px` : "100%" }}
                  />
                </div>

                {/* 波形 */}
                <div ref={waveContainerRef} className="absolute left-0 right-0 top-[52px] bottom-0 bg-[#17171e]" />

                <div
                  className="absolute left-0 right-0 top-7 pointer-events-none z-[15] overflow-hidden"
                  style={{ height: `${WAVE_HEIGHT + 24}px` }}
                >
                  <div
                    ref={markerLinesRef}
                    className="relative h-full will-change-transform"
                    style={{ width: duration > 0 ? `${duration * zoomLevel}px` : "100%" }}
                  >
                    {duration > 0 &&
                      segments.map((seg, index) => {
                        const leftPos = seg.start * zoomLevel
                        const rightPos = seg.end * zoomLevel
                        const isSelected = selectedIndex === index
                        const color = isSelected ? "#a78bfa" : "#6366f1"

                        return (
                          <div key={`lines-${index}`}>
                            {/* 开始线 */}
                            <div
                              className="absolute top-0 bottom-0 w-px"
                              style={{
                                left: `${leftPos}px`,
                                background: `repeating-linear-gradient(to bottom, ${color} 0px, ${color} 4px, transparent 4px, transparent 8px)`,
                              }}
                            />
                            {/* 结束线 */}
                            <div
                              className="absolute top-0 bottom-0 w-px"
                              style={{
                                left: `${rightPos}px`,
                                background: `repeating-linear-gradient(to bottom, ${color}80 0px, ${color}80 4px, transparent 4px, transparent 8px)`,
                              }}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* 导出设置 */}
              <div className="border-t border-[#2a2a3a] bg-[#17171e] px-4 py-4">
                <div className="rounded-lg border border-[#2b2b3d] bg-gradient-to-b from-[#232336] to-[#1b1b26] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#e6e6e6] uppercase tracking-widest">
                      {labels.export}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-[#8a8a8a]">
                      {labels.filePreview}:
                      <span className="rounded-full border border-[#2f2f46] bg-[#12121b] px-2 py-0.5 font-mono text-[10px] text-indigo-300">
                        {(exportPrefix.trim() || "0")}_{(exportSuffix.trim() || "0")}.{exportFormat}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-[#b0b0b0]">
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.filePrefix}</label>
                    <input
                      value={exportPrefix}
                      onChange={(e) => setExportPrefix(sanitizeExportPrefix(e.target.value))}
                      className="mt-2 w-full h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                    />
                    </div>
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.fileSuffix}</label>
                    <input
                      value={exportSuffix}
                      onChange={(e) => setExportSuffix(sanitizeExportSuffix(e.target.value))}
                      className="mt-2 w-full h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60"
                    />
                    </div>
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.sampleRate}</label>
                      <div className="mt-2 flex gap-2">
                        <select
                          value={sampleRatePreset}
                          onChange={(e) => setSampleRatePreset(e.target.value)}
                          className="h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white focus:outline-none"
                        >
                          <option value="8000">8000</option>
                          <option value="16000">16000</option>
                          <option value="22050">22050</option>
                          <option value="44100">44100</option>
                          <option value="48000">48000</option>
                          <option value="custom">{labels.custom}</option>
                        </select>
                      <input
                        value={sampleRateCustom}
                        onChange={(e) => setSampleRateCustom(sanitizeNumberInput(e.target.value))}
                        disabled={sampleRatePreset !== "custom"}
                        placeholder={labels.custom}
                        className="flex-1 h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60 disabled:opacity-40"
                        />
                      </div>
                    </div>
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.channels}</label>
                      <select
                        value={channelMode}
                        onChange={(e) => setChannelMode(e.target.value as "mono" | "stereo")}
                        className="mt-2 w-full h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white focus:outline-none"
                      >
                        <option value="mono">{labels.mono}</option>
                        <option value="stereo">{labels.stereo}</option>
                      </select>
                    </div>
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.bitDepth}</label>
                      <div className="mt-2 flex gap-2">
                        <select
                          value={bitDepthPreset}
                          onChange={(e) => setBitDepthPreset(e.target.value)}
                          className="h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white focus:outline-none"
                        >
                          <option value="8">8</option>
                          <option value="16">16</option>
                          <option value="24">24</option>
                          <option value="32">32</option>
                          <option value="custom">{labels.custom}</option>
                        </select>
                      <input
                        value={bitDepthCustom}
                        onChange={(e) => setBitDepthCustom(sanitizeNumberInput(e.target.value))}
                        disabled={bitDepthPreset !== "custom"}
                        placeholder={labels.custom}
                        className="flex-1 h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/60 disabled:opacity-40"
                        />
                      </div>
                    </div>
                    <div className="rounded-md border border-[#2f2f46] bg-[#171720] p-2">
                      <label className="text-[10px] uppercase tracking-widest text-[#8a8a8a]">{labels.format}</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as "mp3" | "wav")}
                        className="mt-2 w-full h-8 rounded bg-[#111120] border border-[#34344a] px-2 text-xs text-white focus:outline-none"
                      >
                        <option value="mp3">mp3</option>
                        <option value="wav">wav</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end border-t border-[#2a2a3a] pt-3">
                    <Button
                      size="sm"
                      className="px-6"
                      onClick={handleExport}
                      disabled={!waveReady || segments.length === 0 || exporting}
                    >
                      {exporting ? (isZh ? "导出中…" : "Exporting…") : labels.exportAction}
                    </Button>
                  </div>
                  {(exportStatus || exportError) && (
                    <div className={`mt-2 text-[11px] ${exportError ? "text-red-400" : "text-indigo-300"}`}>
                      {exportError || exportStatus}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* AU 风格滚动条 */
        .au-scrollbar::-webkit-scrollbar { width: 12px; height: 12px; }
        .au-scrollbar::-webkit-scrollbar-track { background: #17171e; }
        .au-scrollbar::-webkit-scrollbar-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #3a3a52;
          border: 2px solid #17171e;
          border-radius: 6px;
          cursor: pointer;
          border: 1px solid #5a5a78;
        }
        .au-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a4a68; }
        .au-scrollbar::-webkit-scrollbar-corner { background: #17171e; }

        /* AU 风格滑块 */
        .au-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #8b8bd0;
          border-radius: 2px;
          cursor: pointer;
          border: 1px solid #5a5a78;
        }
        .au-slider::-webkit-slider-thumb:hover {
          background: #b7b7e6;
        }

        /* WaveSurfer 区域样式 */
        .wavesurfer-region {
          border-left: none !important;
          border-right: none !important;
          z-index: 5 !important;
          pointer-events: none !important;
        }

        .wavesurfer-region-content { display: none !important; }

        /* 波形容器滚动条 */
        [data-waveform] {
          scrollbar-width: thin;
          scrollbar-color: #3a3a52 #17171e;
        }
      `}</style>
    </div>
  )
}
