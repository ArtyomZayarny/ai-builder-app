/**
 * Resume Editor Page (Placeholder)
 * Will be implemented in next tasks
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <FileText size={64} className="mx-auto text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Editor</h2>
        <p className="text-gray-600 mb-2">
          Editing Resume ID: <span className="font-mono font-semibold">{id}</span>
        </p>
        <p className="text-gray-500 mb-6">Resume editor will be implemented next! 🚀</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
