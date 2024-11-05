import { createRuntime } from "../src/test_resources/createRuntime";
import { TokenProvider } from "../src/providers/token";
import NodeCache from "node-cache";

// Mock the dependencies
jest.mock("cross-fetch");
jest.mock("fs");
jest.mock("node-cache");

describe("TokenProvider Tests", () => {
    let tokenProvider: TokenProvider;

    beforeEach(() => {
        tokenProvider = new TokenProvider(
            "2weMjPLLybRMMva1fM3U31goWWrCpF59CHWNhnCJ9Vyh"
        );
    });

    test("should fetch token security data", async () => {
        const { runtime } = await createRuntime({
            conversationLength: 10,
        });

        // Mock the response for the fetchTokenSecurity call
        const mockFetchResponse = {
            success: true,
            data: {
                // Security Data
                security: {
                    ownerBalance: "1000",
                    creatorBalance: "500",
                    ownerPercentage: 10, // Represents 10%
                    creatorPercentage: 5, // Represents 5%
                    top10HolderBalance: "2000",
                    top10HolderPercent: 20, // Represents 20%
                },
                // Trade Data
                tradeData: {
                    holder: 1500,
                    unique_wallet_24h: 120,
                    price_change_24h_percent: 4.5, // 4.5%
                    price_change_12h_percent: 2.3, // 2.3%
                    volume_24h_usd: "75000.50", // String representation for consistency
                    price: "2.50", // Current price in USD as a string
                    // Add additional trade-related fields if necessary
                },
                // Holder Distribution Trend
                holderDistributionTrend: "increasing", // Possible values: 'increasing', 'decreasing', 'stable'
                // High-Value Holders
                highValueHolders: [
                    {
                        holderAddress: "0xHolderAddress1",
                        balanceUsd: "6000.00",
                    },
                    {
                        holderAddress: "0xHolderAddress2",
                        balanceUsd: "5500.00",
                    },
                    // Add more high-value holders as needed
                ],
                // Recent Trades Indicator
                recentTrades: true, // Indicates whether there have been recent trades in the last 24 hours
                // High-Supply Holders Count
                highSupplyHoldersCount: 15, // Number of holders holding more than 2% of the total supply
                // DexScreener Data
                dexScreenerData: {
                    schemaVersion: "1.0",
                    pairs: [
                        {
                            chainId: "1", // Example Chain ID (e.g., Ethereum Mainnet)
                            dexId: "Uniswap", // Decentralized Exchange Identifier
                            url: "https://uniswap.org", // URL to the DEX
                            pairAddress: "0xPairAddress1",
                            baseToken: {
                                address: "0xBaseTokenAddress1",
                                name: "Base Token Name",
                                symbol: "BASE",
                            },
                            quoteToken: {
                                address: "0xQuoteTokenAddress1",
                                name: "Quote Token Name",
                                symbol: "QUOTE",
                            },
                            priceNative: "0.002", // Price in native blockchain currency (e.g., ETH)
                            priceUsd: "2.50", // Price in USD as a string
                            txns: {
                                m5: { buys: 15, sells: 10 }, // Transactions in the last 5 minutes
                                h1: { buys: 60, sells: 45 }, // Transactions in the last hour
                                h6: { buys: 300, sells: 270 }, // Transactions in the last 6 hours
                                h24: { buys: 1200, sells: 1100 }, // Transactions in the last 24 hours
                            },
                            volume: {
                                h24: 50000, // Volume in the last 24 hours in USD
                                h6: 30000, // Volume in the last 6 hours in USD
                                h1: 15000, // Volume in the last hour in USD
                                m5: 5000, // Volume in the last 5 minutes in USD
                            },
                            priceChange: {
                                m5: 0.5, // Price change in the last 5 minutes
                                h1: 1.2, // Price change in the last hour
                                h6: 3.5, // Price change in the last 6 hours
                                h24: 5.0, // Price change in the last 24 hours
                            },
                            liquidity: {
                                usd: 1000000, // Liquidity in USD
                                base: 500000, // Liquidity in base token
                                quote: 500000, // Liquidity in quote token
                            },
                            fdv: 2000000, // Fully Diluted Valuation in USD
                            marketCap: 1500000, // Market Capitalization in USD
                            pairCreatedAt: 1633036800, // Unix timestamp for pair creation
                            info: {
                                imageUrl: "https://example.com/image.png", // URL to the pair's image
                                websites: [
                                    {
                                        label: "Official Website",
                                        url: "https://example.com",
                                    },
                                    {
                                        label: "Documentation",
                                        url: "https://docs.example.com",
                                    },
                                ],
                                socials: [
                                    {
                                        type: "Twitter",
                                        url: "https://twitter.com/example",
                                    },
                                    {
                                        type: "Discord",
                                        url: "https://discord.gg/example",
                                    },
                                ],
                            },
                            boosts: {
                                active: 2, // Number of active boosts
                            },
                        },
                        // Add more DexScreenerPair objects as needed
                    ],
                },
                // DexScreener Listing Status
                isDexScreenerListed: true, // Indicates if the token is listed on DexScreener
                isDexScreenerPaid: false, // Indicates if the listing on DexScreener is paid
            },
        };

        // Mock fetchWithRetry function
        const fetchSpy = jest
            .spyOn(tokenProvider as any, "fetchWithRetry")
            .mockResolvedValue(mockFetchResponse);

        //  Run the fetchTokenSecurity method
        //  const securityData = await tokenProvider.fetchTokenSecurity();

        // Check if the data returned is correct
        //  expect(securityData).toEqual({
        //    ownerBalance: "100",
        //    creatorBalance: "50",
        //    ownerPercentage: 10,
        //    creatorPercentage: 5,
        //    top10HolderBalance: "200",
        //    top10HolderPercent: 20,
        //  });
        //console.log the securityData
        //  console.log({ securityData });

        //  const holderList = await tokenProvider.fetchHolderList();

        //  console.log({ holderList });

        //  const tradeData = await tokenProvider.fetchTokenTradeData();
        //  console.log({ tradeData });

        //  const dexScreenerData = await tokenProvider.fetchDexScreenerData();
        //  console.log({ dexScreenerData });

        const tokenReport = await tokenProvider.getFormattedTokenReport();
        console.log({ tokenReport });

        // Ensure the mock was called
        expect(fetchSpy).toHaveBeenCalled();
    });
});
