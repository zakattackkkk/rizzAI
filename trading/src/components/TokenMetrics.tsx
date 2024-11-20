'use client';

import { useEffect, useState } from 'react';
import { TradingService } from '../services/tradingService';

interface TokenMetricsProps {
    tokenAddress: string;
    tradingService: TradingService;
}

export function TokenMetrics({ tokenAddress, tradingService }: TokenMetricsProps) {
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
    }, [tokenAddress]);

    async function loadMetrics() {
        try {
            setIsLoading(true);
            const data = await tradingService.getTokenMetrics(tokenAddress);
            setMetrics(data);
        } catch (error) {
            console.error('Error loading token metrics:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="text-gray-400 text-center py-8">
                Failed to load token metrics
            </div>
        );
    }

    const { tokenInfo, holders, ath } = metrics;
    const pool = tokenInfo.pools[0] || {};

    return (
        <div className="space-y-4">
            {/* Token Info */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    {tokenInfo.token.image && (
                        <img 
                            src={tokenInfo.token.image} 
                            alt={tokenInfo.token.name}
                            className="w-10 h-10 rounded-full"
                        />
                    )}
                    <div>
                        <h3 className="text-lg font-bold">{tokenInfo.token.name}</h3>
                        <p className="text-gray-400">{tokenInfo.token.symbol}</p>
                    </div>
                </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Current Price</div>
                    <div className="text-xl font-bold">
                        ${pool.price?.usd.toFixed(6)}
                    </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-400">ATH</div>
                    <div className="text-xl font-bold">
                        ${ath.highest_price.toFixed(6)}
                    </div>
                </div>
            </div>

            {/* Market Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Market Cap</div>
                    <div className="text-xl font-bold">
                        ${pool.marketCap?.usd.toLocaleString()}
                    </div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-400">Liquidity</div>
                    <div className="text-xl font-bold">
                        ${pool.liquidity?.usd.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Holder Info */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">Total Holders</div>
                <div className="text-xl font-bold">{holders.total.toLocaleString()}</div>
                <div className="mt-2">
                    <div className="text-sm text-gray-400">Top Holder</div>
                    <div className="text-sm font-mono truncate">
                        {holders.accounts[0]?.wallet}
                    </div>
                    <div className="text-sm">
                        {holders.accounts[0]?.percentage.toFixed(2)}% of supply
                    </div>
                </div>
            </div>

            {/* Risk Info */}
            <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400">Risk Score</div>
                <div className="text-xl font-bold">{tokenInfo.risk.score}</div>
                {tokenInfo.risk.risks.length > 0 && (
                    <div className="mt-2">
                        <div className="text-sm text-gray-400">Risk Factors</div>
                        <ul className="text-sm list-disc list-inside">
                            {tokenInfo.risk.risks.map((risk, index) => (
                                <li key={index} className="text-yellow-400">
                                    {risk.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
