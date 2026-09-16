/**
 * PACUE External Integration Architecture Contracts.
 * These interfaces decouple the core application from external microservices,
 * CLI tools and storage providers for future expansion.
 */

export interface GoogleDriveConnector {
  connect(): Promise<boolean>;
  getPendingVideoFiles(folderId: string): Promise<Array<{ id: string; name: string; webViewLink: string; size: number }>>;
  uploadFinalDelivery(folderId: string, fileName: string, fileBlob: Blob): Promise<{ success: boolean; fileId: string; drivePath: string }>;
}

export interface SonixConnector {
  submitMediaForTranscription(videoUrlOrBlob: string | Blob, language: string): Promise<{ transcriptJobId: string }>;
  checkStatus(transcriptJobId: string): Promise<{ status: 'queued' | 'processing' | 'completed' | 'failed' }>;
  fetchTranscriptJSON(transcriptJobId: string): Promise<any>;
}

export interface SubtitleEditCliBridge {
  version(): Promise<string>;
  convertFormat(inputPathOrContent: string, fromFormat: 'srt', toFormat: 'pac' | 'stl' | 'scc'): Promise<{ success: boolean; outputPath: string; outputBlob?: Blob }>;
  runQCValidation(filePath: string, rulesProfilePath: string): Promise<{ warningsCount: number; report: string }>;
}

export interface FFmpegProbeResult {
  durationSeconds: number;
  fps: number;
  resolution: { width: number; height: number };
  videoCodec: string;
  audioCodec: string;
  audioChannels: number;
  timecodeStart?: string;
}

export interface FFmpegProbeConnector {
  probeMedia(file: File | string): Promise<FFmpegProbeResult>;
}
