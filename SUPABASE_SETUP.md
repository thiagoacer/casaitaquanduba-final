# Configuração do Supabase

Este documento explica como configurar o banco de dados Supabase para o sistema de reservas.

## Passo 1: Executar a Migration

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Navegue até **SQL Editor** no menu lateral
3. Clique em **New Query**
4. Copie e cole todo o conteúdo do arquivo `supabase_migration.sql`
5. Clique em **Run** para executar a migration

## O Que Foi Criado

### Tabelas

1. **pricing_seasons** - Configuração de temporadas (Alta, Média, Baixa)
2. **pricing_rules** - Preços por faixa de pessoas em cada temporada
3. **blocked_dates** - Datas indisponíveis para reserva
4. **booking_inquiries** - Solicitações de reserva dos clientes

### Dados Iniciais

A migration já inclui:
- 3 temporadas configuradas:
  - Alta Temporada (Dez-Fev, Jul): R$ 1.200 (1-4p), R$ 1.500 (5-8p), R$ 1.800 (9-10p)
  - Média Temporada (Mar-Jun, Ago-Out): R$ 900 (1-4p), R$ 1.100 (5-8p), R$ 1.300 (9-10p)
  - Baixa Temporada (Nov): R$ 700 (1-4p), R$ 900 (5-8p), R$ 1.100 (9-10p)

### Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado:
- **Leitura pública**: pricing_seasons, pricing_rules, blocked_dates
- **Inserção pública**: booking_inquiries
- **Leitura restrita**: booking_inquiries (apenas usuários autenticados)

## Passo 2: Gerenciar Datas Bloqueadas (Opcional)

Para bloquear datas específicas, execute no SQL Editor:

```sql
INSERT INTO blocked_dates (blocked_date, reason)
VALUES ('2025-12-25', 'Natal - Casa reservada');
```

## Passo 3: Visualizar Reservas

Para ver todas as solicitações de reserva:

```sql
SELECT
  guest_name,
  guest_email,
  guest_phone,
  check_in,
  check_out,
  num_guests,
  calculated_price,
  status,
  is_large_group,
  created_at
FROM booking_inquiries
ORDER BY created_at DESC;
```

## Funcionalidades do Sistema

### Para Clientes (Frontend)

1. **Seleção de Datas**: Calendário interativo com check-in e check-out
2. **Seleção de Pessoas**: Dropdown com 3 opções (1-4, 5-8, 9-10 pessoas)
3. **Grupos Grandes**: Formulário especial para mais de 10 pessoas
4. **Formulário de Contacto**: Captura nome, email e telefone ANTES de mostrar preço
5. **Cálculo Automático**: Preço calculado baseado em temporada e número de pessoas
6. **Desconto**: 15% aplicado automaticamente para estadias acima de 7 noites
7. **Taxa de Limpeza**: R$ 300 adicionados ao total
8. **Integração WhatsApp**: Link direto com dados pré-preenchidos

### Para Administradores

Todas as solicitações são salvas em `booking_inquiries` com:
- Dados de contacto do cliente
- Datas da reserva
- Número de pessoas
- Preço calculado
- Status (pending, confirmed, cancelled)
- Data de criação

## Atualizar Preços

Para atualizar preços, modifique a tabela `pricing_rules`:

```sql
-- Exemplo: Atualizar preço da Alta Temporada para 1-4 pessoas
UPDATE pricing_rules
SET price_per_night = 1300
WHERE season_id IN (SELECT id FROM pricing_seasons WHERE name LIKE 'Alta%')
  AND min_guests = 1 AND max_guests = 4;
```

## Suporte

As variáveis de ambiente já estão configuradas no arquivo `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O sistema está pronto para uso após executar a migration!
