async function atualizarRelogio() {
    const el = document.getElementById('relogio');
    if (!el) return; // evita erros se o elemento não existir
    try {
        const resposta = await fetch('https://worldtimeapi.org/api/timezone/Europe/Lisbon');
        if (!resposta.ok) throw new Error('Resposta não OK: ' + resposta.status);
        const dados = await resposta.json();
        const dataHora = new Date(dados.datetime);
        el.textContent = dataHora.toLocaleTimeString('pt-PT');
    } catch (e) {
        console.error('Erro ao obter hora remota:', e);
        // fallback para hora local do cliente
        el.textContent = new Date().toLocaleTimeString('pt-PT') + ' (hora local)';
    }
}

setInterval(atualizarRelogio, 1000);
window.addEventListener('load', atualizarRelogio);

// Export nothing; this file is intended to run in the browser.
