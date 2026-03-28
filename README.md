# 4N Scheduling - AI-Powered Calendly Clone

A full-stack scheduling application built for the 4N EcoTech assessment. This platform allows users to set their weekly availability, share a personalized booking link, and seamlessly schedule cross-timezone meetings that automatically sync to their Google Calendar. 

It also features a native LLM integration that generates structured meeting agendas directly inside the calendar invite.

## 🚀 Key Features
* **Secure Authentication:** Passwordless Google OAuth via NextAuth.
* **Dynamic Availability:** Hosts can set custom weekly hours.
* **Cross-Timezone Booking:** Automatically converts host availability to the guest's local browser timezone.
* **Google Calendar Sync:** Uses standard OAuth2 tokens to create events directly on the host's primary calendar.
* **✨ AI Agenda Generator (Bonus):** Integrates the Google Gemini API to analyze the guest's meeting topic and inject a structured, 3-point agenda into the calendar event description.

## 🛠 Tech Stack
* **Frontend:** Next.js (App Router), Tailwind CSS
* **Backend:** Next.js Route Handlers (API)
* **Database:** MongoDB (Mongoose)
* **Integrations:** Google Calendar API (`googleapis`), Google Gemini (`@google/generative-ai`)

---

## ⚠️ CRITICAL: How to Test the Application (Google OAuth)
Because this application requests sensitive scopes (reading/writing to Google Calendar) and is currently in development mode, **Google will show a "Google hasn't verified this app" warning screen** when you attempt to log in. 

To bypass this and test the functionality:
1. Click **"Login"** or **"Sign Up"** on the home page.
2. Select your Google account.
3. On the red warning screen, click the **"Advanced"** text link at the bottom left.
4. Click **"Go to [Your App Name] (unsafe)"**.
5. Click **"Continue"** to grant Calendar permissions.
6. You will be redirected to the Host Dashboard where you can set your hours and copy your public booking link.

---

## 💻 Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env.local` file with the following variables:
   * `MONGODB_URI`
   * `GOOGLE_CLIENT_ID`
   * `GOOGLE_CLIENT_SECRET`
   * `NEXTAUTH_SECRET`
   * `NEXTAUTH_URL=http://localhost:3000`
   * `GEMINI_API_KEY`
4. Run `npm run dev`.
