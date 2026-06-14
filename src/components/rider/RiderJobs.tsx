import React, { useState, useEffect } from "react";
import { 
  Plus, Eye, Heart, Edit3, CirclePlay, PauseCircle, Trash2, ArrowLeft, RefreshCw, X, 
  MapPin, ShieldCheck, Clock, Check, PhoneCall, AlertCircle, Sparkles, Navigation2, 
  Send, Camera, EyeOff, Calendar, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RiderJobsProps {
  riderOnline: boolean;
  rider: {
    rider_id: string;
    name: string;
    acceptanceRate: number;
    deliveriesCount: number;
    socialFundBalance: number;
    tier: string;
  };
  onUpdateRiderStats: (stats: {
    acceptanceRate?: number;
    deliveriesCount?: number;
    socialFundBalance?: number;
  }) => void;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  parcelJobs?: any[];
  setParcelJobs?: any;
  todayEarnings: number;
  setTodayEarnings: React.Dispatch<React.SetStateAction<number>>;
  todayCount: number;
  setTodayCount: React.Dispatch<React.SetStateAction<number>>;
  weekEarnings: number;
  setWeekEarnings: React.Dispatch<React.SetStateAction<number>>;
  addCompletedJobLog: (job: any) => void;
  addPayoutLog: (amount: number) => void;
}

export const RiderJobs: React.FC<RiderJobsProps> = ({
  riderOnline,
  rider,
  onUpdateRiderStats,
  orders,
  setOrders,
  parcelJobs,
  setParcelJobs,
  todayEarnings,
  setTodayEarnings,
  todayCount,
  setTodayCount,
  weekEarnings,
  setWeekEarnings,
  addCompletedJobLog,
  addPayoutLog,
}) => {
  // Tabs: "CURRENT_HUB" (Dispatch Requests / Active Delivery) and "HISTORY"
  const [jobsTab, setJobsTab] = useState<"DISPATCH" | "HISTORY">("DISPATCH");

  // History date filter: "TODAY" | "7_DAYS" | "30_DAYS"
  const [historyFilter, setHistoryFilter] = useState<"TODAY" | "7_DAYS" | "30_DAYS">("7_DAYS");

  // INCOMING JOB SIMULATOR STATE
  const [incomingJob, setIncomingJob] = useState<any | null>(null);
  const [timerLeft, setTimerLeft] = useState<number>(15);
  const [timerProgress, setTimerProgress] = useState<number>(100);

  // ACTIVE DELIVERY STATE
  const [activeJob, setActiveJob] = useState<any | null>(null);
  const [mockMapPosition, setMockMapPosition] = useState<number>(0); // 0 to 100 on the route
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string>("");
  const [mockBuyerPhoneFlash, setMockBuyerPhoneFlash] = useState<boolean>(false);

  // Local feedback toast
  const [jobToast, setJobToast] = useState<{ message: string; sub?: string } | null>(null);

  // Trigger list of dummy jobs periodically or manual spawn
  const [availableDummyJobs, setAvailableDummyJobs] = useState<any[]>([
    {
      id: "job-8712",
      order_ref: "SN-991",
      seller: "Chisamba Agri-Hub Co-op",
      item: "Premium Sweet White Maize (3x 50kg bags)",
      pickup: "Chisamba Wholesale depot, Plot 14",
      pickup_coords: { x: 30, y: 70 },
      dropoff: "Woodlands Extension Residence, Lusaka",
      dropoff_coords: { x: 75, y: 35 },
      pickup_dist: 2.4,
      dropoff_dist: 11.2,
      total_dist: 13.6,
      fee: 285.0,
      buyer: "Bwalya Tembo",
      buyer_phone: "+260 971 883 294",
      pickup_short: "Chisamba",
      drop_short: "Woodlands",
    },
    {
      id: "job-5509",
      order_ref: "SN-234",
      seller: "Kafue Organic Growers",
      item: "Zambian Red Onions (2x crates)",
      pickup: "Kafue Gateway Logistics Centre",
      pickup_coords: { x: 35, y: 80 },
      dropoff: "Northmead Retail Mall, Shop 4B",
      dropoff_coords: { x: 60, y: 25 },
      pickup_dist: 1.1,
      dropoff_dist: 9.8,
      total_dist: 10.9,
      fee: 190.0,
      buyer: "Mulenga Mwewa",
      buyer_phone: "+260 964 223 990",
      pickup_short: "Kafue",
      drop_short: "Northmead",
    },
    {
      id: "job-1092",
      order_ref: "SN-450",
      seller: "Soweto Organic Wholesalers",
      item: "Groundnuts & Sorghum Bag (1x 25kg)",
      pickup: "Soweto Market, Block D, Lusaka",
      pickup_coords: { x: 20, y: 55 },
      dropoff: "Avondale Heights Household Grid",
      dropoff_coords: { x: 80, y: 40 },
      pickup_dist: 3.8,
      dropoff_dist: 14.5,
      total_dist: 18.3,
      fee: 340.0,
      buyer: "Precious Chanda",
      buyer_phone: "+260 955 771 902",
      pickup_short: "Soweto Market",
      drop_short: "Avondale",
    }
  ]);

  // History records (Local initial state)
  const [historyJobs, setHistoryJobs] = useState<any[]>([
    { order_ref: "SN-910", pickup_short: "Chisamba", drop_short: "Leopards Hill", fee: 240.0, total_dist: 11.5, date: "TODAY", timestamp: "Today, 11:20 AM" },
    { order_ref: "SN-804", pickup_short: "Soweto Market", drop_short: "Woodlands", fee: 180.0, total_dist: 8.2, date: "TODAY", timestamp: "Today, 08:30 AM" },
    { order_ref: "SN-772", pickup_short: "Northmead Depot", drop_short: "Kafue", fee: 310.0, total_dist: 17.1, date: "YESTERDAY", timestamp: "Yesterday, 04:15 PM" },
    { order_ref: "SN-710", pickup_short: "Chisamba", drop_short: "Avondale", fee: 290.0, total_dist: 13.4, date: "YESTERDAY", timestamp: "Yesterday, 10:05 AM" },
    { order_ref: "SN-654", pickup_short: "Kafue Hub", drop_short: "Salama Park", fee: 220.0, total_dist: 10.1, date: "3_DAYS_AGO", timestamp: "3 days ago" },
    { order_ref: "SN-501", pickup_short: "Soweto Market", drop_short: "Kabulonga", fee: 155.0, total_dist: 7.5, date: "4_DAYS_AGO", timestamp: "4 days ago" },
    { order_ref: "SN-498", pickup_short: "Chisamba", drop_short: "Northmead", fee: 275.0, total_dist: 12.8, date: "5_DAYS_AGO", timestamp: "5 days ago" },
    { order_ref: "SN-302", pickup_short: "Kafue Hub", drop_short: "Woodlands", fee: 210.0, total_dist: 9.3, date: "12_DAYS_AGO", timestamp: "12 days ago" },
    { order_ref: "SN-195", pickup_short: "Chisamba", drop_short: "Libeala", fee: 320.0, total_dist: 15.6, date: "18_DAYS_AGO", timestamp: "18 days ago" }
  ]);

  // 1. DISPATCH SIMULATION: Spawn a job after a delay if rider is online, and there is no active job or incoming job
  useEffect(() => {
    let interval: any;
    if (riderOnline && !incomingJob && !activeJob) {
      interval = setInterval(() => {
        // 25% chance every 8 seconds of spawning a job from available list
        const rand = Math.random();
        if (rand > 0.40 && availableDummyJobs.length > 0) {
          const selectJob = availableDummyJobs[Math.floor(Math.random() * availableDummyJobs.length)];
          setIncomingJob(selectJob);
          setTimerLeft(15);
          setTimerProgress(100);
          showLocalToast("🚨 DISPATCH DETECTED: Incoming Job Offer!", `Fee: K ${selectJob.fee} ZMW`);
        }
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [riderOnline, incomingJob, activeJob, availableDummyJobs]);

  // 1b. CUSTOMER PARCEL EXPRESS DISPATCH LISTENER (REAL-TIME INTERMEDIATION)
  useEffect(() => {
    if (riderOnline && !incomingJob && !activeJob && parcelJobs && parcelJobs.length > 0) {
      const realPendingJob = parcelJobs.find(job => job.status === "searching_rider");
      if (realPendingJob) {
        const mappedJob = {
          id: realPendingJob.parcel_id,
          order_ref: `SN-PCL-${realPendingJob.parcel_id.substring(0, 4).toUpperCase()}`,
          seller: realPendingJob.sender_name,
          item: `Parcel: ${realPendingJob.description} (${realPendingJob.weight_kg}kg)`,
          pickup: realPendingJob.collection_address,
          pickup_coords: { x: 30, y: 70 },
          dropoff: realPendingJob.delivery_address,
          dropoff_coords: { x: 75, y: 35 },
          pickup_dist: 1.2,
          dropoff_dist: realPendingJob.distance_km,
          total_dist: realPendingJob.distance_km,
          fee: realPendingJob.delivery_fee,
          buyer: realPendingJob.recipient_name,
          buyer_phone: realPendingJob.recipient_phone,
          pickup_short: realPendingJob.collection_address.split(",")[0],
          drop_short: realPendingJob.delivery_address.split(",")[0],
          isRealParcel: true
        };
        setIncomingJob(mappedJob);
        setTimerLeft(30); // Multi-factor longer window for actual customer deliveries
        setTimerProgress(100);
        showLocalToast("🚨 CUSTOMER PARCEL EXPRESS: Incoming Dispatch Request!", `Fee: K ${mappedJob.fee.toFixed(2)} ZMW`);
      }
    }
  }, [riderOnline, incomingJob, activeJob, parcelJobs]);

  // 2. DISPATCH TIMER DECREMENT
  useEffect(() => {
    let countdown: any;
    if (incomingJob) {
      countdown = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            // TIMED OUT -> decline automatically
            handleDeclineJob(true);
            return 15;
          }
          const nextVal = prev - 1;
          setTimerProgress((nextVal / 15) * 100);
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [incomingJob]);

  // 3. MAP EMULATION INCREMENTER: When delivery is active, increment progress slightly so rider dot moves on the route map
  useEffect(() => {
    let mapMover: any;
    if (activeJob) {
      mapMover = setInterval(() => {
        setMockMapPosition((prev) => {
          if (prev >= 100) return 100;
          return prev + 10;
        });
      }, 3500);
    }
    return () => clearInterval(mapMover);
  }, [activeJob]);

  const playDispatchNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      
      // Sound high-intensity dispatch alert tones!
      playBeep(880, 0, 0.25);
      playBeep(1174, 0.12, 0.25);
      playBeep(1318, 0.24, 0.35);
    } catch (e) {
      console.warn("Audio Context sound output blocked by browser credentials", e);
    }
  };

  useEffect(() => {
    if (incomingJob) {
      playDispatchNotificationSound();
    }
  }, [incomingJob]);

  const showLocalToast = (msg: string, subText?: string) => {
    setJobToast({ message: msg, sub: subText });
    setTimeout(() => {
      setJobToast(null);
    }, 4500);
  };

  const handleDeclineJob = (isTimeout = false) => {
    if (!incomingJob) return;
    
    // Penalize acceptance rate
    const priorRate = rider.acceptanceRate;
    const nextRate = Math.max(65, priorRate - 4);
    onUpdateRiderStats({ acceptanceRate: nextRate });

    setIncomingJob(null);
    showLocalToast(
      isTimeout ? "⏱️ Offer Expired" : "❌ Offer Declined",
      `Your Acceptance Rate dropped to ${nextRate}%`
    );
  };

  const handleAcceptJob = () => {
    if (!incomingJob) return;

    // Boost acceptance rate slightly
    const priorRate = rider.acceptanceRate;
    const nextRate = Math.min(100, priorRate + 1);
    onUpdateRiderStats({ acceptanceRate: nextRate });

    // If it is a real customer parcel, notify the state manager
    if ((incomingJob as any).isRealParcel && setParcelJobs) {
      setParcelJobs((prev: any[]) => prev.map(job => {
        if (job.parcel_id === incomingJob.id) {
          return {
            ...job,
            status: "rider_assigned",
            rider_id: rider.rider_id,
            rider_name: rider.name,
            rider_phone: "+260 971842003",
            rider_photo: "🚴",
            rider_eta_mins: 6
          };
        }
        return job;
      }));
    }

    setActiveJob(incomingJob);
    setIncomingJob(null);
    setMockMapPosition(10); // Start route
    showLocalToast("🔄 Dispatch Routing Engaged", "Go to seller pickup coordinates.");
  };

  const handleSimulateGPSMove = () => {
    setMockMapPosition((prev) => {
      const nextVal = Math.min(100, prev + 25);
      if (nextVal === 100) {
        showLocalToast("📍 Destination Arrived!", "Prompt proof photo to confirm delivery.");
      } else {
        showLocalToast("🚴 Navigation Coordinates Shifted", `Rider dot at ${nextVal}% marker`);
      }
      return nextVal;
    });
  };

  const handleCallBuyer = () => {
    setMockBuyerPhoneFlash(true);
    showLocalToast(`📞 Outgoing VoIP call: Dialing ${activeJob?.buyer_phone}`, "Relaying via encrypted Selonachipa gateway...");
    setTimeout(() => {
      setMockBuyerPhoneFlash(false);
    }, 3000);
  };

  const triggerCameraMock = () => {
    setIsCapturing(true);
    setTimeout(() => {
      // Simulate taking a photo of a typical farm box
      setCapturedPhotoUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"); // beautiful produce photo
      setIsCapturing(false);
    }, 1500);
  };

  const handleCompleteDeliveryConfirm = () => {
    if (!activeJob) return;
    if (!capturedPhotoUrl) {
      showLocalToast("⚠️ Photo Required", "Please tap the camera shutter to capture proof of receipt.");
      return;
    }

    const job = activeJob;
    const brutoFee = job.fee;
    // Platform fee 8%, Social Fund contribution 5%. Net pay to Rider is 87% of gross fee
    const platformFeeVal = brutoFee * 0.08;
    const socialFundContribVal = brutoFee * 0.05;
    const netPayout = brutoFee - platformFeeVal - socialFundContribVal;

    // Update financial sums
    setTodayEarnings((p) => p + netPayout);
    setTodayCount((c) => c + 1);
    setWeekEarnings((w) => w + netPayout);

    // Update global Rider metrics
    const currentSf = rider.socialFundBalance;
    const currentDel = rider.deliveriesCount;
    onUpdateRiderStats({
      deliveriesCount: currentDel + 1,
      socialFundBalance: currentSf + socialFundContribVal,
    });

    // Add to history list (local and parents)
    const newHistoryRecord = {
      order_ref: job.order_ref,
      pickup_short: job.pickup_short,
      drop_short: job.drop_short,
      fee: netPayout,
      total_dist: job.total_dist,
      date: "TODAY",
      timestamp: "Today, Just Now"
    };

    setHistoryJobs([newHistoryRecord, ...historyJobs]);
    addCompletedJobLog(newHistoryRecord);

    // Record payout confirmation
    addPayoutLog(netPayout);

    // If it is a real customer parcel, mark it delivered in parent state
    if ((job as any).isRealParcel && setParcelJobs) {
      setParcelJobs((prev: any[]) => prev.map(p => {
        if (p.parcel_id === job.id) {
          return {
            ...p,
            status: "delivered",
            delivery_photo: capturedPhotoUrl,
            delivered_at: new Date().toISOString()
          };
        }
        return p;
      }));
    }

    // Clean up active job stats
    setActiveJob(null);
    setCapturedPhotoUrl("");
    setShowPhotoUploadModal(false);

    showLocalToast(
      "🏆 JOB COMPLETED!", 
      `K ${netPayout.toFixed(2)} credited directly to MoMo. K ${socialFundContribVal.toFixed(2)} saved to Fund!`
    );
  };

  // Filter history jobs by time scale
  const getFilteredHistoryJobs = () => {
    if (historyFilter === "TODAY") {
      return historyJobs.filter((j) => j.date === "TODAY");
    }
    if (historyFilter === "7_DAYS") {
      return historyJobs.filter((j) => j.date === "TODAY" || j.date === "YESTERDAY" || j.date.includes("3_") || j.date.includes("4_") || j.date.includes("5_"));
    }
    return historyJobs; // all (30 days)
  };

  const filteredHistory = getFilteredHistoryJobs();
  const totalHistoryCount = filteredHistory.length;
  const totalHistoryKms = filteredHistory.reduce((sum, j) => sum + j.total_dist, 0);
  const totalHistoryEarnings = filteredHistory.reduce((sum, j) => sum + j.fee, 0);
  const avgHistoryFee = totalHistoryCount > 0 ? (totalHistoryEarnings / totalHistoryCount) : 0;

  return (
    <div className="px-4 py-3 space-y-4 font-sans text-left bg-[#040507] text-white max-w-md mx-auto">
      
      {/* Sub tabs: Local Hub vs History Logs */}
      <div className="flex bg-[#0a0c10] border border-zinc-850 p-1.5 rounded-xl gap-1">
        <button
          onClick={() => setJobsTab("DISPATCH")}
          className={`w-1/2 text-center py-2 text-xs font-black rounded-lg uppercase tracking-wide cursor-pointer transition-colors ${
            jobsTab === "DISPATCH" 
              ? "bg-emerald-500 text-[#040507]" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Dispatch Hub
        </button>
        <button
          onClick={() => setJobsTab("HISTORY")}
          className={`w-1/2 text-center py-2 text-xs font-black rounded-lg uppercase tracking-wide cursor-pointer transition-colors ${
            jobsTab === "HISTORY" 
              ? "bg-emerald-500 text-[#040507]" 
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Delivery Ledger ({historyJobs.length})
        </button>
      </div>

      {/* Local Flash notifications inside Job view */}
      <AnimatePresence>
        {jobToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className="p-3 bg-zinc-950 border-l-4 border-emerald-500 rounded-xl flex items-start gap-2.5 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10.5px] font-black text-white">{jobToast.message}</p>
              {jobToast.sub && <p className="text-[9.5px] text-zinc-400 font-mono">{jobToast.sub}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {jobsTab === "DISPATCH" ? (
        <div className="space-y-4">
          
          {/* OFFLINE COVER OR SCANNERS */}
          {!riderOnline && !activeJob && (
            <div className="bg-[#090b0e] border border-zinc-850 p-6 rounded-2xl text-center space-y-3 py-10">
              <EyeOff className="w-9 h-9 mx-auto text-zinc-650" />
              <div>
                <h4 className="text-sm font-bold text-zinc-200">You are Currently Offline</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed max-w-xs mx-auto">
                  The automated dispatch scheduler cannot match you with high-paying local farmer orders until you toggle your dispatch line online.
                </p>
              </div>
            </div>
          )}

          {riderOnline && !incomingJob && !activeJob && (
            <div className="bg-[#090b0e]/70 border border-zinc-850/60 p-6 rounded-2xl text-center space-y-4.5 py-14">
              <div className="relative inline-block">
                <Clock className="w-9 h-9 mx-auto text-emerald-400 animate-spin [animation-duration:8s]" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#090b0e]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-zinc-100 uppercase tracking-widest font-mono">Active Dispatch scanning...</h4>
                <p className="text-[9.5px] font-mono text-zinc-400 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Soweto & Chisamba Freight Yards
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 lines-clamp-2 max-w-xs mx-auto leading-relaxed">
                  Awaiting buyer cargo lock payments. System will alert you with a 15-second countdown as soon as a load match opens.
                </p>
              </div>
            </div>
          )}

          {/* 1. INCOMING HIGH-INTENSITY DISPATCH CARD (15s Countdown) */}
          <AnimatePresence>
            {incomingJob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                className="bg-[#0b0f15] border-2 border-[#ffa550]/40 rounded-2xl overflow-hidden shadow-2xl relative"
              >
                {/* Visual Draining progress bar at the very top of the card */}
                <div className="h-1.5 w-full bg-zinc-900">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-[#ffa550] transition-all duration-1000 ease-linear"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>

                <div className="p-4.5 space-y-4">
                  {/* Title Bar */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-mono bg-[#ffa550]/10 border border-[#ffa550]/20 font-black text-[#ffa550] px-2 py-0.5 rounded-full">
                        Offer Expires in {timerLeft}s
                      </span>
                      <h4 className="text-xs font-black text-rose-100 mt-2">NEW DISPATCH OPPORTUNITY</h4>
                      <p className="text-[9.5px] font-mono text-zinc-400">Order Ref: {incomingJob.order_ref}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase font-mono block">Gross Fee</span>
                      <span className="text-sm font-black text-[#00ffd2]">K {incomingJob.fee.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Cargo Breakdown */}
                  <div className="bg-[#05070a] border border-zinc-900 p-3 rounded-xl space-y-1">
                    <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">Farming Load Details</span>
                    <p className="text-xs font-bold text-zinc-100">{incomingJob.item}</p>
                    <p className="text-[9.5px] font-mono text-[#ffa550]">Packed & sealed at vendor depot</p>
                  </div>

                  {/* Route information */}
                  <div className="space-y-2 text-[11px] bg-[#05070a]/50 p-3 rounded-xl border border-zinc-900/55">
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 font-bold shrink-0">Seller Pickup:</span>
                      <span className="text-zinc-300 truncate">{incomingJob.pickup} ({incomingJob.pickup_dist} km away)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 font-bold shrink-0">Buyer Drop-off:</span>
                      <span className="text-zinc-300 truncate">{incomingJob.dropoff} ({incomingJob.dropoff_dist} km path)</span>
                    </div>
                    <div className="border-t border-zinc-900 pt-1.5 flex justify-between font-mono text-[10px] text-zinc-400">
                      <span>Total Route: <strong>{incomingJob.total_dist} km</strong></span>
                      <span>ETA: <strong>32 mins</strong></span>
                    </div>
                  </div>

                  {/* Escrow and Social Fund Lines */}
                  <div className="space-y-1.5 text-[10px] font-mono bg-purple-950/15 border border-purple-500/10 p-2.5 rounded-xl">
                    <div className="flex justify-between text-purple-300">
                      <span>Social Fund Top-up (5%):</span>
                      <span className="font-bold">+K {(incomingJob.fee * 0.05).toFixed(2)} ZMW</span>
                    </div>
                    <div className="flex justify-between text-emerald-400 border-t border-zinc-900 pt-1.5">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Selonachipa Smart-Escrow status:
                      </span>
                      <span className="font-black bg-emerald-500/10 px-1 rounded border border-emerald-500/20">LOCKED</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2.5 pt-1.5">
                    <button
                      onClick={() => handleDeclineJob(false)}
                      className="w-1/3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleAcceptJob}
                      className="w-2/3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2.5 rounded-xl transition-all font-sans cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/10"
                    >
                      Accept Cargo Route
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. ACTIVE DELIVERY CONSOLE */}
          {activeJob && (
            <div className="space-y-4">
              
              {/* Route Map Header & Summary tiles */}
              <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-2xl space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Navigation2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black uppercase font-mono tracking-widest text-[#ffa550]">ACTIVE FREIGHT DELIVERY</span>
                  </div>
                  <span className="text-[9.5px] uppercase bg-indigo-500/10 border border-indigo-500/15 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded">
                    {mockMapPosition < 50 ? "Heading to Pickup" : mockMapPosition < 100 ? "Cargo Out for Delivery" : "Arrived at Drop-off"}
                  </span>
                </div>

                {/* SVG Route Trajectory Map */}
                <div className="h-44 w-full bg-[#050609] rounded-xl border border-zinc-900 relative overflow-hidden">
                  {/* Subtle map pattern paths */}
                  <svg className="absolute inset-0 w-full h-full text-zinc-850" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
                  </svg>

                  {/* Route line */}
                  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <line 
                      x1="10%" y1="75%" x2="90%" y2="25%" 
                      stroke="#1e293b" strokeWidth="4" strokeLinecap="round" 
                    />
                    <line 
                      x1="10%" y1="75%" x2="90%" y2="25%" 
                      stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" 
                    />
                    
                    {/* Pulsing Pickup Dot */}
                    <circle cx="10%" cy="75%" r="6" fill="#f59e0b" className="animate-pulse" />
                    {/* Pulsing Dropoff Dot */}
                    <circle cx="90%" cy="25%" r="6" fill="#10b981" />
                  </svg>

                  {/* Rider Current Position Green Dot on Route */}
                  <div 
                    className="absolute w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-all duration-1000 ease-out"
                    style={{
                      left: `calc(10% + (${mockMapPosition}% * 0.8))`,
                      top: `calc(75% - (${mockMapPosition}% * 0.5))`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  </div>

                  {/* Map Pin Labels */}
                  <div className="absolute bottom-2.5 left-2.5 text-[9px] bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-900 font-mono text-amber-400">
                    Soweto Depot
                  </div>
                  <div className="absolute top-2.5 right-2.5 text-[9px] bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-900 font-mono text-emerald-400">
                    Woodlands Gate 3
                  </div>

                  {/* GPS Sync Indicator */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <button 
                      onClick={handleSimulateGPSMove}
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[8.5px] font-mono text-zinc-300 font-bold py-1 px-2.5 rounded-md flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-zinc-500 animate-spin [animation-duration:12s]" />
                      <span>Drive +25%</span>
                    </button>
                  </div>
                </div>

                {/* 3 Summary tiles */}
                <div className="grid grid-cols-3 gap-2 text-center text-zinc-300 font-mono">
                  <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8.5px] text-zinc-500 block">Distance Remaining</span>
                    <span className="text-xs font-black text-white">
                      {Math.max(0, parseFloat((activeJob.total_dist * (1 - mockMapPosition / 100)).toFixed(1)))} km
                    </span>
                  </div>
                  <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8.5px] text-zinc-500 block">ETA</span>
                    <span className="text-xs font-black text-white">
                      {Math.max(0, Math.round(32 * (1 - mockMapPosition / 100)))} mins
                    </span>
                  </div>
                  <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                    <span className="text-[8.5px] text-zinc-500 block">Pledged Fee</span>
                    <span className="text-xs font-black text-emerald-400">K {activeJob.fee.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery info card */}
              <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <span className="text-[9.5px] uppercase font-mono text-zinc-500 block">Cargo Recipient Credentials</span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{activeJob.buyer}</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold">{activeJob.buyer_phone}</p>
                    </div>
                    <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 rounded">
                      Escrow Secured
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#050609] rounded-xl border border-zinc-900 space-y-1.5">
                  <span className="text-[9px] uppercase font-mono text-zinc-500">Destination dropoff point</span>
                  <p className="text-xs font-bold text-zinc-200">{activeJob.dropoff}</p>
                  <p className="text-[10.5px] text-zinc-400 mt-1 lines-clamp-2 leading-relaxed font-mono">
                    <strong>Instructions:</strong> Ring doorbell at gate, state "Selonachipa farm dropoff # {activeJob.order_ref}".
                  </p>
                </div>

                {/* Big Sticky actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={handleCallBuyer}
                    className="w-1/3 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className={`w-3.5 h-3.5 text-zinc-400 ${mockBuyerPhoneFlash ? "animate-bounce text-emerald-400" : ""}`} />
                    <span>Call Buyer</span>
                  </button>

                  <button
                    onClick={() => {
                      if (mockMapPosition < 100) {
                        showLocalToast("⚠️ Destination Not Reached", "Please drive coordinates to 100% using simulated GPS coordinate shifts.");
                        return;
                      }
                      setShowPhotoUploadModal(true);
                    }}
                    className={`w-2/3 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      mockMapPosition >= 100 
                        ? "bg-emerald-500 hover:bg-emerald-400 text-[#040507]" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Delivery</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      ) : (
        /* ================= HISTORY LEDGER MODULES ================= */
        <div id="history-ledger-container" className="space-y-4">
          
          {/* Chronological filters */}
          <div className="flex bg-[#0a0c10] border border-zinc-850 p-1 rounded-xl justify-between text-[10px]">
            <button
              onClick={() => setHistoryFilter("TODAY")}
              className={`py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer ${historyFilter === "TODAY" ? "bg-zinc-800 text-amber-400 border border-zinc-700/50" : "text-zinc-500"}`}
            >
              Today
            </button>
            <button
              onClick={() => setHistoryFilter("7_DAYS")}
              className={`py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer ${historyFilter === "7_DAYS" ? "bg-zinc-800 text-amber-400 border border-zinc-700/50" : "text-zinc-500"}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setHistoryFilter("30_DAYS")}
              className={`py-1.5 px-3 rounded-lg font-bold transition-colors cursor-pointer ${historyFilter === "30_DAYS" ? "bg-zinc-800 text-amber-400 border border-zinc-700/50" : "text-zinc-500"}`}
            >
              Last 30 Days
            </button>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#090b0e] border border-zinc-850 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase font-mono text-zinc-500 block">Job Count</span>
              <span className="text-xs font-black text-white">{totalHistoryCount} trips</span>
            </div>
            <div className="bg-[#090b0e] border border-zinc-850 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase font-mono text-zinc-500 block">Total km</span>
              <span className="text-xs font-black text-white">{totalHistoryKms.toFixed(1)} km</span>
            </div>
            <div className="bg-[#090b0e] border border-zinc-850 p-2.5 rounded-xl text-center">
              <span className="text-[8.5px] uppercase font-mono text-zinc-500 block">avg fee</span>
              <span className="text-xs font-black text-emerald-400">K {avgHistoryFee.toFixed(1)}</span>
            </div>
          </div>

          {/* Chronological list of completed runs */}
          <div className="bg-[#07090c] border border-zinc-850 rounded-2xl divide-y divide-zinc-900/60 max-h-[300px] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center font-mono">No matching records found for date filter range.</p>
            ) : (
              filteredHistory.map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center bg-[#07090c] hover:bg-[#090b0e] transition-colors leading-normal">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest">{item.timestamp}</span>
                    <h5 className="text-xs font-bold text-zinc-250 font-mono">Ref: {item.order_ref}</h5>
                    <p className="text-[10.5px] text-zinc-400">
                      {item.pickup_short} ➔ {item.drop_short}
                    </p>
                    <p className="text-[8.5px] text-zinc-500 font-mono">{item.total_dist} km voyage</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-black text-emerald-400">K {item.fee.toFixed(2)}</span>
                    <span className="text-[8px] text-emerald-400 font-mono block bg-emerald-500/10 px-1 rounded uppercase tracking-wider font-extrabold border border-emerald-500/20 mt-1">Paid</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* HERO TIER MOTIVATIONAL ANCHOR PROGRESS BAR */}
          <div className="bg-[#12110c] border border-[#ffa550]/20 p-3.5 rounded-2xl space-y-2.5 shadow-md">
            <div className="flex justify-between items-baseline">
              <div className="leading-tight">
                <span className="text-[8.5px] uppercase text-[#ffa550] tracking-widest font-mono font-black">Motivational Tier Milestone</span>
                <span className="text-xs font-black text-amber-200 block">HERO TIER PROGRESS</span>
              </div>
              <span className="text-xs font-mono font-extrabold text-[#ffa550]">
                {rider.deliveriesCount}/300 Deliveries
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                <div 
                  className="h-full bg-linear-to-r from-amber-500 to-[#ffa550] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((rider.deliveriesCount / 300) * 100))}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-[9px] text-zinc-400">
                <span>Starter Level (0)</span>
                {rider.deliveriesCount >= 300 ? (
                  <span className="text-amber-500 font-black flex items-center gap-1 bg-[#ffa550]/10 px-1 border border-[#ffa550]/20 rounded uppercase">
                    ⭐ Hero tier achieved
                  </span>
                ) : (
                  <span>Hero Level Goal (300)</span>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PHOTO PROOF-OF-RECEIPT OVERLAY MODAL */}
      <AnimatePresence>
        {showPhotoUploadModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0d12] border border-zinc-850 rounded-2xl w-full max-w-sm overflow-hidden text-left"
            >
              {/* Close pin */}
              <div className="flex justify-between items-center p-4 border-b border-zinc-900">
                <h4 className="text-xs font-black uppercase font-mono tracking-wider text-zinc-200">PROOF-OF-RECEIPT CAMERA</h4>
                <button 
                  onClick={() => setShowPhotoUploadModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5.5 space-y-4">
                <p className="text-[10px] text-zinc-400 font-mono leading-relaxed bg-[#050609] p-2.5 rounded-lg border border-zinc-950">
                  ⚠️ Grab a clear portrait shot of the seller package at Woodlands Ext. door grid. Payment resolves within 1 millisecond of uploading verified photos.
                </p>

                {/* Simulated Lens feedback */}
                <div className="h-48 w-full bg-[#050609] rounded-xl border border-zinc-900 relative overflow-hidden flex flex-col items-center justify-center text-center">
                  {isCapturing ? (
                    <div className="space-y-2">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                      <p className="text-[10px] font-mono text-zinc-500">Exposing lens shutter grid...</p>
                    </div>
                  ) : capturedPhotoUrl ? (
                    <div className="absolute inset-0">
                      <img 
                        referrerPolicy="no-referrer"
                        src={capturedPhotoUrl} 
                        alt="Proof of receipt" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded">
                        Captured Proof Attached ✓
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-[10px] text-zinc-500">Camera Lens Closed</p>
                      <button
                        onClick={triggerCameraMock}
                        className="text-[9.5px] text-[#ffa550] hover:underline font-mono bg-[#ffa550]/5 border border-[#ffa550]/15 py-1 px-3 rounded-full cursor-pointer"
                      >
                        Trigger Lens Shutter Simulation
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setCapturedPhotoUrl("");
                    }}
                    disabled={!capturedPhotoUrl}
                    className="w-1/3 border border-zinc-800 hover:bg-zinc-900 text-zinc-500 disabled:opacity-50 text-xs font-bold py-2 rounded-xl text-center cursor-pointer"
                  >
                    Reset Photo
                  </button>
                  <button
                    onClick={handleCompleteDeliveryConfirm}
                    disabled={!capturedPhotoUrl}
                    className="w-2/3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-extrabold text-xs py-2 rounded-xl text-center cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/15"
                  >
                    <Check className="w-4 h-4" />
                    <span>File Verification</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
