import React from "react";
import { Coins } from "lucide-react";
import { RiderBatch } from "./RiderBatchEngine";

interface BatchOfferCardProps {
  batchOffer: RiderBatch;
  timerLeft: number;
  timerProgress: number;
  onAccept: () => void;
  onDecline: () => void;
  searchRadius?: number;
}

export const BatchOfferCard: React.FC<BatchOfferCardProps> = ({
  batchOffer,
  timerLeft,
  timerProgress,
  onAccept,
  onDecline,
  searchRadius = 3,
}) => {
  return (
    <div className="bg-[#0b1017] border-2 border-indigo-500/40 rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in" id="batch-offer-card">
      {/* Timer progress bar */}
      <div className="h-1.5 w-full bg-zinc-900" id="batch-timer-container">
        <div 
          id="batch-timer-bar"
          className="h-full bg-gradient-to-r from-red-500 to-indigo-500 transition-all duration-1000 ease-linear"
          style={{ width: `${timerProgress}%` }}
        />
      </div>

      <div className="p-4.5 space-y-4" id="batch-offer-content">
        {/* Upper title */}
        <div className="flex justify-between items-start" id="batch-card-header">
          <div>
            <span 
              id="batch-expiry-badge"
              className="text-[9px] uppercase font-mono bg-indigo-500/10 border border-indigo-400/20 font-black text-[#5c7cff] px-2.5 py-0.5 rounded-full animate-pulse"
            >
              Batch Expires in {timerLeft}s
            </span>
            <h4 className="text-xs font-black text-rose-100 mt-2 uppercase tracking-wide flex items-center gap-1" id="batch-card-title">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>HIGH-PAYING CORRIDOR BATCH</span>
            </h4>
            <p className="text-[9.5px] font-mono text-zinc-400" id="batch-id-key">ID Key: {batchOffer.batch_id}</p>
          </div>
          <div className="text-right" id="batch-card-earnings-block">
            <span className="text-[9px] text-zinc-500 uppercase font-mono block">Batch Payout</span>
            <span className="text-sm font-black text-emerald-400" id="batch-total-earnings">K {batchOffer.total_earnings.toFixed(2)}</span>
          </div>
        </div>

        {/* Quick batch statistics */}
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]" id="batch-stats-grid">
          <div className="bg-[#05070a] p-2 rounded-xl border border-zinc-900" id="batch-stats-count">
            <span className="text-zinc-500 block">Orders Cap:</span>
            <span className="font-extrabold text-white">{batchOffer.orders.length} Deliveries</span>
          </div>
          <div className="bg-[#05070a] p-2 rounded-xl border border-zinc-900" id="batch-stats-distance">
            <span className="text-zinc-500 block">Corridor Length:</span>
            <span className="font-extrabold text-indigo-300">{batchOffer.total_distance} km total</span>
          </div>
        </div>

        {/* Stylized trajectory routing map */}
        <div className="h-28 bg-[#040609] border border-zinc-900 rounded-xl relative overflow-hidden p-2 text-[9.5px]" id="batch-routing-map">
          <p className="font-mono text-[8px] text-zinc-500 absolute top-1 left-2">CORRIDOR COORDINATES SCHEMATIC</p>
          
          {/* Interactive map paths */}
          <svg className="absolute inset-0 w-full h-full text-zinc-900" xmlns="http://www.w3.org/2000/svg">
            <pattern id="clGrid" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.4" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#clGrid)" />
          </svg>

          {/* Map components drawing connections */}
          <div className="absolute top-1/2 left-[12%] -translate-y-1/2 flex flex-col items-center" id="hub-marker-a">
            <div className="w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center font-black text-[7.5px] text-black">A</div>
            <span className="text-[7.5px] font-mono text-zinc-400 mt-1">Chisamba</span>
          </div>

          <div className="absolute top-[25%] right-[22%] flex flex-col items-center" id="hub-marker-b1">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center font-black text-[7.5px] text-black">B1</div>
            <span className="text-[7.5px] font-mono text-zinc-400 mt-1">Woodlands</span>
          </div>

          <div className="absolute bottom-[20%] right-[10%] flex flex-col items-center" id="hub-marker-b2">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center font-black text-[7.5px] text-black">B2</div>
            <span className="text-[7.5px] font-mono text-zinc-400 mt-1">Leopards</span>
          </div>

          {/* Connectors lines with arrow animations */}
          <div className="absolute inset-x-0 top-1/2 h-1 bg-indigo-500/10 pointer-events-none" />
          <div className="absolute left-[16%] right-[25%] top-[45%] h-0.5 border-t-2 border-dashed border-indigo-500/40 rotate-[14deg]" />
          <div className="absolute left-[16%] right-[14%] top-[55%] h-0.5 border-t-2 border-dashed border-indigo-500/40 rotate-[-12deg]" />
        </div>

        {/* Merged Cargo Load List */}
        <div className="bg-[#05070a]/40 border border-zinc-900 p-3 rounded-xl space-y-1.5 text-[11px]" id="batch-cargo-list">
          <div className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1 flex justify-between">
            <span>Pickup Hubs Involved</span>
            <span>Corridor: {searchRadius}km radius</span>
          </div>
          <div className="space-y-1 pt-0.5" id="batch-orders-container">
            {batchOffer.orders.map((o) => (
              <div key={o.order_id} className="flex justify-between items-center text-xs" id={`batch-order-row-${o.order_id}`}>
                <span className="text-zinc-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa550]" />
                  {o.seller_name}
                </span>
                <span className="text-zinc-400 font-mono text-[10px]">{o.item.split("(")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drop-off Gated neighborhoods */}
        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-[10.5px]" id="batch-drop-segments">
          <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Aligned Delivery Segments</span>
          <p className="text-zinc-200 font-bold truncate">
            {batchOffer.orders.map(o => o.buyer_name + " (" + o.dropoff_location.name.split(",")[0] + ")").join(" ➔ ")}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5" id="batch-action-buttons">
          <button
            type="button"
            id="batch-decline-button"
            onClick={onDecline}
            className="w-1/3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            id="batch-accept-button"
            onClick={onAccept}
            className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all font-sans cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-indigo-600/15"
          >
            Accept Batch Route
          </button>
        </div>
      </div>
    </div>
  );
};
