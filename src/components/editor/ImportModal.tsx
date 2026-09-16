import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { importSRTContent, importJSONContent } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        setErrorMsg('El archivo está vacío');
        return;
      }

      if (file.name.endsWith('.srt') || file.type.includes('subrip') || file.type.includes('text')) {
        importSRTContent(content, file.name);
        setSuccessMsg(`Subtítulos importados correctamente desde ${file.name}`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (file.name.endsWith('.json')) {
        importJSONContent(content);
        setSuccessMsg(`Proyecto JSON importado correctamente`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        // Fallback try as SRT
        importSRTContent(content, file.name);
        setSuccessMsg(`Procesado como SRT`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo del disco');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Sample quick test SRT
  const loadSampleSRT = () => {
    const sample = `1
00:00:02,000 --> 00:00:05,200
[PRESENTADOR]: Bienvenidos al avance informativo especial de las dos de la tarde.

2
00:00:05,800 --> 00:00:09,400
Speaker 03: La comisión técnica ha aprobado por unanimidad el nuevo protocolo de accesibilidad.

3
00:00:10,100 --> 00:00:13,500
Speaker 03: ¿Qué estás haciendo aquí con el equipo de rodaje?

4
00:00:14,200 --> 00:00:17,800
Speaker 04: Esperamos poder emitir en directo antes de las quince horas.
`;
    importSRTContent(sample, 'demo_muestra_rapida.srt');
    setSuccessMsg('Muestra de prueba cargada con éxito');
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-broadcast-panel border border-broadcast-border rounded shadow-2xl p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-broadcast-textMuted hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <Upload className="w-5 h-5 text-broadcast-accent" />
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-white">
              Importar Subtítulos o Transcripción
            </h3>
            <p className="text-xs text-broadcast-textMuted">
              Carga un archivo local SRT o JSON para editarlo inmediatamente en PACUE
            </p>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-broadcast-accent bg-broadcast-accent/10' 
              : 'border-broadcast-border hover:border-broadcast-borderLight bg-broadcast-darkest/60'
          }`}
        >
          <FileText className="w-10 h-10 text-broadcast-accent mb-3" />
          <p className="text-sm font-semibold text-white mb-1">
            Arrastra tu archivo .SRT o .JSON aquí
          </p>
          <p className="text-xs text-broadcast-textMuted mb-4">
            o haz clic para seleccionar desde tu ordenador
          </p>
          <span className="px-3 py-1.5 rounded bg-broadcast-surface border border-broadcast-border text-xs font-mono text-broadcast-accent">
            Formatos admitidos: .SRT • .JSON
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.json,text/plain"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="mt-4 p-2.5 rounded bg-[#B96852]/20 border border-[#B96852]/40 text-[#B96852] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-2.5 rounded bg-[#2B2722] border border-[#3A352E] text-[#D8D1C5] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#D8D1C5] flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick sample loader */}
        <div className="mt-6 pt-4 border-t border-broadcast-border flex items-center justify-between">
          <span className="text-xs text-broadcast-textMuted">¿Quieres probar sin archivo?</span>
          <button
            onClick={loadSampleSRT}
            className="px-3 py-1.5 rounded bg-broadcast-surface hover:bg-broadcast-border text-xs text-broadcast-accent font-medium transition-colors"
          >
            Cargar muestra rápida (SRT)
          </button>
        </div>
      </div>
    </div>
  );
};
