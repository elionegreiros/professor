import { TURMAS_CONFIG, setEstadoGlobal, estadoGlobal } from './config.js';
import { carregarDados, inicializarEstruturaTurma, iniciarBackupAutomatico, getDadosNotas, getDadosPresenca, getDadosVistos, salvarDados } from './utils/storage.js';
import { esconderLoading, mostrarNotificacao } from './utils/helpers.js';
import { inicializarNotas, salvarNotas, handleExportarNotas, renderizarNotas } from './modules/notas.js';
import { inicializarPresenca, adicionarAula, handleExportarPresenca, renderizarPresenca } from './modules/presenca.js';
import { inicializarVistos, salvarVisto, adicionarVistoRapido, handleExportarVistos, fecharModal, renderizarVistos } from './modules/vistos.js';
import { inicializarRelatorios, renderizarRelatorios, handleExportarRelatorio } from './modules/relatorios.js';

// Estado global
let turmaAtualId = "1adm";
let turmasCarregadas = {};

// Carregar alunos do JSON
async function carregarAlunos(turmaId) {
    const turma = TURMAS_CONFIG[turmaId];
    if (!turma || turma.alunos?.length > 0) return true;
    
    try {
        const response = await fetch(`dados/${turma.arquivoAlunos}`);
        if (response.ok) {
            const alunos = await response.json();
            turma.alunos = alunos;
            turmasCarregadas[turmaId] = turma;
            return true;
        }
    } catch (error) {
        console.error(`Erro ao carregar alunos da turma ${turmaId}:`, error);
    }
    return false;
}

// Carregar todas as turmas
async function carregarTodasTurmas() {
    const promises = Object.keys(TURMAS_CONFIG).map(id => carregarAlunos(id));
    await Promise.all(promises);
}

// Trocar turma
async function trocarTurma(turmaId) {
    if (estadoGlobal.isLoading) return;
    
    estadoGlobal.isLoading = true;
    turmaAtualId = turmaId;
    
    // Atualizar botões
    document.querySelectorAll(".turma-btn").forEach(btn => {
        btn.classList.toggle("ativo", btn.dataset.turma === turmaId);
    });
    
    const turma = TURMAS_CONFIG[turmaId];
    if (!turma) return;
    
    // Garantir alunos carregados
    if (!turma.alunos || turma.alunos.length === 0) {
        await carregarAlunos(turmaId);
    }
    
    // Atualizar título
    const tituloDiv = document.getElementById("turmaTitulo");
    if (tituloDiv) {
        tituloDiv.innerHTML = `<h1>📚 ${turma.nome}</h1>`;
    }
    
    // Atualizar select de disciplinas
    const selectDisciplina = document.getElementById("disciplinaNotas");
    if (selectDisciplina) {
        selectDisciplina.innerHTML = "";
        turma.disciplinas.forEach(disciplina => {
            const option = document.createElement("option");
            option.value = disciplina;
            option.textContent = disciplina;
            selectDisciplina.appendChild(option);
        });
    }
    
    // Inicializar estrutura no storage
    const { dadosNotas, dadosPresenca, dadosVistos } = carregarDados();
    inicializarEstruturaTurma(turmaId, turma, turma.alunos, turma.disciplinas);
    
    // Inicializar módulos com a turma atual
    const turmaCompleta = { id: turmaId, ...turma };
    
    inicializarNotas(turmaCompleta, TURMAS_CONFIG);
    inicializarPresenca(turmaCompleta);
    inicializarVistos(turmaCompleta);
    inicializarRelatorios(turmaCompleta, turmaId);
    
    estadoGlobal.isLoading = false;
}

// Configurar event listeners
function setupEventListeners() {
    // Botões de turma
    document.querySelectorAll(".turma-btn").forEach(btn => {
        btn.addEventListener("click", () => trocarTurma(btn.dataset.turma));
    });
    
    // Abas
    document.querySelectorAll(".aba-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".aba-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".aba-conteudo").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            const abaId = `aba${btn.dataset.aba.charAt(0).toUpperCase() + btn.dataset.aba.slice(1)}`;
            const abaElement = document.getElementById(abaId);
            if (abaElement) abaElement.classList.add("active");
            if (btn.dataset.aba === "relatorios") renderizarRelatorios();
            if (btn.dataset.aba === "notas") renderizarNotas();
            if (btn.dataset.aba === "presenca") renderizarPresenca();
            if (btn.dataset.aba === "vistos") renderizarVistos();
        });
    });
    
    // Notas
    const disciplinaNotas = document.getElementById("disciplinaNotas");
    if (disciplinaNotas) disciplinaNotas.addEventListener("change", () => renderizarNotas());
    
    const salvarNotasBtn = document.getElementById("salvarNotas");
    if (salvarNotasBtn) salvarNotasBtn.addEventListener("click", salvarNotas);
    
    const exportarNotasBtn = document.getElementById("exportarNotas");
    if (exportarNotasBtn) exportarNotasBtn.addEventListener("click", handleExportarNotas);
    
    // Presença
    const adicionarAulaBtn = document.getElementById("adicionarAula");
    if (adicionarAulaBtn) adicionarAulaBtn.addEventListener("click", adicionarAula);
    
    const salvarPresencaBtn = document.getElementById("salvarPresenca");
    if (salvarPresencaBtn) {
        salvarPresencaBtn.addEventListener("click", () => {
            salvarDados();
            mostrarNotificacao("Presenças salvas!", "success");
        });
    }
    
    const exportarPresencaBtn = document.getElementById("exportarPresenca");
    if (exportarPresencaBtn) exportarPresencaBtn.addEventListener("click", handleExportarPresenca);
    
    const mesPresenca = document.getElementById("mesPresenca");
    if (mesPresenca) mesPresenca.addEventListener("change", () => renderizarPresenca());
    
    const anoPresenca = document.getElementById("anoPresenca");
    if (anoPresenca) anoPresenca.addEventListener("change", () => renderizarPresenca());
    
    // Vistos
    const adicionarVistoBtn = document.getElementById("adicionarVisto");
    if (adicionarVistoBtn) adicionarVistoBtn.addEventListener("click", adicionarVistoRapido);
    
    const salvarVistosBtn = document.getElementById("salvarVistos");
    if (salvarVistosBtn) {
        salvarVistosBtn.addEventListener("click", () => {
            salvarDados();
            mostrarNotificacao("Vistos salvos!", "success");
        });
    }
    
    const exportarVistosBtn = document.getElementById("exportarVistos");
    if (exportarVistosBtn) exportarVistosBtn.addEventListener("click", handleExportarVistos);
    
    // Relatórios
    const exportarRelatorioBtn = document.getElementById("exportarRelatorioGeral");
    if (exportarRelatorioBtn) exportarRelatorioBtn.addEventListener("click", handleExportarRelatorio);
    
    // Modal
    const modalFechar = document.querySelector(".modal-fechar");
    if (modalFechar) modalFechar.addEventListener("click", fecharModal);
    
    const modalSalvar = document.getElementById("modalSalvarVisto");
    if (modalSalvar) modalSalvar.addEventListener("click", salvarVisto);
    
    window.onclick = (event) => {
        const modal = document.getElementById("modalVisto");
        if (event.target === modal) fecharModal();
    };
}

// Inicialização
async function init() {
    console.log("🚀 Inicializando Sistema Acadêmico v2.0...");
    
    await carregarTodasTurmas();
    carregarDados();
    iniciarBackupAutomatico();
    setupEventListeners();
    
    // Iniciar com primeira turma
    await trocarTurma("1adm");
    
    esconderLoading();
    mostrarNotificacao("Sistema carregado com sucesso!", "success");
    console.log("✅ Sistema inicializado!");
}

// Iniciar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}