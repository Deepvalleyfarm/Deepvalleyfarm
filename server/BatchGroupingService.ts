import { Router, Request, Response } from "express";

// Standard Geolocation interface matching the client
interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
}

interface PendingOrder {
  order_id: string;
  item: string;
  seller_id: string;
  seller_name: string;
  pickup_location: GeoLocation;
  buyer_name: string;
  dropoff_location: GeoLocation;
  fee: number;
  price: number;
  otp: string;
  status: string;
  buyer_phone: string;
}

interface ServiceBatch {
  batch_id: string;
  orders: PendingOrder[];
  total_distance: number;
  total_earnings: number;
  status: "OFFER" | "ACCEPTED" | "DELIVERING" | "SUCCESS" | "LAPSED";
  created_at: string;
  pickup_sequence: string[];
  dropoff_sequence: string[];
}

// Haversine formula to find distance in kilometers between two gps pairs
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Compass bearing calculation from point A to point B in degrees (0 - 360)
export function getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Nearest-neighbor greedy TSP routing solver
export function optimizeBatchRoutes(
  riderLat: number,
  riderLon: number,
  orders: PendingOrder[]
): { pickups: string[]; dropoffs: string[] } {
  const unvisitedPickups = [...orders];
  const pickupSeq: string[] = [];
  let currLat = riderLat;
  let currLon = riderLon;

  while (unvisitedPickups.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisitedPickups.length; i++) {
      const dist = getHaversineDistance(
        currLat,
        currLon,
        unvisitedPickups[i].pickup_location.latitude,
        unvisitedPickups[i].pickup_location.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    const nextOrder = unvisitedPickups.splice(nearestIdx, 1)[0];
    pickupSeq.push(nextOrder.order_id);
    currLat = nextOrder.pickup_location.latitude;
    currLon = nextOrder.pickup_location.longitude;
  }

  const unvisitedDrops = [...orders];
  const dropoffSeq: string[] = [];

  while (unvisitedDrops.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisitedDrops.length; i++) {
      const dist = getHaversineDistance(
        currLat,
        currLon,
        unvisitedDrops[i].dropoff_location.latitude,
        unvisitedDrops[i].dropoff_location.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    const nextOrder = unvisitedDrops.splice(nearestIdx, 1)[0];
    dropoffSeq.push(nextOrder.order_id);
    currLat = nextOrder.dropoff_location.latitude;
    currLon = nextOrder.dropoff_location.longitude;
  }

  return { pickups: pickupSeq, dropoffs: dropoffSeq };
}

// Corridor clustering engine (ZMW standard delivery logs tracker helper)
export const BatchGroupingService = {
  clusterOrders(
    riderLat: number,
    riderLon: number,
    orders: PendingOrder[],
    searchRadiusKm = 3.0,
    merchantProximityThresholdKm = 0.5,
    bearingThresholdDegrees = 45,
    maxBatchSize = 4
  ): ServiceBatch[] {
    // 1. Filter orders within the radius (default 3km as requested)
    const validOrders = orders.filter((order) => {
      const distToRider = getHaversineDistance(
        riderLat,
        riderLon,
        order.pickup_location.latitude,
        order.pickup_location.longitude
      );
      return distToRider <= searchRadiusKm;
    });

    if (validOrders.length === 0) return [];

    const batches: ServiceBatch[] = [];
    const processedIds = new Set<string>();

    // 2. Loop through each seed order to form corridor clusters
    for (const seedOrder of validOrders) {
      if (processedIds.has(seedOrder.order_id)) continue;

      const cluster: PendingOrder[] = [seedOrder];
      processedIds.add(seedOrder.order_id);

      const referenceBearing = getBearing(
        seedOrder.pickup_location.latitude,
        seedOrder.pickup_location.longitude,
        seedOrder.dropoff_location.latitude,
        seedOrder.dropoff_location.longitude
      );

      // Search for congruent items using Haversine distance & direction bearing arc
      for (const testOrder of validOrders) {
        if (processedIds.has(testOrder.order_id)) continue;

        const pickupDist = getHaversineDistance(
          seedOrder.pickup_location.latitude,
          seedOrder.pickup_location.longitude,
          testOrder.pickup_location.latitude,
          testOrder.pickup_location.longitude
        );

        const testBearing = getBearing(
          testOrder.pickup_location.latitude,
          testOrder.pickup_location.longitude,
          testOrder.dropoff_location.latitude,
          testOrder.dropoff_location.longitude
        );

        let bearingDiff = Math.abs(referenceBearing - testBearing);
        if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

        // Meets merchant proximity & angular bearing corridor aligned threshold
        if (pickupDist <= merchantProximityThresholdKm && bearingDiff <= bearingThresholdDegrees) {
          cluster.push(testOrder);
          processedIds.add(testOrder.order_id);
          if (cluster.length >= maxBatchSize) break;
        }
      }

      // Optimize routing logic via Traveling Salesperson Problem (TSP) sequence Solver
      const tspRoute = optimizeBatchRoutes(riderLat, riderLon, cluster);

      // Calculate total routing travel distance 
      let routeDistance = 0;
      let lastLat = riderLat;
      let lastLon = riderLon;

      tspRoute.pickups.forEach((oid) => {
        const order = cluster.find((o) => o.order_id === oid)!;
        routeDistance += getHaversineDistance(
          lastLat,
          lastLon,
          order.pickup_location.latitude,
          order.pickup_location.longitude
        );
        lastLat = order.pickup_location.latitude;
        lastLon = order.pickup_location.longitude;
      });

      tspRoute.dropoffs.forEach((oid) => {
        const order = cluster.find((o) => o.order_id === oid)!;
        routeDistance += getHaversineDistance(
          lastLat,
          lastLon,
          order.dropoff_location.latitude,
          order.dropoff_location.longitude
        );
        lastLat = order.dropoff_location.latitude;
        lastLon = order.dropoff_location.longitude;
      });

      const totalEarnings = cluster.reduce((sum, o) => sum + o.fee, 0);

      const batchId = `BAT-CH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      batches.push({
        batch_id: batchId,
        orders: cluster,
        total_distance: parseFloat(routeDistance.toFixed(1)),
        total_earnings: totalEarnings,
        status: "OFFER",
        created_at: new Date().toISOString(),
        pickup_sequence: tspRoute.pickups,
        dropoff_sequence: tspRoute.dropoffs,
      });
    }

    return batches;
  }
};

// Express Router registration for backend Batch Intermediary Endpoints
const router = Router();

router.post("/api/batch-grouping/scan", (req: Request, res: Response) => {
  const { latitude, longitude, search_radius, orders } = req.body;

  if (latitude === undefined || longitude === undefined || !orders) {
    res.status(400).json({ error: "Missing latitude, longitude, or order parameters" });
    return;
  }

  try {
    const matchedClusters = BatchGroupingService.clusterOrders(
      Number(latitude),
      Number(longitude),
      orders,
      search_radius ? Number(search_radius) : 3.0
    );

    res.json({
      success: true,
      batches: matchedClusters,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
