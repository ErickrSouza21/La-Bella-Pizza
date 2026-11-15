
/* =====================================
   CARRINHO - LA BELLA PIZZA
===================================== */

const CHAVE_CARRINHO_VISITANTE = "laBellaCarrinho_visitante";
const CHAVE_USUARIO_ATIVO = "laBellaUsuarioAtivo";


/* IDENTIFICAR A CONTA */

function obterChaveCarrinho() {

    const email = (
        localStorage.getItem(CHAVE_USUARIO_ATIVO) || ""
    ).trim().toLowerCase();

    return email
        ? `laBellaCarrinho_${email}`
        : CHAVE_CARRINHO_VISITANTE;
}


function obterChavePedidos() {

    const email = (
        localStorage.getItem(CHAVE_USUARIO_ATIVO) || ""
    ).trim().toLowerCase();

    return email ? `laBellaPedidos_${email}` : null;
}


/* CARREGAR E SALVAR */

function carregarCarrinho() {

    try {
        const dados = JSON.parse(
            localStorage.getItem(obterChaveCarrinho()) || "[]"
        );

        return Array.isArray(dados) ? dados : [];

    } catch {
        return [];
    }
}


function salvarCarrinho(carrinho) {

    localStorage.setItem(
        obterChaveCarrinho(),
        JSON.stringify(carrinho)
    );

    atualizarCarrinho();
}


/* FUNÇÕES AUXILIARES */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}


function escaparTexto(texto) {

    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}


/* ADICIONAR PRODUTO */

function adicionarProduto(nome, preco) {

    const carrinho = carregarCarrinho();

    const produtoExistente = carrinho.find(
        item => item.nome === nome
    );

    if (produtoExistente) {

        produtoExistente.quantidade++;

    } else {

        carrinho.push({
            nome: nome,
            preco: preco,
            quantidade: 1
        });

    }

    salvarCarrinho(carrinho);

    alert(`${nome} foi adicionada ao carrinho!`);
}


/* BOTÕES DE ADICIONAR */

document.addEventListener("click", evento => {

    const botao = evento.target.closest(".adicionar-carrinho");

    if (!botao) return;

    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);

    if (!nome || !Number.isFinite(preco) || preco <= 0) {

        alert("Não foi possível adicionar esse produto.");
        return;

    }

    adicionarProduto(nome, preco);

});


/* ATUALIZAR A PÁGINA DO CARRINHO */

function atualizarCarrinho() {

    const lista = document.getElementById("itensCarrinho");

    if (!lista) return;

    const carrinho = carregarCarrinho();

    const vazio = document.getElementById("carrinhoVazio");
    const quantidade = document.getElementById("quantidadeItens");
    const subtotalElemento = document.getElementById("subtotal");
    const totalElemento = document.getElementById("total");
    const botaoFinalizar = document.getElementById("finalizarPedido");
    const botaoLimpar = document.getElementById("limparCarrinho");

    const totalItens = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    const subtotal = carrinho.reduce(
        (total, item) => total + item.preco * item.quantidade,
        0
    );

    quantidade.textContent = totalItens;

    subtotalElemento.textContent = formatarMoeda(subtotal);
    totalElemento.textContent = formatarMoeda(subtotal);

    vazio.hidden = carrinho.length > 0;
    lista.hidden = carrinho.length === 0;

    botaoFinalizar.disabled = carrinho.length === 0;

    botaoLimpar.hidden = carrinho.length === 0;


    /* MOSTRAR PRODUTOS */

    lista.innerHTML = carrinho.map((item, indice) => `

        <article class="item-carrinho">

            <div class="item-informacoes">

                <h3>${escaparTexto(item.nome)}</h3>

                <p>${formatarMoeda(item.preco)} cada</p>

            </div>


            <div class="item-controles">

                <button
                    type="button"
                    data-acao="diminuir"
                    data-indice="${indice}"
                    aria-label="Diminuir quantidade"
                >−</button>

                <span>${item.quantidade}</span>

                <button
                    type="button"
                    data-acao="aumentar"
                    data-indice="${indice}"
                    aria-label="Aumentar quantidade"
                >+</button>

            </div>


            <strong class="item-total">
                ${formatarMoeda(item.preco * item.quantidade)}
            </strong>


            <button
                type="button"
                class="remover-item"
                data-acao="remover"
                data-indice="${indice}"
            >
                Remover
            </button>

        </article>

    `).join("");


    /* ATUALIZAR CONTADOR */

    document.querySelectorAll("[data-contador-carrinho]")
        .forEach(elemento => {

            elemento.textContent = totalItens;

        });

}


/* ALTERAR QUANTIDADE E REMOVER */

document.addEventListener("click", evento => {

    const botao = evento.target.closest("[data-acao]");

    if (!botao) return;

    const acao = botao.dataset.acao;
    const indice = Number(botao.dataset.indice);

    if (!Number.isInteger(indice)) return;

    const carrinho = carregarCarrinho();
    const item = carrinho[indice];

    if (!item) return;


    if (acao === "aumentar") {

        item.quantidade++;

    }


    if (acao === "diminuir") {

        item.quantidade--;

        if (item.quantidade <= 0) {

            carrinho.splice(indice, 1);

        }

    }


    if (acao === "remover") {

        carrinho.splice(indice, 1);

    }


    salvarCarrinho(carrinho);

});


/* LIMPAR CARRINHO */

const botaoLimpar = document.getElementById("limparCarrinho");

if (botaoLimpar) {

    botaoLimpar.addEventListener("click", () => {

        if (!carregarCarrinho().length) return;

        const confirmar = confirm(
            "Tem certeza de que deseja limpar o carrinho?"
        );

        if (!confirmar) return;

        salvarCarrinho([]);

    });

}


/* FINALIZAR PEDIDO */

const botaoFinalizar = document.getElementById("finalizarPedido");

if (botaoFinalizar) {

    botaoFinalizar.addEventListener("click", () => {

        const carrinho = carregarCarrinho();

        if (!carrinho.length) return;


        /* VERIFICAR CONTA */

        const usuario = localStorage.getItem(CHAVE_USUARIO_ATIVO);

        if (!usuario) {

            alert("Entre na sua conta para continuar.");

            window.location.href = "conta.html";

            return;

        }


        const chavePedidos = obterChavePedidos();

        if (!chavePedidos) {

            alert("Não foi possível identificar sua conta.");

            return;

        }


        /* CARREGAR PEDIDOS EXISTENTES */

        let pedidos = [];

        try {

            const dados = JSON.parse(
                localStorage.getItem(chavePedidos) || "[]"
            );

            pedidos = Array.isArray(dados) ? dados : [];

        } catch {

            pedidos = [];

        }


        /* CALCULAR TOTAL */

        const total = carrinho.reduce(
            (soma, item) => soma + item.preco * item.quantidade,
            0
        );


        /* CRIAR NOVO PEDIDO */

        const novoPedido = {

            id: "LB" + Date.now().toString().slice(-8),

            criadoEm: Date.now(),

            itens: carrinho.map(item => ({

                nome: item.nome,
                preco: item.preco,
                quantidade: item.quantidade

            })),

            total: total

        };


        pedidos.unshift(novoPedido);


        /* SALVAR PEDIDO */

        localStorage.setItem(
            chavePedidos,
            JSON.stringify(pedidos)
        );


        /* LIMPAR CARRINHO */

        salvarCarrinho([]);


        alert(
            "Pedido realizado com sucesso!\n\n" +
            "Seu pedido já está em preparo.\n" +
            "Acompanhe o andamento na página Meus Pedidos."
        );


        /* IR PARA MEUS PEDIDOS */

        window.location.href = "pedidos.html";

    });

}


/* INICIALIZAÇÃO */

atualizarCarrinho();
