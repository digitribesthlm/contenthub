
import React from 'react';
import { ContentBrief, Status } from '../types';
import { PlusCircleIcon } from './Icons';

interface ContentListProps {
  briefs: ContentBrief[];
  selectedBriefId: string | null;
  onSelectBrief: (id: string) => void;
  onNewBriefClick: () => void;
}

const ContentList: React.FC<ContentListProps> = ({ briefs, selectedBriefId, onSelectBrief, onNewBriefClick }) => {
  const StatusPill: React.FC<{ status: Status }> = ({ status }) => {
    let colorClass = 'bg-yellow-500/20 text-yellow-400';
    if (status === Status.Published) {
      colorClass = 'bg-green-500/20 text-green-400';
    } else if (status === Status.Scheduled) {
      colorClass = 'bg-blue-500/20 text-blue-400';
    }
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };
  
  return (
    <div>
       <button 
        onClick={onNewBriefClick}
        className="w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
       >
         <PlusCircleIcon className="w-5 h-5"/>
         New Content Brief
       </button>
      <ul className="space-y-2">
        {briefs.map(brief => (
          <li key={brief.id}>
            <button
              className={`w-full text-left p-3 rounded-md transition-colors ${
                selectedBriefId === brief.id ? 'bg-indigo-600/30' : 'hover:bg-gray-700'
              }`}
              onClick={() => onSelectBrief(brief.id)}
            >
              <h3 className="font-semibold text-gray-100 truncate">{brief.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-400">
                  {new Date(brief.createdAt).toLocaleDateString()}
                </p>
                <StatusPill status={brief.status} />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentList;
