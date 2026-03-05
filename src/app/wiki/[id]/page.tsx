"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Page {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface SuggestedPage {
  id: string;
  title: string;
  reason: string;
  prompt: string;
}

interface Wiki {
  id: string;
  title: string;
  topic: string;
  description: string;
  pages: Page[];
  suggestedPages: SuggestedPage[];
}

export default function WikiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPage, setGeneratingPage] = useState<string | null>(null);

  const wikiId = params.id as string;

  useEffect(() => {
    fetchWiki();
  }, [wikiId]);

  async function fetchWiki() {
    const res = await fetch(`/api/wikis/${wikiId}`);
    if (res.ok) {
      const data = await res.json();
      setWiki(data);
    }
    setLoading(false);
  }

  async function generateSuggestedPage(suggestedId: string) {
    setGeneratingPage(suggestedId);
    await fetch(`/api/wikis/${wikiId}/suggested-pages/${suggestedId}`, {
      method: "POST",
    });
    await fetchWiki();
    setGeneratingPage(null);
  }

  async function dismissSuggestion(suggestedId: string) {
    await fetch(`/api/wikis/${wikiId}/suggested-pages/${suggestedId}`, {
      method: "DELETE",
    });
    await fetchWiki();
  }

  async function refreshSuggestions() {
    await fetch(`/api/wikis/${wikiId}/suggested-pages`, {
      method: "POST",
    });
    await fetchWiki();
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
        Loading wiki...
      </div>
    );
  }

  if (!wiki) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Wiki not found</h2>
        <a href="/" className="text-blue-600 hover:underline">
          Go home
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{wiki.title}</h1>
        <p className="text-gray-600">{wiki.description}</p>
        <p className="text-sm text-gray-400 mt-1">Topic: {wiki.topic}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Pages list */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Pages ({wiki.pages.length})
          </h2>
          {wiki.pages.length === 0 ? (
            <p className="text-gray-500">No pages yet.</p>
          ) : (
            <div className="space-y-2">
              {wiki.pages.map((page) => (
                <a
                  key={page.id}
                  href={`/wiki/${wikiId}/page/${page.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-medium">{page.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {page.content.replace(/^#.*\n/gm, "").slice(0, 150)}...
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Suggested pages queue */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Suggested Pages</h2>
            <button
              onClick={refreshSuggestions}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
          {wiki.suggestedPages.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
              <p>No suggestions available.</p>
              <button
                onClick={refreshSuggestions}
                className="mt-2 text-blue-600 hover:underline"
              >
                Generate suggestions
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {wiki.suggestedPages.map((sp) => (
                <div
                  key={sp.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-sm">{sp.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{sp.reason}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => generateSuggestedPage(sp.id)}
                      disabled={generatingPage === sp.id}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {generatingPage === sp.id ? "Generating..." : "Generate"}
                    </button>
                    <button
                      onClick={() => dismissSuggestion(sp.id)}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
