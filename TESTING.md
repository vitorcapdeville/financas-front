# Documentação de Testes - Frontend Finanças

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Estrutura de Testes](#estrutura-de-testes)
- [Comandos](#comandos)
- [Cobertura de Testes](#cobertura-de-testes)
- [Guia de Contribuição](#guia-de-contribuição)

## 🎯 Visão Geral

Este projeto utiliza uma suite completa de testes para garantir a qualidade e confiabilidade do código. Os testes são escritos usando:

- **Jest**: Framework de testes JavaScript
- **React Testing Library**: Biblioteca para testes de componentes React
- **@testing-library/user-event**: Simulação de interações do usuário
- **@testing-library/jest-dom**: Matchers customizados para DOM

## 📁 Estrutura de Testes

```
src/__tests__/
├── components/          # Testes de componentes React
│   ├── BotaoVoltar.test.tsx
│   ├── ModalConfirmacao.test.tsx
│   ├── CategoriaItem.test.tsx
│   └── FormularioNovaTag.test.tsx
├── hooks/              # Testes de hooks customizados
│   └── usePeriodo.test.tsx
├── utils/              # Testes de funções utilitárias
│   ├── format.test.ts
│   └── periodo.test.ts
├── services/           # Testes de serviços de API
│   └── api.service.test.ts
└── integration/        # Testes de integração
    └── fluxo-transacoes.test.tsx
```

## 🚀 Comandos

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch (desenvolvimento)
```bash
npm run test:watch
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
# Testar um arquivo específico
npm test -- BotaoVoltar.test.tsx

# Testar por padrão
npm test -- --testPathPattern=components

# Executar apenas testes que contêm uma descrição específica
npm test -- -t "deve renderizar com texto padrão"
```

## 📊 Cobertura de Testes

### Componentes Testados

#### ✅ BotaoVoltar
- Renderização com texto padrão e customizado
- Aplicação de classes CSS
- Geração correta de links baseado em origem
- Preservação de query params (período, diaInicio, tags)

#### ✅ ModalConfirmacao
- Renderização de título, mensagem e botões
- Callbacks de confirmação e cancelamento
- Estados de loading (isPending)
- Diferentes tipos visuais (danger, warning, info)
- Interação com overlay

#### ✅ CategoriaItem
- Formatação de valores monetários
- Cores baseadas em tipo (entrada/saída)
- Ícones visuais
- Botão de edição condicional

#### ✅ FormularioNovaTag
- Toggle de formulário
- Validação de campos obrigatórios
- Submissão de dados
- Estados de loading
- Tratamento de erros

### Hooks Testados

#### ✅ usePeriodo
- Inicialização com valores padrão
- Leitura do localStorage
- Persistência de alterações
- Múltiplas atualizações

### Utilitários Testados

#### ✅ format.ts
- Formatação de datas (DD/MM/YYYY)
- Formatação de valores monetários (R$)
- Nomes de meses
- Obtenção de mês/ano atual

#### ✅ periodo.ts
- Cálculo de período customizado
- Extração de parâmetros de URL
- Tratamento de virada de ano

### Serviços Testados

#### ✅ API Services
- **transacoesService**: listar, obter, criar, atualizar, deletar, resumo mensal
- **tagsService**: listar, criar, adicionar/remover tags
- **configuracoesService**: obter, salvar

### Testes de Integração

#### ✅ Fluxo de Transações
- Criação e listagem de transações
- Cálculo de resumo mensal
- Filtros e período customizado

## 🎨 Padrões de Teste

### 1. Estrutura de Teste
```typescript
describe('NomeDoComponente', () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve fazer algo esperado', () => {
    // Arrange: preparar dados
    // Act: executar ação
    // Assert: verificar resultado
  });
});
```

### 2. Testes de Componentes
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MeuComponente from '@/components/MeuComponente';

it('deve renderizar corretamente', () => {
  render(<MeuComponente prop="valor" />);
  
  expect(screen.getByText('Texto Esperado')).toBeInTheDocument();
});
```

### 3. Testes Assíncronos
```typescript
import { waitFor } from '@testing-library/react';

it('deve carregar dados', async () => {
  render(<ComponenteAssincrono />);
  
  await waitFor(() => {
    expect(screen.getByText('Dados Carregados')).toBeInTheDocument();
  });
});
```

### 4. Mocks de Serviços
```typescript
jest.mock('@/services/api.service');

const mockService = apiService as jest.Mocked<typeof apiService>;
mockService.listar.mockResolvedValueOnce([/* dados mock */]);
```

## 📝 Guia de Contribuição

### Ao Adicionar Novo Componente

1. **Crie arquivo de teste** em `src/__tests__/components/NomeComponente.test.tsx`

2. **Teste cenários essenciais**:
   - Renderização básica
   - Props obrigatórias e opcionais
   - Interações do usuário
   - Estados de loading/erro
   - Validações

3. **Execute os testes**:
   ```bash
   npm test -- NomeComponente.test.tsx
   ```

### Ao Adicionar Nova Funcionalidade

1. **Escreva o teste primeiro (TDD)**:
   ```typescript
   it('deve fazer a nova funcionalidade', () => {
     // Teste que inicialmente falha
   });
   ```

2. **Implemente a funcionalidade**

3. **Verifique se o teste passa**

### Checklist de Qualidade

- [ ] Todos os testes passam
- [ ] Cobertura de código >= 80%
- [ ] Testes são legíveis e descritivos
- [ ] Mocks são usados apropriadamente
- [ ] Edge cases são cobertos
- [ ] Testes assíncronos usam `waitFor` ou `async/await`
- [ ] Cleanup adequado com `beforeEach`/`afterEach`

## 🐛 Debugging de Testes

### Ver output do teste
```bash
npm test -- --verbose
```

### Debug no VSCode
Adicione breakpoint e use configuração de debug do Jest no VSCode.

### Ver DOM renderizado
```typescript
import { screen } from '@testing-library/react';

screen.debug(); // Imprime HTML do componente
```

### Verificar queries disponíveis
```typescript
screen.logTestingPlaygroundURL(); // Gera URL com suggestions
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## 🎯 Metas de Cobertura

- **Statements**: >= 80%
- **Branches**: >= 75%
- **Functions**: >= 80%
- **Lines**: >= 80%

Execute `npm run test:coverage` para verificar a cobertura atual.

---

**Última atualização**: Janeiro 2026
