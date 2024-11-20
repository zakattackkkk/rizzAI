'use client';

import { useState } from 'react';

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

interface TradingOpportunitiesProps {
    opportunities: TradingOpportunity[];
    onSelectToken: (address: string) => void;
}

type SortableField = 'confidence' | 'token' | 'price' | 'marketCap' | 'liquidity' | 'riskLevel';

export function TradingOpportunities({ opportunities, onSelectToken }: TradingOpportunitiesProps) {
    const [sortField, setSortField] = useState<SortableField>('confidence');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const sortedOpportunities = [...opportunities].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
            case 'token':
                aValue = a.token.name.toLowerCase();
                bValue = b.token.name.toLowerCase();
                break;
            case 'price':
                aValue = a.token.price;
                bValue = b.token.price;
                break;
            case 'marketCap':
                aValue = a.token.marketCap;
                bValue = b.token.marketCap;
                break;
            case 'liquidity':
                aValue = a.token.liquidity;
                bValue = b.token.liquidity;
                break;
            case 'riskLevel':
                const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
                aValue = riskOrder[a.riskLevel];
                bValue = riskOrder[b.riskLevel];
                break;
            default:
                aValue = a[sortField];
                bValue = b[sortField];
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field: SortableField) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'LOW':
                return 'text-green-400';
            case 'MEDIUM':
                return 'text-yellow-400';
            case 'HIGH':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('token')}
                        >
                            Token {sortField === 'token' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('price')}
                        >
                            Price {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            24h Change
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('marketCap')}
                        >
                            Market Cap {sortField === 'marketCap' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('liquidity')}
                        >
                            Liquidity {sortField === 'liquidity' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('riskLevel')}
                        >
                            Risk Level {sortField === 'riskLevel' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                            onClick={() => handleSort('confidence')}
                        >
                            Confidence {sortField === 'confidence' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {sortedOpportunities.map((opportunity) => (
                        <tr 
                            key={opportunity.token.address}
                            className="hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => onSelectToken(opportunity.token.address)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium">{opportunity.token.name}</div>
                                <div className="text-sm text-gray-400">{opportunity.token.symbol}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">${opportunity.token.price.toFixed(6)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${opportunity.token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {opportunity.token.priceChange24h.toFixed(2)}%
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">${opportunity.token.marketCap.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">${opportunity.token.liquidity.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${getRiskColor(opportunity.riskLevel)}`}>
                                    {opportunity.riskLevel}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm">{opportunity.confidence}%</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
