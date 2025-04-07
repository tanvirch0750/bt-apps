'use client';

import { Badge } from '@/components/ui/badge';
import { getBets } from '@/lib/actions/bet-actions';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface RecentBetsProps {
  initialBets: any[];
}

export function RecentBets({ initialBets }: RecentBetsProps) {
  const [bets, setBets] = useState<any[]>(initialBets || []);
  const [loading, setLoading] = useState(initialBets.length === 0);

  useEffect(() => {
    async function fetchBets() {
      if (initialBets.length === 0) {
        setLoading(true);

        const result = await getBets({ limit: 5 });

        if (result.success) {
          setBets(result?.data?.bets);
        }

        setLoading(false);
      }
    }

    fetchBets();
  }, [initialBets]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading recent bets...</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">
          No bets found. Add your first bet to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left font-medium py-2">Match</th>
            <th className="text-left font-medium py-2">League</th>
            <th className="text-left font-medium py-2">Date</th>
            <th className="text-left font-medium py-2">Odds</th>
            <th className="text-left font-medium py-2">Stake</th>
            <th className="text-left font-medium py-2">Type</th>
            <th className="text-left font-medium py-2">Result</th>
            <th className="text-right font-medium py-2">Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => (
            <tr key={bet._id} className="border-b">
              <td className="py-2">{bet.matchName}</td>
              <td className="py-2">{bet.league}</td>
              <td className="py-2">
                {new Date(bet.date).toLocaleDateString()}
              </td>
              <td className="py-2">{bet.odds.toFixed(2)}</td>
              <td className="py-2">{formatCurrency(bet.stake)}</td>
              <td className="py-2">{bet.betType}</td>
              <td className="py-2">
                <Badge
                  variant="outline"
                  className={
                    bet.result === 'Win'
                      ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
                      : bet.result === 'Loss'
                      ? 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800'
                  }
                >
                  {bet.result}
                </Badge>
              </td>
              <td
                className={`py-2 text-right ${
                  bet.profit > 0
                    ? 'text-green-600'
                    : bet.profit < 0
                    ? 'text-red-600'
                    : ''
                }`}
              >
                {bet.profit > 0 ? '+' : ''}
                {formatCurrency(bet.profit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
