document.addEventListener("DOMContentLoaded", () => {
  const clockCard = document.getElementById("clockCard");
  const clockModal = new bootstrap.Modal(document.getElementById("clockModal"));
  let timeOffset = 0;

  clockCard.addEventListener("click", () => {
    clockModal.show();
  });

  // Sincroniza com o servidor de tempo
  async function syncTime() {
    try {
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      const localTime = new Date();
      timeOffset = serverTime.getTime() - localTime.getTime();
      console.log('Time synchronized with server');
    } catch (error) {
      console.error('Error syncing time:', error);
    }
  }

  // Atualiza ponteiros em tempo real
  function updateClocks() {
    const now = new Date(Date.now() + timeOffset);
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
    const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

    document.documentElement.style.setProperty('--sec', `${secondDeg}deg`);
    document.documentElement.style.setProperty('--min', `${minuteDeg}deg`);
    document.documentElement.style.setProperty('--hour', `${hourDeg}deg`);
  }

  // Sincroniza o tempo inicialmente e a cada 30 minutos
  syncTime();
  setInterval(syncTime, 30 * 60 * 1000);

  // Atualiza o relógio a cada segundo
  setInterval(updateClocks, 1000);
  updateClocks();
});
