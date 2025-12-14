interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 48, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="url(#bgGradient)" />

        <g className="animate-pulse" style={{ animationDuration: "2s" }}>
          <path
            d="M18 32C18 32 20 24 22 24C24 24 24 40 26 40C28 40 28 20 30 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        <line
          x1="32"
          y1="18"
          x2="32"
          y2="46"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          opacity="0.6"
        />

        <g className="animate-pulse" style={{ animationDuration: "2.5s" }}>
          <path
            d="M34 20C36 20 36 40 38 40C40 40 40 24 42 24C44 24 46 32 46 32"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        <circle cx="14" cy="22" r="2" fill="white" opacity="0.4" />
        <circle cx="50" cy="42" r="2" fill="white" opacity="0.4" />

        <defs>
          <linearGradient id="bgGradient" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            VocalSplit
          </span>
          <span className="-mt-0.5 text-xs text-muted-foreground">AI 人声分离</span>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32, className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} />;
}

