import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Job, ClientProfile, Speaker, SubtitleSegment, DeliveryRecord, 
  QCProfile, QCFilterKey, QCFilterCounts, PipelineStage 
} from '../types';
import { 
  MOCK_JOBS, MOCK_CLIENTS, INITIAL_SPEAKERS, buildDemoSegments, 
  MOCK_HISTORY, DEFAULT_QC_PROFILE_RTVE 
} from '../data/mockData';
import { evaluateQC } from '../services/qcService';
import { parseSRT } from '../services/srtService';

interface AppContextType {
  // Navigation & Jobs
  currentView: 'cola' | 'trabajo' | 'historial' | 'clientes' | 'configuracion';
  setCurrentView: (view: 'cola' | 'trabajo' | 'historial' | 'clientes' | 'configuracion') => void;
  jobs: Job[];
  activeJobId: string | null;
  setActiveJobId: (id: string | null) => void;
  activeJob: Job | null;
  activeStage: PipelineStage;
  setActiveStage: (stage: PipelineStage) => void;
  pickJob: (jobId: string) => void;

  // Subtitles & Speakers
  segments: SubtitleSegment[];
  speakers: Record<string, Speaker>;
  selectedSegmentId: string | null;
  selectedSegment: SubtitleSegment | null;
  activeQCFilter: QCFilterKey;
  setActiveQCFilter: (filter: QCFilterKey) => void;
  selectedSpeakerFilter: string | null;
  setSelectedSpeakerFilter: (spkId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions on Subtitles & Speakers
  updateSegmentText: (segmentId: string, newText: string) => void;
  updateSegmentSpeaker: (segmentId: string, speakerId: string) => void;
  renameSpeaker: (speakerId: string, newName: string, confirmed?: boolean) => void;
  viewSpeakerInterventions: (speakerId: string) => void;
  selectSegment: (segmentId: string | null, jumpVideo?: boolean) => void;
  jumpToPrevSegment: () => void;
  jumpToNextSegment: () => void;

  // QC State
  qcProfile: QCProfile;
  setQCProfile: (profile: QCProfile) => void;
  qcCounts: QCFilterCounts;

  // Video State
  videoUrl: string | null;
  videoFileName: string | null;
  isLocalVideo: boolean;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  seekVideo: (timeSeconds: number) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
  loadLocalVideoFile: (file: File) => void;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setDuration: (dur: number) => void;
  setIsPlaying: (playing: boolean) => void;

  // Import / Export / Delivery
  importSRTContent: (srtString: string, fileName?: string) => void;
  importJSONContent: (jsonString: string) => void;
  deliverJob: (fileName: string, isSimulated?: boolean) => void;
  history: DeliveryRecord[];
  clients: Record<string, ClientProfile>;

  // User & Reset
  user: { name: string; role: string; initials: string };
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'cola' | 'trabajo' | 'historial' | 'clientes' | 'configuracion'>('cola');
  
  // Jobs
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('pacue_jobs');
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    return localStorage.getItem('pacue_active_job_id') || null;
  });

  const [activeStage, setActiveStage] = useState<PipelineStage>('editar');

  // Speakers & Segments
  const [speakers, setSpeakers] = useState<Record<string, Speaker>>(() => {
    const saved = localStorage.getItem('pacue_speakers');
    return saved ? JSON.parse(saved) : INITIAL_SPEAKERS;
  });

  const [segments, setSegments] = useState<SubtitleSegment[]>(() => {
    const saved = localStorage.getItem('pacue_segments');
    return saved ? JSON.parse(saved) : buildDemoSegments();
  });

  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>('seg_1');

  // Filters
  const [activeQCFilter, setActiveQCFilter] = useState<QCFilterKey>('TODOS');
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // History & Clients
  const [history, setHistory] = useState<DeliveryRecord[]>(() => {
    const saved = localStorage.getItem('pacue_history');
    return saved ? JSON.parse(saved) : MOCK_HISTORY;
  });

  const [clients] = useState<Record<string, ClientProfile>>(MOCK_CLIENTS);

  // Active Job resolution
  const activeJob = useMemo(() => {
    return jobs.find(j => j.id === activeJobId) || null;
  }, [jobs, activeJobId]);

  // QC Profile
  const [qcProfile, setQCProfile] = useState<QCProfile>(() => {
    if (activeJob && clients[activeJob.clientId]?.qcProfile) {
      return clients[activeJob.clientId].qcProfile;
    }
    return DEFAULT_QC_PROFILE_RTVE;
  });

  // Keep QC Profile synced with active job client
  useEffect(() => {
    if (activeJob && clients[activeJob.clientId]?.qcProfile) {
      setQCProfile(clients[activeJob.clientId].qcProfile);
    }
  }, [activeJob, clients]);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>('RTVE_INFO_20260916_MASTER.mp4');
  const [isLocalVideo, setIsLocalVideo] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(10.0);
  const [duration, setDuration] = useState(2536); // ~42m
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pacue_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('pacue_speakers', JSON.stringify(speakers));
  }, [speakers]);

  useEffect(() => {
    localStorage.setItem('pacue_segments', JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem('pacue_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (activeJobId) {
      localStorage.setItem('pacue_active_job_id', activeJobId);
    } else {
      localStorage.removeItem('pacue_active_job_id');
    }
  }, [activeJobId]);

  // QC Evaluation
  const { evaluatedSegments, counts: qcCounts } = useMemo(() => {
    return evaluateQC(segments, speakers, qcProfile);
  }, [segments, speakers, qcProfile]);

  // Pick Job handler
  const pickJob = useCallback((jobId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: 'En producción',
          assignedTo: 'Ane García',
          startedAt: timeStr,
          currentStage: 'editar'
        };
      }
      return j;
    }));

    setActiveJobId(jobId);
    setActiveStage('editar');
    setCurrentView('trabajo');
  }, []);

  // Update segment text
  const updateSegmentText = useCallback((segmentId: string, newText: string) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return { ...s, text: newText, status: 'edited' };
      }
      return s;
    }));
  }, []);

  // Update segment speaker
  const updateSegmentSpeaker = useCallback((segmentId: string, speakerId: string) => {
    setSegments(prev => prev.map(s => {
      if (s.id === segmentId) {
        return { ...s, speakerId };
      }
      return s;
    }));
  }, []);

  // Rename speaker - Updates speaker dictionary immediately!
  // SubtitleSegments only hold speakerId, so all 24 blocks update reactively!
  const renameSpeaker = useCallback((speakerId: string, newName: string, confirmed = true) => {
    setSpeakers(prev => {
      const existing = prev[speakerId];
      if (!existing) return prev;
      return {
        ...prev,
        [speakerId]: {
          ...existing,
          displayName: newName.trim(),
          confirmed
        }
      };
    });
  }, []);

  // Video seek controller
  const seekVideo = useCallback((timeSeconds: number) => {
    const clamped = Math.max(0, Math.min(timeSeconds, duration));
    setCurrentTime(clamped);
  }, [duration]);

  // Select segment: jumps video ~1s before
  const selectSegment = useCallback((segmentId: string | null, jumpVideo = true) => {
    setSelectedSegmentId(segmentId);
    if (!segmentId || !jumpVideo) return;

    const seg = segments.find(s => s.id === segmentId);
    if (seg) {
      const jumpTime = Math.max(0, seg.startSeconds - 1.0);
      seekVideo(jumpTime);
    }
  }, [segments, seekVideo]);

  // "VER INTERVENCIONES" on speaker panel:
  // Filters editor to that speaker, jumps video ~1s before their 1st intervention
  const viewSpeakerInterventions = useCallback((speakerId: string) => {
    setSelectedSpeakerFilter(speakerId);
    setActiveQCFilter('TODOS');
    
    // Find first intervention
    const firstIntervention = segments.find(s => s.speakerId === speakerId);
    if (firstIntervention) {
      selectSegment(firstIntervention.id, true);
    }
  }, [segments, selectSegment]);

  // Jump to prev / next segment
  const jumpToPrevSegment = useCallback(() => {
    if (!selectedSegmentId) return;
    const currentIndex = segments.findIndex(s => s.id === selectedSegmentId);
    if (currentIndex > 0) {
      const prevSeg = segments[currentIndex - 1];
      selectSegment(prevSeg.id, true);
    }
  }, [segments, selectedSegmentId, selectSegment]);

  const jumpToNextSegment = useCallback(() => {
    if (!selectedSegmentId) return;
    const currentIndex = segments.findIndex(s => s.id === selectedSegmentId);
    if (currentIndex >= 0 && currentIndex < segments.length - 1) {
      const nextSeg = segments[currentIndex + 1];
      selectSegment(nextSeg.id, true);
    }
  }, [segments, selectedSegmentId, selectSegment]);

  // Play / Pause toggle
  const togglePlayPause = useCallback(() => {
    setIsPlaying(p => !p);
  }, []);

  // Load Real Local Video
  const loadLocalVideoFile = useCallback((file: File) => {
    const localUrl = URL.createObjectURL(file);
    setVideoUrl(localUrl);
    setVideoFileName(file.name);
    setIsLocalVideo(true);
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Import SRT Content
  const importSRTContent = useCallback((srtString: string, fileName?: string) => {
    const { segments: parsedSegments, speakers: parsedSpeakers } = parseSRT(srtString);
    if (parsedSegments.length === 0) return;

    setSegments(parsedSegments);
    setSpeakers(parsedSpeakers);
    setSelectedSegmentId(parsedSegments[0].id);
    setSelectedSpeakerFilter(null);
    setActiveQCFilter('TODOS');

    if (parsedSegments[parsedSegments.length - 1]?.endSeconds > duration) {
      setDuration(Math.ceil(parsedSegments[parsedSegments.length - 1].endSeconds + 10));
    }
  }, [duration]);

  // Import JSON Content
  const importJSONContent = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.segments)) {
        setSegments(data.segments);
      }
      if (data.speakers && typeof data.speakers === 'object') {
        setSpeakers(data.speakers);
      }
      setSelectedSegmentId(data.segments?.[0]?.id || null);
    } catch (e) {
      console.error('Error importing JSON:', e);
    }
  }, []);

  // Complete Delivery
  const deliverJob = useCallback((fileName: string, isSimulated = true) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (activeJob) {
      const deliveryRecord: DeliveryRecord = {
        id: `deliv_${Date.now()}`,
        jobId: activeJob.id,
        clientName: activeJob.clientName,
        projectTitle: activeJob.title,
        technician: activeJob.assignedTo || 'Ane García',
        startedAt: activeJob.startedAt || '10:00',
        completedAt: timeStr,
        durationFormatted: '0h 48m',
        format: activeJob.expectedFormat || 'PAC',
        fileName: fileName,
        fileSize: '48.6 KB',
        destinationFolder: clients[activeJob.clientId]?.deliveryFolder || 'Drive / RTVE / Entregados',
        status: 'Entregado',
        isSimulated: isSimulated
      };

      setHistory(prev => [deliveryRecord, ...prev]);

      setJobs(prev => prev.map(j => {
        if (j.id === activeJob.id) {
          return {
            ...j,
            status: 'Entregado',
            completedAt: timeStr,
            deliveredFile: fileName,
            currentStage: 'entregar'
          };
        }
        return j;
      }));
    }
  }, [activeJob, clients]);

  // Reset demo
  const resetAllDemoData = useCallback(() => {
    localStorage.removeItem('pacue_jobs');
    localStorage.removeItem('pacue_speakers');
    localStorage.removeItem('pacue_segments');
    localStorage.removeItem('pacue_history');
    localStorage.removeItem('pacue_active_job_id');

    setJobs(MOCK_JOBS);
    setSpeakers(INITIAL_SPEAKERS);
    setSegments(buildDemoSegments());
    setHistory(MOCK_HISTORY);
    setActiveJobId(null);
    setActiveStage('editar');
    setCurrentView('cola');
    setSelectedSegmentId('seg_1');
    setSelectedSpeakerFilter(null);
    setActiveQCFilter('TODOS');
    setVideoUrl(null);
    setVideoFileName('RTVE_INFO_20260916_MASTER.mp4');
    setIsLocalVideo(false);
  }, []);

  const selectedSegment = useMemo(() => {
    return evaluatedSegments.find(s => s.id === selectedSegmentId) || null;
  }, [evaluatedSegments, selectedSegmentId]);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        jobs,
        activeJobId,
        setActiveJobId,
        activeJob,
        activeStage,
        setActiveStage,
        pickJob,
        segments: evaluatedSegments,
        speakers,
        selectedSegmentId,
        selectedSegment,
        activeQCFilter,
        setActiveQCFilter,
        selectedSpeakerFilter,
        setSelectedSpeakerFilter,
        searchQuery,
        setSearchQuery,
        updateSegmentText,
        updateSegmentSpeaker,
        renameSpeaker,
        viewSpeakerInterventions,
        selectSegment,
        jumpToPrevSegment,
        jumpToNextSegment,
        qcProfile,
        setQCProfile,
        qcCounts,
        videoUrl,
        videoFileName,
        isLocalVideo,
        currentTime,
        duration,
        isPlaying,
        playbackRate,
        seekVideo,
        togglePlayPause,
        setPlaybackRate,
        loadLocalVideoFile,
        setCurrentTime,
        setDuration,
        setIsPlaying,
        importSRTContent,
        importJSONContent,
        deliverJob,
        history,
        clients,
        user: { name: 'Ane García', role: 'Técnica de accesibilidad', initials: 'AG' },
        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
