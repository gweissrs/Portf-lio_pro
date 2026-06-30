# Guilherme Weiss — Portfólio

Construo sistemas que funcionam em produção. Isso é o que já entreguei.

**[guilhermewrs.dev](https://guilhermewrs.dev)** &nbsp;·&nbsp; Florianópolis, SC &nbsp;·&nbsp; Disponível para estágio

`React · Node.js · PostgreSQL · GSAP · Three.js`

---

## Projetos

### 🥇 Desafio BP Bancos — 1º lugar
O gerente de desenvolvimento da BP Bancos foi ao SESI SENAI e propôs um desafio com prêmio em dinheiro: construir um gateway de pagamento avaliado por benchmark automatizado com 200 transações concorrentes sob stress. O juiz era um script — sem desconto, sem subjetividade. Meu time ficou em primeiro.

`React · Vite · Node.js · Fastify · SQLite · Prisma`
[Repositório](https://github.com/victoroliveira6-ops/RinhaSenai2026FullStack)

---

### Sistema Feirao SP — Captura de pedidos offline-first
A Coana participaria da Consulfarma 2026 (Anhembi, SP) com alta demanda. O pavilhão tinha rede instável — não podia arriscar perder pedidos. Optei por arquitetura offline-first: catálogo local com 97 produtos, sync automático quando a conexão voltava, notificação por e-mail na confirmação. Usado em campo durante 3 dias por atendentes reais com centenas de clientes.

`React · Vite · Supabase · PostgreSQL · Edge Functions · Resend`
[Repositório](https://github.com/gweissrs/Formulario_Consulfarma)

---

### PayReminder — Automação de cobrança em produção
A Coana mandava cobranças uma por uma, manualmente. Construí um sistema que importa planilhas Excel, identifica inadimplência ou vencimento próximo e dispara os lembretes automaticamente. Conduzi as reuniões de ajuste com o cliente e fiquei com a negociação do projeto. Em uso diário pela equipe desde o lançamento.

`HTML · CSS · JavaScript · Node.js · PostgreSQL`
[Repositório](https://github.com/HenriqueSasakiofc/PayReminder) · [Ver ao vivo](https://teleioscode.com)

---

### SmartNotes — Plataforma full-stack de produtividade
App pessoal que virou produto. Mural interativo, editor rich text, calendário e gerenciamento de tabelas relacionais. Implementei autenticação com JWT do zero — nunca tinha feito segurança de aplicação antes; fui aprendendo enquanto construía. Está no ar e qualquer pessoa pode criar uma conta.

`Node.js · Express · PostgreSQL · JWT`
[Ver ao vivo](https://notasinteligentes.netlify.app/login.html) · [Repositório](https://github.com/gweissrs/SmartNotes)

---

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, Vite, GSAP, ScrollTrigger, Three.js, Framer Motion, Canvas API |
| Backend & dados | Node.js, Express, PostgreSQL, Supabase, JWT, Prisma |
| Deploy | Netlify, Railway, Vercel |

---

## Portfólio — Decisões técnicas

O portfólio em si (este repositório) tem algumas decisões que vale documentar.

**Experience section: dual canvas**
A seção usa Three.js para raycasting (hover nos nós) e `geometry.setDrawRange()` como proxy do progresso de scroll. A renderização visual fica em um segundo canvas 2D separado. Renderizar tudo via WebGL me tirava o controle fino sobre efeitos de glow multi-camada por segmento da hélice.

**CustomCursor: isolamento em 3 camadas DOM**
`backdrop-filter` num elemento pai contamina os filhos — o efeito de lente do cursor vazava nos elementos de preview. Separei em três elementos irmãos independentes: lente, fundo do preview e label. Workaround para um comportamento documentado do browser.

**Canvas: agrupamento por cor reduz context switches**
No sistema de partículas holográficas, agrupar por cor antes de renderizar reduziu as chamadas de `ctx.save/restore` de 40 para 3 por frame — e eliminou as reassignments repetidas de `ctx.shadowColor` e `ctx.fillStyle` por iteração.

```js
for (const [color, group] of Object.entries(colorGroups)) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.fillStyle   = color;
  for (const p of group) {
    ctx.globalAlpha = p.alpha;
    ctx.shadowBlur  = p.glowIntensity;
    ctx.beginPath();
    ctx.arc(p.finalX, p.finalY, p.radiusPulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
```

**Boot sequence com session guard**
A animação de entrada roda uma vez por sessão do browser. Usei `sessionStorage` (não `localStorage`) para que o estado expire quando a aba fecha — quem volta no dia seguinte vê a animação de novo; navegação SPA dentro da mesma sessão não repete.

**`prefers-reduced-motion` em todo o projeto**
Cada timeline GSAP, AnimatePresence e loop `requestAnimationFrame` verifica a preferência do sistema. IntersectionObserver pausa os loops de canvas quando os elementos saem do viewport.

---

## Sobre

Trabalho no Hospital Baía Sul como menor aprendiz. Não é tech, mas foi lá que entendi o que responsabilidade em ambiente profissional significa na prática.

Tenho 17 anos. Comecei a programar no início de 2026. Tudo aqui foi construído dentro desse período.

---

## Contato

Se você está construindo algo onde velocidade de execução e iteração importam, quero conversar.
Disponível para estágio a partir de **agosto de 2026**.

**guilhermewrsilva@gmail.com** &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/guilherme-weiss-a996a1350) &nbsp;·&nbsp; [GitHub](https://github.com/gweissrs)
