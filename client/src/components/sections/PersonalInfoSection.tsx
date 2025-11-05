/**
 * Personal Info Section
 * Form for basic contact details
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoSchema, type PersonalInfo } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';

export default function PersonalInfoSection() {
  const { formData, updateFormData } = useResumeForm();

  const {
    register,
    formState: { errors },
    setValue,
  } = useForm<PersonalInfo>({
    resolver: zodResolver(PersonalInfoSchema),
    defaultValues: formData.personalInfo || {},
  });

  // Update form when data loads from API
  useEffect(() => {
    if (formData.personalInfo) {
      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        setValue(key as keyof PersonalInfo, value);
      });
    }
  }, [formData.personalInfo, setValue]);

  const onFieldChange = (field: keyof PersonalInfo, value: string) => {
    updateFormData('personalInfo', {
      ...formData.personalInfo,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Your basic contact details and professional identity</p>
      </div>

      <form className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Name (Required) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name', {
              onChange: e => onFieldChange('name', e.target.value),
            })}
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
            {...register('role', {
              onChange: e => onFieldChange('role', e.target.value),
            })}
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
            {...register('email', {
              onChange: e => onFieldChange('email', e.target.value),
            })}
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
            {...register('phone', {
              onChange: e => onFieldChange('phone', e.target.value),
            })}
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
            {...register('location', {
              onChange: e => onFieldChange('location', e.target.value),
            })}
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
            {...register('linkedinUrl', {
              onChange: e => onFieldChange('linkedinUrl', e.target.value),
            })}
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
            {...register('portfolioUrl', {
              onChange: e => onFieldChange('portfolioUrl', e.target.value),
            })}
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
