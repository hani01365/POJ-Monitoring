import { POJSubmission, PACKING_CRITERIA } from '../types';

export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1SZQPwZLTQM1yszL1giQFZnkG4hUKt6go?usp=drive_link';

/**
 * Format tanggal ke format lokal Indonesia (misal: "Senin, 02 Nov 2026")
 */
function formatIndonesianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate teks rekap evaluasi POJ yang rapi, profesional, dan siap
 * di-copy-paste oleh trainer ke WhatsApp / Telegram / Slack / Email.
 */
export function generateTrainerRecapText(submission: POJSubmission): string {
  const { trainer, participants, summary, id, timestamp } = submission;
  const formattedDate = formatIndonesianDate(trainer.tanggal || timestamp.split('T')[0]);

  // Map kriteria id ke label singkat
  const criteriaMap: Record<string, string> = {};
  PACKING_CRITERIA.forEach(c => {
    criteriaMap[c.id] = c.shortLabel || c.title;
  });

  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

  let text = `📋 *REKAP EVALUASI PRAKTIK LAPANGAN (POJ)*\n`;
  text += `*Modul:* Role Picker - Simulasi Packing Pesanan\n`;
  text += `${divider}\n`;
  text += `📍 *Lokasi Hub:* ${trainer.lokasi || '-'}\n`;
  text += `📅 *Tanggal:* ${formattedDate}\n`;
  text += `👨‍🏫 *Trainer:* ${trainer.nama || '-'} (Staff ID: ${trainer.staffId || '-'})\n`;
  text += `🆔 *ID Dokumen:* ${id}\n\n`;

  text += `📊 *RINGKASAN KELULUSAN:*\n`;
  text += `• Total Peserta : ${summary.totalParticipants} Orang\n`;
  text += `• ✅ Lulus (SOP)  : ${summary.allPassedCount} Orang\n`;
  text += `• ⚠️ Perlu Bimbingan: ${summary.needImprovementCount} Orang\n\n`;

  text += `${divider}\n`;
  text += `👥 *HASIL EVALUASI PER PESERTA:*\n\n`;

  participants.forEach((p, idx) => {
    const scores = p.scores || {};
    const notCompliantList: string[] = [];

    Object.keys(scores).forEach(critId => {
      if (scores[critId] === 'Tidak Sesuai') {
        const name = criteriaMap[critId] || critId;
        notCompliantList.push(name);
      }
    });

    const isPassed = notCompliantList.length === 0;
    const statusIcon = isPassed ? '✅' : '⚠️';
    const statusText = isPassed ? 'Lulus / Sesuai SOP' : 'Perlu Bimbingan';

    text += `${idx + 1}. *${p.name}* (Staff ID: ${p.staffId})\n`;
    text += `   • Status: ${statusIcon} ${statusText}\n`;

    if (!isPassed && notCompliantList.length > 0) {
      text += `   • Poin Perbaikan: ${notCompliantList.join(', ')}\n`;
    }

    if (p.notes && p.notes.trim() && p.notes !== '-') {
      text += `   • Catatan Trainer: "${p.notes.trim()}"\n`;
    }

    if (p.photoBase64) {
      text += `   • Foto Bukti: Tersimpan di Google Drive\n`;
    }

    text += `\n`;
  });

  text += `${divider}\n`;
  text += `📁 *Folder Dokumentasi Foto:* \n${GOOGLE_DRIVE_FOLDER_URL}\n`;
  text += `\n_Laporan terverifikasi sistem POJ Monitoring & tersinkronisasi ke Google Sheets._`;

  return text;
}
