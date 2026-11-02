import React, { useState, useEffect, useRef } from 'react';
import { captureVideoFrame, compressImageFile } from '../utils/imageHelper';

interface CameraModalProps {
  isOpen: boolean;
  participantName: string;
  onClose: () => void;
  onPhotoCaptured: (photoBase64: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  participantName,
  onClose,
  onPhotoCaptured
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Start camera stream (invoked on user click)
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopStream();
    setErrorMessage(null);
    setPermissionState('requesting');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser ini membatasi akses webcam/live video. Silakan gunakan opsi Kamera HP Bawaan.');
      }

      let mediaStream: MediaStream;
      try {
        // Try with ideal constraints first
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (firstErr) {
        // Fallback to basic video constraint if ideal fails
        console.warn('Initial constraint failed, trying basic video:', firstErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(playErr => {
          console.warn('Video play error:', playErr);
        });
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setPermissionState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Izin kamera tidak diberikan atau dibatasi oleh browser. Anda dapat menggunakan tombol "Kamera HP Bawaan" di bawah.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Tidak menemukan perangkat kamera live. Gunakan opsi Kamera HP Bawaan atau Galeri.');
      } else {
        setErrorMessage(err.message || 'Kamera live tidak dapat dimulai. Silakan gunakan Kamera HP Bawaan.');
      }
    }
  };

  // Reset modal state on open/close
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedPreview(null);
      setPermissionState('prompt');
      setErrorMessage(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Connect video element when stream is active
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (!isOpen) return null;

  // Take photo from live video
  const handleSnap = () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    try {
      const dataUrl = captureVideoFrame(videoRef.current, 800, 0.75);
      if (dataUrl) {
        setCapturedPreview(dataUrl);
      } else {
        setErrorMessage('Gagal menangkap frame foto kamera.');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Gagal mengambil gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm photo selection
  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onPhotoCaptured(capturedPreview);
      stopStream();
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
    if (!stream) {
      startCamera(facingMode);
    }
  };

  // Switch facing mode
  const handleSwitchFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle native camera or gallery capture
  const handleNativeOrGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsProcessing(true);
    try {
      const compressedBase64 = await compressImageFile(file, 800, 0.75);
      setCapturedPreview(compressedBase64);
      setPermissionState('granted');
    } catch (err: any) {
      setErrorMessage('Gagal memproses gambar foto.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1a40]/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-[28px] border border-[#e2e8f0] shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg text-[#004aad]">
              <span>📷</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#0c1a40]">
                Foto Hasil Praktik Peserta
              </h3>
              <p className="text-xs text-[#64748b]">
                Peserta: <strong className="text-[#004aad]">{participantName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Viewport Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: EXPLICIT PERMISSION REQUEST / SELECTION SCREEN */}
          {!capturedPreview && permissionState !== 'granted' && (
            <div className="py-6 px-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl mx-auto shadow-xs">
                <span>📸</span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-extrabold text-[#0c1a40]">
                  Izin Akses Kamera Diperlukan
                </h4>
                <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                  Aplikasi membutuhkan izin untuk mengambil foto hasil picking peserta <strong>{participantName}</strong>. Foto otomatis tersimpan di Google Drive & Google Sheet.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>⚠️</span>
                    <span>Pemberitahuan:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2.5 max-w-sm mx-auto pt-2">
                {/* Option A: Request permission & start live camera */}
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  disabled={permissionState === 'requesting'}
                  className="w-full proto-btn-primary py-3.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span className="text-base">📷</span>
                  <span>{permissionState === 'requesting' ? 'Menghubungkan Kamera...' : 'Izinkan & Buka Kamera Live'}</span>
                </button>

                {/* Option B: Gallery */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-[#475569] font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span className="text-base">🖼️</span>
                  <span>Pilih dari Galeri</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LIVE VIEWFINDER STREAM */}
          {!capturedPreview && permissionState === 'granted' && (
            <div className="space-y-3">
              <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover"
                />
                
                {/* Viewfinder Target Overlay */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between text-[11px] text-white font-mono bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full self-start">
                    <span>Target: Paket / Picking</span>
                  </div>
                  <div className="text-center text-[11px] text-white bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full self-center">
                    Arahkan kamera ke paket atau barang hasil observasi
                  </div>
                </div>

                {/* Switch camera button */}
                <button
                  type="button"
                  onClick={handleSwitchFacing}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-bold backdrop-blur-md transition cursor-pointer"
                  title="Balik Kamera Depan/Belakang"
                >
                  <span>🔄</span>
                </button>

                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses Foto...</span>
                  </div>
                )}
              </div>

              {/* Shutter controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSwitchFacing}
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Balik Kamera Depan / Belakang"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">Balik</span>
                </button>

                <button
                  type="button"
                  onClick={handleSnap}
                  className="flex-1 py-3 px-6 rounded-full bg-[#004aad] hover:bg-[#003d8f] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_6px_20px_-3px_rgba(0,74,173,0.45)] transition active:scale-95 cursor-pointer"
                >
                  <span className="text-base">📸</span>
                  <span>Ambil Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>🖼️</span>
                  <span>Galeri</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CAPTURED PREVIEW SCREEN */}
          {capturedPreview && (
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner">
                <img
                  src={capturedPreview}
                  alt="Captured Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-full border border-slate-300 hover:bg-slate-50 text-[#0c1a40] font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Foto Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="flex-1 proto-btn-primary py-3 px-4 text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>✅</span>
                  <span>Gunakan Foto Ini</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden input for Gallery selection */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleNativeOrGalleryUpload}
          />
        </div>

        {/* Footer info note */}
        <div className="p-3.5 bg-[#f8faff] border-t border-[#edf2f7] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Foto otomatis dikompres & disimpan ke Google Drive</span>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="text-[#0c1a40] font-bold hover:underline"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
