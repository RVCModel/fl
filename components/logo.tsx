import React, { useEffect, useState } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 48, className = "", showText = true }: LogoProps) {
  // 仅在客户端加载后激活随机动画，避免服务端渲染不一致 (Hydration Error)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 定义声波条的数据：[高度比例, x轴偏移]
  const bars = [
    { h: 0.3, x: 6 },
    { h: 0.5, x: 16 },
    { h: 0.8, x: 26 }, // 主峰
    { h: 1.0, x: 36 }, // 最高峰
    { h: 0.7, x: 46 },
    { h: 0.4, x: 56 },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 
          嵌入 CSS 动画定义 
          1. drop-bounce: 柱子本身的下落回弹入场
          2. particle-fall: 细小粒子的持续下落循环
       */}
      <style jsx>{`
        @keyframes drop-bounce {
          0% { transform: translateY(-60px); opacity: 0; }
          40% { opacity: 1; }
          60% { transform: translateY(0); }
          80% { transform: translateY(-4px); }
          100% { transform: translateY(0); }
        }
        @keyframes particle-fall {
          0% { transform: translateY(-10px); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0; }
          100% { transform: translateY(40px); opacity: 0; }
        }
        .animate-bar-drop {
          animation: drop-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        .animate-particle {
          animation: particle-fall 3s infinite linear;
        }
      `}</style>

      {/* 图标主体 */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <g transform="translate(0, 4)">
          {bars.map((bar, index) => {
            // 生成随机的延迟，让粒子看起来更自然
            const particleDelay = mounted ? `${Math.random() * 2}s` : "0s";
            const particleDuration = mounted ? `${2 + Math.random()}s` : "3s";

            return (
              <React.Fragment key={index}>
                {/* 
                   GROUP: 包含柱子本体 
                   style: 动态计算延迟，形成从左到右依次下落的阶梯感 (Staggered Effect)
                */}
                <g 
                  className="animate-bar-drop" 
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* 上半部分：人声 (Vocal) */}
                  <rect
                    x={bar.x}
                    y={28 - 24 * bar.h}
                    width="6"
                    height={24 * bar.h}
                    rx="3"
                    fill="white"
                  />
                  
                  {/* 下半部分：伴奏 (Instrumental) */}
                  <rect
                    x={bar.x}
                    y={32} 
                    width="6"
                    height={16 * bar.h}
                    rx="3"
                    fill="white"
                    fillOpacity="0.35" 
                  />
                </g>

                {/* 
                   PARTICLES: 悬浮下落的微粒
                   位于柱子上方，模拟数据像雨滴一样落下填充柱子
                */}
                {mounted && (
                  <rect
                    x={bar.x + 2} // 居中于柱子 (柱宽6，粒子宽2，偏移2)
                    y={10}        // 起始高度
                    width="2"
                    height="2"
                    rx="1"
                    fill="white"
                    className="animate-particle"
                    style={{ 
                      animationDelay: particleDelay,
                      animationDuration: particleDuration,
                      opacity: 0 // 初始隐藏，由动画控制显示
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </g>
      </svg>

      {/* 文字部分 */}
      {showText && (
        <span className="font-sans text-xl font-bold tracking-tight text-white animate-bar-drop" style={{ animationDelay: '0.6s' }}>
          Demixr
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ size = 32, className = "" }: Omit<LogoProps, "showText">) {
  return <Logo size={size} className={className} showText={false} />;
}
