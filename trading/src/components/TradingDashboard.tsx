'use client';

import { useEffect, useState } from 'react';
import { TradingService } from '../services/tradingService';
import { TokenMetrics } from './TokenMetrics';
import { TradingOpportunities } from './TradingOpportunities';
import { MemeTokenScanner } from './MemeTokenScanner';

export function TradingDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [opportunities, setOpportunities] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);
    const tradingService = new TradingService();

    useEffect(() => {
        loadOpportunities();
        const interval = setInterval(loadOpportunities, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    async function loadOpportunities() {
        try {
            setIsLoading(true);
            const newOpportunities = await tradingService.findTradingOpportunities();
            setOpportunities(newOpportunities);
        } catch (error) {
            console.error('Error loading opportunities:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Trading Opportunities */}
            <div className="lg:col-span-8 space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Trading Opportunities</h2>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                    ) : (
                        <TradingOpportunities 
                            opportunities={opportunities}
                            onSelectToken={setSelectedToken}
                        />
                    )}
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Meme Token Scanner</h2>
                    <MemeTokenScanner tradingService={tradingService} />
                </div>
            </div>

            {/* Right Column - Token Details */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Token Details</h2>
                    {selectedToken ? (
                        <TokenMetrics 
                            tokenAddress={selectedToken}
                            tradingService={tradingService}
                        />
                    ) : (
                        <div className="text-gray-400 text-center py-8">
                            Select a token to view details
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">Stats Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">Total Opportunities</div>
                            <div className="text-2xl font-bold">{opportunities.length}</div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <div className="text-sm text-gray-400">High Confidence</div>
                            <div className="text-2xl font-bold">
                                {opportunities.filter(op => op.confidence > 70).length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
