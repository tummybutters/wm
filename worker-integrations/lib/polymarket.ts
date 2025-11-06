import fetch from 'node-fetch';
import dayjs from 'dayjs';
import { createLogger } from './log';

const logger = createLogger('Polymarket');

const DATA_API_BASE = 'https://data-api.polymarket.com';
const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

// Types for Polymarket API responses
export interface PositionData {
  market: {
    id: string;
    question: string;
    category: string;
    tags: string[];
    outcomes: string[];
    resolved: boolean;
  };
  contracts: Array<{
    id: string;
    outcome: string;
    isResolved: boolean;
  }>;
}

export interface PositionResponse {
  user_address: string;
  positions: PositionData[];
}

export interface ValueData {
  user_address: string;
  value: {
    in: number;
    out: number;
    unrealized: number;
  };
}

export interface MarketData {
  id: string;
  question: string;
  category: string;
  tags: string[];
  outcomes: string[];
  resolved: boolean;
}

export interface NormalizedMarket {
  marketId: string;
  title: string;
  category: string;
  tags: string[];
  outcome: string | null;
  size: number;
  avgPrice: number;
  currentValue: number;
  pnl: number;
  resolved: boolean;
  asOf: Date;
}

/**
 * Fetch wallet positions from Polymarket Data API
 */
export async function fetchPositions(address: string): Promise<PositionResponse | null> {
  try {
    logger.info(`Fetching positions for wallet: ${address}`);
    
    const url = `${DATA_API_BASE}/positions?address=${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.warn(`Position fetch failed (${response.status}): ${address}`);
      return null;
    }

    const data = (await response.json()) as PositionResponse;
    logger.success(`Fetched ${data.positions?.length || 0} positions for ${address}`);
    
    return data;
  } catch (error) {
    logger.error(`Failed to fetch positions for ${address}`, error);
    return null;
  }
}

/**
 * Fetch wallet portfolio value from Polymarket Data API
 */
export async function fetchValue(address: string): Promise<ValueData | null> {
  try {
    logger.info(`Fetching portfolio value for wallet: ${address}`);
    
    const url = `${DATA_API_BASE}/value?address=${address}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.warn(`Value fetch failed (${response.status}): ${address}`);
      return null;
    }

    const data = (await response.json()) as ValueData;
    logger.success(`Fetched portfolio value for ${address}`);
    
    return data;
  } catch (error) {
    logger.error(`Failed to fetch value for ${address}`, error);
    return null;
  }
}

/**
 * Fetch market metadata from Polymarket Gamma API
 */
export async function fetchMarkets(): Promise<MarketData[]> {
  try {
    logger.info('Fetching market metadata from Gamma API');
    
    const url = `${GAMMA_API_BASE}/markets`;
    const response = await fetch(url);
    
    if (!response.ok) {
      logger.warn(`Market fetch failed (${response.status})`);
      return [];
    }

    const data = (await response.json()) as MarketData[];
    logger.success(`Fetched metadata for ${data.length} markets`);
    
    return data;
  } catch (error) {
    logger.error('Failed to fetch markets', error);
    return [];
  }
}

/**
 * Normalize raw Polymarket position data into structured format
 * 
 * This function enriches position data with:
 * - Market metadata (title, category, tags)
 * - Portfolio metrics (size, price, value, pnl)
 * - Timestamp for point-in-time snapshot
 */
export function normalizePosition(
  position: PositionData,
  valueData: ValueData | null,
): NormalizedMarket {
  // Extract outcome from first contract if available
  const outcome = position.contracts?.[0]?.outcome || null;

  // Calculate notional values (simplified; in production, would use actual price data)
  // For now, using placeholder logic - would integrate with actual price feeds
  const size = 1; // Placeholder: would calculate from holdings
  const avgPrice = 0.5; // Placeholder
  const currentValue = valueData?.value?.out || 0;
  const pnl = (valueData?.value?.unrealized || 0);

  return {
    marketId: position.market.id,
    title: position.market.question,
    category: position.market.category,
    tags: position.market.tags || [],
    outcome,
    size,
    avgPrice,
    currentValue,
    pnl,
    resolved: position.market.resolved,
    asOf: dayjs().toDate(),
  };
}

/**
 * Build market lookup for enrichment
 */
export function buildMarketLookup(markets: MarketData[]): Map<string, MarketData> {
  const lookup = new Map<string, MarketData>();
  
  for (const market of markets) {
    lookup.set(market.id, market);
  }
  
  logger.info(`Built lookup for ${lookup.size} markets`);
  return lookup;
}

/**
 * Enrich normalized markets with additional metadata
 */
export function enrichMarket(
  normalized: NormalizedMarket,
  marketLookup: Map<string, MarketData>,
): NormalizedMarket {
  const metadata = marketLookup.get(normalized.marketId);
  
  if (metadata) {
    return {
      ...normalized,
      title: metadata.question,
      category: metadata.category,
      tags: metadata.tags || [],
      resolved: metadata.resolved,
    };
  }
  
  return normalized;
}

/**
 * Fetch and normalize all positions for a wallet
 */
export async function syncWalletPositions(
  address: string,
): Promise<{ raw: PositionResponse | null; normalized: NormalizedMarket[] }> {
  const startTime = Date.now();

  // Fetch raw data
  const positionData = await fetchPositions(address);
  const valueData = await fetchValue(address);
  
  if (!positionData) {
    return { raw: null, normalized: [] };
  }

  // Fetch market metadata for enrichment
  const markets = await fetchMarkets();
  const marketLookup = buildMarketLookup(markets);

  // Normalize positions
  const normalized: NormalizedMarket[] = [];
  
  if (positionData.positions && Array.isArray(positionData.positions)) {
    for (const position of positionData.positions) {
      const norm = normalizePosition(position, valueData);
      const enriched = enrichMarket(norm, marketLookup);
      normalized.push(enriched);
    }
  }

  const duration = Date.now() - startTime;
  logger.success(
    `Sync completed for ${address}: ${normalized.length} markets in ${duration}ms`,
  );

  return {
    raw: positionData,
    normalized,
  };
}

