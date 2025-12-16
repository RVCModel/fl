interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 48, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 图标主体 */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 shadow-sm" // 添加了轻微阴影增加质感
        aria-hidden="true"
      >
        <defs>
          {/* 优化后的背景渐变：从靛蓝到紫罗兰，更具科技感 */}
          <linearGradient id="logoBgGradient" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
            <stop offset="100%" stopColor="#7C3AED" /> {/* Violet-600 */}
          </linearGradient>
          {/* 增加一个内部辉光滤镜 (可选，为了简洁这里未应用，但保留定义) */}
        </defs>

        {/* 背景容器：圆角矩形 (Squircle)，比圆形更现代 */}
        <rect width="64" height="64" rx="14" fill="url(#logoBgGradient)" />

        {/* 核心图形：分离的声波 */}
        <g transform="translate(0, 1)"> {/* 微调垂直居中 */}
          {/* 波纹 1：主声波 (Vocal) - 实心高亮 */}
          <path
            d="M12 32C12 32 20 16 32 32C44 48 52 32 52 32"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 波纹 2：伴奏声波 (Instrumental) - 半透明，与主声波交错 */}
          <path
            d="M12 32C12 32 20 48 32 32C44 16 52 32 52 32"
            stroke="white"
            strokeWidth="3.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* 装饰点：表示采样点或AI节点 */}
        <circle cx="32" cy="32" r="2" fill="white" />
      </svg>

      {/* 文字部分 */}
      {showText && (
        <div className="flex flex-col select-none">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            VocalSplit
          </span>
          <span className="-mt-0.5 text-xs font-medium text-gray-500">
            AI 人声分离
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32, className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} />;
}
