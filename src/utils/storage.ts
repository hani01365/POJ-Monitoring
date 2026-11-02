import { POJSubmission, TrainerData } from '../types';

const TRAINER_KEY = 'poj_trainer_profile';
const WEBHOOK_KEY = 'poj_webhook_url';
const SUBMISSIONS_KEY = 'poj_submissions_history';

export const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwb20qIc8pOD-nG55oNAf6S7sK_j93s1dFIHpL9fwlsHJA5KIepff6kotv_XNsYP3a5/exec';

export function getSavedTrainerData(): TrainerData {
  try {
    const raw = localStorage.getItem(TRAINER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading trainer profile', e);
  }
  return {
    nama: '',
    staffId: '',
    lokasi: '',
    tanggal: new Date().toISOString().split('T')[0]
  };
}

export function saveTrainerData(data: TrainerData): void {
  try {
    localStorage.setItem(TRAINER_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving trainer profile', e);
  }
}

export function getWebhookUrl(): string {
  try {
    const saved = localStorage.getItem(WEBHOOK_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return DEFAULT_WEBHOOK_URL;
}

export function saveWebhookUrl(url: string): void {
  try {
    localStorage.setItem(WEBHOOK_KEY, url.trim());
  } catch (e) {
    console.error('Failed saving webhook url', e);
  }
}

export function getSubmissions(): POJSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading submissions history', e);
  }
  return [];
}

export function saveSubmission(submission: POJSubmission): void {
  try {
    const list = getSubmissions();
    const updated = [submission, ...list];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated.slice(0, 100))); // keep latest 100
  } catch (e) {
    console.error('Failed saving submission', e);
  }
}

export function updateSubmissionSyncStatus(id: string, synced: boolean, error?: string): void {
  try {
    const list = getSubmissions();
    const updated = list.map(item => {
      if (item.id === id) {
        return { ...item, syncedToWebhook: synced, webhookResponse: error || (synced ? 'Berhasil terkirim' : undefined) };
      }
      return item;
    });
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed updating submission sync status', e);
  }
}

/**
 * Mengirim data ke Google Apps Script Webhook.
 * Karena Google Apps Script menggunakan redirect (302) dan CORS policy khusus,
 * kita kirimkan data dengan format text/plain atau no-cors POST.
 */
export async function sendSubmissionToWebhook(url: string, submission: POJSubmission): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim().startsWith('http')) {
    return { success: false, message: 'URL Webhook Google Apps Script belum dikonfigurasi.' };
  }

  const payload = {
    id: submission.id,
    timestamp: submission.timestamp,
    role: submission.role,
    type: submission.type,
    trainer: submission.trainer,
    participants: submission.participants,
    summary: submission.summary
  };

  try {
    // Mode no-cors atau text/plain payload agar tidak tertahan CORS browser
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });

    // In no-cors mode, browser returns opaque response (type: "opaque", status: 0),
    // which signifies request was dispatched successfully to Google Apps Script.
    return { success: true, message: 'Data evaluasi berhasil dikirim ke Google Sheets.' };
  } catch (err: any) {
    console.error('Webhook dispatch error:', err);
    return { success: false, message: err?.message || 'Gagal mengirim ke webhook' };
  }
}

export function exportSubmissionsToCsv(submissions: POJSubmission[]): void {
  if (!submissions.length) return;

  const headers = [
    'Submission ID',
    'Waktu Submit',
    'Nama Trainer',
    'Staff ID Trainer',
    'Lokasi POJ',
    'Tanggal POJ',
    'Nama Peserta',
    'Staff ID Peserta',
    '1. Weight Hierarchy',
    '2. Food & Non-Food',
    '3. Ice Pack Frozen',
    '4. Fragile Handling',
    '5. Resi & SKU Bulky',
    '6. SLA Waktu',
    'Hasil Akhir',
    'Catatan Trainer',
    'Foto Dokumentasi'
  ];

  const rows: string[][] = [];

  submissions.forEach(sub => {
    sub.participants.forEach(p => {
      const scores = p.scores;
      const hasNotCompliant = Object.values(scores).some(v => v === 'Tidak Sesuai');
      const hasil = hasNotCompliant ? 'Perlu Bimbingan' : 'Lulus';

      rows.push([
        sub.id,
        sub.timestamp,
        `"${sub.trainer.nama.replace(/"/g, '""')}"`,
        `"${sub.trainer.staffId}"`,
        `"${sub.trainer.lokasi.replace(/"/g, '""')}"`,
        sub.trainer.tanggal,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.staffId}"`,
        scores.weight_hierarchy || '-',
        scores.food_nonfood_separation || '-',
        scores.ice_pack || '-',
        scores.fragile_handling || '-',
        scores.barcode_resi_bulky || '-',
        scores.sla_packing_time || '-',
        hasil,
        `"${(p.notes || '').replace(/"/g, '""')}"`,
        p.photoBase64 ? 'Ada Foto Bukti' : 'Tidak Ada'
      ]);
    });
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `POJ_Packing_Evaluations_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
