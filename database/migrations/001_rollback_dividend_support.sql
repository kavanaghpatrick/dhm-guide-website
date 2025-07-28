-- Rollback Migration: Remove Dividend Support
-- Version: 001
-- Date: 2025-01-13
-- Description: Removes dividend tables and views from database

-- ============================================================================
-- STEP 1: Drop Triggers
-- ============================================================================

DROP TRIGGER IF EXISTS update_ticker_on_dividend_insert;
DROP TRIGGER IF EXISTS update_dividend_timestamp;
DROP TRIGGER IF EXISTS invalidate_summary_on_dividend;
DROP TRIGGER IF EXISTS apply_split_to_dividends;

-- ============================================================================
-- STEP 2: Drop Views
-- ============================================================================

DROP VIEW IF EXISTS v_ticker_complete_returns;
DROP VIEW IF EXISTS v_dividend_growth;
DROP VIEW IF EXISTS v_dividend_yields;
DROP VIEW IF EXISTS v_total_returns;
DROP VIEW IF EXISTS v_stock_data_with_dividends;

-- ============================================================================
-- STEP 3: Drop Indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_dividend_summary_updated;
DROP INDEX IF EXISTS idx_dividend_summary_ticker;
DROP INDEX IF EXISTS idx_corp_actions_type;
DROP INDEX IF EXISTS idx_corp_actions_ex_date;
DROP INDEX IF EXISTS idx_corp_actions_ticker;
DROP INDEX IF EXISTS idx_dividend_cache_dates;
DROP INDEX IF EXISTS idx_dividend_cache_ticker;
DROP INDEX IF EXISTS idx_dividends_type;
DROP INDEX IF EXISTS idx_dividends_ticker_ex_date;
DROP INDEX IF EXISTS idx_dividends_payment_date;
DROP INDEX IF EXISTS idx_dividends_ex_date;
DROP INDEX IF EXISTS idx_dividends_ticker_id;

-- ============================================================================
-- STEP 4: Drop Tables
-- ============================================================================

-- Drop in reverse order of dependencies
DROP TABLE IF EXISTS dividend_summary;
DROP TABLE IF EXISTS corporate_actions;
DROP TABLE IF EXISTS dividend_cache_ranges;
DROP TABLE IF EXISTS dividends;

-- ============================================================================
-- STEP 5: Remove Migration Log Entry
-- ============================================================================

DELETE FROM schema_migrations WHERE version = '001';

-- ============================================================================
-- STEP 6: Verification
-- ============================================================================

-- Verify all dividend objects were removed
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'Rollback successful: All dividend objects removed'
        ELSE 'Rollback incomplete: ' || COUNT(*) || ' dividend objects still exist'
    END as status
FROM sqlite_master 
WHERE (type IN ('table', 'view', 'index', 'trigger'))
AND (name LIKE '%dividend%' OR name LIKE '%corporate_action%');