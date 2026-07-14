import AsyncStorage from "@react-native-async-storage/async-storage";

const SMART_LANDING_KEY = "nba_smart_landing_enabled";

export async function isSmartLandingEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(SMART_LANDING_KEY);
  return value !== "false";
}

export async function setSmartLandingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(SMART_LANDING_KEY, enabled ? "true" : "false");
}
