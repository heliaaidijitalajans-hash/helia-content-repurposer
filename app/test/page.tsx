import Link from "next/link";

export default function TestPage() {
  return (
    <div className="p-6 text-slate-200">
      <p className="text-sm text-slate-400">
        Transcription is file-upload only. Use the dashboard Video tab.
      </p>
      <Link
        href="/tr/dashboard"
        className="mt-4 inline-block text-sky-300 underline hover:text-sky-200"
      >
        Dashboard
      </Link>
    </div>
  );
}
