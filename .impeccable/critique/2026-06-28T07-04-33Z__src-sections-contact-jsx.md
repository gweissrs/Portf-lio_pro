---
timestamp: 2026-06-28T07-04-33Z
slug: src-sections-contact-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Nenhum feedback visual de que o link foi ativado/aberto; hover muda cor mas não há estado de "loading" ou confirmação |
| 2 | Match System / Real World | 3 | Linguagem clara ("LinkedIn", "GitHub", "WhatsApp"). Os índices 01/02/03 não carregam informação do mundo real — são decoração |
| 3 | User Control and Freedom | 3 | Links abrem em `_blank`; usuário pode fechar a aba. Sem armadilhas |
| 4 | Consistency and Standards | 3 | Consistente com o restante do portfólio em fontes e acento. O label "CONTATO" no topo é o mesmo padrão das outras seções — que é justamente o problema sistêmico |
| 5 | Error Prevention | 3 | Pouco a errar aqui. O hitbox ampliado (padding: 3rem) reduz cliques acidentais |
| 6 | Recognition Rather Than Recall | 2 | Os links parecem texto decorativo à primeira vista — não há ícone, seta, underline ou qualquer outra dica visual de que são clicáveis |
| 7 | Flexibility and Efficiency | 2 | Sem atalho de teclado nomeado, sem email copiável, sem formulário. Um recrutador que prefere email precisa sair do site |
| 8 | Aesthetic and Minimalist Design | 3 | Limpo. O espaço negativo é intencional. O canvas holográfico no rodapé compete levemente com os links mas não os anula |
| 9 | Error Recovery | 2 | `target="_blank"` sem qualquer indicação visual. Se o link quebrar (WhatsApp no desktop), o usuário vê uma página estranha sem retorno ao portfólio |
| 10 | Help and Documentation | 1 | Nenhuma dica de interação. O efeito magnético é invisível até o usuário descobrir por acaso |
| **Total** | | **24/40** | **Acceptable — melhorias significativas necessárias** |

## Anti-Patterns Verdict

**LLM assessment — Parece AI-gerado?**

Parcialmente. O conceito (links tipográficos gigantes flutuando no espaço) é genuinamente diferente — não é o grid de cards com ícones, não é o formulário de contato Tailwind padrão. A identidade cinética (efeito magnético, holográfico no rodapé) é coerente com o resto do portfólio. Isso salva a seção de parecer genérica no conceito.

Mas dois elementos jogam contra: (1) o label "CONTATO" uppercase tracked em ciano com underline é exatamente o padrão `eyebrow-above-every-section` que está nos absolute bans — não é uma escolha de voz, é o scaffolding de seção-por-seção que aparece em 70%+ das gerações de portfólio; (2) os índices `01 / 02 / 03` nos links não são uma sequência que o usuário precisa conhecer — são decoração que imita a estética "numbered section markers as default scaffolding" que também está banida. São os dois tells mais rápidos de AI scaffolding reflexo.

**Deterministic scan**: Detector retornou 0 findings em Contact.jsx e Contact.module.css. Nenhum padrão proibido detectado automaticamente. As issues aqui são de composição e affordance, não de anti-patterns de código.

## Overall Impression

O conceito é certo: links gigantes tipográficos, efeito magnético, holográfico no rodapé. É uma seção de fechamento com personalidade. O problema é que o conceito está subimplementado em UX e sobreimplementado em decoração reflexa. O visitante não sabe que os três textos brancos enormes são links clicáveis até acidentalmente hover. O cursor especial e o efeito magnético são microinterações ricas que ninguém vai descobrir. E os dois maiores elementos de "personalidade visual" (o label CONTATO e os índices 01/02/03) são justamente os dois padrões mais saturados de AI scaffolding.

A maior oportunidade: tornar os links obviamente clicáveis sem destruir a estética, e substituir o label/índice por algo com voz própria.

## What's Working

**1. O layout posicional flutuante é ousado e funciona em desktop.** Posicionar três links em coordenadas absolutas dentro do viewport cria tensão visual — o olho percorre a página de forma não-linear, e isso é raro. A maioria dos portfólios alinha tudo ao centro ou à esquerda por medo. Aqui há risco estético e ele paga.

**2. O efeito magnético é tecnicamente correto e bem graduado.** A combinação de atração suave (140px) com repulsão ao aproximar (45px) cria uma física que não existe na maioria dos portfólios. O retorno com `elastic.out(1, 0.4)` tem sensação de peso real. Quando descoberto, encanta.

**3. O canvas holográfico no rodapé é uma extensão natural da identidade.** As três linhas com glow layers, partículas strand-anchored, e resposta ao hover do CTA (amplitude boost 3.2x) mostram cuidado técnico genuíno. Não é decoração gratuita — é o sistema holográfico do portfólio se despedindo.

## Priority Issues

**[P1] Os links são indistinguíveis de texto decorativo**

- **O que**: Não há nenhum affordance visual de que "LinkedIn", "GitHub" e "WhatsApp" são clicáveis. Nenhum underline, nenhum ícone, nenhuma seta, nenhum `cursor: pointer` visível (o cursor customizado suprime isso). A `transition: color 0.2s` no hover é o único feedback — mas o usuário precisa estar em hover para ver.
- **Por que importa**: Um recrutador escaneando o portfólio em 60 segundos pode ler "LinkedIn" como label descritivo e passar por cima. O efeito magnético não sinaliza clicabilidade.
- **Fix concreto**: Adicionar um indicador persistente: uma seta diagonal `→` pequena depois do texto, ou um sublinhado fino que aparece animated, ou um ícone SVG mínimo. Algo que diga "isso é um link" antes do hover. Não precisa ser óbvio — pode ser sutil, mas precisa existir em estado idle.
- **Suggested command**: /impeccable delight

**[P1] O círculo branco gigante no screenshot é o cursor em modo `expanded` disparando sobre os próprios links**

- **O que**: O `CustomCursor.jsx` expande o cursor (50px → 80px) no `mouseenter` de qualquer `a, button`. No `previewMode` (hover nos links de contato), o cursor muda para 90px com borda ciano e texto "visitar". Mas o `mouseenter` genérico (`expand`) ainda dispara antes de o evento `cursor:preview` processar, resultando em um frame onde o cursor está no estado `expanded` branco (backdrop-filter invert) antes de transitar para `previewMode`. Em screenshots, esse estado transitório aparece como um círculo branco opaco.
- **Por que importa**: No uso real é rápido demais para incomodar. Mas indica uma race condition no estado do cursor que pode aparecer com conexões lentas ou devtools aberto.
- **Fix concreto**: No `onMouseEnter` dos links de contato, despachar `cursor:preview` antes de qualquer outro handler. Ou no handler `onPreview`, remover `expanded` explicitamente antes de adicionar `previewMode` (já está no código, mas a transição CSS de 0.8s do `expanded` pode vencer a transição de 0.3s do `previewMode`). Reduzir a `transition` de `width/height` do cursor de `0.8s` para `0.2s` elimina a janela do bug.
- **Suggested command**: /impeccable polish

**[P2] O label "CONTATO" e os índices 01/02/03 são AI scaffolding reflexo, não voz**

- **O que**: `.closingLabel` é o padrão eyebrow uppercase tracked-letter acima de seção que está nos absolute bans da skill. Os índices `01 / 02 / 03` nos links são a variante "numbered section markers" também banida. Ambos existem porque "portfólios fazem isso", não porque o Guilherme Weiss tem razão específica para sequenciar seus canais de contato.
- **Por que importa**: Esses são os dois elementos que fazem a seção parecer gerada. Retirar ou substituir por algo com voz eleva a percepção de craft.
- **Fix concreto para o label**: Substituir por uma linha horizontal fina (#06B6D4, opacity 0.3) + sem texto, deixando o título falar sozinho. Ou usar o número de anos como contexto: "17 anos. Florianópolis." em tipografia pequena — isso é voz, não scaffolding.
- **Fix concreto para os índices**: Remover completamente, ou substituir por um ícone SVG mínimo do canal (marca do LinkedIn, do GitHub, do WhatsApp em 14px traço fino) — isso acrescenta reconhecimento visual sem decoração reflexa.
- **Suggested command**: /impeccable distill

**[P2] `.closingSubtitle` tem contraste insuficiente**

- **O que**: `color: #475569` sobre `background: #0A0A0A`. Contraste calculado: aproximadamente 3.1:1 para texto de 0.88rem — abaixo do mínimo WCAG AA de 4.5:1 para texto pequeno.
- **Por que importa**: O recrutador que escaneia rapidamente em monitor de baixa calibração ou com brilho reduzido pode não ler "Disponível para estágio e projetos freelance." — que é exatamente a informação mais importante da seção do ponto de vista de conversão.
- **Fix concreto**: Usar `--color-text-secondary` que é `#94A3B8` (contraste ~6.5:1 sobre #0A0A0A) em vez de `#475569`. Já existe no design system.
- **Suggested command**: /impeccable audit

**[P3] Sem fallback de email**

- **O que**: Os três canais são LinkedIn (requer conta), GitHub (requer conta), WhatsApp (requer instalação em desktop). Nenhum é um canal de contato universal. Um recrutador corporativo com política de TI que bloqueia WhatsApp e sem LinkedIn ativo está sem saída.
- **Por que importa**: Para o objetivo declarado (conseguir estágio), email é o canal de conversão mais provável em processos seletivos formais.
- **Fix concreto**: Adicionar um quarto canal "Email" com `mailto:` — não precisa quebrar o layout. Pode ser um texto menor abaixo dos três links principais, ou um quarto link no grid flutuante.
- **Suggested command**: /impeccable shape

## Persona Red Flags

**Jordan (Recrutador primeira visita — adaptação do First-Timer)**

Jordan é tech lead de uma empresa de médio porte. Abriu o portfólio do LinkedIn. Está em um MacBook, mas usa o trackpad sem mover muito o mouse.

- Jordan rola até a seção de contato. Vê três palavras grandes: "LinkedIn", "GitHub", "WhatsApp". Lê como informação descritiva sobre onde o Guilherme está, não como links.
- Jordan não descobre que são clicáveis porque não passa o mouse sobre elas — não há dica de interação em idle state.
- Jordan vai para a navbar para encontrar um link de contato. Não encontra. Fecha o site.
- O efeito magnético existe mas Jordan nunca saberá disso.

**Sam (Usuário de teclado / acessibilidade)**

- Tab navigation: os três links são `<a>` com `href`, então são focáveis via Tab. Ponto positivo.
- Mas o focus indicator padrão foi removido globalmente (`cursor: none !important` afeta o estilo geral) sem adicionar `:focus-visible` styles no CSS do Contact. Sam vê o link focado mas sem indicação visual de onde o foco está.
- O efeito magnético é completamente inacessível — é um enhancement visual puro, o que está correto. Mas os índices `01/02/03` com `color: #334155` têm contraste ~2.4:1, o que viola WCAG para qualquer texto.
- O canvas `aria-hidden="true"` está correto.

**Casey (Mobile — Distracted User)**

- No mobile, o CSS remove as posições absolutas e empilha os links verticalmente. Isso funciona. Mas:
- `font-size: clamp(2.2rem, 8vw, 3rem)` em viewport de 375px = ~30px. Toca na linha dos 44pt de touch target apenas marginalmente.
- O `channelIndex` em mobile vira `display: inline-block` antes do texto — em português "01 LinkedIn" parece um número de lista, não um índice decorativo. Ambiguidade gratuita.
- O `.holographicWrap` tem `height: 40vh` e `overflow: visible` — em mobile pode causar scroll horizontal se o canvas exceder o viewport.

## Minor Observations

- `line-height: 0.95` no `.closingTitle` é muito fechado para um título de 2–3rem. Em displays de baixa resolução ou quando há quebra de linha ("Vamos construir / algo juntos."), as linhas se tocam. 1.0–1.05 seria mais seguro.
- O efeito de repulsão (mouse dentro de 45px) é um detalhe de microinteração muito bem executado, mas o `factor` negativo no código (`-((REPEL_RADIUS - dist) / REPEL_RADIUS) * MAX_MOVE`) cria uma inversão abrupta de direção. Pode parecer buggy para quem entra no raio de repulsão sem perceber que está se aproximando muito.
- `elastic.out(1, 0.4)` no retorno dos links (quando o mouse sai do raio de atração) é tecnicamente correto, mas tem um leve bounce que não existe em mais lugar algum do portfólio. Consistência de easing preferível: `expo.out` ou `power3.out` como nas outras seções.
- O `ctaHovering` é passado ao `ContactLines` como `ref` (não state), o que é correto para performance. Mas o `useEffect` em `ContactLines` não lista `ctaHovering` nas deps — funciona porque é um ref, mas o pattern pode confundir futuros leitores do código.
- Sem `rel="noopener noreferrer"` já presente — ótimo. Confirmado no código.
