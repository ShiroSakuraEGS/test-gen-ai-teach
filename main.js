document.addEventListener('DOMContentLoaded', () => {
  // 對含有中文與空格的路徑進行 encodeURI
  const CSV_PATH = encodeURI('assets/AI_Avatar_Search_History_Sheet - 工作表1.csv');
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

  /**
   * 2. 健壯的 CSV 解析器（支援跨行雙引號與欄位含逗號）
   */
  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // 跳過轉義雙引號
        } else {
          inQuotes = !inQuotes; // 切換引號狀態
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // 處理 \r\n
        }
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || currentRow[0] !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
    }

    // 將二維陣列轉為物件陣列（跳過標頭列）
    const parsedData = [];
    for (let k = 1; k < rows.length; k++) {
      const row = rows[k];
      if (row.length >= 3 && row[2]) { // 確保至少有 Title
        parsedData.push({
          date: row[0] || 'N/A',
          category: row[1] || 'NEWS',
          title: row[2] || '',
          url: row[3] || '#',
          summary: row[4] || '無詳細摘要'
        });
      }
    }
    return parsedData;
  }

  // 3. 隨機選取 3 則新聞 Title 與內容並渲染
  function renderRandomNews() {
    if (newsData.length === 0) return;

    // 隨機抽樣 3 則不重複新聞
    const shuffled = [...newsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(3, newsData.length));

    // 更新跑馬燈
    tickerEl.textContent = selected.map(item => `[${item.category}] ${item.title}`).join(' /// ');

    // 渲染新聞卡片
    container.innerHTML = '';
    selected.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'news-card card-glitch-anim';

      card.innerHTML = `
        <div class="news-tag-row">
          <span class="news-category">${escapeHtml(item.category)}</span>
          <span class="news-date">TOPIC #${index + 1} // ${escapeHtml(item.date)}</span>
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
    if (!str) return '';
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

  // 4. 倒數計時器控制 (10 秒循環)
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
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 找不到檔案或路徑錯誤 (${CSV_PATH})`);
      }
      const text = await response.text();
      newsData = parseCSV(text);

      if (newsData.length > 0) {
        renderRandomNews();
        startTimer();
      } else {
        container.innerHTML = `<div class="loading-card">⚠️ 檔案已讀取，但未解析出有效新聞數據</div>`;
      }
    } catch (err) {
      console.error('Error fetching CSV:', err);
      container.innerHTML = `
        <div class="loading-card" style="color: var(--primary-pink); border-color: var(--primary-pink);">
          ❌ CSV 讀取失敗: ${escapeHtml(err.message)}<br><br>
          <small style="color: #aaa;">提示：請確認專案根目錄下是否有 <b>assets/AI_Avatar_Search_History_Sheet - 工作表1.csv</b> 檔案，且檔名大小寫完全一致。</small>
        </div>
      `;
    }
  }

  // 手動 Refresh 按鈕
  refreshBtn.addEventListener('click', () => {
    renderRandomNews();
  });

  // 啟動
  loadCSVData();
});
