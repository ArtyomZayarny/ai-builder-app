/**
 * Resume Editor Layout
 * Main layout with sidebar navigation, content area, and optional preview panel
 * Auto-saves changes - no manual save button needed!
 */

import { ReactNode, useState } from 'react';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  ArrowLeft,
  Menu,
  X,
  Eye,
  EyeOff,
  Download,
  Check,
  Palette,
} from 'lucide-react';
import SaveStatusIndicator from './SaveStatusIndicator';
import type { SaveStatus } from '../contexts/ResumeFormContext';

interface ResumeEditorLayoutProps {
  children: ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  showPreview?: boolean;
  onTogglePreview?: () => void;
  previewPanel?: ReactNode;
  isCreateEnabled?: boolean;
  onCreate?: () => void;
  isNewResume?: boolean;
  resumeId?: string | null;
  onDownloadPDF?: () => void;
  onDashboardClick?: () => void;
  saveStatus?: SaveStatus;
  isDirty?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof User;
}

const navigationItems: NavItem[] = [
  { id: 'personal-info', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'template', label: 'Template', icon: Palette },
];

export default function ResumeEditorLayout({
  children,
  currentSection,
  onSectionChange,
  showPreview = false,
  onTogglePreview,
  previewPanel,
  isCreateEnabled = false,
  onCreate,
  isNewResume = false,
  resumeId,
  onDownloadPDF,
  onDashboardClick,
  saveStatus = 'idle',
  isDirty = false,
}: ResumeEditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Back Button */}
            <button
              onClick={onDashboardClick || (() => (window.location.href = '/'))}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Resume Status */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                {isNewResume ? 'New Resume' : `Resume #${resumeId}`}
              </span>
              {isNewResume && (
                <span className="text-gray-400 font-medium">• Fill required fields to create</span>
              )}
            </div>
          </div>

          {/* Save Status Indicator */}
          {!isNewResume && (
            <div className="flex items-center">
              <SaveStatusIndicator status={saveStatus} isDirty={isDirty} />
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Create Button (only for new resumes) */}
            {isNewResume && onCreate && (
              <button
                onClick={onCreate}
                disabled={!isCreateEnabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCreateEnabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title={
                  !isCreateEnabled
                    ? 'Please fill Name, Role, and Email to create resume'
                    : 'Create resume in database'
                }
              >
                <Check size={20} />
                <span>Create</span>
              </button>
            )}

            {/* Download PDF Button (only for existing resumes) */}
            {onDownloadPDF && !isNewResume && (
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-medium"
                title="Download as PDF"
              >
                <Download size={20} />
                <span className="hidden sm:inline">PDF</span>
              </button>
            )}

            {/* Preview Toggle (Desktop only) */}
            {onTogglePreview && (
              <button
                onClick={onTogglePreview}
                className="hidden lg:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                <span className="hidden xl:inline">
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Status Bar */}
        {isNewResume && (
          <div className="md:hidden px-4 pb-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-400">Fill required fields to create</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          <nav className="p-4 space-y-1 mt-16 lg:mt-0">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors font-medium text-left
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${showPreview ? 'lg:w-1/2' : 'lg:w-full'}`}>
          <div className="max-w-3xl mx-auto p-4 lg:p-8">{children}</div>
        </main>

        {/* Preview Panel (Desktop only) */}
        {showPreview && previewPanel && (
          <aside className="hidden lg:block w-1/2 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <h3 className="font-semibold text-gray-900">Live Preview</h3>
            </div>
            <div className="p-6">{previewPanel}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
