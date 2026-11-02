import React, { useState } from 'react';
import { POJSubmission } from '../types';
import { generateTrainerRecapText, GOOGLE_DRIVE_FOLDER_URL } from '../utils/recapFormatter';

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
  onViewHistory,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !submission) return null;

  const recapText = generateTrainerRecapText(submission);

  const handleCopyRecap = async () => {
    try {
      await navigator.clipboard.writeText(recapText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
      const textarea = document.createElement('textarea');
      textarea.value = recapText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(recapText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#e2e8f0] shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#004aad] text-white flex items-center justify-center font-bold text-xl shadow-[0_8px_20px_-4px_rgba(0,74,173,0.35)] shrink-0">
              <span>🎉</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-extrabold text-[#0c1a40] tracking-tight">
                  Laporan Berhasil <span className="text-[#004aad]">Disimpan!</span>
                </h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569] border border-slate-200">
                  {submission.id}
                </span>
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                {submission.trainer.lokasi} · {submission.trainer.tanggal || 'Hari ini'} · Trainer: {submission.trainer.nama}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-base font-bold shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#475569]">
          
          {/* Quick Metrics & Sheets Status */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#f8faff] p-3 rounded-2xl border border-blue-100/80 text-center">
              <span className="block text-[11px] text-[#64748b] font-medium">Total Peserta</span>
              <span className="text-lg font-black text-[#0c1a40]">{submission.summary.totalParticipants}</span>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 text-center">
              <span className="block text-[11px] text-emerald-800 font-medium">Lulus SOP</span>
              <span className="text-lg font-black text-emerald-700">{submission.summary.allPassedCount}</span>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100 text-center">
              <span className="block text-[11px] text-amber-800 font-medium">Bimbingan</span>
              <span className="text-lg font-black text-amber-700">{submission.summary.needImprovementCount}</span>
            </div>
          </div>

          {/* Sync Webhook Banner */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-sm">📊</span>
              <span className="font-semibold text-[#0c1a40]">Status Google Sheets:</span>
            </div>
            {submission.syncedToWebhook ? (
              <span className="text-[#004aad] font-bold flex items-center gap-1 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-200">
                <span>✅</span> Terkirim ke Spreadsheet
              </span>
            ) : (
              <span className="text-slate-600 font-medium bg-white px-2.5 py-1 rounded-full border border-slate-200">
                Tersimpan di Riwayat Lokal
              </span>
            )}
          </div>

          {/* REKAP TRAINER SECTION (READY TO COPY PASTE) */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
            {/* Recap Card Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#004aad] to-[#0c1a40] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-base">📋</span>
                <div>
                  <h4 className="font-extrabold text-xs tracking-wide">
                    REKAP HASIL OBSERVASI (SIAP COPY-PASTE)
                  </h4>
                  <p className="text-[10px] text-blue-100">
                    Format rapi untuk laporan grup WhatsApp / Telegram / Slack
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyRecap}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    copied
                      ? 'bg-emerald-500 text-white scale-105'
                      : 'bg-white text-[#004aad] hover:bg-blue-50'
                  }`}
                >
                  {copied ? (
                    <>
                      <span>✅</span>
                      <span>Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Salin Rekap Teks</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Bagikan langsung ke WhatsApp"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Recap Content Preview Box */}
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              <pre className="p-3.5 rounded-xl bg-white text-[#0c1a40] font-mono text-[11px] leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap select-all border border-slate-200">
                {recapText}
              </pre>
              <div className="flex items-center justify-between mt-2.5 text-[10px] text-[#64748b]">
                <span>💡 Klik kotak teks di atas untuk memilih seluruh isi secara cepat.</span>
                <button
                  type="button"
                  onClick={handleCopyRecap}
                  className="text-[#004aad] hover:underline font-bold cursor-pointer"
                >
                  {copied ? '✅ Tersalin' : 'Salin Semua'}
                </button>
              </div>
            </div>
          </div>

          {/* Direct Google Drive Folder Link */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📁</span>
              <div>
                <span className="font-bold text-[#0c1a40] block">Folder Dokumentasi Google Drive</span>
                <span className="text-[10px] text-[#64748b]">Folder penyimpanan foto hasil packing peserta</span>
              </div>
            </div>
            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-full bg-[#004aad] text-white font-bold text-xs hover:bg-[#003d8f] transition-colors whitespace-nowrap shadow-xs"
            >
              Buka Drive ↗️
            </a>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {onViewHistory && (
            <button
              type="button"
              onClick={onViewHistory}
              className="text-[#004aad] hover:text-[#003d8f] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>📜</span>
              <span>Buka Riwayat Semua Sesi</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-[#475569] font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={onNewSession}
              className="proto-btn-primary py-2.5 px-6 text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>➕</span>
              <span>Mulai Sesi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
