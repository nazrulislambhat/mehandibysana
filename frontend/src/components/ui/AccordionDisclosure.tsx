'use client';

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionDisclosureProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export function AccordionDisclosure({
  title,
  icon,
  children,
  defaultOpen = false,
  className = '',
  triggerClassName = '',
  contentClassName = '',
}: AccordionDisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      data-state={isOpen ? 'open' : 'closed'}
      className={`accordion-disclosure group ${className}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full text-left cursor-pointer list-none flex items-center justify-between gap-4 transition-colors ${triggerClassName}`}
      >
        <span className="inline-flex items-center gap-2.5">
          {icon}
          <span>{title}</span>
        </span>
        <span
          className={`shrink-0 inline-flex items-center justify-center text-terracotta transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden="true"
        >
          <ChevronDown className="w-3 h-3" />
        </span>
      </button>

      <div
        id={contentId}
        role="region"
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className={contentClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AccordionDisclosure;
