import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { PickerSubmenu } from './components/PickerSubmenu';
import { PackingEvaluationForm } from './components/PackingEvaluationForm';
import { SubmitConfirmModal } from './components/SubmitConfirmModal';
import { SuccessModal } from './components/SuccessModal';
import { WebhookGuideModal } from './components/WebhookGuideModal';
import { HistoryModal } from './components/HistoryModal';
import { 
  TrainerData, 
  ParticipantEvaluation, 
  POJSubmission 
} from './types';
import { 
  getSavedTrainerData, 
  saveTrainerData, 
  getWebhookUrl, 
  saveWebhookUrl, 
  getSubmissions, 
  saveSubmission, 
  sendSubmissionToWebhook,
  updateSubmissionSyncStatus
} from './utils/storage';

export default function App() {
  // Navigation view
  const [currentView, setCurrentView] = useState<'roles' | 'picker_submenu' | 'packing_form'>('roles');

  // Stored state
  const [trainer, setTrainer] = useState<TrainerData>(getSavedTrainerData());
  const [webhookUrl, setWebhookUrlState] = useState<string>(getWebhookUrl());
  const [submissions, setSubmissions] = useState<POJSubmission[]>(getSubmissions());

  // Pending evaluation to confirm
  const [pendingTrainer, setPendingTrainer] = useState<TrainerData | null>(null);
  const [pendingEvaluations, setPendingEvaluations] = useState<ParticipantEvaluation[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success modal
  const [latestSubmission, setLatestSubmission] = useState<POJSubmission | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Auxiliary modals
  const [isWebhookGuideOpen, setIsWebhookGuideOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    setTrainer(getSavedTrainerData());
    setWebhookUrlState(getWebhookUrl());
    setSubmissions(getSubmissions());
  }, []);

  const refreshSubmissionsList = () => {
    setSubmissions(getSubmissions());
  };

  const handleSaveWebhook = (url: string) => {
    saveWebhookUrl(url);
    setWebhookUrlState(url);
  };

  // User clicked submit on Packing Evaluation Form
  const handleSubmitPrompt = (t: TrainerData, evals: ParticipantEvaluation[]) => {
    setPendingTrainer(t);
    setPendingEvaluations(evals);
    setIsConfirmModalOpen(true);
  };

  // User clicked "Ya, Submit" in confirmation modal
  const handleConfirmSubmit = async () => {
    if (!pendingTrainer || pendingEvaluations.length === 0) return;

    setIsSubmitting(true);

    // Save trainer data so they don't have to retype next time
    saveTrainerData(pendingTrainer);
    setTrainer(pendingTrainer);

    // Calculate summary
    let passedCount = 0;
    let needImprovementCount = 0;

    pendingEvaluations.forEach(p => {
      const hasNotCompliant = Object.values(p.scores).some(v => v === 'Tidak Sesuai');
      if (hasNotCompliant) {
        needImprovementCount++;
      } else {
        passedCount++;
      }
    });

    const newSubmission: POJSubmission = {
      id: `POJ-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      role: 'Picker',
      type: 'Packing',
      trainer: pendingTrainer,
      participants: pendingEvaluations,
      summary: {
        totalParticipants: pendingEvaluations.length,
        allPassedCount: passedCount,
        needImprovementCount: needImprovementCount
      },
      syncedToWebhook: false
    };

    // Attempt webhook transmission if URL is configured
    if (webhookUrl && webhookUrl.trim().startsWith('http')) {
      const result = await sendSubmissionToWebhook(webhookUrl, newSubmission);
      if (result.success) {
        newSubmission.syncedToWebhook = true;
        newSubmission.webhookResponse = 'Terkirim ke Google Sheets';
      } else {
        newSubmission.syncedToWebhook = false;
        newSubmission.webhookResponse = result.message;
      }
    }

    // Save locally
    saveSubmission(newSubmission);
    refreshSubmissionsList();

    setIsSubmitting(false);
    setIsConfirmModalOpen(false);
    setLatestSubmission(newSubmission);
    setIsSuccessModalOpen(true);
  };

  // Start fresh evaluation session
  const handleStartNewSession = () => {
    setIsSuccessModalOpen(false);
    // Return to packing form with saved trainer profile
    setCurrentView('packing_form');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Header
        currentView={currentView}
        onNavigate={view => setCurrentView(view)}
        onOpenWebhookGuide={() => setIsWebhookGuideOpen(true)}
        hasWebhookConfigured={Boolean(webhookUrl && webhookUrl.trim().length > 10)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'roles' && (
          <RoleSelector
            onSelectRole={() => setCurrentView('picker_submenu')}
            onOpenWebhookGuide={() => setIsWebhookGuideOpen(true)}
          />
        )}

        {currentView === 'picker_submenu' && (
          <PickerSubmenu
            onBack={() => setCurrentView('roles')}
            onSelectPacking={() => setCurrentView('packing_form')}
          />
        )}

        {currentView === 'packing_form' && (
          <PackingEvaluationForm
            initialTrainer={trainer}
            onBack={() => setCurrentView('picker_submenu')}
            onSubmitPrompt={handleSubmitPrompt}
          />
        )}
      </main>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && pendingTrainer && (
        <SubmitConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirmSubmit={handleConfirmSubmit}
          isSubmitting={isSubmitting}
          trainer={pendingTrainer}
          evaluations={pendingEvaluations}
          webhookUrl={webhookUrl}
        />
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          submission={latestSubmission}
          onNewSession={handleStartNewSession}
          onViewHistory={() => {
            setIsSuccessModalOpen(false);
            setIsHistoryOpen(true);
          }}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}

      {/* Google Apps Script Webhook Guide Modal */}
      {isWebhookGuideOpen && (
        <WebhookGuideModal
          isOpen={isWebhookGuideOpen}
          onClose={() => setIsWebhookGuideOpen(false)}
          webhookUrl={webhookUrl}
          onSaveWebhookUrl={handleSaveWebhook}
        />
      )}

      {/* Evaluation History & CSV Export Modal */}
      {isHistoryOpen && (
        <HistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          submissions={submissions}
          webhookUrl={webhookUrl}
          onRefreshSubmissions={refreshSubmissionsList}
        />
      )}
    </div>
  );
}
