import { getDadosNotas, salvarDados } from '../utils/storage.js';
import { calcularMedia, obterStatus, mostrarNotificacao } from '../utils/helpers.js';
import { exportarNotas } from '../utils/export.js';

let turmaAtual = null;
let turmasConfig = null;

export function inicializarNotas(turma, config) {
    turmaAtual = turma;
    turmasConfig = config;
    renderizarNotas();
}

export function renderizarNotas() {
    const disciplina = document.getElementById("disciplinaNotas")?.value;
    if (!disciplina) return;
    
    if (!turmaAtual || !turmaAtual.alunos) return;
    
    const alunos = turmaAtual.alunos;
    const dadosNotas = getDadosNotas();
    const notasTurma = dadosNotas[turmaAtual.id]?.[disciplina] || {};
    const tbody = document.getElementById("tbodyNotas");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    alunos.forEach(aluno => {
        const notas = notasTurma[aluno] || { nm1: "", nm2: "", nm3: "" };
        const media = calcularMedia(notas);
        const status = obterStatus(media);
        
        const row = tbody.insertRow();
        row.insertCell(0).textContent = aluno;
        
        [1, 2, 3].forEach(trimestre => {
            const cell = row.insertCell(trimestre);
            const input = document.createElement("input");
            input.type = "number";
            input.step = "0.1";
            input.min = "0";
            input.max = "10";
            input.value = notas[`nm${trimestre}`];
            input.classList.add("input-numero");
            input.dataset.aluno = aluno;
            input.dataset.trimestre = `nm${trimestre}`;
            cell.appendChild(input);
        });
        
        row.insertCell(4).textContent = media.toFixed(1);
        row.insertCell(5).innerHTML = `<span class="badge ${status.classe}">${status.texto}</span>`;
    });
}

export function salvarNotas() {
    const disciplina = document.getElementById("disciplinaNotas")?.value;
    if (!disciplina) return;
    
    const inputs = document.querySelectorAll("#tbodyNotas .input-numero");
    const dadosNotas = getDadosNotas();
    
    inputs.forEach(input => {
        const aluno = input.dataset.aluno;
        const trimestre = input.dataset.trimestre;
        let valor = input.value === "" ? "" : parseFloat(input.value);
        if (valor !== "" && (isNaN(valor) || valor < 0 || valor > 10)) valor = "";
        
        if (!dadosNotas[turmaAtual.id][disciplina][aluno]) {
            dadosNotas[turmaAtual.id][disciplina][aluno] = { nm1: "", nm2: "", nm3: "" };
        }
        dadosNotas[turmaAtual.id][disciplina][aluno][trimestre] = valor;
    });
    
    salvarDados();
    renderizarNotas();
    mostrarNotificacao("Notas salvas com sucesso!", "success");
}

export function handleExportarNotas() {
    const disciplina = document.getElementById("disciplinaNotas")?.value;
    if (!disciplina) return;
    const dadosNotas = getDadosNotas();
    exportarNotas(turmaAtual, dadosNotas[turmaAtual.id], disciplina);
}