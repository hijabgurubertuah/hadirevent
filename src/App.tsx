/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { EventManagement } from './components/EventManagement';
import { ParticipantManagement } from './components/ParticipantManagement';
import { QRScannerView } from './components/QRScannerView';
import { AttendanceReports } from './components/AttendanceReports';
import { DocumentationGallery } from './components/DocumentationGallery';
import { ThemeSettingsView } from './components/ThemeSettingsView';
import { PublicRegistrationView } from './components/PublicRegistrationView';
import { TicketModal } from './components/TicketModal';
import { Participant, EventItem } from './types';
import { QrCode, X, Sparkles, UserCheck, Shield } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeRole,
    selectedEventId,
    selectedEvent,
    setSelectedEventId,
    participants,
    events,
    verifyAndCheckIn,
  } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Modal ticket viewer state
  const [ticketModalParticipant, setTicketModalParticipant] = useState<Participant | null>(null);
  const [ticketModalEvent, setTicketModalEvent] = useState<EventItem | undefined>(undefined);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Quick ticket sample picker modal
  const [isSamplePickerOpen, setIsSamplePickerOpen] = useState(false);

  const handleOpenTicket = (p: Participant) => {
    const ev = events.find((e) => e.id === p.eventId) || selectedEvent;
    setTicketModalParticipant(p);
    setTicketModalEvent(ev);
    setIsTicketModalOpen(true);
  };

  const handleSelectEventAndNavigate = (eventId: string, tab: string) => {
    setSelectedEventId(eventId);
    setCurrentTab(tab);
  };

  const handleSimulateScanDirectly = (qrCode: string) => {
    verifyAndCheckIn(qrCode, 'Simulasi Tiket');
    setCurrentTab('scanner');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenQuickTicketModal={() => setIsSamplePickerOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        {/* Render Tab View */}
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenQuickTicketModal={() => setIsSamplePickerOpen(true)}
          />
        )}

        {currentTab === 'events' && (
          <EventManagement onSelectAndNavigate={handleSelectEventAndNavigate} />
        )}

        {currentTab === 'participants' && (
          <ParticipantManagement onViewTicket={handleOpenTicket} />
        )}

        {currentTab === 'scanner' && <QRScannerView />}

        {currentTab === 'reports' && <AttendanceReports />}

        {currentTab === 'documentation' && <DocumentationGallery />}

        {currentTab === 'settings' && <ThemeSettingsView />}

        {currentTab === 'public_portal' && (
          <PublicRegistrationView initialMode="register" />
        )}

        {currentTab === 'public_ticket_search' && (
          <PublicRegistrationView initialMode="search" />
        )}
      </main>

      {/* Global Ticket Viewer Modal */}
      <TicketModal
        participant={ticketModalParticipant}
        event={ticketModalEvent}
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSimulateScan={handleSimulateScanDirectly}
      />

      {/* Quick Sample Ticket Picker Modal */}
      {isSamplePickerOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSamplePickerOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-serif text-base">
                    Pilih Contoh Tiket QR Peserta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Buka e-ticket dan simulasikan scan langsung ke kamera scanner
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSamplePickerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {participants.map((p) => {
                const ev = events.find((e) => e.id === p.eventId);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsSamplePickerOpen(false);
                      handleOpenTicket(p);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.checkedIn ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            Hadir
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Belum Hadir
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {p.institution} • <span className="text-blue-700 font-medium">{ev?.title}</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{p.qrCode}</div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-xs">
                      Buka Tiket
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">HadirEvent</span>
            <span>•</span>
            <span>Aplikasi Kehadiran Multi-Event Berbasis Web & QR Code</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Terintegrasi Google Workspace, Google Sheets & Google Drive
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
