import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/Form";
import { AdminMfaModal } from "@/components/admin/AdminMfaModal";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { useAdminMfa } from "@/hooks/useAdminMfa";
import {
  useAdminNotes,
  useAdminUser,
  useAdminUserLogin,
  useRestoreUser,
  useSetUserEmail,
  useSetUserPassword,
  useSuspendUser,
} from "@/hooks/useAdminUsers";

export default function AdminUserDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = typeof id === "string" ? id : id?.[0];
  const { isAdmin, isReady } = useStaffRoute();
  const mfa = useAdminMfa(isAdmin);

  const { data: user, isLoading } = useAdminUser(userId);
  const { data: login } = useAdminUserLogin(userId);
  const { data: notes = [] } = useAdminNotes(userId);
  const suspend = useSuspendUser();
  const restore = useRestoreUser();
  const setPassword = useSetUserPassword();
  const setEmail = useSetUserEmail();

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmailValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setEmailValue(login?.email ?? "");
  }, [login?.email]);

  useEffect(() => {
    if (isReady && !isAdmin) {
      router.replace("/(staff)/verification" as never);
    }
  }, [isReady, isAdmin, router]);

  function handleSuspend() {
    if (!userId || !reason.trim()) return;
    suspend.mutate(
      { userId, reason: reason.trim() },
      {
        onSuccess: () => {
          setSuspendOpen(false);
          setReason("");
          Alert.alert(t("staff.suspendSuccess"));
        },
        onError: (err) => {
          if (mfa.handleRpcError(err)) return;
          Alert.alert(
            t("common.error"),
            err instanceof Error ? err.message : t("common.tryAgain"),
          );
        },
      },
    );
  }

  function handleRestore() {
    if (!userId) return;
    restore.mutate(userId, {
      onSuccess: () => Alert.alert(t("staff.restoreSuccess")),
      onError: (err) => {
        if (mfa.handleRpcError(err)) return;
        Alert.alert(
          t("common.error"),
          err instanceof Error ? err.message : t("common.tryAgain"),
        );
      },
    });
  }

  function handleSetEmail() {
    if (!userId) return;
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      Alert.alert(t("common.error"), t("staff.invalidEmail"));
      return;
    }

    setEmail.mutate(
      { userId, email: trimmed },
      {
        onSuccess: () => Alert.alert(t("staff.emailUpdated")),
        onError: (err) => {
          if (mfa.handleRpcError(err)) return;
          Alert.alert(
            t("common.error"),
            err instanceof Error ? err.message : t("common.tryAgain"),
          );
        },
      },
    );
  }

  function handleSetPassword() {
    if (!userId) return;
    if (newPassword.length < 8) {
      Alert.alert(t("common.error"), t("staff.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("staff.passwordMismatch"));
      return;
    }

    setPassword.mutate(
      { userId, password: newPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          setConfirmPassword("");
          Alert.alert(t("staff.passwordChanged"));
        },
        onError: (err) => {
          if (mfa.handleRpcError(err)) return;
          Alert.alert(
            t("common.error"),
            err instanceof Error ? err.message : t("common.tryAgain"),
          );
        },
      },
    );
  }

  if (!isReady || !isAdmin || isLoading || !user) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#534AB7" />
      </View>
    );
  }

  const isSuspended = Boolean(user.suspended_at);

  return (
    <>
      <ScrollView className="flex-1 px-6 py-6">
        <Pressable
          onPress={() => router.back()}
          className="self-end mb-4 active:opacity-80"
        >
          <Text className="text-purple font-semibold font-rubik">
            {t("common.back")}
          </Text>
        </Pressable>

        <Text className="text-2xl font-bold text-ink mb-2 font-rubik text-right">
          {user.full_name ?? "—"}
        </Text>
        <Text className="text-sm text-ink-2 text-right mb-1">
          {t(`staff.roleFilter.${user.role}`)} · {user.area ?? "—"}
        </Text>
        <Text className="text-sm text-ink-2 text-right mb-6">{user.phone}</Text>

        <View className="bg-surface border border-border rounded-card p-4 mb-6">
          <Text className="text-base font-bold text-ink mb-1 font-rubik text-right">
            {t("staff.loginCredentials")}
          </Text>
          <Text className="text-xs text-ink-3 mb-4 text-right leading-5">
            {t("staff.loginCredentialsHint")}
          </Text>
          <TextField
            label={t("staff.emailAddress")}
            value={email}
            onChangeText={setEmailValue}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            textAlign="right"
            placeholder={t("staff.emailPlaceholder")}
          />
          <PrimaryButton
            label={t("staff.updateEmail")}
            onPress={handleSetEmail}
            loading={setEmail.isPending}
            disabled={!email.trim() || setEmail.isPending}
          />
          <Text className="text-xs text-ink-3 text-right mt-4 mb-1 font-rubik">
            {t("staff.username")}
          </Text>
          <Text className="text-sm text-ink text-right font-rubik">
            {login?.username ?? "—"}
          </Text>
        </View>

        <View className="bg-surface border border-border rounded-card p-4 mb-6">
          <Text className="text-base font-bold text-ink mb-3 font-rubik text-right">
            {t("staff.changePassword")}
          </Text>
          <TextField
            label={t("staff.newPassword")}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            textAlign="right"
          />
          <TextField
            label={t("staff.confirmPassword")}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            textAlign="right"
          />
          <PrimaryButton
            label={t("staff.updatePassword")}
            onPress={handleSetPassword}
            loading={setPassword.isPending}
            disabled={
              !newPassword.trim() ||
              !confirmPassword.trim() ||
              setPassword.isPending
            }
          />
        </View>

        {isSuspended ? (
          <View className="bg-coral-bg border border-coral rounded-card p-4 mb-4">
            <Text className="text-coral text-right font-semibold">
              {t("staff.suspendedSince", {
                date: user.suspended_at
                  ? new Date(user.suspended_at).toLocaleDateString("he-IL")
                  : "",
              })}
            </Text>
          </View>
        ) : null}

        <View className="mb-6">
          {!isSuspended ? (
            <PrimaryButton
              label={t("staff.suspend")}
              onPress={() => setSuspendOpen(true)}
              variant="teal"
            />
          ) : (
            <PrimaryButton
              label={t("staff.restore")}
              onPress={handleRestore}
              loading={restore.isPending}
            />
          )}
        </View>

        <Text className="text-base font-bold text-ink mb-3 font-rubik text-right">
          {t("staff.adminNotes")}
        </Text>
        {notes.length === 0 ? (
          <Text className="text-sm text-ink-2 text-right mb-8">
            {t("staff.noNotes")}
          </Text>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              className="bg-surface border border-border rounded-card p-3 mb-2"
            >
              <Text className="text-sm text-ink text-right leading-5">
                {note.note}
              </Text>
              <Text className="text-xs text-ink-2 text-right mt-2">
                {new Date(note.created_at).toLocaleString("he-IL")}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={suspendOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-bg rounded-card p-6 border border-border">
            <Text className="text-lg font-bold text-ink mb-3 text-right font-rubik">
              {t("staff.suspendTitle")}
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t("staff.suspendReason")}
              placeholderTextColor="#918D84"
              multiline
              className="bg-surface border border-border rounded-card px-4 py-3 text-ink text-right min-h-[80px] mb-4"
            />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <PrimaryButton
                  label={t("common.cancel")}
                  onPress={() => setSuspendOpen(false)}
                  variant="teal"
                  fullWidth
                />
              </View>
              <View className="flex-1">
                <PrimaryButton
                  label={t("staff.suspend")}
                  onPress={handleSuspend}
                  loading={suspend.isPending}
                  disabled={!reason.trim()}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <AdminMfaModal
        visible={mfa.showModal}
        onClose={() => mfa.setShowModal(false)}
        onVerified={mfa.onVerified}
      />
    </>
  );
}
