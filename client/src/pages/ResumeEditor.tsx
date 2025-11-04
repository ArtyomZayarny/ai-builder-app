/**
 * Resume Editor Page
 * Live editing with preview - creates record on first save
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Save } from 'lucide-react';

export default function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNewResume = id === 'new';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <FileText size={64} className="mx-auto text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isNewResume ? 'Create New Resume' : 'Edit Resume'}
        </h2>
        <p className="text-gray-600 mb-2">
          {isNewResume ? (
            <>
              <span className="font-semibold">Live editing mode</span>
              <br />
              Fill in your details and click Save to create
            </>
          ) : (
            <>
              Editing Resume ID: <span className="font-mono font-semibold">{id}</span>
            </>
          )}
        </p>
        <p className="text-gray-500 mb-6">
          {isNewResume
            ? '✨ No database record yet - will be created on Save'
            : 'Resume editor will be implemented next! 🚀'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          {isNewResume && (
            <button
              disabled
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed font-medium"
            >
              <Save size={20} />
              Save Resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
