import React, { useState, useEffect } from 'react';
import { ContentBrief } from '../types';

interface CalendarProps {
  briefs: ContentBrief[];
  onBriefClick: (brief: ContentBrief) => void;
  onDateClick: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ briefs, onBriefClick, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Filter briefs with valid dates
  const validBriefs = briefs.filter(brief => {
    const date = brief.scheduledAt || brief.createdAt;
    return date && !isNaN(new Date(date).getTime());
  });

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) to fill calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Get briefs for a specific date
  const getBriefsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return validBriefs.filter(brief => {
      const briefDate = new Date(brief.scheduledAt || brief.createdAt);
      const briefDateStr = briefDate.toISOString().split('T')[0];
      return briefDateStr === dateStr;
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const calendarDays = getCalendarDays();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Publishing Calendar</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              ←
            </button>
            <span className="text-lg font-semibold min-w-[200px] text-center">
              {monthName}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-700 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          Published
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded"></span>
          Scheduled
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gray-500 rounded"></span>
          Draft
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const dayStr = day.toISOString().split('T')[0];
            const isToday = dayStr === today;
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const dayBriefs = getBriefsForDate(day);

            return (
              <div
                key={index}
                onClick={() => onDateClick(day)}
                className={`
                  min-h-[100px] p-2 rounded border cursor-pointer transition-colors
                  ${isToday ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700'}
                  ${isCurrentMonth ? 'bg-gray-800' : 'bg-gray-800/50'}
                  hover:bg-gray-700
                `}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-400' : isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayBriefs.map(brief => (
                    <div
                      key={brief.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBriefClick(brief);
                      }}
                      className={`
                        text-xs p-1 rounded truncate cursor-pointer
                        ${getStatusColor(brief.status)}
                        hover:opacity-80 transition-opacity
                      `}
                      title={brief.title}
                    >
                      {brief.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
