import React from 'react';
import { Package, Boxes, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: 'picker') => void;
  onOpenWebhookGuide: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, onOpenWebhookGuide }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Title Section */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Sesi Praktik Lapangan (POJ)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Pilih Role yang Hendak Di-observasi
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Silakan tentukan divisi operasional yang sedang diobservasi oleh Trainer Officer. Penilaian akan direkam langsung secara real-time.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Role 1: Picker (ACTIVE) */}
        <div 
          onClick={() => onSelectRole('picker')}
          className="relative bg-white rounded-2xl border-2 border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <Package className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Tersedia
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              Picker
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Observasi dan evaluasi checklist praktik kerja tim Picker, meliputi alur Picking dan standar Packing paket pesanan.
            </p>
          </div>

          <div>
            <div className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs">
              <span>Pilih Role Picker</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
              <span>Packing: Aktif</span>
              <span>·</span>
              <span>Picking: Segera</span>
            </div>
          </div>
        </div>

        {/* Role 2: Inventory Controller (DIMMED / REDUP) */}
        <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between opacity-55 cursor-not-allowed select-none">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-xl bg-slate-200/70 border border-slate-300/50 flex items-center justify-center text-slate-500">
                <Boxes className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Segera Hadir
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Inventory Controller
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Evaluasi stock opname, penataan letak bin lokasi barang, dan verifikasi fisik inventaris gudang/hub.
            </p>
          </div>

          <div>
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>Belum Dibuka</span>
            </button>
            <div className="mt-3 text-center text-[11px] text-slate-400 font-medium">
              Fungsi penilaian sedang dinonaktifkan
            </div>
          </div>
        </div>

        {/* Role 3: Quality Assurance (DIMMED / REDUP) */}
        <div className="relative bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between opacity-55 cursor-not-allowed select-none">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-13 h-13 rounded-xl bg-slate-200/70 border border-slate-300/50 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Segera Hadir
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Quality Assurance
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
              Inspeksi kualitas produk saat inbound, grading kesegaran buah & sayur, dan penanganan item reject/damage.
            </p>
          </div>

          <div>
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>Belum Dibuka</span>
            </button>
            <div className="mt-3 text-center text-[11px] text-slate-400 font-medium">
              Fungsi penilaian sedang dinonaktifkan
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner for Trainers */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="max-w-xl">
          <div className="text-xs font-semibold tracking-wider uppercase text-emerald-400 mb-1">
            Panduan Trainer Officer
          </div>
          <h4 className="text-lg font-bold text-white mb-1.5">
            Integrasi Langsung ke Google Spreadsheet
          </h4>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Data penilaian peserta akan otomatis diteruskan ke Google Sheet tim Anda via Webhook Apps Script tanpa perlu entri manual ulang.
          </p>
        </div>
        <button
          onClick={onOpenWebhookGuide}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors shadow-xs"
        >
          Lihat Petunjuk Webhook
        </button>
      </div>
    </div>
  );
};
