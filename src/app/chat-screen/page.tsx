'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadFAQs, loadSettings, matchFAQ, getSuggestions, formatAnswer, isEmergencyQuery, isFeesQuery, isComplaintUnresolved } from '@/lib/chatEngine';
import { FAQ, Settings } from '@/lib/faqData';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  html?: string;
  type?: 'normal' | 'complaint' | 'emergency' | 'fees' | 'suggestions' | 'partial';
  timestamp: Date;
  suggestions?: FAQ[];
  showEmergency?: boolean;
}

const COMPLAINT_CATEGORIES = [
  { id: 'maintenance', label: '🔧 Maintenance', desc: 'Fan, light, plumbing, furniture repairs' },
  { id: 'mess', label: '🍛 Mess / Food', desc: 'Food quality, mess timing, hygiene' },
  { id: 'cleanliness', label: '🧹 Cleanliness', desc: 'Room, bathroom, common area cleaning' },
];

const ROTATING_SUGGESTIONS = [
  'Mess timings?',
  'WiFi not working?',
  'Leave permission?',
  'Hostel fees?',
  'Room facilities?',
  'Emergency contact?',
  'Study hours?',
  'Medical facility?',
];

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen" style={{ background: 'linear-gradient(145deg, #f8f4ff 0%, #eef4ff 100%)' }}><div className="text-purple-500 text-sm">Loading...</div></div>}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<FAQ[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orbState, setOrbState] = useState<'idle' | 'typing' | 'replying' | 'suggestions'>('idle');
  const [rotatingSuggIdx, setRotatingSuggIdx] = useState(0);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Load data
  useEffect(() => {
    const loadedFaqs = loadFAQs();
    const loadedSettings = loadSettings();
    setFaqs(loadedFaqs);
    setSettings(loadedSettings);

    // Welcome message
    const welcome: Message = {
      id: 'msg-welcome',
      sender: 'bot',
      text: '',
      html: `Hi there! I'm your <strong>GITAM Hostel Assistant</strong>.<br/><br/>I can help you with mess timings, WiFi issues, leave permissions, fees, complaints, and more.<br/><br/>What would you like to know?`,
      type: 'normal',
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, []);

  // Handle pre-filled query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && faqs.length > 0) {
      setTimeout(() => {
        handleSendMessage(q);
      }, 800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faqs]);

  // Rotating suggestion pills
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingSuggIdx(prev => (prev + 1) % ROTATING_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Scroll detection
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 80);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic suggestions while typing
  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      const s = getSuggestions(inputValue, faqs);
      setSuggestions(s);
      setOrbState('typing');
    } else {
      setSuggestions([]);
      setOrbState('idle');
    }
  }, [inputValue, faqs]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}-${Math.floor(msg.sender.length * 100)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const handleSendMessage = useCallback(async (text?: string) => {
    const query = (text || inputValue).trim();
    if (!query) {
      // Show suggestions for empty input
      const topFaqs = faqs.slice(0, 4);
      addMessage({
        sender: 'bot',
        text: 'Here are some popular questions:',
        type: 'suggestions',
        suggestions: topFaqs,
      });
      return;
    }

    // Add user message
    addMessage({ sender: 'user', text: query, type: 'normal' });
    setInputValue('');
    setSuggestions([]);
    setIsTyping(true);
    setOrbState('replying');

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 900 + Math.random() * 400));
    setIsTyping(false);

    // Check special flows
    if (isFeesQuery(query)) {
      addMessage({
        sender: 'bot',
        html: `💳 <strong>Hostel Fees Portal</strong><br/><br/>You can pay hostel fees online at the official GITAM payment portal.<br/><br/><a href="${settings?.feesLink || 'https://onlinepay.gitam.edu'}" target="_blank" rel="noopener" style="color:#7B61FF;font-weight:600;text-decoration:underline;">→ Open Fees Payment Portal</a>`,
        text: '',
        type: 'fees',
      });
      setOrbState('idle');
      return;
    }

    if (isComplaintUnresolved(query)) {
      addMessage({
        sender: 'bot',
        html: `📢 <strong>Escalating Your Complaint</strong><br/><br/>If your complaint is unresolved, please escalate via GITAM Helpdesk:<br/><br/>📞 <a href="tel:08912840555" style="color:#7B61FF;font-weight:600;">0891-2840555</a><br/><br/><a href="${settings?.helpdeskLink || 'https://helpdesk.gitam.edu'}" target="_blank" rel="noopener" style="color:#7B61FF;font-weight:600;text-decoration:underline;">→ Open GITAM Helpdesk</a>`,
        text: '',
        type: 'complaint',
      });
      setOrbState('idle');
      return;
    }

    if (isEmergencyQuery(query)) {
      addMessage({
        sender: 'bot',
        text: '',
        html: `🚨 <strong>Emergency Protocol</strong><br/><br/>For emergencies, please follow this escalation path:`,
        type: 'emergency',
        showEmergency: true,
      });
      setOrbState('suggestions');
      return;
    }

    // Check for complaint keywords
    const complaintTriggers = ['complaint', 'complain', 'report issue', 'raise complaint', 'maintenance issue', 'mess issue', 'cleanliness'];
    const isComplaint = complaintTriggers.some(t => query.toLowerCase().includes(t));
    if (isComplaint) {
      addMessage({
        sender: 'bot',
        text: '',
        html: `🚨 <strong>Raise a Complaint</strong><br/><br/>Select the category that best describes your issue:`,
        type: 'complaint',
      });
      setOrbState('idle');
      return;
    }

    // FAQ matching
    const result = matchFAQ(query, faqs);

    if (result.type === 'exact' && result.faq) {
      addMessage({
        sender: 'bot',
        html: formatAnswer(result.faq.answer),
        text: result.faq.answer,
        type: 'normal',
      });
    } else if (result.type === 'partial' && result.suggestions && result.suggestions.length > 0) {
      addMessage({
        sender: 'bot',
        text: `I found some related questions. Did you mean one of these?`,
        type: 'partial',
        suggestions: result.suggestions,
      });
    } else {
      addMessage({
        sender: 'bot',
        html: `I didn't quite understand that.<br/><br/>Try rephrasing, or tap one of the suggestions below. You can also visit <a href="${settings?.helpdeskLink || 'https://helpdesk.gitam.edu'}" target="_blank" rel="noopener" style="color:#7B61FF;font-weight:600;">GITAM Helpdesk</a> for unresolved issues.`,
        text: '',
        type: 'suggestions',
        suggestions: faqs.slice(0, 4),
      });
    }

    setOrbState('idle');
  }, [inputValue, faqs, settings]);

  const handleSuggestionClick = (faq: FAQ) => {
    setOrbState('typing');
    handleSendMessage(faq.question);
  };

  const handleChipClick = (label: string) => {
    handleSendMessage(label);
  };

  const handleComplaintCategory = (category: { id: string; label: string; desc: string }) => {
    setIsTyping(true);
    setOrbState('replying');
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        sender: 'bot',
        html: `${category.label} <strong>Complaint</strong><br/><br/><strong>How to resolve:</strong><br/>• Inform your floor warden or hostel staff immediately<br/>• If unresolved within 24 hours, escalate via helpdesk<br/><br/><a href="${settings?.helpdeskLink || 'https://helpdesk.gitam.edu'}" target="_blank" rel="noopener" style="color:#7B61FF;font-weight:600;text-decoration:underline;">→ Open GITAM Helpdesk</a>`,
        text: '',
        type: 'normal',
      });
      setOrbState('idle');
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const quickSuggestions = [
    'Mess timings',
    'WiFi help',
    'Leave rules',
    'Room info',
    'Emergency',
    'Pay fees',
  ];

  return (
    <div
      className="flex flex-col w-full h-screen max-w-lg mx-auto relative"
      style={{
        background: 'linear-gradient(145deg, #f8f4ff 0%, #eef4ff 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 flex-shrink-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(123,97,255,0.12)',
          boxShadow: '0 2px 20px rgba(123,97,255,0.08)',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push('/landing-screen')}
          className="w-9 h-9 rounded-xl flex items-center justify-center mr-3 transition-all active:scale-90"
          style={{
            background: 'rgba(123,97,255,0.08)',
            border: '1px solid rgba(123,97,255,0.15)',
          }}
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Title area */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate" style={{ color: '#1a0533' }}>
            GITAM Hostel Assistant
          </h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {isTyping ? (
              <span style={{ color: '#7B61FF' }}>Typing...</span>
            ) : (
              'Always here to help'
            )}
          </p>
        </div>

        {/* Mini Orb in header */}
        <div
          ref={orbRef}
          className="relative flex-shrink-0 rounded-full cursor-pointer transition-all"
          style={{
            width: 40, height: 40,
            background: 'radial-gradient(circle at 35% 30%, #b89dff 0%, #7B61FF 40%, #4FACFE 100%)',
            boxShadow: orbState === 'replying' ?'0 0 20px rgba(123,97,255,0.7), 0 0 40px rgba(255,111,216,0.4)'
              : orbState === 'typing' ?'0 0 16px rgba(79,172,254,0.6)'
              : orbState === 'suggestions' ?'0 0 18px rgba(255,111,216,0.5)' :'0 0 12px rgba(123,97,255,0.35)',
            animation: orbState === 'replying' ? 'orbPulseReply 0.6s ease-out' : 'orbBreatheSm 3s ease-in-out infinite',
            transition: 'box-shadow 0.3s ease',
          }}
          onClick={() => router.push('/landing-screen')}
          title="Back to home"
        >
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.5) 0%, transparent 60%)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-base"></div>
        </div>

        {/* Helpdesk button */}
        <a
          href={settings?.helpdeskLink || 'https://play.google.com/store/apps/details?id=com.gitamapps.mygitam&pcampaignid=web_share'}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(123,97,255,0.12), rgba(79,172,254,0.12))',
            border: '1px solid rgba(123,97,255,0.25)',
            color: '#7B61FF',
          }}
        >
          Helpdesk
        </a>
      </div>

      {/* Chat messages area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 chat-scroll"
        style={{ overflowX: 'hidden' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="mb-3"
            style={{ animation: 'messageSlideIn 0.3s ease-out' }}
          >
            {msg.sender === 'user' ? (
              /* User message */
              <div className="flex justify-end">
                <div
                  className="max-w-[78%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #7B61FF 0%, #9B7FFF 100%)',
                    boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                    wordBreak: 'break-word',
                  }}
                >
                  <p style={{ lineHeight: 1.5, margin: 0 }}>{msg.text}</p>
                  <p className="text-right mt-1 text-xs opacity-70">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ) : (
              /* Bot message */
              <div className="flex items-start gap-2">
                {/* Bot avatar */}
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 30, height: 30,
                    background: 'radial-gradient(circle at 35% 30%, #b89dff 0%, #7B61FF 50%, #4FACFE 100%)',
                    boxShadow: '0 2px 8px rgba(123,97,255,0.3)',
                  }}
                >
                  <span style={{ fontSize: 14 }}></span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Main bubble */}
                  {(msg.html || msg.text) && (
                    <div
                      className="max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(123,97,255,0.12)',
                        boxShadow: '0 2px 12px rgba(123,97,255,0.08)',
                        color: '#1a0533',
                        wordBreak: 'break-word',
                        lineHeight: 1.6,
                      }}
                    >
                      {msg.html ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.html }} />
                      ) : (
                        <p style={{ margin: 0 }}>{msg.text}</p>
                      )}
                      <p className="mt-1 text-xs opacity-40">{formatTime(msg.timestamp)}</p>
                    </div>
                  )}

                  {/* Complaint categories */}
                  {msg.type === 'complaint' && !msg.showEmergency && (
                    <div className="mt-2 flex flex-col gap-2">
                      {COMPLAINT_CATEGORIES.map((cat) => (
                        <button
                          key={`cat-${cat.id}`}
                          onClick={() => handleComplaintCategory(cat)}
                          className="text-left px-4 py-2.5 rounded-xl text-sm transition-all active:scale-95"
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid rgba(123,97,255,0.2)',
                            color: '#1a0533',
                            boxShadow: '0 2px 8px rgba(123,97,255,0.06)',
                          }}
                        >
                          <span className="font-semibold" style={{ color: '#7B61FF' }}>{cat.label}</span>
                          <span className="block text-xs mt-0.5" style={{ color: '#6B7280' }}>{cat.desc}</span>
                        </button>
                      ))}
                      <a
                        href={settings?.helpdeskLink || 'https://helpdesk.gitam.edu'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-all active:scale-95"
                        style={{
                          background: 'linear-gradient(135deg, #7B61FF, #4FACFE)',
                          color: '#fff',
                          boxShadow: '0 4px 16px rgba(123,97,255,0.3)',
                        }}
                      >
                        → Open GITAM Helpdesk
                      </a>
                    </div>
                  )}

                  {/* Emergency contacts */}
                  {msg.showEmergency && (
                    <div className="mt-2 flex flex-col gap-2">
                      {/* Step 1: Helpdesk */}
                      <div
                        className="px-4 py-3 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          border: '1px solid rgba(79,172,254,0.25)',
                        }}
                      >
                        <p className="text-xs font-semibold mb-1" style={{ color: '#4FACFE' }}>STEP 1 — Use Helpdesk First</p>
                        <a
                          href="tel:08912840555"
                          className="flex items-center gap-2 py-1"
                          style={{ color: '#1a0533', textDecoration: 'none' }}
                        >
                          <span>📞</span>
                          <span className="font-semibold text-sm">GITAM Helpdesk: 0891-2840555</span>
                        </a>
                        <a
                          href={settings?.helpdeskLink || 'https://helpdesk.gitam.edu'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block px-3 py-2 rounded-lg text-sm font-semibold text-center transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(123,97,255,0.15))',
                            border: '1px solid rgba(79,172,254,0.3)',
                            color: '#4FACFE',
                          }}
                        >
                          → Open Helpdesk Portal
                        </a>
                      </div>

                      {/* Step 2: Emergency contacts — last resort */}
                      <div
                        className="px-4 py-3 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          border: '1px solid rgba(255,100,100,0.2)',
                        }}
                      >
                        <p className="text-xs font-semibold mb-2" style={{ color: '#ef4444' }}>LAST RESORT — Direct Contact</p>

                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${settings?.boysManagerPhone || '+919010306158'}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                            style={{
                              background: 'rgba(123,97,255,0.06)',
                              border: '1px solid rgba(123,97,255,0.15)',
                              textDecoration: 'none',
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #7B61FF, #4FACFE)' }}
                            >
                              <span style={{ fontSize: 16 }}>👨</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold" style={{ color: '#1a0533' }}>
                                {settings?.boysManagerName || 'Boys Hostel '}
                              </p>
                              <p className="text-xs" style={{ color: '#7B61FF' }}>
                                {settings?.boysManagerPhone || '+91 9010306158'}
                              </p>
                            </div>
                            <span style={{ fontSize: 18 }}>📱</span>
                          </a>

                          {settings?.boysManagerPhone2 && (
                            <a
                              href={`tel:${settings.boysManagerPhone2}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                              style={{
                                background: 'rgba(123,97,255,0.04)',
                                border: '1px solid rgba(123,97,255,0.12)',
                                textDecoration: 'none',
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #7B61FF, #9B7FFF)' }}
                              >
                                <span style={{ fontSize: 16 }}>👨</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold" style={{ color: '#1a0533' }}>Boys Manager (Alt 1)</p>
                                <p className="text-xs" style={{ color: '#7B61FF' }}>{settings.boysManagerPhone2}</p>
                              </div>
                              <span style={{ fontSize: 18 }}>📱</span>
                            </a>
                          )}

                          <a
                            href={`tel:${settings?.girlsManagerPhone || '+919866577788'}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                            style={{
                              background: 'rgba(255,111,216,0.06)',
                              border: '1px solid rgba(255,111,216,0.2)',
                              textDecoration: 'none',
                            }}
                          >
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #FF6FD8, #9B7FFF)' }}
                            >
                              <span style={{ fontSize: 16 }}>👩</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold" style={{ color: '#1a0533' }}>
                                {settings?.girlsManagerName || 'Girls Hostel'}
                              </p>
                              <p className="text-xs" style={{ color: '#FF6FD8' }}>
                                {settings?.girlsManagerPhone || '+91 9866577788'}
                              </p>
                            </div>
                            <span style={{ fontSize: 18 }}>📱</span>
                          </a>

                          {settings?.boysManagerPhone3 && (
                            <a
                              href={`tel:${settings.boysManagerPhone3}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                              style={{
                                background: 'rgba(79,172,254,0.05)',
                                border: '1px solid rgba(79,172,254,0.15)',
                                textDecoration: 'none',
                              }}
                            >
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #4FACFE, #7B61FF)' }}
                              >
                                <span style={{ fontSize: 16 }}>🏢</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold" style={{ color: '#1a0533' }}>Hostel Office (Common)</p>
                                <p className="text-xs" style={{ color: '#4FACFE' }}>{settings.boysManagerPhone3}</p>
                              </div>
                              <span style={{ fontSize: 18 }}>📱</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestion chips for partial/none matches */}
                  {(msg.type === 'partial' || msg.type === 'suggestions') && msg.suggestions && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {msg.suggestions.map((faq, i) => (
                        <button
                          key={`sugg-${faq.id}-${i}`}
                          onClick={() => handleSuggestionClick(faq)}
                          className="text-left px-3 py-2 rounded-xl text-sm transition-all active:scale-95"
                          style={{
                            background: 'rgba(255,255,255,0.9)',
                            border: '1px solid rgba(123,97,255,0.18)',
                            color: '#4a2db5',
                            boxShadow: '0 2px 6px rgba(123,97,255,0.06)',
                            animation: `chipFadeIn 0.2s ease-out ${i * 0.06}s forwards`,
                            opacity: 0,
                          }}
                        >
                          → {faq.question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2 mb-3" style={{ animation: 'messageSlideIn 0.3s ease-out' }}>
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: 30, height: 30,
                background: 'radial-gradient(circle at 35% 30%, #b89dff 0%, #7B61FF 50%, #4FACFE 100%)',
              }}
            >
              <span style={{ fontSize: 14 }}></span>
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(123,97,255,0.12)',
                boxShadow: '0 2px 12px rgba(123,97,255,0.08)',
              }}
            >
              {[0, 1, 2].map(i => (
                <div
                  key={`dot-${i}`}
                  className="rounded-full"
                  style={{
                    width: 7, height: 7,
                    background: '#7B61FF',
                    animation: `typingDot 1.2s ease-in-out infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: 4 }} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            bottom: 120,
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(123,97,255,0.2)',
            boxShadow: '0 4px 16px rgba(123,97,255,0.15)',
          }}
          aria-label="Scroll to bottom"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      )}

      {/* Input area */}
      <div
        className="flex-shrink-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(123,97,255,0.1)',
          boxShadow: '0 -4px 24px rgba(123,97,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Dynamic suggestions row */}
        {suggestions.length > 0 && (
          <div
            className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar"
            style={{ borderBottom: '1px solid rgba(123,97,255,0.06)' }}
          >
            {suggestions.map((faq, i) => (
              <button
                key={`dyn-${faq.id}-${i}`}
                onClick={() => handleSuggestionClick(faq)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                style={{
                  background: 'rgba(123,97,255,0.08)',
                  border: '1px solid rgba(123,97,255,0.2)',
                  color: '#7B61FF',
                  animation: `chipFadeIn 0.2s ease-out ${i * 0.05}s forwards`,
                  opacity: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {faq.question}
              </button>
            ))}
          </div>
        )}

        {/* Quick action chips */}
        {suggestions.length === 0 && (
          <div className="px-4 pt-2 pb-1 flex gap-2 overflow-x-auto no-scrollbar">
            {quickSuggestions.map((chip) => (
              <button
                key={`quick-${chip}`}
                onClick={() => handleChipClick(chip.replace(/^[^\s]+\s/, ''))}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(123,97,255,0.18)',
                  color: '#4a2db5',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div
            className="flex-1 flex items-center rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(123,97,255,0.05)',
              border: '1.5px solid rgba(123,97,255,0.2)',
              transition: 'border-color 0.2s',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about hostel, mess, fees..."
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              style={{
                color: '#1a0533',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
              aria-label="Type your question"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={isTyping}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-50"
            style={{
              background: inputValue.trim()
                ? 'linear-gradient(135deg, #7B61FF, #4FACFE)'
                : 'rgba(123,97,255,0.15)',
              boxShadow: inputValue.trim() ? '0 4px 16px rgba(123,97,255,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={inputValue.trim() ? '#fff' : '#7B61FF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes messageSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chipFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbBreatheSm {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes orbPulseReply {
          0% { transform: scale(1); }
          40% { transform: scale(1.18); }
          70% { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-scroll::-webkit-scrollbar { width: 3px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: rgba(123,97,255,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
