import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Participant, EventItem } from '../types';
import { TicketModal } from './TicketModal';
import { formatDateIndo, formatTimeIndo } from '../utils/qr';
import {
  Globe,
  Calendar,
  MapPin,
  Clock,
  QrCode,
  Search,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface PublicRegistrationViewProps {
  initialMode?: 'register' | 'search';
}

export const PublicRegistrationView: React.FC<PublicRegistrationViewProps> = ({
  initialMode = 'register',
}) => {
  const { events, participants, registerParticipant, settings } = useApp();

  const [activePortalTab, setActivePortalTab] = useState<'register' | 'search'>(initialMode);
  const [selectedPublicEventId, setSelectedPublicEventId] = useState<string>(
    events.find((e) => e.type === 'open' && e.status === 'active')?.id || events[0]?.id || ''
  );

  // Form registration
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    notes: '',
    category: 'Mahasiswa',
  });

  // Search by email state
  const [searchEmail, setSearchEmail] = useState('');
  const [foundTickets, setFoundTickets] = useState<Participant[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Modal ticket viewer
  const [activeTicketParticipant, setActiveTicketParticipant] = useState<Participant | null>(null);
  const [activeTicketEvent, setActiveTicketEvent] = useState<EventItem | undefined>(undefined);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const openEvents = events.filter((e) => e.status === 'active' && e.allowPublicRegistration);
  const targetEvent = events.find((e) => e.id === selectedPublicEventId);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEvent) return;

    if (!form.name || !form.email) {
      alert('Nama lengkap dan email wajib diisi.');
      return;
    }

    // Check if email already registered for this event
    const existing = participants.find(
      (p) => p.eventId === targetEvent.id && p.email.toLowerCase() === form.email.toLowerCase()
    );

    if (existing) {
      // Show existing ticket directly
      setActiveTicketParticipant(existing);
      setActiveTicketEvent(targetEvent);
      setIsTicketModalOpen(true);
      return;
    }

    const newParticipant = registerParticipant({
      eventId: targetEvent.id,
      name: form.name,
      email: form.email,
      phone: form.phone || '-',
      institution: form.institution || 'Umum',
      category: form.category,
      notes: form.notes,
    });

    // Open generated ticket modal immediately
    setActiveTicketParticipant(newParticipant);
    setActiveTicketEvent(targetEvent);
    setIsTicketModalOpen(true);

    // Reset form
    setForm({
      name: '',
      email: '',
      phone: '',
      institution: '',
      notes: '',
      category: 'Mahasiswa',
    });
  };

  const handleSearchTickets = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    const matched = participants.filter(
      (p) => p.email.toLowerCase() === searchEmail.trim().toLowerCase()
    );
    setFoundTickets(matched);
    setSearchPerformed(true);
  };

  const handleOpenTicket = (p: Participant) => {
    const ev = events.find((e) => e.id === p.eventId);
    setActiveTicketParticipant(p);
    setActiveTicketEvent(ev);
    setIsTicketModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* E-Ticket Modal */}
      <TicketModal
        participant={activeTicketParticipant}
        event={activeTicketEvent}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
      />

      {/* Hero Welcome Box for Participants */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <Globe className="w-4 h-4 text-blue-200" />
          Portal Resmi Pendaftaran & Tiket Peserta
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif">
          {settings.orgName}
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto mt-1">
          Daftarkan kehadiran Anda pada kegiatan terbuka atau cari kode tiket QR yang telah terdaftar.
        </p>

        {/* Sub Tabs Toggle */}
        <div className="inline-flex bg-white/15 backdrop-blur-md p-1 rounded-2xl gap-1 text-xs font-semibold mt-5 border border-white/20">
          <button
            onClick={() => setActivePortalTab('register')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              activePortalTab === 'register'
                ? 'bg-white text-blue-900 shadow-md font-bold'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Formulir Pendaftaran Event
          </button>
          <button
            onClick={() => setActivePortalTab('search')}
            className={`px-5 py-2.5 rounded-xl transition-all ${
              activePortalTab === 'search'
                ? 'bg-white text-blue-900 shadow-md font-bold'
                : 'text-white hover:bg-white/10'
            }`}
          >
            Cari Tiket QR Saya
          </button>
        </div>
      </div>

      {/* Tab: Form Pendaftaran Mandiri */}
      {activePortalTab === 'register' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Event Picker if multiple open events */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              1. Pilih Acara / Kegiatan yang Ingin Diikuti:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {openEvents.length > 0 ? (
                openEvents.map((ev) => {
                  const isSelected = selectedPublicEventId === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedPublicEventId(ev.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 line-clamp-2">{ev.title}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-blue-500" />
                          <span>{formatDateIndo(ev.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 p-6 bg-slate-50 rounded-2xl text-center text-slate-500 text-xs">
                  Tidak ada event dengan pendaftaran publik aktif saat ini.
                </div>
              )}
            </div>
          </div>

          {targetEvent && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Lengkapi Data Identitas Diri:
              </label>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Muhammad Rayhan Akbar"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nama.anda@email.com"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">E-Ticket dan QR akan terhubung ke email ini</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instansi / Universitas / Perusahaan
                  </label>
                  <input
                    type="text"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                    placeholder="Contoh: Universitas Indonesia"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Peserta</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Dosen / Peneliti">Dosen / Peneliti</option>
                    <option value="Profesional / Industri">Profesional / Industri</option>
                    <option value="Pemerintah">Pemerintah</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Setelah menekan tombol daftar, sistem akan langsung menerbitkan E-Ticket dengan kode QR unik Anda yang dapat langsung diunduh atau ditunjukkan ke panitia di lokasi acara.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Daftar Sekarang & Dapatkan Tiket QR</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab: Cari Tiket QR Saya */}
      {activePortalTab === 'search' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 font-serif">Temukan E-Ticket & Pass Kehadiran</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Masukkan email yang Anda gunakan saat mendaftar untuk mengambil kembali kode QR tiket Anda
            </p>
          </div>

          <form onSubmit={handleSearchTickets} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              required
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Ketik alamat email Anda..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20"
            >
              Cari Tiket
            </button>
          </form>

          {searchPerformed && (
            <div className="pt-4 border-t border-slate-100">
              {foundTickets.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Ditemukan {foundTickets.length} Tiket Terdaftar:
                  </h4>
                  {foundTickets.map((p) => {
                    const ev = events.find((e) => e.id === p.eventId);
                    return (
                      <div
                        key={p.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900">{ev?.title || 'Event'}</div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            Atas Nama: <span className="text-blue-700">{p.name}</span> ({p.institution})
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            Tiket: {p.qrCode} • Status: {p.checkedIn ? 'Sudah Check-In' : 'Belum Check-In'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenTicket(p)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                        >
                          <QrCode className="w-4 h-4" />
                          Buka & Unduh Tiket QR
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">Tidak ditemukan tiket untuk email "{searchEmail}"</p>
                  <p className="text-[11px]">Pastikan penulisan email sama persis dengan saat pendaftaran.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
