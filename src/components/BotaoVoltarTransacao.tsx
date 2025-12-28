'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface BotaoVoltarTransacaoProps {
  children?: React.ReactNode;
  className?: string;
}

export default function BotaoVoltarTransacao({ 
  children = '← Voltar', 
  className = 'inline-block bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors'
}: BotaoVoltarTransacaoProps) {
  const searchParams = useSearchParams();
  
  // Lê a origem da URL
  const origem = searchParams.get('origem') || '';
  
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
  
  // Determina a URL de destino baseado na origem
  let href = '/';
  
  if (origem === 'transacoes') {
    href = '/transacoes';
  } else if (origem.startsWith('categoria:')) {
    // Extrai o nome da categoria após o prefixo "categoria:"
    const categoriaNome = origem.substring(10); // Remove "categoria:"
    href = `/categoria/${encodeURIComponent(categoriaNome)}`;
  }
  
  // Adiciona query string se houver parâmetros
  const queryString = queryParams.toString();
  if (queryString) {
    href += `?${queryString}`;
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
