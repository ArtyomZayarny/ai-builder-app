/**
 * Work Experience Section - FIXED
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Experience } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';

// Array schema for form
const FormSchema = z.object({
  experiences: z.array(
    z.object({
      id: z.number().optional(),
      company: z.string(),
      role: z.string(),
      location: z.string().optional(),
      startDate: z.string(),
      endDate: z.string().optional().nullable(),
      isCurrent: z.boolean(),
      description: z.string(),
      order: z.number().optional(),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

export default function ExperienceSection() {
  const { formData, updateFormData } = useResumeForm();

  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      experiences: formData.experiences || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experiences',
  });

  const watchedExperiences = watch('experiences');

  // Load data from API only once on mount
  useEffect(() => {
    if (formData.experiences && formData.experiences.length > 0) {
      setValue('experiences', formData.experiences as any);
    }
  }, []); // Only run once

  useEffect(() => {
    if (watchedExperiences && watchedExperiences.length > 0) {
      updateFormData('experiences', watchedExperiences as Experience[]);
    }
  }, [watchedExperiences, updateFormData]);

  const handleAdd = () => {
    append({
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      order: fields.length,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
        <p className="text-gray-600">Highlight your professional experience</p>
      </div>

      {fields.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No work experience added yet</h3>
          <p className="text-gray-600 mb-4">Add your first position</p>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Position
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Position {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    {...register(`experiences.${index}.company`)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Google"
                  />
                  {errors.experiences?.[index]?.company && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.experiences[index]?.company?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    {...register(`experiences.${index}.role`)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Senior Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    {...register(`experiences.${index}.location`)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    {...register(`experiences.${index}.startDate`)}
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      {...register(`experiences.${index}.isCurrent`)}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">I currently work here</span>
                  </label>
                </div>

                {!watchedExperiences?.[index]?.isCurrent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      {...register(`experiences.${index}.endDate`)}
                      type="month"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...register(`experiences.${index}.description`)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  placeholder="Describe your role..."
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Another Position
          </button>
        </div>
      )}
    </div>
  );
}
