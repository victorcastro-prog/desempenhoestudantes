// ==========================================
// DADOS DO APLICATIVO
// ==========================================

let estudantes = JSON.parse(
    localStorage.getItem("estudantes")
) || [];

let atividades = JSON.parse(
    localStorage.getItem("atividades")
) || [];

let notas = JSON.parse(
    localStorage.getItem("notas")
) || {};


// ==========================================
// SALVAR DADOS
// ==========================================

function salvarDados() {

    localStorage.setItem(
        "estudantes",
        JSON.stringify(estudantes)
    );

    localStorage.setItem(
        "atividades",
        JSON.stringify(atividades)
    );

    localStorage.setItem(
        "notas",
        JSON.stringify(notas)
    );
}


// ==========================================
// ADICIONAR ESTUDANTE
// ==========================================

function adicionarEstudante() {

    const campo = document.getElementById("nomeEstudante");

    const nome = campo.value.trim();

    if (nome === "") {
        alert("Digite o nome do estudante.");
        return;
    }

    const estudante = {
        id: Date.now(),
        nome: nome
    };

    estudantes.push(estudante);

    campo.value = "";

    salvarDados();

    atualizarTabela();
}


// ==========================================
// ADICIONAR ATIVIDADE
// ==========================================

function adicionarAtividade() {

    const campoNome =
        document.getElementById("nomeAtividade");

    const campoValor =
        document.getElementById("valorAtividade");

    const nome = campoNome.value.trim();

    const valor = Number(campoValor.value);

    if (nome === "") {
        alert("Digite o nome da atividade.");
        return;
    }

    if (valor <= 0) {
        alert("Informe um valor válido para a atividade.");
        return;
    }

    const atividade = {
        id: Date.now(),
        nome: nome,
        valor: valor
    };

    atividades.push(atividade);

    campoNome.value = "";

    campoValor.value = "10";

    salvarDados();

    atualizarTabela();
}


// ==========================================
// EXCLUIR ESTUDANTE
// ==========================================

function excluirEstudante(id) {

    const confirmar = confirm(
        "Deseja realmente excluir este estudante?"
    );

    if (!confirmar) {
        return;
    }

    estudantes = estudantes.filter(
        estudante => estudante.id !== id
    );

    // Remove as notas desse estudante
    Object.keys(notas).forEach(chave => {

        if (chave.startsWith(id + "_")) {
            delete notas[chave];
        }

    });

    salvarDados();

    atualizarTabela();
}


// ==========================================
// EXCLUIR ATIVIDADE
// ==========================================

function excluirAtividade(id) {

    const confirmar = confirm(
        "Deseja excluir esta atividade?"
    );

    if (!confirmar) {
        return;
    }

    atividades = atividades.filter(
        atividade => atividade.id !== id
    );

    // Remove as notas relacionadas
    Object.keys(notas).forEach(chave => {

        if (chave.endsWith("_" + id)) {
            delete notas[chave];
        }

    });

    salvarDados();

    atualizarTabela();
}


// ==========================================
// ALTERAR NOTA
// ==========================================

function alterarNota(estudanteId, atividadeId, valor) {

    const chave =
        estudanteId + "_" + atividadeId;

    if (valor === "") {

        delete notas[chave];

    } else {

        let nota = Number(
            valor.replace(",", ".")
        );

        if (isNaN(nota)) {
            return;
        }

        const atividade =
            atividades.find(
                a => a.id === atividadeId
            );

        if (nota < 0) {
            nota = 0;
        }

        if (nota > atividade.valor) {
            nota = atividade.valor;
        }

        notas[chave] = nota;
    }

    salvarDados();

    atualizarTabela();
}


// ==========================================
// CALCULAR MÉDIA DO ESTUDANTE
// ==========================================

function calcularMedia(estudanteId) {

    if (atividades.length === 0) {
        return null;
    }

    let somaNotas = 0;
    let somaValores = 0;

    atividades.forEach(atividade => {

        const chave =
            estudanteId + "_" + atividade.id;

        if (notas[chave] !== undefined) {

            somaNotas += Number(notas[chave]);
            somaValores += Number(atividade.valor);

        }

    });

    if (somaValores === 0) {
        return null;
    }

    // Converte para uma escala de 0 a 10
    const media =
        (somaNotas / somaValores) * 10;

    return media;
}


// ==========================================
// FORMATAR MÉDIA
// ==========================================

function formatarMedia(media) {

    if (media === null) {
        return "-";
    }

    return media.toFixed(2).replace(".", ",");
}


// ==========================================
// CLASSIFICAR MÉDIA
// ==========================================

function classeMedia(media) {

    if (media === null) {
        return "";
    }

    if (media >= 7) {
        return "media-aprovado";
    }

    if (media >= 5) {
        return "media-recuperacao";
    }

    return "media-reprovado";
}


// ==========================================
// ATUALIZAR TABELA
// ==========================================

function atualizarTabela() {

    const cabecalho =
        document.getElementById("cabecalhoTabela");

    const corpo =
        document.getElementById("corpoTabela");


    // ------------------------------------------
    // CABEÇALHO
    // ------------------------------------------

    cabecalho.innerHTML = `
        <th>Estudante</th>

        ${atividades.map(atividade => `

            <th>

                ${atividade.nome}

                <br>

                <small>
                    Valor: ${atividade.valor}
                </small>

                <button
                    class="btn-excluir-atividade"
                    onclick="excluirAtividade(${atividade.id})"
                    title="Excluir atividade"
                >
                    ×
                </button>

            </th>

        `).join("")}

        <th>Média</th>
        <th>Ações</th>
    `;


    // ------------------------------------------
    // CORPO
    // ------------------------------------------

    if (estudantes.length === 0) {

        corpo.innerHTML = `
            <tr>
                <td
                    colspan="${atividades.length + 3}"
                    class="sem-dados"
                >
                    Nenhum estudante cadastrado.
                </td>
            </tr>
        `;

    } else {

        corpo.innerHTML = estudantes.map(estudante => {

            const media =
                calcularMedia(estudante.id);

            return `

                <tr>

                    <td class="nome-aluno">
                        ${escaparHTML(estudante.nome)}
                    </td>

                    ${atividades.map(atividade => {

                        const chave =
                            estudante.id +
                            "_" +
                            atividade.id;

                        const valor =
                            notas[chave] !== undefined
                                ? notas[chave]
                                : "";

                        return `

                            <td>

                                <input
                                    class="nota-input"
                                    type="number"
                                    min="0"
                                    max="${atividade.valor}"
                                    step="0.1"
                                    value="${valor}"
                                    onchange="
                                        alterarNota(
                                            ${estudante.id},
                                            ${atividade.id},
                                            this.value
                                        )
                                    "
                                >

                            </td>

                        `;

                    }).join("")}

                    <td>

                        <span
                            class="media ${classeMedia(media)}"
                        >
                            ${formatarMedia(media)}
                        </span>

                    </td>

                    <td>

                        <button
                            class="btn-excluir"
                            onclick="excluirEstudante(${estudante.id})"
                        >
                            Excluir
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
    }


    atualizarResumo();
}


// ==========================================
// ATUALIZAR RESUMO
// ==========================================

function atualizarResumo() {

    document.getElementById(
        "totalEstudantes"
    ).textContent = estudantes.length;


    document.getElementById(
        "totalAtividades"
    ).textContent = atividades.length;


    const medias = estudantes
        .map(estudante =>
            calcularMedia(estudante.id)
        )
        .filter(media =>
            media !== null
        );


    let mediaTurma = 0;

    if (medias.length > 0) {

        const soma =
            medias.reduce(
                (total, media) =>
                    total + media,
                0
            );

        mediaTurma =
            soma / medias.length;
    }


    document.getElementById(
        "mediaTurma"
    ).textContent =
        mediaTurma
            .toFixed(2)
            .replace(".", ",");
}


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;
}


// ==========================================
// LIMPAR DADOS
// ==========================================

function limparDados() {

    const confirmar = confirm(
        "ATENÇÃO!\n\n" +
        "Isso apagará todos os estudantes, " +
        "atividades e notas.\n\n" +
        "Deseja continuar?"
    );

    if (!confirmar) {
        return;
    }

    estudantes = [];
    atividades = [];
    notas = {};

    salvarDados();

    atualizarTabela();
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

atualizarTabela();