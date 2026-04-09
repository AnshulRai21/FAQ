'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUICK_CHIPS } from '@/lib/faqData';

const FLOATING_QUESTIONS = [
  'Mess timings?',
  'WiFi not working?',
  'Leave permission?',
  'Hostel fees?',
  'Room facilities?',
  'Emergency contact?',
  'Study hours?',
  'Medical facility?',
  'Maintenance issue?',
  'Night out rules?',
];

export default function LandingPage() {
  const router = useRouter();
  const orbRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [orbPulsing, setOrbPulsing] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [floatingIndex, setFloatingIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; size: number; delay: number }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate particles
    const p = Array.from({ length: 6 }, (_, i) => ({
      id: `particle-${i}`,
      x: 30 + Math.sin(i * 60 * Math.PI / 180) * 80,
      y: 30 + Math.cos(i * 60 * Math.PI / 180) * 80,
      size: 4 + (i % 3) * 2,
      delay: i * 0.4,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingIndex(prev => (prev + 1) % FLOATING_QUESTIONS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Orb parallax on desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      orbRef.current.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartChat = () => {
    setOrbPulsing(true);
    setTimeout(() => {
      router.push('/chat-screen');
    }, 400);
  };

  const handleChipClick = (chip: { label: string; query: string }) => {
    setActiveChip(chip.label);
    setOrbPulsing(true);
    setTimeout(() => {
      router.push(`/chat-screen?q=${encodeURIComponent(chip.query)}`);
    }, 350);
  };

  const handleOrbClick = () => {
    setOrbPulsing(true);
    setTimeout(() => setOrbPulsing(false), 700);
  };

  const handleAdminClick = () => {
    router.push('/admin-panel');
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #f8f4ff 0%, #eef4ff 40%, #f4f0ff 70%, #e8f4ff 100%)',
      }}
    >
      {/* Background decorative blobs */}
      <div
        className="absolute top-[-10%] left-[-5%] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-5%] right-[-5%] w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,172,254,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute top-[40%] right-[-10%] w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,111,216,0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Admin button — top right corner */}
      <button
        onClick={handleAdminClick}
        className="absolute top-4 right-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(123,97,255,0.2)',
          boxShadow: '0 2px 12px rgba(123,97,255,0.1)',
        }}
        title="Admin Panel"
        aria-label="Open admin panel"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
        </svg>
      </button>

      {/* Main content */}
      <div className="flex flex-col items-center px-6 w-full max-w-sm mx-auto" style={{ paddingTop: '24px', paddingBottom: '40px' }}>

        {/* University badge */}
        <div
          className="mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide animate-fade-in-up"
          style={{
            background: 'rgba(123,97,255,0.08)',
            border: '1px solid rgba(123,97,255,0.2)',
            color: '#7B61FF',
            animationDelay: '0.1s',
            opacity: 0,
          }}
        >
          GITAM University · Hostel Services
        </div>

        {/* Animated Orb */}
        <div
          className="relative flex items-center justify-center mb-8 cursor-pointer"
          style={{ width: 200, height: 200 }}
          onClick={handleOrbClick}
        >
          {/* Floating question bubble */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{ top: -8, left: '50%', transform: 'translateX(-50%)', minWidth: 140 }}
          >
            <div
              key={`fq-${floatingIndex}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-center"
              style={{
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(123,97,255,0.2)',
                color: '#5B4FD4',
                boxShadow: '0 4px 16px rgba(123,97,255,0.12)',
                animation: 'fadeInUp 0.4s ease-out',
                whiteSpace: 'nowrap',
              }}
            >
              {FLOATING_QUESTIONS[floatingIndex]}
            </div>
          </div>

          {/* Ripple rings */}
          {mounted && (
            <>
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 200, height: 200,
                  border: '1px solid rgba(123,97,255,0.15)',
                  animation: 'orbRipple 3s ease-out infinite',
                }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 200, height: 200,
                  border: '1px solid rgba(255,111,216,0.1)',
                  animation: 'orbRipple 3s ease-out infinite 1s',
                }}
              />
            </>
          )}

          {/* Outer glow ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 168, height: 168,
              background: 'radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%)',
              filter: 'blur(16px)',
            }}
          />

          {/* Orb wrapper with float animation */}
          <div
            ref={orbRef}
            className={`relative rounded-full cursor-pointer select-none ${orbPulsing ? 'animate-orb-pulse-reply' : 'animate-orb-float'}`}
            style={{ width: 148, height: 148, transition: 'transform 0.1s ease' }}
          >
            {/* Main orb */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #b89dff 0%, #7B61FF 35%, #5b3fe0 60%, #4FACFE 85%, #2d8fe8 100%)',
                boxShadow: `
                  0 0 50px rgba(123,97,255,0.5),
                  0 0 100px rgba(255,111,216,0.25),
                  0 0 150px rgba(79,172,254,0.2),
                  inset 0 -20px 40px rgba(0,0,0,0.15),
                  inset 0 10px 30px rgba(255,255,255,0.2)
                `,
              }}
            />

            {/* Inner highlight */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: '12%', left: '18%',
                width: '42%', height: '32%',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />

            {/* Pink accent streak */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                bottom: '20%', right: '15%',
                width: '30%', height: '20%',
                background: 'radial-gradient(ellipse, rgba(255,111,216,0.5) 0%, transparent 70%)',
                filter: 'blur(6px)',
              }}
            />

            {/* Center icon */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ fontSize: 42 }}
            >
              🎓
            </div>

            {/* Particles around orb */}
            {mounted && particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size, height: p.size,
                  left: `${p.x}%`, top: `${p.y}%`,
                  background: 'linear-gradient(135deg, #7B61FF, #FF6FD8)',
                  opacity: 0.6,
                  animation: `particleFloat ${2.5 + p.delay}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                  '--tx': `${(p.x - 50) * 0.4}px`,
                  '--ty': `${(p.y - 50) * 0.4}px`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-bold text-center mb-2 animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, #4a2db5 0%, #7B61FF 40%, #4FACFE 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animationDelay: '0.2s',
            opacity: 0,
          }}
        >
          GITAM Hostel Assistant
        </h1>

        <p
          className="text-sm text-center mb-8 animate-fade-in-up"
          style={{
            color: '#6B7280',
            lineHeight: 1.6,
            animationDelay: '0.3s',
            opacity: 0,
          }}
        >
          Ask anything about hostel, fees, or campus life
        </p>

        {/* Start Chat Button */}
        <button
          onClick={handleStartChat}
          className="w-full py-3.5 rounded-2xl text-white font-semibold text-base mb-6 btn-primary animate-fade-in-up"
          style={{
            animationDelay: '0.4s',
            opacity: 0,
            letterSpacing: '0.01em',
          }}
        >
          Start Chat →
        </button>

        {/* Quick action chips */}
        <div
          className="w-full animate-fade-in-up"
          style={{ animationDelay: '0.5s', opacity: 0 }}
        >
          <p className="text-xs font-semibold text-center mb-3" style={{ color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Quick Questions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={`chip-${chip.label}`}
                onClick={() => handleChipClick(chip)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium text-left transition-all duration-200 active:scale-95 ${
                  activeChip === chip.label ? 'scale-95' : ''
                }`}
                style={{
                  background: activeChip === chip.label
                    ? 'linear-gradient(135deg, rgba(123,97,255,0.2), rgba(79,172,254,0.2))'
                    : 'rgba(255,255,255,0.85)',
                  border: `1px solid ${activeChip === chip.label ? 'rgba(123,97,255,0.4)' : 'rgba(123,97,255,0.15)'}`,
                  color: '#4a2db5',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(123,97,255,0.08)',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p
          className="mt-6 text-xs text-center animate-fade-in-up"
          style={{ color: '#B0B8C8', animationDelay: '0.7s', opacity: 0 }}
        >
          Available 24/7 · Powered by GITAM Hostel Services
        </p>
      </div>

      <style>{`
        @keyframes orbRipple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50% { transform: translate(var(--tx, 8px), var(--ty, -8px)) scale(0.7); opacity: 0.3; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          33% { transform: translateY(-12px) scale(1.02); }
          66% { transform: translateY(-6px) scale(0.99); }
        }
        @keyframes orbBreathe {
          0%, 100% { box-shadow: 0 0 50px rgba(123,97,255,0.4), 0 0 100px rgba(255,111,216,0.2); }
          50% { box-shadow: 0 0 70px rgba(123,97,255,0.6), 0 0 130px rgba(255,111,216,0.35); }
        }
        @keyframes orbPulseReply {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        .animate-orb-float {
          animation: orbFloat 5s ease-in-out infinite, orbBreathe 4s ease-in-out infinite;
        }
        .animate-orb-pulse-reply {
          animation: orbPulseReply 0.5s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .btn-primary {
          background: linear-gradient(135deg, #7B61FF 0%, #9B7FFF 50%, #4FACFE 100%);
          box-shadow: 0 8px 28px rgba(123,97,255,0.35);
          transition: all 0.2s ease;
        }
        .btn-primary:active {
          transform: scale(0.97);
          box-shadow: 0 4px 14px rgba(123,97,255,0.25);
        }
      `}</style>
    </div>
  );
}
