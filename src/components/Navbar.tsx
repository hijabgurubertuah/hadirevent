import React, { useState, useEffect, useRef } from 'react';
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

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-close dropdowns and menus when clicked/tapped outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (isRoleDropdownOpen && roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setIsRoleDropdownOpen(false);
      }

      if (isEventDropdownOpen && eventDropdownRef.current && !eventDropdownRef.current.contains(target)) {
        setIsEventDropdownOpen(false);
      }

      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isRoleDropdownOpen, isEventDropdownOpen, isMobileMenuOpen]);

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top Bar for Role Switching & Organization Announcement */}
        <div className="bg-slate-900 text-slate-200 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 font-semibold text-blue-400 text-[11px] sm:text-xs">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
              <span className="max-w-[120px] sm:max-w-none truncate">{settings.orgName}</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400 truncate text-[11px]">{settings.orgTagline}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Audio toggle */}
            <button
              onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
              className="flex items-center gap-1 px-1.5 py-1 rounded text-slate-400 hover:text-white transition-colors min-h-[32px]"
              title={settings.soundEffects ? 'Efek Suara Aktif' : 'Efek Suara Dinonaktifkan'}
            >
              {settings.soundEffects ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden lg:inline text-[11px]">
                {settings.soundEffects ? 'Sound On' : 'Mute'}
              </span>
            </button>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Quick Ticket Simulation Launcher */}
            <button
              onClick={onOpenQuickTicketModal}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 font-medium transition-colors text-[11px] sm:text-xs min-h-[32px]"
            >
              <QrCode className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="hidden xs:inline sm:inline">Contoh Tiket</span>
              <span className="xs:hidden">Tiket</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Role Switcher Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-700 text-[11px] sm:text-xs min-h-[32px]"
              >
                {activeRole === 'admin' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="max-w-[90px] sm:max-w-none truncate font-semibold">
                      👑 Admin
                    </span>
                  </>
                )}
                {activeRole === 'committee' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="max-w-[90px] sm:max-w-none truncate font-semibold">
                      📋 Panitia
                    </span>
                  </>
                )}
                {activeRole === 'public_participant' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <span className="max-w-[90px] sm:max-w-none truncate font-semibold">
                      🌐 Publik
                    </span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ubah Hak Akses (RBAC)
                  </div>
                  
                  {/* Admin option */}
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                      activeRole === 'admin' ? 'bg-blue-50/80 font-semibold text-blue-700' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
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
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                      activeRole === 'committee' && currentUser?.id === users[1]?.id
                        ? 'bg-blue-50/80 font-semibold text-blue-700'
                        : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
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
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                      activeRole === 'committee' && currentUser?.id === users[2]?.id
                        ? 'bg-blue-50/80 font-semibold text-blue-700'
                        : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                      📋
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{users[2]?.name || 'Panitia 2'}</div>
                      <div className="text-[10px] text-slate-500">Petugas Event 1 & 3</div>
                    </div>
                  </button>

                  <div className="my-1.5 border-t border-slate-100" />

                  {/* Public portal */}
                  <button
                    onClick={() => handleRoleChange('public_participant')}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2.5 hover:bg-blue-50 transition-colors ${
                      activeRole === 'public_participant' ? 'bg-blue-50/80 font-semibold text-blue-700' : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                      🌐
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">Portal Peserta Publik</div>
                      <div className="text-[10px] text-slate-500">Daftar event terbuka & unduh tiket QR</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setCurrentTab(activeRole === 'public_participant' ? 'public_portal' : 'dashboard')}
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 font-serif">HadirEvent</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">
                      QR Event
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
                    Sistem Presensi & Manajemen Undangan
                  </p>
                </div>
              </div>

              {/* Active Event Selector (Admin / Panitia only) */}
              {activeRole !== 'public_participant' && (
                <div className="relative hidden lg:block ml-3 pl-3 border-l border-slate-200" ref={eventDropdownRef}>
                  <button
                    onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="max-w-[180px] truncate">{selectedEvent?.title || 'Pilih Event'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-white text-[10px] text-slate-600 border border-slate-200 font-mono">
                      {checkedInCount}/{currentEventParticipants.length}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {isEventDropdownOpen && (
                    <div className="absolute left-3 top-full mt-1.5 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Pilih Event Aktif
                      </div>
                      <div className="max-h-72 overflow-y-auto">
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
                              className={`w-full px-3.5 py-2.5 text-left text-xs flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors ${
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
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

            {/* Mobile Header Actions */}
            <div className="flex md:hidden items-center gap-2">
              {activeRole !== 'public_participant' && (
                <button
                  onClick={() => setCurrentTab('scanner')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR</span>
                </button>
              )}

              <button
                ref={mobileButtonRef}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
                aria-label="Buka Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Drawer (Slide Down) */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto"
          >
            {activeRole !== 'public_participant' && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-3">
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Pilih Event Aktif Saat Ini:
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 shadow-2xs"
                >
                  {accessibleEvents.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kehadiran Terverifikasi:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {checkedInCount} dari {currentEventParticipants.length} Peserta
                  </span>
                </div>
              </div>
            )}

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Navigasi Menu
            </div>

            {activeRole === 'public_participant' ? (
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setCurrentTab('public_portal');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'public_portal' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <div>
                    <div>Pendaftaran & Event Terbuka</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'public_portal' ? 'text-blue-100' : 'text-slate-400'}`}>Form registrasi tiket peserta</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('public_ticket_search');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'public_ticket_search' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <div>
                    <div>Cek & Unduh Tiket QR</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'public_ticket_search' ? 'text-blue-100' : 'text-slate-400'}`}>Pencarian tiket lewat email</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <div>
                    <div>Dashboard Ringkasan</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'dashboard' ? 'text-blue-100' : 'text-slate-400'}`}>Grafik & statistik kehadiran</div>
                  </div>
                </button>

                {activeRole === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentTab('events');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                      currentTab === 'events' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div>Manajemen Event</div>
                      <div className={`text-[10px] font-normal ${currentTab === 'events' ? 'text-blue-100' : 'text-slate-400'}`}>Buat & edit kegiatan multi-event</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setCurrentTab('participants');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'participants' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <div>
                    <div>Peserta & Undangan</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'participants' ? 'text-blue-100' : 'text-slate-400'}`}>Input data, impor CSV, kirim email</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('scanner');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm`}
                >
                  <QrCode className="w-4 h-4" />
                  <div>
                    <div>Scan Kehadiran QR</div>
                    <div className="text-[10px] font-normal text-orange-100">Kamera real-time & verifikasi check-in</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('reports');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'reports' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <div>
                    <div>Laporan & Rekapitulasi</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'reports' ? 'text-blue-100' : 'text-slate-400'}`}>Ekspor file CSV & cetak laporan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('documentation');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                    currentTab === 'documentation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <div>
                    <div>Dokumentasi & Berkas</div>
                    <div className={`text-[10px] font-normal ${currentTab === 'documentation' ? 'text-blue-100' : 'text-slate-400'}`}>Galeri foto & link Google Drive</div>
                  </div>
                </button>

                {activeRole === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentTab('settings');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${
                      currentTab === 'settings' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <div>
                      <div>Pengaturan Tema & Branding</div>
                      <div className={`text-[10px] font-normal ${currentTab === 'settings' ? 'text-blue-100' : 'text-slate-400'}`}>Warna, instansi, & format email</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Sticky Mobile Bottom Navigation Bar for Instant One-Tap Access */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-2 py-1.5 flex items-center justify-around safe-area-inset-bottom">
        {activeRole === 'public_participant' ? (
          <>
            <button
              onClick={() => setCurrentTab('public_portal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                currentTab === 'public_portal' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 mb-0.5" />
              <span>Daftar Event</span>
            </button>
            <button
              onClick={() => setCurrentTab('public_ticket_search')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                currentTab === 'public_ticket_search' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <QrCode className="w-4 h-4 mb-0.5" />
              <span>Cek Tiket</span>
            </button>
            <button
              onClick={() => setIsRoleDropdownOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-800 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 mb-0.5 text-amber-500" />
              <span>Ganti Akses</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                currentTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('participants')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                currentTab === 'participants' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span>Peserta</span>
            </button>

            {/* Elevated Center QR Scanner Button */}
            <div className="flex-1 flex justify-center -mt-4">
              <button
                onClick={() => setCurrentTab('scanner')}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/40 ring-4 ring-white active:scale-95 transition-transform"
                title="Buka Kamera Scanner QR"
                aria-label="Scan QR"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                currentTab === 'reports' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-0.5" />
              <span>Laporan</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
                isMobileMenuOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Menu className="w-4 h-4 mb-0.5" />
              <span>Menu</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};
