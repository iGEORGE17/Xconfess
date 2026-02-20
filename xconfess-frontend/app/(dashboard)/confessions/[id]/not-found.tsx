import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function ConfessionNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">
          Confession not found
        </h1>
        <p className="text-zinc-400 mb-6">
          This confession may have been removed or the link is incorrect.
        </p>
        <Link href="/">
          <Button>Back to Feed</Button>
        </Link>
      </div>
    </div>
  );
}
