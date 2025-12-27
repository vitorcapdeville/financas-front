'use client';

import { useRouter } from 'next/navigation';

interface BotaoVoltarProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BotaoVoltar({ 
  children = '← Voltar', 
  className = 'inline-flex items-center text-gray-600 hover:text-gray-900'
}: BotaoVoltarProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={className}
    >
      {children}
    </button>
  );
}
