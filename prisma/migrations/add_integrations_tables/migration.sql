-- CreateTable WalletLink
CREATE TABLE "WalletLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletLink_userId_chain_address_key" ON "WalletLink"("userId", "chain", "address");

-- CreateIndex
CREATE INDEX "WalletLink_userId_idx" ON "WalletLink"("userId");

-- CreateIndex
CREATE INDEX "WalletLink_chain_idx" ON "WalletLink"("chain");

-- CreateTable ExternalPositionsRaw
CREATE TABLE "ExternalPositionsRaw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ExternalPositionsRaw_userId_idx" ON "ExternalPositionsRaw"("userId");

-- CreateIndex
CREATE INDEX "ExternalPositionsRaw_source_idx" ON "ExternalPositionsRaw"("source");

-- CreateIndex
CREATE INDEX "ExternalPositionsRaw_fetchedAt_idx" ON "ExternalPositionsRaw"("fetchedAt");

-- CreateTable ExternalMarkets
CREATE TABLE "ExternalMarkets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT NOT NULL,
    "outcome" TEXT,
    "size" REAL NOT NULL,
    "avgPrice" REAL NOT NULL,
    "currentValue" REAL NOT NULL,
    "pnl" REAL NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "asOf" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ExternalMarkets_userId_source_marketId_asOf_key" ON "ExternalMarkets"("userId", "source", "marketId", "asOf");

-- CreateIndex
CREATE INDEX "ExternalMarkets_userId_idx" ON "ExternalMarkets"("userId");

-- CreateIndex
CREATE INDEX "ExternalMarkets_source_idx" ON "ExternalMarkets"("source");

-- CreateIndex
CREATE INDEX "ExternalMarkets_marketId_idx" ON "ExternalMarkets"("marketId");

-- CreateIndex
CREATE INDEX "ExternalMarkets_resolved_idx" ON "ExternalMarkets"("resolved");

