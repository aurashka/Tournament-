import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IMGBB_API_KEY = "5fd2a4346ac2e5485a916a5d734d508b";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data.url;
  }
  throw new Error("Image upload failed");
}
