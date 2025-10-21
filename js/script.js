// Controla relógio analógico SVG com ponteiros laranja
async function fetchTime() {
    try {
        const resp = await fetch('https://worldtimeapi.org/api/timezone/Europe/Lisbon');
        if (!resp.ok) throw new Error('Resposta não OK: ' + resp.status);
        const data = await resp.json();
        return new Date(data.datetime);
    } catch (e) {
        console.warn('Falha ao buscar tempo remoto, usando hora local:', e);
        return new Date();
    }
}

function setHands(date) {
    const hourEl = document.getElementById('hourHand');
    const minuteEl = document.getElementById('minuteHand');
    const secondEl = document.getElementById('secondHand');
    if (!hourEl || !minuteEl || !secondEl) return;

    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const millis = date.getMilliseconds ? date.getMilliseconds() : 0;

    // Cálculo de ângulos
    const hourAngle = (hours + minutes / 60) * 30; // 360/12 = 30
    const minuteAngle = (minutes + seconds / 60) * 6; // 360/60 = 6
    const secondAngle = (seconds + millis / 1000) * 6;

    hourEl.setAttribute('transform', `rotate(${hourAngle} 50 50)`);
    minuteEl.setAttribute('transform', `rotate(${minuteAngle} 50 50)`);
    secondEl.setAttribute('transform', `rotate(${secondAngle} 50 50)`);
}

let useRemote = true;

async function atualizarRelogio() {
    const date = await fetchTime();
    setHands(date);
}

// iniciar e atualizar a cada segundo (com microajuste visual)
window.addEventListener('load', async () => {
    await atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
});

