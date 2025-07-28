"""
Dividend Cache Integration for ETF Research Platform

This module extends the existing SQLiteStockDataCache to support dividend data.
It maintains consistency with the existing caching strategy and provides methods
for dividend data retrieval and total return calculations.
"""

import sqlite3
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
import pandas as pd
from decimal import Decimal


class DividendCacheExtension:
    """Extension to handle dividend data in the existing ETF Research Platform database."""
    
    def __init__(self, db_path: str):
        """
        Initialize dividend cache extension.
        
        Args:
            db_path: Path to the SQLite database
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.close()
        
    def get_ticker_id(self, symbol: str) -> Optional[int]:
        """Get ticker ID from symbol."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id FROM tickers WHERE symbol = ?", (symbol,))
        result = cursor.fetchone()
        return result['id'] if result else None
        
    def add_dividend(self, symbol: str, ex_date: date, amount: float, 
                    dividend_type: str = 'regular', payment_date: Optional[date] = None,
                    record_date: Optional[date] = None, announcement_date: Optional[date] = None,
                    payment_frequency: Optional[str] = None, source: Optional[str] = None) -> int:
        """
        Add a dividend record to the database.
        
        Args:
            symbol: Stock ticker symbol
            ex_date: Ex-dividend date
            amount: Dividend amount per share
            dividend_type: Type of dividend (regular, special, etc.)
            payment_date: Payment date
            record_date: Record date
            announcement_date: Announcement date
            payment_frequency: Payment frequency (quarterly, monthly, etc.)
            source: Data source
            
        Returns:
            ID of the inserted dividend record
        """
        ticker_id = self.get_ticker_id(symbol)
        if not ticker_id:
            raise ValueError(f"Ticker {symbol} not found in database")
            
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO dividends (
                ticker_id, ex_date, dividend_amount, dividend_type,
                payment_date, record_date, announcement_date,
                payment_frequency, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ticker_id, ex_date, amount, dividend_type,
            payment_date, record_date, announcement_date,
            payment_frequency, source
        ))
        self.conn.commit()
        return cursor.lastrowid
        
    def get_dividends(self, symbol: str, start_date: Optional[date] = None, 
                     end_date: Optional[date] = None) -> pd.DataFrame:
        """
        Get dividend history for a ticker.
        
        Args:
            symbol: Stock ticker symbol
            start_date: Start date for dividend history
            end_date: End date for dividend history
            
        Returns:
            DataFrame with dividend history
        """
        ticker_id = self.get_ticker_id(symbol)
        if not ticker_id:
            return pd.DataFrame()
            
        query = """
            SELECT 
                ex_date, payment_date, record_date, announcement_date,
                dividend_amount, dividend_type, payment_frequency,
                adjustment_factor, currency, source
            FROM dividends
            WHERE ticker_id = ?
        """
        params = [ticker_id]
        
        if start_date:
            query += " AND ex_date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND ex_date <= ?"
            params.append(end_date)
            
        query += " ORDER BY ex_date DESC"
        
        return pd.read_sql_query(query, self.conn, params=params, parse_dates=['ex_date', 'payment_date'])
        
    def get_dividend_yield(self, symbol: str) -> Optional[Dict]:
        """
        Get current dividend yield for a ticker.
        
        Args:
            symbol: Stock ticker symbol
            
        Returns:
            Dictionary with yield information or None
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM v_dividend_yields WHERE symbol = ?
        """, (symbol,))
        
        result = cursor.fetchone()
        if result:
            return dict(result)
        return None
        
    def get_total_returns(self, symbol: str, start_date: date, end_date: date) -> pd.DataFrame:
        """
        Get total returns (price + dividends) for a ticker.
        
        Args:
            symbol: Stock ticker symbol
            start_date: Start date for returns
            end_date: End date for returns
            
        Returns:
            DataFrame with daily total returns
        """
        query = """
            SELECT 
                date, close, adj_close, dividend,
                daily_total_return_pct, daily_price_return_pct, 
                daily_dividend_return_pct
            FROM v_total_returns
            WHERE symbol = ? AND date >= ? AND date <= ?
            ORDER BY date
        """
        
        return pd.read_sql_query(
            query, self.conn, 
            params=(symbol, start_date, end_date),
            parse_dates=['date']
        )
        
    def update_dividend_cache_range(self, symbol: str, start_date: date, 
                                  end_date: date, source: str):
        """
        Update the dividend cache range for a ticker.
        
        Args:
            symbol: Stock ticker symbol
            start_date: Start date of cached range
            end_date: End date of cached range
            source: Data source
        """
        ticker_id = self.get_ticker_id(symbol)
        if not ticker_id:
            raise ValueError(f"Ticker {symbol} not found in database")
            
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO dividend_cache_ranges (ticker_id, start_date, end_date, source)
            VALUES (?, ?, ?, ?)
        """, (ticker_id, start_date, end_date, source))
        self.conn.commit()
        
    def get_dividend_growth(self, symbol: str, years: int = 5) -> pd.DataFrame:
        """
        Get dividend growth history for a ticker.
        
        Args:
            symbol: Stock ticker symbol
            years: Number of years of history
            
        Returns:
            DataFrame with annual dividend growth rates
        """
        query = """
            SELECT year, annual_dividends, yoy_growth_pct
            FROM v_dividend_growth
            WHERE symbol = ? 
            AND CAST(year AS INTEGER) >= CAST(strftime('%Y', 'now') AS INTEGER) - ?
            ORDER BY year DESC
        """
        
        return pd.read_sql_query(query, self.conn, params=(symbol, years))
        
    def add_corporate_action(self, symbol: str, action_type: str, ex_date: date,
                           ratio_from: Optional[float] = None, ratio_to: Optional[float] = None,
                           description: Optional[str] = None, source: Optional[str] = None):
        """
        Add a corporate action record.
        
        Args:
            symbol: Stock ticker symbol
            action_type: Type of action (split, merger, etc.)
            ex_date: Ex-date of the action
            ratio_from: From ratio (for splits)
            ratio_to: To ratio (for splits)
            description: Description of the action
            source: Data source
        """
        ticker_id = self.get_ticker_id(symbol)
        if not ticker_id:
            raise ValueError(f"Ticker {symbol} not found in database")
            
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO corporate_actions (
                ticker_id, action_type, ex_date, 
                ratio_from, ratio_to, description, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            ticker_id, action_type, ex_date,
            ratio_from, ratio_to, description, source
        ))
        self.conn.commit()
        
    def refresh_dividend_summary(self, symbol: str):
        """
        Refresh the dividend summary cache for a ticker.
        
        Args:
            symbol: Stock ticker symbol
        """
        ticker_id = self.get_ticker_id(symbol)
        if not ticker_id:
            return
            
        cursor = self.conn.cursor()
        
        # Delete existing summary
        cursor.execute("DELETE FROM dividend_summary WHERE ticker_id = ?", (ticker_id,))
        
        # Calculate and insert new summary
        cursor.execute("""
            INSERT INTO dividend_summary (
                ticker_id, ttm_dividends, ttm_yield_pct, ttm_dividend_count,
                latest_dividend_amount, latest_ex_date, latest_payment_date
            )
            SELECT 
                t.id,
                (SELECT SUM(dividend_amount * adjustment_factor) 
                 FROM dividends 
                 WHERE ticker_id = t.id AND ex_date >= date('now', '-1 year')),
                (SELECT dividend_yield_pct FROM v_dividend_yields WHERE symbol = t.symbol),
                (SELECT COUNT(*) 
                 FROM dividends 
                 WHERE ticker_id = t.id AND ex_date >= date('now', '-1 year')),
                (SELECT dividend_amount 
                 FROM dividends 
                 WHERE ticker_id = t.id 
                 ORDER BY ex_date DESC LIMIT 1),
                (SELECT ex_date 
                 FROM dividends 
                 WHERE ticker_id = t.id 
                 ORDER BY ex_date DESC LIMIT 1),
                (SELECT payment_date 
                 FROM dividends 
                 WHERE ticker_id = t.id 
                 ORDER BY ex_date DESC LIMIT 1)
            FROM tickers t
            WHERE t.id = ?
        """, (ticker_id,))
        
        self.conn.commit()


# Example usage
if __name__ == "__main__":
    # Example of how to use with existing SQLiteStockDataCache
    with DividendCacheExtension("etf_research.db") as div_cache:
        # Add a dividend
        div_cache.add_dividend(
            symbol="VTI",
            ex_date=date(2024, 12, 20),
            amount=1.05,
            payment_date=date(2024, 12, 27),
            payment_frequency="quarterly",
            source="yahoo_finance"
        )
        
        # Get dividend history
        dividends = div_cache.get_dividends("VTI", start_date=date(2024, 1, 1))
        print("Dividend History:")
        print(dividends)
        
        # Get dividend yield
        yield_info = div_cache.get_dividend_yield("VTI")
        if yield_info:
            print(f"\nCurrent Yield: {yield_info['dividend_yield_pct']:.2f}%")
        
        # Get total returns
        returns = div_cache.get_total_returns(
            "VTI", 
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31)
        )
        print("\nTotal Returns:")
        print(returns.head())
        
        # Add a stock split
        div_cache.add_corporate_action(
            symbol="AAPL",
            action_type="split",
            ex_date=date(2024, 6, 10),
            ratio_from=1,
            ratio_to=4,
            description="4-for-1 stock split"
        )