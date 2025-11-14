import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ContentBrief, Domain, BrandGuide, Status, User } from '../types';
import { fetchDomains, fetchBrandGuides, fetchContentBriefs } from '../services/apiService';
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
  const [domains, setDomains] = useState<Domain[]>([]);
  const [brandGuides, setBrandGuides] = useState<BrandGuide[]>([]);
  const [briefs, setBriefs] = useState<ContentBrief[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDomainId, setSelectedDomainId] = useState<string | undefined>();
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'content' | 'brand'>('content');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [fetchedDomains, fetchedBrandGuides, fetchedBriefs] = await Promise.all([
          fetchDomains(user.clientId),
          fetchBrandGuides(user.clientId),
          fetchContentBriefs(user.clientId)
        ]);
        
        setDomains(fetchedDomains);
        setBrandGuides(fetchedBrandGuides);
        setBriefs(fetchedBriefs);

        if (fetchedDomains.length > 0) {
          setSelectedDomainId(fetchedDomains[0].id);
        }

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Could not load your data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user.clientId]);
  
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
    setShowSidebar(false); // Close sidebar on mobile after selection
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
    setShowSidebar(false); // Close sidebar on mobile
  };
  
  const handleSaveBrandGuide = useCallback((updatedGuide: Partial<BrandGuide>) => {
    setBrandGuides(prevGuides =>
      prevGuides.map(g =>
        g.domainId === selectedDomainId ? { ...g, ...updatedGuide } : g
      )
    );
  }, [selectedDomainId]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading your workspace...</div>;
  }
  
  if (error) {
     return <div className="flex h-screen items-center justify-center text-red-400">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-md shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showSidebar ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-full sm:w-80 lg:w-1/4 lg:max-w-sm
        bg-gray-800 p-4 flex flex-col border-r border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            value={selectedDomainId}
            onChange={e => {
              setSelectedDomainId(e.target.value);
              setSelectedBriefId(null);
              setIsCreating(false);
            }}
          >
            {domains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.name}</option>
            ))}
          </select>
        </div>
        <div className="flex border-b border-gray-700 mb-4">
            <button 
                className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors ${activeView === 'content' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => {
                  setActiveView('content');
                  setShowSidebar(false);
                }}
            >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Content
            </button>
            <button 
                className={`flex-1 flex items-center justify-center p-3 text-sm font-medium transition-colors ${activeView === 'brand' ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
                onClick={() => {
                  setActiveView('brand');
                  setShowSidebar(false);
                }}
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
                        setShowSidebar(false);
                    }}
                />
            </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto pt-16 lg:pt-6">
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
                <p className="text-center px-4">Select a brief from the list or create a new one.</p>
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
