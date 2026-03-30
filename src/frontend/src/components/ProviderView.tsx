import { ProviderChatWindow } from "@/components/ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type {
  Quote,
  Registration,
  ServiceProviderProfile,
} from "@/hooks/useQueries";
import {
  useHasSpPaidForSlot,
  useProductCounts,
  useProductsForCategory,
  useQuotesForSlot,
  useRecordSpSlotPayment,
  useSlotMembers,
  useSubmitQuote,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Lock,
  MessageCircle,
  Tag,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "Electronics & Appliances", color: "oklch(0.6 0.2 230)" },
  { id: "Vehicles", color: "oklch(0.72 0.19 55)" },
  { id: "Interior Designing", color: "oklch(0.65 0.18 310)" },
  { id: "Furniture", color: "oklch(0.62 0.15 145)" },
  { id: "Real Estate", color: "oklch(0.62 0.22 28)" },
  { id: "Gym", color: "oklch(0.62 0.22 18)" },
  { id: "Courses", color: "oklch(0.65 0.18 160)" },
  { id: "Medical", color: "oklch(0.60 0.20 10)" },
  { id: "Beauty", color: "oklch(0.68 0.18 350)" },
  { id: "Construction Materials", color: "oklch(0.68 0.17 70)" },
  { id: "Business Services", color: "oklch(0.60 0.15 250)" },
  { id: "Decor", color: "oklch(0.65 0.15 290)" },
];

const FALLBACK_PRODUCTS: Record<string, string[]> = {
  "Electronics & Appliances": [
    "Mobile",
    "Laptop",
    "TV",
    "Speakers",
    "Camera",
    "Headphones",
    "Smartwatch",
    "Gaming Console",
    "Refrigerator",
    "Washing Machine",
    "AC",
    "Microwave",
    "Geyser",
    "Dishwasher",
    "Water Purifier",
    "Chimney",
    "Air Purifier",
    "Oven",
  ],
  Vehicles: [
    "Car - Maruti Suzuki",
    "Car - Hyundai",
    "Car - Tata",
    "Car - Honda",
    "Car - Toyota",
    "Car - Mahindra",
    "Car - Kia",
    "Car - Skoda",
    "Car - MG",
    "Car - Volkswagen",
    "Bike - Royal Enfield",
    "Bike - Bajaj",
    "Bike - Hero",
    "Bike - TVS",
    "Bike - Honda",
    "Bike - Yamaha",
    "Bike - KTM",
    "Truck - Tata",
    "Truck - Ashok Leyland",
    "Truck - Mahindra",
    "Truck - Eicher",
    "Bus - Volvo",
    "Bus - Tata",
    "Bus - Ashok Leyland",
    "Heavy Equipment - JCB",
    "Heavy Equipment - CAT",
    "Heavy Equipment - Komatsu",
    "Heavy Equipment - Escorts",
    "Three Wheeler - Bajaj",
    "Three Wheeler - Piaggio",
    "Three Wheeler - TVS",
  ],
  "Interior Designing": [
    "Living Room",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Office",
    "Kids Room",
    "Balcony",
    "Dining Room",
  ],
  Furniture: [
    "Sofa",
    "Bed",
    "Wardrobe",
    "Dining Table",
    "Office Chair",
    "Bookshelf",
    "TV Unit",
    "Shoe Rack",
  ],
  "Real Estate": [
    "Apartment",
    "Villa",
    "Plot",
    "Commercial Space",
    "Studio",
    "Penthouse",
    "Farmhouse",
    "Warehouse",
  ],
  Gym: [
    "Treadmill",
    "Dumbbells",
    "Bench Press",
    "Elliptical",
    "Rowing Machine",
    "Pull-up Bar",
    "Resistance Bands",
    "Yoga Mat",
    "Exercise Bike",
    "Kettlebells",
  ],
  Courses: [
    "Programming",
    "Design",
    "Digital Marketing",
    "Finance",
    "Language",
    "Photography",
    "Music",
    "Cooking",
    "Fitness",
    "Business",
  ],
  Medical: [
    "General Physician",
    "Dentist",
    "Physiotherapy",
    "Eye Care",
    "Skin Care",
    "Diagnostics",
    "Nursing Care",
    "Mental Health",
    "Nutrition",
    "Paediatrics",
  ],
  Beauty: [
    "Hair Care",
    "Skin Care",
    "Makeup",
    "Nail Care",
    "Spa",
    "Waxing",
    "Bridal Package",
    "Massage",
    "Facial",
    "Eyebrow Threading",
  ],
  "Construction Materials": [
    "Cement",
    "Steel",
    "Bricks",
    "Sand",
    "Tiles",
    "Paint",
    "Glass",
    "Plywood",
    "Pipes",
    "Electrical Fittings",
  ],
  "Business Services": [
    "Accounting",
    "Legal",
    "HR",
    "IT Support",
    "Marketing",
    "Logistics",
    "Printing",
    "Security",
    "Cleaning",
    "Consulting",
  ],
  Decor: [
    "Curtains",
    "Rugs",
    "Lighting",
    "Wall Art",
    "Planters",
    "Cushions",
    "Mirrors",
    "Clocks",
    "Photo Frames",
    "Vases",
  ],
};

const MAX_SLOTS = 20;

interface SelectedSlot {
  category: string;
  product: string;
}

interface OpenMemberChat {
  memberId: string;
  memberName: string;
}

// ===== SLOT PAYMENT GATE =====
function SlotPaymentGate({
  category,
  product,
  onUnlocked,
}: {
  category: string;
  product: string;
  onUnlocked: () => void;
}) {
  const [paying, setPaying] = useState(false);
  const recordPayment = useRecordSpSlotPayment();

  const handlePay = async () => {
    setPaying(true);
    try {
      // Payments temporarily disabled for testing
      await recordPayment.mutateAsync({ category, product });
      toast.success("Slot unlocked! You can now submit your offer and chat.");
      onUnlocked();
    } catch {
      toast.error("Slot activation failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Lock size={28} className="text-primary" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-1">
        Unlock this Slot
      </h3>
      <p className="text-sm text-muted-foreground mb-2">
        Pay once to submit your offer and chat with all customers in this slot
      </p>
      <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 mb-6">
        <IndianRupee size={16} className="text-primary" />
        <span className="font-bold text-primary text-xl">1,000</span>
        <span className="text-xs text-muted-foreground">/ slot</span>
      </div>
      <div className="space-y-2 text-left mb-6">
        {[
          "View all customer requirements",
          "Submit your quote / offer",
          "Private chat with each customer",
          "One-time payment per slot",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>
      <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-400 font-medium text-center">
        Payments temporarily disabled for testing. Unlock is free.
      </div>
      <Button
        data-ocid="provider_slot.pay_unlock_button"
        onClick={handlePay}
        disabled={paying}
        className="w-full bg-primary text-white font-bold rounded-xl h-12 text-base"
      >
        {paying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Unlocking...
          </>
        ) : (
          <>Unlock Slot (Free - Testing)</>
        )}
      </Button>
    </motion.div>
  );
}

// ===== PROVIDER SLOT VIEW =====

function ProviderSlotView({
  category,
  product,
  spProfile,
  onBack,
}: {
  category: string;
  product: string;
  spProfile: ServiceProviderProfile;
  onBack: () => void;
}) {
  const [openMemberChats, setOpenMemberChats] = useState<OpenMemberChat[]>([]);
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteDesc, setQuoteDesc] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useSlotMembers(
    category,
    product,
  );
  const { data: quotes = [], isLoading: quotesLoading } = useQuotesForSlot(
    category,
    product,
  );
  const { data: hasPaid, isLoading: paymentLoading } = useHasSpPaidForSlot(
    category,
    product,
  );
  const submitQuote = useSubmitQuote();

  const catColor =
    CATEGORIES.find((c) => c.id === category)?.color ?? "oklch(0.6 0.2 230)";
  const callUrl = `https://meet.jit.si/letzclub-${category.toLowerCase().replace(/\s+/g, "-")}-${product.toLowerCase().replace(/\s+/g, "-")}`;

  // Find my own submitted quote (by businessName match)
  const myQuote = quotes.find(
    (q) =>
      q.businessName === spProfile.businessName &&
      q.providerName === spProfile.name,
  );

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteTitle.trim() || !quoteDesc.trim() || !quotePrice.trim()) return;
    try {
      await submitQuote.mutateAsync({
        category,
        product,
        title: quoteTitle.trim(),
        description: quoteDesc.trim(),
        price: quotePrice.trim(),
      });
      toast.success("Quote submitted successfully!");
      setQuoteSubmitted(true);
      setQuoteTitle("");
      setQuoteDesc("");
      setQuotePrice("");
    } catch {
      toast.error("Failed to submit quote. Try again.");
    }
  };

  const toggleMemberChat = (member: Registration) => {
    setOpenMemberChats((prev) => {
      const exists = prev.find((c) => c.memberId === member.userId);
      if (exists) return prev.filter((c) => c.memberId !== member.userId);
      return [...prev, { memberId: member.userId, memberName: member.name }];
    });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            data-ocid="provider_slot.back_button"
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
                style={{ background: `${catColor}20`, color: catColor }}
              >
                {category}
              </span>
              {hasPaid && (
                <Badge className="bg-green-600 text-white border-0 text-xs">
                  <CheckCircle2 size={10} className="mr-1" />
                  Slot Unlocked
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} members registered
            </p>
          </div>
          <Button
            data-ocid="provider_slot.join_call_button"
            onClick={() => window.open(callUrl, "_blank")}
            className="flex-shrink-0 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm gap-2"
          >
            <Video size={15} />
            <span className="hidden sm:inline">Join Call</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Members list */}
          <div className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Users size={16} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Customer Requirements
                </h2>
              </div>

              {membersLoading ? (
                <div
                  data-ocid="provider_slot.loading_state"
                  className="space-y-3"
                >
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div
                  data-ocid="provider_slot.empty_state"
                  className="rounded-2xl border border-dashed border-border p-10 text-center"
                >
                  <Users
                    size={28}
                    className="text-muted-foreground mx-auto mb-3"
                  />
                  <p className="font-semibold text-foreground text-sm">
                    No members yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No customers have registered for this slot yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, idx) => {
                    const chatOpen = openMemberChats.some(
                      (c) => c.memberId === member.userId,
                    );
                    return (
                      <motion.div
                        key={String(member.id)}
                        data-ocid={`provider_slot.members.item.${idx + 1}`}
                        className="rounded-xl border border-border bg-card p-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground text-sm">
                              {member.name}
                            </p>
                            {/* Always hide phone/location from providers — contact via chat only */}
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Lock size={10} className="text-amber-500" />
                              <span className="italic">
                                Contact hidden — chat to connect
                              </span>
                            </p>
                            {member.requirements && (
                              <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                                {member.requirements}
                              </p>
                            )}
                          </div>
                          {/* Chat button only shown if SP has paid */}
                          {hasPaid ? (
                            <Button
                              data-ocid={`provider_slot.chat_button.${idx + 1}`}
                              size="sm"
                              variant={chatOpen ? "secondary" : "default"}
                              onClick={() => toggleMemberChat(member)}
                              className={`rounded-xl flex-shrink-0 text-xs ${
                                chatOpen
                                  ? ""
                                  : "bg-primary text-white hover:opacity-90"
                              }`}
                            >
                              <MessageCircle size={12} className="mr-1" />
                              {chatOpen ? "Open" : "Chat"}
                            </Button>
                          ) : (
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                                <Lock
                                  size={14}
                                  className="text-muted-foreground"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right: Quote submission + payment gate */}
          <div className="space-y-6">
            {paymentLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-40 rounded-xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            ) : !hasPaid ? (
              <SlotPaymentGate
                category={category}
                product={product}
                onUnlocked={() => {
                  // hasSpPaidForSlot query will refetch automatically via invalidation
                }}
              />
            ) : (
              <>
                {/* My submitted quote */}
                {!quotesLoading && myQuote && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        Your Active Quote
                      </h2>
                    </div>
                    <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-foreground">
                          {myQuote.title}
                        </p>
                        <Badge className="bg-green-600 text-white border-0">
                          <IndianRupee size={10} className="mr-0.5" />
                          {myQuote.price}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {myQuote.description}
                      </p>
                    </div>
                  </section>
                )}

                {/* Submit / Update Quote */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-accent/30 flex items-center justify-center">
                      <Tag size={16} className="text-accent-foreground" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {myQuote ? "Update Quote" : "Submit Your Offer"}
                    </h2>
                  </div>

                  {quoteSubmitted && !myQuote ? (
                    <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center">
                      <CheckCircle2
                        size={32}
                        className="text-green-600 mx-auto mb-2"
                      />
                      <p className="font-bold text-foreground">
                        Quote Submitted!
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customers can now see and chat with you.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 rounded-xl"
                        onClick={() => setQuoteSubmitted(false)}
                      >
                        Submit Another
                      </Button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmitQuote}
                      className="rounded-2xl border border-border bg-card p-5 space-y-4"
                    >
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="quoteTitle"
                          className="text-sm font-medium"
                        >
                          Offer Title
                        </Label>
                        <Input
                          id="quoteTitle"
                          data-ocid="provider_slot.quote_title_input"
                          value={quoteTitle}
                          onChange={(e) => setQuoteTitle(e.target.value)}
                          placeholder="e.g. Premium Mobile Repair Package"
                          className="bg-muted border-border focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="quoteDesc"
                          className="text-sm font-medium"
                        >
                          Description
                        </Label>
                        <Textarea
                          id="quoteDesc"
                          data-ocid="provider_slot.quote_desc_textarea"
                          value={quoteDesc}
                          onChange={(e) => setQuoteDesc(e.target.value)}
                          placeholder="Describe your offer, services included, warranty, etc."
                          rows={4}
                          className="bg-muted border-border focus:border-primary resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="quotePrice"
                          className="text-sm font-medium"
                        >
                          Price / Rate
                        </Label>
                        <div className="relative">
                          <IndianRupee
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            id="quotePrice"
                            data-ocid="provider_slot.quote_price_input"
                            value={quotePrice}
                            onChange={(e) => setQuotePrice(e.target.value)}
                            placeholder="e.g. 499 or 499/month or Free consultation"
                            className="bg-muted border-border focus:border-primary pl-8"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        data-ocid="provider_slot.submit_quote_button"
                        disabled={
                          !quoteTitle.trim() ||
                          !quoteDesc.trim() ||
                          !quotePrice.trim() ||
                          submitQuote.isPending
                        }
                        className="w-full bg-primary text-white font-bold rounded-xl h-11"
                      >
                        {submitQuote.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                            Submitting...
                          </>
                        ) : myQuote ? (
                          "Update Offer"
                        ) : (
                          "Submit Offer"
                        )}
                      </Button>
                    </form>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating provider chat windows */}
      <AnimatePresence>
        {openMemberChats.map((chat, idx) => (
          <ProviderChatWindow
            key={chat.memberId}
            category={category}
            product={product}
            memberId={chat.memberId}
            memberName={chat.memberName}
            onClose={() =>
              setOpenMemberChats((prev) =>
                prev.filter((c) => c.memberId !== chat.memberId),
              )
            }
            index={idx}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

// ===== PROVIDER HOME =====

function ProviderSlotCard({
  category,
  product,
  count,
  idx,
  onClick,
}: {
  category: string;
  product: string;
  count: number;
  idx: number;
  onClick: () => void;
}) {
  const catColor =
    CATEGORIES.find((c) => c.id === category)?.color ?? "oklch(0.6 0.2 230)";
  const pct = Math.min((count / MAX_SLOTS) * 100, 100);

  return (
    <motion.button
      type="button"
      data-ocid={`sp_home.slot.${idx}`}
      className="rounded-2xl border border-border bg-card p-5 text-left hover:shadow-md transition-all cursor-pointer hover:border-primary/40 group w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: catColor }}
          >
            {category}
          </p>
          <h3 className="font-display text-lg font-bold text-foreground mt-0.5">
            {product}
          </h3>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${catColor}20` }}
        >
          <Users size={18} style={{ color: catColor }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span>
          <span className="font-bold text-foreground text-base">{count}</span>
          <span className="text-muted-foreground"> / {MAX_SLOTS} members</span>
        </span>
        {count > 0 && (
          <span className="text-xs text-primary font-semibold group-hover:underline">
            View →
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: catColor }}
        />
      </div>
    </motion.button>
  );
}

export function ProviderHomeScreen({
  spProfile,
}: {
  spProfile: ServiceProviderProfile;
}) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [activeCategory, setActiveCategory] = useState(
    spProfile.category || "Electronics & Appliances",
  );

  const { data: products = [], isLoading: productsLoading } =
    useProductsForCategory(activeCategory);
  const displayProducts =
    products.length > 0 ? products : (FALLBACK_PRODUCTS[activeCategory] ?? []);
  const { data: counts = {}, isLoading: countsLoading } = useProductCounts(
    activeCategory,
    displayProducts,
  );

  if (selectedSlot) {
    return (
      <ProviderSlotView
        category={selectedSlot.category}
        product={selectedSlot.product}
        spProfile={spProfile}
        onBack={() => setSelectedSlot(null)}
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Briefcase size={24} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg font-bold text-foreground">
            Welcome, {spProfile.name}!
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">
            {spProfile.businessName} · Specializing in {spProfile.category}
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.id}
            type="button"
            data-ocid={`sp_categories.tab.${i + 1}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.id
                ? "text-white shadow-glow"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            style={activeCategory === cat.id ? { background: cat.color } : {}}
          >
            {cat.id}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="font-display text-2xl font-extrabold text-foreground">
          {activeCategory} Slots
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Click a slot to view customer requirements and submit your offer
        </p>
      </div>

      {productsLoading || countsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayProducts.map((product, i) => (
            <ProviderSlotCard
              key={product}
              category={activeCategory}
              product={product}
              count={counts[product] ?? 0}
              idx={i + 1}
              onClick={() =>
                setSelectedSlot({ category: activeCategory, product })
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
