import React, { useState } from "react";
import { MessageSquare, Container, PhoneCall, Check, Star, ShieldAlert, ArrowRight, ShieldCheck, MapPin, Truck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Order } from "../../types";

interface SellerOrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onMessageBuyerClick: (buyerName: string) => void;
  sellerBalance: number;
  setSellerBalance: React.Dispatch<React.SetStateAction<number>>;
  setToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SellerOrders({
  orders,
  setOrders,
  onMessageBuyerClick,
  sellerBalance,
  setSellerBalance,
  setToast
}: SellerOrdersProps) {
  const [activeTab, setActiveTab] = useState<"NEW" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED">("NEW");

  // Filter orders for Chipo
  const sellerOrders = orders.filter(o => o.seller_id === "sel-chipo");

  // Dynamic count badges
  const countNew = sellerOrders.filter(o => !o.transit_status || o.transit_status === "pending_seller_confirmation").length;
  const countTransit = sellerOrders.filter(o => o.transit_status === "rider_assigned" || o.transit_status === "picked_up" || o.transit_status === "out_for_delivery").length;
  const countDelivered = sellerOrders.filter(o => o.transit_status === "delivered").length;
  const countCancelled = sellerOrders.filter(o => o.transit_status === "cancelled").length;

  const filteredOrders = sellerOrders.filter(o => {
    const transitStatus = o.transit_status || "pending_seller_confirmation";
    if (activeTab === "NEW") {
      return transitStatus === "pending_seller_confirmation";
    }
    if (activeTab === "IN_TRANSIT") {
      return transitStatus === "rider_assigned" || transitStatus === "picked_up" || transitStatus === "out_for_delivery";
    }
    if (activeTab === "DELIVERED") {
      return transitStatus === "delivered";
    }
    if (activeTab === "CANCELLED") {
      return transitStatus === "cancelled";
    }
    return true;
  });

  // Action: Confirm and Pack
  const handleConfirmPack = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.order_id === orderId) {
        return {
          ...o,
          transit_status: "rider_assigned"
        };
      }
      return o;
    }));

    setToast({
      message: "Order Confirmed & Packed!",
      subText: "Rider 'George Chiluba' has been dispatched and is en-route for pickup."
    });
  };

  // Action: Simulate Handover/Delivery (Credits seller balance!)
  const handleSimulateDelivery = (orderId: string, itemCost: number) => {
    setOrders(prev => prev.map(o => {
      if (o.order_id === orderId) {
        return {
          ...o,
          transit_status: "delivered",
          escrow_status: "released"
        };
      }
      return o;
    }));

    // Add proceeds to seller balance
    // Proceeds = Sale price * quantity + delivery_fee - commission? Wait, standard is full amount. Let's add full item amount!
    setSellerBalance(prev => prev + itemCost);

    setToast({
      message: "Escrow Disbursed! ✓",
      subText: `K ${itemCost} ZMW has been deposited into your Wallet balance successfully.`
    });
  };

  const handleCallEntity = (name: string, role: string) => {
    setToast({
      message: `Calling ${role}...`,
      subText: `Dialing secure cellular forward for ${name}`
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* Search Header */}
      <div className="bg-zinc-950/40 p-1 rounded-2xl border border-zinc-900 px-3 py-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Merchant Escrows</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Live tracking of logistics handovers</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono bg-zinc-900 py-1 px-2 rounded-lg border border-zinc-950">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Escrow Integrity</span>
        </div>
      </div>

      {/* Grid Tabs Filter */}
      <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#07080b] border border-zinc-900 rounded-xl">
        {[
          { tabId: "NEW", label: "New", count: countNew },
          { tabId: "IN_TRANSIT", label: "In Transit", count: countTransit },
          { tabId: "DELIVERED", label: "Delivered", count: countDelivered },
          { tabId: "CANCELLED", label: "Cancelled", count: countCancelled }
        ].map((t) => {
          const active = activeTab === t.tabId;
          return (
            <button
              key={t.tabId}
              onClick={() => setActiveTab(t.tabId as any)}
              className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                active 
                  ? "bg-zinc-900 text-[#ffa500] border-t border-zinc-850 shadow-inner" 
                  : "text-zinc-500 hover:text-zinc-350"
              }`}
            >
              <p className="text-[10px] font-black">{t.label}</p>
              <p className="text-[9px] font-mono mt-0.5 opacity-80">{t.count}</p>
            </button>
          );
        })}
      </div>

      {/* Orders List Content */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-zinc-950/30 border border-zinc-900 p-8 rounded-2xl text-center text-zinc-500 space-y-1">
            <Container className="w-8 h-8 text-zinc-750 mx-auto" />
            <p className="text-xs font-bold text-zinc-400">Empty Logs</p>
            <p className="text-[10px] text-zinc-650">No orders registered under this tracking state.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const totalItemCost = ord.product_price * ord.quantity;
            return (
              <div 
                key={ord.order_id}
                className="bg-[#0c0d12] border border-zinc-900 p-4 rounded-2xl space-y-3"
              >
                {/* Header info bar */}
                <div className="flex justify-between items-start border-b border-zinc-900/60 pb-2.5">
                  <div>
                    <span className="text-[9px] font-mono font-black text-zinc-500 select-all">
                      ID: {ord.order_id}
                    </span>
                    <h4 className="text-[12.5px] font-extrabold text-white leading-tight mt-0.5">
                      {ord.buyer_name}
                    </h4>
                  </div>
                  <div>
                    <span className={`text-[8.5px] uppercase font-mono tracking-wider font-extrabold px-1.5 py-0.5 rounded border inline-block ${
                      ord.escrow_status === "locked"
                        ? "bg-[#00ffd2]/10 text-[#00ffd2] border-[#00ffd2]/15"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"
                    }`}>
                      🔐 ESCROW {ord.escrow_status?.toUpperCase() || "LOCKED"}
                    </span>
                  </div>
                </div>

                {/* Logistics description */}
                <div className="text-[11.5px] text-zinc-300 font-medium space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Ordered Product:</span>
                    <span className="text-white font-bold">{ord.quantity}x {ord.product_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Total Value (Escrow):</span>
                    <span className="text-[#ffa500] font-black font-mono">K {totalItemCost}.00 ZMW</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-450 pt-1">
                    <MapPin className="w-3 h-3 text-[#ffa500]" />
                    <span className="truncate">{ord.delivery_address || "Munali Compound, Lusaka"}</span>
                  </div>
                </div>

                {/* Actions & dynamic sub-views depending on state */}
                {activeTab === "NEW" && (
                  <div className="flex gap-2 pt-1 border-t border-zinc-900/40">
                    <button
                      onClick={() => onMessageBuyerClick(ord.buyer_name)}
                      className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 active:scale-95 border border-zinc-800 text-[10px] rounded-lg text-zinc-200 font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Message Buyer</span>
                    </button>
                    <button
                      onClick={() => handleConfirmPack(ord.order_id)}
                      className="flex-1 py-1.5 bg-[#ffa500] hover:bg-[#e09100] active:scale-95 text-black font-black uppercase text-[10px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-500/5 hover:text-black"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Confirm & Pack</span>
                    </button>
                  </div>
                )}

                {activeTab === "IN_TRANSIT" && (
                  <div className="space-y-3 pt-1 border-t border-zinc-900/40">
                    {/* Assigned rider badge card */}
                    <div className="bg-[#050506] border border-zinc-850 p-2.5 rounded-xl flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-teal-400" />
                        <div>
                          <p className="text-[11px] font-black text-white">George Chiluba</p>
                          <p className="text-[9.5px] font-mono text-zinc-500">Rider • 1.2 km away • 7 mins ETA</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCallEntity("George Chiluba", "Rider")}
                          className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-teal-400 border border-zinc-800 cursor-pointer"
                        >
                          <PhoneCall className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onMessageBuyerClick(ord.buyer_name)}
                        className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 active:scale-95 border border-zinc-800 text-[10px] rounded-lg text-zinc-200 font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message Buyer</span>
                      </button>
                      
                      {/* Interactive Sandboxed delivery completed simulator */}
                      <button
                        onClick={() => handleSimulateDelivery(ord.order_id, totalItemCost)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Simulate Delivery</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "DELIVERED" && (
                  <div className="pt-2 border-t border-zinc-900/40 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold">Payout Transferred</span>
                    </div>
                    {/* Stars */}
                    <div className="flex gap-0.5 items-center">
                      <span className="text-[9.5px] text-zinc-400 mr-1 font-bold">Buyer Rating:</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 text-[#ffa500] fill-[#ffa500] shrink-0" />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "CANCELLED" && (
                  <div className="bg-red-950/20 border border-red-900/10 p-2.5 rounded-xl flex items-start gap-2 text-xs">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10.5px] font-bold text-red-400">Reason: Stock depletion occurred before confirmation.</p>
                      <p className="text-[9.5px] text-zinc-550 mt-0.5">Escrow fully disbursed & returned to buyer's mobile wallet automatically.</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
