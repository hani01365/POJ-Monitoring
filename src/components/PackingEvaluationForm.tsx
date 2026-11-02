import React, { useState, useEffect } from 'react';
import { 
  TrainerData, 
  Participant, 
  ParticipantEvaluation, 
  ScoreStatus, 
  PACKING_CRITERIA,
  ASTRO_HUB_LIST
} from '../types';
import { CameraModal } from './CameraModal';
import { compressImageFile } from '../utils/imageHelper';

interface PackingEvaluationFormProps {
  initialTrainer: TrainerData;
  onBack: () => void;
  onSubmitPrompt: (
    trainer: TrainerData, 
    evaluations: ParticipantEvaluation[]
  ) => void;
}

export const PackingEvaluationForm: React.FC<PackingEvaluationFormProps> = ({
  initialTrainer,
  onBack,
  onSubmitPrompt
}) => {
  // Field 1: Trainer Data
  const [trainer, setTrainer] = useState<TrainerData>(initialTrainer);
  const [isCustomHub, setIsCustomHub] = useState<boolean>(() => {
    return Boolean(initialTrainer.lokasi && !ASTRO_HUB_LIST.includes(initialTrainer.lokasi));
  });

  // Field 2: Participants input
  const [inputMode, setInputMode] = useState<'batch' | 'manual'>('batch');
  const [batchText, setBatchText] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualStaffId, setManualStaffId] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p-demo-1', name: 'Coki Bau', staffId: '69420' }
  ]);

  // Field 3: Evaluations per participant
  const [evaluations, setEvaluations] = useState<Record<string, {
    scores: Record<string, ScoreStatus | undefined>;
    notes: string;
    photoBase64?: string;
    photoTimestamp?: string;
  }>>({
    'p-demo-1': {
      scores: {
        weight_hierarchy: 'Sesuai',
        food_nonfood_separation: 'Sesuai',
        ice_pack: 'N/A',
        fragile_handling: 'Sesuai',
        barcode_resi_bulky: 'Sesuai',
        sla_packing_time: 'Sesuai'
      },
      notes: ''
    }
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeCameraParticipant, setActiveCameraParticipant] = useState<{ id: string; name: string } | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  // Sync evaluations state whenever participants list changes
  useEffect(() => {
    setEvaluations(prev => {
      const next = { ...prev };
      participants.forEach(p => {
        if (!next[p.id]) {
          next[p.id] = {
            scores: {},
            notes: ''
          };
        }
      });
      return next;
    });
  }, [participants]);

  // Batch Parser
  const handleParseBatch = () => {
    if (!batchText.trim()) return;

    const lines = batchText.split('\n');
    const newParticipants: Participant[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Match [nama] - [staff id] or [nama] – [staff id] or tab / comma / slash
      let name = '';
      let staffId = '';

      if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        name = parts[0].trim();
        staffId = parts.slice(1).join('-').trim();
      } else if (trimmed.includes('–')) {
        const parts = trimmed.split('–');
        name = parts[0].trim();
        staffId = parts.slice(1).join('–').trim();
      } else if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t');
        name = parts[0].trim();
        staffId = parts.slice(1).join(' ').trim();
      } else {
        // Fallback: take last word as staff id if it looks like numbers
        const words = trimmed.split(' ');
        if (words.length > 1 && /^\d+$/.test(words[words.length - 1])) {
          staffId = words.pop() || '';
          name = words.join(' ');
        } else {
          name = trimmed;
          staffId = `ID-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      }

      if (name) {
        newParticipants.push({
          id: `p-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          staffId: staffId || '0000'
        });
      }
    });

    if (newParticipants.length > 0) {
      setParticipants(prev => [...prev, ...newParticipants]);
      setBatchText('');
      setValidationError(null);
    }
  };

  // Add Manual
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newP: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: manualName.trim(),
      staffId: manualStaffId.trim() || '0000'
    };

    setParticipants(prev => [...prev, newP]);
    setManualName('');
    setManualStaffId('');
    setValidationError(null);
  };

  // Remove Participant
  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    setEvaluations(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Set Score
  const handleSetScore = (participantId: string, criterionId: string, value: ScoreStatus) => {
    setEvaluations(prev => {
      const current = prev[participantId] || { scores: {}, notes: '' };
      return {
        ...prev,
        [participantId]: {
          ...current,
          scores: {
            ...current.scores,
            [criterionId]: current.scores[criterionId] === value ? undefined : value
          }
        }
      };
    });
    setValidationError(null);
  };

  // Mark all Sesuai for a participant
  const handleMarkAllSesuai = (participantId: string) => {
    setEvaluations(prev => {
      const current = prev[participantId] || { scores: {}, notes: '' };
      const newScores: Record<string, ScoreStatus> = {};
      PACKING_CRITERIA.forEach(c => {
        newScores[c.id] = 'Sesuai';
      });
      return {
        ...prev,
        [participantId]: {
          ...current,
          scores: newScores
        }
      };
    });
  };

  // Set Notes
  const handleSetNotes = (participantId: string, notes: string) => {
    setEvaluations(prev => {
      const current = prev[participantId] || { scores: {}, notes: '' };
      return {
        ...prev,
        [participantId]: {
          ...current,
          notes
        }
      };
    });
  };

  // Add Quick Note Tag
  const handleAddQuickNote = (participantId: string, tag: string) => {
    const currentNotes = evaluations[participantId]?.notes || '';
    const updated = currentNotes ? `${currentNotes}, ${tag}` : tag;
    handleSetNotes(participantId, updated);
  };

  // Quick Demo Paste
  const handleUseDemoBatch = () => {
    setBatchText(
`Coki Cha - 69420
Dimas Do - 10452
Siti Shin - 20981
Ahmad Ahn - 33140`
    );
  };

  // Photo handlers
  const handlePhotoCaptured = (participantId: string, photoBase64: string) => {
    setEvaluations(prev => {
      const current = prev[participantId] || { scores: {}, notes: '' };
      return {
        ...prev,
        [participantId]: {
          ...current,
          photoBase64,
          photoTimestamp: new Date().toISOString()
        }
      };
    });
  };

  const handleRemovePhoto = (participantId: string) => {
    setEvaluations(prev => {
      const current = prev[participantId] || { scores: {}, notes: '' };
      const next = { ...current };
      delete next.photoBase64;
      delete next.photoTimestamp;
      return {
        ...prev,
        [participantId]: next
      };
    });
  };

  const handleFileInputChange = async (participantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const compressed = await compressImageFile(files[0], 800, 0.75);
      handlePhotoCaptured(participantId, compressed);
    } catch (err) {
      console.error('Error processing gallery image', err);
    } finally {
      e.target.value = '';
    }
  };

  // Validate & Proceed to Confirmation
  const handleSubmitClick = () => {
    // 1. Validate Trainer
    if (!trainer.nama.trim()) {
      setValidationError('Silakan isi Nama Trainer terlebih dahulu pada Bagian 1.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!trainer.staffId.trim()) {
      setValidationError('Silakan isi Staff ID Trainer terlebih dahulu pada Bagian 1.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!trainer.lokasi.trim()) {
      setValidationError('Silakan isi atau pilih Lokasi POJ pada Bagian 1.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Validate Participants
    if (participants.length === 0) {
      setValidationError('Harap masukkan minimal 1 peserta POJ pada Bagian 2.');
      return;
    }

    // 3. Check for incomplete scores
    const incompleteParticipants: string[] = [];
    participants.forEach(p => {
      const evalData = evaluations[p.id]?.scores || {};
      const completedCount = Object.keys(evalData).filter(k => evalData[k] !== undefined).length;
      if (completedCount < PACKING_CRITERIA.length) {
        incompleteParticipants.push(`${p.name} (${completedCount}/${PACKING_CRITERIA.length} dinilai)`);
      }
    });

    if (incompleteParticipants.length > 0) {
      const confirmProceed = window.confirm(
        `Catatan: Beberapa peserta belum selesai dinilai secara lengkap:\n\n• ${incompleteParticipants.join('\n• ')}\n\nTetap ingin melanjutkan submit?`
      );
      if (!confirmProceed) return;
    }

    // Assemble final evaluation payload
    const finalEvaluations: ParticipantEvaluation[] = participants.map(p => ({
      participantId: p.id,
      name: p.name,
      staffId: p.staffId,
      scores: evaluations[p.id]?.scores || {},
      notes: evaluations[p.id]?.notes || '',
      photoBase64: evaluations[p.id]?.photoBase64,
      photoTimestamp: evaluations[p.id]?.photoTimestamp
    }));

    onSubmitPrompt(trainer, finalEvaluations);
  };

  // Calculate overall completion
  const totalChecksNeeded = participants.length * PACKING_CRITERIA.length;
  let totalChecked = 0;
  participants.forEach(p => {
    const scores = evaluations[p.id]?.scores || {};
    totalChecked += Object.values(scores).filter(Boolean).length;
  });
  const percentComplete = totalChecksNeeded > 0 ? Math.round((totalChecked / totalChecksNeeded) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
      {/* Navigation Top */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] hover:text-[#0c1a40] transition-colors mb-6 group cursor-pointer"
      >
        <span className="group-hover:-translate-x-1 transition-transform">⬅️</span>
        <span>Kembali ke Modul Picker</span>
      </button>

      {/* Header matching Prototype Headline */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004aad] mb-2">
          <span>Role Picker</span>
          <span>·</span>
          <span>Checklist Evaluasi Praktik</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0c1a40] tracking-tight leading-[1.2] mb-2">
          Penilaian Packing <span className="text-[#004aad]">Peserta POJ</span>
        </h1>
        <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
          Lengkapi data sesi pelatihan, daftarkan peserta, dan centang indikator penilaian sesuai hasil observasi fisik saat simulasi packing pesanan.
        </p>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <span className="text-base shrink-0 mt-0.5">⚠️</span>
          <div className="flex-1 font-semibold">{validationError}</div>
          <button 
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* BAGIAN A: DATA TRAINER */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#004aad] text-white flex items-center justify-center font-extrabold text-sm shadow-[0_4px_12px_-2px_rgba(0,74,173,0.35)]">
              A
            </div>
            <h2 className="text-lg font-extrabold text-[#0c1a40]">
              Data Diri Trainer Officer
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#64748b] bg-slate-100 px-3 py-1 rounded-full">
            Wajib diisi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Trainer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0c1a40] mb-2 flex items-center gap-1.5">
              <span>👤</span>
              <span>Nama Trainer</span>
            </label>
            <input
              type="text"
              required
              value={trainer.nama}
              onChange={e => setTrainer({ ...trainer, nama: e.target.value })}
              placeholder="Contoh: Airo Yoon"
              className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] bg-white placeholder-[#94a3b8] transition-all"
            />
          </div>

          {/* Trainer Staff ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0c1a40] mb-2 flex items-center gap-1.5">
              <span>🪪</span>
              <span>Staff ID Trainer</span>
            </label>
            <input
              type="text"
              required
              value={trainer.staffId}
              onChange={e => setTrainer({ ...trainer, staffId: e.target.value })}
              placeholder="Contoh: TR-8921"
              className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] bg-white placeholder-[#94a3b8] transition-all font-mono"
            />
          </div>

          {/* Lokasi POJ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0c1a40] flex items-center gap-1.5">
                <span>📍</span>
                <span>Lokasi POJ</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomHub(!isCustomHub)}
                className="text-[11px] font-semibold text-[#004aad] hover:underline cursor-pointer"
              >
                {isCustomHub ? '📋 Pilih Dropdown' : '✏️ Ketik Manual'}
              </button>
            </div>

            {isCustomHub ? (
              <input
                type="text"
                required
                value={trainer.lokasi}
                onChange={e => setTrainer({ ...trainer, lokasi: e.target.value })}
                placeholder="Contoh: APR - Ampera"
                className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] bg-white placeholder-[#94a3b8] transition-all"
              />
            ) : (
              <div className="relative">
                <select
                  required
                  value={trainer.lokasi}
                  onChange={e => setTrainer({ ...trainer, lokasi: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] bg-white transition-all appearance-none cursor-pointer pr-10 font-medium"
                >
                  <option value="" disabled>
                    -- Pilih Hub ({ASTRO_HUB_LIST.length} Hub Astro) --
                  </option>
                  {trainer.lokasi && !ASTRO_HUB_LIST.includes(trainer.lokasi) && (
                    <option value={trainer.lokasi}>
                      {trainer.lokasi} (Tersimpan)
                    </option>
                  )}
                  {ASTRO_HUB_LIST.map(hub => (
                    <option key={hub} value={hub}>
                      {hub}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#004aad] font-bold text-xs">
                  ▼
                </div>
              </div>
            )}
          </div>

          {/* Tanggal POJ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0c1a40] mb-2 flex items-center gap-1.5">
              <span>📅</span>
              <span>Tanggal POJ</span>
            </label>
            <input
              type="date"
              required
              value={trainer.tanggal}
              onChange={e => setTrainer({ ...trainer, tanggal: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN B: INPUT PESERTA POJ */}
      {/* ========================================================= */}
      <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#004aad] text-white flex items-center justify-center font-extrabold text-sm shadow-[0_4px_12px_-2px_rgba(0,74,173,0.35)]">
              B
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0c1a40]">
                Input Peserta POJ yang Diobservasi
              </h2>
              <p className="text-xs text-[#64748b]">
                Dapat diinput otomatis/batch sekaligus atau satu per satu
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs in Pill Container */}
          <div className="flex items-center p-1.5 bg-[#f1f5f9] rounded-full text-xs font-bold">
            <button
              type="button"
              onClick={() => setInputMode('batch')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                inputMode === 'batch'
                  ? 'bg-white text-[#0c1a40] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0c1a40]'
              }`}
            >
              Input Batch
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                inputMode === 'manual'
                  ? 'bg-white text-[#0c1a40] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0c1a40]'
              }`}
            >
              Input Manual
            </button>
          </div>
        </div>

        {/* Tab 1: Batch Input */}
        {inputMode === 'batch' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-medium">
                Format per baris: <code className="bg-blue-50 text-[#004aad] px-2 py-0.5 rounded-md font-mono">[nama] - [staff id]</code>
              </span>
              <button
                type="button"
                onClick={handleUseDemoBatch}
                className="text-[#004aad] hover:underline font-bold text-xs cursor-pointer"
              >
                Gunakan Contoh
              </button>
            </div>

            <textarea
              rows={4}
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Tempelkan daftar nama & staff id peserta di sini, satu nama per baris:&#10;Coki Cha - 69420&#10;Dimas Do - 10452&#10;Siti Shin - 20981&#10;Ahmad Ahn - 33140"
              className="w-full p-4 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm font-mono leading-relaxed bg-white text-[#0c1a40] placeholder-[#94a3b8] transition-all"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseBatch}
                disabled={!batchText.trim()}
                className="px-5 py-3 rounded-full bg-[#004aad] hover:bg-[#003d8f] disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_8px_20px_-4px_rgba(0,74,173,0.35)] cursor-pointer active:scale-95"
              >
                <span>➕</span>
                <span>Tambahkan Peserta ke Daftar</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Input */}
        {inputMode === 'manual' && (
          <form onSubmit={handleAddManual} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nama Peserta (contoh: Coki Cha)"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm text-[#0c1a40] placeholder-[#94a3b8]"
              />
            </div>
            <div className="w-full sm:w-44">
              <input
                type="text"
                placeholder="Staff ID (contoh: 69420)"
                value={manualStaffId}
                onChange={e => setManualStaffId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-sm font-mono text-[#0c1a40] placeholder-[#94a3b8]"
              />
            </div>
            <button
              type="submit"
              disabled={!manualName.trim()}
              className="px-5 py-3 rounded-full bg-[#004aad] hover:bg-[#003d8f] disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_8px_20px_-4px_rgba(0,74,173,0.35)] cursor-pointer active:scale-95 shrink-0"
            >
              <span>➕</span>
              <span>Tambah Peserta</span>
            </button>
          </form>
        )}

        {/* Participant Roster Chips */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0c1a40] flex items-center gap-2">
              <span>👥</span>
              <span>Daftar Peserta Terdaftar ({participants.length} Orang)</span>
            </div>
            {participants.length > 0 && (
              <span className="text-xs text-[#64748b]">
                Checklist otomatis aktif di bawah
              </span>
            )}
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-8 px-4 bg-[#f8faff] rounded-2xl border border-dashed border-[#d9e2ec] text-[#64748b] text-xs">
              Belum ada peserta yang dimasukkan. Silakan ketik atau tempel nama peserta di atas.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map((p, index) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-2 bg-[#f8faff] hover:bg-blue-50/80 text-[#0c1a40] px-3.5 py-1.5 rounded-full text-xs font-medium border border-blue-100 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-[#004aad] text-white flex items-center justify-center text-[10px] font-extrabold">
                    {index + 1}
                  </span>
                  <span className="font-bold">{p.name}</span>
                  <span className="text-[#64748b] font-mono text-[11px]">({p.staffId})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 p-0.5 cursor-pointer font-bold"
                    title={`Hapus ${p.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN C: CHECKLIST EVALUASI PRAKTIK PACKING */}
      {/* ========================================================= */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#004aad] text-white flex items-center justify-center font-extrabold text-sm shadow-[0_4px_12px_-2px_rgba(0,74,173,0.35)]">
              C
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0c1a40]">
                Checklist Evaluasi Praktik Packing
              </h2>
              <p className="text-xs text-[#64748b]">
                Klik tombol indikator untuk menandai penilaian. Tombol akan menyala saat aktif.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#0c1a40] block">
              Progres Total: <span className="text-[#004aad] font-extrabold">{percentComplete}%</span>
            </span>
            <span className="text-[11px] text-[#64748b]">
              {totalChecked} dari {totalChecksNeeded} kriteria dinilai
            </span>
          </div>
        </div>

        {/* Render Checklist Card for EACH participant */}
        {participants.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#e2e8f0] p-12 text-center text-[#64748b] shadow-xs">
            <span className="text-4xl mx-auto mb-3 block">👥</span>
            <h4 className="text-base font-extrabold text-[#0c1a40] mb-1">Checklist Belum Muncul</h4>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              Silakan tambahkan minimal 1 peserta pada Bagian B di atas untuk memunculkan lembar checklist evaluasi.
            </p>
          </div>
        ) : (
          participants.map((participant, pIdx) => {
            const pEval = evaluations[participant.id] || { scores: {}, notes: '' };
            const pScores = pEval.scores || {};
            const ratedCount = Object.keys(pScores).filter(k => pScores[k] !== undefined).length;
            const isFull = ratedCount === PACKING_CRITERIA.length;

            return (
              <div 
                key={participant.id}
                className="bg-white rounded-[24px] border border-[#e2e8f0] shadow-xs overflow-hidden transition-all duration-200 hover:border-blue-200"
              >
                {/* Participant Card Header */}
                <div className="bg-[#f8faff] px-6 py-4 border-b border-[#edf2f7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0c1a40] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                      {pIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-[#0c1a40]">
                          {participant.name}
                        </h3>
                        <span className="font-mono text-xs text-[#004aad] bg-white px-2.5 py-0.5 rounded-full border border-blue-100 font-semibold">
                          ID: {participant.staffId}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748b] mt-0.5">
                        Status Pengisian: <span className={isFull ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{ratedCount} / {PACKING_CRITERIA.length} Kriteria</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Tandai Semua Sesuai */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAllSesuai(participant.id)}
                      className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#004aad] text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200 cursor-pointer"
                      title="Setel semua kriteria untuk peserta ini menjadi Sesuai"
                    >
                      <span>✅</span>
                      <span>Tandai Semua Sesuai</span>
                    </button>
                  </div>
                </div>

                {/* 6 Criteria List */}
                <div className="p-6 space-y-6 divide-y divide-slate-100">
                  {PACKING_CRITERIA.map(criterion => {
                    const currentVal = pScores[criterion.id];

                    return (
                      <div 
                        key={criterion.id} 
                        className={`pt-5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          currentVal ? '' : 'bg-blue-50/20 -mx-6 px-6 py-4 rounded-2xl'
                        }`}
                      >
                        {/* Criterion Info */}
                        <div className="max-w-xl">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-mono text-xs font-extrabold text-[#004aad]">
                              0{criterion.number}.
                            </span>
                            <h4 className="text-sm font-extrabold text-[#0c1a40]">
                              {criterion.title}
                            </h4>
                          </div>
                          <p className="text-xs text-[#475569] leading-relaxed">
                            {criterion.description}
                          </p>
                          {criterion.naExplanation && (
                            <p className="text-[11px] text-[#94a3b8] mt-0.5 italic">
                              *N/A: {criterion.naExplanation}
                            </p>
                          )}
                        </div>

                        {/* Interactive Pill Buttons Matching Prototype Style */}
                        <div className="flex items-center gap-2 shrink-0">
                          {criterion.options.map(option => {
                            const isSelected = currentVal === option;

                            // Styles based on option type when active
                            let activeClass = '';
                            let idleClass = 'bg-white text-[#475569] border-[#d9e2ec] hover:border-[#004aad]/40 hover:bg-[#f8faff]';

                            if (option === 'Sesuai') {
                              activeClass = 'bg-[#004aad] text-white border-[#004aad] shadow-[0_6px_16px_-3px_rgba(0,74,173,0.4)] ring-2 ring-[#004aad]/20';
                            } else if (option === 'Tidak Sesuai') {
                              activeClass = 'bg-[#e11d48] text-white border-[#e11d48] shadow-[0_6px_16px_-3px_rgba(225,29,72,0.35)] ring-2 ring-[#e11d48]/20';
                            } else {
                              // N/A
                              activeClass = 'bg-[#0c1a40] text-white border-[#0c1a40] shadow-xs ring-2 ring-[#0c1a40]/20';
                            }

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleSetScore(participant.id, criterion.id, option)}
                                className={`px-4 py-2.5 rounded-full text-xs font-bold border-2 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer ${
                                  isSelected ? activeClass : idleClass
                                }`}
                              >
                                {option === 'Sesuai' && (
                                  <span>✅</span>
                                )}
                                {option === 'Tidak Sesuai' && (
                                  <span>❌</span>
                                )}
                                {option === 'N/A' && (
                                  <span>➖</span>
                                )}
                                <span>{option}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Comment per Participant */}
                <div className="bg-[#f8faff]/60 p-6 border-t border-[#edf2f7]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#0c1a40] flex items-center gap-1.5">
                      <span>💬</span>
                      <span>Catatan Trainer untuk {participant.name} (Opsional)</span>
                    </label>
                    <span className="text-[11px] text-[#94a3b8]">Dapat dikosongkan</span>
                  </div>

                  <input
                    type="text"
                    value={pEval.notes || ''}
                    onChange={e => handleSetNotes(participant.id, e.target.value)}
                    placeholder={`Tambahkan feedback atau observasi khusus untuk ${participant.name}...`}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#d9e2ec] focus:outline-none focus:ring-4 focus:ring-[#004aad]/10 focus:border-[#004aad] text-xs bg-white text-[#0c1a40] placeholder-[#94a3b8] mb-2.5 transition-all"
                  />

                  {/* Quick comment chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-[#94a3b8] text-[10px] uppercase font-bold">Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Rapi & sesuai SOP')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-[#475569] hover:text-[#004aad] border border-slate-200 transition-colors cursor-pointer"
                    >
                      + Rapi & sesuai SOP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Perlu perhatikan SLA waktu')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-[#475569] hover:text-[#004aad] border border-slate-200 transition-colors cursor-pointer"
                    >
                      + Perlu perhatikan SLA waktu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Latihan lilitan bubble wrap')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-[#475569] hover:text-[#004aad] border border-slate-200 transition-colors cursor-pointer"
                    >
                      + Latihan lilitan bubble wrap
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Teliti penempelan resi')}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-[#475569] hover:text-[#004aad] border border-slate-200 transition-colors cursor-pointer"
                    >
                      + Teliti penempelan resi
                    </button>
                  </div>
                </div>

                {/* Photo Capture Section per Participant - Matching User Prototype */}
                <div className="bg-[#f8faff] p-5 sm:p-6 border-t border-[#edf2f7]">
                  {/* Card Header matching screenshot */}
                  <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-[#004aad]">📷</span>
                        <h4 className="font-extrabold text-sm text-[#0c1a40]">
                          Foto Bukti Evaluasi Praktik POJ <span className="text-rose-500">*</span>
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#64748b] bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {pEval.photoBase64 ? '1/1 Foto' : '0/1 Foto'}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748b] -mt-1 leading-relaxed">
                      Foto hasil packing / bukti evaluasi standar kerja peserta {participant.name}
                    </p>

                    {pEval.photoBase64 ? (
                      /* Photo Preview Card */
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#f8faff] p-4 rounded-xl border border-blue-200">
                        <div className="relative group shrink-0">
                          <img
                            src={pEval.photoBase64}
                            alt={`Foto ${participant.name}`}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                            onClick={() => setViewingPhotoUrl(pEval.photoBase64 || null)}
                          />
                          <button
                            type="button"
                            onClick={() => setViewingPhotoUrl(pEval.photoBase64 || null)}
                            className="absolute inset-0 bg-black/40 text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl transition cursor-pointer"
                          >
                            🔍 Perbesar
                          </button>
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span>✅</span>
                              <span>Foto Berhasil Diunggah</span>
                            </span>
                            {pEval.photoTimestamp && (
                              <span className="text-[11px] text-[#64748b] font-mono">
                                {new Date(pEval.photoTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#5f6f8c]">
                            Foto siap dicatat ke Google Sheets & disimpan ke Google Drive.
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveCameraParticipant({ id: participant.id, name: participant.name })}
                              className="px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#004aad] text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <span>🔄</span>
                              <span>Foto Ulang</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(participant.id)}
                              className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1 transition cursor-pointer"
                            >
                              <span>🗑️</span>
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Action Buttons matching screenshot exactly */
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        {/* Kamera Button: Dashed light blue border */}
                        <button
                          type="button"
                          onClick={() => setActiveCameraParticipant({ id: participant.id, name: participant.name })}
                          className="w-full sm:w-48 h-20 rounded-xl border-2 border-dashed border-[#93c5fd] hover:border-[#004aad] bg-blue-50/20 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-[#004aad] transition-all cursor-pointer group active:scale-95"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">📷</span>
                          <span className="text-xs font-bold text-[#004aad]">Kamera</span>
                        </button>

                        {/* Galeri Button: Light solid border */}
                        <label
                          className="w-full sm:w-48 h-20 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/90 flex flex-col items-center justify-center gap-1 text-[#475569] hover:text-[#0c1a40] transition-all cursor-pointer group active:scale-95"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">🖼️</span>
                          <span className="text-xs font-bold">Galeri</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleFileInputChange(participant.id, e)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================= */}
      {/* TOMBOL SUBMIT PALING BAWAH (STICKY BOTTOM BAR) */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-4 px-4 sm:px-6 z-20 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-[#004aad] flex items-center justify-center font-extrabold text-sm shadow-xs">
              {percentComplete}%
            </div>
            <div>
              <div className="text-sm font-extrabold text-[#0c1a40]">
                {participants.length} Peserta Terdaftar
              </div>
              <div className="text-[11px] text-[#64748b]">
                {totalChecked} dari {totalChecksNeeded} butir evaluasi dinilai
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-full border border-slate-300 hover:bg-slate-50 text-[#475569] font-bold text-xs transition-colors cursor-pointer"
            >
              Batal / Kembali
            </button>
            {/* Prototype Signature Blue Pill Submit Button */}
            <button
              type="button"
              onClick={handleSubmitClick}
              className="proto-btn-primary px-8 py-3.5 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📤</span>
              <span>Submit Evaluasi POJ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {activeCameraParticipant && (
        <CameraModal
          isOpen={Boolean(activeCameraParticipant)}
          participantName={activeCameraParticipant.name}
          onClose={() => setActiveCameraParticipant(null)}
          onPhotoCaptured={photoBase64 => {
            handlePhotoCaptured(activeCameraParticipant.id, photoBase64);
            setActiveCameraParticipant(null);
          }}
        />
      )}

      {/* Fullsize Image Lightbox Modal */}
      {viewingPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewingPhotoUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-black rounded-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewingPhotoUrl(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black font-bold z-10 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={viewingPhotoUrl}
              alt="Foto Hasil Praktik"
              className="w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

