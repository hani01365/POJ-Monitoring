import React from 'react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: 'roles' | 'picker_submenu' | 'packing_form') => void;
  onOpenWebhookGuide: () => void;
  hasWebhookConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenWebhookGuide,
  hasWebhookConfigured
}) => {
  return (
    <header className="border-b border-[#0c1a40]/8 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand wordmark: POJ Monitoring with royal blue accent */}
        <button
          onClick={() => onNavigate('roles')}
          className="flex items-center gap-2.5 text-left group transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#004aad] text-white flex items-center justify-center font-bold shadow-[0_6px_16px_-4px_rgba(0,74,173,0.35)] group-hover:scale-105 transition-transform shrink-0">
            <span className="text-lg leading-none">📋</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl text-[#0c1a40] tracking-tight leading-tight">
              POJ <span className="text-[#004aad]">Monitoring</span>
            </span>
            <span className="text-[11px] font-semibold text-[#5f6f8c] leading-tight">
              Observasi & Evaluasi Praktik POJ
            </span>
          </div>
        </button>

        {/* Webhook Sheets status button: Pill shape */}
        <div className="flex items-center">
          <button
            onClick={onOpenWebhookGuide}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              hasWebhookConfigured
                ? 'bg-blue-50/70 text-[#004aad] border-blue-200 hover:bg-blue-100/70'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Pengaturan Webhook Google Sheets"
          >
            <span className="text-xs leading-none">📊</span>
            <span className="hidden sm:inline">Google Sheets Terhubung</span>
            <span className="sm:hidden">Sheets</span>
          </button>
        </div>
      </div>
    </header>
  );
};


