import React from 'react';
import { POJSubmission } from '../types';
import { CheckCircle2, PlusCircle, Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  submission: POJSubmission | null;
  onNewSession: () => void;
  onViewHistory?: () => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  submission,
  onNewSession,
  onClose
}) => {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1">
          Laporan Berhasil Disimpan!
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          ID Dokumen: <span className="font-mono font-medium text-slate-700">{submission.id}</span>
        </p>

        {/* Sync Status Banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Status Google Sheets:</span>
            {submission.syncedToWebhook ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Terkirim ke Webhook
              </span>
            ) : (
              <span className="text-slate-700 font-semibold">
                Tersimpan di Riwayat Lokal
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Total Peserta:</span>
            <span className="font-bold text-slate-900">{submission.summary.totalParticipants} Orang</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Hasil Evaluasi:</span>
            <span className="text-slate-900 font-medium">
              <span className="text-emerald-600 font-bold">{submission.summary.allPassedCount} Lulus</span>
              {submission.summary.needImprovementCount > 0 && (
                <span> · <span className="text-rose-600 font-bold">{submission.summary.needImprovementCount} Perlu Bimbingan</span></span>
              )}
            </span>
          </div>
        </div>

        {/* Action Button: Hanya Mulai Penilaian Sesi Baru & Tutup */}
        <div className="space-y-2">
          <button
            onClick={onNewSession}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Penilaian Sesi Baru</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
