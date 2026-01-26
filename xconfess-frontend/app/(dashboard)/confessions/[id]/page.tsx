import Link from 'next/link';

export default function ConfessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-800">
          ← Back
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Confession</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        Confession ID: <span className="font-mono">{params.id}</span>
      </p>
      <p className="mt-4 text-gray-700 dark:text-gray-200">
        This route was previously an empty file (which breaks Next.js builds). You can replace
        this placeholder with the real confession detail UI later.
      </p>
    </div>
  );
}

