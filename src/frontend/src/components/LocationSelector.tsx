import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Loader2, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CITIES_BY_DISTRICT,
  DISTRICTS_BY_STATE,
  EMPTY_LOCATION,
  INDIAN_STATES,
  LOCATION_LEVELS,
  type LocationLevel,
  type SelectedLocation,
} from "../utils/locationData";

interface LocationSelectorProps {
  categoryId: string;
  onLocationSelected: (loc: SelectedLocation) => void;
  initialLocation?: SelectedLocation;
}

function getStorageKey(categoryId: string) {
  return `letzclub_loc_${categoryId}`;
}

function loadSaved(categoryId: string): SelectedLocation | null {
  try {
    const raw = sessionStorage.getItem(getStorageKey(categoryId));
    if (!raw) return null;
    return JSON.parse(raw) as SelectedLocation;
  } catch {
    return null;
  }
}

function saveLoc(categoryId: string, loc: SelectedLocation) {
  try {
    sessionStorage.setItem(getStorageKey(categoryId), JSON.stringify(loc));
  } catch {
    // ignore
  }
}

export type { SelectedLocation };

export function LocationSelector({
  categoryId,
  onLocationSelected,
  initialLocation,
}: LocationSelectorProps) {
  const level: LocationLevel = LOCATION_LEVELS[categoryId] ?? "city";
  const [loc, setLoc] = useState<SelectedLocation>(
    initialLocation ?? loadSaved(categoryId) ?? EMPTY_LOCATION,
  );
  const [detecting, setDetecting] = useState(false);

  // National level — no selector needed, auto-confirm immediately
  useEffect(() => {
    if (level === "national") {
      onLocationSelected(EMPTY_LOCATION);
    }
  }, [level, onLocationSelected]);

  if (level === "national") return null;

  const districts = loc.state ? (DISTRICTS_BY_STATE[loc.state] ?? []) : [];
  const cities = loc.district ? (CITIES_BY_DISTRICT[loc.district] ?? []) : [];

  const canConfirm =
    (level === "state" && !!loc.state) ||
    (level === "district" && !!loc.state) ||
    (level === "city" && !!loc.state) ||
    (level === "locality" && !!loc.state);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported on this browser");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.suburb ||
            data.address?.village ||
            "";
          const district =
            data.address?.county || data.address?.state_district || "";
          const state = data.address?.state ?? "";

          // Try to match detected state with our list
          const matchedState =
            INDIAN_STATES.find(
              (s) => s.toLowerCase() === state.toLowerCase(),
            ) ?? state;

          setLoc((prev) => ({
            ...prev,
            state: matchedState,
            district: district,
            city: city,
          }));
          toast.success(`Detected: ${city || district}, ${matchedState}`);
        } catch {
          toast.error("Failed to detect location");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied");
        } else {
          toast.error("Could not get your location");
        }
      },
      { timeout: 8000 },
    );
  };

  const handleConfirm = () => {
    saveLoc(categoryId, loc);
    onLocationSelected(loc);
  };

  const levelLabel: Record<LocationLevel, string> = {
    locality: "area",
    city: "city",
    district: "district",
    state: "state",
    national: "India",
  };

  return (
    <motion.div
      key={`loc-selector-${categoryId}`}
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-sm shadow-xl overflow-hidden">
        {/* Header bar */}
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <MapPin size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Where are you looking?
              </h3>
              <p className="text-xs text-muted-foreground">
                We&apos;ll show slots near your {levelLabel[level]}
              </p>
            </div>
          </div>

          {/* Near Me button */}
          <button
            type="button"
            data-ocid="location.near_me_button"
            onClick={detectLocation}
            disabled={detecting}
            className="mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-primary/40 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors disabled:opacity-60"
          >
            {detecting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Navigation size={15} />
            )}
            {detecting ? "Detecting..." : "Use My Location (Near Me)"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              or select manually
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Cascading selectors */}
          <div className="space-y-3">
            {/* State */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                State
              </Label>
              <Select
                value={loc.state}
                onValueChange={(v) =>
                  setLoc({ state: v, district: "", city: "", area: "" })
                }
              >
                <SelectTrigger
                  data-ocid="location.state_select"
                  className="bg-muted/50 border-border text-sm"
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s} className="text-sm">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District — shown for district/city/locality levels */}
            {(level === "district" ||
              level === "city" ||
              level === "locality") &&
              loc.state && (
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ChevronRight size={12} />
                    <Label className="text-xs font-semibold uppercase tracking-wider">
                      District
                    </Label>
                  </div>
                  {districts.length > 0 ? (
                    <Select
                      value={loc.district}
                      onValueChange={(v) =>
                        setLoc((prev) => ({
                          ...prev,
                          district: v,
                          city: "",
                          area: "",
                        }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="location.district_select"
                        className="bg-muted/50 border-border text-sm"
                      >
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {districts.map((d) => (
                          <SelectItem key={d} value={d} className="text-sm">
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <input
                      data-ocid="location.district_input"
                      type="text"
                      value={loc.district}
                      onChange={(e) =>
                        setLoc((prev) => ({
                          ...prev,
                          district: e.target.value,
                          city: "",
                          area: "",
                        }))
                      }
                      placeholder="Enter district name"
                      className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                    />
                  )}
                </motion.div>
              )}

            {/* City — shown for city/locality levels */}
            {(level === "city" || level === "locality") && loc.state && (
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ChevronRight size={12} />
                  <ChevronRight size={12} className="-ml-2" />
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    City
                  </Label>
                </div>
                {cities.length > 0 ? (
                  <Select
                    value={loc.city}
                    onValueChange={(v) =>
                      setLoc((prev) => ({ ...prev, city: v, area: "" }))
                    }
                  >
                    <SelectTrigger
                      data-ocid="location.city_select"
                      className="bg-muted/50 border-border text-sm"
                    >
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cities.map((c) => (
                        <SelectItem key={c} value={c} className="text-sm">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    data-ocid="location.city_input"
                    type="text"
                    value={loc.city}
                    onChange={(e) =>
                      setLoc((prev) => ({
                        ...prev,
                        city: e.target.value,
                        area: "",
                      }))
                    }
                    placeholder="Enter city name"
                    className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                )}
              </motion.div>
            )}

            {/* Area — shown for locality level */}
            {level === "locality" && loc.city && (
              <motion.div
                className="space-y-1.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ChevronRight size={12} />
                  <ChevronRight size={12} className="-ml-2" />
                  <ChevronRight size={12} className="-ml-2" />
                  <Label className="text-xs font-semibold uppercase tracking-wider">
                    Area / Locality
                  </Label>
                </div>
                <input
                  data-ocid="location.area_input"
                  type="text"
                  value={loc.area}
                  onChange={(e) =>
                    setLoc((prev) => ({ ...prev, area: e.target.value }))
                  }
                  placeholder="e.g. Whitefield, Koramangala"
                  className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
              </motion.div>
            )}
          </div>

          <Button
            data-ocid="location.find_slots_button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full mt-5 h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-glow hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <MapPin size={15} className="mr-2" />
            Find Slots Near Me
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
