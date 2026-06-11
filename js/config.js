// Configuração centralizada das turmas
export const TURMAS_CONFIG = {
    "1adm": { 
        nome: "1º Administração", 
        disciplinas: ["Inteligência Artificial"],
        arquivoAlunos: "alunos_1_adm.json"
    },
    "1amb": { 
        nome: "1º Controle Ambiental", 
        disciplinas: ["Inteligência Artificial"],
        arquivoAlunos: "alunos_1_ambiental.json"
    },
    "2ds": { 
        nome: "2º Desenvolvimento de Sistemas", 
        disciplinas: [
            "Inteligência Artificial", 
            "MENTORIAS TEC II", 
            "FUNDAMENTOS DE UI / UX OU IHC",
            "PENSAMENTO COMPUTACIONAL II", 
            "PROGRAMAÇÃO ESTRUTURADA", 
            "PROGRAMAÇÃO ORIENTADA À OBJETOS - POO",
            "PROGRAMAÇÃO PARA DISPOSITIVOS MÓVEIS", 
            "PROGRAMAÇÃO WEB FRONT-END", 
            "ARQUITETURA DE MICROSSERVIÇOS",
            "INTRODUÇÃO AO ECOSSISTEMA DEVops", 
            "MANUTENÇÃO DE SISTEMAS"
        ],
        arquivoAlunos: "alunos_2_desenvolvimento.json"
    },
    "inf1": { 
        nome: "Informática - Módulo I", 
        disciplinas: ["Análise e Lógica de Programação"],
        arquivoAlunos: "alunos_informatica_mod1.json"
    },
    "inf5": { 
        nome: "Informática - Módulo V", 
        disciplinas: ["Empreendedorismo para TI"],
        arquivoAlunos: "alunos_informatica_mod5.json"
    }
};

export const STORAGE_KEY = "sistemaAcademico";
export const VERSION = "2.0.0";

// Estado global inicial
export let estadoGlobal = {
    turmaAtual: "1adm",
    turmas: {},
    isLoading: false
};

export function setEstadoGlobal(novoEstado) {
    estadoGlobal = { ...estadoGlobal, ...novoEstado };
}