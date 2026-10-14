/* Núcleo do protótipo: estado, regras, componentes comuns e navegação.
   As telas se registram com C.tela(nome, fn, opções) e as ações com C.acao(nome, fn). */
window.C = (function () {
  'use strict';

  var D = window.CMB, I = window.ICONE;
  var CHAVE = 'combinado.demo.v3';

  /* ================= estado ================= */

  function inicial() {
    return {
      sessao: 'fora',                     // fora | convidado | conta
      conta: { nome: '', celular: '', cor: '#C92B45', pix: '', pixTipo: 'celular' },
      fluxo: 'cadastro',                  // para onde a tela de código leva
      entrou: false, saiu: false,
      datas: { marc: {}, enviado: false, fechado: false },
      teto: { valor: 600, enviado: false },
      casa: { voto: null, fechado: false },
      sinal: { pago: false },
      resumo: false, levar: {}, vistoAtividade: 0,
      notif: { prazos: true, decisoes: true, pagamentos: true, resumo: false, silencio: true },
      priv: { nomeNosVotos: true },
      criadas: [], rascunho: null
    };
  }
  var E = inicial();
  (function carregar() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.datas && s.conta) Object.assign(E, s);
    } catch (e) { /* sem armazenamento: segue com o estado inicial */ }
  })();
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { /* idem */ } }
  function zerar() { var n = inicial(); Object.keys(E).forEach(function (k) { delete E[k]; }); Object.assign(E, n); salvar(); }

  /* ================= regras da viagem de exemplo ================= */

  function fimVencedor() {
    var melhor = null, mv = -1;
    D.FINS.forEach(function (f) {
      var n = f.podem.length + (E.datas.marc[f.id] === true ? 1 : 0);
      if (n > mv) { mv = n; melhor = f; }
    });
    return melhor;
  }
  function quemVai() { var f = fimVencedor(), l = []; if (E.datas.marc[f.id] === true) l.push('voce'); return l.concat(f.podem); }
  function minOutros() { return Math.min.apply(null, Object.keys(D.TETOS).map(function (k) { return D.TETOS[k]; })); }
  function faixa() { return E.teto.enviado ? Math.min(minOutros(), E.teto.valor) : minOutros(); }
  function seuTetoEhOMenor() { return E.teto.enviado && E.teto.valor < minOutros(); }
  function porPessoa(c, n) { return Math.round(c.total / (n || quemVai().length)); }
  function dentro(c) { return porPessoa(c) <= faixa(); }
  function casaPor(id) { return D.CASAS.filter(function (c) { return c.id === id; })[0]; }
  function votosDe(c) { var v = c.votos.slice(); if (E.casa.voto === c.id) v.push('voce'); return v; }
  function casaVencedora() {
    var ok = D.CASAS.filter(dentro);
    ok.sort(function (a, b) { return (votosDe(b).length - votosDe(a).length) || (a.total - b.total); });
    return ok[0] || null;
  }
  function pagantes() {
    var l = D.PAGARAM_SINAL.slice();
    if (E.sinal.pago) l.unshift('voce');
    return l.filter(function (p) { return quemVai().indexOf(p) >= 0; });
  }
  function devendo() { var pg = pagantes(); return quemVai().filter(function (p) { return pg.indexOf(p) < 0; }); }
  function podeCasa() { return E.datas.fechado && E.teto.enviado; }
  function tudo() { return E.datas.fechado && E.teto.enviado && E.casa.fechado && E.sinal.pago; }
  function feitas() { return [E.datas.fechado, E.teto.enviado, E.casa.fechado, E.sinal.pago].filter(Boolean).length; }
  function pendencias() {
    var p = [];
    if (!E.datas.enviado) p.push({ r: 'datas', t: 'Marcar os fins de semana', s: 'fecha quarta, 20h', c: 'c1', ic: 'calendario' });
    if (!E.teto.enviado) p.push({ r: 'teto', t: 'Guardar seu teto', s: 'só você vê o valor', c: 'c2', ic: 'cadeado' });
    if (podeCasa() && !E.casa.fechado) p.push({ r: 'casas', t: 'Votar na casa', s: 'fecha quinta, 22h', c: 'c1', ic: 'casa' });
    if (E.casa.fechado && !E.sinal.pago) p.push({ r: 'sinal', t: 'Pagar o sinal', s: 'garante a sua vaga', c: 'c3', ic: 'cofre' });
    return p;
  }
  function proximo() {
    var p = pendencias();
    if (p.length) return p[0].r;
    if (E.datas.enviado && !E.datas.fechado) return 'datas';
    return 'combinado';
  }

  /* ================= utilidades e componentes ================= */

  function brl(v) { return 'R$ ' + Number(v).toLocaleString('pt-BR'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function iniciais(n) {
    var p = String(n || '').trim().split(/\s+/).filter(Boolean);
    if (!p.length) return '';
    return (p.length > 1 ? p[0][0] + p[1][0] : p[0].slice(0, 2)).toUpperCase();
  }
  function primeiroNome() { return String(E.conta.nome || '').trim().split(/\s+/)[0] || ''; }
  function pessoa(id) {
    var p = D.PESSOAS[id];
    if (id !== 'voce') return p;
    return { nome: primeiroNome() ? esc(primeiroNome()) : 'Você', ini: iniciais(E.conta.nome) || 'VC', bg: E.conta.cor || p.bg, fg: '#FFFFFF' };
  }
  function nomes(l, eu) {
    var n = l.map(function (p) { return p === 'voce' ? (eu || 'você') : D.PESSOAS[p].nome; });
    if (n.length < 2) return n.join('');
    return n.slice(0, -1).join(', ') + ' e ' + n[n.length - 1];
  }
  function rosto(id, cls, z) {
    var p = pessoa(id);
    return '<span class="rosto ' + (cls || '') + '" style="z-index:' + (z || 0) + ';background:' + p.bg + ';color:' + p.fg + '" title="' + p.nome + '" aria-hidden="true">' + p.ini + '</span>';
  }
  function rostos(l, cls) { return '<span class="rostos">' + l.map(function (id, i) { return rosto(id, cls, l.length - i); }).join('') + '</span>'; }
  function logo(cor) {
    return '<span class="logo" style="color:' + (cor || 'inherit') + '">c<span class="s" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#1E2629" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>mbinado<span class="oculto">Combinado</span></span>';
  }
  function barra(sup, titulo, volta, extra) {
    return '<header class="barra"><button class="voltar" data-ir="' + (volta == null ? 'viagem' : volta) + '" aria-label="Voltar">' + I('voltar', 20, '#1E2629', 2.4) + '</button>' +
      '<span class="barra-tit">' + (sup ? '<b>' + sup + '</b>' : '') + (titulo || D.VIAGEM) + '</span>' + (extra || '') + '</header>';
  }
  function prazo(html, mar) { return '<p class="prazo' + (mar ? ' mar' : '') + '">' + I('relogio', 18, 'currentColor', 2.2) + '<span>' + html + '</span></p>'; }
  function cta(rotulo, attrs, cls) { return '<button class="cta ' + (cls || '') + '" ' + (attrs || '') + '>' + rotulo + '</button>'; }
  function bg(f) { return 'background-image:url(fotos/' + f + '.jpg)'; }
  function chave(id, ligado, rotulo, sub) {
    return '<div class="opcao"><span class="txt"><b>' + rotulo + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' +
      '<button class="chave" role="switch" aria-checked="' + !!ligado + '" aria-label="' + rotulo + '" data-acao="alternar" data-k="' + id + '"><i></i></button></div>';
  }
  function mascaraCelular(v) {
    var d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  /* indicadores: um cartão só, números centrados e separados por fio */
  function kpis(lista) {
    return '<div class="kpis">' + lista.map(function (k) { return '<p><b>' + k[0] + '</b><span>' + k[1] + '</span></p>'; }).join('') + '</div>';
  }
  function promessa(txt) { return '<p class="promessa">' + I('cofre', 20, 'currentColor', 2.1) + '<span>' + txt + '</span></p>'; }
  function linkConvite() { return location.origin + location.pathname.replace(/index\.html$/, '') + '#/convite'; }

  /* ================= registro de telas e ações ================= */

  var TELAS = {}, ACOES = {}, OPC = {};
  function tela(nome, fn, opc) { TELAS[nome] = fn; OPC[nome] = opc || {}; }
  function acao(nome, fn) { ACOES[nome] = fn; }

  var PUBLICAS = { abertura: 1, cadastro: 1, entrar: 1, codigo: 1, 'bem-vindo': 1, convite: 1, termos: 1 };
  var app, dock, tab, status, modalEl, rotaAnterior = null, limpezas = [], statusSobreFoto = false;

  // quando a foto do topo sai de cena, a barra de status ganha fundo e texto escuro
  function ajustarStatus() {
    var capa = app && app.querySelector('.capa, .galeria, .festa, .abertura');
    var limite = capa ? capa.offsetHeight - 82 : 0;   // a folha creme sobe uns 36 px sobre a foto
    var rolou = app && app.scrollTop > limite;
    status.className = 'status' + (statusSobreFoto && !rolou ? ' claro' : ' fundo');
  }

  function rota() {
    var r = (location.hash || '').replace(/^#\/?/, '').split('/');
    return { nome: r[0] || '', param: r.slice(1).join('/') };
  }
  function ir(r) {
    var atual = (location.hash || '').replace(/^#\/?/, '');
    if (atual === r) render(); else location.hash = '#/' + r;
  }
  function aoSair(fn) { limpezas.push(fn); }

  function guarda(r) {
    if (E.sessao === 'fora' && !PUBLICAS[r.nome]) return 'abertura';
    if (E.sessao === 'convidado' && (r.nome === 'abertura' || r.nome === 'entrar')) return '';
    if (E.sessao === 'convidado' && r.nome === 'nova') return 'cadastro';
    if (E.sessao === 'conta' && (r.nome === 'abertura' || r.nome === 'entrar' || r.nome === 'cadastro' || r.nome === 'bem-vindo')) return '';
    if (r.nome === 'codigo' && E.sessao === 'conta' && E.fluxo !== 'trocar') return '';
    var daViagem = { viagem: 1, datas: 1, teto: 1, casas: 1, casa: 1, sinal: 1, combinado: 1, grupo: 1, sair: 1 };
    if (daViagem[r.nome] && !E.entrou) return 'convite';
    if (daViagem[r.nome] && E.saiu && r.nome !== 'viagem') return 'viagem';
    return null;
  }

  function desenharTab(ativa) {
    if (!ativa) { tab.hidden = true; return; }
    tab.hidden = false;
    var novas = Math.max(0, eventos().length - (E.vistoAtividade || 0));
    tab.innerHTML = [['inicio', '', 'casa', 'Início'], ['atividade', 'atividade', 'sino', 'Atividade'], ['cofre', 'cofre', 'cofre', 'Cofre'], ['perfil', 'perfil', 'usuario', 'Perfil']].map(function (t) {
      var on = t[0] === ativa;
      return '<a href="#/' + t[1] + '"' + (on ? ' aria-current="page"' : '') + '><span class="ic">' + I(t[2], 22, on ? '#AE3A0B' : '#646E71', 2.1) +
        (t[0] === 'atividade' && novas && !on ? '<i class="bolinha"></i>' : '') + '</span>' + t[3] + '</a>';
    }).join('');
  }

  function render() {
    var r = rota();
    if (!TELAS[r.nome]) r = { nome: '', param: '' };
    var desvio = guarda(r);
    if (desvio !== null) { location.replace('#/' + desvio); return; }
    // limpezas registradas pela tela só rodam quando se sai dela, não a cada redesenho
    var mudou = (r.nome + '/' + r.param) !== rotaAnterior;
    limpezas.splice(0).forEach(function (f) { if (mudou) { try { f(); } catch (e) { /* ignora */ } } });
    fecharModal(true);
    var t = TELAS[r.nome](r.param) || {};
    app.innerHTML = t.html || '';
    dock.innerHTML = t.dock || '';
    dock.className = 'dock' + (t.semTab ? ' sem-tab' : '') + (t.semTab && t.claro ? ' sobre-foto' : '');
    desenharTab(t.semTab ? null : (t.tab || 'inicio'));
    // barra de status: sobre foto fica transparente e clara; nas demais, tem fundo próprio
    statusSobreFoto = !!t.claro;
    ajustarStatus();
    document.title = (OPC[r.nome].titulo ? OPC[r.nome].titulo + ' · ' : '') + 'Combinado';
    app.parentNode.scrollTop = 0; // a moldura nunca rola, só a tela dentro dela
    var k = r.nome + '/' + r.param;
    if (k !== rotaAnterior) {
      app.scrollTop = 0;
      if (rotaAnterior !== null) app.focus({ preventScroll: true });
      rotaAnterior = k;
    }
    if (t.depois) t.depois();
  }

  /* ================= aviso e janela de confirmação ================= */

  var tAviso;
  function avisar(msg, ic) {
    var a = document.getElementById('aviso');
    a.innerHTML = I(ic || 'check', 18, '#FFC23D', 2.6) + '<span>' + msg + '</span>';
    a.classList.add('on');
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { a.classList.remove('on'); }, 2800);
  }
  function copiar(txt, msg) {
    var ok = function () { avisar(msg); };
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(txt).then(ok, ok); return; } } catch (e) { /* segue */ }
    ok();
  }
  /* m = { titulo, texto, ok: rótulo, acao: nome da ação, perigo: bool, opcoes: [[ícone, rótulo, attrs]] } */
  function modal(m) {
    var h = '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="m-tit" tabindex="-1"><span class="pega" aria-hidden="true"></span>' +
      '<h2 class="h2" id="m-tit">' + m.titulo + '</h2>' + (m.texto ? '<p class="lead">' + m.texto + '</p>' : '');
    if (m.opcoes) {
      h += '<div class="menu" style="margin-top:14px">' + m.opcoes.map(function (o) {
        return '<button class="menu-it' + (o[3] ? ' perigo' : '') + '" ' + o[2] + '><span class="ic">' + I(o[0], 19, 'currentColor', 2.1) + '</span><span class="tx">' + o[1] + '</span>' + I('seta', 16, '#646E71', 2.4) + '</button>';
      }).join('') + '</div><button class="btn2" style="margin-top:12px" data-acao="fechar-modal">Fechar</button>';
    } else {
      h += '<div class="sheet-bts"><button class="cta' + (m.perigo ? ' perigo' : '') + '" data-acao="' + m.acao + '">' + m.ok + '</button>' +
        '<button class="btn2" data-acao="fechar-modal">' + (m.cancelar || 'Cancelar') + '</button></div>';
    }
    modalEl.innerHTML = h + '</div>';
    modalEl.hidden = false;
    requestAnimationFrame(function () { modalEl.classList.add('on'); });
    // o foco vai para a janela, e não para o botão destrutivo: Enter por engano não apaga nada
    modalEl.querySelector('.sheet').focus({ preventScroll: true });
  }
  function fecharModal(imediato) {
    if (!modalEl || modalEl.hidden) return;
    modalEl.classList.remove('on');
    if (imediato) { modalEl.hidden = true; modalEl.innerHTML = ''; return; }
    setTimeout(function () { modalEl.hidden = true; modalEl.innerHTML = ''; }, 200);
  }

  /* ================= atividade (compartilhada entre telas) ================= */

  function eventos() {
    var ev = [], f = fimVencedor(), cv = E.casa.fechado ? casaVencedora() : null;
    E.criadas.slice().reverse().forEach(function (v) { ev.push({ q: 'Agora', ic: 'festa', c: 'amarelo', t: '<b>Você</b> criou a viagem ' + esc(v.nome) + '.', s: 'Esperando o grupo responder' }); });
    if (E.saiu) ev.push({ q: 'Agora', ic: 'sair', c: 'cinza', t: '<b>Você</b> saiu da viagem ' + D.VIAGEM + '.', s: 'A vaga foi oferecida ao Téo' });
    if (E.casa.fechado && devendo().length) ev.push({ q: 'Agora', ic: 'sino', c: 'pessego', t: 'Lembrete automático para o <b>' + nomes(devendo()) + '</b>: o sinal vence sexta.', s: 'Ninguém precisou cobrar' });
    if (E.sinal.pago) ev.push({ q: 'Agora', ic: 'cofre', c: 'mar', t: '<b>Você</b> pagou o sinal. ' + pagantes().length + ' de ' + quemVai().length + ' já estão dentro.', s: 'O dinheiro foi para o cofre da viagem' });
    if (cv) ev.push({ q: 'Agora', ic: 'casa', c: 'mar', t: 'Todo mundo votou: <b>' + cv.nome + '</b>.', s: 'A decisão fechou sem esperar o prazo' });
    if (E.teto.enviado) ev.push({ q: 'Agora', ic: 'cadeado', c: 'mar', t: '<b>Você</b> guardou o teto. A faixa do grupo é até ' + brl(faixa()) + '.', s: 'O seu valor fica só com você' });
    if (E.datas.fechado) ev.push({ q: 'Agora', ic: 'calendario', c: 'mar', t: 'Datas combinadas: <b>' + f.q + '</b>. O Téo ficou como interessado.', s: 'Silêncio não conta como sim' });
    if (E.datas.enviado) ev.push({ q: 'Agora', ic: 'check', c: 'cinza', t: '<b>Você</b> marcou os fins de semana.', s: 'Faltava a sua resposta e a do Téo' });
    if (E.entrou) ev.push({ q: 'Hoje', ic: 'maisgente', c: 'amarelo', t: '<b>' + pessoa('voce').nome + '</b> entrou pelo convite da Ju.', s: 'Pelo link do grupo' });
    ev.push({ q: 'Hoje', ic: 'sino', c: 'pessego', t: 'Lembrete automático para o <b>Téo</b>: as datas fecham quarta, às 20h.', s: 'Enviado pelo Combinado, não por um amigo' });
    ev.push({ q: 'Hoje', ic: 'cadeado', c: 'mar', t: '<b>5 pessoas</b> guardaram o teto.', s: 'Os valores ficam com cada um' });
    ev.push({ q: 'Esta semana', ic: 'calendario', c: 'cinza', t: '<b>Ju, Rafa, Bia, Caio e Duda</b> marcaram as datas.', s: 'Há 2 dias' });
    ev.push({ q: 'Esta semana', ic: 'festa', c: 'amarelo', t: '<b>A Ju</b> criou a viagem ' + D.VIAGEM + ' e chamou o grupo.', s: 'Há 3 dias' });
    return ev;
  }
  function itemFeed(e) { return '<li><span class="ic ' + e.c + '">' + I(e.ic, 18, 'currentColor', 2.2) + '</span><p>' + e.t + '<small>' + e.s + '</small></p></li>'; }

  /* ================= eventos globais ================= */

  acao('fechar-modal', function () { fecharModal(); return true; });
  acao('recomecar', function () {
    zerar(); fecharModal(true);
    if (location.hash === '#/abertura') render(); else location.hash = '#/abertura';
    avisar('Demonstração recomeçada.'); return true;
  });

  function iniciar() {
    app = document.getElementById('app'); dock = document.getElementById('dock'); tab = document.getElementById('tab');
    status = document.getElementById('status'); modalEl = document.getElementById('modal');
    app.addEventListener('scroll', ajustarStatus, { passive: true });

    document.addEventListener('click', function (ev) {
      if (ev.target === modalEl) { fecharModal(); return; }
      var b = ev.target.closest('[data-ir],[data-acao]');
      if (!b || b.disabled || b.getAttribute('aria-disabled') === 'true') return;
      if (b.hasAttribute('data-ir')) { ev.preventDefault(); ir(b.getAttribute('data-ir')); return; }
      var f = ACOES[b.dataset.acao];
      if (!f) return;
      ev.preventDefault();
      var feito = f(b, ev);
      salvar();
      if (!feito) render();
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') fecharModal(); });
    window.addEventListener('hashchange', render);

    var cred = document.getElementById('creditos');
    if (cred) {
      var vistos = {};
      cred.innerHTML = Object.keys(D.FOTOS).map(function (k) { return D.FOTOS[k]; }).filter(function (n) { if (vistos[n]) return false; vistos[n] = 1; return true; })
        .map(function (n) { return '<li>' + n + ', via Unsplash</li>'; }).join('');
    }
    var acaoInicial = cenas();
    render();
    // ?acao=nome abre uma janela da tela já desenhada (usado nas figuras e na revisão)
    if (acaoInicial && ACOES[acaoInicial]) setTimeout(function () { ACOES[acaoInicial]({ dataset: {} }); }, 50);
  }

  /* cenas para as figuras do documento: ?cena=nome&solo=1 */
  function cenas() {
    var q = new URLSearchParams(location.search);
    if (q.get('solo') === '1') document.body.classList.add('solo');
    if (q.get('alto') === '1') document.body.classList.add('alto');
    var c = q.get('cena');
    if (!c) return null;
    zerar();
    var conta = function () { E.sessao = 'conta'; E.conta.nome = 'Lucca'; E.conta.celular = '(11) 98765-4321'; };
    var marcar = function () { E.datas.marc = { f1: false, f2: true, f3: true, f4: false }; };
    var dentroV = function () { conta(); E.entrou = true; };
    var base = function () { dentroV(); marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.enviado = true; };
    var fim = function () { base(); E.casa.voto = 'c1'; E.casa.fechado = true; E.sinal.pago = true; };
    var r = '';
    var tabela = {
      abertura: function () { r = 'abertura'; },
      cadastro: function () { E.conta.nome = 'Lucca Pacios'; E.conta.celular = '(11) 98765-4321'; r = 'cadastro'; },
      entrar: function () { r = 'entrar'; },
      codigo: function () { E.conta.celular = '(11) 98765-4321'; r = 'codigo'; },
      'bem-vindo': function () { E.conta.nome = 'Lucca Pacios'; E.conta.celular = '(11) 98765-4321'; r = 'bem-vindo'; },
      convite: function () { r = 'convite'; },
      viagens: function () { conta(); r = ''; },
      inicio: function () { dentroV(); r = 'viagem'; },
      datas: function () { dentroV(); marcar(); r = 'datas'; },
      'datas-fim': function () { dentroV(); marcar(); E.datas.enviado = E.datas.fechado = true; r = 'datas'; },
      teto: function () { dentroV(); marcar(); E.datas.enviado = E.datas.fechado = true; r = 'teto'; },
      'teto-ok': function () { dentroV(); marcar(); E.datas.enviado = E.datas.fechado = true; E.teto.enviado = true; r = 'teto'; },
      casas: function () { base(); E.casa.voto = 'c1'; r = 'casas'; },
      casa: function () { base(); E.casa.voto = 'c1'; r = 'casa/c1'; },
      'casas-fora': function () { base(); E.teto.valor = 300; r = 'casas'; },
      sinal: function () { base(); E.casa.voto = 'c1'; E.casa.fechado = true; r = 'sinal'; },
      combinado: function () { fim(); E.levar = { protetor: true }; r = 'combinado'; },
      resumo: function () { fim(); E.levar = { protetor: true }; E.resumo = true; r = 'combinado'; },
      grupo: function () { fim(); r = 'grupo'; },
      sair: function () { fim(); r = 'sair'; },
      atividade: function () { fim(); r = 'atividade'; },
      cofre: function () { fim(); r = 'cofre'; },
      perfil: function () { fim(); r = 'perfil'; },
      notificacoes: function () { fim(); r = 'notificacoes'; },
      privacidade: function () { fim(); r = 'privacidade'; },
      ajuda: function () { fim(); r = 'ajuda'; },
      'cofre-vazio': function () { conta(); r = 'cofre'; },
      'datas-enviado': function () { dentroV(); marcar(); E.datas.enviado = true; r = 'datas'; },
      'casas-trava': function () { dentroV(); r = 'casas'; },
      'sinal-trava': function () { base(); r = 'sinal'; },
      'combinado-parcial': function () { dentroV(); marcar(); E.datas.enviado = E.datas.fechado = true; r = 'combinado'; },
      saiu: function () { fim(); E.saiu = true; r = 'viagem'; },
      'viagens-saiu': function () { fim(); E.saiu = true; r = ''; },
      convidado: function () { E.sessao = 'convidado'; E.conta.nome = 'Bia'; E.entrou = true; r = ''; },
      'perfil-convidado': function () { E.sessao = 'convidado'; E.conta.nome = 'Bia'; E.entrou = true; r = 'perfil'; },
      'convite-logado': function () { conta(); r = 'convite'; },
      passada: function () { conta(); r = 'passada'; },
      criada: function () { conta(); E.criadas = [{ id: 'demo', nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: ['d3', 'd4'], prazoDatas: 3, prazoVoto: 2, sinal: 150 }]; r = 'v/demo'; },
      'viagens-cheia': function () { fim(); E.criadas = [{ id: 'demo', nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: ['d3', 'd4'], prazoDatas: 3, prazoVoto: 2, sinal: 150 }]; r = ''; },
      conta: function () { fim(); r = 'conta'; },
      pagamentos: function () { fim(); r = 'pagamentos'; },
      termos: function () { conta(); r = 'termos'; },
      'cadastro-erro': function () { r = 'cadastro'; },
      'nova-2-vazia': function () { fim(); E.rascunho = { passo: 2, nome: 'Réveillon 2027', destino: '', capa: 'capa', fins: [], prazoDatas: 3, prazoVoto: 2, sinal: 150 }; r = 'nova/2'; },
      'nova-1': function () { fim(); E.rascunho = { passo: 1, nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: [], prazoDatas: 3, prazoVoto: 2, sinal: 150 }; r = 'nova/1'; },
      'nova-2': function () { fim(); E.rascunho = { passo: 2, nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: ['d3', 'd4'], prazoDatas: 3, prazoVoto: 2, sinal: 150 }; r = 'nova/2'; },
      'nova-3': function () { fim(); E.rascunho = { passo: 3, nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: ['d3', 'd4'], prazoDatas: 3, prazoVoto: 2, sinal: 150 }; r = 'nova/3'; },
      'nova-4': function () { fim(); E.rascunho = { passo: 4, nome: 'Réveillon 2027', destino: 'Ilha Grande', capa: 'praia', fins: ['d3', 'd4'], prazoDatas: 3, prazoVoto: 2, sinal: 150 }; r = 'nova/4'; }
    };
    if (tabela[c]) tabela[c]();
    salvar();
    history.replaceState(null, '', location.pathname + (q.get('solo') === '1' ? '?solo=1' + (q.get('alto') === '1' ? '&alto=1' : '') : '') + '#/' + r);
    return q.get('acao');
  }

  return {
    D: D, I: I, E: E, salvar: salvar, zerar: zerar, inicial: inicial,
    fimVencedor: fimVencedor, quemVai: quemVai, faixa: faixa, seuTetoEhOMenor: seuTetoEhOMenor, porPessoa: porPessoa, dentro: dentro,
    casaPor: casaPor, votosDe: votosDe, casaVencedora: casaVencedora, pagantes: pagantes, devendo: devendo, podeCasa: podeCasa,
    tudo: tudo, feitas: feitas, pendencias: pendencias, proximo: proximo,
    brl: brl, esc: esc, iniciais: iniciais, primeiroNome: primeiroNome, pessoa: pessoa, nomes: nomes, rosto: rosto, rostos: rostos,
    logo: logo, kpis: kpis, promessa: promessa, barra: barra, prazo: prazo, cta: cta, bg: bg, chave: chave, mascaraCelular: mascaraCelular, linkConvite: linkConvite,
    eventos: eventos, itemFeed: itemFeed,
    tela: tela, acao: acao, ir: ir, render: render, rota: rota, aoSair: aoSair, avisar: avisar, copiar: copiar, modal: modal, fecharModal: fecharModal,
    iniciar: iniciar
  };
})();
