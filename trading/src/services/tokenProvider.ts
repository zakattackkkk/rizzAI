import { Connection, PublicKey } from '@solana/web3.js';
import NodeCache from 'node-cache';
import fetch from 'node-fetch';

interface TokenSecurity {
    rugPull: boolean;
    isScam: boolean;
}

interface TokenTradeData {
    price: number;
    volume_24h: number;
    price_change_24h: number;
    liquidity: { usd: number };
    holder_data: any;
    trade_history: any[];
}

interface ProcessedTokenData {
    security: TokenSecurity;
    tradeData: TokenTradeData;
    holderDistributionTrend: any;
    highValueHolders: any[];
    recentTrades: any[];
    dexScreenerData: any;
}

export class TokenProvider {
    private cache: NodeCache;
    private connection: Connection;
    private HELIUS_RPC: string;

    constructor(private tokenAddress: string) {
        this.cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache
        this.HELIUS_RPC = process.env.RPC_URL || '';
        this.connection = new Connection(this.HELIUS_RPC);
    }

    async fetchTokenSecurity(): Promise<TokenSecurity> {
        const cacheKey = `security_${this.tokenAddress}`;
        const cached = this.cache.get<TokenSecurity>(cacheKey);
        if (cached) return cached;

        try {
            // Use Helius API to check token security
            const response = await fetch(`${this.HELIUS_RPC}/v0/token-metadata/${this.tokenAddress}`);
            const data = await response.json();
            
            const security = {
                rugPull: this.detectRugPullRisk(data),
                isScam: this.detectScamRisk(data)
            };

            this.cache.set(cacheKey, security);
            return security;
        } catch (error) {
            console.error('Error fetching token security:', error);
            return { rugPull: true, isScam: true }; // Assume unsafe if can't verify
        }
    }

    private detectRugPullRisk(data: any): boolean {
        // Check for common rug pull indicators
        return (
            data.totalSupply === '0' ||
            data.freezeAuthority !== null ||
            data.supply.decimals < 6 ||
            !data.supply.isInitialized
        );
    }

    private detectScamRisk(data: any): boolean {
        // Check for common scam indicators
        return (
            !data.name ||
            !data.symbol ||
            data.name.toLowerCase().includes('scam') ||
            data.symbol.toLowerCase().includes('scam')
        );
    }

    async fetchTokenTradeData(): Promise<TokenTradeData> {
        const cacheKey = `trade_data_${this.tokenAddress}`;
        const cached = this.cache.get<TokenTradeData>(cacheKey);
        if (cached) return cached;

        try {
            // Fetch Jupiter API for price and volume data
            const response = await fetch(
                `https://price.jup.ag/v4/price?ids=${this.tokenAddress}`
            );
            const data = await response.json();

            const tradeData = {
                price: data.data[this.tokenAddress]?.price || 0,
                volume_24h: data.data[this.tokenAddress]?.volume24h || 0,
                price_change_24h: data.data[this.tokenAddress]?.priceChange24h || 0,
                liquidity: { usd: data.data[this.tokenAddress]?.liquidity || 0 },
                holder_data: await this.fetchHolderData(),
                trade_history: await this.fetchTradeHistory()
            };

            this.cache.set(cacheKey, tradeData);
            return tradeData;
        } catch (error) {
            console.error('Error fetching trade data:', error);
            throw error;
        }
    }

    async fetchHolderData(): Promise<any> {
        try {
            // Use Helius API to fetch token holder data
            const response = await fetch(
                `${this.HELIUS_RPC}/v0/token-holdings?token=${this.tokenAddress}`
            );
            return response.json();
        } catch (error) {
            console.error('Error fetching holder data:', error);
            return [];
        }
    }

    async fetchTradeHistory(): Promise<any[]> {
        try {
            // Use Helius API to fetch recent trades
            const response = await fetch(
                `${this.HELIUS_RPC}/v0/token-transactions?token=${this.tokenAddress}`
            );
            return response.json();
        } catch (error) {
            console.error('Error fetching trade history:', error);
            return [];
        }
    }

    async analyzeHolderDistribution(): Promise<any> {
        const holders = await this.fetchHolderData();
        return this.calculateHolderMetrics(holders);
    }

    private calculateHolderMetrics(holders: any[]): any {
        // Calculate holder distribution metrics
        const totalHolders = holders.length;
        const holdingAmounts = holders.map(h => Number(h.amount));
        const averageHolding = holdingAmounts.reduce((a, b) => a + b, 0) / totalHolders;
        
        return {
            totalHolders,
            averageHolding,
            distribution: this.calculateDistributionPercentiles(holdingAmounts)
        };
    }

    private calculateDistributionPercentiles(amounts: number[]): any {
        const sorted = [...amounts].sort((a, b) => a - b);
        const len = sorted.length;
        
        return {
            p10: sorted[Math.floor(len * 0.1)],
            p25: sorted[Math.floor(len * 0.25)],
            p50: sorted[Math.floor(len * 0.5)],
            p75: sorted[Math.floor(len * 0.75)],
            p90: sorted[Math.floor(len * 0.9)]
        };
    }

    async filterHighValueHolders(): Promise<any[]> {
        const holders = await this.fetchHolderData();
        return holders.filter(h => Number(h.amount) > 1000); // Adjust threshold as needed
    }

    async checkRecentTrades(): Promise<any[]> {
        const trades = await this.fetchTradeHistory();
        return trades.slice(0, 50); // Get last 50 trades
    }

    async fetchDexScreenerData(): Promise<any> {
        try {
            const response = await fetch(
                `https://api.dexscreener.com/latest/dex/tokens/${this.tokenAddress}`
            );
            return response.json();
        } catch (error) {
            console.error('Error fetching DEX Screener data:', error);
            return null;
        }
    }

    async getProcessedTokenData(): Promise<ProcessedTokenData> {
        return {
            security: await this.fetchTokenSecurity(),
            tradeData: await this.fetchTokenTradeData(),
            holderDistributionTrend: await this.analyzeHolderDistribution(),
            highValueHolders: await this.filterHighValueHolders(),
            recentTrades: await this.checkRecentTrades(),
            dexScreenerData: await this.fetchDexScreenerData(),
        };
    }
}
