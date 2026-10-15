import React from 'react';
import { TrainerData, ParticipantEvaluation, PACKING_CRITERIA } from '../types';
import { CheckCircle2, AlertTriangle, Send, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Konfirmasi Pengiriman Laporan
              </h3>
              <p className="text-xs text-slate-500">
                Verifikasi sebelum data evaluasi direkam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Question */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Apakah data evaluasi sudah sesuai?
            </h4>
            <p className="text-xs text-slate-600">
              Data akan dicatat secara permanen dan dikirimkan ke Google Sheets laporan POJ.
            </p>
          </div>

          {/* Session Overview Box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Trainer Officer:</span>
              <span className="font-bold text-slate-900">{trainer.nama} ({trainer.staffId})</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Lokasi POJ:</span>
              <span className="font-semibold text-slate-900">{trainer.lokasi}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Tanggal POJ:</span>
              <span className="font-mono text-slate-900">{trainer.tanggal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Peserta:</span>
              <span className="font-bold text-indigo-600">{evaluations.length} Orang Peserta</span>
            </div>
          </div>

          {/* Participants Quick List */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{idx + 1}. {p.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">({p.staffId})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {sesuaiCount} Sesuai · {naCount} N/A
                        {p.notes && <span className="italic text-slate-400 ml-1">· "{p.notes}"</span>}
                      </div>
                    </div>

                    <div>
                      {hasNotCompliant ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Perlu Bimbingan</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            Periksa Kembali
          </button>
          <button
            type="button"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mengirim Data...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Ya, Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
