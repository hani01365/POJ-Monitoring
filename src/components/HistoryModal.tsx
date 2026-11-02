import React, { useState } from 'react';
import { POJSubmission } from '../types';
import { exportSubmissionsToCsv, sendSubmissionToWebhook, updateSubmissionSyncStatus } from '../utils/storage';
import { generateTrainerRecapText } from '../utils/recapFormatter';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: POJSubmission[];
  webhookUrl: string;
  onRefreshSubmissions: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  submissions,
  webhookUrl,
  onRefreshSubmissions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = submissions.filter(sub => {
    const q = searchTerm.toLowerCase();
    const trainerMatch = sub.trainer.nama.toLowerCase().includes(q) || sub.trainer.lokasi.toLowerCase().includes(q);
    const participantMatch = sub.participants.some(p => p.name.toLowerCase().includes(q) || p.staffId.toLowerCase().includes(q));
    return trainerMatch || participantMatch;
  });

  const handleExportAll = () => {
    exportSubmissionsToCsv(filtered.length ? filtered : submissions);
  };

  const handleResend = async (sub: POJSubmission) => {
    if (!webhookUrl) {
      setFeedbackMsg({ text: 'Silakan atur URL Webhook Google Sheets terlebih dahulu.', isError: true });
      return;
    }

    setResendingId(sub.id);
    const result = await sendSubmissionToWebhook(webhookUrl, sub);
    setResendingId(null);

    if (result.success) {
      updateSubmissionSyncStatus(sub.id, true);
      onRefreshSubmissions();
      setFeedbackMsg({ text: `Sesi ${sub.id} berhasil dikirim ulang ke Google Sheets!` });
    } else {
      updateSubmissionSyncStatus(sub.id, false, result.message);
      onRefreshSubmissions();
      setFeedbackMsg({ text: `Gagal mengirim: ${result.message}`, isError: true });
    }
  };

  const handleCopyRecap = async (sub: POJSubmission) => {
    const text = generateTrainerRecapText(sub);
    try {
      await navigator.clipboard.writeText(text);
      setFeedbackMsg({ text: `📋 Teks rekap sesi ${sub.id} (${sub.trainer.lokasi}) berhasil disalin ke clipboard!` });
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setFeedbackMsg({ text: `📋 Teks rekap sesi ${sub.id} (${sub.trainer.lokasi}) berhasil disalin ke clipboard!` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#d9e2ec] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#edf2f7] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-xl text-[#0c1a40] tracking-tight">
              Riwayat <span className="text-[#004aad]">Evaluasi POJ</span>
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Daftar sesi observasi tersimpan lokal dan sinkronisasi Google Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748b] hover:text-[#0c1a40] p-2 rounded-full hover:bg-[#f1f5f9] transition-colors cursor-pointer text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Feedback message banner if any */}
        {feedbackMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
            feedbackMsg.isError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <span>⚠️</span>
            <span className="flex-1">{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="p-4 bg-[#f8faff] border-b border-[#edf2f7] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Cari trainer, peserta, hub..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-[#d9e2ec] bg-white text-[#0c1a40] focus:outline-none focus:border-[#004aad] focus:ring-2 focus:ring-[#004aad]/10"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportAll}
              disabled={submissions.length === 0}
              className="px-4 py-2 rounded-full bg-white border border-[#d9e2ec] hover:border-[#004aad] hover:text-[#004aad] disabled:opacity-40 text-[#0c1a40] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>📥</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* List of Submissions */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-[#64748b] text-xs">
              Belum ada riwayat evaluasi yang tersimpan. Lakukan evaluasi dan submit untuk melihat riwayat di sini.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#64748b] text-xs">
              Tidak ditemukan data yang cocok dengan pencarian "{searchTerm}".
            </div>
          ) : (
            filtered.map(sub => {
              const dateFormatted = new Date(sub.timestamp).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={sub.id}
                  className="bg-white rounded-[20px] border border-[#d9e2ec] p-4.5 shadow-sm hover:border-[#004aad]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#edf2f7]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#0c1a40]">
                          {sub.trainer.lokasi}
                        </span>
                        <span className="text-xs text-[#64748b] font-mono">
                          ({dateFormatted})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#64748b] mt-1">
                        <span className="flex items-center gap-1">
                          <span>👤</span>
                          <span>Trainer: <strong className="text-[#0c1a40]">{sub.trainer.nama}</strong></span>
                        </span>
                        <span>·</span>
                        <span>{sub.summary.totalParticipants} Peserta</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyRecap(sub)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white hover:bg-blue-50 text-[#004aad] border border-blue-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Salin teks rekap rapi sesi ini"
                      >
                        <span>📋</span>
                        <span>Salin Rekap</span>
                      </button>

                      {sub.syncedToWebhook ? (
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                          <span>✅</span>
                          <span className="hidden sm:inline">Tersinkron Sheets</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResend(sub)}
                          disabled={resendingId === sub.id}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#004aad]/10 hover:bg-[#004aad] hover:text-white text-[#004aad] border border-[#004aad]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Kirimkan data ke Google Sheets"
                        >
                          <span className={resendingId === sub.id ? 'animate-spin inline-block' : ''}>🔄</span>
                          <span>Kirim ke Sheets</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Participants table snippet */}
                  <div className="space-y-1.5">
                    {sub.participants.map(p => {
                      const scores = p.scores;
                      const hasFail = Object.values(scores).some(v => v === 'Tidak Sesuai');

                      return (
                        <div key={p.participantId} className="flex items-center justify-between text-xs bg-[#f8faff] px-3.5 py-2 rounded-xl border border-[#edf2f7] gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {p.photoBase64 && (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoUrl(p.photoBase64 || null)}
                                className="cursor-pointer"
                                title="Lihat Foto Bukti"
                              >
                                <img
                                  src={p.photoBase64}
                                  alt="Bukti"
                                  className="w-7 h-7 object-cover rounded-md border border-slate-200 hover:scale-105 transition"
                                />
                              </button>
                            )}
                            <span className="font-bold text-[#0c1a40]">{p.name}</span>
                            <span className="font-mono text-[#64748b] text-[11px]">({p.staffId})</span>
                            {p.photoBase64 && (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoUrl(p.photoBase64 || null)}
                                className="text-[10px] text-[#004aad] font-bold bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100"
                              >
                                📸 Foto
                              </button>
                            )}
                            {p.notes && (
                              <span className="text-[#64748b] text-[11px] italic truncate max-w-xs">
                                - "{p.notes}"
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] font-extrabold shrink-0 ${hasFail ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {hasFail ? 'Perlu Bimbingan' : 'Lulus'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8faff] border-t border-[#edf2f7] flex items-center justify-between text-xs">
          <span className="text-[#64748b]">
            Total {submissions.length} sesi evaluasi tersimpan di browser
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0c1a40] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* History Photo Lightbox Modal */}
      {viewingPhotoUrl && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div className="relative max-w-xl max-h-[90vh] bg-black rounded-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewingPhotoUrl(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black font-bold z-10 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={viewingPhotoUrl}
              alt="Foto Hasil Praktik"
              className="w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
