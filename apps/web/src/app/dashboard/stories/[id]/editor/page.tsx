'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface Story {
  id: string;
  title: string;
  content: string;
  genre: string;
  contentRating: string;
  status: string;
  scenes: any[];
}

export default function StoryEditor() {
  const params = useParams();
  const storyId = params.id as string;
  const [story, setStory] = useState<Story | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'scenes' | 'roleplay'>('content');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stories/${storyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStory(response.data);
      setContent(response.data.content);
    } catch (error) {
      console.error('Failed to fetch story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stories/${storyId}`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Story saved!');
    } catch (error) {
      console.error('Failed to save story:', error);
    }
  };

  const handleRoleplayMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');

    try {
      // Send to roleplay AI endpoint
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/roleplay/respond`,
        {
          storyId,
          message: chatInput,
          context: story?.content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Failed to get roleplay response:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
          ✏️ {story?.title}
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'content'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Content Editor
          </button>
          <button
            onClick={() => setActiveTab('scenes')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'scenes'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🎬 Scenes ({story?.scenes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('roleplay')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'roleplay'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💬 Roleplay Companion
          </button>
        </div>

        {/* Content Editor Tab */}
        {activeTab === 'content' && (
          <div className="bg-gray-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-6">
            <ReactQuill
              theme="dark"
              value={content}
              onChange={setContent}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                ],
              }}
              style={{
                height: '500px',
                color: 'white',
              }}
            />
            <button
              onClick={handleSaveContent}
              className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              💾 Save Story
            </button>
          </div>
        )}

        {/* Roleplay Companion Tab */}
        {activeTab === 'roleplay' && (
          <div className="bg-gray-800/50 backdrop-blur border border-purple-500/20 rounded-lg p-6">
            <div className="h-96 overflow-y-auto mb-4 bg-black/30 rounded p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-pink-600 text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRoleplayMessage()}
                placeholder="Chat with your story companion..."
                className="flex-1 bg-gray-900 border border-purple-500/30 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleRoleplayMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded transition"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
