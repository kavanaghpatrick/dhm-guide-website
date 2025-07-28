-- ETF Research Platform - Existing Database Schema
-- This file documents the existing schema that the dividend tables need to integrate with

-- Existing ticker information table
CREATE TABLE IF NOT EXISTS tickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT,
    total_records INTEGER DEFAULT 0,
    first_cached_date DATE,
    last_cached_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Existing stock price data table
CREATE TABLE IF NOT EXISTS stock_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_symbol TEXT NOT NULL,
    date DATE NOT NULL,
    open REAL,
    high REAL,
    low REAL,
    close REAL NOT NULL,
    volume INTEGER,
    adj_close REAL,  -- Already handles dividend adjustments for price
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticker_symbol, date),
    FOREIGN KEY (ticker_symbol) REFERENCES tickers(symbol)
);

-- Existing cache management table
CREATE TABLE IF NOT EXISTS cache_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker_symbol TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker_symbol) REFERENCES tickers(symbol)
);

-- Existing API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_name TEXT NOT NULL,
    endpoint TEXT,
    ticker_symbol TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status INTEGER,
    error_message TEXT,
    credits_used INTEGER DEFAULT 1
);

-- Indexes on existing tables
CREATE INDEX IF NOT EXISTS idx_stock_data_ticker ON stock_data(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_stock_data_date ON stock_data(date);
CREATE INDEX IF NOT EXISTS idx_stock_data_ticker_date ON stock_data(ticker_symbol, date);
CREATE INDEX IF NOT EXISTS idx_cache_ranges_ticker ON cache_ranges(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(request_date);