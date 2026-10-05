document.addEventListener('DOMContentLoaded', () => {
  const CSV_PATH = 'assets/AI_Avatar_Search_History_Sheet - 工作表1.csv';
  let newsData = [];
  let countdown = 10;
  let timerInterval = null;

  const container = document.getElementById('news-container');
  const timerEl = document.getElementById('countdown-timer');
  const clockEl = document.getElementById('clock-display');
  const tickerEl = document.getElementById('ticker-content');
  const refreshBtn = document.getElementById('manual-refresh-btn');

  // 1. 時鐘更新
  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0];
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. CSV 解析器
  function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    
    // 解析 CSV，處理雙引號包覆與換行情況
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // 使用正規表達式拆分欄位
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

      if (cols.length >= 3) {
        const date = cols[0] ? cols[0].replace(/"/g, '').trim() : 'N/A';
        const category = cols[1] ? cols[1].replace(/"/g, '').trim() : 'NEWS';
        const title = cols[2] ? cols[2].replace(/"/g, '').trim() : '';
        const url = cols[3] ? cols[3].replace(/"/g, '').trim() : '#';
        const summary = cols[4] ? cols[4].replace(/"/g, '').trim() : '無詳細內容';

        if (title) {
          result.push({ date, category, title, url, summary });
        }
      }
    }
    return result;
  }

  // 3. 隨機選取 3 則新聞並渲染
  function renderRandomNews() {
    if (newsData.length === 0) return;

    // 複製並隨機排序
    const shuffled = [...newsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // 更新跑馬燈
    tickerEl.textContent = selected.map(item => `[${item.category}] ${item.title}`).join(' /// ');

    // 渲染新聞卡片
    container.innerHTML = '';
    selected.forEach(item => {
      const card = document.createElement('article');
      card.className = 'news-card card-glitch-anim';

      card.innerHTML = `
        <div class="news-tag-row">
          <span class="news-category">${escapeHtml(item.category)}</span>
          <span class="news-date">${escapeHtml(item.date)}</span>
        </div>
        <h3 class="news-title">${escapeHtml(item.title)}</h3>
        <div class="news-summary">${escapeHtml(item.summary)}</div>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="news-link">READ_FULL_SOURCE ↗</a>
      `;

      container.appendChild(card);
    });

    // 重置倒數計時器
    countdown = 10;
    timerEl.textContent = `${countdown}s`;
  }

  // 防 XSS 轉義
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, match => {
      const escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escape[match];
    });
  }

  // 4. 倒數計時器控制
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      countdown--;
      timerEl.textContent = `${countdown}s`;
      if (countdown <= 0) {
        renderRandomNews();
      }
    }, 1000);
  }

  // 5. 載入 CSV 數據
  async function loadCSVData() {
    try {
      const response = await fetch(CSV_PATH);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      newsData = parseCSV(text);

      if (newsData.length > 0) {
        renderRandomNews();
        startTimer();
      } else {
        container.innerHTML = `<div class="loading-card">NO DATA FOUND IN CSV</div>`;
      }
    } catch (err) {
      console.error('Error fetching CSV:', err);
      container.innerHTML = `<div class="loading-card">ERROR LOADING CSV: ${err.message}</div>`;
    }
  }

  // 手動 Override 按鈕
  refreshBtn.addEventListener('click', () => {
    renderRandomNews();
  });

  // 初始化啟動
  loadCSVData();
});
