import React from "react";
import { View, Text, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useMyParentInvitations, useParentInvitations } from "@/hooks/useParentInvitations";
import { PrimaryButton } from "@/components/ui/Screen";
import { useAuthStore } from "@/stores/auth-store";

export function PendingInvitations() {
  const { t } = useTranslation();
  const { data: invitations, isLoading } = useMyParentInvitations();
  const { acceptInvitation, loading: accepting } = useParentInvitations();
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);

  if (isLoading || !invitations || invitations.length === 0) return null;

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      Alert.alert(t("success"), t("parent.invitationAccepted", "ההזמנה התקבלה בהצלחה!"));
      queryClient.invalidateQueries({ queryKey: ["my_parent_invitations", session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ["children", session?.user?.id] });
    } catch (err: any) {
      Alert.alert(t("error"), err.message);
    }
  };

  return (
    <View className="mb-6 space-y-4">
      {invitations.map((inv: any) => (
        <View key={inv.id} className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <Text className="text-amber-900 text-right font-bold text-lg mb-1">
            {t("parent.youAreInvited", "הוזמנת להצטרף לפרופיל")}
          </Text>
          <Text className="text-amber-800 text-right mb-4">
            {t("parent.invitedToChild", "הוזמנת לשמש כהורה נוסף עבור {{name}}", {
              name: inv.child?.first_name || "הילד",
            })}
          </Text>
          <PrimaryButton
            label={t("parent.acceptInvitation", "קבל הזמנה")}
            onPress={() => handleAccept(inv.id)}
            loading={accepting}
          />
        </View>
      ))}
    </View>
  );
}
