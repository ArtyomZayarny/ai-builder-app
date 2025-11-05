/**
 * Skills Section - FIXED
 */

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Skill } from '@resume-builder/shared';
import { useResumeForm } from '../../contexts/ResumeFormContext';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Trash2, Wrench } from 'lucide-react';

// Array schema for form
const FormSchema = z.object({
  skills: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      category: z.string().optional(),
      order: z.number().optional(),
    })
  ),
});

type FormData = z.infer<typeof FormSchema>;

export default function SkillsSection() {
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
      skills: formData.skills || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const watchedSkills = watch('skills');

  useEffect(() => {
    if (formData.skills && formData.skills.length > 0) {
      setValue('skills', formData.skills as any);
    }
  }, [formData.skills, setValue]);

  const debouncedUpdate = useDebouncedCallback((skills: Skill[]) => {
    updateFormData('skills', skills);
  }, 300);

  useEffect(() => {
    if (watchedSkills) {
      debouncedUpdate(watchedSkills as Skill[]);
    }
  }, [watchedSkills, debouncedUpdate]);

  const handleAdd = () => {
    append({
      name: '',
      category: '',
      order: fields.length,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
          <p className="text-gray-600">List your technical and professional skills</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Skill
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Wrench size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No skills added yet</h3>
          <p className="text-gray-600 mb-4">Add skills to showcase your expertise</p>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Skill
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <input
                      {...register(`skills.${index}.name`)}
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., React, Leadership, Python"
                    />
                    {errors.skills?.[index]?.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.skills[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register(`skills.${index}.category`)}
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Category (e.g., Frontend, Soft Skills)"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg mt-0.5"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">💡 Suggested Categories:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Languages: JavaScript, Python, Java</li>
                <li>• Frontend: React, Angular, Vue.js</li>
                <li>• Backend: Node.js, Django, Spring</li>
                <li>• Tools: Git, Docker, AWS</li>
                <li>• Soft Skills: Leadership, Communication</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
