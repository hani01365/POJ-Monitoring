import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/appsScriptCode';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Sheet, 
  HelpCircle, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface WebhookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveWebhookUrl: (url: string) => void;
}

export const WebhookGuideModal: React.FC<WebhookGuideModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(webhookUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  React.useEffect(() => {
    if (webhookUrl) {
      setCurrentUrl(webhookUrl);
    }
  }, [webhookUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSave = () => {
    onSaveWebhookUrl(currentUrl);
    setTestMessage('URL Webhook berhasil disimpan.');
    setTimeout(() => setTestMessage(''), 3000);
  };

  const handleTestConnection = async () => {
    if (!currentUrl.trim().startsWith('http')) {
      setTestStatus('error');
      setTestMessage('Harap masukkan URL yang valid diawali https://script.google.com/macros/s/...');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Menguji koneksi ke Google Apps Script...');

    try {
      const testPayload = {
        id: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        role: 'Picker',
        type: 'Packing',
        trainer: {
          nama: 'Test Trainer',
          staffId: 'TEST-001',
          lokasi: 'Hub Uji Coba',
          tanggal: new Date().toISOString().split('T')[0]
        },
        participants: [
          {
            participantId: 'test-p-1',
            name: 'Peserta Uji Coba',
            staffId: '99999',
            scores: {
              weight_hierarchy: 'Sesuai',
              food_nonfood_separation: 'Sesuai',
              ice_pack: 'Sesuai',
              fragile_handling: 'Sesuai',
              barcode_resi_bulky: 'Sesuai',
              sla_packing_time: 'Sesuai'
            },
            notes: 'Test koneksi dari POJ Monitoring'
          }
        ],
        summary: {
          totalParticipants: 1,
          allPassedCount: 1,
          needImprovementCount: 0
        }
      };

      await fetch(currentUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(testPayload),
        mode: 'no-cors'
      });

      // Simpan juga jika sukses test
      onSaveWebhookUrl(currentUrl.trim());
      setTestStatus('success');
      setTestMessage('Berhasil! Data uji coba telah terkirim ke Google Spreadsheet Anda.');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Gagal mengirim data uji coba ke Webhook.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Sheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Setup Google Sheets Webhook
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan formulir POJ Monitoring langsung ke Google Spreadsheet Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Webhook URL Input Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              URL Webhook Google Apps Script Anda:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={currentUrl}
                onChange={e => setCurrentUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs whitespace-nowrap transition-colors"
                >
                  Simpan URL
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !currentUrl.trim()}
                  className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testStatus === 'testing' ? 'Menguji...' : 'Test Koneksi'}</span>
                </button>
              </div>
            </div>

            {testMessage && (
              <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                testStatus === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Step by step guide */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2.5 flex items-center gap-2">
              <span>Langkah-langkah Pembuatan Webhook:</span>
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
              <li>
                Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-0.5">Google Sheets Baru <ExternalLink className="w-3 h-3" /></a> (misal beri judul <em>"Data Evaluasi POJ"</em>).
              </li>
              <li>
                Di menu atas spreadsheet, klik menu <span className="font-semibold text-slate-900">Extensions</span> &gt; pilih <span className="font-semibold text-slate-900">Apps Script</span>.
              </li>
              <li>
                Hapus seluruh isi editor script yang muncul, lalu <strong>salin & tempelkan kode di bawah</strong> ke dalam file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-700">Code.gs</code>.
              </li>
              <li>
                Klik tombol <span className="font-semibold text-slate-900">Deploy</span> di pojok kanan atas &gt; pilih <span className="font-semibold text-slate-900">New deployment</span>.
              </li>
              <li>
                Klik ikon gerigi ⚙️ (Select type) &gt; pilih <span className="font-semibold text-slate-900">Web app</span>.
              </li>
              <li>
                Konfigurasikan:
                <ul className="list-disc list-inside ml-4 mt-1 text-slate-600">
                  <li><strong>Description:</strong> POJ Monitoring Webhook</li>
                  <li><strong>Execute as:</strong> Me (email Anda)</li>
                  <li><strong>Who has access:</strong> <span className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">Anyone</span> <em>(PENTING agar webapp bisa mengirim data tanpa login)</em></li>
                </ul>
              </li>
              <li>
                Klik <span className="font-semibold text-slate-900">Deploy</span>, izinkan akses akun (Authorize access), lalu salin <strong>Web app URL</strong> yang berakhiran <code className="font-mono text-indigo-600">/exec</code>.
              </li>
              <li>
                Tempelkan URL tersebut ke kolom input di atas, lalu klik <strong>Simpan URL</strong> & <strong>Test Koneksi</strong>.
              </li>
            </ol>
          </div>

          {/* Copyable Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">
                Kode Google Apps Script (Code.gs):
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Setiap submit otomatis membuat sheet "POJ_Packing_Evaluations"
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
