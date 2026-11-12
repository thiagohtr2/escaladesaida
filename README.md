# Rodízio de Plantões

Sistema de escalas de plantão com rodízio automático das posições (Plus, Semi, P1, P2, P3…).

## O que faz

- Gera a escala completa a partir da equipe e da ordem do primeiro plantão: a cada plantão todos descem uma posição e a última volta para a primeira.
- Escalas semanais, quinzenais, a cada 3 ou 4 semanas; equipes que se alternam no mesmo dia são escalas separadas.
- Movimentações com data de início: **substituição** (quem entra herda a posição de quem saiu), **entrada** (posição definida pela regra da escala) e **saída** (quem estava abaixo sobe). Os plantões anteriores não mudam, e cada mudança pode ser desfeita.
- Nome editável para cada posição.
- Quatro visualizações: Planilha (todos os nomes cabendo na tela), Siglas, Cartões por data e Por pessoa.
- Telas de "Hoje" e de Plantonistas, com os próximos plantões de cada um e saída em todas as escalas de uma vez.
- Cópia da escala como texto (WhatsApp) ou para planilha.

## Arquivos

- `index.html`: o sistema inteiro, num único arquivo (HTML, CSS e JavaScript).

## Onde os dados ficam

Publicado como artifact no Claude, o sistema usa o banco de dados compartilhado do artifact: todos que abrem o link veem as mesmas escalas.

Aberto fora do Claude (por exemplo, pelo GitHub Pages), ele funciona em **modo local**: as escalas ficam salvas só no navegador de quem está usando. Para compartilhar os dados fora do Claude, é preciso ligar o sistema a um banco externo (como o Supabase).
