import { motion } from "framer-motion";

interface ProgressBarProps {
  currentProgress: number;
}

export const ProgressBar = ({ currentProgress }: ProgressBarProps) => {
  return (
    <div className="flex items-center gap-2 mb-8">
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <motion.div 
          className="h-full bg-primary rounded-full"
          style={{ width: `${currentProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${currentProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-sm font-medium text-gray-600 min-w-[4rem]">
        {Math.round(currentProgress)}%
      </span>
    </div>
  );
};