"use client";

import { useEffect, useState } from "react";

interface Wiki {
  id: string;
  title: string;
  topic: string;
  description: string;
  createdAt: string;
  _count: { pages: number };
}

export default function HomePage() {
  const [wikis, setWikis] = useState<Wiki[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wikis")
      .then((r) => r.json())
      .then((data) => {
        setWikis(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Build encyclopedias with AI
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create comprehensive wikis on any topic. AI generates starter articles
          and helps expand your encyclopedia over time.
        </p>
        <a
          href="/wiki/new"
          className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Your First Wiki
        </a>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading wikis...</p>
      ) : wikis.length === 0 ? (
        <p className="text-center text-gray-500">
          No wikis yet. Create one to get started!
        </p>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Wikis</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wikis.map((wiki) => (
              <a
                key={wiki.id}
                href={`/wiki/${wiki.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold mb-1">{wiki.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{wiki.topic}</p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {wiki.description}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  {wiki._count.pages} pages
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
