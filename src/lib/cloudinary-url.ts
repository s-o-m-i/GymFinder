/** Pure URL helpers — safe for client and server components */

export function optimizeCloudinaryUrl(
  url: string,
  opts?: { width?: number; height?: number; quality?: number }
): string {
  if (!url.includes("res.cloudinary.com")) return url;

  const { width, height, quality = 80 } = opts ?? {};
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transforms: string[] = ["f_auto", "q_auto", `q_${quality}`];
  if (width)  transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`, "c_fill");

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
