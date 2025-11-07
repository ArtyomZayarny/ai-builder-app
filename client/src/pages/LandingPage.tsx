/**
 * Landing Page
 * Main marketing page for the AI Resume Builder
 */

import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Download, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

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
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">resume</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium">
                Features
              </a>
              <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium">
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get started
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Land your dream job with <span className="text-blue-600">AI-Powered resumes.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Create, Edit and download professional resumes with AI-powered assistance.
            </p>

            {/* CTA Button */}
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get started <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Build your resume</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create Professional resumes in minutes and get hired using AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Placeholder */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-white p-8 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-32 h-32 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-500">Resume Builder Preview</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Analytics</h3>
                    <p className="text-gray-600">
                      Get instant insights into your resume performance with live dashboards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Bank-Grade Security</h3>
                    <p className="text-gray-600">
                      End-to-end encryption, 2FA, compliance with GDPR standards.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Customizable Reports</h3>
                    <p className="text-gray-600">
                      Export professional, audit-ready resume reports for job applications or
                      internal review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        ></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Build a professional Resume that helps you stand out in the crowd and get hired.
          </h2>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">Have questions? We'd love to hear from you.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href="mailto:support@resumebuilder.com"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>support@resumebuilder.com</span>
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>+1 (234) 567-890</span>
            </a>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo */}
            <div>
              <Link to="/" className="flex items-center gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-900">resume</span>
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              </Link>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#home" className="text-gray-600 hover:text-gray-900">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-gray-600 hover:text-gray-900">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Affiliate
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Company
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Blogs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Careers
                  </a>
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                    We're hiring!
                  </span>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-blue-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              Making every customer feel valued— no matter the size of your audience.
            </p>
            <p className="text-gray-600 text-sm">© 2025 Resume Builder</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
