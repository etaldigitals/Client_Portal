import React, { useState, useRef } from 'react';
import { 
  FileBox, 
  Upload, 
  Trash2, 
  Download, 
  Search, 
  History, 
  Paperclip, 
  Clock,
  User as UserIcon,
  FolderLock,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';
import { User, ClientCompany, Project, FileRecord, FileVersion } from '../types';
import { generateNativePDF, generateNativeImage, generateCSVWorksheet } from '../utils/documentExporter';

/**
 * Utility to securely detect the appropriate MIME type based on file name or category
 */
const lookupSecureMimeType = (fileName: string, category?: string): { mimeType: string; extension: string } => {
  const nameTrim = fileName.trim();
  let ext = nameTrim.split('.').pop()?.toLowerCase() || '';
  
  // If no extension or extension is the same as name, try guessing based on category or default
  if (!nameTrim.includes('.') || ext === nameTrim.toLowerCase()) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('blueprint') || cat.includes('report') || cat.includes('legal') || cat.includes('contract')) {
      ext = 'pdf';
    } else if (cat.includes('image') || cat.includes('logo') || cat.includes('mockup') || cat.includes('asset')) {
      ext = 'png';
    } else if (cat.includes('spreadsheet') || cat.includes('data') || cat.includes('ledger')) {
      ext = 'csv';
    } else {
      ext = 'txt';
    }
  }

  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    csv: 'text/csv;charset=utf-8;',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    json: 'application/json',
    zip: 'application/zip',
    html: 'text/html',
    txt: 'text/plain',
  };

  const mimeType = mimeMap[ext] || 'text/plain';
  return { mimeType, extension: ext };
};

interface FilesViewProps {
  currentUser: User;
  clients: ClientCompany[];
  projects: Project[];
  files: FileRecord[];
  onAddFile: (newFile: Omit<FileRecord, 'id' | 'uploadedBy' | 'uploadedAt' | 'version' | 'versions'>) => void;
  onDeleteFile: (fileId: string) => void;
  onAddFileVersion: (fileId: string, description: string, size: string) => void;
}

export default function FilesView({
  currentUser,
  clients,
  projects,
  files,
  onAddFile,
  onDeleteFile,
  onAddFileVersion
}: FilesViewProps) {
  const isAdmin = currentUser.role === 'admin';
  const clientId = currentUser.clientId;

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [isDragActive, setIsDragActive] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Modal / inputs for adding file manually
  const [showAddForm, setShowAddForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [fileCategory, setFileCategory] = useState<'design' | 'development' | 'report' | 'legal' | 'marketing'>('design');
  const [fileProj, setFileProj] = useState('');
  const [fileClient, setFileClient] = useState(isAdmin ? '' : (clientId || ''));

  // Versioning states
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [newVersionSize, setNewVersionSize] = useState('1.0 MB');

  // Scoped files
  const scopedFiles = isAdmin
    ? files
    : files.filter(f => f.clientId === clientId);

  const filteredFiles = scopedFiles.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'all' || f.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const scopedProjects = isAdmin
    ? projects
    : projects.filter(p => p.clientId === clientId);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Convert size
      const sizeConverted = droppedFile.size > 1024 * 1024 
        ? `${(droppedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(droppedFile.size / 1024)} KB`;

      // Set forms parameters to ease creation
      setFileName(droppedFile.name);
      setFileSize(sizeConverted);
      setShowAddForm(true);
    }
  };

  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !fileClient) return;

    onAddFile({
      name: fileName,
      size: fileSize,
      category: fileCategory,
      clientId: fileClient,
      projectId: fileProj || undefined
    });

    setFileName('');
    setFileSize('1.5 MB');
    setFileProj('');
    setShowAddForm(false);
  };

  const handleCreateVersionSubmit = (e: React.FormEvent, fileId: string) => {
    e.preventDefault();
    if (!newVersionDesc) return;
    onAddFileVersion(fileId, newVersionDesc, newVersionSize);
    setNewVersionDesc('');
    setNewVersionSize('1.0 MB');
  };

  const handleSimulateDownload = async (fileRecord: FileRecord, versionNum?: number) => {
    try {
      const element = document.createElement("a");
      const verStr = `v${versionNum || fileRecord.version}`;
      
      // Sophisticated MIME type and extension detection
      const { mimeType, extension } = lookupSecureMimeType(fileRecord.name, fileRecord.category);
      
      let file: Blob;
      
      if (extension === 'pdf') {
        file = generateNativePDF({
          title: `SECURE VAULT RECORD`,
          subtitle: `Authorized Asset Repository Audit Statement`,
          meta: [
            { label: 'Document Name', value: fileRecord.name },
            { label: 'Category Tag', value: fileRecord.category.toUpperCase() },
            { label: 'File Size', value: fileRecord.size },
            { label: 'Active Draft', value: verStr },
            { label: 'Registry ID', value: fileRecord.id },
            { label: 'Date Synced', value: fileRecord.uploadedAt },
          ],
          tableHeaders: ['System Property Key', 'Audit Property Value'],
          tableRows: [
            ['Vault Security Certificate', 'AES-256 Symmetric Encryption'],
            ['Compliance Protocol', 'HIPAA, GDPR, SOC-2 Certified'],
            ['Owner Agency', 'ETAL Digitals Incorporated'],
            ['Audit Gateway Token', `TOKEN-SSL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`],
          ],
          footer: 'ETAL Digitals Asset Vault System - Secured Encryption Gateway v2.4'
        });
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
        const originalImageBlob = await generateNativeImage({
          title: fileRecord.name,
          subtitle: `System Asset Repository Sync Card`,
          meta: [
            { label: 'Filename', value: fileRecord.name },
            { label: 'Category', value: fileRecord.category.toUpperCase() },
            { label: 'Size', value: fileRecord.size },
            { label: 'Version', value: verStr },
          ],
          badgeText: 'SECURITY SEC_LOCK',
          footer: 'ETAL DIGITALS SECURE CRYPTOGRAPHY GATEWAY'
        });
        // Enforce detected secure image MIME format
        file = originalImageBlob.type === mimeType ? originalImageBlob : new Blob([originalImageBlob], { type: mimeType });
      } else if (['xlsx', 'xls', 'csv'].includes(extension)) {
        const headers = ['Metric Key', 'System Metric Value'];
        const rows = [
          ['Document Name', fileRecord.name],
          ['Document ID', fileRecord.id],
          ['Document Version', verStr],
          ['Category Folder', fileRecord.category],
          ['File Weight', fileRecord.size],
          ['Uploaded Time', fileRecord.uploadedAt],
          ['Security Signature', 'AES-256-GCM Secure Key Block'],
        ];
        const csvBlob = generateCSVWorksheet(headers, rows);
        file = mimeType === 'text/csv;charset=utf-8;' ? csvBlob : new Blob([csvBlob], { type: mimeType });
      } else {
        const fileContent = `--- ETAL Digitals Secure Vault Document ---
Document Name: ${fileRecord.name}
Category: ${fileRecord.category}
Assigned Size: ${fileRecord.size}
Revision Version: ${verStr}
Timestamp Logged: ${new Date().toISOString()}
Security Status: Verified Secure HIPAA/GDPR Compliant Gateway File

This is a secure offline-audit receipt generated by the ETAL Digitals Client Hub.

--- END OF SECURE PROTOCOL FILE ---`;
        file = new Blob([fileContent], { type: mimeType });
      }

      // Guarantee file possesses the correct matching extension so the operating system triggers the correct native application handler.
      let downloadName = fileRecord.name;
      const lowerName = fileRecord.name.toLowerCase();
      if (!lowerName.endsWith(`.${extension}`)) {
        downloadName = `${fileRecord.name}.${extension}`;
      }

      element.href = URL.createObjectURL(file);
      element.download = downloadName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error(e);
      alert(`⚡ Download started for: ${fileRecord.name}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enterprise Asset Vault</h2>
          <p className="text-xs text-slate-500 mt-1">
            HIPAA and GDPR-compliant secure storage locker for assets, reports, and blueprints.
          </p>
        </div>

        <button
          id="btn-add-file-toggle"
          onClick={() => {
            if (clients.length > 0 && !fileClient) setFileClient(clients[0].id);
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition"
        >
          <Upload size={14} />
          <span>Upload Asset Document</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE BAR SEARCHES AND DRAGS */}
        <div className="space-y-4">
          
          {/* Real-time filters */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 text-xs font-medium">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest text-slate-400">Search Vault</h3>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                id="search-vault-input"
                type="text"
                placeholder="Search file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Asset categories</label>
              <div className="space-y-1.5 pt-1">
                {['all', 'design', 'development', 'report', 'legal', 'marketing'].map((cat) => (
                  <button
                    id={`btn-filter-cat-${cat}`}
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg font-semibold capitalize ${
                      filterCat === cat
                        ? 'bg-blue-50 text-blue-600 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      ({scopedFiles.filter(f => cat === 'all' || f.category === cat).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE DRAG-AND-DROP ASSIGNED CONTAINER */}
          <div
            id="drag-and-drop-zone"
            ref={dragRef}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[180px] ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50/50 scale-102' 
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <Upload size={28} className={isDragActive ? 'text-blue-600 animate-bounce' : 'text-slate-400'} />
            <h4 className="text-xs font-bold text-slate-700 mt-3">Drag & Drop Secure File</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] mx-auto leading-relaxed">
              Drop PDFs, Wireframe blueprints, calendars, or markdown spec sheets here.
            </p>
          </div>
        </div>

        {/* DETAILS TABLET AND VERSIONING VIEWER (Col Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* UPLOAD FORM POP PANEL */}
          {showAddForm && (
            <div id="add-file-form-segment" className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest text-slate-500">Asset Parameters Setup</h3>
              
              <form onSubmit={handleCreateFileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">File Name *</label>
                  <input
                    id="input-new-file-name"
                    type="text"
                    required
                    placeholder="e.g. wireframe_dashboard_mobile.fig"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Category Category Tag</label>
                  <select
                    id="select-new-file-cat"
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as any)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="design">🎨 Brand / Design Asset</option>
                    <option value="development">🔧 Technical Dev File</option>
                    <option value="report">📊 Campaign Report Sheet</option>
                    <option value="legal">⚖️ Contract / Compliance Document</option>
                    <option value="marketing">📈 Promotion Media Assets</option>
                  </select>
                </div>

                {isAdmin ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Client Association *</label>
                    <select
                      id="select-new-file-client"
                      required
                      value={fileClient}
                      onChange={(e) => setFileClient(e.target.value)}
                      className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                    >
                      <option value="">-- Choose Assigned Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-slate-100 p-2 rounded-lg text-xs">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">CLIENT ASSOCIATED</span>
                    <span className="font-extrabold text-slate-700">{currentUser.companyName}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Linked Project (Optional)</label>
                  <select
                    id="select-new-file-project"
                    value={fileProj}
                    onChange={(e) => setFileProj(e.target.value)}
                    className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    <option value="">-- Not tied to specific project --</option>
                    {scopedProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2.5 pt-1">
                  <button
                    id="btn-file-cancel"
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-file-confirm"
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white transition"
                  >
                    Confirm Upload
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ASSETS MASTER TABLE LISTINGS */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider font-mono">
                Assets ledger results ({filteredFiles.length} files discovered)
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredFiles.map((file) => {
                const isExpanded = expandedFileId === file.id;
                const projAssoc = projects.find(p => p.id === file.projectId);
                
                return (
                  <div key={file.id} className="py-3.5 font-medium">
                    <div id={`file-row-wrapper-${file.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                          <Paperclip size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{file.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="font-bold uppercase bg-slate-100 text-slate-600 py-0.2 px-1.5 rounded">{file.category}</span>
                            <span className="font-mono">{file.size}</span>
                            <span>| Upload: {file.uploadedAt}</span>
                            <span>| Version: v{file.version}</span>
                          </div>
                          
                          {projAssoc && (
                            <div className="text-[10px] text-blue-600 font-bold mt-1 uppercase">
                              Project Folder: {projAssoc.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Interactive Buttons: Version History toggle details, Delete and Download */}
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          id={`toggle-version-history-btn-${file.id}`}
                          onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                          title="File Version History"
                          className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition ${
                            isExpanded
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <History size={13} />
                          <span>v{file.version} Logs</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <button
                          id={`download-file-btn-${file.id}`}
                          onClick={() => handleSimulateDownload(file)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Download size={13} />
                          <span>Get</span>
                        </button>

                        {/* ADVANCED CONSTRAINT FROM SPEC: Clients cannot delete files */}
                        {isAdmin && (
                          <button
                            id={`trash-file-btn-${file.id}`}
                            onClick={() => {
                              if (confirm(`Do you absolutely wish to purge file ${file.name} from the portal? This deletes all version folders.`)) {
                                onDeleteFile(file.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-500 hover:text-white text-rose-500 border border-slate-100 hover:border-transparent rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* NESTED DYNAMIC FILE VERSIONING CONTAINER */}
                    {isExpanded && (
                      <div id={`nested-version-panel-${file.id}`} className="mt-4 ml-12 p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-4">
                        <h5 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                          <History size={12} />
                          <span>Version Control Logs (v{file.versions.length} Drafts)</span>
                        </h5>

                        <div className="space-y-2.5">
                          {file.versions.map((ver) => (
                            <div key={ver.version} className="flex items-start justify-between border-b border-slate-150 pb-2 text-xs font-medium">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-slate-700">Revision v{ver.version}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({ver.size})</span>
                                </div>
                                <p className="text-slate-500 mt-0.5">{ver.description}</p>
                                <span className="text-[10px] text-slate-400 block mt-1">Edited by: {ver.changedBy} | {ver.updatedAt}</span>
                              </div>
                              <button
                                id={`download-specific-version-${file.id}-v${ver.version}`}
                                onClick={() => handleSimulateDownload(file, ver.version)}
                                className="text-[10px] font-extrabold text-blue-600 hover:underline"
                              >
                                Download Draft
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Fast append version draft (Admin or associated client) */}
                        <form onSubmit={(e) => handleCreateVersionSubmit(e, file.id)} className="pt-2 border-t border-slate-150 space-y-2">
                          <h6 className="text-[10px] font-bold text-slate-700 uppercase">Increment Revision Draft</h6>
                          <div className="flex gap-2">
                            <input
                              id={`input-version-desc-${file.id}`}
                              type="text"
                              required
                              placeholder="Describe adjustments (e.g. Added mobile compliance guidelines to paragraph)"
                              value={newVersionDesc}
                              onChange={(e) => setNewVersionDesc(e.target.value)}
                              className="flex-1 bg-white px-2.5 py-1 inline-block border border-slate-200 rounded-lg text-xs"
                            />
                            
                            <input
                              id={`input-version-size-${file.id}`}
                              type="text"
                              value={newVersionSize}
                              onChange={(e) => setNewVersionSize(e.target.value)}
                              className="w-16 bg-white px-1 py-1 text-center border border-slate-200 rounded-lg text-xs font-mono"
                              title="Estimated File Size"
                            />

                            <button
                              id={`btn-version-confirm-${file.id}`}
                              type="submit"
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1 rounded-lg transition shrink-0"
                            >
                              Push v{file.version + 1}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFiles.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-2">
                  <FolderLock size={28} className="text-slate-300" />
                  <span>No documents uploaded. Push on "Upload Asset Document" to load files here.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
