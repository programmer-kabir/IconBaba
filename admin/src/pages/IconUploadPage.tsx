// admin/src/pages/IconUploadPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAdminCategories, 
  uploadAdminIcon, 
  batchUploadAdminIcons, 
  BatchIconUploadItem 
} from '@/lib/api';
import { AdminCategoryItem } from '@/types/admin';
import { 
  UploadCloud, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Search, 
  Crown, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface QueuedIcon {
  id: string; // client temporary ID
  name: string;
  category_id: number;
  tags: string;
  status: 'published' | 'draft';
  is_premium: boolean;
  svg_outlined?: string;
  svg_filled?: string;
  detectedVariants: 'both' | 'outlined' | 'filled';
  originalFiles: string[];
}

export default function IconUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode: 'single' or 'bulk'
  const [mode, setMode] = useState<'single' | 'bulk'>('bulk');

  // Categories
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);

  // -------------------------------------------------------------
  // Single Upload State
  // -------------------------------------------------------------
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [svgOutlined, setSvgOutlined] = useState('');
  const [svgFilled, setSvgFilled] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'grid'>('dark');

  // -------------------------------------------------------------
  // Bulk Upload State
  // -------------------------------------------------------------
  const [queue, setQueue] = useState<QueuedIcon[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [globalCategory, setGlobalCategory] = useState<number | ''>('');
  const [globalStatus, setGlobalStatus] = useState<'published' | 'draft'>('published');
  const [globalIsPremium, setGlobalIsPremium] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Bulk Progress state
  const [uploadProgress, setUploadProgress] = useState<{
    uploading: boolean;
    currentBatch: number;
    totalBatches: number;
    uploadedCount: number;
    totalCount: number;
  }>({
    uploading: false,
    currentBatch: 0,
    totalBatches: 0,
    uploadedCount: 0,
    totalCount: 0,
  });

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await getAdminCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id);
            setGlobalCategory(res.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCats();
  }, []);

  // =============================================================
  // Single Upload Handlers
  // =============================================================
  function handleSingleFileUpload(e: React.ChangeEvent<HTMLInputElement>, variant: 'outlined' | 'filled') {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      setErrorMsg('Please select a valid .svg file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (variant === 'outlined') {
        setSvgOutlined(content);
        if (!name) {
          const cleanName = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ');
          setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } else {
        setSvgFilled(content);
      }
      setErrorMsg(null);
    };
    reader.readAsText(file);
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please provide an icon name.');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Please select a category.');
      return;
    }

    if (!svgOutlined.trim() && !svgFilled.trim()) {
      setErrorMsg('Please upload or paste at least one SVG variant (outlined or filled).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await uploadAdminIcon({
        name: name.trim(),
        category_id: Number(categoryId),
        tags: tags.trim(),
        status,
        svg_outlined: svgOutlined.trim() || undefined,
        svg_filled: svgFilled.trim() || undefined,
      });

      if (res.success && res.data) {
        setSuccessMsg(`Icon "${res.data.name}" uploaded successfully!`);
        setTimeout(() => {
          navigate('/icons');
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Failed to upload icon.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  // =============================================================
  // Smart Bulk Upload Parser & Engine
  // =============================================================
  async function processFiles(files: FileList | File[]) {
    setErrorMsg(null);
    const svgFiles = Array.from(files).filter(
      (f) => f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml'
    );

    if (svgFiles.length === 0) {
      setErrorMsg('No valid .svg files detected. Please drop or select SVG files.');
      return;
    }

    // Read all SVG contents asynchronously
    const readPromises = svgFiles.map((file) => {
      return new Promise<{ filename: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            filename: file.name,
            content: (e.target?.result as string) || '',
          });
        };
        reader.onerror = () => resolve({ filename: file.name, content: '' });
        reader.readAsText(file);
      });
    });

    const results = await Promise.all(readPromises);

    // Grouping map: baseKey -> QueuedIcon
    const map = new Map<string, QueuedIcon>();

    // Start with existing queue items
    queue.forEach((item) => {
      const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      map.set(key, { ...item });
    });

    const defaultCatId = typeof globalCategory === 'number' ? globalCategory : (categories[0]?.id || 1);

    results.forEach(({ filename, content }) => {
      if (!content || !content.includes('<svg')) return;

      const lowerName = filename.toLowerCase().replace(/\.svg$/i, '');

      // Check variant indicators
      const isFilledIndicator = /[-_](filled|fill|solid)$/i.test(lowerName);
      const isOutlinedIndicator = /[-_](outlined|outline|line|stroke)$/i.test(lowerName);

      // Clean base name without variant suffix
      const baseRaw = lowerName
        .replace(/[-_](filled|fill|solid|outlined|outline|line|stroke)$/i, '')
        .trim();

      const key = baseRaw.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Formatted display name (e.g. arrow-right-circle -> Arrow Right Circle)
      const cleanTitle = baseRaw
        .split(/[-_]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      // Auto-generated tags from words
      const autoTags = baseRaw.split(/[-_]+/).filter((w) => w.length > 2).join(', ');

      const existing = map.get(key);

      if (existing) {
        if (isFilledIndicator) {
          existing.svg_filled = content;
          existing.detectedVariants = existing.svg_outlined ? 'both' : 'filled';
        } else if (isOutlinedIndicator) {
          existing.svg_outlined = content;
          existing.detectedVariants = existing.svg_filled ? 'both' : 'outlined';
        } else {
          // If already has outline, fill the filled, or vice versa
          if (!existing.svg_outlined) {
            existing.svg_outlined = content;
          } else if (!existing.svg_filled) {
            existing.svg_filled = content;
          }
          existing.detectedVariants =
            existing.svg_outlined && existing.svg_filled ? 'both' : existing.svg_outlined ? 'outlined' : 'filled';
        }
        if (!existing.originalFiles.includes(filename)) {
          existing.originalFiles.push(filename);
        }
      } else {
        const item: QueuedIcon = {
          id: `qi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: cleanTitle,
          category_id: defaultCatId,
          tags: autoTags,
          status: globalStatus,
          is_premium: globalIsPremium,
          originalFiles: [filename],
          detectedVariants: isFilledIndicator ? 'filled' : 'outlined',
        };

        if (isFilledIndicator) {
          item.svg_filled = content;
        } else {
          item.svg_outlined = content;
        }

        map.set(key, item);
      }
    });

    const updatedQueue = Array.from(map.values());
    setQueue(updatedQueue);
    setSuccessMsg(`Loaded ${svgFiles.length} SVG files (${updatedQueue.length} unique icons queued).`);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }

  function applyGlobalSettingsToAll() {
    if (queue.length === 0) return;
    setQueue((prev) =>
      prev.map((item) => ({
        ...item,
        category_id: typeof globalCategory === 'number' ? globalCategory : item.category_id,
        status: globalStatus,
        is_premium: globalIsPremium,
      }))
    );
    setSuccessMsg('Global settings applied to all icons in queue.');
  }

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }

  function clearQueue() {
    setQueue([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  // =============================================================
  // Chunked Bulk Upload Execution
  // =============================================================
  async function handleBulkUpload() {
    if (queue.length === 0) {
      setErrorMsg('No icons in queue to upload.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    // Chunk size: 30 icons per HTTP request for 100% stability
    const CHUNK_SIZE = 30;
    const totalBatches = Math.ceil(queue.length / CHUNK_SIZE);

    setUploadProgress({
      uploading: true,
      currentBatch: 0,
      totalBatches,
      uploadedCount: 0,
      totalCount: queue.length,
    });

    let successfullyUploaded = 0;
    const allErrors: string[] = [];

    for (let b = 0; b < totalBatches; b++) {
      const chunk = queue.slice(b * CHUNK_SIZE, (b + 1) * CHUNK_SIZE);
      setUploadProgress((prev) => ({
        ...prev,
        currentBatch: b + 1,
      }));

      const payload: BatchIconUploadItem[] = chunk.map((item) => ({
        name: item.name,
        category_id: item.category_id,
        tags: item.tags,
        status: item.status,
        is_premium: item.is_premium ? 1 : 0,
        svg_outlined: item.svg_outlined,
        svg_filled: item.svg_filled,
      }));

      try {
        const res = await batchUploadAdminIcons({
          category_id: typeof globalCategory === 'number' ? globalCategory : undefined,
          status: globalStatus,
          is_premium: globalIsPremium ? 1 : 0,
          icons: payload,
        });

        if (res.success && res.data) {
          successfullyUploaded += res.data.uploaded_count;
          if (res.data.errors && res.data.errors.length > 0) {
            res.data.errors.forEach((err) => {
              allErrors.push(`${err.name}: ${err.error}`);
            });
          }
        } else {
          allErrors.push(`Batch ${b + 1} failed: ${res.message || 'Unknown server error'}`);
        }
      } catch (err: any) {
        allErrors.push(`Batch ${b + 1} network error: ${err.message || 'Failed to connect'}`);
      }

      setUploadProgress((prev) => ({
        ...prev,
        uploadedCount: successfullyUploaded,
      }));
    }

    setUploadProgress({
      uploading: false,
      currentBatch: totalBatches,
      totalBatches,
      uploadedCount: successfullyUploaded,
      totalCount: queue.length,
    });

    if (allErrors.length === 0) {
      setSuccessMsg(`🎉 All ${successfullyUploaded} icons uploaded and published successfully!`);
      setQueue([]);
    } else if (successfullyUploaded > 0) {
      setSuccessMsg(`Uploaded ${successfullyUploaded} icons with ${allErrors.length} notices.`);
      setErrorMsg(allErrors.slice(0, 3).join(' | '));
    } else {
      setErrorMsg(`Upload failed: ${allErrors.join(' | ')}`);
    }
  }

  // Filtered queue items
  const filteredQueue = queue.filter(
    (item) =>
      item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.tags.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/icons" className="hover:text-white transition-colors">
              Icons
            </Link>
            <span>/</span>
            <span className="text-slate-200">Upload Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'bulk' ? 'Bulk SVG Icon Studio' : 'Upload Single Icon'}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {mode === 'bulk'
              ? 'Drag and drop multiple SVG files or folders to batch process and publish icons instantly.'
              : 'Add individual vector icons with live SVG code editing, dual variants, and preview.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'bulk'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Upload</span>
            <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider rounded bg-white/20 text-white">
              Batch
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'single'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Single Icon</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <Link
            to="/icons"
            className="text-xs font-semibold text-emerald-300 underline hover:text-white flex items-center gap-1"
          >
            View in Icons List <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* BULK UPLOAD STUDIO MODE                                   */}
      {/* ========================================================= */}
      {mode === 'bulk' && (
        <div className="space-y-6">
          {/* 1. Drag & Drop Multi-File Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center group flex flex-col items-center justify-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
                : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".svg"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-600/10">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              Drag & Drop Multiple SVG Files Here
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Select dozens or hundreds of <code className="text-indigo-400 font-mono text-xs">.svg</code> icons at once.
              Smart parser automatically pairs <code className="text-slate-300 text-xs">name.svg</code> with <code className="text-slate-300 text-xs">name-filled.svg</code>!
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                Browse Files
              </button>
              <span className="text-xs text-slate-500">Supports multi-file selection</span>
            </div>
          </div>

          {/* 2. Global Batch Controls */}
          {queue.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Global Batch Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure default properties for all queued icons in one click.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyGlobalSettingsToAll}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Apply to All
                  </button>
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="px-3.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Global Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Batch Category
                  </label>
                  <select
                    value={globalCategory}
                    onChange={(e) => setGlobalCategory(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.total_icons} icons)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Global Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={globalStatus}
                    onChange={(e) => setGlobalStatus(e.target.value as 'published' | 'draft')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="published">🟢 Published (Live)</option>
                    <option value="draft">🟡 Draft (Hidden)</option>
                  </select>
                </div>

                {/* Global Tier */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Pricing Tier
                  </label>
                  <select
                    value={globalIsPremium ? 'pro' : 'free'}
                    onChange={(e) => setGlobalIsPremium(e.target.value === 'pro')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="free">Free Icons (Open Access)</option>
                    <option value="pro">👑 Pro Icons (Premium Tier)</option>
                  </select>
                </div>

                {/* Search Queue */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Search in Queue ({filteredQueue.length}/{queue.length})
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter icons..."
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Progress Bar (During Upload) */}
          {uploadProgress.uploading && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  Uploading Batch {uploadProgress.currentBatch} of {uploadProgress.totalBatches}...
                </span>
                <span className="font-bold text-white">
                  {Math.round((uploadProgress.uploadedCount / uploadProgress.totalCount) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.round((uploadProgress.uploadedCount / uploadProgress.totalCount) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                {uploadProgress.uploadedCount} of {uploadProgress.totalCount} icons committed to database.
              </div>
            </div>
          )}

          {/* 4. Queue Preview Grid */}
          {queue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Queued Icons ({queue.length})
                </h3>
                <button
                  type="button"
                  disabled={uploadProgress.uploading}
                  onClick={handleBulkUpload}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  {uploadProgress.uploading
                    ? 'Processing Batch...'
                    : `Upload All ${queue.length} Icons`}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3 relative group"
                  >
                    {/* SVG Thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-2 flex-shrink-0 text-indigo-400">
                      <div
                        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                        dangerouslySetInnerHTML={{
                          __html: item.svg_outlined || item.svg_filled || '',
                        }}
                      />
                    </div>

                    {/* Details Form Fields */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQueue((prev) =>
                            prev.map((q) => (q.id === item.id ? { ...q, name: val } : q))
                          );
                        }}
                        className="w-full px-2 py-1 bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded text-xs font-semibold text-white focus:outline-none"
                      />

                      <div className="flex items-center gap-2">
                        <select
                          value={item.category_id}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setQueue((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, category_id: val } : q))
                            );
                          }}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setQueue((prev) =>
                              prev.map((q) =>
                                q.id === item.id ? { ...q, is_premium: !q.is_premium } : q
                              )
                            );
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                            item.is_premium
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-slate-950 text-slate-500 border-slate-800'
                          }`}
                        >
                          <Crown className="w-2.5 h-2.5" />
                          {item.is_premium ? 'Pro' : 'Free'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${
                            item.detectedVariants === 'both'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : item.detectedVariants === 'filled'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}
                        >
                          {item.detectedVariants === 'both'
                            ? 'Outlined & Filled'
                            : item.detectedVariants === 'filled'
                            ? 'Filled Variant'
                            : 'Outlined Variant'}
                        </span>
                        <span className="text-slate-500 truncate max-w-[120px]">
                          {item.originalFiles[0]}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <span className="text-xs text-slate-400">
                  Ready to batch upload <b className="text-white">{queue.length} icons</b> into{' '}
                  <b className="text-indigo-400">
                    {categories.find((c) => c.id === globalCategory)?.name || 'Categories'}
                  </b>
                  .
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Discard All
                  </button>
                  <button
                    type="button"
                    disabled={uploadProgress.uploading}
                    onClick={handleBulkUpload}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    {uploadProgress.uploading ? 'Uploading...' : `Upload All ${queue.length} Icons`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SINGLE ICON UPLOAD MODE                                   */}
      {/* ========================================================= */}
      {mode === 'single' && (
        <form onSubmit={handleSingleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-2">Icon Details</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Icon Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Draw Outline, Cloud Sync, Heart"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.total_icons} icons)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pricing Tier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPremium(false)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        !isPremium
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Free Tier
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPremium(true)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        isPremium
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Crown className="w-3 h-3 text-amber-400" />
                      Pro Tier
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tags</label>
                <input
                  type="text"
                  placeholder="pen, sketch, vector, creative, art, draw"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      status === 'published'
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Published (Live)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      status === 'draft'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Draft (Hidden)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">SVG Vector Code</h2>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Paste Code
                  </button>
                </div>
              </div>

              {activeTab === 'upload' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-slate-200">Outlined Variant (.svg)</span>
                    <label className="mt-3 cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold border border-indigo-500/30 transition-colors">
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => handleSingleFileUpload(e, 'outlined')}
                        className="hidden"
                      />
                    </label>
                    {svgOutlined && (
                      <span className="text-[11px] text-emerald-400 font-medium mt-2">
                        Loaded ({svgOutlined.length} bytes)
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-slate-200">Filled Variant (.svg)</span>
                    <label className="mt-3 cursor-pointer px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs font-semibold border border-purple-500/30 transition-colors">
                      <span>Browse File</span>
                      <input
                        type="file"
                        accept=".svg"
                        onChange={(e) => handleSingleFileUpload(e, 'filled')}
                        className="hidden"
                      />
                    </label>
                    {svgFilled && (
                      <span className="text-[11px] text-emerald-400 font-medium mt-2">
                        Loaded ({svgFilled.length} bytes)
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Outlined SVG Code
                    </label>
                    <textarea
                      rows={4}
                      placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                      value={svgOutlined}
                      onChange={(e) => setSvgOutlined(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Filled SVG Code (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="<svg viewBox='0 0 24 24'>...</svg>"
                      value={svgFilled}
                      onChange={(e) => setSvgFilled(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to="/icons"
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                {submitting ? 'Uploading...' : 'Upload & Publish'}
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 sticky top-20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Live Preview</h2>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewBg('dark')}
                    className={`px-2 py-0.5 rounded ${
                      previewBg === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('light')}
                    className={`px-2 py-0.5 rounded ${
                      previewBg === 'light'
                        ? 'bg-slate-200 text-slate-900 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('grid')}
                    className={`px-2 py-0.5 rounded ${
                      previewBg === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Grid
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Outlined Variant</div>
                <div
                  className={`h-40 rounded-xl border flex items-center justify-center p-4 transition-colors ${
                    previewBg === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : previewBg === 'light'
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]'
                  }`}
                >
                  {svgOutlined ? (
                    <div
                      className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: svgOutlined }}
                    />
                  ) : (
                    <div className="text-xs text-slate-500">No outlined SVG uploaded</div>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-400 mb-2">Filled Variant</div>
                <div
                  className={`h-40 rounded-xl border flex items-center justify-center p-4 transition-colors ${
                    previewBg === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : previewBg === 'light'
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-800 text-white bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]'
                  }`}
                >
                  {svgFilled ? (
                    <div
                      className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: svgFilled }}
                    />
                  ) : (
                    <div className="text-xs text-slate-500">
                      {svgOutlined ? 'Auto-fallbacks to outlined' : 'No filled SVG uploaded'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
