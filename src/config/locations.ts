export type LocationType = 'remote-global' | 'remote-india' | 'hybrid' | 'onsite';

export interface Location {
  id: string;           // e.g., "IN-WB-KOL"
  name: string;         // e.g., "Kolkata"
  type: 'state' | 'ut' | 'city';
  state?: string;       // Parent state for cities
  ut?: string;          // Parent UT for cities
  timezone: string;     // "Asia/Kolkata"
  remoteFriendly?: boolean; // Companies known to hire remotely from here
}

// ─────────────────────────────────────────────────────────────
// STATES & UNION TERRITORIES
// ─────────────────────────────────────────────────────────────
export const INDIAN_STATES_UTS: Location[] = [
  // States (28)
  { id: 'IN-AP', name: 'Andhra Pradesh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-AR', name: 'Arunachal Pradesh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-AS', name: 'Assam', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-BR', name: 'Bihar', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-CT', name: 'Chhattisgarh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-GA', name: 'Goa', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-GJ', name: 'Gujarat', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-HR', name: 'Haryana', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-HP', name: 'Himachal Pradesh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-JH', name: 'Jharkhand', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-KA', name: 'Karnataka', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-KL', name: 'Kerala', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-MP', name: 'Madhya Pradesh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-MH', name: 'Maharashtra', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-MN', name: 'Manipur', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-ML', name: 'Meghalaya', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-MZ', name: 'Mizoram', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-NL', name: 'Nagaland', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-OR', name: 'Odisha', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-PB', name: 'Punjab', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-RJ', name: 'Rajasthan', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-SK', name: 'Sikkim', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-TN', name: 'Tamil Nadu', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-TG', name: 'Telangana', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-TR', name: 'Tripura', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-UP', name: 'Uttar Pradesh', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-UT', name: 'Uttarakhand', type: 'state', timezone: 'Asia/Kolkata' },
  { id: 'IN-WB', name: 'West Bengal', type: 'state', timezone: 'Asia/Kolkata', remoteFriendly: true },

  // Union Territories (8)
  { id: 'IN-AN', name: 'Andaman and Nicobar Islands', type: 'ut', timezone: 'Asia/Kolkata' },
  { id: 'IN-CH', name: 'Chandigarh', type: 'ut', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'ut', timezone: 'Asia/Kolkata' },
  { id: 'IN-DL', name: 'Delhi', type: 'ut', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-JK', name: 'Jammu and Kashmir', type: 'ut', timezone: 'Asia/Kolkata' },
  { id: 'IN-LA', name: 'Ladakh', type: 'ut', timezone: 'Asia/Kolkata' },
  { id: 'IN-LD', name: 'Lakshadweep', type: 'ut', timezone: 'Asia/Kolkata' },
  { id: 'IN-PY', name: 'Puducherry', type: 'ut', timezone: 'Asia/Kolkata' },
];

export const INDIAN_CITIES: Location[] = [
  { id: 'IN-MH-MUM', name: 'Mumbai', type: 'city', state: 'Maharashtra', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-DL-DEL', name: 'New Delhi', type: 'city', ut: 'Delhi', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-KA-BLR', name: 'Bangalore', type: 'city', state: 'Karnataka', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-TN-MAA', name: 'Chennai', type: 'city', state: 'Tamil Nadu', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-TG-HYD', name: 'Hyderabad', type: 'city', state: 'Telangana', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-WB-CCU', name: 'Kolkata', type: 'city', state: 'West Bengal', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-MH-PNQ', name: 'Pune', type: 'city', state: 'Maharashtra', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-GJ-AMD', name: 'Ahmedabad', type: 'city', state: 'Gujarat', timezone: 'Asia/Kolkata', remoteFriendly: true },

  { id: 'IN-KA-MYS', name: 'Mysore', type: 'city', state: 'Karnataka', timezone: 'Asia/Kolkata' },
  { id: 'IN-KL-COK', name: 'Kochi', type: 'city', state: 'Kerala', timezone: 'Asia/Kolkata' },
  { id: 'IN-TN-CJB', name: 'Coimbatore', type: 'city', state: 'Tamil Nadu', timezone: 'Asia/Kolkata' },
  { id: 'IN-UP-LKO', name: 'Lucknow', type: 'city', state: 'Uttar Pradesh', timezone: 'Asia/Kolkata' },
  { id: 'IN-RJ-JPR', name: 'Jaipur', type: 'city', state: 'Rajasthan', timezone: 'Asia/Kolkata' },
  { id: 'IN-MP-IDR', name: 'Indore', type: 'city', state: 'Madhya Pradesh', timezone: 'Asia/Kolkata' },
  { id: 'IN-UP-KAN', name: 'Kanpur', type: 'city', state: 'Uttar Pradesh', timezone: 'Asia/Kolkata' },
  { id: 'IN-PB-MOH', name: 'Mohali', type: 'city', state: 'Punjab', timezone: 'Asia/Kolkata' },
  { id: 'IN-HR-GGN', name: 'Gurugram', type: 'city', state: 'Haryana', timezone: 'Asia/Kolkata', remoteFriendly: true },
  { id: 'IN-UP-NOI', name: 'Noida', type: 'city', state: 'Uttar Pradesh', timezone: 'Asia/Kolkata', remoteFriendly: true },

  { id: 'IN-OR-BBI', name: 'Bhubaneswar', type: 'city', state: 'Odisha', timezone: 'Asia/Kolkata' },
  { id: 'IN-AS-GAU', name: 'Guwahati', type: 'city', state: 'Assam', timezone: 'Asia/Kolkata' },
  { id: 'IN-JH-RAN', name: 'Ranchi', type: 'city', state: 'Jharkhand', timezone: 'Asia/Kolkata' },
  { id: 'IN-CT-RPR', name: 'Raipur', type: 'city', state: 'Chhattisgarh', timezone: 'Asia/Kolkata' },
  { id: 'IN-UK-DED', name: 'Dehradun', type: 'city', state: 'Uttarakhand', timezone: 'Asia/Kolkata' },
  { id: 'IN-HP-SML', name: 'Shimla', type: 'city', state: 'Himachal Pradesh', timezone: 'Asia/Kolkata' },
  { id: 'IN-GJ-SUR', name: 'Surat', type: 'city', state: 'Gujarat', timezone: 'Asia/Kolkata' },
  { id: 'IN-MH-NAG', name: 'Nagpur', type: 'city', state: 'Maharashtra', timezone: 'Asia/Kolkata' },
  { id: 'IN-TN-MDU', name: 'Madurai', type: 'city', state: 'Tamil Nadu', timezone: 'Asia/Kolkata' },
  { id: 'IN-KL-TRV', name: 'Thiruvananthapuram', type: 'city', state: 'Kerala', timezone: 'Asia/Kolkata' },
];

export const getAllLocations = (): Location[] => [
  ...INDIAN_STATES_UTS,
  ...INDIAN_CITIES,
];

export const getLocationById = (id: string): Location | undefined =>
  getAllLocations().find((loc) => loc.id === id);

export const getLocationsByType = (type: Location['type']): Location[] =>
  getAllLocations().filter((loc) => loc.type === type);

export const getRemoteFriendlyLocations = (): Location[] =>
  getAllLocations().filter((loc) => loc.remoteFriendly);

export const searchLocations = (query: string): Location[] => {
  const q = query.toLowerCase();
  return getAllLocations().filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.state?.toLowerCase().includes(q) ||
      loc.ut?.toLowerCase().includes(q) ||
      loc.id.toLowerCase().includes(q)
  );
};

export const isLocationInIndia = (locationString: string): boolean => {
  const normalized = locationString.toLowerCase();
  return (
    normalized.includes('india') ||
    normalized.includes('in ') ||
    normalized.includes('bangalore') ||
    normalized.includes('mumbai') ||
    normalized.includes('delhi') ||
    normalized.includes('kolkata') ||
    normalized.includes('chennai') ||
    normalized.includes('hyderabad') ||
    normalized.includes('pune') ||
    normalized.includes('remote')
  );
};
