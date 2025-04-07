'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { getSettings, updateSettings } from '@/lib/actions/settings-actions';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface SettingsFormProps {
  settings: any;
}

export function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(!initialSettings);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    monthlyGrowthTarget: 20,
    defaultUnitSize: 5,
    theme: 'system',
    notifications: {
      streakWarnings: true,
      monthlyGoalReminders: true,
      weeklyPlanReminders: true,
    },
  });

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!initialSettings) {
        setLoading(true);

        const result = await getSettings();

        if (result.success) {
          setSettings(result.data);
        }

        setLoading(false);
      }
    }

    fetchData();
  }, [initialSettings]);

  useEffect(() => {
    if (settings && mounted) {
      setFormData({
        monthlyGrowthTarget: Math.round(settings.monthlyGrowthTarget * 100),
        defaultUnitSize: Math.round(settings.defaultUnitSize * 100),
        theme: settings.theme,
        notifications: {
          streakWarnings: settings.notifications?.streakWarnings ?? true,
          monthlyGoalReminders:
            settings.notifications?.monthlyGoalReminders ?? true,
          weeklyPlanReminders:
            settings.notifications?.weeklyPlanReminders ?? true,
        },
      });

      // Set theme from settings
      if (settings.theme && theme !== settings.theme) {
        setTheme(settings.theme);
      }
    }
  }, [settings, setTheme, mounted, theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate input
    if (name === 'monthlyGrowthTarget') {
      const numValue = Number.parseInt(value);
      if (!isNaN(numValue) && numValue > 0 && numValue <= 100) {
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      }
    } else if (name === 'defaultUnitSize') {
      const numValue = Number.parseInt(value);
      if (!isNaN(numValue) && numValue > 0 && numValue <= 20) {
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleThemeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, theme: value }));
    setTheme(value);
  };

  const handleNotificationChange = (
    key: keyof typeof formData.notifications
  ) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await updateSettings(formData);

      if (result.success) {
        setSettings(result.data);

        toast({
          title: 'Success',
          description: 'Settings saved successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save settings',
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Loading theme settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Betting Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="monthly-growth-target">
            Monthly Growth Target (%)
          </Label>
          <Input
            id="monthly-growth-target"
            name="monthlyGrowthTarget"
            type="number"
            min="1"
            max="100"
            value={formData.monthlyGrowthTarget}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            Your target monthly growth percentage (default: 20%)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-unit-size">
            Default Unit Size (% of Monthly Capital)
          </Label>
          <Input
            id="default-unit-size"
            name="defaultUnitSize"
            type="number"
            min="1"
            max="20"
            value={formData.defaultUnitSize}
            onChange={handleChange}
          />
          <p className="text-xs text-muted-foreground">
            Your default stake size as a percentage of monthly capital (default:
            5%)
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Appearance</h3>

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <div className="flex items-center space-x-4">
            <Select value={formData.theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleThemeChange('light')}
                className={`rounded-l-md ${
                  formData.theme === 'light' ? 'bg-muted' : ''
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="sr-only">Light</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleThemeChange('dark')}
                className={`rounded-r-md ${
                  formData.theme === 'dark' ? 'bg-muted' : ''
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="sr-only">Dark</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Choose your preferred theme (current: {theme})
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="streak-warnings">Streak Warnings</Label>
              <p className="text-xs text-muted-foreground">
                Get warnings about winning/losing streaks
              </p>
            </div>
            <Switch
              id="streak-warnings"
              checked={formData.notifications.streakWarnings}
              onCheckedChange={() => handleNotificationChange('streakWarnings')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="monthly-goal-reminders">
                Monthly Goal Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Get reminders about your monthly growth targets
              </p>
            </div>
            <Switch
              id="monthly-goal-reminders"
              checked={formData.notifications.monthlyGoalReminders}
              onCheckedChange={() =>
                handleNotificationChange('monthlyGoalReminders')
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-plan-reminders">
                Weekly Plan Reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Get reminders about your weekly betting plan
              </p>
            </div>
            <Switch
              id="weekly-plan-reminders"
              checked={formData.notifications.weeklyPlanReminders}
              onCheckedChange={() =>
                handleNotificationChange('weeklyPlanReminders')
              }
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
