# Polymarket Integrations Worker - Setup Guide

This guide walks through setting up and using the Polymarket Integrations Worker (Agent 4).

## Quick Start

### 1. Run Prisma Migration

Apply the new schema to your database:

```bash
npm run prisma:migrate
```

This will:
- Create `wallet_links` table (links users to blockchain wallets)
- Create `external_positions_raw` table (raw Polymarket API snapshots)
- Create `external_markets` table (normalized position data)

### 2. Add Wallet Links

Insert wallet addresses for your users into the `wallet_links` table:

```sql
INSERT INTO wallet_links (id, user_id, chain, address)
VALUES 
  ('wl_1', 'user_123', 'ethereum', '0x742d35Cc6634C0532925a3b844Bc9e7595f42438'),
  ('wl_2', 'user_456', 'ethereum', '0x1234567890123456789012345678901234567890');
```

Or via Prisma in your app:

```typescript
import { prisma } from '@/lib/db';

await prisma.walletLink.create({
  data: {
    userId: 'user_123',
    chain: 'ethereum',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42438',
  },
});
```

### 3. Run the Worker

**One-time sync:**

```bash
npm run integrations:run
```

**Example output:**

```
══════════════════════════════════════════
📊 Polymarket Integrations Worker
══════════════════════════════════════════

[15:30:22] ℹ️  IntegrationsWorker: Starting sync for: 2025-01-10
[15:30:22] ℹ️  IntegrationsWorker: Found 2 wallet links for 2 user(s)

══════════════════════════════════════════
📊 Processing 2 user(s)
══════════════════════════════════════════

──────────────────────────────────
  Processing user: user_123
──────────────────────────────────
[15:30:23] ℹ️  Polymarket: Fetching positions for wallet: 0x742d...
[15:30:24] ✅ Polymarket: Fetched 5 positions for 0x742d...
[15:30:24] ✅ Polymarket: Fetched portfolio value for 0x742d...
[15:30:24] ✅ Polymarket: Fetched metadata for 8 markets
[15:30:24] ✅ Polymarket: Built lookup for 8 markets
[15:30:24] ✅ Polymarket: Sync completed for 0x742d...: 5 markets in 1205ms
[15:30:24] ✅ Polymarket: Saved raw positions payload (1 wallet(s))
[15:30:25] ✅ Polymarket: Upserted 5 normalized market(s)
[15:30:25] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 5 market(s), 1456ms

──────────────────────────────────
  Processing user: user_456
──────────────────────────────────
[15:30:25] ℹ️  Polymarket: Fetching positions for wallet: 0x123...
[15:30:26] ✅ Polymarket: Fetched 3 positions for 0x123...
[15:30:26] ✅ Polymarket: Fetched portfolio value for 0x123...
[15:30:26] ✅ Polymarket: Fetched metadata for 8 markets
[15:30:26] ✅ Polymarket: Built lookup for 8 markets
[15:30:26] ✅ Polymarket: Sync completed for 0x123...: 3 markets in 892ms
[15:30:26] ✅ Polymarket: Saved raw positions payload (1 wallet(s))
[15:30:26] ✅ Polymarket: Upserted 3 normalized market(s)
[15:30:26] ✅ IntegrationsWorker: User sync complete: 1 wallet(s), 3 market(s), 1124ms

══════════════════════════════════════════
📊 Sync Summary
══════════════════════════════════════════

  👥 Users: 2 succeeded, 0 failed
  📊 Markets: 8 total processed
  ⏱️  Duration: 3897ms (3.90s)

✅ IntegrationsWorker: All users synced successfully!
```

## Scheduling

### Option 1: Cron Job (Linux/MacOS)

Add to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM UTC
0 2 * * * cd /path/to/wm && npm run integrations:run >> /var/log/wm-integrations.log 2>&1
```

### Option 2: PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'integrations-worker',
      script: 'npm',
      args: 'run integrations:run',
      cron_time: '0 2 * * *',  // Daily at 2 AM UTC
      max_memory_restart: '500M',
      error_file: './logs/integrations-error.log',
      out_file: './logs/integrations-out.log',
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
pm2 save
```

### Option 3: Docker Cron

In your Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Install cron
RUN apk add --no-cache dcron

# Add cron job
RUN echo "0 2 * * * cd /app && npm run integrations:run" | crontab -

# Start crond in foreground
CMD ["crond", "-f", "-l", "2"]
```

### Option 4: GitHub Actions

Create `.github/workflows/integrations.yml`:

```yaml
name: Polymarket Integrations Sync

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integrations worker
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run integrations:run
      
      - name: Report status
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            console.log('Integrations sync completed');
```

### Option 5: Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: polymarket-integrations
  namespace: default
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM UTC
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: default
          containers:
          - name: worker
            image: myregistry/wm:latest
            imagePullPolicy: Always
            command: ["npm", "run", "integrations:run"]
            env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secrets
                  key: connection-string
            resources:
              requests:
                memory: "256Mi"
                cpu: "100m"
              limits:
                memory: "512Mi"
                cpu: "500m"
          restartPolicy: OnFailure
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
```

## Database Queries

### View Raw Positions for a User

```sql
SELECT 
  id,
  user_id,
  source,
  fetched_at,
  payload
FROM external_positions_raw
WHERE user_id = 'user_123'
ORDER BY fetched_at DESC
LIMIT 10;
```

### View Normalized Markets for a User

```sql
SELECT 
  id,
  user_id,
  market_id,
  title,
  category,
  size,
  avg_price,
  current_value,
  pnl,
  resolved,
  as_of,
  updated_at
FROM external_markets
WHERE user_id = 'user_123'
  AND resolved = false
ORDER BY as_of DESC;
```

### Top Performing Markets

```sql
SELECT 
  market_id,
  title,
  COUNT(*) as num_positions,
  AVG(pnl) as avg_pnl,
  MAX(current_value) as max_value,
  MAX(updated_at) as last_updated
FROM external_markets
WHERE resolved = false
GROUP BY market_id, title
ORDER BY avg_pnl DESC
LIMIT 10;
```

### Portfolio Summary by User

```sql
SELECT 
  user_id,
  COUNT(DISTINCT market_id) as num_markets,
  SUM(current_value) as total_value,
  SUM(pnl) as total_pnl,
  MAX(as_of) as last_sync
FROM external_markets
WHERE resolved = false
GROUP BY user_id
ORDER BY total_pnl DESC;
```

## Monitoring

### Check Sync Status

```bash
# View last 5 syncs
sqlite3 dev.db "SELECT user_id, COUNT(*) as markets, MAX(fetched_at) as last_sync FROM external_positions_raw GROUP BY user_id ORDER BY last_sync DESC LIMIT 5;"
```

### Monitor Performance

Add to your logging system:

```javascript
// Example: Prometheus metrics
const syncMetrics = {
  users_processed: 2,
  markets_processed: 8,
  sync_duration_ms: 3897,
  errors: 0,
};
```

## Troubleshooting

### No wallet links found

**Problem:** Worker exits with "No wallet links found"

**Solution:** Add wallet links to database:

```sql
INSERT INTO wallet_links (id, user_id, chain, address)
VALUES ('wl_1', 'user_123', 'ethereum', '0x...');
```

### Failed to fetch positions

**Problem:** `Failed to fetch positions for 0x...`

**Solution:**
- Check wallet address is correct and on-chain
- Verify Polymarket Data API is accessible: `curl https://data-api.polymarket.com/positions?address=0x...`
- Check network connectivity and firewall rules

### Already synced today, skipping

**Problem:** Worker skips processing even on first run

**Solution:**
- This is idempotent behavior (working as designed)
- To force re-sync, delete today's records: `DELETE FROM external_positions_raw WHERE user_id = 'user_123' AND strftime('%Y-%m-%d', fetched_at) = date('now');`

### Type checking errors

**Problem:** `tsc` reports type errors

**Solution:**
```bash
npm run integrations:typecheck
```

## Integration with Web App

### Query Recent Markets

```typescript
// In your Next.js API route or component
import { prisma } from '@/lib/db';

export async function getUserMarkets(userId: string) {
  const markets = await prisma.externalMarkets.findMany({
    where: {
      userId,
      resolved: false,
    },
    orderBy: {
      asOf: 'desc',
    },
    take: 20,
  });

  return markets.map(m => ({
    ...m,
    tags: JSON.parse(m.tags),
  }));
}
```

### Display in Dashboard

```typescript
import { getUserMarkets } from '@/lib/external-markets';

export default async function Dashboard() {
  const markets = await getUserMarkets(userId);

  return (
    <div>
      <h2>Polymarket Positions</h2>
      <table>
        <thead>
          <tr>
            <th>Market</th>
            <th>Size</th>
            <th>P&L</th>
            <th>Current Value</th>
          </tr>
        </thead>
        <tbody>
          {markets.map(m => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{m.size}</td>
              <td className={m.pnl >= 0 ? 'positive' : 'negative'}>
                {m.pnl.toFixed(2)}
              </td>
              <td>{m.currentValue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Performance Considerations

- **Sync time:** ~1-2 seconds per wallet
- **API calls:** ~3 per wallet (positions, value, markets)
- **Database writes:** Atomic transactions prevent partial updates
- **Deduplication:** Once per (user, source, day) to reduce API load

For large deployments:
1. Consider batch API requests
2. Cache market metadata (refresh hourly)
3. Run workers in parallel with multiple instances
4. Monitor database connection pool

## Next Steps

1. ✅ Add wallet links to database
2. ✅ Run `npm run integrations:run` to test
3. ✅ Set up cron/scheduler of choice
4. ✅ Add to dashboard to display positions
5. ✅ Configure monitoring and alerting
6. 🔜 Add real-time WebSocket support (future enhancement)

## Support

For issues or questions:
- Check `/worker-integrations/README.md` for architecture details
- Review logs in `logs/integrations.log`
- Open an issue on GitHub

---

**Agent 4 Status:** ✅ Ready for Production

