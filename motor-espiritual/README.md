# Motor Espiritual — ENS Dia a Dia

> **Para o Claude Code desktop:** esta pasta é um **briefing de projeto**, não código.
> Ela descreve um sistema novo — o *Motor Espiritual* — a ser construído **dentro do app**
> (`src/`) numa etapa futura. **Nada aqui altera o app atual.** A pasta vive fora de
> `src/` e `public/`, então o Vite não a inclui no build. Leia este README primeiro,
> depois os documentos numerados, e por fim a pasta `conteudo/`.

---

## O que é o Motor Espiritual

Um mecanismo de **acompanhamento espiritual** dentro do ENS Dia a Dia. Quando o usuário
enfrenta uma dificuldade na vivência dos PCEs (ou simplesmente busca uma palavra), o app
**entende o que está acontecendo** e oferece a direção certa — extraída de um banco de
conteúdo **curado e revisado doutrinalmente** (Evangelho, Catecismo, Pe. Caffarel/ENS,
santos), no **tom** e na **linguagem** mais adequados àquela pessoa, naquele momento,
respeitando seu tempo de vida.

O objetivo último é o da própria espiritualidade das Equipes de Nossa Senhora:
aproximar os casais de Deus, da Igreja e conduzi-los à **santidade de vida** —
"plantando sementes de vida eterna no coração", a partir até mesmo das dificuldades.

## Princípio inegociável

> **Conteúdo curado e revisado — nunca gerado.**
> O motor *escolhe e embala* peças de um acervo aprovado; ele **não cria doutrina**.
> Toda ficha de conteúdo passa por revisão doutrinal (o "imprimatur" do projeto)
> antes de chegar ao usuário. Isso elimina o risco de erro doutrinal e torna tudo
> auditável por um sacerdote/conselheiro.

## As 4 peças do motor (resumo)

1. **Ficha de conteúdo** — o molde de cada peça do banco (texto + etiquetas).
2. **Perfil** — o que o app aprende da pessoa (traços estáveis), pelo uso.
3. **Leitura do momento** — o que ele lê fresco a cada interação (estados).
4. **Seletor** — pré-filtro de guardrails + pontuação de encaixe + aprendizado.

Detalhes em [`01-arquitetura-motor.md`](01-arquitetura-motor.md).

## Índice

| Arquivo | Conteúdo |
|---|---|
| [`00-visao.md`](00-visao.md) | Propósito, espiritualidade ENS, o "porquê" |
| [`01-arquitetura-motor.md`](01-arquitetura-motor.md) | As 4 peças + lógica de pontuação + exemplo numérico |
| [`02-estados-pastorais.md`](02-estados-pastorais.md) | A taxonomia de estados (= opções de tela = gavetas do banco) |
| [`03-guardrails.md`](03-guardrails.md) | Regras rígidas e limites pastorais |
| [`04-encaixe-no-app.md`](04-encaixe-no-app.md) | Lembretes por PCE, fluxo, micro-mensagens, aba SABEDORIAS |
| [`05-entrega-e-canais.md`](05-entrega-e-canais.md) | Notificação agnóstica de canal (in-app agora → push depois) |
| [`06-metricas-aprendizado.md`](06-metricas-aprendizado.md) | Feedback loop, sinais e análise pós-lançamento |
| [`conteudo/_schema.md`](conteudo/_schema.md) | O molde exato de uma ficha (campos) |
| [`conteudo/estados-pastorais.json`](conteudo/estados-pastorais.json) | Lista-mestre dos estados |
| [`conteudo/fichas/`](conteudo/fichas/) | As fichas, um arquivo JSON por estado (começa pelo piloto) |

## Sequência de construção recomendada

1. **Motor primeiro** (esta spec define o molde do conteúdo).
2. **Fatia vertical:** implementar o motor + preencher **um estado-piloto**
   (`abandono-oracao-pessoal`) e validar que o molde encaixa no conteúdo real.
3. **Industrializar a coleta** dos demais estados só depois do molde validado.

## Status

- [x] Arquitetura do motor desenhada
- [x] Encaixe no app definido
- [x] Estratégia de entrega (canais) definida
- [x] Schema da ficha definido
- [~] Estado-piloto (`abandono-oracao-pessoal`) — fichas em **rascunho**, aguardando revisão doutrinal
- [ ] Implementação do motor em `src/` (Claude desktop)
- [ ] Demais estados pastorais
