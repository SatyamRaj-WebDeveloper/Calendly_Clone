"use client";

import { useState, useEffect } from "react";

export default function CopyLink({ email }) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  // This ensures we get the right domain (localhost vs Vercel) after the page loads
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  // We encode the email so the '@' symbol doesn't break the URL
  const link = `${baseUrl}/book/${encodeURIComponent(email)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset button after 2 seconds
  };

  // Don't render anything until we know the base URL to prevent hydration errors
  if (!baseUrl) return null; 

  return (
    <div className="mt-6 w-full rounded-xl border border-blue-100 bg-blue-50 p-4 overflow-hidden">
      <p className="text-sm font-medium text-blue-900 mb-2">Share your booking link:</p>
      
      {/* Changed to flex-col on mobile, flex-row on desktop, ensuring it stays within w-full */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
        <input 
          type="text" 
          readOnly 
          value={link} 
          // Added min-w-0 to force the input to shrink and truncate text if it's too long
          className="w-full min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-600 focus:outline-none"
        />
        <button
          onClick={handleCopy}
          // Added whitespace-nowrap so the button text never awkwardly stacks
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}