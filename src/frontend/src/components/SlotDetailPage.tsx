import { CustomerChatWindow } from "@/components/ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quote } from "@/hooks/useQueries";
import { useQuotesForSlot, useSlotMembers } from "@/hooks/useQueries";
import {
  ArrowLeft,
  Building2,
  IndianRupee,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Tag,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

interface OpenChat {
  serviceProviderId: string;
  providerName: string;
  businessName: string;
}

interface SlotDetailPageProps {
  category: string;
  product: string;
  categoryColor: string;
  onBack: () => void;
  isSlotMember?: boolean;
  activeMonth?: { year: number; month: number; label: string };
}

function QuoteCard({
  quote,
  idx,
  onChat,
  isChatOpen,
}: {
  quote: Quote;
  idx: number;
  onChat: () => void;
  isChatOpen: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      data-ocid={`quotes.item.${idx}`}
      className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Building2 size={15} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight truncate">
                {quote.providerName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {quote.businessName}
              </p>
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="flex-shrink-0 bg-primary/10 text-primary border-primary/20 font-semibold"
        >
          <IndianRupee size={10} className="mr-0.5" />
          {quote.price}
        </Badge>
      </div>

      <div>
        <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
          <Tag size={12} className="text-primary" />
          {quote.title}
        </p>
        <p
          className={`text-sm text-muted-foreground mt-1 leading-relaxed ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {quote.description}
        </p>
        {quote.description.length > 120 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-primary mt-1 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      <Button
        data-ocid={`quotes.chat_button.${idx}`}
        onClick={onChat}
        variant={isChatOpen ? "secondary" : "default"}
        className={`w-full rounded-xl font-semibold text-sm ${
          isChatOpen ? "" : "bg-primary text-white hover:opacity-90"
        }`}
      >
        <MessageCircle size={14} className="mr-2" />
        {isChatOpen ? "Chat is open ↓" : `Chat with ${quote.providerName}`}
      </Button>
    </motion.div>
  );
}

// Generate array of month labels from current month, going N months ahead
function generateMonthTabs(count = 6) {
  const now = new Date();
  const tabs: { label: string; year: number; month: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    tabs.push({
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(), // 0-indexed
    });
  }
  return tabs;
}

// Map a requirements string + timestamp to a year/month bucket
function getMemberMonth(
  requirements: string,
  timestamp: bigint,
): { year: number; month: number } {
  const now = new Date();
  const req = requirements || "";

  // Parse [Month: YYYY-MM] tag first (most reliable, set at registration time)
  const monthMatch = req.match(/\[Month:\s*(\d{4})-(\d{2})\]/);
  if (monthMatch) {
    return {
      year: Number.parseInt(monthMatch[1]),
      month: Number.parseInt(monthMatch[2]) - 1,
    };
  }

  // Parse [Expected by: DD MMM YYYY]
  const dateMatch = req.match(/\[Expected by:\s*(\d{2})\s+(\w+)\s+(\d{4})\]/);
  if (dateMatch) {
    const d = new Date(`${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`);
    if (!Number.isNaN(d.getTime()))
      return { year: d.getFullYear(), month: d.getMonth() };
  }

  // Parse [Timeline: ...] flexible options
  const tlMatch = req.match(/\[Timeline:\s*([^\]]+)\]/);
  if (tlMatch) {
    const tl = tlMatch[1].trim().toLowerCase();
    if (tl.includes("week") || tl.includes("this month"))
      return { year: now.getFullYear(), month: now.getMonth() };
    if (tl.includes("next month") || tl === "within 1 month") {
      const d = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    if (
      tl.includes("3 month") ||
      tl.includes("2-3 month") ||
      tl.includes("2 month")
    ) {
      const d = new Date(now.getFullYear(), now.getMonth() + 3, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    if (tl.includes("6 month")) {
      const d = new Date(now.getFullYear(), now.getMonth() + 6, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    if (tl.includes("year")) {
      const d = new Date(now.getFullYear(), now.getMonth() + 12, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
  }

  // Fall back to timestamp month
  const regDate = new Date(Number(timestamp) / 1_000_000);
  return { year: regDate.getFullYear(), month: regDate.getMonth() };
}

export function SlotDetailPage({
  category,
  product,
  categoryColor,
  onBack,
  isSlotMember = false,
  activeMonth,
}: SlotDetailPageProps) {
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const { data: members = [], isLoading: membersLoading } = useSlotMembers(
    category,
    product,
  );
  const { data: quotes = [], isLoading: quotesLoading } = useQuotesForSlot(
    category,
    product,
  );

  // Month tabs
  const monthTabs = useMemo(() => generateMonthTabs(6), []);
  const [activeMonthIdx, setActiveMonthIdx] = useState(() => {
    if (!activeMonth) return 0;
    const tabs = generateMonthTabs(6);
    const idx = tabs.findIndex(
      (t) => t.year === activeMonth.year && t.month === activeMonth.month,
    );
    return idx >= 0 ? idx : 0;
  });

  // Count members per month tab
  const memberCountsByMonth = useMemo(() => {
    return monthTabs.map(
      (tab) =>
        members.filter((m) => {
          const { year, month } = getMemberMonth(m.requirements, m.timestamp);
          return year === tab.year && month === tab.month;
        }).length,
    );
  }, [members, monthTabs]);

  // Filtered members for active month
  const filteredMembers = useMemo(() => {
    const tab = monthTabs[activeMonthIdx];
    return members.filter((m) => {
      const { year, month } = getMemberMonth(m.requirements, m.timestamp);
      return year === tab.year && month === tab.month;
    });
  }, [members, monthTabs, activeMonthIdx]);

  const callUrl = `https://meet.jit.si/letzclub-${category
    .toLowerCase()
    .replace(/\s+/g, "-")}-${product.toLowerCase().replace(/\s+/g, "-")}`;

  const toggleChat = (quote: Quote) => {
    setOpenChats((prev) => {
      const exists = prev.find(
        (c) => c.serviceProviderId === quote.serviceProviderId,
      );
      if (exists) {
        return prev.filter(
          (c) => c.serviceProviderId !== quote.serviceProviderId,
        );
      }
      return [
        ...prev,
        {
          serviceProviderId: quote.serviceProviderId,
          providerName: quote.providerName,
          businessName: quote.businessName,
        },
      ];
    });
  };

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            data-ocid="slot_detail.back_button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-xl border border-border"
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                {product}
              </h1>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: `${categoryColor}20`,
                  color: categoryColor,
                }}
              >
                {category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              👥 {members.length} customers · 📋 {quotes.length} service
              providers
            </p>
          </div>

          {/* Messages button with badge */}
          <div className="relative flex-shrink-0">
            <Button
              data-ocid="slot_detail.open_modal_button"
              variant="outline"
              size="icon"
              onClick={() => {
                // Open the first available quote chat, or show a tip if no quotes
                if (quotes.length > 0) {
                  toggleChat(quotes[0]);
                }
              }}
              className="rounded-xl border border-border w-9 h-9"
              title="Messages"
            >
              <MessageCircle size={16} />
            </Button>
            {openChats.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1 pointer-events-none">
                {openChats.length}
              </span>
            )}
          </div>

          <Button
            data-ocid="slot_detail.join_call_button"
            onClick={() => window.open(callUrl, "_blank")}
            className="flex-shrink-0 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm gap-2"
          >
            <Video size={15} />
            <span className="hidden sm:inline">Join Call</span>
          </Button>
        </div>

        {/* Month Timeline Tabs */}
        <div className="mb-6">
          <div
            data-ocid="slot_detail.timeline_tabs"
            className="flex gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {monthTabs.map((tab, idx) => (
              <button
                key={tab.label}
                type="button"
                data-ocid={`slot_detail.timeline.tab.${idx + 1}`}
                onClick={() => setActiveMonthIdx(idx)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  idx === activeMonthIdx
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab.label}
                {memberCountsByMonth[idx] > 0 && (
                  <span
                    className={`ml-1.5 text-xs font-bold ${
                      idx === activeMonthIdx
                        ? "opacity-80"
                        : "text-muted-foreground"
                    }`}
                  >
                    ({memberCountsByMonth[idx]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Users size={16} className="text-primary" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                👥 Customers
              </h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                {filteredMembers.length} in {monthTabs[activeMonthIdx].label}
              </span>
            </div>

            {/* Privacy banner for non-members */}
            {!isSlotMember && members.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-2.5 flex items-center gap-2"
              >
                <Lock size={13} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Join this slot to see contact details of members
                </p>
              </motion.div>
            )}

            {membersLoading ? (
              <div data-ocid="slot_detail.loading_state" className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div
                data-ocid="slot_detail.empty_state"
                className="rounded-2xl border border-dashed border-border p-10 text-center"
              >
                <Users
                  size={28}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="font-semibold text-foreground text-sm">
                  No members in {monthTabs[activeMonthIdx].label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Be the first to join for this month!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member, idx) => (
                  <motion.div
                    key={String(member.id)}
                    data-ocid={`slot_detail.members.item.${idx + 1}`}
                    className="rounded-xl border border-border bg-card p-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {member.name}
                        </p>
                        {isSlotMember ? (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Phone size={10} />
                            {member.phone}
                            <span className="mx-0.5">·</span>
                            <MapPin size={10} />
                            {member.location}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Lock size={10} className="text-amber-500" />
                            <span className="tracking-widest">•••• ••••••</span>
                            <span className="mx-0.5">·</span>
                            <span className="italic">Hidden</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {member.requirements && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {member.requirements}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Quotes Board */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent/30 flex items-center justify-center">
                <Tag size={16} className="text-accent-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                📋 Service Providers
              </h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
                {quotes.length} offers
              </span>
            </div>

            {quotesLoading ? (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : quotes.length === 0 ? (
              <div
                data-ocid="quotes.empty_state"
                className="rounded-2xl border border-dashed border-border p-10 text-center"
              >
                <Tag size={28} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground text-sm">
                  No offers yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Service providers haven&apos;t submitted offers yet.
                  <br />
                  Check back soon!
                </p>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  You can still use the{" "}
                  <span className="font-semibold not-italic text-green-600">
                    Join Call
                  </span>{" "}
                  button above to connect with the group.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote, idx) => (
                  <QuoteCard
                    key={String(quote.id)}
                    quote={quote}
                    idx={idx + 1}
                    onChat={() => toggleChat(quote)}
                    isChatOpen={openChats.some(
                      (c) => c.serviceProviderId === quote.serviceProviderId,
                    )}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Floating chat windows */}
      <AnimatePresence>
        {openChats.map((chat, idx) => (
          <CustomerChatWindow
            key={chat.serviceProviderId}
            category={category}
            product={product}
            serviceProviderId={chat.serviceProviderId}
            providerName={chat.providerName}
            businessName={chat.businessName}
            onClose={() =>
              setOpenChats((prev) =>
                prev.filter(
                  (c) => c.serviceProviderId !== chat.serviceProviderId,
                ),
              )
            }
            index={idx}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
