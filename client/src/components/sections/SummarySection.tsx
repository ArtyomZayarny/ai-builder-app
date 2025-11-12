/**
 * Summary Section
 * Professional summary textarea
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SummarySchema, type Summary } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { enhanceSummary } from '../../services/aiApi';
import { toast } from 'sonner';

export default function SummarySection() {
  const { formData, updateFormData } = useResumeForm();
  const [charCount, setCharCount] = useState(0);
  const [isEnhancing, setIsEnhancing] = useState(false);
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

  // Update form when data loads from API or when imported from PDF
  useEffect(() => {
    if (formData.summary && formData.summary.content) {
      // Check if form value differs from context data (to avoid unnecessary updates)
      const currentFormValue = getValues('content');
      if (currentFormValue !== formData.summary.content || isInitialLoadRef.current) {
        // Existing resume or imported data - populate form
        setValue('content', formData.summary.content);
        // Mark as loaded after a small delay (to let setValue complete)
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 100);
      }
    } else {
      // New resume - enable immediate updates
      isInitialLoadRef.current = false;
    }
  }, [formData.summary, setValue, getValues]); // React to context changes

  // Handle field change - update context immediately
  const handleFieldChange = () => {
    // Skip update during initial data load
    if (isInitialLoadRef.current) return;

    // Update context with current form values
    const currentValues = getValues();
    updateFormData('summary', currentValues);
  };

  // Handle AI Enhancement
  const handleAIEnhance = async () => {
    const currentContent = getValues('content');

    if (!currentContent || currentContent.trim().length === 0) {
      toast.error('Please write something first', {
        description: 'Add some content to enhance it with AI',
      });
      return;
    }

    if (currentContent.trim().length < 20) {
      toast.error('Content too short', {
        description: 'Please write at least 20 characters for AI to enhance',
      });
      return;
    }

    setIsEnhancing(true);
    const enhanceToast = toast.loading('AI is enhancing your summary...', {
      description: 'This may take a few seconds',
    });

    try {
      const enhanced = await enhanceSummary(currentContent);

      // Show success toast
      toast.success('Summary enhanced! ✨', {
        id: enhanceToast,
        description: 'Review the AI-enhanced version',
      });

      // Update the form with enhanced content
      setValue('content', enhanced);
      handleFieldChange();
    } catch (error) {
      console.error('AI Enhancement error:', error);
      toast.error('Enhancement failed', {
        id: enhanceToast,
        description: error instanceof Error ? error.message : 'Failed to enhance summary',
      });
    } finally {
      setIsEnhancing(false);
    }
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
            Professional Summary
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

          {/* AI Enhance Button & Character Count */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              {errors.content && <p className="text-sm text-red-600">{errors.content.message}</p>}
              <button
                type="button"
                onClick={handleAIEnhance}
                disabled={isEnhancing || !summaryContent || summaryContent.trim().length < 20}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Enhance with AI"
              >
                <Sparkles size={16} className={isEnhancing ? 'animate-spin' : ''} />
                {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </button>
            </div>
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
