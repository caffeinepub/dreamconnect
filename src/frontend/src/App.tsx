import { CustomSlotsSection } from "@/components/CustomSlots";
import {
  LocationSelector,
  type SelectedLocation,
} from "@/components/LocationSelector";
import { ProviderHomeScreen } from "@/components/ProviderView";
import { SlotDetailPage } from "@/components/SlotDetailPage";
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
  AlertTriangle,
  Armchair,
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  FlameKindling,
  Flower2,
  HardHat,
  Heart,
  Home,
  IndianRupee,
  Leaf,
  Loader2,
  LogOut,
  MapPin,
  Monitor,
  Package,
  PartyPopper,
  PawPrint,
  Phone,
  Plane,
  Printer,
  Search,
  Shield,
  Smartphone,
  Sofa,
  Stethoscope,
  Tractor,
  TrendingUp,
  Trophy,
  Truck,
  User,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type PublicRegistration,
  type Registration,
  type ServiceProviderProfile,
  useAllRegistrations,
  useGetCallerUserProfile,
  useIsAdmin,
  useMyRegistrations,
  useMyServiceProviderProfile,
  useProductCounts,
  useProductsForCategory,
  usePublicRegistrationsForCategory,
  useRegisterForProduct,
  useRegisterServiceProvider,
  useSaveCallerUserProfile,
} from "./hooks/useQueries";
import {
  LOCATION_LEVELS,
  STATE_CAPITALS,
  formatLocation,
  matchesLocation,
} from "./utils/locationData";

const queryClient = new QueryClient();

const CATEGORIES = [
  {
    id: "Electronics & Appliances",
    label: "Electronics & Appliances",
    icon: Monitor,
    color: "oklch(0.6 0.2 230)",
  },
  {
    id: "Vehicles",
    label: "Vehicles",
    icon: Car,
    color: "oklch(0.72 0.19 55)",
  },
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
  { id: "Gym", label: "Gym", icon: Dumbbell, color: "oklch(0.62 0.22 18)" },
  {
    id: "Courses",
    label: "Courses",
    icon: BookOpen,
    color: "oklch(0.65 0.18 160)",
  },
  {
    id: "Beauty",
    label: "Beauty",
    icon: Flower2,
    color: "oklch(0.68 0.18 350)",
  },
  {
    id: "Construction Materials",
    label: "Construction",
    icon: HardHat,
    color: "oklch(0.68 0.17 70)",
  },
  {
    id: "Business Services",
    label: "Business",
    icon: Briefcase,
    color: "oklch(0.60 0.15 250)",
  },
  {
    id: "Food",
    label: "Food",
    icon: CalendarDays,
    color: "oklch(0.70 0.20 50)",
  },
  {
    id: "Events & Entertainment",
    label: "Events",
    icon: PartyPopper,
    color: "oklch(0.65 0.22 300)",
  },
  {
    id: "Sports & Recreation",
    label: "Sports",
    icon: Trophy,
    color: "oklch(0.64 0.22 145)",
  },
  {
    id: "Pets & Animals",
    label: "Pets",
    icon: PawPrint,
    color: "oklch(0.68 0.18 80)",
  },
  {
    id: "Printing & Stationery",
    label: "Printing",
    icon: Printer,
    color: "oklch(0.60 0.15 240)",
  },
  {
    id: "Marketing",
    label: "Marketing",
    icon: TrendingUp,
    color: "oklch(0.65 0.22 200)",
  },
  {
    id: "Medical",
    label: "Medical",
    icon: Stethoscope,
    color: "oklch(0.62 0.20 165)",
  },
  {
    id: "Agriculture",
    label: "Agriculture",
    icon: Tractor,
    color: "oklch(0.65 0.18 140)",
  },
  {
    id: "Purchase Machinery",
    label: "Machinery",
    icon: Wrench,
    color: "oklch(0.60 0.16 250)",
  },
  {
    id: "Other",
    label: "Other",
    icon: FlameKindling,
    color: "oklch(0.62 0.15 280)",
  },
];

// Vehicle subcategory definitions with Lucide icons (Cars and Bikes listed first)
const VEHICLE_SUBCATEGORIES = [
  { label: "Cars", prefix: "Car -", icon: Car, color: "oklch(0.72 0.19 55)" },
  {
    label: "Bikes & Scooters",
    prefix: "Bike -",
    icon: Bike,
    color: "oklch(0.62 0.22 18)",
  },
  {
    label: "Trucks & Commercial",
    prefix: "Truck -",
    icon: Truck,
    color: "oklch(0.60 0.15 250)",
  },
  { label: "Buses", prefix: "Bus -", icon: Bus, color: "oklch(0.62 0.22 28)" },
  {
    label: "Heavy Equipment",
    prefix: "Heavy Equipment -",
    icon: HardHat,
    color: "oklch(0.68 0.17 70)",
  },
  {
    label: "Three Wheelers",
    prefix: "Three Wheeler -",
    icon: Tractor,
    color: "oklch(0.65 0.15 290)",
  },
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
    "Home",
    "Restaurant/Cafe",
    "Office",
    "Showroom",
    "Salon/Spa/Beauty Parlour",
    "Gym/Fitness Studio",
  ],
  Furniture: ["Home Furniture", "Office Furniture", "Restaurant Furniture"],
  "Real Estate": [],
  Gym: [],
  Courses: [],
  Beauty: ["Makeup", "Beauty Products"],
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
    "Ceiling",
  ],
  "Business Services": [
    "Accounting",
    "HR",
    "App/Web Development",
    "Printing",
    "Security",
    "Cleaning",
    "Consulting",
  ],
  Food: ["Cake", "Home Made Foods"],
  "Events & Entertainment": [
    "DJ & Music",
    "Photography & Videography",
    "Decorations",
    "Anchor & Emcee",
  ],
  "Sports & Recreation": [],
  "Pets & Animals": ["Dogs", "Birds", "Fish & Aquarium"],
  "Printing & Stationery": [
    "Business Cards",
    "Banners & Flex",
    "Brochures",
    "Letterheads",
    "Office Stationery",
    "Custom T-Shirts",
    "Wedding Cards",
    "Packaging",
    "Labels & Stickers",
    "Photo Printing",
  ],
  Marketing: [
    "Fashion Influencers",
    "Beauty Influencers",
    "Food Influencers",
    "Fitness Influencers",
    "Travel Influencers",
    "Tech Influencers",
    "Lifestyle Influencers",
    "Parenting Influencers",
    "Finance Influencers",
    "Education Influencers",
  ],
  Medical: [],
  Agriculture: [],
  "Purchase Machinery": [],
  Other: [],
};

const MAX_SLOTS = 20;

const CUSTOM_SLOT_ONLY_CATEGORIES = [
  "Real Estate",
  "Gym",
  "Courses",
  "Sports & Recreation",
  "Medical",
  "Agriculture",
  "Purchase Machinery",
  "Other",
];

function getBarColor(count: number): string {
  if (count >= MAX_SLOTS) return "oklch(0.55 0.22 28)";
  if (count >= 15) return "oklch(0.72 0.19 55)";
  if (count >= 10) return "oklch(0.75 0.18 100)";
  return "oklch(0.62 0.18 145)";
}

// ===== MONTH TIMELINE HELPERS =====
function generateMonthTabsHome(count = 6) {
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
const HOME_MONTH_TABS = generateMonthTabsHome(6);

function getMemberMonthHome(r: {
  location: string;
  product: string;
  requirements?: string;
}): {
  year: number;
  month: number;
} {
  const now = new Date();
  const req = r.requirements || "";

  // Try to parse [Month: YYYY-MM] tag first (most reliable)
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
    const d = new Date(`${dateMatch[2]} ${dateMatch[1]} ${dateMatch[3]}`);
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

  // Default to current month
  return { year: now.getFullYear(), month: now.getMonth() };
}

type Page = "home" | "my-registrations" | "admin";

// ===== WELCOME / AUTH SCREEN =====
function WelcomeScreen({
  onLogin,
  isLoggingIn,
}: { onLogin: () => void; isLoggingIn: boolean }) {
  const [faqOpen, setFaqOpen] = useState(false);

  const perks = [
    {
      icon: Smartphone,
      text: "Secure login using your phone or laptop",
    },
    {
      icon: Shield,
      text: "No password to remember — ever",
    },
    {
      icon: CheckCircle2,
      text: "Works on any device you verify once",
    },
  ];

  const faqSteps = [
    {
      num: "1",
      title: "First time?",
      body: 'Tap "Continue with your device" below and follow the on-screen steps. It takes about 30 seconds.',
    },
    {
      num: "2",
      title: "Using a new device?",
      body: 'On the next screen, choose "Use existing anchor" and enter your recovery phrase to get back in.',
    },
    {
      num: "3",
      title: "Save your recovery phrase",
      body: "After setup, save the recovery phrase in your Notes app or a safe place. You'll need it if you ever switch devices.",
    },
  ];

  return (
    <div
      data-ocid="welcome.page"
      className="noise-bg min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
    >
      {/* Background gradients */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.25 0.06 230 / 0.35), transparent), radial-gradient(ellipse 60% 50% at 80% 100%, oklch(0.20 0.05 310 / 0.2), transparent)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm flex flex-col items-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow mb-4">
            <Zap size={32} className="text-white" fill="white" />
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight text-foreground">
            Letzclub
          </h1>
          <p className="text-muted-foreground text-sm mt-1 tracking-widest uppercase">
            Your Future Awaits
          </p>
        </div>

        {/* Main card */}
        <div className="w-full rounded-3xl border border-border/60 bg-card/80 backdrop-blur-md p-7 shadow-2xl">
          <h2 className="font-display text-2xl font-extrabold text-foreground mb-1 text-center">
            Join Letzclub
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-7 leading-relaxed">
            Register your interest in electronics, cars,
            <br />
            furniture &amp; more — all in one place.
          </p>

          {/* Big CTA button */}
          <Button
            data-ocid="welcome.signin_button"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white shadow-glow hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              "Continue with your device →"
            )}
          </Button>

          {/* Perk bullets */}
          <ul className="mt-6 space-y-3">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <li key={perk.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80">
                    {perk.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* FAQ accordion */}
        <div className="w-full mt-4 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <button
            type="button"
            data-ocid="welcome.faq_toggle"
            onClick={() => setFaqOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>How to use on a new device?</span>
            <motion.div
              animate={{ rotate: faqOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {faqOpen && (
              <motion.div
                key="faq-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
                  {faqSteps.map((step) => (
                    <div key={step.num} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {step.num}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground mt-6 text-center">
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
      </motion.div>
    </div>
  );
}

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
            One last thing!
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          What should we call you?
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
            className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
          >
            {saveProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Let&apos;s go!
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ===== REQUIREMENTS PLACEHOLDER HELPER =====
function getRequirementsPlaceholder(category: string, product: string): string {
  switch (category) {
    case "Vehicles":
      return `e.g. I am planning to buy a ${product.split(" - ")[1] || product} before 21st March, budget ₹8 lakhs, prefer automatic transmission`;
    case "Real Estate":
      return "e.g. Looking to buy a 2BHK flat by end of April, budget ₹45 lakhs, preferred area is Koramangala";
    case "Electronics & Appliances":
      return `e.g. Need a ${product} before summer, budget ₹35,000, prefer energy-saving 5-star rating`;
    case "Gym":
      return `e.g. Need a ${product} by next month, budget ₹20,000, prefer commercial grade`;
    case "Courses":
      return `e.g. Looking to join a ${product} course before March end, budget ₹5,000, prefer weekend batches`;
    case "Beauty":
      return "e.g. Looking for bridal makeup on April 15th, budget ₹15,000";
    case "Food":
      return "e.g. Need 50 pieces of chocolate cake for birthday party on April 15th, budget ₹3,000";
    case "Interior Designing":
      return "e.g. Need complete living room design for 1500 sqft flat, budget ₹2 lakhs, by May";
    case "Furniture":
      return `e.g. Need a ${product} before next month, budget ₹30,000, prefer solid wood`;
    case "Construction Materials":
      return `e.g. Need ${product} for foundation work by next week, quantity 500 units`;
    case "Business Services":
      return `e.g. Need ${product} services by March 31st, budget ₹5,000 per month`;
    default:
      return "Describe what you're looking for, your budget, and expected timeline...";
  }
}

// ===== REGISTRATION MODAL =====
interface RegModalProps {
  product: string;
  category: string;
  onClose: () => void;
  prefilledLocation?: string;
  onEditLocation?: () => void;
  selectedMonth?: { label: string; year: number; month: number };
}

// Categories that default to 'specific' date (event/product-based)
const SPECIFIC_DATE_CATEGORIES = new Set([
  "Food",
  "Events & Entertainment",
  "Beauty",
]);

function getDefaultDateMode(category: string): "specific" | "flexible" {
  return SPECIFIC_DATE_CATEGORIES.has(category) ? "specific" : "flexible";
}

function getDefaultFlexibleTimeline(_monthIdx: number): string {
  // Since the month is already set by the tab, the flexible option
  // just describes urgency within that month.
  return "Anytime this month";
}

function getMonthLastDay(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return String(lastDay).padStart(2, "0");
}

function RegistrationModal({
  product,
  category,
  onClose,
  prefilledLocation,
  onEditLocation,
  selectedMonth,
}: RegModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(prefilledLocation ?? "");
  const [requirements, setRequirements] = useState("");
  const [dateMode, setDateMode] = useState<"specific" | "flexible">(() =>
    getDefaultDateMode(category),
  );

  // Calculate the index of the selected month relative to current month
  const selectedMonthIdx = selectedMonth
    ? (() => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();
        return (
          (selectedMonth.year - curYear) * 12 + (selectedMonth.month - curMonth)
        );
      })()
    : 0;

  const [flexibleTimeline, setFlexibleTimeline] = useState<string>(() =>
    getDefaultFlexibleTimeline(selectedMonthIdx),
  );

  // Initialize date to first day of selectedMonth if in specific mode
  const initialDate =
    selectedMonth && getDefaultDateMode(category) === "specific"
      ? `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, "0")}-01`
      : "";
  const [requirementDate, setRequirementDate] = useState(initialDate);
  const [submitted, setSubmitted] = useState(false);
  const register = useRegisterForProduct();

  const doRegister = async () => {
    // Compute which month this registration belongs to.
    // The month bucket is ALWAYS determined by the selected month tab.
    // The flexible timeline option is only stored as descriptive text — it does NOT change the month.
    const now = new Date();
    // Month bucket is ALWAYS the selected tab — never overridden by the date picker
    const purchaseYear = selectedMonth?.year ?? now.getFullYear();
    const purchaseMonth = selectedMonth
      ? selectedMonth.month + 1
      : now.getMonth() + 1;
    const monthTag = `[Month: ${purchaseYear}-${String(purchaseMonth).padStart(2, "0")}]`;

    const fullRequirements =
      dateMode === "flexible"
        ? `${requirements} [Timeline: ${flexibleTimeline}] ${monthTag}`
        : requirementDate
          ? `${requirements} [Expected by: ${new Date(requirementDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}] ${monthTag}`
          : `${requirements} ${monthTag}`;
    try {
      await register.mutateAsync({
        category,
        product,
        name,
        phone,
        location,
        requirements: fullRequirements,
      });
      setSubmitted(true);
      toast.success(`Registered for ${product}!`);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err);
      console.error("Registration error:", raw);
      // Extract the meaningful trap message from verbose ICP error strings
      const trapMatch =
        raw.match(/ic0\.trap with message:\s*(.+?)(?:\s*\n|$)/i) ||
        raw.match(/message['\":\s]+([^'"]{5,120})/i);
      const msg = trapMatch ? trapMatch[1].trim() : raw;
      if (msg.includes("Not connected") || msg.includes("actor")) {
        toast.error("Still connecting, please wait a moment and try again.");
      } else {
        toast.error(
          msg.length < 160 ? msg : "Registration failed. Please try again.",
        );
      }
    }
  };

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
    // Payments temporarily disabled for testing
    await doRegister();
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
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
          >
            ✕
          </button>
          <div className="mb-5">
            <span
              className="text-xs font-bold uppercase tracking-widest"
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
                {prefilledLocation ? (
                  <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-muted/60 border border-border text-sm text-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin
                        size={13}
                        className="text-primary flex-shrink-0"
                      />
                      {prefilledLocation}
                    </span>
                    {onEditLocation && (
                      <button
                        type="button"
                        onClick={onEditLocation}
                        className="text-xs text-primary hover:underline ml-2 flex-shrink-0"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ) : (
                  <Input
                    id="reg-location"
                    data-ocid="register.location_input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City / Area"
                    className="bg-muted border-border focus:border-primary"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Expected Date / Timeline
                </Label>
                {/* Mode toggle — styled like category/month tabs */}
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    data-ocid="register.date_mode.specific_toggle"
                    onClick={() => setDateMode("specific")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                      dateMode === "specific"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted text-muted-foreground border-transparent hover:border-border"
                    }`}
                  >
                    📅 Specific Date
                  </button>
                  <button
                    type="button"
                    data-ocid="register.date_mode.flexible_toggle"
                    onClick={() => setDateMode("flexible")}
                    className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                      dateMode === "flexible"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted text-muted-foreground border-transparent hover:border-border"
                    }`}
                  >
                    🗓️ Flexible Timeline
                  </button>
                </div>
                {dateMode === "specific" ? (
                  <Input
                    id="reg-date"
                    data-ocid="register.date_input"
                    type="date"
                    value={requirementDate}
                    onChange={(e) => setRequirementDate(e.target.value)}
                    className="bg-muted border-border focus:border-primary"
                    min={
                      selectedMonth
                        ? `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, "0")}-01`
                        : new Date().toISOString().split("T")[0]
                    }
                    max={
                      selectedMonth
                        ? `${selectedMonth.year}-${String(selectedMonth.month + 1).padStart(2, "0")}-${getMonthLastDay(selectedMonth.year, selectedMonth.month)}`
                        : undefined
                    }
                  />
                ) : (
                  <select
                    data-ocid="register.flexible_timeline_select"
                    value={flexibleTimeline}
                    onChange={(e) => setFlexibleTimeline(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  >
                    <option value="Early in the month">
                      Early in the month
                    </option>
                    <option value="Mid month">Mid month</option>
                    <option value="End of the month">End of the month</option>
                    <option value="Anytime this month">
                      Anytime this month
                    </option>
                    <option value="Flexible / No rush">
                      Flexible / No rush
                    </option>
                  </select>
                )}
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
                  placeholder={getRequirementsPlaceholder(category, product)}
                  rows={3}
                  className="bg-muted border-border focus:border-primary resize-none"
                />
              </div>
              <div className="rounded-xl bg-muted/50 border border-border px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
                <IndianRupee size={12} className="text-primary flex-shrink-0" />
                <span>
                  <strong className="text-amber-400">
                    Payments temporarily disabled for testing. Registration is
                    free.
                  </strong>
                </span>
              </div>
              <Button
                type="submit"
                data-ocid="register.submit_button"
                disabled={register.isPending || !register.isActorReady}
                className="w-full bg-primary text-primary-foreground font-bold text-base py-5 rounded-xl mt-1"
              >
                {register.isPending || !register.isActorReady ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {!register.isActorReady
                  ? "Connecting..."
                  : register.isPending
                    ? "Registering..."
                    : "Register (Free - Testing)"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== CUSTOM SLOT ONLY VIEW =====
interface CustomSlotOnlyViewProps {
  activeCategory: string;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  externalCreateOpen: boolean;
  setExternalCreateOpen: (open: boolean) => void;
  activeMonth?: { year: number; month: number; label: string };
}

function CustomSlotOnlyView({
  activeCategory,
  isAuthenticated,
  onAuthRequired,
  externalCreateOpen,
  setExternalCreateOpen,
  activeMonth,
}: CustomSlotOnlyViewProps) {
  const catInfo = CATEGORIES.find((c) => c.id === activeCategory);
  const CatIcon = catInfo?.icon ?? FlameKindling;
  const catColor = catInfo?.color ?? "oklch(0.62 0.15 280)";

  const getContent = () => {
    switch (activeCategory) {
      case "Real Estate":
        return {
          heading: "Not listed in Real Estate?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Looking for 2BHK flat in your location",
              detail: "Type: 1BHK, 2BHK  •  Price range: ₹XX Lakhs",
            },
            {
              title: "Looking for Duplex in your location",
              detail: "Price range: ₹XX Lakhs",
            },
            {
              title: "Looking for G+1 in your location",
              detail: "Price range: ₹XX Lakhs",
            },
          ],
        };
      case "Gym":
        return {
          heading: "Not listed in Gym?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Planning to join a gym in your location",
              detail: "Looking for affordable membership options",
            },
          ],
        };
      case "Courses":
        return {
          heading: "Not listed in Courses?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Planning to join Java Full Stack course",
              detail: "Looking for weekend/weekday batches",
            },
          ],
        };
      case "Sports & Recreation":
        return {
          heading: "Not listed in Sports & Recreation?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Looking for cricket partners in your location",
              detail: "Weekend matches preferred",
            },
          ],
        };
      case "Medical":
        return {
          heading: "Not listed in Medical?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Looking for full body checkup in Hyderabad",
              detail: "Within 2 weeks",
            },
          ],
        };
      case "Agriculture":
        return {
          heading: "Not listed in Agriculture?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Looking for tractor rental in Warangal district",
              detail: "Within a month",
            },
          ],
        };
      case "Purchase Machinery":
        return {
          heading: "Not listed in Purchase Machinery?",
          subheading:
            "Create a custom slot and connect with others who need the same service.",
          examples: [
            {
              title: "Looking to buy a CNC machine in Pune",
              detail: "Budget ₹5,00,000",
            },
          ],
        };
      default:
        return {
          heading: "Not finding your category here?",
          subheading:
            "Create a custom slot for what you need — others will join you.",
          examples: [],
        };
    }
  };

  const { heading, subheading, examples } = getContent();

  return (
    <motion.div
      key={`custom-slot-${activeCategory}`}
      className="flex flex-col items-center py-12 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${catColor}20` }}
      >
        <CatIcon size={28} style={{ color: catColor }} />
      </div>

      {isAuthenticated ? (
        <button
          type="button"
          data-ocid="custom_slot_only.create_slot_button"
          onClick={() => setExternalCreateOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-glow transition-all hover:opacity-90 active:scale-95 mb-5"
          style={{ background: catColor }}
        >
          Create Custom Slot
        </button>
      ) : (
        <button
          type="button"
          data-ocid="custom_slot_only.create_slot_button"
          onClick={onAuthRequired}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-glow transition-all hover:opacity-90 active:scale-95 mb-5"
          style={{ background: catColor }}
        >
          Sign In to Create a Slot
        </button>
      )}

      <h3 className="font-display text-2xl font-bold text-foreground mb-2">
        {heading}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        {subheading}
      </p>

      {examples.length > 0 && (
        <div className="w-full max-w-lg mb-8 space-y-3 text-left">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Example Slots
          </p>
          {examples.map((ex, i) => (
            <div
              key={ex.title}
              className="relative rounded-xl border border-border bg-card p-4 shadow-sm"
              data-ocid={`custom_slot_only.example.${i + 1}`}
            >
              <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Example
              </span>
              <p className="font-semibold text-foreground text-sm pr-16">
                {ex.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{ex.detail}</p>
            </div>
          ))}
        </div>
      )}

      <div className="w-full mt-12">
        <CustomSlotsSection
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          externalCreateOpen={externalCreateOpen}
          onExternalCreateClose={() => setExternalCreateOpen(false)}
          categoryId={activeCategory}
          activeMonth={activeMonth}
        />
      </div>
    </motion.div>
  );
}

// ===== MEMBER AVATAR STACK =====
function MemberAvatarStack({
  count,
  names = [],
}: { count: number; names?: string[] }) {
  if (count === 0) return null;

  const colors = [
    "oklch(0.65 0.18 230)",
    "oklch(0.65 0.18 310)",
    "oklch(0.65 0.18 145)",
    "oklch(0.65 0.18 55)",
  ];

  const displayCount = Math.min(4, count);
  const remaining = count - displayCount;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: displayCount }, (_, i) => i).map((i) => {
          const name = names[i] || `M${i + 1}`;
          const initial = name.charAt(0).toUpperCase();
          const color = colors[i % colors.length];
          return (
            <div
              key={`avatar-${i}`}
              className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: color, zIndex: displayCount - i }}
            >
              {initial}
            </div>
          );
        })}
        {remaining > 0 && (
          <div
            className="w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-[9px] font-bold bg-muted text-muted-foreground flex-shrink-0"
            style={{ zIndex: 0 }}
          >
            +{remaining}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {count} {count === 1 ? "member" : "members"}
      </span>
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
  onViewSlot: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

function ProductCard({
  product,
  category,
  count,
  index,
  onRegister,
  onViewSlot,
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

      <MemberAvatarStack count={count} />

      <div className="flex gap-2">
        <Button
          data-ocid="register.open_modal_button"
          disabled={isFull}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`flex-1 font-bold text-sm rounded-xl py-2 ${
            isFull
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-white hover:opacity-90"
          }`}
        >
          {isFull ? "Fully Booked" : "Register Interest"}
        </Button>
        {isAuthenticated && count > 0 && (
          <Button
            data-ocid="slot.view_slot_button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onViewSlot();
            }}
            className="rounded-xl border-border text-xs font-semibold px-3"
          >
            View Slot
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ===== HOME PAGE =====
interface SelectedSlot {
  category: string;
  product: string;
}

function HomePage({
  isAuthenticated,
  onAuthRequired,
}: { isAuthenticated: boolean; onAuthRequired: () => void }) {
  const [activeCategory, setActiveCategory] = useState(
    "Electronics & Appliances",
  );
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [viewSlot, setViewSlot] = useState<SelectedSlot | null>(null);

  const { data: products = [], isLoading: productsLoading } =
    useProductsForCategory(activeCategory);
  const displayProducts =
    products.length > 0 ? products : (FALLBACK_PRODUCTS[activeCategory] ?? []);
  const { data: counts = {}, isLoading: countsLoading } = useProductCounts(
    activeCategory,
    displayProducts,
  );
  const { data: myRegistrations = [] } = useMyRegistrations();

  const isLoading = productsLoading || countsLoading;

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [vehicleSubType, setVehicleSubType] = useState("all");
  const [externalCreateOpen, setExternalCreateOpen] = useState(false);
  const [activeHomeMonthIdx, setActiveHomeMonthIdx] = useState(0);

  const SEARCH_EXAMPLES = [
    "Try: AC Bangalore",
    "Try: Royal Enfield bikes",
    "Try: JCB equipment Hyderabad",
    "Try: Interior Design Mumbai",
    "Try: Cake Chennai",
    "Try: Fashion Influencers",
    "Try: Maruti Suzuki Car",
    "Try: Beauty Products Hyderabad",
  ];

  useEffect(() => {
    if (searchFocused || searchQuery) return;
    const timer = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SEARCH_EXAMPLES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [searchFocused, searchQuery]);

  // Auto-detect location or default to state capital; never block UI
  useEffect(() => {
    if (CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory)) {
      setLocationConfirmed(true);
      setSelectedLocation(null);
      return;
    }
    // Try saved location first
    const saved = sessionStorage.getItem(`letzclub_loc_${activeCategory}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedLocation(parsed);
        setLocationConfirmed(true);
        return;
      } catch {
        // fall through to default
      }
    }
    // Immediately apply a default so products show right away
    const defaultLoc: SelectedLocation = {
      state: "Telangana",
      district: "Hyderabad",
      city: "Hyderabad",
      area: "",
    };
    setSelectedLocation(defaultLoc);
    setLocationConfirmed(true);
    // Silently try GPS in background to refine to actual location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            );
            if (!resp.ok) return;
            const data = await resp.json();
            const address = data.address || {};
            const detectedState = address.state || address.state_district || "";
            const capital = STATE_CAPITALS[detectedState];
            if (capital) {
              const loc: SelectedLocation = {
                state: detectedState,
                district: capital.district,
                city: capital.city,
                area: "",
              };
              setSelectedLocation(loc);
              sessionStorage.setItem(
                `letzclub_loc_${activeCategory}`,
                JSON.stringify(loc),
              );
            }
          } catch {
            // keep default
          }
        },
        () => {
          // GPS denied or error — keep default
        },
        { timeout: 8000 },
      );
    }
  }, [activeCategory]);

  const { data: publicRegs = [] } =
    usePublicRegistrationsForCategory(activeCategory);

  // Month-filtered counts: count members per product for the active month tab only
  const activeMonthTab = HOME_MONTH_TABS[activeHomeMonthIdx];
  const monthFilteredCounts = useMemo(() => {
    const result: Record<string, number> = {};
    if (!activeMonthTab) return result;
    const filtered = publicRegs.filter((r: PublicRegistration) => {
      const m = getMemberMonthHome(r);
      return m.year === activeMonthTab.year && m.month === activeMonthTab.month;
    });
    for (const r of filtered) {
      result[r.product] = (result[r.product] ?? 0) + 1;
    }
    return result;
  }, [publicRegs, activeMonthTab]);

  // Location-based filtering
  const locationLevel = LOCATION_LEVELS[activeCategory] ?? "city";
  const locationFilteredProducts =
    locationConfirmed && selectedLocation && locationLevel !== "national"
      ? displayProducts.filter(
          (product) =>
            publicRegs.some(
              (r: PublicRegistration) =>
                r.product === product &&
                matchesLocation(r.location, selectedLocation, locationLevel),
            ) || (monthFilteredCounts[product] ?? 0) === 0, // show empty slots too as "Be the first"
        )
      : displayProducts;

  const searchFiltered = searchQuery.trim()
    ? locationFilteredProducts.filter((product) => {
        const q = searchQuery.trim().toLowerCase();
        // Check if search matches a category — if so, auto-show that category
        const matchesCategory = CATEGORIES.some(
          (c) => c.id.toLowerCase().includes(q) && c.id === activeCategory,
        );
        return (
          matchesCategory ||
          product.toLowerCase().includes(q) ||
          publicRegs.some(
            (r: PublicRegistration) =>
              r.product === product && r.location.toLowerCase().includes(q),
          )
        );
      })
    : locationFilteredProducts;

  // Helper: find the actual product slot to register for (auto-creates Slot 2 if full)
  const resolveSlotProduct = (baseProduct: string): string => {
    if ((counts[baseProduct] ?? 0) < MAX_SLOTS) return baseProduct;
    for (let i = 2; i <= 10; i++) {
      const candidate = `${baseProduct} (Slot ${i})`;
      if ((counts[candidate] ?? 0) < MAX_SLOTS) return candidate;
    }
    return baseProduct; // all full, fall through
  };

  // Build prefilled location string for registration modal
  const prefilledLocationStr =
    selectedLocation && locationConfirmed
      ? formatLocation(
          selectedLocation.city ||
            selectedLocation.district ||
            selectedLocation.state,
          selectedLocation.district,
          selectedLocation.state,
        )
      : undefined;

  if (viewSlot) {
    const cat = CATEGORIES.find((c) => c.id === viewSlot.category);
    const isSlotMember = myRegistrations.some(
      (r: Registration) =>
        r.category === viewSlot.category && r.product === viewSlot.product,
    );
    return (
      <SlotDetailPage
        category={viewSlot.category}
        product={viewSlot.product}
        categoryColor={cat?.color ?? "oklch(0.6 0.2 230)"}
        onBack={() => setViewSlot(null)}
        isSlotMember={isSlotMember}
        activeMonth={HOME_MONTH_TABS[activeHomeMonthIdx]}
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Amazon-Style Search Bar */}
      <div className="relative mb-6">
        <div className="relative flex items-center h-12 rounded-2xl bg-muted/50 border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
          <Search
            size={18}
            className="absolute left-4 text-muted-foreground pointer-events-none"
          />
          <input
            data-ocid="home.search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Auto-switch category if search matches one
              const q = e.target.value.trim().toLowerCase();
              if (q) {
                const matched = CATEGORIES.find((c) =>
                  c.id.toLowerCase().includes(q),
                );
                if (matched) setActiveCategory(matched.id);
              }
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={SEARCH_EXAMPLES[placeholderIdx]}
            className="w-full h-full bg-transparent pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              data-ocid="home.search_clear"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 pb-6 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategory;
          const isOther = cat.id === "Other";
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
              {isOther && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 leading-none">
                  PRO
                </span>
              )}
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

      {/* Location confirmed badge */}
      {locationConfirmed &&
        selectedLocation &&
        !CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory) && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span className="text-foreground text-xs font-medium">
              Showing slots in:{" "}
              <strong className="text-primary">
                {selectedLocation.city ||
                  selectedLocation.district ||
                  selectedLocation.state}
              </strong>
            </span>
            <button
              type="button"
              data-ocid="home.change_location_button"
              onClick={() => setLocationSelectorOpen(true)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground underline flex-shrink-0"
            >
              Change
            </button>
          </div>
        )}

      {/* Month Timeline Tabs */}
      {!CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory) && (
        <div
          data-ocid="home.timeline_tabs"
          className="flex gap-2 overflow-x-auto mb-5 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {HOME_MONTH_TABS.map((tab, idx) => {
            const count = publicRegs.filter(
              (r: PublicRegistration) =>
                getMemberMonthHome(r).year === tab.year &&
                getMemberMonthHome(r).month === tab.month,
            ).length;
            return (
              <button
                key={tab.label}
                type="button"
                data-ocid={`home.timeline.tab.${idx + 1}`}
                onClick={() => setActiveHomeMonthIdx(idx)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  idx === activeHomeMonthIdx
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 text-xs font-bold ${idx === activeHomeMonthIdx ? "opacity-80" : "text-muted-foreground"}`}
                  >
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Create Custom Slot CTA for regular categories */}
      {!CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory) && (
        <div className="mb-4 flex items-center gap-3 p-3 rounded-xl border border-dashed border-border bg-muted/30">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Not listed in {activeCategory}?
            </p>
          </div>
          <button
            type="button"
            data-ocid="home.create_custom_slot_button"
            onClick={() => {
              if (!isAuthenticated) {
                onAuthRequired();
                return;
              }
              setExternalCreateOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity flex-shrink-0"
          >
            + Create Custom Slot
          </button>
        </div>
      )}

      {/* Product Grid */}
      {CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory) ? (
        <CustomSlotOnlyView
          activeCategory={activeCategory}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
          externalCreateOpen={externalCreateOpen}
          setExternalCreateOpen={setExternalCreateOpen}
          activeMonth={HOME_MONTH_TABS[activeHomeMonthIdx]}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : activeCategory === "Vehicles" ? (
        <div className="space-y-6">
          {/* Vehicle type selector tabs — Cars and Bikes appear first */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setVehicleSubType("all")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                vehicleSubType === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All Vehicles
            </button>
            {VEHICLE_SUBCATEGORIES.map((sub) => {
              const Icon = sub.icon;
              const isActive = vehicleSubType === sub.prefix;
              return (
                <button
                  key={sub.prefix}
                  type="button"
                  onClick={() =>
                    setVehicleSubType(isActive ? "all" : sub.prefix)
                  }
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "text-white shadow-glow"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  style={isActive ? { background: sub.color } : {}}
                >
                  <Icon size={14} />
                  {sub.label}
                </button>
              );
            })}
          </div>
          {/* Brand cards grouped by selected vehicle type */}
          {VEHICLE_SUBCATEGORIES.filter(
            (sub) => vehicleSubType === "all" || vehicleSubType === sub.prefix,
          ).map((sub) => {
            const Icon = sub.icon;
            const subProducts = searchFiltered.filter((p) =>
              p.startsWith(sub.prefix),
            );
            if (subProducts.length === 0) return null;
            return (
              <div key={sub.label}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${sub.color}20` }}
                  >
                    <Icon size={22} style={{ color: sub.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {sub.label}
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  {subProducts.map((product, i) => (
                    <ProductCard
                      key={product}
                      product={product}
                      category={activeCategory}
                      count={monthFilteredCounts[product] ?? 0}
                      index={i + 1}
                      onRegister={() =>
                        setSelectedProduct(resolveSlotProduct(product))
                      }
                      onViewSlot={() =>
                        setViewSlot({ category: activeCategory, product })
                      }
                      isAuthenticated={isAuthenticated}
                      onAuthRequired={onAuthRequired}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {searchFiltered.map((product, i) => (
            <ProductCard
              key={product}
              product={product}
              category={activeCategory}
              count={monthFilteredCounts[product] ?? 0}
              index={i + 1}
              onRegister={() => setSelectedProduct(resolveSlotProduct(product))}
              onViewSlot={() =>
                setViewSlot({ category: activeCategory, product })
              }
              isAuthenticated={isAuthenticated}
              onAuthRequired={onAuthRequired}
            />
          ))}
        </div>
      )}

      {/* Community Slots for regular categories */}
      {!CUSTOM_SLOT_ONLY_CATEGORIES.includes(activeCategory) && (
        <div className="mt-8">
          <CustomSlotsSection
            isAuthenticated={isAuthenticated}
            onAuthRequired={onAuthRequired}
            externalCreateOpen={externalCreateOpen}
            onExternalCreateClose={() => setExternalCreateOpen(false)}
            categoryId={activeCategory}
            activeMonth={HOME_MONTH_TABS[activeHomeMonthIdx]}
          />
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <RegistrationModal
            product={selectedProduct}
            category={activeCategory}
            onClose={() => setSelectedProduct(null)}
            prefilledLocation={prefilledLocationStr}
            onEditLocation={() => {
              setSelectedProduct(null);
              setLocationSelectorOpen(true);
            }}
            selectedMonth={HOME_MONTH_TABS[activeHomeMonthIdx]}
          />
        )}
      </AnimatePresence>

      {/* Location selector modal */}
      {locationSelectorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setLocationSelectorOpen(false)}
          onKeyDown={(e) =>
            e.key === "Escape" && setLocationSelectorOpen(false)
          }
          role="presentation"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full sm:max-w-lg mx-4 bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-foreground">
                Change Location
              </h3>
              <button
                type="button"
                onClick={() => setLocationSelectorOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                data-ocid="home.close_button"
              >
                ✕
              </button>
            </div>
            <LocationSelector
              categoryId={activeCategory}
              onLocationSelected={(loc) => {
                setSelectedLocation(loc);
                setLocationConfirmed(true);
                sessionStorage.setItem(
                  `letzclub_loc_${activeCategory}`,
                  JSON.stringify(loc),
                );
                setLocationSelectorOpen(false);
              }}
            />
          </div>
        </div>
      )}
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

  // Helper to check if a registration's purchase month is in the past
  const isExpired = (reg: Registration) => {
    const { year, month } = getMemberMonthHome({
      product: reg.product,
      location: reg.location,
      requirements: reg.requirements,
    });
    const now = new Date();
    const regDate = new Date(year, month, 1);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return regDate < currentMonthStart;
  };

  const getNextMonthLabel = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return next.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  };

  const expiredRegs = registrations.filter(isExpired);
  const activeRegs = registrations.filter((r) => !isExpired(r));

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
            You haven&apos;t registered interest in any product yet. Browse
            categories to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Expired registrations with nudge */}
          {expiredRegs.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Expired Slots ({expiredRegs.length})
              </p>
              {expiredRegs.map((reg, idx) => {
                const cat = CATEGORIES.find((c) => c.id === reg.category);
                const Icon = cat?.icon ?? Monitor;
                return (
                  <motion.div
                    key={String(reg.id)}
                    data-ocid={`my_registrations.item.${idx + 1}`}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            ⏰ Expired
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {reg.location}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(reg.timestamp)}
                      </div>
                    </div>
                    {/* Nudge banner */}
                    <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 px-3 py-2.5">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                        Your slot has expired. Update your timeline?
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          data-ocid={`my_registrations.move_button.${idx + 1}`}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-amber-400 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600"
                          onClick={() => {
                            toast.info(
                              `Please re-register for ${getNextMonthLabel()} to update your timeline for ${reg.product}.`,
                            );
                          }}
                        >
                          Move to {getNextMonthLabel()}
                        </Button>
                        <Button
                          data-ocid={`my_registrations.remove_button.${idx + 1}`}
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            toast.info(
                              "To remove this registration, please contact support or re-register with an updated timeline.",
                            );
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Active registrations */}
          {activeRegs.length > 0 && (
            <div className="space-y-3" data-ocid="my_registrations.table">
              {expiredRegs.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Active ({activeRegs.length})
                </p>
              )}
              {activeRegs.map((reg, idx) => {
                const cat = CATEGORIES.find((c) => c.id === reg.category);
                const Icon = cat?.icon ?? Monitor;
                return (
                  <motion.div
                    key={String(reg.id)}
                    data-ocid={`my_registrations.item.${expiredRegs.length + idx + 1}`}
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

// ===== ROLE SELECTION MODAL =====
function RoleSelectionModal({
  onSelectCustomer,
  onSelectProvider,
}: {
  onSelectCustomer: () => void;
  onSelectProvider: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        data-ocid="role_selection.dialog"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="h-1 -mt-6 -mx-6 mb-6 rounded-t-2xl bg-gradient-to-r from-primary to-accent" />
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
            <Users size={24} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Who are you?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us how you want to use Letzclub
          </p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            data-ocid="role_selection.customer_button"
            onClick={onSelectCustomer}
            className="w-full rounded-2xl border border-border bg-muted/40 hover:border-primary/40 hover:bg-primary/5 p-4 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  I am a Customer
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Browse products, register interest, compare offers
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            data-ocid="role_selection.provider_button"
            onClick={onSelectProvider}
            className="w-full rounded-2xl border border-border bg-muted/40 hover:border-accent/40 hover:bg-accent/5 p-4 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/50 transition-colors">
                <Briefcase size={20} className="text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">
                  I am a Service Provider
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View customer requirements, submit offers, chat with clients
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs line-through text-muted-foreground/60">
                    ₹30,000/yr
                  </span>
                  <span className="text-sm font-bold text-emerald-500">
                    ₹1,000/yr
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                    96% OFF
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ===== SERVICE PROVIDER SETUP MODAL =====
function ServiceProviderSetupModal({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Electronics & Appliances");
  const [phone, setPhone] = useState("");
  const registerSP = useRegisterServiceProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessName.trim() || !phone.trim()) return;
    try {
      await registerSP.mutateAsync({
        name: name.trim(),
        businessName: businessName.trim(),
        category,
        phone: phone.trim(),
      });
      toast.success("Welcome to Letzclub as a Service Provider!");
      onComplete();
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        data-ocid="sp_setup.dialog"
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl my-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="h-1 -mt-6 -mx-6 mb-6 rounded-t-2xl bg-gradient-to-r from-accent to-primary" />
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-accent/30 flex items-center justify-center">
            <Briefcase size={18} className="text-accent-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Service Provider Setup
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tell customers about you and your business
        </p>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-5 text-center">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Launch Offer:{" "}
            <span className="line-through text-muted-foreground">
              ₹30,000/yr
            </span>{" "}
            <span className="font-bold text-emerald-500">₹1,000/yr</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold">
              96% OFF
            </span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="spName" className="text-sm font-medium">
              Your Name
            </Label>
            <Input
              id="spName"
              data-ocid="sp_setup.name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoFocus
              className="bg-muted border-border focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spBusiness" className="text-sm font-medium">
              Business Name
            </Label>
            <Input
              id="spBusiness"
              data-ocid="sp_setup.business_input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your shop or company name"
              className="bg-muted border-border focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spCategory" className="text-sm font-medium">
              Your Category
            </Label>
            <select
              id="spCategory"
              data-ocid="sp_setup.category_select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-muted border border-border focus:border-primary text-sm text-foreground focus:outline-none"
            >
              {[
                "Electronics & Appliances",
                "Vehicles",
                "Interior Designing",
                "Furniture",
                "Real Estate",
                "Gym",
                "Courses",
                "Beauty",
                "Construction Materials",
                "Business Services",
                "Food",
                "Events & Entertainment",
                "Sports & Recreation",
                "Pets & Animals",
                "Printing & Stationery",
                "Marketing",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spPhone" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="spPhone"
                data-ocid="sp_setup.phone_input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-muted border-border focus:border-primary pl-8"
              />
            </div>
          </div>
          <Button
            type="submit"
            data-ocid="sp_setup.submit_button"
            disabled={
              !name.trim() ||
              !businessName.trim() ||
              !phone.trim() ||
              registerSP.isPending
            }
            className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl"
          >
            {registerSP.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Start as Service Provider
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// ===== MAIN APP =====
function LetzclubApp() {
  const [page, setPage] = useState<Page>("home");
  const [roleChoice, setRoleChoice] = useState<"customer" | "provider" | null>(
    null,
  );
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
  const {
    data: spProfile,
    isLoading: spProfileLoading,
    isFetched: spProfileFetched,
  } = useMyServiceProviderProfile();

  const isServiceProvider = !!spProfile;
  const bothFetched = profileFetched && spProfileFetched;
  const bothLoading = profileLoading || spProfileLoading;

  const showRoleSelection =
    isAuthenticated &&
    !bothLoading &&
    bothFetched &&
    userProfile === null &&
    spProfile === null &&
    roleChoice === null;
  const showProfileSetup =
    isAuthenticated &&
    !bothLoading &&
    bothFetched &&
    userProfile === null &&
    spProfile === null &&
    roleChoice === "customer";
  const showSPSetup =
    isAuthenticated &&
    !bothLoading &&
    bothFetched &&
    spProfile === null &&
    userProfile === null &&
    roleChoice === "provider";

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
    setRoleChoice(null);
    toast.success("Logged out successfully");
  };

  // Full-screen initializing state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome/sign-in screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <WelcomeScreen onLogin={handleLogin} isLoggingIn={isLoggingIn} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Show SP home if service provider
  if (isAuthenticated && isServiceProvider && spProfile) {
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
          <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow">
                    <Zap size={20} className="text-white" fill="white" />
                  </div>
                  <div>
                    <div className="font-display text-xl font-black tracking-tight text-foreground leading-none">
                      Letzclub
                    </div>
                    <div className="text-xs text-muted-foreground tracking-widest uppercase">
                      Service Provider
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/40 border border-border/60">
                    <Briefcase size={13} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">
                      {spProfile.name}
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
              </div>
            </div>
          </header>
          <div className="flex-1">
            <ProviderHomeScreen spProfile={spProfile} />
          </div>
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
        {showSPSetup && <ServiceProviderSetupModal onComplete={() => {}} />}
        <Toaster richColors position="top-right" />
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
                <button
                  type="button"
                  data-ocid="nav.my_registrations_link"
                  onClick={() => setPage("my-registrations")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    page === "my-registrations"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ClipboardList size={13} />
                  My Registrations
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    data-ocid="nav.admin_link"
                    onClick={() => setPage("admin")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      page === "admin"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <ClipboardList size={13} />
                    Admin
                  </button>
                )}
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
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav for authenticated users */}
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
                  onAuthRequired={() => {}}
                />
              </motion.div>
            )}
            {page === "my-registrations" && (
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

      {/* Role Selection and Profile Setup Modals */}
      {showRoleSelection && (
        <RoleSelectionModal
          onSelectCustomer={() => setRoleChoice("customer")}
          onSelectProvider={() => setRoleChoice("provider")}
        />
      )}
      {showProfileSetup && <ProfileSetupModal onComplete={() => {}} />}
      {showSPSetup && <ServiceProviderSetupModal onComplete={() => {}} />}

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
