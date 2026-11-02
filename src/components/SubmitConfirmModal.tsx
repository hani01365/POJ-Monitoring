import React from 'react';
import { TrainerData, ParticipantEvaluation, PACKING_CRITERIA } from '../types';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
  trainer: TrainerData;
  evaluations: ParticipantEvaluation[];
  webhookUrl: string;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmSubmit,
  isSubmitting,
  trainer,
  evaluations,
  webhookUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#e2e8f0] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004aad]">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0c1a40]">
                Konfirmasi Pengiriman Laporan
              </h3>
              <p className="text-xs text-[#64748b]">
                Verifikasi sebelum data evaluasi direkam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Question with Prototype font styling */}
          <div className="p-5 rounded-2xl bg-[#f8faff] border border-blue-100 text-center">
            <h4 className="text-lg font-extrabold text-[#0c1a40] mb-1">
              Apakah data evaluasi sudah <span className="text-[#004aad]">sesuai?</span>
            </h4>
            <p className="text-xs text-[#64748b]">
              Data akan dicatat secara permanen dan dikirimkan ke Google Sheets laporan POJ.
            </p>
          </div>

          {/* Session Overview Box */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[#64748b]">Trainer yang Menilai:</span>
              <span className="font-bold text-[#0c1a40]">{trainer.nama} ({trainer.staffId})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[#64748b]">Lokasi POJ:</span>
              <span className="font-semibold text-[#0c1a40]">{trainer.lokasi}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-[#64748b]">Tanggal POJ:</span>
              <span className="font-mono text-[#0c1a40]">{trainer.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Total Peserta:</span>
              <span className="font-bold text-[#004aad]">{evaluations.length} Orang Peserta</span>
            </div>
          </div>

          {/* Participants Quick List */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0c1a40] mb-2.5">
              Ringkasan Kepatuhan Peserta:
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {evaluations.map((p, idx) => {
                const scoresList = Object.values(p.scores);
                const hasNotCompliant = scoresList.some(v => v === 'Tidak Sesuai');
                const sesuaiCount = scoresList.filter(v => v === 'Sesuai').length;
                const naCount = scoresList.filter(v => v === 'N/A').length;

                return (
                  <div 
                    key={p.participantId}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      {p.photoBase64 && (
                        <img
                          src={p.photoBase64}
                          alt="Thumbnail"
                          className="w-10 h-10 object-cover rounded-xl border border-blue-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-extrabold text-[#0c1a40] flex items-center gap-1.5 flex-wrap">
                          <span>{idx + 1}. {p.name}</span>
                          <span className="text-[#64748b] font-mono text-[11px]">({p.staffId})</span>
                          {p.photoBase64 && (
                            <span className="text-[10px] bg-blue-50 text-[#004aad] px-1.5 py-0.5 rounded-md font-bold">
                              📸 Ada Foto
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748b] mt-0.5">
                          {sesuaiCount} Sesuai · {naCount} N/A
                          {p.notes && <span className="italic text-[#94a3b8] ml-1">· "{p.notes}"</span>}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasNotCompliant ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <span>⚠️</span>
                          <span>Perlu Bimbingan</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#004aad] border border-blue-200 flex items-center gap-1">
                          <span>✅</span>
                          <span>Sesuai SOP</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#f8faff] border-t border-[#edf2f7] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-[#475569] font-bold text-xs transition-colors cursor-pointer"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="proto-btn-primary px-7 py-3 text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Data...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Ya, Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
