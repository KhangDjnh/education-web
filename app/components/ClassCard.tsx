import React from "react";
import { Link } from "react-router";

interface ClassCardProps {
  id: number;
  name: string;
  code: string;
  description: string;
  semester: string;
  createdAt: string;
  role: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  name,
  code,
  description,
  semester,
  createdAt,
  role
}) => {
  // Format the date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  const classUrl = role === "STUDENT" ? `/student/class/${id}` : `/class/${id}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{name}</h3>
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full mt-1">
            {code}
          </span>
        </div>
        <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg">
          {semester}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex justify-between items-center pt-2 text-sm text-gray-500 border-t border-gray-100">
        <span>Created: {formattedDate}</span>
        <Link
          to={classUrl}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          View Class
        </Link>
      </div>
    </div>
  );
};

export default ClassCard; 