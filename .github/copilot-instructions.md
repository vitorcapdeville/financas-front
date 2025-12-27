# Instruções para o GitHub Copilot - Frontend de Finanças Pessoais

## Contexto do Projeto

Este é o frontend de uma aplicação de gerenciamento de finanças pessoais, construído com:
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Para tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Para comunicação com a API
- **React Hook Form**: Gerenciamento de formulários
- **Recharts**: Biblioteca de gráficos

## Arquitetura e Fluxo de Dados

- **Service layer**: Todas as chamadas à API organizadas em `services/api.service.ts` (transacoesService, importacaoService, configuracoesService)
- **Custom period**: Dashboard permite definir dia de início do período mensal (1-31) armazenado via API `/configuracoes`
- **Date handling**: Frontend calcula `data_inicio/data_fim` baseado em dia customizado e envia para API (prioridade sobre mes/ano)
- **Type safety**: Interfaces TypeScript em `types/index.ts` espelham modelos backend (Pydantic schemas)
- **API base URL**: Configurável via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- **State persistence**: Hook `usePeriodo` em `hooks/usePeriodo.ts` gerencia período e dia de início usando localStorage para persistência entre sessões
- **SSR handling**: Sempre use `typeof window !== 'undefined'` antes de acessar localStorage para evitar erros de hidratação

## Objetivo

Fornecer uma interface intuitiva para que o usuário possa:
1. Visualizar resumo mensal de entradas e saídas
2. Ver transações categorizadas
3. Adicionar, editar e excluir transações
4. Importar extratos bancários e faturas
5. Categorizar transações
6. Visualizar gráficos e insights financeiros

## Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx            # Dashboard principal
│   ├── layout.tsx          # Layout raiz
│   ├── globals.css         # Estilos globais
│   ├── transacoes/         # Página de transações
│   └── importar/           # Página de importação
├── components/             # Componentes reutilizáveis
│   ├── Dashboard/
│   ├── Transacao/
│   ├── Forms/
│   └── UI/
├── services/               # Camada de serviços
│   └── api.service.ts      # Comunicação com API
├── types/                  # Tipos TypeScript
│   └── index.ts
├── utils/                  # Utilitários
│   └── format.ts           # Formatação de dados
└── lib/                    # Configurações
    └── api.ts              # Setup do Axios
```

## Tipos TypeScript

### Principais Interfaces

```typescript
interface Transacao {
  id: number;
  data: string;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  categoria?: string;
  origem: string;
  observacoes?: string;
}

interface ResumoMensal {
  mes: number;
  ano: number;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  entradas_por_categoria: Record<string, number>;
  saidas_por_categoria: Record<string, number>;
}
```

## Padrões de Código

### 1. Componentes

**PRIORIDADE: Server Components**

- **Sempre prefira Server Components** ao invés de Client Components
- Use Server Components por padrão - só adicione `"use client"` quando estritamente necessário
- Client Components são necessários apenas para: hooks de estado, event handlers, browser APIs, useEffect
- Server Components reduzem bundle size e melhoram performance

**PRIORIDADE: Estado na URL**

- **Sempre prefira gerenciar estado através de URL params/searchParams** ao invés de useState
- Estado na URL permite compartilhamento de links e bookmarks preservando o estado da aplicação
- Use `searchParams` em Server Components ou `useSearchParams` + `useRouter` em Client Components
- useState é permitido apenas para estado efêmero de UI (modais abertos, campos de formulário, etc)

```typescript
// ✅ PREFERIDO: Server Component com estado na URL
interface PageProps {
  searchParams: { categoria?: string; mes?: string; ano?: string };
}

export default async function TransacoesPage({ searchParams }: PageProps) {
  const transacoes = await transacoesService.listar({
    categoria: searchParams.categoria,
    mes: searchParams.mes ? parseInt(searchParams.mes) : undefined,
    ano: searchParams.ano ? parseInt(searchParams.ano) : undefined,
  });
  
  return <ListaTransacoes transacoes={transacoes} />;
}

// ✅ OK: Client Component quando necessário (filtros interativos)
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FiltrosTransacoes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleFiltrar = (categoria: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('categoria', categoria);
    router.push(`?${params.toString()}`);
  };
  
  return <button onClick={() => handleFiltrar('alimentacao')}>Filtrar</button>;
}

// ❌ EVITAR: useState para estado que deveria estar na URL
'use client';

export default function TransacoesPage() {
  const [categoria, setCategoria] = useState(''); // ❌ Não permite bookmark
  // ...
}
```

**Quando usar cada abordagem:**

- **Server Component + URL params**: Filtros, paginação, ordenação, seleção de período
- **Client Component + URL params**: Filtros interativos que precisam de feedback imediato
- **useState**: Estado efêmero de UI (modal aberto, dropdown expandido, campo de input)

### CRÍTICO: Preservação de Parâmetros de URL em Navegação

**REGRA**: Páginas COM filtros devem preservar `searchParams`. Páginas SEM filtros devem usar `router.back()`.

**Cenário 1 - Páginas COM filtros de período (categoria, transacoes, etc):**

Links que navegam para outras páginas DEVEM preservar `periodo` e `diaInicio`:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaginaComFiltros() {
  const searchParams = useSearchParams();
  const periodo = searchParams.get('periodo') || '';
  const diaInicio = searchParams.get('diaInicio') || '1';
  
  // Construir queryString para preservar filtros
  const queryString = new URLSearchParams({
    periodo,
    diaInicio,
  }).toString();

  return (
    <div>
      {/* ✅ CORRETO: Link preserva parâmetros */}
      <Link href={`/?${queryString}`}>Voltar ao Dashboard</Link>
    </div>
  );
}
```

**Cenário 2 - Páginas SEM filtros (tags, importar, etc):**

Use `router.back()` para voltar à página anterior preservando TODO o estado:

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function PaginaSemFiltros() {
  const router = useRouter();

  return (
    <div>
      {/* ✅ CORRETO: Usa histórico do navegador */}
      <button onClick={() => router.back()}>← Voltar</button>
      
      {/* ❌ ERRADO: Link direto perde estado da página anterior */}
      <Link href="/">Voltar</Link>
    </div>
  );
}
```

**Aplicação por página**:
- [src/app/categoria/[nome]/page.tsx](src/app/categoria/[nome]/page.tsx) ✅ Preserva searchParams (tem filtros)
- [src/app/tags/page.tsx](src/app/tags/page.tsx) ✅ Usa router.back() (sem filtros)
- [src/app/importar/page.tsx](src/app/importar/page.tsx) → Deve usar router.back() (sem filtros)

### 2. Serviços de API

- Centralize todas as chamadas à API em `services/api.service.ts`
- Use async/await
- Trate erros adequadamente
- Use tipos TypeScript para requisições e respostas

```typescript
export const meuService = {
  async listar(): Promise<MeuTipo[]> {
    const { data } = await api.get('/endpoint');
    return data;
  },
};
```

### 3. Formulários

- Use React Hook Form para gerenciar estado
- Valide dados no frontend
- Forneça feedback visual de erros
- Use toast para feedback de sucesso/erro

```typescript
const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data: FormData) => {
  try {
    await service.criar(data);
    toast.success('Sucesso!');
  } catch (error) {
    toast.error('Erro!');
  }
};
```

### 4. Estilização (Tailwind CSS)

- Use classes Tailwind para estilização
- Mantenha consistência com o design system
- Use componentes reutilizáveis para UI comum
- Cores principais: primary (verde), gray, red (saídas), green (entradas)

```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-bold text-gray-900 mb-4">Título</h2>
</div>
```

### 5. Estados e Loading

- Sempre mostre estados de loading
- Forneça feedback para ações do usuário
- Trate estados vazios (empty states)
- Use skeleton loaders quando apropriado

### 6. Navegação

- Use `<Link>` do Next.js para navegação
- Mantenha URLs semânticas
- Use query params para filtros

### 7. Formatação de Dados

- Use funções utilitárias de `utils/format.ts`
- `formatarMoeda()`: Para valores em R$
- `formatarData()`: Para datas em DD/MM/YYYY
- `formatarMes()`: Para nomes de meses

```typescript
import { formatarMoeda, formatarData } from '@/utils/format';

const valorFormatado = formatarMoeda(1500.50); // "R$ 1.500,50"
const dataFormatada = formatarData('2024-01-15'); // "15/01/2024"
```

## Custom Hooks

### usePeriodo (hooks/usePeriodo.ts)

Gerencia o período selecionado e dia de início com persistência em localStorage:

```typescript
const { periodo, setPeriodo, diaInicio, setDiaInicio } = usePeriodo();

// periodo: string no formato "YYYY-MM"
// diaInicio: número de 1-31 indicando dia de início do mês
```

**Importante**: 
- Sempre verifica `typeof window !== 'undefined'` antes de acessar localStorage
- Valores são sincronizados automaticamente com localStorage via useEffect
- Inicialização usa valores salvos ou defaults (mês atual, dia 1)

## Componentes Reutilizáveis

Ao criar componentes, considere:

### Card
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {/* conteúdo */}
</div>
```

### Button
```tsx
<button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
  Texto
</button>
```

### Input
```tsx
<input
  type="text"
  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
/>
```

## Configuração de Ambiente

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
```

O arquivo `.env` deve conter:
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**IMPORTANTE**: A API backend deve estar rodando em `http://localhost:8000` antes de iniciar o frontend.

## Comunicação com a API

Base URL: `http://localhost:8000` (configurável via `NEXT_PUBLIC_API_URL`)

### Endpoints Principais

- `GET /transacoes`: Lista transações
- `POST /transacoes`: Cria transação
- `PATCH /transacoes/{id}`: Atualiza transação
- `DELETE /transacoes/{id}`: Deleta transação
- `GET /transacoes/resumo/mensal`: Resumo mensal
- `POST /importacao/extrato`: Importa extrato
- `POST /importacao/fatura`: Importa fatura

## Tratamento de Erros

```typescript
try {
  const data = await service.executar();
  toast.success('Operação concluída!');
} catch (error) {
  console.error('Erro:', error);
  toast.error('Erro ao executar operação');
}
```

## Responsividade

- Use grid do Tailwind: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Teste em mobile, tablet e desktop
- Use breakpoints do Tailwind: `sm:`, `md:`, `lg:`, `xl:`

## Acessibilidade

- Use tags semânticas (header, main, nav, etc)
- Adicione labels aos inputs
- Use aria-labels quando necessário
- Garanta contraste adequado

## Performance

- Use `loading.tsx` para estados de loading
- Implemente infinite scroll para listas longas
- Otimize imagens com `next/image`
- Use React.memo para componentes pesados

## Próximas Funcionalidades

Ao adicionar features, considere:
- Página de listagem de transações com filtros
- Formulário de nova transação com validação
- Upload de arquivos (drag & drop)
- Gráficos interativos com Recharts
- Modo escuro (dark mode)
- Exportação de relatórios
- Notificações push
- PWA (Progressive Web App)

## Convenções de Nomenclatura

- **Componentes**: PascalCase (TransacaoCard)
- **Arquivos**: kebab-case (transacao-card.tsx)
- **Funções**: camelCase (formatarMoeda)
- **Constantes**: UPPER_CASE (API_URL)
- **Tipos/Interfaces**: PascalCase (Transacao, ResumoMensal)

## Commits

**IMPORTANTE**: Todos os commits devem seguir o padrão **Conventional Commits** (https://www.conventionalcommits.org/en/v1.0.0/)

**CRÍTICO**: Use sempre o **MCP GitKraken** para fazer commits. NUNCA use comandos git diretamente no terminal.

### Como Fazer Commits

Use as ferramentas MCP do GitKraken:
```
1. mcp_gitkraken_git_add_or_commit - para adicionar arquivos e fazer commit
2. mcp_gitkraken_git_push - para enviar para o repositório remoto
```

### Formato
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos Comuns
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças na documentação
- **style**: Mudanças de formatação (sem alteração de código)
- **refactor**: Refatoração de código (sem nova feature ou fix)
- **perf**: Melhorias de performance
- **test**: Adição ou correção de testes
- **build**: Mudanças no sistema de build ou dependências
- **chore**: Tarefas de manutenção

### Exemplos
```bash
feat: adiciona seletor de período customizado
feat(dashboard): implementa gráfico de gastos por categoria
fix: corrige erro de hidratação do React ao usar localStorage
style: ajusta espaçamento dos cards no dashboard
refactor: extrai lógica de formatação para utils
build: atualiza Next.js para versão 14.1
```

### Commits Breaking Changes
Para mudanças que quebram compatibilidade, adicione `!` após o tipo ou `BREAKING CHANGE:` no rodapé:
```bash
feat!: migra para App Router do Next.js 14
# ou
feat: atualiza estrutura de pastas

BREAKING CHANGE: Pages Router não é mais suportado
```

## Verificação Pós-Modificação

**CRÍTICO**: Após QUALQUER modificação no código:

1. **Execute em modo desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Verifique no terminal**:
   - Sem erros de compilação TypeScript
   - Sem erros de build do Next.js
   - Servidor iniciou corretamente

3. **Teste no navegador**:
   - Acesse http://localhost:3000
   - Navegue pelas páginas modificadas
   - Teste interações (formulários, botões, etc)
   - Verifique console do navegador (F12)

4. **Verifique integração com API**:
   - API deve estar rodando
   - Requests devem funcionar
   - Dados devem ser exibidos corretamente

**Nunca deixe código quebrado sem testar!**

## Boas Práticas

1. **Sempre use TypeScript** - Tipagem previne bugs
2. **Prefira Server Components** - Melhor performance e SEO
3. **Estado na URL** - Permite compartilhamento e bookmarks
4. **Componentize** - Reutilize código
5. **Separe lógica de UI** - Use hooks customizados
6. **Feedback visual** - Loading, erros, sucesso
7. **Validação** - Cliente e servidor
8. **Mensagens claras** - Para o usuário
9. **Código limpo** - Legível e manutenível
10. **Teste imediatamente** - Execute em dev mode após cada mudança
11. **Testes** - Considere adicionar testes

## Exemplos de Implementação

### Exemplo 1: Server Component com filtros na URL (PREFERIDO)

```tsx
// app/transacoes/page.tsx
import { transacoesService } from '@/services/api.service';
import { ListaTransacoes } from '@/components/ListaTransacoes';
import { FiltrosTransacoes } from '@/components/FiltrosTransacoes';

interface PageProps {
  searchParams: {
    categoria?: string;
    mes?: string;
    ano?: string;
  };
}

export default async function TransacoesPage({ searchParams }: PageProps) {
  const transacoes = await transacoesService.listar({
    categoria: searchParams.categoria,
    mes: searchParams.mes ? parseInt(searchParams.mes) : undefined,
    ano: searchParams.ano ? parseInt(searchParams.ano) : undefined,
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Transações</h1>
      <FiltrosTransacoes /> {/* Client Component para interação */}
      <ListaTransacoes transacoes={transacoes} /> {/* Server Component */}
    </main>
  );
}
```

### Exemplo 2: Client Component para UI interativa

```tsx
// components/FiltrosTransacoes.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function FiltrosTransacoes() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoriaChange = (categoria: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoria) {
      params.set('categoria', categoria);
    } else {
      params.delete('categoria');
    }
    router.push(`/transacoes?${params.toString()}`);
  };

  return (
    <select 
      value={searchParams.get('categoria') || ''} 
      onChange={(e) => handleCategoriaChange(e.target.value)}
      className="border rounded-md px-4 py-2"
    >
      <option value="">Todas as categorias</option>
      <option value="alimentacao">Alimentação</option>
      <option value="transporte">Transporte</option>
    </select>
  );
}
```

### Exemplo 3: useState para estado efêmero de UI

```tsx
// components/ModalConfirmacao.tsx
'use client';

import { useState } from 'react';

export function ModalConfirmacao({ onConfirmar }) {
  // ✅ useState OK para estado de UI efêmero
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Excluir</button>
      {isOpen && (
        <dialog className="modal">
          <p>Tem certeza que deseja excluir?</p>
          <button onClick={() => { onConfirmar(); setIsOpen(false); }}>Confirmar</button>
          <button onClick={() => setIsOpen(false)}>Cancelar</button>
        </dialog>
      )}
    </>
  );
}
```
