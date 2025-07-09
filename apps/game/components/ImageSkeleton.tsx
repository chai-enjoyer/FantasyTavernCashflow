'use client';

import { motion } from 'framer-motion';

interface ImageSkeletonProps {
  className?: string;
}

export default function ImageSkeleton({ className = '' }: ImageSkeletonProps) {
  return (
    <motion.div
      className={`bg-gray-800 ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700" />
    </motion.div>
  );
}