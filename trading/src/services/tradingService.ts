import { Connection, PublicKey } from '@solana/web3.js';
import NodeCache from 'node-cache';
import { SolanaTrackerService, TokenInfo, TokenHolders } from './solanaTrackerService';

interface TradingOpportunity {
    token: {
        address: string;
        name: string;
        symbol: string;
        price: number;
        marketCap: number;
        liquidity: number;
        volume24h: number;
        priceChange24h: number;
    };
    confidence: number;
    signals: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    timestamp: number;
}

interface TokenAnalysis {
    isRisky: boolean;
    confidence: number;
    signals: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TokenMetrics {
    tokenInfo: TokenInfo;
    holders: TokenHolders;
    ath: { highest_price: number };
    lastUpdated: number;
}

export class TradingService {
    private solanaTracker: SolanaTrackerService;
    private cache: NodeCache;
    private connection: Connection;

    constructor() {
        this.solanaTracker = new SolanaTrackerService();
        this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
        this.connection = new Connection(process.env.RPC_URL || '');
    }

    async findTradingOpportunities(): Promise<TradingOpportunity[]> {
        const opportunities: TradingOpportunity[] = [];

        try {
            // Get trending meme tokens
            const memeTokens = await this.solanaTracker.findMemeTokens();
            
            // Analyze each token
            for (const token of memeTokens) {
                const tokenInfo = await this.solanaTracker.getTokenInfo(token.mint);
                const analysis = await this.analyzeToken(tokenInfo);

                if (!analysis.isRisky) {
                    const pool = tokenInfo.pools[0];
                    opportunities.push({
                        token: {
                            address: token.mint,
                            name: token.name,
                            symbol: token.symbol,
                            price: pool?.price?.usd || 0,
                            marketCap: pool?.marketCap?.usd || 0,
                            liquidity: pool?.liquidity?.usd || 0,
                            volume24h: 0, // Need to calculate from trades
                            priceChange24h: tokenInfo.events['24h']?.priceChangePercentage || 0
                        },
                        confidence: analysis.confidence,
                        signals: analysis.signals,
                        riskLevel: analysis.riskLevel,
                        timestamp: Date.now()
                    });
                }
            }

            // Sort opportunities by confidence
            return opportunities.sort((a, b) => b.confidence - a.confidence);

        } catch (error) {
            console.error('Error finding trading opportunities:', error);
            return [];
        }
    }

    private async analyzeToken(tokenInfo: TokenInfo): Promise<TokenAnalysis> {
        const signals: string[] = [];
        let confidenceScore = 0;
        let isRisky = false;

        // Check token age
        const pool = tokenInfo.pools[0];
        if (!pool) {
            return { isRisky: true, confidence: 0, signals: ['No liquidity pool found'], riskLevel: 'HIGH' };
        }

        // Analyze liquidity
        const liquidityUSD = pool.liquidity?.usd || 0;
        if (liquidityUSD < 10000) {
            signals.push('Low liquidity');
            confidenceScore -= 20;
        } else if (liquidityUSD > 100000) {
            signals.push('Strong liquidity');
            confidenceScore += 20;
        }

        // Check LP token burn
        if (pool.lpBurn === 100) {
            signals.push('100% LP tokens burned');
            confidenceScore += 15;
        } else if (pool.lpBurn < 50) {
            signals.push('Low LP token burn');
            confidenceScore -= 15;
        }

        // Analyze price movement
        const priceChange24h = tokenInfo.events['24h']?.priceChangePercentage || 0;
        if (Math.abs(priceChange24h) > 50) {
            signals.push('High volatility');
            confidenceScore -= 10;
        } else if (priceChange24h > 10) {
            signals.push('Positive momentum');
            confidenceScore += 10;
        }

        // Check holder distribution
        const holders = await this.solanaTracker.getTokenHolders(tokenInfo.token.mint);
        const topHolderPercentage = holders.accounts[0]?.percentage || 0;
        
        if (topHolderPercentage > 50) {
            signals.push('Concentrated holdings');
            confidenceScore -= 25;
            isRisky = true;
        } else if (topHolderPercentage < 10) {
            signals.push('Well-distributed holdings');
            confidenceScore += 15;
        }

        // Check security risks
        if (tokenInfo.risk.rugged) {
            signals.push('Rug pull risk detected');
            isRisky = true;
        }

        if (tokenInfo.risk.score > 5) {
            signals.push('High risk score');
            isRisky = true;
        }

        // Determine risk level
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
        if (isRisky || confidenceScore < 0) {
            riskLevel = 'HIGH';
        } else if (confidenceScore > 50) {
            riskLevel = 'LOW';
        } else {
            riskLevel = 'MEDIUM';
        }

        // Normalize confidence score between 0 and 100
        confidenceScore = Math.max(0, Math.min(100, confidenceScore + 50));

        return {
            isRisky,
            confidence: confidenceScore,
            signals,
            riskLevel
        };
    }

    async monitorToken(tokenAddress: string) {
        const cacheKey = `monitor_${tokenAddress}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const tokenInfo = await this.solanaTracker.getTokenInfo(tokenAddress);
            const analysis = await this.analyzeToken(tokenInfo);
            
            const monitoringData = {
                ...tokenInfo,
                analysis,
                lastUpdated: Date.now()
            };

            this.cache.set(cacheKey, monitoringData);
            return monitoringData;
        } catch (error) {
            console.error('Error monitoring token:', error);
            throw error;
        }
    }

    async getTokenMetrics(tokenAddress: string): Promise<TokenMetrics> {
        try {
            const [tokenInfo, holders, ath] = await Promise.all([
                this.solanaTracker.getTokenInfo(tokenAddress),
                this.solanaTracker.getTokenHolders(tokenAddress),
                this.solanaTracker.getTokenATH(tokenAddress)
            ]);

            return {
                tokenInfo,
                holders,
                ath,
                lastUpdated: Date.now()
            };
        } catch (error) {
            console.error('Error fetching token metrics:', error);
            throw error;
        }
    }
}
