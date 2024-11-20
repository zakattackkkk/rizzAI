import { TradingDashboard } from '../components/TradingDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Cheshire AI Trading Dashboard 😸
        </h1>
        <TradingDashboard />
      </div>
    </main>
  );
}
