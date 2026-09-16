import React from 'react';
import { VideoMonitor } from './VideoMonitor';
import { SubtitleList } from './SubtitleList';

export const EditorScreen: React.FC = () => {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-full">
      {/* Left zone: Large Video Monitor (7 of 12 cols on desktop) */}
      <div className="lg:col-span-7 h-full overflow-hidden flex flex-col">
        <VideoMonitor />
      </div>

      {/* Right zone: Vertical list of synchronized subtitle blocks (5 of 12 cols) */}
      <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
        <SubtitleList />
      </div>
    </div>
  );
};
