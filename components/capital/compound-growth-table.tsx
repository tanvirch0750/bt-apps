'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  getCapitalData,
  updateMonthlyCapital,
} from '@/lib/actions/capital-actions';
import { formatCurrency, getMonthName } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CompoundGrowthTableProps {
  capitalData: any;
}

export function CompoundGrowthTable({
  capitalData: initialCapitalData,
}: CompoundGrowthTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [capitalData, setCapitalData] = useState(initialCapitalData);
  const [loading, setLoading] = useState(!initialCapitalData);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

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

  // Force refresh when the component mounts to ensure we have the latest data
  useEffect(() => {
    const refreshData = async () => {
      setLoading(true);
      const result = await getCapitalData();

      if (result.success) {
        setCapitalData(result.data);
      }
      setLoading(false);
    };

    refreshData();
  }, []);

  useEffect(() => {
    if (capitalData) {
      // Format monthly capital data for display
      const formattedData = capitalData.monthlyCapital.map(
        (item: any, index: number) => ({
          month: index + 1,
          monthIndex: item.month,
          year: item.year,
          monthName: getMonthName(item.month),
          capital: item.initialCapital,
          currentCapital: item.currentCapital,
          target: item.targetCapital,
          growth: item.targetCapital - item.initialCapital,
          isCurrent:
            item.month === capitalData.currentMonth &&
            item.year === capitalData.currentYear,
        })
      );

      setGrowthData(formattedData);
    }
  }, [capitalData]);

  const handleEditCapital = (index: number) => {
    setEditingRow(index);
    setEditValue(growthData[index].capital.toString());
  };

  const handleSaveCapital = async (index: number) => {
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
      const monthData = growthData[index];

      // Update monthly capital
      const result = await updateMonthlyCapital(
        monthData.monthIndex,
        monthData.year,
        value
      );

      if (result.success) {
        setCapitalData(result.data);
        toast({
          title: 'Success',
          description: 'Monthly capital updated successfully',
        });

        // Force a refresh to ensure all components are updated
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update monthly capital',
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
      setEditingRow(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading growth data...</p>
      </div>
    );
  }

  if (growthData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No growth data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left font-medium py-2">Month</th>
            <th className="text-left font-medium py-2">Date</th>
            <th className="text-left font-medium py-2">Initial Capital</th>
            <th className="text-left font-medium py-2">Current Capital</th>
            <th className="text-left font-medium py-2">Target (20%)</th>
            <th className="text-left font-medium py-2">Growth</th>
            <th className="text-left font-medium py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {growthData.map((item, index) => (
            <tr
              key={index}
              className={`border-b ${item.isCurrent ? 'bg-muted' : ''}`}
            >
              <td className="py-2">Month {item.month}</td>
              <td className="py-2">
                {item.monthName} {item.year}
              </td>
              <td className="py-2">
                {editingRow === index ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24"
                      type="number"
                      min="1"
                    />
                    <Button size="sm" onClick={() => handleSaveCapital(index)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingRow(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  formatCurrency(item.capital)
                )}
              </td>
              <td className="py-2">{formatCurrency(item.currentCapital)}</td>
              <td className="py-2">{formatCurrency(item.target)}</td>
              <td className="py-2 text-green-600">
                +{formatCurrency(item.growth)}
              </td>
              <td className="py-2">
                {editingRow !== index && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCapital(index)}
                    disabled={
                      index < growthData.findIndex((item) => item.isCurrent)
                    }
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
