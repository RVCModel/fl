"use client";

import { cn } from "@/lib/utils";

type FaqItem = {
  q: string;
  a: string;
};

export function Faq({
  title,
  items,
  className,
}: {
  title: string;
  items: FaqItem[];
  className?: string;
}) {
  if (!items?.length) return null;

  const renderAnswer = (answer: string) => {
    const blocks = answer.split(/\n\s*\n/).filter(Boolean);
    return (
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-200/90 md:text-base">
        {blocks.map((block, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {block}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "w-full border-t border-white/10 px-4 py-10 text-left md:px-8 lg:px-10",
        className,
      )}
    >
      <h2 className="mb-6 text-xl font-semibold text-white">{title}</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <details
            key={item.q}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_20px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur"
          >
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-400/80 to-sky-300/60" />
            <summary className="cursor-pointer list-none px-6 py-5 outline-none transition hover:bg-white/5">
              <div className="flex items-center justify-between gap-4 pl-2">
                <h3 className="text-base font-semibold text-white md:text-lg">
                  {item.q}
                </h3>
                <span className="text-slate-400 transition group-open:rotate-180">
                  ⌄
                </span>
              </div>
            </summary>
            <div className="px-6 pb-6 pl-8 pt-0">
              {renderAnswer(item.a)}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
