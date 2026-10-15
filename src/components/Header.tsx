import React from 'react';
import { ClipboardCheck, Sheet } from 'lucide-react';

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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand wordmark: Cukup POJ Monitoring */}
        <button
          onClick={() => onNavigate('roles')}
          className="flex items-center gap-2.5 text-left group transition"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-indigo-600 transition-colors">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight leading-tight">
            POJ Monitoring
          </span>
        </button>

        {/* Webhook Sheets status button */}
        <div className="flex items-center">
          <button
            onClick={onOpenWebhookGuide}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              hasWebhookConfigured
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Pengaturan Webhook Google Sheets"
          >
            <Sheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Sheets Terhubung</span>
            <span className="sm:hidden">Sheets</span>
          </button>
        </div>
      </div>
    </header>
  );
};

