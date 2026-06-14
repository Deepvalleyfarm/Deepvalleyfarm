import { Order, Rider, SavedLocation } from "@/src/types";

// Local storage cache keys
const CACHE_PLACES_KEY = "selonachipa_places_cache_v1";
const CACHE_GEOCODE_KEY = "selonachipa_geocode_cache_v1";
const CACHE_ROUTE_KEY = "selonachipa_route_cache_v1";

export interface GeoLocation {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface RouteData {
  distanceKm: number;
  durationMinutes: number;
  polyline: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
}

// In-memory runtime backups
const memoryPlacesCache = new Map<string, any[]>();
const memoryGeocodeCache = new Map<string, GeoLocation>();
const memoryRouteCache = new Map<string, RouteData>();

// Get API Key
export const getGoogleMapsApiKey = (): string => {
  const key =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    "";
  return key;
};

export const hasValidGoogleMapsKey = (): boolean => {
  const key = getGoogleMapsApiKey();
  return Boolean(key) && key !== "YOUR_API_KEY";
};

/**
 * Places API (New) Autocomplete client layer
 * debounces, checks cache, restricts search results to Zambia ('ZM')
 */
export async function searchPlacesAutocomplete(
  query: string
): Promise<Array<{ placeId: string; formattedAddress: string; mainText: string }>> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  // 1. Check client-side session cache
  if (memoryPlacesCache.has(normalizedQuery)) {
    return memoryPlacesCache.get(normalizedQuery) || [];
  }

  try {
    const cachedString = localStorage.getItem(CACHE_PLACES_KEY);
    if (cachedString) {
      const persisted = JSON.parse(cachedString);
      if (persisted[normalizedQuery]) {
        memoryPlacesCache.set(normalizedQuery, persisted[normalizedQuery]);
        return persisted[normalizedQuery];
      }
    }
  } catch (err) {
    console.warn("Error accessing localStorage places cache", err);
  }

  // 2. Fetch from backend API proxy
  try {
    const response = await fetch("/api/maps/autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.predictions)) {
        // Cache the result
        memoryPlacesCache.set(normalizedQuery, data.predictions);
        persistToLocalStorage(CACHE_PLACES_KEY, normalizedQuery, data.predictions);
        return data.predictions;
      }
    }
  } catch (err) {
    console.error("[Google Maps Service] Autocomplete lookup failed", err);
  }

  // 3. Realistic Zambia fallback search in case of offline/lack-of-credentials
  return filterMockZambiaPlaces(query);
}

/**
 * Geocoding Service layer - Converts placeId or address to {lat, lng, address}
 * Caches coordinates permanently so we do not trigger multiple geocode charges.
 */
export async function geocodeAddress(
  address: string,
  placeId?: string
): Promise<GeoLocation> {
  const cacheKey = placeId || address.toLowerCase().trim();

  // Check caches
  if (memoryGeocodeCache.has(cacheKey)) {
    return memoryGeocodeCache.get(cacheKey)!;
  }

  try {
    const cachedString = localStorage.getItem(CACHE_GEOCODE_KEY);
    if (cachedString) {
      const persisted = JSON.parse(cachedString);
      if (persisted[cacheKey]) {
        const cachedLoc = persisted[cacheKey];
        memoryGeocodeCache.set(cacheKey, cachedLoc);
        return cachedLoc;
      }
    }
  } catch (e) {
    console.warn("Error checking geocode storage cache", e);
  }

  // Use proxy API
  try {
    const response = await fetch("/api/maps/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, placeId }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.latitude && data.longitude) {
        const result: GeoLocation = {
          address: data.address || address,
          latitude: data.latitude,
          longitude: data.longitude,
          placeId: data.placeId || placeId,
        };

        memoryGeocodeCache.set(cacheKey, result);
        persistToLocalStorage(CACHE_GEOCODE_KEY, cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.error("[Google Maps Service] Geocoding lookup failed", err);
  }

  // Safe fallback for Zambia coordinates
  const fallback = resolveMockZambiaCoordinates(address);
  memoryGeocodeCache.set(cacheKey, fallback);
  persistToLocalStorage(CACHE_GEOCODE_KEY, cacheKey, fallback);
  return fallback;
}

/**
 * Routes API / Rider Navigation Route resolver
 * Connects origin point to destination point. Caches results during active delivery.
 */
export async function computeRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<RouteData> {
  const cacheKey = `${originLat.toFixed(4)},${originLng.toFixed(4)}->${destLat.toFixed(4)},${destLng.toFixed(4)}`;

  if (memoryRouteCache.has(cacheKey)) {
    return memoryRouteCache.get(cacheKey)!;
  }

  try {
    const cachedString = localStorage.getItem(CACHE_ROUTE_KEY);
    if (cachedString) {
      const persisted = JSON.parse(cachedString);
      if (persisted[cacheKey]) {
        const cachedRoute = persisted[cacheKey];
        memoryRouteCache.set(cacheKey, cachedRoute);
        return cachedRoute;
      }
    }
  } catch (e) {
    console.warn("Storage route cache read fail", e);
  }

  try {
    const response = await fetch("/api/maps/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originLat, originLng, destLat, destLng }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.polyline) {
        const routeResult: RouteData = {
          distanceKm: Number(data.distanceKm) || 5,
          durationMinutes: Number(data.durationMinutes) || 12,
          polyline: data.polyline,
          pickupLat: originLat,
          pickupLng: originLng,
          dropoffLat: destLat,
          dropoffLng: destLng,
        };
        memoryRouteCache.set(cacheKey, routeResult);
        persistToLocalStorage(CACHE_ROUTE_KEY, cacheKey, routeResult);
        return routeResult;
      }
    }
  } catch (e) {
    console.error("Compute real route endpoint error", e);
  }

  // Mock Route solver if backend doesn't resolve or key is omitted
  const mockRoute = generateMockZambiaRoute(originLat, originLng, destLat, destLng);
  memoryRouteCache.set(cacheKey, mockRoute);
  persistToLocalStorage(CACHE_ROUTE_KEY, cacheKey, mockRoute);
  return mockRoute;
}

/**
 * Delivery Fee Calculation Engine based on Zambia logistic rates
 */
export function calculateDeliveryFee(
  distanceKm: number,
  baseFee: number = 45.0,
  ratePerKm: number = 5.5
): number {
  const fee = baseFee + distanceKm * ratePerKm;
  return Math.round(fee * 100) / 100;
}

// helper to persist items to localStorage safely in key-value structure
function persistToLocalStorage(masterKey: string, subKey: string, val: any) {
  try {
    const raw = localStorage.getItem(masterKey) || "{}";
    const cacheObj = JSON.parse(raw);
    cacheObj[subKey] = val;
    // Cap localStorage size so we don't blow quota
    if (Object.keys(cacheObj).length > 100) {
      delete cacheObj[Object.keys(cacheObj)[0]];
    }
    localStorage.setItem(masterKey, JSON.stringify(cacheObj));
  } catch (e) {
    console.warn("Could not save map key to storage helper", e);
  }
}

// Mock Zambia place predictions for autocomplete
const CONSTANT_ZAMBIA_PLACES = [
  { placeId: "zm_p1", formattedAddress: "Manda Hill Mall, Great East Rd, Lusaka, Zambia", mainText: "Manda Hill Mall" },
  { placeId: "zm_p2", formattedAddress: "Levy Junction Mall, Church Rd, Lusaka, Zambia", mainText: "Levy Junction Mall" },
  { placeId: "zm_p3", formattedAddress: "University of Zambia (UNZA), Great East Rd, Lusaka, Zambia", mainText: "University of Zambia" },
  { placeId: "zm_p4", formattedAddress: "East Park Mall, Great East Rd, Lusaka, Zambia", mainText: "East Park Mall" },
  { placeId: "zm_p5", formattedAddress: "Soweto Market, Los Angeles Rd, Lusaka, Zambia", mainText: "Soweto Market" },
  { placeId: "zm_p6", formattedAddress: "Kabulonga Crossroads Mall, Kabulonga, Lusaka, Zambia", mainText: "Kabulonga Crossroads Mall" },
  { placeId: "zm_p7", formattedAddress: "Chelstone General Clinic, Ngwerere Rd, Lusaka, Zambia", mainText: "Chelstone Clinic" },
  { placeId: "zm_p8", formattedAddress: "Ndola Golf Club Fields, Ndola, Zambia", mainText: "Ndola Golf Club" },
  { placeId: "zm_p9", formattedAddress: "Kitwe Town Center Square, Kitwe, Zambia", mainText: "Kitwe Town Center" },
  { placeId: "zm_p10", formattedAddress: "Mukuba Mall, President Avenue, Kitwe, Zambia", mainText: "Mukuba Mall" },
  { placeId: "zm_p11", formattedAddress: "Chilimbulu Road Hub, Kabwata, Lusaka, Zambia", mainText: "Kabwata Chilimbulu Rd" },
  { placeId: "zm_p12", formattedAddress: "Chilenje Shopping Complex, Chilenje, Lusaka, Zambia", mainText: "Chilenje Mall" },
  { placeId: "zm_p13", formattedAddress: "Woodlands Shopping Mall, Giga Rd, Lusaka, Zambia", mainText: "Woodlands Mall" },
  { placeId: "zm_p14", formattedAddress: "Zambia National Assembly, Parliament Rd, Lusaka, Zambia", mainText: "National Assembly Offices" },
  { placeId: "zm_p15", formattedAddress: "Kenneth Kaunda International Airport, Lusaka, Zambia", mainText: "Kenneth Kaunda Airport" }
];

function filterMockZambiaPlaces(query: string) {
  const norm = query.toLowerCase();
  return CONSTANT_ZAMBIA_PLACES.filter(
    (p) =>
      p.mainText.toLowerCase().includes(norm) ||
      p.formattedAddress.toLowerCase().includes(norm)
  );
}

// Convert address keywords to exact mock coordinates in coordinates of Zambia
function resolveMockZambiaCoordinates(address: string): GeoLocation {
  const norm = address.toLowerCase();
  let lat = -15.4167; // default Lusaka
  let lng = 28.2833;

  if (norm.includes("manda hill")) {
    lat = -15.3992; lng = 28.3091;
  } else if (norm.includes("levy junction")) {
    lat = -15.4194; lng = 28.2862;
  } else if (norm.includes("unza") || norm.includes("university of zambia")) {
    lat = -15.4012; lng = 28.3294;
  } else if (norm.includes("east park")) {
    lat = -15.3981; lng = 28.3183;
  } else if (norm.includes("soweto")) {
    lat = -15.4295; lng = 28.2714;
  } else if (norm.includes("kabulonga")) {
    lat = -15.4183; lng = 28.3402;
  } else if (norm.includes("chelstone")) {
    lat = -15.3781; lng = 28.3694;
  } else if (norm.includes("ndola")) {
    lat = -12.9715; lng = 28.6412;
  } else if (norm.includes("kitwe") || norm.includes("mukuba")) {
    lat = -12.8021; lng = 28.2034;
  } else if (norm.includes("kabwata")) {
    lat = -15.4385; lng = 28.3111;
  } else if (norm.includes("chilenje")) {
    lat = -15.4521; lng = 28.3256;
  } else if (norm.includes("woodlands")) {
    lat = -15.4391; lng = 28.3321;
  } else {
    // Generate slight pseudo-random fuzz from Lusaka center to simulate reverse geocoding
    const seed = address.length % 5;
    lat = -15.4167 + (seed - 2) * 0.015;
    lng = 28.2833 + (seed - 2) * 0.012;
  }

  return {
    address,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6))
  };
}

// Generate gorgeous mock routing vectors with realistic zigzag coordinates following streets
function generateMockZambiaRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): RouteData {
  // Great Circle distance approximate formula
  const r = 6371; // km
  const dLat = ((destLat - originLat) * Math.PI) / 180;
  const dLng = ((destLng - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = r * c;

  // Add a multiplier for street routing detour (standard 1.25x in Lusaka layout)
  const distanceKm = Math.round(straightDistance * 1.28 * 10) / 10 || 1.5;
  const averageSpeedKmH = 28; // Traffic fuzzed and standard roads
  const durationMinutes = Math.round((distanceKm / averageSpeedKmH) * 60) || 5;

  // Create real mock polyline list of coordinates to do beautiful rendering
  const steps: google.maps.LatLngLiteral[] = [];
  const numSteps = 7;
  for (let i = 0; i <= numSteps; i++) {
    const ratio = i / numSteps;
    let lat = originLat + (destLat - originLat) * ratio;
    let lng = originLng + (destLng - originLng) * ratio;

    // Add zig-zag pattern mapping street blocks
    if (i > 0 && i < numSteps) {
      const orthogonalOffset = 0.0025 * Math.sin(ratio * Math.PI * 2.5);
      if (i % 2 === 0) {
        lat += orthogonalOffset;
      } else {
        lng += orthogonalOffset;
      }
    }
    steps.push({ lat, lng });
  }

  // Convert points to standard encoded polyline (compressed mock format or path list)
  const polylineMarkerString = JSON.stringify(steps);

  return {
    distanceKm,
    durationMinutes,
    polyline: polylineMarkerString,
    pickupLat: originLat,
    dropoffLat: destLat,
    pickupLng: originLng,
    dropoffLng: destLng
  };
}
