import React, { useState } from "react";
import { Plus, Eye, Heart, Edit3, CirclePlay, PauseCircle, Trash2, ArrowLeft, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Listing } from "../../types";

interface SellerListingsProps {
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  onLaunchAddListing: () => void;
  setToast: (toast: { message: string; subText?: string } | null) => void;
}

export default function SellerListings({
  listings,
  setListings,
  onLaunchAddListing,
  setToast
}: SellerListingsProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "LIVE" | "DRAFT" | "PAUSED">("ALL");
  const [editingListing, setEditingListing] = useState<any | null>(null);

  // Filter listings
  const sellerListings = listings.filter(l => l.seller_id === "sel-chipo");

  // Filter counts
  const countAll = sellerListings.length;
  // If provenance/description is mock, let status fallback
  const countLive = sellerListings.filter(l => !l.status || l.status === "live").length;
  const countDraft = sellerListings.filter(l => l.status === "draft").length;
  const countPaused = sellerListings.filter(l => l.status === "paused").length;

  const filteredListings = sellerListings.filter(l => {
    const status = l.status || "live";
    if (activeTab === "ALL") return true;
    if (activeTab === "LIVE") return status === "live";
    if (activeTab === "DRAFT") return status === "draft";
    if (activeTab === "PAUSED") return status === "paused";
    return true;
  });

  // Action: Tapping Pause Toggles Listing status between "paused" and "live"
  const handleTogglePause = (listingId: string) => {
    let newStatus = "live";
    setListings(prev => prev.map(l => {
      if (l.listing_id === listingId) {
        const currentStatus = l.status || "live";
        newStatus = currentStatus === "paused" ? "live" : "paused";
        return { ...l, status: newStatus };
      }
      return l;
    }));

    setToast({
      message: `Listing ${newStatus === "paused" ? "Paused" : "Activated"}`,
      subText: `This item has been taken ${newStatus === "paused" ? "offline safely" : "live immediately"} in buyer streams.`
    });
  };

  // Action: Delete Listing
  const handleDeleteListing = (listingId: string) => {
    if (confirm("Are you sure you want to permanently delete this listing and its historic viewer counts?")) {
      setListings(prev => prev.filter(l => l.listing_id !== listingId));
      setToast({
        message: "Listing Deleted",
        subText: "The video asset and escrow tracking history has been removed."
      });
    }
  };

  // Action: Save Listing Edit changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    setListings(prev => prev.map(l => {
      if (l.listing_id === editingListing.listing_id) {
        return {
          ...l,
          title: editingListing.title,
          description: editingListing.description,
          suggested_price: Number(editingListing.suggested_price),
          category: editingListing.category,
          provenance: editingListing.provenance || l.provenance,
          tags: editingListing.tags || [],
          transition_effect: editingListing.transition_effect || l.transition_effect,
          noise_reduction: editingListing.noise_reduction !== undefined ? editingListing.noise_reduction : l.noise_reduction
        };
      }
      return l;
    }));

    setEditingListing(null);
    setToast({
      message: "Listing Updated ✓",
      subText: "The custom metadata has been re-indexed across Lusaka routers."
    });
  };

  // Tag helper
  const [newTagInput, setNewTagInput] = useState<string>("");
  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const currentTags = editingListing.tags || [];
    if (!currentTags.includes(newTagInput.trim())) {
      setEditingListing({
        ...editingListing,
        tags: [...currentTags, newTagInput.trim()]
      });
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = editingListing.tags || [];
    setEditingListing({
      ...editingListing,
      tags: currentTags.filter((t: string) => t !== tagToRemove)
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn text-left">
      {/* Search and Add Topbar */}
      <div className="flex justify-between items-center bg-zinc-950/40 p-1 rounded-2xl border border-zinc-900 px-3 py-2">
        <div>
          <h3 className="text-sm font-black text-white">Listings Catalogue</h3>
          <p className="text-[10px] text-zinc-500 font-mono">My Listings: {countAll} items</p>
        </div>
        <button
          onClick={onLaunchAddListing}
          className="p-1.5 rounded-xl bg-[#ffa500]/10 border border-[#ffa500]/25 text-[#ffa500] hover:bg-[#ffa500]/25 flex items-center gap-1 cursor-pointer transition-colors text-[10.5px] font-black"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          <span>New</span>
        </button>
      </div>

      {/* Grid Tabs Filter */}
      <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#07080b] border border-zinc-900 rounded-xl">
        {[
          { tabId: "ALL", label: "All", count: countAll },
          { tabId: "LIVE", label: "Live", count: countLive },
          { tabId: "DRAFT", label: "Draft", count: countDraft },
          { tabId: "PAUSED", label: "Paused", count: countPaused }
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
              <p className="text-[10.5px] font-extrabold">{t.label}</p>
              <p className="text-[9px] font-mono mt-0.5 opacity-80">{t.count}</p>
            </button>
          );
        })}
      </div>

      {/* Listing Cards */}
      {filteredListings.length === 0 ? (
        <div className="bg-zinc-950/30 border border-zinc-900 p-8 rounded-2xl text-center text-zinc-500 space-y-1">
          <CirclePlay className="w-9 h-9 text-zinc-700 mx-auto" />
          <p className="text-xs font-bold text-zinc-400">No Listings Found</p>
          <p className="text-[10px] text-zinc-600">No listings match this filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredListings.map((lst) => {
            const status = lst.status || "live";
            return (
              <div 
                key={lst.listing_id}
                className="bg-[#0c0d12] border border-zinc-900 p-3.5 rounded-2xl flex gap-3.5 items-start"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 bg-zinc-950/80 rounded-xl border border-zinc-850 shrink-0 relative flex flex-col justify-between p-1.5 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent overflow-hidden">
                    {lst.thumbnail && (lst.thumbnail.startsWith("http") || lst.thumbnail.startsWith("data:")) ? (
                      <img src={lst.thumbnail} className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" alt="" />
                    ) : (
                      <span className="text-2xl">{lst.thumbnail || "🌽"}</span>
                    )}
                  </div>
                  
                  {/* Views & Saves tag bottom */}
                  <div className="z-10 bg-black/70 px-1 py-0.5 rounded text-[8.5px] font-mono text-zinc-400 flex items-center gap-1 shrink-0 w-max">
                    <Eye className="w-2.5 h-2.5 text-zinc-500" />
                    {lst.views || 450}
                  </div>

                  {/* Likes count */}
                  <div className="z-10 self-end bg-[#ffa500]/10 border border-[#ffa500]/25 px-1 py-0.5 rounded text-[8.5px] font-medium font-mono text-[#ffa500] flex items-center gap-0.5">
                    <Heart className="w-2.5 h-2.5 text-[#ffa500] fill-[#ffa500]/20" />
                    {lst.likes || 120}
                  </div>
                </div>

                {/* Content details & action panel */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[8px] uppercase tracking-wider font-mono font-black border px-1.5 rounded bg-zinc-900 text-zinc-450 border-zinc-800">
                        {lst.category}
                      </span>
                      <span className={`text-[8px] uppercase tracking-wider font-mono font-black px-1.5 py-0.5 rounded border ${
                        status === "live" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/15"
                      }`}>
                        {status}
                      </span>
                    </div>

                    <h4 className="text-[12.5px] font-bold text-white mt-1 pr-1 truncate">
                      {lst.title}
                    </h4>
                    <p className="text-[11px] font-mono font-black text-[#ffa500] mt-0.5">
                      K {lst.suggested_price}.00 ZMW
                    </p>
                  </div>

                  {/* 3 action buttons */}
                  <div className="grid grid-cols-3 gap-1.5 border-t border-zinc-900/60 pt-2 shrink-0">
                    <button
                      onClick={() => setEditingListing(lst)}
                      className="py-1 rounded-lg bg-zinc-900/50 hover:bg-zinc-850 active:scale-95 text-zinc-300 hover:text-white border border-zinc-850 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit3 className="w-3 h-3 text-zinc-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleTogglePause(lst.listing_id)}
                      className={`py-1 rounded-lg active:scale-95 border text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        status === "paused"
                          ? "bg-emerald-550/10 text-emerald-400 border-emerald-555/20 hover:bg-emerald-550/20"
                          : "bg-amber-550/10 text-amber-500 border-amber-555/20 hover:bg-amber-550/20"
                      }`}
                    >
                      <PauseCircle className="w-3 h-3" />
                      <span>{status === "paused" ? "Live" : "Pause"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteListing(lst.listing_id)}
                      className="py-1 rounded-lg bg-red-950/20 hover:bg-red-950/40 active:scale-95 text-[#f43f5e] hover:text-[#ff4a68] border border-red-900/20 text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-[#f43f5e]" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Edit Listing overlay Dialog */}
      <AnimatePresence>
        {editingListing && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl overflow-hidden p-5 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3.5 mb-3.5">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1">
                    <Edit3 className="w-4 h-4 text-[#ffa500]" />
                    <span>Edit AI Listing</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">Modifying parameters for catalog indexing</p>
                </div>
                <button
                  onClick={() => setEditingListing(null)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer border border-zinc-850"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit} className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingListing.title}
                    onChange={(e) => setEditingListing({...editingListing, title: e.target.value})}
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium"
                  />
                </div>

                {/* Suggested Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Suggested Price (ZMW)</label>
                  <input
                    type="number"
                    required
                    value={editingListing.suggested_price}
                    onChange={(e) => setEditingListing({...editingListing, suggested_price: e.target.value})}
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-mono font-bold"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Category</label>
                  <select
                    value={editingListing.category}
                    onChange={(e) => setEditingListing({...editingListing, category: e.target.value})}
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white"
                  >
                    <option value="Fresh produce">Fresh produce</option>
                    <option value="Dried foodstuffs">Dried foodstuffs</option>
                    <option value="Handicrafts">Handicrafts</option>
                    <option value="Apparel & chitenge">Apparel & chitenge</option>
                    <option value="Local spices">Local spices</option>
                    <option value="Agri-equipment">Agri-equipment</option>
                    <option value="Parcels">Parcels</option>
                    <option value="Fast Food & Restaurant">Fast Food & Restaurant</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">AI-Generated Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingListing.description}
                    onChange={(e) => setEditingListing({...editingListing, description: e.target.value})}
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-medium leading-relaxed"
                  />
                </div>

                {/* Video Clip Transition Style */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Video Clip Transition Style</label>
                  <select
                    value={editingListing.transition_effect || "Fade"}
                    onChange={(e) => setEditingListing({...editingListing, transition_effect: e.target.value as any})}
                    className="w-full bg-[#050506] border border-zinc-850 px-3 py-2 text-xs rounded-xl focus:border-[#ffa500] focus:outline-none text-white font-mono"
                  >
                    <option value="Fade">Fade (Cross Dissolve)</option>
                    <option value="Slide">Slide (Push Left)</option>
                    <option value="Zoom">Zoom (In & Out)</option>
                  </select>
                </div>

                {/* AI Noise Reduction Toggle */}
                <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-350 uppercase font-mono">AI Noise Reduction</label>
                    <p className="text-[8px] text-zinc-500">Enable advanced vocals Isolation presets</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!editingListing.noise_reduction}
                    onChange={(e) => setEditingListing({...editingListing, noise_reduction: e.target.checked})}
                    className="w-4 h-4 text-[#ffa500] border-zinc-800 bg-zinc-900 rounded focus:ring-[#ffa500] focus:ring-2 focus:ring-offset-zinc-950 accent-[#ffa500]"
                  />
                </div>

                {/* SEO Tags Engine */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase font-mono">SEO Tags / Metadata</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. organic"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="flex-1 bg-[#050506] border border-zinc-850 px-3 py-1.5 text-xs rounded-lg focus:border-[#ffa500] focus:outline-none text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 cursor-pointer hover:bg-zinc-850"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {((editingListing.tags as string[]) || ["organic", "fresh", "farmers-market"]).map((tag) => (
                      <span 
                        key={tag}
                        className="bg-[#ffa500]/10 border border-[#ffa500]/20 text-[#ffa500] text-[9.5px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 font-bold"
                      >
                        #{tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 font-extrabold stroke-[3]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Save and CTA */}
                <div className="pt-3.5 flex gap-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setEditingListing(null)}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 font-bold text-zinc-400 text-xs rounded-xl border border-zinc-850 transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#ffa500] hover:bg-[#e09100] font-black text-black text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Apply Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
