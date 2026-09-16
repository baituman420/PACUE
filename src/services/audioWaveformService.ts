/**
 * audioWaveformService.ts
 * Servicio seguro de extracción y cálculo de forma de onda (waveform) de audio
 * mediante Web Audio API para archivos de vídeo y audio locales.
 *
 * Incluye fallback seguro ante códecs o contenedores no decodificables en navegador,
 * sin requerir dependencias pesadas como ffmpeg.wasm.
 */

export interface WaveformData {
  peaks: Float32Array; // Valores de amplitud normalizados [0..1]
  duration: number;    // Duración total del audio en segundos
  samplesPerSecond: number; // Tasa de muestreo de la cuadrícula (ej. 25 o 50)
  isReal: boolean;     // Indica si proviene de audio físico o de síntesis fallback
  fileName: string;
}

/**
 * Intenta extraer el buffer de audio de un archivo local (mp4, webm, mkv, wav, etc.)
 * y calcular los picos de amplitud normalizados para la línea temporal.
 */
export async function extractWaveformFromFile(
  file: File,
  samplesPerSecond: number = 25
): Promise<WaveformData | null> {
  try {
    // 1. Lectura del archivo como ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2. Creación de AudioContext
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API no soportada en este entorno.');
      return null;
    }

    const audioCtx = new AudioContextClass();

    try {
      // 3. Decodificación de audio nativa del navegador
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0); // Canal 1 (mono/estéreo downmix L)
      const rawSampleRate = audioBuffer.sampleRate;
      const duration = audioBuffer.duration;

      const totalBuckets = Math.max(1, Math.floor(duration * samplesPerSecond));
      const peaks = new Float32Array(totalBuckets);
      const bucketSize = Math.floor(rawSampleRate / samplesPerSecond);

      let globalMax = 0;

      // 4. Cálculo de picos RMS / Absoluto por cada intervalo
      for (let i = 0; i < totalBuckets; i++) {
        const startIdx = i * bucketSize;
        const endIdx = Math.min(channelData.length, startIdx + bucketSize);
        let maxVal = 0;

        for (let j = startIdx; j < endIdx; j += 4) { // Sub-muestreo rápido para eficiencia
          const val = Math.abs(channelData[j]);
          if (val > maxVal) maxVal = val;
        }

        peaks[i] = maxVal;
        if (maxVal > globalMax) globalMax = maxVal;
      }

      // Normalizar al rango 0.05..1.0 si existe señal
      if (globalMax > 0.001) {
        for (let i = 0; i < totalBuckets; i++) {
          peaks[i] = Math.min(1, peaks[i] / globalMax);
        }
      }

      await audioCtx.close();

      return {
        peaks,
        duration,
        samplesPerSecond,
        isReal: true,
        fileName: file.name
      };
    } catch (decodeErr) {
      console.warn('decodeAudioData no pudo decodificar el contenedor/códec de audio:', decodeErr);
      await audioCtx.close();
      return null;
    }
  } catch (err) {
    console.warn('Error general durante la extracción de audio:', err);
    return null;
  }
}

/**
 * Obtiene la amplitud interpolada en un segundo específico.
 */
export function getWaveformAmplitude(
  waveformData: WaveformData | null,
  timeSeconds: number
): number {
  if (!waveformData || !waveformData.peaks || waveformData.peaks.length === 0) {
    return 0;
  }
  const idx = Math.floor(timeSeconds * waveformData.samplesPerSecond);
  if (idx < 0 || idx >= waveformData.peaks.length) return 0;
  return waveformData.peaks[idx];
}
