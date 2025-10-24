document.addEventListener("DOMContentLoaded", () => {
  const clockCard = document.getElementById("clockCard");
  const clockModal = new bootstrap.Modal(document.getElementById("clockModal"));

  clockCard.addEventListener("click", () => {
    clockModal.show();
  });

  let offset = 0;

  // Obter hora do servidor (Portugal)
  async function syncServerTime() {
    try {
      const response = await fetch("https://worldtimeapi.org/api/timezone/Europe/Lisbon");
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      offset = serverTime.getTime() - Date.now(); // diferença entre servidor e hora local
      console.log("Sincronizado com servidor NTP (Portugal).");
    } catch (error) {
      console.error("Erro ao sincronizar com o servidor de tempo:", error);
    }
  }

  // Atualiza ponteiros conforme a hora sincronizada
  function updateClock() {
    const now = new Date(Date.now() + offset);

    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDeg = (seconds / 60) * 360;
    const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
    const hourDeg = ((hours % 12 + minutes / 60) / 12) * 360;

    document.documentElement.style.setProperty("--sec", `${secondDeg}deg`);
    document.documentElement.style.setProperty("--min", `${minuteDeg}deg`);
    document.documentElement.style.setProperty("--hour", `${hourDeg}deg`);
  }

  // Atualiza a cada segundo
  setInterval(updateClock, 1000);
  // Sincroniza com servidor a cada 5 minutos
  syncServerTime();
  setInterval(syncServerTime, 5 * 60 * 1000);
});

const pomodoroDisplay = document.getElementById("pomodoro-timer");
  const startBtn = document.getElementById("startPomodoro");
  const pauseBtn = document.getElementById("pausePomodoro");
  const resetBtn = document.getElementById("resetPomodoro");

  let pomodoroDuration = 25 * 60; // 25 minutos
  let remainingTime = pomodoroDuration;
  let timer = null;
  let running = false;

  function updatePomodoroDisplay() {
    const minutes = Math.floor(remainingTime / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingTime % 60).toString().padStart(2, "0");
    pomodoroDisplay.textContent = `${minutes}:${seconds}`;
  }

  function startPomodoro() {
    if (running) return;
    running = true;
    timer = setInterval(() => {
      remainingTime--;
      updatePomodoroDisplay();

      if (remainingTime <= 0) {
        clearInterval(timer);
        running = false;
        new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play();
        alert("Sessão de foco concluída! Faz uma pausa. ☕");
        remainingTime = pomodoroDuration;
        updatePomodoroDisplay();
      }
    }, 1000);
  }

  function pausePomodoro() {
    if (!running) return;
    running = false;
    clearInterval(timer);
  }

  function resetPomodoro() {
    clearInterval(timer);
    running = false;
    remainingTime = pomodoroDuration;
    updatePomodoroDisplay();
  }

  startBtn.addEventListener("click", startPomodoro);
  pauseBtn.addEventListener("click", pausePomodoro);
  resetBtn.addEventListener("click", resetPomodoro);

  updatePomodoroDisplay();