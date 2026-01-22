import { ConfessionFeed } from "./components/confession/ConfessionFeed";
import { ErrorBoundary } from "./components/confession/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-linear-to-b from-zinc-950 to-black">
        <div className="container mx-auto py-8">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Confessions
            </h1>
            <p className="text-gray-400 text-lg">
              Share your secrets anonymously
            </p>
          </header>
          <ConfessionFeed />
        </div>
      </main>
    </ErrorBoundary>
  );
}
