import 'isomorphic-fetch';

const API_KEY = 'ad453b26-b435-4f73-a653-0d105f8e0583';
const BASE_URL = 'https://data.solanatracker.io';

export interface Pool {
    liquidity: {
        quote: number;
        usd: number;
    };
    price: {
        quote: number;
        usd: number;
    };
    tokenSupply: number;
    lpBurn: number;
    tokenAddress: string;
    marketCap: {
        quote: number;
        usd: number;
    };
    market: string;
    security: {
        freezeAuthority: string | null;
        mintAuthority: string | null;
    };
}

export interface TokenInfo {
    token: {
        name: string;
        symbol: string;
        mint: string;
        uri: string;
        decimals: number;
        image: string;
        description: string;
        extensions?: {
            twitter?: string;
            telegram?: string;
        };
        tags?: string[];
        creator?: {
            name: string;
            site: string;
        };
        hasFileMetaData: boolean;
    };
    pools: Pool[];
    events: {
        [key: string]: {
            priceChangePercentage: number;
        };
    };
    risk: {
        rugged: boolean;
        risks: Array<{
            name: string;
            description: string;
            level: string;
            score: number;
        }>;
        score: number;
    };
    buys: number;
    sells: number;
    txns: number;
}

export interface TokenHolders {
    total: number;
    accounts: Array<{
        wallet: string;
        amount: number;
        value: {
            quote: number;
            usd: number;
        };
        percentage: number;
    }>;
}

export interface SearchResult {
    id: string;
    name: string;
    symbol: string;
    mint: string;
    image: string;
    decimals: number;
    quoteToken: string;
    hasSocials: boolean;
    poolAddress: string;
    liquidityUsd: number;
    marketCapUsd: number;
    lpBurn: number;
    market: string;
    freezeAuthority: string | null;
    mintAuthority: string | null;
    deployer: string;
    createdAt: number;
    status: string;
    lastUpdated: number;
    buys: number;
    sells: number;
    totalTransactions: number;
    events?: {
        [key: string]: {
            priceChangePercentage: number;
        };
    };
}

interface SearchResponse {
    status: string;
    data: SearchResult[];
}

interface MultiTokenOverview {
    latest: TokenInfo[];
    graduating: TokenInfo[];
    graduated: TokenInfo[];
}

export class SolanaTrackerService {
    private headers = {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    };

    async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
        const response = await fetch(`${BASE_URL}/tokens/${tokenAddress}`, {
            headers: this.headers
        });
        return response.json() as Promise<TokenInfo>;
    }

    async getTokenHolders(tokenAddress: string): Promise<TokenHolders> {
        const response = await fetch(`${BASE_URL}/tokens/${tokenAddress}/holders`, {
            headers: this.headers
        });
        return response.json() as Promise<TokenHolders>;
    }

    async getTokenATH(tokenAddress: string): Promise<{ highest_price: number }> {
        const response = await fetch(`${BASE_URL}/tokens/${tokenAddress}/ath`, {
            headers: this.headers
        });
        return response.json() as Promise<{ highest_price: number }>;
    }

    async searchTokens(params: {
        query: string;
        page?: number;
        limit?: number;
        minLiquidity?: number;
        maxLiquidity?: number;
        minMarketCap?: number;
        maxMarketCap?: number;
        minBuys?: number;
        maxBuys?: number;
        minSells?: number;
        maxSells?: number;
        minTotalTransactions?: number;
        maxTotalTransactions?: number;
        lpBurn?: number;
        market?: string;
        showPriceChanges?: boolean;
    }): Promise<SearchResponse> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${BASE_URL}/search?${queryParams.toString()}`, {
            headers: this.headers
        });
        return response.json() as Promise<SearchResponse>;
    }

    async getTrendingTokens(timeframe?: string): Promise<TokenInfo[]> {
        const url = timeframe 
            ? `${BASE_URL}/tokens/trending/${timeframe}`
            : `${BASE_URL}/tokens/trending`;
        
        const response = await fetch(url, {
            headers: this.headers
        });
        return response.json() as Promise<TokenInfo[]>;
    }

    async getLatestTokens(): Promise<TokenInfo[]> {
        const response = await fetch(`${BASE_URL}/tokens/latest`, {
            headers: this.headers
        });
        return response.json() as Promise<TokenInfo[]>;
    }

    async getTopVolumeTokens(): Promise<TokenInfo[]> {
        const response = await fetch(`${BASE_URL}/tokens/volume`, {
            headers: this.headers
        });
        return response.json() as Promise<TokenInfo[]>;
    }

    async getMultiTokenOverview(): Promise<MultiTokenOverview> {
        const response = await fetch(`${BASE_URL}/tokens/multi/all`, {
            headers: this.headers
        });
        const data = await response.json() as MultiTokenOverview;
        return {
            latest: data.latest || [],
            graduating: data.graduating || [],
            graduated: data.graduated || []
        };
    }

    async getGraduatedTokens(): Promise<TokenInfo[]> {
        const response = await fetch(`${BASE_URL}/tokens/multi/graduated`, {
            headers: this.headers
        });
        return response.json() as Promise<TokenInfo[]>;
    }

    async findMemeTokens(minLiquidity: number = 10000): Promise<SearchResult[]> {
        // Search for potential meme tokens with specific criteria
        const searchResults = await this.searchTokens({
            query: 'meme OR pepe OR doge OR shib OR inu OR cat OR elon OR moon OR safe OR cum OR chad OR wojak OR based OR wagmi OR frog OR ai OR gpt OR monkey OR ape',
            minLiquidity,
            lpBurn: 100, // Look for tokens with 100% LP burn
            minTotalTransactions: 100, // Ensure some trading activity
            showPriceChanges: true
        });

        // Get trending tokens to cross-reference
        const trendingTokens = await this.getTrendingTokens('1h');
        const memeTokens = new Set<SearchResult>();

        // Process search results
        for (const token of searchResults.data) {
            if (this.isMemeToken(token)) {
                memeTokens.add(token);
            }
        }

        // Process trending tokens that match search result interface
        for (const tokenInfo of trendingTokens) {
            const token = this.convertTokenInfoToSearchResult(tokenInfo);
            if (this.isMemeToken(token)) {
                memeTokens.add(token);
            }
        }

        return Array.from(memeTokens);
    }

    private convertTokenInfoToSearchResult(tokenInfo: TokenInfo): SearchResult {
        const defaultPool: Pool = {
            liquidity: { quote: 0, usd: 0 },
            price: { quote: 0, usd: 0 },
            tokenSupply: 0,
            lpBurn: 0,
            tokenAddress: '',
            marketCap: { quote: 0, usd: 0 },
            market: '',
            security: { freezeAuthority: null, mintAuthority: null }
        };

        const pool = tokenInfo.pools[0] || defaultPool;

        return {
            id: tokenInfo.token.mint,
            name: tokenInfo.token.name,
            symbol: tokenInfo.token.symbol,
            mint: tokenInfo.token.mint,
            image: tokenInfo.token.image,
            decimals: tokenInfo.token.decimals,
            quoteToken: pool.tokenAddress,
            hasSocials: !!tokenInfo.token.extensions?.twitter || !!tokenInfo.token.extensions?.telegram,
            poolAddress: pool.tokenAddress,
            liquidityUsd: pool.liquidity.usd,
            marketCapUsd: pool.marketCap.usd,
            lpBurn: pool.lpBurn,
            market: pool.market,
            freezeAuthority: pool.security.freezeAuthority,
            mintAuthority: pool.security.mintAuthority,
            deployer: '',  // Not available in TokenInfo
            createdAt: Date.now(),  // Not available in TokenInfo
            status: 'active',
            lastUpdated: Date.now(),
            buys: tokenInfo.buys,
            sells: tokenInfo.sells,
            totalTransactions: tokenInfo.txns,
            events: tokenInfo.events
        };
    }

    private isMemeToken(token: SearchResult): boolean {
        // Criteria for identifying meme tokens
        const memeIndicators = [
            'meme', 'pepe', 'doge', 'shib', 'inu', 'cat', 'elon',
            'moon', 'safe', 'cum', 'chad', 'wojak', 'based',
            'wagmi', 'frog', 'ai', 'gpt', 'monkey', 'ape'
        ];

        const name = token.name?.toLowerCase() || '';
        const symbol = token.symbol?.toLowerCase() || '';

        // Check if token name/symbol contains meme-related terms
        const hasMemeTerms = memeIndicators.some(term => 
            name.includes(term) || symbol.includes(term)
        );

        // Additional criteria
        const hasHighVolatility = token.events?.['24h']?.priceChangePercentage 
            ? Math.abs(token.events['24h'].priceChangePercentage) > 10
            : false;

        const hasHighTransactions = token.totalTransactions > 100;
        const hasLPBurn = token.lpBurn === 100;

        return (hasMemeTerms || hasHighVolatility) && hasHighTransactions && hasLPBurn;
    }
}
