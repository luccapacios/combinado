(function () {
  'use strict';

  /* ---------------- dados da viagem de exemplo ---------------- */

  var CHAVE = 'combinado.demo.v1';
  var SINAL = 150;
  var PRAZO_RESTANTE = '13 de novembro';

  var PESSOAS = {
    voce: { nome: 'Você', ini: 'VC', bg: '#0B6B5D', fg: '#FFFFFF' },
    ju:   { nome: 'Ju',   ini: 'JU', bg: '#F6D5C4', fg: '#7A3216' },
    rafa: { nome: 'Rafa', ini: 'RA', bg: '#CFDDF6', fg: '#1D3F7A' },
    bia:  { nome: 'Bia',  ini: 'BI', bg: '#E5D3F0', fg: '#5A2A78' },
    caio: { nome: 'Caio', ini: 'CA', bg: '#F3E2B8', fg: '#6B4C05' },
    duda: { nome: 'Duda', ini: 'DU', bg: '#CDEBDD', fg: '#145C41' },
    teo:  { nome: 'Téo',  ini: 'TE', bg: '#E3E1DC', fg: '#45504D' }
  };
  var GRUPO = ['voce', 'ju', 'rafa', 'bia', 'caio', 'duda', 'teo'];

  // o Téo nunca responde: é o silêncio que não pode virar "sim"
  var FINS = [
    { id: 'f1', q: '6 a 8 de novembro',   s: 'sexta a domingo',  podem: ['ju', 'bia', 'duda'] },
    { id: 'f2', q: '13 a 15 de novembro', s: 'sexta a domingo',  podem: ['ju', 'rafa', 'caio'] },
    { id: 'f3', q: '20 a 22 de novembro', s: 'feriado na sexta', podem: ['ju', 'rafa', 'bia', 'caio', 'duda'] },
    { id: 'f4', q: '27 a 29 de novembro', s: 'sexta a domingo',  podem: ['rafa', 'bia', 'caio'] }
  ];
  var RESPONDERAM_DATAS = ['ju', 'rafa', 'bia', 'caio', 'duda'];

  // tetos secretos dos outros: nunca aparecem na interface, só a faixa (o menor)
  var TETOS = { ju: 700, rafa: 520, bia: 900, caio: 650, duda: 800 };

  var CASAS = [
    { id: 'c1', nome: 'Casa da Itamambuca', lugar: 'Ubatuba', det: '3 quartos, 7 camas · 5 min a pé da praia', total: 2940, votos: ['ju', 'bia', 'caio'], arte: 'mar' },
    { id: 'c2', nome: 'Sobrado no centro histórico', lugar: 'Paraty', det: '3 quartos, 6 camas · praia de barco', total: 3060, votos: ['rafa', 'duda'], arte: 'sol' },
    { id: 'c3', nome: 'Casa pé na areia', lugar: 'Praia Vermelha, Ubatuba', det: '4 quartos · piscina', total: 4680, votos: [], arte: 'mata' }
  ];

  var PAGARAM_SINAL = ['ju', 'rafa', 'bia', 'duda']; // o Caio ainda não

  /* ---------------- estado ---------------- */

  function inicial() {
    return {
      datas: { marc: {}, enviado: false, fechado: false },
      teto: { valor: 600, enviado: false },
      casa: { voto: null, fechado: false },
      sinal: { pago: false },
      resumo: false
    };
  }

  var E = carregar();

  function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.datas && s.teto && s.casa && s.sinal) return s;
    } catch (e) { /* sem armazenamento: segue com o estado inicial */ }
    return inicial();
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* idem */ }
  }

  /* ---------------- derivados ---------------- */

  function fimVencedor() {
    var melhor = null, mv = -1;
    FINS.forEach(function (f) {
      var n = f.podem.length + (E.datas.marc[f.id] === true ? 1 : 0);
      if (n > mv) { mv = n; melhor = f; }
    });
    return melhor;
  }
  function quemVai() {
    var f = fimVencedor();
    var l = [];
    if (E.datas.marc[f.id] === true) l.push('voce');
    return l.concat(f.podem);
  }
  function faixa() {
    var v = Object.keys(TETOS).map(function (k) { return TETOS[k]; });
    if (E.teto.enviado) v.push(E.teto.valor);
    return Math.min.apply(null, v);
  }
  function seuTetoEhOMenor() {
    var outros = Math.min.apply(null, Object.keys(TETOS).map(function (k) { return TETOS[k]; }));
    return E.teto.enviado && E.teto.valor < outros;
  }
  function porPessoa(c, n) { return Math.round(c.total / (n || quemVai().length)); }
  function dentro(c) { return porPessoa(c) <= faixa(); }
  function votosDe(c) {
    var v = c.votos.slice();
    if (E.casa.voto === c.id) v.push('voce');
    return v;
  }
  function casaVencedora() {
    var ok = CASAS.filter(dentro);
    ok.sort(function (a, b) { return (votosDe(b).length - votosDe(a).length) || (a.total - b.total); });
    return ok[0] || null;
  }
  function pagantes() {
    var l = PAGARAM_SINAL.slice();
    if (E.sinal.pago) l.unshift('voce');
    return l.filter(function (p) { return quemVai().indexOf(p) >= 0; });
  }
  function podeCasa() { return E.datas.fechado && E.teto.enviado; }

  /* ---------------- utilidades ---------------- */

  function brl(v) { return 'R$ ' + v.toLocaleString('pt-BR'); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nomes(l) {
    var n = l.map(function (p) { return p === 'voce' ? 'você' : PESSOAS[p].nome; });
    if (n.length < 2) return n.join('');
    return n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1];
  }
  function rosto(id, pq, fora, z) {
    var p = PESSOAS[id];
    return '<span class="rosto' + (pq ? ' pq' : '') + (fora ? ' fora' : '') + '" style="z-index:' + (z || 0) + ';background:' + p.bg + ';color:' + p.fg +
      '" title="' + esc(p.nome) + '" aria-hidden="true">' + p.ini + '</span>';
  }
  function rostos(l, pq, extra) {
    return '<span class="rostos"' + (pq ? ' style="margin-top:0"' : '') + '>' + l.map(function (id, i) { return rosto(id, pq, false, l.length - i); }).join('') + (extra || '') + '</span>';
  }

  var I = {
    voltar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    seta: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    relogio: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A5300" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    cadeado: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B6B5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    checkGrande: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F5F1E8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    sino: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B6B5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
    cofre: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B6B5D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="14" rx="2.5"/><circle cx="12" cy="12.5" r="3"/><path d="M12 9.5v-1M7 19.5v1.5M17 19.5v1.5"/></svg>'
  };

  var ARTE = {
    mar: '<svg viewBox="0 0 350 104" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="350" height="104" fill="#CFE6E0"/><circle cx="276" cy="34" r="16" fill="#F4C66A"/><path d="M0 62 Q 60 52 120 60 T 240 58 T 350 60 V104 H0z" fill="#3E8F81"/><path d="M0 76 Q 70 66 140 74 T 280 72 T 350 74 V104 H0z" fill="#0B6B5D"/><path d="M0 92 Q 80 84 170 90 T 350 88 V104 H0z" fill="#EAD9B5"/></svg>',
    sol: '<svg viewBox="0 0 350 104" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="350" height="104" fill="#F6E1BC"/><circle cx="90" cy="40" r="18" fill="#E9A23B"/><path d="M0 70 L60 44 L120 66 L190 38 L260 64 L350 46 V104 H0z" fill="#B7814A"/><path d="M0 84 Q 90 74 180 82 T 350 80 V104 H0z" fill="#2F6F86"/><rect x="200" y="58" width="34" height="22" fill="#FFF7EA"/><path d="M196 60 L217 46 L238 60z" fill="#C85A3A"/></svg>',
    mata: '<svg viewBox="0 0 350 104" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="350" height="104" fill="#D7E7D3"/><path d="M0 64 Q 50 30 110 58 Q 170 26 240 56 Q 300 32 350 52 V104 H0z" fill="#4F8A5B"/><path d="M0 82 Q 90 70 180 80 T 350 78 V104 H0z" fill="#1F7A8C"/><path d="M0 96 Q 120 88 240 94 T 350 92 V104 H0z" fill="#EFE0BF"/></svg>'
  };

  /* ---------------- pedaços de interface ---------------- */

  function barra(titulo) {
    return '<header class="barra"><button class="voltar" data-ir="" aria-label="Voltar para a viagem">' + I.voltar +
      '</button><span class="barra-tit">' + esc(titulo || 'Praia em novembro') + '</span></header>';
  }
  function prazo(html) { return '<p class="prazo">' + I.relogio + '<span>' + html + '</span></p>'; }

  /* ---------------- telas ---------------- */

  function telaViagem() {
    var pend = [];
    if (!E.datas.enviado) pend.push(['datas', 'Marcar os fins de semana que você pode']);
    if (!E.teto.enviado) pend.push(['teto', 'Guardar seu teto, em segredo']);
    if (podeCasa() && !E.casa.fechado) pend.push(['casas', 'Votar na casa']);
    if (E.casa.fechado && !E.sinal.pago) pend.push(['sinal', 'Pagar o sinal e garantir a vaga']);

    var f = fimVencedor(), cv = casaVencedora(), n = quemVai().length;

    var etapas = [
      {
        n: 1, nome: 'Datas', ir: 'datas',
        st: E.datas.fechado ? 'ok' : (E.datas.enviado ? 'espera' : 'vez'),
        det: E.datas.fechado ? '<b>' + f.q + '</b> · ' + n + ' pessoas podem'
          : (E.datas.enviado ? 'Você respondeu. Fecha quarta, 20h.' : 'Fecha quarta, 20h · 5 de 7 responderam')
      },
      {
        n: 2, nome: 'Orçamento', ir: 'teto',
        st: E.teto.enviado ? 'ok' : 'vez',
        det: E.teto.enviado ? 'Faixa do grupo: <b>até ' + brl(faixa()) + '</b> por pessoa' : 'Seu teto fica em segredo · 5 de 7 guardaram'
      },
      {
        n: 3, nome: 'Casa', ir: 'casas',
        st: E.casa.fechado ? 'ok' : (podeCasa() ? 'vez' : 'trava'),
        det: E.casa.fechado && cv ? '<b>' + cv.nome + '</b> · ' + brl(porPessoa(cv)) + ' por pessoa'
          : (podeCasa() ? 'Votação fecha quinta, 22h' : '3 opções esperando a faixa do grupo'),
        trava: 'Depois do orçamento'
      },
      {
        n: 4, nome: 'Quem vai', ir: 'sinal',
        st: E.sinal.pago ? 'ok' : (E.casa.fechado ? 'vez' : 'trava'),
        det: E.sinal.pago ? '<b>' + pagantes().length + ' de ' + n + '</b> com sinal pago'
          : (E.casa.fechado ? pagantes().length + ' de ' + n + ' pagaram o sinal' : 'Entra na conta quem paga o sinal'),
        trava: 'Depois da casa'
      }
    ];

    var rotSt = { ok: 'Combinado', vez: 'Sua vez', espera: 'Aguardando', trava: '' };
    var clsSt = { ok: 'ok', vez: 'suavez-e', espera: 'trava', trava: 'trava' };

    var h = '<div class="tela topo">';
    h += '<p class="rotulo">Viagem · 7 pessoas</p><h1 class="h1">Praia em novembro</h1>';
    h += '<p class="lead">Ubatuba ou Paraty. Ideia da Ju, há 3 dias.</p>';
    h += rostos(GRUPO);

    if (pend.length) {
      h += '<section class="suavez" aria-labelledby="sv"><p class="rotulo">Sua vez</p><h2 id="sv">' +
        (pend.length === 1 ? '1 decisão espera por você' : pend.length + ' decisões esperam por você') + '</h2>';
      pend.forEach(function (p) {
        h += '<button class="tarefa" data-ir="' + p[0] + '"><span class="bola" aria-hidden="true"></span><span class="t">' + p[1] + '</span>' + I.seta + '</button>';
      });
      h += '</section>';
    } else {
      h += '<section class="resultado" style="margin-top:24px"><p class="rotulo">Tudo certo</p><p class="grande">Tá combinado.</p>' +
        '<p>Nada espera por você. Os lembretes de pagamento saem sozinhos.</p></section>';
    }

    h += '<section class="sec" aria-labelledby="pl"><p class="rotulo" id="pl">' + (pend.length || !E.sinal.pago ? 'O que falta combinar' : 'O que o grupo combinou') + '</p><ol class="placar">';
    etapas.forEach(function (e) {
      var st = e.st === 'trava' ? e.trava : rotSt[e.st];
      h += '<li class="etapa ' + (e.st === 'ok' ? 'ok' : e.st === 'trava' ? 'trava' : '') + '"><button data-ir="' + e.ir + '">' +
        '<span class="n">' + e.n + '</span><span class="nome">' + e.nome + '</span><span class="estado ' + clsSt[e.st] + '">' + st + '</span>' +
        '<span class="det">' + e.det + '</span></button></li>';
    });
    h += '</ol>';
    h += '<button class="ligacao" data-ir="combinado">Ver o que já ficou combinado ' + I.seta + '</button></section>';
    h += '<p class="miudo" style="margin-top:auto;padding-top:20px"><button class="link-reset" style="margin:0;font-size:13px" data-acao="recomecar">Recomeçar a demonstração</button></p>';
    h += '</div>';
    return h;
  }

  function telaDatas() {
    var h = barra() + '<div class="tela">';
    h += '<p class="rotulo">Etapa 1 de 4 · Datas</p><h1 class="h1">Quais fins de semana você pode?</h1>';
    h += '<p class="lead">Marque todos em que você consegue ir. Ninguém precisa justificar.</p>';

    if (E.datas.fechado) {
      var f = fimVencedor(), q = quemVai();
      h += '<section class="resultado"><p class="rotulo">Datas combinadas</p><p class="grande">' + f.q + '</p>' +
        '<p>' + q.length + ' pessoas podem. O Téo não respondeu até o prazo e ficou como interessado: entra depois, se houver vaga. Silêncio não conta como sim.</p>' +
        '<ul class="lista-mini"><li>' + rostos(q, true) + '<span>' + nomes(q) + '</span></li>' +
        '<li>' + rosto('teo', true, true) + '<span>Téo, interessado</span></li></ul></section>';
      if (E.datas.marc[f.id] !== true) {
        h += '<p class="prazo">' + I.relogio + '<span>Você marcou que não pode nessa data. Fica como interessado, como o Téo.</span></p>';
      }
      h += '<div class="acoes"><button class="btn" data-ir="">Voltar para a viagem</button></div></div>';
      return h;
    }

    h += prazo('Fecha <b>quarta, às 20h</b>. Quem não responder fica fora da contagem: silêncio não conta como sim.');
    h += '<ul class="fins">';
    FINS.forEach(function (f) {
      var m = E.datas.marc[f.id];
      var podem = f.podem.slice();
      if (m === true) podem.unshift('voce');
      var resp = RESPONDERAM_DATAS.length + (m === undefined ? 0 : 1);
      h += '<li class="fim"><div><p class="q">' + f.q + '</p><p class="s">' + f.s + '</p></div>' +
        '<div class="par" role="group" aria-label="' + f.q + '">' +
        '<button class="sim" data-acao="data" data-f="' + f.id + '" data-v="1" aria-pressed="' + (m === true) + '"' + (E.datas.enviado ? ' disabled' : '') + '>Posso</button>' +
        '<button class="nao" data-acao="data" data-f="' + f.id + '" data-v="0" aria-pressed="' + (m === false) + '"' + (E.datas.enviado ? ' disabled' : '') + '>Não posso</button></div>' +
        '<p class="quem">' + rostos(podem, true) + '<span>' + podem.length + ' de ' + resp + ' podem</span></p></li>';
    });
    h += '</ul>';

    if (E.datas.enviado) {
      h += '<section class="resultado espera"><p class="rotulo">Resposta enviada</p>' +
        '<p>Só falta o Téo. A decisão fecha quarta, às 20h, com quem respondeu.</p></section>';
      h += '<div class="acoes"><button class="btn demo" data-acao="fechar-datas">Avançar até o prazo (demonstração)</button>' +
        '<button class="btn sec-btn" data-ir="">Voltar para a viagem</button></div>';
    } else {
      var faltam = FINS.filter(function (f) { return E.datas.marc[f.id] === undefined; }).length;
      h += '<div class="acoes"><button class="btn" data-acao="enviar-datas"' + (faltam ? ' disabled' : '') + '>' +
        (faltam ? 'Marque os ' + faltam + ' fins de semana restantes' : 'Enviar minhas datas') + '</button></div>';
      if (faltam === 4) h = h.replace('Marque os 4 fins de semana restantes', 'Marque os 4 fins de semana');
      if (faltam === 1) h = h.replace('Marque os 1 fins de semana restantes', 'Falta 1 fim de semana');
    }
    h += '</div>';
    return h;
  }

  function telaTeto() {
    var h = barra() + '<div class="tela">';
    h += '<p class="rotulo">Etapa 2 de 4 · Orçamento</p><h1 class="h1">Até quanto você pode gastar com a casa?</h1>';
    h += '<p class="lead">Valor por pessoa, só a hospedagem. É o teto que vale antes de qualquer casa aparecer.</p>';

    if (E.teto.enviado) {
      h += '<section class="resultado"><p class="rotulo">Faixa do grupo</p><p class="grande">até ' + brl(faixa()) + ' por pessoa</p>' +
        '<p>' + (seuTetoEhOMenor()
          ? 'Seu teto é o menor do grupo. Só você sabe disso: para os outros, aparece apenas a faixa.'
          : '6 de 7 guardaram o teto. A faixa é o menor deles, e ninguém sabe de quem é. Nem você.') + '</p></section>';
      h += '<div class="segredo">' + I.cadeado + '<p>Você guardou <b>' + brl(E.teto.valor) + '</b>. Esse número só aparece aqui, na sua tela.</p></div>';
      h += '<div class="acoes"><button class="btn" data-ir="' + (E.datas.fechado ? 'casas' : '') + '">' +
        (E.datas.fechado ? 'Ver as casas na faixa' : 'Voltar para a viagem') + '</button>' +
        (E.casa.fechado ? '' : '<button class="btn sec-btn" data-acao="rever-teto">Rever meu teto</button>') + '</div></div>';
      return h;
    }

    var p = ((E.teto.valor - 200) / 1000) * 100;
    h += '<section class="cofre" aria-label="Seu teto">';
    h += '<p class="valor" id="valor"><small>R$</small>' + E.teto.valor.toLocaleString('pt-BR') + '</p>';
    h += '<p class="valor-sub">por pessoa, pelo fim de semana</p>';
    h += '<label class="oculto" for="teto">Seu teto por pessoa</label>';
    h += '<input class="slider" id="teto" type="range" min="200" max="1200" step="10" value="' + E.teto.valor + '" style="--p:' + p + '%" aria-valuetext="' + brl(E.teto.valor) + '">';
    h += '<div class="escala"><span>R$ 200</span><span>R$ 1.200</span></div>';
    h += '<div class="atalhos" role="group" aria-label="Valores rápidos">';
    [300, 450, 600, 800].forEach(function (v) {
      h += '<button data-acao="teto-rapido" data-v="' + v + '" aria-pressed="' + (E.teto.valor === v) + '">' + brl(v) + '</button>';
    });
    h += '</div></section>';
    h += '<div class="segredo">' + I.cadeado + '<p><b>Ninguém vê esse número, nem quem organiza.</b> O grupo só vê a faixa que cabe em todo mundo. Casa acima dela sai da votação sem que alguém precise dizer que achou caro.</p></div>';
    h += '<p class="miudo" style="margin-top:14px">5 de 7 já guardaram o teto.</p>';
    h += '<div class="acoes"><button class="btn" data-acao="enviar-teto">Guardar em segredo</button></div></div>';
    return h;
  }

  function telaCasas() {
    var h = barra() + '<div class="tela">';
    h += '<p class="rotulo">Etapa 3 de 4 · Casa</p><h1 class="h1">Qual casa?</h1>';

    if (!podeCasa()) {
      h += '<p class="lead">As casas aparecem quando as datas fecham e todo mundo guarda o teto. Assim o preço já chega dividido e dentro da faixa, e ninguém precisa dizer que achou caro.</p>';
      h += '<ul class="lista-mini" style="margin-top:20px;border-color:var(--fio)">' +
        '<li style="border-color:var(--fio)">' + (E.datas.fechado ? I.check : '<span class="bola" style="width:14px;height:14px;border:2px solid var(--fio-forte);border-radius:50%"></span>') + '<span>Datas ' + (E.datas.fechado ? 'combinadas' : 'em aberto') + '</span></li>' +
        '<li style="border-color:var(--fio)">' + (E.teto.enviado ? I.check : '<span class="bola" style="width:14px;height:14px;border:2px solid var(--fio-forte);border-radius:50%"></span>') + '<span>Seu teto ' + (E.teto.enviado ? 'guardado' : 'ainda não guardado') + '</span></li></ul>';
      h += '<div class="acoes"><button class="btn" data-ir="' + (!E.datas.enviado || !E.datas.fechado ? 'datas' : 'teto') + '">' +
        (!E.datas.fechado ? 'Ir para as datas' : 'Guardar meu teto') + '</button></div></div>';
      return h;
    }

    var n = quemVai().length, f = fimVencedor();
    var ok = CASAS.filter(dentro), fora = CASAS.filter(function (c) { return !dentro(c); });

    if (E.casa.fechado) {
      var cv = casaVencedora(), outra = ok.filter(function (c) { return c !== cv; })[0];
      h += '<section class="resultado"><p class="rotulo">Casa escolhida</p><p class="grande">' + cv.nome + '</p>' +
        '<p>' + (outra && votosDe(outra).length === votosDe(cv).length
          ? 'Empate em ' + votosDe(cv).length + ' votos, e valeu a regra combinada antes: venceu a mais barata.'
          : votosDe(cv).length + ' votos' + (outra ? ' a ' + votosDe(outra).length : '') + '.') +
        ' Todo mundo votou, então a decisão fechou na hora, sem esperar o prazo.</p></section>';
      h += '<div class="conta"><div class="linha"><span>' + cv.lugar + ', ' + f.q + '</span><b>' + brl(cv.total) + '</b></div>' +
        '<div class="linha total"><span>Por pessoa, com ' + n + '</span><b>' + brl(porPessoa(cv)) + '</b></div></div>';
      h += '<div class="acoes"><button class="btn" data-ir="sinal">Pagar o sinal e garantir a vaga</button></div></div>';
      return h;
    }

    h += '<p class="lead">Preço já dividido pelas ' + n + ' pessoas que podem em ' + f.q + '.</p>';
    h += prazo('Votação fecha <b>quinta, às 22h</b>, ou antes, se todo mundo votar. Empate: vence a mais barata.');

    if (!ok.length) {
      h += '<section class="acima" style="margin-top:20px"><p class="rotulo">Nenhuma casa na faixa</p><p><b>Seu teto ficou abaixo de todas as opções.</b> Só você vê este aviso. Quem organiza recebe apenas que é preciso buscar casas mais baratas, sem saber de quem é o limite.</p></section>';
      h += '<div class="acoes"><button class="btn sec-btn" data-acao="rever-teto">Rever meu teto</button></div></div>';
      return h;
    }

    h += '<div class="casas">';
    ok.forEach(function (c) {
      var v = votosDe(c), meu = E.casa.voto === c.id;
      h += '<article class="casa' + (meu ? ' votada' : '') + '"><div class="foto">' + ARTE[c.arte] + '</div><div class="corpo">' +
        '<h2 class="nome">' + c.nome + '</h2><p class="onde">' + c.lugar + ' · ' + c.det + '</p>' +
        '<p class="faixa-ok">' + I.check + 'Cabe na faixa do grupo</p>' +
        '<div class="preco"><span class="pp">' + brl(porPessoa(c)) + '<small>por pessoa</small></span><span class="tot">' + brl(c.total) + '<br>2 noites</span></div>' +
        '<div class="votos"><span class="miudo">' + (v.length ? rostos(v, true) : '') + v.length + (v.length === 1 ? ' voto' : ' votos') + '</span>' +
        '<button class="votar" data-acao="votar" data-c="' + c.id + '" aria-pressed="' + meu + '">' + (meu ? 'Seu voto' : 'Votar nessa') + '</button></div>' +
        '</div></article>';
    });
    h += '</div>';

    if (fora.length) {
      h += '<section class="acima"><p class="rotulo">Fora da faixa</p><p><b>' + (fora.length === 1 ? '1 casa ficou' : fora.length + ' casas ficaram') +
        ' acima da faixa do grupo.</b> ' + fora.map(function (c) { return c.nome + ', ' + brl(porPessoa(c)) + ' por pessoa'; }).join('; ') +
        '. Não entra na votação, e ninguém precisa explicar por quê.</p></section>';
    }

    h += '<div class="acoes"><button class="btn" data-acao="confirmar-voto"' + (E.casa.voto ? '' : ' disabled') + '>' +
      (E.casa.voto ? 'Confirmar meu voto' : 'Escolha uma casa para votar') + '</button></div></div>';
    return h;
  }

  function telaSinal() {
    var h = barra() + '<div class="tela">';
    h += '<p class="rotulo">Etapa 4 de 4 · Quem vai</p><h1 class="h1">Tô dentro, com sinal</h1>';

    if (!E.casa.fechado) {
      h += '<p class="lead">O sinal abre quando a casa estiver escolhida. É ele que transforma o "tô dentro" em vaga garantida.</p>';
      h += '<div class="acoes"><button class="btn" data-ir="' + (podeCasa() ? 'casas' : '') + '">' + (podeCasa() ? 'Ir para a votação' : 'Voltar para a viagem') + '</button></div></div>';
      return h;
    }

    var cv = casaVencedora(), n = quemVai().length, pp = porPessoa(cv);

    if (E.sinal.pago) {
      h += '<section class="resultado"><p class="rotulo">Vaga garantida</p><p class="grande">Você está dentro.</p>' +
        '<p>Seu sinal entrou no cofre da viagem. ' + pagantes().length + ' de ' + n + ' já pagaram. O restante, ' + brl(pp - SINAL) + ', vence em ' + PRAZO_RESTANTE + '.</p></section>';
      h += '<div class="acoes"><button class="btn" data-ir="combinado">Ver o que ficou combinado</button></div></div>';
      return h;
    }

    h += '<p class="lead">Até pagar o sinal, você aparece como interessado. A casa é dividida só entre quem pagou.</p>';
    h += '<div class="conta">' +
      '<div class="linha"><span>' + cv.nome + ', 2 noites</span><b>' + brl(cv.total) + '</b></div>' +
      '<div class="linha"><span>Dividido por ' + n + ' pessoas</span><b>' + brl(pp) + '</b></div>' +
      '<div class="linha total"><span>Sinal agora</span><b>' + brl(SINAL) + '</b></div>' +
      '<div class="linha"><span>Restante até ' + PRAZO_RESTANTE + '</span><b>' + brl(pp - SINAL) + '</b></div></div>';
    h += '<p class="auto">' + I.cofre + '<span>O sinal vai para o cofre da viagem. Quando o cofre cobre a entrada da casa, a reserva é paga. Ninguém adianta do próprio bolso.</span></p>';
    h += '<section class="pix"><p class="rotulo">Pix copia e cola</p><code>DEMONSTRACAO.COMBINADO.PRAIA-NOVEMBRO.SINAL-150</code>' +
      '<button class="btn sec-btn" data-acao="copiar-pix">Copiar código Pix</button></section>';
    h += '<div class="acoes"><button class="btn" data-acao="pagar">Já paguei</button>' +
      '<p class="miudo" style="text-align:center">Pagamento de demonstração: nenhum dinheiro é movimentado.</p></div></div>';
    return h;
  }

  function telaCombinado() {
    var f = fimVencedor(), cv = E.casa.fechado ? casaVencedora() : null, q = quemVai(), n = q.length;
    var tudo = E.datas.fechado && E.teto.enviado && E.casa.fechado && E.sinal.pago;
    var pg = pagantes(), devendo = q.filter(function (p) { return pg.indexOf(p) < 0; });

    var h = barra() + '<div class="tela">';
    h += '<div class="recibo-topo">' + (tudo ? '<div class="carimbo">' + I.checkGrande + '</div>' : '') +
      '<h1 class="h1" style="margin-top:' + (tudo ? '18px' : '8px') + '">' + (tudo ? 'Tá combinado.' : 'O combinado até agora') + '</h1>' +
      '<p class="lead">' + (tudo ? 'Tudo o que o grupo decidiu, num lugar só. Ninguém precisa rolar a conversa.' : 'O que já foi decidido fica aqui. O resto aparece conforme fecha.') + '</p></div>';

    function item(k, v, sub) {
      return '<div class="item"><span class="k">' + k + '</span><span class="v">' + v + (sub ? '<small>' + sub + '</small>' : '') + '</span></div>';
    }
    var aberto = '<span style="color:var(--tinta-3);font-weight:500">Ainda em aberto</span>';

    h += '<section class="recibo">';
    h += item('Quando', E.datas.fechado ? f.q : aberto, E.datas.fechado ? f.s : '');
    h += item('Onde', cv ? cv.nome : aberto, cv ? cv.lugar + ' · ' + cv.det : '');
    h += item('Quanto', cv ? brl(porPessoa(cv)) + ' por pessoa' : (E.teto.enviado ? 'Faixa até ' + brl(faixa()) : aberto),
      cv ? 'Sinal de ' + brl(SINAL) + ' e ' + brl(porPessoa(cv) - SINAL) + ' até ' + PRAZO_RESTANTE : (E.teto.enviado ? 'por pessoa, só hospedagem' : ''));
    h += item('Quem vai', E.datas.fechado ? rostos(q, true) : aberto,
      E.datas.fechado ? 'Téo não respondeu e ficou como interessado.' + (cv ? ' Se ele entrar, cai para ' + brl(porPessoa(cv, n + 1)) + '.' : '') : '');
    if (E.casa.fechado) {
      var arrec = pg.length * SINAL, meta = n * SINAL;
      h += '<div class="item"><span class="k">Cofre</span><span class="v">' + brl(arrec) + ' de ' + brl(meta) +
        '<small>' + pg.length + ' de ' + n + ' pagaram o sinal</small><span class="barra-pg"><i style="width:' + Math.round(arrec / meta * 100) + '%"></i></span>' +
        (devendo.length ? '<span class="auto">' + I.sino + '<span>' + nomes(devendo) + (devendo.length > 1 ? ' ainda não pagaram' : ' ainda não pagou') + '. O lembrete sai sozinho amanhã, às 10h. Ninguém precisa cobrar.</span></span>' : '') +
        '</span></div>';
    }
    h += '</section>';

    if (tudo) {
      if (E.resumo) {
        h += '<section class="zap" aria-label="Prévia da mensagem"><p class="rotulo">Prévia no grupo</p><div class="balao">' + esc(textoResumo()) + '</div></section>';
      }
      h += '<div class="acoes"><button class="btn" data-acao="resumo">Mandar o resumo no grupo</button>' +
        '<button class="btn sec-btn" data-ir="">Voltar para a viagem</button></div>';
    } else {
      h += '<div class="acoes"><button class="btn" data-ir="">Voltar para a viagem</button></div>';
    }
    h += '</div>';
    return h;
  }

  function textoResumo() {
    var f = fimVencedor(), cv = casaVencedora(), pp = porPessoa(cv);
    var pg = pagantes(), devendo = quemVai().filter(function (p) { return pg.indexOf(p) < 0; });
    // na mensagem é o próprio usuário quem fala: "você" vira "eu", no fim da lista
    var pgEu = pg.filter(function (p) { return p !== 'voce'; });
    if (pg.indexOf('voce') >= 0) pgEu.push('voce');
    return 'Tá combinado: Praia em novembro\n' +
      f.q + ' (' + f.s + ')\n' +
      cv.nome + ', ' + cv.lugar + '\n' +
      brl(pp) + ' por pessoa: sinal de ' + brl(SINAL) + ' agora e ' + brl(pp - SINAL) + ' até ' + PRAZO_RESTANTE + '\n' +
      'Sinal pago: ' + nomes(pgEu).replace('você', 'eu') +
      (devendo.length ? '. ' + nomes(devendo) + (devendo.length > 1 ? ' ainda não pagaram' : ' ainda não pagou') : '') + '.\n' +
      'O resto está no Combinado.';
  }

  /* ---------------- roteamento e eventos ---------------- */

  var TELAS = { '': telaViagem, datas: telaDatas, teto: telaTeto, casas: telaCasas, sinal: telaSinal, combinado: telaCombinado };
  var TITULOS = { '': 'Viagem', datas: 'Datas', teto: 'Orçamento', casas: 'Casa', sinal: 'Quem vai', combinado: 'O combinado' };
  var app = document.getElementById('app');
  var rotaAnterior = null;

  function rota() { return (location.hash || '').replace(/^#\/?/, ''); }

  function render() {
    var r = rota();
    if (!TELAS[r]) r = '';
    app.innerHTML = TELAS[r]();
    app.parentNode.scrollTop = 0; // a moldura nunca rola, só a tela dentro dela
    document.title = (TITULOS[r] === 'Viagem' ? '' : TITULOS[r] + ' · ') + 'Combinado';
    if (r !== rotaAnterior) {
      app.scrollTop = 0;
      if (rotaAnterior !== null) app.focus({ preventScroll: true });
      rotaAnterior = r;
    }
    var s = document.getElementById('teto');
    if (s) s.addEventListener('input', aoMoverTeto);
  }

  function ir(r) {
    if (rota() === r) render();
    else location.hash = '#/' + r;
  }

  function aoMoverTeto(ev) {
    var v = +ev.target.value;
    E.teto.valor = v; salvar();
    document.getElementById('valor').innerHTML = '<small>R$</small>' + v.toLocaleString('pt-BR');
    ev.target.style.setProperty('--p', ((v - 200) / 1000) * 100 + '%');
    ev.target.setAttribute('aria-valuetext', brl(v));
    Array.prototype.forEach.call(document.querySelectorAll('[data-acao="teto-rapido"]'), function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.v === v));
    });
  }

  var tAviso;
  function avisar(msg) {
    var a = document.getElementById('aviso');
    a.textContent = msg; a.classList.add('on');
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { a.classList.remove('on'); }, 2600);
  }
  function copiar(txt, msg) {
    var ok = function () { avisar(msg); };
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(ok, ok); return; }
    } catch (e) { /* segue */ }
    ok();
  }

  var ACOES = {
    data: function (b) { E.datas.marc[b.dataset.f] = b.dataset.v === '1'; },
    'enviar-datas': function () { E.datas.enviado = true; avisar('Datas enviadas.'); },
    'fechar-datas': function () { E.datas.fechado = true; },
    'teto-rapido': function (b) { E.teto.valor = +b.dataset.v; },
    'enviar-teto': function () { E.teto.enviado = true; avisar('Teto guardado em segredo.'); },
    'rever-teto': function () { E.teto.enviado = false; E.casa.voto = null; ir('teto'); return true; },
    votar: function (b) { E.casa.voto = b.dataset.c; },
    'confirmar-voto': function () { E.casa.fechado = true; avisar('Voto confirmado. Todo mundo votou.'); },
    'copiar-pix': function () { copiar('DEMONSTRACAO.COMBINADO.PRAIA-NOVEMBRO.SINAL-150', 'Código copiado. É de demonstração.'); return true; },
    pagar: function () { E.sinal.pago = true; avisar('Sinal recebido no cofre.'); },
    resumo: function () { E.resumo = true; copiar(textoResumo(), 'Resumo copiado. É só colar no grupo.'); },
    recomecar: function () { E = inicial(); salvar(); ir(''); avisar('Demonstração recomeçada.'); return true; }
  };

  var SOBE = { 'fechar-datas': 1, 'enviar-teto': 1, 'confirmar-voto': 1, pagar: 1 };

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ir],[data-acao]');
    if (!b || b.disabled) return;
    if (b.hasAttribute('data-ir')) { ir(b.getAttribute('data-ir')); return; }
    var f = ACOES[b.dataset.acao];
    if (!f) return;
    var jaRenderizou = f(b);
    salvar();
    if (!jaRenderizou) render();
    // quando uma decisão fecha, o resultado aparece no topo da tela
    if (SOBE[b.dataset.acao]) app.scrollTop = 0;
    if (b.dataset.acao === 'resumo') {
      var z = app.querySelector('.zap');
      if (z) z.scrollIntoView({ block: 'center' });
    }
  });

  window.addEventListener('hashchange', render);

  /* ---------------- cenas para as figuras do documento ---------------- */

  (function cenas() {
    var q = new URLSearchParams(location.search);
    if (q.get('solo') === '1') document.body.classList.add('solo');
    if (q.get('alto') === '1') document.body.classList.add('alto');
    var c = q.get('cena');
    if (!c) return;
    E = inicial();
    var marcar = function () { E.datas.marc = { f1: false, f2: true, f3: true, f4: false }; };
    var r = '';
    switch (c) {
      case 'inicio': break;
      case 'datas': marcar(); r = 'datas'; break;
      case 'datas-fim': marcar(); E.datas.enviado = E.datas.fechado = true; r = 'datas'; break;
      case 'teto': marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.valor = 600; r = 'teto'; break;
      case 'teto-ok': marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.valor = 600; E.teto.enviado = true; r = 'teto'; break;
      case 'meio': marcar(); E.datas.enviado = E.datas.fechado = true; break;
      case 'casas': marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.enviado = true; E.casa.voto = 'c1'; r = 'casas'; break;
      case 'sinal': marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.enviado = true; E.casa.voto = 'c1'; E.casa.fechado = true; r = 'sinal'; break;
      case 'combinado':
      case 'resumo':
        marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.enviado = true; E.casa.voto = 'c1'; E.casa.fechado = true; E.sinal.pago = true;
        E.resumo = c === 'resumo'; r = 'combinado'; break;
    }
    salvar();
    history.replaceState(null, '', location.pathname + (q.get('solo') === '1' ? '?solo=1' + (q.get('alto') === '1' ? '&alto=1' : '') : '') + (r ? '#/' + r : '#/'));
  })();

  render();
})();
