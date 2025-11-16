import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { client } from "./sanity/lib/client";
import { AUTHOR_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";
import { writeClient } from "./sanity/lib/write-client";


export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  callbacks: {
        async signIn({ user, account, profile }) {
        const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
          id: profile?.id,
        });

        if (!existingUser) {
        // 1️⃣ Fetch GitHub avatar as a file
        const avatarUrl = user.image; // github avatar URL
        let imageAsset = null;

        if (avatarUrl) {
          const res = await fetch(avatarUrl);
          const buffer = await res.arrayBuffer();

          const file = new File([buffer], "avatar.jpg", {
            type: "image/jpeg",
          });

          // 2️⃣ Upload to Sanity
          imageAsset = await writeClient.assets.upload("image", file, {
            filename: "avatar.jpg",
          });
        }

        // 3️⃣ Create the author document with the correct image structure
        await writeClient.create({
          _type: "author",
          id: profile?.id,
          name: user.name,
          username: profile?.login,
          email: user?.email,
          bio: profile?.bio || "",

          ...(imageAsset && {
            image: {
              _type: "image",
              asset: {
                _type: "reference",
                _ref: imageAsset._id,
              },
            },
          }),
        });
      }

      return true;
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHUB_ID_QUERY, {
            id: profile?.id,
          });

        token.id = user?._id;
      }

      return token;
    },
    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

