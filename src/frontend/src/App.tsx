import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Armchair,
  Building2,
  Car,
  CheckCircle2,
  ClipboardList,
  Loader2,
  LogIn,
  LogOut,
  Monitor,
  Sofa,
  User,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type Registration,
  useAllRegistrations,
  useGetCallerUserProfile,
  useIsAdmin,
  useMyRegistrations,
  useProductCounts,
  useProductsForCategory,
  useRegisterForProduct,
  useSaveCallerUserProfile,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

const CATEGORIES = [
  {
    id: "Electronics",
    label: "Electronics",
    icon: Monitor,
    color: "oklch(0.6 0.2 230)",
  },
  { id: "Cars", label: "Cars", icon: Car, color: "oklch(0.72 0.19 55)" },
  {
    id: "Interior Designing",
    label: "Interior Designing",
    icon: Sofa,
    color: "oklch(0.65 0.18 310)",
  },
  {
    id: "Furniture",
    label: "Furniture",
    icon: Armchair,
    color: "oklch(0.62 0.15 145)",
  },
  {
    id: "Real Estate",
    label: "Real Estate",
    icon: Building2,
    color: "oklch(0.62 0.22 28)",
  },
];

const FALLBACK_PRODUCTS: Record<string, string[]> = {
  Electronics: [
    "Mobile",
    "Laptop",
    "TV",
    "Refrigerator",
    "AC",
    "Washing Machine",
    "Chimney",
    "Speakers",
  ],
  Cars: [
    "Hatchback",
    "Sedan",
    "SUV",
    "MUV",
    "Luxury Car",
    "Electric Car",
    "Sports Car",
    "Pickup Truck",
  ],
  "Interior Designing": [
    "Living Room",
    "Bedroom",
    "Kitchen",
    "Bathroom",
    "Home Office",
    "Dining Room",
    "Balcony",
    "Study Room",
  ],
  Furniture: [
    "Sofa",
    "Bed Frame",
    "Dining Table",
    "Wardrobe",
    "Bookshelf",
    "Office Chair",
    "Coffee Table",
    "TV Unit",
  ],
  "Real Estate": [
    "1BHK Apartment",
    "2BHK Apartment",
    "3BHK Apartment",
    "Villa",
    "Plot",
    "Commercial Space",
    "Studio Flat",
    "Penthouse",
  ],
};

const MAX_SLOTS = 20;

function getBarColor(count: number): string {
  if (count >= MAX_SLOTS) return "oklch(0.55 0.22 28)";
  if (count >= 15) return "oklch(0.72 0.19 55)";
  if (count >= 10) return "oklch(0.75 0.18 100)";
  return "oklch(0.62 0.18 145)";
}

type Page = "home" | "my-registrations" | "admin";

// ===== PROFILE SETUP MODAL =====
function ProfileSetupModal({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success("Welcome to Letzclub!");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        data-ocid="profile.dialog"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="h-1 -mt-6 -mx-6 mb-6 rounded-t-2xl bg-gradient-to-r from-primary to-accent" />
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <User size={18} className="text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Welcome!
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Enter your name to complete your profile setup.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="profileName"
              className="text-sm font-medium text-foreground"
            >
              Your Name
            </Label>
            <Input
              id="profileName"
              data-ocid="profile.name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              autoFocus
              className="bg-muted border-border focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            data-ocid="profile.submit_button"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground font-bold"
          >
            {saveProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Get Started
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ===== REGISTRATION MODAL =====
interface RegModalProps {
  product: string;
  category: string;
  onClose: () => void;
}

function RegistrationModal({ product, category, onClose }: RegModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const register = useRegisterForProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !phone.trim() ||
      !location.trim() ||
      !requirements.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await register.mutateAsync({
        category,
        product,
        name,
        phone,
        location,
        requirements,
      });
      setSubmitted(true);
      toast.success(`Registered for ${product}!`);
      setTimeout(onClose, 1500);
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const cat = CATEGORIES.find((c) => c.id === category);

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
        data-ocid="register.dialog"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(to right, ${cat?.color}, oklch(0.75 0.19 55))`,
          }}
        />
        <div className="p-6">
          <button
            type="button"
            data-ocid="register.close_button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
          <div className="mb-5">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: cat?.color }}
            >
              {category}
            </span>
            <h2 className="font-display text-2xl font-bold text-foreground mt-0.5">
              {product}
            </h2>
            <p className="text-sm text-muted-foreground">
              Fill in your details to register interest
            </p>
          </div>
          {submitted ? (
            <motion.div
              data-ocid="register.success_state"
              className="flex flex-col items-center py-8 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 size={52} className="text-green-400 mb-3" />
              <p className="font-display text-xl font-bold text-foreground">
                Registered!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your interest has been recorded.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="reg-name"
                  data-ocid="register.name_input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="reg-phone"
                  data-ocid="register.phone_input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  type="tel"
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-location" className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="reg-location"
                  data-ocid="register.location_input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Area"
                  className="bg-muted border-border focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-req" className="text-sm font-medium">
                  Requirements
                </Label>
                <Textarea
                  id="reg-req"
                  data-ocid="register.requirements_textarea"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe what you're looking for..."
                  rows={3}
                  className="bg-muted border-border focus:border-primary resize-none"
                />
              </div>
              <Button
                type="submit"
                data-ocid="register.submit_button"
                disabled={register.isPending}
                className="w-full bg-primary text-primary-foreground font-bold text-base py-5 rounded-xl mt-1"
              >
                {register.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {register.isPending ? "Registering..." : "Register Interest"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== PRODUCT CARD =====
interface ProductCardProps {
  product: string;
  category: string;
  count: number;
  index: number;
  onRegister: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

function ProductCard({
  product,
  category,
  count,
  index,
  onRegister,
  isAuthenticated,
  onAuthRequired,
}: ProductCardProps) {
  const cat = CATEGORIES.find((c) => c.id === category);
  const Icon = cat?.icon ?? Monitor;
  const isFull = count >= MAX_SLOTS;
  const pct = Math.min((count / MAX_SLOTS) * 100, 100);
  const barColor = getBarColor(count);

  const handleClick = () => {
    if (isFull) return;
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    onRegister();
  };

  return (
    <motion.div
      data-ocid={`product.card.${index}`}
      className={`product-card rounded-2xl p-5 flex flex-col gap-3 ${isFull ? "is-full" : "cursor-pointer"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            Product
          </p>
          <h3 className="font-display text-lg font-bold text-foreground leading-tight truncate">
            {product}
          </h3>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ml-3"
          style={{ background: `${cat?.color}20` }}
        >
          <Icon size={20} style={{ color: cat?.color }} />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          <span className="text-foreground font-bold text-base">{count}</span>
          <span className="text-muted-foreground"> / {MAX_SLOTS}</span>
        </span>
        {isFull ? (
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
            FULL
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {MAX_SLOTS - count} slots left
          </span>
        )}
      </div>

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "oklch(0.22 0.02 258)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            delay: index * 0.05 + 0.2,
            duration: 0.6,
            ease: "easeOut",
          }}
        />
      </div>

      <Button
        data-ocid="register.open_modal_button"
        disabled={isFull}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={`w-full font-bold text-sm rounded-xl py-2 ${
          isFull
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-white hover:opacity-90"
        }`}
      >
        {isFull ? "Fully Booked" : "Register Interest"}
      </Button>
    </motion.div>
  );
}

// ===== HOME PAGE =====
function HomePage({
  isAuthenticated,
  onAuthRequired,
}: { isAuthenticated: boolean; onAuthRequired: () => void }) {
  const [activeCategory, setActiveCategory] = useState("Electronics");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data: products = [], isLoading: productsLoading } =
    useProductsForCategory(activeCategory);
  const displayProducts =
    products.length > 0 ? products : (FALLBACK_PRODUCTS[activeCategory] ?? []);
  const { data: counts = {}, isLoading: countsLoading } = useProductCounts(
    activeCategory,
    displayProducts,
  );

  const isLoading = productsLoading || countsLoading;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Tabs */}
      <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              type="button"
              data-ocid={`categories.tab.${i + 1}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "text-white shadow-glow"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              style={isActive ? { background: cat.color } : {}}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <motion.div
        key={activeCategory}
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {(() => {
          const cat = CATEGORIES.find((c) => c.id === activeCategory)!;
          const Icon = cat.icon;
          return (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${cat.color}20` }}
              >
                <Icon size={22} style={{ color: cat.color }} />
              </div>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground">
                  {activeCategory}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Register your interest — max {MAX_SLOTS} slots per product
                </p>
              </div>
            </>
          );
        })()}
      </motion.div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayProducts.map((product, i) => (
            <ProductCard
              key={product}
              product={product}
              category={activeCategory}
              count={counts[product] ?? 0}
              index={i + 1}
              onRegister={() => setSelectedProduct(product)}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <RegistrationModal
            product={selectedProduct}
            category={activeCategory}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// ===== MY REGISTRATIONS PAGE =====
function MyRegistrationsPage() {
  const { data: registrations = [], isLoading } = useMyRegistrations();

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-black text-foreground">
          My Registrations
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track all your product interest submissions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="my_registrations.loading_state">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div
          data-ocid="my_registrations.empty_state"
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-display text-xl font-bold text-foreground mb-1">
            No registrations yet
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            You haven't registered interest in any product yet. Browse
            categories to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="my_registrations.table">
          {registrations.map((reg, idx) => {
            const cat = CATEGORIES.find((c) => c.id === reg.category);
            const Icon = cat?.icon ?? Monitor;
            return (
              <motion.div
                key={String(reg.id)}
                data-ocid={`my_registrations.item.${idx + 1}`}
                className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: `${cat?.color}20` }}
                >
                  <Icon size={18} style={{ color: cat?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-foreground">
                      {reg.product}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${cat?.color}20`,
                        color: cat?.color,
                      }}
                    >
                      {reg.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {reg.location}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(reg.timestamp)}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// ===== ADMIN DASHBOARD =====
function AdminDashboard() {
  const { data: registrations = [], isLoading } = useAllRegistrations();
  const [catFilter, setCatFilter] = useState("all");

  const filtered =
    catFilter === "all"
      ? registrations
      : registrations.filter((r) => r.category === catFilter);

  const formatDate = (ts: bigint) => {
    const d = new Date(Number(ts) / 1_000_000);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    } as Intl.DateTimeFormatOptions);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-black text-foreground flex items-center gap-2">
            <ClipboardList size={28} className="text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All customer registrations
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5">
          <span className="font-bold text-primary text-lg">
            {filtered.length}
          </span>
          <span className="text-sm text-muted-foreground">registrations</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          type="button"
          onClick={() => setCatFilter("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            catFilter === "all"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCatFilter(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              catFilter === cat.id
                ? "text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            style={catFilter === cat.id ? { background: cat.color } : {}}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div data-ocid="admin.loading_state" className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          data-ocid="admin.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <ClipboardList size={28} className="text-muted-foreground" />
          </div>
          <p className="font-display text-xl font-bold text-foreground mb-1">
            No registrations found
          </p>
          <p className="text-sm text-muted-foreground">
            No registrations match the selected filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div
            data-ocid="admin.table"
            className="hidden md:block rounded-2xl border border-border overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {[
                    "#",
                    "Name",
                    "Phone",
                    "Category",
                    "Product",
                    "Location",
                    "Requirements",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3.5 font-semibold text-muted-foreground uppercase tracking-wider text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg: Registration, idx: number) => {
                  const cat = CATEGORIES.find((c) => c.id === reg.category);
                  return (
                    <motion.tr
                      key={String(reg.id)}
                      data-ocid={`admin.row.${idx + 1}`}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-foreground">
                        {reg.name}
                      </td>
                      <td className="px-4 py-3.5 text-foreground">
                        {reg.phone}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: `${cat?.color}20`,
                            color: cat?.color,
                          }}
                        >
                          {reg.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-foreground font-medium">
                        {reg.product}
                      </td>
                      <td className="px-4 py-3.5 text-foreground max-w-[140px] truncate">
                        {reg.location}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-2">{reg.requirements}</span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(reg.timestamp)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((reg: Registration, idx: number) => {
              const cat = CATEGORIES.find((c) => c.id === reg.category);
              return (
                <motion.div
                  key={String(reg.id)}
                  data-ocid={`admin.row.${idx + 1}`}
                  className="rounded-xl border border-border bg-card p-4 space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {reg.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: `${cat?.color}20`,
                        color: cat?.color,
                      }}
                    >
                      {reg.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {reg.phone} · {reg.product}
                  </p>
                  <p className="text-sm text-foreground">{reg.location}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reg.requirements}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(reg.timestamp)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

// ===== MAIN APP =====
function LetzclubApp() {
  const [page, setPage] = useState<Page>("home");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const { data: isAdmin = false } = useIsAdmin();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: any) {
      if (err?.message === "User is already authenticated") {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setPage("home");
    toast.success("Logged out successfully");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="noise-bg min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, oklch(0.25 0.06 230 / 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.20 0.04 28 / 0.15), transparent)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3.5">
              {/* Logo */}
              <button
                type="button"
                data-ocid="nav.home_link"
                onClick={() => setPage("home")}
                className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                  <Zap size={20} className="text-white" fill="white" />
                </div>
                <div>
                  <div className="font-display text-xl font-black tracking-tight text-foreground leading-none">
                    Letzclub
                  </div>
                  <div className="text-xs text-muted-foreground tracking-widest uppercase">
                    Your Future Awaits
                  </div>
                </div>
              </button>

              {/* Nav + Auth */}
              <div className="flex items-center gap-2">
                {isAuthenticated && (
                  <button
                    type="button"
                    data-ocid="nav.my_registrations_link"
                    onClick={() => setPage("my-registrations")}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      page === "my-registrations"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <ClipboardList size={13} />
                    My Registrations
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    data-ocid="nav.admin_link"
                    onClick={() => setPage("admin")}
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      page === "admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <ClipboardList size={13} />
                    Admin
                  </button>
                )}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60">
                      <User size={13} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">
                        {userProfile?.name ?? "User"}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-ocid="nav.signout_button"
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                    >
                      <LogOut size={13} />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="nav.signin_button"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-glow hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LogIn size={14} />
                    )}
                    {isLoggingIn ? "Signing in..." : "Sign In"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Auth prompt banner */}
        <AnimatePresence>
          {showAuthPrompt && (
            <motion.div
              className="bg-primary/10 border-b border-primary/30 py-2 px-4 flex items-center justify-between gap-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <p className="text-sm text-foreground font-medium">
                Sign in to register your interest in products
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthPrompt(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile nav for authenticated users */}
        {isAuthenticated && (
          <div className="sm:hidden flex gap-2 px-4 pt-3 pb-1 bg-background/80 backdrop-blur-sm border-b border-border/30">
            <button
              type="button"
              data-ocid="nav.my_registrations_link"
              onClick={() => setPage("my-registrations")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                page === "my-registrations"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              <ClipboardList size={12} /> My Registrations
            </button>
            {isAdmin && (
              <button
                type="button"
                data-ocid="nav.admin_link"
                onClick={() => setPage("admin")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  page === "admin"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <ClipboardList size={12} /> Admin
              </button>
            )}
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {page === "home" && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <HomePage
                  isAuthenticated={isAuthenticated}
                  onAuthRequired={() => setShowAuthPrompt(true)}
                />
              </motion.div>
            )}
            {page === "my-registrations" && isAuthenticated && (
              <motion.div
                key="my-reg"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <MyRegistrationsPage />
              </motion.div>
            )}
            {page === "admin" && isAdmin && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <AdminDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap size={13} className="text-primary" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-foreground">
                Letzclub
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && <ProfileSetupModal onComplete={() => {}} />}

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LetzclubApp />
    </QueryClientProvider>
  );
}
