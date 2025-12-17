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

const dictionaryZh: Dictionary = {
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
};

const dictionaryEn: Dictionary = {
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
};

const dictionaryJa: Dictionary = {
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
};

const dictionaryKo: Dictionary = {
  appName: "demixr",
  tagline: "보컬 툴킷",
  brandSubtitle: "AI 보컬 분리",
  errors: {
    needLogin: "로그인이 필요합니다",
    unknown: "오류가 발생했습니다",
    uploadFailed: "업로드 실패",
    fileTooLarge: "파일이 너무 큽니다(최대 {max_mb}MB)",
    decodeFailed: "디코딩에 실패했습니다. 다른 파일이나 형식으로 다시 시도하세요.",
    durationTooShort: "오디오가 너무 짧습니다(최소 {min_seconds}초)",
    dailyLimitReached: "오늘 사용 한도에 도달했습니다({limit}회). 계속하려면 구독하세요.",
    unsupportedFileType: "지원하지 않는 파일 형식",
    wavDownloadRequiresSubscription: "WAV 다운로드는 구독자만 가능합니다",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "작업을 찾을 수 없거나 만료되었습니다. 다시 업로드하세요.",
    processingTimeout: "처리 시간이 초과되었거나 중단되었습니다. 다시 업로드하세요.",
  },
  faq: {
    title: "자주 묻는 질문",
    demix: [
      {
        q: "업로드에 실패했어요",
        a: "서버는 엄격한 오디오 처리 및 리소스 스케줄링 정책을 사용합니다.\n파일 1개당 최대 업로드: 비구독 200MB, 구독 500MB.\n해당 제한을 초과하면 업로드가 실패합니다.\n제한 내에서도 문제가 계속되면 추가 확인을 위해 문의해 주세요.",
      },
      {
        q: "최소 오디오 길이",
        a: "오디오는 최소 15초 이상이어야 합니다.\n15초 미만의 클립은 백엔드 처리 파이프라인이 시작되지 않으므로 더 긴 오디오를 업로드해 주세요.",
      },
      {
        q: "구독자와 비구독자의 차이",
        a: "오디오 처리(보컬 분리/리버브 제거)는 리소스 소모가 크기 때문에 사용자 유형별 정책을 적용합니다.\n\n비구독\n- 하루 무제한\n- 작업은 대기열로 처리\n- 원본 WAV 다운로드 불가\n\n구독\n- 하루 무제한\n- 우선 처리(대기열 없음)\n- 원본 WAV 다운로드 가능\n\n대기열 없이 처리하거나 WAV를 받으려면 구독 업그레이드를 권장합니다.",
      },
    ],
    dereverb: [
      {
        q: "업로드에 실패했어요",
        a: "서버는 엄격한 오디오 처리 및 리소스 스케줄링 정책을 사용합니다.\n파일 1개당 최대 업로드: 비구독 200MB, 구독 500MB.\n해당 제한을 초과하면 업로드가 실패합니다.\n제한 내에서도 문제가 계속되면 추가 확인을 위해 문의해 주세요.",
      },
      {
        q: "최소 오디오 길이",
        a: "오디오는 최소 15초 이상이어야 합니다.\n15초 미만의 클립은 백엔드 처리 파이프라인이 시작되지 않으므로 더 긴 오디오를 업로드해 주세요.",
      },
      {
        q: "Dereverb 권장 워크플로",
        a: "Dereverb를 사용하기 전에 먼저 보컬 분리를 실행해 보컬 트랙만 남겨 주세요.\nDereverb 모듈은 분리된 보컬에 최적화되어 있으며, 반주나 앰비언스가 포함된 믹스에 바로 적용하면 아티팩트나 왜곡이 생길 수 있습니다.",
      },
      {
        q: "구독자와 비구독자의 차이",
        a: "오디오 처리(보컬 분리/리버브 제거)는 리소스 소모가 크기 때문에 사용자 유형별 정책을 적용합니다.\n\n비구독\n- 하루 무제한\n- 작업은 대기열로 처리\n- 원본 WAV 다운로드 불가\n\n구독\n- 하루 무제한\n- 우선 처리(대기열 없음)\n- 원본 WAV 다운로드 가능\n\n대기열 없이 처리하거나 WAV를 받으려면 구독 업그레이드를 권장합니다.",
      },
    ],
    bpm: [
      {
        q: "업로드에 실패했어요",
        a: "서버는 엄격한 오디오 처리 및 리소스 스케줄링 정책을 사용합니다.\n파일 1개당 최대 업로드: 비구독 200MB, 구독 500MB.\n해당 제한을 초과하면 업로드가 실패합니다.\n제한 내에서도 문제가 계속되면 추가 확인을 위해 문의해 주세요.",
      },
      {
        q: "최소 오디오 길이",
        a: "오디오는 최소 15초 이상이어야 합니다.\n15초 미만의 클립은 백엔드 처리 파이프라인이 시작되지 않으므로 더 긴 오디오를 업로드해 주세요.",
      },
      {
        q: "구독자와 비구독자의 차이",
        a: "오디오 처리(보컬 분리/리버브 제거)는 리소스 소모가 크기 때문에 사용자 유형별 정책을 적용합니다.\n\n비구독\n- 하루 무제한\n- 작업은 대기열로 처리\n- 원본 WAV 다운로드 불가\n\n구독\n- 하루 무제한\n- 우선 처리(대기열 없음)\n- 원본 WAV 다운로드 가능\n\n대기열 없이 처리하거나 WAV를 받으려면 구독 업그레이드를 권장합니다.",
      },
    ],
    demucs: [
      {
        q: "업로드에 실패했어요",
        a: "서버는 엄격한 오디오 처리 및 리소스 스케줄링 정책을 사용합니다.\n파일 1개당 최대 업로드: 비구독 200MB, 구독 500MB.\n해당 제한을 초과하면 업로드가 실패합니다.\n제한 내에서도 문제가 계속되면 추가 확인을 위해 문의해 주세요.",
      },
      {
        q: "최소 오디오 길이",
        a: "오디오는 최소 15초 이상이어야 합니다.\n15초 미만의 클립은 백엔드 처리 파이프라인이 시작되지 않으므로 더 긴 오디오를 업로드해 주세요.",
      },
      {
        q: "구독자와 비구독자의 차이",
        a: "오디오 처리(보컬 분리/리버브 제거/4트랙 분리)는 리소스 소모가 크기 때문에 사용자 유형별 정책을 적용합니다.\n\n비구독\n- 하루 무제한\n- 작업은 대기열로 처리\n- 원본 WAV 다운로드 불가\n\n구독\n- 하루 무제한\n- 우선 처리(대기열 없음)\n- 원본 WAV 다운로드 가능\n\n대기열 없이 처리하거나 WAV를 받으려면 구독 업그레이드를 권장합니다.",
      },
    ],
  },
  billing: {
    title: "구독",
    subtitle: "더 높은 제한, 더 빠른 처리, 원본 WAV 다운로드를 위해 업그레이드하세요.",
    nonSubscriberTitle: "무료 플랜 (비구독)",
    nonSubscriberBenefits: ["대기열 처리", "최대 업로드: 200MB", "일일 무제한", "MP3 지원"],
    subscriberTitle: "구독 혜택",
    subscriberBenefits: ["최대 업로드: 500MB", "일일 무제한", "우선 처리(대기열 없음)", "원본 WAV 다운로드 가능"],
    subscribe: "구독하기",
    manage: "구독 관리",
    active: "활성",
    inactive: "비활성",
    needLogin: "구독하려면 로그인하세요",
    missingProduct: "구독 상품이 설정되지 않았습니다",
  },
  nav: {
    title: "도구",
    demix: "반주 제거",
    dereverb: "리버브 제거",
    bpm: "BPM 찾기",
    stems: "4트랙 분리",
    history: "기록",
    settings: "설정",
    billing: "구독",
    tickets: "지원 티켓",
    ticketManage: "티켓 관리",
  },
  header: {
    searchPlaceholder: "곡 또는 작업 검색...",
    language: "언어",
    theme: "테마",
    login: "로그인",
    logout: "로그아웃",
  },
  home: {
    title: "보컬 처리",
    subtitle: "보컬 분리, 리버브 감소, BPM 분석을 한 곳에서.",
    prompt: "오디오를 드롭하거나 업로드하여 시작하세요",
    uploadCta: "오디오 업로드",
    dropHint: "WAV/MP3/FLAC 최대 10분 지원",
    tools: {
      demix: {
        title: "반주 제거",
        description: "보컬 또는 반주 트랙을 분리하고 STEM으로 빠르게 내보내기.",
        badge: "Demix",
      },
      dereverb: {
        title: "리버브 제거",
        description: "잔향과 테일을 줄이면서 선명도를 유지합니다.",
        badge: "Dereverb",
      },
      bpm: {
        title: "BPM 찾기",
        description: "템포를 자동 감지하고 탭 동기화도 지원합니다.",
        badge: "BPM",
      },
    },
    presets: ["팝 보컬", "라이브 보컬", "힙합 드럼", "팟캐스트"],
  },
  auth: {
    login: {
      title: "다시 오신 것을 환영합니다",
      subtitle: "보컬 작업을 관리하려면 로그인하세요.",
      action: "로그인",
      alt: "계정이 없으신가요?",
      forgot: "비밀번호를 잊으셨나요?",
    },
    register: {
      title: "계정 만들기",
      subtitle: "클라우드 보컬 랩을 시작하세요.",
      action: "회원가입",
      alt: "이미 가입하셨나요?",
      terms: "서비스 약관에 동의합니다",
      success: "가입이 완료되었습니다",
      successCheckEmail: "가입이 완료되었습니다. 이메일에서 인증 링크를 확인하세요(스팸함도 확인).",
    },
    reset: {
      title: "비밀번호 재설정",
      subtitle: "재설정 링크를 이메일로 보내드립니다.",
      action: "재설정 이메일 보내기",
      alt: "로그인으로 돌아가기",
    },
    form: {
      email: "이메일",
      password: "비밀번호",
      name: "이름",
      confirmPassword: "비밀번호 확인",
      remember: "로그인 상태 유지",
    },
  },
  tickets: {
    title: "지원 티켓",
    subtitle: "문제를 제출하면 가능한 빨리 답변드리겠습니다.",
    newTitle: "새 티켓",
    category: "카테고리",
    categories: { demix: "분리", billing: "구독", other: "기타" },
    subject: "제목",
    subjectPlaceholder: "간단한 요약(선택)",
    content: "설명",
    contentPlaceholder: "문제와 재현 단계, 관련 정보를 적어주세요.",
    submit: "제출",
    myTickets: "내 티켓",
    allTickets: "전체 티켓",
    viewAll: "전체 보기",
    hideAll: "내 티켓만",
    status: "상태",
    statuses: { open: "열림", answered: "답변됨", closed: "닫힘" },
    statusAll: "전체",
    empty: "티켓이 없습니다",
    you: "나",
    admin: "관리자",
    adminOnly: "관리자 권한이 필요합니다",
    createdAt: "생성일",
    delete: "티켓 삭제",
    deleteConfirm: "이 티켓을 삭제할까요? 되돌릴 수 없습니다.",
    deleted: "삭제됨",
    replyPlaceholder: "메시지를 입력하세요…",
    send: "보내기",
    close: "닫기",
    reopen: "다시 열기",
    loadFailed: "불러오기에 실패했습니다. 다시 시도하세요.",
    createFailed: "제출에 실패했습니다. 다시 시도하세요.",
    replyFailed: "전송에 실패했습니다. 다시 시도하세요.",
  },
  history: {
    title: "기록",
    empty: "아직 기록이 없습니다. 완료된 작업이 여기에 표시됩니다.",
    cols: { task: "작업", inst: "반주", vocal: "보컬", created: "생성", action: "작업" },
    downloadInst: "반주 다운로드",
    downloadVocal: "보컬 다운로드",
    delete: "삭제",
  },
  settings: {
    title: "계정 설정",
    profileTitle: "표시 이름",
    nameLabel: "사용자 이름",
    saveName: "이름 저장",
    passwordTitle: "비밀번호 변경",
    currentPwd: "현재 비밀번호",
    newPwd: "새 비밀번호",
    confirmPwd: "새 비밀번호 확인",
    savePwd: "비밀번호 업데이트",
    successName: "이름이 업데이트되었습니다",
    successPwd: "비밀번호가 업데이트되었습니다. 다시 로그인하세요",
    mismatch: "비밀번호가 일치하지 않습니다",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryRu: Dictionary = {
  appName: "demixr",
  tagline: "Инструменты для вокала",
  brandSubtitle: "AI-разделение вокала",
  errors: {
    needLogin: "Пожалуйста, войдите",
    unknown: "Произошла ошибка",
    uploadFailed: "Не удалось загрузить",
    fileTooLarge: "Файл слишком большой (макс. {max_mb}MB)",
    decodeFailed: "Не удалось декодировать. Попробуйте другой файл или формат.",
    durationTooShort: "Аудио слишком короткое (мин. {min_seconds} сек.)",
    dailyLimitReached: "Достигнут дневной лимит ({limit} в день). Оформите подписку, чтобы продолжить.",
    unsupportedFileType: "Неподдерживаемый тип файла",
    wavDownloadRequiresSubscription: "Скачивание WAV доступно только подписчикам",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Задача не найдена или истекла. Загрузите заново.",
    processingTimeout: "Обработка заняла слишком много времени или была прервана. Загрузите заново.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Не удалось загрузить",
        a: "Сервер использует строгие политики обработки аудио и распределения ресурсов.\nМаксимальный размер одного файла: 200 MB для пользователей без подписки и 500 MB для подписчиков.\nФайлы, превышающие лимит, не будут загружены.\nЕсли проблема сохраняется при соблюдении лимитов, свяжитесь с нами для проверки.",
      },
      {
        q: "Минимальная длительность аудио",
        a: "Аудио должно быть не короче 15 секунд.\nКлипы короче 15 секунд не запускают обработку на сервере, поэтому загрузите более длинный файл.",
      },
      {
        q: "Подписчик vs без подписки",
        a: "Обработка аудио (разделение вокала / удаление реверба) ресурсоёмка, поэтому действуют разные правила:\n\nБез подписки\n- Безлимит в день\n- Задания в очереди\n- Скачивание WAV недоступно\n\nПодписка\n- Безлимит в день\n- Приоритет без очереди\n- Скачивание WAV доступно\n\nЕсли вам нужна обработка без очереди и WAV, оформите подписку.",
      },
    ],
    dereverb: [
      {
        q: "Не удалось загрузить",
        a: "Сервер использует строгие политики обработки аудио и распределения ресурсов.\nМаксимальный размер одного файла: 200 MB для пользователей без подписки и 500 MB для подписчиков.\nФайлы, превышающие лимит, не будут загружены.\nЕсли проблема сохраняется при соблюдении лимитов, свяжитесь с нами для проверки.",
      },
      {
        q: "Минимальная длительность аудио",
        a: "Аудио должно быть не короче 15 секунд.\nКлипы короче 15 секунд не запускают обработку на сервере, поэтому загрузите более длинный файл.",
      },
      {
        q: "Рекомендованный сценарий для Dereverb",
        a: "Перед Dereverb сначала выполните разделение вокала и оставьте только вокальную дорожку.\nМодуль Dereverb оптимизирован для уже выделенного вокала; применение к миксу с инструменталом/атмосферой может вызвать артефакты или искажения.",
      },
      {
        q: "Подписчик vs без подписки",
        a: "Обработка аудио (разделение вокала / удаление реверба) ресурсоёмка, поэтому действуют разные правила:\n\nБез подписки\n- Безлимит в день\n- Задания в очереди\n- Скачивание WAV недоступно\n\nПодписка\n- Безлимит в день\n- Приоритет без очереди\n- Скачивание WAV доступно\n\nЕсли вам нужна обработка без очереди и WAV, оформите подписку.",
      },
    ],
    bpm: [
      {
        q: "Не удалось загрузить",
        a: "Сервер использует строгие политики обработки аудио и распределения ресурсов.\nМаксимальный размер одного файла: 200 MB для пользователей без подписки и 500 MB для подписчиков.\nФайлы, превышающие лимит, не будут загружены.\nЕсли проблема сохраняется при соблюдении лимитов, свяжитесь с нами для проверки.",
      },
      {
        q: "Минимальная длительность аудио",
        a: "Аудио должно быть не короче 15 секунд.\nКлипы короче 15 секунд не запускают обработку на сервере, поэтому загрузите более длинный файл.",
      },
      {
        q: "Подписчик vs без подписки",
        a: "Обработка аудио (разделение вокала / удаление реверба) ресурсоёмка, поэтому действуют разные правила:\n\nБез подписки\n- Безлимит в день\n- Задания в очереди\n- Скачивание WAV недоступно\n\nПодписка\n- Безлимит в день\n- Приоритет без очереди\n- Скачивание WAV доступно\n\nЕсли вам нужна обработка без очереди и WAV, оформите подписку.",
      },
    ],
    demucs: [
      {
        q: "Не удалось загрузить",
        a: "Сервер использует строгие политики обработки аудио и распределения ресурсов.\nМаксимальный размер одного файла: 200 MB для пользователей без подписки и 500 MB для подписчиков.\nФайлы, превышающие лимит, не будут загружены.\nЕсли проблема сохраняется при соблюдении лимитов, свяжитесь с нами для проверки.",
      },
      {
        q: "Минимальная длительность аудио",
        a: "Аудио должно быть не короче 15 секунд.\nКлипы короче 15 секунд не запускают обработку на сервере, поэтому загрузите более длинный файл.",
      },
      {
        q: "Подписчик vs без подписки",
        a: "Обработка аудио (разделение вокала / удаление реверба / разделение на 4 стема) ресурсоёмка, поэтому действуют разные правила:\n\nБез подписки\n- Безлимит в день\n- Задания в очереди\n- Скачивание WAV недоступно\n\nПодписка\n- Безлимит в день\n- Приоритет без очереди\n- Скачивание WAV доступно\n\nЕсли вам нужна обработка без очереди и WAV, оформите подписку.",
      },
    ],
  },
  billing: {
    title: "Подписка",
    subtitle: "Обновите план, чтобы получить более высокие лимиты, более быструю обработку и WAV в оригинальном качестве.",
    nonSubscriberTitle: "Бесплатный план (без подписки)",
    nonSubscriberBenefits: ["Обработка в очереди", "Макс. загрузка: 200MB", "Безлимит в день", "Поддерживается MP3"],
    subscriberTitle: "Преимущества подписки",
    subscriberBenefits: ["Макс. загрузка: 500MB", "Безлимит в день", "Приоритет (без очереди)", "Доступно скачивание WAV"],
    subscribe: "Оформить подписку",
    manage: "Управлять подпиской",
    active: "Активна",
    inactive: "Неактивна",
    needLogin: "Войдите, чтобы оформить подписку",
    missingProduct: "Продукт подписки не настроен",
  },
  nav: {
    title: "Инструменты",
    demix: "Удаление инструментала",
    dereverb: "Удаление реверба",
    bpm: "Поиск BPM",
    stems: "Разделение на 4 стема",
    history: "История",
    settings: "Настройки",
    billing: "Подписка",
    tickets: "Тикеты поддержки",
    ticketManage: "Управление тикетами",
  },
  header: {
    searchPlaceholder: "Поиск треков или задач...",
    language: "Язык",
    theme: "Тема",
    login: "Войти",
    logout: "Выйти",
  },
  home: {
    title: "Обработка вокала",
    subtitle: "Разделяйте вокал, уменьшайте реверб и определяйте BPM в одном месте.",
    prompt: "Перетащите или загрузите аудио, чтобы начать",
    uploadCta: "Загрузить аудио",
    dropHint: "Поддержка WAV/MP3/FLAC до 10 минут",
    tools: {
      demix: {
        title: "Удаление инструментала",
        description: "Изолируйте вокал или аккомпанемент и быстро экспортируйте STEM.",
        badge: "Demix",
      },
      dereverb: {
        title: "Удаление реверба",
        description: "Снижайте комнатный реверб и хвосты, сохраняя чистоту.",
        badge: "Dereverb",
      },
      bpm: {
        title: "Поиск BPM",
        description: "Автоопределение темпа с опцией tap-to-sync.",
        badge: "BPM",
      },
    },
    presets: ["Поп-вокал", "Живой вокал", "Хип-хоп барабаны", "Подкаст"],
  },
  auth: {
    login: {
      title: "С возвращением",
      subtitle: "Войдите, чтобы управлять задачами.",
      action: "Войти",
      alt: "Нет аккаунта?",
      forgot: "Забыли пароль?",
    },
    register: {
      title: "Создать аккаунт",
      subtitle: "Запустите свою облачную вокальную лабораторию.",
      action: "Зарегистрироваться",
      alt: "Уже зарегистрированы?",
      terms: "Я согласен с условиями сервиса",
      success: "Регистрация успешна",
      successCheckEmail: "Регистрация успешна. Проверьте почту для ссылки подтверждения (также спам).",
    },
    reset: {
      title: "Сброс пароля",
      subtitle: "Мы отправим вам письмо со ссылкой для сброса.",
      action: "Отправить письмо для сброса",
      alt: "Назад ко входу",
    },
    form: {
      email: "Эл. почта",
      password: "Пароль",
      name: "Имя",
      confirmPassword: "Подтвердите пароль",
      remember: "Запомнить меня",
    },
  },
  tickets: {
    title: "Тикеты поддержки",
    subtitle: "Опишите проблему — мы ответим как можно быстрее.",
    newTitle: "Новый тикет",
    category: "Категория",
    categories: { demix: "Разделение", billing: "Подписка", other: "Другое" },
    subject: "Тема",
    subjectPlaceholder: "Краткое описание (необязательно)",
    content: "Описание",
    contentPlaceholder: "Опишите проблему, шаги и контекст.",
    submit: "Отправить",
    myTickets: "Мои тикеты",
    allTickets: "Все тикеты",
    viewAll: "Показать все",
    hideAll: "Только мои",
    status: "Статус",
    statuses: { open: "Открыт", answered: "Отвечен", closed: "Закрыт" },
    statusAll: "Все",
    empty: "Пока нет тикетов",
    you: "Вы",
    admin: "Админ",
    adminOnly: "Нужны права администратора",
    createdAt: "Создан",
    delete: "Удалить тикет",
    deleteConfirm: "Удалить этот тикет? Это действие нельзя отменить.",
    deleted: "Удалено",
    replyPlaceholder: "Введите сообщение…",
    send: "Отправить",
    close: "Закрыть",
    reopen: "Открыть снова",
    loadFailed: "Не удалось загрузить, попробуйте снова",
    createFailed: "Не удалось отправить, попробуйте снова",
    replyFailed: "Не удалось отправить сообщение, попробуйте снова",
  },
  history: {
    title: "История",
    empty: "Записей пока нет. Готовые результаты появятся здесь.",
    cols: { task: "Задача", inst: "Инструментал", vocal: "Вокал", created: "Создан", action: "Действия" },
    downloadInst: "Скачать инструментал",
    downloadVocal: "Скачать вокал",
    delete: "Удалить",
  },
  settings: {
    title: "Настройки аккаунта",
    profileTitle: "Отображаемое имя",
    nameLabel: "Имя пользователя",
    saveName: "Сохранить имя",
    passwordTitle: "Сменить пароль",
    currentPwd: "Текущий пароль",
    newPwd: "Новый пароль",
    confirmPwd: "Подтвердите новый пароль",
    savePwd: "Обновить пароль",
    successName: "Имя обновлено",
    successPwd: "Пароль обновлён, пожалуйста, войдите снова",
    mismatch: "Пароли не совпадают",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryDe: Dictionary = {
  appName: "demixr",
  tagline: "Vocal-Toolkit",
  brandSubtitle: "KI-Vokaltrennung",
  errors: {
    needLogin: "Bitte zuerst anmelden",
    unknown: "Ein Fehler ist aufgetreten",
    uploadFailed: "Upload fehlgeschlagen",
    fileTooLarge: "Datei ist zu groß (max. {max_mb}MB)",
    decodeFailed: "Dekodierung fehlgeschlagen. Bitte eine andere Datei oder ein anderes Format versuchen.",
    durationTooShort: "Audio ist zu kurz (mind. {min_seconds} Sekunden)",
    dailyLimitReached: "Tageslimit erreicht ({limit} pro Tag). Bitte abonnieren, um fortzufahren.",
    unsupportedFileType: "Nicht unterstützter Dateityp",
    wavDownloadRequiresSubscription: "WAV-Download ist nur für Abonnenten verfügbar",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Auftrag nicht gefunden oder abgelaufen. Bitte erneut hochladen.",
    processingTimeout: "Verarbeitung abgebrochen oder zu lange gedauert. Bitte erneut hochladen.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Upload fehlgeschlagen",
        a: "Der Server nutzt strikte Audio-Verarbeitung und Ressourcenplanung.\nMax. Upload pro Datei: 200 MB für Nicht-Abonnenten, 500 MB für Abonnenten.\nDateien über dem Limit schlagen fehl.\nWenn es innerhalb der Limits weiterhin Probleme gibt, kontaktieren Sie uns bitte.",
      },
      {
        q: "Mindestlänge des Audios",
        a: "Audio muss mindestens 15 Sekunden lang sein.\nClips unter 15 Sekunden starten die Backend-Verarbeitung nicht. Bitte ein längeres Audio hochladen.",
      },
      {
        q: "Abonnent vs. Nicht-Abonnent",
        a: "Audio-Verarbeitung (Vokaltrennung / De-Reverb) ist ressourcenintensiv, daher gelten unterschiedliche Regeln:\n\nNicht-Abonnenten\n- Unbegrenzt pro Tag\n- Jobs werden in eine Warteschlange gestellt\n- Original-WAV-Download nicht verfügbar\n\nAbonnenten\n- Unbegrenzt pro Tag\n- Priorität (keine Warteschlange)\n- Original-WAV-Download verfügbar\n\nWenn Sie keine Warteschlange und WAV-Downloads möchten, empfehlen wir ein Abo.",
      },
    ],
    dereverb: [
      {
        q: "Upload fehlgeschlagen",
        a: "Der Server nutzt strikte Audio-Verarbeitung und Ressourcenplanung.\nMax. Upload pro Datei: 200 MB für Nicht-Abonnenten, 500 MB für Abonnenten.\nDateien über dem Limit schlagen fehl.\nWenn es innerhalb der Limits weiterhin Probleme gibt, kontaktieren Sie uns bitte.",
      },
      {
        q: "Mindestlänge des Audios",
        a: "Audio muss mindestens 15 Sekunden lang sein.\nClips unter 15 Sekunden starten die Backend-Verarbeitung nicht. Bitte ein längeres Audio hochladen.",
      },
      {
        q: "Empfohlener Workflow für De-Reverb",
        a: "Vor De-Reverb bitte zuerst die Vokaltrennung ausführen und nur die isolierte Vokalspur verwenden.\nDas De-Reverb-Modul ist für getrennte Vocals optimiert; Anwendung auf einen Mix (mit Instrumental/Ambience) kann Artefakte oder Verzerrungen erzeugen.",
      },
      {
        q: "Abonnent vs. Nicht-Abonnent",
        a: "Audio-Verarbeitung (Vokaltrennung / De-Reverb) ist ressourcenintensiv, daher gelten unterschiedliche Regeln:\n\nNicht-Abonnenten\n- Unbegrenzt pro Tag\n- Jobs werden in eine Warteschlange gestellt\n- Original-WAV-Download nicht verfügbar\n\nAbonnenten\n- Unbegrenzt pro Tag\n- Priorität (keine Warteschlange)\n- Original-WAV-Download verfügbar\n\nWenn Sie keine Warteschlange und WAV-Downloads möchten, empfehlen wir ein Abo.",
      },
    ],
    bpm: [
      {
        q: "Upload fehlgeschlagen",
        a: "Der Server nutzt strikte Audio-Verarbeitung und Ressourcenplanung.\nMax. Upload pro Datei: 200 MB für Nicht-Abonnenten, 500 MB für Abonnenten.\nDateien über dem Limit schlagen fehl.\nWenn es innerhalb der Limits weiterhin Probleme gibt, kontaktieren Sie uns bitte.",
      },
      {
        q: "Mindestlänge des Audios",
        a: "Audio muss mindestens 15 Sekunden lang sein.\nClips unter 15 Sekunden starten die Backend-Verarbeitung nicht. Bitte ein längeres Audio hochladen.",
      },
      {
        q: "Abonnent vs. Nicht-Abonnent",
        a: "Audio-Verarbeitung (Vokaltrennung / De-Reverb) ist ressourcenintensiv, daher gelten unterschiedliche Regeln:\n\nNicht-Abonnenten\n- Unbegrenzt pro Tag\n- Jobs werden in eine Warteschlange gestellt\n- Original-WAV-Download nicht verfügbar\n\nAbonnenten\n- Unbegrenzt pro Tag\n- Priorität (keine Warteschlange)\n- Original-WAV-Download verfügbar\n\nWenn Sie keine Warteschlange und WAV-Downloads möchten, empfehlen wir ein Abo.",
      },
    ],
    demucs: [
      {
        q: "Upload fehlgeschlagen",
        a: "Der Server nutzt strikte Audio-Verarbeitung und Ressourcenplanung.\nMax. Upload pro Datei: 200 MB für Nicht-Abonnenten, 500 MB für Abonnenten.\nDateien über dem Limit schlagen fehl.\nWenn es innerhalb der Limits weiterhin Probleme gibt, kontaktieren Sie uns bitte.",
      },
      {
        q: "Mindestlänge des Audios",
        a: "Audio muss mindestens 15 Sekunden lang sein.\nClips unter 15 Sekunden starten die Backend-Verarbeitung nicht. Bitte ein längeres Audio hochladen.",
      },
      {
        q: "Abonnent vs. Nicht-Abonnent",
        a: "Audio-Verarbeitung (Vokaltrennung / De-Reverb / 4-Stem-Trennung) ist ressourcenintensiv, daher gelten unterschiedliche Regeln:\n\nNicht-Abonnenten\n- Unbegrenzt pro Tag\n- Jobs werden in eine Warteschlange gestellt\n- Original-WAV-Download nicht verfügbar\n\nAbonnenten\n- Unbegrenzt pro Tag\n- Priorität (keine Warteschlange)\n- Original-WAV-Download verfügbar\n\nWenn Sie keine Warteschlange und WAV-Downloads möchten, empfehlen wir ein Abo.",
      },
    ],
  },
  billing: {
    title: "Abo",
    subtitle: "Upgrade für höhere Limits, schnellere Verarbeitung und Original-WAV-Downloads.",
    nonSubscriberTitle: "Kostenlos (ohne Abo)",
    nonSubscriberBenefits: ["Verarbeitung in Warteschlange", "Max Upload: 200MB", "Unbegrenzt pro Tag", "MP3 unterstützt"],
    subscriberTitle: "Abo-Vorteile",
    subscriberBenefits: ["Max Upload: 500MB", "Unbegrenzt pro Tag", "Priorität (keine Warteschlange)", "Original-WAV-Downloads verfügbar"],
    subscribe: "Abonnieren",
    manage: "Abo verwalten",
    active: "Aktiv",
    inactive: "Inaktiv",
    needLogin: "Bitte anmelden, um zu abonnieren",
    missingProduct: "Abo-Produkt ist nicht konfiguriert",
  },
  nav: {
    title: "Tools",
    demix: "Instrumental-Entfernung",
    dereverb: "De-Reverb",
    bpm: "BPM-Finder",
    stems: "4-Stem-Trennung",
    history: "Verlauf",
    settings: "Einstellungen",
    billing: "Abo",
    tickets: "Support-Tickets",
    ticketManage: "Ticketverwaltung",
  },
  header: {
    searchPlaceholder: "Songs oder Jobs suchen...",
    language: "Sprache",
    theme: "Design",
    login: "Anmelden",
    logout: "Abmelden",
  },
  home: {
    title: "Vokal-Bearbeitung",
    subtitle: "Vokale trennen, Hall reduzieren und BPM finden – alles an einem Ort.",
    prompt: "Audio ablegen oder hochladen, um zu starten",
    uploadCta: "Audio hochladen",
    dropHint: "WAV/MP3/FLAC bis zu 10 Minuten",
    tools: {
      demix: {
        title: "Instrumental-Entfernung",
        description: "Vokale oder Backing-Tracks isolieren und STEM schnell exportieren.",
        badge: "Demix",
      },
      dereverb: {
        title: "De-Reverb",
        description: "Raumhall und Tails reduzieren, dabei klar bleiben.",
        badge: "De-Reverb",
      },
      bpm: {
        title: "BPM-Finder",
        description: "Tempo automatisch erkennen, optional per Tap synchronisieren.",
        badge: "BPM",
      },
    },
    presets: ["Pop-Vokal", "Live-Vokal", "Hip-Hop-Drums", "Podcast"],
  },
  auth: {
    login: {
      title: "Willkommen zurück",
      subtitle: "Anmelden, um Jobs zu verwalten.",
      action: "Anmelden",
      alt: "Noch kein Konto?",
      forgot: "Passwort vergessen?",
    },
    register: {
      title: "Konto erstellen",
      subtitle: "Starten Sie Ihr Vocal-Lab in der Cloud.",
      action: "Registrieren",
      alt: "Bereits registriert?",
      terms: "Ich stimme den Nutzungsbedingungen zu",
      success: "Registrierung erfolgreich",
      successCheckEmail: "Registrierung erfolgreich. Bitte prüfen Sie Ihre E-Mail auf den Bestätigungslink (auch Spam).",
    },
    reset: {
      title: "Passwort zurücksetzen",
      subtitle: "Wir senden Ihnen einen Link zum Zurücksetzen per E-Mail.",
      action: "Reset-Mail senden",
      alt: "Zurück zur Anmeldung",
    },
    form: {
      email: "E-Mail",
      password: "Passwort",
      name: "Name",
      confirmPassword: "Passwort bestätigen",
      remember: "Angemeldet bleiben",
    },
  },
  tickets: {
    title: "Support-Tickets",
    subtitle: "Senden Sie ein Problem – wir antworten so schnell wie möglich.",
    newTitle: "Neues Ticket",
    category: "Kategorie",
    categories: { demix: "Trennung", billing: "Abo", other: "Sonstiges" },
    subject: "Betreff",
    subjectPlaceholder: "Kurze Zusammenfassung (optional)",
    content: "Beschreibung",
    contentPlaceholder: "Beschreiben Sie Ihr Problem mit Schritten und Kontext.",
    submit: "Senden",
    myTickets: "Meine Tickets",
    allTickets: "Alle Tickets",
    viewAll: "Alle anzeigen",
    hideAll: "Nur meine",
    status: "Status",
    statuses: { open: "Offen", answered: "Beantwortet", closed: "Geschlossen" },
    statusAll: "Alle",
    empty: "Noch keine Tickets",
    you: "Sie",
    admin: "Admin",
    adminOnly: "Admin-Zugriff erforderlich",
    createdAt: "Erstellt",
    delete: "Ticket löschen",
    deleteConfirm: "Dieses Ticket löschen? Dies kann nicht rückgängig gemacht werden.",
    deleted: "Gelöscht",
    replyPlaceholder: "Nachricht eingeben…",
    send: "Senden",
    close: "Schließen",
    reopen: "Wieder öffnen",
    loadFailed: "Laden fehlgeschlagen, bitte erneut versuchen",
    createFailed: "Senden fehlgeschlagen, bitte erneut versuchen",
    replyFailed: "Senden fehlgeschlagen, bitte erneut versuchen",
  },
  history: {
    title: "Verlauf",
    empty: "Noch keine Einträge. Ihre fertigen Ergebnisse erscheinen hier.",
    cols: { task: "Job", inst: "Instrumental", vocal: "Vokal", created: "Erstellt", action: "Aktionen" },
    downloadInst: "Instrumental herunterladen",
    downloadVocal: "Vokal herunterladen",
    delete: "Löschen",
  },
  settings: {
    title: "Kontoeinstellungen",
    profileTitle: "Anzeigename",
    nameLabel: "Benutzername",
    saveName: "Name speichern",
    passwordTitle: "Passwort ändern",
    currentPwd: "Aktuelles Passwort",
    newPwd: "Neues Passwort",
    confirmPwd: "Neues Passwort bestätigen",
    savePwd: "Passwort aktualisieren",
    successName: "Name aktualisiert",
    successPwd: "Passwort aktualisiert, bitte erneut anmelden",
    mismatch: "Passwörter stimmen nicht überein",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryPt: Dictionary = {
  appName: "demixr",
  tagline: "Kit vocal",
  brandSubtitle: "Separação vocal por IA",
  errors: {
    needLogin: "Inicie sessão primeiro",
    unknown: "Ocorreu um erro",
    uploadFailed: "Falha no envio",
    fileTooLarge: "O ficheiro é demasiado grande (máx. {max_mb}MB)",
    decodeFailed: "Falha na descodificação. Tente outro ficheiro ou formato.",
    durationTooShort: "O áudio é demasiado curto (mín. {min_seconds} segundos)",
    dailyLimitReached: "Limite diário atingido ({limit} por dia). Assine para continuar.",
    unsupportedFileType: "Tipo de ficheiro não suportado",
    wavDownloadRequiresSubscription: "O download WAV está disponível apenas para assinantes",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Tarefa não encontrada ou expirada. Envie novamente.",
    processingTimeout: "O processamento excedeu o tempo ou foi interrompido. Envie novamente.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Falha no envio",
        a: "O servidor usa políticas rigorosas de processamento de áudio e agendamento de recursos.\nTamanho máximo por ficheiro: 200 MB para não assinantes, 500 MB para assinantes.\nFicheiros acima do limite falham.\nSe o problema persistir dentro dos limites, contacte-nos para investigação.",
      },
      {
        q: "Duração mínima do áudio",
        a: "O áudio tem de ter pelo menos 15 segundos.\nClipes com menos de 15 segundos não iniciam o pipeline de processamento no backend. Envie um áudio mais longo.",
      },
      {
        q: "Assinante vs não assinante",
        a: "O processamento de áudio (separação vocal / remoção de reverb) é intensivo, por isso aplicamos políticas diferentes:\n\nNão assinantes\n- Trabalhos ilimitados por dia\n- Processamento em fila\n- Download do WAV original não disponível\n\nAssinantes\n- Trabalhos ilimitados por dia\n- Prioridade (sem fila)\n- Download do WAV original disponível\n\nSe quiser prioridade e WAV, considere assinar.",
      },
    ],
    dereverb: [
      {
        q: "Falha no envio",
        a: "O servidor usa políticas rigorosas de processamento de áudio e agendamento de recursos.\nTamanho máximo por ficheiro: 200 MB para não assinantes, 500 MB para assinantes.\nFicheiros acima do limite falham.\nSe o problema persistir dentro dos limites, contacte-nos para investigação.",
      },
      {
        q: "Duração mínima do áudio",
        a: "O áudio tem de ter pelo menos 15 segundos.\nClipes com menos de 15 segundos não iniciam o pipeline de processamento no backend. Envie um áudio mais longo.",
      },
      {
        q: "Fluxo recomendado para Dereverb",
        a: "Antes de usar Dereverb, faça primeiro a separação vocal e mantenha apenas a faixa de voz isolada.\nO módulo Dereverb é otimizado para vocais separados; aplicar diretamente numa mistura (com instrumental/ambiente) pode causar artefactos ou distorção.",
      },
      {
        q: "Assinante vs não assinante",
        a: "O processamento de áudio (separação vocal / remoção de reverb) é intensivo, por isso aplicamos políticas diferentes:\n\nNão assinantes\n- Trabalhos ilimitados por dia\n- Processamento em fila\n- Download do WAV original não disponível\n\nAssinantes\n- Trabalhos ilimitados por dia\n- Prioridade (sem fila)\n- Download do WAV original disponível\n\nSe quiser prioridade e WAV, considere assinar.",
      },
    ],
    bpm: [
      {
        q: "Falha no envio",
        a: "O servidor usa políticas rigorosas de processamento de áudio e agendamento de recursos.\nTamanho máximo por ficheiro: 200 MB para não assinantes, 500 MB para assinantes.\nFicheiros acima do limite falham.\nSe o problema persistir dentro dos limites, contacte-nos para investigação.",
      },
      {
        q: "Duração mínima do áudio",
        a: "O áudio tem de ter pelo menos 15 segundos.\nClipes com menos de 15 segundos não iniciam o pipeline de processamento no backend. Envie um áudio mais longo.",
      },
      {
        q: "Assinante vs não assinante",
        a: "O processamento de áudio (separação vocal / remoção de reverb) é intensivo, por isso aplicamos políticas diferentes:\n\nNão assinantes\n- Trabalhos ilimitados por dia\n- Processamento em fila\n- Download do WAV original não disponível\n\nAssinantes\n- Trabalhos ilimitados por dia\n- Prioridade (sem fila)\n- Download do WAV original disponível\n\nSe quiser prioridade e WAV, considere assinar.",
      },
    ],
    demucs: [
      {
        q: "Falha no envio",
        a: "O servidor usa políticas rigorosas de processamento de áudio e agendamento de recursos.\nTamanho máximo por ficheiro: 200 MB para não assinantes, 500 MB para assinantes.\nFicheiros acima do limite falham.\nSe o problema persistir dentro dos limites, contacte-nos para investigação.",
      },
      {
        q: "Duração mínima do áudio",
        a: "O áudio tem de ter pelo menos 15 segundos.\nClipes com menos de 15 segundos não iniciam o pipeline de processamento no backend. Envie um áudio mais longo.",
      },
      {
        q: "Assinante vs não assinante",
        a: "O processamento de áudio (separação vocal / remoção de reverb / separação em 4 stems) é intensivo, por isso aplicamos políticas diferentes:\n\nNão assinantes\n- Trabalhos ilimitados por dia\n- Processamento em fila\n- Download do WAV original não disponível\n\nAssinantes\n- Trabalhos ilimitados por dia\n- Prioridade (sem fila)\n- Download do WAV original disponível\n\nSe quiser prioridade e WAV, considere assinar.",
      },
    ],
  },
  billing: {
    title: "Assinatura",
    subtitle: "Atualize para limites maiores, processamento mais rápido e WAV de qualidade total.",
    nonSubscriberTitle: "Plano grátis (sem assinatura)",
    nonSubscriberBenefits: ["Processamento em fila", "Upload máx.: 200MB", "Trabalhos ilimitados por dia", "MP3 suportado"],
    subscriberTitle: "Benefícios da assinatura",
    subscriberBenefits: ["Upload máx.: 500MB", "Trabalhos ilimitados por dia", "Prioridade (sem fila)", "Download do WAV original disponível"],
    subscribe: "Assinar",
    manage: "Gerir assinatura",
    active: "Ativa",
    inactive: "Inativa",
    needLogin: "Inicie sessão para assinar",
    missingProduct: "Produto de assinatura não configurado",
  },
  nav: {
    title: "Ferramentas",
    demix: "Remoção de instrumental",
    dereverb: "Remover reverb",
    bpm: "Detetor de BPM",
    stems: "Separação em 4 stems",
    history: "Histórico",
    settings: "Definições",
    billing: "Assinatura",
    tickets: "Tickets de suporte",
    ticketManage: "Gestão de tickets",
  },
  header: {
    searchPlaceholder: "Pesquisar músicas ou tarefas...",
    language: "Idioma",
    theme: "Tema",
    login: "Iniciar sessão",
    logout: "Terminar sessão",
  },
  home: {
    title: "Processamento vocal",
    subtitle: "Separe vocais, reduza reverb e encontre BPM num só lugar.",
    prompt: "Arraste ou envie um áudio para começar",
    uploadCta: "Enviar áudio",
    dropHint: "Suporta WAV/MP3/FLAC até 10 minutos",
    tools: {
      demix: {
        title: "Remoção de instrumental",
        description: "Isole vocais ou backing tracks e exporte STEM rapidamente.",
        badge: "Demix",
      },
      dereverb: {
        title: "Remover reverb",
        description: "Reduza reverb e caudas mantendo a clareza.",
        badge: "Dereverb",
      },
      bpm: {
        title: "Detetor de BPM",
        description: "Detete o tempo automaticamente com opção de tap-to-sync.",
        badge: "BPM",
      },
    },
    presets: ["Vocal pop", "Vocal ao vivo", "Bateria hip-hop", "Podcast"],
  },
  auth: {
    login: {
      title: "Bem-vindo de volta",
      subtitle: "Inicie sessão para gerir tarefas vocais.",
      action: "Iniciar sessão",
      alt: "Não tem conta?",
      forgot: "Esqueceu-se da palavra-passe?",
    },
    register: {
      title: "Criar conta",
      subtitle: "Crie o seu laboratório vocal na cloud.",
      action: "Registar",
      alt: "Já tem conta?",
      terms: "Concordo com os termos do serviço",
      success: "Registo concluído",
      successCheckEmail: "Registo concluído. Verifique o seu email para o link de verificação (e o spam).",
    },
    reset: {
      title: "Redefinir palavra-passe",
      subtitle: "Enviaremos um link por email para redefinir.",
      action: "Enviar email de redefinição",
      alt: "Voltar ao login",
    },
    form: {
      email: "Email",
      password: "Palavra-passe",
      name: "Nome",
      confirmPassword: "Confirmar palavra-passe",
      remember: "Manter sessão",
    },
  },
  tickets: {
    title: "Tickets de suporte",
    subtitle: "Envie um problema e responderemos o mais rapidamente possível.",
    newTitle: "Novo ticket",
    category: "Categoria",
    categories: { demix: "Separação", billing: "Assinatura", other: "Outro" },
    subject: "Assunto",
    subjectPlaceholder: "Resumo curto (opcional)",
    content: "Descrição",
    contentPlaceholder: "Descreva o problema com passos e contexto.",
    submit: "Enviar",
    myTickets: "Os meus tickets",
    allTickets: "Todos os tickets",
    viewAll: "Ver todos",
    hideAll: "Apenas os meus",
    status: "Estado",
    statuses: { open: "Aberto", answered: "Respondido", closed: "Fechado" },
    statusAll: "Todos",
    empty: "Ainda não há tickets",
    you: "Você",
    admin: "Admin",
    adminOnly: "Acesso de admin necessário",
    createdAt: "Criado",
    delete: "Eliminar ticket",
    deleteConfirm: "Eliminar este ticket? Não é possível desfazer.",
    deleted: "Eliminado",
    replyPlaceholder: "Escreva uma mensagem…",
    send: "Enviar",
    close: "Fechar",
    reopen: "Reabrir",
    loadFailed: "Falha ao carregar, tente novamente",
    createFailed: "Falha ao enviar, tente novamente",
    replyFailed: "Falha ao enviar, tente novamente",
  },
  history: {
    title: "Histórico",
    empty: "Ainda não há registos. As separações concluídas aparecerão aqui.",
    cols: { task: "Tarefa", inst: "Instrumental", vocal: "Vocal", created: "Criado", action: "Ações" },
    downloadInst: "Descarregar instrumental",
    downloadVocal: "Descarregar vocal",
    delete: "Eliminar",
  },
  settings: {
    title: "Definições da conta",
    profileTitle: "Nome de apresentação",
    nameLabel: "Nome de utilizador",
    saveName: "Guardar nome",
    passwordTitle: "Alterar palavra-passe",
    currentPwd: "Palavra-passe atual",
    newPwd: "Nova palavra-passe",
    confirmPwd: "Confirmar nova palavra-passe",
    savePwd: "Atualizar palavra-passe",
    successName: "Nome atualizado",
    successPwd: "Palavra-passe atualizada, inicie sessão novamente",
    mismatch: "As palavras-passe não coincidem",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryIt: Dictionary = {
  appName: "demixr",
  tagline: "Toolkit vocale",
  brandSubtitle: "Separazione vocale con IA",
  errors: {
    needLogin: "Accedi prima",
    unknown: "Si è verificato un errore",
    uploadFailed: "Caricamento non riuscito",
    fileTooLarge: "File troppo grande (max {max_mb}MB)",
    decodeFailed: "Decodifica non riuscita. Prova un altro file o formato.",
    durationTooShort: "Audio troppo corto (min {min_seconds} secondi)",
    dailyLimitReached: "Raggiunto il limite giornaliero ({limit} al giorno). Abbonati per continuare.",
    unsupportedFileType: "Tipo di file non supportato",
    wavDownloadRequiresSubscription: "Il download WAV è disponibile solo per gli abbonati",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Attività non trovata o scaduta. Ricarica il file.",
    processingTimeout: "Elaborazione scaduta o interrotta. Ricarica il file.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Caricamento non riuscito",
        a: "Il server applica policy rigorose di elaborazione audio e gestione risorse.\nDimensione massima per file: 200 MB per non abbonati, 500 MB per abbonati.\nI file oltre il limite falliscono.\nSe il problema persiste entro i limiti, contattaci per verifiche.",
      },
      {
        q: "Durata minima audio",
        a: "L’audio deve durare almeno 15 secondi.\nClip sotto i 15 secondi non avviano la pipeline di elaborazione, quindi carica un audio più lungo.",
      },
      {
        q: "Abbonato vs non abbonato",
        a: "L’elaborazione audio (separazione voce / rimozione reverb) è onerosa, quindi applichiamo policy diverse:\n\nNon abbonati\n- Job illimitati al giorno\n- Job in coda\n- Download WAV originale non disponibile\n\nAbbonati\n- Job illimitati al giorno\n- Priorità (senza coda)\n- Download WAV originale disponibile\n\nSe vuoi priorità e WAV, considera l’abbonamento.",
      },
    ],
    dereverb: [
      {
        q: "Caricamento non riuscito",
        a: "Il server applica policy rigorose di elaborazione audio e gestione risorse.\nDimensione massima per file: 200 MB per non abbonati, 500 MB per abbonati.\nI file oltre il limite falliscono.\nSe il problema persiste entro i limiti, contattaci per verifiche.",
      },
      {
        q: "Durata minima audio",
        a: "L’audio deve durare almeno 15 secondi.\nClip sotto i 15 secondi non avviano la pipeline di elaborazione, quindi carica un audio più lungo.",
      },
      {
        q: "Workflow consigliato per Dereverb",
        a: "Prima di usare Dereverb, esegui la separazione vocale e mantieni solo la traccia voce isolata.\nIl modulo Dereverb è ottimizzato per voci già separate; applicarlo direttamente a un mix può causare artefatti o distorsioni.",
      },
      {
        q: "Abbonato vs non abbonato",
        a: "L’elaborazione audio (separazione voce / rimozione reverb) è onerosa, quindi applichiamo policy diverse:\n\nNon abbonati\n- Job illimitati al giorno\n- Job in coda\n- Download WAV originale non disponibile\n\nAbbonati\n- Job illimitati al giorno\n- Priorità (senza coda)\n- Download WAV originale disponibile\n\nSe vuoi priorità e WAV, considera l’abbonamento.",
      },
    ],
    bpm: [
      {
        q: "Caricamento non riuscito",
        a: "Il server applica policy rigorose di elaborazione audio e gestione risorse.\nDimensione massima per file: 200 MB per non abbonati, 500 MB per abbonati.\nI file oltre il limite falliscono.\nSe il problema persiste entro i limiti, contattaci per verifiche.",
      },
      {
        q: "Durata minima audio",
        a: "L’audio deve durare almeno 15 secondi.\nClip sotto i 15 secondi non avviano la pipeline di elaborazione, quindi carica un audio più lungo.",
      },
      {
        q: "Abbonato vs non abbonato",
        a: "L’elaborazione audio (separazione voce / rimozione reverb) è onerosa, quindi applichiamo policy diverse:\n\nNon abbonati\n- Job illimitati al giorno\n- Job in coda\n- Download WAV originale non disponibile\n\nAbbonati\n- Job illimitati al giorno\n- Priorità (senza coda)\n- Download WAV originale disponibile\n\nSe vuoi priorità e WAV, considera l’abbonamento.",
      },
    ],
    demucs: [
      {
        q: "Caricamento non riuscito",
        a: "Il server applica policy rigorose di elaborazione audio e gestione risorse.\nDimensione massima per file: 200 MB per non abbonati, 500 MB per abbonati.\nI file oltre il limite falliscono.\nSe il problema persiste entro i limiti, contattaci per verifiche.",
      },
      {
        q: "Durata minima audio",
        a: "L’audio deve durare almeno 15 secondi.\nClip sotto i 15 secondi non avviano la pipeline di elaborazione, quindi carica un audio più lungo.",
      },
      {
        q: "Abbonato vs non abbonato",
        a: "L’elaborazione audio (separazione voce / rimozione reverb / separazione 4 stem) è onerosa, quindi applichiamo policy diverse:\n\nNon abbonati\n- Job illimitati al giorno\n- Job in coda\n- Download WAV originale non disponibile\n\nAbbonati\n- Job illimitati al giorno\n- Priorità (senza coda)\n- Download WAV originale disponibile\n\nSe vuoi priorità e WAV, considera l’abbonamento.",
      },
    ],
  },
  billing: {
    title: "Abbonamento",
    subtitle: "Passa a un piano con limiti più alti, elaborazione più veloce e WAV in qualità originale.",
    nonSubscriberTitle: "Piano gratuito (senza abbonamento)",
    nonSubscriberBenefits: ["Elaborazione in coda", "Upload max: 200MB", "Job illimitati al giorno", "MP3 supportato"],
    subscriberTitle: "Vantaggi abbonamento",
    subscriberBenefits: ["Upload max: 500MB", "Job illimitati al giorno", "Priorità (senza coda)", "Download WAV originale disponibile"],
    subscribe: "Abbonati",
    manage: "Gestisci abbonamento",
    active: "Attivo",
    inactive: "Inattivo",
    needLogin: "Accedi per abbonarti",
    missingProduct: "Prodotto abbonamento non configurato",
  },
  nav: {
    title: "Strumenti",
    demix: "Rimozione strumentale",
    dereverb: "Rimozione reverb",
    bpm: "Trova BPM",
    stems: "Separazione 4 stem",
    history: "Cronologia",
    settings: "Impostazioni",
    billing: "Abbonamento",
    tickets: "Ticket di supporto",
    ticketManage: "Gestione ticket",
  },
  header: {
    searchPlaceholder: "Cerca brani o attività...",
    language: "Lingua",
    theme: "Tema",
    login: "Accedi",
    logout: "Esci",
  },
  home: {
    title: "Elaborazione vocale",
    subtitle: "Separa i vocali, riduci il reverb e trova il BPM in un unico posto.",
    prompt: "Trascina o carica un audio per iniziare",
    uploadCta: "Carica audio",
    dropHint: "Supporta WAV/MP3/FLAC fino a 10 minuti",
    tools: {
      demix: {
        title: "Rimozione strumentale",
        description: "Isola vocali o backing track ed esporta STEM rapidamente.",
        badge: "Demix",
      },
      dereverb: {
        title: "Rimozione reverb",
        description: "Riduci reverb e code mantenendo chiarezza.",
        badge: "Dereverb",
      },
      bpm: {
        title: "Trova BPM",
        description: "Rileva automaticamente il tempo con opzione tap-to-sync.",
        badge: "BPM",
      },
    },
    presets: ["Vocale pop", "Vocale live", "Batteria hip-hop", "Podcast"],
  },
  auth: {
    login: {
      title: "Bentornato",
      subtitle: "Accedi per gestire i job vocali.",
      action: "Accedi",
      alt: "Non hai un account?",
      forgot: "Password dimenticata?",
    },
    register: {
      title: "Crea account",
      subtitle: "Avvia il tuo laboratorio vocale nel cloud.",
      action: "Registrati",
      alt: "Sei già registrato?",
      terms: "Accetto i termini di servizio",
      success: "Registrazione riuscita",
      successCheckEmail: "Registrazione riuscita. Controlla l’email per il link di verifica (anche spam).",
    },
    reset: {
      title: "Reimposta password",
      subtitle: "Ti invieremo un link via email per reimpostarla.",
      action: "Invia email di reset",
      alt: "Torna al login",
    },
    form: {
      email: "Email",
      password: "Password",
      name: "Nome",
      confirmPassword: "Conferma password",
      remember: "Ricordami",
    },
  },
  tickets: {
    title: "Ticket di supporto",
    subtitle: "Invia un problema e ti risponderemo il prima possibile.",
    newTitle: "Nuovo ticket",
    category: "Categoria",
    categories: { demix: "Separazione", billing: "Abbonamento", other: "Altro" },
    subject: "Oggetto",
    subjectPlaceholder: "Breve riepilogo (opzionale)",
    content: "Descrizione",
    contentPlaceholder: "Descrivi il problema con passaggi e contesto.",
    submit: "Invia",
    myTickets: "I miei ticket",
    allTickets: "Tutti i ticket",
    viewAll: "Vedi tutti",
    hideAll: "Solo i miei",
    status: "Stato",
    statuses: { open: "Aperto", answered: "Risposto", closed: "Chiuso" },
    statusAll: "Tutti",
    empty: "Ancora nessun ticket",
    you: "Tu",
    admin: "Admin",
    adminOnly: "Accesso admin richiesto",
    createdAt: "Creato",
    delete: "Elimina ticket",
    deleteConfirm: "Eliminare questo ticket? Non è possibile annullare.",
    deleted: "Eliminato",
    replyPlaceholder: "Scrivi un messaggio…",
    send: "Invia",
    close: "Chiudi",
    reopen: "Riapri",
    loadFailed: "Caricamento non riuscito, riprova",
    createFailed: "Invio non riuscito, riprova",
    replyFailed: "Invio non riuscito, riprova",
  },
  history: {
    title: "Cronologia",
    empty: "Nessun record. Le separazioni completate appariranno qui.",
    cols: { task: "Attività", inst: "Strumentale", vocal: "Voce", created: "Creato", action: "Azioni" },
    downloadInst: "Scarica strumentale",
    downloadVocal: "Scarica voce",
    delete: "Elimina",
  },
  settings: {
    title: "Impostazioni account",
    profileTitle: "Nome visualizzato",
    nameLabel: "Nome utente",
    saveName: "Salva nome",
    passwordTitle: "Cambia password",
    currentPwd: "Password attuale",
    newPwd: "Nuova password",
    confirmPwd: "Conferma nuova password",
    savePwd: "Aggiorna password",
    successName: "Nome aggiornato",
    successPwd: "Password aggiornata, accedi di nuovo",
    mismatch: "Le password non corrispondono",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryAr: Dictionary = {
  appName: "demixr",
  tagline: "مجموعة أدوات للصوت",
  brandSubtitle: "فصل الصوت بالذكاء الاصطناعي",
  errors: {
    needLogin: "يرجى تسجيل الدخول أولاً",
    unknown: "حدث خطأ",
    uploadFailed: "فشل الرفع",
    fileTooLarge: "الملف كبير جداً (الحد الأقصى {max_mb}MB)",
    decodeFailed: "فشل فك الترميز. جرّب ملفاً أو صيغة أخرى.",
    durationTooShort: "المقطع قصير جداً (الحد الأدنى {min_seconds} ثانية)",
    dailyLimitReached: "تم الوصول إلى الحد اليومي ({limit} في اليوم). اشترك للمتابعة.",
    unsupportedFileType: "نوع ملف غير مدعوم",
    wavDownloadRequiresSubscription: "تنزيل WAV متاح للمشتركين فقط",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "المهمة غير موجودة أو انتهت صلاحيتها. يرجى إعادة الرفع.",
    processingTimeout: "انتهت مهلة المعالجة أو تم إيقافها. يرجى إعادة الرفع.",
  },
  faq: {
    title: "الأسئلة الشائعة",
    demix: [
      {
        q: "فشل الرفع",
        a: "يستخدم الخادم سياسات صارمة لمعالجة الصوت وجدولة الموارد.\nالحد الأقصى للرفع لكل ملف: 200 MB لغير المشتركين و 500 MB للمشتركين.\nالملفات التي تتجاوز الحد ستفشل.\nإذا استمرت المشكلة ضمن الحدود، تواصل معنا للتحقق.",
      },
      {
        q: "الحد الأدنى لمدة الصوت",
        a: "يجب ألا تقل مدة الصوت عن 15 ثانية.\nالمقاطع الأقل من 15 ثانية لن تبدأ المعالجة في الخادم، لذا ارفع ملفاً أطول.",
      },
      {
        q: "الفرق بين المشترك وغير المشترك",
        a: "معالجة الصوت (فصل الصوت/إزالة الصدى) تستهلك موارد كبيرة، لذلك نطبّق سياسات مختلفة:\n\nغير المشترك\n- مهام غير محدودة يومياً\n- المعالجة عبر قائمة انتظار\n- تنزيل WAV الأصلي غير متاح\n\nالمشترك\n- مهام غير محدودة يومياً\n- أولوية (بدون انتظار)\n- تنزيل WAV الأصلي متاح\n\nإذا كنت تريد أولوية وتنزيل WAV، ننصح بالاشتراك.",
      },
    ],
    dereverb: [
      {
        q: "فشل الرفع",
        a: "يستخدم الخادم سياسات صارمة لمعالجة الصوت وجدولة الموارد.\nالحد الأقصى للرفع لكل ملف: 200 MB لغير المشتركين و 500 MB للمشتركين.\nالملفات التي تتجاوز الحد ستفشل.\nإذا استمرت المشكلة ضمن الحدود، تواصل معنا للتحقق.",
      },
      {
        q: "الحد الأدنى لمدة الصوت",
        a: "يجب ألا تقل مدة الصوت عن 15 ثانية.\nالمقاطع الأقل من 15 ثانية لن تبدأ المعالجة في الخادم، لذا ارفع ملفاً أطول.",
      },
      {
        q: "سير عمل موصى به لـ Dereverb",
        a: "قبل استخدام Dereverb، شغّل أولاً فصل الصوت واحتفظ بمسار الصوت المعزول فقط.\nوحدة Dereverb مُحسّنة للأصوات المفصولة؛ تطبيقها مباشرة على مزيج يحتوي على آلات/ضجيج قد يسبب تشوهات أو آثاراً جانبية.",
      },
      {
        q: "الفرق بين المشترك وغير المشترك",
        a: "معالجة الصوت (فصل الصوت/إزالة الصدى) تستهلك موارد كبيرة، لذلك نطبّق سياسات مختلفة:\n\nغير المشترك\n- مهام غير محدودة يومياً\n- المعالجة عبر قائمة انتظار\n- تنزيل WAV الأصلي غير متاح\n\nالمشترك\n- مهام غير محدودة يومياً\n- أولوية (بدون انتظار)\n- تنزيل WAV الأصلي متاح\n\nإذا كنت تريد أولوية وتنزيل WAV، ننصح بالاشتراك.",
      },
    ],
    bpm: [
      {
        q: "فشل الرفع",
        a: "يستخدم الخادم سياسات صارمة لمعالجة الصوت وجدولة الموارد.\nالحد الأقصى للرفع لكل ملف: 200 MB لغير المشتركين و 500 MB للمشتركين.\nالملفات التي تتجاوز الحد ستفشل.\nإذا استمرت المشكلة ضمن الحدود، تواصل معنا للتحقق.",
      },
      {
        q: "الحد الأدنى لمدة الصوت",
        a: "يجب ألا تقل مدة الصوت عن 15 ثانية.\nالمقاطع الأقل من 15 ثانية لن تبدأ المعالجة في الخادم، لذا ارفع ملفاً أطول.",
      },
      {
        q: "الفرق بين المشترك وغير المشترك",
        a: "معالجة الصوت (فصل الصوت/إزالة الصدى) تستهلك موارد كبيرة، لذلك نطبّق سياسات مختلفة:\n\nغير المشترك\n- مهام غير محدودة يومياً\n- المعالجة عبر قائمة انتظار\n- تنزيل WAV الأصلي غير متاح\n\nالمشترك\n- مهام غير محدودة يومياً\n- أولوية (بدون انتظار)\n- تنزيل WAV الأصلي متاح\n\nإذا كنت تريد أولوية وتنزيل WAV، ننصح بالاشتراك.",
      },
    ],
    demucs: [
      {
        q: "فشل الرفع",
        a: "يستخدم الخادم سياسات صارمة لمعالجة الصوت وجدولة الموارد.\nالحد الأقصى للرفع لكل ملف: 200 MB لغير المشتركين و 500 MB للمشتركين.\nالملفات التي تتجاوز الحد ستفشل.\nإذا استمرت المشكلة ضمن الحدود، تواصل معنا للتحقق.",
      },
      {
        q: "الحد الأدنى لمدة الصوت",
        a: "يجب ألا تقل مدة الصوت عن 15 ثانية.\nالمقاطع الأقل من 15 ثانية لن تبدأ المعالجة في الخادم، لذا ارفع ملفاً أطول.",
      },
      {
        q: "الفرق بين المشترك وغير المشترك",
        a: "معالجة الصوت (فصل الصوت/إزالة الصدى/فصل 4 مسارات) تستهلك موارد كبيرة، لذلك نطبّق سياسات مختلفة:\n\nغير المشترك\n- مهام غير محدودة يومياً\n- المعالجة عبر قائمة انتظار\n- تنزيل WAV الأصلي غير متاح\n\nالمشترك\n- مهام غير محدودة يومياً\n- أولوية (بدون انتظار)\n- تنزيل WAV الأصلي متاح\n\nإذا كنت تريد أولوية وتنزيل WAV، ننصح بالاشتراك.",
      },
    ],
  },
  billing: {
    title: "الاشتراك",
    subtitle: "قم بالترقية لحدود أعلى، معالجة أسرع، وتنزيل WAV بجودة أصلية.",
    nonSubscriberTitle: "الخطة المجانية (بدون اشتراك)",
    nonSubscriberBenefits: ["المعالجة عبر قائمة انتظار", "الرفع الأقصى: 200MB", "مهام غير محدودة يومياً", "يدعم MP3"],
    subscriberTitle: "مزايا الاشتراك",
    subscriberBenefits: ["الرفع الأقصى: 500MB", "مهام غير محدودة يومياً", "أولوية (بدون انتظار)", "تنزيل WAV الأصلي متاح"],
    subscribe: "اشترك",
    manage: "إدارة الاشتراك",
    active: "نشط",
    inactive: "غير نشط",
    needLogin: "سجّل الدخول للاشتراك",
    missingProduct: "منتج الاشتراك غير مُعد",
  },
  nav: {
    title: "الأدوات",
    demix: "إزالة الموسيقى",
    dereverb: "إزالة الصدى",
    bpm: "محدد BPM",
    stems: "فصل 4 مسارات",
    history: "السجل",
    settings: "الإعدادات",
    billing: "الاشتراك",
    tickets: "تذاكر الدعم",
    ticketManage: "إدارة التذاكر",
  },
  header: {
    searchPlaceholder: "ابحث عن الأغاني أو المهام...",
    language: "اللغة",
    theme: "السمة",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
  },
  home: {
    title: "معالجة الصوت",
    subtitle: "افصل الصوت، قلّل الصدى، واعرف BPM في مكان واحد.",
    prompt: "اسحب أو ارفع ملفاً صوتياً للبدء",
    uploadCta: "رفع الصوت",
    dropHint: "يدعم WAV/MP3/FLAC حتى 10 دقائق",
    tools: {
      demix: {
        title: "إزالة الموسيقى",
        description: "اعزل الصوت أو المسار الخلفي مع تصدير STEM بسرعة.",
        badge: "Demix",
      },
      dereverb: {
        title: "إزالة الصدى",
        description: "قلّل صدى الغرفة والذيل مع الحفاظ على الوضوح.",
        badge: "Dereverb",
      },
      bpm: {
        title: "محدد BPM",
        description: "اكتشف الإيقاع تلقائياً مع خيار النقر للمزامنة.",
        badge: "BPM",
      },
    },
    presets: ["غناء بوب", "غناء مباشر", "طبول هيب هوب", "بودكاست"],
  },
  auth: {
    login: {
      title: "مرحباً بعودتك",
      subtitle: "سجّل الدخول لإدارة مهام الصوت.",
      action: "تسجيل الدخول",
      alt: "ليس لديك حساب؟",
      forgot: "نسيت كلمة المرور؟",
    },
    register: {
      title: "إنشاء حساب",
      subtitle: "ابدأ مختبر الصوت السحابي الخاص بك.",
      action: "تسجيل",
      alt: "لديك حساب بالفعل؟",
      terms: "أوافق على شروط الخدمة",
      success: "تم التسجيل بنجاح",
      successCheckEmail: "تم التسجيل بنجاح. تحقق من بريدك الإلكتروني لرابط التحقق (وأيضاً البريد غير الهام).",
    },
    reset: {
      title: "إعادة تعيين كلمة المرور",
      subtitle: "سنرسل لك رابطاً عبر البريد لإعادة التعيين.",
      action: "إرسال بريد إعادة التعيين",
      alt: "العودة لتسجيل الدخول",
    },
    form: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      name: "الاسم",
      confirmPassword: "تأكيد كلمة المرور",
      remember: "تذكرني",
    },
  },
  tickets: {
    title: "تذاكر الدعم",
    subtitle: "أرسل مشكلتك وسنرد في أقرب وقت ممكن.",
    newTitle: "تذكرة جديدة",
    category: "الفئة",
    categories: { demix: "فصل", billing: "اشتراك", other: "أخرى" },
    subject: "الموضوع",
    subjectPlaceholder: "ملخص قصير (اختياري)",
    content: "الوصف",
    contentPlaceholder: "اشرح مشكلتك مع الخطوات والسياق.",
    submit: "إرسال",
    myTickets: "تذاكري",
    allTickets: "كل التذاكر",
    viewAll: "عرض الكل",
    hideAll: "تذاكري فقط",
    status: "الحالة",
    statuses: { open: "مفتوحة", answered: "تم الرد", closed: "مغلقة" },
    statusAll: "الكل",
    empty: "لا توجد تذاكر بعد",
    you: "أنت",
    admin: "المشرف",
    adminOnly: "يلزم صلاحيات المشرف",
    createdAt: "تاريخ الإنشاء",
    delete: "حذف التذكرة",
    deleteConfirm: "حذف هذه التذكرة؟ لا يمكن التراجع.",
    deleted: "تم الحذف",
    replyPlaceholder: "اكتب رسالة…",
    send: "إرسال",
    close: "إغلاق",
    reopen: "إعادة فتح",
    loadFailed: "فشل التحميل، حاول مرة أخرى",
    createFailed: "فشل الإرسال، حاول مرة أخرى",
    replyFailed: "فشل الإرسال، حاول مرة أخرى",
  },
  history: {
    title: "السجل",
    empty: "لا توجد سجلات بعد. ستظهر النتائج المكتملة هنا.",
    cols: { task: "المهمة", inst: "المرافقة", vocal: "الصوت", created: "تم الإنشاء", action: "إجراءات" },
    downloadInst: "تنزيل المرافقة",
    downloadVocal: "تنزيل الصوت",
    delete: "حذف",
  },
  settings: {
    title: "إعدادات الحساب",
    profileTitle: "الاسم المعروض",
    nameLabel: "اسم المستخدم",
    saveName: "حفظ الاسم",
    passwordTitle: "تغيير كلمة المرور",
    currentPwd: "كلمة المرور الحالية",
    newPwd: "كلمة مرور جديدة",
    confirmPwd: "تأكيد كلمة المرور الجديدة",
    savePwd: "تحديث كلمة المرور",
    successName: "تم تحديث الاسم",
    successPwd: "تم تحديث كلمة المرور، يرجى تسجيل الدخول مرة أخرى",
    mismatch: "كلمتا المرور غير متطابقتين",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryEs: Dictionary = {
  appName: "demixr",
  tagline: "Kit vocal",
  brandSubtitle: "Separación vocal con IA",
  errors: {
    needLogin: "Inicia sesión primero",
    unknown: "Ha ocurrido un error",
    uploadFailed: "Error al subir",
    fileTooLarge: "El archivo es demasiado grande (máx. {max_mb}MB)",
    decodeFailed: "Error de decodificación. Prueba con otro archivo o formato.",
    durationTooShort: "El audio es demasiado corto (mín. {min_seconds} segundos)",
    dailyLimitReached: "Límite diario alcanzado ({limit} al día). Suscríbete para continuar.",
    unsupportedFileType: "Tipo de archivo no compatible",
    wavDownloadRequiresSubscription: "La descarga WAV está disponible solo para suscriptores",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Tarea no encontrada o caducada. Vuelve a subir el archivo.",
    processingTimeout: "El procesamiento excedió el tiempo o se interrumpió. Vuelve a subir el archivo.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Fallo al subir",
        a: "El servidor usa políticas estrictas de procesamiento de audio y asignación de recursos.\nTamaño máximo por archivo: 200 MB para no suscriptores y 500 MB para suscriptores.\nLos archivos que superen el límite fallarán.\nSi el problema persiste dentro de los límites, contáctanos para revisarlo.",
      },
      {
        q: "Duración mínima del audio",
        a: "El audio debe durar al menos 15 segundos.\nLos clips de menos de 15 segundos no inician el procesamiento en el backend. Sube un audio más largo.",
      },
      {
        q: "Suscriptor vs no suscriptor",
        a: "El procesamiento de audio (separación vocal / eliminación de reverb) consume muchos recursos, por eso aplicamos políticas distintas:\n\nNo suscriptores\n- Trabajos ilimitados por día\n- Procesamiento en cola\n- Descarga WAV original no disponible\n\nSuscriptores\n- Trabajos ilimitados por día\n- Prioridad (sin cola)\n- Descarga WAV original disponible\n\nSi quieres prioridad y WAV, considera suscribirte.",
      },
    ],
    dereverb: [
      {
        q: "Fallo al subir",
        a: "El servidor usa políticas estrictas de procesamiento de audio y asignación de recursos.\nTamaño máximo por archivo: 200 MB para no suscriptores y 500 MB para suscriptores.\nLos archivos que superen el límite fallarán.\nSi el problema persiste dentro de los límites, contáctanos para revisarlo.",
      },
      {
        q: "Duración mínima del audio",
        a: "El audio debe durar al menos 15 segundos.\nLos clips de menos de 15 segundos no inician el procesamiento en el backend. Sube un audio más largo.",
      },
      {
        q: "Flujo recomendado para Dereverb",
        a: "Antes de usar Dereverb, ejecuta primero la separación vocal y conserva solo la pista de voz aislada.\nEl módulo Dereverb está optimizado para voces separadas; aplicarlo directamente a una mezcla puede causar artefactos o distorsión.",
      },
      {
        q: "Suscriptor vs no suscriptor",
        a: "El procesamiento de audio (separación vocal / eliminación de reverb) consume muchos recursos, por eso aplicamos políticas distintas:\n\nNo suscriptores\n- Trabajos ilimitados por día\n- Procesamiento en cola\n- Descarga WAV original no disponible\n\nSuscriptores\n- Trabajos ilimitados por día\n- Prioridad (sin cola)\n- Descarga WAV original disponible\n\nSi quieres prioridad y WAV, considera suscribirte.",
      },
    ],
    bpm: [
      {
        q: "Fallo al subir",
        a: "El servidor usa políticas estrictas de procesamiento de audio y asignación de recursos.\nTamaño máximo por archivo: 200 MB para no suscriptores y 500 MB para suscriptores.\nLos archivos que superen el límite fallarán.\nSi el problema persiste dentro de los límites, contáctanos para revisarlo.",
      },
      {
        q: "Duración mínima del audio",
        a: "El audio debe durar al menos 15 segundos.\nLos clips de menos de 15 segundos no inician el procesamiento en el backend. Sube un audio más largo.",
      },
      {
        q: "Suscriptor vs no suscriptor",
        a: "El procesamiento de audio (separación vocal / eliminación de reverb) consume muchos recursos, por eso aplicamos políticas distintas:\n\nNo suscriptores\n- Trabajos ilimitados por día\n- Procesamiento en cola\n- Descarga WAV original no disponible\n\nSuscriptores\n- Trabajos ilimitados por día\n- Prioridad (sin cola)\n- Descarga WAV original disponible\n\nSi quieres prioridad y WAV, considera suscribirte.",
      },
    ],
    demucs: [
      {
        q: "Fallo al subir",
        a: "El servidor usa políticas estrictas de procesamiento de audio y asignación de recursos.\nTamaño máximo por archivo: 200 MB para no suscriptores y 500 MB para suscriptores.\nLos archivos que superen el límite fallarán.\nSi el problema persiste dentro de los límites, contáctanos para revisarlo.",
      },
      {
        q: "Duración mínima del audio",
        a: "El audio debe durar al menos 15 segundos.\nLos clips de menos de 15 segundos no inician el procesamiento en el backend. Sube un audio más largo.",
      },
      {
        q: "Suscriptor vs no suscriptor",
        a: "El procesamiento de audio (separación vocal / eliminación de reverb / separación en 4 stems) consume muchos recursos, por eso aplicamos políticas distintas:\n\nNo suscriptores\n- Trabajos ilimitados por día\n- Procesamiento en cola\n- Descarga WAV original no disponible\n\nSuscriptores\n- Trabajos ilimitados por día\n- Prioridad (sin cola)\n- Descarga WAV original disponible\n\nSi quieres prioridad y WAV, considera suscribirte.",
      },
    ],
  },
  billing: {
    title: "Suscripción",
    subtitle: "Mejora para límites más altos, procesamiento más rápido y WAV de calidad completa.",
    nonSubscriberTitle: "Plan gratis (sin suscripción)",
    nonSubscriberBenefits: ["Procesamiento en cola", "Subida máx.: 200MB", "Tareas ilimitadas al día", "MP3 compatible"],
    subscriberTitle: "Beneficios de suscripción",
    subscriberBenefits: ["Subida máx.: 500MB", "Tareas ilimitadas al día", "Prioridad (sin cola)", "Descarga WAV original disponible"],
    subscribe: "Suscribirse",
    manage: "Gestionar suscripción",
    active: "Activa",
    inactive: "Inactiva",
    needLogin: "Inicia sesión para suscribirte",
    missingProduct: "El producto de suscripción no está configurado",
  },
  nav: {
    title: "Herramientas",
    demix: "Eliminar instrumental",
    dereverb: "Quitar reverb",
    bpm: "Buscar BPM",
    stems: "Separación en 4 stems",
    history: "Historial",
    settings: "Ajustes",
    billing: "Suscripción",
    tickets: "Tickets de soporte",
    ticketManage: "Gestión de tickets",
  },
  header: {
    searchPlaceholder: "Buscar canciones o tareas...",
    language: "Idioma",
    theme: "Tema",
    login: "Iniciar sesión",
    logout: "Cerrar sesión",
  },
  home: {
    title: "Procesamiento vocal",
    subtitle: "Separa voces, reduce reverb y encuentra BPM en un solo lugar.",
    prompt: "Arrastra o sube un audio para empezar",
    uploadCta: "Subir audio",
    dropHint: "Compatible con WAV/MP3/FLAC hasta 10 minutos",
    tools: {
      demix: {
        title: "Eliminar instrumental",
        description: "Aísla la voz o el backing track y exporta STEM rápidamente.",
        badge: "Demix",
      },
      dereverb: {
        title: "Quitar reverb",
        description: "Reduce el reverb y las colas manteniendo claridad.",
        badge: "Dereverb",
      },
      bpm: {
        title: "Buscar BPM",
        description: "Detecta el tempo automáticamente con opción tap-to-sync.",
        badge: "BPM",
      },
    },
    presets: ["Voz pop", "Voz en vivo", "Batería hip-hop", "Podcast"],
  },
  auth: {
    login: {
      title: "Bienvenido de nuevo",
      subtitle: "Inicia sesión para gestionar trabajos de voz.",
      action: "Iniciar sesión",
      alt: "¿No tienes cuenta?",
      forgot: "¿Olvidaste la contraseña?",
    },
    register: {
      title: "Crear cuenta",
      subtitle: "Inicia tu laboratorio vocal en la nube.",
      action: "Registrarse",
      alt: "¿Ya estás registrado?",
      terms: "Acepto los términos del servicio",
      success: "Registro exitoso",
      successCheckEmail: "Registro exitoso. Revisa tu email para el enlace de verificación (también spam).",
    },
    reset: {
      title: "Restablecer contraseña",
      subtitle: "Te enviaremos un enlace por email para restablecerla.",
      action: "Enviar email de restablecimiento",
      alt: "Volver a iniciar sesión",
    },
    form: {
      email: "Email",
      password: "Contraseña",
      name: "Nombre",
      confirmPassword: "Confirmar contraseña",
      remember: "Recordarme",
    },
  },
  tickets: {
    title: "Tickets de soporte",
    subtitle: "Envía un problema y responderemos lo antes posible.",
    newTitle: "Nuevo ticket",
    category: "Categoría",
    categories: { demix: "Separación", billing: "Suscripción", other: "Otro" },
    subject: "Asunto",
    subjectPlaceholder: "Resumen corto (opcional)",
    content: "Descripción",
    contentPlaceholder: "Describe tu problema con pasos y contexto.",
    submit: "Enviar",
    myTickets: "Mis tickets",
    allTickets: "Todos los tickets",
    viewAll: "Ver todos",
    hideAll: "Solo los míos",
    status: "Estado",
    statuses: { open: "Abierto", answered: "Respondido", closed: "Cerrado" },
    statusAll: "Todos",
    empty: "Aún no hay tickets",
    you: "Tú",
    admin: "Admin",
    adminOnly: "Se requiere acceso de admin",
    createdAt: "Creado",
    delete: "Eliminar ticket",
    deleteConfirm: "¿Eliminar este ticket? No se puede deshacer.",
    deleted: "Eliminado",
    replyPlaceholder: "Escribe un mensaje…",
    send: "Enviar",
    close: "Cerrar",
    reopen: "Reabrir",
    loadFailed: "No se pudo cargar, inténtalo de nuevo",
    createFailed: "No se pudo enviar, inténtalo de nuevo",
    replyFailed: "No se pudo enviar, inténtalo de nuevo",
  },
  history: {
    title: "Historial",
    empty: "Aún no hay registros. Tus separaciones completadas aparecerán aquí.",
    cols: { task: "Tarea", inst: "Instrumental", vocal: "Voz", created: "Creado", action: "Acciones" },
    downloadInst: "Descargar instrumental",
    downloadVocal: "Descargar voz",
    delete: "Eliminar",
  },
  settings: {
    title: "Ajustes de la cuenta",
    profileTitle: "Nombre mostrado",
    nameLabel: "Nombre de usuario",
    saveName: "Guardar nombre",
    passwordTitle: "Cambiar contraseña",
    currentPwd: "Contraseña actual",
    newPwd: "Nueva contraseña",
    confirmPwd: "Confirmar nueva contraseña",
    savePwd: "Actualizar contraseña",
    successName: "Nombre actualizado",
    successPwd: "Contraseña actualizada, vuelve a iniciar sesión",
    mismatch: "Las contraseñas no coinciden",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaryFr: Dictionary = {
  appName: "demixr",
  tagline: "Boîte à outils vocale",
  brandSubtitle: "Séparation vocale IA",
  errors: {
    needLogin: "Veuillez vous connecter",
    unknown: "Une erreur s’est produite",
    uploadFailed: "Échec de l’import",
    fileTooLarge: "Fichier trop volumineux (max {max_mb}MB)",
    decodeFailed: "Échec du décodage. Essayez un autre fichier ou format.",
    durationTooShort: "Audio trop court (min {min_seconds} secondes)",
    dailyLimitReached: "Limite journalière atteinte ({limit} par jour). Abonnez-vous pour continuer.",
    unsupportedFileType: "Type de fichier non pris en charge",
    wavDownloadRequiresSubscription: "Le téléchargement WAV est réservé aux abonnés",
    mp3: "MP3",
    wav: "WAV",
    taskNotFoundOrExpired: "Tâche introuvable ou expirée. Veuillez réimporter.",
    processingTimeout: "Traitement expiré ou interrompu. Veuillez réimporter.",
  },
  faq: {
    title: "FAQ",
    demix: [
      {
        q: "Échec de l’import",
        a: "Le serveur applique des règles strictes de traitement audio et d’allocation des ressources.\nTaille max par fichier : 200 MB pour les non-abonnés, 500 MB pour les abonnés.\nLes fichiers au-dessus de la limite échoueront.\nSi le problème persiste dans les limites, contactez-nous pour investigation.",
      },
      {
        q: "Durée minimale de l’audio",
        a: "L’audio doit durer au moins 15 secondes.\nLes clips de moins de 15 secondes ne lancent pas le traitement backend. Importez un audio plus long.",
      },
      {
        q: "Abonné vs non abonné",
        a: "Le traitement audio (séparation vocale / suppression de reverb) est coûteux en ressources, donc nous appliquons des politiques différentes :\n\nNon abonnés\n- Jobs illimités par jour\n- Traitement en file d’attente\n- Téléchargement WAV original indisponible\n\nAbonnés\n- Jobs illimités par jour\n- Priorité (sans file)\n- Téléchargement WAV original disponible\n\nPour la priorité et le WAV, pensez à vous abonner.",
      },
    ],
    dereverb: [
      {
        q: "Échec de l’import",
        a: "Le serveur applique des règles strictes de traitement audio et d’allocation des ressources.\nTaille max par fichier : 200 MB pour les non-abonnés, 500 MB pour les abonnés.\nLes fichiers au-dessus de la limite échoueront.\nSi le problème persiste dans les limites, contactez-nous pour investigation.",
      },
      {
        q: "Durée minimale de l’audio",
        a: "L’audio doit durer au moins 15 secondes.\nLes clips de moins de 15 secondes ne lancent pas le traitement backend. Importez un audio plus long.",
      },
      {
        q: "Workflow recommandé pour Dereverb",
        a: "Avant d’utiliser Dereverb, effectuez d’abord la séparation vocale et gardez uniquement la piste vocale isolée.\nLe module Dereverb est optimisé pour des voix séparées ; l’appliquer directement à un mix peut créer des artefacts ou de la distorsion.",
      },
      {
        q: "Abonné vs non abonné",
        a: "Le traitement audio (séparation vocale / suppression de reverb) est coûteux en ressources, donc nous appliquons des politiques différentes :\n\nNon abonnés\n- Jobs illimités par jour\n- Traitement en file d’attente\n- Téléchargement WAV original indisponible\n\nAbonnés\n- Jobs illimités par jour\n- Priorité (sans file)\n- Téléchargement WAV original disponible\n\nPour la priorité et le WAV, pensez à vous abonner.",
      },
    ],
    bpm: [
      {
        q: "Échec de l’import",
        a: "Le serveur applique des règles strictes de traitement audio et d’allocation des ressources.\nTaille max par fichier : 200 MB pour les non-abonnés, 500 MB pour les abonnés.\nLes fichiers au-dessus de la limite échoueront.\nSi le problème persiste dans les limites, contactez-nous pour investigation.",
      },
      {
        q: "Durée minimale de l’audio",
        a: "L’audio doit durer au moins 15 secondes.\nLes clips de moins de 15 secondes ne lancent pas le traitement backend. Importez un audio plus long.",
      },
      {
        q: "Abonné vs non abonné",
        a: "Le traitement audio (séparation vocale / suppression de reverb) est coûteux en ressources, donc nous appliquons des politiques différentes :\n\nNon abonnés\n- Jobs illimités par jour\n- Traitement en file d’attente\n- Téléchargement WAV original indisponible\n\nAbonnés\n- Jobs illimités par jour\n- Priorité (sans file)\n- Téléchargement WAV original disponible\n\nPour la priorité et le WAV, pensez à vous abonner.",
      },
    ],
    demucs: [
      {
        q: "Échec de l’import",
        a: "Le serveur applique des règles strictes de traitement audio et d’allocation des ressources.\nTaille max par fichier : 200 MB pour les non-abonnés, 500 MB pour les abonnés.\nLes fichiers au-dessus de la limite échoueront.\nSi le problème persiste dans les limites, contactez-nous pour investigation.",
      },
      {
        q: "Durée minimale de l’audio",
        a: "L’audio doit durer au moins 15 secondes.\nLes clips de moins de 15 secondes ne lancent pas le traitement backend. Importez un audio plus long.",
      },
      {
        q: "Abonné vs non abonné",
        a: "Le traitement audio (séparation vocale / suppression de reverb / séparation 4 stems) est coûteux en ressources, donc nous appliquons des politiques différentes :\n\nNon abonnés\n- Jobs illimités par jour\n- Traitement en file d’attente\n- Téléchargement WAV original indisponible\n\nAbonnés\n- Jobs illimités par jour\n- Priorité (sans file)\n- Téléchargement WAV original disponible\n\nPour la priorité et le WAV, pensez à vous abonner.",
      },
    ],
  },
  billing: {
    title: "Abonnement",
    subtitle: "Passez à un plan supérieur pour plus de limites, un traitement plus rapide et le WAV en qualité originale.",
    nonSubscriberTitle: "Offre gratuite (sans abonnement)",
    nonSubscriberBenefits: ["Traitement en file d’attente", "Upload max : 200MB", "Jobs illimités par jour", "MP3 pris en charge"],
    subscriberTitle: "Avantages abonnés",
    subscriberBenefits: ["Upload max : 500MB", "Jobs illimités par jour", "Priorité (sans file)", "Téléchargement WAV original disponible"],
    subscribe: "S’abonner",
    manage: "Gérer l’abonnement",
    active: "Actif",
    inactive: "Inactif",
    needLogin: "Connectez-vous pour vous abonner",
    missingProduct: "Le produit d’abonnement n’est pas configuré",
  },
  nav: {
    title: "Outils",
    demix: "Suppression instrumental",
    dereverb: "Suppression reverb",
    bpm: "Détecteur BPM",
    stems: "Séparation 4 stems",
    history: "Historique",
    settings: "Paramètres",
    billing: "Abonnement",
    tickets: "Tickets support",
    ticketManage: "Gestion des tickets",
  },
  header: {
    searchPlaceholder: "Rechercher des titres ou des tâches...",
    language: "Langue",
    theme: "Thème",
    login: "Se connecter",
    logout: "Se déconnecter",
  },
  home: {
    title: "Traitement vocal",
    subtitle: "Séparez les voix, réduisez la reverb et trouvez le BPM au même endroit.",
    prompt: "Déposez ou importez un audio pour commencer",
    uploadCta: "Importer un audio",
    dropHint: "WAV/MP3/FLAC jusqu’à 10 minutes",
    tools: {
      demix: {
        title: "Suppression instrumental",
        description: "Isolez la voix ou l’accompagnement et exportez STEM rapidement.",
        badge: "Demix",
      },
      dereverb: {
        title: "Suppression reverb",
        description: "Réduisez la reverb et les queues tout en gardant la clarté.",
        badge: "Dereverb",
      },
      bpm: {
        title: "Détecteur BPM",
        description: "Détection automatique du tempo avec option tap-to-sync.",
        badge: "BPM",
      },
    },
    presets: ["Vocal pop", "Vocal live", "Batterie hip-hop", "Podcast"],
  },
  auth: {
    login: {
      title: "Content de vous revoir",
      subtitle: "Connectez-vous pour gérer vos tâches vocales.",
      action: "Se connecter",
      alt: "Pas de compte ?",
      forgot: "Mot de passe oublié ?",
    },
    register: {
      title: "Créer un compte",
      subtitle: "Lancez votre labo vocal dans le cloud.",
      action: "S’inscrire",
      alt: "Déjà inscrit ?",
      terms: "J’accepte les conditions d’utilisation",
      success: "Inscription réussie",
      successCheckEmail: "Inscription réussie. Vérifiez votre email pour le lien de vérification (et le spam).",
    },
    reset: {
      title: "Réinitialiser le mot de passe",
      subtitle: "Nous vous enverrons un lien par email pour le réinitialiser.",
      action: "Envoyer l’email de réinitialisation",
      alt: "Retour à la connexion",
    },
    form: {
      email: "Email",
      password: "Mot de passe",
      name: "Nom",
      confirmPassword: "Confirmer le mot de passe",
      remember: "Se souvenir de moi",
    },
  },
  tickets: {
    title: "Tickets support",
    subtitle: "Soumettez un problème et nous répondrons au plus vite.",
    newTitle: "Nouveau ticket",
    category: "Catégorie",
    categories: { demix: "Séparation", billing: "Abonnement", other: "Autre" },
    subject: "Sujet",
    subjectPlaceholder: "Résumé court (optionnel)",
    content: "Description",
    contentPlaceholder: "Décrivez votre problème avec les étapes et le contexte.",
    submit: "Envoyer",
    myTickets: "Mes tickets",
    allTickets: "Tous les tickets",
    viewAll: "Voir tout",
    hideAll: "Mes tickets seulement",
    status: "Statut",
    statuses: { open: "Ouvert", answered: "Répondu", closed: "Fermé" },
    statusAll: "Tous",
    empty: "Aucun ticket pour le moment",
    you: "Vous",
    admin: "Admin",
    adminOnly: "Accès admin requis",
    createdAt: "Créé",
    delete: "Supprimer le ticket",
    deleteConfirm: "Supprimer ce ticket ? Action irréversible.",
    deleted: "Supprimé",
    replyPlaceholder: "Saisissez un message…",
    send: "Envoyer",
    close: "Fermer",
    reopen: "Rouvrir",
    loadFailed: "Échec du chargement, veuillez réessayer",
    createFailed: "Échec de l’envoi, veuillez réessayer",
    replyFailed: "Échec de l’envoi, veuillez réessayer",
  },
  history: {
    title: "Historique",
    empty: "Aucun enregistrement pour le moment. Vos séparations terminées apparaîtront ici.",
    cols: { task: "Tâche", inst: "Instrumental", vocal: "Vocal", created: "Créé", action: "Actions" },
    downloadInst: "Télécharger l’instrumental",
    downloadVocal: "Télécharger le vocal",
    delete: "Supprimer",
  },
  settings: {
    title: "Paramètres du compte",
    profileTitle: "Nom affiché",
    nameLabel: "Nom d’utilisateur",
    saveName: "Enregistrer le nom",
    passwordTitle: "Changer le mot de passe",
    currentPwd: "Mot de passe actuel",
    newPwd: "Nouveau mot de passe",
    confirmPwd: "Confirmer le nouveau mot de passe",
    savePwd: "Mettre à jour le mot de passe",
    successName: "Nom mis à jour",
    successPwd: "Mot de passe mis à jour, veuillez vous reconnecter",
    mismatch: "Les mots de passe ne correspondent pas",
  },
  footer: {
    rights: "(C) 2025 demixr",
    version: "Platform v1.0.0",
  },
};

const dictionaries: Record<Locale, Dictionary> = {
  zh: dictionaryZh,
  en: dictionaryEn,
  ja: dictionaryJa,
  ko: dictionaryKo,
  ru: dictionaryRu,
  de: dictionaryDe,
  pt: dictionaryPt,
  it: dictionaryIt,
  ar: dictionaryAr,
  es: dictionaryEs,
  fr: dictionaryFr,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
