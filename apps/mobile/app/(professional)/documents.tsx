import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { PrimaryButton, ScreenShell } from "@/components/ui/Screen";
import type { DocumentType } from "@/lib/api/documents";
import { pickDocumentOrImage, uploadPickedDocument } from "@/lib/uploads";
import { useDeleteDocument, useDocuments } from "@/hooks/useDocuments";
import { useAuthStore } from "@/stores/auth-store";

const DOC_TYPES: DocumentType[] = [
  "certificate",
  "criminal_record",
  "id_card",
  "degree",
  "other",
];

export default function ProfessionalDocumentsScreen() {
  const { t } = useTranslation();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  const { data: documents = [], isLoading, refetch } = useDocuments(userId);
  const del = useDeleteDocument(userId);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  async function handleUpload(docType: DocumentType) {
    if (!userId) return;

    try {
      const file = await pickDocumentOrImage();
      if (!file) return;

      setUploadingType(docType);
      await uploadPickedDocument(userId, docType, file);
      await refetch();
      Alert.alert(t("professional.uploadSuccess"));
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const message =
        raw === "FILE_TOO_LARGE"
          ? t("professional.uploadTooLarge")
          : raw;
      Alert.alert(t("common.error"), message);
    } finally {
      setUploadingType(null);
    }
  }

  function handleDelete(id: string, storagePath: string) {
    Alert.alert(
      t("professional.deleteDocumentTitle"),
      t("professional.deleteDocumentConfirm"),
      [
        { text: t("common.tryAgain"), style: "cancel" },
        {
          text: t("professional.deleteDocumentAction"),
          style: "destructive",
          onPress: () => {
            del.mutate(
              { id, storagePath },
              {
                onError: (err) => {
                  const message =
                    err instanceof Error ? err.message : t("common.tryAgain");
                  Alert.alert(t("common.error"), message);
                },
              },
            );
          },
        },
      ],
    );
  }

  return (
    <ScreenShell
      eyebrow={t("professional.documentsEyebrow")}
      title={t("professional.documentsTitle")}
      subtitle={t("professional.documentsSubtitle")}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-sm font-bold text-purple mb-3 font-rubik">
            {t("professional.uploadNewDocument")}
          </Text>
          {DOC_TYPES.map((docType) => {
            const uploading = uploadingType === docType;
            return (
              <Pressable
                key={docType}
                onPress={() => handleUpload(docType)}
                disabled={uploading || uploadingType !== null}
                className={`bg-surface border border-border rounded-card px-4 py-4 mb-2 flex-row items-center justify-between active:opacity-90 ${
                  uploadingType !== null && !uploading ? "opacity-50" : ""
                }`}
              >
                <Text className="text-base font-medium text-ink">
                  {t(`professional.docTypes.${docType}`)}
                </Text>
                {uploading ? (
                  <ActivityIndicator size="small" color="#534AB7" />
                ) : (
                  <Text className="text-purple text-sm font-semibold font-rubik">
                    + {t("professional.uploadNow")}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <Text className="text-sm font-bold text-purple mb-3 font-rubik">
          {t("professional.myDocuments")}
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0F6E56" className="mt-4" />
        ) : documents.length === 0 ? (
          <View className="bg-surface border border-border rounded-card p-5">
            <Text className="text-ink-2 text-center leading-6">
              {t("professional.noDocuments")}
            </Text>
          </View>
        ) : (
          documents.map((doc) => (
            <View
              key={doc.id}
              className="bg-surface border border-border rounded-card p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold text-ink font-rubik">
                  {t(`professional.docTypes.${doc.doc_type}`)}
                </Text>
                <Text
                  className={`text-sm font-semibold ${
                    doc.verified ? "text-teal" : "text-amber"
                  }`}
                >
                  {doc.verified
                    ? t("professional.docVerified")
                    : t("professional.docPending")}
                </Text>
              </View>
              {doc.file_name ? (
                <Text className="text-sm text-ink-2 mb-3">{doc.file_name}</Text>
              ) : null}
              {doc.rejection_note ? (
                <Text className="text-sm text-coral leading-5 mb-3">
                  {doc.rejection_note}
                </Text>
              ) : null}
              <Pressable
                onPress={() => handleDelete(doc.id, doc.storage_path)}
                className="self-start rounded-full px-4 py-2 border border-coral active:opacity-90"
              >
                <Text className="text-coral text-sm font-semibold font-rubik">
                  {t("professional.deleteDocumentAction")}
                </Text>
              </Pressable>
            </View>
          ))
        )}

        <View className="pb-10 mt-4">
          <PrimaryButton
            label={t("common.tryAgain")}
            onPress={() => refetch()}
            variant="teal"
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}
