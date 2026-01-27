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
      </main>
    </ErrorBoundary>
  );
}
