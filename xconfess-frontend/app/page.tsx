import { ConfessionFeed } from "./components/confession/ConfessionFeed";
import { ErrorBoundary } from "./components/confession/ErrorBoundary";
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
