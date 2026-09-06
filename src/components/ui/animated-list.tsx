"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import React from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 25 },
  },
};

export interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyComponent?: React.ReactNode;
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = "",
  emptyComponent = null,
}: AnimatedListProps<T>) {
  const shouldReduceMotion = useReducedMotion();

  if (items.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  if (shouldReduceMotion) {
    return (
      <ul className={className}>
        {items.map((item, index) => (
          <li key={keyExtractor(item, index)}>{renderItem(item, index)}</li>
        ))}
      </ul>
    );
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <motion.li key={keyExtractor(item, index)} variants={itemVariants}>
          {renderItem(item, index)}
        </motion.li>
      ))}
    </motion.ul>
  );
}
