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

-- =============================================================
-- 3. Wallet Ledger Table: Holds available and locked balance states
-- =============================================================
CREATE TABLE IF NOT EXISTS wallet_ledger (
    ledger_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('seller', 'agent', 'rider')),
    available_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    locked_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Locked settlement escrow ledger balance
    currency VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_role UNIQUE (user_id, user_role)
);

-- Index for searching active ledger balances
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_lookup ON wallet_ledger(user_id, user_role);

-- =============================================================
-- 4. Wallet Transactions Table: Stores cashing out & payout details
-- =============================================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('seller', 'agent', 'rider')),
    reference_id VARCHAR(100) NOT NULL UNIQUE, -- Formatted as SEL-{ROLE}-{ID}-{TIMESTAMP}
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZMW',
    narration VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
    lipila_identifier VARCHAR(100), -- Secure callback reference mapping code
    payment_type VARCHAR(20) NOT NULL DEFAULT 'Bank',
    account_number VARCHAR(100) NOT NULL,
    swift_code VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for instant status callback routing searches
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_ref ON wallet_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_state ON wallet_transactions(user_id, status);

