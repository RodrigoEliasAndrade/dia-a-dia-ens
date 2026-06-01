# 04 — Encaixe no App

Como o motor se liga ao ENS Dia a Dia que já existe. Três pontos de contato: **o lembrete dos
PCEs**, a **aba SABEDORIAS** e as **micro-mensagens ambientes**.

---

## A. O ciclo do lembrete (entrada principal do motor)

1. O usuário escolhe a **melhor hora do dia** para cada PCE.
2. Naquele horário chega um **lembrete** (in-app agora; push depois — ver
   [`05-entrega-e-canais.md`](05-entrega-e-canais.md)), cuidadoso, com tom de bênção.
3. Ele toca e vê opções: **"Já fiz"** · **"Vou fazer agora"** · **"Não consigo agora"**
   (ou similar).
   - **Já fiz** → registra conclusão; de vez em quando, uma palavra de alento/crescimento
     (estado `fidelidade-perseverante`).
   - **Vou fazer agora** → leva direto ao fluxo do PCE.
   - **Não consigo agora** → **não é fracasso, é honestidade.** Acolher e oferecer a graça em
     miniatura: *"Tudo bem. Quer só 1 minuto? Um respiro com Deus antes de seguir?"* (versão
     micro do PCE). Opção de adiar o lembrete.
4. O app **entende** se a pessoa fez ou não (pelo autorrelato explícito / pela conclusão do
   fluxo — nunca por vigilância).
5. Diante de um **padrão** de ausências (não de uma falha isolada — guardrail G5), o app
   pergunta **gentilmente** a razão, oferecendo **opções = estados pastorais**
   ([`02-estados-pastorais.md`](02-estados-pastorais.md)). A pessoa toca uma opção → **o motor
   liga** e entrega a palavra/direção certa.

### Cadência por PCE (NÃO use um número único)

Os 5 PCEs têm ritmos diferentes. O gatilho do motor precisa saber **qual PCE** e **qual
ritmo**:

| PCE | Ritmo | "Sentir falta" quando… |
|---|---|---|
| Oração pessoal | diário | alguns dias seguidos sem fazer |
| Oração conjugal | diário | alguns dias seguidos sem fazer |
| Regra de vida | check-in diário (arco longo) | padrão de ausência, não dia isolado |
| Dever de sentar | **mensal** | perto do fim do mês sem ter feito |
| Retiro anual | **anual** | lembrar com semanas de antecedência |

Sugestão inicial para os diários: perguntar a razão após **3 dias** consecutivos de ausência
(parametrizável; afinar com dados — ver [`06-metricas-aprendizado.md`](06-metricas-aprendizado.md)).
**Adaptativo:** para quem é geralmente fiel, 1 dia é ruído; para quem está frágil, intervir
mais cedo e mais suave. **Cooldown:** não repetir a pergunta logo após ter respondido.

---

## B. A aba SABEDORIAS (ignição manual do motor)

Uma aba fixa — o motor **sob demanda**, disponível mesmo sem falha (torna-o útil também para o
fiel, "que usa muito"). Duas formas de entrada:

1. **Tocar em opções** (o menu de estados pastorais) — **principal**. Determinístico,
   instantâneo, funciona offline.
2. **Descrever livremente** ("como você está?") — secundário. Mapear texto → estado é a única
   parte que, no futuro, pode usar um pouco de IA *de classificação* (nunca de geração). Por
   ora, se não casar bem, cair num gracioso *"qual destes mais se parece com o que você
   sente?"* + opções. Preferir manter o texto **no dispositivo** (guardrail G8).

A aba SABEDORIAS também abriga:
- a **palavra micro do dia** (litúrgica — ver seção C);
- as **"palavras guardadas"** (as sementes que a pessoa quis manter);
- o **histórico** de palavras recebidas.

---

## C. Micro-mensagens ambientes (5 segundos)

São o **mesmo motor em "modo transmissão"**, com conteúdo curtíssimo — **não** um sistema novo.
Basta o seletor escolher fichas com `texto_micro`/`tamanho micro`.

### Coerência (a alma da ideia) — em ordem de prioridade

1. **O dia litúrgico** ← maior ganho e quase de graça: o app **já busca a liturgia**
   (`useLiturgy`). A palavra cavalga o Evangelho do dia, o santo do dia, o tempo litúrgico
   (Advento, Quaresma, Páscoa). É a própria Igreja dando a coerência.
2. **O estado da pessoa** — em desolação, consolo; avançando, crescimento.
3. **A estação de vida** — exausto recebe respiro, não tratado.

### Tipos de micro-palavra (gavetinha)
- **Bênção** — "Que a paz de Cristo guarde teu coração hoje."
- **Verso do dia** — uma linha do Evangelho do dia.
- **Frase de santo** — curta, marcante.
- **Pequeno ensinamento** — uma ideia de Caffarel/Catecismo em uma frase.
- **Convite ao exame** — "Como está teu coração agora? Respira: Deus está aqui."
- **Gratidão** — "Pelo que você pode agradecer neste instante?"

### Cuidados (guardrails G7 e G9)
- **Sementes, não salgadinhos**: a micro-palavra aponta para o mais fundo; muitas vezes termina
  com um pequeno convite ("guarde esta palavra hoje" / "leve isto à sua oração").
- **Contenção**: padrão de **uma por dia**, com controle de frequência e horários de silêncio.
  Tom de bênção, nunca de marketing.
