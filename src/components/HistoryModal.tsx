import React, { useState } from 'react';
import { POJSubmission } from '../types';
import { 
  X, 
  Download, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  User, 
  Sheet,
  RotateCw
} from 'lucide-react';
import { exportSubmissionsToCsv, sendSubmissionToWebhook, updateSubmissionSyncStatus } from '../utils/storage';

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
      alert('Silakan atur URL Webhook Google Sheets terlebih dahulu pada menu Setup Google Sheets.');
      return;
    }

    setResendingId(sub.id);
    const result = await sendSubmissionToWebhook(webhookUrl, sub);
    setResendingId(null);

    if (result.success) {
      updateSubmissionSyncStatus(sub.id, true);
      onRefreshSubmissions();
      alert('Data evaluasi berhasil dikirim ulang ke Google Sheets!');
    } else {
      updateSubmissionSyncStatus(sub.id, false, result.message);
      onRefreshSubmissions();
      alert(`Gagal mengirim: ${result.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Riwayat Evaluasi POJ
            </h3>
            <p className="text-xs text-slate-500">
              Daftar sesi observasi tersimpan lokal dan status sinkronisasi ke Sheets
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari trainer, peserta, hub..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportAll}
              disabled={submissions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ke CSV / Excel</span>
            </button>
          </div>
        </div>

        {/* List of Submissions */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {submissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Belum ada riwayat evaluasi yang tersimpan. Lakukan evaluasi dan submit untuk melihat riwayat di sini.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
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
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {sub.trainer.lokasi}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          ({dateFormatted})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Trainer: {sub.trainer.nama}</span>
                        </span>
                        <span>·</span>
                        <span>{sub.summary.totalParticipants} Peserta</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sub.syncedToWebhook ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Tersinkron Sheets</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResend(sub)}
                          disabled={resendingId === sub.id}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 transition-colors"
                          title="Kirimkan data ke Google Sheets"
                        >
                          <RotateCw className={`w-3 h-3 ${resendingId === sub.id ? 'animate-spin' : ''}`} />
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
                        <div key={p.participantId} className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{p.name}</span>
                            <span className="font-mono text-slate-400 text-[11px]">({p.staffId})</span>
                            {p.notes && (
                              <span className="text-slate-500 text-[11px] italic truncate max-w-xs">
                                - "{p.notes}"
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] font-bold ${hasFail ? 'text-rose-600' : 'text-emerald-600'}`}>
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Total {submissions.length} sesi evaluasi tersimpan di browser
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
