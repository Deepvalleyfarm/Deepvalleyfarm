import React from "react";
import { Check, MapPin, Truck, HelpCircle, User, Star } from "lucide-react";
import { RiderBatch } from "./RiderBatchEngine";

interface SequenceIndicatorProps {
  activeBatch: RiderBatch;
  currentStopIndex: number;
  batchStep: "PICKUP" | "DROPOFF" | "SUMMARY";
  merchantStatus: Record<string, "PENDING" | "COLLECTED" | "NOT_READY_SPLIT">;
  riderConfirmedPickups: Record<string, boolean>;
  onScanCargo: (orderId: string) => void;
  onApproveMerchant: (orderId: string) => void;
  onConfirmInAppDelivery: (orderId: string) => void;
  onSplitOrder: (orderId: string) => void;
}

export const SequenceIndicator: React.FC<SequenceIndicatorProps> = ({
  activeBatch,
  currentStopIndex,
  batchStep,
  merchantStatus,
  riderConfirmedPickups,
  onScanCargo,
  onApproveMerchant,
  onConfirmInAppDelivery,
  onSplitOrder,
}) => {
  const { orders } = activeBatch;

  // Form stops list depending on whether we represent pickups sequence first or drop-offs sequence
  const activeOrders = orders.filter(o => o.status !== "NOT_READY_SPLIT");

  if (activeOrders.length === 0) return null;

  return (
    <div className="bg-[#080b0f] border border-zinc-900 rounded-2xl p-4.5 space-y-4" id="sequence-indicator-container">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5" id="sequence-header">
        <div>
          <h4 className="text-xs font-black text-rose-100 uppercase tracking-wide flex items-center gap-1.5" id="sequence-title">
            <Truck className="w-4 h-4 text-indigo-400" />
            <span>Optimal Stop Routing Plan</span>
          </h4>
          <p className="text-[9px] font-mono text-zinc-500" id="sequence-subtext">TSP SEQUENCED BY SENSORY CORRIDORS</p>
        </div>
        <span className="text-[10px] bg-indigo-500/10 border border-indigo-400/20 text-[#5c7cff] font-mono font-black px-2 py-0.5 rounded-md" id="sequence-step-badge">
          Step {currentStopIndex + 1} of {activeOrders.length}
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-900" id="sequence-timeline">
        {activeOrders.map((order, idx) => {
          const isPickupStep = batchStep === "PICKUP";
          const isCompleted = isPickupStep 
            ? merchantStatus[order.order_id] === "COLLECTED" 
            : order.status === "DELIVERED";

          const isActive = idx === currentStopIndex;
          const isPassed = idx < currentStopIndex;

          const locationName = isPickupStep ? order.seller_name : order.buyer_name;
          const addressText = isPickupStep ? order.pickup_location.name : order.dropoff_location.name;

          return (
            <div 
              key={order.order_id} 
              id={`stop-entry-${order.order_id}`}
              className={`flex gap-3 items-start transition-all ${
                isActive 
                  ? "opacity-100 scale-[1.01]" 
                  : isPassed 
                  ? "opacity-45" 
                  : "opacity-60"
              }`}
            >
              {/* Left timeline status circle */}
              <div className="relative z-10 flex items-center justify-center mt-1" id={`timeline-circle-${order.order_id}`}>
                {isCompleted || isPassed ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 font-mono text-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 font-mono font-extrabold text-xs animate-pulse">
                    {idx + 1}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#05070a] border border-zinc-850 flex items-center justify-center text-zinc-500 font-mono text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Central card panel content */}
              <div 
                id={`stop-box-${order.order_id}`}
                className={`flex-1 p-3.5 rounded-xl border transition-all ${
                  isActive 
                    ? "bg-[#0b1018] border-indigo-400/30 shadow-md shadow-indigo-600/5" 
                    : "bg-[#06080c] border-zinc-900"
                }`}
              >
                <div className="flex justify-between items-start" id={`stop-meta-${order.order_id}`}>
                  <div>
                    <span 
                      id={`stop-label-badge-${order.order_id}`}
                      className={`text-[8px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                        isActive 
                          ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-400" 
                          : "bg-zinc-950 border-zinc-900 text-zinc-500"
                      }`}
                    >
                      {isPickupStep ? "Pickup Stop" : "Delivery Stop"} #{idx + 1}
                    </span>
                    <h5 className="text-xs font-black text-white mt-1.5" id={`stop-owner-${order.order_id}`}>{locationName}</h5>
                    <p className="text-[10px] text-zinc-400 font-sans flex items-center gap-1 mt-1 font-semibold" id={`stop-location-${order.order_id}`}>
                      <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{addressText}</span>
                    </p>
                  </div>

                  {isActive && (
                    <span className="text-[8px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-black px-1.5 rounded py-0.5 animate-pulse">
                      ACTIVE CURRENT STOP
                    </span>
                  )}
                </div>

                {/* Specific active context interaction loops */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-zinc-900 space-y-2.5" id={`stop-action-pane-${order.order_id}`}>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-[11px]" id={`stop-item-details-${order.order_id}`}>
                      <span className="text-[8px] uppercase font-mono text-zinc-500 block">Cargo Load</span>
                      <span className="text-zinc-200 font-bold">{order.item}</span>
                    </div>

                    {isPickupStep ? (
                      <div className="space-y-2" id={`pickup-actions-${order.order_id}`}>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            id={`sequence-scan-btn-${order.order_id}`}
                            onClick={() => onScanCargo(order.order_id)}
                            className={`py-2 px-1.5 rounded-lg text-[10px] font-black tracking-wide border transition-all cursor-pointer ${
                              riderConfirmedPickups[order.order_id]
                                ? "bg-zinc-900 border-emerald-500/20 text-emerald-400"
                                : "bg-zinc-950 hover:bg-zinc-900 border-zinc-850 text-amber-500"
                            }`}
                          >
                            {riderConfirmedPickups[order.order_id] ? "✓ Cargo Scanned" : "1. Arrived & Scan"}
                          </button>

                          <button
                            type="button"
                            id={`sequence-approve-btn-${order.order_id}`}
                            onClick={() => onApproveMerchant(order.order_id)}
                            className="py-2 px-1.5 bg-[#5c4fff] hover:bg-[#4d3fff] border-indigo-500 text-white font-black text-[10px] rounded-lg tracking-wide shadow-md shadow-indigo-500/10 cursor-pointer"
                          >
                            2. Approve Cargo
                          </button>
                        </div>

                        <button
                          type="button"
                          id={`sequence-split-btn-${order.order_id}`}
                          onClick={() => onSplitOrder(order.order_id)}
                          className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 py-1.5 rounded-lg text-[9px] font-mono tracking-widest uppercase transition-colors"
                        >
                          Not Ready (Split Order Out)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2" id={`delivery-actions-${order.order_id}`}>
                        <button
                          type="button"
                          id={`sequence-delivery-confirm-btn-${order.order_id}`}
                          onClick={() => onConfirmInAppDelivery(order.order_id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#040507] font-extrabold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/5"
                        >
                          <Check className="w-4 h-4 font-black" />
                          <span>Arrived (In-App Confirm Delivery)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
