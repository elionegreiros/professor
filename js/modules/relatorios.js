import { getDadosNotas, getDadosPresenca, getDadosVistos } from '../utils/storage.js';
import { calcularMedia } from '../utils/helpers.js';
import { exportarRelatorioCompleto } from '../utils/export.js';

let turmaAtual = null;
let turmaId = null;

export function inicializarRelatorios(turma, id) {
    turmaAtual = turma;
    turmaId = id;
    renderizarRelatorios();
    
    // Atualizar dashboard
    atualizarDashboard();
}

function atualizarDashboard() {
    if (!turmaAtual || !turmaAtual.alunos) return;
    
    const disciplina = document.getElementById("disciplinaNotas")?.value || turmaAtual.disciplinas[0];
    const dadosNotas = getDadosNotas();
    const dadosVistos = getDadosVistos();
    
    // Total de alunos
    document.getElementById("totalAlunos").textContent = turmaAtual.alunos.length;
    
    // Aprovados e média geral
    let aprovados = 0;
    let somaMedias = 0;
    let alunosComNota = 0;
    
    turmaAtual.alunos.forEach(aluno => {
        const notas = dadosNotas[turmaId]?.[disciplina]?.[aluno] || { nm1: "", nm2: "", nm3: "" };
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const media = (nm1 + nm2 + nm3) / 3;
        
        if (nm1 !== 0 || nm2 !== 0 || nm3 !== 0) {
            alunosComNota++;
            if (media >= 7) aprovados++;
            somaMedias += media;
        }
    });
    
    document.getElementById("aprovadosCount").textContent = aprovados;
    const mediaGeral = alunosComNota > 0 ? (somaMedias / alunosComNota).toFixed(1) : 0;
    document.getElementById("mediaGeral").textContent = mediaGeral;
    
    // Total de vistos
    let totalVistos = 0;
    const vistosTurma = dadosVistos[turmaId]?.alunos || {};
    Object.values(vistosTurma).forEach(v => { totalVistos += v.total || 0; });
    document.getElementById("totalVistos").textContent = totalVistos;
}

export function renderizarRelatorios() {
    if (!turmaAtual || !turmaAtual.alunos) return;
    
    const disciplina = document.getElementById("disciplinaNotas")?.value || turmaAtual.disciplinas[0];
    const alunos = turmaAtual.alunos;
    const dadosNotas = getDadosNotas();
    const dadosPresenca = getDadosPresenca();
    const dadosVistos = getDadosVistos();
    
    // Resumo de Notas
    let aprovados = 0, recuperacao = 0, reprovados = 0, semNotas = 0;
    let somaMedias = 0;
    let alunosComNota = 0;
    
    alunos.forEach(aluno => {
        const notas = dadosNotas[turmaId]?.[disciplina]?.[aluno] || { nm1: "", nm2: "", nm3: "" };
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const media = (nm1 + nm2 + nm3) / 3;
        
        if (nm1 === 0 && nm2 === 0 && nm3 === 0) {
            semNotas++;
        } else {
            alunosComNota++;
            if (media >= 7) aprovados++;
            else if (media >= 5) recuperacao++;
            else reprovados++;
            somaMedias += media;
        }
    });
    
    const mediaGeral = alunosComNota > 0 ? (somaMedias / alunosComNota).toFixed(1) : 0;
    
    const resumoNotasDiv = document.getElementById("resumoNotas");
    if (resumoNotasDiv) {
        resumoNotasDiv.innerHTML = `
            <ul>
                <li>📊 Média Geral: <strong>${mediaGeral}</strong></li>
                <li>✅ Aprovados: <strong class="badge-aprovado" style="padding: 2px 8px;">${aprovados}</strong></li>
                <li>⚠️ Recuperação: <strong class="badge-recuperacao" style="padding: 2px 8px;">${recuperacao}</strong></li>
                <li>❌ Reprovados: <strong class="badge-reprovado" style="padding: 2px 8px;">${reprovados}</strong></li>
                <li>📝 Sem notas: <strong>${semNotas}</strong></li>
            </ul>
        `;
    }
    
    // Frequência Geral
    let totalPresencas = 0;
    let totalAulas = 0;
    
    for (let key in dadosPresenca[turmaId] || {}) {
        dadosPresenca[turmaId][key].forEach(aula => {
            totalAulas++;
            const presentes = Object.values(aula.presencas || {}).filter(v => v === true).length;
            totalPresencas += presentes;
        });
    }
    
    const frequenciaMedia = totalAulas > 0 && alunos.length > 0 ? ((totalPresencas / (totalAulas * alunos.length)) * 100).toFixed(1) : 0;
    
    const resumoFrequenciaDiv = document.getElementById("resumoFrequencia");
    if (resumoFrequenciaDiv) {
        resumoFrequenciaDiv.innerHTML = `
            <ul>
                <li>📅 Total de Aulas: <strong>${totalAulas}</strong></li>
                <li>👥 Total de Presenças: <strong>${totalPresencas}</strong></li>
                <li>📈 Frequência Média: <strong>${frequenciaMedia}%</strong></li>
            </ul>
        `;
    }
    
    // Alunos Destaque
    const destaques = [];
    alunos.forEach(aluno => {
        const vistos = dadosVistos[turmaId]?.alunos?.[aluno]?.total || 0;
        if (vistos >= 3) {
            destaques.push({ aluno, vistos });
        }
    });
    destaques.sort((a, b) => b.vistos - a.vistos);
    
    const alunosDestaqueDiv = document.getElementById("alunosDestaque");
    if (alunosDestaqueDiv) {
        alunosDestaqueDiv.innerHTML = destaques.length ? `
            <ul>
                ${destaques.slice(0,5).map(d => `<li>⭐ ${d.aluno} - ${d.vistos} vistos</li>`).join('')}
            </ul>
        ` : "<p>Nenhum aluno com destaque ainda</p>";
    }
    
    // Alunos em Recuperação
    const recuperacaoList = [];
    alunos.forEach(aluno => {
        const notas = dadosNotas[turmaId]?.[disciplina]?.[aluno] || { nm1: "", nm2: "", nm3: "" };
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const media = (nm1 + nm2 + nm3) / 3;
        if (media >= 5 && media < 7 && (nm1 !== 0 || nm2 !== 0 || nm3 !== 0)) {
            recuperacaoList.push({ aluno, media });
        }
    });
    
    const alunosRecuperacaoDiv = document.getElementById("alunosRecuperacao");
    if (alunosRecuperacaoDiv) {
        alunosRecuperacaoDiv.innerHTML = recuperacaoList.length ? `
            <ul>
                ${recuperacaoList.map(r => `<li>⚠️ ${r.aluno} - Média: ${r.media.toFixed(1)}</li>`).join('')}
            </ul>
        ` : "<p>Nenhum aluno em recuperação</p>";
    }
}

export function handleExportarRelatorio() {
    const disciplina = document.getElementById("disciplinaNotas")?.value || turmaAtual.disciplinas[0];
    const dadosNotas = getDadosNotas();
    const dadosPresenca = getDadosPresenca();
    const dadosVistos = getDadosVistos();
    exportarRelatorioCompleto(turmaAtual, dadosNotas[turmaId], dadosPresenca[turmaId], dadosVistos[turmaId], disciplina);
}