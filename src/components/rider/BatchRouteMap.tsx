import React, { useRef, useEffect } from "react";
import { RiderBatch } from "./RiderBatchEngine";

interface BatchRouteMapProps {
  activeBatch: RiderBatch;
  currentStopIndex: number;
  batchStep: "PICKUP" | "DROPOFF" | "SUMMARY";
}

export const BatchRouteMap: React.FC<BatchRouteMapProps> = ({
  activeBatch,
  currentStopIndex,
  batchStep,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = "#04060a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stylized grid dot patterns
    ctx.fillStyle = "rgba(92, 124, 255, 0.08)";
    for (let x = 0; x < canvas.width; x += 16) {
      for (let y = 0; y < canvas.height; y += 16) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const { orders } = activeBatch;
    if (orders.length === 0) return;

    // Define coordinate borders to map GPS points to Canvas width/height
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    // Collect all coordinates: Pickups & Dropoffs
    const points: Array<{ lat: number; lng: number; type: "pickup" | "dropoff"; id: string; label: string }> = [];

    orders.forEach((order, idx) => {
      if (order.status !== "NOT_READY_SPLIT") {
        points.push({
          lat: order.pickup_location.latitude,
          lng: order.pickup_location.longitude,
          type: "pickup",
          id: order.order_id,
          label: `P${idx + 1}`
        });
        points.push({
          lat: order.dropoff_location.latitude,
          lng: order.dropoff_location.longitude,
          type: "dropoff",
          id: order.order_id,
          label: `D${idx + 1}`
        });
      }
    });

    if (points.length === 0) return;

    points.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    // Add padding to bounds
    const latSpan = (maxLat - minLat) || 0.01;
    const lngSpan = (maxLng - minLng) || 0.01;
    
    const padLat = latSpan * 0.2;
    const padLng = lngSpan * 0.2;

    const mapLatMin = minLat - padLat;
    const mapLatMax = maxLat + padLat;
    const mapLngMin = minLng - padLng;
    const mapLngMax = maxLng + padLng;

    const toCanvasX = (lng: number) => {
      return 35 + ((lng - mapLngMin) / (mapLngMax - mapLngMin)) * (canvas.width - 70);
    };

    const toCanvasY = (lat: number) => {
      // Latitude increases upwards, canvas Y goes downwards
      return canvas.height - 35 - ((lat - mapLatMin) / (mapLatMax - mapLatMin)) * (canvas.height - 70);
    };

    // Draw route paths line matching optimal travel order
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw connecting lines between pickups (sequence)
    ctx.strokeStyle = "rgba(249, 115, 22, 0.4)"; // Orange path
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    orders.forEach((order, index) => {
      const cx = toCanvasX(order.pickup_location.longitude);
      const cy = toCanvasY(order.pickup_location.latitude);
      if (index === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    });
    ctx.stroke();

    // 2. Draw connecting lines between dropoffs (sequence)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.4)"; // Indigo/blue path
    ctx.beginPath();
    orders.forEach((order, index) => {
      const cx = toCanvasX(order.dropoff_location.longitude);
      const cy = toCanvasY(order.dropoff_location.latitude);
      if (index === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    });
    ctx.stroke();

    // 3. Draw global corridor connector
    ctx.strokeStyle = "rgba(99, 102, 241, 0.25)";
    ctx.setLineDash([]);
    ctx.beginPath();
    orders.forEach((order, index) => {
      const px = toCanvasX(order.pickup_location.longitude);
      const py = toCanvasY(order.pickup_location.latitude);
      const dx = toCanvasX(order.dropoff_location.longitude);
      const dy = toCanvasY(order.dropoff_location.latitude);
      ctx.moveTo(px, py);
      ctx.lineTo(dx, dy);
    });
    ctx.stroke();

    // Draw Markers (Pickups and Dropoffs)
    points.forEach((p, idx) => {
      const cx = toCanvasX(p.lng);
      const cy = toCanvasY(p.lat);
      
      const isCurrentTarget = batchStep === "PICKUP" 
        ? (p.type === "pickup" && idx / 2 === currentStopIndex)
        : (p.type === "dropoff" && Math.floor(idx / 2) === currentStopIndex);

      // Outer glow for active targets
      if (isCurrentTarget) {
        ctx.fillStyle = p.type === "pickup" ? "rgba(249, 115, 22, 0.2)" : "rgba(16, 185, 129, 0.2)";
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = p.type === "pickup" ? "#f97316" : "#10b981";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Base marker filled circle
      ctx.fillStyle = p.type === "pickup" ? "#eab308" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Outline border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.stroke();

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.font = "8px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.label, cx, cy);

      // Mini address node description string
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "6px monospace";
      ctx.fillText(p.type === "pickup" ? "HUB" : "DROP", cx, cy + 13);
    });

  }, [activeBatch, currentStopIndex, batchStep]);

  return (
    <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-900 overflow-hidden relative" id="batch-route-map-block">
      <div className="flex justify-between items-center mb-2" id="map-header">
        <span className="text-[9px] uppercase font-mono text-zinc-500 font-extrabold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Live Route Visual Grid (ZMW Spatial Scale)
        </span>
        <span className="text-[7.5px] font-mono text-indigo-400 font-black bg-indigo-500/10 border border-indigo-500/20 px-2 rounded-full">
          Active target: stop {((currentStopIndex + 1))}
        </span>
      </div>
      <div className="relative w-full h-[180px]" id="map-canvas-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          className="w-full h-full rounded-xl border border-zinc-900 shadow-inner"
        />
        {/* Map keys/legend */}
        <div className="absolute bottom-2 left-2 flex gap-3 text-[7.5px] font-mono bg-zinc-950/90 border border-zinc-850 px-2.5 py-1.5 rounded-lg text-zinc-400 scale-[0.9] origin-bottom-left" id="map-legend">
          <div className="flex items-center gap-1" id="leg-pickup">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Pickup Hub</span>
          </div>
          <div className="flex items-center gap-1" id="leg-dropoff">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Dropoff</span>
          </div>
          <div className="flex items-center gap-1" id="leg-active">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Target Destination</span>
          </div>
        </div>
      </div>
    </div>
  );
};
