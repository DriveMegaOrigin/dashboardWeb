document.addEventListener("DOMContentLoaded", () => {
  const clockCard = document.getElementById("clockCard");
  const clockModal = new bootstrap.Modal(document.getElementById("clockModal"));

  if (clockCard) {
    clockCard.addEventListener("click", () => {
      clockModal.show();
    });
  }

  let offset = 0;

  // Obter hora do servidor (Portugal)
  async function syncServerTime() {
    try {
      const response = await fetch("https://worldtimeapi.org/api/timezone/Europe/Lisbon");
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      offset = serverTime.getTime() - Date.now(); // diferença entre servidor e hora local
      console.log("Sincronizado com servidor NTP (Portugal). Offset:", offset);
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

  // ---------- POMODORO INTELIGENTE ----------
  const studyInput = document.getElementById("studyTime");
  const planBtn = document.getElementById("planPomodoro");
  const planOutput = document.getElementById("pomodoroPlan");
  const timerDisplay = document.getElementById("pomodoro-timer");
  const startBtn = document.getElementById("startPomodoro");
  const pauseBtn = document.getElementById("pausePomodoro");
  const resetBtn = document.getElementById("resetPomodoro");

  // Defensive checks
  if (!timerDisplay) {
    console.warn("Pomodoro elements not found in DOM. Skipping pomodoro setup.");
  } else {
    let totalMinutes = 0;
    let focusDuration = 25 * 60; // padrão 25 min foco
    let breakDuration = 5 * 60;  // padrão 5 min pausa
    let totalCycles = 0;
    let currentCycle = 1;
    let isBreak = false;
    let remaining = 0;
    let timer = null;
    let running = false;
    let endTime = null;

    // Planeia automaticamente os ciclos
    if (planBtn) {
      planBtn.addEventListener("click", () => {
        totalMinutes = parseInt(studyInput?.value);
        if (isNaN(totalMinutes) || totalMinutes <= 0) {
          if (planOutput) planOutput.textContent = "⚠️ Introduz um valor válido em minutos.";
          return;
        }

        const cycleMinutes = (focusDuration + breakDuration) / 60;
        totalCycles = Math.max(1, Math.floor(totalMinutes / cycleMinutes));

        const totalEffective = totalCycles * cycleMinutes;
        const now = new Date();
        endTime = new Date(now.getTime() + totalEffective * 60000);

        if (planOutput) {
          planOutput.innerHTML = `\n            <strong>${totalCycles}</strong> Pomodoros de 25 min + 5 min pausa.<br>\n            Duração total: <strong>${totalEffective.toFixed(1)} min</strong><br>\n            Término estimado: <strong>${endTime.toLocaleTimeString("pt-PT", {hour: '2-digit', minute: '2-digit'})}</strong>\n          `;
        }

        // Reset any running timer and state, then start immediately
        clearInterval(timer);
        running = false;
        currentCycle = 1;
        isBreak = false;
        remaining = focusDuration;
        updateTimerDisplay();

        // Start counting immediately after planning
        startPomodoro();
      });
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
      const seconds = (remaining % 60).toString().padStart(2, "0");
      timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function startPomodoro() {
      if (running || totalCycles === 0) return;
      running = true;

      timer = setInterval(() => {
        remaining--;
        updateTimerDisplay();

        if (remaining <= 0) {
          clearInterval(timer);
          running = false;

          if (!isBreak) {
            try { new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play(); } catch(e){}
            if (currentCycle < totalCycles) {
              isBreak = true;
              remaining = breakDuration;
              if (planOutput) planOutput.innerHTML = `☕ Pausa curta — ciclo ${currentCycle} concluído.`;
              startPomodoro();
            } else {
              if (planOutput) planOutput.innerHTML = `✅ Sessão concluída! Bom trabalho!`;
            }
          } else {
            isBreak = false;
            currentCycle++;
            remaining = focusDuration;
            if (currentCycle <= totalCycles) {
              if (planOutput) planOutput.innerHTML = `🎯 Início do ciclo ${currentCycle}`;
              startPomodoro();
            }
          }
        }
      }, 1000);
    }

    function pausePomodoro() {
      if (!running) return;
      clearInterval(timer);
      running = false;
    }

    function resetPomodoro() {
      clearInterval(timer);
      running = false;
      currentCycle = 1;
      isBreak = false;
      remaining = focusDuration;
      updateTimerDisplay();
      if (planOutput) planOutput.textContent = "Sessão reiniciada.";
    }

    if (startBtn) startBtn.addEventListener("click", startPomodoro);
    if (pauseBtn) pauseBtn.addEventListener("click", pausePomodoro);
    if (resetBtn) resetBtn.addEventListener("click", resetPomodoro);

    // Inicializa display
    remaining = focusDuration;
    updateTimerDisplay();
  }

    // ---------- WEATHER (Meteorologia) - usando OpenWeather (integração solicitada) ----------
    const weatherLocation = document.getElementById("weather-location");
    const weatherTemp = document.getElementById("weather-temp");
    const weatherDesc = document.getElementById("weather-desc");
    const weatherIcon = document.getElementById("weather-icon");

    // Config (conforme pedido) - NOTA: a chave foi fornecida pelo utilizador
    const apiKey = "9f8100f56ad055f87711bf910f17287c";
    const city = "Leiria,PT";

    async function fetchWeatherOpenWeather() {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pt&appid=${apiKey}`
        );
        if (!response.ok) throw new Error(`OpenWeather response ${response.status}`);
        const data = await response.json();

        if (weatherLocation) weatherLocation.textContent = data.name || 'Leiria';
        if (weatherTemp) weatherTemp.textContent = `${Math.round(data.main.temp)}°C`;
        if (weatherDesc) weatherDesc.textContent = data.weather?.[0]?.description || '';
        if (weatherIcon) {
          const icon = data.weather?.[0]?.icon;
          if (icon) {
            weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            weatherIcon.alt = data.weather?.[0]?.description || 'Ícone';
            weatherIcon.style.display = '';
          } else {
            weatherIcon.style.display = 'none';
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados do tempo:', err);
        if (weatherDesc) weatherDesc.textContent = 'Não foi possível obter o tempo.';
      }
    }

    // Fetch now and every 3 hours
    fetchWeatherOpenWeather();
    setInterval(fetchWeatherOpenWeather, 3 * 60 * 60 * 1000);
});