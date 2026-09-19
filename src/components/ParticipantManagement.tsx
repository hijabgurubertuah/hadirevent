import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Participant } from '../types';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Mail,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  QrCode,
  Download,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Phone,
  RefreshCw,
} from 'lucide-react';

interface ParticipantManagementProps {
  onViewTicket: (participant: Participant) => void;
}

export const ParticipantManagement: React.FC<ParticipantManagementProps> = ({ onViewTicket }) => {
  const {
    selectedEventId,
    selectedEvent,
    participants,
    registerParticipant,
    batchImportParticipants,
    deleteParticipant,
    sendBatchInvitations,
    updateParticipant,
    settings,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'manual' | 'import' | 'broadcast'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [filterInvitation, setFilterInvitation] = useState<'all' | 'sent' | 'not_sent'>('all');

  // Single Manual Form State
  const [manualForm, setManualForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    category: 'Undangan Khusus',
    notes: '',
  });
  const [manualSuccessMsg, setManualSuccessMsg] = useState('');

  // Batch Import Raw Text State
  const [rawCsvText, setRawCsvText] = useState(`Bambang Soediro, bambang.s@perusahaan.co.id, 081234567890, PT Mega Corpora, VIP
Anisa Rahmadani, anisa.rahm@univ.ac.id, 085711223344, Universitas Airlangga, Dosen
Fajar Nugraha, fajar.nugraha@tech.io, 089912345678, Tech Startup, Mahasiswa
Siti Nurhaliza, siti.nur@kemenkeu.go.id, 081399887766, Kementerian Keuangan RI, Pemerintah`);
  const [importResultCount, setImportResultCount] = useState<number | null>(null);

  // Batch Email Sender State
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [sendCompleted, setSendCompleted] = useState(false);

  // Filter participants for active event
  const currentParticipants = participants.filter((p) => p.eventId === selectedEventId);

  const filteredParticipants = currentParticipants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCheckIn =
      filterCheckIn === 'all' ||
      (filterCheckIn === 'checked' && p.checkedIn) ||
      (filterCheckIn === 'unchecked' && !p.checkedIn);

    const matchesInvitation =
      filterInvitation === 'all' ||
      (filterInvitation === 'sent' && p.invitationStatus === 'sent') ||
      (filterInvitation === 'not_sent' && p.invitationStatus !== 'sent');

    return matchesSearch && matchesCheckIn && matchesInvitation;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.email) {
      alert('Nama dan email wajib diisi.');
      return;
    }

    const newP = registerParticipant({
      eventId: selectedEventId,
      name: manualForm.name,
      email: manualForm.email,
      phone: manualForm.phone || '-',
      institution: manualForm.institution || 'Umum',
      category: manualForm.category,
      notes: manualForm.notes,
    });

    setManualSuccessMsg(`Berhasil mendaftarkan ${newP.name} dengan kode QR: ${newP.qrCode}`);
    setManualForm({
      name: '',
      email: '',
      phone: '',
      institution: '',
      category: 'Undangan Khusus',
      notes: '',
    });
    setTimeout(() => setManualSuccessMsg(''), 5000);
  };

  const handleBatchImport = () => {
    if (!rawCsvText.trim()) return;

    const lines = rawCsvText.split('\n').filter((l) => l.trim().length > 0);
    const parsed = lines.map((line) => {
      // Split by comma, tab, or semicolon
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.split(',');

      return {
        name: parts[0]?.trim() || '',
        email: parts[1]?.trim() || '',
        phone: parts[2]?.trim() || '-',
        institution: parts[3]?.trim() || 'Umum',
        category: parts[4]?.trim() || 'Peserta',
      };
    });

    const added = batchImportParticipants(selectedEventId, parsed);
    setImportResultCount(added);
    setTimeout(() => {
      setImportResultCount(null);
      setActiveSubTab('list');
    }, 2000);
  };

  const handleStartBroadcast = async () => {
    const unsentList = currentParticipants.filter((p) => p.invitationStatus !== 'sent');
    if (unsentList.length === 0) {
      if (!confirm('Semua peserta sudah pernah dikirimi undangan. Tetap kirim ulang ke seluruh peserta?')) {
        return;
      }
    }

    setIsSendingBatch(true);
    setSendCompleted(false);
    setSendProgress({ current: 0, total: currentParticipants.length });

    await sendBatchInvitations(selectedEventId, undefined, (curr, tot) => {
      setSendProgress({ current: curr, total: tot });
    });

    setIsSendingBatch(false);
    setSendCompleted(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            Manajemen Peserta & Undangan
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            {selectedEvent ? selectedEvent.title : 'Data Peserta'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Total {currentParticipants.length} peserta terdaftar di sistem • {currentParticipants.filter((p) => p.checkedIn).length} telah hadir
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeSubTab === 'list'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Peserta</span>
          </button>
          <button
            onClick={() => setActiveSubTab('manual')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeSubTab === 'manual'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Satuan</span>
          </button>
          <button
            onClick={() => setActiveSubTab('import')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeSubTab === 'import'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Impor Massal</span>
          </button>
          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeSubTab === 'broadcast'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Kirim Email Massal</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Daftar Peserta */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, email, instansi, tiket..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Presensi:</span>
              <select
                value={filterCheckIn}
                onChange={(e) => setFilterCheckIn(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700"
              >
                <option value="all">Semua Status Kehadiran</option>
                <option value="checked">Sudah Check-In (Hadir)</option>
                <option value="unchecked">Belum Check-In</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Undangan:</span>
              <select
                value={filterInvitation}
                onChange={(e) => setFilterInvitation(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium text-slate-700"
              >
                <option value="all">Semua Status Undangan</option>
                <option value="sent">Undangan Terkirim</option>
                <option value="not_sent">Belum Terkirim</option>
              </select>
            </div>
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Peserta & Kontak</th>
                    <th className="py-3.5 px-4">Instansi / Unit</th>
                    <th className="py-3.5 px-4">Kode QR Tiket</th>
                    <th className="py-3.5 px-4">Status Undangan</th>
                    <th className="py-3.5 px-4">Status Kehadiran</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{p.email}</span>
                            <span>•</span>
                            <span>{p.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{p.institution || 'Umum'}</span>
                          <div className="text-[10px] text-slate-400">{p.category}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-[11px]">
                            {p.qrCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {p.invitationStatus === 'sent' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              <Check className="w-3 h-3" />
                              Terkirim
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Belum Dikirim
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {p.checkedIn ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Hadir
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {p.checkedInAt
                                  ? new Date(p.checkedInAt).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    }) + ' WIB'
                                  : ''}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Belum Check-In
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onViewTicket(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors flex items-center gap-1"
                              title="Buka Tiket QR"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Tiket
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus peserta ${p.name}?`)) {
                                  deleteParticipant(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-xs">Tidak ada data peserta ditemukan</p>
                        <p className="text-[11px] mt-0.5">Gunakan tombol Tambah Satuan atau Impor Massal di atas</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tambah Peserta Satuan */}
      {activeSubTab === 'manual' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-serif text-base">Input Peserta Manual</h3>
              <p className="text-xs text-slate-500">
                Pendaftaran satu per satu untuk peserta undangan atau pendaftaran di tempat (on the spot)
              </p>
            </div>
          </div>

          {manualSuccessMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{manualSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Peserta <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  placeholder="budi.santoso@email.com"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  value={manualForm.phone}
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instansi / Unit Kerja / Jurusan</label>
                <input
                  type="text"
                  value={manualForm.institution}
                  onChange={(e) => setManualForm({ ...manualForm, institution: e.target.value })}
                  placeholder="Contoh: Institut Teknologi Bandung"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Peserta</label>
                <select
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="Undangan Khusus">Undangan Khusus / VIP</option>
                  <option value="Dosen / Peneliti">Dosen / Peneliti</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Profesional">Profesional / Industri</option>
                  <option value="Pemerintah">Pemerintah</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
              <input
                type="text"
                value={manualForm.notes}
                onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                placeholder="Contoh: Meja VIP Baris Depan / Pembicara Sesi 2"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                Simpan & Terbitkan QR Peserta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Impor Massal (Batch Import) */}
      {activeSubTab === 'import' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-serif text-base">Impor Peserta Massal (Copy-Paste)</h3>
              <p className="text-xs text-slate-500">
                Salin daftar nama & email dari Excel, Google Sheets, atau file CSV dan tempel di bawah
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Format Kolom yang Didukung (Pisahkan dengan koma atau Tab):
            </p>
            <p className="font-mono text-[11px] text-amber-800">
              Nama Lengkap, Email, No. HP, Instansi, Kategori
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Area Tempel Data (1 Baris = 1 Peserta)
            </label>
            <textarea
              rows={8}
              value={rawCsvText}
              onChange={(e) => setRawCsvText(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Contoh:&#10;Budi Santoso, budi@email.com, 08123456789, ITB, Dosen&#10;Siti Rahma, siti@email.com, 08571234567, UI, Mahasiswa"
            />
          </div>

          {importResultCount !== null && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Berhasil mengimpor dan membuat {importResultCount} QR Code unik untuk peserta!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {rawCsvText.split('\n').filter((l) => l.trim().length > 0).length} baris terdeteksi
            </span>
            <button
              onClick={handleBatchImport}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Proses & Terbitkan QR Massal
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Kirim Undangan Email Massal */}
      {activeSubTab === 'broadcast' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 font-serif text-base">Distribusi Undangan Resmi & Tiket QR</h3>
              <p className="text-xs text-slate-500">
                Pengiriman batch bertahap (Google Workspace & Gmail App queue) ke seluruh peserta terdaftar
              </p>
            </div>
          </div>

          {/* Email Preview Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Preview Template Email:</span>
              <span className="text-slate-400 font-mono text-[11px]">Subjek: {settings.emailTemplate.subject.replace('{nama_event}', selectedEvent?.title || 'Event')}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2 font-mono whitespace-pre-line leading-relaxed">
              {settings.emailTemplate.body
                .replace('{nama_peserta}', 'Dr. Ahmad Fauzi')
                .replace('{nama_event}', selectedEvent?.title || 'Seminar Nasional AI 2026')
                .replace('{tanggal_event}', selectedEvent?.date || '2026-09-24')
                .replace('{waktu_event}', `${selectedEvent?.startTime || '08:30'} WIB`)
                .replace('{lokasi_event}', selectedEvent?.location || 'Auditorium')
                .replace('{kode_tiket}', 'EVT-DEMO-0001-XXXX')}
              <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-center font-sans font-bold text-blue-800">
                [Lampiran Otomatis: Gambar Tiket Resmi & Kode QR Unik Peserta]
              </div>
            </div>
          </div>

          {/* Progress / Send Box */}
          <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-indigo-950">Status Antrean Pengiriman</h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  {currentParticipants.filter((p) => p.invitationStatus === 'sent').length} dari {currentParticipants.length} peserta telah menerima tiket
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-900 bg-white px-3 py-1 rounded-full shadow-xs border border-indigo-200">
                Batch GAS Engine
              </span>
            </div>

            {isSendingBatch && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    Mengirimkan undangan email bertahap...
                  </span>
                  <span>{sendProgress.current} / {sendProgress.total}</span>
                </div>
                <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-indigo-200">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-200 rounded-full"
                    style={{
                      width: `${sendProgress.total > 0 ? (sendProgress.current / sendProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {sendCompleted && (
              <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pengiriman massal selesai dengan sukses ke seluruh daftar peserta!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                disabled={isSendingBatch}
                onClick={handleStartBroadcast}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingBatch ? 'Sedang Mengirim...' : 'Mulai Kirim Undangan Email Massal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
