"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-lg border border-red-100 bg-white p-5 text-center shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Todo를 불러오지 못했습니다.</h1>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}

