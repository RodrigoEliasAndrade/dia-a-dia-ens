# 01 — Arquitetura do Motor

O motor tem **4 peças**: a *ficha de conteúdo* (o molde do combustível), o *perfil* (o que o
app aprende da pessoa), a *leitura do momento* (o que ele lê fresco a cada uso) e o *seletor*
(que filtra, pontua e escolhe). Aprendizado fecha o ciclo.

---

## 1. A ficha de conteúdo (o molde)

Cada passagem do banco é uma ficha **atômica**: *uma* peça, *um* registro, *uma* fonte. As
"2-3 interpretações" do mesmo problema são **fichas diferentes** para o mesmo estado — o
seletor escolhe a de melhor encaixe. Isso evita o "produto cartesiano" (não precisamos de uma
ficha para cada combinação possível): etiquetamos e deixamos o seletor achar o melhor encaixe,
com *fallback* gracioso.

Schema completo e exemplo em [`conteudo/_schema.md`](conteudo/_schema.md). Resumo dos campos:

```
FICHA
├─ id                     # identificador único
├─ estado[]               # quais estados pastorais atende
├─ texto                  # versão completa (mostrada dentro do fluxo / SABEDORIAS)
├─ texto_micro            # versão de 5 segundos (notificação ambiente)
├─ fonte                  # Evangelho | Catecismo | ENS/Caffarel | Santo
├─ referencia             # "Mt 11,28" / "CIC 2731" / "São Francisco de Sales"
├─ proximo_passo          # ação pequena, concreta e realista (opcional)
├─ registro               # coracao | cotidiano | reflexivo
├─ maturidade             # iniciante | crescimento | maduro
├─ tom                    # consolar | instruir | exortar
├─ estacao_de_vida[]      # opcional; vazio = universal
├─ degrau                 # 1 consolar · 2 instruir · 3 passo · 4 reconduzir ao humano
├─ status                 # rascunho | aprovado   (← o "imprimatur")
└─ revisao_nota           # observação para o revisor doutrinal (opcional)
```

## 2. O perfil (traços estáveis, aprendidos pelo uso)

Guardado por usuário, ajustado **devagar** pelo feedback. No *cold start*, começa **neutro**.

```
PERFIL
├─ pref_registro   { coracao: 0.0–1.0, cotidiano: …, reflexivo: … }   # default: cotidiano
├─ pref_fonte      { Evangelho: …, Catecismo: …, ENS: …, Santo: … }    # leve viés Evangelho
├─ maturidade_estimada   # iniciante | crescimento | maduro            # default: iniciante
├─ recentes[]      # ids das últimas fichas vistas (para não repetir)
└─ retornos{}      # por estado: quantas vezes voltou (alimenta a escada/degrau)
```

> **Aprenda os traços devagar; leia os estados na hora.** A preferência de linguagem é
> estável. O cansaço de hoje, a desolação de hoje, são *estado*, não traço.

## 3. A leitura do momento (estados, lidos a cada interação)

```
MOMENTO
├─ estado_pastoral   # o que a pessoa enfrenta (vem do toque numa opção — ver item abaixo)
├─ disposicao        # consolacao | desolacao | neutro
├─ estacao_de_vida   # filhos pequenos, luto, sobrecarga…
└─ repeticao         # quantas vezes voltou a este estado → define o degrau alvo
```

> **O menu de razões É o detector de estado.** Em vez de adivinhar por sinais difusos, a
> pessoa toca numa opção e *diz* seu estado. Cada opção mapeia para um `estado_pastoral`.
> Por isso os estados em [`02-estados-pastorais.md`](02-estados-pastorais.md) são, ao mesmo
> tempo, **opções de tela** e **gavetas do banco**.

## 4. O seletor (a inteligência)

### Passo 1 — Pré-filtro (guardrails, regras rígidas)

Descarta fichas que:
- não têm `status: "aprovado"`;
- não atendem o `estado_pastoral` atual;
- violam a disposição: se `disposicao == "desolacao"` → **remover `tom: "exortar"`**;
- não estão no **degrau alvo** (o degrau sobe com `repeticao` — ver "escada" abaixo).

Detalhes e demais regras em [`03-guardrails.md`](03-guardrails.md).

### Passo 2 — Pontuação das fichas sobreviventes

```
nota =  3 · pref_registro[ficha.registro]
      + 2 · pref_fonte[ficha.fonte]
      + 2 · (ficha.maturidade == maturidade_estimada ? 1 : 0)
      + 1 · (ficha.estacao_de_vida casa com o momento ? 1 : 0)
      − 4 · (ficha.id está em recentes ? 1 : 0)
      + ε  (exploração: ocasionalmente favorece algo novo / um degrau a mais)
```

Escolhe a **maior nota**; empate → a menos recente. Os pesos `3/2/2/1/4` são **afináveis**
(ver [`06-metricas-aprendizado.md`](06-metricas-aprendizado.md)).

> **Fallback gracioso:** se nenhuma ficha do registro ideal existe, a pontuação naturalmente
> escolhe a mais próxima. O motor nunca falha por falta de uma combinação exata.

> **Exploração (anti-vício em conforto):** na maior parte das vezes entrega o que funciona,
> mas, no momento certo, oferece algo mais fundo. O alvo é a santidade, não o conforto.

## 5. A escada de aprofundamento (`degrau`)

Quando a pessoa **volta ao mesmo estado** várias vezes, `repeticao` sobe e o degrau alvo sobe
junto. Isto é a *lei da gradualidade* virada algoritmo — e garante que o app saiba a hora de
devolver a pessoa à comunidade e aos sacramentos.

```
1ª vez   → degrau 1: consolar        ("ânimo, recomeça")
2ª–3ª    → degrau 2: instruir        ("a aridez é normal, e até sinal de crescimento")
persiste → degrau 3: passo concreto  (algo ainda menor e realista)
não cede → degrau 4: reconduzir ao humano  (equipe, conselheiro, Reconciliação)
```

A regra exata de "quantas repetições por degrau" é parametrizável; sugestão inicial:
degrau 1 na 1ª vez; degrau 2 da 2ª à 3ª; degrau 3 na 4ª–5ª; degrau 4 a partir da 6ª — sempre
dentro de uma janela de tempo (repetições antigas "esfriam").

---

## Exemplo numérico completo

**Estado:** `abandono-oracao-pessoal` ("abandonei a oração pessoal e estou desanimado").

**Perfil aprendido:** `pref_registro` = {coracao 0.7, cotidiano 0.3, reflexivo 0.0};
`pref_fonte` = {Evangelho 0.6, Santo 0.3, Catecismo 0.1, ENS 0.0}; `maturidade_estimada` =
iniciante.

**Momento:** `disposicao` = desolacao; `repeticao` = 1ª vez → **degrau alvo = 1**;
`estacao` = filhos pequenos.

**Candidatos:**

| Ficha | fonte | registro | tom | degrau | maturidade |
|---|---|---|---|---|---|
| A — "Vinde a mim" (Mt 11,28) | Evangelho | coracao | consolar | 1 | iniciante |
| B — "a oração é um combate" (CIC 2725) | Catecismo | reflexivo | instruir | 2 | crescimento |
| C — "paciência convosco" (S. Francisco de Sales) | Santo | coracao | consolar | 1 | iniciante |
| D — "Pedro afunda, Jesus o segura" (Mt 14,30) | Evangelho | cotidiano | consolar | 1 | iniciante |

**Pré-filtro:** degrau alvo = 1 → **B sai** (degrau 2). *No primeiro contato, consola-se; não
se dá sermão.* Sobram A, C, D.

**Pontuação** (sem repetições recentes → penalidade 0):
- **A:** 3·0.7 + 2·0.6 + 2·1 = **5.3** ✅
- **C:** 3·0.7 + 2·0.3 + 2·1 = **4.7**
- **D:** 3·0.3 + 2·0.6 + 2·1 = **4.1**

**Vence a ficha A** — linguagem do coração + Evangelho + iniciante + consolo: encaixe perfeito
em *quem ela é* e *como ela está*.

**Feedback:**
- App mostra A + **"isto te ajudou?"**
- **"Sim"** → reforça (sobe `pref_registro[coracao]` e `pref_fonte[Evangelho]`); marca A em
  `recentes`.
- **"Não"** → **"quer outra abordagem?"** → 1-2 perguntas direcionadas (ex.: *"prefere uma
  palavra de conforto ou entender por que isso acontece?"*; *"história de um santo ou trecho
  do Evangelho?"*) → reordena a seleção (traz C/D, ou libera o degrau 2 e traz B) e **salva a
  preferência**.

Na próxima vez, a penalidade de recência empurra A para baixo → a pessoa recebe C ou D:
**variação automática**, sem repetir.
