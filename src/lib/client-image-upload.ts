const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "gymfinder-admin-2024";

export type ClientImageUploadType =
  | "cover"
  | "gallery"
  | "coach"
  | "coach_cert"
  | "event_cover"
  | "payment_proof"
  | "equipment"
  | "transformation"
  | "success_story";

export function uploadImageWithProgress(
  file: File,
  type: ClientImageUploadType,
  onProgress: (pct: number) => void,
  authMode: "admin-secret" | "cookie" = "admin-secret"
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error ?? "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("POST", "/api/admin/upload");
    if (authMode === "admin-secret") {
      xhr.setRequestHeader("x-admin-secret", ADMIN_SECRET);
    }
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
