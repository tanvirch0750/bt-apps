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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  advanceToNextMonth,
  getCapitalData,
  goToPreviousMonth,
  resetCapital,
  updateCapital,
  updateCapitalSettings,
} from '@/lib/actions/capital-actions';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CapitalManagementProps {
  capitalData: any;
}

export function CapitalManagement({
  capitalData: initialCapitalData,
}: CapitalManagementProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [capitalData, setCapitalData] = useState(initialCapitalData);
  const [loading, setLoading] = useState(!initialCapitalData);
  const [isEditing, setIsEditing] = useState<'initial' | 'current' | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Settings state
  const [startMonth, setStartMonth] = useState<number>(3); // Default to April (0-indexed)
  const [startYear, setStartYear] = useState<number>(2025);
  const [durationMonths, setDurationMonths] = useState<number>(36);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Generate arrays for month and year dropdowns
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' },
  ];

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  useEffect(() => {
    async function fetchData() {
      if (!initialCapitalData) {
        setLoading(true);

        const result = await getCapitalData();

        if (result.success) {
          setCapitalData(result.data);
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to load capital data',
            variant: 'destructive',
          });
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialCapitalData, toast]);

  useEffect(() => {
    if (capitalData) {
      // Set the start date from capital data
      setStartMonth(capitalData.startMonth);
      setStartYear(capitalData.startYear);
      setDurationMonths(capitalData.monthlyCapital.length || 36);
    }
  }, [capitalData]);

  const handleEdit = (field: 'initial' | 'current') => {
    setIsEditing(field);

    // Find current month's capital data
    if (capitalData) {
      const currentMonthData = capitalData.monthlyCapital.find(
        (item: any) =>
          item.month === capitalData.currentMonth &&
          item.year === capitalData.currentYear
      );

      if (currentMonthData) {
        setEditValue(
          field === 'initial'
            ? currentMonthData.initialCapital.toString()
            : currentMonthData.currentCapital.toString()
        );
      }
    }
  };

  const handleSave = async () => {
    const value = Number.parseInt(editValue);

    if (isNaN(value) || value <= 0) {
      toast({
        title: 'Invalid value',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing === 'initial') {
        // Update initial capital for the current month
        const result = await updateCapital({ initialCapital: value });

        if (result.success) {
          setCapitalData(result.data);
          toast({
            title: 'Success',
            description: 'Initial capital updated successfully',
          });
          router.refresh();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update initial capital',
            variant: 'destructive',
          });
        }
      } else if (isEditing === 'current') {
        // Update current capital
        const result = await updateCapital({ currentCapital: value });

        if (result.success) {
          setCapitalData(result.data);
          toast({
            title: 'Success',
            description: 'Current capital updated successfully',
          });
          router.refresh();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update current capital',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsEditing(null);
    }
  };

  const handleAdvanceMonth = async () => {
    setIsAdvancing(true);

    try {
      const result = await advanceToNextMonth();

      if (result.success) {
        setCapitalData(result.data);
        toast({
          title: 'Success',
          description: 'Advanced to the next month successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to advance to next month',
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
      setIsAdvancing(false);
    }
  };

  const handlePreviousMonth = async () => {
    setIsReverting(true);

    try {
      const result = await goToPreviousMonth();

      if (result.success) {
        setCapitalData(result.data);
        toast({
          title: 'Success',
          description: 'Reverted to the previous month successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to revert to previous month',
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
      setIsReverting(false);
    }
  };

  const handleResetCapital = async () => {
    if (resetConfirmation.toLowerCase() !== 'okay') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "okay" to confirm reset',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);

    try {
      const result = await resetCapital();

      if (result.success) {
        setCapitalData(result.data);
        setResetDialogOpen(false);
        setResetConfirmation('');
        toast({
          title: 'Success',
          description: 'Capital data has been reset successfully',
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to reset capital data',
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
      setIsResetting(false);
    }
  };

  const handleSaveSettings = async () => {
    if (isNaN(durationMonths) || durationMonths < 1 || durationMonths > 120) {
      toast({
        title: 'Invalid Duration',
        description: 'Please enter a valid duration between 1 and 120 months',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingSettings(true);

    try {
      const result = await updateCapitalSettings({
        startMonth: startMonth,
        startYear: startYear,
        durationMonths: durationMonths,
      });

      if (result.success) {
        setCapitalData(result.data);
        setSettingsDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Capital settings updated successfully',
        });

        // Force a complete refresh of the application
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update capital settings',
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
      setIsSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading capital data...</p>
      </div>
    );
  }

  if (!capitalData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No capital data available</p>
      </div>
    );
  }

  // Find current month's capital data
  const currentMonthData = capitalData.monthlyCapital.find(
    (item: any) =>
      item.month === capitalData.currentMonth &&
      item.year === capitalData.currentYear
  );

  if (!currentMonthData) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Current month data not found</p>
      </div>
    );
  }

  const initialCapital = currentMonthData.initialCapital;
  const currentCapital = currentMonthData.currentCapital;
  const profitLoss = currentCapital - initialCapital;
  const profitPercentage =
    initialCapital > 0
      ? ((profitLoss / initialCapital) * 100).toFixed(1)
      : '0.0';

  // Check if we're at the first month (can't go back further)
  const isFirstMonth =
    capitalData.currentMonth === capitalData.startMonth &&
    capitalData.currentYear === capitalData.startYear;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Capital Overview</h3>
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Capital Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Capital Management Settings</DialogTitle>
              <DialogDescription>
                Configure your capital management timeline and duration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-month">Start Month</Label>
                  <Select
                    value={startMonth.toString()}
                    onValueChange={(value) =>
                      setStartMonth(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger id="start-month">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem
                          key={month.value}
                          value={month.value.toString()}
                        >
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-year">Start Year</Label>
                  <Select
                    value={startYear.toString()}
                    onValueChange={(value) =>
                      setStartYear(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger id="start-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="120"
                  value={durationMonths}
                  onChange={(e) =>
                    setDurationMonths(Number.parseInt(e.target.value) || 36)
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Number of months to project (1-120)
                </p>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Your capital projection will run from{' '}
                  {getMonthName(startMonth)} {startYear} for {durationMonths}{' '}
                  months.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSettingsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>
                  Initial Capital ({currentMonthData.month + 1}/
                  {currentMonthData.year})
                </Label>
                {isEditing === 'initial' ? (
                  <div className="flex items-center mt-1 space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="max-w-[150px]"
                      type="number"
                      min="1"
                    />
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-2xl font-bold pr-2">
                      {formatCurrency(initialCapital)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit('initial')}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Current Capital</Label>
                {isEditing === 'current' ? (
                  <div className="flex items-center mt-1 space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="max-w-[150px]"
                      type="number"
                      min="1"
                    />
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-2xl font-bold pr-2">
                      {formatCurrency(currentCapital)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit('current')}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <Label>Profit/Loss</Label>
            <div
              className={`text-2xl font-bold ${
                profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {profitLoss >= 0 ? '+' : ''}
              {formatCurrency(profitLoss)}
            </div>
          </div>

          <div>
            <Label>Percentage Change</Label>
            <div
              className={`text-2xl font-bold ${
                profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {profitLoss >= 0 ? '+' : ''}
              {profitPercentage}%
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Reset Capital
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousMonth}
            disabled={isReverting || isFirstMonth}
          >
            {isReverting ? 'Processing...' : 'Previous Month'}
          </Button>
          <Button onClick={handleAdvanceMonth} disabled={isAdvancing}>
            {isAdvancing ? 'Processing...' : 'Advance to Next Month'}
          </Button>
        </div>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Capital Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all your capital data to the initial values. This
              action cannot be undone.
              <div className="mt-4">
                <Label htmlFor="reset-confirmation" className="text-red-600">
                  Type "okay" to confirm:
                </Label>
                <Input
                  id="reset-confirmation"
                  value={resetConfirmation}
                  onChange={(e) => setResetConfirmation(e.target.value)}
                  className="mt-2"
                  placeholder='Type "okay" to confirm'
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetCapital}
              disabled={
                isResetting || resetConfirmation.toLowerCase() !== 'okay'
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? 'Resetting...' : 'Reset Capital'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
