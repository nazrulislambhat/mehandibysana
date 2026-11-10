import React from 'react';

export interface BrandIconProps {
  size?: number | string;
  className?: string;
  decorative?: boolean;
  label?: string;
}

function getA11yProps(decorative = true, label?: string) {
  if (decorative) {
    return { 'aria-hidden': true as const };
  }
  return {
    role: 'img' as const,
    'aria-label': label,
  };
}

/**
 * Structured apothecary bag with botanical henna drop seal.
 */
export function ApothecaryBagIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Shopping bag',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M5.5 8.5L4.2 19.5C4.08 20.55 4.9 21.5 5.95 21.5H18.05C19.1 21.5 19.92 20.55 19.8 19.5L18.5 8.5H5.5Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 8.5V6.75C8.75 4.95 10.2 3.5 12 3.5C13.8 3.5 15.25 4.95 15.25 6.75V8.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M12 12.25C10.8 13.75 10.4 14.85 10.4 15.7C10.4 16.75 11.12 17.5 12 17.5C12.88 17.5 13.6 16.75 13.6 15.7C13.6 14.85 13.2 13.75 12 12.25Z"
        fill="#d9541e"
      />
    </svg>
  );
}

/**
 * Diagonal 0.38mm rolled organic henna cone with tip pin and paste drop.
 */
export function HennaConeIcon({
  size = 18,
  className = '',
  decorative = true,
  label = '0.38mm henna cone',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M18.6 3.8C19.9 5.1 20.1 6.7 19.2 7.6L8.8 15.8C8.3 16.2 7.6 16.1 7.3 15.6C6.9 15.1 7 14.4 7.5 14L15.4 4.1C16.3 3.2 17.5 2.7 18.6 3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12.9 7.3L16.3 10.7"
        stroke="#d9541e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.3 15.7L5 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="4" cy="19.5" r="1.4" fill="#d9541e" />
    </svg>
  );
}

/**
 * Deep freezer storage crystal (-18°C henna cone conservation).
 */
export function FreezerStorageIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Freezer storage',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 3V21M4.2 7.5L19.8 16.5M19.8 7.5L4.2 16.5"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M9.8 5L12 7.2L14.2 5M9.8 19L12 16.8L14.2 19"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="#d9541e" />
    </svg>
  );
}

/**
 * Small-batch courier parcel sealed with terracotta botanical mark.
 */
export function CourierDispatchIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Parcel dispatch',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 3L20.5 7.6V16.4L12 21L3.5 16.4V7.6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M3.8 7.8L12 12.2L20.2 7.8M12 12.2V20.6"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 5.4L16.2 9.9"
        stroke="#d9541e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16.2" cy="14.6" r="1.4" fill="#d9541e" />
    </svg>
  );
}

/**
 * Botanical studio location pin with warm terracotta core.
 */
export function LocationPinIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Studio location',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 21C12 21 18.5 14.9 18.5 9.75C18.5 6.16 15.59 3.25 12 3.25C8.41 3.25 5.5 6.16 5.5 9.75C5.5 14.9 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.75" r="2.25" fill="#d9541e" />
    </svg>
  );
}

/**
 * Architectural studio mail envelope with terracotta wax dot.
 */
export function MailEnvelopeIcon({
  size = 16,
  className = '',
  decorative = true,
  label = 'Email',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <rect
        x="3"
        y="5.5"
        width="18"
        height="13"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.2 7L12 13L19.8 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="1.4" fill="#d9541e" />
    </svg>
  );
}

/**
 * Concierge telephone handset icon with terracotta signal arc.
 */
export function PhoneHandsetIcon({
  size = 16,
  className = '',
  decorative = true,
  label = 'Phone',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M6.4 4.2H9.2L10.7 8L8.9 9.5C9.85 11.6 11.4 13.15 13.5 14.1L15 12.3L18.8 13.8V16.6C18.8 17.85 17.75 18.85 16.5 18.75C10.5 18.2 5.8 13.5 5.25 7.5C5.15 6.25 6.15 5.2 6.4 4.2Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M15.2 5.2C17.1 5.6 18.4 6.9 18.8 8.8"
        stroke="#d9541e"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * WhatsApp studio chat icon with crisp botanical dot core.
 */
export function WhatsAppChatIcon({
  size = 16,
  className = '',
  decorative = true,
  label = 'WhatsApp',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 3.5C16.7 3.5 20.5 7.15 20.5 11.65C20.5 16.15 16.7 19.8 12 19.8C10.55 19.8 9.2 19.45 8 18.82L4.2 20.1L5.42 16.5C4.52 15.12 4 13.45 4 11.65C4 7.15 7.3 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 9.3C9.6 9.3 10 11.4 11.5 12.8C13 14.2 14.8 14.6 14.8 14.6"
        stroke="#d9541e"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="9.6" cy="9.3" r="1.1" fill="#d9541e" />
      <circle cx="14.8" cy="14.6" r="1.1" fill="#d9541e" />
    </svg>
  );
}

/**
 * 8-petal rosette seal for Verified Studio Honors & Press Features.
 */
export function VerifiedHonorSealIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Verified honor',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 2.8L14.3 4.8L17.3 4.5L18.5 7.3L21.2 8.7L20.5 11.6L21.6 14.4L19.4 16.5L19.2 19.5L16.3 20.2L14.5 22.5L11.7 21.4L8.9 22.5L7.1 20.2L4.2 19.5L4 16.5L1.8 14.4L2.9 11.6L2.2 8.7L4.9 7.3L6.1 4.5L9.1 4.8L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 12.6L11 14.9L15.6 9.9"
        stroke="#d9541e"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Shield security mark for PCI-DSS payments & checkout assurance.
 */
export function ShieldProtectIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Protected transaction',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 3.2L19 6.2V11.6C19 16.1 16 19.7 12 21C8 19.7 5 16.1 5 11.6V6.2L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.5L14.6 11.1L12 13.7L9.4 11.1L12 8.5Z"
        fill="#d9541e"
      />
    </svg>
  );
}

/**
 * 100% Chemical-free botanical Sojat leaf badge icon.
 */
export function PureBotanicalIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Pure organic botanical',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M12 20.5C12 20.5 6 16.8 6 10.6C6 6.6 8.8 3.6 12 3.6C15.2 3.6 18 6.6 18 10.6C18 16.8 12 20.5 12 20.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.5V18.8M12 11.5L15 9.6M12 14.6L9 12.7"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="12" cy="11.5" r="1.5" fill="#d9541e" />
    </svg>
  );
}

/**
 * Mughal arch + lotus finial crown icon for Bridal Mehndi Sessions.
 */
export function BridalArchIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Bridal mehndi session',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <path
        d="M5.5 20.5V11.2C5.5 7.9 8.4 5.5 12 4C15.6 5.5 18.5 7.9 18.5 11.2V20.5H5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5C10.5 12.2 10.1 13.7 10.1 14.8C10.1 16.2 11 17.2 12 17.2C13 17.2 13.9 16.2 13.9 14.8C13.9 13.7 13.5 12.2 12 10.5Z"
        fill="#d9541e"
      />
      <circle cx="12" cy="2.5" r="1.2" fill="#d9541e" />
    </svg>
  );
}

/**
 * Studio schedule / booking response clock window icon.
 */
export function ClockWindowIcon({
  size = 18,
  className = '',
  decorative = true,
  label = 'Hours and response time',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.55" />
      <path
        d="M12 7.5V12L15.2 13.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1.35" fill="#d9541e" />
    </svg>
  );
}

/**
 * Refined search lens for ShopFilters.
 */
export function SearchLensIcon({
  size = 16,
  className = '',
  decorative = true,
  label = 'Search',
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...getA11yProps(decorative, label)}
    >
      <circle cx="10.75" cy="10.75" r="6.25" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M15.4 15.4L19.8 19.8"
        stroke="#d9541e"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Crisp architectural chevron for dropdowns & navigation.
 */
export function ChevronDownIcon({
  size = 12,
  className = '',
  decorative = true,
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...getA11yProps(decorative)}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Crisp architectural close mark for drawers, toast & studio menu.
 */
export function CloseCrossIcon({
  size = 14,
  className = '',
  decorative = true,
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      className={className}
      {...getA11yProps(decorative)}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

