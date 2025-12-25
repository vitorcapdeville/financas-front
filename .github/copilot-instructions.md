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

- Use **"use client"** para componentes com estado ou hooks
- Prefira componentes funcionais com hooks
- Use TypeScript para props
- Extraia lógica complexa em hooks customizados

```typescript
'use client';

interface Props {
  titulo: string;
  onSalvar: (data: FormData) => void;
}

export default function MeuComponente({ titulo, onSalvar }: Props) {
  // ...
}
```

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

## Comunicação com a API

Base URL: `http://localhost:8000` (configurável via `.env`)

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
2. **Componentize** - Reutilize código
3. **Separe lógica de UI** - Use hooks customizados
4. **Feedback visual** - Loading, erros, sucesso
5. **Validação** - Cliente e servidor
6. **Mensagens claras** - Para o usuário
7. **Código limpo** - Legível e manutenível
8. **Teste imediatamente** - Execute em dev mode após cada mudança
9. **Testes** - Considere adicionar testes

## Exemplo de Página Completa

```tsx
'use client';

import { useState, useEffect } from 'react';
import { transacoesService } from '@/services/api.service';
import { Transacao } from '@/types';
import { formatarMoeda } from '@/utils/format';
import toast from 'react-hot-toast';

export default function MinhasPagina() {
  const [dados, setDados] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const data = await transacoesService.listar();
      setDados(data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <main className="min-h-screen p-8">
      {/* conteúdo */}
    </main>
  );
}
```
