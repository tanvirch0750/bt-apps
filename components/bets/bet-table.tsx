'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { deleteBet, getBets, updateBet } from '@/lib/actions/bet-actions';
import { getCapitalData } from '@/lib/actions/capital-actions';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { Check, Clock, Edit, Filter, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BetTableProps {
  initialBets: any[];
  initialPagination: any;
}

export function BetTable({ initialBets, initialPagination }: BetTableProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [bets, setBets] = useState<any[]>(initialBets || []);
  const [loading, setLoading] = useState(initialBets.length === 0);
  const [pagination, setPagination] = useState(
    initialPagination || {
      total: 0,
      limit: 10,
      skip: 0,
      hasMore: false,
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');
  const [leagues, setLeagues] = useState<string[]>([]);
  const [months, setMonths] = useState<
    { month: number; year: number; label: string }[]
  >([]);
  const [weeks, setWeeks] = useState<number[]>([]);
  const [capitalData, setCapitalData] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [betToDelete, setBetToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingBetId, setUpdatingBetId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchCapitalData() {
      const result = await getCapitalData();
      if (result.success) {
        setCapitalData(result.data);

        // Generate months list from capital data
        if (result.data && result.data.monthlyCapital) {
          const uniqueMonths = result.data.monthlyCapital.map((item: any) => ({
            month: item.month,
            year: item.year,
            label: `${getMonthName(item.month)} ${item.year}`,
          }));

          // Remove duplicates
          const monthsMap = new Map();
          uniqueMonths.forEach((item: any) => {
            const key = `${item.month}-${item.year}`;
            if (!monthsMap.has(key)) {
              monthsMap.set(key, item);
            }
          });

          setMonths(Array.from(monthsMap.values()));
        }

        // Generate weeks list (1-5)
        setWeeks([1, 2, 3, 4, 5]);
      }
    }

    fetchCapitalData();
  }, []);

  useEffect(() => {
    async function fetchBets() {
      if (initialBets.length === 0) {
        setLoading(true);

        const result = await getBets({ limit: 10 });

        if (result.success) {
          setBets(result?.data?.bets);
          setPagination(result?.data?.pagination);
        }

        setLoading(false);
      }
    }

    fetchBets();
  }, [initialBets]);

  useEffect(() => {
    // Extract unique leagues from bets
    if (bets.length > 0) {
      const uniqueLeagues = [...new Set(bets.map((bet) => bet.league))];
      setLeagues(uniqueLeagues);
    }
  }, [bets]);

  const handleSearch = async () => {
    setLoading(true);

    const filters: any = { limit: pagination.limit, skip: 0 };

    if (resultFilter !== 'all') {
      filters.result = resultFilter;
    }

    if (leagueFilter !== 'all') {
      filters.league = leagueFilter;
    }

    if (monthFilter !== 'all') {
      const [monthStr, yearStr] = monthFilter.split('-');
      filters.month = Number.parseInt(monthStr);
      filters.year = Number.parseInt(yearStr);
    }

    if (weekFilter !== 'all') {
      filters.week = Number.parseInt(weekFilter);
    }

    try {
      const result = await getBets(filters);

      if (result.success) {
        // Filter by search term client-side
        let filteredBets = result?.data?.bets;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredBets = filteredBets.filter(
            (bet: any) =>
              bet.matchName.toLowerCase().includes(term) ||
              bet.league.toLowerCase().includes(term) ||
              bet.betType.toLowerCase().includes(term)
          );
        }

        setBets(filteredBets);
        setPagination({
          ...result?.data?.pagination,
          total: filteredBets.length,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, resultFilter, leagueFilter, monthFilter, weekFilter]);

  const handleLoadMore = async () => {
    if (!pagination.hasMore) return;

    setLoading(true);

    const filters: any = {
      limit: pagination.limit,
      skip: pagination.skip + pagination.limit,
    };

    if (resultFilter !== 'all') {
      filters.result = resultFilter;
    }

    if (leagueFilter !== 'all') {
      filters.league = leagueFilter;
    }

    if (monthFilter !== 'all') {
      const [monthStr, yearStr] = monthFilter.split('-');
      filters.month = Number.parseInt(monthStr);
      filters.year = Number.parseInt(yearStr);
    }

    if (weekFilter !== 'all') {
      filters.week = Number.parseInt(weekFilter);
    }

    try {
      const result = await getBets(filters);

      if (result.success) {
        // Filter by search term client-side if needed
        let newBets = result?.data?.bets;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          newBets = newBets.filter(
            (bet: any) =>
              bet.matchName.toLowerCase().includes(term) ||
              bet.league.toLowerCase().includes(term) ||
              bet.betType.toLowerCase().includes(term)
          );
        }

        setBets([...bets, ...newBets]);
        setPagination(result?.data?.pagination);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load more bets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/bets/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setBetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!betToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteBet(betToDelete);

      if (result.success) {
        // Remove bet from list
        setBets(bets.filter((bet) => bet._id !== betToDelete));

        toast({
          title: 'Success',
          description: 'Bet deleted successfully',
        });

        // Update pagination
        setPagination((prev: any) => ({
          ...prev,
          total: prev.total - 1,
        }));

        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete bet',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBetToDelete(null);
    }
  };

  const handleStatusChange = async (
    betId: string,
    newStatus: 'Win' | 'Loss' | 'Pending'
  ) => {
    setUpdatingBetId(betId);

    try {
      const result = await updateBet(betId, { result: newStatus });

      if (result.success) {
        // Update bet in the list
        setBets(
          bets.map((bet) =>
            bet._id === betId
              ? { ...bet, result: newStatus, profit: result.data.profit }
              : bet
          )
        );

        toast({
          title: 'Success',
          description: `Bet status updated to ${newStatus}`,
        });

        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update bet status',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setUpdatingBetId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Win':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'Loss':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const resetFilters = () => {
    setResultFilter('all');
    setLeagueFilter('all');
    setMonthFilter('all');
    setWeekFilter('all');
    setSearchTerm('');
  };

  if (loading && bets.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading bets...</p>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
        <p className="text-muted-foreground">
          No bets found. Add your first bet to get started.
        </p>
        <Button onClick={() => router.push('/bets/new')}>Add New Bet</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1">
            <Input
              placeholder="Search bets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="Win">Win</SelectItem>
                <SelectItem value="Loss">Loss</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-md bg-muted/30">
            <div className="flex-1 space-y-2">
              <Label>League</Label>
              <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by league" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {leagues.map((league) => (
                    <SelectItem key={league} value={league}>
                      {league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Month</Label>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {months.map((item) => (
                    <SelectItem
                      key={`${item.month}-${item.year}`}
                      value={`${item.month}-${item.year}`}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <Label>Week</Label>
              <Select value={weekFilter} onValueChange={setWeekFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {weeks.map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

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
              <th className="text-right font-medium py-2">Actions</th>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        disabled={updatingBetId === bet._id}
                      >
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
                          <span className="flex items-center gap-1">
                            {getStatusIcon(bet.result)}
                            {bet.result}
                          </span>
                        </Badge>
                        {updatingBetId === bet._id && (
                          <span className="ml-2 animate-spin">⟳</span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(bet._id, 'Win')}
                        className="text-green-600"
                        disabled={bet.result === 'Win'}
                      >
                        <Check className="mr-2 h-4 w-4" /> Win
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(bet._id, 'Loss')}
                        className="text-red-600"
                        disabled={bet.result === 'Loss'}
                      >
                        <X className="mr-2 h-4 w-4" /> Loss
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(bet._id, 'Pending')}
                        className="text-yellow-600"
                        disabled={bet.result === 'Pending'}
                      >
                        <Clock className="mr-2 h-4 w-4" /> Pending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(bet._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(bet._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {bets.length} of {pagination.total} bets
        </div>
        <div className="flex gap-2">
          {pagination.hasMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bet
              and update your capital accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
