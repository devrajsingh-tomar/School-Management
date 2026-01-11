import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
      <main className="flex w-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            SM
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900 mb-6">
          School Management SaaS
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          A comprehensive platform for managing students, staff, academics, and finance.
        </p>
        <div className="mt-10 flex gap-4">
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/school">Go to Dashboard</Link>
          </Button>
        </div>
      </main>
      <footer className="mt-20 text-sm text-gray-500">
        &copy; 2026 School Management SaaS. All rights reserved.
      </footer>
    </div>
  );
}
