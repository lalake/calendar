(() => {
      const DAY_MS = 24 * 60 * 60 * 1000;
      const STORAGE_KEY = "shift-calendar-config-v1";
      const SHIFT_OPTIONS = ["晚班", "中班", "早班", "休息"];
      const DEFAULT_START_DATE = "2026-03-25";
      const SHIFT_HINTS = {
        "早班": "上午值班",
        "中班": "白天中段",
        "晚班": "夜间值班",
        "休息": "当日休息"
      };
      const LUNAR_INFO = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
        0x0d520
      ];
      const LUNAR_MONTH_NAMES = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
      const LUNAR_DAY_NAMES = [
        "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
        "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
        "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
      ];
      const WEEKDAY_NAMES = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const LUNAR_INTL_FORMATTER = createLunarIntlFormatter();
      const desktopQuery = window.matchMedia("(min-width: 768px)");

      const today = atNoon(new Date());
      const state = {
        viewDate: today,
        config: loadConfig(),
        draftSequence: []
      };

      const monthLabel = document.getElementById("monthLabel");
      const subTitle = document.getElementById("subTitle");
      const prevMonthButton = document.getElementById("prevMonthButton");
      const todayButton = document.getElementById("todayButton");
      const nextMonthButton = document.getElementById("nextMonthButton");
      const weekRangeLabel = document.getElementById("weekRangeLabel");
      const weekStrip = document.getElementById("weekStrip");
      const upcomingList = document.getElementById("upcomingList");
      const calendarGrid = document.getElementById("calendarGrid");
      const configOverlay = document.getElementById("configOverlay");
      const configForm = document.getElementById("configForm");
      const startDateInput = document.getElementById("startDateInput");
      const sequenceList = document.getElementById("sequenceList");
      const toast = document.getElementById("toast");

      prevMonthButton.addEventListener("click", () => {
        if (isDesktopLayout()) {
          state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1, 12);
        } else {
          state.viewDate = addDays(state.viewDate, -7);
        }
        render();
      });

      nextMonthButton.addEventListener("click", () => {
        if (isDesktopLayout()) {
          state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1, 12);
        } else {
          state.viewDate = addDays(state.viewDate, 7);
        }
        render();
      });

      todayButton.addEventListener("click", () => {
        state.viewDate = today;
        render();
      });

      document.getElementById("openConfigButton").addEventListener("click", openConfig);
      document.getElementById("closeConfigButton").addEventListener("click", closeConfig);
      document.getElementById("resetSequenceButton").addEventListener("click", () => {
        state.draftSequence = [...SHIFT_OPTIONS];
        renderSequenceList();
      });

      document.getElementById("resetConfigButton").addEventListener("click", () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
        }
        state.config = createDefaultConfig();
        closeConfig();
        render();
        showToast("已恢复默认配置");
      });

      configOverlay.addEventListener("click", (event) => {
        if (event.target === configOverlay) {
          closeConfig();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && configOverlay.classList.contains("open")) {
          closeConfig();
        }
      });

      sequenceList.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-move]");
        if (!button) {
          return;
        }
        const index = Number(button.dataset.index);
        const delta = Number(button.dataset.move);
        moveSequence(index, delta);
      });

      weekStrip.addEventListener("click", handleDateSelection);
      upcomingList.addEventListener("click", handleDateSelection);

      if (desktopQuery.addEventListener) {
        desktopQuery.addEventListener("change", render);
      } else if (desktopQuery.addListener) {
        desktopQuery.addListener(render);
      }

      configForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const startDate = startDateInput.value;
        if (!isValidDateValue(startDate)) {
          showToast("请先选择有效的起始日期");
          return;
        }
        state.config = {
          startDate,
          sequence: [...state.draftSequence]
        };
        persistConfig(state.config);
        closeConfig();
        render();
        showToast("配置已保存");
      });

      function render() {
        renderHeader();
        renderNavigation();
        renderCalendar();
        renderMobileViews();
      }

      function renderHeader() {
        const todayShift = getShiftForDate(today, state.config);
        if (isDesktopLayout()) {
          const year = state.viewDate.getFullYear();
          const month = state.viewDate.getMonth() + 1;
          monthLabel.textContent = `${year}年${month}月`;
          subTitle.textContent = `今天 ${formatSolarDate(today)} · ${todayShift}`;
          return;
        }

        const focusShift = getShiftForDate(state.viewDate, state.config);
        const weekStart = getWeekStart(state.viewDate);
        const weekEnd = addDays(weekStart, 6);
        monthLabel.textContent = formatFocusLabel(state.viewDate);
        subTitle.textContent = `${isSameDate(state.viewDate, today) ? "今天" : "聚焦"} ${focusShift} · ${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}`;
      }

      function renderNavigation() {
        if (isDesktopLayout()) {
          prevMonthButton.textContent = "上个月";
          todayButton.textContent = "回到今天";
          nextMonthButton.textContent = "下个月";
          prevMonthButton.setAttribute("aria-label", "查看上个月");
          todayButton.setAttribute("aria-label", "回到今天所在月份");
          nextMonthButton.setAttribute("aria-label", "查看下个月");
          return;
        }

        prevMonthButton.textContent = "上一周";
        todayButton.textContent = "本周";
        nextMonthButton.textContent = "下一周";
        prevMonthButton.setAttribute("aria-label", "查看上一周");
        todayButton.setAttribute("aria-label", "回到本周");
        nextMonthButton.setAttribute("aria-label", "查看下一周");
      }

      function renderCalendar() {
        const year = state.viewDate.getFullYear();
        const month = state.viewDate.getMonth();
        const firstDay = new Date(year, month, 1, 12);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const leadingDays = (firstDay.getDay() + 6) % 7;
        const total = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
        const gridStart = new Date(year, month, 1 - leadingDays, 12);

        const cells = [];
        for (let index = 0; index < total; index += 1) {
          const current = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index, 12);
          const lunar = solarToLunar(current);
          const shift = getShiftForDate(current, state.config);
          const isCurrentMonth = current.getMonth() === month;
          const isToday = isSameDate(current, today);
          const lunarText = lunar ? formatLunarLabel(lunar) : "";
          const classNames = [
            "day-card",
            isCurrentMonth ? "current-month" : "other-month",
            isToday ? "today" : ""
          ].filter(Boolean).join(" ");

          cells.push(`
            <article class="${classNames}" title="${buildTitle(current, lunar, shift)}">
              ${isToday ? '<span class="day-today-marker" aria-hidden="true">今</span>' : ""}
              <div class="day-top">
                <div class="day-number">${current.getDate()}</div>
              </div>
              <div class="lunar-text">${lunarText}</div>
              <div class="shift-badge shift-${shift}">${shift}</div>
            </article>
          `);
        }

        calendarGrid.innerHTML = cells.join("");
      }

      function renderMobileViews() {
        const weekStart = getWeekStart(state.viewDate);
        const weekEnd = addDays(weekStart, 6);
        weekRangeLabel.textContent = `${formatMonthDay(weekStart)} - ${formatMonthDay(weekEnd)}`;

        const weekCells = [];
        for (let offset = 0; offset < 7; offset += 1) {
          const current = addDays(weekStart, offset);
          const lunar = solarToLunar(current);
          const shift = getShiftForDate(current, state.config);
          const lunarText = lunar ? formatLunarLabel(lunar) : "";
          const isTodayCard = isSameDate(current, today);
          const classNames = [
            "week-card",
            isTodayCard ? "today" : "",
            isSameDate(current, state.viewDate) ? "selected" : ""
          ].filter(Boolean).join(" ");
          const currentDayAttribute = isTodayCard ? ' aria-current="date"' : "";

          weekCells.push(`
            <button class="${classNames}" type="button" data-date="${formatDateValue(current)}" title="${buildTitle(current, lunar, shift)}"${currentDayAttribute}>
              ${isTodayCard ? '<span class="week-today-marker" aria-hidden="true">今</span>' : ""}
              <div class="week-card-top">
                <div class="week-card-weekday">${WEEKDAY_NAMES[current.getDay()]}</div>
                <div class="week-card-date-row">
                  <div class="week-card-date">${current.getDate()}</div>
                </div>
              </div>
              <div class="week-card-lunar">${lunarText}</div>
              <div class="week-shift-badge shift-${shift}">${shift}</div>
            </button>
          `);
        }
        weekStrip.innerHTML = weekCells.join("");

        const upcomingItems = [];
        for (let offset = 0; offset < 14; offset += 1) {
          const current = addDays(state.viewDate, offset);
          const lunar = solarToLunar(current);
          const shift = getShiftForDate(current, state.config);
          const lunarText = lunar ? `农历 ${formatLunarLabel(lunar)}` : "农历信息";
          const classNames = [
            "upcoming-item",
            isSameDate(current, today) ? "today" : "",
            isSameDate(current, state.viewDate) ? "selected" : ""
          ].filter(Boolean).join(" ");

          upcomingItems.push(`
            <button class="${classNames}" type="button" data-date="${formatDateValue(current)}" title="${buildTitle(current, lunar, shift)}">
              <div class="upcoming-date">
                <div class="upcoming-day">${String(current.getDate()).padStart(2, "0")}</div>
                <div class="upcoming-weekday">${WEEKDAY_NAMES[current.getDay()]}</div>
              </div>
              <div class="upcoming-main">
                <div class="upcoming-line">
                  <span class="upcoming-solar">${formatMonthDay(current)}</span>
                  ${isSameDate(current, today) ? '<span class="today-tag">今天</span>' : ""}
                  ${isSameDate(current, state.viewDate) && !isSameDate(current, today) ? '<span class="cycle-chip">聚焦</span>' : ""}
                </div>
                <div class="upcoming-meta">${lunarText} · ${SHIFT_HINTS[shift]}</div>
              </div>
              <div class="upcoming-side">
                <span class="shift-badge shift-${shift}">${shift}</span>
              </div>
            </button>
          `);
        }
        upcomingList.innerHTML = upcomingItems.join("");
      }

      function openConfig() {
        state.draftSequence = [...state.config.sequence];
        startDateInput.value = state.config.startDate;
        renderSequenceList();
        document.body.classList.add("modal-open");
        configOverlay.classList.add("open");
        configOverlay.setAttribute("aria-hidden", "false");
      }

      function closeConfig() {
        configOverlay.classList.remove("open");
        configOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }

      function renderSequenceList() {
        sequenceList.innerHTML = state.draftSequence.map((item, index) => `
          <div class="sequence-item">
            <div class="sequence-main">
              <div class="sequence-order">第 ${index + 1} 位</div>
              <div>
                <div class="sequence-name">${item}</div>
                <div class="field-tip">${SHIFT_HINTS[item]}</div>
              </div>
            </div>
            <div class="sequence-actions">
              <button
                class="mini-button"
                type="button"
                data-index="${index}"
                data-move="-1"
                aria-label="上移 ${item}"
                ${index === 0 ? "disabled" : ""}
              >↑</button>
              <button
                class="mini-button"
                type="button"
                data-index="${index}"
                data-move="1"
                aria-label="下移 ${item}"
                ${index === state.draftSequence.length - 1 ? "disabled" : ""}
              >↓</button>
            </div>
          </div>
        `).join("");
      }

      function moveSequence(index, delta) {
        const target = index + delta;
        if (target < 0 || target >= state.draftSequence.length) {
          return;
        }
        const next = [...state.draftSequence];
        [next[index], next[target]] = [next[target], next[index]];
        state.draftSequence = next;
        renderSequenceList();
      }

      function handleDateSelection(event) {
        const button = event.target.closest("button[data-date]");
        if (!button) {
          return;
        }
        state.viewDate = parseDate(button.dataset.date);
        render();
      }

      function createDefaultConfig() {
        return {
          startDate: DEFAULT_START_DATE,
          sequence: [...SHIFT_OPTIONS]
        };
      }

      function loadConfig() {
        const fallback = createDefaultConfig();
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            return fallback;
          }
          const parsed = JSON.parse(raw);
          if (!parsed || !parsed.startDate || !Array.isArray(parsed.sequence)) {
            return fallback;
          }
          if (!isValidDateValue(parsed.startDate)) {
            return fallback;
          }
          const sequence = parsed.sequence.filter((item) => SHIFT_OPTIONS.includes(item));
          if (sequence.length !== SHIFT_OPTIONS.length || new Set(sequence).size !== SHIFT_OPTIONS.length) {
            return fallback;
          }
          return {
            startDate: parsed.startDate,
            sequence
          };
        } catch (error) {
          return fallback;
        }
      }

      function persistConfig(config) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
          showToast("浏览器不允许写入本地配置");
        }
      }

      function getShiftForDate(date, config) {
        const start = parseDate(config.startDate);
        const diff = diffDays(date, start);
        const cycleLength = config.sequence.length * 2;
        const normalized = ((diff % cycleLength) + cycleLength) % cycleLength;
        const shiftIndex = Math.floor(normalized / 2);
        return config.sequence[shiftIndex];
      }

      function buildTitle(date, lunar, shift) {
        const parts = [formatSolarDate(date), shift];
        if (lunar) {
          parts.push(`农历${lunar.isLeap ? "闰" : ""}${LUNAR_MONTH_NAMES[lunar.month - 1]}${lunar.day === 1 ? "" : LUNAR_DAY_NAMES[lunar.day - 1]}`);
        }
        return parts.join(" | ");
      }

      function solarToLunar(date) {
        const intlLunar = getIntlLunarInfo(date);
        if (intlLunar) {
          return intlLunar;
        }
        return solarToLunarFallback(date);
      }

      function createLunarIntlFormatter() {
        try {
          const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
          const sample = formatter.formatToParts(new Date(2026, 1, 17, 12));
          if (!sample.some((part) => part.type === "month") || !sample.some((part) => part.type === "day")) {
            return null;
          }
          return formatter;
        } catch (error) {
          return null;
        }
      }

      function getIntlLunarInfo(date) {
        if (!LUNAR_INTL_FORMATTER) {
          return null;
        }
        try {
          const parts = LUNAR_INTL_FORMATTER.formatToParts(atNoon(date));
          const yearText = parts.find((part) => part.type === "relatedYear")?.value;
          const monthText = parts.find((part) => part.type === "month")?.value;
          const dayText = parts.find((part) => part.type === "day")?.value;
          if (!monthText || !dayText || !yearText) {
            return null;
          }
          const isLeap = monthText.startsWith("闰");
          const normalizedMonth = monthText.replace(/^闰/, "");
          const month = LUNAR_MONTH_NAMES.indexOf(normalizedMonth) + 1;
          const day = Number(dayText);
          if (month < 1 || !Number.isInteger(day) || day < 1 || day > 30) {
            return null;
          }
          return {
            year: Number(yearText),
            month,
            day,
            isLeap
          };
        } catch (error) {
          return null;
        }
      }

      function solarToLunarFallback(date) {
        const target = atNoon(date);
        const min = new Date(1900, 0, 31, 12);
        const max = new Date(2101, 0, 28, 12);
        if (target < min || target >= max) {
          return null;
        }

        let offset = diffDays(target, min);
        let lunarYear;
        let lunarMonth;
        let lunarDay;
        let isLeap = false;

        for (lunarYear = 1900; lunarYear < 2101 && offset > 0; lunarYear += 1) {
          const yearDays = getLunarYearDays(lunarYear);
          if (offset < yearDays) {
            break;
          }
          offset -= yearDays;
        }

        const leapMonth = getLeapMonth(lunarYear);
        for (lunarMonth = 1; lunarMonth <= 12 && offset >= 0; lunarMonth += 1) {
          let monthDays;
          if (leapMonth > 0 && lunarMonth === leapMonth + 1 && !isLeap) {
            lunarMonth -= 1;
            isLeap = true;
            monthDays = getLeapDays(lunarYear);
          } else {
            monthDays = getLunarMonthDays(lunarYear, lunarMonth);
          }

          if (offset < monthDays) {
            break;
          }

          offset -= monthDays;

          if (isLeap && lunarMonth === leapMonth) {
            isLeap = false;
          }
        }

        lunarDay = offset + 1;
        return {
          year: lunarYear,
          month: lunarMonth,
          day: lunarDay,
          isLeap
        };
      }

      function getLunarYearDays(year) {
        let sum = 348;
        for (let bit = 0x8000; bit > 0x8; bit >>= 1) {
          sum += (LUNAR_INFO[year - 1900] & bit) ? 1 : 0;
        }
        return sum + getLeapDays(year);
      }

      function getLeapMonth(year) {
        return LUNAR_INFO[year - 1900] & 0xf;
      }

      function getLeapDays(year) {
        if (getLeapMonth(year)) {
          return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
      }

      function getLunarMonthDays(year, month) {
        return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
      }

      function formatLunarLabel(lunar) {
        if (lunar.day === 1) {
          return `${lunar.isLeap ? "闰" : ""}${LUNAR_MONTH_NAMES[lunar.month - 1]}`;
        }
        return LUNAR_DAY_NAMES[lunar.day - 1];
      }

      function formatSolarDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      function formatMonthDay(date) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }

      function formatFocusLabel(date) {
        return `${formatMonthDay(date)} ${WEEKDAY_NAMES[date.getDay()]}`;
      }

      function formatDateValue(date) {
        return formatSolarDate(date);
      }

      function isValidDateValue(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return false;
        }
        return !Number.isNaN(parseDate(value).getTime());
      }

      function parseDate(value) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day, 12);
      }

      function diffDays(a, b) {
        return Math.round((atNoon(a) - atNoon(b)) / DAY_MS);
      }

      function addDays(date, days) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
      }

      function getWeekStart(date) {
        return addDays(date, -((date.getDay() + 6) % 7));
      }

      function atNoon(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
      }

      function isDesktopLayout() {
        return desktopQuery.matches;
      }

      function isSameDate(a, b) {
        return a.getFullYear() === b.getFullYear()
          && a.getMonth() === b.getMonth()
          && a.getDate() === b.getDate();
      }

      let toastTimer = null;
      function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
          toast.classList.remove("show");
        }, 2200);
      }

      render();
    })();
