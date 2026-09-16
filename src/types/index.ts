export type JobPriority = 'Alta' | 'Media' | 'Baja';

export type JobStatus = 
  | 'Disponible'
  | 'En producción'
  | 'En revisión'
  | 'QC'
  | 'Listo para exportar'
  | 'Entregado'
  | 'Bloqueado';

export type PipelineStage = 
  | 'preparar'
  | 'procesar'
  | 'editar'
  | 'revisar'
  | 'qc'
  | 'exportar'
  | 'entregar';

export interface QCProfile {
  id: string;
  name: string;
  minDurationMs: number;       // e.g. 800 ms
  maxDurationMs: number;       // e.g. 7000 ms
  maxCps: number;              // e.g. 20 CPS
  maxCharactersPerLine: number;// e.g. 42 chars
  maxLines: number;            // e.g. 2 lines
  requireSpeakerConfirmed: boolean;
  detectOverlap: boolean;
}

export interface ClientProfile {
  id: string;
  name: string;
  code: string;
  serviceDefault: string;
  outputFormat: string;
  defaultFps: number;
  tools: string[];
  deliveryFolder: string;
  namingRules: string;
  qcProfile: QCProfile;
  notes?: string;
}

export interface Speaker {
  id: string;             // e.g. 'spk_01', 'spk_03'
  displayName: string;    // e.g. 'Speaker 03' -> 'MARTA'
  confirmed: boolean;     // whether identified
  color: string;          // visual identifier
  role?: string;          // optional description e.g. 'Portavoz'
}

export type QCSeverity = 'warning' | 'error';

export type QCWarningType = 
  | 'unidentified_speaker'
  | 'high_cps'
  | 'too_short'
  | 'too_long'
  | 'overlap'
  | 'char_limit';

export interface QCWarning {
  type: QCWarningType;
  message: string;
  severity: QCSeverity;
  value?: string | number;
}

export interface SubtitleSegment {
  id: string;
  number: number;
  startTime: string;       // '00:14:23.120'
  endTime: string;         // '00:14:26.850'
  startSeconds: number;
  endSeconds: number;
  speakerId: string;       // Points to Speaker.id - NEVER duplicate name here!
  text: string;
  status?: 'pending' | 'draft' | 'reviewed' | 'confirmed' | 'edited';
  locked?: boolean;
  warnings?: QCWarning[];
}

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  duration: string;         // '00:42:16'
  durationSeconds: number;
  serviceType: string;      // 'Subtitulado SDH', 'Subtitulado ES'
  deadline: string;         // 'Hoy 15:30'
  priority: JobPriority;
  expectedFormat: string;   // 'PAC', 'SRT'
  fps: number;              // 25
  language: string;         // 'es-ES'
  status: JobStatus;
  currentStage: PipelineStage;
  assignedTo?: string;      // 'Ane García'
  startedAt?: string;       // ISO or time
  completedAt?: string;
  deliveredFile?: string;
  videoFileName?: string;
  videoUrl?: string;
  isLocalVideo?: boolean;
}

export interface DeliveryRecord {
  id: string;
  jobId: string;
  clientName: string;
  projectTitle: string;
  technician: string;
  startedAt: string;
  completedAt: string;
  durationFormatted: string;
  format: string;
  fileName: string;
  fileSize: string;
  destinationFolder: string;
  status: 'Finalizado' | 'Entregado';
  isSimulated: boolean;
  downloadableSrtContent?: string;
}

export type QCFilterKey = 
  | 'TODOS'
  | 'HABLANTE ?'
  | 'TEXTO LARGO'
  | 'LECTURA RÁPIDA'
  | 'SOLAPAMIENTO'
  | 'TIMECODE';

export interface QCFilterCounts {
  'TODOS': number;
  'HABLANTE ?': number;
  'TEXTO LARGO': number;
  'LECTURA RÁPIDA': number;
  'SOLAPAMIENTO': number;
  'TIMECODE': number;
}
