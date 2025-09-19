import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedRowProps {
  children: ReactNode;
  index: number;
}

export function AnimatedRow({ children, index }: AnimatedRowProps) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {children}
    </motion.tr>
  );
}
