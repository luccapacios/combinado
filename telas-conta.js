/* Telas de conta: abertura, cadastro, entrar, código, perfil inicial, convite e termos. */
(function (C) {
  'use strict';
  var D = C.D, I = C.I, E = C.E;
  var erros = {};          // erros de validação da tela atual (não persistem)
  var timerReenvio = null;
  var CORES = ['#C92B45', '#B5470F', '#0F5257', '#3557C4', '#7B3FA6', '#1E2629'];

  function campo(id, rotulo, attrs, valor, dica) {
    var e = erros[id];
    return '<div class="campo' + (e ? ' com-erro' : '') + '"><label for="' + id + '">' + rotulo + '</label>' +
      '<input id="' + id + '" ' + attrs + ' value="' + C.esc(valor) + '"' + (e ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') + '>' +
      (e ? '<p class="erro" id="' + id + '-e">' + e + '</p>' : (dica ? '<p class="dica">' + dica + '</p>' : '')) + '</div>';
  }
  function ligar(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('input', function () { fn(el); }); }
  function limparErro(id) { if (erros[id]) { delete erros[id]; var c = document.getElementById(id); if (c) { c.removeAttribute('aria-invalid'); var p = c.parentNode; p.classList.remove('com-erro'); var e = p.querySelector('.erro'); if (e) e.remove(); } } }
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }

  /* ---------- abertura ---------- */
  C.tela('abertura', function () {
    function regra(ic, t) { return '<p class="regra"><span class="ic">' + I(ic, 18, '#fff', 2.2) + '</span>' + t + '</p>'; }
    return {
      semTab: true, claro: true,
      html: '<div class="abertura">' + C.logo('#fff') +
        '<button class="push" data-ir="convite">' + C.rosto('ju', 'gd') + '<span><b>A Ju te convidou para uma viagem</b><small>Praia em novembro · toque para ver o convite</small></span>' + I('seta', 18, '#fff', 2.4) + '</button>' +
        '<div><h1>A viagem sai do grupo.</h1>' +
        '<p class="sub">Data, orçamento e casa decididos em dias, sem ninguém expor quanto pode gastar e sem ninguém precisar cobrar.</p>' +
        '<div class="regras">' + regra('relogio', 'O silêncio não conta como sim') + regra('cadeado', 'Seu teto de gasto fica em segredo') + regra('cofre', 'Confirmado é quem paga o sinal') + '</div>' +
        '<button class="btn-vidro" data-ir="entrar">Já tenho conta</button></div></div>',
      dock: C.cta('Criar minha conta', 'data-ir="cadastro"')
    };
  }, { titulo: 'Bem-vindo' });

  /* ---------- cadastro ---------- */
  C.tela('cadastro', function () {
    return {
      semTab: true,
      html: '<div class="tela sem-tab">' + C.barra('Passo 1 de 3', 'Criar conta', 'abertura') +
        '<h1 class="h1">Crie sua conta</h1><p class="lead">Ela guarda as suas viagens e deixa você criar novas. Para responder um convite, nem isso é preciso.</p>' +
        '<div class="form">' +
        campo('c-nome', 'Nome', 'autocomplete="name" maxlength="40" placeholder="Seu nome e sobrenome"', E.conta.nome) +
        campo('c-cel', 'Celular', 'type="tel" inputmode="tel" autocomplete="tel-national" maxlength="15" placeholder="(11) 98765-4321"', E.conta.celular, 'Mandamos um código por SMS. O número não aparece para o grupo.') +
        '<div class="aceite' + (erros.termos ? ' com-erro' : '') + '"><button class="caixa" role="checkbox" aria-checked="' + !!E.aceitou + '" data-acao="aceitar-termos" aria-labelledby="t-l">' + (E.aceitou ? I('check', 14, '#fff', 3.2) : '') + '</button>' +
        '<p id="t-l">Li e aceito os <a href="#/termos">termos de uso e a política de privacidade</a>.</p></div>' +
        (erros.termos ? '<p class="erro">' + erros.termos + '</p>' : '') +
        '</div><p class="troca">Já tem conta? <button class="link" data-ir="entrar">Entrar</button></p></div>',
      dock: C.cta('Enviar código por SMS', 'data-acao="cadastrar"'),
      depois: function () {
        ligar('c-nome', function (el) { E.conta.nome = el.value; C.salvar(); limparErro('c-nome'); });
        ligar('c-cel', function (el) { el.value = C.mascaraCelular(el.value); E.conta.celular = el.value; C.salvar(); limparErro('c-cel'); });
      }
    };
  }, { titulo: 'Criar conta' });

  C.acao('aceitar-termos', function () { E.aceitou = !E.aceitou; delete erros.termos; });
  C.acao('cadastrar', function () {
    erros = {};
    if (String(E.conta.nome || '').trim().length < 2) erros['c-nome'] = 'Diga como você se chama.';
    if (digitos(E.conta.celular).length !== 11) erros['c-cel'] = 'Use o DDD e os 9 números do celular.';
    if (!E.aceitou) erros.termos = 'Para criar a conta, é preciso aceitar os termos.';
    if (Object.keys(erros).length) {
      C.render();
      var primeiro = document.querySelector('[aria-invalid="true"]');
      if (primeiro) primeiro.focus();
      return true;
    }
    E.fluxo = 'cadastro'; C.salvar(); C.ir('codigo'); return true;
  });

  /* ---------- entrar ---------- */
  C.tela('entrar', function () {
    return {
      semTab: true,
      html: '<div class="tela sem-tab">' + C.barra('', 'Entrar', 'abertura') +
        '<h1 class="h1">Que bom te ver de novo</h1><p class="lead">Entre com o celular da sua conta. Mandamos um código por SMS, sem senha para lembrar.</p>' +
        '<div class="form">' + campo('e-cel', 'Celular', 'type="tel" inputmode="tel" autocomplete="tel-national" maxlength="15" placeholder="(11) 98765-4321"', E.conta.celular) + '</div>' +
        '<p class="troca">Ainda não tem conta? <button class="link" data-ir="cadastro">Criar conta</button></p></div>',
      dock: C.cta('Enviar código', 'data-acao="entrar-cel"'),
      depois: function () { ligar('e-cel', function (el) { el.value = C.mascaraCelular(el.value); E.conta.celular = el.value; C.salvar(); limparErro('e-cel'); }); }
    };
  }, { titulo: 'Entrar' });
  C.acao('entrar-cel', function () {
    erros = {};
    if (digitos(E.conta.celular).length !== 11) { erros['e-cel'] = 'Use o DDD e os 9 números do celular.'; C.render(); document.getElementById('e-cel').focus(); return true; }
    E.fluxo = 'entrar'; C.salvar(); C.ir('codigo'); return true;
  });

  /* ---------- código ---------- */
  function reenvioTexto(s) { return s > 0 ? 'Reenviar código em 0:' + (s < 10 ? '0' : '') + s : ''; }
  C.tela('codigo', function () {
    var cad = E.fluxo === 'cadastro', troca = E.fluxo === 'trocar';
    var cel = troca ? E.novoCel : E.conta.celular;
    return {
      semTab: true,
      html: '<div class="tela sem-tab">' + C.barra(cad ? 'Passo 2 de 3' : 'Verificação', troca ? 'Confirmar o novo número' : 'Código por SMS', cad ? 'cadastro' : (troca ? 'conta' : 'entrar')) +
        '<h1 class="h1">Digite o código</h1><p class="lead">Mandamos 6 números para <b>' + C.esc(cel || 'o seu celular') + '</b>.</p>' +
        '<div class="codigo' + (erros.codigo ? ' com-erro' : '') + '"><label class="oculto" for="cod">Código de 6 números</label>' +
        '<input id="cod" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*"' + (erros.codigo ? ' aria-invalid="true" aria-describedby="cod-e"' : '') + '>' +
        '<div class="caixas" aria-hidden="true">' + [0, 1, 2, 3, 4, 5].map(function () { return '<span></span>'; }).join('') + '</div></div>' +
        (erros.codigo ? '<p class="erro" id="cod-e">' + erros.codigo + '</p>' : '') +
        '<p class="dica-demo">' + I('ajuda', 16, 'currentColor', 2.2) + 'Código de demonstração: <b>482 915</b></p>' +
        '<p class="troca" id="reenvio"><span>' + reenvioTexto(30) + '</span></p></div>',
      dock: C.cta('Confirmar', 'data-acao="verificar"'),
      depois: function () {
        var el = document.getElementById('cod'), caixas = document.querySelectorAll('.caixas span');
        function pintar() {
          var v = el.value;
          caixas.forEach(function (c, i) { c.textContent = v[i] || ''; c.className = i === v.length ? 'atual' : (v[i] ? 'cheia' : ''); });
        }
        el.addEventListener('input', function () {
          el.value = digitos(el.value).slice(0, 6); pintar();
          if (erros.codigo) { delete erros.codigo; el.parentNode.classList.remove('com-erro'); var e = document.getElementById('cod-e'); if (e) e.remove(); }
          if (el.value.length === 6) verificar();
        });
        el.addEventListener('focus', pintar); el.addEventListener('blur', function () { caixas.forEach(function (c) { c.classList.remove('atual'); }); });
        document.querySelector('.codigo').addEventListener('click', function () { el.focus(); });
        el.focus(); pintar();
        var s = 30, alvo = document.getElementById('reenvio');
        clearInterval(timerReenvio);
        timerReenvio = setInterval(function () {
          s--;
          if (s <= 0) { clearInterval(timerReenvio); alvo.innerHTML = '<button class="link" data-acao="reenviar">Reenviar código</button>'; }
          else alvo.firstChild.textContent = reenvioTexto(s);
        }, 1000);
        C.aoSair(function () { clearInterval(timerReenvio); });
      }
    };
  }, { titulo: 'Código' });

  function verificar() {
    var el = document.getElementById('cod');
    if (!el) return;
    if (el.value !== D.CODIGO) {
      erros.codigo = el.value.length < 6 ? 'Faltam ' + (6 - el.value.length) + ' números.' : 'Esse código não confere. Confira o SMS e tente de novo.';
      C.render(); return;
    }
    var b = document.querySelector('#dock .cta');
    if (b) { b.disabled = true; b.innerHTML = '<span class="gira" aria-hidden="true"></span>Verificando'; }
    setTimeout(function () {
      erros = {};
      if (E.fluxo === 'trocar') {
        E.conta.celular = E.novoCel; delete E.novoCel; delete E.edit; E.fluxo = 'cadastro';
        C.salvar(); C.ir('perfil'); C.avisar('Número atualizado.'); return;
      }
      if (E.fluxo === 'entrar' && String(E.conta.nome || '').trim()) {
        E.sessao = 'conta'; C.salvar(); C.ir(''); C.avisar('Que bom te ver, ' + C.esc(C.primeiroNome()) + '.');
      } else { C.salvar(); C.ir('bem-vindo'); }
    }, 700);
  }
  C.acao('verificar', function () { verificar(); return true; });
  C.acao('reenviar', function () { C.avisar('Código reenviado. Na demonstração, ele é sempre 482 915.', 'mensagem'); C.render(); return true; });

  /* ---------- perfil inicial ---------- */
  C.tela('bem-vindo', function () {
    var ini = C.iniciais(E.conta.nome) || 'VC';
    return {
      semTab: true,
      html: '<div class="tela sem-tab">' + C.barra('Passo 3 de 3', 'Seu perfil', 'codigo') +
        '<h1 class="h1">Como o grupo vai te ver</h1><p class="lead">É só isso que os amigos veem de você: o nome e a cor. O resto fica com você.</p>' +
        '<div class="avatar-ed"><span class="rosto xl" id="prev" style="background:' + E.conta.cor + ';color:#fff">' + ini + '</span>' +
        '<div class="cores" role="radiogroup" aria-label="Cor do avatar">' + CORES.map(function (c) {
          return '<button role="radio" aria-checked="' + (E.conta.cor === c) + '" aria-label="Cor ' + c + '" data-acao="cor" data-c="' + c + '" style="background:' + c + '"></button>';
        }).join('') + '</div></div>' +
        '<div class="form">' + campo('b-nome', 'Nome no grupo', 'autocomplete="nickname" maxlength="40"', E.conta.nome) +
        '<div class="campo"><label>Chave Pix para devoluções <span class="opc">opcional</span></label><div class="chips" role="radiogroup">' +
        [['celular', 'Celular'], ['email', 'E-mail'], ['aleatoria', 'Aleatória']].map(function (t) {
          return '<button role="radio" aria-checked="' + (E.conta.pixTipo === t[0]) + '" data-acao="pix-tipo" data-t="' + t[0] + '">' + t[1] + '</button>';
        }).join('') + '</div>' +
        '<input id="b-pix" style="margin-top:10px" maxlength="60" placeholder="' + (E.conta.pixTipo === 'email' ? 'voce@email.com' : E.conta.pixTipo === 'aleatoria' ? 'Cole a chave aleatória' : '(11) 98765-4321') + '" value="' + C.esc(E.conta.pix) + '">' +
        '<p class="dica">Só é usada para devolver um sinal, se você desistir e alguém ocupar a sua vaga.</p></div></div></div>',
      dock: C.cta('Começar', 'data-acao="concluir-conta"'),
      depois: function () {
        ligar('b-nome', function (el) { E.conta.nome = el.value; C.salvar(); document.getElementById('prev').textContent = C.iniciais(el.value) || 'VC'; limparErro('b-nome'); });
        ligar('b-pix', function (el) { E.conta.pix = el.value; C.salvar(); });
      }
    };
  }, { titulo: 'Seu perfil' });
  C.acao('cor', function (b) { E.conta.cor = b.dataset.c; });
  C.acao('pix-tipo', function (b) { E.conta.pixTipo = b.dataset.t; });
  C.acao('concluir-conta', function () {
    erros = {};
    if (String(E.conta.nome || '').trim().length < 2) { erros['b-nome'] = 'Diga como o grupo te chama.'; C.render(); document.getElementById('b-nome').focus(); return true; }
    E.sessao = 'conta'; C.salvar(); C.ir(''); C.avisar('Conta criada. Boas viagens, ' + C.esc(C.primeiroNome()) + '.'); return true;
  });

  /* ---------- convite ---------- */
  C.tela('convite', function () {
    if (E.entrou) { setTimeout(function () { C.ir('viagem'); }, 0); return { semTab: true }; }
    var outros = D.GRUPO.filter(function (p) { return p !== 'voce' && p !== 'ju'; });
    var fora = E.sessao === 'fora';
    return {
      semTab: true,
      html: '<div class="tela sem-tab">' + (fora ? '<div class="convite-topo">' + C.logo() + '</div>' : C.barra('Convite', 'Para você', '')) +
        '<div class="capa-mini"><p class="k" style="color:#fff">Convite · 7 pessoas</p><h2>' + D.VIAGEM + '</h2>' +
        '<div class="pilulas"><span class="pilula">' + I('calendario', 14, '#fff', 2.4) + 'Novembro</span><span class="pilula">' + I('pin', 14, '#fff', 2.4) + 'Ubatuba ou Paraty</span></div></div>' +
        '<div class="quem-chamou">' + C.rosto('ju', 'gd') + '<p><b>A Ju te chamou para a viagem.</b><br><span class="miudo">' + C.nomes(outros) + ' já estão no grupo.</span></p></div>' +
        (fora ? campo('v-nome', 'Como o grupo te chama?', 'autocomplete="given-name" maxlength="40" placeholder="Seu nome ou apelido"', E.conta.nome)
          : '<p class="como">Você vai entrar como ' + C.rosto('voce', 'pq') + '<b>' + C.pessoa('voce').nome + '</b></p>') +
        '<div class="garantias"><p class="garantia">' + I('check', 18, '#0F5257', 2.6) + (fora ? 'Sem cadastro e sem senha: o link do grupo já basta.' : 'A viagem vai aparecer no seu início.') + '</p>' +
        '<p class="garantia">' + I('cadeado', 18, '#0F5257', 2.2) + 'Quanto você pode gastar fica só com você. Nem quem organiza vê.</p></div>' +
        (fora ? '<p class="troca">Já tem conta? <button class="link" data-ir="entrar">Entrar</button></p>' : '') + '</div>',
      dock: C.cta('Entrar na viagem', 'data-acao="aceitar-convite"'),
      depois: function () { ligar('v-nome', function (el) { E.conta.nome = el.value; C.salvar(); limparErro('v-nome'); }); }
    };
  }, { titulo: 'Convite' });
  C.acao('aceitar-convite', function () {
    erros = {};
    if (E.sessao === 'fora') {
      if (String(E.conta.nome || '').trim().length < 2) { erros['v-nome'] = 'Diga como o grupo te chama.'; C.render(); document.getElementById('v-nome').focus(); return true; }
      E.sessao = 'convidado';
    }
    E.entrou = true; E.saiu = false; C.salvar(); C.ir('viagem'); C.avisar('Você entrou na viagem.'); return true;
  });

  /* ---------- termos ---------- */
  C.tela('termos', function () {
    var fora = E.sessao === 'fora';
    function bloco(t, p) { return '<section class="sec"><h2 class="h2" style="margin-bottom:8px">' + t + '</h2><p class="texto">' + p + '</p></section>'; }
    return {
      semTab: fora, tab: 'perfil',
      html: '<div class="tela' + (fora ? ' sem-tab' : ' so-tab') + '"><header class="barra"><button class="voltar" data-acao="voltar" aria-label="Voltar">' + I('voltar', 20, '#1E2629', 2.4) + '</button><span class="barra-tit">Termos e privacidade</span></header>' +
        '<h1 class="h1">Termos de uso e privacidade</h1><p class="lead">Versão resumida de demonstração. Este protótipo não guarda dados fora do seu navegador.</p>' +
        bloco('O que o Combinado faz', 'Organiza as decisões de uma viagem em grupo: datas, orçamento, casa e confirmação. Não vende hospedagem nem passagem.') +
        bloco('O seu teto de gasto', 'O valor que você informa como teto é visto só por você. O grupo vê apenas a faixa, que é o menor teto entre todos, sem identificar de quem é.') +
        bloco('Dinheiro e sinal', 'O sinal é pago ao cofre da viagem, e não a outra pessoa. Na versão real, o cofre depende de uma instituição de pagamento autorizada. Nesta demonstração, nenhum dinheiro é movimentado.') +
        bloco('Seus dados', 'Usamos nome, celular e chave Pix só para o funcionamento do app, de acordo com a LGPD. Você pode baixar ou apagar seus dados a qualquer momento em Perfil.') + '</div>'
    };
  }, { titulo: 'Termos' });
  C.acao('voltar', function () { if (history.length > 1) history.back(); else C.ir(''); return true; });
})(window.C);
