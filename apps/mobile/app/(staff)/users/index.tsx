import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { StaffQueryFeedback } from "@/components/admin/StaffQueryFeedback";
import type { AdminUserFilters } from "@/lib/api/admin-users";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { BrandSpinner } from "@/components/motion/BrandSpinner";

const ROLE_FILTERS: AdminUserFilters["role"][] = [
  "all",
  "parent",
  "professional",
  "supervisor",
  "admin",
];

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin, isReady } = useStaffRoute();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminUserFilters["role"]>("all");
  const [suspendedOnly, setSuspendedOnly] = useState(false);

  const filters: AdminUserFilters = { search, role, suspendedOnly };
  const { data: users = [], isLoading, isError, error, refetch, isRefetching } =
    useAdminUsers(filters);

  useEffect(() => {
    if (isReady && !isAdmin) {
      router.replace("/(staff)/verification" as never);
    }
  }, [isReady, isAdmin, router]);

  if (!isReady || !isAdmin) {
    return (
      <View className="flex-1 items-center justify-center">
        <BrandSpinner size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 px-6 py-8"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch}
          tintColor="#534ab7"
          colors={["#534ab7"]}
        />
      }
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-[30px] leading-[38px] font-bold text-[#1c1b22] font-rubik text-right">
          {t("staff.usersTitle", "ניהול משתמשים")}
        </Text>
      </View>

      <View className="flex-col md:flex-row-reverse justify-between items-start md:items-center mb-6 gap-4">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("staff.usersSearch", "חיפוש משתמשים...")}
          placeholderTextColor="#787584"
          className="bg-white border border-[#e5e1eb] rounded-[14px] px-4 py-3 text-[#1c1b22] text-right w-full md:w-64"
        />

        <View className="flex-row flex-wrap justify-end gap-2 w-full md:w-auto">
          {ROLE_FILTERS.map((r) => (
            <Pressable
              key={r ?? "all"}
              onPress={() => setRole(r)}
              className={`px-4 py-2 rounded-full border ${
                role === r
                  ? "bg-[#534ab7] border-[#534ab7]"
                  : "bg-white border-[#e5e1eb]"
              }`}
            >
              <Text
                className={`text-sm font-semibold font-rubik ${
                  role === r ? "text-white" : "text-[#474553]"
                }`}
              >
                {t(`staff.roleFilter.${r ?? "all"}`)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setSuspendedOnly((v) => !v)}
            className={`px-4 py-2 rounded-full border ${
              suspendedOnly
                ? "bg-[#ffdad6] border-[#ba1a1a]"
                : "bg-white border-[#e5e1eb]"
            }`}
          >
            <Text
              className={`text-sm font-semibold font-rubik ${
                suspendedOnly ? "text-[#93000a]" : "text-[#474553]"
              }`}
            >
              {t("staff.suspendedOnly", "מושהים בלבד")}
            </Text>
          </Pressable>
        </View>
      </View>

      <StaffQueryFeedback
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && users.length === 0}
        emptyMessage={t("staff.usersEmpty", "לא נמצאו משתמשים.")}
        onRetry={() => void refetch()}
      />

      {!isLoading && !isError && users.length > 0 ? (
        <View className="w-full">
          <View className="hidden md:flex flex-col w-full bg-white border border-[#e5e1eb] rounded-[14px] overflow-hidden shadow-sm shadow-[#3b309e]/5">
            <View className="flex-row-reverse border-b border-[#e5e1eb] bg-[#fcf8ff] p-4">
              <Text className="flex-2 font-bold text-[#474553] text-right font-rubik px-2 w-[25%]">שם</Text>
              <Text className="flex-1 font-bold text-[#474553] text-right font-rubik px-2 w-[20%]">תפקיד</Text>
              <Text className="flex-1 font-bold text-[#474553] text-right font-rubik px-2 w-[20%]">טלפון</Text>
              <Text className="flex-1 font-bold text-[#474553] text-right font-rubik px-2 w-[15%]">אזור</Text>
              <Text className="flex-1 font-bold text-[#474553] text-right font-rubik px-2 w-[10%]">סטטוס</Text>
              <Text className="flex-1 font-bold text-[#474553] text-center font-rubik px-2 w-[10%]">פעולות</Text>
            </View>
            {users.map((user, idx) => (
              <View key={user.id} className={`flex-row-reverse p-4 items-center ${idx !== users.length - 1 ? 'border-b border-[#f0ecf6]' : ''}`}>
                <Text className="flex-2 text-[#1c1b22] font-semibold text-right font-rubik px-2 w-[25%]">{user.full_name ?? "—"}</Text>
                <Text className="flex-1 text-[#474553] text-right font-rubik px-2 w-[20%]">{t(`staff.roleFilter.${user.role}`)}</Text>
                <Text className="flex-1 text-[#474553] text-right font-rubik px-2 w-[20%]">{user.phone}</Text>
                <Text className="flex-1 text-[#474553] text-right font-rubik px-2 w-[15%]">{user.area ?? "—"}</Text>
                <View className="flex-1 px-2 w-[10%] items-end">
                  {user.suspended_at ? (
                    <View className="bg-[#ffdad6] px-2 py-1 rounded-full"><Text className="text-xs text-[#93000a] font-semibold font-rubik">מושהה</Text></View>
                  ) : (
                    <View className="bg-[#a0f3d4] px-2 py-1 rounded-full"><Text className="text-xs text-[#002117] font-semibold font-rubik">פעיל</Text></View>
                  )}
                </View>
                <View className="flex-1 px-2 w-[10%] items-center">
                  <Pressable
                    onPress={() => router.push(`/(staff)/users/${user.id}` as never)}
                    className="bg-[#534ab7] px-4 py-2 rounded-[8px] active:opacity-80"
                  >
                    <Text className="text-white text-xs font-semibold font-rubik">נהל</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View className="md:hidden flex-col w-full">
            {users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => router.push(`/(staff)/users/${user.id}` as never)}
                className="bg-white border border-[#e5e1eb] rounded-[14px] p-4 mb-3 active:opacity-90 shadow-sm shadow-[#3b309e]/5"
              >
                <View className="flex-row-reverse justify-between items-start mb-2">
                  <Text className="text-lg font-bold text-[#1c1b22] font-rubik text-right flex-1">
                    {user.full_name ?? "—"}
                  </Text>
                  {user.suspended_at ? (
                    <View className="bg-[#ffdad6] px-2 py-1 rounded-full ml-2">
                      <Text className="text-xs text-[#93000a] font-semibold font-rubik">מושהה</Text>
                    </View>
                  ) : (
                    <View className="bg-[#a0f3d4] px-2 py-1 rounded-full ml-2">
                      <Text className="text-xs text-[#002117] font-semibold font-rubik">פעיל</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-[#474553] text-right font-rubik mb-1">
                  {t(`staff.roleFilter.${user.role}`)} · {user.area ?? "—"}
                </Text>
                <Text className="text-sm text-[#474553] text-right font-rubik">{user.phone}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      
      <View className="h-12" />
    </ScrollView>
  );
}
