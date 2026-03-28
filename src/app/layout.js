import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] }); 

export const metadata = {
  title: "Calnedly",
  description: "Seamless scheduling and calendar integration.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}