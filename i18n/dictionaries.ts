import { defaultLocale, Locale } from "./config";

export type Dictionary = {
  appName: string;
  tagline: string;
  brandSubtitle: string;
  errors: {
    needLogin: string;
    unknown: string;
    uploadFailed: string;
    fileTooLarge: string;
    decodeFailed: string;
    durationTooShort: string;
    dailyLimitReached: string;
    unsupportedFileType: string;
    wavDownloadRequiresSubscription: string;
    mp3: string;
    wav: string;
    taskNotFoundOrExpired: string;
    processingTimeout: string;
  };
  faq: {
    title: string;
    demix: { q: string; a: string }[];
    dereverb: { q: string; a: string }[];
    bpm: { q: string; a: string }[];
    demucs?: { q: string; a: string }[];
  };
  billing: {
    title: string;
    subtitle: string;
    nonSubscriberTitle: string;
    nonSubscriberBenefits: string[];
    subscriberTitle: string;
    subscriberBenefits: string[];
    subscribe: string;
    manage: string;
    active: string;
    inactive: string;
    needLogin: string;
    missingProduct: string;
  };
  nav: {
    title: string;
    demix: string;
    dereverb: string;
    bpm: string;
    stems: string;
    history?: string;
    settings?: string;
    billing?: string;
    tickets?: string;
    ticketManage?: string;
  };
  header: {
    searchPlaceholder: string;
    language: string;
    theme: string;
    login: string;
    logout: string;
  };
  home: {
    title: string;
    subtitle: string;
    prompt: string;
    uploadCta: string;
    dropHint: string;
    tools: {
      demix: { title: string; description: string; badge: string };
      dereverb: { title: string; description: string; badge: string };
      bpm: { title: string; description: string; badge: string };
    };
    presets: string[];
  };
  auth: {
    login: { title: string; subtitle: string; action: string; alt: string; forgot: string };
    register: {
      title: string;
      subtitle: string;
      action: string;
      alt: string;
      terms: string;
      success: string;
      successCheckEmail: string;
    };
    reset: { title: string; subtitle: string; action: string; alt: string };
    form: {
      email: string;
      password: string;
      name: string;
      confirmPassword: string;
      remember: string;
    };
  };
  tickets: {
    title: string;
    subtitle: string;
    newTitle: string;
    category: string;
    categories: { demix: string; billing: string; other: string };
    subject: string;
    subjectPlaceholder: string;
    content: string;
    contentPlaceholder: string;
    submit: string;
    myTickets: string;
    allTickets: string;
    viewAll: string;
    hideAll: string;
    status: string;
    statuses: { open: string; answered: string; closed: string };
    statusAll: string;
    empty: string;
    you: string;
    admin: string;
    adminOnly: string;
    createdAt: string;
    delete: string;
    deleteConfirm: string;
    deleted: string;
    replyPlaceholder: string;
    send: string;
    close: string;
    reopen: string;
    loadFailed: string;
    createFailed: string;
    replyFailed: string;
  };
  history?: {
    title: string;
    empty: string;
    cols: {
      task: string;
      inst: string;
      vocal: string;
      created: string;
      action?: string;
    };
    downloadInst: string;
    downloadVocal: string;
    delete: string;
  };
  settings?: {
    title: string;
    profileTitle: string;
    nameLabel: string;
    saveName: string;
    passwordTitle: string;
    currentPwd: string;
    newPwd: string;
    confirmPwd: string;
    savePwd: string;
    successName: string;
    successPwd: string;
    mismatch: string;
  };
  footer: {
    rights: string;
    version: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  zh: {
    appName: "demixr",
    tagline: "AI 音频工具",
    brandSubtitle: "AI 人声分离",
    errors: {
      needLogin: "请先登录",
      unknown: "发生错误",
      uploadFailed: "上传失败",
      fileTooLarge: "文件过大（最大 {max_mb}MB）",
      decodeFailed: "解码失败，请更换音频文件或格式后重试",
      durationTooShort: "音频时长过短（至少 {min_seconds} 秒）",
      dailyLimitReached: "今日使用次数已达上限（{limit} 次），请订阅后继续使用",
      unsupportedFileType: "不支持的文件格式",
      wavDownloadRequiresSubscription: "未订阅用户暂不支持下载 WAV，请订阅后下载",
      mp3: "MP3",
      wav: "WAV",
      taskNotFoundOrExpired: "任务不存在或已过期，请重新上传",
      processingTimeout: "处理超时或后端中断，请重新上传",
    },
    faq: {
      title: "常见问题",
      demix: [
        {
          q: "上传失败",
          a: "当前服务器已启用严格的音频处理与资源调度策略。\n未订阅用户单个音频文件的最大支持上传大小为 200 MB；订阅会员上传上限为 500 MB。\n如文件超过对应限制，将导致上传失败。\n如在符合规格的情况下仍出现异常，请及时与我们联系以便进一步排查。",
        },
        {
          q: "最小音频上传时长",
          a: "目前系统要求上传的音频时长不得短于 15 秒。\n少于 15 秒的音频将无法触发后端处理流程，因此请确保音频长度满足最低要求后再进行上传。",
        },
        {
          q: "订阅用户与非订阅用户的区别",
          a: "鉴于音频处理（去人声 / 去混响）在计算资源与后端成本上的高消耗，我们对不同用户类型设置了如下策略：\n\n非订阅用户\n- 每日不限次数\n- 处理任务需进入队列等待\n- 不支持下载原始 WAV 格式文件\n\n订阅会员用户\n- 每日不限次数\n- 享有优先处理权限，无需排队\n- 支持下载处理后的原始 WAV 音频文件\n\n如需免排队处理或下载 WAV，建议升级为订阅会员。",
        },
      ],
      demucs: [
        {
          q: "上传失败",
          a: "当前服务器已启用严格的音频处理与资源调度策略。\n未订阅用户单个音频文件的最大支持上传大小为 200 MB；订阅会员上传上限为 500 MB。\n如文件超过对应限制，将导致上传失败。\n如在符合规格的情况下仍出现异常，请及时与我们联系以便进一步排查。",
        },
        {
          q: "最小音频上传时长",
          a: "目前系统要求上传的音频时长不得短于 15 秒。\n少于 15 秒的音频将无法触发后端处理流程，因此请确保音频长度满足最低要求后再进行上传。",
        },
        {
          q: "订阅用户与非订阅用户的区别",
          a: "鉴于音频处理（去人声 / 去混响 / 乐器分离）在计算资源与后端成本上的高消耗，我们对不同用户类型设置了如下策略：\n\n非订阅用户\n- 每日不限次数\n- 处理任务需进入队列等待\n- 不支持下载原始 WAV 格式文件\n\n订阅会员用户\n- 每日不限次数\n- 享有优先处理权限，无需排队\n- 支持下载处理后的原始 WAV 音频文件\n\n如需免排队处理或下载 WAV，建议升级为订阅会员。",
        },
      ],
      dereverb: [
        {
          q: "上传失败",
          a: "当前服务器已启用严格的音频处理与资源调度策略。\n未订阅用户单个音频文件的最大支持上传大小为 200 MB；订阅会员上传上限为 500 MB。\n如文件超过对应限制，将导致上传失败。\n如在符合规格的情况下仍出现异常，请及时与我们联系以便进一步排查。",
        },
        {
          q: "最小音频上传时长",
          a: "目前系统要求上传的音频时长不得短于 15 秒。\n少于 15 秒的音频将无法触发后端处理流程，因此请确保音频长度满足最低要求后再进行上传。",
        },
        {
          q: "关于去混响功能的使用顺序",
          a: "在使用去混响功能前，请务必先对音频进行人声分离，仅保留纯人声轨道。\n去混响模块仅针对已分离的人声进行优化处理，若直接对混合音频（包含伴奏或环境音）使用去混响，可能会导致处理效果异常或失真。",
        },
        {
          q: "订阅用户与非订阅用户的区别",
          a: "鉴于音频处理（去人声 / 去混响）在计算资源与后端成本上的高消耗，我们对不同用户类型设置了如下策略：\n\n非订阅用户\n- 每日不限次数\n- 处理任务需进入队列等待\n- 不支持下载原始 WAV 格式文件\n\n订阅会员用户\n- 每日不限次数\n- 享有优先处理权限，无需排队\n- 支持下载处理后的原始 WAV 音频文件\n\n如需免排队处理或下载 WAV，建议升级为订阅会员。",
        },
      ],
      bpm: [
        {
          q: "上传失败",
          a: "当前服务器已启用严格的音频处理与资源调度策略。\n未订阅用户单个音频文件的最大支持上传大小为 200 MB；订阅会员上传上限为 500 MB。\n如文件超过对应限制，将导致上传失败。\n如在符合规格的情况下仍出现异常，请及时与我们联系以便进一步排查。",
        },
        {
          q: "最小音频上传时长",
          a: "目前系统要求上传的音频时长不得短于 15 秒。\n少于 15 秒的音频将无法触发后端处理流程，因此请确保音频长度满足最低要求后再进行上传。",
        },
        {
          q: "订阅用户与非订阅用户的区别",
          a: "鉴于音频处理（去人声 / 去混响）在计算资源与后端成本上的高消耗，我们对不同用户类型设置了如下策略：\n\n非订阅用户\n- 每日不限次数\n- 处理任务需进入队列等待\n- 不支持下载原始 WAV 格式文件\n\n订阅会员用户\n- 每日不限次数\n- 享有优先处理权限，无需排队\n- 支持下载处理后的原始 WAV 音频文件\n\n如需免排队处理或下载 WAV，建议升级为订阅会员。",
        },
      ],
    },
    billing: {
      title: "订阅服务",
      subtitle: "升级订阅以获得更高额度、更快速度与更高质量输出。",
      nonSubscriberTitle: "未订阅用户权益",
      nonSubscriberBenefits: ["需要排队", "每日不限次数", "上传限制 200MB", "支持 MP3 格式"],
      subscriberTitle: "订阅会员权益",
      subscriberBenefits: ["每日不限次数", "上传限制 500MB", "优先处理，无需排队", "支持下载原始 WAV 音频"],
      subscribe: "立即订阅",
      manage: "管理订阅",
      active: "已订阅",
      inactive: "未订阅",
      needLogin: "请先登录后再订阅",
      missingProduct: "未配置订阅产品，请联系管理员",
    },
    nav: {
      title: "工具",
      demix: "去伴奏",
      dereverb: "去混响",
      bpm: "BPM 查询",
      stems: "乐器分离",
      history: "历史记录",
      settings: "设置",
      billing: "订阅",
      tickets: "工单反馈",
      ticketManage: "工单管理",
    },
    header: {
      searchPlaceholder: "输入歌曲名称或任务...",
      language: "语言",
      theme: "主题",
      login: "登录",
      logout: "退出",
    },
    home: {
      title: "人声处理",
      subtitle: "一站式去伴奏、去混响、BPM 检测。",
      prompt: "拖拽或上传音频，立即开始处理",
      uploadCta: "上传音频",
      dropHint: "支持 WAV/MP3/FLAC，最长 10 分钟",
      tools: {
        demix: {
          title: "去伴奏",
          description: "提取人声或伴奏，多轨 STEM 快速导出。",
          badge: "Demix",
        },
        dereverb: {
          title: "去混响",
          description: "减弱房间混响与尾音，保留清晰人声。",
          badge: "De-reverb",
        },
        bpm: {
          title: "BPM 查询",
          description: "自动检测节奏并对齐网格，支持 Tap 手动标记。",
          badge: "BPM",
        },
      },
      presets: ["流行女声", "现场人声", "嘻哈鼓组", "播客录音"],
    },
    auth: {
      login: {
        title: "欢迎回来",
        subtitle: "登录后管理人声处理任务。",
        action: "登录",
        alt: "没有账户？",
        forgot: "忘记密码？",
      },
      register: {
        title: "创建账户",
        subtitle: "开通云端人声分离实验室。",
        action: "注册",
        alt: "已有账户？",
        terms: "我已阅读并同意服务条款",
        success: "注册成功",
        successCheckEmail: "注册成功，请前往邮箱查收验证邮件完成验证后再登录（如未收到请检查垃圾箱）。",
      },
      reset: {
        title: "重置密码",
        subtitle: "我们会发送一封包含重置链接的邮件。",
        action: "发送重置邮件",
        alt: "返回登录",
      },
      form: {
        email: "邮箱",
        password: "密码",
        name: "昵称",
        confirmPassword: "确认密码",
        remember: "保持登录",
      },
    },
    history: {
      title: "历史记录",
      empty: "暂无记录，完成一次分离后会出现在这里。",
      cols: { task: "任务", inst: "伴奏", vocal: "人声", created: "时间", action: "操作" },
      downloadInst: "下载伴奏",
      downloadVocal: "下载人声",
      delete: "删除",
    },
    settings: {
      title: "账户设置",
      profileTitle: "昵称",
      nameLabel: "用户名",
      saveName: "保存昵称",
      passwordTitle: "修改密码",
      currentPwd: "当前密码",
      newPwd: "新密码",
      confirmPwd: "确认新密码",
      savePwd: "更新密码",
      successName: "昵称已更新",
      successPwd: "密码已更新，请重新登录",
      mismatch: "两次密码不一致",
    },
    tickets: {
      title: "工单反馈",
      subtitle: "遇到问题可以在这里提交工单，我们会尽快回复。",
      newTitle: "新建工单",
      category: "问题分类",
      categories: { demix: "分离问题", billing: "订阅问题", other: "其他问题" },
      subject: "标题",
      subjectPlaceholder: "请用一句话描述问题（可选）",
      content: "问题描述",
      contentPlaceholder: "请详细描述你遇到的问题，必要时可附上操作步骤与截图说明。",
      submit: "提交工单",
      myTickets: "我的工单",
      allTickets: "全部工单",
      viewAll: "查看全部",
      hideAll: "只看我的",
      status: "状态",
      statuses: { open: "待处理", answered: "已回复", closed: "已关闭" },
      statusAll: "全部",
      empty: "暂无工单",
      you: "我",
      admin: "管理员",
      adminOnly: "无权限访问工单管理",
      createdAt: "发起时间",
      delete: "删除工单",
      deleteConfirm: "确认删除这个工单吗？删除后无法恢复。",
      deleted: "已删除",
      replyPlaceholder: "输入回复内容…",
      send: "发送",
      close: "关闭工单",
      reopen: "重新打开",
      loadFailed: "加载失败，请稍后重试",
      createFailed: "提交失败，请稍后重试",
      replyFailed: "发送失败，请稍后重试",
    },
    footer: {
      rights: "(C) 2025 demixr",
      version: "Platform v1.0.0",
    },
  },
  en: {
    appName: "demixr",
    tagline: "Vocal Toolkit",
    brandSubtitle: "AI Vocal Separation",
    errors: {
      needLogin: "Please sign in",
      unknown: "Something went wrong",
      uploadFailed: "Upload failed",
      fileTooLarge: "File is too large (max {max_mb}MB)",
      decodeFailed: "Decode failed. Please try another file or format.",
      durationTooShort: "Audio is too short (min {min_seconds} seconds)",
      dailyLimitReached: "Daily limit reached ({limit} per day). Please subscribe to continue.",
      unsupportedFileType: "Unsupported file type",
      wavDownloadRequiresSubscription: "WAV download is available for subscribers only",
      mp3: "MP3",
      wav: "WAV",
      taskNotFoundOrExpired: "Task not found or expired. Please re-upload.",
      processingTimeout: "Processing timed out or was interrupted. Please re-upload.",
    },
    faq: {
      title: "FAQ",
      demix: [
        {
          q: "Upload failed",
          a: "The server uses strict audio-processing and resource scheduling policies.\nMax upload size per file: 200 MB for non-subscribers, 500 MB for subscribers.\nFiles above the applicable limit will fail.\nIf the issue persists within the limits, please contact us for further investigation.",
        },
        {
          q: "Minimum audio duration",
          a: "Audio must be at least 15 seconds long.\nClips shorter than 15 seconds will not trigger the backend processing pipeline, so please upload a longer audio file.",
        },
        {
          q: "Subscriber vs non-subscriber",
          a: "Audio processing (vocal removal / dereverb) is resource-intensive, so we apply different policies:\n\nNon-subscribers\n- Unlimited jobs per day\n- Jobs are queued\n- Original WAV downloads are not available\n\nSubscribers\n- Unlimited jobs per day\n- Priority processing (no queue)\n- Original WAV downloads are available\n\nIf you want priority processing and WAV downloads, consider upgrading to a subscription.",
        },
      ],
      demucs: [
        {
          q: "Upload failed",
          a: "The server uses strict audio-processing and resource scheduling policies.\nMax upload size per file: 200 MB for non-subscribers, 500 MB for subscribers.\nFiles above the applicable limit will fail.\nIf the issue persists within the limits, please contact us for further investigation.",
        },
        {
          q: "Minimum audio duration",
          a: "Audio must be at least 15 seconds long.\nClips shorter than 15 seconds will not trigger the backend processing pipeline, so please upload a longer audio file.",
        },
        {
          q: "Subscriber vs non-subscriber",
          a: "Audio processing (vocal removal / dereverb / 4-stem separation) is resource-intensive, so we apply different policies:\n\nNon-subscribers\n- Unlimited jobs per day\n- Jobs are queued\n- Original WAV downloads are not available\n\nSubscribers\n- Unlimited jobs per day\n- Priority processing (no queue)\n- Original WAV downloads are available\n\nIf you want priority processing and WAV downloads, consider upgrading to a subscription.",
        },
      ],
      dereverb: [
        {
          q: "Upload failed",
          a: "The server uses strict audio-processing and resource scheduling policies.\nMax upload size per file: 200 MB for non-subscribers, 500 MB for subscribers.\nFiles above the applicable limit will fail.\nIf the issue persists within the limits, please contact us for further investigation.",
        },
        {
          q: "Minimum audio duration",
          a: "Audio must be at least 15 seconds long.\nClips shorter than 15 seconds will not trigger the backend processing pipeline, so please upload a longer audio file.",
        },
        {
          q: "Recommended workflow for Dereverb",
          a: "Before using Dereverb, please run vocal separation first and keep the isolated vocal track only.\nThe dereverb module is optimized for separated vocals; applying it directly to a mixed track (with instrumental or ambience) may cause artifacts or distortion.",
        },
        {
          q: "Subscriber vs non-subscriber",
          a: "Audio processing (vocal removal / dereverb) is resource-intensive, so we apply different policies:\n\nNon-subscribers\n- Unlimited jobs per day\n- Jobs are queued\n- Original WAV downloads are not available\n\nSubscribers\n- Unlimited jobs per day\n- Priority processing (no queue)\n- Original WAV downloads are available\n\nIf you want priority processing and WAV downloads, consider upgrading to a subscription.",
        },
      ],
      bpm: [
        {
          q: "Upload failed",
          a: "The server uses strict audio-processing and resource scheduling policies.\nMax upload size per file: 200 MB for non-subscribers, 500 MB for subscribers.\nFiles above the applicable limit will fail.\nIf the issue persists within the limits, please contact us for further investigation.",
        },
        {
          q: "Minimum audio duration",
          a: "Audio must be at least 15 seconds long.\nClips shorter than 15 seconds will not trigger the backend processing pipeline, so please upload a longer audio file.",
        },
        {
          q: "Subscriber vs non-subscriber",
          a: "Audio processing (vocal removal / dereverb) is resource-intensive, so we apply different policies:\n\nNon-subscribers\n- Unlimited jobs per day\n- Jobs are queued\n- Original WAV downloads are not available\n\nSubscribers\n- Unlimited jobs per day\n- Priority processing (no queue)\n- Original WAV downloads are available\n\nIf you want priority processing and WAV downloads, consider upgrading to a subscription.",
        },
      ],
    },
    billing: {
      title: "Subscription",
      subtitle: "Upgrade for higher limits, faster processing, and full-quality outputs.",
      nonSubscriberTitle: "Free plan (non-subscriber)",
      nonSubscriberBenefits: ["Queued processing", "Max upload: 200MB", "Unlimited jobs per day", "MP3 supported"],
      subscriberTitle: "Subscriber benefits",
      subscriberBenefits: ["Max upload: 500MB", "Unlimited jobs per day", "Priority processing (no queue)", "Original WAV downloads available"],
      subscribe: "Subscribe",
      manage: "Manage subscription",
      active: "Active",
      inactive: "Inactive",
      needLogin: "Please sign in to subscribe",
      missingProduct: "Subscription product is not configured",
    },
    nav: {
      title: "Tools",
      demix: "Instrumental Removal",
      dereverb: "De-reverb",
      bpm: "BPM Finder",
      stems: "4-Stem Separation",
      history: "History",
      settings: "Settings",
      billing: "Subscription",
      tickets: "Support Tickets",
      ticketManage: "Ticket Management",
    },
    header: {
      searchPlaceholder: "Search songs or tasks...",
      language: "Language",
      theme: "Theme",
      login: "Sign in",
      logout: "Sign out",
    },
    home: {
      title: "Vocal processing",
      subtitle: "Demix vocals, tame reverb, and grab BPM in one place.",
      prompt: "Drop or upload audio to get started",
      uploadCta: "Upload audio",
      dropHint: "Supports WAV/MP3/FLAC up to 10 minutes",
      tools: {
        demix: {
          title: "Instrumental Removal",
          description: "Isolate vocals or backing tracks with fast STEM export.",
          badge: "Demix",
        },
        dereverb: {
          title: "De-reverb",
          description: "Reduce room reverb and tails while keeping clarity.",
          badge: "De-reverb",
        },
        bpm: {
          title: "BPM Finder",
          description: "Auto-detect tempo with optional tap-to-sync.",
          badge: "BPM",
        },
      },
      presets: ["Pop vocal", "Live vocal", "Hip-hop drums", "Podcast"],
    },
    auth: {
      login: {
        title: "Welcome back",
        subtitle: "Sign in to manage vocal jobs.",
        action: "Sign in",
        alt: "No account?",
        forgot: "Forgot password?",
      },
      register: {
        title: "Create account",
        subtitle: "Spin up your cloud vocal lab.",
        action: "Register",
        alt: "Already registered?",
        terms: "I agree to the terms of service",
        success: "Sign up successful",
        successCheckEmail: "Sign up successful. Please check your email for the verification link (also check spam).",
      },
      reset: {
        title: "Reset password",
        subtitle: "We will email you a link to reset it.",
        action: "Send reset email",
        alt: "Back to sign in",
      },
      form: {
        email: "Email",
        password: "Password",
        name: "Name",
        confirmPassword: "Confirm password",
        remember: "Remember me",
      },
    },
    history: {
      title: "History",
      empty: "No records yet. Your completed splits will appear here.",
      cols: { task: "Task", inst: "Instrumental", vocal: "Vocal", created: "Created", action: "Actions" },
      downloadInst: "Download Inst",
      downloadVocal: "Download Vocal",
      delete: "Delete",
    },
    settings: {
      title: "Account Settings",
      profileTitle: "Display Name",
      nameLabel: "Username",
      saveName: "Save name",
      passwordTitle: "Change Password",
      currentPwd: "Current password",
      newPwd: "New password",
      confirmPwd: "Confirm new password",
      savePwd: "Update password",
      successName: "Name updated",
      successPwd: "Password updated, please sign in again",
      mismatch: "Passwords do not match",
    },
    tickets: {
      title: "Support Tickets",
      subtitle: "Submit an issue and we’ll get back to you as soon as possible.",
      newTitle: "New ticket",
      category: "Category",
      categories: { demix: "Separation", billing: "Subscription", other: "Other" },
      subject: "Subject",
      subjectPlaceholder: "Short summary (optional)",
      content: "Description",
      contentPlaceholder: "Describe your issue with steps and context.",
      submit: "Submit",
      myTickets: "My tickets",
      allTickets: "All tickets",
      viewAll: "View all",
      hideAll: "My tickets only",
      status: "Status",
      statuses: { open: "Open", answered: "Answered", closed: "Closed" },
      statusAll: "All",
      empty: "No tickets yet",
      you: "You",
      admin: "Admin",
      adminOnly: "Admin access required",
      createdAt: "Created",
      delete: "Delete ticket",
      deleteConfirm: "Delete this ticket? This cannot be undone.",
      deleted: "Deleted",
      replyPlaceholder: "Type a message…",
      send: "Send",
      close: "Close ticket",
      reopen: "Reopen",
      loadFailed: "Failed to load, please try again",
      createFailed: "Failed to submit, please try again",
      replyFailed: "Failed to send, please try again",
    },
    footer: {
      rights: "(C) 2025 demixr",
      version: "Platform v1.0.0",
    },
  },
  ja: {
    appName: "demixr",
    tagline: "ボーカルツールボックス",
    brandSubtitle: "AI ボーカル分離",
    errors: {
      needLogin: "ログインしてください",
      unknown: "エラーが発生しました",
      uploadFailed: "アップロードに失敗しました",
      fileTooLarge: "ファイルサイズが大きすぎます（最大 {max_mb}MB）",
      decodeFailed: "デコードに失敗しました。別のファイル/形式でお試しください。",
      durationTooShort: "音声が短すぎます（最小 {min_seconds} 秒）",
      dailyLimitReached: "本日の上限に達しました（{limit} 回/日）。購読して続行してください。",
      unsupportedFileType: "未対応のファイル形式です",
      wavDownloadRequiresSubscription: "WAV のダウンロードは購読ユーザーのみ利用できます",
      mp3: "MP3",
      wav: "WAV",
      taskNotFoundOrExpired: "タスクが見つからないか期限切れです。再アップロードしてください。",
      processingTimeout: "処理がタイムアウトしたか中断されました。再アップロードしてください。",
    },
    faq: {
      title: "よくある質問",
      demix: [
        {
          q: "アップロードに失敗します",
          a: "現在、サーバーでは厳格な音声処理・リソーススケジューリング方針を適用しています。\n1ファイルあたりの最大アップロードサイズは、未購読ユーザーが 200 MB、購読ユーザーが 500 MB です。\n該当する制限を超えるとアップロードに失敗します。\n制限内でも問題が続く場合は、詳細調査のためご連絡ください。",
        },
        {
          q: "最小アップロード時間",
          a: "音声の長さは 15 秒以上である必要があります。\n15 秒未満の音声はバックエンド処理を開始できないため、最低時間を満たした音声をアップロードしてください。",
        },
        {
          q: "購読ユーザーと未購読ユーザーの違い",
          a: "音声処理（ボーカル除去 / リバーブ除去）は計算コストが高いため、ユーザー種別ごとにポリシーを適用しています。\n\n未購読ユーザー\n- 1日あたり無制限\n- ジョブはキューに入り待機します\n- 元の WAV 形式のダウンロード不可\n\n購読ユーザー\n- 1日あたり無制限\n- 優先処理（待機なし）\n- 処理後の元 WAV のダウンロード可\n\n優先処理や WAV ダウンロードをご希望の場合は、購読へのアップグレードをご検討ください。",
        },
      ],
      dereverb: [
        {
          q: "アップロードに失敗します",
          a: "現在、サーバーでは厳格な音声処理・リソーススケジューリング方針を適用しています。\n1ファイルあたりの最大アップロードサイズは、未購読ユーザーが 200 MB、購読ユーザーが 500 MB です。\n該当する制限を超えるとアップロードに失敗します。\n制限内でも問題が続く場合は、詳細調査のためご連絡ください。",
        },
        {
          q: "最小アップロード時間",
          a: "音声の長さは 15 秒以上である必要があります。\n15 秒未満の音声はバックエンド処理を開始できないため、最低時間を満たした音声をアップロードしてください。",
        },
        {
          q: "リバーブ除去の推奨手順",
          a: "リバーブ除去を使う前に、必ずボーカル分離を行い、ボーカルトラックのみを残してください。\n本機能は分離済みボーカル向けに最適化されており、伴奏や環境音を含む混合音源に直接適用すると、効果が不安定になったり歪みが発生する場合があります。",
        },
        {
          q: "購読ユーザーと未購読ユーザーの違い",
          a: "音声処理（ボーカル除去 / リバーブ除去）は計算コストが高いため、ユーザー種別ごとにポリシーを適用しています。\n\n未購読ユーザー\n- 1日あたり無制限\n- ジョブはキューに入り待機します\n- 元の WAV 形式のダウンロード不可\n\n購読ユーザー\n- 1日あたり無制限\n- 優先処理（待機なし）\n- 処理後の元 WAV のダウンロード可\n\n優先処理や WAV ダウンロードをご希望の場合は、購読へのアップグレードをご検討ください。",
        },
      ],
      bpm: [
        {
          q: "アップロードに失敗します",
          a: "現在、サーバーでは厳格な音声処理・リソーススケジューリング方針を適用しています。\n1ファイルあたりの最大アップロードサイズは、未購読ユーザーが 200 MB、購読ユーザーが 500 MB です。\n該当する制限を超えるとアップロードに失敗します。\n制限内でも問題が続く場合は、詳細調査のためご連絡ください。",
        },
        {
          q: "最小アップロード時間",
          a: "音声の長さは 15 秒以上である必要があります。\n15 秒未満の音声はバックエンド処理を開始できないため、最低時間を満たした音声をアップロードしてください。",
        },
        {
          q: "購読ユーザーと未購読ユーザーの違い",
          a: "音声処理（ボーカル除去 / リバーブ除去）は計算コストが高いため、ユーザー種別ごとにポリシーを適用しています。\n\n未購読ユーザー\n- 1日あたり無制限\n- ジョブはキューに入り待機します\n- 元の WAV 形式のダウンロード不可\n\n購読ユーザー\n- 1日あたり無制限\n- 優先処理（待機なし）\n- 処理後の元 WAV のダウンロード可\n\n優先処理や WAV ダウンロードをご希望の場合は、購読へのアップグレードをご検討ください。",
        },
      ],
    },
    billing: {
      title: "サブスクリプション",
      subtitle: "上限回数・処理速度・高品質出力を強化するためにアップグレードできます。",
      nonSubscriberTitle: "未購読ユーザーの権利",
      nonSubscriberBenefits: ["キュー待ちが発生", "最大アップロード: 200MB", "1日あたり無制限", "MP3 に対応"],
      subscriberTitle: "購読特典",
      subscriberBenefits: ["最大アップロード: 500MB", "1日あたり無制限", "優先処理（待機なし）", "元の WAV ダウンロード対応"],
      subscribe: "購読する",
      manage: "購読を管理",
      active: "有効",
      inactive: "無効",
      needLogin: "購読するにはログインしてください",
      missingProduct: "購読商品が設定されていません",
    },
    nav: {
      title: "ツール",
      demix: "伴奏カット",
      dereverb: "リバーブ除去",
      bpm: "BPM 検出",
      stems: "楽器分離",
      history: "履歴",
      settings: "設定",
      billing: "購読",
      tickets: "サポート",
      ticketManage: "チケット管理",
    },
    header: {
      searchPlaceholder: "楽曲名やタスクを検索...",
      language: "言語",
      theme: "テーマ",
      login: "ログイン",
      logout: "ログアウト",
    },
    home: {
      title: "ボーカル処理",
      subtitle: "伴奏カット、リバーブ除去、BPM検出をまとめて。",
      prompt: "音声をドロップまたはアップロードして開始",
      uploadCta: "音声をアップロード",
      dropHint: "WAV/MP3/FLAC、最長10分まで",
      tools: {
        demix: {
          title: "伴奏カット",
          description: "ボーカル/伴奏を分離し、素早くステムを書き出し。",
          badge: "Demix",
        },
        dereverb: {
          title: "リバーブ除去",
          description: "残響やテールを抑え、声の明瞭さを保持。",
          badge: "De-reverb",
        },
        bpm: {
          title: "BPM 検出",
          description: "自動テンポ検出とタップ入力に対応。",
          badge: "BPM",
        },
      },
      presets: ["ポップボーカル", "ライブボーカル", "ヒップホップドラム", "ポッドキャスト"],
    },
    auth: {
      login: {
        title: "おかえりなさい",
        subtitle: "データセットと分離タスクを管理します。",
        action: "ログイン",
        alt: "アカウントが無い方は？",
        forgot: "パスワードを忘れた？",
      },
      register: {
        title: "アカウント作成",
        subtitle: "クラウドのボーカルラボを開始。",
        action: "登録する",
        alt: "すでに登録済み？",
        terms: "利用規約に同意します",
        success: "登録が完了しました",
        successCheckEmail: "登録が完了しました。確認メールをご確認ください（迷惑メールもご確認ください）。",
      },
      reset: {
        title: "パスワード再設定",
        subtitle: "再設定リンクをメールで送信します。",
        action: "リセットメールを送る",
        alt: "ログインに戻る",
      },
      form: {
        email: "メール",
        password: "パスワード",
        name: "名前",
        confirmPassword: "確認用パスワード",
        remember: "ログイン状態を保持",
      },
    },
    tickets: {
      title: "サポートチケット",
      subtitle: "問題を送信すると、できるだけ早く返信します。",
      newTitle: "新規チケット",
      category: "カテゴリ",
      categories: { demix: "分離", billing: "購読", other: "その他" },
      subject: "件名",
      subjectPlaceholder: "要約（任意）",
      content: "内容",
      contentPlaceholder: "発生した問題の内容と手順を詳しくご記入ください。",
      submit: "送信",
      myTickets: "自分のチケット",
      allTickets: "すべてのチケット",
      viewAll: "全件表示",
      hideAll: "自分のみ",
      status: "ステータス",
      statuses: { open: "受付中", answered: "返信済み", closed: "クローズ" },
      statusAll: "すべて",
      empty: "まだチケットがありません",
      you: "あなた",
      admin: "管理者",
      adminOnly: "管理者権限が必要です",
      createdAt: "作成日時",
      delete: "チケットを削除",
      deleteConfirm: "このチケットを削除しますか？元に戻せません。",
      deleted: "削除しました",
      replyPlaceholder: "メッセージを入力…",
      send: "送信",
      close: "チケットを閉じる",
      reopen: "再オープン",
      loadFailed: "読み込みに失敗しました。再試行してください。",
      createFailed: "送信に失敗しました。再試行してください。",
      replyFailed: "送信に失敗しました。再試行してください。",
    },
    history: {
      title: "履歴",
      empty: "まだ履歴がありません。分離完了後に表示されます。",
      cols: { task: "タスク", inst: "伴奏", vocal: "ボーカル", created: "作成日", action: "操作" },
      downloadInst: "伴奏をダウンロード",
      downloadVocal: "ボーカルをダウンロード",
      delete: "削除",
    },
    settings: {
      title: "アカウント設定",
      profileTitle: "表示名",
      nameLabel: "ユーザー名",
      saveName: "名前を保存",
      passwordTitle: "パスワード変更",
      currentPwd: "現在のパスワード",
      newPwd: "新しいパスワード",
      confirmPwd: "新パスワード確認",
      savePwd: "パスワード更新",
      successName: "名前を更新しました",
      successPwd: "パスワードを更新しました。再ログインしてください",
      mismatch: "パスワードが一致しません",
    },
    footer: {
      rights: "(C) 2025 demixr",
      version: "Platform v1.0.0",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
