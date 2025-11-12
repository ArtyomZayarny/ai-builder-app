/**
 * Projects Section - FIXED
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Project } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';
import { Plus, Trash2, FolderGit2 } from 'lucide-react';
import { deleteProject } from '../../services/resumeApi';

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
  const { formData, updateFormData, resumeId } = useResumeForm();

  const { register, control, setValue, getValues } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    mode: 'onChange', // Enable real-time updates
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

  // Load data from API or when imported from PDF
  useEffect(() => {
    if (formData.projects && formData.projects.length > 0) {
      // Check if form values differ from context data (to avoid unnecessary updates)
      const currentFormValues = getValues('projects');
      const normalizedProjects = formData.projects.map(p => ({
        ...p,
        technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : '',
      }));
      const hasChanges = JSON.stringify(currentFormValues) !== JSON.stringify(normalizedProjects);

      if (hasChanges || !currentFormValues || currentFormValues.length === 0) {
        setValue('projects', normalizedProjects as FormData['projects']);
      }
    }
  }, [formData.projects, setValue, getValues]); // React to context changes

  // Helper function to check if project is empty
  const isProjectEmpty = (project: {
    name?: string;
    description?: string;
    technologies?: string | string[];
  }): boolean => {
    return (
      !project.name?.trim() &&
      !project.description?.trim() &&
      (!project.technologies ||
        (typeof project.technologies === 'string' && !project.technologies.trim()) ||
        (Array.isArray(project.technologies) && project.technologies.length === 0))
    );
  };

  // Handle field change - update context immediately (same approach as PersonalInfo/Summary)
  const handleFieldChange = () => {
    const currentProjects = getValues('projects') || [];
    if (currentProjects.length > 0) {
      // Convert string to array before saving - filter out empty projects
      const converted = currentProjects
        .map(p => ({
          ...p,
          technologies:
            typeof p.technologies === 'string'
              ? p.technologies
                  .split(',')
                  .map((t: string) => t.trim())
                  .filter(Boolean)
              : Array.isArray(p.technologies)
                ? p.technologies
                : [],
        }))
        .filter(p => !isProjectEmpty(p)); // Filter out empty projects
      updateFormData('projects', converted as Project[]);
    } else {
      // Clear projects if array is empty
      updateFormData('projects', []);
    }
  };

  const handleAdd = () => {
    append({
      name: '',
      description: '',
      technologies: '',
      url: '',
      date: '',
      order: fields.length,
    });
    // Update context after adding new project
    setTimeout(() => {
      handleFieldChange();
    }, 0);
  };

  const handleRemove = async (index: number) => {
    const projectToRemove = getValues(`projects.${index}`);

    // If project has an ID, delete it from DB immediately
    if (projectToRemove?.id && resumeId) {
      try {
        await deleteProject(resumeId, projectToRemove.id);
      } catch (error) {
        console.error('Failed to delete project from DB:', error);
        // Continue with local removal even if DB deletion fails
      }
    }

    // Remove from form
    remove(index);
    // Update context after removing project
    setTimeout(() => {
      handleFieldChange();
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
        <p className="text-gray-600">Showcase your best work</p>
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
          <p className="mt-4 text-sm text-gray-500">
            Click the button above to start adding your projects
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Project {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    {...register(`projects.${index}.name`, { onChange: handleFieldChange })}
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., E-commerce Platform"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technologies
                  </label>
                  <input
                    {...register(`projects.${index}.technologies`, { onChange: handleFieldChange })}
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
                    {...register(`projects.${index}.url`, { onChange: handleFieldChange })}
                    type="url"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://github.com/user/project"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    {...register(`projects.${index}.date`, { onChange: handleFieldChange })}
                    type="month"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register(`projects.${index}.description`, { onChange: handleFieldChange })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                    placeholder="Describe the project..."
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
            Add Another Project
          </button>
        </div>
      )}
    </div>
  );
}
