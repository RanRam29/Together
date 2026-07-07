import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";

import { supabase } from "@/lib/supabase";

export interface CheckinResult {
  checkin_id: string;
  is_valid: boolean;
  distance_m: number;
}

export function useCheckin(matchId: string) {
  const queryClient = useQueryClient();
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      // 1. Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      // 2. Fetch current high-accuracy coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Invoke Postgres RPC function verify_checkin
      const { data, error } = await supabase.rpc("verify_checkin", {
        p_match_id: matchId,
        p_latitude: latitude,
        p_longitude: longitude,
      });

      if (error) {
        throw new Error(error.message);
      }

      // verify_checkin returns a table, so data is an array
      if (!data || data.length === 0) {
        throw new Error("Failed to verify check-in");
      }

      return data[0] as CheckinResult;
    },
    onSuccess: (result) => {
      setCheckinResult(result);
      // Invalidate checkin cache queries to update lists/status
      queryClient.invalidateQueries({ queryKey: ["checkins", matchId] });
    },
  });

  return {
    checkIn: mutation.mutateAsync,
    isPending: mutation.isPending,
    checkinResult,
    error: mutation.error,
  };
}
