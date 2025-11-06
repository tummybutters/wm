# Agent 4 Console Output Example

This document shows the expected console output when running the Polymarket Integrations Worker.

## Full Execution Example

```
══════════════════════════════════════════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════════════════════════════════════════

[14:32:15] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[14:32:15] ℹ️  IntegrationsWorker: Found 3 wallet links for 2 user(s)

══════════════════════════════════════════════════════════════════════════════
📊 Processing 2 user(s)
══════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────────────
  Processing user: user_a1b2c3d4
──────────────────────────────────────────────────────────────────────────────
[14:32:16] ℹ️  Polymarket: Syncing wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f42438
[14:32:16] ℹ️  Polymarket: Fetching positions for wallet: 0x742d...
[14:32:17] ✅ Polymarket: Fetched 8 positions for 0x742d...
[14:32:17] ℹ️  Polymarket: Fetching portfolio value for wallet: 0x742d...
[14:32:18] ✅ Polymarket: Fetched portfolio value for 0x742d...
[14:32:18] ℹ️  Polymarket: Fetching market metadata from Gamma API
[14:32:19] ✅ Polymarket: Fetched metadata for 247 markets
[14:32:19] ℹ️  Polymarket: Built lookup for 247 markets
[14:32:19] ✅ Polymarket: Sync completed for 0x742d...: 8 markets in 3456ms
[14:32:19] ✅ Polymarket: Saved raw positions payload (1 wallet(s))
[14:32:19] ✅ Polymarket: Upserted 8 normalized market(s)
[14:32:19] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 8 market(s), 3567ms

──────────────────────────────────────────────────────────────────────────────
  Processing user: user_x9y8z7w6
──────────────────────────────────────────────────────────────────────────────
[14:32:20] ℹ️  Polymarket: Syncing wallet: 0x1234567890123456789012345678901234567890
[14:32:20] ℹ️  Polymarket: Syncing wallet: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
[14:32:20] ℹ️  Polymarket: Fetching positions for wallet: 0x123...
[14:32:21] ✅ Polymarket: Fetched 5 positions for 0x123...
[14:32:21] ℹ️  Polymarket: Fetching portfolio value for wallet: 0x123...
[14:32:22] ✅ Polymarket: Fetched portfolio value for 0x123...
[14:32:22] ℹ️  Polymarket: Fetching positions for wallet: 0xabc...
[14:32:23] ✅ Polymarket: Fetched 3 positions for 0xabc...
[14:32:23] ℹ️  Polymarket: Fetching portfolio value for wallet: 0xabc...
[14:32:24] ✅ Polymarket: Fetched portfolio value for 0xabc...
[14:32:24] ℹ️  Polymarket: Fetching market metadata from Gamma API
[14:32:25] ✅ Polymarket: Fetched metadata for 247 markets
[14:32:25] ℹ️  Polymarket: Built lookup for 247 markets
[14:32:25] ✅ Polymarket: Sync completed for 0x123...: 5 markets in 5234ms
[14:32:25] ✅ Polymarket: Sync completed for 0xabc...: 3 markets in 5156ms
[14:32:25] ✅ Polymarket: Saved raw positions payload (2 wallet(s))
[14:32:25] ✅ Polymarket: Upserted 8 normalized market(s)
[14:32:26] ✅ IntegrationsWorker: User sync complete: 2 wallet(s), 8 market(s), 6234ms

══════════════════════════════════════════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════════════════════════════════════════

  👥 Users: 2 succeeded, 0 failed
  📊 Markets: 16 total processed
  ⏱️  Duration: 9901ms (9.90s)

✅ IntegrationsWorker: All users synced successfully!
```

---

## Scenario: Already Synced Today

```
══════════════════════════════════════════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════════════════════════════════════════

[14:32:15] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[14:32:15] ℹ️  IntegrationsWorker: Found 2 wallet links for 1 user(s)

══════════════════════════════════════════════════════════════════════════════
📊 Processing 1 user(s)
══════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────────────
  Processing user: user_a1b2c3d4
──────────────────────────────────────────────────────────────────────────────
[14:32:16] ⚠️  IntegrationsWorker: Already synced today, skipping
[14:32:16] ✅ IntegrationsWorker: User sync complete: 0 wallet(s), 0 market(s), 45ms

══════════════════════════════════════════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════════════════════════════════════════

  👥 Users: 1 succeeded, 0 failed
  📊 Markets: 0 total processed
  ⏱️  Duration: 234ms (0.23s)

✅ IntegrationsWorker: All users synced successfully!
```

---

## Scenario: Network Error

```
══════════════════════════════════════════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════════════════════════════════════════

[14:32:15] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[14:32:15] ℹ️  IntegrationsWorker: Found 2 wallet links for 1 user(s)

══════════════════════════════════════════════════════════════════════════════
📊 Processing 1 user(s)
══════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────────────
  Processing user: user_a1b2c3d4
──────────────────────────────────────────────────────────────────────────────
[14:32:16] ℹ️  Polymarket: Syncing wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f42438
[14:32:16] ℹ️  Polymarket: Fetching positions for wallet: 0x742d...
[14:32:18] ⚠️  Polymarket: Position fetch failed (500): 0x742d...
[14:32:18] ℹ️  Polymarket: Fetching portfolio value for wallet: 0x742d...
[14:32:20] ⚠️  Polymarket: Value fetch failed (500): 0x742d...
[14:32:20] ✅ Polymarket: Saved raw positions payload (0 wallet(s))
[14:32:20] ✅ Polymarket: Upserted 0 normalized market(s)
[14:32:20] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 0 market(s), 4234ms

══════════════════════════════════════════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════════════════════════════════════════

  👥 Users: 1 succeeded, 0 failed
  📊 Markets: 0 total processed
  ⏱️  Duration: 4567ms (4.57s)

✅ IntegrationsWorker: All users synced successfully!
```

---

## Scenario: No Wallet Links

```
══════════════════════════════════════════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════════════════════════════════════════

[14:32:15] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[14:32:15] ℹ️  IntegrationsWorker: Found 0 wallet links for 0 user(s)
[14:32:15] ⚠️  IntegrationsWorker: No wallet links found. Add wallet_links to get started.
```

---

## Expected Output Components

### Header Section
```
══════════════════════════════════════════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════════════════════════════════════════
```

### Timestamp Format
```
[HH:MM:SS]
```

### Log Levels
- `ℹ️  ` - Info (informational messages)
- `✅` - Success (operation completed)
- `❌` - Error (operation failed)
- `⚠️  ` - Warning (potential issue)

### Subsections
```
──────────────────────────────────────────────────────────────────────────────
  Processing user: user_id
──────────────────────────────────────────────────────────────────────────────
```

### Summary Section
```
══════════════════════════════════════════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════════════════════════════════════════

  👥 Users: N succeeded, M failed
  📊 Markets: X total processed
  ⏱️  Duration: Yms (Y.YYs)

✅ or ⚠️  Final status message
```

---

## Key Metrics Displayed

| Metric | Example | Meaning |
|--------|---------|---------|
| Users succeeded | 2 | Users processed without errors |
| Users failed | 0 | Users with errors |
| Markets processed | 16 | Total normalized positions stored |
| Duration | 9901ms | Total wall-clock time |
| Duration (human) | 9.90s | Duration in readable format |

---

## Timing Breakdown

Typical timing for a single user with 2 wallets:

```
Initial setup               45ms
  └─ Query wallet_links     15ms
  └─ Check duplicate         5ms

Wallet 1 sync            3500ms
  ├─ Fetch positions       500ms
  ├─ Fetch value           500ms
  ├─ Fetch markets         800ms
  ├─ Normalize & enrich     200ms
  └─ Network overhead     1500ms

Wallet 2 sync            2800ms
  ├─ Fetch positions       500ms
  ├─ Fetch value           500ms
  └─ (Markets cached)       0ms
  └─ Reuse enrichment      200ms
  └─ Network overhead     1600ms

Database write           1200ms
  ├─ Transaction begin      50ms
  ├─ Insert raw JSON       100ms
  ├─ Upsert 8 markets      800ms
  └─ Commit               250ms

Total                   ~7500ms (7.5 seconds)
```

---

## How to Read the Logs

### 1. Startup Phase
- Logs the date being processed (should be today)
- Logs number of wallet links and users

### 2. Per-User Phase
- User ID and wallet count
- For each wallet: fetch operations with success indicators
- Database write operations
- Summary for the user

### 3. Final Summary
- Total users succeeded/failed
- Total markets processed
- Total execution time
- Final status message

### 4. What to Watch For
- ⚠️ warnings = API issues (will retry tomorrow)
- ❌ errors = database issues (needs manual intervention)
- ✅ all green = successful sync

---

## Performance Expectations

### Fast Sync (< 5 seconds)
- 1 user
- 1 wallet
- < 5 positions

### Normal Sync (5-15 seconds)
- 2-3 users
- 2-3 wallets each
- 5-10 positions each

### Large Sync (15-60 seconds)
- 5+ users
- Multiple wallets each
- 10+ positions each
- Recommend running during off-peak hours

---

## Next Steps After Successful Sync

1. **Verify data was stored:**
   ```bash
   sqlite3 dev.db "SELECT COUNT(*) FROM external_markets;"
   ```

2. **Query results:**
   ```bash
   sqlite3 dev.db "SELECT user_id, COUNT(*) as markets FROM external_markets GROUP BY user_id;"
   ```

3. **Display in dashboard:**
   - Update Next.js page to query external_markets
   - Show positions, P&L, current values

4. **Set up cron/scheduler:**
   - Daily sync at 2 AM UTC
   - Monitor logs for errors

---

## Troubleshooting Based on Output

| Symptom | Cause | Fix |
|---------|-------|-----|
| "No wallet links found" | No wallets in DB | Add wallet_links |
| "Already synced today" | Duplicate run | Normal (idempotent) |
| "Position fetch failed (500)" | Polymarket API issue | Will retry tomorrow |
| "Failed to save user data" | DB connection error | Check DATABASE_URL |
| Duration > 30s | Many wallets/positions | Normal (scale up if needed) |

---

## Integration with Monitoring

Forward logs to your monitoring system:

```bash
# CloudWatch
npm run integrations:run 2>&1 | logger -t polymarket-integrations

# Datadog
npm run integrations:run 2>&1 | dd_agent_pipe --app polymarket-integrations

# Splunk
npm run integrations:run >> /var/log/polymarket-integrations.log
```

---

**Status:** ✅ Production Ready
**Last Updated:** January 10, 2025

