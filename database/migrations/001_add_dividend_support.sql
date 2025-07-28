-- Migration: Add Dividend Support to ETF Research Platform
-- Version: 001
-- Date: 2025-01-13
-- Description: Adds dividend tables and views to existing database

-- ============================================================================
-- STEP 1: Verify Prerequisites
-- ============================================================================

-- Check if required tables exist
SELECT CASE 
    WHEN COUNT(*) = 4 THEN 'Prerequisites OK'
    ELSE 'ERROR: Missing required tables'
END as status
FROM sqlite_master 
WHERE type = 'table' 
AND name IN ('tickers', 'stock_data', 'cache_ranges', 'api_usage');

-- ============================================================================
-- STEP 2: Create Dividend Tables
-- ============================================================================

-- Create dividends table
CREATE TABLE IF NOT EXISTS dividends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL,
    ex_date DATE NOT NULL,
    payment_date DATE,
    record_date DATE,
    announcement_date DATE,
    dividend_amount DECIMAL(10, 6) NOT NULL,
    dividend_type TEXT NOT NULL DEFAULT 'regular' 
        CHECK (dividend_type IN ('regular', 'special', 'return_of_capital', 'qualified', 'non_qualified')),
    payment_frequency TEXT 
        CHECK (payment_frequency IN ('annual', 'semi_annual', 'quarterly', 'monthly', 'irregular')),
    currency TEXT NOT NULL DEFAULT 'USD',
    adjustment_factor DECIMAL(10, 6) NOT NULL DEFAULT 1.0,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker_id, ex_date, dividend_type),
    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE
);

-- Create dividend cache ranges
CREATE TABLE IF NOT EXISTS dividend_cache_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE
);

-- Create corporate actions table
CREATE TABLE IF NOT EXISTS corporate_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL,
    action_type TEXT NOT NULL 
        CHECK (action_type IN ('split', 'reverse_split', 'spinoff', 'merger', 'acquisition', 
                              'special_dividend', 'rights_offering', 'stock_dividend')),
    announcement_date DATE,
    ex_date DATE NOT NULL,
    effective_date DATE,
    ratio_from DECIMAL(10, 6),
    ratio_to DECIMAL(10, 6),
    description TEXT,
    related_ticker_id INTEGER,
    cash_component DECIMAL(10, 6),
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
    FOREIGN KEY (related_ticker_id) REFERENCES tickers(id) ON DELETE SET NULL
);

-- Create dividend summary table
CREATE TABLE IF NOT EXISTS dividend_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_id INTEGER NOT NULL UNIQUE,
    ttm_dividends DECIMAL(10, 6),
    ttm_yield_pct DECIMAL(6, 4),
    ttm_dividend_count INTEGER,
    latest_dividend_amount DECIMAL(10, 6),
    latest_ex_date DATE,
    latest_payment_date DATE,
    dividend_growth_1y DECIMAL(6, 4),
    dividend_growth_3y DECIMAL(6, 4),
    dividend_growth_5y DECIMAL(6, 4),
    consecutive_years_paid INTEGER,
    consecutive_years_increased INTEGER,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE
);

-- ============================================================================
-- STEP 3: Create Indexes
-- ============================================================================

-- Dividend table indexes
CREATE INDEX IF NOT EXISTS idx_dividends_ticker_id ON dividends(ticker_id);
CREATE INDEX IF NOT EXISTS idx_dividends_ex_date ON dividends(ex_date);
CREATE INDEX IF NOT EXISTS idx_dividends_payment_date ON dividends(payment_date);
CREATE INDEX IF NOT EXISTS idx_dividends_ticker_ex_date ON dividends(ticker_id, ex_date);
CREATE INDEX IF NOT EXISTS idx_dividends_type ON dividends(dividend_type);

-- Dividend cache indexes
CREATE INDEX IF NOT EXISTS idx_dividend_cache_ticker ON dividend_cache_ranges(ticker_id);
CREATE INDEX IF NOT EXISTS idx_dividend_cache_dates ON dividend_cache_ranges(start_date, end_date);

-- Corporate actions indexes
CREATE INDEX IF NOT EXISTS idx_corp_actions_ticker ON corporate_actions(ticker_id);
CREATE INDEX IF NOT EXISTS idx_corp_actions_ex_date ON corporate_actions(ex_date);
CREATE INDEX IF NOT EXISTS idx_corp_actions_type ON corporate_actions(action_type);

-- Summary table indexes
CREATE INDEX IF NOT EXISTS idx_dividend_summary_ticker ON dividend_summary(ticker_id);
CREATE INDEX IF NOT EXISTS idx_dividend_summary_updated ON dividend_summary(last_updated);

-- ============================================================================
-- STEP 4: Create Views
-- ============================================================================

-- Drop views if they exist (to handle re-running migration)
DROP VIEW IF EXISTS v_stock_data_with_dividends;
DROP VIEW IF EXISTS v_total_returns;
DROP VIEW IF EXISTS v_dividend_yields;
DROP VIEW IF EXISTS v_dividend_growth;
DROP VIEW IF EXISTS v_ticker_complete_returns;

-- View: Enhanced stock data with dividend information
CREATE VIEW v_stock_data_with_dividends AS
SELECT 
    sd.*,
    d.dividend_amount,
    d.dividend_type,
    d.ex_date as dividend_ex_date,
    d.payment_date as dividend_payment_date
FROM stock_data sd
LEFT JOIN dividends d 
    ON sd.ticker_symbol = (SELECT symbol FROM tickers WHERE id = d.ticker_id)
    AND sd.date = d.ex_date;

-- View: Total return calculation
CREATE VIEW v_total_returns AS
WITH daily_returns AS (
    SELECT 
        t.symbol,
        sd.date,
        sd.close,
        sd.adj_close,
        LAG(sd.adj_close) OVER (PARTITION BY sd.ticker_symbol ORDER BY sd.date) as prev_adj_close,
        COALESCE(d.dividend_amount * d.adjustment_factor, 0) as dividend
    FROM stock_data sd
    JOIN tickers t ON sd.ticker_symbol = t.symbol
    LEFT JOIN dividends d ON t.id = d.ticker_id AND sd.date = d.ex_date
)
SELECT 
    symbol,
    date,
    close,
    adj_close,
    dividend,
    CASE 
        WHEN prev_adj_close IS NOT NULL AND prev_adj_close > 0 
        THEN ((adj_close + dividend - prev_adj_close) / prev_adj_close) * 100
        ELSE NULL 
    END as daily_total_return_pct,
    CASE 
        WHEN prev_adj_close IS NOT NULL AND prev_adj_close > 0 
        THEN ((adj_close - prev_adj_close) / prev_adj_close) * 100
        ELSE NULL 
    END as daily_price_return_pct,
    CASE 
        WHEN prev_adj_close IS NOT NULL AND prev_adj_close > 0 
        THEN (dividend / prev_adj_close) * 100
        ELSE NULL 
    END as daily_dividend_return_pct
FROM daily_returns;

-- View: Dividend yields
CREATE VIEW v_dividend_yields AS
WITH latest_prices AS (
    SELECT 
        t.id as ticker_id,
        t.symbol,
        sd.close,
        sd.date
    FROM tickers t
    JOIN stock_data sd ON t.symbol = sd.ticker_symbol
    WHERE sd.date = (
        SELECT MAX(date) 
        FROM stock_data 
        WHERE ticker_symbol = t.symbol
    )
),
ttm_dividends AS (
    SELECT 
        ticker_id,
        SUM(dividend_amount * adjustment_factor) as ttm_dividends,
        COUNT(*) as dividend_count
    FROM dividends
    WHERE ex_date >= date('now', '-1 year')
    GROUP BY ticker_id
)
SELECT 
    lp.symbol,
    lp.close as current_price,
    lp.date as price_date,
    COALESCE(td.ttm_dividends, 0) as ttm_dividends,
    COALESCE(td.dividend_count, 0) as dividend_count,
    CASE 
        WHEN lp.close > 0 AND td.ttm_dividends IS NOT NULL 
        THEN (td.ttm_dividends / lp.close) * 100
        ELSE 0
    END as dividend_yield_pct
FROM latest_prices lp
LEFT JOIN ttm_dividends td ON lp.ticker_id = td.ticker_id;

-- View: Dividend growth
CREATE VIEW v_dividend_growth AS
WITH annual_dividends AS (
    SELECT 
        t.symbol,
        strftime('%Y', d.ex_date) as year,
        SUM(d.dividend_amount * d.adjustment_factor) as annual_dividends
    FROM dividends d
    JOIN tickers t ON d.ticker_id = t.id
    WHERE d.dividend_type = 'regular'
    GROUP BY t.symbol, strftime('%Y', d.ex_date)
),
growth_calc AS (
    SELECT 
        ad1.symbol,
        ad1.year,
        ad1.annual_dividends,
        ad2.annual_dividends as prev_year_dividends,
        CASE 
            WHEN ad2.annual_dividends > 0 
            THEN ((ad1.annual_dividends - ad2.annual_dividends) / ad2.annual_dividends) * 100
            ELSE NULL
        END as yoy_growth_pct
    FROM annual_dividends ad1
    LEFT JOIN annual_dividends ad2 
        ON ad1.symbol = ad2.symbol 
        AND CAST(ad1.year AS INTEGER) = CAST(ad2.year AS INTEGER) + 1
)
SELECT * FROM growth_calc
ORDER BY symbol, year DESC;

-- View: Complete ticker returns
CREATE VIEW v_ticker_complete_returns AS
SELECT 
    t.symbol,
    sd.date,
    sd.open,
    sd.high,
    sd.low,
    sd.close,
    sd.volume,
    sd.adj_close,
    d.dividend_amount,
    d.ex_date as dividend_ex_date,
    ca.action_type as corporate_action,
    ca.ex_date as action_ex_date
FROM tickers t
JOIN stock_data sd ON t.symbol = sd.ticker_symbol
LEFT JOIN dividends d ON t.id = d.ticker_id AND sd.date = d.ex_date
LEFT JOIN corporate_actions ca ON t.id = ca.ticker_id AND sd.date = ca.ex_date
ORDER BY t.symbol, sd.date;

-- ============================================================================
-- STEP 5: Create Triggers
-- ============================================================================

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_ticker_on_dividend_insert;
DROP TRIGGER IF EXISTS update_dividend_timestamp;
DROP TRIGGER IF EXISTS invalidate_summary_on_dividend;
DROP TRIGGER IF EXISTS apply_split_to_dividends;

-- Update ticker when dividends are added
CREATE TRIGGER update_ticker_on_dividend_insert
AFTER INSERT ON dividends
BEGIN
    UPDATE tickers 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.ticker_id;
END;

-- Update dividend timestamp
CREATE TRIGGER update_dividend_timestamp 
AFTER UPDATE ON dividends
BEGIN
    UPDATE dividends 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- Invalidate summary cache
CREATE TRIGGER invalidate_summary_on_dividend 
AFTER INSERT ON dividends
BEGIN
    DELETE FROM dividend_summary WHERE ticker_id = NEW.ticker_id;
END;

-- Apply splits to dividends
CREATE TRIGGER apply_split_to_dividends
AFTER INSERT ON corporate_actions
WHEN NEW.action_type IN ('split', 'reverse_split', 'stock_dividend')
BEGIN
    UPDATE dividends
    SET 
        dividend_amount = dividend_amount * (NEW.ratio_to / NEW.ratio_from),
        adjustment_factor = adjustment_factor * (NEW.ratio_to / NEW.ratio_from),
        updated_at = CURRENT_TIMESTAMP
    WHERE ticker_id = NEW.ticker_id 
    AND ex_date < NEW.ex_date;
END;

-- ============================================================================
-- STEP 6: Create Migration Log Entry
-- ============================================================================

-- Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record this migration
INSERT OR IGNORE INTO schema_migrations (version, name) 
VALUES ('001', 'add_dividend_support');

-- ============================================================================
-- STEP 7: Verification
-- ============================================================================

-- Verify all objects were created
SELECT 
    'Tables: ' || COUNT(*) as created_count
FROM sqlite_master 
WHERE type = 'table' 
AND name IN ('dividends', 'dividend_cache_ranges', 'corporate_actions', 'dividend_summary')

UNION ALL

SELECT 
    'Views: ' || COUNT(*) as created_count
FROM sqlite_master 
WHERE type = 'view' 
AND name IN ('v_stock_data_with_dividends', 'v_total_returns', 'v_dividend_yields', 
             'v_dividend_growth', 'v_ticker_complete_returns')

UNION ALL

SELECT 
    'Indexes: ' || COUNT(*) as created_count
FROM sqlite_master 
WHERE type = 'index' 
AND name LIKE '%dividend%'

UNION ALL

SELECT 
    'Triggers: ' || COUNT(*) as created_count
FROM sqlite_master 
WHERE type = 'trigger' 
AND name IN ('update_ticker_on_dividend_insert', 'update_dividend_timestamp', 
             'invalidate_summary_on_dividend', 'apply_split_to_dividends');