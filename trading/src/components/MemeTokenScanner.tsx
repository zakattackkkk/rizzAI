'use client';

import { useState, useEffect } from 'react';
import { TradingService } from '../services/tradingService';

interface MemeTokenScannerProps {
    tradingService: TradingService;
}

export function MemeTokenScanner({ tradingService }: MemeTokenScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
    const [opportunities, setOpportunities] = useState<any[]>([]);

    async function scanForOpportunities() {
        try {
            setIsScanning(true);
            const newOpportunities = await tradingService.findTradingOpportunities();
            setOpportunities(newOpportunities);
            setLastScanTime(new Date());
        } catch (error) {
            console.error('Error scanning for opportunities:', error);
        } finally {
            setIsScanning(false);
        }
    }

    useEffect(() => {
        // Initial scan
        scanForOpportunities();

        // Set up interval for periodic scanning (every 5 minutes)
        const interval = setInterval(scanForOpportunities, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Meme Token Scanner</h3>
                    {lastScanTime && (
                        <p className="text-sm text-gray-400">
                            Last scan: {lastScanTime.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={scanForOpportunities}
                    disabled={isScanning}
                    className={`px-4 py-2 rounded-lg ${
                        isScanning
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}
                >
                    {isScanning ? (
                        <span className="flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Scanning...
                        </span>
                    ) : (
                        'Scan Now'
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {opportunities.slice(0, 6).map((opportunity) => (
                    <div
                        key={opportunity.token.address}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-medium">{opportunity.token.name}</h4>
                                <p className="text-sm text-gray-400">{opportunity.token.symbol}</p>
                            </div>
                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                    opportunity.riskLevel === 'LOW'
                                        ? 'bg-green-900 text-green-200'
                                        : opportunity.riskLevel === 'MEDIUM'
                                        ? 'bg-yellow-900 text-yellow-200'
                                        : 'bg-red-900 text-red-200'
                                }`}
                            >
                                {opportunity.riskLevel}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Price</span>
                                <span className="text-sm">${opportunity.token.price.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">24h Change</span>
                                <span
                                    className={`text-sm ${
                                        opportunity.token.priceChange24h >= 0
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }`}
                                >
                                    {opportunity.token.priceChange24h.toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">Confidence</span>
                                <span className="text-sm">{opportunity.confidence}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
