import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { WelcomeCheckInModal } from './WelcomeCheckInModal';
import jsQR from 'jsqr';
import {
  QrCode,
  Camera,
  Upload,
  Keyboard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Flashlight,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Volume2,
} from 'lucide-react';

export const QRScannerView: React.FC = () => {
  const {
    selectedEventId,
    selectedEvent,
    participants,
    verifyAndCheckIn,
    lastCheckedInResult,
    clearLastCheckInResult,
    currentUser,
  } = useApp();

  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual' | 'simulator'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedCodeRef = useRef<string | null>(null);
  const scanCooldownRef = useRef<number>(0);

  const currentParticipants = participants.filter((p) => p.eventId === selectedEventId);
  const checkedInCount = currentParticipants.filter((p) => p.checkedIn).length;

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraActive(true);
          requestAnimationFrame(scanVideoFrame);
        }
      } else {
        setCameraError('Kamera tidak didukung oleh browser ini.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Izin akses kamera belum diaktifkan atau perangkat kamera sedang digunakan.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setCameraActive(false);
  };

  // Continuous Video Frame Scanner using jsQR
  const scanVideoFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            const now = Date.now();
            // Prevent spamming the same QR code within 3 seconds
            if (code.data !== lastScannedCodeRef.current || now - scanCooldownRef.current > 3000) {
              lastScannedCodeRef.current = code.data;
              scanCooldownRef.current = now;
              handleProcessQR(code.data);
            }
          }
        }
      }
    }

    if (cameraActive) {
      animationFrameId.current = requestAnimationFrame(scanVideoFrame);
    }
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode, facingMode]);

  // Process Scanned QR Code
  const handleProcessQR = (qrText: string) => {
    const result = verifyAndCheckIn(qrText, `Kamera (${currentUser?.name || 'Panitia'})`);
    if (result.success) {
      setIsWelcomeModalOpen(true);
    }
  };

  // Upload QR Image file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleProcessQR(code.data);
          } else {
            alert('Tidak dapat mendeteksi kode QR pada gambar tersebut. Pastikan gambar jelas dan terang.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessQR(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Screen Modal Popup when Scan is Valid */}
      <WelcomeCheckInModal
        participant={lastCheckedInResult?.participant || null}
        event={selectedEvent}
        scannedAt={lastCheckedInResult?.scannedAt}
        isOpen={isWelcomeModalOpen && lastCheckedInResult?.success === true}
        onClose={() => {
          setIsWelcomeModalOpen(false);
          clearLastCheckInResult();
        }}
        autoCloseSeconds={5}
      />

      {/* Top Banner Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold mb-1">
            <QrCode className="w-3.5 h-3.5" />
            Scanner Presensi & Verifikasi Kehadiran
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            {selectedEvent ? selectedEvent.title : 'Pemindai QR'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Petugas: <span className="font-semibold text-slate-800">{currentUser?.name}</span> • Terverifikasi {checkedInCount}/{currentParticipants.length} Peserta
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar -mx-1 sm:mx-0 px-1 sm:px-0 py-1">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-semibold shrink-0 w-max sm:w-auto">
            <button
              onClick={() => setScanMode('camera')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                scanMode === 'camera'
                  ? 'bg-orange-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Kamera Live</span>
            </button>
            <button
              onClick={() => setScanMode('simulator')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                scanMode === 'simulator'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Simulasi Cepat</span>
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                scanMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>Unggah Foto</span>
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                scanMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Keyboard className="w-4 h-4 shrink-0" />
              <span>Ketik Kode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Scanner Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Viewport (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 shadow-xl text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
          {/* Duplicate / Invalid Warning Banner Overlay */}
          {lastCheckedInResult && !lastCheckedInResult.success && (
            <div className="absolute top-4 left-4 right-4 z-30 p-4 rounded-2xl bg-amber-500 text-slate-950 font-semibold text-xs shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
              <AlertTriangle className="w-5 h-5 text-slate-950 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {lastCheckedInResult.isDuplicate ? 'PERINGATAN: TIKET SUDAH PERNAH CHECK-IN!' : 'KODE QR TIDAK VALID'}
                </div>
                <p className="mt-1 text-xs text-slate-950/90 leading-relaxed">
                  {lastCheckedInResult.message}
                </p>
                {lastCheckedInResult.participant && (
                  <div className="mt-2 pt-2 border-t border-slate-950/20 text-[11px]">
                    Nama: <span className="font-bold">{lastCheckedInResult.participant.name}</span> ({lastCheckedInResult.participant.institution})
                  </div>
                )}
              </div>
              <button
                onClick={clearLastCheckInResult}
                className="px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 text-xs font-bold text-slate-950"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Mode: Camera Live */}
          {scanMode === 'camera' && (
            <div className="w-full flex flex-col items-center justify-center relative">
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Target Overlay Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-orange-400/80 rounded-3xl relative animate-pulse">
                    {/* Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-500 rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-500 rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-500 rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-500 rounded-br-xl" />

                    {/* Laser scanning beam */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center">
                    <Camera className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
                    >
                      Coba Ulang Kamera
                    </button>
                    <button
                      onClick={() => setScanMode('simulator')}
                      className="mt-2 text-xs text-blue-400 underline font-semibold"
                    >
                      Atau Gunakan Mode Simulasi Cepat
                    </button>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 text-slate-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Balik Kamera ({facingMode === 'environment' ? 'Belakang' : 'Depan'})
                </button>
              </div>
            </div>
          )}

          {/* Mode: Simulator (Instant test buttons) */}
          {scanMode === 'simulator' && (
            <div className="w-full max-w-md space-y-4 py-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">Simulasi Scan Kehadiran</h3>
                <p className="text-xs text-slate-400">
                  Klik peserta di bawah untuk langsung mensimulasikan scan kode QR mereka:
                </p>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {currentParticipants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProcessQR(p.qrCode)}
                    className="w-full p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-left flex items-center justify-between gap-3 transition-colors border border-slate-700 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.checkedIn && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                            Sudah Hadir
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {p.institution} • <span className="font-mono text-slate-300">{p.qrCode}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shrink-0">
                      Scan Ini
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode: Upload Image */}
          {scanMode === 'upload' && (
            <div className="w-full max-w-md text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-white">Unggah File / Screenshot QR Code</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Pilih foto tiket digital atau QR code yang tersimpan di perangkat Anda
              </p>
              <label className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-blue-500/20">
                <Upload className="w-4 h-4" />
                <span>Pilih Gambar QR</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Mode: Manual Code Type */}
          {scanMode === 'manual' && (
            <form onSubmit={handleManualSubmit} className="w-full max-w-md text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Keyboard className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-white">Input Kode Tiket Manual</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Masukkan kode tiket peserta secara manual (misal: EVT-EVT1-0101-KR98)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ketik kode tiket..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shrink-0"
                >
                  Verifikasi
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Attendance Sidebar (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 font-serif text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Peserta Telah Hadir ({checkedInCount})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Daftar kehadiran yang baru saja terverifikasi</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {currentParticipants.length > 0 ? Math.round((checkedInCount / currentParticipants.length) * 100) : 0}% Hadir
              </span>
            </div>

            {/* List of checked in attendees */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {currentParticipants.filter((p) => p.checkedIn).length > 0 ? (
                currentParticipants
                  .filter((p) => p.checkedIn)
                  .map((p) => {
                    const time = p.checkedInAt
                      ? new Date(p.checkedInAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'Baru saja';

                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{p.institution}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-100">
                            {time}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{p.qrCode}</p>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Belum ada peserta yang hadir</p>
                  <p className="text-[11px] mt-0.5">Arahkan kamera ke QR tiket peserta untuk memverifikasi</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick tips box */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Sistem secara otomatis mencegah titip-absen dan duplikasi scan. Setiap QR code hanya dapat dicheck-in 1 kali per event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
