import { getDadosVistos, salvarDados } from '../utils/storage.js';
import { formatarData, mostrarNotificacao } from '../utils/helpers.js';
import { exportarVistos } from '../utils/export.js';

let turmaAtual = null;
let alunoSelecionadoVisto = null;

export function inicializarVistos(turma) {
    turmaAtual = turma;
    renderizarVistos();
    
    const dataVisto = document.getElementById("dataVisto");
    if (dataVisto) dataVisto.valueAsDate = new Date();
}

export function renderizarVistos() {
    if (!turmaAtual || !turmaAtual.alunos) return;
    
    const dadosVistos = getDadosVistos();
    const vistosTurma = dadosVistos[turmaAtual.id]?.alunos || {};
    const tbody = document.getElementById("tbodyVistos");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    turmaAtual.alunos.forEach(aluno => {
        const dados = vistosTurma[aluno] || { total: 0, ultima: "" };
        const row = tbody.insertRow();
        row.insertCell(0).textContent = aluno;
        row.insertCell(1).innerHTML = `<span class="badge badge-visto">⭐ ${dados.total}</span>`;
        row.insertCell(2).textContent = dados.ultima ? formatarData(dados.ultima) : "-";
        
        const btnCell = row.insertCell(3);
        const btn = document.createElement("button");
        btn.textContent = "➕ Dar Visto";
        btn.className = "btn btn-primary btn-pequeno";
        btn.onclick = () => abrirModalVisto(aluno);
        btnCell.appendChild(btn);
    });
}

function abrirModalVisto(aluno) {
    alunoSelecionadoVisto = aluno;
    document.getElementById("modalDescVisto").value = "";
    document.getElementById("modalVisto").style.display = "block";
}

export function salvarVisto() {
    if (!alunoSelecionadoVisto) return;
    
    const descricao = document.getElementById("modalDescVisto")?.value.trim();
    if (!descricao) {
        mostrarNotificacao("Descreva a participação do aluno!", "warning");
        return;
    }
    
    const dadosVistos = getDadosVistos();
    const vistosTurma = dadosVistos[turmaAtual.id].alunos;
    
    if (!vistosTurma[alunoSelecionadoVisto]) {
        vistosTurma[alunoSelecionadoVisto] = { total: 0, registros: [], ultima: "" };
    }
    
    const agora = new Date().toISOString();
    vistosTurma[alunoSelecionadoVisto].total++;
    vistosTurma[alunoSelecionadoVisto].registros.push({
        data: agora,
        descricao: descricao
    });
    vistosTurma[alunoSelecionadoVisto].ultima = agora;
    
    salvarDados();
    renderizarVistos();
    document.getElementById("modalVisto").style.display = "none";
    mostrarNotificacao(`Visto concedido para ${alunoSelecionadoVisto}!`, "success");
}

export function adicionarVistoRapido() {
    const data = document.getElementById("dataVisto")?.value;
    const descricao = document.getElementById("descVisto")?.value.trim();
    
    if (!data) {
        mostrarNotificacao("Selecione uma data!", "warning");
        return;
    }
    
    if (!descricao) {
        mostrarNotificacao("Digite uma descrição!", "warning");
        return;
    }
    
    if (turmaAtual.alunos.length === 0) return;
    abrirModalVisto(turmaAtual.alunos[0]);
}

export function handleExportarVistos() {
    const dadosVistos = getDadosVistos();
    exportarVistos(turmaAtual, dadosVistos[turmaAtual.id]);
}

export function fecharModal() {
    document.getElementById("modalVisto").style.display = "none";
}