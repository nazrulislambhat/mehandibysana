import React from 'react';
import {
  ShoppingBag,
  Sparkles,
  Snowflake,
  Package,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Leaf,
  Clock,
  Search,
  Sun,
  Moon,
  ChevronDown,
  X,
  type LucideProps,
} from 'lucide-react';

export interface BrandIconProps extends LucideProps {
  size?: number | string;
  className?: string;
  decorative?: boolean;
  label?: string;
  accentColor?: string;
}

export function ApothecaryBagIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <ShoppingBag className={className} {...props} />;
}

export function HennaConeIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Sparkles className={className} {...props} />;
}

export function FreezerStorageIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Snowflake className={className} {...props} />;
}

export function CourierDispatchIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Package className={className} {...props} />;
}

export function LocationPinIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <MapPin className={className} {...props} />;
}

export function MailEnvelopeIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Mail className={className} {...props} />;
}

export function PhoneHandsetIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Phone className={className} {...props} />;
}

export function WhatsAppChatIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <MessageCircle className={className} {...props} />;
}

export function InstagramIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Camera className={className} {...props} />;
}

export function VerifiedHonorSealIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <CheckCircle2 className={className} {...props} />;
}

export function ShieldProtectIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <ShieldCheck className={className} {...props} />;
}

export function PureBotanicalIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Leaf className={className} {...props} />;
}

export function BridalArchIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Sparkles className={className} {...props} />;
}

export function ClockWindowIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Clock className={className} {...props} />;
}

export function SearchLensIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Search className={className} {...props} />;
}

export function SunBurstIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Sun className={className} {...props} />;
}

export function CrescentMoonIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <Moon className={className} {...props} />;
}

export function ChevronDownIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <ChevronDown className={className} {...props} />;
}

export function CloseCrossIcon({ className = 'w-3 h-3', ...props }: BrandIconProps) {
  return <X className={className} {...props} />;
}
