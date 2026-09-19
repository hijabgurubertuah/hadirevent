import React, { useEffect, useState } from 'react';
import { Participant, EventItem } from '../types';
import { generateQrDataUrl, formatDateIndo, formatTimeIndo } from '../utils/qr';
import { X, Download, Printer, CheckCircle2, Calendar, MapPin, Building2, Ticket, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TicketModalProps {
  participant: Participant | null;
  event: EventItem | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan?: (qrCode: string) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  participant,
  event,
  isOpen,
  onClose,
  onSimulateScan,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (participant?.qrCode) {
      generateQrDataUrl(participant.qrCode).then(setQrUrl);
    }
  }, [participant?.qrCode]);

  if (!isOpen || !participant || !event) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `Tiket-${participant.name.replace(/\s+/g, '_')}-${participant.qrCode}.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto cursor-pointer"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-none cursor-default"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center print:bg-blue-600">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors print:hidden"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold tracking-wide uppercase mb-2">
              <Ticket className="w-3.5 h-3.5" />
              E-Ticket & Pass Kehadiran
            </div>
            <h2 className="text-xl font-bold font-serif leading-snug">{event.title}</h2>
            <p className="text-xs text-blue-100 mt-1">{event.category}</p>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-5">
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`QR Code ${participant.name}`}
                  className="w-48 h-48 rounded-lg shadow-sm bg-white p-2"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-200 rounded-lg animate-pulse">
                  <QrCode className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="mt-3 text-center">
                <span className="font-mono text-sm font-bold tracking-widest text-slate-800 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-xs">
                  {participant.qrCode}
                </span>
                <p className="text-xs text-slate-500 mt-1">Tunjukkan kode QR ini ke panitia di meja registrasi</p>
              </div>
            </div>

            {/* Participant Details */}
            <div className="space-y-3 divide-y divide-slate-100 text-sm">
              <div className="pt-2 flex justify-between items-start">
                <span className="text-slate-500">Nama Peserta</span>
                <span className="font-semibold text-slate-800 text-right">{participant.name}</span>
              </div>
              <div className="pt-2 flex justify-between items-start">
                <span className="text-slate-500">Instansi / Unit</span>
                <span className="font-medium text-slate-800 text-right flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {participant.institution || 'Umum'}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-start">
                <span className="text-slate-500">Email & Kontak</span>
                <div className="text-right">
                  <p className="font-medium text-slate-800">{participant.email}</p>
                  <p className="text-xs text-slate-500">{participant.phone}</p>
                </div>
              </div>
              <div className="pt-2 flex justify-between items-start">
                <span className="text-slate-500">Kategori Peserta</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {participant.category || 'Peserta'}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-start">
                <span className="text-slate-500">Waktu & Lokasi</span>
                <div className="text-right">
                  <p className="font-medium text-slate-800 flex items-center justify-end gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateIndo(event.date)}
                  </p>
                  <p className="text-xs text-slate-600">{formatTimeIndo(event.startTime)} - {event.endTime} WIB</p>
                  <p className="text-xs text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {event.location}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">Status Kehadiran</span>
                {participant.checkedIn ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sudah Hadir
                  </span>
                ) : (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Belum Check-In
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2 print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Unduh QR
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  Cetak Tiket
                </button>
              </div>

              {onSimulateScan && (
                <button
                  onClick={() => {
                    onSimulateScan(participant.qrCode);
                    onClose();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-500/20"
                >
                  <QrCode className="w-4 h-4" />
                  Simulasikan Scan Tiket Ini Langsung
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
