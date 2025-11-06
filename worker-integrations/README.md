# Polymarket Integrations Worker

Production-ready data ingestion pipeline that pulls user prediction data from Polymarket's public APIs, normalizes it, and stores both raw and structured copies in Postgres (Supabase).

## Overview

This worker is part of the WM system's Agent 4 and handles external integrations with Polymarket. It:

1. **Fetches** wallet positions and portfolio values from Polymarket Data API
2. **Enriches** position data with market metadata from Gamma API
3. **Normalizes** raw API responses into structured market data
4. **Stores** both raw JSON snapshots and normalized records in Postgres
5. **Deduplicates** by skipping runs that already happened today for each user
6. **Logs** all operations with user, wallet, market, and timing data

## Architecture

```
┌─────────────────────────────────────────┐
│  Polymarket Integrations Worker         │
├─────────────────────────────────────────┤
│                                         │
│  1. Read wallet_links table             │
│     Group by user_id                    │
│                                         │
│  2. For each user:                      │
│     └─ For each wallet:                 │
│        ├─ Fetch /positions              │
│        ├─ Fetch /value                  │
│        └─ Fetch /markets (Gamma)        │
│                                         │
│  3. Normalize positions                 │
│     ├─ Extract outcome & sizing         │
│     ├─ Calculate P&L                    │
│     └─ Enrich with market metadata      │
│                                         │
│  4. Atomic write to DB:                 │
│     ├─ Save raw JSON snapshot           │
│     └─ Upsert normalized markets        │
│                                         │
│  5. Skip if already synced today        │
│     (user_id + source + day)            │
│                                         │
└─────────────────────────────────────────┘
```

## Data Tables

### `wallet_links`

Links user IDs to blockchain wallets:

```sql
user_id     | chain      | address                                    | created_at
─────────────────────────────────────────────────────────────────────────────
user_123    | ethereum   | 0xabc...                                   | 2025-01-01
user_123    | polygon    | 0xdef...                                   | 2025-01-02
user_456    | ethereum   | 0x789...                                   | 2025-01-03
```

### `external_positions_raw`

Raw JSON snapshots of position data:

```
id       | user_id  | source     | payload                    | fetched_at
─────────────────────────────────────────────────────────────────────────
raw_001  | user_123 | polymarket | { "positions": [...] }    | 2025-01-10
raw_002  | user_456 | polymarket | { "positions": [...] }    | 2025-01-10
```

### `external_markets`

Normalized, structured market positions:

```
id    | user_id  | source     | market_id | title              | size | avg_price | current_value | pnl  | resolved | as_of
──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
m_001 | user_123 | polymarket | pm_1234   | Will Trump win?    | 1.0  | 0.65      | 0.70          | 0.05 | false    | 2025-01-10
m_002 | user_123 | polymarket | pm_5678   | BTC over $100k?    | 2.5  | 0.42      | 0.45          | 0.08 | false    | 2025-01-10
m_003 | user_456 | polymarket | pm_1234   | Will Trump win?    | 0.5  | 0.60      | 0.70          | 0.05 | false    | 2025-01-10
```

## APIs Used

### Polymarket Data API

Base: `https://data-api.polymarket.com`

- **GET /positions?address=`<wallet>`** - Fetch all open positions for a wallet
  ```json
  {
    "user_address": "0xabc...",
    "positions": [
      {
        "market": {
          "id": "pm_1234",
          "question": "Will Trump win?",
          "category": "politics",
          "tags": ["2024", "election"],
          "outcomes": ["Yes", "No"],
          "resolved": false
        },
        "contracts": [
          {
            "id": "contract_123",
            "outcome": "Yes",
            "isResolved": false
          }
        ]
      }
    ]
  }
  ```

- **GET /value?address=`<wallet>`** - Fetch portfolio value snapshot
  ```json
  {
    "user_address": "0xabc...",
    "value": {
      "in": 10000,
      "out": 12500,
      "unrealized": 2500
    }
  }
  ```

### Polymarket Gamma API

Base: `https://gamma-api.polymarket.com`

- **GET /markets** - Fetch market metadata
  ```json
  [
    {
      "id": "pm_1234",
      "question": "Will Trump win 2024 election?",
      "category": "politics",
      "tags": ["2024", "election", "us"],
      "outcomes": ["Yes", "No"],
      "resolved": false
    }
  ]
  ```

## Installation

### 1. Install dependencies

```bash
cd worker-integrations
npm install
```

### 2. Configure environment

Ensure your `.env` file includes Postgres connection:

```env
# From root .env
DATABASE_URL=postgresql://user:pass@db.supabase.com:5432/postgres
```

### 3. Add wallet links to database

```sql
INSERT INTO wallet_links (user_id, chain, address)
VALUES 
  ('user_123', 'ethereum', '0xabc123...'),
  ('user_456', 'ethereum', '0xdef456...');
```

## Running

### One-off sync

```bash
npm run start
# or from root:
npm run integrations:run
```

### Output example

```
══════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════

[10:23:45] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[10:23:45] ℹ️  IntegrationsWorker: Found 2 wallet links for 2 user(s)

══════════════════════════════════════════
📊 Processing 2 user(s)
══════════════════════════════════════════

──────────────────────────────────
  Processing user: user_123
──────────────────────────────────
[10:23:46] ℹ️  Polymarket: Fetching positions for wallet: 0xabc...
[10:23:47] ✅ Polymarket: Fetched 3 positions for 0xabc...
[10:23:47] ✅ Polymarket: Saved raw positions payload (1 wallet(s))
[10:23:47] ✅ Polymarket: Upserted 3 normalized market(s)
[10:23:47] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 3 market(s), 1234ms

──────────────────────────────────
  Processing user: user_456
──────────────────────────────────
[10:23:48] ℹ️  Polymarket: Fetching positions for wallet: 0xdef...
[10:23:49] ✅ Polymarket: Fetched 2 positions for 0xdef...
[10:23:49] ✅ Polymarket: Saved raw positions payload (1 wallet(s))
[10:23:49] ✅ Polymarket: Upserted 2 normalized market(s)
[10:23:49] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 2 market(s), 1100ms

══════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════

  👥 Users: 2 succeeded, 0 failed
  📊 Markets: 5 total processed
  ⏱️  Duration: 3500ms (3.50s)

✅ IntegrationsWorker: All users synced successfully!
```

## Cron Setup

### MacOS/Linux

Add to crontab:

```bash
# Run every day at 2 AM UTC
0 2 * * * cd /path/to/wm && npm run integrations:run >> logs/integrations.log 2>&1
```

### Docker

Add to your Docker entrypoint or compose file:

```dockerfile
# Example: Run daily at 2 AM UTC
RUN echo "0 2 * * * cd /app && npm run integrations:run" | crontab -
```

### Kubernetes

Use a CronJob:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: polymarket-integrations
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: worker
            image: myapp:latest
            command: ["npm", "run", "integrations:run"]
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: connection-string
          restartPolicy: OnFailure
```

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Development

### Project structure

```
worker-integrations/
├── index.ts                 # Main orchestration
├── lib/
│   ├── polymarket.ts        # API fetchers + normalizers
│   ├── db.ts                # Prisma client
│   └── log.ts               # Logger utility
├── package.json
├── tsconfig.json
└── README.md
```

### Key functions

**`syncWalletPositions(address)`**

Fetches and normalizes all positions for a single wallet.

```typescript
const { raw, normalized } = await syncWalletPositions('0xabc...');
```

**`normalizePosition(position, valueData)`**

Transforms raw position into structured market record.

```typescript
const market = normalizePosition(rawPosition, portfolioValue);
// Returns: NormalizedMarket with all fields normalized
```

**`enrichMarket(normalized, marketLookup)`**

Adds metadata enrichment from Gamma API.

```typescript
const enriched = enrichMarket(market, lookup);
// Adds title, category, tags, resolved status
```

## Error Handling

The worker handles errors gracefully:

- **Network failures**: Logs warning, skips wallet, continues with others
- **API rate limits**: Retries with exponential backoff (in future)
- **DB transaction failures**: Logs error, rolls back, moves to next user
- **Missing wallet links**: Logs info and exits cleanly

All errors are logged with full context including user_id and wallet address.

## Performance

Typical performance metrics:

- **Per user**: 1-3 seconds (depends on number of wallets and markets)
- **Per wallet**: 200-500ms (API calls + normalization)
- **Full sync**: ~100ms per user (N users in parallel would be ideal)

Current implementation processes users sequentially. For large user bases, consider:

- Parallel processing with `Promise.all()` per user
- Batch API requests with pagination
- Caching market metadata (refresh hourly)

## Monitoring

Add to your logging/monitoring:

```javascript
// Prometheus metrics
integrations_users_processed
integrations_markets_processed
integrations_sync_duration_ms
integrations_errors_total
```

## Future Enhancements

- [ ] Add retry logic with exponential backoff for API failures
- [ ] Implement market metadata caching to reduce API calls
- [ ] Add support for additional sources (Manifold, etc.)
- [ ] Parallel processing for multiple users
- [ ] WebSocket subscriptions for real-time price updates
- [ ] Historical position tracking (track changes over time)
- [ ] Performance indexing on external_markets queries
- [ ] Alert on high P&L swings

## License

Part of the WM system. See root LICENSE.

