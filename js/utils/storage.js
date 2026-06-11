import { STORAGE_KEY } from '../config.js';
import { mostrarNotificacao } from './helpers.js';

// Dados globais
let dadosNotas = {};
let dadosPresenca = {};
let dadosVistos = {};

export function salvarDados() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            notas: dadosNotas,
            presenca: dadosPresenca,
            vistos: dadosVistos,
            versao: "2.0"
        }));
        return true;
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        mostrarNotificacao("Erro ao salvar dados!", "error");
        return false;
    }
}

export function carregarDados() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            dadosNotas = data.notas || {};
            dadosPresenca = data.presenca || {};
            dadosVistos = data.vistos || {};
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
            mostrarNotificacao("Erro ao carregar dados salvos!", "error");
        }
    }
    return { dadosNotas, dadosPresenca, dadosVistos };
}

export function inicializarEstruturaTurma(turmaId, turma, alunos, disciplinas) {
    if (!dadosNotas[turmaId]) dadosNotas[turmaId] = {};
    if (!dadosPresenca[turmaId]) dadosPresenca[turmaId] = {};
    if (!dadosVistos[turmaId]) dadosVistos[turmaId] = {};
    
    if (alunos && alunos.length > 0) {
        disciplinas.forEach(disciplina => {
            if (!dadosNotas[turmaId][disciplina]) {
                dadosNotas[turmaId][disciplina] = {};
                alunos.forEach(aluno => {
                    dadosNotas[turmaId][disciplina][aluno] = { nm1: "", nm2: "", nm3: "" };
                });
            }
        });
        
        if (!dadosVistos[turmaId].alunos) {
            dadosVistos[turmaId].alunos = {};
            alunos.forEach(aluno => {
                dadosVistos[turmaId].alunos[aluno] = { total: 0, registros: [], ultima: "" };
            });
        }
    }
    
    salvarDados();
}

// Getters e Setters
export function getDadosNotas() { return dadosNotas; }
export function getDadosPresenca() { return dadosPresenca; }
export function getDadosVistos() { return dadosVistos; }
export function setDadosNotas(value) { dadosNotas = value; }
export function setDadosPresenca(value) { dadosPresenca = value; }
export function setDadosVistos(value) { dadosVistos = value; }

// Backup automático
export function fazerBackup() {
    const backup = {
        data: new Date().toISOString(),
        notas: dadosNotas,
        presenca: dadosPresenca,
        vistos: dadosVistos
    };
    
    try {
        localStorage.setItem("sistemaAcademico_backup", JSON.stringify(backup));
        console.log("✅ Backup automático realizado");
    } catch (error) {
        console.error("❌ Erro no backup:", error);
    }
}

// Iniciar backup periódico (a cada 5 minutos)
export function iniciarBackupAutomatico() {
    setInterval(() => fazerBackup(), 300000);
}