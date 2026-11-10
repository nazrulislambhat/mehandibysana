import { permanentRedirect } from 'next/navigation';

export default function PortfolioRedirectPage() {
  permanentRedirect('/gallery');
}
