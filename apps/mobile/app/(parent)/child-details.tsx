import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { PrimaryButton, ScreenShell, TextField } from "@/components/ui/Screen";
import { SecondaryParentSettings } from "@/components/parent/SecondaryParentSettings";
import {
  useChildDetails,
  useUpsertChildDetails } from "@/hooks/useChildDetails";
import { useChildren } from "@/hooks/useChildren";
import { useScreenshotProtection } from "@/hooks/useScreenshotProtection";
import { errorMessage, showError, showSuccess } from "@/lib/feedback";
import { useAuthStore } from "@/stores/auth-store";
import { BrandSpinner } from "@/components/motion/BrandSpinner";

export default function ChildDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const parentId = session?.user?.id;
  const params = useLocalSearchParams<{ childId?: string }>();
  const { children, selectedChild } = useChildren(parentId);
  const childId =
    params.childId ?? selectedChild?.id ?? children[0]?.id ?? undefined;

  const isSecondary = selectedChild?.secondary_parent_id === parentId;
  const canEdit = (selectedChild?.secondary_parent_permissions as any)?.can_edit ?? false;

  useScreenshotProtection(childId);

  const { data: details, isLoading } = useChildDetails(childId);
  const upsert = useUpsertChildDetails(childId);

  const [diagnosisFull, setDiagnosisFull] = useState("");
  const [whatWorks, setWhatWorks] = useState("");
  const [whatTriggers, setWhatTriggers] = useState("");
  const [winDefinition, setWinDefinition] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!details) {
      setDiagnosisFull("");
      setWhatWorks("");
      setWhatTriggers("");
      setWinDefinition("");
      setNotes("");
      return;
    }
    setDiagnosisFull(details.diagnosis_full ?? "");
    setWhatWorks(details.what_works ?? "");
    setWhatTriggers(details.what_triggers ?? "");
    setWinDefinition(details.win_definition ?? "");
    setNotes(details.notes ?? "");
  }, [details]);

  async function handleSave() {
    if (!childId) {
      showError(t("parent.noChildProfile"));
      return;
    }

    try {
      await upsert.mutateAsync({
        diagnosis_full: diagnosisFull.trim() || null,
        what_works: whatWorks.trim() || null,
        what_triggers: whatTriggers.trim() || null,
        win_definition: winDefinition.trim() || null,
        notes: notes.trim() || null });
      showSuccess({ title: t("parent.detailsSaved") });
    } catch (err) {
      showError(errorMessage(err, t("common.tryAgain")));
    }
  }

  if (!childId) {
    return (
      <ScreenShell title={t("parent.detailsTitle")}>
        <View className="bg-surface border border-border rounded-card p-5">
          <Text className="text-ink-2 text-center leading-6">
            {t("parent.noChildProfile")}
          </Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      eyebrow={t("parent.detailsEyebrow")}
      title={t("parent.detailsTitle")}
      subtitle={t("parent.detailsSubtitle")}
      showBack
      backFallbackHref="/(parent)/(tabs)"
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <BrandSpinner size="large" />
        ) : (
          <>
            <View className="bg-purple-bg rounded-card px-4 py-3 mb-5">
              <Text className="text-purple-ink text-sm leading-5">
                {t("parent.detailsPrivacyNote")}
              </Text>
            </View>

            <TextField
              label={t("parent.diagnosisLabel")}
              placeholder={t("parent.diagnosisPlaceholder")}
              value={diagnosisFull}
              onChangeText={setDiagnosisFull}
              editable={!(isSecondary && !canEdit)}
              multiline
              numberOfLines={3}
              className="min-h-[100px]"
              textAlignVertical="top"
            />

            <TextField
              label={t("parent.whatWorksLabel")}
              placeholder={t("parent.whatWorksPlaceholder")}
              value={whatWorks}
              onChangeText={setWhatWorks}
              editable={!(isSecondary && !canEdit)}
              multiline
              numberOfLines={3}
              className="min-h-[100px]"
              textAlignVertical="top"
            />

            <TextField
              label={t("parent.whatTriggersLabel")}
              placeholder={t("parent.whatTriggersPlaceholder")}
              value={whatTriggers}
              onChangeText={setWhatTriggers}
              editable={!(isSecondary && !canEdit)}
              multiline
              numberOfLines={3}
              className="min-h-[100px]"
              textAlignVertical="top"
            />

            <TextField
              label={t("parent.winDefinitionLabel")}
              placeholder={t("parent.winDefinitionPlaceholder")}
              value={winDefinition}
              onChangeText={setWinDefinition}
              editable={!(isSecondary && !canEdit)}
              multiline
              numberOfLines={3}
              className="min-h-[100px]"
              textAlignVertical="top"
            />

            <TextField
              label={t("parent.notesLabel")}
              placeholder={t("parent.notesPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              editable={!(isSecondary && !canEdit)}
              multiline
              numberOfLines={3}
              className="min-h-[100px]"
              textAlignVertical="top"
            />

            <View className="pb-10 mt-2">
              <PrimaryButton
                label={t("parent.saveDetails")}
                onPress={handleSave}
                loading={upsert.isPending}
                disabled={isSecondary && !canEdit}
              />
            </View>
            
            {selectedChild && <SecondaryParentSettings child={selectedChild} />}
          </>
        )}
      </ScrollView>
    </ScreenShell>
  );
}
