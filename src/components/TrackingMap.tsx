import { useState, useEffect, useRef } from "react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Store, User, Bike, Compass, Shield } from "lucide-react";
import { Order } from "@/src/types";
import { geocodeAddress, hasValidGoogleMapsKey, getGoogleMapsApiKey } from "../services/googleMapsService";

interface TrackingMapProps {
  order: Order;
  merchantLocation: string;
  buyerLocation: string;
  currentStepNum: number;
}

interface Coords {
  lat: number;
  lng: number;
}

// Inner helper component to draw route and manage fitBounds on real Google Map
function MapRouteAndRider({
  merchant,
  buyer,
  rider,
}: {
  merchant: Coords;
  buyer: Coords;
  rider: Coords;
}) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clear previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create polyline along the path
    polylineRef.current = new google.maps.Polyline({
      path: [merchant, rider, buyer],
      geodesic: true,
      strokeColor: "#f59e0b", // Amber 500
      strokeOpacity: 0.85,
      strokeWeight: 4,
      map: map,
    });

    // Fit map bounds to contain all points with some padding
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(merchant);
    bounds.extend(rider);
    bounds.extend(buyer);
    
    // Zoom in safely without being too extreme
    map.fitBounds(bounds, {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map, merchant, buyer, rider]);

  return null;
}

export default function TrackingMap({
  order,
  merchantLocation,
  buyerLocation,
  currentStepNum,
}: TrackingMapProps) {
  const [merchantCoords, setMerchantCoords] = useState<Coords>({ lat: -15.3992, lng: 28.3091 }); // Chisamba/Lusaka north default
  const [buyerCoords, setBuyerCoords] = useState<Coords>({ lat: -15.4385, lng: 28.3111 }); // Kabwata default
  const [isLoading, setIsLoading] = useState(true);

  // Resolve coordinates asynchronously
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    async function resolveCoords() {
      try {
        const merchantGeo = await geocodeAddress(merchantLocation);
        const buyerGeo = await geocodeAddress(buyerLocation);

        if (active) {
          if (merchantGeo && merchantGeo.latitude && merchantGeo.longitude) {
            setMerchantCoords({ lat: merchantGeo.latitude, lng: merchantGeo.longitude });
          }
          if (buyerGeo && buyerGeo.latitude && buyerGeo.longitude) {
            setBuyerCoords({ lat: buyerGeo.latitude, lng: buyerGeo.longitude });
          }
        }
      } catch (err) {
        console.warn("Tracking map geocode failed, using defaults", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    resolveCoords();
    return () => {
      active = false;
    };
  }, [merchantLocation, buyerLocation]);

  // Interpolate rider coordinates based on current transit step
  // 1: Payment Confirmed (0% - Rider at Merchant)
  // 2: Collected from Seller 1 (10% - Just started)
  // 3: En route to Seller 2 (45% - Midway)
  // 4: En route to Buyer (80% - Near buyer)
  // 5: Delivered (100% - Arrived at buyer)
  let progressPercent = 0;
  if (currentStepNum === 1) progressPercent = 0;
  else if (currentStepNum === 2) progressPercent = 10;
  else if (currentStepNum === 3) progressPercent = 45;
  else if (currentStepNum === 4) progressPercent = 80;
  else if (currentStepNum === 5) progressPercent = 100;

  const riderCoords: Coords = {
    lat: merchantCoords.lat + (buyerCoords.lat - merchantCoords.lat) * (progressPercent / 100),
    lng: merchantCoords.lng + (buyerCoords.lng - merchantCoords.lng) * (progressPercent / 100),
  };

  const hasKey = hasValidGoogleMapsKey();

  // Metrics for presentation
  const estimatedDistance = (order.total_distance_km || 4.8) * (1 - progressPercent / 100);
  const formattedDistance = estimatedDistance > 0 ? `${estimatedDistance.toFixed(1)} km` : "Arrived";
  const estimatedETA = Math.round((order.rider_eta_mins || 15) * (1 - progressPercent / 100));
  const formattedETA = estimatedETA > 0 ? `${estimatedETA} mins` : "Delivered";

  return (
    <div className="bg-[#0b0c10] border border-zinc-850 rounded-2xl overflow-hidden relative shadow-xl flex flex-col">
      {/* Top Telemetry Header */}
      <div className="bg-zinc-950/80 px-4 py-2 border-b border-zinc-900 flex justify-between items-center text-[10.5px] font-mono z-10">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>RIDER LIVE TRACKING</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">
            Rem: <strong className="text-amber-400">{formattedDistance}</strong>
          </span>
          <span className="text-zinc-500">
            ETA: <strong className="text-teal-400">{formattedETA}</strong>
          </span>
        </div>
      </div>

      {/* Map Window Container */}
      <div className="h-[220px] relative w-full bg-[#050507]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-zinc-950/50 backdrop-blur-sm z-20">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-mono text-zinc-400">Calibrating Escrow Satellites...</span>
          </div>
        ) : null}

        {hasKey ? (
          <APIProvider apiKey={getGoogleMapsApiKey()} version="weekly">
            <GoogleMap
              defaultCenter={riderCoords}
              defaultZoom={13}
              mapId="BUYER_LIVE_TRACKING_MAP"
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              style={{ width: "100%", height: "100%" }}
              gestureHandling="cooperative"
            >
              {/* Merchant Marker */}
              <AdvancedMarker position={merchantCoords}>
                <Pin background="#0d9488" glyphColor="#fff" scale={0.95}>
                  <span className="text-[9px] font-bold">A</span>
                </Pin>
              </AdvancedMarker>

              {/* Buyer Marker */}
              <AdvancedMarker position={buyerCoords}>
                <Pin background="#e11d48" glyphColor="#fff" scale={0.95}>
                  <span className="text-[9px] font-bold">B</span>
                </Pin>
              </AdvancedMarker>

              {/* Rider Marker (Only show if not delivered yet, otherwise they are at buyer) */}
              {currentStepNum < 5 && (
                <AdvancedMarker position={riderCoords}>
                  <div className="bg-amber-500 text-black border border-black font-bold p-1 rounded-full shadow-lg flex items-center justify-center w-7 h-7 transform -translate-y-1">
                    <Bike className="w-4 h-4" />
                  </div>
                </AdvancedMarker>
              )}

              {/* Live line renderer & focus setter */}
              <MapRouteAndRider merchant={merchantCoords} buyer={buyerCoords} rider={riderCoords} />
            </GoogleMap>
          </APIProvider>
        ) : (
          /* FALLBACK ABSTRACT VECTOR MAP SIMULATION */
          <div className="absolute inset-0 overflow-hidden bg-zinc-950 flex flex-col justify-between p-4 select-none">
            {/* Visual coordinate Grid lines overlay */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-zinc-200" />
              ))}
            </div>

            {/* Custom vector road/route path */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              {/* Grid Roads */}
              <line x1="10%" y1="0%" x2="10%" y2="100%" stroke="#52525b" strokeWidth="2" />
              <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#52525b" strokeWidth="2" />
              <line x1="90%" y1="0%" x2="90%" y2="100%" stroke="#52525b" strokeWidth="2" />
              <line x1="0%" y1="20%" x2="100%" y2="20%" stroke="#52525b" strokeWidth="2" />
              <line x1="0%" y1="60%" x2="100%" y2="60%" stroke="#52525b" strokeWidth="2" />
              <line x1="0%" y1="80%" x2="100%" y2="80%" stroke="#52525b" strokeWidth="2" />

              {/* Active Route highlighting line */}
              <path
                d="M 60,60 L 150,110 L 280,160"
                fill="none"
                stroke="#374151"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Highlight route */}
              <path
                d="M 60,60 L 150,110 L 280,160"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="5,5"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>

            {/* Abstract markers placement */}
            {/* Merchant point A (Left-top region) */}
            <div className="absolute left-[60px] top-[45px] flex flex-col items-center">
              <div className="bg-teal-500/10 border border-teal-500 text-teal-400 p-1.5 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-mono font-bold text-teal-400 mt-1 bg-black/80 px-1.5 py-0.2 rounded border border-teal-500/10">
                MERCHANT
              </span>
            </div>

            {/* Buyer point B (Right-bottom region) */}
            <div className="absolute right-[60px] bottom-[45px] flex flex-col items-center">
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[8px] font-mono font-bold text-red-400 mt-1 bg-black/80 px-1.5 py-0.2 rounded border border-red-500/10">
                BUYER
              </span>
            </div>

            {/* Animated Courier Moto Rider moving along route based on progress */}
            {(() => {
              // Calculate screen coordinates based on progress percent
              // Start: (80px, 60px)
              // Mid: (170px, 110px)
              // End: (280px, 160px) (approximates)
              const startX = 80;
              const startY = 65;
              const endX = 265;
              const endY = 155;

              const x = startX + (endX - startX) * (progressPercent / 100);
              const y = startY + (endY - startY) * (progressPercent / 100);

              return (
                <div
                  className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                  style={{ left: `${x}px`, top: `${y}px` }}
                >
                  <div className="bg-amber-500 text-black border border-black font-bold p-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center w-8 h-8 animate-bounce">
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="text-[8.5px] font-black font-mono text-amber-400 mt-1 bg-zinc-950 px-1.5 py-0.2 rounded border border-amber-500/20 uppercase tracking-wider">
                    {currentStepNum === 5 ? "Arrived" : "Rider"}
                  </span>
                </div>
              );
            })()}

            {/* Small floating status overlay inside simulation */}
            <div className="absolute bottom-2 left-2 bg-black/90 border border-zinc-900 rounded-lg p-2 flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Simulated Zambia Vector Space</span>
            </div>
          </div>
        )}
      </div>

      {/* Address Telemetry Footer info */}
      <div className="bg-zinc-950 p-3 border-t border-zinc-900 grid grid-cols-2 gap-3 text-left">
        <div className="space-y-0.5 border-r border-zinc-900 pr-2">
          <span className="text-[8.5px] font-mono text-zinc-550 block uppercase tracking-wider font-extrabold">FROM (Merchant)</span>
          <span className="text-[10px] text-zinc-300 font-medium truncate block" title={merchantLocation}>
            {merchantLocation}
          </span>
        </div>
        <div className="space-y-0.5 pl-1">
          <span className="text-[8.5px] font-mono text-zinc-555 block uppercase tracking-wider font-extrabold">TO (Delivery Destination)</span>
          <span className="text-[10px] text-zinc-300 font-medium truncate block" title={buyerLocation}>
            {buyerLocation}
          </span>
        </div>
      </div>
    </div>
  );
}
