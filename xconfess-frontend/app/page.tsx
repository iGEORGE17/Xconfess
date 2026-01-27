"use client";

import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import dynamic from "next/dynamic";
import { ConfessionFeed } from "./components/confession/ConfessionFeed";
import { ErrorBoundary } from "./components/confession/ErrorBoundary";

const EnhancedConfessionForm = dynamic(
  () => import("./components/confession/EnhancedConfessionForm").then(mod => ({ default: mod.EnhancedConfessionForm })),
  {
    loading: () => (
      <div className="animate-pulse bg-zinc-900 rounded-xl p-6 h-48">
        <div className="h-4 bg-zinc-800 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-zinc-800 rounded mb-4"></div>
        <div className="h-10 bg-zinc-800 rounded w-24"></div>
      </div>
    ),
    ssr: false,
  }
);
import { EnhancedConfessionForm } from "./components/confession/EnhancedConfessionForm";
import Header from "./components/layout/Header";

export default function Home() {
  return (
    <>
      {/* Onboarding */}
      <OnboardingFlow />

      <main className="p-4 md:p-8 flex flex-col items-center space-y-6">
        {/* Confession Feed */}
        <div className="confession-feed w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-700 rounded-xl shadow-md p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Confession Feed
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Browse anonymous confessions from the community. React and show your
            support!
          </p>
        </div>

        {/* Post Confession Button */}
        <button className="create-confession-button w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105">
          Post Confession
        </button>

        {/* Reactions */}
        <div className="reaction-buttons flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          <button className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition w-full sm:w-auto">
            👍 Like
          </button>
          <button className="flex items-center justify-center gap-2 bg-pink-200 dark:bg-pink-800 hover:bg-pink-300 dark:hover:bg-pink-700 text-pink-900 dark:text-pink-100 px-4 py-2 rounded-lg transition w-full sm:w-auto">
            ❤️ Love
          </button>
    <ErrorBoundary>
      <main className="min-h-screen bg-background transition-colors">
       <Header/>
        <div className="container mx-auto py-8 px-4">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Confessions
            </h1>
            <p className="text-secondary text-lg">
              Share your secrets anonymously
            </p>
          </header>
          
          <div className="mb-12 max-w-3xl mx-auto">
            <EnhancedConfessionForm />
          </div>

          <div className="max-w-3xl mx-auto">
            <ConfessionFeed />
          </div>
        </div>

        {/* Connect Wallet */}
        <button className="wallet-connect w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-6 rounded-xl shadow-md transition-transform transform hover:scale-105">
          Connect Wallet
        </button>
      </main>
    </>
  );
}
