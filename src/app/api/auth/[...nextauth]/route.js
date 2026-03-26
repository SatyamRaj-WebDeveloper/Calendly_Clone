import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectMongo from "../../../../../lib/mongodb"; 
import User from "../../../../../models/User"; 

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectMongo();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({ name: user.name, email: user.email, image: user.image });
        }
        return true;
      }
      return false;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };