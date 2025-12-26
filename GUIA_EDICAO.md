# 🎯 Guia Rápido - Edição de Transações

## Como Editar uma Transação

### Opção 1: Edição na Tabela (Recomendado)

1. **Acesse a página de Transações**
   - Clique em "Ver Todas as Transações" no dashboard
   - Ou navegue para `http://localhost:3000/transacoes`

2. **Encontre a transação**
   - Use os filtros de período se necessário
   - Localize a transação na tabela

3. **Inicie a edição**
   - Clique no botão "Editar" na coluna de Ações
   - Os campos de Valor e Categoria se tornarão editáveis

4. **Faça as alterações**
   - **Valor**: Digite o novo valor (apenas números)
   - **Categoria**: Digite a nova categoria (texto livre)

5. **Salve ou cancele**
   - Clique em "Salvar" para confirmar as alterações
   - Clique em "Cancelar" para descartar

### O que você pode editar?

✅ **Valor** - Altere o montante da transação
✅ **Categoria** - Altere ou adicione uma categoria

❌ **Não editável:**
- Data da transação
- Descrição
- Tipo (entrada/saída)
- Origem (manual/extrato/fatura)

*Nota: Para editar esses campos, você precisará deletar e recriar a transação.*

## Exemplos Práticos

### Exemplo 1: Corrigir valor digitado errado
```
Antes: R$ 150,00
Depois: R$ 155,00
```
1. Clique em "Editar"
2. Altere o valor para `155.00`
3. Clique em "Salvar"

### Exemplo 2: Adicionar categoria a transação importada
```
Antes: Categoria = "Sem categoria"
Depois: Categoria = "Alimentação"
```
1. Clique em "Editar"
2. Digite "Alimentação" no campo categoria
3. Clique em "Salvar"

### Exemplo 3: Recategorizar despesa
```
Antes: Categoria = "Outros"
Depois: Categoria = "Saúde"
```
1. Clique em "Editar"
2. Altere categoria para "Saúde"
3. Clique em "Salvar"

## Dicas

💡 **As alterações são imediatas** - Assim que você salvar, o resumo do dashboard será atualizado automaticamente

💡 **Use categorias consistentes** - Escreva as categorias sempre da mesma forma (ex: "Alimentação" em vez de "alimentação" ou "Alimentacao")

💡 **Categoria vazia é permitida** - Você pode deixar o campo de categoria em branco se preferir categorizar depois

💡 **Valores sempre positivos** - O sistema usa o tipo (entrada/saída) para determinar se é um ganho ou gasto

## Feedback Visual

- ✅ **Bordas azuis** = Campo em edição
- ✅ **Toast verde** = Salvo com sucesso
- ❌ **Toast vermelho** = Erro ao salvar
- ⏳ **"Salvando..."** = Processando

## Atalhos de Teclado

- `Tab` - Navegar entre campos
- `Enter` - Salvar (quando em um campo de input)
- `Esc` - Cancelar edição

## Erros Comuns

### ❌ "Erro ao atualizar transação"
**Causa:** API não está rodando ou transação foi deletada
**Solução:** Verifique se o backend está rodando e recarregue a página

### ❌ Campo de valor não aceita entrada
**Causa:** Valor não numérico
**Solução:** Use apenas números e ponto para decimais (ex: 150.50)

### ❌ Alterações não aparecem
**Causa:** Cache do navegador
**Solução:** Recarregue a página (F5 ou Ctrl+R)

## Próximos Passos

Após editar suas transações, você pode:
- ✨ Ver o resumo atualizado no Dashboard
- 📊 Verificar os totais por categoria
- 📥 Importar mais transações
- 🗑️ Deletar transações indesejadas
