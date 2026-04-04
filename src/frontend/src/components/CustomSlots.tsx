import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useCreateCustomSlot,
  useCustomSlotMemberCount,
  useCustomSlotMembers,
  useCustomSlots,
  useIsCustomSlotMember,
  useJoinCustomSlot,
} from "../hooks/useQueries";
import type { CustomSlot, CustomSlotMember } from "../hooks/useQueries";

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

// ===== CUSTOM SLOT CARD =====
interface CustomSlotCardProps {
  slot: CustomSlot;
  index: number;
  memberCount: number;
  isMember: boolean;
  onJoin: () => void;
  onViewMembers: () => void;
}

function CustomSlotCard({
  slot,
  index,
  memberCount,
  isMember,
  onJoin,
  onViewMembers,
}: CustomSlotCardProps) {
  const color = getCategoryColor(slot.category);
  const isFull = memberCount >= Number(slot.maxMembers);
  const pct = Math.min(
    100,
    Number(slot.maxMembers) > 0
      ? (memberCount / Number(slot.maxMembers)) * 100
      : 0,
  );
  const barColor =
    pct >= 80
      ? "oklch(0.65 0.2 25)"
      : pct >= 50
        ? "oklch(0.75 0.18 70)"
        : "oklch(0.65 0.2 145)";

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
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-foreground text-base leading-tight line-clamp-2">
            {slot.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatRelativeDate(slot.createdAt)}
          </p>
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
            Community Slot
          </span>
        </div>
      </div>

      {/* Description */}
      {slot.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {slot.description}
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
      {memberCount > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center">
            {(
              [
                {
                  key: "av-1",
                  color: "oklch(0.6 0.18 200)",
                  show: memberCount >= 1,
                },
                {
                  key: "av-2",
                  color: "oklch(0.6 0.18 290)",
                  show: memberCount >= 2,
                },
                {
                  key: "av-3",
                  color: "oklch(0.7 0.18 60)",
                  show: memberCount >= 3,
                },
                {
                  key: "av-4",
                  color: "oklch(0.6 0.18 145)",
                  show: memberCount >= 4,
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
          {memberCount > 4 && (
            <span style={{ fontSize: 12, color: "oklch(0.65 0.05 258)" }}>
              +{memberCount - 4} more
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
          <span>{memberCount} members joined</span>
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
            transition={{ duration: 0.6, ease: "easeOut" }}
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
}

function CreateSlotModal({ onClose, categoryId }: CreateSlotModalProps) {
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
  const _joinSlot = useJoinCustomSlot();
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
      await createSlot.mutateAsync({
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        maxMembers,
        creatorName: creatorName.trim(),
        creatorPhone: creatorPhone.trim(),
        creatorRequirements: creatorRequirements.trim(),
      });
      await queryClient.refetchQueries({ queryKey: ["customSlots"] });
      queryClient.invalidateQueries({ queryKey: ["customSlotMemberCount"] });
      queryClient.invalidateQueries({ queryKey: ["isCustomSlotMember"] });
      toast.success(
        "Community slot created! You've been added as the first member.",
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
                Create Community Slot
              </h2>
              <p className="text-xs text-muted-foreground">
                Others can join and connect with you
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* What are you looking for — slot title */}
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

            {/* Category — locked or free-text */}
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

            {/* Creator details — auto-join as first member */}
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

            {/* Fee info banner */}
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
}

function JoinSlotModal({ slot, onClose }: JoinSlotModalProps) {
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
      await joinSlot.mutateAsync({
        slotId: slot.id,
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        requirements: requirements.trim(),
      });
      toast.success(`Joined "${slot.title}"!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to join slot. Please try again.");
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

            {/* Fee info banner */}
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
}

function CustomSlotMembersPage({ slot, onBack }: CustomSlotMembersPageProps) {
  const { data: members = [], isLoading } = useCustomSlotMembers(slot.id);
  const color = getCategoryColor(slot.category);

  return (
    <motion.div
      data-ocid="slot_members.page"
      className="max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
    >
      {/* Back button */}
      <button
        type="button"
        data-ocid="slot_members.back_button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Community Slots
      </button>

      {/* Slot header */}
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
                {slot.description}
              </p>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider flex-shrink-0">
            Community Slot
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {slot.location || "Location not specified"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {members.length} / {Number(slot.maxMembers)} members
          </span>
        </div>
      </div>

      {/* Members list */}
      <h2 className="font-display text-lg font-bold text-foreground mb-4">
        Members ({members.length})
      </h2>

      {isLoading ? (
        <div data-ocid="slot_members.loading_state" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div
          data-ocid="slot_members.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
            <Users size={24} className="text-muted-foreground" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            No members yet
          </p>
          <p className="text-sm text-muted-foreground">
            Be the first to join this slot!
          </p>
        </div>
      ) : (
        <div data-ocid="slot_members.list" className="space-y-3">
          {members.map((member: CustomSlotMember, idx: number) => (
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
                  {member.requirements}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ===== SLOT CARD WRAPPER (handles member check) =====
interface SlotCardWrapperProps {
  slot: CustomSlot;
  index: number;
  isAuthenticated: boolean;
  onJoin: (slot: CustomSlot) => void;
  onViewMembers: (slot: CustomSlot) => void;
  onAuthRequired: () => void;
}

function SlotCardWrapper({
  slot,
  index,
  isAuthenticated,
  onJoin,
  onViewMembers,
  onAuthRequired,
}: SlotCardWrapperProps) {
  const { data: isMember = false } = useIsCustomSlotMember(
    isAuthenticated ? slot.id : null,
  );
  const { data: memberCount = 0 } = useCustomSlotMemberCount(slot.id);

  return (
    <CustomSlotCard
      slot={slot}
      index={index}
      memberCount={memberCount}
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
  );
}

// ===== CUSTOM SLOTS SECTION (main export) =====
export interface CustomSlotsSectionProps {
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
  externalCreateOpen?: boolean;
  onExternalCreateClose?: () => void;
  categoryId?: string;
}

export function CustomSlotsSection({
  isAuthenticated,
  onAuthRequired = () => {},
  externalCreateOpen = false,
  onExternalCreateClose,
  categoryId,
}: CustomSlotsSectionProps) {
  const { data: slots = [], isLoading } = useCustomSlots();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningSlot, setJoiningSlot] = useState<CustomSlot | null>(null);
  const [viewingSlot, setViewingSlot] = useState<CustomSlot | null>(null);
  const prevExternalRef = useRef(false);

  useEffect(() => {
    if (externalCreateOpen && !prevExternalRef.current) {
      setShowCreateModal(true);
    }
    prevExternalRef.current = externalCreateOpen;
  }, [externalCreateOpen]);

  const filteredSlots = categoryId
    ? slots.filter((s) => s.category === categoryId)
    : categoryFilter === "All"
      ? slots
      : slots.filter((s) => s.category === categoryFilter);

  if (viewingSlot) {
    return (
      <AnimatePresence mode="wait">
        <CustomSlotMembersPage
          key={String(viewingSlot.id)}
          slot={viewingSlot}
          onBack={() => setViewingSlot(null)}
        />
      </AnimatePresence>
    );
  }

  return (
    <section data-ocid="community_slots.section" className="mt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" />
            Community Slots
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            User-created slots — join to connect with others
          </p>
        </div>
        {isAuthenticated && (
          <Button
            data-ocid="community_slots.create_slot_button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-primary text-white font-semibold rounded-xl px-4 h-9 text-sm hover:opacity-90"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create Slot</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>

      {/* Category filter chips — only shown on the global community page, not per-category */}
      {!categoryId && (
        <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-none">
          {["All", ...SLOT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid={"community_slots.filter.tab"}
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
          data-ocid="community_slots.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filteredSlots.length === 0 ? (
        <motion.div
          data-ocid="community_slots.empty_state"
          className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
            <Users size={24} className="text-primary" />
          </div>
          <p className="font-display text-lg font-bold text-foreground mb-1">
            No community slots yet
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to create one!
          </p>
          {isAuthenticated && (
            <Button
              data-ocid="community_slots.create_first_button"
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
              onJoin={setJoiningSlot}
              onViewMembers={setViewingSlot}
              onAuthRequired={onAuthRequired}
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
          />
        )}
        {joiningSlot && (
          <JoinSlotModal
            slot={joiningSlot}
            onClose={() => setJoiningSlot(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
