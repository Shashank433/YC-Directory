import { defineField, defineType } from "sanity";

export const startup = defineType({
  name: "startup",
  title: "Startup",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "author",
      type: "reference",
      to: { type: "author" },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "views",
      type: "number",
      initialValue: 0,
    }),

    defineField({
      name: "description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "category",
      type: "string",
      validation: (Rule) =>
        Rule.min(1).max(20).required().error("Please enter a category"),
    }),

    defineField({
      name: "image",
      title: "Startup Image",
      type: "image",
      options: {
        hotspot: true,
        metadata: ["blurhash", "lqip", "palette"],
        storeOriginalFilename: true,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "pitch",
      type: "markdown",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
