"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWikiPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "pages" | "generating">("info");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [error, setError] = useState("");

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      setError("Title and topic are required");
      return;
    }
    setError("");

    // Get AI-suggested starter pages
    const res = await fetch("/api/wikis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, topic, description }),
    });
    const wiki = await res.json();

    // Fetch suggested starter page titles
    const starterRes = await fetch(`/api/wikis/${wiki.id}/starter-titles`);
    if (starterRes.ok) {
      const titles = await starterRes.json();
      setSuggestedTitles(titles);
    } else {
      // Fallback titles
      setSuggestedTitles([
        `Overview of ${topic}`,
        `History of ${topic}`,
        `Key Concepts in ${topic}`,
        `Notable Figures in ${topic}`,
        `Major Events in ${topic}`,
      ]);
    }

    // Store wiki id for next step
    sessionStorage.setItem("newWikiId", wiki.id);
    setStep("pages");
  }

  function removePage(index: number) {
    setSuggestedTitles((prev) => prev.filter((_, i) => i !== index));
  }

  function renamePage(index: number, newName: string) {
    setSuggestedTitles((prev) =>
      prev.map((t, i) => (i === index ? newName : t))
    );
  }

  function addPage() {
    if (newPageTitle.trim()) {
      setSuggestedTitles((prev) => [...prev, newPageTitle.trim()]);
      setNewPageTitle("");
    }
  }

  async function handleGenerate() {
    if (suggestedTitles.length === 0) {
      setError("Add at least one page to generate");
      return;
    }
    setStep("generating");

    const wikiId = sessionStorage.getItem("newWikiId");

    // Generate pages
    await fetch(`/api/wikis/${wikiId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles: suggestedTitles }),
    });

    // Generate suggested pages queue
    await fetch(`/api/wikis/${wikiId}/suggested-pages`, {
      method: "POST",
    });

    router.push(`/wiki/${wikiId}`);
  }

  if (step === "generating") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <h2 className="text-2xl font-bold mb-4">Generating your wiki...</h2>
          <p className="text-gray-600">
            AI is writing {suggestedTitles.length} articles for your
            encyclopedia. This may take a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create a New Wiki</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {step === "info" && (
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Wiki Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Star Wars Encyclopedia"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Star Wars universe"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of what this wiki will cover..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Next: Choose Starter Pages
          </button>
        </form>
      )}

      {step === "pages" && (
        <div>
          <p className="text-gray-600 mb-4">
            AI has suggested these starter pages for your wiki. You can rename,
            remove, or add new ones before generating.
          </p>

          <div className="space-y-2 mb-4">
            {suggestedTitles.map((pageTitle, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3"
              >
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => renamePage(index, e.target.value)}
                  className="flex-1 border-none focus:outline-none focus:ring-0"
                />
                <button
                  onClick={() => removePage(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPage())}
              placeholder="Add a page..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addPage}
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("info")}
              className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Generate Wiki ({suggestedTitles.length} pages)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
