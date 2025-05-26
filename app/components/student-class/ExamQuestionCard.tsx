import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Question {
  questionId: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface ExamQuestionCardProps {
  question: Question;
  questionNumber: number;
  onSubmitAnswer: (questionId: number, answerOption: string) => Promise<void>;
}

export default function ExamQuestionCard({ question, questionNumber, onSubmitAnswer }: ExamQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitted) return;

    setIsSubmitting(true);
    try {
      await onSubmitAnswer(question.questionId, selectedOption);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-medium">
          Câu {questionNumber}: {question.question}
        </h3>
        {isSubmitted && (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="h-5 w-5 mr-1" />
            <span className="text-sm">Đã nộp</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedOption === option
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${isSubmitted ? 'cursor-not-allowed opacity-75' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.questionId}`}
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionSelect(option)}
              disabled={isSubmitted}
              className="hidden"
            />
            <div className="flex items-center w-full">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  selectedOption === option
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedOption === option && (
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                )}
              </div>
              <span className="font-medium mr-2">{option}.</span>
              <span>{question[`option${option}` as keyof Question]}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting || isSubmitted}
          className={`px-4 py-2 rounded-lg ${
            !selectedOption || isSubmitting || isSubmitted
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSubmitting ? 'Đang nộp...' : 'Nộp đáp án'}
        </button>
      </div>
    </div>
  );
} 