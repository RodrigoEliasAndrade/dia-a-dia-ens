# 06 — Métricas e Aprendizado

Como o motor **aprende** (ajusta o perfil) e como **avaliamos** o que funciona depois do
lançamento. Tudo com uma humildade de fundo: **medimos proxies de fruto, não a graça.**

## A. O loop de feedback (ajusta o perfil do usuário)

Após entregar uma ficha, o app pergunta **"isto te ajudou?"** (leve, opcional). Sinais e
efeitos:

| Sinal | Efeito no perfil |
|---|---|
| "Sim" / "isto me ajudou" | reforça `pref_registro[ficha.registro]` e `pref_fonte[ficha.fonte]`; marca em `recentes` |
| "Não" → "quer outra abordagem?" | 1-2 perguntas direcionadas; reordena seleção; salva a nova preferência |
| Leu até o fim / tempo de leitura | reforço leve do encaixe |
| Concluiu o PCE depois | sinal forte positivo (a palavra moveu à prática) |
| Voltou ao mesmo estado de novo | sobe `repeticao` → sobe o `degrau` (escada de aprofundamento) |
| "Guardou" a palavra | reforço positivo + vai para "palavras guardadas" |

### Regras do aprendizado
- **Traços devagar, estados na hora.** Ajustes de preferência são incrementais (passos
  pequenos), para não oscilar com um clique isolado.
- **Exploração vs. conforto.** Reservar uma fração das entregas para *explorar* (registro/fonte
  diferente, ou um degrau a mais). O alvo é a santidade, não maximizar "curtidas". (Guardrail
  implícito: não viciar a pessoa no que só agrada.)
- **Maturidade cresce.** `maturidade_estimada` pode subir com o tempo (constância, conclusão de
  PCEs, aceitação de conteúdo mais fundo).

## B. Métricas agregadas (para a curadoria e o ajuste do motor)

Coletadas por ficha e por estado (anônimas/agregadas):

- `vezes_mostrada`, `ajudou`, `nao_ajudou` → **taxa de ajuda** por ficha.
- Distribuição de **registro** e **fonte** que mais ajudam, por perfil → revela quais níveis
  de "profundidade de conexão" são realmente úteis (pode-se descobrir que 2 registros bastam,
  ou que um terceiro é inútil).
- **Retomada do PCE** após a palavra (o proxy mais próximo de fruto).
- **Reincidência** por estado (quais dificuldades mais persistem → onde investir conteúdo).
- Eficácia da **escada** (os degraus 2-4 ajudam quando o degrau 1 não bastou?).

### O que NÃO concluir dos números
- Engajamento **não é** conversão. "Voltar ao app" é proxy, não fruto.
- A graça e a mudança do coração **não são mensuráveis**. Os números guiam a curadoria; não
  substituem o discernimento humano (equipe, conselheiro).

## C. Afinação dos pesos do seletor

Os pesos `3/2/2/1/4` (registro/fonte/maturidade/estação/recência) e os limiares da escada
(quantas repetições por degrau) e da cadência (quantos dias até perguntar a razão) são
**parâmetros configuráveis**, não constantes mágicas. Sugestão: mantê-los num único arquivo de
configuração para ajuste fácil à luz das métricas, sem mexer na lógica.

## D. Privacidade nas métricas (guardrail G8)

- Preferir métricas **agregadas/anônimas**.
- Texto livre da aba SABEDORIAS **não** vira métrica de conteúdo; idealmente nem sai do
  dispositivo.
- O usuário deve poder ver e apagar seu histórico (coerente com o `handleExportData` que já
  existe em Configurações).
