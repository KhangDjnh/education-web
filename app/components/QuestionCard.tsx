import React from "react";
import { ClipboardDocumentListIcon, CheckCircleIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export interface Question {
  id: number;
  classId: number;
  chapter: number;
  question: string;
  answer: string;
  level: "EASY" | "MEDIUM" | "HARD" | "VERY_HARD";
}

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
      className={`flex items-center rounded-lg shadow-md bg-white hover:shadow-lg transition-all border-2 ${
        selected ? "border-blue-500" : "border-transparent"
      } p-4 mb-2 cursor-pointer`}
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
        <div className="flex items-center text-xs text-gray-500 space-x-4 ">
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
      {checked && <CheckCircleIcon className="h-6 w-6 text-blue-500 ml-4" />}
    </div>
  );
};

export default QuestionCard;