import { Variants } from 'framer-motion';

export const cardVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 0.95,
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const slideIn: Variants = {
  initial: (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
    const map = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: -100 },
      down: { x: 0, y: 100 },
    };
    return {
      ...map[direction],
      opacity: 0,
    };
  },
  animate: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: (direction: 'left' | 'right' | 'up' | 'down' = 'left') => {
    const map = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: -100 },
      down: { x: 0, y: 100 },
    };
    return {
      ...map[direction],
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    };
  },
};

export const pulse: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export const shimmer: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const coinFlip: Variants = {
  initial: {
    rotateY: 0,
  },
  animate: {
    rotateY: 360,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};