import { mostrarNotificacao } from './helpers.js';

export function exportarParaExcel(dados, nomeArquivo, nomeAba = 'Dados') {
    try {
        const planilha = XLSX.utils.json_to_sheet(dados);
        const livro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(livro, planilha, nomeAba);
        const dataStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        XLSX.writeFile(livro, `${nomeArquivo}_${dataStr}.xlsx`);
        mostrarNotificacao('✅ Exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro na exportação:', error);
        mostrarNotificacao('❌ Erro ao exportar!', 'error');
    }
}

export function exportarNotas(turma, dadosNotas, disciplina) {
    const dados = turma.alunos.map(aluno => {
        const notas = dadosNotas[disciplina]?.[aluno] || {};
        return {
            Aluno: aluno,
            '1º Trimestre': notas.nm1 || '',
            '2º Trimestre': notas.nm2 || '',
            '3º Trimestre': notas.nm3 || ''
        };
    });
    exportarParaExcel(dados, `Notas_${turma.nome}`, 'Notas');
}

export function exportarFrequencia(turma, dadosPresenca) {
    const dados = turma.alunos.map(aluno => {
        let totalAulas = 0;
        let totalPresencas = 0;
        
        for (let key in dadosPresenca) {
            dadosPresenca[key]?.forEach(aula => {
                totalAulas++;
                if (aula.presencas?.[aluno]) totalPresencas++;
            });
        }
        
        const percentual = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : 0;
        
        return {
            Aluno: aluno,
            'Total de Aulas': totalAulas,
            'Presenças': totalPresencas,
            'Faltas': totalAulas - totalPresencas,
            'Frequência (%)': percentual
        };
    });
    exportarParaExcel(dados, `Frequencia_${turma.nome}`, 'Frequência');
}

export function exportarVistos(turma, dadosVistos) {
    const dados = turma.alunos.map(aluno => {
        const vistos = dadosVistos.alunos?.[aluno] || { total: 0, registros: [] };
        return {
            Aluno: aluno,
            'Total de Vistos': vistos.total,
            'Última Participação': vistos.ultima ? new Date(vistos.ultima).toLocaleDateString('pt-BR') : '-'
        };
    });
    exportarParaExcel(dados, `Vistos_${turma.nome}`, 'Vistos');
}

export function exportarRelatorioCompleto(turma, dadosNotas, dadosPresenca, dadosVistos, disciplina) {
    const dados = turma.alunos.map(aluno => {
        const notas = dadosNotas[disciplina]?.[aluno] || {};
        const nm1 = parseFloat(notas.nm1) || 0;
        const nm2 = parseFloat(notas.nm2) || 0;
        const nm3 = parseFloat(notas.nm3) || 0;
        const mediaFinal = (nm1 + nm2 + nm3) / 3;
        
        let status = "Sem notas";
        if (nm1 !== 0 || nm2 !== 0 || nm3 !== 0) {
            status = mediaFinal >= 7 ? "Aprovado" : (mediaFinal >= 5 ? "Recuperação" : "Reprovado");
        }
        
        const vistos = dadosVistos.alunos?.[aluno]?.total || 0;
        
        let totalAulas = 0;
        let totalPresencas = 0;
        for (let key in dadosPresenca) {
            dadosPresenca[key]?.forEach(aula => {
                totalAulas++;
                if (aula.presencas?.[aluno]) totalPresencas++;
            });
        }
        const frequencia = totalAulas > 0 ? ((totalPresencas / totalAulas) * 100).toFixed(1) : 0;
        
        return {
            Aluno: aluno,
            '1º Trimestre': nm1 || '',
            '2º Trimestre': nm2 || '',
            '3º Trimestre': nm3 || '',
            'Média Final': mediaFinal.toFixed(1),
            Status: status,
            'Vistos': vistos,
            'Frequência (%)': frequencia
        };
    });
    exportarParaExcel(dados, `Relatorio_${turma.nome}`, 'Relatório Completo');
}