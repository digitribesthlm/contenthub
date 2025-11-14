import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ContentBrief, Domain, BrandGuide, Status, User } from '../types';
import { MOCK_DOMAINS, MOCK_BRAND_GUIDES, MOCK_CONTENT_BRIEFS } from '../constants';
import ContentList from './ContentList';
import ContentDetail from './ContentDetail';
import ContentForm from './ContentForm';
import BrandGuideEditor from './BrandGuideEditor';
import { submitBrief as n8nSubmitBrief } from '../services/n8nService';
import { LogoutIcon, DocumentTextIcon, PaintBrushIcon } from './Icons';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Filter all data sources by the logged-in user's clientId
  const userDomains = useMemo(() => MOCK_DOMAINS.filter(d => d.clientId === user.clientId), [user.clientId]);
  const userBrandGuides = useMemo(() => MOCK_BRAND_GUIDES.filter(bg => bg.clientId === user.clientId), [user.clientId]);
  const userContentBriefs = useMemo(() => MOCK_CONTENT_BRIEFS.filter(b => b.clientId === user.clientId), [user.clientId]);
  
  const [briefs, setBriefs] = useState<ContentBrief[]>(userContentBriefs);
  const [brandGuides, setBrandGuides] = useState<BrandGuide[]>(userBrandGuides);
  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>(userDomains[0]?.id);
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'content' | 'brand'>('content');

  useEffect(() => {
    if (!selectedDomainId && userDomains.length > 0) {
      setSelectedDomainId(userDomains[0].id);
    }
  }, [userDomains, selectedDomainId]);
  
  const filteredBriefs = useMemo(() => {
    if (!selectedDomainId) return [];
    return briefs
      .filter(b => b.domainId === selectedDomainId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [briefs, selectedDomainId]);
  
  const selectedBrief = useMemo(() => {
    return briefs.find(b => b.id === selectedBriefId) || null;
  }, [briefs, selectedBriefId]);

  const brandGuide = useMemo(() => {
    return brandGuides.find(bg => bg.domainId === selectedDomainId);
  }, [brandGuides, selectedDomainId]);
  
  const handleSelectBrief = useCallback((id: string) => {
    setSelectedBriefId(id);
    setIsCreating(false);
  }, []);

  const handleUpdateBrief = useCallback((updatedBrief: Partial<ContentBrief>) => {
    setBriefs(prevBriefs =>
      prevBriefs.map(b =>
        b.id === selectedBriefId ? { ...b, ...updatedBrief } : b
      )
    );
  }, [selectedBriefId]);
  
  const handlePublishBrief = useCallback(() => {
    setBriefs(prevBriefs =>
      prevBriefs.map(b =>
        b.id === selectedBriefId ? { ...b, status: Status.Published } : b
      )
    );
  }, [selectedBriefId]);
  
  const handleScheduleBrief = useCallback((scheduledAt: string) => {
      setBriefs(prevBriefs =>
          prevBriefs.map(b =>
              b.id === selectedBriefId ? { ...b, status: Status.Scheduled, scheduledAt } : b
          )
      );
  }, [selectedBriefId]);

  const handleNewBrief = async (briefText: string, title: string) => {
    if (!selectedDomainId) return;
    const newBrief = await n8nSubmitBrief(briefText, title, selectedDomainId, user.clientId);
    setBriefs(prevBriefs => [newBrief, ...prevBriefs]);
    setSelectedBriefId(newBrief.id);
    setIsCreating(false);
  };
  
  const handleSaveBrandGuide = useCallback((updatedGuide: Partial<BrandGuide>) => {
    setBrandGuides(prevGuides =>
      prevGuides.map(g =>
        g.domainId === selectedDomainId ? { ...g, ...updatedGuide } : g
      )
    );
  }, [selectedDomainId]);

  if (!selectedDomainId || !brandGuide) {
      return (
        <div className="flex h-screen items-center justify-center text-gray-400">
            <div className="text-center">
                <p>No domains configured for your account.</p>
                <button onClick={onLogout} className="mt-4 text-indigo-400 hover:text-indigo-300">Logout</button>
            </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <aside className="w-1/4 max-w-sm bg-gray-800 p-4 flex flex-col border-r border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-white">Content Hub</h1>
          <button onClick={onLogout} className="p-2 rounded-md hover:bg-gray-700 transition-colors" title="Logout">
              <LogoutIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="domain-select" className="block text-sm font-medium text-gray-400 mb-1">Domain</label>
          <select
            id="domain-select"
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedDomainId}
            onChange={e => {
              setSelectedDomainId(e.target.value);
              setSelectedBriefId(null);
              setIsCreating(false);
            }}
          >
            {userDomains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
        </div>
        <div className="flex border-b border-gray-700 mb-4">
            <button 
                className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors ${activeView === 'content' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveView('content')}
            >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Content
            </button>
            <button 
                className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors ${activeView === 'brand' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveView('brand')}
            >
                <PaintBrushIcon className="w-5 h-5 mr-2" />
                Brand Guide
            </button>
        </div>
        {activeView === 'content' && (
            <div className="flex-grow overflow-y-auto">
                <ContentList
                    briefs={filteredBriefs}
                    selectedBriefId={selectedBriefId}
                    onSelectBrief={handleSelectBrief}
                    onNewBriefClick={() => {
                        setIsCreating(true);
                        setSelectedBriefId(null);
                    }}
                />
            </div>
        )}
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {activeView === 'content' ? (
          <>
            {isCreating ? (
              <ContentForm domainId={selectedDomainId} onNewBrief={handleNewBrief} />
            ) : selectedBrief ? (
              <ContentDetail
                key={selectedBrief.id}
                brief={selectedBrief}
                brandGuide={brandGuide}
                onUpdate={handleUpdateBrief}
                onPublish={handlePublishBrief}
                onSchedule={handleScheduleBrief}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a brief from the list or create a new one.</p>
              </div>
            )}
          </>
        ) : (
          <BrandGuideEditor 
            brandGuide={brandGuide}
            onSave={handleSaveBrandGuide}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;