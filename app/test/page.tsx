import Link from "next/link";

export default function TestPage() {
  return (
    <div className="p-6 text-gray-900">
      <p className="text-sm text-gray-600">
        Transcription is file-upload only. Use the dashboard Video tab.
      </p>
      <Link
        href="/tr/dashboard"
        className="mt-4 inline-block font-medium text-blue-700 underline hover:text-blue-800"
      >
        Dashboard
      </Link>
    </div>
  );
}
