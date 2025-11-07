/**
 * Education Section - FIXED
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Education } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

// Array schema for form
const FormSchema = z.object({
  education: z.array(
    z.object({
      id: z.number().optional(),
      institution: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      location: z.string().optional(),
      graduationDate: z.string(),
      gpa: z.string().optional(),
      order: z.number().optional(),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

export default function EducationSection() {
  const { formData, updateFormData } = useResumeForm();

  const {
    register,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // Enable real-time updates
    defaultValues: {
      education: formData.education || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  // Load data from API only once on mount
  useEffect(() => {
    if (formData.education && formData.education.length > 0) {
      setValue('education', formData.education as FormData['education']);
    }
  }, []); // Only run once

  // Handle field change - update context immediately (same approach as PersonalInfo/Summary/Projects)
  const handleFieldChange = () => {
    const currentEducation = getValues('education') || [];
    if (currentEducation.length > 0) {
      updateFormData('education', currentEducation as Education[]);
    } else {
      updateFormData('education', []);
    }
  };

  const handleAdd = () => {
    append({
      institution: '',
      degree: '',
      field: '',
      location: '',
      graduationDate: '',
      gpa: '',
      order: fields.length,
    });
    // Update context after adding new education
    setTimeout(() => {
      handleFieldChange();
    }, 0);
  };

  const handleRemove = (index: number) => {
    remove(index);
    // Update context after removing education
    setTimeout(() => {
      handleFieldChange();
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
        <p className="text-gray-600">Your academic background</p>
      </div>

      {fields.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <GraduationCap size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No education added yet</h3>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Education {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <input
                    {...register(`education.${index}.institution`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Stanford University"
                  />
                  {errors.education?.[index]?.institution && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.education[index]?.institution?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    {...register(`education.${index}.degree`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field of Study
                  </label>
                  <input
                    {...register(`education.${index}.field`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    {...register(`education.${index}.location`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Palo Alto, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Date
                  </label>
                  <input
                    {...register(`education.${index}.graduationDate`, {
                      onChange: handleFieldChange,
                    })}
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA (Optional)
                  </label>
                  <input
                    {...register(`education.${index}.gpa`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 3.8/4.0"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Another Education
          </button>
        </div>
      )}
    </div>
  );
}
