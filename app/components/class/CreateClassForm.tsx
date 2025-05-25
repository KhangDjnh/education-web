import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../../services/classService';

interface CreateClassFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  semester?: string;
  code?: string;
  description?: string;
}

export const CreateClassForm: React.FC<CreateClassFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    semester: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { getToken } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Class name must be at least 3 characters';
    }

    // Validate semester
    if (!formData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    } else if (!/^\d{4}[1-3]$/.test(formData.semester)) {
      newErrors.semester = 'Semester must be in format YYYY[1-3] (e.g., 20241)';
    }

    // Validate code
    if (!formData.code.trim()) {
      newErrors.code = 'Class code is required';
    } else if (formData.code.length < 4) {
      newErrors.code = 'Class code must be at least 4 characters';
    }

    // Validate description
    if (formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await classService.createClass(formData, token);
      setSuccess(true);
      
      // Wait for 1.5 seconds to show success message before closing
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error creating class:', err);
      setError(err instanceof Error ? err.message : 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create New Class</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Class created successfully!</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Class Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter class name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <input
              type="text"
              name="semester"
              id="semester"
              required
              value={formData.semester}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.semester
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="e.g., 20241"
            />
            {errors.semester && (
              <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
            )}
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Class Code
            </label>
            <input
              type="text"
              name="code"
              id="code"
              required
              value={formData.code}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.code
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter class code"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Enter class description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : success ? (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Created!
                </div>
              ) : (
                'Create Class'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 