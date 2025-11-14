
import React, { useState, useEffect, useRef } from 'react';
import { BrandGuide } from '../types';
import { CameraIcon, TrashIcon } from './Icons';
import { saveBrandGuideImage } from '../services/apiService';

interface BrandGuideEditorProps {
  brandGuide: BrandGuide;
  onSave: (updatedGuide: Partial<BrandGuide>) => void;
}

const BrandGuideEditor: React.FC<BrandGuideEditorProps> = ({ brandGuide, onSave }) => {
  const [stylePrompt, setStylePrompt] = useState(brandGuide.stylePrompt);
  const [toneOfVoice, setToneOfVoice] = useState(brandGuide.toneOfVoice);
  const [styleImageUrl, setStyleImageUrl] = useState<string | undefined>(brandGuide.styleImageUrl);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStylePrompt(brandGuide.stylePrompt);
    setToneOfVoice(brandGuide.toneOfVoice);
    setStyleImageUrl(brandGuide.styleImageUrl);
  }, [brandGuide]);
  
  const isDirty = stylePrompt !== brandGuide.stylePrompt || 
                  toneOfVoice !== brandGuide.toneOfVoice ||
                  styleImageUrl !== brandGuide.styleImageUrl;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If there's a new base64 image (starts with 'data:'), save it to MongoDB
      if (styleImageUrl && styleImageUrl.startsWith('data:') && brandGuide.id) {
        console.log('Saving new image to MongoDB...');
        
        // Extract MIME type from data URL
        const mimeType = styleImageUrl.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        // Extract base64 data
        const base64Data = styleImageUrl.split(',')[1];
        
        await saveBrandGuideImage(brandGuide.id, base64Data, mimeType);
        
        // Update with the saved image
        onSave({ 
          stylePrompt, 
          toneOfVoice, 
          styleImageUrl, // Keep the base64 for display
          styleImageData: base64Data,
          styleImageMimeType: mimeType,
        });
      } else {
        // Just update text fields
        onSave({ stylePrompt, toneOfVoice, styleImageUrl });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to save:', errorMessage);
      alert(`Failed to save changes: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setStyleImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        // You might want to show an error message for non-image files
        console.error("Please select a valid image file.");
    }
  };

  const handleRemoveImage = () => {
    setStyleImageUrl(undefined);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-6">Brand Guide</h2>
      <div className="space-y-8 bg-gray-800 p-6 rounded-lg">
        <div>
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Written Style</h3>
          <div className='pl-4 border-l-2 border-gray-700'>
            <div className="mb-6">
              <label htmlFor="tone-of-voice" className="block text-lg font-medium text-gray-300 mb-2">Tone of Voice</label>
              <p className="text-sm text-gray-500 mb-3">Define the writing style for content. This helps maintain brand consistency in all written materials.</p>
              <textarea
                id="tone-of-voice"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                rows={8}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 transition"
                placeholder="e.g., Authoritative, insightful, and forward-looking. Avoid jargon..."
              />
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Visual Style</h3>
            <div className="pl-4 border-l-2 border-gray-700 space-y-6">
                <div>
                    <label htmlFor="style-prompt" className="block text-lg font-medium text-gray-300 mb-2">Image Style Prompt</label>
                    <p className="text-sm text-gray-500 mb-3">This prompt guides the AI in generating hero images. Be descriptive about the desired style, lighting, color palette, and mood. This is used with or without a reference image.</p>
                    <textarea
                        id="style-prompt"
                        value={stylePrompt}
                        onChange={(e) => setStylePrompt(e.target.value)}
                        rows={8}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-100 transition"
                        placeholder="e.g., High-quality, professional photograph suitable for a leading technology publication..."
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Visual Style Reference</label>
                    <p className="text-sm text-gray-500 mb-3">Upload a reference image. The AI will analyze its style and apply it to newly generated hero images.</p>
                    {styleImageUrl ? (
                        <div className="relative group">
                           <img src={styleImageUrl} alt="Style reference" className="w-full rounded-md object-cover aspect-video" />
                           <button 
                             onClick={handleRemoveImage}
                             className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                             aria-label="Remove image"
                           >
                                <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
                        >
                            <div className="space-y-1 text-center">
                                <CameraIcon className="mx-auto h-12 w-12 text-gray-500" />
                                <div className="flex text-sm text-gray-400">
                                    <p className="pl-1">Upload an image or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-700">
           <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandGuideEditor;