document.addEventListener("DOMContentLoaded", () => {
  const clockCard = document.getElementById("clockCard");
  const clockModal = new bootstrap.Modal(document.getElementById("clockModal"));

  clockCard.addEventListener("click", () => {
    clockModal.show();
  });

  // Atualiza o relógio com a hora do servidor
  async function updateServerTime() {
    try {
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      
      const seconds = serverTime.getSeconds();
      const minutes = serverTime.getMinutes();
      const hours = serverTime.getHours();

      const secondDeg = (seconds / 60) * 360;
      const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
      const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

      document.documentElement.style.setProperty('--sec', `${secondDeg}deg`);
      document.documentElement.style.setProperty('--min', `${minuteDeg}deg`);
      document.documentElement.style.setProperty('--hour', `${hourDeg}deg`);

      // Agenda próxima atualização para exatamente 1 segundo após o timestamp atual do servidor
      const nextUpdate = 1000 - (serverTime.getMilliseconds());
      setTimeout(updateServerTime, nextUpdate);
    } catch (error) {
      console.error('Error fetching server time:', error);
      // Em caso de erro, tenta novamente após 1 segundo
      setTimeout(updateServerTime, 1000);
    }
  }

  // Inicia a atualização do relógio
  updateServerTime();
});
