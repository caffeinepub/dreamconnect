import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Armchair,
  ArrowLeft,
  Bike,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Bus,
  Camera,
  Car,
  Droplet,
  Droplets,
  Dumbbell,
  Factory,
  Flame,
  Flower2,
  GraduationCap,
  Hammer,
  HardHat,
  Headphones,
  Home,
  Laptop,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Microwave,
  Monitor,
  Paintbrush,
  PawPrint,
  Phone,
  Plane,
  Plus,
  Printer,
  Scissors,
  Shield,
  Smartphone,
  Sofa,
  Star,
  Stethoscope,
  Tag,
  Tractor,
  TrendingUp,
  Trophy,
  Truck,
  Tv,
  Users,
  UtensilsCrossed,
  Volume2,
  Watch,
  Wind,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateCustomSlot,
  useCustomSlotMemberCount,
  useCustomSlotMembers,
  useCustomSlots,
  useIsCustomSlotMember,
  useJoinCustomSlot,
} from "../hooks/useQueries";
import type { CustomSlot, CustomSlotMember } from "../hooks/useQueries";

// ===== PRODUCT ICON MAP (mirrors App.tsx PRODUCT_ICONS) =====
const PRODUCT_ICONS: Record<string, React.ElementType> = {
  Mobile: Smartphone,
  Laptop: Laptop,
  TV: Tv,
  Speakers: Volume2,
  Camera: Camera,
  Headphones: Headphones,
  Smartwatch: Watch,
  "Gaming Console": Monitor,
  Refrigerator: Monitor,
  "Washing Machine": Monitor,
  AC: Wind,
  Microwave: Microwave,
  Geyser: Flame,
  Dishwasher: Droplets,
  "Water Purifier": Droplet,
  Chimney: Flame,
  "Air Purifier": Wind,
  Oven: Flame,
  Car: Car,
  Bike: Bike,
  Truck: Truck,
  Bus: Bus,
  "Heavy Equipment": Tractor,
  "Three Wheeler": Tractor,
  Home: Home,
  "Restaurant/Cafe": UtensilsCrossed,
  Office: Briefcase,
  Showroom: Building,
  "Salon/Spa/Beauty Parlour": Scissors,
  "Gym/Fitness Studio": Dumbbell,
  Sofa: Sofa,
  Bed: Monitor,
  Wardrobe: Archive,
  "Dining Table": UtensilsCrossed,
  "Office Chair": Armchair,
  Bookshelf: BookOpen,
  "TV Unit": Tv,
  "Shoe Rack": Archive,
  "Home Furniture": Sofa,
  "Office Furniture": Armchair,
  "Restaurant Furniture": UtensilsCrossed,
  Apartment: Building,
  Villa: Home,
  Plot: Layers,
  "Commercial Space": Building2,
  Studio: Home,
  Penthouse: Building2,
  Farmhouse: Home,
  Warehouse: Factory,
  Treadmill: Dumbbell,
  Dumbbells: Dumbbell,
  "Bench Press": Dumbbell,
  Elliptical: Dumbbell,
  "Rowing Machine": Dumbbell,
  "Pull-up Bar": Dumbbell,
  "Resistance Bands": Dumbbell,
  "Yoga Mat": Dumbbell,
  "Exercise Bike": Bike,
  Kettlebells: Dumbbell,
  Programming: Laptop,
  Design: Paintbrush,
  "Digital Marketing": TrendingUp,
  Finance: Briefcase,
  Language: BookOpen,
  Photography: Camera,
  Music: Volume2,
  Cooking: UtensilsCrossed,
  Fitness: Dumbbell,
  Business: Briefcase,
  "Hair Care": Scissors,
  "Skin Care": Flower2,
  Makeup: Flower2,
  "Nail Care": Scissors,
  Spa: Flower2,
  Waxing: Scissors,
  "Bridal Package": Flower2,
  Massage: Flower2,
  Facial: Flower2,
  "Eyebrow Threading": Scissors,
  "Beauty Products": Flower2,
  Cement: HardHat,
  Steel: HardHat,
  Bricks: HardHat,
  Sand: HardHat,
  Tiles: Layers,
  Paint: Paintbrush,
  Glass: Layers,
  Plywood: HardHat,
  Pipes: Droplets,
  "Electrical Fittings": Hammer,
  Ceiling: Layers,
  "General Physician": Stethoscope,
  Dentist: Stethoscope,
  Physiotherapy: Stethoscope,
  "Eye Care": Stethoscope,
  Diagnostics: Stethoscope,
  "Nursing Care": Stethoscope,
  "Mental Health": Stethoscope,
  Nutrition: Stethoscope,
  Paediatrics: Stethoscope,
  Accounting: Briefcase,
  HR: Briefcase,
  "App/Web Development": Monitor,
  Printing: Printer,
  Security: Shield,
  Cleaning: Droplets,
  Consulting: Briefcase,
  Cake: Star,
  "Home Made Foods": UtensilsCrossed,
  Dogs: PawPrint,
  Birds: PawPrint,
  "Fish & Aquarium": Droplet,
  "Fashion Influencers": Star,
  "Beauty Influencers": Flower2,
  "Food Influencers": UtensilsCrossed,
  "Fitness Influencers": Dumbbell,
  "Travel Influencers": Plane,
  "Tech Influencers": Laptop,
  "Lifestyle Influencers": Star,
  "Parenting Influencers": Star,
  "Finance Influencers": Briefcase,
  "Education Influencers": GraduationCap,
};

// Resolve product icon from title using same logic as App.tsx ProductCard
function getProductIcon(title: string): React.ElementType {
  // Direct match
  if (PRODUCT_ICONS[title]) return PRODUCT_ICONS[title];
  // Prefix match (e.g. "Car - Tata" → "Car")
  const prefix = title.includes(" - ") ? title.split(" - ")[0] : title;
  if (PRODUCT_ICONS[prefix]) return PRODUCT_ICONS[prefix];
  // Partial match: find any key that the title starts with
  for (const key of Object.keys(PRODUCT_ICONS)) {
    if (title.toLowerCase().startsWith(key.toLowerCase()))
      return PRODUCT_ICONS[key];
  }
  return Monitor;
}

const SLOT_CATEGORIES = [
  "Electronics & Appliances",
  "Vehicles",
  "Interior Designing",
  "Furniture",
  "Real Estate",
  "Gym",
  "Courses",
  "Medical",
  "Beauty",
  "Construction Materials",
  "Business Services",
  "Food",
  "Events & Entertainment",
  "Sports & Recreation",
  "Pets & Animals",
  "Marketing",
  "Agriculture",
  "Purchase Machinery",
  "Other",
];

const CATEGORY_SLOT_EXAMPLES: Record<string, string> = {
  "Electronics & Appliances": "e.g. Fan, Ceiling Fan, Water Heater, Air Cooler",
  Vehicles: "e.g. Auto Rickshaw, Golf Cart, Electric Scooter",
  "Interior Designing": "e.g. Modular Kitchen, False Ceiling, Wallpaper",
  Furniture: "e.g. Bean Bag, Recliner, Shoe Rack, Study Table",
  Beauty: "e.g. Hair Straightener, Nail Art Kit, Keratin Treatment",
  "Construction Materials": "e.g. PVC Pipes, Door Frames, Floor Tiles",
  "Business Services": "e.g. Logo Design, GST Filing, Social Media Management",
  Food: "e.g. Biryani Catering, Tiffin Service, Birthday Cake Delivery",
  "Events & Entertainment":
    "e.g. DJ for Wedding, Birthday Decoration, Event Anchor",
  "Pets & Animals": "e.g. Rabbit, Hamster, Parrot, Fish Tank Setup",
  "Sports & Recreation":
    "e.g. Badminton Court Booking, Yoga Classes, Swimming Coach",
  Marketing: "e.g. YouTube Channel Promotion, Reel Creator, Brand Ambassador",
  "Real Estate": "e.g. Warehouse Space, Shop on Rent, Agricultural Land",
  Gym: "e.g. CrossFit Studio, Zumba Classes, Yoga Studio",
  Courses: "e.g. IELTS Preparation, Graphic Design Course, Digital Marketing",
  Medical: "e.g. Physiotherapy, Dental Checkup, Eye Test",
  Agriculture: "e.g. Drip Irrigation Setup, Organic Fertilizer, Crop Insurance",
  "Purchase Machinery": "e.g. Lathe Machine, Hydraulic Press, 3D Printer",
  Other: "e.g. Astrology, Handicrafts, Vintage Furniture, Calligraphy",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Electronics & Appliances": "oklch(0.6 0.2 230)",
  Vehicles: "oklch(0.72 0.19 55)",
  "Interior Designing": "oklch(0.65 0.18 310)",
  Furniture: "oklch(0.62 0.15 145)",
  "Real Estate": "oklch(0.62 0.22 28)",
  Gym: "oklch(0.62 0.22 18)",
  Courses: "oklch(0.65 0.18 160)",
  Medical: "oklch(0.60 0.20 10)",
  Beauty: "oklch(0.68 0.18 350)",
  "Construction Materials": "oklch(0.68 0.17 70)",
  "Business Services": "oklch(0.60 0.15 250)",
  Agriculture: "oklch(0.62 0.20 135)",
  Food: "oklch(0.70 0.20 50)",
  "Events & Entertainment": "oklch(0.65 0.22 300)",
  "Sports & Recreation": "oklch(0.64 0.22 145)",
  "Pets & Animals": "oklch(0.68 0.18 80)",
  Marketing: "oklch(0.65 0.20 280)",
  "Purchase Machinery": "oklch(0.60 0.18 200)",
  Other: "oklch(0.60 0.12 258)",
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? "oklch(0.60 0.12 258)";
}

function formatRelativeDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

// Generate 6-month tab array (same approach as HOME_MONTH_TABS in App.tsx)
export function generateCustomSlotMonthTabs(count = 6) {
  const now = new Date();
  const tabs: { label: string; year: number; month: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    tabs.push({
      label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return tabs;
}

// Shared month tabs — generated once at module load time
const CUSTOM_SLOT_MONTH_TABS = generateCustomSlotMonthTabs(6);

// ===== CUSTOM SLOT CARD =====
interface CustomSlotCardProps {
  slot: CustomSlot;
  index: number;
  memberCount: number;
  monthFilteredCount: number;
  optimisticCount?: number;
  isMember: boolean;
  onJoin: () => void;
  onViewMembers: () => void;
}

function CustomSlotCard({
  slot,
  index,
  memberCount,
  monthFilteredCount,
  optimisticCount,
  isMember,
  onJoin,
  onViewMembers,
}: CustomSlotCardProps) {
  // Priority: optimistic > monthFiltered > total
  const displayCount =
    optimisticCount !== undefined ? optimisticCount : monthFilteredCount;
  const color = getCategoryColor(slot.category);
  const isFull = memberCount >= Number(slot.maxMembers);
  const pct = Math.min(
    100,
    Number(slot.maxMembers) > 0
      ? (displayCount / Number(slot.maxMembers)) * 100
      : 0,
  );
  const barColor =
    pct >= 80
      ? "oklch(0.65 0.2 25)"
      : pct >= 50
        ? "oklch(0.75 0.18 70)"
        : "oklch(0.65 0.2 145)";

  const ProductIcon = getProductIcon(slot.title);

  return (
    <motion.div
      data-ocid={`community_slots.card.${index}`}
      className="rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-3 p-5 hover:border-primary/30 transition-colors"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Product Icon */}
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <ProductIcon size={18} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-base leading-tight line-clamp-2">
              {slot.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatRelativeDate(slot.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end flex-shrink-0">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${color}20`, color }}
            data-ocid={`community_slots.tab.${index}`}
          >
            {slot.category}
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider">
            Custom Slot
          </span>
        </div>
      </div>

      {/* Description */}
      {slot.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {slot.description.replace(/\[Month:[^\]]+\]/g, "").trim()}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={11} className="flex-shrink-0" />
          {slot.location || "Location not specified"}
        </span>
      </div>

      {/* Member avatars */}
      {displayCount > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center">
            {(
              [
                {
                  key: "av-1",
                  color: "oklch(0.6 0.18 200)",
                  show: displayCount >= 1,
                },
                {
                  key: "av-2",
                  color: "oklch(0.6 0.18 290)",
                  show: displayCount >= 2,
                },
                {
                  key: "av-3",
                  color: "oklch(0.7 0.18 60)",
                  show: displayCount >= 3,
                },
                {
                  key: "av-4",
                  color: "oklch(0.6 0.18 145)",
                  show: displayCount >= 4,
                },
              ] as { key: string; color: string; show: boolean }[]
            )
              .filter((av) => av.show)
              .map((av, pos) => (
                <div
                  key={av.key}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: av.color,
                    border: "2px solid oklch(0.18 0.02 258)",
                    marginLeft: pos === 0 ? 0 : -10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 4 - pos,
                    position: "relative",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="white"
                    aria-hidden="true"
                  >
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              ))}
          </div>
          {displayCount > 4 && (
            <span style={{ fontSize: 12, color: "oklch(0.65 0.05 258)" }}>
              +{displayCount - 4} more
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-1">
        <div
          className="flex justify-between text-xs mb-1"
          style={{ color: "oklch(0.65 0.05 258)" }}
        >
          <span>{displayCount} members</span>
          <span>{Number(slot.maxMembers)} max</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "oklch(0.22 0.02 258)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {isMember ? (
          <Button
            data-ocid={`community_slots.view_members_button.${index}`}
            onClick={onViewMembers}
            className="flex-1 h-9 text-sm font-semibold rounded-xl bg-primary text-white hover:opacity-90"
          >
            View Members
          </Button>
        ) : isFull ? (
          <Button
            disabled
            className="flex-1 h-9 text-sm font-semibold rounded-xl bg-muted text-muted-foreground cursor-not-allowed"
          >
            Full
          </Button>
        ) : (
          <>
            <Button
              data-ocid={`community_slots.join_button.${index}`}
              onClick={onJoin}
              className="flex-1 h-9 text-sm font-semibold rounded-xl bg-primary text-white hover:opacity-90"
            >
              Join Slot
            </Button>
            <Button
              data-ocid={`community_slots.view_button.${index}`}
              variant="outline"
              onClick={onViewMembers}
              className="h-9 px-3 text-sm rounded-xl border-border"
            >
              View
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ===== CREATE SLOT MODAL =====
interface CreateSlotModalProps {
  onClose: () => void;
  categoryId?: string;
  activeMonth?: { year: number; month: number; label: string };
  onCreated?: (newCount: number, newSlotTitle?: string) => void;
}

function CreateSlotModal({
  onClose,
  categoryId,
  activeMonth,
  onCreated,
}: CreateSlotModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categoryId ?? "Other");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [maxMembers, setMaxMembers] = useState(20);
  const [creatorName, setCreatorName] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorRequirements, setCreatorRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSlot = useCreateCustomSlot();
  const queryClient = useQueryClient();

  const isLockedCategory = categoryId !== undefined && categoryId !== "Other";
  const titlePlaceholder =
    CATEGORY_SLOT_EXAMPLES[categoryId ?? "Other"] ??
    "e.g. What are you looking for?";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !location.trim() ||
      !creatorName.trim() ||
      !creatorPhone.trim()
    ) {
      toast.error("Title, location, name, and phone are required");
      return;
    }
    setIsSubmitting(true);
    try {
      const now = new Date();
      const purchaseYear = activeMonth?.year ?? now.getFullYear();
      const purchaseMonth = activeMonth
        ? activeMonth.month + 1
        : now.getMonth() + 1;
      const monthTag = `[Month: ${purchaseYear}-${String(purchaseMonth).padStart(2, "0")}]`;
      const fullCreatorReq = `${creatorRequirements.trim()} ${monthTag}`.trim();
      // Embed month tag in description so slot-level filtering works without fetching all members
      const descWithMonth = `${description.trim()} ${monthTag}`.trim();
      await createSlot.mutateAsync({
        title: title.trim(),
        category,
        description: descWithMonth,
        location: location.trim(),
        maxMembers,
        creatorName: creatorName.trim(),
        creatorPhone: creatorPhone.trim(),
        creatorRequirements: fullCreatorReq,
      });
      // Notify parent for optimistic update before closing
      onCreated?.(1, title.trim());
      // Give backend a moment, then force refetch
      await new Promise((r) => setTimeout(r, 400));
      await queryClient.refetchQueries({
        queryKey: ["customSlots"],
        exact: false,
      });
      await queryClient.refetchQueries({
        queryKey: ["isCustomSlotMember"],
        exact: false,
      });
      toast.success(
        "Custom slot created! You've been added as the first member.",
      );
      onClose();
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      const trapMatch =
        raw.match(/ic0\.trap with message:\s*(.+?)(?:\s*\n|$)/i) ||
        raw.match(/message['": \s]+([^'"]{5,120})/i);
      const msg = trapMatch ? trapMatch[1].trim() : raw;
      toast.error(
        msg.length < 160 ? msg : "Failed to create slot. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        data-ocid="create_slot.dialog"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />
        <div className="p-6">
          <button
            type="button"
            data-ocid="create_slot.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <Tag size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Create Custom Slot
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeMonth
                  ? `For ${activeMonth.label} — others can join and connect`
                  : "Others can join and connect with you"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cs-title" className="text-sm font-medium">
                What are you looking for?{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cs-title"
                data-ocid="create_slot.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                className="bg-muted border-border focus:border-primary"
              />
            </div>

            {isLockedCategory ? (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-foreground">
                  <span>{categoryId}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock size={11} />
                    Locked
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="cs-category" className="text-sm font-medium">
                  What category does your requirement belong to?
                </Label>
                <Input
                  id="cs-category"
                  data-ocid="create_slot.category_input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Astrology, Handicrafts, Vintage Furniture"
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="cs-location" className="text-sm font-medium">
                Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="cs-location"
                  data-ocid="create_slot.location_input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="bg-muted border-border focus:border-primary pl-8"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cs-desc" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="cs-desc"
                data-ocid="create_slot.description_textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this slot is about..."
                rows={3}
                className="bg-muted border-border focus:border-primary resize-none"
              />
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Your Details (you'll be added as first member)
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cs-creator-name"
                    className="text-sm font-medium"
                  >
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cs-creator-name"
                    data-ocid="create_slot.creator_name_input"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-muted border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cs-creator-phone"
                    className="text-sm font-medium"
                  >
                    Your Phone Number{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cs-creator-phone"
                    data-ocid="create_slot.creator_phone_input"
                    value={creatorPhone}
                    onChange={(e) => setCreatorPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    type="tel"
                    className="bg-muted border-border focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="cs-creator-req"
                    className="text-sm font-medium"
                  >
                    Your Requirements
                  </Label>
                  <Textarea
                    id="cs-creator-req"
                    data-ocid="create_slot.creator_requirements_textarea"
                    value={creatorRequirements}
                    onChange={(e) => setCreatorRequirements(e.target.value)}
                    placeholder="Describe what you're looking for..."
                    rows={2}
                    className="bg-muted border-border focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cs-max" className="text-sm font-medium">
                Max Members
              </Label>
              <Input
                id="cs-max"
                data-ocid="create_slot.max_input"
                type="number"
                min={2}
                max={50}
                value={maxMembers}
                onChange={(e) =>
                  setMaxMembers(
                    Math.min(50, Math.max(2, Number(e.target.value))),
                  )
                }
                className="bg-muted border-border focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">Max 50 members</p>
            </div>

            <div
              className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{
                background: "oklch(0.2 0.05 145 / 0.3)",
                color: "oklch(0.75 0.15 145)",
              }}
            >
              <span>🎉</span>
              <span>Free for Testing — slot creation fee will apply later</span>
            </div>

            <Button
              type="submit"
              data-ocid="create_slot.submit_button"
              disabled={isSubmitting || !createSlot.isActorReady}
              className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
            >
              {isSubmitting || !createSlot.isActorReady ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSubmitting
                ? "Creating..."
                : !createSlot.isActorReady
                  ? "Connecting..."
                  : "Create Slot"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ===== JOIN SLOT MODAL =====
interface JoinSlotModalProps {
  slot: CustomSlot;
  onClose: () => void;
  activeMonth?: { year: number; month: number; label: string };
  onJoined?: () => void;
}

function JoinSlotModal({
  slot,
  onClose,
  activeMonth,
  onJoined,
}: JoinSlotModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const joinSlot = useJoinCustomSlot();
  const color = getCategoryColor(slot.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !location.trim()) {
      toast.error("Name, phone, and location are required");
      return;
    }
    try {
      const now = new Date();
      const purchaseYear = activeMonth?.year ?? now.getFullYear();
      const purchaseMonth = activeMonth
        ? activeMonth.month + 1
        : now.getMonth() + 1;
      const monthTag = `[Month: ${purchaseYear}-${String(purchaseMonth).padStart(2, "0")}]`;
      const fullRequirements = `${requirements.trim()} ${monthTag}`.trim();
      await joinSlot.mutateAsync({
        slotId: slot.id,
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        requirements: fullRequirements,
      });
      onJoined?.();
      toast.success(`Joined "${slot.title}"!`);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg ?? "Failed to join slot. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        data-ocid="join_slot.dialog"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${color}, oklch(0.75 0.19 55))`,
          }}
        />
        <div className="p-6">
          <button
            type="button"
            data-ocid="join_slot.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
          >
            ✕
          </button>

          <div className="mb-5">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color }}
            >
              {slot.category}
            </span>
            <h2 className="font-display text-xl font-bold text-foreground mt-0.5">
              {slot.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in your details to join this slot
              {activeMonth ? ` for ${activeMonth.label}` : ""}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="js-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="js-name"
                data-ocid="join_slot.name_input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="js-phone"
                data-ocid="join_slot.phone_input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                type="tel"
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-location" className="text-sm font-medium">
                Your Location
              </Label>
              <div className="relative">
                <MapPin
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="js-location"
                  data-ocid="join_slot.location_input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Area"
                  className="bg-muted border-border focus:border-primary pl-8"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="js-req" className="text-sm font-medium">
                Your Requirements
              </Label>
              <Textarea
                id="js-req"
                data-ocid="join_slot.requirements_textarea"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe what you're looking for..."
                rows={3}
                className="bg-muted border-border focus:border-primary resize-none"
              />
            </div>
            <div
              className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
              style={{
                background: "oklch(0.2 0.05 145 / 0.3)",
                color: "oklch(0.75 0.15 145)",
              }}
            >
              <span>🎉</span>
              <span>Free for Testing — slot joining fee will apply later</span>
            </div>
            <Button
              type="submit"
              data-ocid="join_slot.submit_button"
              disabled={joinSlot.isPending}
              className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
            >
              {joinSlot.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {joinSlot.isPending ? "Joining..." : "Join Slot"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ===== CUSTOM SLOT MEMBERS PAGE =====
interface CustomSlotMembersPageProps {
  slot: CustomSlot;
  onBack: () => void;
  defaultMonthIdx?: number;
}

function CustomSlotMembersPage({
  slot,
  onBack,
  defaultMonthIdx = 0,
}: CustomSlotMembersPageProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: members = [], isLoading } = useCustomSlotMembers(
    isAuthenticated ? slot.id : null,
  );
  const color = getCategoryColor(slot.category);
  const [activeMonthIdx, setActiveMonthIdx] = useState(defaultMonthIdx);

  useEffect(() => {
    setActiveMonthIdx(defaultMonthIdx);
  }, [defaultMonthIdx]);

  const filteredMembers = useMemo(() => {
    const tab = CUSTOM_SLOT_MONTH_TABS[activeMonthIdx];
    if (!tab) return members;
    return members.filter((m) => {
      const req = m.requirements || "";
      const monthMatch = req.match(/\[Month:\s*(\d{4})-(\d{2})\]/);
      if (monthMatch) {
        return (
          Number.parseInt(monthMatch[1]) === tab.year &&
          Number.parseInt(monthMatch[2]) - 1 === tab.month
        );
      }
      const d = new Date(Number(m.joinedAt) / 1_000_000);
      return d.getFullYear() === tab.year && d.getMonth() === tab.month;
    });
  }, [members, activeMonthIdx]);

  return (
    <motion.div
      data-ocid="slot_members.page"
      className="max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        data-ocid="slot_members.back_button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Custom Slots
      </button>

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color }}
            >
              {slot.category}
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
              {slot.title}
            </h1>
            {slot.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {slot.description.replace(/\[Month:[^\]]+\]/g, "").trim()}
              </p>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider flex-shrink-0">
            Custom Slot
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {slot.location || "Location not specified"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {isAuthenticated
              ? `${filteredMembers.length} / ${Number(slot.maxMembers)} members`
              : `? / ${Number(slot.maxMembers)} members`}
          </span>
        </div>
      </div>

      {/* Month Tabs */}
      <div
        data-ocid="slot_members.timeline_tabs"
        className="flex gap-2 overflow-x-auto pb-2 mb-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CUSTOM_SLOT_MONTH_TABS.map((tab, idx) => (
          <button
            key={tab.label}
            type="button"
            data-ocid={`slot_members.timeline.tab.${idx + 1}`}
            onClick={() => setActiveMonthIdx(idx)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              idx === activeMonthIdx
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Members in {CUSTOM_SLOT_MONTH_TABS[activeMonthIdx]?.label}{" "}
        {isAuthenticated ? `(${filteredMembers.length})` : ""}
      </h2>

      {!isAuthenticated ? (
        <div
          data-ocid="slot_members.signin_required"
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Lock size={24} className="text-primary" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            Sign in to view members
          </p>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to see who joined this slot.
          </p>
        </div>
      ) : isLoading ? (
        <div data-ocid="slot_members.loading_state" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div
          data-ocid="slot_members.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
            <Users size={24} className="text-muted-foreground" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            No members in {CUSTOM_SLOT_MONTH_TABS[activeMonthIdx]?.label}
          </p>
          <p className="text-sm text-muted-foreground">
            Be the first to join this slot for this month!
          </p>
        </div>
      ) : (
        <div data-ocid="slot_members.list" className="space-y-3">
          {filteredMembers.map((member: CustomSlotMember, idx: number) => (
            <motion.div
              key={`${member.userId}-${idx}`}
              data-ocid={`slot_members.item.${idx + 1}`}
              className="rounded-xl border border-border bg-card p-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-bold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {member.location}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{member.phone}</p>
              </div>
              {member.requirements && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {member.requirements
                    .replace(/\[Month:[^\]]+\]/g, "")
                    .replace(/\[Timeline:[^\]]+\]/g, "")
                    .replace(/\[Expected by:[^\]]+\]/g, "")
                    .trim()}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ===== SLOT CARD WRAPPER (handles member check + optimistic updates) =====
interface SlotCardWrapperProps {
  slot: CustomSlot;
  index: number;
  isAuthenticated: boolean;
  activeMonth?: { year: number; month: number; label: string };
  onJoin: (slot: CustomSlot) => void;
  onViewMembers: (slot: CustomSlot) => void;
  onAuthRequired: () => void;
  highlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function SlotCardWrapper({
  slot,
  index,
  isAuthenticated,
  activeMonth,
  onJoin,
  onViewMembers,
  onAuthRequired,
  highlighted = false,
  cardRef,
}: SlotCardWrapperProps) {
  const { data: isMember = false } = useIsCustomSlotMember(
    isAuthenticated ? slot.id : null,
  );
  const { data: memberCount = 0 } = useCustomSlotMemberCount(slot.id);
  const { data: members } = useCustomSlotMembers(
    isAuthenticated ? slot.id : null,
  );
  const [optimisticCount, setOptimisticCount] = useState<number | undefined>(
    undefined,
  );

  // Clear optimistic override once backend data arrives and is up-to-date
  useEffect(() => {
    if (optimisticCount !== undefined && members !== undefined) {
      // If backend count is >= optimistic, clear the override
      if (members.length >= optimisticCount) {
        setOptimisticCount(undefined);
      }
    }
  }, [members, optimisticCount]);

  // Compute month-filtered count for the active month tab
  const monthFilteredCount = useMemo(() => {
    if (!members) return 0;
    if (!activeMonth) return members.length;
    return members.filter((m) => {
      const req = m.requirements || "";
      const monthMatch = req.match(/\[Month:\s*(\d{4})-(\d{2})\]/);
      if (monthMatch) {
        return (
          Number.parseInt(monthMatch[1]) === activeMonth.year &&
          Number.parseInt(monthMatch[2]) - 1 === activeMonth.month
        );
      }
      const d = new Date(Number(m.joinedAt) / 1_000_000);
      return (
        d.getFullYear() === activeMonth.year &&
        d.getMonth() === activeMonth.month
      );
    }).length;
  }, [members, activeMonth]);

  return (
    <div
      ref={cardRef}
      className={
        highlighted
          ? "ring-2 ring-primary rounded-2xl transition-all duration-1000"
          : undefined
      }
    >
      <CustomSlotCard
        slot={slot}
        index={index}
        memberCount={memberCount}
        monthFilteredCount={monthFilteredCount}
        optimisticCount={optimisticCount}
        isMember={isMember}
        onJoin={() => {
          if (!isAuthenticated) {
            onAuthRequired();
            return;
          }
          onJoin(slot);
        }}
        onViewMembers={() => onViewMembers(slot)}
      />
    </div>
  );
}

// ===== CUSTOM SLOTS SECTION (main export) =====
export interface CustomSlotsSectionProps {
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
  externalCreateOpen?: boolean;
  onExternalCreateClose?: () => void;
  categoryId?: string;
  activeMonth?: { year: number; month: number; label: string };
}

export function CustomSlotsSection({
  isAuthenticated,
  onAuthRequired = () => {},
  externalCreateOpen = false,
  onExternalCreateClose,
  categoryId,
  activeMonth: externalActiveMonth,
}: CustomSlotsSectionProps) {
  const { data: slots = [], isLoading } = useCustomSlots();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningSlot, setJoiningSlot] = useState<CustomSlot | null>(null);
  const [viewingSlot, setViewingSlot] = useState<CustomSlot | null>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<bigint | null>(
    null,
  );
  const slotCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevExternalRef = useRef(false);

  // Internal month tab state — synced to external if provided
  const [internalMonthIdx, setInternalMonthIdx] = useState(() => {
    if (!externalActiveMonth) return 0;
    const idx = CUSTOM_SLOT_MONTH_TABS.findIndex(
      (t) =>
        t.year === externalActiveMonth.year &&
        t.month === externalActiveMonth.month,
    );
    return idx >= 0 ? idx : 0;
  });

  // Sync internal month idx when external activeMonth changes
  useEffect(() => {
    if (externalActiveMonth) {
      const idx = CUSTOM_SLOT_MONTH_TABS.findIndex(
        (t) =>
          t.year === externalActiveMonth.year &&
          t.month === externalActiveMonth.month,
      );
      if (idx >= 0) setInternalMonthIdx(idx);
    }
  }, [externalActiveMonth]);

  const activeMonthIdx = internalMonthIdx;
  const activeMonth = CUSTOM_SLOT_MONTH_TABS[activeMonthIdx];

  useEffect(() => {
    if (externalCreateOpen && !prevExternalRef.current) {
      setShowCreateModal(true);
    }
    prevExternalRef.current = externalCreateOpen;
  }, [externalCreateOpen]);

  // Filter by category, then by month tag in creatorRequirements, then sort newest first
  const filteredSlots = useMemo(() => {
    // Step 1: category filter
    let result = categoryId
      ? slots.filter((s) => s.category === categoryId)
      : categoryFilter === "All"
        ? slots
        : slots.filter((s) => s.category === categoryFilter);

    // Step 2: month filter — only show slots whose description has the matching [Month: YYYY-MM] tag
    if (activeMonth) {
      const currentTabMonthStr = `${CUSTOM_SLOT_MONTH_TABS[0].year}-${String(CUSTOM_SLOT_MONTH_TABS[0].month + 1).padStart(2, "0")}`;
      const activeMonthStr = `${activeMonth.year}-${String(activeMonth.month + 1).padStart(2, "0")}`;
      result = result.filter((s) => {
        const desc = s.description || "";
        const monthMatch = desc.match(/\[Month:\s*(\d{4})-(\d{2})\]/);
        if (monthMatch) {
          return (
            Number.parseInt(monthMatch[1]) === activeMonth.year &&
            Number.parseInt(monthMatch[2]) - 1 === activeMonth.month
          );
        }
        // Fallback: no month tag → show under current month (first tab) only
        return activeMonthStr === currentTabMonthStr;
      });
    }

    // Step 3: sort newest first (descending by createdAt timestamp)
    return [...result].sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    );
  }, [slots, categoryId, categoryFilter, activeMonth]);

  if (viewingSlot) {
    return (
      <AnimatePresence mode="wait">
        <CustomSlotMembersPage
          key={String(viewingSlot.id)}
          slot={viewingSlot}
          onBack={() => setViewingSlot(null)}
          defaultMonthIdx={activeMonthIdx}
        />
      </AnimatePresence>
    );
  }

  return (
    <section data-ocid="custom_slots.section" className="mt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" />
            Custom Slots
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            User-created slots — join to connect with others
          </p>
        </div>
        {isAuthenticated && (
          <Button
            data-ocid="custom_slots.create_slot_button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white font-semibold rounded-xl px-4 h-9 text-sm hover:opacity-90"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create Slot</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>

      {/* Month Timeline Tabs — always shown above custom slots */}
      <div
        data-ocid="custom_slots.timeline_tabs"
        className="flex gap-2 overflow-x-auto pb-2 mb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CUSTOM_SLOT_MONTH_TABS.map((tab, idx) => (
          <button
            key={tab.label}
            type="button"
            data-ocid={`custom_slots.timeline.tab.${idx + 1}`}
            onClick={() => setInternalMonthIdx(idx)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              idx === activeMonthIdx
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter chips — only shown on the global custom slots page */}
      {!categoryId && (
        <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-none">
          {["All", ...SLOT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid={"custom_slots.filter.tab"}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Slot grid */}
      {isLoading ? (
        <div
          data-ocid="custom_slots.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <motion.div
          data-ocid="custom_slots.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Users size={24} className="text-primary" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            No custom slots yet
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to create one!
          </p>
          {isAuthenticated && (
            <Button
              data-ocid="custom_slots.create_first_button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 bg-primary text-white font-semibold rounded-xl px-5 h-9 text-sm"
            >
              <Plus size={14} />
              Create First Slot
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlots.map((slot, i) => (
            <SlotCardWrapper
              key={String(slot.id)}
              slot={slot}
              index={i + 1}
              isAuthenticated={isAuthenticated}
              activeMonth={activeMonth}
              onJoin={setJoiningSlot}
              onViewMembers={setViewingSlot}
              onAuthRequired={onAuthRequired}
              highlighted={slot.id === highlightedSlotId}
              cardRef={(el) => {
                slotCardRefs.current[String(slot.id)] = el;
              }}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateSlotModal
            onClose={() => {
              setShowCreateModal(false);
              onExternalCreateClose?.();
            }}
            categoryId={categoryId}
            activeMonth={activeMonth}
            onCreated={(_count, newTitle) => {
              // After creation, wait for the slot list to refetch then scroll + highlight
              if (!newTitle) return;
              setTimeout(() => {
                // Find the newly created slot by title (newest first after sort)
                const newSlot = slots.find((s) => s.title === newTitle);
                if (newSlot) {
                  setHighlightedSlotId(newSlot.id);
                  const el = slotCardRefs.current[String(newSlot.id)];
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => setHighlightedSlotId(null), 2500);
                }
              }, 800);
            }}
          />
        )}
        {joiningSlot && (
          <JoinSlotModal
            slot={joiningSlot}
            onClose={() => setJoiningSlot(null)}
            activeMonth={activeMonth}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
