import { SubtitleSegment, Speaker, QCProfile, QCWarning, QCFilterKey, QCFilterCounts } from '../types';

/**
 * Calculates characters per second (CPS) for a segment.
 * Ignores linebreaks and trimmed text.
 */
export function calculateCPS(text: string, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  const cleanLength = text.replace(/\r?\n|\r/g, ' ').trim().length;
  return Number((cleanLength / durationSeconds).toFixed(1));
}

/**
 * Pure QC evaluation engine.
 * Receives segments, normalized speaker dictionary, and the client QC profile.
 * Does not depend on any specific customer or UI component.
 */
export function evaluateQC(
  segments: SubtitleSegment[],
  speakers: Record<string, Speaker>,
  profile: QCProfile
): { evaluatedSegments: SubtitleSegment[]; counts: QCFilterCounts } {
  const counts: QCFilterCounts = {
    'TODOS': segments.length,
    'HABLANTE ?': 0,
    'TEXTO LARGO': 0,
    'LECTURA RÁPIDA': 0,
    'SOLAPAMIENTO': 0,
    'TIMECODE': 0,
  };

  const evaluatedSegments = segments.map((segment, index) => {
    const warnings: QCWarning[] = [];
    const duration = Math.max(0.01, segment.endSeconds - segment.startSeconds);
    const durationMs = duration * 1000;
    const cps = calculateCPS(segment.text, duration);

    // 1. Speaker validation
    const speaker = speakers[segment.speakerId];
    const isUnidentified = !speaker || !speaker.confirmed || speaker.displayName.toLowerCase().startsWith('speaker');
    if (profile.requireSpeakerConfirmed && isUnidentified) {
      warnings.push({
        type: 'unidentified_speaker',
        message: 'Speaker sin identificar',
        severity: 'warning',
        value: speaker ? speaker.displayName : segment.speakerId,
        ruleId: 'rule_speaker_id_rtve',
      });
    }

    // 2. Reading speed / CPS validation
    if (cps > profile.maxCps) {
      warnings.push({
        type: 'high_cps',
        message: `${cps} CPS (límite ${profile.maxCps})`,
        severity: 'warning',
        value: cps,
        ruleId: profile.id.includes('rtve') ? 'rule_speed_cps_rtve' : 'rule_speed_cps_amazon',
      });
    }

    // 3. Duration bounds (Timecode)
    if (durationMs < profile.minDurationMs) {
      warnings.push({
        type: 'too_short',
        message: `Duración breve (${Math.round(durationMs)}ms < ${profile.minDurationMs}ms)`,
        severity: 'warning',
        value: Math.round(durationMs),
        ruleId: 'rule_duration_bounds',
      });
    } else if (durationMs > profile.maxDurationMs) {
      warnings.push({
        type: 'too_long',
        message: `Duración excesiva (${(durationMs / 1000).toFixed(1)}s > ${profile.maxDurationMs / 1000}s)`,
        severity: 'warning',
        value: Math.round(durationMs),
        ruleId: 'rule_duration_bounds',
      });
    }

    // 4. Overlap check with previous segment
    if (profile.detectOverlap && index > 0) {
      const prev = segments[index - 1];
      // If starts before previous ends (with a 20ms tolerance for rounding)
      if (segment.startSeconds < prev.endSeconds - 0.02) {
        const overlapMs = Math.round((prev.endSeconds - segment.startSeconds) * 1000);
        warnings.push({
          type: 'overlap',
          message: `Solapamiento con #${prev.number} (${overlapMs}ms)`,
          severity: 'error',
          value: overlapMs,
          ruleId: 'rule_overlap_sync',
        });
      }
    }

    // 5. Line and character limit check
    const lines = segment.text.split(/\r?\n/).filter(l => l.trim().length > 0);
    let lineLimitExceeded = false;
    if (lines.length > profile.maxLines) {
      lineLimitExceeded = true;
      warnings.push({
        type: 'char_limit',
        message: `${lines.length} líneas (máximo ${profile.maxLines})`,
        severity: 'warning',
        value: lines.length,
        ruleId: 'rule_max_chars_rtve',
      });
    }
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > profile.maxCharactersPerLine) {
        lineLimitExceeded = true;
        warnings.push({
          type: 'char_limit',
          message: `Línea ${i + 1} excede ${profile.maxCharactersPerLine} caracteres (${lines[i].length})`,
          severity: 'warning',
          value: lines[i].length,
          ruleId: 'rule_max_chars_rtve',
        });
      }
    }

    // Tally counts for filter categories
    if (warnings.some(w => w.type === 'unidentified_speaker')) counts['HABLANTE ?']++;
    if (warnings.some(w => w.type === 'char_limit')) counts['TEXTO LARGO']++;
    if (warnings.some(w => w.type === 'high_cps')) counts['LECTURA RÁPIDA']++;
    if (warnings.some(w => w.type === 'overlap')) counts['SOLAPAMIENTO']++;
    if (warnings.some(w => w.type === 'too_short' || w.type === 'too_long')) counts['TIMECODE']++;

    return {
      ...segment,
      warnings,
    };
  });

  return { evaluatedSegments, counts };
}

/**
 * Filter segments by active QC tab
 */
export function filterSegmentsByQC(
  segments: SubtitleSegment[],
  filter: QCFilterKey
): SubtitleSegment[] {
  if (filter === 'TODOS') return segments;

  return segments.filter(seg => {
    if (!seg.warnings || seg.warnings.length === 0) return false;
    switch (filter) {
      case 'HABLANTE ?':
        return seg.warnings.some(w => w.type === 'unidentified_speaker');
      case 'TEXTO LARGO':
        return seg.warnings.some(w => w.type === 'char_limit');
      case 'LECTURA RÁPIDA':
        return seg.warnings.some(w => w.type === 'high_cps');
      case 'SOLAPAMIENTO':
        return seg.warnings.some(w => w.type === 'overlap');
      case 'TIMECODE':
        return seg.warnings.some(w => w.type === 'too_short' || w.type === 'too_long');
      default:
        return true;
    }
  });
}
