# Funcionalidade de Edição de Transações

## Visão Geral

A funcionalidade de edição permite que os usuários atualizem valores e categorias de suas transações financeiras diretamente na interface, sem precisar deletar e recriar as transações.

## Características

### 1. Edição Inline na Tabela de Transações

**Localização:** `/transacoes`

**Funcionalidades:**
- Clique em "Editar" em qualquer transação da tabela
- Campos de valor e categoria se tornam editáveis inline
- Botões "Salvar" e "Cancelar" aparecem para confirmar ou descartar alterações
- Feedback visual com bordas azuis nos campos em edição
- Mensagens de sucesso/erro via toast

**Como usar:**
1. Navegue para a página de Transações
2. Encontre a transação que deseja editar
3. Clique no botão "Editar"
4. Modifique o valor e/ou categoria
5. Clique em "Salvar" para confirmar ou "Cancelar" para descartar

### 2. Componente Modal de Edição

**Localização:** `src/components/ModalEditarTransacao.tsx`

Um modal reutilizável para edição de transações que pode ser utilizado em qualquer parte da aplicação.

**Props:**
```typescript
interface ModalEditarTransacaoProps {
  transacao: Transacao;          // Transação a ser editada
  isOpen: boolean;               // Controle de visibilidade
  onClose: () => void;           // Callback ao fechar
  onSalvar: (id: number, data: TransacaoUpdate) => Promise<void>; // Callback ao salvar
}
```

**Exemplo de uso:**
```tsx
import ModalEditarTransacao from '@/components/ModalEditarTransacao';

const [modalAberto, setModalAberto] = useState(false);
const [transacaoSelecionada, setTransacaoSelecionada] = useState<Transacao | null>(null);

const handleSalvar = async (id: number, data: TransacaoUpdate) => {
  await transacoesService.atualizar(id, data);
  toast.success('Transação atualizada!');
  // Recarregar dados...
};

<ModalEditarTransacao
  transacao={transacaoSelecionada}
  isOpen={modalAberto}
  onClose={() => setModalAberto(false)}
  onSalvar={handleSalvar}
/>
```

### 3. Componente de Item de Categoria

**Localização:** `src/components/CategoriaItem.tsx`

Componente para exibir categorias com valores e permitir edição rápida.

**Props:**
```typescript
interface CategoriaItemProps {
  categoria: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  onClick?: () => void;  // Callback opcional para edição
}
```

## Backend (API)

### Endpoint de Atualização

**Endpoint:** `PATCH /transacoes/{transacao_id}`

**Corpo da Requisição:**
```json
{
  "valor": 150.50,
  "categoria": "Alimentação"
}
```

**Campos Editáveis:**
- `valor`: Novo valor da transação (float)
- `categoria`: Nova categoria (string, opcional)
- `data`: Nova data (date, opcional)
- `descricao`: Nova descrição (string, opcional)
- `tipo`: Novo tipo - "entrada" ou "saida" (opcional)
- `observacoes`: Novas observações (string, opcional)

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "data": "2024-01-15",
  "descricao": "Compra supermercado",
  "valor": 150.50,
  "tipo": "saida",
  "categoria": "Alimentação",
  "origem": "manual",
  "observacoes": null,
  "criado_em": "2024-01-15T10:00:00",
  "atualizado_em": "2024-01-15T14:30:00"
}
```

**Erros Possíveis:**
- `404`: Transação não encontrada
- `400`: Dados inválidos

## Validações

### Frontend
- Valor deve ser numérico e positivo
- Categoria é opcional (pode ser vazia)
- Campos em branco não são enviados (usando `exclude_unset`)

### Backend
- Transação deve existir (validação de ID)
- Apenas campos fornecidos são atualizados
- Campo `atualizado_em` é automaticamente atualizado
- Campos não editáveis: `id`, `criado_em`, `origem`

## Fluxo de Dados

1. **Usuário clica em "Editar"**
   - Estado local armazena ID da transação em edição
   - Formulário é populado com valores atuais

2. **Usuário modifica campos**
   - Estado é atualizado em tempo real
   - Validação visual nos inputs

3. **Usuário clica em "Salvar"**
   - Requisição PATCH enviada para API
   - Loading state ativado

4. **API processa**
   - Valida dados
   - Atualiza banco de dados
   - Retorna transação atualizada

5. **Frontend recebe resposta**
   - Toast de sucesso/erro
   - Lista de transações é recarregada
   - Estado de edição é resetado

## Melhorias Futuras

- [ ] Edição em lote (múltiplas transações)
- [ ] Histórico de alterações
- [ ] Validação de categorias existentes (autocomplete)
- [ ] Edição de data com calendário visual
- [ ] Desfazer alterações recentes
- [ ] Duplicar transação
- [ ] Aplicar categoria a múltiplas transações similares

## Troubleshooting

### Edição não está salvando
- Verifique se a API está rodando (`uv run uvicorn app.main:app --reload`)
- Confirme que o ID da transação existe no banco
- Verifique o console do navegador para erros de rede

### Campo não está atualizando
- Verifique se o campo está incluído no `TransacaoUpdate` schema
- Confirme que o valor é válido para o tipo do campo
- Verifique se não há validações bloqueando no backend

### Modal não abre
- Verifique se `isOpen` está sendo controlado corretamente
- Confirme que a transação selecionada não é null
- Verifique o console para erros de renderização

## Testes Recomendados

1. ✅ Editar valor de uma transação
2. ✅ Editar categoria de uma transação
3. ✅ Editar ambos simultaneamente
4. ✅ Cancelar edição
5. ✅ Tentar salvar com valor negativo (deve falhar)
6. ✅ Editar transação e verificar atualização no resumo
7. ✅ Editar múltiplas transações em sequência
8. ✅ Editar transação de diferentes origens (manual, extrato, fatura)
