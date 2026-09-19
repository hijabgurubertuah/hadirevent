import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Image as ImageIcon,
  Palette,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  Globe,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenQuickTicketModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenQuickTicketModal,
}) => {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    selectedEvent,
    activeRole,
    setActiveRole,
    users,
    currentUser,
    setCurrentUser,
    settings,
    updateSettings,
    participants,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter events accessible by current role
  const accessibleEvents =
    activeRole === 'admin'
      ? events
      : activeRole === 'committee'
      ? events.filter((e) => currentUser?.assignedEventIds?.includes(e.id))
      : events.filter((e) => e.status === 'active');

  const handleRoleChange = (role: UserRole, userAccountIndex: number = 0) => {
    setActiveRole(role);
    if (role === 'admin') {
      setCurrentUser(users[0]);
    } else if (role === 'committee') {
      const committeeUser = users.find((u) => u.role === 'committee') || users[1];
      setCurrentUser(committeeUser);
      // Auto select first assigned event
      if (committeeUser.assignedEventIds && committeeUser.assignedEventIds.length > 0) {
        setSelectedEventId(committeeUser.assignedEventIds[0]);
      }
    }
    setIsRoleDropdownOpen(false);
    setIsMobileMenuOpen(false);

    // If switching to public participant and on admin tabs, switch to public
    if (role === 'public_participant' && currentTab !== 'public_portal') {
      setCurrentTab('public_portal');
    } else if (role !== 'public_participant' && currentTab === 'public_portal') {
      setCurrentTab('dashboard');
    }
  };

  const currentEventParticipants = participants.filter((p) => p.eventId === selectedEventId);
  const checkedInCount = currentEventParticipants.filter((p) => p.checkedIn).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar for Role Switching & Organization Announcement */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-flex items-center gap-1 font-semibold text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {settings.orgName}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400 truncate">{settings.orgTagline}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title={settings.soundEffects ? 'Efek Suara Aktif' : 'Efek Suara Dinonaktifkan'}
          >
            {settings.soundEffects ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden md:inline text-[11px]">
              {settings.soundEffects ? 'Sound On' : 'Mute'}
            </span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Quick Ticket Simulation Launcher */}
          <button
            onClick={onOpenQuickTicketModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-medium transition-colors"
          >
            <QrCode className="w-3 h-3" />
            <span>Lihat Contoh Tiket QR</span>
          </button>

          <span className="text-slate-700">|</span>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700"
            >
              {activeRole === 'admin' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>👑 Admin: {currentUser?.name?.split(' ')[0] || 'Admin'}</span>
                </>
              )}
              {activeRole === 'committee' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>📋 Panitia: {currentUser?.name?.split(' ')[0] || 'Panitia'}</span>
                </>
              )}
              {activeRole === 'public_participant' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>🌐 Portal Peserta Publik</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ubah Hak Akses (RBAC)
                </div>
                
                {/* Admin option */}
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                    activeRole === 'admin' ? 'bg-blue-50/70 font-semibold text-blue-700' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    👑
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Administrator Utama</div>
                    <div className="text-[10px] text-slate-500">Akses penuh semua event & konfigurasi</div>
                  </div>
                </button>

                {/* Panitia options */}
                <button
                  onClick={() => {
                    setActiveRole('committee');
                    setCurrentUser(users[1] || users[0]);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                    activeRole === 'committee' && currentUser?.id === users[1]?.id
                      ? 'bg-blue-50/70 font-semibold text-blue-700'
                      : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    📋
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{users[1]?.name || 'Panitia 1'}</div>
                    <div className="text-[10px] text-slate-500">Petugas Event 1 & 2 (Scan & Presensi)</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveRole('committee');
                    setCurrentUser(users[2] || users[0]);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                    activeRole === 'committee' && currentUser?.id === users[2]?.id
                      ? 'bg-blue-50/70 font-semibold text-blue-700'
                      : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    📋
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{users[2]?.name || 'Panitia 2'}</div>
                    <div className="text-[10px] text-slate-500">Petugas Event 1 & 3</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Public portal */}
                <button
                  onClick={() => handleRoleChange('public_participant')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                    activeRole === 'public_participant' ? 'bg-blue-50/70 font-semibold text-blue-700' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    🌐
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Portal Peserta Publik</div>
                    <div className="text-[10px] text-slate-500">Daftar event terbuka & cek tiket QR</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => setCurrentTab(activeRole === 'public_participant' ? 'public_portal' : 'dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 font-serif">HadirEvent</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">
                    QR Multi-Event
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Sistem Presensi & Manajemen Undangan
                </p>
              </div>
            </div>

            {/* Active Event Selector (Admin / Panitia only) */}
            {activeRole !== 'public_participant' && (
              <div className="relative hidden lg:block ml-4 pl-4 border-l border-slate-200">
                <button
                  onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="max-w-[200px] truncate">{selectedEvent?.title || 'Pilih Event'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white text-[10px] text-slate-600 border border-slate-200 font-mono">
                    {checkedInCount}/{currentEventParticipants.length} Hadir
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute left-4 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Pilih Event Aktif
                    </div>
                    {accessibleEvents.map((ev) => {
                      const count = participants.filter((p) => p.eventId === ev.id).length;
                      const checkCount = participants.filter((p) => p.eventId === ev.id && p.checkedIn).length;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setIsEventDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
                            selectedEventId === ev.id ? 'bg-blue-50/80 text-blue-800 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{ev.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{ev.date}</span>
                              <span>•</span>
                              <span className="capitalize">{ev.type === 'open' ? 'Pendaftaran Terbuka' : 'Undangan'}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {checkCount}/{count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {activeRole === 'public_participant' ? (
              <>
                <button
                  onClick={() => setCurrentTab('public_portal')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'public_portal'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Pendaftaran & Event Terbuka
                </button>
                <button
                  onClick={() => setCurrentTab('public_ticket_search')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'public_ticket_search'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Cek & Unduh Tiket QR Saya
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                {activeRole === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('events')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      currentTab === 'events'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Manajemen Event
                  </button>
                )}

                <button
                  onClick={() => setCurrentTab('participants')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'participants'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Peserta & Undangan
                </button>

                <button
                  onClick={() => setCurrentTab('scanner')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    currentTab === 'scanner'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-400/40'
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  Scan Kehadiran QR
                </button>

                <button
                  onClick={() => setCurrentTab('reports')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'reports'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Laporan & Rekap
                </button>

                <button
                  onClick={() => setCurrentTab('documentation')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    currentTab === 'documentation'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Dokumentasi
                </button>

                {activeRole === 'admin' && (
                  <button
                    onClick={() => setCurrentTab('settings')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      currentTab === 'settings'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    Pengaturan Tema
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {activeRole !== 'public_participant' && (
            <div className="py-2 border-b border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Pilih Event:</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
              >
                {accessibleEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.date})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeRole === 'public_participant' ? (
            <>
              <button
                onClick={() => {
                  setCurrentTab('public_portal');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'public_portal' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <Globe className="w-4 h-4" /> Pendaftaran & Event Terbuka
              </button>
              <button
                onClick={() => {
                  setCurrentTab('public_ticket_search');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'public_ticket_search' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4" /> Cek & Unduh Tiket QR
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              {activeRole === 'admin' && (
                <button
                  onClick={() => {
                    setCurrentTab('events');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                    currentTab === 'events' ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Manajemen Event
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentTab('participants');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'participants' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" /> Peserta & Undangan
              </button>
              <button
                onClick={() => {
                  setCurrentTab('scanner');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold text-left flex items-center gap-2 bg-orange-500 text-white`}
              >
                <QrCode className="w-4 h-4" /> Scan Kehadiran QR
              </button>
              <button
                onClick={() => {
                  setCurrentTab('reports');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Laporan & Rekap
              </button>
              <button
                onClick={() => {
                  setCurrentTab('documentation');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                  currentTab === 'documentation' ? 'bg-blue-600 text-white' : 'text-slate-700'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Dokumentasi
              </button>
              {activeRole === 'admin' && (
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-left flex items-center gap-2 ${
                    currentTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}
                >
                  <Palette className="w-4 h-4" /> Pengaturan Tema
                </button>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
