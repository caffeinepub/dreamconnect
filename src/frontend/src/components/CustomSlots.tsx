import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, MapPin, Plus, Tag, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateCustomSlot,
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
  "Decor",
  "Other",
];

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
  Decor: "oklch(0.65 0.15 290)",
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
        <span className="flex items-center gap-1 ml-auto">
          <Users size={11} className="flex-shrink-0" />
          <span className={isFull ? "text-destructive font-semibold" : ""}>
            {memberCount} / {Number(slot.maxMembers)}
          </span>
          <span>members</span>
        </span>
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
}

function CreateSlotModal({ onClose }: CreateSlotModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electronics & Appliances");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [maxMembers, setMaxMembers] = useState(20);
  const createSlot = useCreateCustomSlot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) {
      toast.error("Title and location are required");
      return;
    }
    try {
      await createSlot.mutateAsync({
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        maxMembers,
      });
      toast.success("Community slot created!");
      onClose();
    } catch {
      toast.error("Failed to create slot. Please try again.");
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
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
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
            <div className="space-y-1.5">
              <Label htmlFor="cs-title" className="text-sm font-medium">
                Slot Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cs-title"
                data-ocid="create_slot.title_input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Need AC dealers in Chennai"
                className="bg-muted border-border focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cs-category" className="text-sm font-medium">
                Category
              </Label>
              <select
                id="cs-category"
                data-ocid="create_slot.category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted border border-border focus:border-primary text-sm text-foreground focus:outline-none"
              >
                {SLOT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

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

            <Button
              type="submit"
              data-ocid="create_slot.submit_button"
              disabled={createSlot.isPending}
              className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
            >
              {createSlot.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {createSlot.isPending ? "Creating..." : "Create Slot"}
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
                <p className="text-sm font-semibold text-primary flex-shrink-0">
                  {member.phone}
                </p>
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
  const { data: members = [] } = useCustomSlotMembers(slot.id);
  const memberCount = members.length;

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
}

export function CustomSlotsSection({
  isAuthenticated,
  onAuthRequired = () => {},
}: CustomSlotsSectionProps) {
  const { data: slots = [], isLoading } = useCustomSlots();
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningSlot, setJoiningSlot] = useState<CustomSlot | null>(null);
  const [viewingSlot, setViewingSlot] = useState<CustomSlot | null>(null);

  const filteredSlots =
    categoryFilter === "All"
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

      {/* Category filter chips */}
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
          <CreateSlotModal onClose={() => setShowCreateModal(false)} />
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
