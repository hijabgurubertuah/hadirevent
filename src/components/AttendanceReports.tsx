import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateIndo, formatTimeIndo } from '../utils/qr';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AttendanceReports: React.FC = () => {
  const {
    selectedEventId,
    selectedEvent,
    participants,
    attendanceLogs,
    settings,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [reportTab, setReportTab] = useState<'table' | 'charts' | 'print_preview'>('table');

  const currentParticipants = participants.filter((p) => p.eventId === selectedEventId);
  const total = currentParticipants.length;
  const checkedIn = currentParticipants.filter((p) => p.checkedIn).length;
  const absent = total - checkedIn;
  const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  // Filter categories
  const categories = Array.from(new Set(currentParticipants.map((p) => p.category || 'Umum')));

  const filteredList = currentParticipants.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'checked' && p.checkedIn) ||
      (filterStatus === 'unchecked' && !p.checkedIn);

    const matchCat = filterCategory === 'all' || p.category === filterCategory;

    return matchSearch && matchStatus && matchCat;
  });

  // Chart Data: Hourly Arrival distribution
  const hourlyDataMap: Record<string, number> = {
    '07:30 - 08:00': 1,
    '08:00 - 08:30': 3,
    '08:30 - 09:00': 2,
    '09:00 - 09:30': 0,
    '09:30 - 10:00': 0,
  };

  const chartHourly = Object.keys(hourlyDataMap).map((k) => ({
    time: k,
    hadir: hourlyDataMap[k],
  }));

  // Chart Data: By Category
  const categoryStats = categories.map((cat) => {
    const catPeserta = currentParticipants.filter((p) => (p.category || 'Umum') === cat);
    const catHadir = catPeserta.filter((p) => p.checkedIn).length;
    return {
      category: cat,
      hadir: catHadir,
      belum: catPeserta.length - catHadir,
      total: catPeserta.length,
    };
  });

  const pieData = [
    { name: 'Hadir (Check-In)', value: checkedIn, color: '#10B981' },
    { name: 'Belum Hadir (Tidak Hadir)', value: absent, color: '#F43F5E' },
  ];

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Tiket QR',
      'Nama Peserta',
      'Email',
      'No. HP/WA',
      'Instansi/Jurusan',
      'Kategori',
      'Status Kehadiran',
      'Waktu Check-In',
      'Petugas Verifikator',
    ];

    const rows = filteredList.map((p, idx) => [
      idx + 1,
      `"${p.qrCode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.email}"`,
      `"${p.phone}"`,
      `"${(p.institution || 'Umum').replace(/"/g, '""')}"`,
      `"${p.category || 'Peserta'}"`,
      p.checkedIn ? 'Hadir' : 'Belum Hadir',
      p.checkedInAt ? `"${new Date(p.checkedInAt).toLocaleString('id-ID')}"` : '-',
      `"${p.checkedInBy || '-'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Kehadiran_${selectedEvent?.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Monitoring & Rekapitulasi Presensi
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            Laporan Kehadiran: {selectedEvent ? selectedEvent.title : 'Event'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ekspor data, cetak rekap resmi, dan pantau grafik analitik kehadiran real-time
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-md"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1 truncate">Target Undangan</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">100% basis data</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1 truncate">Peserta Hadir</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">{checkedIn}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 shrink-0" />
            {rate}% Hadir
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1 truncate">Belum Hadir</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-500 font-mono">{absent}</div>
          <div className="text-[11px] text-rose-500 mt-1">{100 - rate}% Absen</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-medium mb-1 truncate">Status Verifikasi</div>
          <div className="text-base sm:text-lg font-bold text-blue-700">QR Valid</div>
          <div className="text-[11px] text-slate-400 mt-1">Terkunci Aman</div>
        </div>
      </div>

      {/* Print Document Header (Visible when Printing) */}
      <div className="hidden print:block bg-white p-6 mb-6 border-b-2 border-slate-800 text-center">
        <h2 className="text-2xl font-extrabold uppercase tracking-wide">{settings.orgName}</h2>
        <p className="text-xs text-slate-600">{settings.orgTagline}</p>
        <div className="my-3 border-t border-slate-400" />
        <h3 className="text-lg font-bold">BERITA ACARA REKAPITULASI PRESENSI KEHADIRAN EVENT</h3>
        <p className="text-sm font-semibold">{selectedEvent?.title}</p>
        <p className="text-xs text-slate-500">
          Tanggal: {selectedEvent && formatDateIndo(selectedEvent.date)} • Lokasi: {selectedEvent?.location}
        </p>
      </div>

      {/* View Switcher Tabs (Table vs Visual Charts) */}
      <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5 print:hidden">
        <div className="grid grid-cols-2 sm:flex bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-semibold w-full sm:w-fit">
          <button
            onClick={() => setReportTab('table')}
            className={`px-4 py-2.5 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
              reportTab === 'table' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Tabel Presensi</span>
          </button>
          <button
            onClick={() => setReportTab('charts')}
            className={`px-4 py-2.5 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all min-h-[38px] ${
              reportTab === 'charts' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Grafik Analitik</span>
          </button>
        </div>
      </div>

      {/* Content: Visual Charts */}
      {reportTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          {/* Donut Chart: Proporsi Hadir vs Tidak Hadir */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
              Proporsi Kehadiran (Hadir vs Tidak Hadir)
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} Peserta`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center border-t border-slate-100 pt-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <span className="text-xs text-emerald-800 font-semibold">{checkedIn} Hadir ({rate}%)</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50">
                <span className="text-xs text-rose-800 font-semibold">{absent} Belum Hadir ({100 - rate}%)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart: Kehadiran per Kategori */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
              Kehadiran Berdasarkan Kategori Peserta
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="hadir" name="Hadir" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="belum" name="Belum Hadir" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Distribusi absensi berdasarkan kelompok peserta yang ditentukan
            </p>
          </div>
        </div>
      )}

      {/* Content: Tabel Detail Presensi (Always shown or print) */}
      {(reportTab === 'table' || reportTab === 'charts') && (
        <div className="space-y-4">
          {/* Table Filters Toolbar (Hidden in Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs print:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari peserta dalam rekap..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="checked">Hadir Saja</option>
                <option value="unchecked">Belum Hadir Saja</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Kategori:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Element */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 print:text-[10px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] print:bg-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Peserta</th>
                    <th className="py-3 px-4">Instansi / Unit</th>
                    <th className="py-3 px-4">Kode Tiket QR</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4">Waktu Presensi</th>
                    <th className="py-3 px-4">Verifikator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length > 0 ? (
                    filteredList.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{p.email}</div>
                        </td>
                        <td className="py-2.5 px-4 font-medium text-slate-800">{p.institution || 'Umum'}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-700">{p.qrCode}</td>
                        <td className="py-2.5 px-4">
                          {p.checkedIn ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] print:border-none">
                              <CheckCircle2 className="w-3 h-3 print:hidden" />
                              Hadir
                            </span>
                          ) : (
                            <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] print:border-none">
                              Belum Hadir
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {p.checkedInAt
                            ? new Date(p.checkedInAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              }) + ' WIB'
                            : '-'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{p.checkedInBy || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        Tidak ada data yang sesuai filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print Sign Spot Footer */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-xs">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900">Ketua Panitia Pelaksana</p>
              <div className="h-20" />
              <p className="font-bold underline">({currentUser?.name || 'Dr. Ahmad Fauzi'})</p>
            </div>
            <div>
              <p className="text-slate-500">Petugas Registrasi / Verifikator,</p>
              <p className="font-bold text-slate-900">Koordinator Sie Acara</p>
              <div className="h-20" />
              <p className="font-bold underline">(Siti Rahmawati, S.Kom.)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
