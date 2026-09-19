import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatTimeIndo } from '../utils/qr';
import {
  Users,
  UserCheck,
  UserX,
  Mail,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Send,
  Plus,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickTicketModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenQuickTicketModal,
}) => {
  const {
    events,
    selectedEventId,
    selectedEvent,
    participants,
    attendanceLogs,
    activeRole,
    currentUser,
  } = useApp();

  // Current event calculations
  const currentParticipants = participants.filter((p) => p.eventId === selectedEventId);
  const totalCount = currentParticipants.length;
  const checkedInCount = currentParticipants.filter((p) => p.checkedIn).length;
  const pendingCount = totalCount - checkedInCount;
  const attendanceRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;
  const invitationsSent = currentParticipants.filter((p) => p.invitationStatus === 'sent').length;

  // Recent logs for current event
  const recentLogs = attendanceLogs
    .filter((l) => l.eventId === selectedEventId)
    .slice(0, 6);

  const pieData = [
    { name: 'Hadir (Check-In)', value: checkedInCount, color: '#10B981' },
    { name: 'Belum Hadir', value: pendingCount, color: '#E2E8F0' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Kehadiran Event Real-Time
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-white">
              {selectedEvent ? selectedEvent.title : 'Selamat Datang di HadirEvent'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm line-clamp-2">
              {selectedEvent?.description || 'Kelola presensi peserta dengan kode QR unik dan rekap otomatis.'}
            </p>

            {selectedEvent && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {formatDateIndo(selectedEvent.date)}
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {formatTimeIndo(selectedEvent.startTime)} - {selectedEvent.endTime} WIB
                </span>
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 max-w-xs truncate">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{selectedEvent.location}</span>
                </span>
              </div>
            )}
          </div>

          {/* Big Quick Action Scanner Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-5 h-5" />
              <span>Buka Scanner Kamera QR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => onNavigate('participants')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15"
              >
                <Users className="w-3.5 h-3.5" />
                Kelola Peserta
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors border border-white/15"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Rekap & Laporan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Total Terdaftar</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {totalCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Orang</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
            <span className="font-semibold text-blue-600">{selectedEvent?.type === 'open' ? 'Event Terbuka' : 'Undangan'}</span>
            <span>• Kuota {selectedEvent?.maxParticipants || 100}</span>
          </div>
        </div>

        {/* Hadir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Hadir (Check-In)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
            {checkedInCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Peserta</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{attendanceRate}% Kehadiran</span>
          </div>
        </div>

        {/* Belum Hadir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Belum Hadir</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 tracking-tight">
            {pendingCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Orang</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {totalCount > 0 ? `${100 - attendanceRate}% dari total target` : 'Belum ada data'}
          </div>
        </div>

        {/* Undangan Terkirim */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-2">
            <span>Undangan / Tiket Email</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 tracking-tight">
            {invitationsSent}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Terkirim</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-indigo-600">{totalCount - invitationsSent}</span> belum dikirim
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tingkat Kehadiran Acara Saat Ini
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
              Live Monitor
            </span>
          </div>
          <span className="text-xs font-bold text-slate-900 font-mono">{attendanceRate}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-700 ease-out rounded-full"
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
          <span>0 (Mulai)</span>
          <span>Target Kuota: {selectedEvent?.maxParticipants || 100}</span>
          <span>{totalCount} Terdaftar</span>
        </div>
      </div>

      {/* Main Grid: Live Feed & Analytics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Attendance Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Aktivitas Presensi Terkini
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Log pemindaian QR code masuk secara real-time</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              Lihat Semua ({attendanceLogs.filter((l) => l.eventId === selectedEventId).length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {recentLogs.length > 0 ? (
              recentLogs.map((log) => {
                const time = new Date(log.scannedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          log.status === 'valid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.status === 'duplicate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {log.status === 'valid' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {log.participantName}
                          </p>
                          {log.status === 'valid' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hadir
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Duplikat
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {log.participantInstitution} • Di-scan oleh {log.scannedBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                        {time}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{log.device || 'Kamera HP'}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Belum ada aktivitas scan pada event ini</p>
                <p className="text-[11px] mt-1">Buka Scanner Kamera QR untuk mulai mencatat kehadiran peserta</p>
                <button
                  onClick={() => onNavigate('scanner')}
                  className="mt-3 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs"
                >
                  Buka Scanner Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Donut Ratio & Event Mini Card */}
        <div className="space-y-6">
          {/* Donut Chart Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Rasio Kehadiran Peserta
            </h3>
            <div className="h-44 flex items-center justify-center">
              {totalCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `${val ?? 0} Peserta`,
                        '',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400 text-center">Belum ada peserta terdaftar</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 mt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-800">{checkedInCount} Hadir</div>
                  <div className="text-[10px] text-slate-500">{attendanceRate}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200" />
                <div>
                  <div className="font-semibold text-slate-800">{pendingCount} Belum</div>
                  <div className="text-[10px] text-slate-500">{100 - attendanceRate}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tasks & Tools Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Aksi Cepat Operasional
            </h3>
            <div className="space-y-2">
              <button
                onClick={onOpenQuickTicketModal}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors flex items-center justify-between border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Lihat & Unduh E-Ticket QR</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('participants')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors flex items-center justify-between border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-indigo-600" />
                  <span>Kirim Undangan Email Massal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors flex items-center justify-between border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor CSV / Cetak Laporan</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
