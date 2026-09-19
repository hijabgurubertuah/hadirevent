import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EventItem,
  Participant,
  AttendanceLog,
  UserAccount,
  AppSettings,
  DocumentationItem,
  UserRole,
  CheckInStatus,
} from '../types';
import {
  initialEvents,
  initialParticipants,
  initialAttendanceLogs,
  initialUsers,
  initialSettings,
  initialDocumentation,
} from '../data/mockData';
import { generateUniqueCode } from '../utils/qr';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface CheckInResult {
  success: boolean;
  status: CheckInStatus;
  message: string;
  participant?: Participant;
  event?: EventItem;
  scannedAt?: string;
  isDuplicate?: boolean;
  previousCheckIn?: string;
}

interface AppContextType {
  events: EventItem[];
  participants: Participant[];
  attendanceLogs: AttendanceLog[];
  users: UserAccount[];
  settings: AppSettings;
  documentation: DocumentationItem[];
  currentUser: UserAccount;
  activeRole: UserRole;
  selectedEventId: string;
  selectedEvent: EventItem | undefined;
  lastCheckedInResult: CheckInResult | null;
  
  // Setters & Actions
  setSelectedEventId: (id: string) => void;
  setActiveRole: (role: UserRole) => void;
  setCurrentUser: (user: UserAccount) => void;
  
  // Event Actions
  createEvent: (eventData: Omit<EventItem, 'id' | 'createdAt'>) => EventItem;
  updateEvent: (id: string, updates: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  toggleEventRegistration: (id: string) => void;

  // Participant Actions
  registerParticipant: (data: {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    institution: string;
    notes?: string;
    category?: string;
  }) => Participant;
  batchImportParticipants: (eventId: string, rawList: Array<{ name: string; email: string; phone?: string; institution?: string; category?: string }>) => number;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  sendBatchInvitations: (eventId: string, participantIds?: string[], onProgress?: (current: number, total: number) => void) => Promise<{ sent: number; failed: number }>;

  // Check-In Verification
  verifyAndCheckIn: (qrCode: string, deviceName?: string) => CheckInResult;
  clearLastCheckInResult: () => void;

  // Documentation Actions
  addDocumentation: (item: Omit<DocumentationItem, 'id' | 'uploadedAt'>) => void;
  deleteDocumentation: (id: string) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllDataToDefault: () => void;
}

const STORAGE_PREFIX = 'hadirevent_app_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to defaults
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [participants, setParticipants] = useState<Participant[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'participants');
    return saved ? JSON.parse(saved) : initialParticipants;
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'logs');
    return saved ? JSON.parse(saved) : initialAttendanceLogs;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [documentation, setDocumentation] = useState<DocumentationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'docs');
    return saved ? JSON.parse(saved) : initialDocumentation;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return users[0] || initialUsers[0];
  });

  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-1');
  const [lastCheckedInResult, setLastCheckedInResult] = useState<CheckInResult | null>(null);

  // Sync with audio settings
  useEffect(() => {
    soundFx.enabled = settings.soundEffects;
  }, [settings.soundEffects]);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'docs', JSON.stringify(documentation));
  }, [documentation]);

  // Derive active selected event
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Event Actions
  const createEvent = (eventData: Omit<EventItem, 'id' | 'createdAt'>): EventItem => {
    const newId = 'evt-' + Date.now().toString(36);
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEventId(newId);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventItem>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setParticipants((prev) => prev.filter((p) => p.eventId !== id));
    setAttendanceLogs((prev) => prev.filter((l) => l.eventId !== id));
    if (selectedEventId === id) {
      const remaining = events.filter((e) => e.id !== id);
      if (remaining.length > 0) {
        setSelectedEventId(remaining[0].id);
      }
    }
  };

  const toggleEventRegistration = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, allowPublicRegistration: !e.allowPublicRegistration } : e))
    );
  };

  // Participant Actions
  const registerParticipant = (data: {
    eventId: string;
    name: string;
    email: string;
    phone: string;
    institution: string;
    notes?: string;
    category?: string;
  }): Participant => {
    const newId = 'par-' + Math.random().toString(36).substring(2, 9);
    const qrCode = generateUniqueCode(data.eventId);
    const now = new Date().toISOString();

    const newParticipant: Participant = {
      id: newId,
      eventId: data.eventId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      institution: data.institution || 'Umum',
      notes: data.notes || '',
      category: data.category || 'Peserta',
      qrCode: qrCode,
      invitationStatus: 'sent',
      invitationSentAt: now,
      registeredAt: now,
      checkedIn: false,
    };

    setParticipants((prev) => [newParticipant, ...prev]);
    return newParticipant;
  };

  const batchImportParticipants = (
    eventId: string,
    rawList: Array<{ name: string; email: string; phone?: string; institution?: string; category?: string }>
  ): number => {
    const now = new Date().toISOString();
    const newItems: Participant[] = rawList
      .filter((item) => item.name && item.email)
      .map((item, idx) => ({
        id: 'par-' + Date.now().toString(36) + '-' + idx,
        eventId: eventId,
        name: item.name.trim(),
        email: item.email.trim(),
        phone: item.phone?.trim() || '-',
        institution: item.institution?.trim() || 'Umum',
        category: item.category?.trim() || 'Undangan',
        qrCode: generateUniqueCode(eventId, idx + 1),
        invitationStatus: 'not_sent',
        registeredAt: now,
        checkedIn: false,
      }));

    if (newItems.length > 0) {
      setParticipants((prev) => [...newItems, ...prev]);
    }
    return newItems.length;
  };

  const updateParticipant = (id: string, updates: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const sendBatchInvitations = async (
    eventId: string,
    participantIds?: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ sent: number; failed: number }> => {
    const targetParticipants = participants.filter(
      (p) => p.eventId === eventId && (participantIds ? participantIds.includes(p.id) : true)
    );

    const total = targetParticipants.length;
    let sentCount = 0;
    const now = new Date().toISOString();

    for (let i = 0; i < total; i++) {
      // Simulate GAS batch trigger time delay
      await new Promise((res) => setTimeout(res, 80));
      sentCount++;
      if (onProgress) {
        onProgress(sentCount, total);
      }
    }

    const updatedIds = new Set(targetParticipants.map((p) => p.id));
    setParticipants((prev) =>
      prev.map((p) => (updatedIds.has(p.id) ? { ...p, invitationStatus: 'sent', invitationSentAt: now } : p))
    );

    return { sent: sentCount, failed: 0 };
  };

  // Check-In Verification Engine with Concurrency Simulation
  const verifyAndCheckIn = (scannedCode: string, deviceName: string = 'Kamera Panitia'): CheckInResult => {
    const cleanCode = scannedCode.trim().toUpperCase();

    // Find participant
    const participant = participants.find(
      (p) => p.qrCode.toUpperCase() === cleanCode || p.id.toUpperCase() === cleanCode
    );

    const scannerName = currentUser ? currentUser.name : 'Panitia Kehadiran';
    const nowIso = new Date().toISOString();

    if (!participant) {
      soundFx.playError();
      const result: CheckInResult = {
        success: false,
        status: 'invalid_code',
        message: 'Kode QR tidak ditemukan di dalam sistem atau tidak terdaftar.',
      };
      setLastCheckedInResult(result);
      return result;
    }

    const targetEvent = events.find((e) => e.id === participant.eventId);

    // If scanning for a specific event and participant belongs to another
    if (selectedEventId && participant.eventId !== selectedEventId) {
      soundFx.playDuplicate();
      const result: CheckInResult = {
        success: false,
        status: 'invalid_event',
        participant,
        event: targetEvent,
        message: `Peserta terdaftar untuk event lain: "${targetEvent?.title || participant.eventId}". Bukan untuk event yang sedang aktif.`,
      };
      setLastCheckedInResult(result);
      return result;
    }

    // Check if already checked in
    if (participant.checkedIn) {
      soundFx.playDuplicate();
      const logEntry: AttendanceLog = {
        id: 'log-' + Date.now().toString(36),
        participantId: participant.id,
        eventId: participant.eventId,
        participantName: participant.name,
        participantEmail: participant.email,
        participantInstitution: participant.institution,
        scannedAt: nowIso,
        scannedBy: scannerName,
        status: 'duplicate',
        device: deviceName,
      };
      setAttendanceLogs((prev) => [logEntry, ...prev]);

      const result: CheckInResult = {
        success: false,
        status: 'duplicate',
        participant,
        event: targetEvent,
        isDuplicate: true,
        previousCheckIn: participant.checkedInAt,
        message: `PERINGATAN: Peserta ${participant.name} SUDAH PERNAH CHECK-IN sebelumnya!`,
      };
      setLastCheckedInResult(result);
      return result;
    }

    // Valid check-in
    soundFx.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#F97316', '#10B981', '#6366F1'],
      });
    } catch {
      // safe fallback
    }

    // Update participant
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participant.id
          ? {
              ...p,
              checkedIn: true,
              checkedInAt: nowIso,
              checkedInBy: scannerName,
            }
          : p
      )
    );

    // Create log
    const logEntry: AttendanceLog = {
      id: 'log-' + Date.now().toString(36),
      participantId: participant.id,
      eventId: participant.eventId,
      participantName: participant.name,
      participantEmail: participant.email,
      participantInstitution: participant.institution,
      scannedAt: nowIso,
      scannedBy: scannerName,
      status: 'valid',
      device: deviceName,
    };
    setAttendanceLogs((prev) => [logEntry, ...prev]);

    const result: CheckInResult = {
      success: true,
      status: 'valid',
      participant: { ...participant, checkedIn: true, checkedInAt: nowIso, checkedInBy: scannerName },
      event: targetEvent,
      scannedAt: nowIso,
      message: `Selamat Datang, ${participant.name}! Kehadiran Anda telah terverifikasi resmi.`,
    };

    setLastCheckedInResult(result);
    return result;
  };

  const clearLastCheckInResult = () => {
    setLastCheckedInResult(null);
  };

  // Documentation
  const addDocumentation = (item: Omit<DocumentationItem, 'id' | 'uploadedAt'>) => {
    const newItem: DocumentationItem = {
      ...item,
      id: 'doc-' + Date.now().toString(36),
      uploadedAt: new Date().toISOString(),
    };
    setDocumentation((prev) => [newItem, ...prev]);
  };

  const deleteDocumentation = (id: string) => {
    setDocumentation((prev) => prev.filter((d) => d.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllDataToDefault = () => {
    setEvents(initialEvents);
    setParticipants(initialParticipants);
    setAttendanceLogs(initialAttendanceLogs);
    setUsers(initialUsers);
    setSettings(initialSettings);
    setDocumentation(initialDocumentation);
    setSelectedEventId(initialEvents[0].id);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        events,
        participants,
        attendanceLogs,
        users,
        settings,
        documentation,
        currentUser,
        activeRole,
        selectedEventId,
        selectedEvent,
        lastCheckedInResult,
        setSelectedEventId,
        setActiveRole,
        setCurrentUser,
        createEvent,
        updateEvent,
        deleteEvent,
        toggleEventRegistration,
        registerParticipant,
        batchImportParticipants,
        updateParticipant,
        deleteParticipant,
        sendBatchInvitations,
        verifyAndCheckIn,
        clearLastCheckInResult,
        addDocumentation,
        deleteDocumentation,
        updateSettings,
        resetAllDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
