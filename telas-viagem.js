/* Telas da viagem: início, viagem, decisões, recibo, grupo, sair, viagem passada,
   viagem criada e o assistente de criar viagem. */
(function (C) {
  'use strict';
  var D = C.D, I = C.I, E = C.E, brl = C.brl, cta = C.cta, esc = C.esc;

  /* ================= início: minhas viagens ================= */

  C.tela('', function () {
    var pend = C.pendencias(), nome = C.primeiroNome();
    var h = '<div class="tela"><div class="aba-cab"><div class="topo-inicio">' + C.logo() +
      '<button class="eu" data-ir="perfil" aria-label="Abrir o perfil">' + C.rosto('voce') + '</button></div>' +
      '<h1 class="h1">' + (nome ? 'Oi, ' + esc(nome) + '.' : 'Suas viagens') + '</h1>' +
      '<p class="lead">' + (E.entrou && !E.saiu && pend.length ? (pend.length === 1 ? '1 decisão espera por você.' : pend.length + ' decisões esperam por você.') : 'Tudo o que o grupo combinou, num lugar só.') + '</p></div>';

    if (E.sessao === 'convidado') {
      h += '<div class="aviso-fixo">' + I('usuario', 20, 'currentColor', 2.1) + '<div><b>Você entrou como convidado.</b><p>Crie a conta para guardar esta viagem e criar as suas.</p>' +
        '<button class="link" data-ir="cadastro">Criar minha conta</button></div></div>';
    }
    if (!E.entrou) {
      h += '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Convite</h2><button class="convite-card" data-ir="convite"><span class="foto" style="' + C.bg('capa') + '"></span>' +
        '<span class="tx"><span class="k">A Ju te convidou</span><b>' + D.VIAGEM + '</b><small>7 pessoas · Ubatuba ou Paraty</small></span>' + I('seta', 18, '#AE3A0B', 2.4) + '</button></section>';
    } else {
      var f = C.fimVencedor(), cv = E.casa.fechado ? C.casaVencedora() : null, feitas = C.feitas();
      var linha = E.saiu ? 'Você saiu desta viagem' : (C.tudo() ? 'Tá combinado · faltam ' + D.DIAS_ATE + ' dias' : (pend.length ? 'Sua vez: ' + pend[0].t.toLowerCase() : 'Esperando o prazo das datas'));
      h += '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Em andamento</h2><button class="viagem-card' + (E.saiu ? ' apagada' : '') + '" data-ir="viagem">' +
        '<span class="foto" style="' + C.bg('capa') + '"><span class="pilula">' + I('calendario', 13, '#fff', 2.4) + (E.datas.fechado ? f.curto : 'Novembro') + '</span></span>' +
        '<span class="corpo"><b>' + D.VIAGEM + '</b><small>' + (cv ? cv.nome + ', ' + cv.lugar : 'Ubatuba ou Paraty · 7 pessoas') + '</small>' +
        '<span class="passos">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < feitas ? 'ok' : '') + '"></i>'; }).join('') + '</span>' +
        '<span class="estado' + (pend.length && !E.saiu ? ' vez' : '') + '">' + linha + '</span></span></button></section>';
    }
    if (E.criadas.length) {
      h += '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Criadas por você</h2><div class="cartao lista">' + E.criadas.map(function (v) {
        return '<button class="lin" data-ir="v/' + v.id + '"><span class="mini" style="' + C.bg(v.capa) + '"></span><span class="tx"><b>' + esc(v.nome) + '</b><small>Esperando o grupo · ' + v.fins.length + (v.fins.length === 1 ? ' fim de semana' : ' fins de semana') + '</small></span>' + I('seta', 16, '#646E71', 2.4) + '</button>';
      }).join('') + '</div></section>';
    }
    var p = D.PASSADA;
    h += '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Já viajaram</h2><div class="cartao lista"><button class="lin" data-ir="passada"><span class="mini" style="' + C.bg(p.foto) + '"></span>' +
      '<span class="tx"><b>' + p.nome + '</b><small>' + p.quando + ' · ' + p.pessoas.length + ' pessoas</small></span><span class="selo ok">Combinada</span></button></div></section></div>';
    return { tab: 'inicio', html: h, dock: cta(I('mais2', 18, '#fff', 2.6) + 'Criar viagem', 'data-acao="nova-viagem"') };
  }, { titulo: 'Início' });

  /* ================= viagem ================= */

  function etapas() {
    var f = C.fimVencedor(), cv = C.casaVencedora(), n = C.quemVai().length;
    return [
      { n: 1, nome: 'Datas', ir: 'datas', st: E.datas.fechado ? 'ok' : (E.datas.enviado ? 'espera' : 'vez'),
        det: E.datas.fechado ? '<b>' + f.q + '</b> · ' + n + ' pessoas podem' : (E.datas.enviado ? 'Você respondeu. Fecha quarta, 20h.' : 'Fecha quarta, 20h · 5 de 7 responderam') },
      { n: 2, nome: 'Orçamento', ir: 'teto', st: E.teto.enviado ? 'ok' : 'vez',
        det: E.teto.enviado ? 'Faixa do grupo: <b>até ' + brl(C.faixa()) + '</b> por pessoa' : 'Seu teto fica em segredo · 5 de 7 guardaram' },
      { n: 3, nome: 'Casa', ir: 'casas', st: E.casa.fechado ? 'ok' : (C.podeCasa() ? 'vez' : 'trava'),
        det: E.casa.fechado && cv ? '<b>' + cv.nome + '</b> · ' + brl(C.porPessoa(cv)) + ' por pessoa' : (C.podeCasa() ? 'Votação fecha quinta, 22h' : '3 casas esperando a faixa do grupo') },
      { n: 4, nome: 'Quem vai', ir: 'sinal', st: E.sinal.pago ? 'ok' : (E.casa.fechado ? 'vez' : 'trava'),
        det: E.sinal.pago ? '<b>' + C.pagantes().length + ' de ' + n + '</b> com sinal pago' : (E.casa.fechado ? C.pagantes().length + ' de ' + n + ' pagaram o sinal' : 'Entra na conta quem paga o sinal') }
    ];
  }
  function placar(lista) {
    var rot = { ok: 'Combinado', vez: 'Sua vez', espera: 'Aguardando', trava: 'Depois' };
    return '<ol class="placar">' + lista.map(function (e) {
      return '<li><button class="etapa ' + e.st + '"' + (e.ir ? ' data-ir="' + e.ir + '"' : '') + '><span class="n">' + (e.st === 'ok' ? I('check', 18, 'currentColor', 2.8) : e.n) + '</span>' +
        '<span class="nm">' + e.nome + '</span><span class="selo ' + e.st + '">' + (e.rot || rot[e.st]) + '</span><span class="det">' + e.det + '</span></button></li>';
    }).join('') + '</ol>';
  }
  function capaTopo(volta, extra) {
    return '<div class="capa-top"><button class="voltar vidro" data-ir="' + volta + '" aria-label="Voltar para o início">' + I('voltar', 20, '#fff', 2.4) + '</button>' + (extra || '') + '</div>';
  }

  C.tela('viagem', function () {
    var f = C.fimVencedor(), cv = E.casa.fechado ? C.casaVencedora() : null, pend = C.pendencias(), feitas = C.feitas();
    var h = '<div class="tela"><div class="capa' + (E.saiu ? ' apagada' : '') + '">' +
      capaTopo('', '<span class="acoes-capa"><button class="pilula" data-ir="grupo">' + I('grupo', 15, '#fff', 2.2) + 'Grupo</button>' +
        '<button class="pilula redonda" data-acao="menu-viagem" aria-label="Mais opções">' + I('mais', 18, '#fff', 2.6) + '</button></span>') +
      '<div class="capa-tit"><p class="k">Viagem do grupo · 7 pessoas</p><h1>' + D.VIAGEM + '</h1>' +
      '<div class="pilulas"><span class="pilula">' + I('calendario', 14, '#fff', 2.4) + (E.datas.fechado ? f.curto : 'Novembro') + '</span>' +
      '<span class="pilula">' + I('pin', 14, '#fff', 2.4) + (cv ? cv.lugar : 'Ubatuba ou Paraty') + '</span></div></div></div>';

    if (E.saiu) {
      h += '<div class="folha"><section class="res espera"><p class="k">Você saiu</p><p class="gd" style="font-size:21px">Sua vaga foi oferecida ao Téo.</p>' +
        '<p>' + (E.sinal.pago ? 'Seu sinal de ' + brl(D.SINAL) + ' fica no cofre até ele pagar. Depois, volta para a sua chave Pix.' : 'Você não tinha pagado nada, então não há nada a devolver.') +
        ' O grupo recebeu só que você saiu, sem motivo e sem cobrança.</p></section></div></div>';
      return { tab: 'inicio', claro: true, html: h, dock: cta('Voltar para a viagem', 'data-acao="voltar-viagem"') };
    }

    var resp = E.datas.enviado ? 'Você, Ju, Rafa e mais 3 já responderam' : 'Ju, Rafa e mais 3 já responderam';
    h += '<div class="folha"><div class="resp">' + C.rostos(D.GRUPO.slice(0, 6)) + '<small>' + resp + '</small></div>' +
      '<div class="passos" aria-label="' + feitas + ' de 4 decisões combinadas">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < feitas ? 'ok' : '') + '"></i>'; }).join('') + '</div>';
    h += '<section class="sec"><div class="sec-cab"><h2 class="h2">' + (pend.length ? 'Sua vez' : 'Tudo certo por aqui') + '</h2></div>';
    if (pend.length) {
      h += '<div class="vez' + (pend.length === 1 ? ' um' : '') + '">' + pend.slice(0, 2).map(function (p) {
        return '<button class="v ' + p.c + '" data-ir="' + p.r + '"><b>' + p.t + '</b><small>' + I(p.ic, 15, 'currentColor', 2.2) + p.s + '</small></button>';
      }).join('') + '</div>';
    } else {
      h += '<div class="vez um"><button class="v ok" data-ir="' + C.proximo() + '"><b>' + (C.tudo() ? 'Tá combinado. Nada espera por você.' : 'Agora é com o prazo') + '</b>' +
        '<small>' + I(C.tudo() ? 'sino' : 'relogio', 15, '#fff', 2.2) + (C.tudo() ? 'Os lembretes de pagamento saem sozinhos' : 'Só falta o Téo responder as datas') + '</small></button></div>';
    }
    h += '</section><section class="sec"><div class="sec-cab"><h2 class="h2">As quatro decisões</h2><span class="miudo">' + feitas + ' de 4</span></div>' + placar(etapas()) + '</section>';
    var ja = [];
    if (E.datas.fechado) ja.push(I('calendario', 15, 'currentColor', 2.4) + f.curto);
    if (E.teto.enviado) ja.push(I('cadeado', 15, 'currentColor', 2.4) + 'até ' + brl(C.faixa()));
    if (cv) ja.push(I('casa', 15, 'currentColor', 2.4) + cv.nome);
    if (E.sinal.pago) ja.push(I('check', 15, 'currentColor', 2.8) + 'Sua vaga');
    if (ja.length) h += '<section class="sec"><div class="sec-cab"><h2 class="h2">Já combinado</h2><a href="#/combinado">Ver o recibo</a></div><div class="ja">' + ja.map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div></section>';
    h += '<section class="sec"><div class="sec-cab"><h2 class="h2">Atividade</h2><a href="#/atividade">Ver tudo</a></div><ul class="feed">' + C.eventos().slice(0, 3).map(C.itemFeed).join('') + '</ul></section></div></div>';
    var rot = pend.length ? 'Bora decidir' : (C.tudo() ? 'Ver o que ficou combinado' : 'Ver as datas');
    return { tab: 'inicio', claro: true, html: h, dock: cta(rot, 'data-ir="' + C.proximo() + '"') };
  }, { titulo: D.VIAGEM });

  C.acao('menu-viagem', function () {
    C.modal({ titulo: D.VIAGEM, opcoes: [
      ['grupo', 'Ver o grupo', 'data-ir="grupo"'], ['documento', 'Ver o recibo do combinado', 'data-ir="combinado"'],
      ['link', 'Copiar o convite', 'data-acao="copiar-convite"'], ['sair', 'Sair da viagem', 'data-ir="sair"', true]] });
    return true;
  });
  C.acao('voltar-viagem', function () { E.saiu = false; C.avisar('Você voltou. A vaga ainda estava livre.'); });

  /* ================= datas ================= */

  function calendario() {
    var vence = E.datas.fechado ? C.fimVencedor() : null, porDia = {};
    D.FINS.forEach(function (f) { f.dias.forEach(function (d, i) { porDia[d] = { f: f, pos: i === 0 ? 'ini' : (i === f.dias.length - 1 ? 'fin' : 'meio') }; }); });
    var h = '<div class="cartao cal"><div class="cal-cab"><b>Novembro 2026</b><small>4 fins de semana possíveis</small></div><div class="cal-grade">';
    ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function (d) { h += '<span class="dow">' + d + '</span>'; });
    for (var d = 1; d <= 30; d++) {
      var x = porDia[d], cls = 'dia';
      if (x) {
        cls += ' fim ' + x.pos;
        var m = E.datas.marc[x.f.id];
        if (vence && vence.id === x.f.id) cls += ' vence'; else if (m === true) cls += ' sim'; else if (m === false) cls += ' nao';
      }
      h += '<span class="' + cls + '">' + d + (x && x.f.feriado === d ? '<i class="fer"></i>' : '') + '</span>';
    }
    return h + '</div><div class="cal-leg"><span><i style="background:linear-gradient(90deg,#D1450E,#C92B45)"></i>Você pode</span><span><i style="background:#F2EEEA"></i>Não pode</span>' +
      '<span><i style="background:#FFF1EA;box-shadow:inset 0 0 0 1px #F1E6DB"></i>A decidir</span>' + (vence ? '<span><i style="background:#0F5257"></i>Combinado</span>' : '<span>• feriado</span>') + '</div></div>';
  }

  C.tela('datas', function () {
    var h = '<div class="tela">' + C.barra('Etapa 1 de 4') + '<p class="k">Datas</p><h1 class="h1">Quais fins de semana você pode?</h1>' +
      '<p class="lead">Marque todos em que você consegue ir. Ninguém precisa justificar.</p>', dock;
    if (E.datas.fechado) {
      var f = C.fimVencedor(), q = C.quemVai();
      h += '<section class="res mar"><p class="k">Datas combinadas</p><p class="gd">' + f.q + '</p><p>' + q.length + ' pessoas podem. O Téo não respondeu até o prazo e ficou como interessado: entra depois, se houver vaga. Silêncio não conta como sim.</p>' +
        '<ul class="lista-res"><li>' + C.rostos(q, 'pq') + '<span>' + C.nomes(q) + '</span></li><li>' + C.rosto('teo', 'pq fora') + '<span>Téo, interessado</span></li></ul></section>' + calendario();
      if (E.datas.marc[f.id] !== true) h += C.prazo('Você marcou que não pode nessa data e ficou como interessado, como o Téo.');
      dock = !E.teto.enviado ? cta('Agora, guardar meu teto', 'data-ir="teto"') : (C.podeCasa() ? cta('Ver as casas na faixa', 'data-ir="casas"') : cta('Voltar para a viagem', 'data-ir="viagem"'));
      return { tab: 'inicio', html: h + '</div>', dock: dock };
    }
    h += C.prazo('Fecha <b>quarta, às 20h</b>. Quem não responder fica fora da contagem: silêncio não conta como sim.');
    if (E.datas.enviado) h += '<section class="res espera"><p class="k">Resposta enviada</p><p class="gd" style="font-size:20px">Só falta o Téo.</p><p>A decisão fecha quarta, às 20h, com quem respondeu. O Combinado já mandou um lembrete para ele.</p></section>';
    h += calendario() + '<ul class="fins">';
    D.FINS.forEach(function (f) {
      var m = E.datas.marc[f.id], podem = f.podem.slice();
      if (m === true) podem.unshift('voce');
      var resp = D.RESPONDERAM_DATAS.length + (m === undefined ? 0 : 1), dis = E.datas.enviado ? ' disabled' : '';
      h += '<li class="fim-it"><div class="l1"><div><p class="q">' + f.q + '</p><p class="s">' + f.s + '</p></div><div class="par" role="group" aria-label="' + f.q + '">' +
        '<button class="sim" data-acao="data" data-f="' + f.id + '" data-v="1" aria-pressed="' + (m === true) + '"' + dis + '>Posso</button>' +
        '<button class="nao" data-acao="data" data-f="' + f.id + '" data-v="0" aria-pressed="' + (m === false) + '"' + dis + '>Não posso</button></div></div>' +
        '<p class="l2">' + C.rostos(podem, 'pq') + '<span>' + podem.length + ' de ' + resp + ' podem</span></p></li>';
    });
    h += '</ul></div>';
    if (E.datas.enviado) dock = cta('Avançar até o prazo (demonstração)', 'data-acao="fechar-datas"', 'demo');
    else {
      var faltam = D.FINS.filter(function (f) { return E.datas.marc[f.id] === undefined; }).length;
      dock = faltam ? cta(faltam === 1 ? 'Falta 1 fim de semana' : 'Marque os ' + faltam + ' fins de semana', 'disabled') : cta('Enviar minhas datas', 'data-acao="enviar-datas"');
    }
    return { tab: 'inicio', html: h, dock: dock };
  }, { titulo: 'Datas' });
  C.acao('data', function (b) { E.datas.marc[b.dataset.f] = b.dataset.v === '1'; });
  C.acao('enviar-datas', function () { E.datas.enviado = true; C.avisar('Datas enviadas.'); });
  C.acao('fechar-datas', function () { E.datas.fechado = true; C.salvar(); C.render(); document.getElementById('app').scrollTop = 0; C.avisar('O prazo fechou. Datas combinadas.'); return true; });

  /* ================= teto ================= */

  C.tela('teto', function () {
    var h = '<div class="tela">' + C.barra('Etapa 2 de 4') + '<p class="k">Orçamento</p><h1 class="h1">Até quanto você pode gastar com a casa?</h1>' +
      '<p class="lead">Valor por pessoa, só a hospedagem. É o teto que vale antes de qualquer casa aparecer.</p>';
    var cad = I('cadeado', 20, 'currentColor', 2.2);
    if (E.teto.enviado) {
      h += '<section class="res"><p class="k">Faixa do grupo</p><p class="gd">até ' + brl(C.faixa()) + ' por pessoa</p><p>' +
        (C.seuTetoEhOMenor() ? 'Seu teto é o menor do grupo. Só você sabe disso: para os outros, aparece apenas a faixa.' : '6 de 7 guardaram o teto. A faixa é o menor deles, e ninguém sabe de quem é. Nem você.') + '</p></section>' +
        '<div class="segredo">' + cad + '<p><b>Você guardou ' + brl(E.teto.valor) + '.</b>Esse número só aparece aqui, na sua tela. Casas acima da faixa saem da votação sem que alguém precise dizer que achou caro.</p></div>' +
        (E.casa.fechado ? '' : '<div style="margin-top:14px"><button class="btn2" data-acao="rever-teto">Rever meu teto</button></div>');
      var dock = E.datas.fechado ? cta('Ver as casas na faixa', 'data-ir="casas"') : cta(E.datas.enviado ? 'Voltar para a viagem' : 'Agora, marcar as datas', 'data-ir="' + (E.datas.enviado ? 'viagem' : 'datas') + '"');
      return { tab: 'inicio', html: h + '</div>', dock: dock };
    }
    var p = ((E.teto.valor - 200) / 1000) * 100;
    h += '<section class="cartao cofre-valor" aria-label="Seu teto"><p class="valor" id="valor"><small>R$</small>' + E.teto.valor.toLocaleString('pt-BR') + '</p><p class="valor-sub">por pessoa, pelo fim de semana</p>' +
      '<label class="oculto" for="teto">Seu teto por pessoa</label><input class="slider" id="teto" type="range" min="200" max="1200" step="10" value="' + E.teto.valor + '" style="--p:' + p + '%" aria-valuetext="' + brl(E.teto.valor) + '">' +
      '<div class="escala"><span>R$ 200</span><span>R$ 1.200</span></div><div class="atalhos" role="group" aria-label="Valores rápidos">' +
      [300, 450, 600, 800].map(function (v) { return '<button data-acao="teto-rapido" data-v="' + v + '" aria-pressed="' + (E.teto.valor === v) + '">' + brl(v) + '</button>'; }).join('') + '</div></section>' +
      '<div class="segredo">' + cad + '<p><b>Ninguém vê esse número, nem quem organiza.</b>O grupo só vê a faixa que cabe em todo mundo.</p></div>' +
      '<p class="contagem">' + C.rostos(['ju', 'rafa', 'bia', 'caio', 'duda'], 'pq') + '<span>5 de 7 já guardaram. Os valores ficam com cada um.</span></p></div>';
    return {
      tab: 'inicio', html: h, dock: cta('Guardar em segredo', 'data-acao="enviar-teto"'),
      depois: function () {
        var s = document.getElementById('teto');
        s.addEventListener('input', function () {
          var v = +s.value; E.teto.valor = v; C.salvar();
          document.getElementById('valor').innerHTML = '<small>R$</small>' + v.toLocaleString('pt-BR');
          s.style.setProperty('--p', ((v - 200) / 1000) * 100 + '%'); s.setAttribute('aria-valuetext', brl(v));
          document.querySelectorAll('[data-acao="teto-rapido"]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.v === v)); });
        });
      }
    };
  }, { titulo: 'Orçamento' });
  C.acao('teto-rapido', function (b) { E.teto.valor = +b.dataset.v; });
  C.acao('enviar-teto', function () { E.teto.enviado = true; C.salvar(); C.render(); document.getElementById('app').scrollTop = 0; C.avisar('Teto guardado em segredo.', 'cadeado'); return true; });
  C.acao('rever-teto', function () { E.teto.enviado = false; E.casa.voto = null; C.salvar(); C.ir('teto'); return true; });

  /* ================= casas ================= */

  function cartaoCasa(c) {
    var v = C.votosDe(c), meu = E.casa.voto === c.id;
    var mostrar = E.priv.nomeNosVotos ? v : v.filter(function (p) { return p !== 'voce'; });
    return '<article class="casa' + (meu ? ' votada' : '') + '"><a class="foto" href="#/casa/' + c.id + '" style="' + C.bg(c.fotos[0]) + '" aria-label="Ver detalhes de ' + c.nome + '">' +
      '<span class="tag">' + I('check', 13, 'currentColor', 3) + 'Cabe na faixa</span><span class="tag nf" style="color:#1E2629">' + I('estrela', 13, '#AE3A0B', 2.4) + c.nota + '</span></a>' +
      '<div class="corpo"><h3 class="nome"><a href="#/casa/' + c.id + '" style="color:inherit;text-decoration:none">' + c.nome + '</a></h3><p class="onde">' + c.lugar + ' · ' + c.resumo + '</p>' +
      '<div class="preco"><span class="pp">' + brl(C.porPessoa(c)) + '<small>por pessoa</small></span><span class="tot">' + brl(c.total) + '<br>2 noites</span></div>' +
      '<div class="votos"><span class="q">' + (mostrar.length ? C.rostos(mostrar, 'pq') : '') + v.length + (v.length === 1 ? ' voto' : ' votos') + '</span>' +
      '<button class="votar" data-acao="votar" data-c="' + c.id + '" aria-pressed="' + meu + '">' + (meu ? 'Seu voto' : 'Votar') + '</button></div></div></article>';
  }

  C.tela('casas', function () {
    var h = '<div class="tela">' + C.barra('Etapa 3 de 4') + '<p class="k">Casa</p><h1 class="h1">Qual casa?</h1>';
    if (!C.podeCasa()) {
      var falta = !E.datas.fechado ? 'datas' : 'teto';
      h += '<p class="lead">As casas aparecem quando as datas fecham e todo mundo guarda o teto. Assim o preço já chega dividido e dentro da faixa, e ninguém precisa dizer que achou caro.</p>' +
        '<div class="cartao conta" style="margin-top:18px"><div class="linha"><span>' + (E.datas.fechado ? 'Datas combinadas' : 'Datas em aberto') + '</span><b>' + (E.datas.fechado ? I('check', 18, '#0F5257', 2.8) : I('relogio', 18, '#AE3A0B', 2.2)) + '</b></div>' +
        '<div class="linha"><span>' + (E.teto.enviado ? 'Seu teto guardado' : 'Seu teto ainda não guardado') + '</span><b>' + (E.teto.enviado ? I('check', 18, '#0F5257', 2.8) : I('relogio', 18, '#AE3A0B', 2.2)) + '</b></div></div>' +
        '<div class="borradas">' + D.CASAS.map(function (c) { return '<span style="' + C.bg(c.fotos[0]) + '"></span>'; }).join('') + '</div><p class="miudo" style="margin-top:8px;text-align:center">3 casas esperando a faixa do grupo</p></div>';
      return { tab: 'inicio', html: h, dock: cta(falta === 'teto' ? 'Guardar meu teto' : 'Ir para as datas', 'data-ir="' + falta + '"') };
    }
    var n = C.quemVai().length, f = C.fimVencedor(), ok = D.CASAS.filter(C.dentro), fora = D.CASAS.filter(function (c) { return !C.dentro(c); });
    if (E.casa.fechado) {
      var cv = C.casaVencedora(), outra = ok.filter(function (c) { return c !== cv; })[0], empate = outra && C.votosDe(outra).length === C.votosDe(cv).length;
      h += '<section class="res mar"><p class="k">Casa escolhida</p><p class="gd">' + cv.nome + '</p><p>' +
        (empate ? 'Empate em ' + C.votosDe(cv).length + ' votos, e valeu a regra combinada antes: venceu a mais barata.' : C.votosDe(cv).length + ' votos' + (outra ? ' a ' + C.votosDe(outra).length : '') + '.') +
        ' Todo mundo votou, então a decisão fechou na hora, sem esperar o prazo.</p></section>' +
        '<a class="casa" href="#/casa/' + cv.id + '" style="display:block;margin-top:16px;text-decoration:none;color:inherit"><span class="foto" style="' + C.bg(cv.fotos[0]) + ';height:160px"></span>' +
        '<div class="corpo"><p class="nome">' + cv.nome + '</p><p class="onde">' + cv.lugar + ', ' + f.q + '</p><div class="preco"><span class="pp">' + brl(C.porPessoa(cv)) + '<small>por pessoa, com ' + n + '</small></span><span class="tot">' + brl(cv.total) + '<br>2 noites</span></div></div></a>';
      return { tab: 'inicio', html: h + '</div>', dock: E.sinal.pago ? cta('Ver o que ficou combinado', 'data-ir="combinado"') : cta('Pagar o sinal e garantir a vaga', 'data-ir="sinal"') };
    }
    h += '<p class="lead">Preço já dividido pelas ' + n + ' pessoas que podem em ' + f.q + '.</p>' + C.prazo('Votação fecha <b>quinta, às 22h</b>, ou antes, se todo mundo votar. Empate: vence a mais barata.');
    if (!ok.length) {
      h += '<div class="acima" style="margin-top:18px"><span class="mini" style="' + C.bg('palafita') + '"></span><div><b>Seu teto ficou abaixo de todas as casas.</b>' +
        '<p>Só você vê este aviso. Quem organiza recebe apenas que é preciso buscar opções mais baratas, sem saber de quem é o limite.</p></div></div></div>';
      return { tab: 'inicio', html: h, dock: cta('Rever meu teto', 'data-acao="rever-teto"') };
    }
    h += '<div class="casas">' + ok.map(cartaoCasa).join('') + '</div>';
    fora.forEach(function (c) {
      h += '<div class="acima"><span class="mini" style="' + C.bg(c.fotos[0]) + '"></span><div><b>' + c.nome + ' ficou fora da faixa</b><p>' + brl(C.porPessoa(c)) + ' por pessoa. Não entra na votação, e ninguém precisa explicar por quê.</p></div></div>';
    });
    return { tab: 'inicio', html: h + '</div>', dock: E.casa.voto ? cta('Confirmar meu voto', 'data-acao="confirmar-voto"') : cta('Escolha uma casa para votar', 'disabled') };
  }, { titulo: 'Casa' });
  C.acao('votar', function (b) { E.casa.voto = b.dataset.c; });
  C.acao('confirmar-voto', function () { E.casa.fechado = true; C.salvar(); C.ir('casas'); C.avisar('Voto confirmado. Todo mundo votou.'); return true; });

  function mapa(tipo) {
    var pin = '<circle r="16" fill="#F2545B" opacity=".18"/><path d="M0 8s-9-8-9-14a9 9 0 0 1 18 0c0 6-9 14-9 14z" fill="#F2545B"/><circle cy="-6" r="3.2" fill="#fff"/>';
    if (tipo === 'centro') {
      return '<svg viewBox="0 0 350 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="350" height="150" fill="#F6EFE6"/>' +
        '<path d="M0 118 C 70 104 120 128 190 112 S 300 96 350 104 V150 H0z" fill="#CFEAE6"/><g stroke="#E6D8CA" stroke-width="7" stroke-linecap="round"><path d="M30 10V100M95 10V105M160 10V108M225 10V100M290 10V96"/><path d="M10 30H340M10 62H340"/></g>' +
        '<g fill="#fff" stroke="#EADCCD"><rect x="40" y="38" width="44" height="16" rx="3"/><rect x="105" y="38" width="44" height="16" rx="3"/><rect x="170" y="70" width="44" height="22" rx="3"/><rect x="235" y="38" width="44" height="16" rx="3"/></g>' +
        '<text x="300" y="134" font-family="DM Sans" font-size="11" font-weight="700" fill="#0D4C47" text-anchor="end">Baía de Paraty</text><g transform="translate(176 40)">' + pin + '</g></svg>';
    }
    return '<svg viewBox="0 0 350 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="350" height="150" fill="#CFEAE6"/>' +
      '<path d="M0 0H350V70C300 60 270 92 220 86S140 50 90 62 30 92 0 84z" fill="#F6EFE6"/><path d="M0 84C30 92 50 70 90 62s100 30 130 24 80-26 130-16" fill="none" stroke="#F3D9A9" stroke-width="10"/>' +
      '<g fill="#9FCF9A" opacity=".8"><circle cx="40" cy="26" r="16"/><circle cx="70" cy="18" r="13"/><circle cx="290" cy="22" r="18"/><circle cx="318" cy="36" r="12"/></g>' +
      '<path d="M140 0V52" stroke="#E6D8CA" stroke-width="6" stroke-linecap="round"/><text x="250" y="124" font-family="DM Sans" font-size="11" font-weight="700" fill="#0D4C47">Mar</text><g transform="translate(150 50)">' + pin + '</g></svg>';
  }

  C.tela('casa', function (id) {
    var c = C.casaPor(id) || D.CASAS[0];
    if (!C.podeCasa()) { setTimeout(function () { C.ir('casas'); }, 0); return { tab: 'inicio' }; }
    var n = C.quemVai().length, v = C.votosDe(c), ehDentro = C.dentro(c), cv = E.casa.fechado ? C.casaVencedora() : null;
    var h = '<div class="tela"><div class="galeria"><div class="trilho">' + c.fotos.map(function (f) { return '<div class="ft" style="' + C.bg(f) + '"></div>'; }).join('') + '</div>' +
      '<div class="flut"><button class="voltar" data-ir="casas" aria-label="Voltar para as casas">' + I('voltar', 20, '#1E2629', 2.4) + '</button><span class="tag">' +
      (ehDentro ? I('check', 13, 'currentColor', 3) + 'Cabe na faixa' : 'Acima da faixa') + '</span></div><span class="cont">1 de ' + c.fotos.length + '</span></div>' +
      '<div class="folha det"><h1 class="h1" style="margin-top:0">' + c.nome + '</h1><p class="lead" style="margin-top:6px">' + c.lugar + ' · ' + c.resumo + '</p>' +
      '<p class="nota" style="margin-top:10px">' + I('estrela', 16, '#AE3A0B', 2.2) + c.nota + '<small>(' + c.avaliacoes + ' avaliações) · anúncio de exemplo</small></p>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:12px">O que tem</h2><div class="coms">' + c.comodidades.map(function (x) { return '<p class="com"><span class="ic">' + I(x[0], 18, 'currentColor', 2) + '</span>' + x[1] + '</p>'; }).join('') + '</div></section>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Quanto fica</h2><div class="cartao conta"><div class="linha"><span>2 noites, ' + C.fimVencedor().curto + '</span><b>' + brl(c.total) + '</b></div>' +
      '<div class="linha total"><span>Por pessoa, com ' + n + '</span><b>' + brl(C.porPessoa(c)) + '</b></div><div class="linha"><span>Se o Téo entrar, com ' + (n + 1) + '</span><b>' + brl(C.porPessoa(c, n + 1)) + '</b></div></div></section>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Onde fica</h2><div class="mapa">' + mapa(c.mapa) + '</div><p class="miudo" style="margin-top:8px;display:flex;gap:6px;align-items:center">' + I('pin', 15, '#AE3A0B', 2.2) + c.perto + '</p></section>' +
      (ehDentro ? '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Quem votou</h2><p class="contagem" style="margin-top:0">' + (v.length ? C.rostos(v, 'pq') + '<span>' + C.nomes(v) + '</span>' : '<span>Ninguém votou nesta ainda.</span>') + '</p></section>' : '') + '</div></div>';
    var dock;
    if (!ehDentro) dock = cta('Fora da faixa do grupo', 'disabled');
    else if (E.casa.fechado) dock = cv && cv.id === c.id ? (E.sinal.pago ? cta('Ver o que ficou combinado', 'data-ir="combinado"') : cta('Pagar o sinal e garantir a vaga', 'data-ir="sinal"')) : cta('Ver a casa escolhida', 'data-ir="casas"');
    else if (E.casa.voto === c.id) dock = cta('Confirmar meu voto', 'data-acao="confirmar-voto"');
    else dock = cta('Votar nesta casa', 'data-acao="votar" data-c="' + c.id + '"');
    return {
      tab: 'inicio', claro: true, html: h, dock: dock,
      depois: function () {
        var g = document.querySelector('.galeria .trilho'), el = document.querySelector('.galeria .cont');
        g.addEventListener('scroll', function () { el.textContent = (Math.round(g.scrollLeft / g.clientWidth) + 1) + ' de ' + g.children.length; }, { passive: true });
      }
    };
  }, { titulo: 'Casa' });

  /* ================= sinal ================= */

  C.tela('sinal', function () {
    var h = '<div class="tela">' + C.barra('Etapa 4 de 4') + '<p class="k">Quem vai</p><h1 class="h1">Tô dentro, com sinal</h1>';
    if (!E.casa.fechado) {
      h += '<p class="lead">O sinal abre quando a casa estiver escolhida. É ele que transforma o "tô dentro" em vaga garantida.</p><div class="cofre-ex">' + I('cofre', 20, 'currentColor', 2) + '<span>Até lá, ninguém adianta dinheiro nenhum, nem quem organiza.</span></div></div>';
      return { tab: 'inicio', html: h, dock: cta(C.podeCasa() ? 'Ir para a votação' : 'Voltar para a viagem', 'data-ir="' + (C.podeCasa() ? 'casas' : 'viagem') + '"') };
    }
    var cv = C.casaVencedora(), n = C.quemVai().length, pp = C.porPessoa(cv);
    if (E.sinal.pago) {
      h += '<section class="res mar"><p class="k">Vaga garantida</p><p class="gd">Você está dentro.</p><p>Seu sinal entrou no cofre da viagem. ' + C.pagantes().length + ' de ' + n + ' já pagaram. O restante, ' + brl(pp - D.SINAL) + ', vence em ' + D.PRAZO_RESTANTE + ', com lembrete automático.</p></section>' +
        '<div style="margin-top:14px"><button class="btn2" data-ir="cofre">' + I('cofre', 18, 'currentColor', 2) + 'Ver o cofre da viagem</button></div></div>';
      return { tab: 'inicio', html: h, dock: cta('Ver o que ficou combinado', 'data-ir="combinado"') };
    }
    h += '<p class="lead">Até pagar o sinal, você aparece como interessado. A casa é dividida só entre quem pagou.</p>' +
      '<div class="cartao conta" style="margin-top:18px"><div class="linha"><span>' + cv.nome + ', 2 noites</span><b>' + brl(cv.total) + '</b></div><div class="linha"><span>Dividido por ' + n + ' pessoas</span><b>' + brl(pp) + '</b></div>' +
      '<div class="linha total"><span>Sinal agora</span><b>' + brl(D.SINAL) + '</b></div><div class="linha"><span>Restante até ' + D.PRAZO_RESTANTE + '</span><b>' + brl(pp - D.SINAL) + '</b></div></div>' +
      '<div class="cofre-ex">' + I('cofre', 20, 'currentColor', 2) + '<span>O sinal vai para o <b>cofre da viagem</b>, e não para o amigo que reservou. Quando o cofre cobre a entrada, a casa é paga.</span></div>' +
      '<section class="cartao pix"><span class="qr"><img src="fotos/pix-demo.svg" alt="QR code de demonstração"></span><div><p class="k cinza">Pix copia e cola</p><code>DEMONSTRACAO.COMBINADO.PRAIA-NOV.SINAL-150</code>' +
      '<button class="btn2" data-acao="copiar-pix">' + I('copiar', 16, 'currentColor', 2) + 'Copiar código</button></div></section><p class="demo-nota">Pagamento de demonstração: nenhum dinheiro é movimentado.</p></div>';
    return { tab: 'inicio', html: h, dock: cta('Já paguei', 'data-acao="pagar"') };
  }, { titulo: 'Quem vai' });
  C.acao('copiar-pix', function () { C.copiar('DEMONSTRACAO.COMBINADO.PRAIA-NOV.SINAL-150', 'Código copiado. É de demonstração.'); return true; });
  C.acao('pagar', function () { E.sinal.pago = true; C.salvar(); C.render(); document.getElementById('app').scrollTop = 0; C.avisar('Sinal recebido no cofre.', 'cofre'); return true; });

  /* ================= combinado ================= */

  function confete() {
    var cores = ['#FFC23D', '#FFFFFF', '#FFE3D1', '#D7F1EE'], h = '<svg class="conf" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">';
    [[30, 40], [80, 120], [140, 30], [210, 90], [300, 50], [350, 140], [260, 170], [60, 200], [330, 230], [180, 210], [110, 260], [370, 30]].forEach(function (p, i) {
      var c = cores[i % cores.length];
      h += i % 3 === 0 ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="' + c + '" opacity=".75"/>' : '<rect x="' + p[0] + '" y="' + p[1] + '" width="10" height="4" rx="2" fill="' + c + '" opacity=".7" transform="rotate(' + (i * 37 % 90 - 45) + ' ' + p[0] + ' ' + p[1] + ')"/>';
    });
    return h + '</svg>';
  }
  function textoResumo() {
    var f = C.fimVencedor(), cv = C.casaVencedora(), pp = C.porPessoa(cv), pg = C.pagantes(), dv = C.devendo();
    var pgEu = pg.filter(function (p) { return p !== 'voce'; }); if (pg.indexOf('voce') >= 0) pgEu.push('voce');
    return 'Tá combinado: ' + D.VIAGEM + '\n' + f.q + ' (' + f.s + ')\n' + cv.nome + ', ' + cv.lugar + '\n' + brl(pp) + ' por pessoa: sinal de ' + brl(D.SINAL) + ' agora e ' + brl(pp - D.SINAL) + ' até ' + D.PRAZO_RESTANTE + '\n' +
      'Sinal pago: ' + C.nomes(pgEu, 'eu') + (dv.length ? '. ' + C.nomes(dv) + (dv.length > 1 ? ' ainda não pagaram' : ' ainda não pagou') : '') + '.\nO resto está no Combinado.';
  }
  C.tela('combinado', function () {
    var f = C.fimVencedor(), cv = E.casa.fechado ? C.casaVencedora() : null, q = C.quemVai(), n = q.length, ok = C.tudo(), pg = C.pagantes(), dv = C.devendo();
    var h = '<div class="tela"><header class="festa' + (ok ? '' : ' parcial') + '">' + (ok ? confete() : '') +
      '<div class="festa-top"><button class="voltar vidro" data-ir="viagem" aria-label="Voltar para a viagem">' + I('voltar', 20, '#fff', 2.4) + '</button></div>' +
      '<span class="selo-ok">' + I(ok ? 'check' : 'relogio', 30, '#fff', ok ? 3 : 2.2) + '</span><h1>' + (ok ? 'Tá combinado.' : 'O combinado até agora') + '</h1>' +
      '<p>' + (ok ? 'Tudo o que o grupo decidiu, num lugar só. Ninguém precisa rolar a conversa.' : 'O que já foi decidido fica aqui. O resto aparece conforme fecha.') + '</p>' +
      (ok ? '<p class="dias"><b>' + D.DIAS_ATE + '</b>dias para a viagem</p>' : '') + '</header>';
    function item(k, v, sub) { return '<div class="item"><span class="kk">' + k + '</span><span class="vv">' + v + (sub ? '<small>' + sub + '</small>' : '') + '</span></div>'; }
    var ab = '<span class="aberto">Ainda em aberto</span>';
    h += '<section class="cartao recibo">' + item('Quando', E.datas.fechado ? f.q : ab, E.datas.fechado ? f.s : '') + item('Onde', cv ? cv.nome : ab, cv ? cv.lugar + ' · ' + cv.resumo : '') +
      item('Quanto', cv ? brl(C.porPessoa(cv)) + ' por pessoa' : (E.teto.enviado ? 'Faixa até ' + brl(C.faixa()) : ab), cv ? 'Sinal de ' + brl(D.SINAL) + ' e ' + brl(C.porPessoa(cv) - D.SINAL) + ' até ' + D.PRAZO_RESTANTE : (E.teto.enviado ? 'por pessoa, só hospedagem' : '')) +
      item('Quem vai', E.datas.fechado ? C.rostos(q, 'pq') : ab, E.datas.fechado ? 'Téo não respondeu e ficou como interessado.' + (cv ? ' Se ele entrar, cai para ' + brl(C.porPessoa(cv, n + 1)) + '.' : '') : '');
    if (E.casa.fechado) {
      var arrec = pg.length * D.SINAL, meta = n * D.SINAL;
      h += '<div class="item"><span class="kk">Cofre</span><span class="vv">' + brl(arrec) + ' de ' + brl(meta) + '<small>' + pg.length + ' de ' + n + ' pagaram o sinal</small><span class="barra-pg"><i style="width:' + Math.round(arrec / meta * 100) + '%"></i></span>' +
        (dv.length ? '<span class="auto">' + I('sino', 16, '#0F5257', 2.2) + '<span>' + C.nomes(dv) + (dv.length > 1 ? ' ainda não pagaram' : ' ainda não pagou') + '. O lembrete sai sozinho amanhã, às 10h. Ninguém precisa cobrar.</span></span>' : '') + '</span></div>';
    }
    h += '</section>';
    if (E.casa.fechado) {
      h += '<section class="sec"><div class="sec-cab"><h2 class="h2">O que levar</h2><span class="miudo">toque para levar</span></div><div class="cartao" style="padding:4px 16px"><ul class="levar">' +
        D.LEVAR.map(function (x) {
          var eu = !!E.levar[x.id], quem = eu ? 'voce' : x.quem;
          return '<li><button class="ck" data-acao="levar" data-i="' + x.id + '" aria-pressed="' + (!!quem) + '" aria-label="' + x.item + '"' + (x.quem && !eu ? ' disabled' : '') + '>' + (quem ? I('check', 15, '#fff', 3) : '') + '</button>' +
            '<span class="it">' + x.item + '<small>' + (quem ? (quem === 'voce' ? 'Você leva' : D.PESSOAS[quem].nome + ' leva') : 'Ninguém ainda') + '</small></span>' + (quem ? C.rosto(quem, 'pq') : '') + '</li>';
        }).join('') + '</ul></div></section>';
    }
    if (ok && E.resumo) h += '<section class="zap" aria-label="Prévia da mensagem"><p class="k">Prévia no grupo do WhatsApp</p><div class="balao">' + esc(textoResumo()) + '<small>21:14 ✓✓</small></div></section>';
    h += '</div>';
    return { tab: 'inicio', claro: true, html: h, dock: ok ? cta(E.resumo ? 'Copiar o resumo de novo' : 'Mandar o resumo no grupo', 'data-acao="resumo"') : cta('Bora decidir', 'data-ir="' + C.proximo() + '"') };
  }, { titulo: 'O combinado' });
  C.acao('levar', function (b) { E.levar[b.dataset.i] = !E.levar[b.dataset.i]; });
  C.acao('resumo', function () {
    E.resumo = true; C.salvar(); C.render(); C.copiar(textoResumo(), 'Resumo copiado. É só colar no grupo.');
    var z = document.querySelector('.zap'); if (z) z.scrollIntoView({ block: 'center' }); return true;
  });

  /* ================= grupo e sair ================= */

  C.tela('grupo', function () {
    var f = C.fimVencedor(), q = C.quemVai(), pg = C.pagantes();
    var h = '<div class="tela">' + C.barra('', 'Grupo da viagem') + '<h1 class="h1">7 pessoas, um combinado</h1>' +
      '<p class="lead">Quem organiza não é quem cobra: os lembretes saem do app, e cada um vê só o que é do grupo.</p><section class="sec"><div class="cartao"><ul class="pessoas">';
    D.GRUPO.forEach(function (id) {
      var p = C.pessoa(id), st, cls, sub;
      if (id === 'voce' && E.saiu) { st = 'Saiu'; cls = 'trava'; sub = 'A vaga foi oferecida ao Téo'; }
      else if (id === 'teo') { st = 'Interessado'; cls = 'trava'; sub = 'Não respondeu as datas'; }
      else if (E.datas.fechado && q.indexOf(id) < 0) { st = 'Interessado'; cls = 'trava'; sub = 'Não pode em ' + f.curto; }
      else if (E.casa.fechado && pg.indexOf(id) >= 0) { st = 'Dentro'; cls = 'ok'; sub = 'Sinal pago'; }
      else if (E.casa.fechado) { st = 'Falta o sinal'; cls = 'vez'; sub = 'Lembrete amanhã'; }
      else if (id === 'voce' && !E.datas.enviado) { st = 'Sua vez'; cls = 'vez'; sub = 'Datas e teto em aberto'; }
      else { st = 'Respondeu'; cls = 'espera'; sub = 'Datas e teto enviados'; }
      if (id === D.ORGANIZA) sub = 'Organiza · ' + sub.charAt(0).toLowerCase() + sub.slice(1);
      h += '<li>' + C.rosto(id, 'gd') + '<span class="nm">' + (id === 'voce' ? p.nome + ' (você)' : p.nome) + '<small>' + sub + '</small></span><span class="selo ' + cls + '">' + st + '</span></li>';
    });
    h += '</ul></div></section><section class="sec"><h2 class="h2">Chamar mais gente</h2><div class="convite-link">' + I('link', 20, '#AE3A0B', 2.2) + '<code>' + esc(C.linkConvite().replace(/^https?:\/\//, '')) + '</code></div>' +
      '<p class="miudo" style="margin-top:8px">Quem entra pelo link responde datas e teto. Não precisa baixar nada nem criar conta.</p></section>' +
      (E.saiu ? '' : '<section class="sec"><button class="btn2 perigo" data-ir="sair">' + I('sair', 18, 'currentColor', 2.1) + 'Sair da viagem</button></section>') + '</div>';
    return { tab: 'inicio', html: h, dock: cta(I('copiar', 18, '#fff', 2.2) + 'Copiar o convite', 'data-acao="copiar-convite"') };
  }, { titulo: 'Grupo' });
  C.acao('copiar-convite', function () { C.fecharModal(); C.copiar(C.linkConvite(), 'Link do convite copiado.'); return true; });

  C.tela('sair', function () {
    var pago = E.sinal.pago, pix = E.conta.pix ? esc(E.conta.pix) : 'a chave Pix cadastrada no seu perfil';
    var h = '<div class="tela">' + C.barra('', 'Sair da viagem') + '<p class="k">Sair da viagem</p><h1 class="h1">Tem certeza que quer sair?</h1>' +
      '<p class="lead">Desistir faz parte. O Combinado cuida do resto para ninguém precisar explicar nem cobrar.</p>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:6px">O que acontece</h2>' +
      '<div class="passo-cofre"><i>1</i><p>Sua vaga é oferecida ao <b>Téo</b>, que está na fila de interessados.</p></div>' +
      '<div class="passo-cofre"><i>2</i><p>' + (pago ? 'Seu sinal de ' + brl(D.SINAL) + ' fica no cofre até ele pagar. Depois, volta para ' + pix + '.' : 'Você ainda não pagou o sinal, então não há nada a devolver.') + '</p></div>' +
      '<div class="passo-cofre"><i>3</i><p>O grupo recebe só "' + C.pessoa('voce').nome + ' saiu da viagem". Sem motivo e sem cobrança.</p></div></section>' +
      '<div style="margin-top:18px"><button class="btn2" data-ir="viagem">Continuar na viagem</button></div></div>';
    return { tab: 'inicio', html: h, dock: cta('Sair da viagem', 'data-acao="sair-viagem"', 'perigo') };
  }, { titulo: 'Sair da viagem' });
  C.acao('sair-viagem', function () { E.saiu = true; C.salvar(); C.ir(''); C.avisar('Você saiu da viagem. O grupo foi avisado.', 'sair'); return true; });

  /* ================= viagem passada ================= */

  C.tela('passada', function () {
    var p = D.PASSADA;
    var h = '<div class="tela"><div class="capa" style="' + C.bg(p.foto) + ';height:340px">' + capaTopo('') +
      '<div class="capa-tit" style="bottom:56px"><p class="k">Viagem combinada</p><h1 style="font-size:32px">' + p.nome + '</h1></div></div>' +
      '<div class="folha"><section class="cartao recibo" style="margin-top:0">' +
      '<div class="item"><span class="kk">Quando</span><span class="vv">' + p.quando + '</span></div>' +
      '<div class="item"><span class="kk">Onde</span><span class="vv">' + p.casa + '<small>Paraty, centro histórico</small></span></div>' +
      '<div class="item"><span class="kk">Quanto</span><span class="vv">' + brl(p.porPessoa) + ' por pessoa<small>Tudo pago antes da viagem</small></span></div>' +
      '<div class="item"><span class="kk">Quem foi</span><span class="vv">' + C.rostos(p.pessoas, 'pq') + '<small>' + p.pessoas.length + ' de ' + p.pessoas.length + ' que confirmaram</small></span></div></section>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Como foi decidir</h2><div class="numeros">' +
      '<p><b>' + p.decidiuEm + '</b>do convite à casa paga</p><p><b>' + p.lembretes + '</b>lembretes enviados pelo app</p><p><b>R$ 0</b>adiantados do próprio bolso</p></div></section></div></div>';
    return { tab: 'inicio', claro: true, html: h, dock: cta('Criar uma viagem parecida', 'data-acao="nova-parecida"') };
  }, { titulo: 'Réveillon em Paraty' });

  /* ================= viagem criada ================= */

  function criadaPor(id) { return E.criadas.filter(function (v) { return v.id === id; })[0]; }
  C.tela('v', function (id) {
    var v = criadaPor(id);
    if (!v) { setTimeout(function () { C.ir(''); }, 0); return {}; }
    var fins = D.FINS_DEZ.filter(function (f) { return v.fins.indexOf(f.id) >= 0; });
    var h = '<div class="tela"><div class="capa" style="' + C.bg(v.capa) + ';height:340px">' + capaTopo('', '<span class="acoes-capa"><button class="pilula redonda" data-acao="apagar-criada" data-v="' + v.id + '" aria-label="Apagar viagem">' + I('lixeira', 18, '#fff', 2.2) + '</button></span>') +
      '<div class="capa-tit" style="bottom:56px"><p class="k">Criada por você · rascunho</p><h1 style="font-size:32px">' + esc(v.nome) + '</h1><div class="pilulas"><span class="pilula">' + I('calendario', 14, '#fff', 2.4) + fins.length + (fins.length === 1 ? ' fim de semana' : ' fins de semana') + '</span>' +
      (v.destino ? '<span class="pilula">' + I('pin', 14, '#fff', 2.4) + esc(v.destino) + '</span>' : '') + '</div></div></div>' +
      '<div class="folha"><section class="res espera" style="margin-top:0"><p class="k">Esperando o grupo</p><p class="gd" style="font-size:20px">Ninguém respondeu ainda.</p><p>Mande o link no grupo do WhatsApp. As decisões abrem conforme as respostas chegam.</p></section>' +
      '<section class="sec"><div class="sec-cab"><h2 class="h2">As quatro decisões</h2><span class="miudo">0 de 4</span></div>' + placar([
        { n: 1, nome: 'Datas', st: 'vez', rot: 'Aberta', det: fins.map(function (f) { return f.curto; }).join(', ') + ' · fecha em ' + v.prazoDatas + ' dias' },
        { n: 2, nome: 'Orçamento', st: 'vez', rot: 'Aberta', det: 'Cada um guarda o teto em segredo' },
        { n: 3, nome: 'Casa', st: 'trava', det: 'Votação de ' + v.prazoVoto + (v.prazoVoto === 1 ? ' dia' : ' dias') + ' depois do orçamento' },
        { n: 4, nome: 'Quem vai', st: 'trava', det: 'Sinal de ' + brl(v.sinal) + ' por pessoa' }]) + '</section>' +
      '<section class="sec"><h2 class="h2">Link do convite</h2><div class="convite-link">' + I('link', 20, '#AE3A0B', 2.2) + '<code>' + esc(C.linkConvite().replace(/^https?:\/\//, '').replace('convite', 'convite/' + v.id)) + '</code></div>' +
      '<p class="miudo" style="margin-top:8px">Nesta demonstração, só a viagem Praia em novembro tem respostas do grupo.</p></section></div></div>';
    return { tab: 'inicio', claro: true, html: h, dock: cta(I('enviar', 18, '#fff', 2.2) + 'Mandar o convite no grupo', 'data-acao="copiar-convite"') };
  }, { titulo: 'Viagem criada' });
  C.acao('apagar-criada', function (b) {
    C.modal({ titulo: 'Apagar esta viagem?', texto: 'Ela ainda não tem respostas, então ninguém do grupo perde nada.', ok: 'Apagar viagem', acao: 'confirmar-apagar-criada', perigo: true });
    E._apagar = b.dataset.v; return true;
  });
  C.acao('confirmar-apagar-criada', function () {
    E.criadas = E.criadas.filter(function (v) { return v.id !== E._apagar; }); delete E._apagar; C.salvar(); C.fecharModal(true); C.ir(''); C.avisar('Viagem apagada.', 'lixeira'); return true;
  });

  /* ================= assistente: criar viagem ================= */

  function novoRascunho(base) { return Object.assign({ passo: 1, nome: '', destino: '', capa: 'capa', fins: [], prazoDatas: 3, prazoVoto: 2, sinal: 150 }, base || {}); }
  C.acao('nova-viagem', function () { E.rascunho = novoRascunho(); C.salvar(); C.ir('nova/1'); return true; });
  C.acao('nova-parecida', function () { E.rascunho = novoRascunho({ nome: 'Réveillon 2027', destino: 'Paraty', capa: 'pordosol' }); C.salvar(); C.ir('nova/1'); return true; });

  var errosNova = {};
  function cabNova(n) {
    return '<header class="barra"><button class="voltar" data-acao="cancelar-nova" aria-label="Fechar">' + I('x', 20, '#1E2629', 2.4) + '</button><span class="barra-tit"><b>Passo ' + n + ' de 4</b>Nova viagem</span></header>' +
      '<div class="passos" style="margin-top:2px">' + [1, 2, 3, 4].map(function (i) { return '<i class="' + (i <= n ? 'ok' : '') + '"></i>'; }).join('') + '</div>';
  }
  function chipsDe(lista, atual, acao, fmt) {
    return '<div class="chips" role="radiogroup">' + lista.map(function (v) { return '<button role="radio" aria-checked="' + (atual === v) + '" data-acao="' + acao + '" data-v="' + v + '">' + fmt(v) + '</button>'; }).join('') + '</div>';
  }

  C.tela('nova', function (param) {
    if (!E.rascunho) E.rascunho = novoRascunho();
    var R = E.rascunho, n = Math.min(4, Math.max(1, +param || 1)), h = '<div class="tela sem-tab">' + cabNova(n), dock;
    if (n === 1) {
      h += '<h1 class="h1">Para onde vocês vão?</h1><p class="lead">Pode ser só uma ideia. O grupo decide o resto junto.</p><div class="form">' +
        '<div class="campo' + (errosNova.nome ? ' com-erro' : '') + '"><label for="n-nome">Nome da viagem</label><input id="n-nome" maxlength="40" placeholder="Réveillon 2027" value="' + esc(R.nome) + '"' + (errosNova.nome ? ' aria-invalid="true"' : '') + '>' + (errosNova.nome ? '<p class="erro">' + errosNova.nome + '</p>' : '') + '</div>' +
        '<div class="campo"><label for="n-dest">Destino ou ideia <span class="opc">opcional</span></label><input id="n-dest" maxlength="40" placeholder="Ilha Grande, Paraty ou o que der" value="' + esc(R.destino) + '"></div>' +
        '<div class="campo"><label>Foto de capa</label><div class="capas" role="radiogroup">' + D.CAPAS.map(function (c) {
          return '<button role="radio" aria-checked="' + (R.capa === c) + '" aria-label="Capa ' + c + '" data-acao="nova-capa" data-v="' + c + '" style="' + C.bg(c) + '">' + (R.capa === c ? '<span>' + I('check', 16, '#fff', 3) + '</span>' : '') + '</button>';
        }).join('') + '</div></div></div>';
      dock = cta('Continuar', 'data-acao="nova-continuar" data-n="1"');
    } else if (n === 2) {
      h += '<h1 class="h1">Quais fins de semana estão na mesa?</h1><p class="lead">O grupo marca em quais pode. Escolha de 1 a 4 opções.</p><ul class="fins">' + D.FINS_DEZ.map(function (f) {
        var on = R.fins.indexOf(f.id) >= 0;
        return '<li><button class="fim-sel" role="checkbox" aria-checked="' + on + '" data-acao="nova-fim" data-v="' + f.id + '"><span class="caixa">' + (on ? I('check', 14, '#fff', 3.2) : '') + '</span><span><b>' + f.q + '</b><small>' + (f.s || 'sexta a domingo') + '</small></span></button></li>';
      }).join('') + '</ul>' + (errosNova.fins ? '<p class="erro">' + errosNova.fins + '</p>' : '');
      dock = cta('Continuar', 'data-acao="nova-continuar" data-n="2"');
    } else if (n === 3) {
      h += '<h1 class="h1">As regras do combinado</h1><p class="lead">Elas valem para todo mundo e aparecem antes de cada decisão. É isso que tira a cobrança de você.</p>' +
        '<section class="sec"><h2 class="h2" style="margin-bottom:10px">Prazo para as datas</h2>' + chipsDe([2, 3, 5], R.prazoDatas, 'nova-pd', function (v) { return v + ' dias'; }) + '</section>' +
        '<section class="sec"><h2 class="h2" style="margin-bottom:10px">Prazo para votar na casa</h2>' + chipsDe([1, 2, 3], R.prazoVoto, 'nova-pv', function (v) { return v + (v === 1 ? ' dia' : ' dias'); }) + '</section>' +
        '<section class="sec"><h2 class="h2" style="margin-bottom:10px">Sinal por pessoa</h2>' + chipsDe([100, 150, 200, 300], R.sinal, 'nova-sinal', brl) + '</section>' +
        '<section class="sec"><h2 class="h2" style="margin-bottom:10px">Valem sempre</h2><div class="cartao" style="padding:4px 16px">' +
        ['O silêncio não conta como sim', 'O teto de cada um fica em segredo', 'Empate na votação: vence a mais barata', 'Confirmado é quem pagou o sinal'].map(function (t) {
          return '<p class="regra-fixa">' + I('cadeado', 16, '#0F5257', 2.2) + t + '</p>';
        }).join('') + '</div></section>';
      dock = cta('Continuar', 'data-acao="nova-continuar" data-n="3"');
    } else {
      var fins = D.FINS_DEZ.filter(function (f) { return R.fins.indexOf(f.id) >= 0; });
      h += '<h1 class="h1">Chame o grupo</h1><p class="lead">Assim o convite aparece no WhatsApp. Quem toca no link responde sem baixar nada.</p>' +
        '<div class="capa-mini" style="margin-top:18px;' + C.bg(R.capa) + '"><p class="k" style="color:#fff">Convite de ' + C.pessoa('voce').nome + '</p><h2>' + esc(R.nome || 'Nova viagem') + '</h2>' +
        '<div class="pilulas"><span class="pilula">' + I('calendario', 14, '#fff', 2.4) + fins.map(function (f) { return f.curto; }).join(' ou ') + '</span>' + (R.destino ? '<span class="pilula">' + I('pin', 14, '#fff', 2.4) + esc(R.destino) + '</span>' : '') + '</div></div>' +
        '<div class="cartao conta" style="margin-top:14px"><div class="linha"><span>Datas fecham em</span><b>' + R.prazoDatas + ' dias</b></div><div class="linha"><span>Votação da casa</span><b>' + R.prazoVoto + (R.prazoVoto === 1 ? ' dia' : ' dias') + '</b></div><div class="linha"><span>Sinal por pessoa</span><b>' + brl(R.sinal) + '</b></div></div>' +
        '<div style="margin-top:14px"><button class="btn2" data-acao="copiar-convite">' + I('copiar', 17, 'currentColor', 2.2) + 'Copiar o link do convite</button></div>';
      dock = cta('Criar viagem', 'data-acao="criar-viagem"');
    }
    return {
      semTab: true, html: h + '</div>', dock: dock,
      depois: function () {
        var a = document.getElementById('n-nome'), b = document.getElementById('n-dest');
        if (a) a.addEventListener('input', function () { R.nome = a.value; C.salvar(); if (errosNova.nome) { delete errosNova.nome; a.removeAttribute('aria-invalid'); a.parentNode.classList.remove('com-erro'); var e = a.parentNode.querySelector('.erro'); if (e) e.remove(); } });
        if (b) b.addEventListener('input', function () { R.destino = b.value; C.salvar(); });
      }
    };
  }, { titulo: 'Nova viagem' });
  C.acao('nova-capa', function (b) { E.rascunho.capa = b.dataset.v; });
  C.acao('nova-fim', function (b) { var l = E.rascunho.fins, i = l.indexOf(b.dataset.v); if (i >= 0) l.splice(i, 1); else l.push(b.dataset.v); delete errosNova.fins; });
  C.acao('nova-pd', function (b) { E.rascunho.prazoDatas = +b.dataset.v; });
  C.acao('nova-pv', function (b) { E.rascunho.prazoVoto = +b.dataset.v; });
  C.acao('nova-sinal', function (b) { E.rascunho.sinal = +b.dataset.v; });
  C.acao('nova-continuar', function (b) {
    var n = +b.dataset.n, R = E.rascunho; errosNova = {};
    if (n === 1 && String(R.nome || '').trim().length < 2) errosNova.nome = 'Dê um nome para a viagem.';
    if (n === 2 && !R.fins.length) errosNova.fins = 'Escolha pelo menos um fim de semana.';
    if (Object.keys(errosNova).length) { C.render(); var x = document.querySelector('[aria-invalid="true"]'); if (x) x.focus(); return true; }
    R.passo = n + 1; C.salvar(); C.ir('nova/' + (n + 1)); return true;
  });
  C.acao('cancelar-nova', function () {
    if (!E.rascunho || !String(E.rascunho.nome || '').trim()) { E.rascunho = null; C.salvar(); C.ir(''); return true; }
    C.modal({ titulo: 'Descartar esta viagem?', texto: 'O que você preencheu até aqui vai se perder.', ok: 'Descartar', acao: 'descartar-nova', perigo: true, cancelar: 'Continuar editando' });
    return true;
  });
  C.acao('descartar-nova', function () { E.rascunho = null; C.salvar(); C.fecharModal(true); C.ir(''); return true; });
  C.acao('criar-viagem', function () {
    var R = E.rascunho, id = 'n' + Date.now().toString(36);
    E.criadas.push({ id: id, nome: String(R.nome).trim(), destino: String(R.destino || '').trim(), capa: R.capa, fins: R.fins.slice(), prazoDatas: R.prazoDatas, prazoVoto: R.prazoVoto, sinal: R.sinal });
    E.rascunho = null; C.salvar(); C.ir('v/' + id); C.avisar('Viagem criada. Agora é só mandar o link no grupo.', 'festa'); return true;
  });
})(window.C);
