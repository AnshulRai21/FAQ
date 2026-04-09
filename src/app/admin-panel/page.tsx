'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { loadFAQs, saveFAQs, loadSettings, saveSettings } from '@/lib/chatEngine';
import { FAQ, Settings, DEFAULT_SETTINGS, DEFAULT_FAQS } from '@/lib/faqData';

const ADMIN_USER = 'hoatgitam';
const ADMIN_PASS = 'GITAM@124';

type Tab = 'faqs' | 'settings';

interface FAQFormData {
  id: string;
  question: string;
  keywords: string;
  answer: string;
  category: string;
}

const emptyForm: FAQFormData = {
  id: '',
  question: '',
  keywords: '',
  answer: '',
  category: 'general',
};

const CATEGORIES = ['general', 'mess', 'technical', 'policy', 'fees', 'room', 'complaint', 'emergency', 'facilities', 'safety'];

export default function AdminPanelPage() {
  const router = useRouter();

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Data
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FAQFormData>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    const session = sessionStorage.getItem('gitam_admin_session');
    if (session === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      setFaqs(loadFAQs());
      setSettings(loadSettings());
    }
  }, [isLoggedIn]);

  // --- Auth ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === ADMIN_USER && loginForm.pass === ADMIN_PASS) {
      setIsLoggedIn(true);
      sessionStorage.setItem('gitam_admin_session', 'true');
      setLoginError('');
      toast.success('Welcome back, Admin!', { icon: '🎓' });
    } else {
      setLoginError('Invalid credentials. Check your username and password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('gitam_admin_session');
    toast.info('Logged out successfully');
  };

  // --- FAQ CRUD ---
  const validateForm = (): boolean => {
    const errors: Partial<FAQFormData> = {};
    if (!formData.question.trim()) errors.question = 'Question is required';
    if (!formData.keywords.trim()) errors.keywords = 'At least one keyword required';
    if (!formData.answer.trim()) errors.answer = 'Answer is required';
    if (!formData.category) errors.category = 'Category is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));

    const newFaq: FAQ = {
      id: formData.id || `faq-${Date.now()}`,
      question: formData.question.trim(),
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      answer: formData.answer.trim(),
      category: formData.category,
    };

    const updated = [...faqs, newFaq];
    setFaqs(updated);
    saveFAQs(updated);
    setIsSaving(false);
    setShowAddForm(false);
    setFormData(emptyForm);
    toast.success(`FAQ "${newFaq.question}" added successfully!`);
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      id: faq.id,
      question: faq.question,
      keywords: faq.keywords.join(', '),
      answer: faq.answer,
      category: faq.category,
    });
    setFormErrors({});
    setShowAddForm(false);
  };

  const handleUpdateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 400));

    const updated = faqs.map(f =>
      f.id === editingFaq?.id
        ? {
            ...f,
            question: formData.question.trim(),
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
            answer: formData.answer.trim(),
            category: formData.category,
          }
        : f
    );
    setFaqs(updated);
    saveFAQs(updated);
    setIsSaving(false);
    setEditingFaq(null);
    setFormData(emptyForm);
    toast.success('FAQ updated successfully!');
  };

  const handleDeleteFAQ = (id: string) => {
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    saveFAQs(updated);
    setDeleteConfirm(null);
    toast.success('FAQ deleted successfully');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    saveSettings(settings);
    setSettingsSaving(false);
    toast.success('Settings saved successfully!');
  };

  const handleResetFAQs = () => {
    if (confirm('Reset all FAQs to default? This cannot be undone.')) {
      setFaqs(DEFAULT_FAQS);
      saveFAQs(DEFAULT_FAQS);
      toast.success('FAQs reset to defaults');
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const categoryColors: Record<string, string> = {
    mess: '#f59e0b',
    technical: '#3b82f6',
    policy: '#8b5cf6',
    fees: '#10b981',
    room: '#f97316',
    complaint: '#ef4444',
    emergency: '#dc2626',
    facilities: '#06b6d4',
    safety: '#84cc16',
    general: '#6b7280',
  };

  // ============ LOGIN SCREEN ============
  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{
          background: 'linear-gradient(145deg, #f8f4ff 0%, #eef4ff 100%)',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push('/landing-screen')}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(123,97,255,0.2)',
            color: '#7B61FF',
          }}
        >
          ← Back
        </button>

        <div
          className="w-full max-w-sm p-6 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(123,97,255,0.15)',
            boxShadow: '0 20px 60px rgba(123,97,255,0.12)',
          }}
        >
          {/* Orb */}
          <div className="flex justify-center mb-5">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 64, height: 64,
                background: 'radial-gradient(circle at 35% 30%, #b89dff 0%, #7B61FF 45%, #4FACFE 100%)',
                boxShadow: '0 8px 32px rgba(123,97,255,0.4)',
              }}
            >
              <span style={{ fontSize: 28 }}>🔐</span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center mb-1" style={{ color: '#1a0533' }}>
            Admin Panel
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: '#9CA3AF' }}>
            GITAM Hostel Assistant Management
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4a2db5' }}>
                Username
              </label>
              <input
                type="text"
                value={loginForm.user}
                onChange={e => setLoginForm(p => ({ ...p, user: e.target.value }))}
                placeholder="Enter admin username"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(123,97,255,0.05)',
                  border: '1.5px solid rgba(123,97,255,0.2)',
                  color: '#1a0533',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#4a2db5' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={loginForm.pass}
                  onChange={e => setLoginForm(p => ({ ...p, pass: e.target.value }))}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none pr-12 transition-all"
                  style={{
                    background: 'rgba(123,97,255,0.05)',
                    border: '1.5px solid rgba(123,97,255,0.2)',
                    color: '#1a0533',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90"
                  style={{ color: '#9CA3AF' }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                className="px-4 py-3 rounded-xl text-xs"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                ⚠️ {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-97"
              style={{
                background: 'linear-gradient(135deg, #7B61FF 0%, #4FACFE 100%)',
                boxShadow: '0 8px 28px rgba(123,97,255,0.35)',
              }}
            >
              Sign In to Admin Panel
            </button>
          </form>

          {/* Hint box */}
          <div
            className="mt-4 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(123,97,255,0.04)',
              border: '1px dashed rgba(123,97,255,0.2)',
            }}
          >
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
              🔑 Admin access is restricted to authorized GITAM staff only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(145deg, #f8f4ff 0%, #eef4ff 100%)' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(123,97,255,0.12)',
          boxShadow: '0 2px 20px rgba(123,97,255,0.08)',
        }}
      >
        <button
          onClick={() => router.push('/landing-screen')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.15)' }}
          aria-label="Back to home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold" style={{ color: '#1a0533' }}>Admin Panel</h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>GITAM Hostel Assistant · {faqs.length} FAQs loaded</p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} />
          <span className="text-xs font-semibold" style={{ color: '#10b981' }}>Admin</span>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats row */}
      <div className="px-4 pt-4 pb-2 grid grid-cols-3 gap-3">
        {[
          { label: 'Total FAQs', value: faqs.length, color: '#7B61FF', bg: 'rgba(123,97,255,0.08)' },
          { label: 'Categories', value: new Set(faqs.map(f => f.category)).size, color: '#4FACFE', bg: 'rgba(79,172,254,0.08)' },
          { label: 'Keywords', value: faqs.reduce((a, f) => a + f.keywords.length, 0), color: '#FF6FD8', bg: 'rgba(255,111,216,0.08)' },
        ].map((stat) => (
          <div
            key={`stat-${stat.label}`}
            className="px-3 py-3 rounded-2xl text-center"
            style={{
              background: stat.bg,
              border: `1px solid ${stat.color}30`,
            }}
          >
            <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2">
        {(['faqs', 'settings'] as Tab[]).map((tab) => (
          <button
            key={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-97"
            style={{
              background: activeTab === tab
                ? 'linear-gradient(135deg, #7B61FF, #4FACFE)'
                : 'rgba(255,255,255,0.8)',
              color: activeTab === tab ? '#fff' : '#6B7280',
              border: `1px solid ${activeTab === tab ? 'transparent' : 'rgba(123,97,255,0.15)'}`,
              boxShadow: activeTab === tab ? '0 4px 16px rgba(123,97,255,0.3)' : 'none',
            }}
          >
            {tab === 'faqs' ? '📋 FAQ Manager' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* ===== FAQ TAB ===== */}
      {activeTab === 'faqs' && (
        <div className="px-4 pb-8">

          {/* Search + Filter + Add */}
          <div className="flex flex-col gap-2 mb-4">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(123,97,255,0.2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search FAQs by question, keyword, or answer..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: '#1a0533', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ color: '#9CA3AF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <div className="flex gap-1.5" style={{ width: 'max-content' }}>
                  {['all', ...CATEGORIES].map(cat => (
                    <button
                      key={`filter-${cat}`}
                      onClick={() => setFilterCategory(cat)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
                      style={{
                        background: filterCategory === cat
                          ? (categoryColors[cat] || '#7B61FF')
                          : 'rgba(255,255,255,0.8)',
                        color: filterCategory === cat ? '#fff' : '#6B7280',
                        border: `1px solid ${filterCategory === cat ? 'transparent' : 'rgba(123,97,255,0.15)'}`,
                      }}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(true); setEditingFaq(null); setFormData(emptyForm); setFormErrors({}); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-97"
                style={{
                  background: 'linear-gradient(135deg, #7B61FF, #4FACFE)',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add New FAQ
              </button>
              <button
                onClick={handleResetFAQs}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                Reset All
              </button>
            </div>
          </div>

          {/* Add FAQ Form */}
          {showAddForm && (
            <div
              className="mb-4 p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid rgba(123,97,255,0.25)',
                boxShadow: '0 8px 32px rgba(123,97,255,0.12)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold" style={{ color: '#1a0533' }}>Add New FAQ</h3>
                <button
                  onClick={() => { setShowAddForm(false); setFormData(emptyForm); setFormErrors({}); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <FAQForm
                formData={formData}
                formErrors={formErrors}
                isSaving={isSaving}
                onSubmit={handleAddFAQ}
                onChange={setFormData}
                onCancel={() => { setShowAddForm(false); setFormData(emptyForm); setFormErrors({}); }}
                submitLabel="Add FAQ"
              />
            </div>
          )}

          {/* Edit FAQ Form */}
          {editingFaq && (
            <div
              className="mb-4 p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1.5px solid rgba(79,172,254,0.3)',
                boxShadow: '0 8px 32px rgba(79,172,254,0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold" style={{ color: '#1a0533' }}>Edit FAQ</h3>
                <button
                  onClick={() => { setEditingFaq(null); setFormData(emptyForm); setFormErrors({}); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(107,114,128,0.1)', color: '#6B7280' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <FAQForm
                formData={formData}
                formErrors={formErrors}
                isSaving={isSaving}
                onSubmit={handleUpdateFAQ}
                onChange={setFormData}
                onCancel={() => { setEditingFaq(null); setFormData(emptyForm); setFormErrors({}); }}
                submitLabel="Update FAQ"
                isEdit
              />
            </div>
          )}

          {/* Results count */}
          <p className="text-xs mb-3" style={{ color: '#9CA3AF' }}>
            Showing {filteredFaqs.length} of {faqs.length} FAQs
            {searchQuery && ` for "${searchQuery}"`}
          </p>

          {/* FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div
              className="py-12 flex flex-col items-center gap-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px dashed rgba(123,97,255,0.2)',
              }}
            >
              <span style={{ fontSize: 36 }}>🔍</span>
              <p className="text-sm font-semibold" style={{ color: '#1a0533' }}>No FAQs found</p>
              <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Add your first FAQ using the button above'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={`faq-card-${faq.id}`}
                  className="p-4 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    border: editingFaq?.id === faq.id
                      ? '1.5px solid rgba(79,172,254,0.4)'
                      : '1px solid rgba(123,97,255,0.1)',
                    boxShadow: '0 2px 12px rgba(123,97,255,0.06)',
                  }}
                >
                  {/* FAQ header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: `${categoryColors[faq.category] || '#6B7280'}18`,
                            color: categoryColors[faq.category] || '#6B7280',
                          }}
                        >
                          {faq.category}
                        </span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>#{faq.id}</span>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: '#1a0533' }}>{faq.question}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditFAQ(faq)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{
                          background: 'rgba(79,172,254,0.1)',
                          border: '1px solid rgba(79,172,254,0.2)',
                          color: '#4FACFE',
                        }}
                        title="Edit FAQ"
                        aria-label={`Edit FAQ: ${faq.question}`}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#ef4444',
                        }}
                        title="Delete FAQ"
                        aria-label={`Delete FAQ: ${faq.question}`}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M9 11v6M14 11v6" />
                          <path d="M10 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {faq.keywords.slice(0, 4).map((kw, ki) => (
                      <span
                        key={`kw-${faq.id}-${ki}`}
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: 'rgba(123,97,255,0.07)',
                          color: '#7B61FF',
                          border: '1px solid rgba(123,97,255,0.15)',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                    {faq.keywords.length > 4 && (
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>+{faq.keywords.length - 4} more</span>
                    )}
                  </div>

                  {/* Answer preview */}
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: '#6B7280',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {faq.answer.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\n/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === 'settings' && (
        <div className="px-4 pb-8">
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">

            {/* Links Section */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(123,97,255,0.12)',
                boxShadow: '0 2px 12px rgba(123,97,255,0.06)',
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1a0533' }}>
                <span>🔗</span> Portal Links
              </h3>
              <div className="flex flex-col gap-3">
                <SettingsField
                  label="Fees Payment Portal URL"
                  helper="Link shown when user asks about fees"
                  value={settings.feesLink}
                  onChange={v => setSettings(p => ({ ...p, feesLink: v }))}
                  placeholder="https://onlinepay.gitam.edu"
                />
                <SettingsField
                  label="Helpdesk Portal URL"
                  helper="Link shown for complaint escalation"
                  value={settings.helpdeskLink}
                  onChange={v => setSettings(p => ({ ...p, helpdeskLink: v }))}
                  placeholder="https://helpdesk.gitam.edu"
                />
              </div>
            </div>

            {/* Boys Hostel Contacts */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(123,97,255,0.12)',
                boxShadow: '0 2px 12px rgba(123,97,255,0.06)',
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1a0533' }}>
                <span>👨</span> Boys Hostel Manager
              </h3>
              <div className="flex flex-col gap-3">
                <SettingsField
                  label="Manager Name / Title"
                  value={settings.boysManagerName}
                  onChange={v => setSettings(p => ({ ...p, boysManagerName: v }))}
                  placeholder="Boys Hostel Manager (Vizag)"
                />
                <SettingsField
                  label="Primary Phone Number"
                  helper="Include country code: +91XXXXXXXXXX"
                  value={settings.boysManagerPhone}
                  onChange={v => setSettings(p => ({ ...p, boysManagerPhone: v }))}
                  placeholder="+919010306158"
                  type="tel"
                />
                <SettingsField
                  label="Alternate Phone 1"
                  value={settings.boysManagerPhone2}
                  onChange={v => setSettings(p => ({ ...p, boysManagerPhone2: v }))}
                  placeholder="+919177755341"
                  type="tel"
                />
                <SettingsField
                  label="Alternate Phone 2 / Office"
                  value={settings.boysManagerPhone3}
                  onChange={v => setSettings(p => ({ ...p, boysManagerPhone3: v }))}
                  placeholder="+919542055577"
                  type="tel"
                />
              </div>
            </div>

            {/* Girls Hostel Contacts */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(255,111,216,0.15)',
                boxShadow: '0 2px 12px rgba(255,111,216,0.06)',
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#1a0533' }}>
                <span>👩</span> Girls Hostel Manager
              </h3>
              <div className="flex flex-col gap-3">
                <SettingsField
                  label="Manager Name / Title"
                  value={settings.girlsManagerName}
                  onChange={v => setSettings(p => ({ ...p, girlsManagerName: v }))}
                  placeholder="Girls Hostel Manager (Vizag)"
                />
                <SettingsField
                  label="Primary Phone Number"
                  helper="Include country code: +91XXXXXXXXXX"
                  value={settings.girlsManagerPhone}
                  onChange={v => setSettings(p => ({ ...p, girlsManagerPhone: v }))}
                  placeholder="+919866577788"
                  type="tel"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={settingsSaving}
              className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #7B61FF 0%, #4FACFE 100%)',
                boxShadow: '0 8px 28px rgba(123,97,255,0.35)',
              }}
            >
              {settingsSaving ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>✓ Save Settings</>
              )}
            </button>

            {/* Info box */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(123,97,255,0.04)',
                border: '1px dashed rgba(123,97,255,0.2)',
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: '#7B61FF' }}>💾 Storage Info</p>
              <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                All FAQ data and settings are stored in your browser&apos;s localStorage. To export FAQs for backup, use the browser developer console: <code style={{ background: 'rgba(123,97,255,0.1)', padding: '1px 4px', borderRadius: 4, fontSize: 11 }}>localStorage.getItem(&apos;gitam_faqs&apos;)</code>
              </p>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm p-5 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              animation: 'slideUp 0.25s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>
            </div>
            <h3 className="text-base font-bold text-center mb-1" style={{ color: '#1a0533' }}>Delete FAQ?</h3>
            <p className="text-sm text-center mb-5" style={{ color: '#6B7280' }}>
              This FAQ will be permanently removed. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-97"
                style={{
                  background: 'rgba(107,114,128,0.1)',
                  color: '#6B7280',
                  border: '1px solid rgba(107,114,128,0.2)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFAQ(deleteConfirm)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all active:scale-97"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                }}
              >
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

interface FAQFormProps {
  formData: FAQFormData;
  formErrors: Partial<FAQFormData>;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: FAQFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  isEdit?: boolean;
}

interface FAQFormData {
  id: string;
  question: string;
  keywords: string;
  answer: string;
  category: string;
}

const CATEGORIES_CONST = ['general', 'mess', 'technical', 'policy', 'fees', 'room', 'complaint', 'emergency', 'facilities', 'safety'];

function FAQForm({ formData, formErrors, isSaving, onSubmit, onChange, onCancel, submitLabel, isEdit }: FAQFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#4a2db5' }}>
          Question <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={formData.question}
          onChange={e => onChange({ ...formData, question: e.target.value })}
          placeholder="e.g. What are the mess timings?"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(123,97,255,0.04)',
            border: `1.5px solid ${formErrors.question ? '#ef4444' : 'rgba(123,97,255,0.2)'}`,
            color: '#1a0533',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        />
        {formErrors.question && (
          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.question}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#4a2db5' }}>
          Keywords <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <p className="text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
          Comma-separated phrases users might type
        </p>
        <input
          type="text"
          value={formData.keywords}
          onChange={e => onChange({ ...formData, keywords: e.target.value })}
          placeholder="e.g. mess time, food timing, breakfast time"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(123,97,255,0.04)',
            border: `1.5px solid ${formErrors.keywords ? '#ef4444' : 'rgba(123,97,255,0.2)'}`,
            color: '#1a0533',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}
        />
        {formErrors.keywords && (
          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.keywords}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#4a2db5' }}>
          Category <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <select
          value={formData.category}
          onChange={e => onChange({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(123,97,255,0.04)',
            border: `1.5px solid ${formErrors.category ? '#ef4444' : 'rgba(123,97,255,0.2)'}`,
            color: '#1a0533',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            appearance: 'none',
          }}
        >
          {CATEGORIES_CONST.map(cat => (
            <option key={`opt-${cat}`} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#4a2db5' }}>
          Answer <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <p className="text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
          Use **bold** for emphasis, new lines for structure
        </p>
        <textarea
          value={formData.answer}
          onChange={e => onChange({ ...formData, answer: e.target.value })}
          placeholder="Type the full answer here. Use **bold** for headings and line breaks for clarity."
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{
            background: 'rgba(123,97,255,0.04)',
            border: `1.5px solid ${formErrors.answer ? '#ef4444' : 'rgba(123,97,255,0.2)'}`,
            color: '#1a0533',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            lineHeight: 1.6,
          }}
        />
        {formErrors.answer && (
          <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{formErrors.answer}</p>
        )}
      </div>

      {isEdit && (
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#9CA3AF' }}>
            FAQ ID (read-only)
          </label>
          <input
            type="text"
            value={formData.id}
            readOnly
            className="w-full px-3 py-2 rounded-xl text-xs outline-none"
            style={{
              background: 'rgba(107,114,128,0.06)',
              border: '1px solid rgba(107,114,128,0.15)',
              color: '#9CA3AF',
              fontFamily: 'monospace',
            }}
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-97"
          style={{
            background: 'rgba(107,114,128,0.08)',
            color: '#6B7280',
            border: '1px solid rgba(107,114,128,0.2)',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-70"
          style={{
            background: isEdit
              ? 'linear-gradient(135deg, #4FACFE, #7B61FF)'
              : 'linear-gradient(135deg, #7B61FF, #4FACFE)',
            boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
          }}
        >
          {isSaving ? (
            <>
              <svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Saving...
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}

interface SettingsFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  type?: string;
}

function SettingsField({ label, value, onChange, placeholder, helper, type = 'text' }: SettingsFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: '#4a2db5' }}>
        {label}
      </label>
      {helper && (
        <p className="text-xs mb-1.5" style={{ color: '#9CA3AF' }}>{helper}</p>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(123,97,255,0.04)',
          border: '1.5px solid rgba(123,97,255,0.2)',
          color: '#1a0533',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}
      />
    </div>
  );
}
