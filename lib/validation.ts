import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  category: z.string().min(3).max(20),
  // link: z
  //   .string()
  //   .url()
  //   .refine(async (url) => {
  //     try {
  //       const res = await fetch(url, { method: "HEAD" });
  //       const contentType = res.headers.get("content-type");

  //       return contentType?.startsWith("image/");
  //     } catch {
  //       return false;
  //     }
  //   }),
  image: z
    .any()
    .refine((file) => file instanceof File, "Image is required")
    .refine((file) => file?.size <= 5000000, "Max image size is 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
      "Only .jpg, .png and .webp formats are supported"
    ),
  pitch: z.string().min(10),
});