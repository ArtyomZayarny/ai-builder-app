/**
 * Landing Page
 * Main marketing page for the AI Resume Builder
 */

import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Wand2, Palette, Download, Save, Sparkles, Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroResumeMockup from '../components/landing/HeroResumeMockup';

function FadeInOnScroll({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Content Enhancement',
    description:
      'Let AI improve your bullet points, suggest stronger action verbs, and optimize your resume for your target role.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Palette,
    title: '4 Professional Templates',
    description:
      'Choose from Classic, Modern, Creative, or Technical designs. All ATS-friendly and optimized for PDF.',
    color: 'bg-blue-50/70 text-blue-700',
  },
  {
    icon: Download,
    title: 'One-Click PDF Export',
    description:
      'Download a polished, print-ready PDF of your resume. What you see is exactly what you get.',
    color: 'bg-blue-50/50 text-blue-500',
  },
  {
    icon: Save,
    title: 'Auto-Save',
    description: 'Never lose your progress. Every change is saved automatically as you type.',
    color: 'bg-slate-50 text-blue-600',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Create',
    description: 'Sign up and start filling in your details. Choose from 4 professional templates.',
  },
  {
    number: '2',
    title: 'Enhance with AI',
    description:
      'Let Gemini AI improve your content, strengthen bullet points, and tailor your resume.',
  },
  {
    number: '3',
    title: 'Download PDF',
    description: 'Export a polished PDF ready to send to employers. Or share it via a public link.',
  },
];

const TEMPLATES = [
  {
    name: 'Classic',
    badge: 'Recommended',
    description: 'Professional ATS-friendly design',
    accentColor: 'bg-blue-500',
    layout: 'standard',
  },
  {
    name: 'Modern',
    badge: null,
    description: 'Clean minimalist layout',
    accentColor: 'bg-gray-800',
    layout: 'centered',
  },
  {
    name: 'Creative',
    badge: null,
    description: 'Design-forward with unique styling',
    accentColor: 'bg-purple-500',
    layout: 'sidebar',
  },
  {
    name: 'Technical',
    badge: null,
    description: 'Emphasizes skills and projects',
    accentColor: 'bg-gray-900',
    layout: 'dark-header',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">resume</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                How It Works
              </a>
              <a
                href="#templates"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Templates
              </a>
            </div>

            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
              )}
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl opacity-[0.07]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-300 rounded-full blur-3xl opacity-[0.07]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Powered by Gemini AI
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Build a resume that <span className="text-blue-600">gets you hired</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-gray-600 mb-8 max-w-lg"
              >
                AI-powered content enhancement, professional templates, and instant PDF export.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Start Building — Free <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  See how it works &darr;
                </a>
              </motion.div>
            </div>

            {/* Right — mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <HeroResumeMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to stand out
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI-powered writing to professional templates — build the perfect resume in
              minutes.
            </p>
          </FadeInOnScroll>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <FadeInOnScroll key={feature.title} delay={i * 0.1}>
                <div className="card-hover p-6 h-full">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to a professional resume.
            </p>
          </FadeInOnScroll>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed connector line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px border-t-2 border-dashed border-gray-300" />

            {STEPS.map((step, i) => (
              <FadeInOnScroll key={step.title} delay={i * 0.15} className="relative text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm mb-4 relative z-10">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Showcase */}
      <section id="templates" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Pick your template
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four professionally designed templates. All ATS-friendly.
            </p>
          </FadeInOnScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template, i) => (
              <FadeInOnScroll key={template.name} delay={i * 0.1}>
                <div className="card-hover p-4 h-full">
                  {/* Mini preview */}
                  <TemplatePreview layout={template.layout} accentColor={template.accentColor} />

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      {template.badge && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {template.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{template.description}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl opacity-[0.07]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        </div>
        <FadeInOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Start building your resume today
            </h2>
            <p className="text-gray-600 mb-8">Free to use. No credit card required.</p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </FadeInOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-lg font-bold text-gray-900">resume</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          </Link>

          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span>Built by Artem Zaiarnyi</span>
            <span className="text-gray-300">|</span>
            <a
              href="https://github.com/ArtemZaiworker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-gray-400">&copy; 2025 Resume Builder</p>
        </div>
      </footer>
    </div>
  );
}

/** Decorative mini-resume skeleton for template cards */
function TemplatePreview({ layout, accentColor }: { layout: string; accentColor: string }) {
  const barBase = 'rounded-sm';

  if (layout === 'sidebar') {
    return (
      <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden flex">
        <div className={`w-1/3 ${accentColor} opacity-20`} />
        <div className="flex-1 p-3 space-y-2">
          <div className={`h-2 w-12 ${accentColor} opacity-40 ${barBase}`} />
          <div className={`h-1.5 w-full bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-4/5 bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-full bg-gray-200 ${barBase} mt-3`} />
          <div className={`h-1.5 w-3/4 bg-gray-200 ${barBase}`} />
        </div>
      </div>
    );
  }

  if (layout === 'centered') {
    return (
      <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden p-3 flex flex-col items-center">
        <div className={`h-2.5 w-16 ${accentColor} opacity-30 ${barBase} mb-1`} />
        <div className={`h-1.5 w-12 bg-gray-200 ${barBase} mb-3`} />
        <div className="w-full space-y-2">
          <div className={`h-1.5 w-full bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-5/6 bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-full bg-gray-200 ${barBase} mt-2`} />
          <div className={`h-1.5 w-3/4 bg-gray-200 ${barBase}`} />
        </div>
      </div>
    );
  }

  if (layout === 'dark-header') {
    return (
      <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
        <div className={`${accentColor} p-3 space-y-1`}>
          <div className={`h-2 w-14 bg-white/40 ${barBase}`} />
          <div className={`h-1.5 w-10 bg-white/25 ${barBase}`} />
        </div>
        <div className="p-3 space-y-2">
          <div className={`h-1.5 w-full bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-5/6 bg-gray-200 ${barBase}`} />
          <div className={`h-1.5 w-full bg-gray-200 ${barBase} mt-2`} />
          <div className={`h-1.5 w-4/5 bg-gray-200 ${barBase}`} />
        </div>
      </div>
    );
  }

  // standard (Classic)
  return (
    <div className="aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
      <div className={`h-1 ${accentColor}`} />
      <div className="p-3 space-y-2">
        <div className={`h-2.5 w-16 ${accentColor} opacity-30 ${barBase}`} />
        <div className={`h-1.5 w-12 bg-gray-200 ${barBase}`} />
        <div className={`h-1.5 w-full bg-gray-200 ${barBase} mt-2`} />
        <div className={`h-1.5 w-5/6 bg-gray-200 ${barBase}`} />
        <div className={`h-1.5 w-full bg-gray-200 ${barBase} mt-2`} />
        <div className={`h-1.5 w-3/4 bg-gray-200 ${barBase}`} />
      </div>
    </div>
  );
}
