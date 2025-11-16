import React, { useState, useEffect } from 'react';
import { ContentBrief, BrandGuide, Status, ContentType } from '../types';
import { generateHeroImage, editHeroImage } from '../services/geminiService';
import { publishContent as n8nPublishContent, scheduleContent as n8nScheduleContent } from '../services/n8nService';
import { deleteBrief } from '../services/apiService';
import { SparklesIcon, UploadCloudIcon, PencilIcon, ClockIcon } from './Icons';

interface ContentDetailProps {
  brief: ContentBrief;
  brandGuide: BrandGuide;
  onUpdate: (updatedBrief: Partial<ContentBrief>) => void;
  onPublish: () => void;
  onSchedule: (scheduledAt: string) => void;
  onDelete: () => void;
}

const ContentDetail: React.FC<ContentDetailProps> = ({ brief, brandGuide, onUpdate, onPublish, onSchedule, onDelete }) => {
  const [editedContent, setEditedContent] = useState(brief.content);
  const [contentType, setContentType] = useState(brief.contentType);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [heroImage, setHeroImage] = useState<string | undefined>(brief.heroImageUrl);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLocked = brief.status === Status.Published || brief.status === Status.Scheduled;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteBrief(brief.id);
      onDelete();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete brief. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    setEditedContent(brief.content);
    setContentType(brief.contentType);
    setHeroImage(brief.heroImageUrl);
    setEditPrompt('');
    setShowScheduler(false);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setScheduleDate(now.toISOString().slice(0,16));

  }, [brief]);

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setError(null);
    try {
      const prompt = `Based on the following content, create a hero image. Content: "${brief.content}"`;
      const imageUrl = await generateHeroImage(prompt, brandGuide.stylePrompt, brandGuide.styleImageUrl);
      setHeroImage(imageUrl);
      
      // Extract base64 data from data URL for storage
      const base64Data = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
      
      onUpdate({ 
        heroImageUrl: imageUrl,
        heroImageData: base64Data, // Store base64 for webhook transmission
      });
    } catch (err) {
      console.error("Image generation failed:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleEditImage = async () => {
    if (!heroImage || !editPrompt.trim()) return;
    setIsGeneratingImage(true);
    setError(null);
    try {
      const imageUrl = await editHeroImage(heroImage, editPrompt, brandGuide.stylePrompt);
      setHeroImage(imageUrl);
      
      // Extract base64 data from data URL for storage
      const base64Data = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
      
      onUpdate({ 
        heroImageUrl: imageUrl,
        heroImageData: base64Data, // Store base64 for webhook transmission
      });
      setEditPrompt('');
    } catch (err) {
      console.error("Image editing failed:", err);
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      // Create complete brief object with all current state
      const completeBrief: ContentBrief = {
        ...brief,
        content: editedContent,
        contentType,
        heroImageUrl: heroImage,
        // heroImageData is already in brief if it was updated
      };
      
      await n8nPublishContent(completeBrief);
      onPublish();
    } catch (err) {
      console.error("Publishing failed:", err);
      setError("Failed to publish content. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };
  
  const handleSchedule = async () => {
    if (!scheduleDate) return;
    setIsScheduling(true);
    setError(null);
    try {
      // Create complete brief object with all current state
      const completeBrief: ContentBrief = {
        ...brief,
        content: editedContent,
        contentType,
        heroImageUrl: heroImage,
        // heroImageData is already in brief if it was updated
      };
      
      const scheduledAt = new Date(scheduleDate).toISOString();
      await n8nScheduleContent(completeBrief, scheduledAt);
      onSchedule(scheduledAt);
      setShowScheduler(false);
    } catch(err) {
      console.error("Scheduling failed:", err);
      setError("Failed to schedule content. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  }

  const handleContentBlur = () => {
    if (editedContent !== brief.content) {
      onUpdate({ content: editedContent });
    }
  };

  const handleContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ContentType;
    setContentType(newType);
    onUpdate({ contentType: newType });
  };
  
  const StatusPill: React.FC<{ status: Status; scheduledAt?: string }> = ({ status, scheduledAt }) => {
    let colorClass = 'bg-yellow-500/20 text-yellow-400';
    let text = status;

    if (status === Status.Published) {
      colorClass = 'bg-green-500/20 text-green-400';
    } else if (status === Status.Scheduled) {
      colorClass = 'bg-blue-500/20 text-blue-400';
      if(scheduledAt) {
        text = `Scheduled for ${new Date(scheduledAt).toLocaleDateString()}`
      }
    }
    
    return <span className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${colorClass}`}>{text}</span>;
  };
  
  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Delete Brief?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete "{brief.title}"? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{brief.title}</h2>
            {brief.BriefID && (
              <span className="text-sm text-gray-500 font-mono bg-gray-800 px-3 py-1 rounded">
                #{brief.BriefID}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm sm:text-base">{brief.brief}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
            <StatusPill status={brief.status} scheduledAt={brief.scheduledAt} />
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
              title="Delete brief"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-lg">Hero Image</h3>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="aspect-video bg-gray-700 rounded-md mb-4 flex items-center justify-center overflow-hidden">
          {heroImage ? (
            <img src={heroImage} alt="Generated Hero" className="w-full h-full object-cover" />
          ) : (
             <div className="text-center text-gray-500">
                <SparklesIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No hero image generated yet.</p>
             </div>
          )}
        </div>
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImage || isLocked}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
        >
          <SparklesIcon className="w-5 h-5" />
          {isGeneratingImage ? 'Generating...' : (heroImage ? 'Regenerate Image' : 'Generate Hero Image')}
        </button>

        {heroImage && !isLocked && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-1">Edit Image</label>
            <div className="flex gap-2">
              <input 
                id="edit-prompt"
                type="text"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., Remove the car, make the sky blue..."
                className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleEditImage}
                disabled={isGeneratingImage || !editPrompt.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-lg">Content Body</h3>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onBlur={handleContentBlur}
          rows={15}
          disabled={isLocked}
          className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed"
          placeholder="Start writing your content here..."
        />
      </div>

      {!isLocked && (
        <div className="pt-4 border-t border-gray-700">
          {showScheduler && (
             <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-300 mb-2">Select a date and time to schedule publication:</label>
                <div className="flex gap-2 items-center">
                    <input
                        id="schedule-date"
                        type="datetime-local"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                     <button onClick={() => setShowScheduler(false)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">Cancel</button>
                    <button onClick={handleSchedule} disabled={isScheduling || !scheduleDate} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600">
                        {isScheduling ? 'Scheduling...' : 'Confirm'}
                    </button>
                </div>
             </div>
          )}
          <div className="flex justify-end items-center gap-4">
             <div className="flex items-center gap-2 mr-auto">
                <label htmlFor="content-type" className="text-sm font-medium text-gray-400">Content Type:</label>
                <select 
                    id="content-type"
                    value={contentType}
                    onChange={handleContentTypeChange}
                    disabled={isLocked}
                    className="bg-gray-700 border border-gray-600 rounded-md py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
                >
                    {Object.values(ContentType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <button
                onClick={() => setShowScheduler(true)}
                disabled={isPublishing || showScheduler}
                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
              >
              <ClockIcon className="w-5 h-5" />
              Schedule
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || showScheduler}
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
            >
              <UploadCloudIcon className="w-5 h-5" />
              {isPublishing ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetail;