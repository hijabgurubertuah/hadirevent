import React, { useEffect, useState } from 'react';
import { Participant, EventItem } from '../types';
import { CheckCircle2, UserCheck, Building2, Clock, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeCheckInModalProps {
  participant: Participant | null;
  event: EventItem | undefined;
  scannedAt?: string;
  isOpen: boolean;
  onClose: () => void;
  autoCloseSeconds?: number;
}

export const WelcomeCheckInModal: React.FC<WelcomeCheckInModalProps> = ({
  participant,
  event,
  scannedAt,
  isOpen,
  onClose,
  autoCloseSeconds = 6,
}) => {
  const [countdown, setCountdown] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoCloseSeconds);
      return;
    }

    setCountdown(autoCloseSeconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen || !participant) return null;

  const formatTimestamp = (isoStr?: string) => {
    const d = isoStr ? new Date(isoStr) : new Date();
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 cursor-default"
        >
          {/* Top Decorative Gradient */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 p-8 text-white text-center relative overflow-hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className="w-20 h-20 mx-auto rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-900/20 mb-4 ring-8 ring-white/20"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                Presensi Terverifikasi Resmi
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight font-serif">Selamat Datang!</h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-sm mx-auto">
                {event?.title || 'Kegiatan'}
              </p>
            </motion.div>
          </div>

          {/* Attendee Details Card */}
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Nama Peserta</span>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{participant.name}</h2>
              <div className="inline-flex items-center gap-1.5 text-sm text-slate-600 font-medium pt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                {participant.institution || 'Umum'}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Kategori</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  {participant.category || 'Peserta'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Waktu Check-In</span>
                <p className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {formatTimestamp(scannedAt || participant.checkedInAt)}
                </p>
              </div>
              <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Kode QR Tiket</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {participant.qrCode}
                </span>
              </div>
            </div>

            {/* Auto Close Timer Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Otomatis kembali dalam <span className="font-bold text-slate-700">{countdown}s</span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-md"
              >
                Scan Peserta Berikutnya →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
