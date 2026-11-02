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
  const [copiedLink, setCopiedLink] = React.useState(false);

  const handleShareApp = async () => {
    const shareUrl = 'https://ais-pre-knqgzr4lyqpwbmjxtwmple-223186062059.asia-east1.run.app';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'POJ Monitoring - Observasi & Evaluasi Praktik Lapangan',
          text: 'Aplikasi Form Evaluasi Praktik Lapangan (POJ)',
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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

        {/* Webhook Sheets, Google Drive, & Share buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareApp}
            className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer ${
              copiedLink 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'border-slate-200 bg-white hover:bg-slate-50 text-[#0c1a40]'
            }`}
            title="Bagikan link aplikasi ini"
          >
            <span>{copiedLink ? '✅' : '🔗'}</span>
            <span className="hidden sm:inline">{copiedLink ? 'Link Tersalin!' : 'Bagikan'}</span>
          </button>

          <a
            href="https://drive.google.com/drive/folders/1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go?usp=drive_link"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 text-xs font-bold rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0c1a40] transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            title="Buka Folder Foto di Google Drive"
          >
            <span className="text-xs">📁</span>
            <span className="hidden sm:inline">Folder Drive</span>
          </a>

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


