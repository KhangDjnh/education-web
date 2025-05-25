import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Exam } from '../../types/class';

interface ExamFormProps {
  exam?: Exam;
  onSubmit: (data: {
    classId: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
  onClose: () => void;
  isRandom?: boolean;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  exam,
  onSubmit,
  onClose,
  isRandom = false,
}) => {
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    startTime: exam?.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
    endTime: exam?.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
    ...(isRandom && {
      numberOfEasyQuestions: '0',
      numberOfMediumQuestions: '0',
      numberOfHardQuestions: '0',
      numberOfVeryHardQuestions: '0',
    }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      classId: exam?.classId.toString() || '',
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {exam ? 'Edit Exam' : isRandom ? 'Create Random Exam' : 'Create Exam'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {isRandom && (
            <>
              <div>
                <label htmlFor="easyQuestions" className="block text-sm font-medium text-gray-700">
                  Number of Easy Questions
                </label>
                <input
                  type="number"
                  id="easyQuestions"
                  value={formData.numberOfEasyQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfEasyQuestions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="mediumQuestions" className="block text-sm font-medium text-gray-700">
                  Number of Medium Questions
                </label>
                <input
                  type="number"
                  id="mediumQuestions"
                  value={formData.numberOfMediumQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfMediumQuestions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="hardQuestions" className="block text-sm font-medium text-gray-700">
                  Number of Hard Questions
                </label>
                <input
                  type="number"
                  id="hardQuestions"
                  value={formData.numberOfHardQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfHardQuestions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="veryHardQuestions" className="block text-sm font-medium text-gray-700">
                  Number of Very Hard Questions
                </label>
                <input
                  type="number"
                  id="veryHardQuestions"
                  value={formData.numberOfVeryHardQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfVeryHardQuestions: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              {exam ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 