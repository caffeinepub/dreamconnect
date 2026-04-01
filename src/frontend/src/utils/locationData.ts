// Location data utilities for letzclub location-based filtering

export type LocationLevel =
  | "locality"
  | "city"
  | "district"
  | "state"
  | "national";

export interface SelectedLocation {
  state: string;
  district: string;
  city: string;
  area: string;
}

export const EMPTY_LOCATION: SelectedLocation = {
  state: "",
  district: "",
  city: "",
  area: "",
};

// Location level per category
export const LOCATION_LEVELS: Record<string, LocationLevel> = {
  "Real Estate": "locality",
  "Electronics & Appliances": "city",
  Gym: "city",
  Medical: "city",
  Beauty: "city",
  "Interior Designing": "city",
  Furniture: "city",
  "Home Services": "city",
  "Food & Catering": "city",
  "Events & Entertainment": "city",
  "Sports & Recreation": "city",
  "Pets & Animals": "city",
  "Printing & Stationery": "city",
  Vehicles: "district",
  "Construction Materials": "district",
  Decor: "district",
  Agriculture: "district",
  "Logistics & Transport": "district",
  Courses: "state",
  "Business Services": "state",
  Travel: "state",
  Other: "national",
};

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // UTs
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const DISTRICTS_BY_STATE: Record<string, string[]> = {
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Kolhapur",
    "Amravati",
    "Nanded",
  ],
  Karnataka: [
    "Bengaluru Urban",
    "Mysuru",
    "Mangaluru",
    "Belagavi",
    "Hubballi",
    "Kalaburagi",
    "Ballari",
    "Shivamogga",
    "Tumakuru",
    "Hassan",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
    "Medchal",
    "Rangareddy",
    "Nalgonda",
    "Adilabad",
    "Siddipet",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Vellore",
    "Erode",
    "Thoothukudi",
    "Tiruppur",
  ],
  Delhi: [
    "New Delhi",
    "Central Delhi",
    "North Delhi",
    "South Delhi",
    "East Delhi",
    "West Delhi",
    "North West Delhi",
    "South West Delhi",
    "Shahdara",
    "North East Delhi",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Varanasi",
    "Prayagraj",
    "Ghaziabad",
    "Noida (Gautam Budh Nagar)",
    "Meerut",
    "Gorakhpur",
    "Bareilly",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Gandhinagar",
    "Jamnagar",
    "Junagadh",
    "Anand",
    "Navsari",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Udaipur",
    "Bhilwara",
    "Alwar",
    "Sikar",
    "Bharatpur",
  ],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi (Ernakulam)",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Palakkad",
    "Alappuzha",
    "Kannur",
    "Kasaragod",
    "Malappuram",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "North 24 Parganas",
    "South 24 Parganas",
    "Hooghly",
    "Paschim Medinipur",
    "Murshidabad",
    "Burdwan",
    "Nadia",
    "Malda",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Hoshiarpur",
    "Gurdaspur",
    "Firozpur",
    "Sangrur",
  ],
  Haryana: [
    "Gurugram",
    "Faridabad",
    "Ambala",
    "Hisar",
    "Rohtak",
    "Panipat",
    "Karnal",
    "Sonipat",
    "Yamunanagar",
    "Bhiwani",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Dewas",
    "Satna",
    "Ratlam",
    "Rewa",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Muzaffarpur",
    "Bhagalpur",
    "Darbhanga",
    "Purnia",
    "Arrah (Bhojpur)",
    "Begusarai",
    "Katihar",
    "Samastipur",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Tirupati",
    "Kakinada",
    "Rajahmundry",
    "Anantapur",
    "Kadapa",
  ],
};

export const CITIES_BY_DISTRICT: Record<string, string[]> = {
  // Maharashtra
  Mumbai: [
    "Andheri",
    "Bandra",
    "Borivali",
    "Chembur",
    "Colaba",
    "Dadar",
    "Ghatkopar",
    "Goregaon",
    "Juhu",
    "Kurla",
    "Lower Parel",
    "Malad",
    "Powai",
    "Thane",
    "Versova",
    "Worli",
  ],
  Pune: [
    "Aundh",
    "Baner",
    "Hadapsar",
    "Hinjewadi",
    "Kalyani Nagar",
    "Kharadi",
    "Koregaon Park",
    "Kothrud",
    "Magarpatta",
    "Pimpri",
    "Shivajinagar",
    "Viman Nagar",
    "Wakad",
  ],
  Nagpur: [
    "Civil Lines",
    "Dharampeth",
    "Gandhibagh",
    "Hingna",
    "Kamptee",
    "Manish Nagar",
    "Pratap Nagar",
    "Sadar",
    "Sitabuldi",
    "Wardha Road",
  ],
  // Karnataka
  "Bengaluru Urban": [
    "Banashankari",
    "Bannerghatta",
    "Bellandur",
    "BTM Layout",
    "Electronic City",
    "HSR Layout",
    "Indiranagar",
    "Jayanagar",
    "JP Nagar",
    "Koramangala",
    "Malleswaram",
    "Marathahalli",
    "Rajajinagar",
    "Sarjapur",
    "Whitefield",
    "Yelahanka",
  ],
  Mysuru: [
    "Hebbal",
    "Jayalakshmipuram",
    "Kuvempunagar",
    "Nazarbad",
    "Saraswathipuram",
    "Vijayanagar",
  ],
  // Telangana
  Hyderabad: [
    "Ameerpet",
    "Banjara Hills",
    "Begumpet",
    "Gachibowli",
    "Hitech City",
    "Jubilee Hills",
    "Kukatpally",
    "LB Nagar",
    "Madhapur",
    "Mehdipatnam",
    "Miyapur",
    "Secunderabad",
    "SR Nagar",
    "Uppal",
    "Ameerpet",
  ],
  Warangal: ["Hanamkonda", "Kazipet", "Warangal Urban", "Warangal Rural"],
  // Tamil Nadu
  Chennai: [
    "Adyar",
    "Anna Nagar",
    "Chromepet",
    "Guindy",
    "Kilpauk",
    "Kodambakkam",
    "Mylapore",
    "Nungambakkam",
    "Porur",
    "Tambaram",
    "T Nagar",
    "Velachery",
    "Vadapalani",
  ],
  Coimbatore: [
    "Gandhipuram",
    "Peelamedu",
    "Podanur",
    "RS Puram",
    "Saibaba Colony",
    "Singanallur",
    "Ukkadam",
  ],
  // Delhi
  "New Delhi": [
    "Connaught Place",
    "Defence Colony",
    "Green Park",
    "Hauz Khas",
    "Karol Bagh",
    "Lajpat Nagar",
    "Nehru Place",
    "Saket",
    "South Ex",
    "Vasant Kunj",
  ],
  Gurugram: [
    "DLF Phase 1",
    "DLF Phase 2",
    "Golf Course Road",
    "MG Road",
    "Sohna Road",
    "Sector 14",
    "Sector 29",
    "Sector 56",
    "Udyog Vihar",
  ],
  // Gujarat
  Ahmedabad: [
    "Bopal",
    "CG Road",
    "Gandhinagar",
    "Gota",
    "Maninagar",
    "Navrangpura",
    "Prahlad Nagar",
    "SG Road",
    "Satellite",
    "Vastrapur",
  ],
  Surat: [
    "Adajan",
    "Althan",
    "Athwa",
    "Ghod Dod Road",
    "Piplod",
    "Pal",
    "Rander",
    "Udhna",
    "Vesu",
  ],
};

// ---- Helpers ----

export function parseLocation(locationStr: string): {
  city: string;
  district: string;
  state: string;
} {
  const parts = locationStr.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    return { city: parts[0], district: parts[1], state: parts[2] };
  }
  if (parts.length === 2) {
    return { city: parts[0], district: "", state: parts[1] };
  }
  return { city: parts[0] ?? "", district: "", state: "" };
}

export function formatLocation(
  city: string,
  district: string,
  state: string,
): string {
  return [city, district, state].filter(Boolean).join(", ");
}

export function matchesLocation(
  locationStr: string,
  selected: SelectedLocation,
  level: LocationLevel,
): boolean {
  if (!locationStr) return false;
  const stored = parseLocation(locationStr);
  const norm = (s: string) => s.trim().toLowerCase();

  switch (level) {
    case "national":
      return true;
    case "state":
      return !!selected.state && norm(stored.state) === norm(selected.state);
    case "district":
      if (!selected.district)
        return !!selected.state && norm(stored.state) === norm(selected.state);
      return (
        norm(stored.district) === norm(selected.district) ||
        norm(stored.city) === norm(selected.district)
      );
    case "city":
      if (!selected.city)
        return !!selected.state && norm(stored.state) === norm(selected.state);
      return (
        norm(stored.city) === norm(selected.city) ||
        norm(stored.district) === norm(selected.city)
      );
    case "locality": {
      if (!selected.city)
        return !!selected.state && norm(stored.state) === norm(selected.state);
      // For locality, match city AND optionally area
      const cityMatch =
        norm(stored.city) === norm(selected.city) ||
        norm(stored.district) === norm(selected.city);
      if (!selected.area) return cityMatch;
      return cityMatch && norm(locationStr).includes(norm(selected.area));
    }
    default:
      return true;
  }
}

export const STATE_CAPITALS: Record<
  string,
  { city: string; district: string }
> = {
  "Andhra Pradesh": { city: "Amaravati", district: "Guntur" },
  "Arunachal Pradesh": { city: "Itanagar", district: "Papum Pare" },
  Assam: { city: "Dispur", district: "Kamrup Metropolitan" },
  Bihar: { city: "Patna", district: "Patna" },
  Chhattisgarh: { city: "Raipur", district: "Raipur" },
  Goa: { city: "Panaji", district: "North Goa" },
  Gujarat: { city: "Gandhinagar", district: "Gandhinagar" },
  Haryana: { city: "Chandigarh", district: "Chandigarh" },
  "Himachal Pradesh": { city: "Shimla", district: "Shimla" },
  Jharkhand: { city: "Ranchi", district: "Ranchi" },
  Karnataka: { city: "Bangalore", district: "Bangalore Urban" },
  Kerala: { city: "Thiruvananthapuram", district: "Thiruvananthapuram" },
  "Madhya Pradesh": { city: "Bhopal", district: "Bhopal" },
  Maharashtra: { city: "Mumbai", district: "Mumbai City" },
  Manipur: { city: "Imphal", district: "Imphal West" },
  Meghalaya: { city: "Shillong", district: "East Khasi Hills" },
  Mizoram: { city: "Aizawl", district: "Aizawl" },
  Nagaland: { city: "Kohima", district: "Kohima" },
  Odisha: { city: "Bhubaneswar", district: "Khordha" },
  Punjab: { city: "Chandigarh", district: "Chandigarh" },
  Rajasthan: { city: "Jaipur", district: "Jaipur" },
  Sikkim: { city: "Gangtok", district: "East Sikkim" },
  "Tamil Nadu": { city: "Chennai", district: "Chennai" },
  Telangana: { city: "Hyderabad", district: "Hyderabad" },
  Tripura: { city: "Agartala", district: "West Tripura" },
  "Uttar Pradesh": { city: "Lucknow", district: "Lucknow" },
  Uttarakhand: { city: "Dehradun", district: "Dehradun" },
  "West Bengal": { city: "Kolkata", district: "Kolkata" },
  Delhi: { city: "New Delhi", district: "New Delhi" },
  "Jammu and Kashmir": { city: "Srinagar", district: "Srinagar" },
  Ladakh: { city: "Leh", district: "Leh" },
};
