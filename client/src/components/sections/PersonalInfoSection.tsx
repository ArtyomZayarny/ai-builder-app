/**
 * Personal Info Section
 * Form for basic contact details
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoSchema, type PersonalInfo } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect, useRef } from 'react';
import ProfilePhotoUpload from '../ProfilePhotoUpload';

export default function PersonalInfoSection() {
  const { formData, updateFormData } = useResumeForm();
  const isInitialLoadRef = useRef(true); // Track if this is initial data load

  const {
    register,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: formData.personalInfo || {},
  });

  // Update form when data loads from API (only once)
  useEffect(() => {
    if (formData.personalInfo && Object.keys(formData.personalInfo).length > 0) {
      // Existing resume - populate form
      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        setValue(key as keyof PersonalInfo, value);
      });
      // Mark as loaded after a small delay (to let setValue complete)
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    } else {
      // New resume - enable immediate updates
      isInitialLoadRef.current = false;
    }
  }, []); // Only run once on mount

  // Handle field change - update context with all form data
  const handleFieldChange = () => {
    // Skip update during initial data load
    if (isInitialLoadRef.current) return;

    // Update context with current form values
    const currentValues = getValues();
    updateFormData('personalInfo', currentValues);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Your basic contact details and professional identity</p>
      </div>

      <form className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Profile Photo Upload */}
        <ProfilePhotoUpload
          currentPhotoUrl={formData.personalInfo?.photoUrl}
          onPhotoUploaded={url => {
            const currentValues = getValues();
            updateFormData('personalInfo', { ...currentValues, photoUrl: url });
          }}
          onPhotoRemoved={() => {
            const currentValues = getValues();
            updateFormData('personalInfo', { ...currentValues, photoUrl: '' });
          }}
        />

        {/* Name (Required) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name', { onChange: handleFieldChange })}
            type="text"
            id="name"
            placeholder="John Doe"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        {/* Professional Title (Required) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Professional Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('role', { onChange: handleFieldChange })}
            type="text"
            id="role"
            placeholder="Senior Full-Stack Developer"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
        </div>

        {/* Email (Required) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email', { onChange: handleFieldChange })}
            type="email"
            id="email"
            placeholder="john.doe@example.com"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Phone (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            {...register('phone', { onChange: handleFieldChange })}
            type="tel"
            id="phone"
            placeholder="+1 (555) 123-4567"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Location (Optional) */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            {...register('location', { onChange: handleFieldChange })}
            type="text"
            id="location"
            placeholder="San Francisco, CA"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.location ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* LinkedIn URL (Optional) */}
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn URL
          </label>
          <input
            {...register('linkedinUrl', { onChange: handleFieldChange })}
            type="url"
            id="linkedinUrl"
            placeholder="https://linkedin.com/in/johndoe"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.linkedinUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.linkedinUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.linkedinUrl.message}</p>
          )}
        </div>

        {/* Portfolio URL (Optional) */}
        <div>
          <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio / Website
          </label>
          <input
            {...register('portfolioUrl', { onChange: handleFieldChange })}
            type="url"
            id="portfolioUrl"
            placeholder="https://johndoe.dev"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.portfolioUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl.message}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Fields marked with <span className="text-red-500">*</span> are
            required. All changes are automatically tracked for saving.
          </p>
        </div>
      </form>
    </div>
  );
}
