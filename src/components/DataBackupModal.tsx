import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Utensils,
  Calendar,
  Apple,
  KeyRound,
} from 'lucide-react';
import {
  exportAllData,
  importAllData,
  resetAllDataToDefaults,
} from '../utils/storage';
import type { Dish, Fruit, WeekPlan } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishes: Dish[];
  fruits: Fruit[];
  plans: Record<string, WeekPlan>;
  onDataReloaded: () => void;
  onChangePin?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  dishes,
  fruits,
  plans,
  onDataReloaded,
  onChangePin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const totalPlansCount = Object.keys(plans).length;

  const handleDownloadBackup = () => {
    try {
      const jsonString = exportAllData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`;
      a.href = url;
      a.download = `menu-semanal-copia-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        text: 'Copia de seguridad descargada correctamente.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({
        type: 'error',
        text: 'No se pudo generar el archivo de copia de seguridad.',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setFeedback({
          type: 'error',
          text: 'El archivo seleccionado está vacío.',
        });
        return;
      }

      const res = importAllData(content);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: 'Copia de seguridad restaurada con éxito.',
        });
        onDataReloaded();
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          text: res.message || 'Error al importar los datos.',
        });
      }
    };
    reader.onerror = () => {
      setFeedback({
        type: 'error',
        text: 'Error al leer el archivo en el dispositivo.',
      });
    };
    reader.readAsText(file);

    // Reset input value so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetToFactory = () => {
    resetAllDataToDefaults();
    setIsResetConfirmOpen(false);
    setFeedback({
      type: 'success',
      text: 'Se han borrado todos los datos: el recetario, las frutas y las semanas han quedado vacíos.',
    });
    onDataReloaded();
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-6 bg-stone-900/40 backdrop-blur-xs cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-[#ded5c5] overflow-hidden animate-scale-up cursor-default my-auto flex flex-col max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[#eee7da] bg-[#faf8f4] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#eef4ee] border border-[#cbdbcb] flex items-center justify-center text-[#425c42] shrink-0">
              <HardDrive className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#2f3833]">
                Gestión de Datos y Copias
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#847866] hover:text-[#2d3748] p-1.5 sm:p-2 rounded-2xl hover:bg-white transition cursor-pointer shrink-0"
            title="Cerrar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Current Stored Stats - Mostrado directamente */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-[#faf8f4] border border-[#ede5d6] p-2.5 sm:p-3 rounded-xl">
              <Utensils className="w-4 h-4 text-[#527354] mx-auto mb-1" />
              <div className="text-base sm:text-lg font-bold text-[#2d3831]">{dishes.length}</div>
              <div className="text-[10px] sm:text-[11px] text-[#738276] uppercase font-semibold">
                Platos
              </div>
            </div>
            <div className="bg-[#faf8f4] border border-[#ede5d6] p-2.5 sm:p-3 rounded-xl">
              <Apple className="w-4 h-4 text-[#bf6d54] mx-auto mb-1" />
              <div className="text-base sm:text-lg font-bold text-[#2d3831]">{fruits.length}</div>
              <div className="text-[10px] sm:text-[11px] text-[#738276] uppercase font-semibold">
                Frutas
              </div>
            </div>
            <div className="bg-[#faf8f4] border border-[#ede5d6] p-2.5 sm:p-3 rounded-xl">
              <Calendar className="w-4 h-4 text-[#4a6b82] mx-auto mb-1" />
              <div className="text-base sm:text-lg font-bold text-[#2d3831]">{totalPlansCount}</div>
              <div className="text-[10px] sm:text-[11px] text-[#738276] uppercase font-semibold">
                Semanas
              </div>
            </div>
          </div>

          {/* Action Buttons: Export & Import */}
          <div className="space-y-2.5 pt-1">
            {/* Exportar */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-[#ded5c5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#527354] transition shadow-2xs">
              <div className="min-w-0">
                <div className="font-semibold text-[#2f3833] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#527354]" />
                  <span>Descargar Copia de Seguridad (.json)</span>
                </div>
                <p className="text-[11px] text-[#7b7364] mt-0.5">
                  Guarda un archivo de respaldo o llévalo a tu móvil, tablet u otro ordenador.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-3.5 py-2 rounded-xl bg-[#527354] hover:bg-[#435e45] text-white text-xs font-semibold shrink-0 cursor-pointer transition shadow-xs active:scale-95"
              >
                Exportar
              </button>
            </div>

            {/* Importar */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-[#ded5c5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-[#527354] transition shadow-2xs">
              <div className="min-w-0">
                <div className="font-semibold text-[#2f3833] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#4a6b82]" />
                  <span>Restaurar Copia de Seguridad</span>
                </div>
                <p className="text-[11px] text-[#7b7364] mt-0.5">
                  Carga un archivo <code className="font-mono">.json</code> previo para recuperar tus recetas y planes.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-white border border-[#c8d4db] hover:bg-[#f2f7fa] text-[#365063] text-xs font-semibold shrink-0 cursor-pointer transition shadow-xs active:scale-95"
                >
                  Seleccionar archivo
                </button>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fade-in ${
                feedback.type === 'success'
                  ? 'bg-[#eef6ee] text-[#2e5732] border border-[#c1dec3]'
                  : 'bg-[#fdf2f2] text-[#8c3232] border border-[#f2c7c7]'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3b7541]" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#b53a3a]" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Reset zone */}
          <div className="pt-2 border-t border-[#eee7da]">
            {!isResetConfirmOpen ? (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="text-[11px] text-[#8c4636] hover:text-[#b8301c] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Borrar todo y vaciar recetario, frutas y semanas</span>
                </button>

                {onChangePin && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onChangePin();
                    }}
                    className="text-[11px] text-[#527354] hover:text-[#3f5d41] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Cambiar PIN</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#fdf4f2] border border-[#f5cfc7] rounded-xl text-xs space-y-2">
                <p className="text-[#8c2e1c] font-semibold">
                  ¿Estás seguro de que deseas borrar todo? Se eliminarán todos los platos del recetario, todas las frutas y todas las comidas de las semanas quedarán vacías.
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleResetToFactory}
                    className="px-3 py-1.5 rounded-lg bg-[#b8301c] text-white font-semibold text-xs cursor-pointer hover:bg-[#9c2514] transition"
                  >
                    Sí, borrar todo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#ded5c5] text-[#554a39] font-semibold text-xs cursor-pointer hover:bg-[#f6f2ea] transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#faf8f4] border-t border-[#eee7da] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#527354] text-white hover:bg-[#435e45] transition cursor-pointer shadow-xs active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
