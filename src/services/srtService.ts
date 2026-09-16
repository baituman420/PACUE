import { SubtitleSegment, Speaker } from '../types';

/**
 * Converts seconds (e.g. 863.125) to standard SRT timecode '00:14:23,125'
 */
export function secondsToSrtTime(seconds: number): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

/**
 * Converts seconds to display broadcast timecode '00:14:23.120'
 */
export function secondsToDisplayTime(seconds: number): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

/**
 * Converts seconds to SMPTE Timecode 'HH:MM:SS:FF' based on fps (default 25)
 */
export function secondsToSMPTE(seconds: number, fps = 25): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(frames)}`;
}

/**
 * Parses SRT timecode '00:14:23,120' or '00:14:23.120' to float seconds
 */
export function parseSrtTimeToSeconds(timeStr: string): number {
  return parseAnyTimecodeToSeconds(timeStr, 25);
}

/**
 * Robust parser supporting HH:MM:SS.mmm, HH:MM:SS:FF (frames), MM:SS.mmm or raw seconds
 */
export function parseAnyTimecodeToSeconds(timeStr: string, fps = 25): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  
  // Case 1: HH:MM:SS:FF (SMPTE with colon for frames)
  const smpteMatch = clean.match(/^(\d{1,2}):(\d{2}):(\d{2}):(\d{1,2})$/);
  if (smpteMatch) {
    const h = parseInt(smpteMatch[1], 10);
    const m = parseInt(smpteMatch[2], 10);
    const s = parseInt(smpteMatch[3], 10);
    const frames = parseInt(smpteMatch[4], 10);
    return h * 3600 + m * 60 + s + (frames / fps);
  }

  // Case 2: HH:MM:SS.mmm
  const parts = clean.split(':');
  if (parts.length === 3) {
    const h = parseFloat(parts[0]);
    const m = parseFloat(parts[1]);
    const s = parseFloat(parts[2]);
    if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
      return h * 3600 + m * 60 + s;
    }
  } else if (parts.length === 2) {
    // MM:SS.mmm
    const m = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    if (!isNaN(m) && !isNaN(s)) {
      return m * 60 + s;
    }
  } else if (parts.length === 1) {
    const s = parseFloat(parts[0]);
    if (!isNaN(s)) return s;
  }
  return 0;
}

/**
 * Parses raw SRT string into SubtitleSegment[] and generates normalized speakers
 */
export function parseSRT(srtContent: string): {
  segments: SubtitleSegment[];
  speakers: Record<string, Speaker>;
} {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawBlocks = normalized.split(/\n\n+/);
  
  const segments: SubtitleSegment[] = [];
  const speakers: Record<string, Speaker> = {};
  let speakerCounter = 1;

  const defaultPalette = [
    '#38bdf8', '#a78bfa', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#f43f5e', '#14b8a6'
  ];

  rawBlocks.forEach((block, idx) => {
    const lines = block.trim().split('\n');
    if (lines.length < 2) return;

    let timeLineIdx = 1;
    let number = parseInt(lines[0].trim(), 10);
    
    // Check if line 0 is actually the timecode line
    if (lines[0].includes('-->')) {
      timeLineIdx = 0;
      number = idx + 1;
    } else if (isNaN(number)) {
      number = idx + 1;
    }

    const timeMatch = lines[timeLineIdx]?.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
    if (!timeMatch) return;

    const startSeconds = parseSrtTimeToSeconds(timeMatch[1]);
    const endSeconds = parseSrtTimeToSeconds(timeMatch[2]);
    const rawTextLines = lines.slice(timeLineIdx + 1).join('\n').trim();

    // Check if speaker prefix is embedded in text, e.g. "MARTA: Hola" or "[JUAN] Buenos días"
    let speakerId = '';
    let cleanText = rawTextLines;

    const prefixMatch = rawTextLines.match(/^(\[|\()([A-Z0-9_\-\s]{2,15})(\]|\)):\s*(.*)/is) 
      || rawTextLines.match(/^([A-Z0-9_\-]{2,15}):\s*(.*)/is);

    if (prefixMatch) {
      const detectedName = prefixMatch[2] || prefixMatch[1];
      cleanText = prefixMatch[prefixMatch.length - 1];
      
      // Look for existing speaker with this name
      const existing = Object.values(speakers).find(s => s.displayName.toUpperCase() === detectedName.toUpperCase().trim());
      if (existing) {
        speakerId = existing.id;
      } else {
        const newId = `spk_${String(speakerCounter).padStart(2, '0')}`;
        speakers[newId] = {
          id: newId,
          displayName: detectedName.trim(),
          confirmed: !detectedName.toLowerCase().startsWith('speaker'),
          color: defaultPalette[(speakerCounter - 1) % defaultPalette.length]
        };
        speakerCounter++;
        speakerId = newId;
      }
    } else {
      // Default to spk_01 or allocate generic speaker
      if (!speakers['spk_01']) {
        speakers['spk_01'] = {
          id: 'spk_01',
          displayName: 'Speaker 01',
          confirmed: false,
          color: defaultPalette[0]
        };
        speakerCounter++;
      }
      speakerId = 'spk_01';
    }

    segments.push({
      id: `seg_${number}_${Date.now()}_${idx}`,
      number,
      startTime: secondsToDisplayTime(startSeconds),
      endTime: secondsToDisplayTime(endSeconds),
      startSeconds,
      endSeconds,
      speakerId,
      text: cleanText,
      status: 'pending'
    });
  });

  return { segments, speakers };
}

/**
 * Formats segments and speakers into valid standard SRT text.
 */
export function generateSRTContent(
  segments: SubtitleSegment[],
  speakers: Record<string, Speaker>,
  includeSpeakerPrefix = false
): string {
  return segments
    .map((seg, idx) => {
      const num = idx + 1;
      const start = secondsToSrtTime(seg.startSeconds);
      const end = secondsToSrtTime(seg.endSeconds);
      const speaker = speakers[seg.speakerId];
      const speakerPrefix = includeSpeakerPrefix && speaker ? `[${speaker.displayName}] ` : '';
      return `${num}\n${start} --> ${end}\n${speakerPrefix}${seg.text}\n`;
    })
    .join('\n');
}

/**
 * Triggers a real browser download of a text/SRT file.
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Decoupled normalizer for future Sonix integration.
 * In the future, Sonix raw API output feeds this adapter.
 */
export function normalizeSonixJSON(sonixJson: any): {
  segments: SubtitleSegment[];
  speakers: Record<string, Speaker>;
} {
  // Architectural placeholder for future Sonix connector
  const segments: SubtitleSegment[] = [];
  const speakers: Record<string, Speaker> = {};
  
  if (Array.isArray(sonixJson?.segments)) {
    sonixJson.segments.forEach((s: any, idx: number) => {
      const spkId = s.speaker ? `spk_${s.speaker}` : 'spk_01';
      if (!speakers[spkId]) {
        speakers[spkId] = {
          id: spkId,
          displayName: `Speaker ${s.speaker || '01'}`,
          confirmed: false,
          color: '#38bdf8'
        };
      }
      segments.push({
        id: `sonix_${idx}`,
        number: idx + 1,
        startTime: secondsToDisplayTime(s.start_time || 0),
        endTime: secondsToDisplayTime(s.end_time || 0),
        startSeconds: s.start_time || 0,
        endSeconds: s.end_time || 0,
        speakerId: spkId,
        text: s.text || '',
        status: 'pending'
      });
    });
  }
  return { segments, speakers };
}
