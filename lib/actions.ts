"use server";

import { auth } from "@/auth";
import { writeClient } from "@/sanity/lib/write-client";
import slugify from "slugify";
import { parseServerActionResponse } from "./utils";

export const createPitch = async (
  state: any,
  form: FormData,
  pitch: string
) => {
  const session = await auth();

  if (!session) {
    return parseServerActionResponse({
      error: "Not signed in",
      status: "ERROR",
    });
  }

  const title = form.get("title") as string;
  const description = form.get("description") as string;
  const category = form.get("category") as string;
  const imageFile = form.get("image") as File;

  const slug = slugify(title, { lower: true, strict: true });

  try {
    // Upload image to Sanity
    let uploadedImage = null;

    if (imageFile && imageFile.size > 0) {
      uploadedImage = await writeClient.assets.upload("image", imageFile, {
        filename: imageFile.name,
      });
    }

    // Build the startup document
    const startup = {
      _type: "startup",
      title,
      description,
      category,
      pitch,
      slug: {
        _type: "slug",
        current: slug,
      },
      author: {
        _type: "reference",
        _ref: session.id,
      },
      ...(uploadedImage && {
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: uploadedImage._id,
          },
        },
      }),
    };

    // Save to Sanity
    const result = await writeClient.create(startup);

    return parseServerActionResponse({
      ...result,
      error: "",
      status: "SUCCESS",
    });
  } catch (error) {
    console.error(error);

    return parseServerActionResponse({
      error: String(error),
      status: "ERROR",
    });
  }
};
