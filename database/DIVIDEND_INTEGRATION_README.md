# Dividend Integration for ETF Research Platform

## Overview

This integration adds comprehensive dividend tracking and total return calculations to the existing ETF Research Platform database. The design maintains full compatibility with the existing `SQLiteStockDataCache` class and caching strategy.

## Schema Design Principles

1. **Foreign Key Integrity**: All dividend tables reference `tickers.id` instead of storing symbols directly
2. **Consistent Caching**: Dividend cache ranges mirror the existing `cache_ranges` pattern
3. **Adjustment Handling**: Corporate actions automatically update historical dividends
4. **Performance Optimization**: Strategic indexes and materialized views for common queries

## Database Schema Changes

### New Tables

1. **dividends** - Core dividend data
   - Links to `tickers` table via `ticker_id`
   - Tracks ex-date, payment date, amount, type, and frequency
   - Includes adjustment factor for splits

2. **dividend_cache_ranges** - Tracks cached dividend data ranges
   - Mirrors the design of existing `cache_ranges` table
   - Enables efficient cache management

3. **corporate_actions** - Stock splits, mergers, spinoffs
   - Automatically adjusts historical dividends via triggers
   - Links to affected tickers

4. **dividend_summary** - Materialized view for performance
   - Pre-calculated TTM yields, growth rates
   - Refreshed on-demand or via triggers

### New Views

1. **v_stock_data_with_dividends** - Joins stock data with dividends
2. **v_total_returns** - Calculates daily total returns (price + dividends)
3. **v_dividend_yields** - Current dividend yields (TTM)
4. **v_dividend_growth** - Year-over-year dividend growth rates
5. **v_ticker_complete_returns** - Complete return data with corporate actions

## Integration with Existing Code

### Using with SQLiteStockDataCache

```python
from database.dividend_cache_integration import DividendCacheExtension
from existing_module import SQLiteStockDataCache

# Use existing cache for price data
stock_cache = SQLiteStockDataCache("etf_research.db")
stock_data = stock_cache.get_data("VTI", start_date, end_date)

# Use dividend extension for dividend data
with DividendCacheExtension("etf_research.db") as div_cache:
    dividends = div_cache.get_dividends("VTI", start_date, end_date)
    total_returns = div_cache.get_total_returns("VTI", start_date, end_date)
```

### Key Integration Points

1. **Ticker Management**: Both systems use the same `tickers` table
2. **Date Alignment**: Dividends align with stock data on ex-dates
3. **Adjustment Coordination**: `adj_close` in stock_data works with dividend adjustments
4. **Cache Consistency**: Both use similar caching patterns

## Migration Process

### Apply Migration

```bash
sqlite3 etf_research.db < database/migrations/001_add_dividend_support.sql
```

### Rollback (if needed)

```bash
sqlite3 etf_research.db < database/migrations/001_rollback_dividend_support.sql
```

### Verify Installation

```sql
-- Check if all objects were created
SELECT type, name FROM sqlite_master 
WHERE name LIKE '%dividend%' OR name LIKE '%corporate_action%'
ORDER BY type, name;
```

## Total Return Calculations

The integration provides accurate total return calculations:

1. **Price Return**: Based on adjusted close prices
2. **Dividend Return**: Dividends received / previous day's price
3. **Total Return**: Price return + dividend return

### Example Query

```sql
-- Get total returns for a ticker
SELECT * FROM v_total_returns 
WHERE symbol = 'VTI' 
AND date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY date;
```

## Performance Considerations

1. **Indexes**: All foreign keys and common query patterns are indexed
2. **Materialized Views**: `dividend_summary` table for fast lookups
3. **Triggers**: Automatic updates maintain data consistency
4. **Batch Operations**: Support for bulk dividend imports

## API Compatibility

The dividend tables include a `source` column compatible with the existing API tracking:

- Yahoo Finance dividends
- Alpha Vantage dividends
- Manual imports
- Other data providers

## Data Quality Features

1. **Adjustment Tracking**: All dividend adjustments are logged
2. **Corporate Actions**: Automatic application to historical data
3. **Unique Constraints**: Prevent duplicate dividends
4. **Data Validation**: Check constraints on types and frequencies

## Example Workflows

### Adding Dividends for a Ticker

```python
with DividendCacheExtension("etf_research.db") as div_cache:
    # Add quarterly dividend
    div_cache.add_dividend(
        symbol="VTI",
        ex_date=date(2024, 12, 20),
        amount=1.05,
        payment_date=date(2024, 12, 27),
        payment_frequency="quarterly",
        source="yahoo_finance"
    )
    
    # Update cache range
    div_cache.update_dividend_cache_range(
        symbol="VTI",
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31),
        source="yahoo_finance"
    )
```

### Handling Stock Splits

```python
# Add a 2:1 stock split
div_cache.add_corporate_action(
    symbol="AAPL",
    action_type="split",
    ex_date=date(2024, 6, 10),
    ratio_from=1,
    ratio_to=2,
    description="2-for-1 stock split"
)
# Historical dividends are automatically adjusted
```

### Calculating Yields

```python
# Get current yield
yield_info = div_cache.get_dividend_yield("VTI")
print(f"TTM Yield: {yield_info['dividend_yield_pct']:.2f}%")

# Get growth rates
growth = div_cache.get_dividend_growth("VTI", years=5)
```

## Maintenance

1. **Refresh Summary Cache**: Run `refresh_dividend_summary()` periodically
2. **Monitor Cache Ranges**: Check for gaps in dividend data coverage
3. **Validate Adjustments**: Verify corporate actions applied correctly
4. **Clean Old Data**: Archive old dividend forecasts

## Future Enhancements

1. **Dividend Forecasting**: Use historical patterns for estimates
2. **Tax Reporting**: Track qualified vs non-qualified dividends
3. **ETF Distributions**: Detailed breakdown by income type
4. **API Integration**: Direct dividend data fetching
5. **Backtesting**: Support for dividend reinvestment calculations