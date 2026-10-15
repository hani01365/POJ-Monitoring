import React from 'react';
import { ArrowLeft, Box, ShoppingCart, ArrowRight, Lock, CheckCircle2, ListChecks } from 'lucide-react';

interface PickerSubmenuProps {
  onBack: () => void;
  onSelectPacking: () => void;
}

export const PickerSubmenu: React.FC<PickerSubmenuProps> = ({ onBack, onSelectPacking }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke Pemilihan Role</span>
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">
          <span>Role Observasi</span>
          <span>·</span>
          <span>Picker Operasional</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Pilih Modul Penilaian Praktik
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
          Pilih modul evaluasi yang akan dijalankan. Saat ini modul Penilaian Packing telah siap digunakan dengan 6 indikator checklist standar operasional.
        </p>
      </div>

      {/* Two Main Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Penilaian Packing (ACTIVE) */}
        <div 
          onClick={onSelectPacking}
          className="bg-white rounded-2xl border-2 border-indigo-600 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Box className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Siap Digunakan
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
              Penilaian Packing
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Evaluasi kepatuhan praktik pengemasan paket pesanan: Weight Hierarchy, pemisahan Food & Non-Food, Ice Pack, Fragile handling, Resi/SKU Bulky, dan SLA waktu packing.
            </p>

            <div className="space-y-1.5 mb-6 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <ListChecks className="w-3.5 h-3.5 text-indigo-600" />
                <span>6 Kriteria Checklist Evaluasi</span>
              </div>
              <p>• Weight Hierarchy & Inner Packaging</p>
              <p>• Ice Pack & Fragile Bubble Wrap</p>
              <p>• Penempelan Resi & SLA Waktu Pengemasan</p>
            </div>
          </div>

          <div>
            <button
              onClick={onSelectPacking}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Mulai Penilaian Packing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Card 2: Penilaian Picking (DIMMED / REDUP) */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 sm:p-7 opacity-50 cursor-not-allowed select-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-xl bg-slate-200/70 border border-slate-300/50 flex items-center justify-center text-slate-500">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Segera Hadir
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Penilaian Picking
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Evaluasi alur rute pengambilan barang di area rak/bin, akurasi pemindaian barcode item, pengecekan expiry date, dan kecepatan picking sesuai SLA.
            </p>

            <div className="space-y-1.5 mb-6 text-xs text-slate-400 bg-slate-100/60 p-3 rounded-xl border border-slate-200/50">
              <div className="font-medium text-slate-500 flex items-center gap-1.5 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Modul Dalam Tahap Pengembangan</span>
              </div>
              <p>• Routing & Bin Accuracy</p>
              <p>• Expiry Date Checking</p>
              <p>• Picking SLA Compliance</p>
            </div>
          </div>

          <div>
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>Belum Dapat Digunakan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
