import React from "react";

type AvatarProps = {
  imageUrl?: string;
  username: string;
  size?: "sm" | "md" | "lg";
};

/**
 * Avatar component that displays user avatar
 * If no imageUrl is provided, generates an avatar based on username
 */
export const Avatar: React.FC<AvatarProps> = ({ 
  imageUrl, 
  username, 
  size = "md" 
}) => {
  // Determine size class
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  // Generate initials from username
  const initials = username
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Generate a color based on username (for consistent colors)
  const getColorFromUsername = (name: string) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", 
      "bg-yellow-500", "bg-purple-500", "bg-pink-500", 
      "bg-indigo-500", "bg-teal-500"
    ];
    
    // Simple hash function to select a color consistently
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getColorFromUsername(username);

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={`${username}'s avatar`} 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full ${avatarColor} text-white flex items-center justify-center font-medium`}>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar; 