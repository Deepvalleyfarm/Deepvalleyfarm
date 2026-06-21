import React from "react";

// Geolocation coordinate structure for our Zambian map simulator
export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface BatchOrderItem {
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
  status: "PENDING" | "COLLECTED" | "DELIVERED" | "NOT_READY_SPLIT" | "CANCELLED" | "ATTEMPTED_DISPUTE";
  buyer_phone: string;
}

export interface RiderBatch {
  batch_id: string;
  orders: BatchOrderItem[];
  total_distance: number;
  total_earnings: number;
  status: "OFFER" | "ACCEPTED" | "DELIVERING" | "SUCCESS" | "LAPSED" | "REJECTED";
  created_at: string;
  pickup_sequence: string[]; // Order ids in optimized pickup route
  dropoff_sequence: string[]; // Order ids in optimized dropoff route
}

// Haversine formula to compute distance between two latitude/longitude coordinates (replaces external maps billing)
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
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

// Compute the bearing/heading from node A to node B
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

// Greedily approximate Traveling Salesperson Problem (TSP) for pick-ups & drop-offs combined (<= 4 stops is instantaneous)
export function optimizeBatchRoutes(
  riderLat: number,
  riderLon: number,
  orders: BatchOrderItem[]
): { pickups: string[]; dropoffs: string[] } {
  // Solve pick-up sequence nearest-first
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

  // Solve drop-off sequence nearest-first, starting from the last pickup point
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

// Mock database orders scattered over Lusaka to feed the corridor proximity logic
export const MOCK_PENDING_MARKETPLACE_ORDERS: BatchOrderItem[] = [
  {
    order_id: "SNB-001",
    item: "High-grade Maize Bags (5x 50kg)",
    seller_id: "sel_manda_coop",
    seller_name: "Chisamba Crop Co-op",
    pickup_location: { latitude: -15.2215, longitude: 28.3240, name: "Chisamba Wholesale Hub" },
    buyer_name: "Bupe Phiri",
    dropoff_location: { latitude: -15.4210, longitude: 28.3315, name: "Leopards Hill Estate, Woodlands" },
    fee: 210.0,
    price: 340.0,
    otp: "4820",
    status: "PENDING",
    buyer_phone: "+260 971 884 102",
  },
  {
    order_id: "SNB-002",
    item: "Sweet Chongwe Tomato crates (3x bulk boxes)",
    seller_id: "sel_chongwe_tom",
    seller_name: "Chisamba Agri-Wholesale",
    pickup_location: { latitude: -15.2230, longitude: 28.3255, name: "Chisamba Farm Market, Block B" },
    buyer_name: "Mulenga Mwapa",
    dropoff_location: { latitude: -15.4245, longitude: 28.3340, name: "Woodlands Extension Gates, Lusaka" },
    fee: 195.0,
    price: 180.0,
    otp: "9041",
    status: "PENDING",
    buyer_phone: "+260 964 125 502",
  },
  {
    order_id: "SNB-003",
    item: "Premium Red Onions Pocket (1x 25kg)",
    seller_id: "sel_organic_hub",
    seller_name: "Chisamba Organic Express",
    pickup_location: { latitude: -15.2210, longitude: 28.3235, name: "Chisamba Central Grain Depot" },
    buyer_name: "Precious Chanda",
    dropoff_location: { latitude: -15.4195, longitude: 28.3290, name: "Avondale Heights Gate C, Lusaka" },
    fee: 250.0,
    price: 150.0,
    otp: "7130",
    status: "PENDING",
    buyer_phone: "+260 955 771 902",
  },
  {
    order_id: "SNB-004",
    item: "Kapenta Dried Fish pack (2x bags)",
    seller_id: "sel_manda_coop",
    seller_name: "Chisamba Crop Co-op",
    pickup_location: { latitude: -15.2250, longitude: 28.3210, name: "Chisamba Seed Warehouse" },
    buyer_name: "Kabaso Phiri",
    dropoff_location: { latitude: -15.4510, longitude: 28.3615, name: "Kafue Gateway Boulevard" },
    fee: 310.0,
    price: 450.0,
    otp: "2285",
    status: "PENDING",
    buyer_phone: "+260 971 556 123",
  },
  {
    order_id: "SNB-005",
    item: "Airtel / MTN Booster Antenna",
    seller_id: "sel_tech_co",
    seller_name: "Soweto Electro Market",
    pickup_location: { latitude: -15.4410, longitude: 28.2840, name: "Soweto Market Cell Blocks" },
    buyer_name: "John Sampa",
    dropoff_location: { latitude: -15.4050, longitude: 28.2910, name: "Northmead Mall, Block C" },
    fee: 140.0,
    price: 900.0,
    otp: "5501",
    status: "PENDING",
    buyer_phone: "+260 966 401 203",
  },
];

// Perform Corridor Proximity grouping of orders using Haversine & same-bearing thresholding
export function matchProximityBatches(
  riderLat: number,
  riderLon: number,
  maxRadiusKm = 10,
  maxBatchSize = 4
): RiderBatch[] {
  // Step 1: Filter orders within the configured scanning radius from the rider
  const ordersInRadius = MOCK_PENDING_MARKETPLACE_ORDERS.filter((order) => {
    const distToPickup = getHaversineDistance(
      riderLat,
      riderLon,
      order.pickup_location.latitude,
      order.pickup_location.longitude
    );
    return distToPickup <= maxRadiusKm;
  });

  if (ordersInRadius.length === 0) return [];

  const batches: RiderBatch[] = [];

  // Step 2: Cluster orders into groups based on pickup proximity (within 500m / 0.5km)
  const processedOrderIds = new Set<string>();

  for (const seedOrder of ordersInRadius) {
    if (processedOrderIds.has(seedOrder.order_id)) continue;

    const cluster: BatchOrderItem[] = [seedOrder];
    processedOrderIds.add(seedOrder.order_id);

    // Calculate reference bearing from seed pickup to seed dropoff
    const referenceBearing = getBearing(
      seedOrder.pickup_location.latitude,
      seedOrder.pickup_location.longitude,
      seedOrder.dropoff_location.latitude,
      seedOrder.dropoff_location.longitude
    );

    // Find other orders that have pickup locations within 500 meters AND fall along a similar drop-off bearing slot (+- 35 degrees)
    for (const testOrder of ordersInRadius) {
      if (processedOrderIds.has(testOrder.order_id)) continue;

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

      // Bearing angular difference comparison (accounting for 360 wrap-around)
      let bearingDiff = Math.abs(referenceBearing - testBearing);
      if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

      if (pickupDist <= 0.5 && bearingDiff <= 45) {
        cluster.push(testOrder);
        processedOrderIds.add(testOrder.order_id);
        if (cluster.length >= maxBatchSize) break;
      }
    }

    // Solve TSP sequence for this clustered cohort
    const routeOpt = optimizeBatchRoutes(riderLat, riderLon, cluster);

    // Calculate total estimated distance across the optimized pickup and dropoff legs
    let routeDistance = 0;
    let lastLat = riderLat;
    let lastLon = riderLon;

    // Add pickups
    routeOpt.pickups.forEach((oid) => {
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

    // Add dropoffs
    routeOpt.dropoffs.forEach((oid) => {
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

    const earnings = cluster.reduce((sum, o) => sum + o.fee, 0);

    batches.push({
      batch_id: `BAT-CH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      orders: cluster.map(o => ({...o, status: "PENDING"})),
      total_distance: parseFloat(routeDistance.toFixed(1)),
      total_earnings: earnings,
      status: "OFFER",
      created_at: new Date().toISOString(),
      pickup_sequence: routeOpt.pickups,
      dropoff_sequence: routeOpt.dropoffs,
    });
  }

  return batches;
}

// CODES AND EXCEL SCHEMAS FOR DEV EXPORT
export const TECHNICAL_SPECS = {
  postgresSchema: `------------------------------------------------------------
-- SELONACHIPA BATCH ROUTTING POSTGRESQL SCHEMA SPECIFICATION
------------------------------------------------------------

-- Enums describing the progress of the batch lifecycle
CREATE TYPE batch_status_enum AS ENUM ('OFFER', 'ACCEPTED', 'DELIVERING', 'SUCCESS', 'LAPSED', 'REJECTED');
CREATE TYPE order_transit_status_enum AS ENUM ('pending_seller_confirmation', 'rider_assigned', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'attempted_dispute');

-- Batches Main Table
CREATE TABLE batches (
    batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id VARCHAR(50) NOT NULL,
    total_distance_km NUMERIC(6, 2) NOT NULL,
    total_earnings_zmw NUMERIC(8, 2) NOT NULL,
    status batch_status_enum NOT NULL DEFAULT 'OFFER',
    pickup_sequence_json JSONB NOT NULL,    -- Ordered array of order_ids for TSP pickup
    dropoff_sequence_json JSONB NOT NULL,   -- Ordered array of order_ids for TSP dropoff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Batch Order Items Relational Mapper
CREATE TABLE batch_order_items (
    id SERIAL PRIMARY KEY,
    batch_id UUID REFERENCES batches(batch_id) ON DELETE CASCADE,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    sequence_rank INT NOT NULL,
    verification_otp VARCHAR(6) NOT NULL,
    merchant_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COLLECTED, NOT_READY
    dropped_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' -- PENDING, COMPLETED, DISPUTED
);

-- Optimize routing queries by adding foreign keys and geospatial indexes 
CREATE INDEX idx_batches_rider_status ON batches (rider_id, status);
CREATE INDEX idx_batch_order_items_lookup ON batch_order_items (batch_id, order_id);`,

  nodeJsService: `// Node.js batch grouping service logic (corridor clustering & Haversine metrics)
import { Router } from "express";
const router = Router();

// Haversine helper
function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Bearing helper
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Proximity algorithm endpoint
router.post("/api/riders/match-batches", async (req, res) => {
  const { rider_id, latitude, longitude, radius_km = 3, max_capacity = 4 } = req.body;

  try {
    // 1. Query all PENDING orders awaiting pickup from DB
    const pendingOrders = await db.query(
      "SELECT * FROM orders WHERE transit_status = 'pending_seller_confirmation' AND escrow_status = 'locked'"
    );

    // 2. Identify orders whose pickups fall inside the radius 
    const ordersInRadius = pendingOrders.filter(order => {
      const dist = haversineDist(latitude, longitude, order.pickup_latitude, order.pickup_longitude);
      return dist <= radius_km;
    });

    const batchedOffers = [];
    const processedIds = new Set();

    // 3. Corridor Clustering Loop
    for (const baseOrder of ordersInRadius) {
      if (processedIds.has(baseOrder.order_id)) continue;

      const cluster = [baseOrder];
      processedIds.add(baseOrder.order_id);

      const refBearing = calculateBearing(
        baseOrder.pickup_latitude, baseOrder.pickup_longitude,
        baseOrder.dropoff_latitude, baseOrder.dropoff_longitude
      );

      for (const testOrder of ordersInRadius) {
        if (processedIds.has(testOrder.order_id)) continue;

        // Pickups within 500m proximity threshold
        const pickupDist = haversineDist(
          baseOrder.pickup_latitude, baseOrder.pickup_longitude,
          testOrder.pickup_latitude, testOrder.pickup_longitude
        );

        const testBearing = calculateBearing(
          testOrder.pickup_latitude, testOrder.pickup_longitude,
          testOrder.dropoff_latitude, testOrder.dropoff_longitude
        );

        let bearingDiff = Math.abs(refBearing - testBearing);
        if (bearingDiff > 180) bearingDiff = 360 - bearingDiff;

        // If pickups are within 500m and heading along same corridor (angle difference < 45 degrees)
        if (pickupDist <= 0.5 && bearingDiff <= 45) {
          cluster.push(testOrder);
          processedIds.add(testOrder.order_id);
          if (cluster.length >= max_capacity) break;
        }
      }

      // Record compiled batch in postgres logic database
      if (cluster.length > 0) {
        batchedOffers.push({
          suggested_batch_id: \`B-\${Date.now().toString(36).slice(-4).toUpperCase()}\`,
          orders: cluster,
          estimated_earnings: cluster.reduce((sum, o) => sum + o.delivery_fee, 0),
          total_items: cluster.length
        });
      }
    }

    res.json({ success: true, batches: batchedOffers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,

  lipilaSequence: `------------------------------------------------------------
-- LIPILA API TRADING AND ESCROW RELEASE SEQUENCING
------------------------------------------------------------

1. INITIATE ESCROW FOR EACH ORDER (On Buyer Checkout)
   --------------------------------------------------
   Method: POST
   URL: https://api.lipila.co.zm/v1/escrow/collect
   Payload:
   {
       "transaction_ref": "TX-LIP-SNC-001",
       "amount": 355.00, -- Price + rider delivery fee portion
       "currency": "ZMW",
       "payer_channel": "MTN_MOMO",
       "payer_phone": "+260971884102",
       "recipient_escrow_holding": "Selonachipa_Holding_Account",
       "metadata": {
           "order_id": "SNB-001",
           "buyer_id": "buy_bupe",
           "service_type": "marketplace_trade"
       }
   }

2. MERCHANT TRANSACTION TRIGGER (Split Escrow Release)
   ---------------------------------------------------
   On pickup, release product price portion to merchant:
   Method: POST
   URL: https://api.lipila.co.zm/v1/escrow/disburse
   Payload:
   {
       "transaction_ref": "TX-LIP-SNC-001-MD",
       "parent_escrow_ref": "TX-LIP-SNC-001",
       "disburse_amount": 340.00, -- Releases product cost minus 5% platform commission
       "currency": "ZMW",
       "destination_channel": "AIRTEL",
       "destination_phone": "+260964125502"
   }

3. RIDER PAYOUT TRANSACTION TRIGGER (Immediate Drop-off release)
   --------------------------------------------------------------
   On OTP/tap-to-confirm delivery of SNB-001 order element:
   Method: POST
   URL: https://api.lipila.co.zm/v1/escrow/disburse
   Payload:
   {
       "transaction_ref": "TX-LIP-SNC-001-RD",
       "parent_escrow_ref": "TX-LIP-SNC-001",
       "disburse_amount": 178.50, -- Delivery fee K15, less 10% platform, 5% social fund
       "currency": "ZMW",
       "destination_channel": "MTN_MOMO",
       "destination_phone": "+26096412356" -- Rider Chipo's target wallet
   }`,

  fcmPayload: `------------------------------------------------------------
-- FIREBASE CLOUD MESSAGING & AFRICA'S TALKING TEXT DISPATCH
------------------------------------------------------------

1. FCM PUSH NOTIFICATION FOR ETA PREVIEW
   --------------------------------------
   Triggered 5 minutes prior to drop-off node arrival:
   {
       "to": "/topics/customer_SN-991",
       "notification": {
           "title": "Selonachipa Delivery Approaching! 🚴",
           "body": "Your rider, Chipo Mwansa, is 1.2 km away. ETA: 5 mins. Get your confirmation code ready!",
           "sound": "default",
           "click_action": "FLUTTER_NOTIFICATION_CLICK"
       },
       "data": {
           "order_id": "SNB-001",
           "eta_duration_mins": "5",
           "action_code": "PROXIMITY_ALERT",
           "rider_lat": "-15.4215",
           "rider_lon": "28.3245"
       }
   }

2. AFRICA'S TALKING SMS FALLBACK GATEWAY (For low-bandwidth)
   ---------------------------------------------------------
   URL: https://api.africastalking.com/version1/messaging
   Payload:
   {
       "username": "selonachipa_sms",
       "to": "+260971884102",
       "message": "[SeloNaChipa] Chipo is arriving in 5 mins with your farm load. Give OTP: 4820 to unlock escrow."
   }`
};
