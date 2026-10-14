/* Viagem de exemplo do protótipo. Pessoas, casas e preços são fictícios. */
window.CMB = (function () {
  'use strict';

  var PESSOAS = {
    voce: { nome: 'Você', ini: 'VC', bg: '#F2545B', fg: '#FFFFFF' },
    ju:   { nome: 'Ju',   ini: 'JU', bg: '#FFE3D1', fg: '#7A2E0B' },
    rafa: { nome: 'Rafa', ini: 'RA', bg: '#D6E6FF', fg: '#1D3F7A' },
    bia:  { nome: 'Bia',  ini: 'BI', bg: '#D7F1EE', fg: '#0D4C47' },
    caio: { nome: 'Caio', ini: 'CA', bg: '#FFE7A3', fg: '#5E4300' },
    duda: { nome: 'Duda', ini: 'DU', bg: '#F3DCE6', fg: '#6E1F45' },
    teo:  { nome: 'Téo',  ini: 'TE', bg: '#E8E4DF', fg: '#4A5356' }
  };

  return {
    VIAGEM: 'Praia em novembro',
    ORGANIZA: 'ju',
    SINAL: 150,
    PRAZO_RESTANTE: '13 de novembro',
    DIAS_ATE: 38,
    PESSOAS: PESSOAS,
    GRUPO: ['voce', 'ju', 'rafa', 'bia', 'caio', 'duda', 'teo'],

    // fins de semana de novembro de 2026 (1º de novembro é domingo)
    FINS: [
      { id: 'f1', q: '6 a 8 de novembro', curto: '6 a 8 nov', s: 'sexta a domingo', dias: [6, 7, 8], podem: ['ju', 'bia', 'duda'] },
      { id: 'f2', q: '13 a 15 de novembro', curto: '13 a 15 nov', s: 'feriado no domingo', dias: [13, 14, 15], feriado: 15, podem: ['ju', 'rafa', 'caio'] },
      { id: 'f3', q: '20 a 22 de novembro', curto: '20 a 22 nov', s: 'feriado na sexta', dias: [20, 21, 22], feriado: 20, podem: ['ju', 'rafa', 'bia', 'caio', 'duda'] },
      { id: 'f4', q: '27 a 29 de novembro', curto: '27 a 29 nov', s: 'sexta a domingo', dias: [27, 28, 29], podem: ['rafa', 'bia', 'caio'] }
    ],
    RESPONDERAM_DATAS: ['ju', 'rafa', 'bia', 'caio', 'duda'], // o Téo nunca responde

    // tetos secretos dos outros: nunca aparecem na interface, só a faixa (o menor)
    TETOS: { ju: 700, rafa: 520, bia: 900, caio: 650, duda: 800 },

    CASAS: [
      {
        id: 'c1', nome: 'Casa da Itamambuca', lugar: 'Ubatuba', total: 2940,
        resumo: '3 quartos · 7 camas · 5 min a pé da praia',
        fotos: ['itamambuca', 'alpendre', 'costa'], nota: '4,9', avaliacoes: 38,
        votos: ['ju', 'bia', 'caio'],
        comodidades: [['cama', '3 quartos, 7 camas'], ['onda', '5 min da praia'], ['fogo', 'Churrasqueira'], ['wifi', 'Wi-Fi'], ['banho', '2 banheiros'], ['carro', 'Vaga para 2 carros']],
        perto: 'Praia de Itamambuca, a 400 m',
        mapa: 'praia'
      },
      {
        id: 'c2', nome: 'Sobrado no centro histórico', lugar: 'Paraty', total: 3060,
        resumo: '3 quartos · 6 camas · praia de barco',
        fotos: ['sobrado', 'rua', 'noite'], nota: '4,8', avaliacoes: 52,
        votos: ['rafa', 'duda'],
        comodidades: [['cama', '3 quartos, 6 camas'], ['barco', 'Praias de barco'], ['neve', 'Ar-condicionado'], ['wifi', 'Wi-Fi'], ['banho', '2 banheiros'], ['pe', 'Centro a pé']],
        perto: 'Centro histórico, a 2 quadras do cais',
        mapa: 'centro'
      },
      {
        id: 'c3', nome: 'Casa pé na areia', lugar: 'Praia Vermelha, Ubatuba', total: 4680,
        resumo: '4 quartos · piscina · pé na areia',
        fotos: ['palafita', 'praia'], nota: '4,9', avaliacoes: 21,
        votos: [],
        comodidades: [['cama', '4 quartos, 9 camas'], ['onda', 'Pé na areia'], ['piscina', 'Piscina'], ['wifi', 'Wi-Fi']],
        perto: 'Praia Vermelha do Norte',
        mapa: 'praia'
      }
    ],

    PAGARAM_SINAL: ['ju', 'rafa', 'bia', 'duda'], // o Caio ainda não

    LEVAR: [
      { id: 'som', item: 'Caixa de som', quem: 'rafa' },
      { id: 'carvao', item: 'Carvão e espetos', quem: 'caio' },
      { id: 'jogos', item: 'Baralho e jogos', quem: 'bia' },
      { id: 'protetor', item: 'Protetor solar', quem: null },
      { id: 'cooler', item: 'Cooler', quem: null }
    ],

    CODIGO: '482915', // código de verificação da demonstração

    PASSADA: {
      nome: 'Réveillon em Paraty', quando: '29 de dezembro a 2 de janeiro', foto: 'noite', pessoas: ['voce', 'ju', 'rafa', 'bia', 'duda', 'caio'],
      casa: 'Sobrado da Rua do Comércio', porPessoa: 640, decidiuEm: '4 dias', lembretes: 7
    },

    // fins de semana oferecidos no assistente de criar viagem (dezembro de 2026; 1º de dezembro é terça)
    FINS_DEZ: [
      { id: 'd1', q: '4 a 6 de dezembro', curto: '4 a 6 dez' },
      { id: 'd2', q: '11 a 13 de dezembro', curto: '11 a 13 dez' },
      { id: 'd3', q: '18 a 20 de dezembro', curto: '18 a 20 dez' },
      { id: 'd4', q: '25 a 27 de dezembro', curto: '25 a 27 dez', s: 'Natal na sexta' }
    ],
    CAPAS: ['capa', 'praia', 'pordosol', 'costa'],

    FAQ: [
      ['Quem consegue ver o meu teto?', 'Ninguém. Nem quem organiza, nem quem opera o app no dia a dia. O grupo vê só a faixa, que é o menor teto de todos, sem dizer de quem é.'],
      ['Por que o silêncio não conta como sim?', 'Porque é assim que as viagens encolhem: quem não respondeu parece estar dentro até a hora de pagar. No Combinado, cada decisão tem prazo e fecha com quem respondeu. Quem ficou em silêncio vira interessado e pode entrar depois, se houver vaga.'],
      ['Quem guarda o dinheiro do sinal?', 'O cofre da viagem, e não um amigo. Quando o cofre cobre a entrada, a reserva da casa é paga. Na demonstração, nenhum dinheiro é movimentado.'],
      ['E se eu desistir depois de pagar?', 'Seu sinal fica no cofre até alguém da fila ocupar a vaga. Quando a pessoa paga, os seus R$ 150 voltam para a sua chave Pix.'],
      ['O que acontece se der empate na votação?', 'Vale a regra mostrada antes do voto: vence a casa mais barata. Assim ninguém precisa decidir no grito.'],
      ['Preciso baixar o app para responder?', 'Não. Quem recebe o link no grupo responde pelo navegador, sem cadastro. A conta só serve para guardar as suas viagens e criar novas.']
    ],

    FOTOS: {
      capa: 'Gustavo Juliette', itamambuca: 'Mauro Lima', alpendre: 'Linoleum Creative Collective', costa: 'Edu Lins',
      sobrado: 'Mauro Lima', rua: 'Guilherme Gabrielli', noite: 'Gilberto Olimpio', palafita: 'Kawê Rodrigues',
      praia: 'Calebe Oliveira', pordosol: 'Filipe Freitas'
    }
  };
})();
