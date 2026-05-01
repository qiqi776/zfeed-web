import { uploadApi, type UploadScene } from "../api/uploads";
import { isMockEnabled } from "./runtimeFlags";

const MB = 1024 * 1024;

const sceneRules = {
  "article-cover": {
    accept: ".jpg,.jpeg,.png,.webp",
    maxBytes: 10 * MB,
    allowedExt: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "article-image": {
    accept: ".jpg,.jpeg,.png,.webp",
    maxBytes: 10 * MB,
    allowedExt: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "video-cover": {
    accept: ".jpg,.jpeg,.png,.webp",
    maxBytes: 10 * MB,
    allowedExt: [".jpg", ".jpeg", ".png", ".webp"],
  },
  "video-source": {
    accept: ".mp4,.mov,.m4v,.webm",
    maxBytes: 512 * MB,
    allowedExt: [".mp4", ".mov", ".m4v", ".webm"],
  },
} as const satisfies Record<
  UploadScene,
  {
    accept: string;
    maxBytes: number;
    allowedExt: string[];
  }
>;

const mimeFallbackExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "video/x-m4v": ".m4v",
};

export interface UploadedAsset {
  url: string;
  objectKey: string;
}

export function getUploadAccept(scene: UploadScene) {
  return sceneRules[scene].accept;
}

export function getUploadSizeHint(scene: UploadScene) {
  const maxMb = Math.round(sceneRules[scene].maxBytes / MB);
  if (scene === "video-source") {
    return `Supports MP4, MOV, M4V and WebM up to ${maxMb}MB.`;
  }
  return `Supports JPG, PNG and WebP up to ${maxMb}MB.`;
}

export function validateUploadFile(scene: UploadScene, file: File) {
  const rule = sceneRules[scene];
  const ext = getFileExtension(file);

  if (!ext || !rule.allowedExt.some((allowedExt) => allowedExt === ext)) {
    return `Unsupported file type for ${scene}.`;
  }
  if (file.size <= 0) {
    return "The selected file is empty.";
  }
  if (file.size > rule.maxBytes) {
    const maxMb = Math.round(rule.maxBytes / MB);
    return `File is too large. Maximum size is ${maxMb}MB.`;
  }

  return null;
}

export async function uploadContentAsset(
  scene: UploadScene,
  file: File,
): Promise<UploadedAsset> {
  const validationError = validateUploadFile(scene, file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (isMockEnabled) {
    return {
      url: await readFileAsDataUrl(file),
      objectKey: `mock/${scene}/${Date.now()}-${file.name}`,
    };
  }

  const fileExt = getFileExtension(file);
  if (!fileExt) {
    throw new Error("Could not determine the file extension.");
  }

  const credentials = await uploadApi.getUploadCredentials({
    scene,
    file_ext: fileExt,
    file_size: file.size,
    file_name: file.name,
  });

  const formData = new FormData();
  for (const [key, value] of Object.entries(credentials.form_data)) {
    if (value) {
      formData.append(key, value);
    }
  }
  formData.append("file", file, file.name);

  const response = await fetch(credentials.form_data.host, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed. Please try again.");
  }

  return {
    url: credentials.url,
    objectKey: credentials.object_key,
  };
}

export async function createVideoPosterFile(file: File) {
  const localUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = localUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () =>
        reject(new Error("Failed to load the selected video file."));
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not create a canvas to capture the video cover.");
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      throw new Error("Failed to generate a cover image from the video.");
    }

    const baseName = stripFileExtension(file.name) || "video-cover";
    return new File([blob], `${baseName}-cover.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(localUrl);
  }
}

export function createLocalObjectUrl(file: File) {
  return URL.createObjectURL(file);
}

function getFileExtension(file: File) {
  const fileName = file.name.toLowerCase();
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex >= 0) {
    return fileName.slice(lastDotIndex);
  }
  return mimeFallbackExt[file.type] || "";
}

function stripFileExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsDataURL(file);
  });
}
