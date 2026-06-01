# 02 — Estados Pastorais (taxonomia)

Um **estado pastoral** é, ao mesmo tempo, três coisas:

1. uma **opção de tela** (o botão que o usuário toca quando o app pergunta "o que tem
   pesado?");
2. uma **gaveta do banco** (o conjunto de fichas que atendem aquele estado, via
   `ficha.estado[]`);
3. uma **entrada do motor** (`momento.estado_pastoral`).

Por isso desenhamos os estados uma única vez e eles servem aos três propósitos.

> A lista-mestre em formato de dados está em
> [`conteudo/estados-pastorais.json`](conteudo/estados-pastorais.json). Este documento é a
> versão humana, com a leitura caridosa de cada estado.

## Como ler "estado" vs "disposição" vs "estação"

- **Estado pastoral** = *o problema* (ex.: aridez na oração). É a gaveta.
- **Disposição** = *como ela está afetivamente* (consolação/desolação). Modula o `tom`.
- **Estação de vida** = *o contexto* (filhos pequenos, luto…). Modula o `proximo_passo`.

## Catálogo inicial (proposta — a refinar com a pesquisa)

Marcação de prioridade para o MVP: ⭐ = prioritário (diários, mais frequentes).

### Ligados à Oração Pessoal / Conjugal (diários) ⭐
- `abandono-oracao-pessoal` ⭐ — deixei de rezar sozinho; desânimo. **(ESTADO-PILOTO)**
- `abandono-oracao-conjugal` ⭐ — o casal parou de rezar junto.
- `aridez-na-oracao` ⭐ — rezo, mas não sinto nada; parece vazio.
- `falta-de-tempo` ⭐ — a correria do dia engole a oração.
- `cansaco-exaustao` ⭐ — sem energia para mais nada.
- `distracao-rotina` — virou hábito morno, automático, sem alma.
- `seca-espiritual-prolongada` — faz tempo que sinto Deus distante.

### Ligados à vida conjugal e familiar
- `conflito-no-casal` — brigamos / há distância entre nós.
- `dificuldade-de-perdoar` — magoa que não cicatriza.
- `desgaste-da-rotina-conjugal` — viramos colegas de casa.
- `dificuldade-com-os-filhos` — peso na educação/relação com os filhos.

### Ligados à fé e à vida interior
- `desanimo-apos-queda` — caí (pecado/falha) e me sinto indigno.
- `culpa-e-escrupulo` — culpa que paralisa em vez de converter.
- `duvida-na-fe` — questiono, não entendo, vacilo.
- `mornidao-espiritual` — perdi o fervor; tanto faz.
- `sofrimento-e-prova` — dor, doença, luto, crise.
- `dificuldade-de-confiar-em-deus` — medo, ansiedade, controle.

### Estados positivos (para o fiel — graça e crescimento)
- `fidelidade-perseverante` — venho sendo fiel; quero alimento e crescimento.
- `consolacao-fervor` — momento de graça; quero aprofundar.
- `gratidao` — coração cheio; quero render graças.
- `desejo-de-mais` — sede de ir além, de servir, de santidade.

### Genéricos / porta de entrada
- `preciso-de-uma-palavra` — não sei nomear; só quero uma palavra hoje (entrada padrão da aba
  SABEDORIAS quando a pessoa não escolhe nada específico).

## Estrutura de cada estado (no JSON)

```
{
  "id": "abandono-oracao-pessoal",
  "rotulo_tela": "Deixei de rezar sozinho",   // o texto do botão (linguagem do usuário)
  "descricao": "Parei a oração pessoal e ando desanimado.",
  "leitura_caridosa": "Provavelmente não é falta de fé, e sim cansaço, culpa ou a sensação de que 'não adianta'. Tratar com acolhimento, não com cobrança.",
  "pce_relacionado": "oracao-pessoal",
  "prioridade_mvp": true
}
```

A `leitura_caridosa` orienta o curador na hora de escrever as fichas e o desenvolvedor na hora
de escolher o tom padrão — é a interpretação benigna do que costuma estar por trás do estado.

## Observação para a curadoria

Esta lista é um **ponto de partida**. A pesquisa em Caffarel/ENS, no Catecismo e na tradição
dos santos pode dividir, fundir ou renomear estados. O importante é que cada estado tenha:
(a) um rótulo na linguagem do usuário, (b) uma leitura caridosa, e (c) fichas em vários eixos
(fonte × registro × tom × degrau).
