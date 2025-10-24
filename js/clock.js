document.addEventListener("DOMContentLoaded", () => {
  const clockCard = document.getElementById("clockCard");
  const clockModal = new bootstrap.Modal(document.getElementById("clockModal"));

  clockCard.addEventListener("click", () => {
    clockModal.show();
  });

  // Atualiza ponteiros em tempo real
  function updateClocks() {
    const now = new Date();
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

  setInterval(updateClocks, 1000);
  updateClocks();
});
