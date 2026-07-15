import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { StaffFilterSelect } from "@/components/admin/StaffFilterSelect";
import { StaffQueryFeedback } from "@/components/admin/StaffQueryFeedback";
import { useStaffRoute } from "@/hooks/useStaffRoute";
import { useAdminAudit, useAuditFilterOptions } from "@/hooks/useAdminAudit";
import { BrandSpinner } from "@/components/motion/BrandSpinner";
import { colors } from "@/lib/theme";


export default function AdminAuditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAdmin, isReady } = useStaffRoute();
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [search, setSearch] = useState("");

  const filters = { action, resource, search };
  const { data: rows = [], isLoading, isError, error, refetch, isRefetching } =
    useAdminAudit(filters);
  const filterOptions = useAuditFilterOptions();

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
      className="flex-1 px-6 py-6"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching || filterOptions.isRefetching}
          onRefresh={() => {
            void refetch();
            void filterOptions.refetch();
          }}
          tintColor={colors.purple}
          colors={[colors.purple]}
        />
      }
    >
      <Text className="text-2xl font-bold text-ink mb-2 font-rubik text-right">
        {t("staff.auditTitle")}
      </Text>
      <Text className="text-sm text-ink-2 mb-4 text-right">
        {t("staff.auditSubtitle")}
      </Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t("staff.auditSearch")}
        placeholderTextColor="#918D84"
        className="bg-surface border border-border rounded-card px-4 py-3 text-ink text-right mb-3"
      />

      <View className="flex-row gap-3 mb-4 items-start">
        <StaffFilterSelect
          label={t("staff.auditActionFilter")}
          placeholder={t("staff.auditActionFilter")}
          allLabel={t("staff.auditFilterAll")}
          value={action}
          options={filterOptions.data?.actions ?? []}
          onChange={setAction}
        />
        <StaffFilterSelect
          label={t("staff.auditResourceFilter")}
          placeholder={t("staff.auditResourceFilter")}
          allLabel={t("staff.auditFilterAll")}
          value={resource}
          options={filterOptions.data?.resources ?? []}
          onChange={setResource}
        />
      </View>

      <StaffQueryFeedback
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyMessage={t("staff.auditEmpty")}
        onRetry={() => void refetch()}
      />

      {!isLoading && !isError && rows.length > 0
        ? rows.map((row) => (
          <View
            key={row.id}
            className="bg-surface border border-border rounded-card p-4 mb-3"
          >
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-ink-2">
                {new Date(row.created_at).toLocaleString("he-IL")}
              </Text>
              <Text className="text-sm font-bold text-purple font-rubik">
                {row.action}
              </Text>
            </View>
            <Text className="text-sm text-ink text-right mb-1">
              {row.resource}
              {row.resource_id ? ` · ${row.resource_id.slice(0, 8)}…` : ""}
            </Text>
            {row.tier != null ? (
              <Text className="text-xs text-ink-2 text-right">
                TIER {row.tier}
              </Text>
            ) : null}
          </View>
        ))
        : null}
      <View className="h-8" />
    </ScrollView>
  );
}
