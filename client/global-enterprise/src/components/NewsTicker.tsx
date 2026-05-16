import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { FaBullhorn } from "react-icons/fa";

interface TickerItem {
  id: number;
  title: string;
  slug: string;
  isUrgent: boolean;
}

export default function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/announcements?limit=10&published=1")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.announcements?.length) {
          setItems(data.announcements.map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            isUrgent: a.isUrgent,
          })));
        }
      })
      .catch(() => {});
  }, []);

  if (!items.length) return null;

  const repeated = [...items, ...items];

  return (
    <div
      className="w-full flex items-center overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #071B4A 0%, #0d2069 100%)",
        borderBottom: "2px solid #D4A017",
        height: "36px",
        minHeight: "36px",
      }}
    >
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 h-full z-10"
        style={{ background: "#D4A017", minWidth: "fit-content" }}
      >
        <FaBullhorn className="text-white text-xs" />
        <span className="text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap">
          Latest
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div
          ref={trackRef}
          className="flex items-center gap-0 ticker-track"
          style={{ animation: "ticker-scroll 30s linear infinite", willChange: "transform" }}
        >
          {repeated.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              href={`/updates/${item.slug}`}
              className="flex items-center gap-2 px-6 whitespace-nowrap text-xs font-medium transition-colors hover:text-yellow-300"
              style={{ color: item.isUrgent ? "#F2C14E" : "rgba(255,255,255,0.85)", textDecoration: "none" }}
            >
              {item.isUrgent && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  URGENT
                </span>
              )}
              {item.title}
              <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 4px" }}>◆</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
