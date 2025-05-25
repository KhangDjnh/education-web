import React from "react";
import { ClipboardDocumentListIcon, CheckCircleIcon, AcademicCapIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import type { Question } from "../types/class";

interface QuestionCardProps {
  question: Question;
  checked: boolean;
  onCheck: (checked: boolean) => void;
  onClick: () => void;
  selected: boolean;
}

const levelColor: Record<Question["level"], string> = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-orange-100 text-orange-700",
  VERY_HARD: "bg-red-100 text-red-700",
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  checked,
  onCheck,
  onClick,
  selected,
}) => {
  return (
    <div
      className={`flex flex-col rounded-lg shadow-md bg-white hover:shadow-lg transition-all duration-300 ease-in-out border-2 ${
        selected ? "border-blue-500" : "border-transparent"
      } p-4 mb-2`}
    >
      <div 
        className="flex items-center cursor-pointer"
        onClick={onClick}
      >
        <div className="flex-shrink-0 mr-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onCheck(e.target.checked)}
            onClick={e => e.stopPropagation()}
            className="h-5 w-5 accent-blue-600"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-gray-800 truncate">{question.question}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span className="flex items-center">
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              Chapter {question.chapter}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${levelColor[question.level]}`}>
              {question.level}
            </span>
            <span className="ml-auto">Answer: <b>{question.answer}</b></span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {checked && <CheckCircleIcon className="h-6 w-6 text-blue-500" />}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {selected ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          selected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-4 pl-9 space-y-3 border-t pt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Option A:</span>
                <p className="text-sm text-gray-900">{question.optionA}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Option B:</span>
                <p className="text-sm text-gray-900">{question.optionB}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Option C:</span>
                <p className="text-sm text-gray-900">{question.optionC}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Option D:</span>
                <p className="text-sm text-gray-900">{question.optionD}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;