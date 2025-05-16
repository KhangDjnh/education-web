import React, { useState, useEffect } from "react";

interface ImageSliderProps {
  className?: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ className = "" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Using images from the public directory
  const slides = [
    {
      image: "/images/slides/image01.jpg",
      alt: "Education Platform Image 1",
      title: "Modern Learning Environment",
      description: "Access educational resources anytime, anywhere",
    },
    {
      image: "/images/slides/image02.jpg",
      alt: "Education Platform Image 2",
      title: "Interactive Classes",
      description: "Engage with teachers and peers in real-time",
    },
    {
      image: "/images/slides/image03.jpg",
      alt: "Education Platform Image 3",
      title: "Structured Curriculum",
      description: "Follow well-designed educational paths",
    },
    {
      image: "/images/slides/image04.jpg",
      alt: "Education Platform Image 4",
      title: "Smart Exam System",
      description: "Take assessments with advanced anti-cheating technology",
    },
    {
      image: "/images/slides/image05.jpg",
      alt: "Education Platform Image 5",
      title: "Teacher-Student Collaboration",
      description: "Work together to achieve educational goals",
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className={`max-w-7xl mx-auto relative ${className}`}>
      <div className="overflow-hidden rounded-lg relative">
        {/* Current slide */}
        <div className="relative">
          <img 
            src={slides[currentSlide].image} 
            alt={slides[currentSlide].alt}
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute w-fit h-fit flex flex-col justify-end p-8 z-10 rounded-xl left-4 bottom-4">
            <h2 className="text-white text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
            <p className="text-white text-lg mb-4">{slides[currentSlide].description}</p>
          </div>
        </div>

        {/* Navigation arrows */}
        <button 
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 p-2 rounded-full hover:bg-opacity-50 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 mx-1 rounded-full ${
              currentSlide === index ? "bg-blue-600" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider; 