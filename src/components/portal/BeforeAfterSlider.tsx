import { useRef, useState } from "react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl, beforeLabel = "Before", afterLabel = "After" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden select-none bg-muted touch-none"
      onMouseMove={(e) => dragging && updateFromClientX(e.clientX)}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
    >
      <img src={afterUrl} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={beforeUrl}
          alt={beforeLabel}
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerRef.current?.clientWidth ?? "100%", maxWidth: "none" }}
          draggable={false}
        />
      </div>
      <span className="absolute top-3 left-3 bg-background/80 backdrop-blur px-2 py-1 text-xs font-medium rounded">{beforeLabel}</span>
      <span className="absolute top-3 right-3 bg-background/80 backdrop-blur px-2 py-1 text-xs font-medium rounded">{afterLabel}</span>
      <div
        className="absolute top-0 bottom-0 w-1 bg-accent cursor-ew-resize"
        style={{ left: `calc(${pos}% - 2px)` }}
        onMouseDown={() => setDragging(true)}
        onTouchStart={() => setDragging(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
          <span className="text-xs">⇆</span>
        </div>
      </div>
    </div>
  );
}