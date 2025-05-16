import React from "react";

const AboutSection = () => {
  const paragraphs = [
    "The Education-service is a application designed to support the operations of a modern online education system. This system serves three main user groups: students, teachers, and administrators. Each group has distinct roles and functionalities to ensure efficient management of educational activities.",
    
    "The system includes a comprehensive User Authentication and Authorization module. Users can register and log in securely, with role-based access control to differentiate between students, teachers, and admins. Users can also update their personal information, change passwords, and receive email notifications upon successful registration, enhancing user experience and system reliability.",
    
    "For teachers, the platform provides a wide range of classroom management features. Teachers can create and manage class groups, add or remove students, upload learning materials, and maintain a digital gradebook. They can also handle student attendance and approve various student requests.",
    
    "The system enables teachers to create and manage exams. The exam module allows teachers to specify exam schedules and automate grading for multiple-choice tests. A notable feature is the Question Bank, from which the system can randomly generate exams. Each exam consists of 20 questions: 8 easy, 8 medium, 3 hard, and 1 very hard, all randomly ordered to ensure fairness and reduce cheating.",
    
    "Students can register and join classes using a class code, which simplifies the enrollment process. They have access to view and download class materials and can participate in online multiple-choice exams directly through the platform. Students are also able to submit absence requests, which can be reviewed and approved by their teachers, streamlining communication between students and faculty.",
    
    "For administrators, the system provides tools to create, update, or delete users and roles. This allows the admin to manage the entire system's structure, ensuring users are assigned correct roles and permissions.",
    
    "The architecture of the application follows clean coding principles and best practices of RESTful API design. Security is implemented using JWT tokens and Spring Security for secure communication and session management. The backend is built to scale with modular services that can later be extended or integrated with other parts of the education ecosystem."
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About Our Platform
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            A comprehensive solution for educational management and learning
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-600">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Our Mission</h3>
            <p className="text-blue-700">
              To provide a complete, scalable, and secure solution to manage users, classes, exams, 
              and educational resources, making it a solid foundation for building a comprehensive 
              online education platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection; 