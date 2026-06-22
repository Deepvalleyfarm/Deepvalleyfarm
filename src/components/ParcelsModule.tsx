import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Map,
  MapPin, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ArrowLeft, 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  Package, 
  Smartphone, 
  User, 
  Activity, 
  ShieldCheck, 
  Compass, 
  ArrowRight, 
  DollarSign, 
  Star, 
  Download, 
  Check, 
  Share2, 
  Calendar, 
  Truck,
  RotateCcw,
  Navigation,
  Globe,
  Settings,
  Shield,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SavedLocation, ParcelJob, AdminConfig } from "../types";
import { searchPlacesAutocomplete, geocodeAddress, calculateDeliveryFee, hasValidGoogleMapsKey, getGoogleMapsApiKey } from "../services/googleMapsService";
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import PayoutAdminPanel from "./payout/PayoutAdminPanel";

interface ParcelsModuleProps {
  userRole: "BUYER" | "SELLER" | "AGENT";
  userId: string;
  userName: string;
  savedLocations: SavedLocation[];
  setSavedLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  recentLocations: SavedLocation[];
  setRecentLocations: React.Dispatch<React.SetStateAction<SavedLocation[]>>;
  parcelJobs: ParcelJob[];
  setParcelJobs: React.Dispatch<React.SetStateAction<ParcelJob[]>>;
  adminConfig: AdminConfig;
  setAdminConfig: (cfg: AdminConfig) => void;
  onSpawnToast: (toast: { message: string; subText?: string }) => void;
  portfolioSellers?: { seller_id: string; name: string }[];
}

export default function ParcelsModule({
  userRole,
  userId,
  userName,
  savedLocations,
  setSavedLocations,
  recentLocations,
  setRecentLocations,
  parcelJobs,
  setParcelJobs,
  adminConfig,
  setAdminConfig,
  onSpawnToast,
  portfolioSellers = [
    { seller_id: "sel-chipo", name: "Chisamba Organic Cooperatives" },
    { seller_id: "sel-mwansa", name: "Chapo Grill & Diner" },
    { seller_id: "sel-bwalya", name: "Bwalya Smart Tech" }
  ]
}: ParcelsModuleProps) {
  // Navigation states
  const [currentTab, setCurrentTab] = useState<"SEND" | "HISTORY" | "MANAGE_LOCS" | "ADMIN">("SEND");
  const [flowStep, setFlowStep] = useState<"LOBBY" | "STEP1" | "STEP2" | "STEP3" | "WAITING">("LOBBY");

  // Active tracking state
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Form states for New Parcel Job
  const [description, setDescription] = useState("");
  const [weightKg, setWeightKg] = useState<number>(1);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [collectionLandmark, setCollectionLandmark] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("Lusaka");
  
  const [recipientMode, setRecipientMode] = useState<"search" | "manual">("search");
  const [recipientSearchText, setRecipientSearchText] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientLandmark, setRecipientLandmark] = useState("");
  const [recipientId, setRecipientId] = useState<string | null>(null);

  // Address entry triggers
  const [activeAddressField, setActiveAddressField] = useState<"collection" | "delivery" | null>(null);
  const [isSelectLocationModalOpen, setIsSelectLocationModalOpen] = useState(false);

  // Calculated values
  const [distanceKm, setDistanceKm] = useState(4.5);
  const [paymentWallet, setPaymentWallet] = useState<"Airtel" | "MTN" | "Zamtel">("Airtel");
  const [isPaying, setIsPaying] = useState(false);

  // Agent Portfolio Target
  const [selectedSellerOnBehalf, setSelectedSellerOnBehalf] = useState<string>("self");

  // Saved location/recent list manager modal editing states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locModalMode, setLocModalMode] = useState<"create" | "edit">("create");
  const [locEditId, setLocEditId] = useState<string | null>(null);
  const [locNickname, setLocNickname] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locLandmark, setLocLandmark] = useState("");
  const [locLat, setLocLat] = useState(-15.4167);
  const [locLng, setLocLng] = useState(28.2833);
  const [locCity, setLocCity] = useState("Lusaka");
  const [locZone, setLocZone] = useState("Lusaka Central");
  const [locSaveToLibrary, setLocSaveToLibrary] = useState(true);
  const [locIsDefault, setLocIsDefault] = useState(false);
  const [mapDragging, setMapDragging] = useState(false);

  // Autocomplete suggestions search
  const [autoCompleteQuery, setAutoCompleteQuery] = useState("");
  const [resolvedSuggestions, setResolvedSuggestions] = useState<Array<{ placeId: string; formattedAddress: string; mainText: string }>>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  useEffect(() => {
    if (autoCompleteQuery.trim().length < 3) {
      setResolvedSuggestions([]);
      return;
    }
    setIsSearchingPlaces(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchPlacesAutocomplete(autoCompleteQuery);
        setResolvedSuggestions(results);
      } catch (err) {
        console.error("Places suggestion lookup failed", err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 500); // 500ms debounce count

    return () => clearTimeout(delayDebounceFn);
  }, [autoCompleteQuery]);

  const googlePlacesMocks = [
    { name: "Manda Hill Mall", secondary: "Great East Rd, Lusaka", lat: -15.399, lng: 28.309 },
    { name: "Levy Junction Mall", secondary: "Church Rd, Lusaka", lat: -15.419, lng: 28.286 },
    { name: "University of Zambia", secondary: "Kalingalinga, Lusaka", lat: -15.401, lng: 28.329 },
    { name: "East Park Mall", secondary: "Great East Rd, Lusaka", lat: -15.398, lng: 28.318 },
    { name: "Munali Hills Compound", secondary: "Munali, Lusaka", lat: -15.405, lng: 28.341 },
    { name: "Soweto Hub Central Market", secondary: "Soweto, Lusaka", lat: -15.429, lng: 28.271 },
    { name: "Chelstone General Clinic", secondary: "Chelstone, Lusaka", lat: -15.378, lng: 28.369 },
    { name: "Kabulonga Crossroads", secondary: "Kabulonga, Lusaka", lat: -15.418, lng: 28.340 },
    { name: "Ndola Golf Club Fields", secondary: "Ndola Golf Area, Ndola", lat: -12.971, lng: 28.641 },
    { name: "Kitwe Town Center Square", secondary: "Kitwe Downtown, Kitwe", lat: -12.802, lng: 28.203 }
  ];

  // Static user directory for Search
  const platformUsersMock = [
    { id: "usr-chileshe", name: "Chileshe Mwamba", phone: "0971002003", address: "Kabulonga Rd, House A2, Lusaka", landmark: "Opposite Kabulonga Mall Gate" },
    { id: "usr-tamara", name: "Tamara Phiri", phone: "0962334455", address: "Chelstone Compound, Zone 4", landmark: "Opposite Chelstone Market Clinic" },
    { id: "usr-mutale", name: "Mutale Kaunda", phone: "0955667788", address: "Manda Land, Flats 12, Lusaka", landmark: "Beside Hungry Lion Parking Lot" },
    { id: "usr-chipo", name: "Chipo Nalungu", phone: "0977889900", address: "Soweto Post Office Complex", landmark: "Yellow stand" }
  ];

  // Filter parcel list by role and seller ID
  const [adminSellerFilter, setAdminSellerFilter] = useState("all");

  // Load setup on load
  useEffect(() => {
    // If we have default address saved, populate step 1 collection
    const def = savedLocations.find(l => l.is_default);
    if (def) {
      setCollectionAddress(def.address_string);
      setCollectionLandmark(def.landmark_note || "");
    }
  }, [savedLocations]);

  // Derived filtered listing of parcels sent
  const visibleParcels = parcelJobs.filter(p => {
    // If agent, can see their own + sellers in portfolio
    if (userRole === "AGENT") {
      if (adminSellerFilter === "all") return true;
      if (adminSellerFilter === "self") return p.sender_id === userId && p.sender_role === "AGENT";
      return p.sender_seller_id === adminSellerFilter;
    }
    // Seller only sees their own
    if (userRole === "SELLER") return p.sender_id === userId && p.sender_role === "SELLER";
    // Buyer only sees their own
    return p.sender_id === userId && p.sender_role === "BUYER";
  });

  // Calculate pricing
  const subtotalFee = distanceKm * adminConfig.parcelDeliveryFeePerKm;
  const platformFee = adminConfig.parcelPlatformFee;
  const processingFee = (subtotalFee + platformFee) * (adminConfig.paymentProcessingPct / 100);
  const grandTotal = subtotalFee + platformFee + processingFee;

  // Handler: trigger custom address entry dialog
  const openAddressSelector = (field: "collection" | "delivery") => {
    setActiveAddressField(field);
    setAutoCompleteQuery("");
    setIsSelectLocationModalOpen(true);
  };

  // Set selected address from any source
  const handleSelectAddressRecord = (addrString: string, landmark: string, lat: number, lng: number, city: string) => {
    if (activeAddressField === "collection") {
      setCollectionAddress(addrString);
      setCollectionLandmark(landmark);
      setDeliveryCity(city);
    } else {
      setRecipientAddress(addrString);
      setRecipientLandmark(landmark);
      // Calculate a dynamic simulated distance
      const baseDistance = Math.max(1.8, Math.round(Math.abs(lat - (-15.4167)) * 110 * 10) / 10);
      setDistanceKm(baseDistance);
    }
    setIsSelectLocationModalOpen(false);
    onSpawnToast({
      message: `${activeAddressField === "collection" ? "Collection" : "Delivery"} address set`,
      subText: `${addrString} verified.`
    });
  };

  // Simulate Map drag
  const handleMapConfirmLocation = () => {
    setIsLocationModalOpen(false);
    // Proceed to Step 4 layout inside modal
    // Let's open creation screen with prefilled values from Pin coordinates
    setLocModalMode("create");
    setLocNickname(locNickname || "Selected Pin");
    setLocAddress(locAddress || `Zambia Highway, Lusaka (${locLat.toFixed(4)}, ${locLng.toFixed(4)})`);
    setLocLandmark(locLandmark || "Pin Dropped manually");
    setLocSaveToLibrary(true);
    setIsLocationModalOpen(true);
  };

  // Save new Location item
  const handleSaveLocation = () => {
    if (!locAddress) return;
    
    // Create new SavedLocation
    const newLoc: SavedLocation = {
      location_id: locEditId || `loc-${Date.now()}`,
      nickname: locNickname || "Custom Place",
      address_string: locAddress,
      landmark_note: locLandmark,
      latitude: locLat,
      longitude: locLng,
      city: locCity,
      zone: locZone,
      usage_count: 1,
      last_used_at: new Date().toISOString(),
      is_default: locIsDefault
    };

    if (locIsDefault) {
      // remove old default
      setSavedLocations(prev => prev.map(l => ({ ...l, is_default: false })));
    }

    if (locSaveToLibrary) {
      if (locModalMode === "edit") {
        setSavedLocations(prev => prev.map(l => l.location_id === locEditId ? newLoc : l));
        onSpawnToast({ message: "Address updated successfully" });
      } else {
        setSavedLocations(prev => [newLoc, ...prev]);
        onSpawnToast({ message: "Address saved to Saved Locations" });
      }
    } else {
      setRecentLocations(prev => [newLoc, ...prev.slice(0, 9)]);
    }

    // Now populate whichever field we were entering
    if (activeAddressField) {
      handleSelectAddressRecord(
        newLoc.address_string,
        newLoc.landmark_note || "",
        newLoc.latitude,
        newLoc.longitude,
        newLoc.city
      );
    }
    setIsLocationModalOpen(false);
  };

  // Trigger geolocation mock
  const handleTriggerMockGeolocation = () => {
    const mockLat = -15.421 + (Math.random() - 0.5) * 0.05;
    const mockLng = 28.283 + (Math.random() - 0.5) * 0.05;
    const sampleAddrs = [
      "Munali Compound, Chuma Rd, Lusaka",
      "Kalingalinga Main Rd, Lusaka",
      "Woodlands Extension, Phase 2, Lusaka",
      "Kabulonga Palms Estate, Lusaka"
    ];
    const pickedAddr = sampleAddrs[Math.floor(Math.random() * sampleAddrs.length)];
    
    setLocLat(mockLat);
    setLocLng(mockLng);
    setLocAddress(pickedAddr);
    setLocCity("Lusaka");
    setLocZone("Lusaka East");
    onSpawnToast({
      message: "Current position resolved via GPS",
      subText: pickedAddr
    });
  };

  // Recipient search matching
  const handlePickSearchedRecipient = (user: any) => {
    setRecipientId(user.id);
    setRecipientName(user.name);
    setRecipientPhone(user.phone);
    setRecipientAddress(user.address);
    setRecipientLandmark(user.landmark);
    setRecipientSearchText("");
    
    // Simulate coordinates and distance
    const randDist = parseFloat((2.5 + Math.random() * 8).toFixed(1));
    setDistanceKm(randDist);

    onSpawnToast({
      message: `User ${user.name} linked to parcel`,
      subText: `Verified address: ${user.address}`
    });
  };

  // Pay and trigger parcel job dispatch
  const handleProcessParcelPayment = () => {
    if (!description) {
      onSpawnToast({ message: "Please enter parcel description" });
      return;
    }
    if (!recipientName || !recipientPhone || !recipientAddress) {
      onSpawnToast({ message: "Please complete recipient details" });
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      // Successful simulated Lipila checkout
      const newPclId = `SNC-PCL-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const newJob: ParcelJob = {
        parcel_id: newPclId,
        sender_id: userId,
        sender_name: userName,
        sender_role: userRole,
        sender_seller_id: selectedSellerOnBehalf !== "self" ? selectedSellerOnBehalf : undefined,
        description,
        weight_kg: weightKg,
        collection_address: collectionAddress,
        collection_landmark: collectionLandmark,
        delivery_address: recipientAddress,
        delivery_landmark: recipientLandmark,
        delivery_city: deliveryCity,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        is_registered_recipient: !!recipientId,
        delivery_fee: subtotalFee,
        platform_fee: platformFee,
        processing_fee: processingFee,
        grand_total: grandTotal,
        payment_wallet: paymentWallet,
        status: "searching_rider",
        created_at: new Date().toISOString(),
        distance_km: distanceKm,
        sms_sent: false
      };

      setParcelJobs([newJob, ...parcelJobs]);
      setActiveTrackingId(newPclId);
      setFlowStep("WAITING");
      setIsPaying(false);

      // Save collection and shipping as recent address history
      const savedCollectionObj: SavedLocation = {
        location_id: `loc-col-${Date.now()}`,
        nickname: "Recent Collection",
        address_string: collectionAddress,
        landmark_note: collectionLandmark,
        latitude: -15.416,
        longitude: 28.283,
        city: deliveryCity,
        zone: "Lusaka Central",
        usage_count: 1,
        last_used_at: new Date().toISOString()
      };
      setRecentLocations(prev => [savedCollectionObj, ...prev.filter(r => r.address_string !== collectionAddress).slice(0, 5)]);

      const savedTransitObj: SavedLocation = {
        location_id: `loc-del-${Date.now()}`,
        nickname: recipientName,
        address_string: recipientAddress,
        landmark_note: recipientLandmark,
        latitude: -15.424,
        longitude: 28.324,
        city: deliveryCity,
        zone: "Lusaka Central",
        usage_count: 1,
        last_used_at: new Date().toISOString()
      };
      setRecentLocations(prev => [savedTransitObj, ...prev.filter(r => r.address_string !== recipientAddress).slice(0, 5)]);

      onSpawnToast({
        message: "Lipila Escrow Secured Successfully!",
        subText: `Transaction ID: SNC-TX-${Math.floor(400000 + Math.random() * 500000)}`
      });

      // Clear fields for future send
      setDescription("");
      setWeightKg(1);
      setRecipientName("");
      setRecipientPhone("");
      setRecipientAddress("");
      setRecipientLandmark("");
      setRecipientId(null);

      // Trigger automatic rider acceptance after 8 seconds
      setTimeout(() => {
        setParcelJobs(prev => prev.map(job => {
          if (job.parcel_id === newPclId && job.status === "searching_rider") {
            return {
              ...job,
              status: "rider_assigned",
              rider_id: "rid-lungu",
              rider_name: "Lungu Mwansa",
              rider_phone: "+260 976 554433",
              rider_photo: "🚴",
              rider_eta_mins: 12
            };
          }
          return job;
        }));
        onSpawnToast({
          message: "Rider assigned to parcel job!",
          subText: "Rider Lungu Mwansa is coming for pickup."
        });
      }, 7000);

    }, 2000);
  };

  // Action: Resend completed parcel (pre-fills form)
  const handleResendParcel = (prevJob: ParcelJob) => {
    setCollectionAddress(prevJob.collection_address);
    setCollectionLandmark(prevJob.collection_landmark || "");
    setDescription(prevJob.description);
    setWeightKg(prevJob.weight_kg);
    setRecipientName(prevJob.recipient_name);
    setRecipientPhone(prevJob.recipient_phone);
    setRecipientAddress(prevJob.delivery_address);
    setRecipientLandmark(prevJob.collection_landmark || "");
    setDistanceKm(prevJob.distance_km);
    setDeliveryCity(prevJob.delivery_city);
    
    setFlowStep("STEP1");
    onSpawnToast({
      message: "Form pre-filled from history",
      subText: `Sending to ${prevJob.recipient_name}`
    });
  };

  // Ratings submit
  const [activeRating, setActiveRating] = useState<number>(0);
  const handleRatingSubmit = (jobId: string, rating: number) => {
    setParcelJobs(visibleParcels.map(p => p.parcel_id === jobId ? { ...p, rating } : p));
    setActiveRating(0);
    onSpawnToast({
      message: "Thank you for rating!",
      subText: "Feedback sent to platform."
    });
  };

  // Receipt downloader simulator
  const handleDownloadReceipt = (job: ParcelJob) => {
    onSpawnToast({
      message: "Receipt generated successfully!",
      subText: `SNC-PCL-${job.parcel_id}.pdf is ready.`
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-start text-white bg-[#050506]">
      {/* Header Tabs */}
      <div className="flex bg-[#0b0c10] border-b border-zinc-900 px-2 py-1.5 justify-between items-center gap-2 shrink-0 flex-nowrap overflow-x-auto scrollbar-none no-scrollbar">
        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
          <Package className="w-3.5 h-3.5 text-[#ffa500] shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-zinc-100 select-none">Parcel Post</span>
          <span className="text-[8px] sm:text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1 py-0.5 rounded uppercase font-bold font-mono ml-1.5 select-none shrink-0">
            {userRole}
          </span>
        </div>
        
        <div className="flex gap-1 overflow-x-auto no-scrollbar shrink-0 select-none items-center">
          <button 
            type="button"
            onClick={() => { setCurrentTab("SEND"); setFlowStep("LOBBY"); }}
            className={`px-2 py-1 rounded-lg text-[8.5px] uppercase tracking-wider font-extrabold transition-all outline-none whitespace-nowrap shrink-0 ${
              currentTab === "SEND" ? "bg-[#ffa500]/10 text-[#ffa500] border border-[#ffa500]/25" : "text-zinc-500 hover:text-zinc-400 border border-transparent"
            }`}
          >
            🚀 Send
          </button>
          <button 
            type="button"
            onClick={() => setCurrentTab("HISTORY")}
            className={`px-2 py-1 rounded-lg text-[8.5px] uppercase tracking-wider font-extrabold transition-all outline-none whitespace-nowrap shrink-0 ${
              currentTab === "HISTORY" ? "bg-teal-500/10 text-teal-400 border border-teal-500/25" : "text-zinc-500 hover:text-zinc-400 border border-transparent"
            }`}
          >
            📜 History
          </button>
          <button 
            type="button"
            onClick={() => setCurrentTab("MANAGE_LOCS")}
            className={`px-2 py-1 rounded-lg text-[8.5px] uppercase tracking-wider font-extrabold transition-all outline-none whitespace-nowrap shrink-0 ${
              currentTab === "MANAGE_LOCS" ? "bg-blue-500/10 text-blue-400 border border-blue-500/25" : "text-zinc-500 hover:text-zinc-400 border border-transparent"
            }`}
          >
            📍 Address Hub
          </button>
          <button 
            type="button"
            onClick={() => setCurrentTab("ADMIN")}
            className={`px-2 py-1 rounded-lg text-[8.5px] uppercase tracking-wider font-extrabold transition-all outline-none whitespace-nowrap shrink-0 ${
              currentTab === "ADMIN" ? "bg-purple-500/10 text-purple-400 border border-purple-500/25" : "text-zinc-500 hover:text-zinc-400 border border-transparent"
            }`}
          >
            ⚙️ Admin
          </button>
        </div>
      </div>

      {/* Main viewport Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TAB 1: SEND PARCEL FLOW */}
        {currentTab === "SEND" && (
          <div className="space-y-4 text-left">
            
            {/* LOBBY VALUE PROPOSITION SCREEN */}
            {flowStep === "LOBBY" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#ffa100]/5 to-zinc-950 border border-zinc-850 p-4 rounded-2xl relative overflow-hidden text-left shadow-lg">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffa500]/5 rounded-full filter blur-xl"></div>
                  <Package className="w-10 h-10 text-[#ffa500] mb-2" />
                  <h3 className="text-base font-extrabold text-white">Selonachipa Instant Parcel Courier</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Safely dispatch envelopes, packs, hot meals, documents, and merchandise to any corner of the city. Backed by Lipila Mobile Escrow security.
                  </p>
                </div>

                {/* 3 Value Tiles */}
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="bg-[#0c0d12] border border-zinc-850/80 p-3 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest leading-none">Same-City Fast Delivery</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Riders in your local municipal zone accepted inside 15 seconds. Direct turn-by-turn routing.</p>
                    </div>
                  </div>

                  <div className="bg-[#0c0d12] border border-zinc-850/80 p-3 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ffa500]/10 text-[#ffa500] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-[#ffa500] uppercase tracking-widest leading-none">Escrow Protected Payout</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Fee remains in the secure wallet until pickup is validated by camera and recipient takes delivery.</p>
                    </div>
                  </div>

                  <div className="bg-[#0c0d12] border border-zinc-850/80 p-3 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-extrabold text-blue-400 uppercase tracking-widest leading-none">Real-time Receiver SMS</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Auto-triggered SMS alert with tracking number and live coordinates sent to receiver on rider pickup.</p>
                    </div>
                  </div>
                </div>

                {/* Agent portfolio context choice */}
                {userRole === "AGENT" && (
                  <div className="bg-purple-950/15 border border-purple-500/20 p-3 rounded-xl text-left space-y-2">
                    <label className="block text-[9.5px] text-purple-300 font-extrabold uppercase font-mono tracking-wider">
                      💼 Agent Consignment Mode
                    </label>
                    <p className="text-[10px] text-zinc-400">Specify whether dispatching on behalf of yourself or a portfolio seller:</p>
                    <select
                      value={selectedSellerOnBehalf}
                      onChange={(e) => setSelectedSellerOnBehalf(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-800 text-xs rounded-lg py-1.5 px-2 text-zinc-100 outline-none focus:border-purple-500"
                    >
                      <option value="self">My Personal Agent Commuter</option>
                      {portfolioSellers.map(sel => (
                        <option key={sel.seller_id} value={sel.seller_id}>
                          Sponsor dispatch: {sel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Main Action Button to Begin */}
                <button
                  type="button"
                  onClick={() => setFlowStep("STEP1")}
                  className="w-full bg-gradient-to-r from-[#ffa500] to-amber-600 hover:from-amber-500 hover:to-amber-600 font-black text-sm text-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-transform"
                >
                  <span>Send a Parcel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 1: PARCEL DETAILS */}
            {flowStep === "STEP1" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white">Step 1: Parcel Info</h3>
                  <span className="text-[9.5px] text-[#ffa500] font-mono uppercase font-bold tracking-widest bg-[#ffa500]/5 px-2 py-0.5 rounded border border-[#ffa500]/10">1 of 3</span>
                </div>

                <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  {/* Free-text Description */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Parcel Description (Visible for Rider)
                    </label>
                    <textarea
                      placeholder="e.g., A4 documents in a brown envelope, or two mobile phones in a sealed box."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full h-20 bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none placeholder-zinc-650 resize-opacity-30"
                    />
                    <p className="text-[9px] text-zinc-500">Be precise so the rider can audit and confirm packages at pickup.</p>
                  </div>

                  {/* Weight Numeric */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Estimated Weight (kg)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        max="30"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                        className="flex-1 bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none font-mono"
                      />
                      <span className="text-xs text-zinc-400 font-mono font-bold">KILOGRAMS</span>
                    </div>
                    <p className="text-[9px] text-zinc-500">Helps bicycle or motorbike riders evaluate loading capacity.</p>
                  </div>

                  {/* Collection address with search trigger & geolocation */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Collection Address
                    </label>
                    <div className="flex gap-2">
                      <div 
                        onClick={() => openAddressSelector("collection")}
                        className="flex-1 bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white cursor-pointer hover:border-zinc-700 flex items-center justify-between text-left"
                      >
                        <span className="truncate flex-1 pr-2">
                          {collectionAddress || "Tap to select collection address..."}
                        </span>
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerMockGeolocation}
                        className="bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 py-2.5 px-3 rounded-xl cursor-pointer flex items-center gap-1 text-[10px] text-teal-400 font-extrabold shrink-0"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>GPS</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Add Landmark or House Description (e.g. Near blue gate, house 14)"
                      value={collectionLandmark}
                      onChange={(e) => setCollectionLandmark(e.target.value)}
                      className="w-full bg-[#050506] border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#ffa500] focus:outline-none placeholder-zinc-650"
                    />
                  </div>

                  {/* Delivery City dropdown (restricted to same city limit) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                      Zambian Service City
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => {
                        const city = e.target.value;
                        setDeliveryCity(city);
                        if (city !== "Lusaka") {
                          onSpawnToast({
                            message: "Same-city restriction active",
                            subText: `Only addresses located inside ${city} can be completed.`
                          });
                        }
                      }}
                      className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none"
                    >
                      <option value="Lusaka">Lusaka Municpality (Live)</option>
                      <option value="Ndola">Ndola Province (Same-city Only)</option>
                      <option value="Kitwe">Kitwe Hub (Same-city Only)</option>
                    </select>
                    <p className="text-[9px] text-[#ffa500] font-sans">🛡️ Cross-city mailing is disabled. Senders must keep points in same city boundaries.</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlowStep("LOBBY")}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-3 text-xs font-bold rounded-xl text-zinc-300 text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!description.trim()) {
                        onSpawnToast({ message: "Description details required", subText: "Describe what you are sending." });
                        return;
                      }
                      if (!collectionAddress) {
                        onSpawnToast({ message: "Collection origin required", subText: "Select your collection checkpoint." });
                        return;
                      }
                      setFlowStep("STEP2");
                    }}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 font-extrabold text-xs py-3 rounded-xl text-black flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Recipient Info</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: RECIPIENT DETAILS */}
            {flowStep === "STEP2" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white">Step 2: Recipient Details</h3>
                  <span className="text-[9.5px] text-[#ffa500] font-mono uppercase font-bold tracking-widest bg-[#ffa500]/5 px-2 py-0.5 rounded border border-[#ffa500]/10">2 of 3</span>
                </div>

                <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  {/* Mode switcher tabs */}
                  <div className="flex bg-[#050506] border border-zinc-850 rounded-xl p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("search")}
                      className={`flex-1 py-1.5 rounded-lg text-[9.5px] uppercase tracking-widest font-black transition-all ${
                        recipientMode === "search" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-zinc-500"
                      }`}
                    >
                      Search User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode("manual")}
                      className={`flex-1 py-1.5 rounded-lg text-[9.5px] uppercase tracking-widest font-black transition-all ${
                        recipientMode === "manual" ? "bg-[#ffa500]/10 text-[#ffa500] border border-[#ffa500]/20" : "text-zinc-500"
                      }`}
                    >
                      Enter Manual
                    </button>
                  </div>

                  {recipientMode === "search" ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5 scrollbar-none relative">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                          Lookup Senders/Receivers database
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type phone or name (e.g. Tamara, Chileshe)"
                            value={recipientSearchText}
                            onChange={(e) => setRecipientSearchText(e.target.value)}
                            className="w-full bg-[#050506] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-[#ffa500] focus:outline-none"
                          />
                          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                        </div>

                        {/* Search Matches dropdown simulation */}
                        {recipientSearchText && (
                          <div className="absolute z-10 w-full bg-[#0b0c10] border border-zinc-800 rounded-xl mt-1 py-1.5 max-h-[140px] overflow-y-auto shadow-2xl">
                            {platformUsersMock.filter(u => 
                              u.name.toLowerCase().includes(recipientSearchText.toLowerCase()) || 
                              u.phone.includes(recipientSearchText)
                            ).length > 0 ? (
                              platformUsersMock.filter(u => 
                                u.name.toLowerCase().includes(recipientSearchText.toLowerCase()) || 
                                u.phone.includes(recipientSearchText)
                              ).map(user => (
                                <div 
                                  key={user.id} 
                                  onClick={() => handlePickSearchedRecipient(user)}
                                  className="px-3 py-2 hover:bg-zinc-900 cursor-pointer text-left text-xs border-b border-zinc-900/60"
                                >
                                  <p className="font-extrabold text-teal-400 flex items-center gap-1.5">
                                    <User className="w-3 h-3 text-teal-400" />
                                    <span>{user.name}</span>
                                    <span className="text-[8px] bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono px-1 rounded">MATCH</span>
                                  </p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">{user.phone} • {user.address}</p>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2.5 text-center text-zinc-500 text-[10px]">
                                No registered users match your query. Try "Manual" tab instead.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Display Selected recipient if found */}
                      {recipientName && (
                        <div className="bg-teal-500/5 border border-teal-550/20 p-3 rounded-xl space-y-2 text-left">
                          <span className="text-[9px] bg-teal-500/10 border border-teal-555/35 text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold">LINKED CONTACT</span>
                          <div className="flex justify-between">
                            <div>
                              <p className="text-xs font-black text-teal-300">{recipientName}</p>
                              <p className="text-[10.5px] text-zinc-400">{recipientPhone}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setRecipientName("");
                                setRecipientPhone("");
                                setRecipientAddress("");
                                setRecipientLandmark("");
                                setRecipientId(null);
                              }}
                              className="text-[9px] text-[#ff6f61] font-mono border border-[#ff6f61]/20 px-2 py-0.5 rounded text-xxs"
                            >
                              CLEAR
                            </button>
                          </div>
                          
                          <div className="space-y-1 mt-1.5 pt-1.5 border-t border-zinc-900">
                            <p className="text-[9.5px] uppercase font-mono text-zinc-400">Locked Destination Address</p>
                            <p className="text-xs text-zinc-300 leading-normal">{recipientAddress}</p>
                            {recipientLandmark && <p className="text-[10.5px] text-teal-400/80 italic">Landmark: {recipientLandmark}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // MANUAL ENTRIES
                    <div className="space-y-3 text-left">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Grace Chilando"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none placeholder-zinc-650"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                          Mobile Phone (Receives Instant Collection SMS)
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. 0976543210"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none placeholder-zinc-650 font-mono"
                        />
                        <p className="text-[9px] text-zinc-500">Must be a valid Zambian number for Airtel Money, MTN, or Zamtel alerts.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                          Delivery Address
                        </label>
                        <div 
                          onClick={() => openAddressSelector("delivery")}
                          className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white cursor-pointer hover:border-zinc-700 flex items-center justify-between text-left"
                        >
                          <span className="truncate flex-1 pr-2">
                            {recipientAddress || "Tap to select delivery address..."}
                          </span>
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        </div>
                        <p className="text-[9px] text-zinc-550">Use our autocomplete or pin-drop picker to verify path routing coordinates.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                          Landmark notes
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Opposite Shoprite green container, door 5"
                          value={recipientLandmark}
                          onChange={(e) => setRecipientLandmark(e.target.value)}
                          className="w-full bg-[#050506] border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-[#ffa500] focus:outline-none placeholder-zinc-650"
                        />
                      </div>
                    </div>
                  )}

                </div>

                {/* Controls */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlowStep("STEP1")}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-3 text-xs font-bold rounded-xl text-zinc-300 text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!recipientName.trim()) {
                        onSpawnToast({ message: "Recipient name is required" });
                        return;
                      }
                      if (!recipientPhone.trim()) {
                        onSpawnToast({ message: "Recipient mobile phone is required" });
                        return;
                      }
                      if (!recipientAddress.trim()) {
                        onSpawnToast({ message: "Delivery address must be verified" });
                        return;
                      }
                      setFlowStep("STEP3");
                    }}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 font-extrabold text-xs py-3 rounded-xl text-black flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Check Fees</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FEE CALCULATOR AND PAYMENT */}
            {flowStep === "STEP3" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white">Step 3: Fee Checkout & Escrow</h3>
                  <span className="text-[9.5px] text-[#ffa500] font-mono uppercase font-bold tracking-widest bg-[#ffa500]/5 px-2 py-0.5 rounded border border-[#ffa500]/10">3 of 3</span>
                </div>

                {/* Switchable locations slider as requested */}
                <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-4">
                  <div className="space-y-2 border-b border-zinc-900 pb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-zinc-400 font-mono">Confirmed Delivery Routing</span>
                      <button 
                        onClick={() => openAddressSelector("delivery")}
                        className="text-[9px] text-[#ffa500] font-extrabold hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="bg-teal-500/10 border border-teal-500/20 p-2.5 rounded-xl flex items-start gap-2 text-left text-xs text-zinc-100">
                      <MapPin className="w-4 h-4 text-[#ff6f61] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold flex items-center gap-1">
                          <span>{recipientName} ({recipientPhone})</span>
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{recipientAddress}</p>
                        {recipientLandmark && <p className="text-[9.5px] text-emerald-400">Landmark: {recipientLandmark}</p>}
                      </div>
                    </div>

                    {/* Quick Switch chips of other saved addresses */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[8.5px] uppercase font-bold text-zinc-500 font-mono tracking-widest">Quick Switch Recipient Saved Addresses</p>
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[9.5px]">
                        {savedLocations.map(loc => (
                          <button
                            key={loc.location_id}
                            type="button"
                            onClick={() => {
                              setRecipientAddress(loc.address_string);
                              setRecipientLandmark(loc.landmark_note || "");
                              const randDist = parseFloat((2.5 + Math.random() * 8).toFixed(1));
                              setDistanceKm(randDist);
                              onSpawnToast({
                                message: `Destination switched to ${loc.nickname}`,
                                subText: `${loc.address_string}`
                              });
                            }}
                            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-2 py-1 rounded-full text-zinc-300 font-bold shrink-0 transition-all active:scale-95 hover:border-zinc-700"
                          >
                            🏠 {loc.nickname}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => openAddressSelector("delivery")}
                          className="bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 px-2.5 py-1 rounded-full text-teal-400 font-bold shrink-0 text-xxs"
                        >
                          ➕ Add New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  <div className="space-y-2 text-xs">
                    <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest font-mono">Invoice Summary (ZMW)</p>
                    
                    <div className="flex justify-between items-center py-1">
                      <span className="text-zinc-400">Delivery Fee ({distanceKm} km at K{adminConfig.parcelDeliveryFeePerKm}/km)</span>
                      <span className="font-mono text-zinc-200">K {subtotalFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-t border-zinc-900">
                      <span className="text-zinc-400">Platform Escrow Fee (Configurable Flat)</span>
                      <span className="font-mono text-zinc-200">K {platformFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-t border-zinc-900">
                      <span className="text-zinc-400">Lipila Payment Gateway Surcharge ({adminConfig.paymentProcessingPct}%)</span>
                      <span className="font-mono text-zinc-200">K {processingFee.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-t border-zinc-800 text-sm font-extrabold text-white">
                      <span className="text-[#ffa500]">GRAND TOTAL ESCROWED</span>
                      <span className="font-semibold text-lg text-[#ffa500] font-mono">K {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Wallet selections */}
                  <div className="space-y-2 border-t border-zinc-900 pt-3 text-left">
                    <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-widest font-mono">
                      Pay with Mobile Money Carrier
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentWallet("Airtel")}
                        className={`py-2 px-1.5 rounded-xl border text-[10px] font-black text-center transition-all ${
                          paymentWallet === "Airtel" 
                            ? "bg-red-500/10 text-red-400 border-red-500/40" 
                            : "bg-[#050506] text-zinc-500 border-zinc-850 hover:text-zinc-300"
                        }`}
                      >
                        🔴 Airtel Money
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentWallet("MTN")}
                        className={`py-2 px-1.5 rounded-xl border text-[10px] font-black text-center transition-all ${
                          paymentWallet === "MTN" 
                            ? "bg-amber-500/10 text-[#ffa500] border-amber-500/40" 
                            : "bg-[#050506] text-zinc-500 border-zinc-850 hover:text-zinc-300"
                        }`}
                      >
                        🟡 MTN MoMo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentWallet("Zamtel")}
                        className={`py-2 px-1.5 rounded-xl border text-[10px] font-black text-center transition-all ${
                          paymentWallet === "Zamtel" 
                            ? "bg-green-500/10 text-green-400 border-green-500/40" 
                            : "bg-[#050506] text-zinc-500 border-zinc-850 hover:text-zinc-300"
                        }`}
                      >
                        🟢 Zamtel Wallet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setFlowStep("STEP2")}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-3.5 text-xs font-bold rounded-xl text-zinc-300 text-center"
                    disabled={isPaying}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessParcelPayment}
                    className="flex-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-xs py-3.5 rounded-xl text-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                    disabled={isPaying}
                  >
                    {isPaying ? (
                      <span className="flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Lipila Authenticating...</span>
                      </span>
                    ) : (
                      <span className="font-extrabold uppercase">Confirm & Pay K {grandTotal.toFixed(2)}</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* WAITING SCREEN AND STATUS TRACKING */}
            {flowStep === "WAITING" && activeTrackingId && (() => {
              const job = parcelJobs.find(p => p.parcel_id === activeTrackingId);
              if (!job) return null;

              return (
                <div className="space-y-4">
                  <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono bg-amber-500/10 border border-amber-500/25 text-[#ffa500] px-2 py-0.5 rounded font-bold">
                          ESCROW SECURED
                        </span>
                        <h3 className="text-sm font-extrabold text-white mt-1.5">Tracking {job.parcel_id}</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Dispatched: {new Date(job.created_at).toLocaleTimeString()}</p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[10px] text-zinc-500 font-mono block">Rider Net Sharing</span>
                        <span className="font-mono text-[#ffa500] font-black block">K {job.delivery_fee.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Check list status updates */}
                    <div className="space-y-3 pt-2.5">
                      <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">✓</div>
                        <div>
                          <p className="font-extrabold">Parcel Registered in Node</p>
                          <p className="text-[9px] text-zinc-400">Total volume calculated: {job.weight_kg}kg</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                          job.status === "searching_rider" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {job.status === "searching_rider" ? "●" : "✓"}
                        </div>
                        <div>
                          <p className="font-extrabold">Rider Matching Broadcast</p>
                          <p className="text-[9px] text-zinc-400">
                            {job.status === "searching_rider" 
                              ? "Broadcasting to 3 available riders in Zone Chelstone..." 
                              : `Assigned Rider: ${job.rider_name || "Lungu Mwansa"}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                          job.status === "rider_assigned"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : (job.status === "collected" || job.status === "delivered")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-900 text-zinc-650 border border-zinc-850"
                        }`}>
                          {(job.status === "collected" || job.status === "delivered") ? "✓" : "●"}
                        </div>
                        <div>
                          <p className="font-extrabold">Collected from Dispatch Gate</p>
                          <p className="text-[9px] text-zinc-400">
                            {job.status === "collected" || job.status === "delivered" 
                              ? `Collected at ${job.collected_at ? new Date(job.collected_at).toLocaleTimeString() : "14:12"}. Automated Receiver SMS triggered.`
                              : "Rider navigating to pickup point..."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 text-xs text-white">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                          job.status === "collected"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 animate-pulse"
                            : job.status === "delivered"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-zinc-900 text-zinc-650 border border-zinc-850"
                        }`}>
                          {job.status === "delivered" ? "✓" : "●"}
                        </div>
                        <div>
                          <p className="font-extrabold">Delivered & Escrow Released</p>
                          <p className="text-[9px] text-zinc-400">
                            {job.status === "delivered" 
                              ? "Completed. Rider payout complete." 
                              : "Pending recipient handshake."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rider Info Card */}
                    {job.rider_id && (
                      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-lg shrink-0">
                          {job.rider_photo || "🚴"}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-white">{job.rider_name}</p>
                          <p className="text-[10px] text-zinc-400">Rider Contact: {job.rider_phone}</p>
                          <p className="text-[9.5px] text-[#ffa500]">ETA: {job.rider_eta_mins} mins away</p>
                        </div>
                        {job.status === "rider_assigned" && (
                          <button
                            type="button"
                            onClick={() => {
                              // Simulate Rider Collected action
                              setParcelJobs(prev => prev.map(p => p.parcel_id === job.parcel_id ? {
                                ...p,
                                status: "collected",
                                collected_at: new Date().toISOString(),
                                sms_sent: true
                              } : p));
                              onSpawnToast({
                                message: "SMS dispatched to receiver!",
                                subText: `Hello ${job.recipient_name}, your parcel ${job.parcel_id} is on its way.`
                              });
                            }}
                            className="bg-amber-500 text-zinc-950 px-2 py-1 rounded text-[10px] font-extrabold hover:bg-amber-400"
                          >
                            Simulate Collect
                          </button>
                        )}
                        {job.status === "collected" && (
                          <button
                            type="button"
                            onClick={() => {
                              // Simulate Delivered action
                              setParcelJobs(prev => prev.map(p => p.parcel_id === job.parcel_id ? {
                                ...p,
                                status: "delivered",
                                delivered_at: new Date().toISOString()
                              } : p));
                              onSpawnToast({
                                message: "Escrow funds paid out to Rider!",
                                subText: `Parcel ${job.parcel_id} marked as delivered.`
                              });
                            }}
                            className="bg-emerald-500 text-zinc-950 px-2 py-1 rounded text-[10px] font-extrabold hover:bg-emerald-400"
                          >
                            Simulates Delivery
                          </button>
                        )}
                      </div>
                    )}

                    {/* Receiver SMS log simulation bubble if sent */}
                    {job.sms_sent && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl space-y-1 text-left">
                        <span className="text-[8px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider">
                          Auto Receiver SMS (Sent)
                        </span>
                        <p className="text-[9px] text-[#2dd4bf] italic leading-normal">
                          "Hello {job.recipient_name}, your parcel {job.parcel_id} has been collected by rider {job.rider_name || "Lungu Mwansa"} and is on its way to you. Estimated delivery time: 10–15 minutes. — Selonachipa"
                        </p>
                      </div>
                    )}

                    {/* Finish rated card if delivered */}
                    {job.status === "delivered" && (
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl space-y-2 text-left">
                        <h4 className="text-xs font-bold text-emerald-400">Parcel Arrived! Rate your Rider:</h4>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingSubmit(job.parcel_id, star)}
                              className="text-lg hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= (job.rating || activeRating) ? "fill-[#ffa500] text-[#ffa500]" : "text-zinc-650"}`} />
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(job)}
                            className="bg-zinc-800 border border-zinc-700 text-zinc-200 py-1 px-2.5 rounded text-[10px] font-bold flex items-center gap-1 hover:bg-zinc-700"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Receipt</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() => setFlowStep("LOBBY")}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 py-3 text-xs font-bold rounded-xl text-zinc-300 text-center"
                  >
                    Return to Parcel Lobby
                  </button>
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 2: PARCEL HISTORY */}
        {currentTab === "HISTORY" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Consignment Portfolios</h3>
                <p className="text-[10px] text-zinc-400">All registered parcel postings and statuses</p>
              </div>

              {/* Filtering dropdown for Agent */}
              {userRole === "AGENT" && (
                <select
                  value={adminSellerFilter}
                  onChange={(e) => setAdminSellerFilter(e.target.value)}
                  className="bg-[#0c0d12] border border-zinc-800 text-[10px] p-1 px-2 rounded-lg text-[#ffa500] uppercase font-mono font-bold"
                >
                  <option value="all">View All Portfolio Sent</option>
                  <option value="self">Personal Agent Sent</option>
                  {portfolioSellers.map(s => (
                    <option key={s.seller_id} value={s.seller_id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>

            {visibleParcels.length === 0 ? (
              <div className="bg-[#0c0d12] border border-zinc-850 p-6 rounded-2xl text-center text-zinc-500 space-y-1.5">
                <Package className="w-8 h-8 mx-auto text-zinc-650" />
                <p className="text-xs font-bold text-zinc-400">No Consignments Placed Yet</p>
                <p className="text-[10px] text-zinc-600">Your sent item ledger is clean. Go back to Send tab to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleParcels.map(job => (
                  <div key={job.parcel_id} className="bg-[#0c0d12] border border-zinc-850 p-3.5 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9.5px] uppercase font-mono text-[#ffa500] font-black">{job.parcel_id}</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">{job.description}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Recipient: {job.recipient_name} ({job.recipient_phone})</p>
                      </div>

                      {/* Status badge */}
                      <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border shadow-inner ${
                        job.status === "delivered" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : job.status === "collected"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="text-[10.5px] text-zinc-350 space-y-1 leading-normal border-t border-zinc-900 pt-2 bg-zinc-950/20 p-2 rounded-lg">
                      <p>🚛 <span className="font-bold">Collection Point:</span> {job.collection_address}</p>
                      <p>📍 <span className="font-bold">Delivery Point:</span> {job.delivery_address}</p>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 font-mono">
                        <span>Distance: {job.distance_km} km</span>
                        <span>Grand Escrow Total: K {job.grand_total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-zinc-900/40">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTrackingId(job.parcel_id);
                          setFlowStep("WAITING");
                          setCurrentTab("SEND");
                        }}
                        className="text-[10px] font-extrabold text-[#ffa500] hover:underline"
                      >
                        ⏱️ Track Live
                      </button>

                      <div className="flex gap-2">
                        {job.status === "delivered" && (
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(job)}
                            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 py-1 px-2.5 rounded text-[10px] font-bold flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Invoice PDF</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleResendParcel(job)}
                          className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 py-1 px-2.5 border border-teal-500/20 rounded text-[10px] font-extrabold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend Parcel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE SAVED LOCATIONS */}
        {currentTab === "MANAGE_LOCS" && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Your Saved Location Hub</h3>
                <p className="text-[10px] text-zinc-400">Addresses shared across checkout modules</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLocModalMode("create");
                  setLocNickname("");
                  setLocAddress("");
                  setLocLandmark("");
                  setLocEditId(null);
                  setLocIsDefault(false);
                  setLocSaveToLibrary(true);
                  setIsLocationModalOpen(true);
                }}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-black py-1.5 px-3 rounded-lg text-[10.5px] font-extrabold cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Proactive Address</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Saved Locations */}
              <div className="space-y-2">
                <p className="text-[10.5px] uppercase font-black text-zinc-400 tracking-wider">🔒 Standard Saved Library</p>
                {savedLocations.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 text-center border border-dashed border-zinc-800 rounded-xl">No saved addresses. Auto-populates as you send parcels.</p>
                ) : (
                  <div className="space-y-2">
                    {savedLocations.map(loc => (
                      <div key={loc.location_id} className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-xl flex items-start gap-3 justify-between">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-[#ffa500]" />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white truncate">{loc.nickname}</span>
                            {loc.is_default && (
                              <span className="text-[8px] font-mono font-bold bg-[#ffa500]/15 text-[#ffa500] border border-amber-500/20 px-1 py-0.2 rounded">DEFAULT</span>
                            )}
                            <span className="text-[8.5px] text-zinc-500 font-mono">Used: {loc.usage_count} times</span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 truncate mt-0.5">{loc.address_string}</p>
                          {loc.landmark_note && <p className="text-[9.5px] text-zinc-500 italic">Notes: {loc.landmark_note}</p>}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setLocModalMode("edit");
                              setLocEditId(loc.location_id);
                              setLocNickname(loc.nickname);
                              setLocAddress(loc.address_string);
                              setLocLandmark(loc.landmark_note || "");
                              setLocLat(loc.latitude);
                              setLocLng(loc.longitude);
                              setLocCity(loc.city);
                              setLocZone(loc.zone);
                              setLocIsDefault(!!loc.is_default);
                              setLocSaveToLibrary(true);
                              setIsLocationModalOpen(true);
                            }}
                            className="p-1 text-zinc-400 hover:text-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSavedLocations(prev => prev.filter(l => l.location_id !== loc.location_id));
                              onSpawnToast({ message: "Address deleted from Saved Locations" });
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent History Locations */}
              <div className="space-y-2">
                <p className="text-[10.5px] uppercase font-black text-zinc-500 tracking-wider">⏱️ Recent Dispatch History (Not Saved)</p>
                {recentLocations.length === 0 ? (
                  <p className="text-xs text-zinc-550 italic p-3 text-center">No recent untagged destinations detected.</p>
                ) : (
                  <div className="space-y-2">
                    {recentLocations.map(loc => (
                      <div key={loc.location_id} className="bg-[#0c0d12]/60 border border-zinc-900 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
                          <div className="truncate pr-2">
                            <p className="text-xs text-zinc-350 truncate">{loc.address_string}</p>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Last used: 3 hours ago</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            // Promote to library
                            setLocModalMode("create");
                            setLocEditId(null);
                            setLocNickname(loc.nickname || "Home Favor Checkpoint");
                            setLocAddress(loc.address_string);
                            setLocLandmark(loc.landmark_note || "");
                            setLocLat(loc.latitude);
                            setLocLng(loc.longitude);
                            setLocCity(loc.city);
                            setLocZone(loc.zone);
                            setLocIsDefault(false);
                            setLocSaveToLibrary(true);
                            setIsLocationModalOpen(true);
                          }}
                          className="bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-400 font-bold text-[9.5px] px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Save Nickname</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN MODULE FOR GENERAL CONFIGS */}
        {currentTab === "ADMIN" && (
          <div className="space-y-4 text-left">
            <div>
              <h3 className="text-base font-black text-white">According Platform Configuration</h3>
              <p className="text-[10px] text-zinc-400">Modify fee structures, SMS templates, & broadcast rules on-the-spot without code compilation.</p>
            </div>

            <div className="bg-[#0c0d12] border border-zinc-850 p-4 rounded-2xl space-y-4 text-xs text-zinc-300">
              
              {/* Plat fee */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Platform Sender Fee (ZMW)</label>
                <input 
                  type="number"
                  value={adminConfig.parcelPlatformFee}
                  onChange={(e) => setAdminConfig({ ...adminConfig, parcelPlatformFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Per km rate */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Delivery Fee per Kilometre (ZMW)</label>
                <input 
                  type="number"
                  value={adminConfig.parcelDeliveryFeePerKm}
                  onChange={(e) => setAdminConfig({ ...adminConfig, parcelDeliveryFeePerKm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Payment Processing Fee percentage */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Lipila API Processing Surcharge (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={adminConfig.paymentProcessingPct}
                  onChange={(e) => setAdminConfig({ ...adminConfig, paymentProcessingPct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Platform commission deduction on delivery payout */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-[#ffa500] font-mono tracking-widest">Platform Deduction on Rider Payout (%)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={adminConfig.riderPlatformFeePct}
                  onChange={(e) => setAdminConfig({ ...adminConfig, riderPlatformFeePct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[9.5px] text-zinc-500 font-sans">Applies as a deduction from the rider's earned delivery fee at payout, not sender checkout.</p>
              </div>

              {/* Social Fund contribution percentage */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-teal-400 font-mono tracking-widest">Rider Social Fund Contribution (%)</label>
                <input 
                  type="number"
                  step="0.5"
                  value={adminConfig.riderSocialFundPct}
                  onChange={(e) => setAdminConfig({ ...adminConfig, riderSocialFundPct: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[9.5px] text-zinc-500 font-sans">Deducted from the rider shares. Flows into Rider's Social Fund balance as pension/insurance security.</p>
              </div>

              {/* SMS broadcast custom template */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Automated Collector SMS Template</label>
                <textarea 
                  rows={3}
                  value={adminConfig.smsTemplate}
                  onChange={(e) => setAdminConfig({ ...adminConfig, smsTemplate: e.target.value })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl focus:border-purple-500 focus:outline-none placeholder-zinc-650"
                />
                <p className="text-[9px] text-zinc-500">Variables available: [Receiver name], [Receiver phone], [Rider name], [X-Y minutes].</p>
              </div>

              {/* Job timeout */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">Radiant Broadcaster Broadcast Timeout (sec)</label>
                <input 
                  type="number"
                  value={adminConfig.jobTimeoutSec}
                  onChange={(e) => setAdminConfig({ ...adminConfig, jobTimeoutSec: parseInt(e.target.value) || 60 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* SMS Dispatch Fee */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-400 font-mono tracking-widest">SMS Dispatch Notification Fee (ZMW)</label>
                <input 
                  type="number"
                  step="0.05"
                  value={adminConfig.smsDispatchFee !== undefined ? adminConfig.smsDispatchFee : 0.30}
                  onChange={(e) => setAdminConfig({ ...adminConfig, smsDispatchFee: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#050506] border border-zinc-800 text-xs text-white p-2.5 rounded-xl font-mono focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[9.5px] text-zinc-500 font-sans">Mandatory fee added to the customer checkout to support offline SMS network alerts.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSpawnToast({
                    message: "Admin configuration synchronized!",
                    subText: "Applied dynamically across all active parcel nodes."
                  });
                }}
                className="w-full bg-[#ffa500] hover:bg-amber-500 text-zinc-950 font-extrabold uppercase py-3 rounded-xl border border-transparent shadow shadow-amber-500/20 text-center"
              >
                Sync Admin Configurations
              </button>

            </div>

            {/* Live Disbursement Admin Control Panel and Webhook Handshake Logs */}
            <div className="mt-6">
              <PayoutAdminPanel onSpawnToast={onSpawnToast} />
            </div>
          </div>
        )}

      </div>

      {/* ADDRESS AUTOSUGGEST / PICK ON MAP VERIFY MODAL */}
      <AnimatePresence>
        {isSelectLocationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-3 text-left"
          >
            <div className="bg-[#050506] border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col max-h-[82vh] overflow-hidden text-white relative">
              <div className="bg-[#0b0c10] border-b border-zinc-900 p-3 flex justify-between items-center">
                <p className="text-xs uppercase font-extrabold text-[#ffa500] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#ffa500]" />
                  <span>Choose Location Coordinate</span>
                </p>
                <button 
                  onClick={() => setIsSelectLocationModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Search Bar with autocomplete simulations */}
                <div className="space-y-1 relative">
                  <label className="block text-[10px] uppercase font-black text-zinc-400 tracking-wider">Search Landmark, Mall, clinic, or Road</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type place name (e.g. UNZA, Soweto, Manda)..."
                      value={autoCompleteQuery}
                      onChange={(e) => setAutoCompleteQuery(e.target.value)}
                      className="w-full bg-[#0c0d12] border border-zinc-800 text-xs p-2.5 pl-9 rounded-xl focus:border-teal-400 focus:outline-none text-white placeholder-zinc-650"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
                  </div>

                  {autoCompleteQuery && (
                    <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl mt-1 py-1 max-h-[160px] overflow-y-auto w-full z-20 space-y-0.5 divide-y divide-zinc-900 shadow-2xl">
                      {/* Search Matches inside client-defined saved list */}
                      {savedLocations.filter(sl => sl.nickname.toLowerCase().includes(autoCompleteQuery.toLowerCase()) || sl.address_string.toLowerCase().includes(autoCompleteQuery.toLowerCase())).map(savedMatch => (
                        <div
                          key={savedMatch.location_id}
                          onClick={() => handleSelectAddressRecord(
                            savedMatch.address_string,
                            savedMatch.landmark_note || "",
                            savedMatch.latitude,
                            savedMatch.longitude,
                            savedMatch.city
                          )}
                          className="px-3 py-2 text-left hover:bg-zinc-900 cursor-pointer text-xs"
                        >
                          <span className="font-bold text-teal-400 flex items-center gap-1">
                            <span>{savedMatch.nickname}</span>
                            <span className="text-[7.5px] bg-teal-550/10 border border-teal-550/20 text-teal-400 font-mono px-1 rounded uppercase">SAVED MATCH</span>
                          </span>
                          <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{savedMatch.address_string}</span>
                        </div>
                      ))}

                      {/* Real Google Places suggestions with server-backed Geocoding */}
                      {isSearchingPlaces && (
                        <div className="px-3 py-2 text-left text-xs text-zinc-500 animate-pulse font-mono block">
                          🛰️ Querying Google Places...
                        </div>
                      )}
                      
                      {resolvedSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.placeId}
                          onClick={async () => {
                            try {
                              const resolved = await geocodeAddress(suggestion.formattedAddress, suggestion.placeId);
                              handleSelectAddressRecord(
                                resolved.address,
                                "Google Maps Verified Place",
                                resolved.latitude,
                                resolved.longitude,
                                resolved.address.toLowerCase().includes("ndola") ? "Ndola" : resolved.address.toLowerCase().includes("kitwe") ? "Kitwe" : "Lusaka"
                              );
                            } catch (err) {
                              console.error("Failed to geocode", err);
                              handleSelectAddressRecord(
                                suggestion.formattedAddress,
                                "Standard Google Maps Spot",
                                -15.4167,
                                28.2833,
                                "Lusaka"
                              );
                            }
                          }}
                          className="px-3 py-2 text-left hover:bg-zinc-900 cursor-pointer text-xs group"
                        >
                          <span className="font-bold text-zinc-100 block group-hover:text-[#ffa500] transition-colors">{suggestion.mainText}</span>
                          <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{suggestion.formattedAddress}</span>
                        </div>
                      ))}

                      {/* Fallback to static matches if search is idle and no matches */}
                      {!isSearchingPlaces && resolvedSuggestions.length === 0 && autoCompleteQuery.length >= 3 && (
                        <div className="px-3 py-2 text-left text-xxs text-zinc-550 italic">
                          No direct locations found. Try an alternative Zambia landmark or checkpoint.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pin on map + use current coordinates trigger buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectLocationModalOpen(false);
                      setLocLat(-15.405);
                      setLocLng(28.311);
                      setLocAddress("Munali Roundabout Circular, Lusaka");
                      setLocNickname("");
                      setLocLandmark("");
                      setLocCity("Lusaka");
                      setLocZone("Lusaka East");
                      setLocSaveToLibrary(true);
                      setLocIsDefault(false);
                      setLocModalMode("create");
                      setIsLocationModalOpen(true);
                    }}
                    className="bg-[#ffa500]/10 border border-[#ffa500]/20 hover:bg-[#ffa500]/20 py-2.5 rounded-xl text-center text-xs font-black text-[#ffa500]"
                  >
                    🗺️ Pick On Map
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const mockLat = -15.420 + Math.random() * 0.01;
                      const mockLng = 28.291 + Math.random() * 0.01;
                      handleSelectAddressRecord("Soweto West Market Hub Office, Lusaka", "Main container row 4", mockLat, mockLng, "Lusaka");
                    }}
                    className="bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 py-2.5 rounded-xl text-center text-xs font-black text-teal-450"
                  >
                    🛰️ Use My Location
                  </button>
                </div>

                {/* Saved Locations List */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">🏠 Saved Address Shortcuts</p>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
                    {savedLocations.map(loc => (
                      <div
                        key={loc.location_id}
                        onClick={() => handleSelectAddressRecord(
                          loc.address_string,
                          loc.landmark_note || "",
                          loc.latitude,
                          loc.longitude,
                          loc.city
                        )}
                        className="bg-[#0c0d12] hover:bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-left text-xs cursor-pointer flex gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#ffa500] mt-0.5 shrink-0" />
                        <div className="truncate">
                          <p className="font-extrabold text-white flex items-center gap-1.5">
                            <span>{loc.nickname}</span>
                            <span className="text-[8px] text-zinc-500 font-mono">Used: {loc.usage_count}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">{loc.address_string}</p>
                        </div>
                      </div>
                    ))}
                    {savedLocations.length === 0 && (
                      <p className="text-zinc-550 text-xxs italic text-center py-2">No shortcuts found. Mark as favorite to list.</p>
                    )}
                  </div>
                </div>

                {/* Recent uncompiled history */}
                <div className="space-y-1.5 pt-1 border-t border-zinc-900">
                  <p className="text-[10px] uppercase font-black text-zinc-500 tracking-wide">⌛ Recent Locations</p>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto no-scrollbar">
                    {recentLocations.map(loc => (
                      <div
                        key={loc.location_id}
                        onClick={() => handleSelectAddressRecord(
                          loc.address_string,
                          loc.landmark_note || "",
                          loc.latitude,
                          loc.longitude,
                          loc.city
                        )}
                        className="bg-zinc-950/40 border border-zinc-950 p-2 rounded-xl text-left text-xs cursor-pointer flex gap-2"
                      >
                        <Clock className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" />
                        <span className="text-zinc-400 truncate block mt-0.5 text-[10.5px]">{loc.address_string}</span>
                      </div>
                    ))}
                    {recentLocations.length === 0 && (
                      <p className="text-zinc-600 text-[10px] text-center p-2">History is empty.</p>
                    )}
                  </div>
                </div>

                {/* Bottom Escape route */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectLocationModalOpen(false);
                    setLocLat(-15.411);
                    setLocLng(28.299);
                    setLocAddress("Unnamed Compound Street, Lusaka");
                    setLocNickname("Manual Escaped Place");
                    setLocLandmark("");
                    setLocIsDefault(false);
                    setLocSaveToLibrary(true);
                    setLocModalMode("create");
                    setIsLocationModalOpen(true);
                  }}
                  className="w-full text-center text-[10px] font-black text-[#ffa500] hover:underline pt-2 border-t border-zinc-900"
                >
                  Can't find it? Pick on map instead
                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL MAP PICKER DROP PIN MODAL */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-3 text-left"
          >
            <div className="bg-[#050506] border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden text-white relative">
              <div className="bg-[#0b0c10] border-b border-zinc-900 p-3.5 flex justify-between items-center">
                <p className="text-xs uppercase font-extrabold text-[#ffa500] flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-[#ffa500]" />
                  <span>Interactive Map Pin-Drop</span>
                </p>
                <button 
                  onClick={() => setIsLocationModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Map Drag Simulator / Real Google Maps Content */}
              <div className="relative bg-zinc-950 border-b border-zinc-900 flex-1 h-[215px] flex items-center justify-center overflow-hidden">
                {hasValidGoogleMapsKey() ? (
                  <APIProvider apiKey={getGoogleMapsApiKey()} version="weekly">
                    <GoogleMap
                      defaultCenter={{ lat: locLat, lng: locLng }}
                      defaultZoom={14}
                      mapId="MAP_PIN_DROPPER_01"
                      onDragstart={() => setMapDragging(true)}
                      onDragend={(e) => {
                        setMapDragging(false);
                        const center = e.map?.getCenter();
                        if (center) {
                          const nLat = center.lat();
                          const nLng = center.lng();
                          setLocLat(nLat);
                          setLocLng(nLng);
                          setLocAddress(`Pin dropped: ${nLat.toFixed(5)}, ${nLng.toFixed(5)}, Lusaka, Zambia`);
                        }
                      }}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <AdvancedMarker position={{ lat: locLat, lng: locLng }} draggable={true} onDragend={(e) => {
                        if (e.latLng) {
                          const nLat = e.latLng.lat();
                          const nLng = e.latLng.lng();
                          setLocLat(nLat);
                          setLocLng(nLng);
                          setLocAddress(`Marker drag: ${nLat.toFixed(5)}, ${nLng.toFixed(5)}, Lusaka, Zambia`);
                        }
                      }}>
                        <Pin background="#ef4444" glyphColor="#fff" />
                      </AdvancedMarker>
                    </GoogleMap>
                  </APIProvider>
                ) : (
                  <>
                    {/* Simulated Map Grid lines, Roads and Parks */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1c223c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-4 bg-zinc-900/60 flex items-center pl-2 text-[8px] font-mono text-zinc-500 uppercase tracking-widest border-t border-b border-zinc-850">
                      Great East Road (Airport Highway)
                    </div>
                    <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-zinc-900/60 flex items-center justify-center text-[8px] font-mono text-zinc-500 rotate-90 border-l border-r border-zinc-850">
                      Kalingalinga Boulevard
                    </div>
                    
                    {/* Simulated Parks / Green Landmarks */}
                    <div className="absolute bottom-6 right-10 w-20 h-14 bg-teal-900/20 border border-teal-500/10 rounded-full flex items-center justify-center text-[8.5px] text-teal-400 font-mono tracking-wider italic">
                      UNZA FIELDS
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-10 bg-[#ffa500]/5 border border-amber-500/5 rounded-xl flex items-center justify-center text-[8px] text-zinc-500 font-mono tracking-wider italic">
                      EAST PARK
                    </div>
                    
                    {/* Big pulsing Red fixed pin at center */}
                    <div className="pointer-events-none relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border bg-red-600/25 border-red-500 flex items-center justify-center ${mapDragging ? "scale-125 bg-red-500/40 animate-pulse" : "animate-bounce"}`}>
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-white"></div>
                      </div>
                      <div className="w-2.5 h-0.5 bg-black/60 rounded-full mt-0.5 shadow-2xl"></div>
                    </div>
                  </>
                )}

                {/* Zoom tools */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                  <button 
                    onClick={() => {
                      setMapDragging(true);
                      setTimeout(() => setMapDragging(false), 400);
                      onSpawnToast({ message: "Zoom In Synchronized" });
                    }}
                    className="w-7 h-7 bg-[#050506]/90 border border-zinc-800 text-sm font-bold flex items-center justify-center hover:bg-zinc-900 rounded-lg text-white"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => {
                      setMapDragging(true);
                      setTimeout(() => setMapDragging(false), 400);
                      onSpawnToast({ message: "Zoom Out Synchronized" });
                    }}
                    className="w-7 h-7 bg-[#050506]/90 border border-zinc-800 text-sm font-bold flex items-center justify-center hover:bg-zinc-900 rounded-lg text-white"
                  >
                    -
                  </button>
                </div>

                {/* Re-center Current Positioning GPS */}
                <button
                  type="button"
                  onClick={handleTriggerMockGeolocation}
                  className="absolute bottom-3 left-3 bg-[#050506]/95 border border-zinc-800 py-1 px-2.5 rounded-lg text-[9.5px] font-black text-[#ffa500] flex items-center gap-1 hover:bg-zinc-900"
                >
                  🛰️ Recenter GPS
                </button>

                {/* Draggable simulation alert */}
                <div 
                  onMouseDown={() => setMapDragging(true)}
                  onMouseUp={() => {
                    setMapDragging(false);
                    // Shift coordinates slightly to represent movement
                    const shiftedLat = -15.42 + (Math.random() - 0.5) * 0.02;
                    const shiftedLng = 28.31 + (Math.random() - 0.5) * 0.02;
                    setLocLat(shiftedLat);
                    setLocLng(shiftedLng);
                    const listMockAdds = [
                      "Chelstone Industrial Hub Entrance, Lusaka",
                      "Kabulonga Palms Flat 4B, Lusaka",
                      "Manda Hill Underground Row J, Lusaka",
                      "Levy Junction West Container Yards, Lusaka"
                    ];
                    setLocAddress(listMockAdds[Math.floor(Math.random() * listMockAdds.length)]);
                  }}
                  className="absolute inset-0 cursor-move border-2 border-transparent active:border-teal-400"
                ></div>
              </div>

              {/* Pin Address Live Preview Card */}
              <div className="p-4 space-y-4">
                <div className="bg-[#0c0d12] border border-zinc-850 p-3 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                    <span className="text-teal-400 uppercase tracking-widest font-black text-[9px]">Live resolved Address</span>
                    <span>Lat: {locLat.toFixed(5)}, Lng: {locLng.toFixed(5)}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{locAddress || "Resolving reverse geocode..."}</h4>
                  <p className="text-[10px] text-[#ffa500] italic">Zone City: {locCity}, Zambia</p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-xl text-xxs text-zinc-400 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Drag map above or click around to update location coordinates. The rider will navigate directly to these resolved GPS variables.</span>
                </div>

                {/* Confirm Coordinates step button */}
                <button
                  type="button"
                  onClick={handleMapConfirmLocation}
                  className="w-full bg-[#ffa500] hover:bg-amber-500 font-black text-xs text-black py-3 rounded-xl uppercase tracking-wider text-center"
                >
                  Verify Pin Position
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 4: VERIFY AND SAVE NEW PROACTIVE ADDRESS AT DESTINATION */}
      <AnimatePresence>
        {isLocationModalOpen && locModalMode === "create" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 text-left"
          >
            <div className="bg-[#050506] border border-zinc-800 rounded-3xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden text-white relative">
              <div className="bg-[#0b0c10] border-b border-zinc-900 p-3.5 flex justify-between items-center">
                <p className="text-xs uppercase font-extrabold text-[#ffa500] flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-[#ffa500]" />
                  <span>Confirm and Save Location</span>
                </p>
                <button 
                  onClick={() => setIsLocationModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto">
                {/* Decided coordinates card */}
                <div className="bg-teal-500/5 border border-teal-500/20 p-3 rounded-xl space-y-1.5">
                  <p className="text-[9px] text-teal-400 font-mono font-bold uppercase">Locked Coordinates</p>
                  <h4 className="text-xs text-zinc-150 font-black">{locAddress}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono">Lat: {locLat.toFixed(5)} • Lng: {locLng.toFixed(5)}</p>
                </div>

                {/* Landmark input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Add a landmark note</label>
                  <input
                    type="text"
                    placeholder="e.g. Green gate, house 12B, red fence container..."
                    value={locLandmark}
                    onChange={(e) => setLocLandmark(e.target.value)}
                    className="w-full bg-[#0c0d12] border border-zinc-800 text-xs p-3 rounded-xl text-white focus:border-teal-400 focus:outline-none placeholder-zinc-650"
                  />
                  <p className="text-[9.5px] text-zinc-500">Critical reference details for rider delivery handshakes.</p>
                </div>

                {/* Save Prompt */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="save_library_checkbox"
                    checked={locSaveToLibrary}
                    onChange={(e) => setLocSaveToLibrary(e.target.checked)}
                    className="accent-[#ffa500]"
                  />
                  <label htmlFor="save_library_checkbox" className="text-xs text-zinc-300 font-bold select-none cursor-pointer">
                    Save this location to Saved Location Library
                  </label>
                </div>

                {locSaveToLibrary && (
                  <div className="space-y-3 pt-2.5 border-t border-zinc-900 text-left">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Choose Nickname / Label</p>
                    <div className="grid grid-cols-4 gap-1 text-[9.5px]">
                      <button
                        type="button"
                        onClick={() => setLocNickname("Home")}
                        className={`py-1.5 rounded-lg border font-black ${locNickname === "Home" ? "bg-[#ffa500]/10 text-[#ffa500] border-[#ffa500]" : "bg-[#0c0d12] text-zinc-550 border-zinc-850"}`}
                      >
                        🏠 Home
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocNickname("Work")}
                        className={`py-1.5 rounded-lg border font-black ${locNickname === "Work" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-[#0c0d12] text-zinc-550 border-zinc-850"}`}
                      >
                        💼 Work
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocNickname("Mum's house")}
                        className={`py-1.5 rounded-lg border font-black ${locNickname === "Mum's house" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-[#0c0d12] text-zinc-550 border-zinc-850"}`}
                      >
                        👩 Mum
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocNickname("Custom")}
                        className={`py-1.5 rounded-lg border font-black ${locNickname !== "Home" && locNickname !== "Work" && locNickname !== "Mum's house" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-[#0c0d12] text-zinc-550 border-zinc-850"}`}
                      >
                        ✏️ Custom
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Type custom location name (e.g. My Shop, Office 3)"
                      value={locNickname}
                      onChange={(e) => setLocNickname(e.target.value)}
                      className="w-full bg-[#0c0d12] border border-zinc-800 text-xs p-2.5 rounded-xl text-white focus:border-teal-400 focus:outline-none"
                    />

                    {/* Set default checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="set_default_checkout"
                        checked={locIsDefault}
                        onChange={(e) => setLocIsDefault(e.target.checked)}
                        className="accent-[#ffa500]"
                      />
                      <label htmlFor="set_default_checkout" className="text-xxs text-zinc-400 font-bold select-none cursor-pointer">
                        🌟 Mark as default checkout delivery address
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveLocation}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 font-black text-xs text-black py-3 rounded-xl uppercase tracking-wider text-center"
                >
                  Use This Address
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
