import { useRef, useState } from 'react';
import { BoltIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface Tilt {
  x: number;
  y: number;
}

/**
 * Decorative isometric pitch built with CSS 3D transforms. The board tilts
 * subtly toward the pointer to give the hero a tactile sense of depth.
 */
export default function PitchScene() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<Tilt>({ x: 0, y: 0 });

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const ratioX = (event.clientX - rect.left) / rect.width - 0.5;
    const ratioY = (event.clientY - rect.top) / rect.height - 0.5;

    setTilt({ x: -ratioY * 9, y: ratioX * 12 });
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      className="pitch-stage mx-auto w-full max-w-[560px] select-none"
      aria-hidden="true"
    >
      <div className="pitch-halo" />
      <div className="pitch-orbit" />

      <div className="pitch-perspective">
        <div
          className="pitch-world"
          style={{ transform: `rotateX(${54 + tilt.x}deg) rotateZ(${-36 + tilt.y}deg)` }}
        >
          <div className="pitch-board">
            <div className="pitch-grass">
              {/* Field markings */}
              <div className="pitch-line inset-[7%] rounded-[4px]" />
              <div className="pitch-line top-[7%] bottom-[7%] left-1/2 w-px border-0 bg-white/25" />
              <div className="absolute left-1/2 top-1/2 h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
              <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-1000" />

              <div className="pitch-line left-[7%] top-[29%] h-[42%] w-[14%] rounded-r-[3px]" />
              <div className="pitch-line left-[7%] top-[40%] h-[20%] w-[6%] rounded-r-[3px]" />
              <div className="pitch-line right-[7%] top-[29%] h-[42%] w-[14%] rounded-l-[3px]" />
              <div className="pitch-line right-[7%] top-[40%] h-[20%] w-[6%] rounded-l-[3px]" />

              {/* Availability overlays */}
              <div className="pitch-slot left-[64%] top-[18%] h-[11%] w-[20%]" />
              <div
                className="pitch-slot left-[23%] top-[55%] h-[11%] w-[20%]"
                style={{ animationDelay: '1.2s' }}
              />
              <div className="pitch-slot pitch-slot-busy left-[62%] top-[66%] h-[9%] w-[17%]" />
              <div
                className="pitch-slot left-[24%] top-[20%] h-[9%] w-[15%]"
                style={{ animationDelay: '2.4s' }}
              />

              {/* Scan line */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-emerald-300/20 to-transparent [animation:scan-line_7s_ease-in-out_infinite]" />
            </div>

            {/* Perspective edge */}
            <div className="pointer-events-none absolute inset-x-3 bottom-0 h-5 rounded-b-[22px] bg-gradient-to-b from-emerald-950/0 to-emerald-950/70" />
          </div>
        </div>
      </div>

      {/* Floating UI cards */}
      <div className="pitch-float animate-float left-0 top-14 w-[200px] sm:w-[210px] p-3.5 sm:left-2 sm:top-20">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-zinc-500">Pembayaran terverifikasi</p>
            <p className="truncate text-[13px] font-semibold text-zinc-900">Rp 180.000 · BCA</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-2.5">
          <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-400 whitespace-nowrap">
            Booking #ARP-2481
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Lunas
          </span>
        </div>
      </div>

      <div className="pitch-float animate-float-soft bottom-8 right-0 w-[190px] sm:w-[196px] p-3.5 sm:bottom-12 sm:right-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            Live slot
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75 [animation:pulse-ring_2s_ease-out_infinite]" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </span>
            REAL-TIME
          </span>
        </div>
        <p className="mt-2.5 text-[13px] font-semibold text-zinc-900 sm:text-sm">Lapangan 2 · Mini Soccer</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] text-zinc-500">
            19:00–20:00
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            Tersedia
          </span>
        </div>
      </div>

      <div className="pitch-float animate-float absolute -right-1 top-8 hidden items-center gap-2 px-3 py-2 sm:flex [animation-delay:1.8s]">
        <ShieldCheckIcon className="h-4 w-4 text-emerald-700" />
        <span className="text-[11px] font-semibold text-zinc-700">Anti double-booking</span>
      </div>

      <div className="pitch-float animate-float-soft absolute bottom-24 left-2 hidden items-center gap-2 px-3 py-2 sm:flex [animation-delay:0.9s]">
        <BoltIcon className="h-4 w-4 text-amber-700" />
        <span className="text-[11px] font-semibold text-zinc-700">Konfirmasi instan</span>
      </div>

      {/* 3D floor shadow */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-10 w-[62%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
    </div>
  );
}
