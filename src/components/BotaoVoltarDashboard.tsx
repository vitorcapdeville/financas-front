'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BotaoVoltarDashboardProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BotaoVoltarDashboard({ 
  children = '← Voltar ao Dashboard', 
  className = 'inline-block bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors'
}: BotaoVoltarDashboardProps) {
  const searchParams = useSearchParams();
  
  // Preserva período, diaInicio e tags nos query params
  const queryParams = new URLSearchParams();
  if (searchParams.get('periodo')) {
    queryParams.set('periodo', searchParams.get('periodo')!);
  }
  if (searchParams.get('diaInicio')) {
    queryParams.set('diaInicio', searchParams.get('diaInicio')!);
  }
  if (searchParams.get('tags')) {
    queryParams.set('tags', searchParams.get('tags')!);
  }
  
  const queryString = queryParams.toString();
  const href = queryString ? `/?${queryString}` : '/';

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
