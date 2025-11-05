/**
 * Summary Section
 * Professional summary textarea
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SummarySchema, type Summary } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect, useState, useRef } from 'react';

export default function SummarySection() {
  const { formData, updateFormData } = useResumeForm();
  const [charCount, setCharCount] = useState(0);
  const isInitialLoadRef = useRef(true); // Track if this is initial data load

  const {
    register,
    formState: { errors },
    setValue,
    getValues,
    watch,
  } = useForm<Summary>({
    resolver: zodResolver(SummarySchema),
    defaultValues: formData.summary || { content: '' },
  });

  const summaryContent = watch('content');

  useEffect(() => {
    setCharCount(summaryContent?.length || 0);
  }, [summaryContent]);

  // Update form when data loads from API (only once)
  useEffect(() => {
    if (formData.summary && formData.summary.content) {
      // Existing resume - populate form
      setValue('content', formData.summary.content);
      // Mark as loaded after a small delay (to let setValue complete)
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    } else {
      // New resume - enable immediate updates
      isInitialLoadRef.current = false;
    }
  }, []); // Only run once on mount

  // Handle field change - update context immediately
  const handleFieldChange = () => {
    // Skip update during initial data load
    if (isInitialLoadRef.current) return;

    // Update context with current form values
    const currentValues = getValues();
    updateFormData('summary', currentValues);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
        <p className="text-gray-600">A brief overview of your experience and skills</p>
      </div>

      <form className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Summary Textarea */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content', { onChange: handleFieldChange })}
            id="content"
            rows={8}
            placeholder="Write a compelling summary of your professional background, key skills, and career achievements. Aim for 250-500 characters."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />

          {/* Character Count */}
          <div className="flex justify-between items-center mt-2">
            {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
            <div className="ml-auto">
              <span
                className={`text-sm ${
                  charCount < 50
                    ? 'text-orange-600'
                    : charCount > 1000
                      ? 'text-red-600'
                      : charCount >= 250 && charCount <= 500
                        ? 'text-green-600'
                        : 'text-gray-600'
                }`}
              >
                {charCount} / 1000 characters
                {charCount >= 250 && charCount <= 500 && ' ✓ Optimal'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> A strong professional summary is between 250-500 characters.
            Focus on your key achievements, skills, and what makes you unique.
          </p>
        </div>

        {/* Example Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-700 mb-2">Example:</p>
          <p className="text-sm text-gray-600 italic">
            &quot;Experienced Full-Stack Developer with 6+ years of expertise in building scalable
            web applications. Proficient in React, Node.js, and cloud technologies. Proven track
            record of delivering high-quality software solutions and leading technical teams.&quot;
          </p>
        </div>
      </form>
    </div>
  );
}
