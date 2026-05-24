/* ============================================
   CalorieFlow — App Logic
   ============================================ */

(() => {
  'use strict';

  // -------- Constants --------
  const STORAGE_KEYS = {
    entries: 'cf_entries',
    settings: 'cf_settings',
  };

  const MEAL_ICONS = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snacks: '🍿',
  };

  const MEAL_FOOD_ICONS = {
    breakfast: '🥞',
    lunch: '🥗',
    dinner: '🍝',
    snacks: '🍪',
  };

  const QUICK_ADD_ITEMS = [
    { name: 'Banana', emoji: '🍌', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, meal: 'snacks' },
    { name: 'Chicken Breast', emoji: '🍗', calories: 165, protein: 31, carbs: 0, fat: 3.6, meal: 'lunch' },
    { name: 'Rice (1 cup)', emoji: '🍚', calories: 206, protein: 4.3, carbs: 45, fat: 0.4, meal: 'lunch' },
    { name: 'Eggs (2)', emoji: '🥚', calories: 156, protein: 12.6, carbs: 1.1, fat: 10.6, meal: 'breakfast' },
    { name: 'Greek Yogurt', emoji: '🥛', calories: 130, protein: 17, carbs: 6, fat: 4.5, meal: 'breakfast' },
    { name: 'Protein Shake', emoji: '🥤', calories: 150, protein: 30, carbs: 5, fat: 2, meal: 'snacks' },
    { name: 'Salmon Fillet', emoji: '🐟', calories: 280, protein: 34, carbs: 0, fat: 15, meal: 'dinner' },
    { name: 'Avocado Toast', emoji: '🥑', calories: 290, protein: 7, carbs: 30, fat: 17, meal: 'breakfast' },
  ];

  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 250,
    fatGoal: 65,
    burned: {},
  };

  const CIRCUMFERENCE = 2 * Math.PI * 85; // ~534.07

  // -------- State --------
  let currentDate = new Date();
  let activeMealTab = 'breakfast';
  let settings = {};
  let allEntries = {};

  // -------- DOM References --------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    dateLabel: $('#date-label'),
    dateFull: $('#date-full'),
    btnPrevDay: $('#btn-prev-day'),
    btnNextDay: $('#btn-next-day'),
    ringConsumed: $('#ring-consumed'),
    ringGoal: $('#ring-goal'),
    ringProgress: $('#ring-progress'),
    remainingCal: $('#remaining-cal'),
    burnedCal: $('#burned-cal'),
    proteinConsumed: $('#protein-consumed'),
    proteinGoal: $('#protein-goal'),
    carbsConsumed: $('#carbs-consumed'),
    carbsGoal: $('#carbs-goal'),
    fatConsumed: $('#fat-consumed'),
    fatGoal: $('#fat-goal'),
    proteinBar: $('#protein-bar'),
    carbsBar: $('#carbs-bar'),
    fatBar: $('#fat-bar'),
    mealTabs: $('#meal-tabs'),
    foodList: $('#food-list'),
    foodEmpty: $('#food-empty'),
    calBreakfast: $('#cal-breakfast'),
    calLunch: $('#cal-lunch'),
    calDinner: $('#cal-dinner'),
    calSnacks: $('#cal-snacks'),
    quickGrid: $('#quick-grid'),
    weeklyChart: $('#weekly-chart'),
    btnAddEntry: $('#btn-add-entry'),
    btnSettings: $('#btn-settings'),
    modalOverlay: $('#modal-overlay'),
    modalClose: $('#modal-close'),
    foodForm: $('#food-form'),
    foodName: $('#food-name'),
    foodCalories: $('#food-calories'),
    foodProtein: $('#food-protein'),
    foodCarbs: $('#food-carbs'),
    foodFat: $('#food-fat'),
    foodServing: $('#food-serving'),
    foodMeal: $('#food-meal'),
    settingsOverlay: $('#settings-overlay'),
    settingsClose: $('#settings-close'),
    settingsForm: $('#settings-form'),
    goalCalories: $('#goal-calories'),
    goalProtein: $('#goal-protein'),
    goalCarbs: $('#goal-carbs'),
    goalFat: $('#goal-fat'),
    goalBurned: $('#goal-burned'),
    btnClearToday: $('#btn-clear-today'),
    btnClearAll: $('#btn-clear-all'),
    toastContainer: $('#toast-container'),
  };

  // -------- Utility Functions --------
  function dateKey(date) {
    const d = date || currentDate;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }

  function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getFullYear() === yesterday.getFullYear() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getDate() === yesterday.getDate();
  }

  function isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getFullYear() === tomorrow.getFullYear() &&
           date.getMonth() === tomorrow.getMonth() &&
           date.getDate() === tomorrow.getDate();
  }

  function formatDate(date) {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  function getDateLabel(date) {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isTomorrow(date)) return 'Tomorrow';
    return DAYS_SHORT[date.getDay()];
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  // -------- Storage --------
  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.settings);
      settings = stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
    } catch {
      settings = { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }

  function loadEntries() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.entries);
      allEntries = stored ? JSON.parse(stored) : {};
    } catch {
      allEntries = {};
    }
  }

  function saveEntries() {
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(allEntries));
  }

  function getEntriesForDate(date) {
    const key = dateKey(date);
    return allEntries[key] || [];
  }

  function setEntriesForDate(date, entries) {
    const key = dateKey(date);
    if (entries.length === 0) {
      delete allEntries[key];
    } else {
      allEntries[key] = entries;
    }
    saveEntries();
  }

  // -------- Toast --------
  function showToast(message, type = 'success') {
    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // -------- Date Navigation --------
  function updateDateDisplay() {
    dom.dateLabel.textContent = getDateLabel(currentDate);
    dom.dateFull.textContent = formatDate(currentDate);

    // Disable next button if it would go past today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Allow forward navigation (for planning)
  }

  function navigateDay(offset) {
    currentDate.setDate(currentDate.getDate() + offset);
    updateDateDisplay();
    refreshAll();
  }

  // -------- Calorie Ring --------
  function updateRing() {
    const entries = getEntriesForDate(currentDate);
    const totalCalories = entries.reduce((sum, e) => sum + (e.calories * (e.servings || 1)), 0);
    const burned = (settings.burned && settings.burned[dateKey(currentDate)]) || 0;
    const goal = settings.calorieGoal || 2000;
    const remaining = Math.max(0, goal - totalCalories + burned);
    const pct = clamp(totalCalories / goal, 0, 1);

    // Animate the number
    animateNumber(dom.ringConsumed, totalCalories);
    dom.ringGoal.textContent = goal;
    dom.remainingCal.textContent = remaining;
    dom.burnedCal.textContent = burned;

    // Update ring
    const offset = CIRCUMFERENCE - (pct * CIRCUMFERENCE);
    dom.ringProgress.style.strokeDashoffset = offset;

    // Color remaining
    if (remaining === 0 && totalCalories >= goal) {
      dom.remainingCal.className = 'ring-stat-value negative';
    } else {
      dom.remainingCal.className = 'ring-stat-value positive';
    }
  }

  function animateNumber(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const duration = 600;
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const val = Math.round(current + (target - current) * eased);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // -------- Macros --------
  function updateMacros() {
    const entries = getEntriesForDate(currentDate);
    const totals = entries.reduce((acc, e) => {
      const s = e.servings || 1;
      acc.protein += (e.protein || 0) * s;
      acc.carbs += (e.carbs || 0) * s;
      acc.fat += (e.fat || 0) * s;
      return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    dom.proteinConsumed.textContent = Math.round(totals.protein);
    dom.carbsConsumed.textContent = Math.round(totals.carbs);
    dom.fatConsumed.textContent = Math.round(totals.fat);

    dom.proteinGoal.textContent = settings.proteinGoal || 150;
    dom.carbsGoal.textContent = settings.carbsGoal || 250;
    dom.fatGoal.textContent = settings.fatGoal || 65;

    const pProtein = clamp((totals.protein / (settings.proteinGoal || 150)) * 100, 0, 100);
    const pCarbs = clamp((totals.carbs / (settings.carbsGoal || 250)) * 100, 0, 100);
    const pFat = clamp((totals.fat / (settings.fatGoal || 65)) * 100, 0, 100);

    dom.proteinBar.style.width = pProtein + '%';
    dom.carbsBar.style.width = pCarbs + '%';
    dom.fatBar.style.width = pFat + '%';
  }

  // -------- Meal Tabs & Food List --------
  function updateMealTabs() {
    const entries = getEntriesForDate(currentDate);

    const mealCals = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    entries.forEach(e => {
      if (mealCals.hasOwnProperty(e.meal)) {
        mealCals[e.meal] += (e.calories * (e.servings || 1));
      }
    });

    dom.calBreakfast.textContent = Math.round(mealCals.breakfast) + ' cal';
    dom.calLunch.textContent = Math.round(mealCals.lunch) + ' cal';
    dom.calDinner.textContent = Math.round(mealCals.dinner) + ' cal';
    dom.calSnacks.textContent = Math.round(mealCals.snacks) + ' cal';
  }

  function renderFoodList() {
    const entries = getEntriesForDate(currentDate);
    const mealEntries = entries.filter(e => e.meal === activeMealTab);

    // Clear list
    dom.foodList.innerHTML = '';

    if (mealEntries.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'food-empty';
      emptyDiv.id = 'food-empty';
      emptyDiv.innerHTML = `
        <div class="food-empty-icon">🍽️</div>
        <p>No entries yet</p>
        <span>Tap "Add Food" to log your meal</span>
      `;
      dom.foodList.appendChild(emptyDiv);
      return;
    }

    mealEntries.forEach((entry, i) => {
      const div = document.createElement('div');
      div.className = 'food-entry';
      div.style.animationDelay = `${i * 0.05}s`;

      const totalCal = Math.round(entry.calories * (entry.servings || 1));
      const macroText = [];
      if (entry.protein) macroText.push(`P: ${Math.round(entry.protein * (entry.servings || 1))}g`);
      if (entry.carbs) macroText.push(`C: ${Math.round(entry.carbs * (entry.servings || 1))}g`);
      if (entry.fat) macroText.push(`F: ${Math.round(entry.fat * (entry.servings || 1))}g`);

      div.innerHTML = `
        <div class="food-entry-icon ${entry.meal}">
          ${MEAL_FOOD_ICONS[entry.meal] || '🍽️'}
        </div>
        <div class="food-entry-info">
          <div class="food-entry-name">${escapeHtml(entry.name)}</div>
          <div class="food-entry-macros">${macroText.join(' · ') || 'No macro data'}</div>
        </div>
        <div class="food-entry-calories">${totalCal}<span>cal</span></div>
        <button class="food-entry-delete" data-id="${entry.id}" aria-label="Delete ${escapeHtml(entry.name)}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      `;

      dom.foodList.appendChild(div);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -------- Quick Add --------
  function renderQuickAdd() {
    dom.quickGrid.innerHTML = '';

    QUICK_ADD_ITEMS.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'quick-item';
      btn.innerHTML = `
        <span class="quick-item-emoji">${item.emoji}</span>
        <div class="quick-item-info">
          <div class="quick-item-name">${item.name}</div>
          <div class="quick-item-cal">${item.calories} cal</div>
        </div>
      `;

      btn.addEventListener('click', () => {
        addEntry({
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          servings: 1,
          meal: item.meal,
        });
        showToast(`Added ${item.name}`, 'success');
      });

      dom.quickGrid.appendChild(btn);
    });
  }

  // -------- Weekly Chart --------
  function renderWeeklyChart() {
    dom.weeklyChart.innerHTML = '';

    const today = new Date();
    const goal = settings.calorieGoal || 2000;

    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    // Find max for scaling
    let maxCal = goal;
    days.forEach(d => {
      const entries = getEntriesForDate(d);
      const total = entries.reduce((sum, e) => sum + (e.calories * (e.servings || 1)), 0);
      if (total > maxCal) maxCal = total;
    });

    days.forEach(d => {
      const entries = getEntriesForDate(d);
      const total = entries.reduce((sum, e) => sum + (e.calories * (e.servings || 1)), 0);
      const heightPct = maxCal > 0 ? (total / maxCal) * 100 : 0;
      const dayIsToday = isToday(d);
      const overGoal = total > goal;

      const wrapper = document.createElement('div');
      wrapper.className = 'weekly-bar-wrapper';

      wrapper.innerHTML = `
        <div class="weekly-cal-label">${total > 0 ? total : ''}</div>
        <div class="weekly-bar-track">
          <div class="weekly-bar ${overGoal ? 'over-goal' : ''} ${dayIsToday ? 'today' : ''}" style="height: 0%"></div>
        </div>
        <div class="weekly-label ${dayIsToday ? 'today' : ''}">${DAYS_SHORT[d.getDay()]}</div>
      `;

      dom.weeklyChart.appendChild(wrapper);

      // Animate after append
      requestAnimationFrame(() => {
        const bar = wrapper.querySelector('.weekly-bar');
        bar.style.height = Math.max(heightPct, total > 0 ? 4 : 0) + '%';
      });
    });
  }

  // -------- Add / Delete Entry --------
  function addEntry(data) {
    const entries = getEntriesForDate(currentDate);
    const entry = {
      id: generateId(),
      name: data.name,
      calories: parseFloat(data.calories) || 0,
      protein: parseFloat(data.protein) || 0,
      carbs: parseFloat(data.carbs) || 0,
      fat: parseFloat(data.fat) || 0,
      servings: parseFloat(data.servings) || 1,
      meal: data.meal || 'snacks',
      timestamp: Date.now(),
    };
    entries.push(entry);
    setEntriesForDate(currentDate, entries);
    refreshAll();
  }

  function deleteEntry(id) {
    let entries = getEntriesForDate(currentDate);
    const entry = entries.find(e => e.id === id);
    entries = entries.filter(e => e.id !== id);
    setEntriesForDate(currentDate, entries);
    refreshAll();
    if (entry) showToast(`Removed ${entry.name}`, 'info');
  }

  // -------- Modals --------
  function openModal(overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // -------- Refresh All --------
  function refreshAll() {
    updateDateDisplay();
    updateRing();
    updateMacros();
    updateMealTabs();
    renderFoodList();
    renderWeeklyChart();
  }

  // -------- Event Listeners --------
  function initEventListeners() {
    // Date navigation
    dom.btnPrevDay.addEventListener('click', () => navigateDay(-1));
    dom.btnNextDay.addEventListener('click', () => navigateDay(1));

    // Meal tabs
    dom.mealTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.meal-tab');
      if (!tab) return;
      $$('.meal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeMealTab = tab.dataset.meal;
      renderFoodList();
    });

    // Food list delete
    dom.foodList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.food-entry-delete');
      if (!deleteBtn) return;
      deleteEntry(deleteBtn.dataset.id);
    });

    // Add food modal
    dom.btnAddEntry.addEventListener('click', () => {
      dom.foodMeal.value = activeMealTab;
      openModal(dom.modalOverlay);
      dom.foodName.focus();
    });

    dom.modalClose.addEventListener('click', () => closeModal(dom.modalOverlay));
    dom.modalOverlay.addEventListener('click', (e) => {
      if (e.target === dom.modalOverlay) closeModal(dom.modalOverlay);
    });

    // Food form submit
    dom.foodForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = dom.foodName.value.trim();
      const calories = dom.foodCalories.value;

      if (!name || !calories) return;

      addEntry({
        name,
        calories,
        protein: dom.foodProtein.value,
        carbs: dom.foodCarbs.value,
        fat: dom.foodFat.value,
        servings: dom.foodServing.value || 1,
        meal: dom.foodMeal.value,
      });

      showToast(`Added ${name}`, 'success');

      // Switch to the added meal's tab
      activeMealTab = dom.foodMeal.value;
      $$('.meal-tab').forEach(t => t.classList.remove('active'));
      const targetTab = document.querySelector(`.meal-tab[data-meal="${activeMealTab}"]`);
      if (targetTab) targetTab.classList.add('active');
      renderFoodList();

      // Reset form
      dom.foodForm.reset();
      dom.foodServing.value = '1';
      closeModal(dom.modalOverlay);
    });

    // Settings modal
    dom.btnSettings.addEventListener('click', () => {
      dom.goalCalories.value = settings.calorieGoal || '';
      dom.goalProtein.value = settings.proteinGoal || '';
      dom.goalCarbs.value = settings.carbsGoal || '';
      dom.goalFat.value = settings.fatGoal || '';
      dom.goalBurned.value = (settings.burned && settings.burned[dateKey(currentDate)]) || '';
      openModal(dom.settingsOverlay);
    });

    dom.settingsClose.addEventListener('click', () => closeModal(dom.settingsOverlay));
    dom.settingsOverlay.addEventListener('click', (e) => {
      if (e.target === dom.settingsOverlay) closeModal(dom.settingsOverlay);
    });

    // Settings form submit
    dom.settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      settings.calorieGoal = parseInt(dom.goalCalories.value) || 2000;
      settings.proteinGoal = parseInt(dom.goalProtein.value) || 150;
      settings.carbsGoal = parseInt(dom.goalCarbs.value) || 250;
      settings.fatGoal = parseInt(dom.goalFat.value) || 65;

      if (!settings.burned) settings.burned = {};
      settings.burned[dateKey(currentDate)] = parseInt(dom.goalBurned.value) || 0;

      saveSettings();
      closeModal(dom.settingsOverlay);
      refreshAll();
      showToast('Settings saved', 'success');
    });

    // Clear today
    dom.btnClearToday.addEventListener('click', () => {
      if (confirm('Clear all entries for this day?')) {
        setEntriesForDate(currentDate, []);
        closeModal(dom.settingsOverlay);
        refreshAll();
        showToast('Day cleared', 'info');
      }
    });

    // Clear all data
    dom.btnClearAll.addEventListener('click', () => {
      if (confirm('⚠️ This will delete ALL your data. Are you sure?')) {
        localStorage.removeItem(STORAGE_KEYS.entries);
        localStorage.removeItem(STORAGE_KEYS.settings);
        allEntries = {};
        settings = { ...DEFAULT_SETTINGS };
        closeModal(dom.settingsOverlay);
        refreshAll();
        showToast('All data cleared', 'info');
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal(dom.modalOverlay);
        closeModal(dom.settingsOverlay);
      }
      if (e.key === 'ArrowLeft' && !dom.modalOverlay.classList.contains('active') && !dom.settingsOverlay.classList.contains('active')) {
        navigateDay(-1);
      }
      if (e.key === 'ArrowRight' && !dom.modalOverlay.classList.contains('active') && !dom.settingsOverlay.classList.contains('active')) {
        navigateDay(1);
      }
    });
  }

  // -------- Init --------
  function init() {
    loadSettings();
    loadEntries();
    initEventListeners();
    renderQuickAdd();
    refreshAll();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
