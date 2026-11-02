import React from 'react';
import { POJSubmission } from '../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#e2e8f0] shadow-2xl max-w-md w-full p-7 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-18 h-18 rounded-3xl bg-blue-50 text-[#004aad] flex items-center justify-center mx-auto mb-5 border border-blue-100 shadow-[0_8px_20px_-4px_rgba(0,74,173,0.25)]">
          <span className="text-3xl leading-none">🎉</span>
        </div>

        <h3 className="text-2xl font-extrabold text-[#0c1a40] tracking-tight mb-1">
          Laporan Berhasil <span className="text-[#004aad]">Disimpan!</span>
        </h3>
        <p className="text-xs text-[#64748b] mb-6">
          ID Dokumen: <span className="font-mono font-bold text-[#0c1a40]">{submission.id}</span>
        </p>

        {/* Sync Status Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-[#f8faff] border border-blue-100 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-blue-100/60">
            <span className="text-[#64748b]">Status Google Sheets:</span>
            {submission.syncedToWebhook ? (
              <span className="text-[#004aad] font-bold flex items-center gap-1">
                <span>✅</span>
                Terkirim ke Webhook
              </span>
            ) : (
              <span className="text-[#0c1a40] font-semibold">
                Tersimpan di Riwayat Lokal
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">Total Peserta:</span>
            <span className="font-bold text-[#0c1a40]">{submission.summary.totalParticipants} Orang</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748b]">Hasil Evaluasi:</span>
            <span className="text-[#0c1a40] font-medium">
              <span className="text-[#004aad] font-extrabold">{submission.summary.allPassedCount} Lulus</span>
              {submission.summary.needImprovementCount > 0 && (
                <span> · <span className="text-rose-600 font-extrabold">{submission.summary.needImprovementCount} Perlu Bimbingan</span></span>
              )}
            </span>
          </div>
        </div>

        {/* Action Button: Prototype Signature Blue Pill Button */}
        <div className="space-y-2.5">
          <button
            onClick={onNewSession}
            className="proto-btn-primary w-full py-4 px-6 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>➕</span>
            <span>Mulai Penilaian Sesi Baru</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-full border border-slate-200 hover:bg-slate-50 text-[#64748b] font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
