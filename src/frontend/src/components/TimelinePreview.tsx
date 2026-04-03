import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const DUMMY_SLOTS = [
  {
    label: "Urgent",
    emoji: "🔴",
    sublabel: "Within 1 month",
    tagline: "Ready to buy soon",
    members: 14,
    color: "oklch(0.55 0.22 28)",
    bg: "oklch(0.55 0.22 28 / 0.12)",
    border: "oklch(0.55 0.22 28 / 0.35)",
  },
  {
    label: "Soon",
    emoji: "🟡",
    sublabel: "1 to 3 months",
    tagline: "Buying in a few months",
    members: 8,
    color: "oklch(0.72 0.19 80)",
    bg: "oklch(0.72 0.19 80 / 0.12)",
    border: "oklch(0.72 0.19 80 / 0.35)",
  },
  {
    label: "Planning",
    emoji: "🟢",
    sublabel: "3 months+",
    tagline: "Just exploring options",
    members: 25,
    color: "oklch(0.62 0.18 145)",
    bg: "oklch(0.62 0.18 145 / 0.12)",
    border: "oklch(0.62 0.18 145 / 0.35)",
  },
];

function SlotCard({
  slot,
  style,
}: {
  slot: (typeof DUMMY_SLOTS)[0];
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 min-w-[220px] flex-shrink-0"
      style={{
        background: slot.bg,
        borderColor: slot.border,
        ...style,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{slot.emoji}</span>
        <div>
          <p className="font-display text-lg font-bold text-foreground leading-tight">
            {slot.label}
          </p>
          <p className="text-xs font-medium" style={{ color: slot.color }}>
            {slot.sublabel}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{slot.tagline}</p>
      <div className="flex items-center gap-1.5">
        <Users size={13} className="text-muted-foreground" />
        <span className="text-sm font-bold text-foreground">
          {slot.members}
        </span>
        <span className="text-xs text-muted-foreground">members</span>
      </div>
      <button
        type="button"
        className="w-full py-2 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
        style={{ background: slot.color }}
      >
        View Slot
      </button>
    </div>
  );
}

// ===== OPTION A: CAROUSEL =====
function OptionA() {
  const [current, setCurrent] = useState(0);
  const slot = DUMMY_SLOTS[current];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors bg-card"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 mx-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <SlotCard slot={slot} style={{ minWidth: "unset" }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() =>
            setCurrent((c) => Math.min(DUMMY_SLOTS.length - 1, c + 1))
          }
          disabled={current === DUMMY_SLOTS.length - 1}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors bg-card"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {DUMMY_SLOTS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setCurrent(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i === current ? DUMMY_SLOTS[i].color : "oklch(0.35 0.02 258)",
              width: i === current ? "20px" : "8px",
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Swipe or use arrows to switch between Urgent / Soon / Planning
      </p>
    </div>
  );
}

// ===== OPTION B: SCROLLABLE ROW =====
function OptionB() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-3">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {DUMMY_SLOTS.map((slot) => (
          <div
            key={slot.label}
            style={{ scrollSnapAlign: "start", minWidth: "220px" }}
          >
            <SlotCard slot={slot} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Scroll sideways → all 3 visible at once. On mobile, 2nd card peeks from
        the right
      </p>
    </div>
  );
}

// ===== OPTION C: TABS =====
function OptionC() {
  const [active, setActive] = useState(0);
  const slot = DUMMY_SLOTS[active];

  return (
    <div className="space-y-3">
      {/* Tab strip */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        {DUMMY_SLOTS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setActive(i)}
            className="flex-1 py-2.5 text-xs font-bold transition-all"
            style={{
              background: i === active ? s.color : "transparent",
              color: i === active ? "white" : "oklch(0.6 0.05 258)",
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{
              background: slot.bg,
              borderColor: slot.border,
            }}
          >
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: slot.color }}
              >
                {slot.sublabel}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {slot.tagline}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-muted-foreground" />
              <span className="text-base font-bold text-foreground">
                {slot.members}
              </span>
              <span className="text-xs text-muted-foreground">
                members ready
              </span>
            </div>
            <button
              type="button"
              className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: slot.color }}
            >
              View Slot
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="text-xs text-muted-foreground text-center">
        Tap tabs to switch. Compact — saves vertical space
      </p>
    </div>
  );
}

// ===== MAIN PREVIEW PAGE =====
export function TimelinePreviewPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
          >
            <ChevronLeft size={14} /> Back to app
          </button>
          <h1 className="font-display text-3xl font-extrabold text-foreground">
            Timeline Slot Options
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare how Urgent / Soon / Planning slots can be displayed. Pick
            the one you like best.
          </p>
        </div>

        {/* Context label */}
        <div className="rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
          Example:{" "}
          <strong className="text-foreground">
            Air Conditioner — Hyderabad
          </strong>
        </div>

        {/* Option A */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-black text-sm">
              A
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Option A — Carousel
              </h2>
              <p className="text-xs text-muted-foreground">
                One card at a time, arrow buttons to navigate
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <OptionA />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Option B */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-black text-sm">
              B
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Option B — Scrollable Row
              </h2>
              <p className="text-xs text-muted-foreground">
                All 3 visible side by side, scroll sideways on mobile
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <OptionB />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Option C */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-black text-sm">
              C
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Option C — Tabs
              </h2>
              <p className="text-xs text-muted-foreground">
                Tab strip at top, click to switch between slots
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <OptionC />
          </div>
        </section>

        {/* Pick note */}
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 text-sm text-foreground">
          <p className="font-bold mb-1">Which one feels right?</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Tell me A, B, or C and I'll build the actual slots that way. This
            preview uses dummy data — no real slots are affected.
          </p>
        </div>
      </div>
    </div>
  );
}
