import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Folder,
  Image as ImageIcon,
  FileText,
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export const DocumentationGallery: React.FC = () => {
  const {
    selectedEventId,
    selectedEvent,
    documentation,
    addDocumentation,
    deleteDocumentation,
    currentUser,
    activeRole,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'photo' | 'document'>('photo');

  const eventDocs = documentation.filter((d) => d.eventId === selectedEventId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addDocumentation({
      eventId: selectedEventId,
      title: newTitle.trim(),
      url:
        newUrl.trim() ||
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      uploadedBy: currentUser?.name || 'Panitia',
      type: newType,
      size: '2.5 MB',
    });

    setNewTitle('');
    setNewUrl('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Folder className="w-3.5 h-3.5" />
            Dokumentasi & Berkas Kegiatan
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
            {selectedEvent ? selectedEvent.title : 'Dokumentasi Acara'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Penyimpanan foto dokumentasi dan berkas materi yang terhubung ke Google Drive
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {selectedEvent?.driveFolderUrl && (
            <a
              href={selectedEvent.driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
            >
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Buka Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          )}

          {activeRole !== 'public_participant' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span>Unggah Dokumentasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {eventDocs.length > 0 ? (
          eventDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {doc.type === 'photo' ? (
                  <div className="h-48 bg-slate-100 overflow-hidden relative group">
                    <img
                      src={doc.url}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      Foto Kegiatan
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4 text-center border-b border-slate-100">
                    <FileText className="w-12 h-12 text-blue-500 mb-2" />
                    <span className="text-xs font-mono font-bold text-slate-700">PDF / Dokumen Acara</span>
                  </div>
                )}

                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{doc.title}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Oleh: {doc.uploadedBy}</span>
                    <span>{doc.size || '3 MB'}</span>
                  </div>
                </div>
              </div>

              {activeRole !== 'public_participant' && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteDocumentation(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-xs">Belum ada dokumentasi untuk kegiatan ini</p>
            <p className="text-[11px] mt-0.5">Unggah foto acara atau bagikan link materi untuk peserta</p>
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 font-serif text-base">Unggah Dokumentasi Kegiatan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Keterangan Berkas</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Foto Sesi Diskusi Panel & Pembicara"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Berkas</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                >
                  <option value="photo">Foto / Gambar Kegiatan</option>
                  <option value="document">Dokumen / Slide Materi PDF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Gambar / Link Berkas</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (atau kosongkan untuk default)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Berkas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
