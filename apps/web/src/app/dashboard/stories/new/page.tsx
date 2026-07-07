'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const GENRES = [
  'ROMANCE',
  'FANTASY',
  'SCI_FI',
  'DRAMA',
  'MYSTERY',
  'ADVENTURE',
  'EROTICA',
  'THRILLER',
  'HORROR',
  'COMEDY',
  'OTHER',
];

const RATINGS = ['G', 'PG', 'PG_13', 'R', 'NC_17', 'X'];

export default function CreateStory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    genre: 'ROMANCE',
    contentRating: 'R',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stories/generate`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push(`/dashboard/stories/${response.data.id}/editor`);
    } catch (error) {
      console.error('Failed to create story:', error);
      alert('Failed to create story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
          ✨ Create New Story
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-8 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">Story Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your story title"
              className="w-full bg-gray-900 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-white font-semibold mb-2">Story Prompt</label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Describe your story idea in detail..."
              rows={6}
              className="w-full bg-gray-900 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {/* Genre and Rating */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Genre</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full bg-gray-900 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Content Rating</label>
              <select
                value={formData.contentRating}
                onChange={(e) => setFormData({ ...formData, contentRating: e.target.value })}
                className="w-full bg-gray-900 border border-purple-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Creating Story...' : '🚀 Create Story'}
          </button>
        </form>
      </div>
    </div>
  );
}
