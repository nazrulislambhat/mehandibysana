import React from 'react';
import { CircleArrowOutUpRight, type LucideProps } from 'lucide-react';

export function CircleArrowUpRightExit({
  className = 'w-3.5 h-3.5',
  ...props
}: LucideProps) {
  return <CircleArrowOutUpRight className={className} {...props} />;
}

export default CircleArrowUpRightExit;
