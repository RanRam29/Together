import React, { useState } from "react";
import { View, Text, Alert, Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PrimaryButton, TextField } from "@/components/ui/Screen";
import { useParentInvitations } from "@/hooks/useParentInvitations";
import { useAuthStore } from "@/stores/auth-store";
import type { Child } from "@/lib/types";

export function SecondaryParentSettings({ child }: { child: Child }) {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?.id;
  const isPrimary = child.parent_id === currentUserId;
  const isSecondary = child.secondary_parent_id === currentUserId;
  const queryClient = useQueryClient();

  const [phone, setPhone] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferConfirmName, setTransferConfirmName] = useState("");
  const { inviteParent, updatePermissions, removeSecondaryParent, transferPrimaryRole, loading } = useParentInvitations();

  const { data: invitations } = useQuery({
    queryKey: ["parent_invitations", child.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_invitations")
        .select("*")
        .eq("child_id", child.id)
        .eq("status", "pending");
      if (error) throw error;
      return data;
    },
    enabled: isPrimary,
  });

  const pendingInvitation = invitations?.[0];

  const handleInvite = async () => {
    if (!phone) return;
    try {
      await inviteParent(child.id, phone);
      Alert.alert(t("success"), t("parent.invitationSent"));
      queryClient.invalidateQueries({ queryKey: ["parent_invitations", child.id] });
      setPhone("");
    } catch (err: any) {
      Alert.alert(t("error"), err.message);
    }
  };

  const handleRemove = async () => {
    Alert.alert(t("parent.removeSecondaryParent"), t("parent.removeSecondaryParentConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await removeSecondaryParent(child.id);
            queryClient.invalidateQueries({ queryKey: ["parent_invitations", child.id] });
          } catch (err: any) {
            Alert.alert(t("error"), err.message);
          }
        },
      },
    ]);
  };

  const togglePermission = async (key: "can_edit" | "can_approve" | "manage_visibility", value: boolean) => {
    const current = (child.secondary_parent_permissions as { can_edit?: boolean; can_approve?: boolean; manage_visibility?: boolean }) || { can_edit: false, can_approve: false, manage_visibility: false };
    const next = { 
      can_edit: current.can_edit ?? false, 
      can_approve: current.can_approve ?? false, 
      manage_visibility: current.manage_visibility ?? false,
      [key]: value 
    };
    try {
      await updatePermissions(child.id, next);
      queryClient.invalidateQueries({ queryKey: ["children", currentUserId] });
    } catch (err: any) {
      Alert.alert(t("error"), err.message);
    }
  };

  const handleTransfer = async () => {
    if (transferConfirmName !== child.first_name) {
      Alert.alert(t("error"), t("parent.transferNameMismatch", "שם הילד אינו תואם"));
      return;
    }
    try {
      await transferPrimaryRole(child.id);
      Alert.alert(t("success"), t("parent.transferSuccess", "הבעלות הועברה בהצלחה"));
      setIsTransferring(false);
      setTransferConfirmName("");
      queryClient.invalidateQueries({ queryKey: ["children", currentUserId] });
    } catch (err: any) {
      Alert.alert(t("error"), err.message);
    }
  };

  if (!isPrimary && !isSecondary) return null;

  return (
    <View className="mt-8 pt-6 border-t border-gray-200">
      <Text className="text-xl font-bold text-gray-900 text-start mb-4">
        {t("parent.secondaryParentTitle", "הורה נוסף / אפוטרופוס")}
      </Text>

      {isPrimary && !child.secondary_parent_id && !pendingInvitation && (
        <View className="bg-gray-50 p-4 rounded-xl">
          <Text className="text-gray-700 text-start mb-4">
            {t("parent.inviteSecondaryDesc", "תוכלו להזמין הורה נוסף שיצטרף לפרופיל הילד.")}
          </Text>
          <TextField
            label={t("parent.phoneNumber", "מספר טלפון")}
            placeholder="05X-XXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <View className="mt-2">
            <PrimaryButton label={t("parent.sendInvite", "שלח הזמנה")} onPress={handleInvite} loading={loading} />
          </View>
        </View>
      )}

      {isPrimary && pendingInvitation && (
        <View className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <Text className="text-amber-800 text-start font-semibold">
            {t("parent.invitationPending", "הזמנה ממתינה לאישור")}
          </Text>
          <Text className="text-amber-700 text-start mt-1 mb-4">
            {pendingInvitation.invited_phone}
          </Text>
          <PrimaryButton label={t("parent.cancelInvite", "ביטול הזמנה")} onPress={handleRemove} loading={loading} />
        </View>
      )}

      {child.secondary_parent_id && (
        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <Text className="text-blue-900 text-start font-semibold mb-2">
            {isPrimary ? t("parent.secondaryParentActive", "הורה שני מחובר") : t("parent.youAreSecondary", "אתה מחובר כהורה שני")}
          </Text>
          
          {isPrimary && (
            <View className="mt-4 border-t border-blue-200 pt-4">
              <Text className="text-blue-900 text-start font-medium mb-3">
                {t("parent.permissions", "הרשאות להורה השני:")}
              </Text>
              
              <View className="flex-row items-center justify-between mb-3">
                <Switch
                  value={(child.secondary_parent_permissions as any)?.can_edit ?? false}
                  onValueChange={(val) => togglePermission("can_edit", val)}
                  disabled={loading}
                />
                <Text className="text-gray-800 me-3">
                  {t("parent.canEdit", "יכול לערוך פרטים")}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <Switch
                  value={(child.secondary_parent_permissions as any)?.can_approve ?? false}
                  onValueChange={(val) => togglePermission("can_approve", val)}
                  disabled={loading}
                />
                <Text className="text-gray-800 me-3">
                  {t("parent.canApprove", "יכול לאשר בקשות שילוב")}
                </Text>
              </View>

              <View className="flex-row items-center justify-between mb-4">
                <Switch
                  value={(child.secondary_parent_permissions as any)?.manage_visibility ?? false}
                  onValueChange={(val) => togglePermission("manage_visibility", val)}
                  disabled={loading}
                />
                <Text className="text-gray-800 me-3">
                  {t("parent.manageVisibility", "יכול לנהל מי רואה מה בתיק")}
                </Text>
              </View>

              <PrimaryButton label={t("parent.removeSecondaryParent", "הסר הורה שני")} onPress={handleRemove} loading={loading} />
              
              <View className="mt-4 pt-4 border-t border-blue-200">
                {!isTransferring ? (
                  <Pressable onPress={() => setIsTransferring(true)} className="py-2 items-center">
                    <Text className="text-red-600 font-bold font-rubik text-base">{t("parent.transferPrimary", "העברת בעלות")}</Text>
                  </Pressable>
                ) : (
                  <View className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <Text className="text-red-800 font-bold mb-2 text-start">
                      {t("parent.transferPrimaryConfirmTitle", "האם אתה בטוח?")}
                    </Text>
                    <Text className="text-red-700 mb-4 text-start">
                      {t("parent.transferPrimaryConfirmDesc", "פעולה זו בלתי הפיכה ותהפוך אותך להורה משני. כדי לאשר, הקלד את שם הילד:")}
                    </Text>
                    <TextField
                      placeholder={child.first_name}
                      value={transferConfirmName}
                      onChangeText={setTransferConfirmName}
                    />
                    <View className="mt-4 flex-row gap-2 justify-end">
                      <Pressable onPress={() => setIsTransferring(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                        <Text className="text-gray-800 font-bold">{t("cancel", "ביטול")}</Text>
                      </Pressable>
                      <Pressable onPress={handleTransfer} className="px-4 py-2 bg-red-600 rounded-lg" disabled={loading}>
                        <Text className="text-white font-bold">{t("confirm", "אישור")}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
