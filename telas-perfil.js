/* Abas e configurações: atividade, cofre, perfil, editar perfil, notificações,
   privacidade, pagamentos e ajuda. */
(function (C) {
  'use strict';
  var D = C.D, I = C.I, E = C.E, brl = C.brl, cta = C.cta, esc = C.esc;
  var erros = {};

  function voltarPerfil(titulo) {
    return '<header class="barra"><button class="voltar" data-ir="perfil" aria-label="Voltar para o perfil">' + I('voltar', 20, '#1E2629', 2.4) + '</button><span class="barra-tit"><b>Perfil</b>' + titulo + '</span></header>';
  }
  function menuIt(ic, rotulo, attrs, sub, perigo) {
    return '<button class="menu-it' + (perigo ? ' perigo' : '') + '" ' + attrs + '><span class="ic">' + I(ic, 19, 'currentColor', 2.1) + '</span><span class="tx">' + rotulo + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (perigo ? '' : I('seta', 16, '#646E71', 2.4)) + '</button>';
  }

  /* ================= atividade ================= */
  C.tela('atividade', function () {
    var ev = C.eventos(), grupos = {}, ordem = [];
    E.vistoAtividade = ev.length; C.salvar();
    ev.forEach(function (e) { if (!grupos[e.q]) { grupos[e.q] = []; ordem.push(e.q); } grupos[e.q].push(e); });
    var h = '<div class="tela so-tab"><div class="aba-cab"><p class="k">Atividade</p><h1 class="h1">O que aconteceu</h1>' +
      '<p class="lead">Decisões do grupo e lembretes que o Combinado manda sozinho. Quem organiza não vira cobrador.</p></div>';
    ordem.forEach(function (q) { h += '<p class="dia-tit">' + q + '</p><div class="cartao" style="padding:4px 16px"><ul class="feed">' + grupos[q].map(C.itemFeed).join('') + '</ul></div>'; });
    return { tab: 'atividade', html: h + '</div>' };
  }, { titulo: 'Atividade' });

  /* ================= cofre ================= */
  C.tela('cofre', function () {
    var aberto = E.entrou && E.casa.fechado, q = C.quemVai(), pg = C.pagantes(), n = q.length;
    var arrec = aberto ? pg.length * D.SINAL : 0, meta = n * D.SINAL, pagar = aberto && !E.sinal.pago && !E.saiu;
    var h = '<div class="tela' + (pagar ? '' : ' so-tab') + '"><div class="aba-cab"><p class="k">Cofre</p><h1 class="h1">O dinheiro não passa pelo amigo</h1></div>';
    if (!E.entrou) {
      h += '<section class="res espera"><p class="k">Nenhum cofre aberto</p><p class="gd" style="font-size:20px">O cofre abre quando a casa é escolhida.</p><p>Aceite o convite da Ju para acompanhar o cofre da viagem Praia em novembro.</p></section>';
    } else {
      h += '<section class="saldo"><p class="k">' + D.VIAGEM + ' · sinal</p><p class="n">' + brl(arrec) + '<small>' + (aberto ? 'de ' + brl(meta) : 'ainda fechado') + '</small></p><span class="barra-pg"><i style="width:' + (aberto ? Math.round(arrec / meta * 100) : 0) + '%"></i></span>' +
        '<p class="r"><span>' + (aberto ? pg.length + ' de ' + n + ' pagaram' : 'Abre quando a casa for escolhida') + '</span><span>' + (aberto ? 'Entrada da casa: ' + brl(meta) : 'Sinal de ' + brl(D.SINAL) + ' por pessoa') + '</span></p></section>' +
        '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Pagamentos</h2><div class="cartao"><ul class="pessoas">';
      q.concat(['teo']).forEach(function (id) {
        var p = C.pessoa(id), st, cls, sub;
        if (id === 'teo') { st = 'Interessado'; cls = 'trava'; sub = 'Não respondeu as datas'; }
        else if (!aberto) { st = 'A abrir'; cls = 'espera'; sub = 'Paga depois da casa'; }
        else if (pg.indexOf(id) >= 0) { st = 'Pago'; cls = 'ok'; sub = 'Sinal de ' + brl(D.SINAL); }
        else { st = 'Falta'; cls = 'vez'; sub = 'Lembrete amanhã, às 10h'; }
        h += '<li>' + C.rosto(id, 'gd') + '<span class="nm">' + (id === 'voce' ? p.nome + ' (você)' : p.nome) + '<small>' + sub + '</small></span><span class="selo ' + cls + '">' + st + '</span></li>';
      });
      h += '</ul></div></section>';
    }
    h += '<section class="sec"><h2 class="h2" style="margin-bottom:6px">Como funciona</h2>' +
      '<div class="passo-cofre"><i>1</i><p>Cada um paga o próprio sinal por Pix, direto para o cofre da viagem.</p></div>' +
      '<div class="passo-cofre"><i>2</i><p>Quando o cofre cobre a entrada, a reserva da casa é paga. Ninguém adianta do próprio bolso.</p></div>' +
      '<div class="passo-cofre"><i>3</i><p>O restante vence perto da viagem, com lembrete automático para quem faltar.</p></div></section>' +
      '<section class="sec"><h2 class="h2" style="margin-bottom:12px">Outras viagens</h2><div class="cartao lista">' +
      E.criadas.map(function (v) { return '<button class="lin" data-ir="v/' + v.id + '"><span class="mini" style="' + C.bg(v.capa) + '"></span><span class="tx"><b>' + esc(v.nome) + '</b><small>Sinal de ' + brl(v.sinal) + ' · abre depois da casa</small></span><span class="selo espera">A abrir</span></button>'; }).join('') +
      '<button class="lin" data-ir="passada"><span class="mini" style="' + C.bg(D.PASSADA.foto) + '"></span><span class="tx"><b>' + D.PASSADA.nome + '</b><small>Encerrado · tudo pago à casa</small></span><span class="selo ok">Fechado</span></button></div></section></div>';
    return { tab: 'cofre', html: h, dock: pagar ? cta('Pagar meu sinal', 'data-ir="sinal"') : '' };
  }, { titulo: 'Cofre' });

  /* ================= perfil ================= */
  C.tela('perfil', function () {
    var conv = E.sessao === 'convidado';
    var viagens = (E.entrou && !E.saiu ? 1 : 0) + E.criadas.length + 1, comb = 1 + (C.tudo() ? 1 : 0);
    var h = '<div class="tela so-tab"><div class="aba-cab perfil-cab">' + C.rosto('voce', 'xl') +
      '<div><h1 class="h1" style="margin-top:0">' + (C.primeiroNome() ? esc(E.conta.nome) : 'Você') + '</h1><p class="miudo">' + (conv ? 'Convidado neste aparelho' : esc(E.conta.celular || '')) + '</p></div></div>';
    if (conv) h += '<div class="aviso-fixo">' + I('usuario', 20, 'currentColor', 2.1) + '<div><b>Você está como convidado.</b><p>Crie a conta para guardar a viagem em qualquer aparelho e criar as suas.</p><button class="link" data-ir="cadastro">Criar minha conta</button></div></div>';
    var kp = [[viagens, viagens === 1 ? 'viagem' : 'viagens'], [comb, comb === 1 ? 'combinada' : 'combinadas']];
    if (E.entrou && !E.saiu && E.datas.fechado) kp.push([D.DIAS_ATE, 'dias para a próxima']);
    h += '<div style="margin-top:18px">' + C.kpis(kp) + C.promessa('R$ 0 adiantados do próprio bolso. Nas suas viagens, quem paga a casa é o cofre.') + '</div>';
    h += '<p class="menu-tit">Conta</p><div class="menu">' + menuIt('editar', 'Editar perfil', 'data-ir="conta"', 'Nome, cor e celular') + menuIt('cofre', 'Pagamentos e Pix', 'data-ir="pagamentos"', E.conta.pix ? 'Chave cadastrada' : 'Nenhuma chave ainda') + '</div>' +
      '<p class="menu-tit">Preferências</p><div class="menu">' + menuIt('sino', 'Notificações', 'data-ir="notificacoes"') + menuIt('escudo', 'Privacidade e segurança', 'data-ir="privacidade"') + '</div>' +
      '<p class="menu-tit">Ajuda</p><div class="menu">' + menuIt('ajuda', 'Central de ajuda', 'data-ir="ajuda"') + menuIt('documento', 'Termos e privacidade', 'data-ir="termos"') + '</div>' +
      '<div class="menu" style="margin-top:14px">' + menuIt('sair', conv ? 'Sair do modo convidado' : 'Sair da conta', 'data-acao="logout"', '', true) + '</div>' +
      '<p class="versao">Combinado 1.0 · protótipo de demonstração</p></div>';
    return { tab: 'perfil', html: h };
  }, { titulo: 'Perfil' });

  C.acao('logout', function () {
    var conv = E.sessao === 'convidado';
    C.modal({ titulo: conv ? 'Sair do modo convidado?' : 'Sair da conta?', texto: conv ? 'Sem conta, a viagem fica só neste aparelho. Você pode voltar pelo link do convite.' : 'Suas viagens continuam salvas. Para voltar, é só entrar com o celular.', ok: 'Sair', acao: 'confirmar-logout', perigo: true });
    return true;
  });
  C.acao('confirmar-logout', function () { E.sessao = 'fora'; C.salvar(); C.fecharModal(true); C.ir('abertura'); C.avisar('Você saiu. Até a próxima viagem.', 'sair'); return true; });

  /* ---------- editar perfil ---------- */
  var CORES = ['#C92B45', '#B5470F', '#0F5257', '#3557C4', '#7B3FA6', '#1E2629'];
  C.tela('conta', function () {
    if (!E.edit) E.edit = { nome: E.conta.nome, cel: E.conta.celular, cor: E.conta.cor };
    var X = E.edit;
    function campo(id, rot, attrs, val, dica) {
      var e = erros[id];
      return '<div class="campo' + (e ? ' com-erro' : '') + '"><label for="' + id + '">' + rot + '</label><input id="' + id + '" ' + attrs + ' value="' + esc(val) + '"' + (e ? ' aria-invalid="true"' : '') + '>' + (e ? '<p class="erro">' + e + '</p>' : (dica ? '<p class="dica">' + dica + '</p>' : '')) + '</div>';
    }
    var h = '<div class="tela">' + voltarPerfil('Editar perfil') + '<h1 class="h1">Editar perfil</h1><p class="lead">É assim que o grupo te vê: o nome e a cor. O celular não aparece para ninguém.</p>' +
      '<div class="avatar-ed"><span class="rosto xl" id="prev" style="background:' + X.cor + ';color:#fff">' + (C.iniciais(X.nome) || 'VC') + '</span><div class="cores" role="radiogroup" aria-label="Cor do avatar">' +
      CORES.map(function (c) { return '<button role="radio" aria-checked="' + (X.cor === c) + '" aria-label="Cor ' + c + '" data-acao="edit-cor" data-c="' + c + '" style="background:' + c + '"></button>'; }).join('') + '</div></div>' +
      '<div class="form">' + campo('p-nome', 'Nome', 'autocomplete="name" maxlength="40"', X.nome) +
      (E.sessao === 'conta' ? campo('p-cel', 'Celular', 'type="tel" inputmode="tel" maxlength="15"', X.cel, 'Se mudar o número, confirmamos o novo por SMS.') : '') + '</div></div>';
    return {
      tab: 'perfil', html: h, dock: cta('Salvar alterações', 'data-acao="salvar-perfil"'),
      depois: function () {
        var a = document.getElementById('p-nome'), b = document.getElementById('p-cel');
        a.addEventListener('input', function () { X.nome = a.value; C.salvar(); document.getElementById('prev').textContent = C.iniciais(a.value) || 'VC'; });
        if (b) b.addEventListener('input', function () { b.value = C.mascaraCelular(b.value); X.cel = b.value; C.salvar(); });
        C.aoSair(function () { if (location.hash.indexOf('#/conta') !== 0 && location.hash.indexOf('#/codigo') !== 0) delete E.edit; });
      }
    };
  }, { titulo: 'Editar perfil' });
  C.acao('edit-cor', function (b) { E.edit.cor = b.dataset.c; });
  C.acao('salvar-perfil', function () {
    var X = E.edit; erros = {};
    if (String(X.nome || '').trim().length < 2) erros['p-nome'] = 'Diga como o grupo te chama.';
    if (E.sessao === 'conta' && String(X.cel || '').replace(/\D/g, '').length !== 11) erros['p-cel'] = 'Use o DDD e os 9 números do celular.';
    if (Object.keys(erros).length) { C.render(); var x = document.querySelector('[aria-invalid="true"]'); if (x) x.focus(); return true; }
    E.conta.nome = String(X.nome).trim(); E.conta.cor = X.cor;
    if (E.sessao === 'conta' && X.cel !== E.conta.celular) { E.novoCel = X.cel; E.fluxo = 'trocar'; C.salvar(); C.ir('codigo'); return true; }
    delete E.edit; C.salvar(); C.ir('perfil'); C.avisar('Perfil atualizado.'); return true;
  });

  /* ---------- notificações ---------- */
  C.tela('notificacoes', function () {
    var n = E.notif;
    return {
      tab: 'perfil',
      html: '<div class="tela so-tab">' + voltarPerfil('Notificações') + '<h1 class="h1">Notificações</h1><p class="lead">Os lembretes para outras pessoas saem do Combinado, nunca do seu nome.</p>' +
        '<div class="cartao opcoes">' + C.chave('notif.prazos', n.prazos, 'Prazos das decisões', 'Um aviso no dia em que cada decisão fecha') +
        C.chave('notif.decisoes', n.decisoes, 'Quando o grupo decide', 'Datas, faixa e casa combinadas') +
        C.chave('notif.pagamentos', n.pagamentos, 'Lembretes de pagamento', 'Sinal e restante, perto do vencimento') +
        C.chave('notif.resumo', n.resumo, 'Resumo semanal', 'Um panorama das suas viagens às segundas') + '</div>' +
        '<div class="cartao opcoes" style="margin-top:12px">' + C.chave('notif.silencio', n.silencio, 'Não perturbe à noite', 'Nada entre 22h e 8h. Os avisos esperam a manhã.') + '</div></div>'
    };
  }, { titulo: 'Notificações' });
  C.acao('alternar', function (b) {
    var k = b.dataset.k.split('.'); E[k[0]][k[1]] = !E[k[0]][k[1]]; C.salvar();
    b.setAttribute('aria-checked', String(E[k[0]][k[1]])); return true;
  });

  /* ---------- privacidade ---------- */
  C.tela('privacidade', function () {
    return {
      tab: 'perfil',
      html: '<div class="tela so-tab">' + voltarPerfil('Privacidade e segurança') + '<h1 class="h1">Privacidade e segurança</h1>' +
        '<div class="segredo" style="margin-top:16px">' + I('cadeado', 20, 'currentColor', 2.2) + '<p><b>Seu teto é só seu.</b>Nenhuma pessoa do grupo, nem quem organiza, vê o valor. O grupo vê só a faixa, sem saber de quem é o limite.</p></div>' +
        '<div class="cartao opcoes" style="margin-top:12px">' + C.chave('priv.nomeNosVotos', E.priv.nomeNosVotos, 'Mostrar meu rosto nos votos', 'Se desligar, seu voto conta igual, mas aparece sem rosto.') + '</div>' +
        '<p class="menu-tit">Seus dados</p><div class="menu">' + menuIt('baixar', 'Baixar meus dados', 'data-acao="baixar-dados"', 'Um arquivo com tudo o que o app guarda sobre você') +
        menuIt('lixeira', 'Apagar minha conta', 'data-acao="apagar-conta"', '', true) + '</div></div>'
    };
  }, { titulo: 'Privacidade' });
  C.acao('baixar-dados', function () {
    var dados = { conta: { nome: E.conta.nome, celular: E.conta.celular, chavePix: E.conta.pix }, viagens: { praiaEmNovembro: { datas: E.datas, seuTeto: E.teto.enviado ? E.teto.valor : null, voto: E.casa.voto, sinalPago: E.sinal.pago } }, criadas: E.criadas, notificacoes: E.notif };
    try {
      var url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' }));
      var a = document.createElement('a'); a.href = url; a.download = 'meus-dados-combinado.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      C.avisar('Arquivo com os seus dados baixado.', 'baixar');
    } catch (e) { C.avisar('Não deu para baixar agora. Tente de novo.', 'x'); }
    return true;
  });
  C.acao('apagar-conta', function () {
    C.modal({ titulo: 'Apagar a sua conta?', texto: 'Suas viagens, respostas e a chave Pix somem deste aparelho. Isso não pode ser desfeito.', ok: 'Apagar para sempre', acao: 'confirmar-apagar-conta', perigo: true });
    return true;
  });
  C.acao('confirmar-apagar-conta', function () { C.zerar(); C.fecharModal(true); C.ir('abertura'); C.avisar('Conta apagada.', 'lixeira'); return true; });

  /* ---------- pagamentos ---------- */
  C.tela('pagamentos', function () {
    var t = E.pixEdit || { tipo: E.conta.pixTipo || 'celular', valor: E.conta.pix || '' };
    E.pixEdit = t;
    var hist = '';
    if (E.sinal.pago) hist += '<li><span class="ic mar">' + I('cofre', 18, 'currentColor', 2.2) + '</span><span class="nm">Sinal · ' + D.VIAGEM + '<small>Pago ao cofre da viagem, hoje</small></span><b>' + brl(D.SINAL) + '</b></li>';
    hist += '<li><span class="ic cinza">' + I('cofre', 18, 'currentColor', 2.2) + '</span><span class="nm">' + D.PASSADA.nome + '<small>Pago ao cofre, dezembro de 2025</small></span><b>' + brl(D.PASSADA.porPessoa) + '</b></li>';
    var ph = t.tipo === 'email' ? 'voce@email.com' : (t.tipo === 'aleatoria' ? 'Cole a chave aleatória' : '(11) 98765-4321');
    var e = erros.pix;
    return {
      tab: 'perfil',
      html: '<div class="tela">' + voltarPerfil('Pagamentos e Pix') + '<h1 class="h1">Pagamentos e Pix</h1><p class="lead">A chave só é usada para devolver um sinal, se você desistir e alguém ocupar a sua vaga.</p>' +
        '<div class="campo"><label>Tipo de chave</label><div class="chips" role="radiogroup">' + [['celular', 'Celular'], ['email', 'E-mail'], ['aleatoria', 'Aleatória']].map(function (x) {
          return '<button role="radio" aria-checked="' + (t.tipo === x[0]) + '" data-acao="pix-edit-tipo" data-t="' + x[0] + '">' + x[1] + '</button>';
        }).join('') + '</div></div>' +
        '<div class="campo' + (e ? ' com-erro' : '') + '"><label for="pix">Chave Pix</label><input id="pix" maxlength="60" placeholder="' + ph + '" value="' + esc(t.valor) + '"' + (e ? ' aria-invalid="true"' : '') + '>' + (e ? '<p class="erro">' + e + '</p>' : '') + '</div>' +
        '<p class="menu-tit">Histórico</p><div class="cartao"><ul class="pessoas hist">' + hist + '</ul></div></div>',
      dock: cta('Salvar chave', 'data-acao="salvar-pix"'),
      depois: function () {
        var el = document.getElementById('pix');
        el.addEventListener('input', function () { if (t.tipo === 'celular') el.value = C.mascaraCelular(el.value); t.valor = el.value; C.salvar(); });
        C.aoSair(function () { delete E.pixEdit; });
      }
    };
  }, { titulo: 'Pagamentos' });
  C.acao('pix-edit-tipo', function (b) { E.pixEdit.tipo = b.dataset.t; E.pixEdit.valor = ''; delete erros.pix; });
  C.acao('salvar-pix', function () {
    var t = E.pixEdit, v = String(t.valor || '').trim(); erros = {};
    if (t.tipo === 'celular' && v.replace(/\D/g, '').length !== 11) erros.pix = 'Use o DDD e os 9 números do celular.';
    if (t.tipo === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) erros.pix = 'Confira o e-mail: parece incompleto.';
    if (t.tipo === 'aleatoria' && v.replace(/[^0-9a-f]/gi, '').length < 32) erros.pix = 'A chave aleatória tem 32 letras e números.';
    if (erros.pix) { C.render(); document.getElementById('pix').focus(); return true; }
    E.conta.pix = v; E.conta.pixTipo = t.tipo; delete E.pixEdit; C.salvar(); C.ir('perfil'); C.avisar('Chave Pix salva.'); return true;
  });

  /* ---------- ajuda ---------- */
  C.tela('ajuda', function () {
    return {
      tab: 'perfil',
      html: '<div class="tela">' + voltarPerfil('Central de ajuda') + '<h1 class="h1">Central de ajuda</h1><p class="lead">As dúvidas mais comuns sobre como o grupo decide.</p>' +
        '<div class="faq">' + D.FAQ.map(function (q, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + q[0] + I('seta', 16, '#646E71', 2.4) + '</summary><p>' + q[1] + '</p></details>'; }).join('') + '</div>' +
        '<div class="aviso-fixo" style="margin-top:18px">' + I('mensagem', 20, 'currentColor', 2.1) + '<div><b>Ainda com dúvida?</b><p>Responda pelo app e a gente volta por SMS em até um dia útil.</p></div></div></div>',
      dock: cta(I('mensagem', 18, '#fff', 2.2) + 'Falar com a gente', 'data-acao="suporte"')
    };
  }, { titulo: 'Ajuda' });
  C.acao('suporte', function () { C.avisar('Mensagem enviada. A resposta chega por SMS.', 'mensagem'); return true; });
})(window.C);
