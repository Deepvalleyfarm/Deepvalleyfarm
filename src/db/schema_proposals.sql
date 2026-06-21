-- PostgreSQL Schema Proposal for Selonachipa Smart-Escrow Corridor Batches
-- File: /src/db/schema_proposals.sql

-- Enable PostGIS extension for geo-distance scans if needed
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Batches Table: Represents clustered multi-stop corridors assigned to riders
CREATE TABLE IF NOT EXISTS batches (
    batch_id VARCHAR(50) PRIMARY KEY,
    rider_id VARCHAR(50) NOT NULL REFERENCES riders(rider_id) ON DELETE CASCADE,
    total_distance NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    total_earnings NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('OFFER', 'ACCEPTED', 'DELIVERING', 'SUCCESS', 'LAPSED')),
    pickup_sequence VARCHAR(50)[] NOT NULL, -- TSP-optimized array of Order IDs for pickup sequence
    dropoff_sequence VARCHAR(50)[] NOT NULL, -- TSP-optimized array of Order IDs for delivery sequence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for scanning batches by assigned rider & status
CREATE INDEX IF NOT EXISTS idx_batches_rider_status ON batches(rider_id, status);

-- 2. Batch Order Items Table: Represents individual orders within a transport batch & escrow state
CREATE TABLE IF NOT EXISTS batch_order_items (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    order_id VARCHAR(50) NOT NULL,
    seller_name VARCHAR(100) NOT NULL,
    buyer_name VARCHAR(100) NOT NULL,
    item VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    pickup_latitude NUMERIC(9, 6) NOT NULL,
    pickup_longitude NUMERIC(9, 6) NOT NULL,
    pickup_name VARCHAR(255) NOT NULL,
    dropoff_latitude NUMERIC(9, 6) NOT NULL,
    dropoff_longitude NUMERIC(9, 6) NOT NULL,
    dropoff_name VARCHAR(255) NOT NULL,
    
    -- Escrow states matching smart-escrow contracts (e.g. LOCKED, COLLECTED, RELEASED, DISPUTED, CANCELLED)
    escrow_status VARCHAR(20) NOT NULL DEFAULT 'LOCKED' CHECK (escrow_status IN ('LOCKED', 'COLLECTED', 'RELEASE_PENDING', 'RELEASED', 'ATTEMPTED_DISPUTE', 'CANCELLED')),
    
    -- Delivery states within the loop
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'SCANNED', 'COLLECTED', 'EN_ROUTE', 'DELIVERED', 'REFUSED')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_batch_order UNIQUE (batch_id, order_id)
);

-- Index for searching and verifying specific order status within active batches
CREATE INDEX IF NOT EXISTS idx_batch_order_verification ON batch_order_items(order_id, escrow_status);
