/**
 * PDF Upload Modal
 * Component for uploading and parsing PDF resumes
 */

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { parsePDFResume, type ParsedResumeData } from '../services/pdfApi';
import { toast } from 'sonner';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ParsedResumeData) => void;
}

export default function PDFUploadModal({ isOpen, onClose, onImport }: PDFUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParsedData(null);
  };

  const handleParse = async () => {
    if (!file) return;

    setIsParsing(true);
    setError(null);

    try {
      const data = await parsePDFResume(file);
      setParsedData(data);
      toast.success('PDF parsed successfully!', {
        description: `Confidence: ${Math.round(data.confidence * 100)}%`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse PDF';
      setError(errorMessage);
      toast.error('Failed to parse PDF', {
        description: errorMessage,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (parsedData) {
      onImport(parsedData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Upload PDF Resume</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select PDF File (max 10MB)
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileText size={48} className="text-blue-600 mx-auto" />
                  <p className="text-gray-900 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={48} className="text-gray-400 mx-auto" />
                  <p className="text-gray-600">Click to select or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF files only, max 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Parse Button */}
          {file && !parsedData && (
            <button
              onClick={handleParse}
              disabled={isParsing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Parsing PDF...
                </>
              ) : (
                <>
                  <FileText size={20} className="mr-2" />
                  Parse PDF
                </>
              )}
            </button>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">PDF Parsed Successfully</p>
                  <p className="text-sm text-green-600">
                    Confidence: {Math.round(parsedData.confidence * 100)}% • Review and edit the
                    extracted data below
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {parsedData.personalInfo && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Info</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      {parsedData.personalInfo.name && <p>Name: {parsedData.personalInfo.name}</p>}
                      {parsedData.personalInfo.email && (
                        <p>Email: {parsedData.personalInfo.email}</p>
                      )}
                      {parsedData.personalInfo.phone && (
                        <p>Phone: {parsedData.personalInfo.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {parsedData.experiences && parsedData.experiences.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Experience ({parsedData.experiences.length})
                    </h3>
                    <div className="text-sm text-gray-600">
                      {parsedData.experiences.slice(0, 3).map((exp, idx) => (
                        <p key={idx}>
                          {exp.role} at {exp.company}
                        </p>
                      ))}
                      {parsedData.experiences.length > 3 && (
                        <p className="text-gray-500">
                          ...and {parsedData.experiences.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {parsedData.education && parsedData.education.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Education ({parsedData.education.length})
                    </h3>
                    <div className="text-sm text-gray-600">
                      {parsedData.education.map((edu, idx) => (
                        <p key={idx}>
                          {edu.degree} {edu.field ? `in ${edu.field}` : ''} - {edu.institution}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {parsedData.skills && parsedData.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Skills ({parsedData.skills.length} categories)
                    </h3>
                    <div className="text-sm text-gray-600">
                      {parsedData.skills.slice(0, 10).map((skill, idx) => (
                        <p key={idx}>
                          {skill.category ? `${skill.category}: ` : ''}
                          {skill.name}
                        </p>
                      ))}
                      {parsedData.skills.length > 10 && (
                        <p className="text-gray-500">...and {parsedData.skills.length - 10} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Import Button */}
              <button onClick={handleImport} className="w-full btn-primary">
                Import to Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
