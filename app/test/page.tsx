"use client";

import { useState } from "react";

export default function TestPage() {
  const [url, setUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  );

  const handleSubmit = async () => {
    const res = await fetch("/api/youtube/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        userId: "test-user",
      }),
    });

    const data = await res.json();
    console.log(data);
    alert(JSON.stringify(data));
  };

  return (
    <div className="p-6">
      <label className="mb-2 block text-sm font-medium" htmlFor="yt-url">
        YouTube URL
      </label>
      <input
        id="yt-url"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="mb-4 w-full max-w-xl rounded-lg border px-3 py-2"
      />
      <div>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
        >
          TEST ET
        </button>
      </div>
    </div>
  );
}
