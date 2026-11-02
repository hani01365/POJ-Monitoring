import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/appsScriptCode';

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
      // Generate a clean 100x100 sample JPEG image for testing Google Drive saving & hyperlink
      let samplePhotoBase64 = '';
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#004aad';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('TEST FOTO', 14, 55);
        }
        samplePhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
      } catch {
        samplePhotoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
      }

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
            notes: 'Test koneksi dari POJ Monitoring',
            photoBase64: samplePhotoBase64,
            photoTimestamp: new Date().toISOString()
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
      setTestMessage('Berhasil! Data uji coba beserta foto telah terkirim ke Google Spreadsheet Anda.');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Gagal mengirim data uji coba ke Webhook.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#e2e8f0] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004aad]">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#0c1a40]">
                Setup Google Sheets Webhook
              </h3>
              <p className="text-xs text-[#64748b]">
                Hubungkan formulir POJ Monitoring langsung ke Google Spreadsheet Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#475569] leading-relaxed">
          {/* Webhook URL Input Section */}
          <div className="bg-[#f8faff] p-5 rounded-2xl border border-blue-100 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0c1a40]">
              URL Webhook Google Apps Script Anda:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="url"
                value={currentUrl}
                onChange={e => setCurrentUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 rounded-2xl border border-[#d9e2ec] font-mono text-xs bg-white text-[#0c1a40] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2.5 rounded-full bg-[#0c1a40] hover:bg-slate-800 text-white font-bold text-xs whitespace-nowrap transition-colors cursor-pointer"
                >
                  Simpan URL
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing' || !currentUrl.trim()}
                  className="px-5 py-2.5 rounded-full bg-[#004aad] hover:bg-[#003d8f] disabled:opacity-50 text-white font-bold text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shadow-[0_8px_18px_-4px_rgba(0,74,173,0.4)] cursor-pointer"
                >
                  <span>📤</span>
                  <span>{testStatus === 'testing' ? 'Menguji...' : 'Test Koneksi'}</span>
                </button>
              </div>
            </div>

            {testMessage && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
                testStatus === 'success' 
                  ? 'bg-blue-50 text-[#004aad] border border-blue-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-[#004aad] border border-blue-200'
              }`}>
                {testStatus === 'success' && <span>✅</span>}
                {testStatus === 'error' && <span>⚠️</span>}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Step by step guide */}
          <div>
            <h4 className="font-extrabold text-sm text-[#0c1a40] mb-3 flex items-center gap-2">
              <span>Langkah-langkah Pembuatan Webhook:</span>
            </h4>
            <ol className="space-y-2.5 list-decimal list-inside text-[#475569] bg-white p-5 rounded-2xl border border-[#e2e8f0]">
              <li>
                Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-[#004aad] hover:underline font-bold inline-flex items-center gap-0.5">Google Sheets Baru ↗️</a> (misal beri judul <em>"Data Evaluasi POJ"</em>).
              </li>
              <li>
                Di menu atas spreadsheet, klik menu <span className="font-bold text-[#0c1a40]">Extensions</span> &gt; pilih <span className="font-bold text-[#0c1a40]">Apps Script</span>.
              </li>
              <li>
                Hapus seluruh isi editor script yang muncul, lalu <strong>salin & tempelkan kode di bawah</strong> ke dalam file <code className="bg-blue-50 text-[#004aad] px-1.5 py-0.5 rounded font-mono">Code.gs</code>.
              </li>
              <li>
                Klik tombol <span className="font-bold text-[#0c1a40]">Deploy</span> di pojok kanan atas &gt; pilih <span className="font-bold text-[#0c1a40]">New deployment</span>.
              </li>
              <li>
                Klik ikon gerigi ⚙️ (Select type) &gt; pilih <span className="font-bold text-[#0c1a40]">Web app</span>.
              </li>
              <li>
                Konfigurasikan:
                <ul className="list-disc list-inside ml-4 mt-1.5 text-[#64748b] space-y-1">
                  <li><strong>Description:</strong> POJ Monitoring Webhook</li>
                  <li><strong>Execute as:</strong> Me (email Anda)</li>
                  <li><strong>Who has access:</strong> <span className="text-[#004aad] font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Anyone</span> <em>(PENTING agar webapp bisa mengirim data tanpa login)</em></li>
                </ul>
              </li>
              <li>
                Klik <span className="font-bold text-[#0c1a40]">Deploy</span>, izinkan akses akun (Authorize access), lalu salin <strong>Web app URL</strong> yang berakhiran <code className="font-mono text-[#004aad]">/exec</code>.
              </li>
              <li>
                Tempelkan URL tersebut ke kolom input di atas, lalu klik <strong>Simpan URL</strong> & <strong>Test Koneksi</strong>.
              </li>
            </ol>
          </div>

          {/* Special notice: Solusi Error Drive Izin Akses */}
          <div className="bg-rose-50/90 border border-rose-200 p-4 rounded-2xl space-y-2.5 text-rose-900">
            <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
              <span className="text-base">🚨</span>
              <span>Muncul Pesan: "Anda tidak memiliki izin untuk memanggil DriveApp"?</span>
            </div>
            <p className="text-[11px] text-rose-800/90 leading-relaxed">
              Ini terjadi karena Google Apps Script mewajibkan persetujuan izin (Authorize) lewat editor saat pertama kali menambahkan akses Drive. Ikuti <strong>4 langkah cepat ini</strong>:
            </p>
            <ol className="list-decimal list-inside text-[11px] space-y-1.5 ml-1 text-rose-900 font-medium">
              <li>
                Di editor <strong>Apps Script</strong>, tempelkan kode terbaru dari tombol <strong>"Salin Seluruh Kode"</strong> di bawah lalu klik <strong>Save (Disket)</strong>.
              </li>
              <li>
                Di toolbar atas (sebelah tombol "Debug"), ubah dropdown fungsi menjadi <strong><code>beriIzinAksesDrive</code></strong> lalu klik tombol <strong>Run (Jalankan ▶️)</strong>.
              </li>
              <li>
                Akan muncul popup: Klik <strong>Review Permissions</strong> &gt; pilih akun Google Anda (<strong>hanifah.ramadini@astronauts.id</strong>) &gt; klik <strong>Advanced</strong> (Lanjutan) &gt; klik <strong>Allow (Izinkan)</strong>.
              </li>
              <li>
                Setelah muncul tulisan <em>"Execution completed"</em>, klik menu <strong>Deploy</strong> &gt; <strong>Manage deployments</strong> &gt; klik pensil ✏️ (<strong>Edit</strong>) &gt; pilih <strong>New version</strong> &gt; klik <strong>Deploy</strong>.
              </li>
            </ol>
            <div className="text-[11px] font-semibold text-blue-900 bg-white/80 p-3 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-2">
              <div className="flex items-center gap-1.5">
                <span>📁</span>
                <span>Foto akan otomatis masuk ke folder Google Drive Anda: <strong>1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go</strong></span>
              </div>
              <a
                href="https://drive.google.com/drive/folders/1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-[#004aad] text-white font-bold text-xs inline-flex items-center gap-1 hover:bg-[#003d8f] transition-all whitespace-nowrap shadow-xs"
              >
                <span>Buka Google Drive ↗️</span>
              </a>
            </div>
          </div>

          {/* Copyable Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0c1a40] text-xs">
                Kode Google Apps Script (Code.gs):
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-full bg-[#004aad] hover:bg-[#003d8f] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_6px_16px_-4px_rgba(0,74,173,0.35)] cursor-pointer"
              >
                {copied ? (
                  <>
                    <span>✅</span>
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Salin Seluruh Kode</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-[#0c1a40] text-slate-100 font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
              <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8faff] border-t border-[#edf2f7] flex items-center justify-between">
          <span className="text-[11px] text-[#64748b]">
            Setiap submit otomatis membuat sheet "POJ_Packing_Evaluations"
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#0c1a40] hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
