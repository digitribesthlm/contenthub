
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ContentBrief, Domain, BrandGuide, Status, User } from '../types';
import ContentList from './ContentList';
import ContentDetail from './ContentDetail';
import ContentForm from './ContentForm';
import BrandGuideEditor from './BrandGuideEditor';
import { submitBrief as n8nSubmitBrief } from '../services/n8nService';
import { 
  getDomainsByClientId, 
  getAllContentBriefsByClient, 
  getAllBrandGuidesByClient 
} from '../services/mongoService';
import { LogoutIcon, DocumentTextIcon, PaintBrushIcon } from './Icons';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [briefs, setBriefs] = useState<ContentBrief[]>([]);
  const [brandGuides, setBrandGuides] = useState<BrandGuide[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeView, setActiveView] = useState<'content' | 'brand'>('content');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from MongoDB on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load domains for this client
        const clientDomains = await getDomainsByClientId(user.clientId);
        setDomains(clientDomains);
        
        if (clientDomains.length > 0) {
          setSelectedDomainId(clientDomains[0].id);
        }

        // Load all content briefs for this client
        const clientBriefs = await getAllContentBriefsByClient(user.clientId);
        setBriefs(clientBriefs);

        // Load all brand guides for this client
        const clientBrandGuides = await getAllBrandGuidesByClient(user.clientId);
        setBrandGuides(clientBrandGuides);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.clientId]);

  const filteredBriefs = useMemo(() => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No domains found for your account.</p>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <aside className="w-1/4 max-w-sm bg-gray-800 p-4 flex flex-col border-r border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Content Hub</h1>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
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
            {domains.map(domain => (
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
                clientId={user.clientId}
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
          brandGuide ? (
            <BrandGuideEditor 
              brandGuide={brandGuide}
              onSave={handleSaveBrandGuide}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No brand guide found for this domain.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Dashboard;
