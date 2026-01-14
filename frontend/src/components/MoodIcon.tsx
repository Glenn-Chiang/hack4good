import { Smile, Frown, Meh, Frown as Anxious, Laugh } from "lucide-react";
import { MoodType } from "../types/types";

interface MoodIconProps {
  mood: MoodType;
  size?: number;
  showLabel?: boolean;
}

export function MoodIcon({
  mood,
  size = 20,
  showLabel = false,
}: MoodIconProps) {
  const configs = {
    happy: {
      icon: Smile,
      color: "text-green-500",
      bgColor: "bg-green-100",
      label: "Happy",
    },
    sad: {
      icon: Frown,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      label: "Sad",
    },
    neutral: {
      icon: Meh,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      label: "Neutral",
    },
    anxious: {
      icon: Anxious,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      label: "Anxious",
    },
    excited: {
      icon: Laugh,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      label: "Excited",
    },
  };

  const config = configs[mood];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor}`}
      >
        <Icon
          className={`w-${size / 4} h-${size / 4} ${config.color}`}
          size={size}
        />
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return <Icon className={config.color} size={size} />;
}
