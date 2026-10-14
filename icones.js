/* Ícones de traço. ICONE(nome, tamanho, cor, espessura) devolve o SVG. */
window.ICONE = (function () {
  'use strict';
  var P = {
    voltar: '<path d="M15 5l-7 7 7 7"/>',
    seta: '<path d="M9 5l7 7-7 7"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cadeado: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    sino: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    cofre: '<rect x="3.5" y="5.5" width="17" height="14" rx="3"/><circle cx="12" cy="12.5" r="3"/><path d="M12 9.5v-1M7 19.5V21M17 19.5V21"/>',
    casa: '<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5z"/><path d="M10 21v-6h4v6"/>',
    grupo: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/><circle cx="17" cy="8.5" r="2.5"/><path d="M16 14.6c2.2 0 3.9 1.3 4.5 4"/>',
    calendario: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    cama: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2"/><path d="M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2"/>',
    banho: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2"/>',
    wifi: '<path d="M4.5 9.5a11 11 0 0 1 15 0M7.5 12.8a6.5 6.5 0 0 1 9 0M10.5 16a2 2 0 0 1 3 0"/><circle cx="12" cy="18.6" r=".6"/>',
    fogo: '<path d="M12 21c3.3 0 6-2.4 6-5.8 0-3.7-3-5.7-4-9.2-1.6 1.5-2.4 3-2.6 4.7C10.4 9.6 9.6 8.7 9 7.5 7.2 9.5 6 11.8 6 15.2 6 18.6 8.7 21 12 21z"/>',
    onda: '<path d="M3 15c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2M3 19c2.2 0 2.2-2 4.5-2s2.3 2 4.5 2 2.3-2 4.5-2 2.3 2 4.5 2"/><circle cx="16" cy="7" r="3"/>',
    carro: '<path d="M5 16V12l1.8-4.3A2 2 0 0 1 8.6 6.5h6.8a2 2 0 0 1 1.8 1.2L19 12v4"/><rect x="3.5" y="12" width="17" height="5" rx="1.5"/><path d="M6 17v2M18 17v2"/><circle cx="7.5" cy="14.5" r=".6"/><circle cx="16.5" cy="14.5" r=".6"/>',
    barco: '<path d="M3 15.5l2.5 4h13l2.5-4z"/><path d="M12 15.5V4l6 9H12"/>',
    neve: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5"/>',
    piscina: '<path d="M3 17c2.2 0 2.2-1.5 4.5-1.5S9.8 17 12 17s2.3-1.5 4.5-1.5S18.8 17 21 17"/><path d="M8 14V5.5a2 2 0 0 1 4 0M14 14V5.5a2 2 0 0 1 4 0M8 9h6"/>',
    pe: '<circle cx="12" cy="4.5" r="1.8"/><path d="M12 8l-2.5 5 2.5 2v5M12 8l3 4 3 1M9.5 13L7 20"/>',
    estrela: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    copiar: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
    enviar: '<path d="M4 12l16-7-6.5 16-2.5-6.5z"/><path d="M11 14.5L20 5"/>',
    maisgente: '<circle cx="10" cy="8.5" r="3.5"/><path d="M3.5 19.5c.8-3.4 3.3-5 6.5-5 1.4 0 2.6.3 3.6.9M18 13v6M15 16h6"/>',
    mala: '<rect x="4" y="7.5" width="16" height="12.5" rx="2.5"/><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2M4 12.5h16"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M5.2 18.8l1.4-1.4M17.4 6.6l1.4-1.4"/>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    festa: '<path d="M4 20l4.5-12.5L16.5 15.5z"/><path d="M14 4.5c.4 1.4 1.6 2.4 3 2.5M19.5 9.5c-1 .2-1.8 1-2 2M12 7.5c0-1.5.8-2.5 2-3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    usuario: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c.9-3.8 3.9-5.8 7.5-5.8s6.6 2 7.5 5.8"/>',
    mais: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
    engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2L5.5 5.5"/>',
    sair: '<path d="M14 4h3.5A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    lixeira: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5L17.5 7M10 11v6M14 11v6"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.6 2.3-2.6 3.8"/><circle cx="12" cy="17.2" r=".6"/>',
    escudo: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    telefone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
    editar: '<path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    mais2: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    documento: '<path d="M7 3.5h7l4.5 4.5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13.5a2 2 0 0 1 2-2z"/><path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h5"/>',
    baixar: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
    mensagem: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
    lua: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
    foto: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><circle cx="9" cy="10.5" r="1.8"/><path d="M20.5 15.5l-5-4.5-8 7.5"/>',
    mapa: '<path d="M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>'
  };
  return function (nome, tam, cor, esp) {
    return '<svg width="' + (tam || 20) + '" height="' + (tam || 20) + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') +
      '" stroke-width="' + (esp || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[nome] || '') + '</svg>';
  };
})();
