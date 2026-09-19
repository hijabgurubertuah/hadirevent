import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventItem, EventType, EventStatus } from '../types';
import { formatDateIndo, formatTimeIndo } from '../utils/qr';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Users,
  Folder,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Search,
  ExternalLink,
  X,
  Sparkles,
} from 'lucide-react';

interface EventManagementProps {
  onSelectAndNavigate: (eventId: string, tab: string) => void;
}

export const EventManagement: React.FC<EventManagementProps> = ({ onSelectAndNavigate }) => {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventRegistration,
    users,
    participants,
    activeRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:30',
    endTime: '12:00',
    location: '',
    type: 'open' as EventType,
    status: 'active' as EventStatus,
    committeeIds: [] as string[],
    maxParticipants: 150,
    category: 'Akademik & Seminar',
    driveFolderUrl: '',
    allowPublicRegistration: true,
  });

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateModal = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:30',
      endTime: '12:00',
      location: '',
      type: 'open',
      status: 'active',
      committeeIds: [users[1]?.id || 'usr-com-1'],
      maxParticipants: 150,
      category: 'Akademik & Seminar',
      driveFolderUrl: 'https://drive.google.com/drive/folders/event-' + Date.now().toString(36),
      allowPublicRegistration: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setFormData({
      title: ev.title,
      description: ev.description,
      date: ev.date,
      startTime: ev.startTime,
      endTime: ev.endTime,
      location: ev.location,
      type: ev.type,
      status: ev.status,
      committeeIds: ev.committeeIds || [],
      maxParticipants: ev.maxParticipants || 100,
      category: ev.category || 'Umum',
      driveFolderUrl: ev.driveFolderUrl || '',
      allowPublicRegistration: ev.allowPublicRegistration,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
      alert('Mohon lengkapi judul, tanggal, dan lokasi event.');
      return;
    }

    if (editingEventId) {
      updateEvent(editingEventId, formData);
    } else {
      createEvent(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus event "${title}" beserta seluruh data pesertanya?`)) {
      deleteEvent(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Pengelolaan Multi-Event
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            Daftar Event & Kegiatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Buat, aktifkan, dan atur penugasan panitia serta jenis pendaftaran setiap acara
          </p>
        </div>

        {activeRole === 'admin' && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Event Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan nama acara, lokasi, kategori..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <div className="w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs shrink-0 w-max sm:w-auto">
              {['all', 'active', 'draft', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 whitespace-nowrap min-h-[34px] capitalize ${
                    filterStatus === st ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'Semua' : st === 'active' ? 'Aktif' : st === 'draft' ? 'Draft' : 'Selesai'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((ev) => {
          const evParticipants = participants.filter((p) => p.eventId === ev.id);
          const checkedIn = evParticipants.filter((p) => p.checkedIn).length;
          const isSelected = selectedEventId === ev.id;
          const assignedPanitia = users.filter((u) => ev.committeeIds?.includes(u.id));

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Card Top Ribbon */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {ev.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        ev.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ev.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ev.status === 'active' ? '● Aktif' : ev.status === 'draft' ? '○ Draft' : '✓ Selesai'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 font-serif leading-snug line-clamp-2">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>
                </div>

                {/* Event Metadata */}
                <div className="px-5 py-3 bg-slate-50/70 border-y border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{formatDateIndo(ev.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{formatTimeIndo(ev.startTime)} - {ev.endTime} WIB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    <span className="text-[11px] text-slate-500">Jenis Pendaftaran:</span>
                    <span
                      className={`font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                        ev.type === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {ev.type === 'open' ? 'Pendaftaran Terbuka' : 'Berbasis Undangan'}
                    </span>
                  </div>
                </div>

                {/* Committee & Attendance Stats */}
                <div className="p-5 pt-3 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Presensi Kehadiran:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {checkedIn} / {evParticipants.length} ({evParticipants.length > 0 ? Math.round((checkedIn / evParticipants.length) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${evParticipants.length > 0 ? (checkedIn / evParticipants.length) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  {/* Assigned Panitia */}
                  <div className="text-[11px] text-slate-500">
                    <span className="font-medium">Panitia PIC: </span>
                    {assignedPanitia.length > 0
                      ? assignedPanitia.map((u) => u.name.split(' ')[0]).join(', ')
                      : 'Belum ditugaskan'}
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    onSelectAndNavigate(ev.id, 'scanner');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Buka Scanner
                </button>

                <button
                  onClick={() => {
                    setSelectedEventId(ev.id);
                    onSelectAndNavigate(ev.id, 'participants');
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  title="Lihat Peserta"
                >
                  <Users className="w-4 h-4" />
                </button>

                {activeRole === 'admin' && (
                  <>
                    <button
                      onClick={() => handleOpenEditModal(ev)}
                      className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 text-xs transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id, ev.title)}
                      className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-rose-50 hover:text-rose-700 text-xs transition-colors"
                      title="Hapus Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Buat / Edit Event */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 font-serif text-lg">
                  {editingEventId ? 'Edit Pengaturan Event' : 'Buat Event / Kegiatan Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Judul Event <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Seminar Nasional Transformasi Digital 2026"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat Acara</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penjelasan ringkas tujuan acara, tema, atau pemateri..."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal Acara <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lokasi / Ruangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Auditorium Utama Lt. 3 Gd. Rektorat"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Pendaftaran</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventType })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="open">Event Terbuka (Pendaftaran Mandiri)</option>
                    <option value="invitation">Event Berbasis Undangan (Input Panitia)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Acara</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="active">Aktif (Buka Presensi)</option>
                    <option value="draft">Draft (Persiapan)</option>
                    <option value="completed">Selesai (Arsip)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Acara</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Contoh: Seminar, Workshop, Rapat Pleno"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target / Kuota Peserta</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 100 })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penugasan Panitia PIC (Bisa pilih lebih dari 1)
                </label>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {users
                    .filter((u) => u.role === 'committee')
                    .map((user) => {
                      const isChecked = formData.committeeIds.includes(user.id);
                      return (
                        <label key={user.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  committeeIds: [...formData.committeeIds, user.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  committeeIds: formData.committeeIds.filter((id) => id !== user.id),
                                });
                              }
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="font-medium">{user.name}</span>
                          <span className="text-slate-400">({user.email})</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link Folder Google Drive Dokumentasi</label>
                <input
                  type="url"
                  value={formData.driveFolderUrl}
                  onChange={(e) => setFormData({ ...formData, driveFolderUrl: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {editingEventId ? 'Simpan Perubahan' : 'Buat & Terbitkan Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
