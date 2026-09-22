// admin/src/pages/IconUploadPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminCategories, uploadAdminIcon } from '@/lib/api';
import { AdminCategoryItem } from '@/types/admin';

export default function IconUploadPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  
  const [svgOutlined, setSvgOutlined] = useState('');
  const [svgFilled, setSvgFilled] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'grid'>('dark');

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
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCats();
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, variant: 'outlined' | 'filled') {
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

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link to="/icons" className="hover:text-white transition-colors">
            Icons
          </Link>
          <span>/</span>
          <span className="text-slate-200">Upload</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Upload New Icon</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Add vector icons with automatic SVG sanitization, dual variants, and instant public publishing.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
                      onChange={(e) => handleFileUpload(e, 'outlined')}
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
                      onChange={(e) => handleFileUpload(e, 'filled')}
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
                  className={`px-2 py-0.5 rounded ${previewBg === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`px-2 py-0.5 rounded ${previewBg === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('grid')}
                  className={`px-2 py-0.5 rounded ${previewBg === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
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
    </div>
  );
}
