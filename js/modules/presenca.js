import { getDadosPresenca, salvarDados } from '../utils/storage.js';
import { formatarData, mostrarNotificacao } from '../utils/helpers.js';
import { exportarFrequencia } from '../utils/export.js';

let turmaAtual = null;

export function inicializarPresenca(turma) {
    turmaAtual = turma;
    renderizarPresenca();
    
    // Configurar data padrão
    const dataAulaInput = document.getElementById("dataAula");
    if (dataAulaInput) {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        dataAulaInput.value = `${ano}-${mes}-${dia}`;
    }
}

export function renderizarPresenca() {
    const mes = document.getElementById("mesPresenca")?.value;
    const ano = document.getElementById("anoPresenca")?.value;
    const key = `${ano}-${mes?.padStart(2,'0')}`;
    const dadosPresenca = getDadosPresenca();
    const aulas = dadosPresenca[turmaAtual.id]?.[key] || [];
    const container = document.getElementById("aulasContainer");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (aulas.length === 0) {
        container.innerHTML = '<div class="lista-vazia fade-in">📭 Nenhuma aula registrada neste mês. Clique em "+ Nova Aula" para começar.</div>';
        return;
    }
    
    aulas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    aulas.forEach((aula, idx) => {
        const aulaCard = document.createElement("div");
        aulaCard.className = "aula-card fade-in";
        
        aulaCard.innerHTML = `
            <div class="aula-header">
                <span class="aula-data">📅 ${formatarData(aula.data)}</span>
                <button class="aula-remover btn btn-danger btn-pequeno" data-index="${idx}">🗑️ Remover</button>
            </div>
            <div class="tabela-container">
                <table class="tabela-presenca tabela-moderna">
                    <thead>
                        <tr><th>Aluno</th><th>Presente?</th></tr>
                    </thead>
                    <tbody>
                        ${turmaAtual.alunos.map(aluno => `
                            <tr>
                                <td>${aluno}</td>
                                <td><input type="checkbox" class="presenca-check" data-aluno="${aluno}" ${aula.presencas?.[aluno] ? 'checked' : ''}></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.appendChild(aulaCard);
        
        aulaCard.querySelector(".aula-remover").onclick = () => removerAula(key, idx);
        
        aulaCard.querySelectorAll(".presenca-check").forEach(checkbox => {
            checkbox.onchange = (e) => {
                const dadosPresenca = getDadosPresenca();
                const aluno = e.target.dataset.aluno;
                if (!dadosPresenca[turmaAtual.id][key][idx].presencas) {
                    dadosPresenca[turmaAtual.id][key][idx].presencas = {};
                }
                dadosPresenca[turmaAtual.id][key][idx].presencas[aluno] = e.target.checked;
                salvarDados();
            };
        });
    });
}

function removerAula(key, index) {
    if (confirm("Remover esta aula?")) {
        const dadosPresenca = getDadosPresenca();
        dadosPresenca[turmaAtual.id][key].splice(index, 1);
        if (dadosPresenca[turmaAtual.id][key].length === 0) {
            delete dadosPresenca[turmaAtual.id][key];
        }
        salvarDados();
        renderizarPresenca();
        mostrarNotificacao("Aula removida com sucesso!", "success");
    }
}

export function adicionarAula() {
    const dataAula = document.getElementById("dataAula")?.value;
    
    if (!dataAula) {
        mostrarNotificacao("Selecione a data da aula!", "warning");
        return;
    }
    
    const mes = document.getElementById("mesPresenca")?.value;
    const ano = document.getElementById("anoPresenca")?.value;
    const key = `${ano}-${mes?.padStart(2,'0')}`;
    
    const dataObj = new Date(dataAula);
    const dataMes = (dataObj.getMonth() + 1).toString();
    const dataAno = dataObj.getFullYear().toString();
    
    const dadosPresenca = getDadosPresenca();
    
    if (!dadosPresenca[turmaAtual.id][key]) {
        dadosPresenca[turmaAtual.id][key] = [];
    }
    
    const aulaExistente = dadosPresenca[turmaAtual.id][key].find(aula => aula.data === dataAula);
    if (aulaExistente) {
        mostrarNotificacao(`Já existe aula no dia ${formatarData(dataAula)}!`, "warning");
        return;
    }
    
    dadosPresenca[turmaAtual.id][key].push({
        data: dataAula,
        presencas: {}
    });
    
    salvarDados();
    renderizarPresenca();
    mostrarNotificacao(`Aula adicionada para ${formatarData(dataAula)}!`, "success");
}

export function handleExportarPresenca() {
    const dadosPresenca = getDadosPresenca();
    exportarFrequencia(turmaAtual, dadosPresenca[turmaAtual.id]);
}