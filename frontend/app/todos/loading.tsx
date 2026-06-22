export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200 mx-auto" />
        <div className="mt-6 h-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </main>
  );
}

