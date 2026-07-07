import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import {
  createDocumentRecord,
  uploadDocumentFile,
  type DocumentType,
} from "@/lib/api/documents";

export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export async function pickDocumentOrImage(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "application/pdf"],
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name ?? "document",
    mimeType: asset.mimeType ?? "application/octet-stream",
    size: asset.size,
  };
}

export async function pickImageFromLibrary(): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Media library permission denied");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: false,
    exif: false,
  });

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const inferredName =
    asset.fileName ??
    asset.uri.split("/").pop() ??
    `image-${Date.now()}.jpg`;
  return {
    uri: asset.uri,
    name: inferredName,
    mimeType: asset.mimeType ?? "image/jpeg",
    size: asset.fileSize,
  };
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Upload a picked file to the documents Storage bucket and create a
 * matching `document_uploads` row. Returns the created row's storage path.
 */
export async function uploadPickedDocument(
  userId: string,
  docType: DocumentType,
  file: PickedFile,
): Promise<string> {
  if (file.size && file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const response = await fetch(file.uri);
  if (!response.ok) {
    throw new Error(`Failed to read file: ${response.status}`);
  }
  const blob = await response.blob();

  const storagePath = await uploadDocumentFile(
    userId,
    file.name,
    blob,
    file.mimeType,
  );

  await createDocumentRecord({
    owner_id: userId,
    doc_type: docType,
    storage_path: storagePath,
    file_name: file.name,
  });

  return storagePath;
}
