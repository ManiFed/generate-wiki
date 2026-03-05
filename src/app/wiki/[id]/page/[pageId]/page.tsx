"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { marked } from "marked";

interface Suggestion {
  id: string;
  description: string;
  type: string;
  status: string;
  aiGenerated: boolean;
  createdAt: string;
}

interface PageData {
  id: string;
  title: string;
  content: string;
  wikiId: string;
  suggestions: Suggestion[];
}

export default function ArticlePage() {
  const params = useParams();
  const wikiId = params.id as string;
  const pageId = params.pageId as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [suggestionDesc, setSuggestionDesc] = useState("");
  const [suggestionType, setSuggestionType] = useState("fix");
  const [aiEditDesc, setAiEditDesc] = useState("");
  const [aiEditType, setAiEditType] = useState("expand");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [wikiId, pageId]);

  async function fetchPage() {
    const res = await fetch(`/api/wikis/${wikiId}/pages/${pageId}`);
    if (res.ok) {
      setPage(await res.json());
    }
    setLoading(false);
  }

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/wikis/${wikiId}/pages/${pageId}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: suggestionDesc,
        type: suggestionType,
      }),
    });
    setSuggestionDesc("");
    setShowSuggestForm(false);
    setSubmitting(false);
    await fetchPage();
  }

  async function submitAiEdit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch(`/api/wikis/${wikiId}/pages/${pageId}/ai-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: aiEditDesc,
        type: aiEditType,
      }),
    });
    setAiEditDesc("");
    setShowAiEdit(false);
    setSubmitting(false);
    await fetchPage();
  }

  async function handleSuggestionAction(
    suggestionId: string,
    status: "approved" | "rejected"
  ) {
    await fetch(
      `/api/wikis/${wikiId}/pages/${pageId}/suggestions/${suggestionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );
    await fetchPage();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">
        Loading article...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <a href={`/wiki/${wikiId}`} className="text-blue-600 hover:underline">
          Back to wiki
        </a>
      </div>
    );
  }

  const htmlContent = marked.parse(page.content);

  const pendingSuggestions = page.suggestions.filter(
    (s) => s.status === "pending"
  );
  const resolvedSuggestions = page.suggestions.filter(
    (s) => s.status !== "pending"
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4">
        <a
          href={`/wiki/${wikiId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          &larr; Back to wiki
        </a>
      </div>

      {/* Article content */}
      <article
        className="bg-white rounded-lg border border-gray-200 p-8 prose prose-blue max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: htmlContent as string }}
      />

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => {
            setShowSuggestForm(!showSuggestForm);
            setShowAiEdit(false);
          }}
          className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Suggest an Edit
        </button>
        <button
          onClick={() => {
            setShowAiEdit(!showAiEdit);
            setShowSuggestForm(false);
          }}
          className="border border-blue-300 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          AI-Assisted Edit
        </button>
      </div>

      {/* Suggestion form */}
      {showSuggestForm && (
        <form
          onSubmit={submitSuggestion}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
        >
          <h3 className="font-semibold mb-3">Submit a Suggestion</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={suggestionType}
              onChange={(e) => setSuggestionType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="fix">Fix incorrect information</option>
              <option value="expand">Expand a section</option>
              <option value="rewrite">Rewrite for clarity</option>
              <option value="add_info">Add new information</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={suggestionDesc}
              onChange={(e) => setSuggestionDesc(e.target.value)}
              placeholder="Describe the edit you'd like to see..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Suggestion"}
          </button>
        </form>
      )}

      {/* AI Edit form */}
      {showAiEdit && (
        <form
          onSubmit={submitAiEdit}
          className="bg-blue-50 rounded-lg border border-blue-200 p-6 mb-8"
        >
          <h3 className="font-semibold mb-1">AI-Assisted Edit</h3>
          <p className="text-sm text-gray-600 mb-3">
            AI will generate an edit suggestion that the wiki owner must approve.
          </p>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Edit Type
            </label>
            <select
              value={aiEditType}
              onChange={(e) => setAiEditType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="expand">Expand sections</option>
              <option value="rewrite">Rewrite for clarity</option>
              <option value="add_info">Add information</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              What should be changed?
            </label>
            <textarea
              value={aiEditDesc}
              onChange={(e) => setAiEditDesc(e.target.value)}
              placeholder="e.g., Add more detail about the early history..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Generating..." : "Generate AI Edit"}
          </button>
        </form>
      )}

      {/* Pending suggestions (moderation) */}
      {pendingSuggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">
            Pending Suggestions ({pendingSuggestions.length})
          </h3>
          <div className="space-y-3">
            {pendingSuggestions.map((s) => (
              <div
                key={s.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                      {s.type}
                    </span>
                    {s.aiGenerated && (
                      <span className="ml-2 text-xs font-medium bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                        AI Generated
                      </span>
                    )}
                    <p className="mt-2 text-sm">{s.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleSuggestionAction(s.id, "approved")}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSuggestionAction(s.id, "rejected")}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved suggestions */}
      {resolvedSuggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Past Suggestions</h3>
          <div className="space-y-2">
            {resolvedSuggestions.map((s) => (
              <div
                key={s.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      s.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {s.description.slice(0, 80)}
                    {s.description.length > 80 ? "..." : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
