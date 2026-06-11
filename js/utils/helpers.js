// Mostrar notificação toast
export function mostrarNotificacao(mensagem, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${tipo}`;
    
    const icon = tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : tipo === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `${icon} ${mensagem}`;
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.style.maxWidth = '300px';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Formatar data
export function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
}

// Formatar data para input date
export function formatarDataInput(data) {
    const d = new Date(data);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Calcular média
export function calcularMedia(notas) {
    const nm1 = parseFloat(notas.nm1) || 0;
    const nm2 = parseFloat(notas.nm2) || 0;
    const nm3 = parseFloat(notas.nm3) || 0;
    return (nm1 + nm2 + nm3) / 3;
}

// Obter status baseado na média
export function obterStatus(media) {
    if (media >= 7) return { texto: 'Aprovado', classe: 'badge-aprovado' };
    if (media >= 5) return { texto: 'Recuperação', classe: 'badge-recuperacao' };
    if (media > 0) return { texto: 'Reprovado', classe: 'badge-reprovado' };
    return { texto: 'Sem notas', classe: 'badge-sem-notas' };
}

// Debounce para otimizar eventos
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Esconder loading
export function esconderLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 500);
    }
}