# Schema da Ficha de Conteúdo

Cada ficha é uma peça **atômica** do banco. Um estado tem várias fichas (em fontes, registros,
tons e degraus diferentes). O arquivo de um estado é um **array de fichas** em
`fichas/<id-do-estado>.json`.

## Campos

| Campo | Tipo | Obrigatório | Valores / formato |
|---|---|---|---|
| `id` | string | sim | único, kebab-case. Ex.: `ev-mt1128-coracao` |
| `estado` | string[] | sim | ids de estados que a ficha atende (ver `estados-pastorais.json`) |
| `texto` | string | sim | versão completa, mostrada no fluxo/SABEDORIAS |
| `texto_micro` | string | não | versão de ~5s para notificação ambiente |
| `fonte` | enum | sim | `Evangelho` \| `Catecismo` \| `ENS` \| `Santo` |
| `referencia` | string | sim | "Mt 11,28" / "CIC 2731" / "São Francisco de Sales, Cartas" |
| `proximo_passo` | string | não | ação pequena, concreta, realista |
| `registro` | enum | sim | `coracao` \| `cotidiano` \| `reflexivo` |
| `maturidade` | enum | sim | `iniciante` \| `crescimento` \| `maduro` |
| `tom` | enum | sim | `consolar` \| `instruir` \| `exortar` |
| `estacao_de_vida` | string[] | não | vazio = universal. Ex.: `["filhos-pequenos","luto"]` |
| `degrau` | int | sim | 1 consolar · 2 instruir · 3 passo · 4 reconduzir-ao-humano |
| `status` | enum | sim | `rascunho` \| `aprovado` (só `aprovado` chega ao usuário — G1) |
| `revisao_nota` | string | não | observação para o revisor doutrinal |

## Convenção de `id`

`<fonte-abrev>-<referencia-abrev>-<registro>`
Ex.: `ev-mt1128-coracao`, `cic-2725-reflexivo`, `santo-fsales-coracao`, `ens-fidelidade-cotidiano`.

Abreviações de fonte: `ev` (Evangelho), `cic` (Catecismo), `ens` (ENS/Caffarel), `santo`.

## Notas de registro (como escrever cada nível)

- **coracao** — direto, concreto, imagens, curto. Pouca abstração. Fala ao afeto.
- **cotidiano** — equilíbrio; linguagem comum, alguma explicação.
- **reflexivo** — conceitual, aprofundado; pode citar fontes mais densas e termos teológicos.

## Notas de tom

- **consolar** — acolhe, ergue, dá esperança. Único permitido em desolação (G3).
- **instruir** — explica o "porquê" (ex.: aridez é normal). Degrau 2.
- **exortar** — chama a um passo/conversão. **Proibido em desolação** (G3).

## Exemplo de uma ficha (JSON)

```json
{
  "id": "ev-mt1128-coracao",
  "estado": ["abandono-oracao-pessoal", "cansaco-exaustao"],
  "texto": "Jesus disse: «Vinde a mim, todos vós que estais cansados e sobrecarregados, e eu vos aliviarei» (Mt 11,28). Repare: Ele não está esperando para te cobrar — está esperando para te dar descanso. Voltar à oração não é mais um peso na sua lista; é ir até Aquele que carrega o seu.",
  "texto_micro": "«Vinde a mim, vós que estais cansados, e eu vos aliviarei» (Mt 11,28). Deus te espera para o descanso, não para a cobrança.",
  "fonte": "Evangelho",
  "referencia": "Mt 11,28",
  "proximo_passo": "Hoje, só 3 minutos. Só um Pai-Nosso, sem pressa.",
  "registro": "coracao",
  "maturidade": "iniciante",
  "tom": "consolar",
  "estacao_de_vida": [],
  "degrau": 1,
  "status": "rascunho",
  "revisao_nota": "Confirmar tradução do versículo conforme edição litúrgica adotada."
}
```
