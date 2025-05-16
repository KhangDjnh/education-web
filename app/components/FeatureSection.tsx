import React from "react";

const FeatureSection = () => {
  const features = [
    {
      title: "Role-Based Access Control",
      description: "Secure access management for students, teachers, and administrators.",
      icon: "/images/icons/RoleBaseAccess.png",
    },
    {
      title: "Source Management",
      description: "Upload, organize, and share learning materials efficiently.",
      icon: "/images/icons/SourceManagement.avif",
    },
    {
      title: "Smart Exam System",
      description: "Create randomized exams from question banks with automatic grading.",
      icon: "/images/icons/SmartExam.png",
    },
    {
      title: "Centralized Learning",
      description: "Access all educational resources in one convenient platform.",
      icon: "/images/icons/CentralizedLearning.png",
    },
  ];

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Platform Features
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Discover what makes our education platform the preferred choice for students, teachers, and administrators.
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full flex items-center justify-center bg-blue-100 mb-4">
                      <img src={feature.icon} alt={feature.title} className="h-16 w-16 object-contain" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection; 