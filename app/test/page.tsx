import Link from "next/link";

export default function TestPage() {
  return (
    <div className="p-6">
      <p className="text-sm text-zinc-600">
        Transcription is file-upload only. Use the dashboard Video tab.
      </p>
      <Link
        href="/tr/dashboard"
        className="mt-4 inline-block text-violet-600 underline"
      >
        Dashboard
      </Link>
    </div>
  );
}
