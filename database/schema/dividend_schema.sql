-- ETF Research Platform - Dividend Storage Schema
-- Version: 1.0
-- Description: Comprehensive dividend tracking system with corporate actions support
-- Database: SQLite

-- ============================================================================
-- CORE DIVIDEND TABLES
-- ============================================================================

-- Main dividend records table
CREATE TABLE IF NOT EXISTS dividends (
    dividend_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    
    -- Dividend dates
    ex_date DATE NOT NULL,
    payment_date DATE,
    record_date DATE,
    announcement_date DATE,
    
    -- Dividend amounts and types
    dividend_amount DECIMAL(10, 6) NOT NULL,
    dividend_type TEXT NOT NULL DEFAULT 'regular' CHECK (dividend_type IN ('regular', 'special', 'return_of_capital', 'qualified', 'non_qualified')),
    payment_frequency TEXT CHECK (payment_frequency IN ('annual', 'semi_annual', 'quarterly', 'monthly', 'irregular')),
    
    -- Currency and adjustment factors
    currency TEXT NOT NULL DEFAULT 'USD',
    adjustment_factor DECIMAL(10, 6) NOT NULL DEFAULT 1.0,
    
    -- Metadata
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    UNIQUE(symbol, ex_date, dividend_type),
    FOREIGN KEY (symbol) REFERENCES stock_data(symbol)
);

-- Indexes for dividend table
CREATE INDEX idx_dividends_symbol ON dividends(symbol);
CREATE INDEX idx_dividends_ex_date ON dividends(ex_date);
CREATE INDEX idx_dividends_payment_date ON dividends(payment_date);
CREATE INDEX idx_dividends_symbol_ex_date ON dividends(symbol, ex_date);
CREATE INDEX idx_dividends_type ON dividends(dividend_type);

-- ============================================================================
-- CORPORATE ACTIONS TABLES
-- ============================================================================

-- Corporate actions tracking
CREATE TABLE IF NOT EXISTS corporate_actions (
    action_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('split', 'reverse_split', 'spinoff', 'merger', 'acquisition', 'special_dividend', 'rights_offering', 'stock_dividend')),
    
    -- Action dates
    announcement_date DATE,
    ex_date DATE NOT NULL,
    effective_date DATE,
    
    -- Action details
    ratio_from DECIMAL(10, 6),  -- For splits: old shares
    ratio_to DECIMAL(10, 6),    -- For splits: new shares
    description TEXT,
    
    -- Related entities (for spinoffs, mergers)
    related_symbol TEXT,
    cash_component DECIMAL(10, 6),
    
    -- Metadata
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (symbol) REFERENCES stock_data(symbol)
);

-- Indexes for corporate actions
CREATE INDEX idx_corp_actions_symbol ON corporate_actions(symbol);
CREATE INDEX idx_corp_actions_ex_date ON corporate_actions(ex_date);
CREATE INDEX idx_corp_actions_type ON corporate_actions(action_type);

-- ============================================================================
-- DIVIDEND ADJUSTMENTS AND HISTORY
-- ============================================================================

-- Historical dividend adjustments (for splits, etc.)
CREATE TABLE IF NOT EXISTS dividend_adjustments (
    adjustment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dividend_id INTEGER NOT NULL,
    action_id INTEGER NOT NULL,
    
    -- Original values
    original_amount DECIMAL(10, 6) NOT NULL,
    
    -- Adjusted values
    adjusted_amount DECIMAL(10, 6) NOT NULL,
    adjustment_factor DECIMAL(10, 6) NOT NULL,
    
    -- Adjustment metadata
    adjustment_date DATE NOT NULL,
    adjustment_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dividend_id) REFERENCES dividends(dividend_id),
    FOREIGN KEY (action_id) REFERENCES corporate_actions(action_id)
);

-- ============================================================================
-- ETF-SPECIFIC TABLES
-- ============================================================================

-- ETF dividend distributions (breakdown by holdings)
CREATE TABLE IF NOT EXISTS etf_dividend_distributions (
    distribution_id INTEGER PRIMARY KEY AUTOINCREMENT,
    etf_symbol TEXT NOT NULL,
    dividend_id INTEGER NOT NULL,
    
    -- Distribution details
    total_distribution DECIMAL(12, 6) NOT NULL,
    distribution_per_share DECIMAL(10, 6) NOT NULL,
    
    -- Tax characterization
    ordinary_income DECIMAL(10, 6) DEFAULT 0,
    qualified_dividends DECIMAL(10, 6) DEFAULT 0,
    capital_gains_short DECIMAL(10, 6) DEFAULT 0,
    capital_gains_long DECIMAL(10, 6) DEFAULT 0,
    return_of_capital DECIMAL(10, 6) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (etf_symbol) REFERENCES stock_data(symbol),
    FOREIGN KEY (dividend_id) REFERENCES dividends(dividend_id)
);

-- ETF constituent dividends (tracking dividends from holdings)
CREATE TABLE IF NOT EXISTS etf_constituent_dividends (
    constituent_dividend_id INTEGER PRIMARY KEY AUTOINCREMENT,
    etf_symbol TEXT NOT NULL,
    constituent_symbol TEXT NOT NULL,
    dividend_id INTEGER NOT NULL,
    
    -- Weighting and contribution
    constituent_weight DECIMAL(6, 4),
    dividend_contribution DECIMAL(10, 6),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (etf_symbol) REFERENCES stock_data(symbol),
    FOREIGN KEY (constituent_symbol) REFERENCES stock_data(symbol),
    FOREIGN KEY (dividend_id) REFERENCES dividends(dividend_id)
);

-- ============================================================================
-- DIVIDEND FORECASTS AND ESTIMATES
-- ============================================================================

-- Dividend forecasts/estimates
CREATE TABLE IF NOT EXISTS dividend_forecasts (
    forecast_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    
    -- Forecast dates
    forecast_date DATE NOT NULL,
    forecast_ex_date DATE NOT NULL,
    
    -- Forecast amounts
    forecast_amount DECIMAL(10, 6) NOT NULL,
    forecast_type TEXT DEFAULT 'regular',
    
    -- Confidence and source
    confidence_level DECIMAL(3, 2) CHECK (confidence_level >= 0 AND confidence_level <= 1),
    forecast_source TEXT,
    
    -- Actual dividend link (when paid)
    actual_dividend_id INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (symbol) REFERENCES stock_data(symbol),
    FOREIGN KEY (actual_dividend_id) REFERENCES dividends(dividend_id)
);

-- ============================================================================
-- CACHE AND PERFORMANCE TABLES
-- ============================================================================

-- Dividend summary cache (for fast queries)
CREATE TABLE IF NOT EXISTS dividend_summary_cache (
    cache_id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    
    -- Summary statistics
    total_dividends_12m DECIMAL(10, 6),
    dividend_yield_12m DECIMAL(6, 4),
    dividend_count_12m INTEGER,
    
    -- Latest dividend info
    latest_dividend_amount DECIMAL(10, 6),
    latest_ex_date DATE,
    latest_payment_date DATE,
    
    -- Growth metrics
    dividend_growth_1y DECIMAL(6, 4),
    dividend_growth_3y DECIMAL(6, 4),
    dividend_growth_5y DECIMAL(6, 4),
    
    -- Cache metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cache_valid_until TIMESTAMP,
    
    UNIQUE(symbol)
);

CREATE INDEX idx_dividend_cache_symbol ON dividend_summary_cache(symbol);
CREATE INDEX idx_dividend_cache_updated ON dividend_summary_cache(last_updated);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Latest dividends per symbol
CREATE VIEW v_latest_dividends AS
SELECT 
    d1.*,
    ca.action_type as pending_action,
    ca.ex_date as action_ex_date
FROM dividends d1
LEFT JOIN corporate_actions ca 
    ON d1.symbol = ca.symbol 
    AND ca.ex_date > d1.ex_date
WHERE d1.ex_date = (
    SELECT MAX(d2.ex_date)
    FROM dividends d2
    WHERE d2.symbol = d1.symbol
);

-- View: Dividend yield calculation (trailing 12 months)
CREATE VIEW v_dividend_yields AS
WITH latest_prices AS (
    SELECT symbol, close_price, date
    FROM stock_data
    WHERE date = (SELECT MAX(date) FROM stock_data WHERE symbol = stock_data.symbol)
),
ttm_dividends AS (
    SELECT 
        symbol,
        SUM(dividend_amount * adjustment_factor) as ttm_dividends,
        COUNT(*) as dividend_count
    FROM dividends
    WHERE ex_date >= date('now', '-1 year')
    GROUP BY symbol
)
SELECT 
    lp.symbol,
    lp.close_price,
    td.ttm_dividends,
    td.dividend_count,
    CASE 
        WHEN lp.close_price > 0 THEN (td.ttm_dividends / lp.close_price) * 100
        ELSE NULL
    END as dividend_yield_pct
FROM latest_prices lp
JOIN ttm_dividends td ON lp.symbol = td.symbol;

-- View: Dividend growth rates
CREATE VIEW v_dividend_growth AS
WITH dividend_years AS (
    SELECT 
        symbol,
        strftime('%Y', ex_date) as year,
        SUM(dividend_amount * adjustment_factor) as annual_dividends
    FROM dividends
    WHERE dividend_type = 'regular'
    GROUP BY symbol, strftime('%Y', ex_date)
),
growth_calc AS (
    SELECT 
        d1.symbol,
        d1.year,
        d1.annual_dividends,
        d2.annual_dividends as prev_year_dividends,
        CASE 
            WHEN d2.annual_dividends > 0 
            THEN ((d1.annual_dividends - d2.annual_dividends) / d2.annual_dividends) * 100
            ELSE NULL
        END as yoy_growth
    FROM dividend_years d1
    LEFT JOIN dividend_years d2 
        ON d1.symbol = d2.symbol 
        AND CAST(d1.year AS INTEGER) = CAST(d2.year AS INTEGER) + 1
)
SELECT * FROM growth_calc
ORDER BY symbol, year DESC;

-- View: Total return components
CREATE VIEW v_total_return_components AS
WITH price_returns AS (
    SELECT 
        s1.symbol,
        s1.date,
        s1.close_price,
        s2.close_price as year_ago_price,
        ((s1.close_price - s2.close_price) / s2.close_price) * 100 as price_return_pct
    FROM stock_data s1
    JOIN stock_data s2 
        ON s1.symbol = s2.symbol 
        AND s2.date = date(s1.date, '-1 year')
),
dividend_returns AS (
    SELECT 
        d.symbol,
        SUM(d.dividend_amount * d.adjustment_factor) as dividends_paid,
        AVG(sd.close_price) as avg_price
    FROM dividends d
    JOIN stock_data sd ON d.symbol = sd.symbol AND sd.date = d.ex_date
    WHERE d.ex_date >= date('now', '-1 year')
    GROUP BY d.symbol
)
SELECT 
    pr.symbol,
    pr.date,
    pr.close_price,
    pr.price_return_pct,
    (dr.dividends_paid / pr.year_ago_price) * 100 as dividend_return_pct,
    pr.price_return_pct + ((dr.dividends_paid / pr.year_ago_price) * 100) as total_return_pct
FROM price_returns pr
LEFT JOIN dividend_returns dr ON pr.symbol = dr.symbol
WHERE pr.date = (SELECT MAX(date) FROM stock_data WHERE symbol = pr.symbol);

-- ============================================================================
-- TRIGGERS FOR DATA INTEGRITY
-- ============================================================================

-- Trigger: Update timestamp on dividend update
CREATE TRIGGER update_dividend_timestamp 
AFTER UPDATE ON dividends
BEGIN
    UPDATE dividends SET updated_at = CURRENT_TIMESTAMP WHERE dividend_id = NEW.dividend_id;
END;

-- Trigger: Update timestamp on corporate action update
CREATE TRIGGER update_corp_action_timestamp 
AFTER UPDATE ON corporate_actions
BEGIN
    UPDATE corporate_actions SET updated_at = CURRENT_TIMESTAMP WHERE action_id = NEW.action_id;
END;

-- Trigger: Invalidate cache on new dividend
CREATE TRIGGER invalidate_cache_on_dividend 
AFTER INSERT ON dividends
BEGIN
    DELETE FROM dividend_summary_cache WHERE symbol = NEW.symbol;
END;

-- Trigger: Apply corporate actions to dividends
CREATE TRIGGER apply_split_to_dividends
AFTER INSERT ON corporate_actions
WHEN NEW.action_type IN ('split', 'reverse_split')
BEGIN
    -- Insert adjustment records for affected dividends
    INSERT INTO dividend_adjustments (dividend_id, action_id, original_amount, adjusted_amount, adjustment_factor, adjustment_date, adjustment_reason)
    SELECT 
        dividend_id,
        NEW.action_id,
        dividend_amount,
        dividend_amount * (NEW.ratio_to / NEW.ratio_from),
        NEW.ratio_to / NEW.ratio_from,
        NEW.ex_date,
        'Stock ' || NEW.action_type || ' ' || NEW.ratio_from || ':' || NEW.ratio_to
    FROM dividends
    WHERE symbol = NEW.symbol AND ex_date < NEW.ex_date;
    
    -- Update dividend amounts
    UPDATE dividends
    SET 
        dividend_amount = dividend_amount * (NEW.ratio_to / NEW.ratio_from),
        adjustment_factor = adjustment_factor * (NEW.ratio_to / NEW.ratio_from)
    WHERE symbol = NEW.symbol AND ex_date < NEW.ex_date;
END;