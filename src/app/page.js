export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] transition-all px-4">
      <div className="w-full max-w-2xl mt-16 text-center">
        <h1 className="text-5xl font-extrabold text-[var(--primary-color)] mb-4">
          Find & Share Study Notes
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Your campus resource for uploading, sharing, and discovering high-quality notes.
        </p>
        <div className="grid gap-8 pt-4">
          <div className="rounded-2xl bg-white shadow border border-gray-100 p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">How it works</h2>
            <ol className="list-decimal list-inside text-gray-500 leading-relaxed text-left max-w-md">
              <li>Login or register your student account</li>
              <li>Upload your class PDF notes with one click</li>
              <li>See what fellow students have shared 🔥</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
