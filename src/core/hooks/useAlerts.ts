/**
 * MACROSCOPE PERFORMANCE OS - ALERTS HOOK
 * Manages alert state and orchestration
 */

import { useState, useEffect } from 'react';
import { useSleepSystem, useNutritionSystem, useActivitySystem, useSettings } from './index';
import {
  generateAlerts,
  prioritizeAlerts,
  acknowledgeAlert as acknowledgeAlertLogic,
  getUnacknowledgedCount,
  type Alert,
  type AlertPriority
} from '../logic/alertEngine';

export function useAlerts() {
  const { sleepData, loading: sleepLoading } = useSleepSystem();
  const { nutritionData, loading: nutritionLoading } = useNutritionSystem();
  const { activityData, loading: activityLoading } = useActivitySystem();
  const { settings, loading: settingsLoading } = useSettings();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [priority, setPriority] = useState<AlertPriority>({ primary: null, secondary: [] });
  const loading = sleepLoading || nutritionLoading || activityLoading || settingsLoading;

  // Generate alerts when data changes
  useEffect(() => {
    if (!loading && settings) {
      const newAlerts = generateAlerts(
        sleepData,
        nutritionData,
        activityData,
        settings,
        alerts
      );
      setAlerts(newAlerts);
    }
  }, [sleepData, nutritionData, activityData, settings, loading]);

  // Update priority when alerts change
  useEffect(() => {
    const newPriority = prioritizeAlerts(alerts);
    setPriority(newPriority);
  }, [alerts]);

  // Acknowledge alert handler
  const acknowledgeAlert = (alertId: string) => {
    const updatedAlerts = acknowledgeAlertLogic(alerts, alertId);
    setAlerts(updatedAlerts);
  };

  // Get unacknowledged count
  const unacknowledgedCount = getUnacknowledgedCount(alerts);

  // Group alerts by acknowledgment status
  const unacknowledgedAlerts = alerts.filter(
    a => a.state === 'NEW' || a.state === 'ACTIVE'
  );
  const acknowledgedAlerts = alerts.filter(a => a.state === 'ACKNOWLEDGED');

  return {
    alerts,
    unacknowledgedAlerts,
    acknowledgedAlerts,
    priority,
    unacknowledgedCount,
    acknowledgeAlert,
    loading
  };
}
