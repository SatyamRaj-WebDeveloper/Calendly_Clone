import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../app/api/auth/[...nextauth]/route"; 

export default async function Navbar() {

  const session = await getServerSession(authOptions);

  return (
    <nav className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">
          <span className="text-blue-600">4N</span> Scheduling
        </Link>
      </div>

      <div className="space-x-4">
        {session ? (

          <div className="flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            
            {/* NextAuth has a built-in signout route we can point to! */}
            <Link 
              href="/api/auth/signout"
              className="bg-gray-100 hover:bg-gray-200 text-slate-700 font-medium px-5 py-2 rounded-full transition-colors"
            >
              Logout
            </Link>
          </div>
        ) : (
          /* IF USER IS NOT LOGGED IN: Show Login & Sign Up */
          <>
            <Link 
              href="/api/auth/signin"
              className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2"
            >
              Login
            </Link>
            <Link 
              href="/api/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-full transition-colors"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}