
import React, { useState } from 'react';

interface ContentFormProps {
  domainId: string;
  onNewBrief: (briefText: string, title: string) => Promise<void>;
}

const ContentForm: React.FC<ContentFormProps> = ({ onNewBrief }) => {
  const [title, setTitle] = useState('');
  const [briefText, setBriefText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !briefText.trim()) return;

    setIsLoading(true);
    try {
      await onNewBrief(briefText, title);
      setTitle('');
      setBriefText('');
    } catch (error) {
      console.error("Failed to submit brief:", error);
      // Here you could set an error state to show to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Create New Content Brief</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a catchy title for your content"
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="brief" className="block text-sm font-medium text-gray-400 mb-1">Content Brief</label>
          <textarea
            id="brief"
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={10}
            placeholder="Paste your content brief here..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !title.trim() || !briefText.trim()}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
          >
            {isLoading ? 'Submitting...' : 'Submit to n8n'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;
