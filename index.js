const { Client, LocalAuth, Location } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const produtos = {
    'viscolinho liso': { preco: 14.00, unidade: 'MT', categoria: 'Tecidos' },
    'viscolinho estampado': { preco: 16.50, unidade: 'MT', categoria: 'Tecidos' },
    'viscose lisa': { preco: 13.00, unidade: 'MT', categoria: 'Tecidos' },
    'viscose estampada': { preco: 11.00, unidade: 'MT', categoria: 'Tecidos' },
    'malha canelada': { preco: 34.00, unidade: 'KG', categoria: 'Tecidos' },
    'helanca': { preco: 35.00, unidade: 'KG', categoria: 'Tecidos' },
    'linho rustico': { preco: 17.00, unidade: 'MT', categoria: 'Tecidos' },
    'cetim': { preco: 5.00, unidade: 'MT', categoria: 'Tecidos' },
    'elastico 2.0': { preco: 10.50, unidade: 'rolo', categoria: 'Aviamentos' },
    'elastico 3.0': { preco: 13.50, unidade: 'rolo', categoria: 'Aviamentos' },
    'elastico 5.0': { preco: 21.50, unidade: 'rolo', categoria: 'Aviamentos' },
    'linha preta 2000jds': { preco: 7.00, unidade: 'cone', categoria: 'Linhas' },
    'linha branca 1500jds': { preco: 5.00, unidade: 'cone', categoria: 'Linhas' },
    'fio 70g branco': { preco: 5.00, unidade: 'rolo', categoria: 'Fios' },
    'fio 100g colorido': { preco: 7.50, unidade: 'rolo', categoria: 'Fios' }
};

const atendimentos = {};

function adicionarProdutoAoCarrinho(estado, nomeProduto, quantidade) {
    const produto = produtos[nomeProduto];
    if (!produto) return false;
    const total = quantidade * produto.preco;
    estado.carrinho.push({
        nome: nomeProduto,
        qtd: quantidade,
        precoUnitario: produto.preco,
        total,
        unidade: produto.unidade
    });
    return true;
}

function listarProdutos() {
    const categorias = {};
    Object.entries(produtos).forEach(([nome, info]) => {
        if (!categorias[info.categoria]) categorias[info.categoria] = [];
        categorias[info.categoria].push(`• ${nome} - R$ ${info.preco.toFixed(2)}/${info.unidade}`);
    });
    let lista = "📋 *LISTA DE PRODUTOS JJ TÊXTIL*

";
    for (const [categoria, itens] of Object.entries(categorias)) {
        lista += `🏷️ *${categoria}:*
${itens.join('\n')}

`;
    }
    lista += "💡 *Para detalhes, digite o nome do produto.*";
    return lista;
}

function gerarPromocoes() {
    return `🔥 *PROMOÇÕES DA SEMANA*

` +
           `• Viscolinho Liso - R$ 8,50
` +
           `• Helanca - R$35,00
` +
           `• Linha Preta 2000jds - R$ 5,00

` +
           `⏰ *Válido até domingo*
` +
           `Fale com nosso atendente para aproveitar!`;
}

function gerarDicasModa() {
    const dicas = [
        "✨ Viscolinho é perfeito para roupas de verão - é fresco e confortável!",
        "✨ Malha canelada é ideal para golas e punhos - dá um acabamento profissional!",
        "✨ Cetim é perfeito para forros e peças elegantes!",
        "✨ Helanca é ótima para roupas fitness - tem elasticidade ideal!",
        "✨ Linho rústico está super em alta para peças casuais!"
    ];
    return `👗 *DICA DE MODA*

${dicas[Math.floor(Math.random() * dicas.length)]}

💡 Precisa de mais dicas? Fale com nosso atendente!`;
}

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie o QR Code com seu WhatsApp');
});

client.on('ready', () => {
    console.log('✅ JJ Bot Têxtil está online!');
});

client.on('message', async msg => {
    const textoOriginal = msg.body.trim();
    const texto = textoOriginal.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (!atendimentos[msg.from]) {
        atendimentos[msg.from] = {
            etapa: 'menu',
            tempoUltimaMensagem: Date.now(),
            carrinho: [],
            nome: 'Cliente'
        };
        await msg.reply("👋 Olá! Seja bem-vindo(a) à *JJ TÊXTIL*!\n\nSomos especializados em tecidos e aviamentos de qualidade.\n\nDigite *menu* para ver todas as opções!");
        return;
    }

    if (['menu'].includes(texto)) {
        return msg.reply(`📋 *Menu JJ TÊXTIL*

1️⃣ - Lista de produtos
2️⃣ - Promoções
3️⃣ - Dicas de moda
4️⃣ - Ver carrinho
5️⃣ - Finalizar compra
6️⃣ - Localização da loja 🗺️
0️⃣ - Modo conversa livre

Digite a opção desejada.`);
    }

    if (['localizacao', 'onde fica', 'endereco', 'endereço', '6'].includes(texto)) {
        await msg.reply("📍 *Nossa loja física fica em:*\n\nAv. 22 de Maio, Nº 3171, Joaquim de Oliveira - Itaboraí/RJ");
        await msg.reply("🗺️ Clique para abrir o mapa:\nhttps://maps.app.goo.gl/djG4ZLvqHnDkkJrp6");
        const chatAtual = await msg.getChat();
        await client.sendMessage(chatAtual.id._serialized, new Location(-22.745404, -42.861198, "JJ Têxtil - Itaboraí"));
        return;
    }

    if (['horario', 'horários', 'funcionamento'].includes(texto)) {
        return msg.reply("🕒 *Horário de atendimento da loja física:*\n\nSegunda a Sexta: 9h às 18h\nSábado: 9h às 13h\nDomingo: Fechado\n\n⚠️ Nosso atendimento automatizado funciona 24 horas por dia!");
    }
});
client.initialize();