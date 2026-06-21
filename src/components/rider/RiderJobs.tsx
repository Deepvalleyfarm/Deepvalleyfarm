import React, { useState, useEffect } from "react";
import { 
  Plus, Eye, Heart, Edit3, CirclePlay, PauseCircle, Trash2, ArrowLeft, RefreshCw, X, 
  MapPin, ShieldCheck, Clock, Check, PhoneCall, AlertCircle, Sparkles, Navigation2, 
  Send, Camera, EyeOff, Calendar, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  Sliders, Code2, Coins, Star, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getHaversineDistance, 
  getBearing, 
  optimizeBatchRoutes, 
  matchProximityBatches, 
  MOCK_PENDING_MARKETPLACE_ORDERS, 
  TECHNICAL_SPECS,
  BatchOrderItem,
  RiderBatch 
} from "./RiderBatchEngine";
import { BatchOfferCard } from "./BatchOfferCard";
import { BatchRouteMap } from "./BatchRouteMap";
import { SequenceIndicator } from "./SequenceIndicator";

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

  // CORRIDOR BATCHING STATES
  const [batchingMode, setBatchingMode] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(3); // Max configurable radius in km, default 3km
  const [isScanningBatches, setIsScanningBatches] = useState<boolean>(false);
  const [discoveredBatches, setDiscoveredBatches] = useState<RiderBatch[]>([]);
  const [selectedBatchOffer, setSelectedBatchOffer] = useState<RiderBatch | null>(null);
  const [batchOfferTimer, setBatchOfferTimer] = useState<number>(30);
  const [batchOfferProgress, setBatchOfferProgress] = useState<number>(100);
  const [activeBatch, setActiveBatch] = useState<RiderBatch | null>(null);
  const [batchStep, setBatchStep] = useState<"PICKUP" | "DROPOFF" | "SUMMARY">("PICKUP");
  const [currentRouteTargetIdx, setCurrentRouteTargetIdx] = useState<number>(0);
  const [merchantStatus, setMerchantStatus] = useState<Record<string, "PENDING" | "COLLECTED" | "NOT_READY_SPLIT">>({});
  const [riderConfirmedPickups, setRiderConfirmedPickups] = useState<Record<string, boolean>>({});
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [merchantRatings, setMerchantRatings] = useState<Record<string, number>>({});
  const [activeTechSpecTab, setActiveTechSpecTab] = useState<"db" | "node" | "lipila" | "fcm">("db");
  const [showTechModal, setShowTechModal] = useState<boolean>(false);
  const [fcmAlertFlashed, setFcmAlertFlashed] = useState<string | null>(null);

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

  // CORRIDOR BATCH OFFER TIMED DECREMENTER
  useEffect(() => {
    let batchOfferCountdown: any;
    if (selectedBatchOffer) {
      batchOfferCountdown = setInterval(() => {
        setBatchOfferTimer((prev) => {
          if (prev <= 1) {
            handleDeclineBatchOffer(true);
            return 30;
          }
          const nextVal = prev - 1;
          setBatchOfferProgress((nextVal / 30) * 100);
          return nextVal;
        });
      }, 1000);
    }
    return () => clearInterval(batchOfferCountdown);
  }, [selectedBatchOffer]);

  const handleScanForBatches = () => {
    if (!riderOnline) {
      showLocalToast("⚠️ Offline Alert", "Please go online first to scan local corridors.");
      return;
    }
    setIsScanningBatches(true);
    showLocalToast("🔍 Corridor Proximity Engine is running...", "Querying pending orders within " + searchRadius + " km radius");
    
    setTimeout(() => {
      // Simulate scanning with a realistic position near Chisamba wholesale hub
      const matches = matchProximityBatches(-15.2215, 28.3240, searchRadius, 4);
      setIsScanningBatches(false);
      
      if (matches.length > 0) {
        setDiscoveredBatches(matches);
        setSelectedBatchOffer(matches[0]);
        setBatchOfferTimer(30);
        setBatchOfferProgress(100);
        showLocalToast("🍇 CORRIDOR LOCK EXCEL: Grouped Batch Found!", `${matches[0].orders.length} orders heading along same corridor cluster.`);
        
        // Play alert tones
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(587, audioCtx.currentTime);
          osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.15);
          osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.6);
        } catch (e) {}
      } else {
        setDiscoveredBatches([]);
        setSelectedBatchOffer(null);
        showLocalToast("📭 No corridor clusters found", "No orders within " + searchRadius + " km matched corridor bearing constraints. Try increasing radius!");
      }
    }, 1500);
  };

  const handleAcceptBatchOffer = () => {
    if (!selectedBatchOffer) return;
    
    // Boost acceptance rate slightly
    const priorRate = rider.acceptanceRate;
    const nextRate = Math.min(100, priorRate + 2);
    onUpdateRiderStats({ acceptanceRate: nextRate });

    // Initialize merchant pickup status to pending
    const initialMerchantStatus: Record<string, "PENDING" | "COLLECTED" | "NOT_READY_SPLIT"> = {};
    const initialRiderConfirmed: Record<string, boolean> = {};
    selectedBatchOffer.orders.forEach(o => {
      initialMerchantStatus[o.order_id] = "PENDING";
      initialRiderConfirmed[o.order_id] = false;
    });

    setMerchantStatus(initialMerchantStatus);
    setRiderConfirmedPickups(initialRiderConfirmed);
    
    // Accept and load active batch
    setActiveBatch({
      ...selectedBatchOffer,
      status: "ACCEPTED"
    });
    setSelectedBatchOffer(null);
    setBatchStep("PICKUP");
    setCurrentRouteTargetIdx(0);
    showLocalToast("🍇 Corridor Batch Secured", "Proceed to closest pickup node: " + selectedBatchOffer.orders[0].seller_name);
  };

  const handleDeclineBatchOffer = (isTimeout = false) => {
    if (!selectedBatchOffer) return;

    // Reject offer decreases acceptance rate by 5%
    const priorRate = rider.acceptanceRate;
    const nextRate = Math.max(65, priorRate - 5);
    onUpdateRiderStats({ acceptanceRate: nextRate });

    setSelectedBatchOffer(null);
    showLocalToast(
      isTimeout ? "⏱️ Batch Offer Expired" : "❌ Batch Offer Declined",
      `Your Acceptance Rate dropped to ${nextRate}%`
    );
  };

  const handleConfirmRiderPickup = (order_id: string) => {
    setRiderConfirmedPickups(prev => ({
      ...prev,
      [order_id]: true
    }));
    showLocalToast("✓ Rider scan confirmed", "Awaiting merchant's hand-over verification.");
  };

  const handleConfirmMerchantPack = (order_id: string) => {
    if (!riderConfirmedPickups[order_id]) {
      showLocalToast("⚠️ Scan Required", "Rider must tap \"Scan & Collected\" before merchant can approve hand-over.");
      return;
    }

    setMerchantStatus(prev => ({
      ...prev,
      [order_id]: "COLLECTED"
    }));

    if (activeBatch) {
      const updatedOrders = activeBatch.orders.map(o => 
        o.order_id === order_id ? { ...o, status: "COLLECTED" as const } : o
      );
      
      setActiveBatch({
        ...activeBatch,
        orders: updatedOrders
      });

      showLocalToast("📦 Merchant approved package collection!", `Order ${order_id} loaded to bike box.`);
      
      // Check if all active orders in batch are picked up / resolved
      const allPickedUp = updatedOrders.every(o => 
        o.status === "COLLECTED" || o.status === "NOT_READY_SPLIT"
      );

      if (allPickedUp) {
        setTimeout(() => {
          setBatchStep("DROPOFF");
          setCurrentRouteTargetIdx(0);
          showLocalToast("🚴 All pickups resolved! Corridor routing optimized.", "Proceed to optimized drop-off sequence.");
        }, 1200);
      } else {
        const firstUncollectedIdx = updatedOrders.findIndex(o => 
          o.status !== "COLLECTED" && o.status !== "NOT_READY_SPLIT"
        );
        if (firstUncollectedIdx !== -1) {
          setCurrentRouteTargetIdx(firstUncollectedIdx);
        }
      }
    }
  };

  const handleSplitOrderOutOfBatch = (order_id: string) => {
    if (!activeBatch) return;

    setMerchantStatus(prev => ({
      ...prev,
      [order_id]: "NOT_READY_SPLIT"
    }));

    const orderToSplit = activeBatch.orders.find(o => o.order_id === order_id);
    if (!orderToSplit) return;

    const remainingOrders = activeBatch.orders.filter(o => o.order_id !== order_id);
    
    showLocalToast("⚠️ Merchant Unavailable: Splitting order", `Order ${order_id} returned to general queue. Corridor adjusted.`);

    if (remainingOrders.length === 0) {
      setActiveBatch(null);
      showLocalToast("❌ Batch Dissolved", "No orders remaining in current corridor batch.");
      return;
    }

    // Re-calculate math and routes for remaining orders
    const priorLat = -15.2215; // Chisamba area
    const priorLon = 28.3240;
    const routeOpt = optimizeBatchRoutes(priorLat, priorLon, remainingOrders);
    
    // Estimate new distance
    const totalDistance = Math.max(2.5, parseFloat((activeBatch.total_distance * 0.75).toFixed(1)));
    const totalEarnings = remainingOrders.reduce((sum, o) => sum + o.fee, 0);

    const finalOrders = activeBatch.orders.map(o => o.order_id === order_id ? { ...o, status: "NOT_READY_SPLIT" as const } : o);

    setActiveBatch({
      ...activeBatch,
      orders: finalOrders,
      total_distance: totalDistance,
      total_earnings: totalEarnings,
      pickup_sequence: routeOpt.pickups,
      dropoff_sequence: routeOpt.dropoffs
    });

    // If remaining picked elements are already ready, auto push drop phase
    const allRemainingPicked = remainingOrders.every(o => 
      merchantStatus[o.order_id] === "COLLECTED"
    );
    if (allRemainingPicked) {
      setTimeout(() => {
        setBatchStep("DROPOFF");
        setCurrentRouteTargetIdx(0);
      }, 1000);
    } else {
      const firstUncollectedIdx = finalOrders.findIndex(o => 
        o.status !== "COLLECTED" && o.status !== "NOT_READY_SPLIT"
      );
      if (firstUncollectedIdx !== -1) {
        setCurrentRouteTargetIdx(firstUncollectedIdx);
      }
    }
  };

  const handleSendFcmEtaAlert = (order: BatchOrderItem) => {
    setFcmAlertFlashed(JSON.stringify({
      to: "/topics/buyer_" + order.order_id,
      notification: {
        title: "SeloNaChipa: Rider Approaching! 🚴",
        body: `Your corridor courier is 5 minutes away. Prepare cash or ensure MTN/Airtel/Zamtel has K ${order.price} locked. Verification OTP is: ${order.otp}.`,
        sound: "default"
      },
      data: {
        order_key: order.order_id,
        eta_minutes: 5,
        rider_handle: rider.name,
        carrier_action: "CORRIDOR_PROXIMITY_TRIGGER"
      }
    }, null, 2));

    showLocalToast(`📨 Proximity Push Triggered: Notification sent to ${order.buyer_name}!`, "ETA: 5 mins alert dispatched via Firebase Cloud Messaging.");
  };

  const handleConfirmInAppDelivery = (order_id: string) => {
    if (!activeBatch) return;

    const orderObj = activeBatch.orders.find(o => o.order_id === order_id);
    if (!orderObj) return;

    // Proceed to partial release escrow fraction immediately via Lipila in-app tap
    const orderRiderEarnings = orderObj.fee;
    const platformFeeVal = orderRiderEarnings * 0.08;
    const socialFundContribVal = orderRiderEarnings * 0.05;
    const netPayout = orderRiderEarnings - platformFeeVal - socialFundContribVal;

    // Increment financial indicators
    setTodayEarnings(prev => prev + netPayout);
    setTodayCount(prev => prev + 1);
    setWeekEarnings(prev => prev + netPayout);

    // Increment global rider statistics
    onUpdateRiderStats({
      deliveriesCount: rider.deliveriesCount + 1,
      socialFundBalance: rider.socialFundBalance + socialFundContribVal
    });

    // Add to history
    const historyRecord = {
      order_ref: orderObj.order_id,
      pickup_short: orderObj.seller_name.substring(0, 15),
      drop_short: orderObj.dropoff_location.name.substring(0, 15),
      fee: netPayout,
      total_dist: parseFloat((activeBatch.total_distance / activeBatch.orders.filter(o => o.status !== "NOT_READY_SPLIT").length).toFixed(1)),
      date: "TODAY",
      timestamp: "Today, Just Now (Corridor Drop)"
    };
    setHistoryJobs([historyRecord, ...historyJobs]);
    addCompletedJobLog(historyRecord);
    addPayoutLog(netPayout);

    // Update state of individual order
    const updatedOrders = activeBatch.orders.map(o => 
      o.order_id === order_id ? { ...o, status: "DELIVERED" as const } : o
    );

    setActiveBatch({
      ...activeBatch,
      orders: updatedOrders
    });

    showLocalToast("🏆 Escrow Unlocked via Lipila API!", `K ${netPayout.toFixed(2)} transferred to your wallet! K ${socialFundContribVal.toFixed(2)} topped up to Social Fund.`);

    // If all remaining active deliveries processed, trigger summary summary
    const allDropsSettled = updatedOrders.every(o => 
      o.status === "DELIVERED" || o.status === "NOT_READY_SPLIT" || o.status === "CANCELLED" || o.status === "ATTEMPTED_DISPUTE"
    );

    if (allDropsSettled) {
      setTimeout(() => {
        setBatchStep("SUMMARY");
      }, 1500);
    } else {
      const activeFiltered = updatedOrders.filter(o => o.status !== "NOT_READY_SPLIT");
      const firstUndeliveredIdx = activeFiltered.findIndex(o => 
        o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "ATTEMPTED_DISPUTE"
      );
      if (firstUndeliveredIdx !== -1) {
        setCurrentRouteTargetIdx(firstUndeliveredIdx);
      }
    }
  };

  const handleUnreachableAttemptPhoto = (order_id: string) => {
    if (!activeBatch) return;

    setIsCapturing(true);
    showLocalToast("📷 Activating camera lens...", "Uploading dispute evidence photo to SeloNaChipa cloud storage.");
    
    setTimeout(() => {
      setIsCapturing(false);
      showLocalToast("✓ Proof captured! Escrow held for 24h", "Disputed delivery initiated. Ticket generated.");
      
      const updatedOrders = activeBatch.orders.map(o => 
        o.order_id === order_id ? { ...o, status: "ATTEMPTED_DISPUTE" as const } : o
      );

      setActiveBatch({
        ...activeBatch,
        orders: updatedOrders
      });

      // Settle rider compensation for attempted drop-off (equivalent to 50% rider fee segment)
      const orderObj = activeBatch.orders.find(o => o.order_id === order_id)!;
      const compPayout = (orderObj.fee * 0.5) * 0.87;
      setTodayEarnings(prev => prev + compPayout);
      addPayoutLog(compPayout);

      const allDropsSettled = updatedOrders.every(o => 
        o.status === "DELIVERED" || o.status === "NOT_READY_SPLIT" || o.status === "CANCELLED" || o.status === "ATTEMPTED_DISPUTE"
      );

      if (allDropsSettled) {
        setTimeout(() => {
          setBatchStep("SUMMARY");
        }, 1500);
      } else {
        const activeFiltered = updatedOrders.filter(o => o.status !== "NOT_READY_SPLIT");
        const firstUndeliveredIdx = activeFiltered.findIndex(o => 
          o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "ATTEMPTED_DISPUTE"
        );
        if (firstUndeliveredIdx !== -1) {
          setCurrentRouteTargetIdx(firstUndeliveredIdx);
        }
      }
    }, 1500);
  };

  const handleMidbatchCancellation = (order_id: string) => {
    if (!activeBatch) return;

    showLocalToast("🛑 Customer Cancelled Flight segment", `Order ${order_id} drop segment void. Escrow returned to buyer.`);

    const updatedOrders = activeBatch.orders.map(o => 
      o.order_id === order_id ? { ...o, status: "CANCELLED" as const } : o
    );

    setActiveBatch({
      ...activeBatch,
      orders: updatedOrders
    });

    // Under Section 5 policy, rider gets 100% of pickup-leg payout compensation
    const orderObj = activeBatch.orders.find(o => o.order_id === order_id)!;
    const compPayout = (orderObj.fee * 0.4) * 0.87; // typical segment representation
    setTodayEarnings(prev => prev + compPayout);
    addPayoutLog(compPayout);

    const allDropsSettled = updatedOrders.every(o => 
      o.status === "DELIVERED" || o.status === "NOT_READY_SPLIT" || o.status === "CANCELLED" || o.status === "ATTEMPTED_DISPUTE"
    );

    if (allDropsSettled) {
      setTimeout(() => {
        setBatchStep("SUMMARY");
      }, 1500);
    } else {
      const activeFiltered = updatedOrders.filter(o => o.status !== "NOT_READY_SPLIT");
      const firstUndeliveredIdx = activeFiltered.findIndex(o => 
        o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "ATTEMPTED_DISPUTE"
      );
      if (firstUndeliveredIdx !== -1) {
        setCurrentRouteTargetIdx(firstUndeliveredIdx);
      }
    }
  };

  const handlePostBatchRating = () => {
    // Reset all parameters, make rider available again
    setActiveBatch(null);
    setMerchantRatings({});
    setOtpInputs({});
    showLocalToast("Available status restored! 🚴", "Scanning central corridor networks for active freight.");
  };

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
          
          {/* FRONT-FACING MODE SELECTOR PANEL */}
          {!activeJob && !activeBatch && (
            <div className="flex bg-[#0a0c10] border border-zinc-850 p-1 rounded-xl items-center justify-between text-[11px] font-bold animate-fade-in">
              <span className="pl-2.5 text-zinc-400 font-mono flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Freight Mode:</span>
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setBatchingMode(false)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${!batchingMode ? "bg-[#ffa550] text-[#040507]" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  ⚡ Single Route
                </button>
                <button
                  type="button"
                  onClick={() => setBatchingMode(true)}
                  className={`py-1 px-2.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${batchingMode ? "bg-indigo-500 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  🍇 Corridor Batching
                </button>
              </div>
            </div>
          )}

          {/* ================= CORRIDOR BATCHING EXPERIENCE ================= */}
          {batchingMode ? (
            <div className="space-y-4">
              
              {/* CASE A: NO ACTIVE BATCH AND NO OFFER SCROLL - CONFIG PANELS & DISCOVER */}
              {!activeBatch && !selectedBatchOffer && (
                <div className="space-y-4">
                  {!riderOnline ? (
                    <div className="bg-[#090b0e] border border-zinc-850 p-6 rounded-2xl text-center space-y-3 py-10">
                      <EyeOff className="w-9 h-9 mx-auto text-zinc-650" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-200">You are Currently Offline</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed max-w-xs mx-auto">
                          Turn on your dispatch line to configure and scan clustered corridors representing multiple regional farmer orders.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Configuration Board */}
                      <div className="bg-[#0b0f15] border border-zinc-850 p-4.5 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                          <h4 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-emerald-400" />
                            <span>Proximity Matching Engine</span>
                          </h4>
                          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black px-1.5 py-0.5 rounded">
                            CORES: ONLINE
                          </span>
                        </div>

                        {/* Search Radius Slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-400 font-medium">Scanning Radius (Zone Area)</span>
                            <span className="font-extrabold text-[#ffa550] font-mono">{searchRadius}.0 km</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={searchRadius} 
                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                            className="w-full accent-[#ffa550] bg-zinc-900 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                            <span>1 km radius</span>
                            <span>5 km (Medium)</span>
                            <span>10 km max</span>
                          </div>
                        </div>

                        {/* Hardcoded Rules Display */}
                        <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 space-y-2 text-[10px] font-mono text-zinc-400 animate-fade-in">
                          <div className="flex justify-between">
                            <span>Pickup Proximity Gate:</span>
                            <span className="text-zinc-200">≤ 500 meters</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Drop-off Bearing Arc:</span>
                            <span className="text-zinc-200">± 45° corridor bearing</span>
                          </div>
                          <div className="flex justify-between border-t border-zinc-900 pt-1.5 text-zinc-350">
                            <span>Max Batch Bound Cap:</span>
                            <span className="text-zinc-100 font-bold">4 Orders/Trip</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={handleScanForBatches}
                          disabled={isScanningBatches}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-650 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
                        >
                          {isScanningBatches ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Clustering corridor endpoints...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-yellow-300" />
                              <span>Scan Corridor Batches</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info Panel */}
                      <div className="bg-[#090b0e] border border-zinc-850/60 p-4 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                          ⚡ <strong>Rider Incentive Rule:</strong> Your delivery pay is computed as the sum of individual order fee shares. Accepting corridor batches maximizes earnings per delivery leg.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CASE B: BATCH OFFER CARD PREVIEW FOR RIDER (30s Countdown) */}
              {selectedBatchOffer && (
                <BatchOfferCard
                  batchOffer={selectedBatchOffer}
                  timerLeft={batchOfferTimer}
                  timerProgress={batchOfferProgress}
                  onAccept={handleAcceptBatchOffer}
                  onDecline={() => handleDeclineBatchOffer(false)}
                  searchRadius={searchRadius}
                />
              )}

              {/* CASE C: ACTIVE BATCH DELIVERING CONSOLE */}
              {activeBatch && (
                <div className="space-y-4 animate-fade-in" id="active-batch-console-block">
                  {/* Batch active tracking banner */}
                  <div className="bg-[#0b0c10] border border-indigo-500/20 p-4 rounded-2xl space-y-3.5 shadow-xl relative">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <Navigation2 className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span className="text-xs font-black uppercase font-mono tracking-widest text-indigo-400">CORRIDOR BATCH ROUTING</span>
                      </div>
                      <span className="text-[9px] uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                        {batchStep === "PICKUP" ? "PICKUP PHASE" : batchStep === "DROPOFF" ? "DELIVERY DROPS" : "BATCH COMPLETED"}
                      </span>
                    </div>

                    {/* Dynamic state values depending on step */}
                    <div className="grid grid-cols-3 gap-2 text-center text-zinc-350 font-mono text-[10px]">
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8px] text-zinc-550 block">Total distance limit</span>
                        <span className="text-xs font-black text-white">{activeBatch.total_distance} km</span>
                      </div>
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8px] text-zinc-550 block">Active Load Count</span>
                        <span className="text-xs font-black text-indigo-300">
                          {activeBatch.orders.filter(o => o.status !== "NOT_READY_SPLIT").length} items
                        </span>
                      </div>
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8px] text-zinc-550 block">Expected Fee</span>
                        <span className="text-xs font-black text-emerald-400">K {activeBatch.total_earnings.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* VIZUAL BATCH ROUTING MAP WITH TSP TIMELINE SEQUENCER */}
                  <BatchRouteMap 
                    activeBatch={activeBatch} 
                    currentStopIndex={currentRouteTargetIdx} 
                    batchStep={batchStep} 
                  />

                  <SequenceIndicator 
                    activeBatch={activeBatch} 
                    currentStopIndex={currentRouteTargetIdx} 
                    batchStep={batchStep} 
                    merchantStatus={merchantStatus}
                    riderConfirmedPickups={riderConfirmedPickups}
                    onScanCargo={handleConfirmRiderPickup}
                    onApproveMerchant={handleConfirmMerchantPack}
                    onConfirmInAppDelivery={handleConfirmInAppDelivery}
                    onSplitOrder={handleSplitOrderOutOfBatch}
                  />

                  {/* SUB-FLOW STEP 1: PICKUP LOOP PANEL */}
                  {batchStep === "PICKUP" && (
                    <div className="space-y-4">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                        <h4 className="text-xs font-bold font-mono text-[#ffa550] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#ffa550]" />
                          <span>Pickup sequence (TSP Optimized)</span>
                        </h4>
                        <p className="text-[10px] text-zinc-405 font-mono">Collect from each vendor depot in order. Both rider and merchant must confirm pack hand-over.</p>
                      </div>

                      {activeBatch.orders.map((order, idx) => {
                        const isOriginalOrReady = order.status !== "NOT_READY_SPLIT";
                        const isSelfCollected = merchantStatus[order.order_id] === "COLLECTED";
                        const isSelfRiderConfirmed = riderConfirmedPickups[order.order_id];

                        if (!isOriginalOrReady) return null;

                        return (
                          <div 
                            key={order.order_id}
                            className={`p-4 rounded-xl border transition-all ${
                              isSelfCollected 
                                ? "bg-emerald-950/20 border-emerald-500/20" 
                                : "bg-[#090c10] border-zinc-850"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2.5">
                              <div>
                                <span className="text-[8px] uppercase font-mono bg-zinc-900 text-[#ffa550] px-2 py-0.5 rounded border border-zinc-800">
                                  Pickup Stop #{idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-white mt-1.5">{order.seller_name}</h5>
                                <p className="text-[9.5px] text-zinc-440 font-mono flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-zinc-500" />
                                  <span>{order.pickup_location.name}</span>
                                </p>
                              </div>
                              {isSelfCollected ? (
                                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black px-1.5 rounded py-0.5">
                                  LOADED ✓
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-[#ffa550] font-mono font-black px-1.5 rounded py-0.5 animate-pulse">
                                  AWAITING SCAN
                                </span>
                              )}
                            </div>

                            {/* Cargo details block */}
                            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-[11px] mb-3">
                              <span className="text-[8.5px] uppercase font-mono text-zinc-500 block">Sealed load</span>
                              <span className="text-zinc-200 font-bold">{order.item}</span>
                            </div>

                            {/* Sequential Action Toggles */}
                            {!isSelfCollected && (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {/* Step 1: Rider scans cargo */}
                                  <button
                                    onClick={() => handleConfirmRiderPickup(order.order_id)}
                                    className={`py-2 rounded-lg text-[10px] font-black tracking-wide border transition-all cursor-pointer ${
                                      isSelfRiderConfirmed
                                        ? "bg-zinc-900 border-emerald-500/20 text-emerald-400 cursor-default"
                                        : "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-amber-500"
                                    }`}
                                  >
                                    {isSelfRiderConfirmed ? "✓ Scanned & Logged" : "1. Scan & Collect"}
                                  </button>

                                  {/* Step 2: Merchant pack confirm */}
                                  <button
                                    onClick={() => handleConfirmMerchantPack(order.order_id)}
                                    className={`py-2 rounded-lg text-[10px] font-black tracking-wide border transition-all cursor-pointer ${
                                      isSelfCollected
                                        ? "bg-zinc-900 text-zinc-500 cursor-default"
                                        : "bg-[#5c4fff] hover:bg-[#4d3fff] border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                                    }`}
                                  >
                                    2. Merchant Approve
                                  </button>
                                </div>

                                {/* Exception option: Merchant not ready split out */}
                                <button
                                  onClick={() => handleSplitOrderOutOfBatch(order.order_id)}
                                  className="w-full bg-[#fa5a5a]/5 hover:bg-[#fa5a5a]/10 border border-[#fa5a5a]/20 text-[#fa5a5a] py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-colors cursor-pointer"
                                >
                                  Merchant Not Ready (Split Order Out)
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUB-FLOW STEP 2: DROPOFF LOOP PANEL */}
                  {batchStep === "DROPOFF" && (
                    <div className="space-y-4">
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
                        <h4 className="text-xs font-bold font-mono text-[#00ffda] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00ffda]" />
                          <span>Drop-off target sequence</span>
                        </h4>
                        <p className="text-[10px] text-zinc-405 font-mono">Validate cash collections or bank escrow payouts at each residence below using OTP.</p>
                      </div>

                      {activeBatch.orders.map((order, idx) => {
                        const isSplitted = order.status === "NOT_READY_SPLIT";
                        const isDelivered = order.status === "DELIVERED";
                        const isDisputed = order.status === "ATTEMPTED_DISPUTE";
                        const isCancelled = order.status === "CANCELLED";

                        if (isSplitted) return null;

                        return (
                          <div 
                            key={order.order_id}
                            className={`p-4 rounded-xl border transition-all ${
                              isDelivered 
                                ? "bg-emerald-950/20 border-emerald-500/20 opacity-60" 
                                : isDisputed
                                ? "bg-amber-950/20 border-amber-500/20 opacity-65"
                                : isCancelled
                                ? "bg-red-950/20 border-red-500/25 opacity-55"
                                : "bg-[#090c10] border-zinc-850"
                            }`}
                          >
                            {/* Card top */}
                            <div className="flex justify-between items-start mb-2.5">
                              <div>
                                <span className="text-[8px] uppercase font-mono bg-zinc-900 text-[#00ffd2] px-2 py-0.5 rounded border border-zinc-850">
                                  Delivery Drop #{idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-white mt-1.5">{order.buyer_name}</h5>
                                <p className="text-[9px] text-zinc-405 font-mono mt-0.5">{order.buyer_phone}</p>
                              </div>

                              {/* Target delivery status tag icon */}
                              {isDelivered && (
                                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black px-1.5 rounded py-0.5">
                                  DELIVERED ✓
                                </span>
                              )}
                              {isDisputed && (
                                <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-[#ffa550] font-mono font-black px-1.5 rounded py-0.5">
                                  HELD AT DISPUTE ⚠️
                                </span>
                              )}
                              {isCancelled && (
                                <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-black px-1.5 rounded py-0.5">
                                  CANCELLED 🛑
                                </span>
                              )}
                              {!isDelivered && !isDisputed && !isCancelled && (
                                <span className="text-[9px] bg-[#00ffda]/10 border border-[#00ffda]/20 text-[#00ffda] font-mono font-black px-1.5 rounded py-0.5 animate-pulse">
                                  EN ROUTE
                                </span>
                              )}
                            </div>

                            {/* Drop Point Description */}
                            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-900 text-xs mb-3 space-y-1.5">
                              <div>
                                <span className="text-[8.5px] uppercase font-mono text-zinc-550 block">Deliver point</span>
                                <p className="text-zinc-200 font-extrabold text-[10.5px]">{order.dropoff_location.name}</p>
                              </div>
                              <div>
                                <span className="text-[8.5px] uppercase font-mono text-zinc-550 block">Load cargo value</span>
                                <p className="text-[#00ffd2] font-mono text-[10.5px]">ZMW {order.price.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Active Action buttons for drop verification */}
                            {!isDelivered && !isDisputed && !isCancelled && (
                              <div className="space-y-3 pt-1 border-t border-zinc-900">
                                {/* Trigger ETA notify preview */}
                                <button
                                  type="button"
                                  onClick={() => handleSendFcmEtaAlert(order)}
                                  className="w-full bg-[#ffa550]/5 hover:bg-[#ffa550]/15 border border-[#ffa550]/20 text-amber-500 py-1.5 px-3 rounded-lg text-[9.5px] font-mono tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#ffa550]" />
                                  <span>Send FCM Smart-ETA Alert (5-mins delay)</span>
                                </button>

                                {/* In-App Handover Confirmation (Replaced OTP verification) */}
                                <div className="space-y-1.5 pt-1.5">
                                  <button
                                    type="button"
                                    id={`in-app-confirm-${order.order_id}`}
                                    onClick={() => handleConfirmInAppDelivery(order.order_id)}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#040507] font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-emerald-500/10"
                                  >
                                    <Check className="w-4 h-4 font-black" />
                                    <span>Confirm Delivery (In-App Confirm)</span>
                                  </button>
                                </div>

                                {/* Exception buttons: Unreachable vs Mid-batch cancellation */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900/50">
                                  <button
                                    onClick={() => handleUnreachableAttemptPhoto(order.order_id)}
                                    className="bg-amber-600/10 hover:bg-amber-600/15 border border-amber-600/25 text-[#ffa550] py-2 rounded-lg text-[9px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
                                  >
                                    ⚠️ Unreachable Proof
                                  </button>
                                  <button
                                    onClick={() => handleMidbatchCancellation(order.order_id)}
                                    className="bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/25 text-rose-400 py-2 rounded-lg text-[9px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
                                  >
                                    🛑 Buyer Cancelled
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUB-FLOW STEP 3: CONSOLIDATED SUMMARY SCREEN */}
                  {batchStep === "SUMMARY" && (
                    <div className="bg-[#0b1016] border border-amber-500/20 p-5 rounded-2xl space-y-4 shadow-2xl text-center animate-fade-in">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest font-mono animate-pulse">Corridor Completed!</h4>
                        <p className="text-[10px] text-zinc-400 font-mono">Job metrics consolidated and settled safely via Lipila escrow pipeline.</p>
                      </div>

                      {/* Cumulative analytics metrics */}
                      <div className="grid grid-cols-3 gap-2 py-2 text-center text-zinc-350 font-mono text-[10.5px]">
                        <div className="bg-[#050609] p-2.5 rounded-xl border border-zinc-900">
                          <span className="text-[8px] text-zinc-550 block">Payout (Net)</span>
                          <span className="text-xs font-black text-emerald-400">
                            K {(activeBatch.total_earnings * 0.87).toFixed(1)}
                          </span>
                        </div>
                        <div className="bg-[#050609] p-2.5 rounded-xl border border-zinc-900">
                          <span className="text-[8px] text-zinc-550 block">Km Ridden</span>
                          <span className="text-xs font-black text-white">{activeBatch.total_distance} km</span>
                        </div>
                        <div className="bg-[#050609] p-2.5 rounded-xl border border-zinc-900">
                          <span className="text-[8px] text-zinc-550 block">Filled Drops</span>
                          <span className="text-xs font-black text-indigo-300">
                            {activeBatch.orders.filter(o => o.status === "DELIVERED").length} drops
                          </span>
                        </div>
                      </div>

                      {/* Optional merchant rating inputs */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-left space-y-3">
                        <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-[#ffa550]" />
                          <span>Rate corridor merchant depots (Optional)</span>
                        </h5>
                        
                        <div className="space-y-2 animate-fade-in">
                          {activeBatch.orders.filter(o => o.status !== "NOT_READY_SPLIT").map(order => (
                            <div key={order.order_id} className="flex justify-between items-center text-xs">
                              <span className="text-zinc-300 truncate pr-2">{order.seller_name}</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => {
                                  const currentRating = merchantRatings[order.order_id] || 0;
                                  return (
                                    <button
                                      type="button"
                                      key={star}
                                      onClick={() => setMerchantRatings({ ...merchantRatings, [order.order_id]: star })}
                                      className="p-0.5 focus:outline-none cursor-pointer"
                                    >
                                      <Star className={`w-3.5 h-3.5 ${star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-zinc-650"}`} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reset flow button */}
                      <button
                        onClick={handlePostBatchRating}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#040507] font-black text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                      >
                        Finish Batch & Go available
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* FLOATING ACTION TRIGGER BAR FOR EXPORT TECHNICAL SPECIFICATIONS DIAL */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowTechModal(true)}
                  className="w-full bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-850 py-3.5 px-4 rounded-xl text-xs font-mono text-zinc-400 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Code2 className="w-4 h-4 text-[#00ffda]" />
                  <span>View Developer Integration Specs (Postgres / API / Payload)</span>
                </button>
              </div>

            </div>
          ) : (
            /* ================= ORIGINAL SINGLE DELIVERIES INTERFACE ELEMENTS ================= */
            <div className="space-y-4 animate-fade-in">
              
              {/* OFFLINE COVER OR SCANNERS */}
              {!riderOnline && !activeJob && (
                <div className="bg-[#090b0e] border border-zinc-850 p-6 rounded-2xl text-center space-y-3 py-10">
                  <EyeOff className="w-9 h-9 mx-auto text-zinc-650" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">You are Currently Offline</h4>
                    <p className="text-[10px] text-zinc-405 mt-1 leading-relaxed max-w-xs mx-auto">
                      The automated dispatch scheduler cannot match you with high-paying farmer orders until you toggle your dispatch line online.
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
                    <p className="text-[9.5px] font-mono text-zinc-405 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Soweto & Chisamba Freight Yards
                    </p>
                    <p className="text-[10px] text-zinc-405 mt-1 lines-clamp-2 max-w-xs mx-auto leading-relaxed">
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
                        <span className="text-[9.5px] uppercase font-mono text-zinc-550 block">Farming Load Details</span>
                        <p className="text-xs font-bold text-zinc-105">{incomingJob.item}</p>
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
                        <div className="border-t border-zinc-900 pt-1.5 flex justify-between font-mono text-[10px] text-zinc-405">
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
                          className="w-1/3 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 text-zinc-400 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
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
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[8.5px] font-mono text-zinc-350 font-bold py-1 px-2.5 rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5 text-zinc-500 animate-spin [animation-duration:12s]" />
                          <span>Drive +25%</span>
                        </button>
                      </div>
                    </div>

                    {/* 3 Summary tiles */}
                    <div className="grid grid-cols-3 gap-2 text-center text-zinc-350 font-mono">
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8.5px] text-zinc-550 block">Distance Remaining</span>
                        <span className="text-xs font-black text-white">
                          {Math.max(0, parseFloat((activeJob.total_dist * (1 - mockMapPosition / 100)).toFixed(1)))} km
                        </span>
                      </div>
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8.5px] text-zinc-550 block">ETA</span>
                        <span className="text-xs font-black text-white">
                          {Math.max(0, Math.round(32 * (1 - mockMapPosition / 100)))} mins
                        </span>
                      </div>
                      <div className="bg-[#050609] p-2 rounded-xl border border-zinc-900">
                        <span className="text-[8.5px] text-zinc-550 block">Pledged Fee</span>
                        <span className="text-xs font-black text-emerald-400">K {activeJob.fee.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery info card */}
                  <div className="bg-[#090b0e] border border-zinc-850 p-4 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9.5px] uppercase font-mono text-zinc-550 block">Cargo Recipient Credentials</span>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-extrabold text-white">{activeJob.buyer}</h4>
                          <p className="text-[10px] text-zinc-405 font-semibold">{activeJob.buyer_phone}</p>
                        </div>
                        <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 rounded">
                          Escrow Secured
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#050609] rounded-xl border border-zinc-900 space-y-1.5">
                      <span className="text-[9px] uppercase font-mono text-zinc-550">Destination dropoff point</span>
                      <p className="text-xs font-bold text-zinc-200">{activeJob.dropoff}</p>
                      <p className="text-[10.5px] text-zinc-405 mt-1 lines-clamp-2 leading-relaxed font-mono">
                        <strong>Instructions:</strong> Ring doorbell at gate, state "Selonachipa farm dropoff # {activeJob.order_ref}".
                      </p>
                    </div>

                    {/* Big Sticky actions */}
                    <div className="flex gap-2.5">
                      <button
                        onClick={handleCallBuyer}
                        className="w-1/3 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-440 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
