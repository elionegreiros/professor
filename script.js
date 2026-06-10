// Configuração das turmas
const turmasConfig = {
    "1adm": { 
        nome: "1º Administração", 
        alunos: [],
        disciplinas: ["Inteligência Artificial"],
        arquivoAlunos: "alunos_1_adm.json",
        favorita: false
    },
    "1amb": { 
        nome: "1º Controle Ambiental", 
        alunos: [],
        disciplinas: ["Inteligência Artificial"],
        arquivoAlunos: "alunos_1_ambiental.json",
        favorita: false
    },
    "2ds": { 
        nome: "2º Desenvolvimento de Sistemas", 
        alunos: [],
        disciplinas: [
            "Inteligência Artificial", "MENTORIAS TEC II", "FUNDAMENTOS DE UI / UX OU IHC",
            "PENSAMENTO COMPUTACIONAL II", "PROGRAMAÇÃO ESTRUTURADA", "PROGRAMAÇÃO ORIENTADA À OBJETOS - POO",
            "PROGRAMAÇÃO PARA DISPOSITIVOS MÓVEIS", "PROGRAMAÇÃO WEB FRONT-END", "ARQUITETURA DE MICROSSERVIÇOS",
            "INTRODUÇÃO AO ECOSSISTEMA DEVops", "MANUTENÇÃO DE SISTEMAS"
        ],
        arquivoAlunos: "alunos_2_desenvolvimento.json",
        favorita: false
    },
    "inf1": { 
        nome: "Informática - Módulo I", 
        alunos: [],
        disciplinas: ["Análise e Lógica de Programação"],
        arquivoAlunos: "alunos_informatica_mod1.json",
        favorita: false
    },
    "inf5": { 
        nome: "Informática - Módulo V", 
        alunos: [],
        disciplinas: ["Empreendedorismo para TI"],
        arquivoAlunos: "alunos_informatica_mod5.json",
        favorita: false
    }
};

// Estado global
let turmaAtual = "1adm";
let dadosNotas = {};
let dadosPresenca = {};
let dadosVistos = {};
let dadosComentarios = {};
let dadosArquivos = {};
let isLoading = false;
let limiteFaltasPercentual = 25; // 25% de faltas = reprovação

// Carregar preferências salvas
function carregarPreferencias() {
    const tema = localStorage.getItem("tema");
    if (tema === "escuro") {
        document.body.classList.add("tema-escuro");
        document.getElementById("btnTema").innerHTML = "☀️ Tema Claro";
    }
    
    const favoritas = localStorage.getItem("turmasFavoritas");
    if (favoritas) {
        const favs = JSON.parse(favoritas);
        for (let id in favs) {
            if (turmasConfig[id]) turmasConfig[id].favorita = favs[id];
        }
    }
    
    const limite = localStorage.getItem("limiteFaltas");
    if (limite) limiteFaltasPercentual = parseInt(limite);
}

// Salvar turma favorita
function toggleFavoritar(turmaId) {
    turmasConfig[turmaId].favorita = !turmasConfig[turmaId].favorita;
    const favoritas = {};
    for (let id in turmasConfig) {
        favoritas[id] = turmasConfig[id].favorita;
    }
    localStorage.setItem("turmasFavoritas", JSON.stringify(favoritas));
    atualizarBotoesTurma();
}

function atualizarBotoesTurma() {
    document.querySelectorAll(".turma-btn").forEach(btn => {
        const turmaId = btn.dataset.turma;
        if (turmasConfig[turmaId]?.favorita) {
            btn.classList.add("favorita");
        } else {
            btn.classList.remove("favorita");
        }
    });
}

// Funções de arquivo (simulação - salva em localStorage)
function salvarArquivo(turmaId, aluno, tipo, descricao, arquivoData) {
    if (!dadosArquivos[turmaId]) dadosArquivos[turmaId] = {};
    if (!dadosArquivos[turmaId][aluno]) dadosArquivos[turmaId][aluno] = [];
    
    dadosArquivos[turmaId][aluno].push({
        id: Date.now(),
        tipo: tipo,
        descricao: descricao,
        data: new Date().toISOString(),
        arquivo: arquivoData // Base64
    });
    salvarDados();
}

function removerArquivo(turmaId, aluno, arquivoId) {
    if (dadosArquivos[turmaId]?.[aluno]) {
        dadosArquivos[turmaId][aluno] = dadosArquivos[turmaId][aluno].filter(a => a.id != arquivoId);
        salvarDados();
    }
}

// Carregar alunos
async function carregarAlunos(turmaId) {
    const turma = turmasConfig[turmaId];
    if (turma && turma.arquivoAlunos) {
        try {
            const response = await fetch(`dados/${turma.arquivoAlunos}`);
            if (response.ok) {
                const alunos = await response.json();
                turmasConfig[turmaId].alunos = alunos;
                return true;
            }
        } catch (error) {
            console.error(`Erro ao carregar alunos da turma ${turmaId}:`, error);
        }
    }
    return false;
}

async function carregarTodosAlunos() {
    const promises = Object.keys(turmasConfig).map(turmaId => carregarAlunos(turmaId));
    await Promise.all(promises);
}

// Carregar dados do localStorage
function carregarDadosSalvos() {
    const saved = localStorage.getItem("sistemaAcademico");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            dadosNotas = data.notas || {};
            dadosPresenca = data.presenca || {};
            dadosVistos = data.vistos || {};
            dadosComentarios = data.comentarios || {};
            dadosArquivos = data.arquivos || {};
        } catch (e) {
            console.error("Erro ao carregar dados salvos:", e);
        }
    }
    
    for (let turmaId in turmasConfig) {
        if (!dadosNotas[turmaId]) dadosNotas[turmaId] = {};
        if (!dadosPresenca[turmaId]) dadosPresenca[turmaId] = {};
        if (!dadosVistos[turmaId]) dadosVistos[turmaId] = {};
        if (!dadosComentarios[turmaId]) dadosComentarios[turmaId] = {};
        if (!dadosArquivos[turmaId]) dadosArquivos[turmaId] = {};
        
        const turma = turmasConfig[turmaId];
        const alunos = turma.alunos;
        const disciplinas = turma.disciplinas;
        
        if (alunos && alunos.length > 0) {
            disciplinas.forEach(disciplina => {
                if (!dadosNotas[turmaId][disciplina]) {
                    dadosNotas[turmaId][disciplina] = {};
                    alunos.forEach(aluno => {
                        dadosNotas[turmaId][disciplina][aluno] = { nm1: "", nm2: "", nm3: "", exame: "" };
                    });
                }
            });
            
            if (!dadosVistos[turmaId].alunos) {
                dadosVistos[turmaId].alunos = {};
                alunos.forEach(aluno => {
                    dadosVistos[turmaId].alunos[aluno] = { 
                        total: 0, 
                        advertencias: 0,
                        suspensoes: 0,
                        registros: [], 
                        ultima: "",
                        selo: "bronze"
                    };
                });
            }
            
            if (!dadosComentarios[turmaId][aluno]) {
                alunos.forEach(aluno => {
                    if (!dadosComentarios[turmaId][aluno]) {
                        dadosComentarios[turmaId][aluno] = { observacoes: "", historico: [] };
                    }
                });
            }
        }
    }
    salvarDados();
}

function salvarDados() {
    localStorage.setItem("sistemaAcademico", JSON.stringify({
        notas: dadosNotas,
        presenca: dadosPresenca,
        vistos: dadosVistos,
        comentarios: dadosComentarios,
        arquivos: dadosArquivos
    }));
}

// Calcular selo baseado nos vistos
function calcularSelo(totalVistos, advertencias, suspensoes) {
    let pontuacao = totalVistos - (advertencias * 2) - (suspensoes * 5);
    if (pontuacao >= 20) return "diamante";
    if (pontuacao >= 10) return "ouro";
    if (pontuacao >= 5) return "prata";
    return "bronze";
}

// Renderizar notas com exame final
function renderizarNotas() {
    const disciplina = document.getElementById("disciplinaNotas").value;
    if (!disciplina) return;
    
    const turma = turmasConfig[turmaAtual];
    if (!turma || !turma.alunos) return;
    
    const alunos = turma.alunos;
    const notasTurma = dadosNotas[turmaAtual][disciplina] || {};
    const tbody = document.getElementById("tbodyNotas");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    alunos.forEach(aluno => {
        const notas = notasTurma[aluno] || { nm1: "", nm2: "", nm3: "", exame: "" };
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        let media = (nm1 + nm2 + nm3) / 3;
        
        const exame = parseFloat(notas.exame) || 0;
        let status = "";
        let statusClass = "";
        
        if (exame > 0) {
            const mediaFinal = (media + exame) / 2;
            if (mediaFinal >= 5) {
                status = "✓ Aprovado por Exame";
                statusClass = "status-aprovado";
            } else {
                status = "✗ Reprovado por Exame";
                statusClass = "status-reprovado";
            }
        } else if (media >= 7) {
            status = "✓ Aprovado";
            statusClass = "status-aprovado";
        } else if (media >= 5) {
            status = "⚠️ Recuperação";
            statusClass = "status-recuperacao";
        } else if (media > 0) {
            status = "✗ Reprovado";
            statusClass = "status-reprovado";
        } else {
            status = "⏳ Sem notas";
            statusClass = "";
        }
        
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
            input.classList.add("nota-input");
            input.dataset.aluno = aluno;
            input.dataset.trimestre = `nm${trimestre}`;
            cell.appendChild(input);
        });
        
        row.insertCell(4).textContent = media.toFixed(1);
        row.insertCell(5).innerHTML = `<span class="${statusClass}">${status}</span>`;
        
        const cellExame = row.insertCell(6);
        const inputExame = document.createElement("input");
        inputExame.type = "number";
        inputExame.step = "0.1";
        inputExame.min = "0";
        inputExame.max = "10";
        inputExame.value = notas.exame;
        inputExame.classList.add("exame-input");
        inputExame.dataset.aluno = aluno;
        cellExame.appendChild(inputExame);
        
        const cellAcoes = row.insertCell(7);
        const btnComentario = document.createElement("button");
        btnComentario.textContent = "📝 Comentário";
        btnComentario.className = "btn-pequeno btn-comentario";
        btnComentario.onclick = () => abrirModalComentario(aluno);
        cellAcoes.appendChild(btnComentario);
        
        const btnAnexo = document.createElement("button");
        btnAnexo.textContent = "📎 Anexo";
        btnAnexo.className = "btn-pequeno";
        btnAnexo.style.background = "#17a2b8";
        btnAnexo.style.marginLeft = "5px";
        btnAnexo.onclick = () => abrirModalArquivo(aluno);
        cellAcoes.appendChild(btnAnexo);
    });
    
    document.querySelectorAll(".exame-input").forEach(input => {
        input.addEventListener("change", (e) => {
            const aluno = e.target.dataset.aluno;
            let valor = e.target.value === "" ? "" : parseFloat(e.target.value);
            if (valor !== "" && (isNaN(valor) || valor < 0 || valor > 10)) valor = "";
            if (!dadosNotas[turmaAtual][disciplina][aluno]) {
                dadosNotas[turmaAtual][disciplina][aluno] = { nm1: "", nm2: "", nm3: "", exame: "" };
            }
            dadosNotas[turmaAtual][disciplina][aluno].exame = valor;
            salvarDados();
            renderizarNotas();
        });
    });
}

function salvarNotas() {
    const disciplina = document.getElementById("disciplinaNotas").value;
    const inputs = document.querySelectorAll("#tbodyNotas .nota-input");
    
    inputs.forEach(input => {
        const aluno = input.dataset.aluno;
        const trimestre = input.dataset.trimestre;
        let valor = input.value === "" ? "" : parseFloat(input.value);
        if (valor !== "" && (isNaN(valor) || valor < 0 || valor > 10)) valor = "";
        
        if (!dadosNotas[turmaAtual][disciplina][aluno]) {
            dadosNotas[turmaAtual][disciplina][aluno] = { nm1: "", nm2: "", nm3: "", exame: "" };
        }
        dadosNotas[turmaAtual][disciplina][aluno][trimestre] = valor;
    });
    
    salvarDados();
    renderizarNotas();
    alert("✅ Notas salvas com sucesso!");
}

function aplicarRecuperacaoFinal() {
    const disciplina = document.getElementById("disciplinaNotas").value;
    const alunos = turmasConfig[turmaAtual].alunos;
    
    alunos.forEach(aluno => {
        const notas = dadosNotas[turmaAtual][disciplina]?.[aluno] || {};
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const media = (nm1 + nm2 + nm3) / 3;
        
        if (media >= 5 && media < 7) {
            if (!dadosNotas[turmaAtual][disciplina][aluno]) {
                dadosNotas[turmaAtual][disciplina][aluno] = {};
            }
            dadosNotas[turmaAtual][disciplina][aluno].exame = "";
        }
    });
    
    salvarDados();
    renderizarNotas();
    alert("✅ Alunos em recuperação estão prontos para exame final!");
}

// Renderizar presença
function renderizarPresenca() {
    const todasAulas = [];
    
    for (let key in dadosPresenca[turmaAtual]) {
        const aulas = dadosPresenca[turmaAtual][key];
        if (aulas && aulas.length > 0) {
            aulas.forEach(aula => {
                todasAulas.push({ ...aula, key: key });
            });
        }
    }
    
    todasAulas.sort((a, b) => {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        return 0;
    });
    
    const container = document.getElementById("aulasContainer");
    if (!container) return;
    container.innerHTML = "";
    
    const turma = turmasConfig[turmaAtual];
    if (!turma || !turma.alunos || turma.alunos.length === 0) {
        container.innerHTML = '<div class="lista-vazia">📭 Carregando alunos...</div>';
        return;
    }
    
    if (todasAulas.length === 0) {
        container.innerHTML = '<div class="lista-vazia">📭 Nenhuma aula registrada. Clique em "+ Nova Aula" para começar.</div>';
        return;
    }
    
    todasAulas.forEach((aula) => {
        const aulaCard = document.createElement("div");
        aulaCard.className = "aula-card";
        
        const [ano, mes, dia] = aula.data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        
        let tabelaHTML = `
            <div class="aula-header">
                <span class="aula-data">📅 ${dataFormatada}</span>
                <button class="aula-remover" data-key="${aula.key}" data-data="${aula.data}">🗑️ Remover</button>
            </div>
            <div class="tabela-container">
                <table class="tabela-presenca">
                    <thead><tr><th>Aluno</th><th>Presente?</th></tr></thead>
                    <tbody>
        `;
        
        turma.alunos.forEach(aluno => {
            const isChecked = aula.presencas && aula.presencas[aluno] ? 'checked' : '';
            tabelaHTML += `
                <tr>
                    <td>${aluno}</td>
                    <td style="text-align: center;">
                        <input type="checkbox" class="presenca-check" data-aluno="${aluno}" data-key="${aula.key}" data-data="${aula.data}" ${isChecked}>
                    </td>
                </tr>
            `;
        });
        
        tabelaHTML += `</tbody></table></div>`;
        aulaCard.innerHTML = tabelaHTML;
        container.appendChild(aulaCard);
        
        aulaCard.querySelector(".aula-remover").onclick = () => {
            const key = aulaCard.querySelector(".aula-remover").dataset.key;
            const data = aulaCard.querySelector(".aula-remover").dataset.data;
            const aulasList = dadosPresenca[turmaAtual][key];
            const idx = aulasList.findIndex(a => a.data === data);
            if (idx !== -1 && confirm(`Remover aula do dia ${dataFormatada}?`)) {
                aulasList.splice(idx, 1);
                if (aulasList.length === 0) delete dadosPresenca[turmaAtual][key];
                salvarDados();
                renderizarPresenca();
            }
        };
        
        aulaCard.querySelectorAll(".presenca-check").forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const aluno = e.target.dataset.aluno;
                const key = e.target.dataset.key;
                const data = e.target.dataset.data;
                const aulasList = dadosPresenca[turmaAtual][key];
                const aulaIndex = aulasList.findIndex(a => a.data === data);
                if (aulaIndex !== -1) {
                    if (!dadosPresenca[turmaAtual][key][aulaIndex].presencas) {
                        dadosPresenca[turmaAtual][key][aulaIndex].presencas = {};
                    }
                    dadosPresenca[turmaAtual][key][aulaIndex].presencas[aluno] = e.target.checked;
                    salvarDados();
                }
            });
        });
    });
}

function adicionarAula() {
    const dataAula = document.getElementById("dataAula").value;
    if (!dataAula) {
        alert("⚠️ Selecione a data da aula!");
        return;
    }
    
    const [ano, mes, dia] = dataAula.split('-');
    const key = `${ano}-${mes}`;
    const dataFormatada = `${dia}/${mes}/${ano}`;
    
    const aulasExistentes = dadosPresenca[turmaAtual][key] || [];
    if (aulasExistentes.find(a => a.data === dataAula)) {
        alert(`⚠️ Já existe aula para ${dataFormatada}!`);
        return;
    }
    
    if (!dadosPresenca[turmaAtual][key]) dadosPresenca[turmaAtual][key] = [];
    dadosPresenca[turmaAtual][key].push({ data: dataAula, presencas: {} });
    salvarDados();
    renderizarPresenca();
    
    const proximaData = new Date(parseInt(ano), parseInt(mes)-1, parseInt(dia) + 1);
    document.getElementById("dataAula").value = `${proximaData.getFullYear()}-${String(proximaData.getMonth()+1).padStart(2,'0')}-${String(proximaData.getDate()).padStart(2,'0')}`;
    alert(`✅ Aula ${dataFormatada} adicionada!`);
}

function verificarLimiteFaltas() {
    const turma = turmasConfig[turmaAtual];
    const alertas = [];
    
    turma.alunos.forEach(aluno => {
        let totalAulas = 0;
        let faltas = 0;
        
        for (let key in dadosPresenca[turmaAtual]) {
            dadosPresenca[turmaAtual][key].forEach(aula => {
                totalAulas++;
                if (!aula.presencas?.[aluno]) faltas++;
            });
        }
        
        if (totalAulas > 0) {
            const percentualFaltas = (faltas / totalAulas) * 100;
            if (percentualFaltas >= limiteFaltasPercentual) {
                alertas.push(`${aluno}: ${percentualFaltas.toFixed(1)}% de faltas (Limite: ${limiteFaltasPercentual}%)`);
            }
        }
    });
    
    if (alertas.length > 0) {
        alert("🚨 ALUNOS ACIMA DO LIMITE DE FALTAS:\n\n" + alertas.join("\n"));
    } else {
        alert("✅ Nenhum aluno ultrapassou o limite de faltas!");
    }
}

// Renderizar vistos com selos e punições
function renderizarVistos() {
    const turma = turmasConfig[turmaAtual];
    if (!turma || !turma.alunos) return;
    
    const vistosTurma = dadosVistos[turmaAtual].alunos || {};
    const tbody = document.getElementById("tbodyVistos");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    turma.alunos.forEach(aluno => {
        const dados = vistosTurma[aluno] || { total: 0, advertencias: 0, suspensoes: 0, ultima: "", registros: [] };
        const selo = calcularSelo(dados.total, dados.advertencias, dados.suspensoes);
        
        const seloClasse = {
            diamante: "selo-diamante",
            ouro: "selo-ouro",
            prata: "selo-prata",
            bronze: "selo-bronze"
        }[selo];
        
        const row = tbody.insertRow();
        row.insertCell(0).textContent = aluno;
        row.insertCell(1).innerHTML = `<span class="selo ${seloClasse}">🏆 ${selo.toUpperCase()}</span>`;
        row.insertCell(2).innerHTML = `<strong style="color:#2e7d32">${dados.total}</strong>`;
        row.insertCell(3).innerHTML = `<strong style="color:#f57c00">${dados.advertencias || 0}</strong>`;
        row.insertCell(4).innerHTML = `<strong style="color:#c62828">${dados.suspensoes || 0}</strong>`;
        row.insertCell(5).textContent = dados.ultima ? new Date(dados.ultima).toLocaleDateString('pt-BR') : "-";
        
        const btnCell = row.insertCell(6);
        
        const btnVisto = document.createElement("button");
        btnVisto.textContent = "⭐ +Visto";
        btnVisto.className = "btn-pequeno";
        btnVisto.style.background = "#2e7d32";
        btnVisto.style.marginRight = "5px";
        btnVisto.onclick = () => adicionarRegistro(aluno, "visto", "Participação positiva em aula");
        btnCell.appendChild(btnVisto);
        
        const btnAdvertencia = document.createElement("button");
        btnAdvertencia.textContent = "⚠️ Advertência";
        btnAdvertencia.className = "btn-pequeno";
        btnAdvertencia.style.background = "#f57c00";
        btnAdvertencia.style.marginRight = "5px";
        btnAdvertencia.onclick = () => adicionarRegistro(aluno, "advertencia", "Comportamento inadequado em aula");
        btnCell.appendChild(btnAdvertencia);
        
        const btnSuspensao = document.createElement("button");
        btnSuspensao.textContent = "🚫 Suspensão";
        btnSuspensao.className = "btn-pequeno";
        btnSuspensao.style.background = "#c62828";
        btnSuspensao.onclick = () => adicionarRegistro(aluno, "suspensao", "Medida disciplinar aplicada");
        btnCell.appendChild(btnSuspensao);
        
        const btnHistorico = document.createElement("button");
        btnHistorico.textContent = "📜 Histórico";
        btnHistorico.className = "btn-pequeno";
        btnHistorico.style.background = "#17a2b8";
        btnHistorico.style.marginTop = "5px";
        btnHistorico.onclick = () => abrirModalHistorico(aluno);
        btnCell.appendChild(btnHistorico);
    });
}

function adicionarRegistro(aluno, tipo, descricaoPadrao) {
    const descricao = prompt(`Descrição do ${tipo === "visto" ? "visto" : tipo === "advertencia" ? "advertência" : "suspensão"}:`, descricaoPadrao);
    if (!descricao) return;
    
    const vistosTurma = dadosVistos[turmaAtual].alunos;
    if (!vistosTurma[aluno]) {
        vistosTurma[aluno] = { total: 0, advertencias: 0, suspensoes: 0, registros: [], ultima: "" };
    }
    
    const agora = new Date().toISOString();
    const novoRegistro = { data: agora, tipo: tipo, descricao: descricao };
    vistosTurma[aluno].registros.push(novoRegistro);
    vistosTurma[aluno].ultima = agora;
    
    if (tipo === "visto") vistosTurma[aluno].total++;
    else if (tipo === "advertencia") vistosTurma[aluno].advertencias++;
    else if (tipo === "suspensao") vistosTurma[aluno].suspensoes++;
    
    salvarDados();
    renderizarVistos();
    alert(`✅ ${tipo === "visto" ? "Visto" : tipo === "advertencia" ? "Advertência" : "Suspensão"} registrada para ${aluno}!`);
}

// Modais
let alunoSelecionado = null;

function abrirModalComentario(aluno) {
    alunoSelecionado = aluno;
    document.getElementById("comentarioAlunoNome").innerHTML = `<strong>${aluno}</strong>`;
    
    const comentarios = dadosComentarios[turmaAtual][aluno] || { observacoes: "", historico: [] };
    document.getElementById("modalComentarioTexto").value = comentarios.observacoes || "";
    
    const historicoDiv = document.getElementById("historicoComentarios");
    historicoDiv.innerHTML = "";
    if (comentarios.historico && comentarios.historico.length > 0) {
        comentarios.historico.slice().reverse().forEach(com => {
            const div = document.createElement("div");
            div.className = "historico-item";
            div.innerHTML = `<div class="data">📅 ${new Date(com.data).toLocaleDateString('pt-BR')}</div>
                            <div class="descricao">${com.texto}</div>`;
            historicoDiv.appendChild(div);
        });
    } else {
        historicoDiv.innerHTML = "<p>Nenhuma observação registrada.</p>";
    }
    
    document.getElementById("modalComentario").style.display = "block";
}

function salvarComentario() {
    if (!alunoSelecionado) return;
    
    const texto = document.getElementById("modalComentarioTexto").value.trim();
    if (!texto) {
        alert("Digite uma observação!");
        return;
    }
    
    if (!dadosComentarios[turmaAtual][alunoSelecionado]) {
        dadosComentarios[turmaAtual][alunoSelecionado] = { observacoes: "", historico: [] };
    }
    
    dadosComentarios[turmaAtual][alunoSelecionado].observacoes = texto;
    dadosComentarios[turmaAtual][alunoSelecionado].historico.push({
        data: new Date().toISOString(),
        texto: texto
    });
    
    salvarDados();
    document.getElementById("modalComentario").style.display = "none";
    alert("✅ Observação salva!");
}

function abrirModalHistorico(aluno) {
    alunoSelecionado = aluno;
    document.getElementById("historicoAlunoNome").innerHTML = `<strong>${aluno}</strong>`;
    
    const vistos = dadosVistos[turmaAtual].alunos[aluno] || { registros: [] };
    const comentarios = dadosComentarios[turmaAtual][aluno] || { historico: [] };
    const notas = dadosNotas[turmaAtual][Object.keys(turmasConfig[turmaAtual].disciplinas[0])]?.[aluno] || {};
    
    let html = `<h4>📝 Notas</h4><ul>`;
    html += `<li>NM1: ${notas.nm1 || "-"}</li>`;
    html += `<li>NM2: ${notas.nm2 || "-"}</li>`;
    html += `<li>NM3: ${notas.nm3 || "-"}</li>`;
    html += `</ul><h4>⭐ Registros de Vistos/Punições</h4>`;
    
    if (vistos.registros && vistos.registros.length > 0) {
        vistos.registros.slice().reverse().forEach(reg => {
            const tipoIcone = reg.tipo === "visto" ? "⭐" : reg.tipo === "advertencia" ? "⚠️" : "🚫";
            html += `<div class="historico-item ${reg.tipo === 'advertencia' || reg.tipo === 'suspensao' ? 'punicao' : ''}">
                        <div class="data">📅 ${new Date(reg.data).toLocaleDateString('pt-BR')}</div>
                        <div class="descricao">${tipoIcone} ${reg.descricao}</div>
                    </div>`;
        });
    } else {
        html += "<p>Nenhum registro encontrado.</p>";
    }
    
    html += `<h4>📝 Observações do Professor</h4>`;
    if (comentarios.historico && comentarios.historico.length > 0) {
        comentarios.historico.slice().reverse().forEach(com => {
            html += `<div class="historico-item">
                        <div class="data">📅 ${new Date(com.data).toLocaleDateString('pt-BR')}</div>
                        <div class="descricao">${com.texto}</div>
                    </div>`;
        });
    } else {
        html += "<p>Nenhuma observação.</p>";
    }
    
    document.getElementById("historicoCompleto").innerHTML = html;
    document.getElementById("modalHistorico").style.display = "block";
}

function abrirModalArquivo(aluno) {
    alunoSelecionado = aluno;
    document.getElementById("arquivoAlunoNome").innerHTML = `<strong>${aluno}</strong>`;
    document.getElementById("descricaoArquivo").value = "";
    document.getElementById("arquivoUpload").value = "";
    
    const arquivos = dadosArquivos[turmaAtual][aluno] || [];
    const listaDiv = document.getElementById("listaArquivos");
    listaDiv.innerHTML = "";
    
    arquivos.forEach(arq => {
        const div = document.createElement("div");
        div.className = "arquivo-item";
        const tipoIcone = arq.tipo === "atividade" ? "📝" : arq.tipo === "prova" ? "📄" : arq.tipo === "aviso" ? "📢" : "📁";
        div.innerHTML = `
            <div>
                ${tipoIcone} <strong>${arq.descricao}</strong><br>
                <small>${new Date(arq.data).toLocaleDateString('pt-BR')}</small>
            </div>
            <button class="arquivo-remover" data-id="${arq.id}">🗑️</button>
        `;
        listaDiv.appendChild(div);
        
        div.querySelector(".arquivo-remover").onclick = () => {
            if (confirm("Remover este arquivo?")) {
                removerArquivo(turmaAtual, aluno, arq.id);
                abrirModalArquivo(aluno);
            }
        };
    });
    
    document.getElementById("modalArquivo").style.display = "block";
}

function salvarArquivoModal() {
    if (!alunoSelecionado) return;
    
    const tipo = document.getElementById("tipoArquivo").value;
    const descricao = document.getElementById("descricaoArquivo").value.trim();
    const arquivoInput = document.getElementById("arquivoUpload");
    
    if (!descricao) {
        alert("Digite uma descrição para o arquivo!");
        return;
    }
    
    if (arquivoInput.files && arquivoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (!dadosArquivos[turmaAtual]) dadosArquivos[turmaAtual] = {};
            if (!dadosArquivos[turmaAtual][alunoSelecionado]) dadosArquivos[turmaAtual][alunoSelecionado] = [];
            
            dadosArquivos[turmaAtual][alunoSelecionado].push({
                id: Date.now(),
                tipo: tipo,
                descricao: descricao,
                data: new Date().toISOString(),
                arquivo: e.target.result,
                nome: arquivoInput.files[0].name
            });
            salvarDados();
            abrirModalArquivo(alunoSelecionado);
            alert("✅ Arquivo anexado!");
        };
        reader.readAsDataURL(arquivoInput.files[0]);
    } else {
        alert("Selecione um arquivo para anexar!");
    }
}

// Relatórios
function renderizarRelatorios() {
    const turma = turmasConfig[turmaAtual];
    if (!turma || !turma.alunos) return;
    
    const disciplina = document.getElementById("disciplinaNotas")?.value || turma.disciplinas[0];
    const alunos = turma.alunos;
    
    let aprovados = 0, recuperacao = 0, reprovados = 0, semNotas = 0;
    let somaMedias = 0, alunosComNota = 0;
    const rankingNotas = [];
    
    alunos.forEach(aluno => {
        const notas = dadosNotas[turmaAtual][disciplina]?.[aluno] || {};
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        let media = (nm1 + nm2 + nm3) / 3;
        const exame = parseFloat(notas.exame) || 0;
        
        if (exame > 0) media = (media + exame) / 2;
        
        if (nm1 === 0 && nm2 === 0 && nm3 === 0) {
            semNotas++;
        } else {
            alunosComNota++;
            if (media >= 7) aprovados++;
            else if (media >= 5) recuperacao++;
            else reprovados++;
            somaMedias += media;
            rankingNotas.push({ aluno, media });
        }
    });
    
    rankingNotas.sort((a, b) => b.media - a.media);
    
    const mediaGeral = alunosComNota > 0 ? (somaMedias / alunosComNota).toFixed(1) : 0;
    document.getElementById("resumoNotas").innerHTML = `
        <ul>
            <li>📊 Média Geral: <strong>${mediaGeral}</strong></li>
            <li>✅ Aprovados: <strong style="color:#2e7d32">${aprovados}</strong></li>
            <li>⚠️ Recuperação: <strong style="color:#f57c00">${recuperacao}</strong></li>
            <li>❌ Reprovados: <strong style="color:#c62828">${reprovados}</strong></li>
            <li>📝 Sem notas: <strong>${semNotas}</strong></li>
        </ul>
        <h4>🏆 Top 5 Melhores Alunos</h4>
        <ul>
            ${rankingNotas.slice(0,5).map((r, i) => `<li>${i+1}º - ${r.aluno}: ${r.media.toFixed(1)}</li>`).join('')}
        </ul>
    `;
    
    let totalPresencas = 0, totalAulas = 0;
    const frequenciaAlunos = [];
    
    for (let key in dadosPresenca[turmaAtual]) {
        dadosPresenca[turmaAtual][key].forEach(aula => {
            totalAulas++;
            totalPresencas += Object.values(aula.presencas || {}).filter(v => v === true).length;
        });
    }
    
    alunos.forEach(aluno => {
        let aulasAluno = 0, presencasAluno = 0;
        for (let key in dadosPresenca[turmaAtual]) {
            dadosPresenca[turmaAtual][key].forEach(aula => {
                aulasAluno++;
                if (aula.presencas?.[aluno]) presencasAluno++;
            });
        }
        const perc = aulasAluno > 0 ? (presencasAluno / aulasAluno) * 100 : 0;
        frequenciaAlunos.push({ aluno, perc, presencasAluno, aulasAluno });
    });
    
    frequenciaAlunos.sort((a, b) => b.perc - a.perc);
    
    const frequenciaMedia = totalAulas > 0 ? ((totalPresencas / (totalAulas * alunos.length)) * 100).toFixed(1) : 0;
    document.getElementById("resumoFrequencia").innerHTML = `
        <ul>
            <li>📅 Total de Aulas: <strong>${totalAulas}</strong></li>
            <li>👥 Total de Presenças: <strong>${totalPresencas}</strong></li>
            <li>📈 Frequência Média: <strong>${frequenciaMedia}%</strong></li>
        </ul>
    `;
    
    const baixaFrequencia = frequenciaAlunos.filter(a => a.perc < 75 && a.aulasAluno > 0);
    const alertasDiv = document.getElementById("alertasFrequencia");
    if (baixaFrequencia.length > 0) {
        alertasDiv.innerHTML = `<h4>🚨 ALERTAS DE FREQUÊNCIA</h4>
            <ul>${baixaFrequencia.map(a => `<li>⚠️ ${a.aluno}: ${a.perc.toFixed(1)}% de frequência (${a.presencasAluno}/${a.aulasAluno} aulas)</li>`).join('')}</ul>`;
    } else {
        alertasDiv.innerHTML = "";
    }
    
    const vistosAlunos = [];
    alunos.forEach(aluno => {
        const v = dadosVistos[turmaAtual].alunos[aluno] || { total: 0, advertencias: 0, suspensoes: 0 };
        vistosAlunos.push({ aluno, total: v.total, advertencias: v.advertencias, suspensoes: v.suspensoes });
    });
    vistosAlunos.sort((a, b) => b.total - a.total);
    
    document.getElementById("alunosDestaque").innerHTML = `
        <ul>
            ${vistosAlunos.slice(0,5).map((v, i) => `<li>${i+1}º - ${v.aluno}: ${v.total} vistos</li>`).join('')}
        </ul>
    `;
    
    document.getElementById("rankingParticipacao").innerHTML = `
        <ul>
            ${vistosAlunos.map(v => `<li>${v.aluno}: ⭐${v.total} vistos | ⚠️${v.advertencias} advertências | 🚫${v.suspensoes} suspensões</li>`).join('')}
        </ul>
    `;
    
    const recuperacaoList = [];
    alunos.forEach(aluno => {
        const notas = dadosNotas[turmaAtual][disciplina]?.[aluno] || {};
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const media = (nm1 + nm2 + nm3) / 3;
        if (media >= 5 && media < 7) recuperacaoList.push({ aluno, media });
    });
    
    document.getElementById("alunosRecuperacao").innerHTML = recuperacaoList.length ? 
        `<ul>${recuperacaoList.map(r => `<li>⚠️ ${r.aluno} - Média: ${r.media.toFixed(1)}</li>`).join('')}</ul>` : 
        "<p>Nenhum aluno em recuperação</p>";
    
    document.getElementById("alunosBaixaFrequencia").innerHTML = baixaFrequencia.length ?
        `<ul>${baixaFrequencia.map(a => `<li>🚨 ${a.aluno}: ${a.perc.toFixed(1)}%</li>`).join('')}</ul>` :
        "<p>✅ Todos os alunos dentro do limite de frequência</p>";
}

function exportarRelatorioCompleto() {
    const turma = turmasConfig[turmaAtual];
    const disciplina = document.getElementById("disciplinaNotas")?.value || turma.disciplinas[0];
    const alunos = turma.alunos;
    
    const dadosExport = alunos.map(aluno => {
        const notas = dadosNotas[turmaAtual][disciplina]?.[aluno] || {};
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        let media = (nm1 + nm2 + nm3) / 3;
        const exame = parseFloat(notas.exame) || 0;
        if (exame > 0) media = (media + exame) / 2;
        
        let status = "Sem notas";
        if (nm1 !== 0 || nm2 !== 0 || nm3 !== 0) {
            if (exame > 0) status = media >= 5 ? "Aprovado por Exame" : "Reprovado por Exame";
            else status = media >= 7 ? "Aprovado" : (media >= 5 ? "Recuperação" : "Reprovado");
        }
        
        const v = dadosVistos[turmaAtual].alunos[aluno] || { total: 0, advertencias: 0, suspensoes: 0 };
        
        let totalAulas = 0, totalPresencas = 0;
        for (let key in dadosPresenca[turmaAtual]) {
            dadosPresenca[turmaAtual][key].forEach(aula => {
                totalAulas++;
                if (aula.presencas?.[aluno]) totalPresencas++;
            });
        }
        const frequencia = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : 0;
        
        return {
            "Aluno": aluno,
            "NM1": nm1 || "",
            "NM2": nm2 || "",
            "NM3": nm3 || "",
            "Média Final": media.toFixed(1),
            "Status": status,
            "Vistos": v.total,
            "Advertências": v.advertencias,
            "Suspensões": v.suspensoes,
            "Frequência (%)": frequencia
        };
    });
    
    const planilha = XLSX.utils.json_to_sheet(dadosExport);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, `Relatorio_${turma.nome}`);
    XLSX.writeFile(livro, `Relatorio_${turma.nome}_${new Date().toLocaleDateString()}.xlsx`);
    alert("✅ Relatório exportado!");
}

function exportarPDF() {
    const element = document.querySelector(".relatorios-grid");
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `Relatorio_${turmasConfig[turmaAtual].nome}_${new Date().toLocaleDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
    alert("✅ PDF gerado!");
}

// Trocar turma
async function trocarTurma(turmaId) {
    if (isLoading) return;
    turmaAtual = turmaId;
    
    document.querySelectorAll(".turma-btn").forEach(btn => {
        btn.classList.toggle("ativo", btn.dataset.turma === turmaId);
    });
    atualizarBotoesTurma();
    
    const turma = turmasConfig[turmaId];
    if (!turma) return;
    
    if (turma.alunos.length === 0) {
        isLoading = true;
        await carregarAlunos(turmaId);
        isLoading = false;
    }
    
    const tituloDiv = document.getElementById("turmaTitulo");
    tituloDiv.innerHTML = `<h1>📚 ${turma.nome}</h1>
        <button id="btnFavoritar" class="btn-favoritar">${turma.favorita ? "⭐ Favorita" : "☆ Favoritar"}</button>`;
    
    document.getElementById("btnFavoritar").onclick = () => {
        toggleFavoritar(turmaId);
        trocarTurma(turmaId);
    };
    
    const selectDisciplina = document.getElementById("disciplinaNotas");
    selectDisciplina.innerHTML = "";
    turma.disciplinas.forEach(disciplina => {
        const option = document.createElement("option");
        option.value = disciplina;
        option.textContent = disciplina;
        selectDisciplina.appendChild(option);
    });
    
    carregarDadosSalvos();
    renderizarNotas();
    renderizarPresenca();
    renderizarVistos();
    renderizarRelatorios();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    carregarPreferencias();
    
    const dataAulaInput = document.getElementById("dataAula");
    const hoje = new Date();
    dataAulaInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;
    
    await carregarTodosAlunos();
    carregarDadosSalvos();
    atualizarBotoesTurma();
    
    document.getElementById("btnTema").onclick = () => {
        document.body.classList.toggle("tema-escuro");
        const isEscuro = document.body.classList.contains("tema-escuro");
        localStorage.setItem("tema", isEscuro ? "escuro" : "claro");
        document.getElementById("btnTema").innerHTML = isEscuro ? "☀️ Tema Claro" : "🌙 Tema Escuro";
    };
    
    document.querySelectorAll(".turma-btn").forEach(btn => {
        btn.addEventListener("click", () => trocarTurma(btn.dataset.turma));
    });
    
    document.querySelectorAll(".aba-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".aba-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".aba-conteudo").forEach(c => c.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(`aba${btn.dataset.aba.charAt(0).toUpperCase() + btn.dataset.aba.slice(1)}`).classList.add("active");
            if (btn.dataset.aba === "relatorios") renderizarRelatorios();
        });
    });
    
    document.getElementById("disciplinaNotas").addEventListener("change", renderizarNotas);
    document.getElementById("salvarNotas").addEventListener("click", salvarNotas);
    document.getElementById("aplicarRecuperacao").addEventListener("click", aplicarRecuperacaoFinal);
    document.getElementById("exportarNotas").addEventListener("click", () => {
        const turma = turmasConfig[turmaAtual];
        const disciplina = document.getElementById("disciplinaNotas").value;
        const dados = turma.alunos.map(aluno => {
            const notas = dadosNotas[turmaAtual][disciplina]?.[aluno] || {};
            return { Aluno: aluno, NM1: notas.nm1 || "", NM2: notas.nm2 || "", NM3: notas.nm3 || "", Exame: notas.exame || "" };
        });
        const planilha = XLSX.utils.json_to_sheet(dados);
        const livro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(livro, planilha, "Notas");
        XLSX.writeFile(livro, `Notas_${turma.nome}.xlsx`);
    });
    
    document.getElementById("adicionarAula").addEventListener("click", adicionarAula);
    document.getElementById("salvarPresenca").addEventListener("click", () => { salvarDados(); alert("✅ Presenças salvas!"); });
    document.getElementById("exportarPresenca").addEventListener("click", exportarRelatorioCompleto);
    document.getElementById("verificarFaltas").addEventListener("click", verificarLimiteFaltas);
    
    document.getElementById("adicionarVisto").addEventListener("click", () => {
        const data = document.getElementById("dataVisto").value;
        const descricao = document.getElementById("descVisto").value.trim();
        const tipo = document.getElementById("tipoRegistro").value;
        if (!data) { alert("Selecione uma data!"); return; }
        if (!descricao) { alert("Digite uma descrição!"); return; }
        if (turmasConfig[turmaAtual].alunos.length === 0) return;
        const aluno = turmasConfig[turmaAtual].alunos[0];
        adicionarRegistro(aluno, tipo, descricao);
        document.getElementById("descVisto").value = "";
    });
    
    document.getElementById("salvarVistos").addEventListener("click", () => { salvarDados(); alert("✅ Dados salvos!"); });
    document.getElementById("exportarVistos").addEventListener("click", exportarRelatorioCompleto);
    document.getElementById("exportarRelatorioGeral").addEventListener("click", exportarRelatorioCompleto);
    document.getElementById("exportarPDF").addEventListener("click", exportarPDF);
    
    document.querySelectorAll(".modal-fechar").forEach(btn => {
        btn.onclick = () => {
            document.getElementById("modalComentario").style.display = "none";
            document.getElementById("modalHistorico").style.display = "none";
            document.getElementById("modalArquivo").style.display = "none";
        };
    });
    
    document.getElementById("modalSalvarComentario").onclick = salvarComentario;
    document.getElementById("modalSalvarArquivo").onclick = salvarArquivoModal;
    
    window.onclick = (event) => {
        if (event.target.classList.contains("modal")) {
            event.target.style.display = "none";
        }
    };
    
    document.getElementById("dataVisto").valueAsDate = new Date();
    await trocarTurma("1adm");
});