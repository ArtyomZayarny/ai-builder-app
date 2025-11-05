/**
 * Projects Section - FIXED
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Trash2, FolderGit2 } from 'lucide-react';

// Array schema for form
const FormSchema = z.object({
  projects: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      description: z.string(),
      technologies: z.string(), // Store as comma-separated string in form
      url: z.string().optional(),
      date: z.string().optional(),
      order: z.number().optional(),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

export default function ProjectsSection() {
  const { formData, updateFormData } = useResumeForm();

  const { register, control, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      projects:
        formData.projects?.map(p => ({
          ...p,
          technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  const watchedProjects = watch('projects');

  useEffect(() => {
    if (formData.projects && formData.projects.length > 0) {
      setValue(
        'projects',
        formData.projects.map(p => ({
          ...p,
          technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
        })) as any
      );
    }
  }, [formData.projects, setValue]);

  const debouncedUpdate = useDebouncedCallback((projects: any[]) => {
    // Convert string to array before saving
    const converted = projects.map(p => ({
      ...p,
      technologies:
        p.technologies
          ?.split(',')
          .map((t: string) => t.trim())
          .filter(Boolean) || [],
    }));
    updateFormData('projects', converted as Project[]);
  }, 300);

  useEffect(() => {
    if (watchedProjects) {
      debouncedUpdate(watchedProjects);
    }
  }, [watchedProjects, debouncedUpdate]);

  const handleAdd = () => {
    append({
      name: '',
      description: '',
      technologies: '',
      url: '',
      date: '',
      order: fields.length,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-600">Showcase your best work</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderGit2 size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects added yet</h3>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Project {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`projects.${index}.name`)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register(`projects.${index}.technologies`)}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., React, Node.js, PostgreSQL"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project URL
                  </label>
                  <input
                    {...register(`projects.${index}.url`)}
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://github.com/user/project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    {...register(`projects.${index}.date`)}
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register(`projects.${index}.description`)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="Describe the project..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
