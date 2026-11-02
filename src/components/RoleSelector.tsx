import React from 'react';

interface RoleSelectorProps {
  onSelectRole: (role: 'picker') => void;
  onOpenWebhookGuide: () => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, onOpenWebhookGuide }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Title Section - Matching Prototype Headline Style */}
      <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/80 backdrop-blur-sm text-[#004aad] mb-4 border border-blue-100/80 shadow-xs">
          <span className="text-xs">📋</span>
          <span>Sesi Observasi Praktik Lapangan</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#0c1a40] tracking-tight leading-[1.16] mb-3">
          Evaluasi Observasi <br className="hidden sm:inline" />
          Praktik <span className="text-[#004aad]">POJ</span>
        </h1>
        
        <p className="text-[#5f6f8c] text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          Platform penilaian untuk memantau kepatuhan standar kerja peserta selama sesi praktik POJ
        </p>
      </div>

      {/* Main Sheet Container - Matching Prototype White Elevated Sheet */}
      <div className="proto-sheet-container bg-white p-6 sm:p-9 mb-10">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#edf2f7]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0c1a40] tracking-tight">
              Pilih Role Mitra
            </h2>
            <p className="text-xs text-[#64748b]">
              Pilih divisi yang akan diobservasi pada sesi ini
            </p>
          </div>
          <span className="text-xs font-bold text-[#004aad] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            1 Modul Aktif
          </span>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
          {/* Role 1: Picker (ACTIVE - Matching Selected Card with Royal Blue Border & Glow) */}
          <div 
            onClick={() => onSelectRole('picker')}
            className="proto-card-active p-6 sm:p-7 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004aad] group-hover:bg-[#004aad] group-hover:text-white transition-colors duration-200 shadow-xs">
                  <span className="text-2xl leading-none">📦</span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#004aad] border border-blue-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#004aad] animate-pulse"></span>
                  Tersedia
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0c1a40] mb-2 group-hover:text-[#004aad] transition-colors">
                Picker
              </h3>
              <p className="text-[#5f6f8c] text-xs sm:text-sm leading-relaxed mb-6">
                Observasi dan evaluasi checklist praktik kerja tim Picker, meliputi alur Picking dan standar Packing paket pesanan.
              </p>
            </div>

            <div>
              {/* Prototype Signature Blue Pill Button with Warm Glow */}
              <button 
                type="button"
                onClick={() => onSelectRole('picker')}
                className="proto-btn-primary w-full py-3.5 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Pilih Role Picker</span>
                <span className="group-hover:translate-x-1 transition-transform">➡️</span>
              </button>
              <div className="mt-3.5 flex items-center justify-center gap-2 text-[11px] text-[#64748b] font-medium">
                <span className="font-bold text-[#004aad]">Packing: Aktif</span>
                <span>·</span>
                <span>Picking: Segera</span>
              </div>
            </div>
          </div>

          {/* Role 2: Inventory Controller (DIMMED / REDUP) */}
          <div className="proto-card-inactive p-6 sm:p-7 flex flex-col justify-between opacity-55 cursor-not-allowed select-none">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <span className="text-2xl leading-none">🗄️</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
                  <span className="text-xs">🔒</span>
                  Segera Hadir
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0c1a40] mb-2">
                Inventory Controller
              </h3>
              <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed mb-6">
                Evaluasi stock opname, penataan letak bin lokasi barang, dan verifikasi fisik inventaris gudang/hub.
              </p>
            </div>

            <div>
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-full bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>🔒</span>
                <span>Belum Dibuka</span>
              </button>
              <div className="mt-3.5 text-center text-[11px] text-slate-400 font-medium">
                Fungsi penilaian sedang dinonaktifkan
              </div>
            </div>
          </div>

          {/* Role 3: Quality Assurance (DIMMED / REDUP) */}
          <div className="proto-card-inactive p-6 sm:p-7 flex flex-col justify-between opacity-55 cursor-not-allowed select-none">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <span className="text-2xl leading-none">🛡️</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
                  <span className="text-xs">🔒</span>
                  Segera Hadir
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-[#0c1a40] mb-2">
                Quality Assurance
              </h3>
              <p className="text-[#64748b] text-xs sm:text-sm leading-relaxed mb-6">
                Inspeksi kualitas produk saat inbound, grading kesegaran buah & sayur, dan penanganan item reject/damage.
              </p>
            </div>

            <div>
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-full bg-slate-100 text-slate-400 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <span>🔒</span>
                <span>Belum Dibuka</span>
              </button>
              <div className="mt-3.5 text-center text-[11px] text-slate-400 font-medium">
                Fungsi penilaian sedang dinonaktifkan
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner for Trainers inside the sheet */}
        <div className="bg-[#0c1a40] text-white rounded-[22px] p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-[0_12px_28px_-8px_rgba(12,26,64,0.22)]">
          <div className="max-w-xl">
            <div className="text-[11px] font-bold tracking-wider uppercase text-blue-300 mb-1">
              Panduan Trainer Officer
            </div>
            <h4 className="text-base sm:text-lg font-extrabold text-white mb-1">
              Integrasi Langsung ke Google Spreadsheet
            </h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Data penilaian peserta otomatis terkirim ke Google Sheet via Webhook Apps Script tanpa perlu entri manual ulang.
            </p>
          </div>
          <button
            onClick={onOpenWebhookGuide}
            className="shrink-0 px-5 py-2.5 rounded-full bg-white text-[#0c1a40] hover:bg-blue-50 font-bold text-xs sm:text-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            Lihat Petunjuk Webhook
          </button>
        </div>
      </div>
    </div>
  );
};
