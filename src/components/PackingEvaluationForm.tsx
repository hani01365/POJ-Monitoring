import React, { useState, useEffect } from 'react';
import { 
  TrainerData, 
  Participant, 
  ParticipantEvaluation, 
  ScoreStatus, 
  PACKING_CRITERIA 
} from '../types';
import { 
  ArrowLeft, 
  User, 
  IdCard, 
  MapPin, 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare,
  FileText,
  ListPlus,
  Send,
  HelpCircle
} from 'lucide-react';

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
`Coki Bau - 69420
Dimas Arya - 10452
Siti Rahmawati - 20981
Ahmad Fauzi - 33140`
    );
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
      notes: evaluations[p.id]?.notes || ''
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Kembali ke Modul Picker</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1.5">
          <span>Role Picker</span>
          <span>·</span>
          <span>Checklist Evaluasi Praktik</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Penilaian Packing Peserta POJ
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Lengkapi data sesi pelatihan, daftarkan peserta, dan centang indikator penilaian sesuai hasil observasi fisik saat simulasi packing pesanan.
        </p>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{validationError}</div>
          <button 
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* BAGIAN A: DATA TRAINER */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Data Diri Trainer Officer
            </h2>
          </div>
          <span className="text-xs text-slate-500">Wajib diisi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Trainer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Nama Trainer</span>
            </label>
            <input
              type="text"
              required
              value={trainer.nama}
              onChange={e => setTrainer({ ...trainer, nama: e.target.value })}
              placeholder="Contoh: Budi Trainer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          {/* Trainer Staff ID */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff ID Trainer</span>
            </label>
            <input
              type="text"
              required
              value={trainer.staffId}
              onChange={e => setTrainer({ ...trainer, staffId: e.target.value })}
              placeholder="Contoh: TR-8921"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          {/* Lokasi POJ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Lokasi POJ</span>
            </label>
            <input
              type="text"
              required
              value={trainer.lokasi}
              onChange={e => setTrainer({ ...trainer, lokasi: e.target.value })}
              placeholder="Masukkan lokasi POJ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            />
          </div>

          {/* Tanggal POJ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Tanggal POJ</span>
            </label>
            <input
              type="date"
              required
              value={trainer.tanggal}
              onChange={e => setTrainer({ ...trainer, tanggal: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN B: INPUT PESERTA POJ */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              B
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Input Peserta POJ yang Diobservasi
              </h2>
              <p className="text-xs text-slate-500">
                Dapat diinput otomatis/batch sekaligus atau satu per satu
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setInputMode('batch')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                inputMode === 'batch'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Input Batch (Format Cepat)
            </button>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                inputMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Input Manual (Satu per Satu)
            </button>
          </div>
        </div>

        {/* Tab 1: Batch Input */}
        {inputMode === 'batch' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Format per baris: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-indigo-700">[nama] - [staff id]</code> (Contoh: <span className="font-semibold">Coki Bau - 69420</span>)
              </span>
              <button
                type="button"
                onClick={handleUseDemoBatch}
                className="text-indigo-600 hover:text-indigo-700 font-semibold underline text-xs"
              >
                Gunakan Contoh
              </button>
            </div>

            <textarea
              rows={4}
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Tempelkan daftar nama & staff id peserta di sini, satu nama per baris:&#10;Coki Bau - 69420&#10;Budi Santoso - 10421&#10;Siti Nurhaliza - 33910"
              className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono leading-relaxed bg-white"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseBatch}
                disabled={!batchText.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ListPlus className="w-4 h-4" />
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
                placeholder="Nama Peserta (contoh: Coki Bau)"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="w-full sm:w-44">
              <input
                type="text"
                placeholder="Staff ID (contoh: 69420)"
                value={manualStaffId}
                onChange={e => setManualStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!manualName.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peserta</span>
            </button>
          </form>
        )}

        {/* Participant Roster Chips */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Daftar Peserta Terdaftar ({participants.length} Orang)</span>
            </div>
            {participants.length > 0 && (
              <span className="text-xs text-slate-500">
                Checklist penilaian otomatis dibuat di bawah
              </span>
            )}
          </div>

          {participants.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
              Belum ada peserta yang dimasukkan. Silakan ketik atau tempel nama peserta di atas.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {participants.map((p, index) => (
                <div
                  key={p.id}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
                >
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">({p.staffId})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 p-0.5"
                    title={`Hapus ${p.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
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
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              C
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Checklist Evaluasi Praktik Packing
              </h2>
              <p className="text-xs text-slate-500">
                Klik tombol indikator untuk menandai penilaian. Tombol akan menyala saat aktif.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 block">
              Progres Total: <span className="text-indigo-600 font-bold">{percentComplete}%</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {totalChecked} dari {totalChecksNeeded} kriteria dinilai
            </span>
          </div>
        </div>

        {/* Render Checklist Card for EACH participant */}
        {participants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 mb-1">Checklist Belum Muncul</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                {/* Participant Card Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {pIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">
                          {participant.name}
                        </h3>
                        <span className="font-mono text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          ID: {participant.staffId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Status Pengisian: <span className={isFull ? 'text-emerald-600 font-bold' : 'text-amber-600 font-semibold'}>{ratedCount} / {PACKING_CRITERIA.length} Kriteria</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Tandai Semua Sesuai */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAllSesuai(participant.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200"
                      title="Setel semua kriteria untuk peserta ini menjadi Sesuai"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                          currentVal ? '' : 'bg-amber-50/20 -mx-6 px-6 py-4 rounded-xl'
                        }`}
                      >
                        {/* Criterion Info */}
                        <div className="max-w-xl">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-indigo-600">
                              0{criterion.number}.
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">
                              {criterion.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {criterion.description}
                          </p>
                          {criterion.naExplanation && (
                            <p className="text-[11px] text-slate-400 mt-0.5 italic">
                              *N/A: {criterion.naExplanation}
                            </p>
                          )}
                        </div>

                        {/* Interactive Pill Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {criterion.options.map(option => {
                            const isSelected = currentVal === option;

                            // Styles based on option type when active
                            let activeClass = '';
                            let idleClass = 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300';

                            if (option === 'Sesuai') {
                              activeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/30';
                            } else if (option === 'Tidak Sesuai') {
                              activeClass = 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/30';
                            } else {
                              // N/A
                              activeClass = 'bg-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-500/30';
                            }

                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => handleSetScore(participant.id, criterion.id, option)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                                  isSelected ? activeClass : idleClass
                                }`}
                              >
                                {option === 'Sesuai' && (
                                  <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                                )}
                                {option === 'Tidak Sesuai' && (
                                  <X className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-rose-600'}`} />
                                )}
                                {option === 'N/A' && (
                                  <Minus className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
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
                <div className="bg-slate-50/50 p-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Catatan Trainer untuk {participant.name} (Opsional)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Dapat dikosongkan</span>
                  </div>

                  <input
                    type="text"
                    value={pEval.notes || ''}
                    onChange={e => handleSetNotes(participant.id, e.target.value)}
                    placeholder={`Tambahkan feedback atau observasi khusus untuk ${participant.name}...`}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-white mb-2"
                  />

                  {/* Quick comment chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Cepat:</span>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Rapi & sesuai SOP')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                      + Rapi & sesuai SOP
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Perlu perhatikan SLA waktu')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                      + Perlu perhatikan SLA waktu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Latihan lilitan bubble wrap')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                      + Latihan lilitan bubble wrap
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickNote(participant.id, 'Teliti penempelan resi')}
                      className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                      + Teliti penempelan resi
                    </button>
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
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              {percentComplete}%
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {participants.length} Peserta Terdaftar
              </div>
              <div className="text-[11px] text-slate-500">
                {totalChecked} dari {totalChecksNeeded} butir evaluasi dinilai
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Batal / Kembali
            </button>
            <button
              type="button"
              onClick={handleSubmitClick}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Evaluasi POJ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
