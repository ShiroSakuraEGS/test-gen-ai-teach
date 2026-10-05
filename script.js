document.addEventListener("DOMContentLoaded", () => {
  // 1. Matrix Code Rain 背景繪製
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const chars = "ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ108923457$#@%&*";
  const fontSize = 12;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);

  function drawMatrix() {
    ctx.fillStyle = "rgba(8, 8, 17, 0.1)"; // 漸隱背景以產生殘影
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fontSize = `${fontSize}px`;

    for (let i = 0; i < drops.length; i++) {
      // 隨機交替 Hyperpop Pink 與 Cyber Green
      ctx.fillStyle = Math.random() > 0.85 ? "#ff007f" : "#00ff9d";
      
      const text = chars.charAt(Math.floor(Math.random() * chars.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(drawMatrix, 40);

  // 2. 賽博即時時鐘
  const clockEl = document.getElementById("sys-clock");
  function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0] + ":" + Math.floor(now.getMilliseconds() / 100);
    if (clockEl) clockEl.textContent = timeStr;
  }
  setInterval(updateClock, 100);

  // 3. 點擊按鈕觸發畫面隨機 Glitch 閃爍效果
  const buttons = document.querySelectorAll(".cyber-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.body.style.filter = "invert(0.8) hue-rotate(90deg)";
      setTimeout(() => {
        document.body.style.filter = "none";
      }, 80);
    });
  });

  // 4. 終端機動態紀錄輸出
  const termLog = document.getElementById("terminal-log");
  const sysLogs = [
    "[NET] Connecting to decentralized node...",
    "[WARN] High saturation pulse detected.",
    "[MEM] Garbage collection completed.",
    "[STATUS] Hyperpop audio frequency active."
  ];

  setInterval(() => {
    if (termLog && sysLogs.length > 0) {
      const p = document.createElement("p");
      const randomLog = sysLogs[Math.floor(Math.random() * sysLogs.length)];
      p.textContent = `> ${randomLog}`;
      p.style.color = Math.random() > 0.5 ? "#00f0ff" : "#ffe600";
      
      // 保留最新 4 條 Log
      if (termLog.children.length > 4) {
        termLog.removeChild(termLog.children[2]);
      }
      termLog.appendChild(p);
    }
  }, 3500);
});