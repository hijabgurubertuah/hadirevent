import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Palette,
  Settings,
  Mail,
  Building2,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  Volume2,
} from 'lucide-react';

export const ThemeSettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllDataToDefault } = useApp();

  const [orgName, setOrgName] = useState(settings.orgName);
  const [orgTagline, setOrgTagline] = useState(settings.orgTagline);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [emailSubject, setEmailSubject] = useState(settings.emailTemplate.subject);
  const [emailBody, setEmailBody] = useState(settings.emailTemplate.body);
  const [soundEffects, setSoundEffects] = useState(settings.soundEffects);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const presets = [
    {
      name: 'Default: Biru & Oranye (PRD Standard)',
      primary: '#2563EB',
      secondary: '#F97316',
      badge: 'Bawaan Sistem',
    },
    {
      name: 'Emerald & Amber (Akademik & Hijau Kampus)',
      primary: '#059669',
      secondary: '#D97706',
      badge: 'Natural',
    },
    {
      name: 'Indigo & Rose (Executive Summit VIP)',
      primary: '#4F46E5',
      secondary: '#E11D48',
      badge: 'Elegan',
    },
    {
      name: 'Royal Violet & Cyan (Inovasi & Workshop)',
      primary: '#7C3AED',
      secondary: '#06B6D4',
      badge: 'Modern',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      orgName,
      orgTagline,
      primaryColor,
      secondaryColor,
      soundEffects,
      emailTemplate: {
        ...settings.emailTemplate,
        subject: emailSubject,
        body: emailBody,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleApplyPreset = (primary: string, secondary: string) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Palette className="w-3.5 h-3.5" />
            Konfigurasi & Personalisasi Tema
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            Pengaturan Sistem & Branding
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Atur skema warna aplikasi, identitas organisasi, dan template surat undangan email
          </p>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Skema Warna & Tema */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 font-serif text-base">
              1. Skema Warna Utama (Sesuai Kebutuhan Branding)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilihan Palet Preset:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presets.map((p, idx) => {
                const isActive = primaryColor === p.primary && secondaryColor === p.secondary;
                return (
                  <div
                    key={idx}
                    onClick={() => handleApplyPreset(p.primary, p.secondary)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: p.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: p.secondary }}
                        />
                        <span className="text-xs font-bold text-slate-800">{p.name.split(':')[0]}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{p.name.split(':')[1] || ''}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Warna Primer (HEX)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Warna Sekunder / Aksen (HEX)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Identitas Organisasi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 font-serif text-base">
              2. Identitas Lembaga / Organisasi
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Organisasi / Kampus</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Keterangan Lembaga</label>
            <input
              type="text"
              value={orgTagline}
              onChange={(e) => setOrgTagline(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
            />
          </div>
        </div>

        {/* Section 3: Template Email Undangan Otomatis */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 font-serif text-base">
              3. Template Undangan Email Otomatis (Gmail & GAS)
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Format Subjek Email</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Surat Undangan</label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Variabel dinamis: <span className="font-mono text-slate-600">{'{nama_peserta}'}, {'{nama_event}'}, {'{tanggal_event}'}, {'{waktu_event}'}, {'{lokasi_event}'}, {'{kode_tiket}'}</span>
            </p>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Kembalikan seluruh data dan pengaturan ke nilai demo awal?')) {
                resetAllDataToDefault();
                alert('Data telah di-reset ke nilai default.');
              }
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seluruh Database ke Data Awal
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
