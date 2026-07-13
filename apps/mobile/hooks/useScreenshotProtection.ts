import { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { supabase } from '@/lib/supabase';

export function useScreenshotProtection(childId?: string) {
  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

    void ScreenCapture.preventScreenCaptureAsync();
    return () => {
      void ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !childId) return;

    const subscription = ScreenCapture.addScreenshotListener(async () => {
      try {
        const { error } = await supabase.rpc('log_screenshot_event', { p_child_id: childId });
        if (error) {
          console.error('Failed to log screenshot event:', error);
        }
        Alert.alert(
          'שמירה על פרטיות',
          'זיהינו צילום מסך. אנא זכרו שהמידע המוצג כאן הוא אישי ורגיש ויש לשמור על פרטיות הילד.',
          [{ text: 'הבנתי' }]
        );
      } catch (error) {
        console.error('Error in screenshot listener:', error);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [childId]);
}
