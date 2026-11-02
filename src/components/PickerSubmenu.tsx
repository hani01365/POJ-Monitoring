import React from 'react';

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
        className="inline-flex items-center gap-2 text-sm font-bold text-[#5f6f8c] hover:text-[#0c1a40] transition-colors mb-6 group cursor-pointer"
      >
        <span className="group-hover:-translate-x-1 transition-transform">⬅️</span>
        <span>Kembali ke Pemilihan Role</span>
      </button>

      {/* Header with Prototype Headline Styling */}
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/80 backdrop-blur-sm text-[#004aad] mb-4 border border-blue-100/80 shadow-xs">
          <span>Role: Picker Operasional</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#0c1a40] tracking-tight leading-[1.16] mb-3">
          Pilih modul penilaian <br className="hidden sm:inline" />
          <span className="text-[#004aad]">praktik</span>
        </h1>
        <p className="text-[#5f6f8c] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          Pilih modul evaluasi yang akan dijalankan. Modul Penilaian Packing telah siap digunakan dengan 6 indikator checklist standar operasional.
        </p>
      </div>

      {/* Main Sheet Container */}
      <div className="proto-sheet-container bg-white p-6 sm:p-9 mb-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#edf2f7]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0c1a40] tracking-tight">
              Modul Praktik Picker
            </h2>
            <p className="text-xs text-[#64748b]">
              Pilih salah satu modul di bawah ini
            </p>
          </div>
          <span className="text-xs font-bold text-[#004aad] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Packing Siap
          </span>
        </div>

        {/* Two Main Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Card 1: Penilaian Packing (ACTIVE - Matching Prototype Selected Card) */}
          <div 
            onClick={onSelectPacking}
            className="proto-card-active p-6 sm:p-7 transition-all duration-200 cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-200 shadow-xs">
                  <span className="text-2xl leading-none">📦</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#004aad] border border-blue-100 flex items-center gap-1.5">
                  <span>✅</span>
                  Siap Digunakan
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#0c1a40] mb-2 group-hover:text-[#004aad] transition-colors">
                Penilaian Packing
              </h3>
              <p className="text-[#5f6f8c] text-sm leading-relaxed mb-6">
                Evaluasi kepatuhan praktik pengemasan paket pesanan: Weight Hierarchy, pemisahan Food & Non-Food, Ice Pack, Fragile handling, Resi/SKU Bulky, dan SLA waktu packing.
              </p>

              <div className="space-y-2 mb-6 text-xs text-[#5f6f8c] bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="font-bold text-[#0c1a40] flex items-center gap-1.5 mb-1.5">
                  <span>📝</span>
                  <span>6 Kriteria Checklist Evaluasi</span>
                </div>
                <p>• Weight Hierarchy & Inner Packaging</p>
                <p>• Ice Pack & Fragile Bubble Wrap</p>
                <p>• Penempelan Resi & SLA Waktu Pengemasan</p>
              </div>
            </div>

            <div>
              {/* Prototype Signature Blue Pill Button with Warm Glow */}
              <button
                type="button"
                onClick={onSelectPacking}
                className="proto-btn-primary w-full py-3.5 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Mulai Penilaian Packing</span>
                <span className="group-hover:translate-x-1 transition-transform">➡️</span>
              </button>
            </div>
          </div>

          {/* Card 2: Penilaian Picking (DIMMED / REDUP) */}
          <div className="proto-card-inactive p-6 sm:p-7 opacity-55 cursor-not-allowed select-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <span className="text-2xl leading-none">🛒</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
                  <span className="text-xs">🔒</span>
                  Segera Hadir
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-[#0c1a40] mb-2">
                Penilaian Picking
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                Evaluasi alur rute pengambilan barang di area rak/bin, akurasi pemindaian barcode item, pengecekan expiry date, dan kecepatan picking sesuai SLA.
              </p>

              <div className="space-y-2 mb-6 text-xs text-[#64748b] bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <span>🔒</span>
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
                className="w-full py-3.5 px-6 rounded-full bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>🔒</span>
                <span>Belum Dapat Digunakan</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
