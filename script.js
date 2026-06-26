// --- State Management ---
let state = {
    events: [
        { id: 1, title: 'Product Launch', description: 'The next evolution of Ticker begins.', targetDate: new Date('2024-10-30T10:00:00'), isActive: true },
        { id: 2, title: 'Keynote 2024', description: 'Annual strategy meeting.', targetDate: new Date('2024-10-12T09:00:00'), isActive: false },
        { id: 3, title: 'Internal Audit', description: 'Quarterly compliance check.', targetDate: new Date('2024-12-15T14:30:00'), isActive: false }
    ],
    timerId: null
};

// --- Navigation Logic ---
function navigateTo(view) {
    const dashboard = document.getElementById('dashboard-view');
    const create = document.getElementById('create-view');

    if (view === 'create') {
        dashboard.classList.add('hidden-view');
        setTimeout(() => {
            dashboard.style.display = 'none';
            create.style.display = 'block';
            setTimeout(() => create.classList.remove('hidden-view'), 10);
        }, 300);
    } else {
        create.classList.add('hidden-view');
        setTimeout(() => {
            create.style.display = 'none';
            dashboard.style.display = 'block';
            setTimeout(() => dashboard.classList.remove('hidden-view'), 10);
            renderApp();
        }, 300);
    }
}

// --- Core Logic ---
function renderApp() {
    renderEventList();
    updateHeroCountdown();
    startGlobalTimer();
}

function renderEventList() {
    const container = document.getElementById('events-list-container');
    if (!container) return;
    
    container.innerHTML = '';

    state.events.forEach(event => {
        const card = document.createElement('div');
        const isActive = event.isActive;
        const dateStr = event.targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        card.className = `glass-card p-5 rounded-xl flex items-center justify-between transition-all cursor-pointer group active:scale-[0.98] ${isActive ? 'border-l-4 border-primary bg-primary/5 active-glow' : 'hover:border-on-surface-variant/30'}`;
        
        card.innerHTML = `
            <div class="flex flex-col" onclick="activateEvent(${event.id})">
                <h4 class="font-headline-sm text-[20px] ${isActive ? 'text-on-surface' : 'text-on-surface group-hover:text-primary transition-colors'}">${event.title}</h4>
                <p class="font-label-caps text-[11px] text-on-surface-variant uppercase">${dateStr}</p>
            </div>
            <div class="flex items-center gap-6">
                <button class="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors p-1 active:scale-125" onclick="deleteEvent(${event.id}, event)">delete</button>
                <div class="hidden md:flex flex-col items-end ticker-text">
                    <span class="${isActive ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}">${getTimeRemainingString(event.targetDate)}</span>
                </div>
                ${isActive ? 
                    '<span class="material-symbols-outlined text-primary" style="font-variation-settings: \'FILL\' 1;">check_circle</span>' : 
                    `<button onclick="activateEvent(${event.id})" class="font-label-caps text-[10px] text-on-surface-variant border border-on-surface-variant/20 px-3 py-1 rounded-md hover:bg-on-surface-variant/10 transition-colors uppercase hover:border-primary active:bg-primary/20">Activate</button>`
                }
            </div>
        `;
        container.appendChild(card);
    });
}

function startGlobalTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(() => {
        updateHeroCountdown();
        if (window.innerWidth >= 768) {
            renderEventList();
        }
    }, 1000);
}

function updateHeroCountdown() {
    const activeEvent = state.events.find(e => e.isActive);
    const heroTitle = document.getElementById('hero-title');
    const heroDesc = document.getElementById('hero-description');
    const heroTicker = document.getElementById('hero-ticker');
    const container = document.getElementById('hero-countdown-container');

    if (!heroTitle || !heroDesc || !heroTicker || !container) return;

    if (!activeEvent) {
        heroTitle.innerText = "No Active Event";
        heroDesc.innerText = "Select an event below to track.";
        heroTicker.classList.add('opacity-20');
        container.classList.remove('active-glow');
        updateHeroValues(0, 0, 0, 0);
        return;
    }

    heroTitle.innerText = activeEvent.title;
    heroDesc.innerText = activeEvent.description || "The ticker is running.";
    heroTicker.classList.remove('opacity-20');
    container.classList.add('active-glow');

    const { d, h, m, s } = getTimeRemaining(activeEvent.targetDate);
    updateHeroValues(d, h, m, s);
}

function updateHeroValues(d, h, m, s) {
    const daysEl = document.getElementById('hero-days');
    const hoursEl = document.getElementById('hero-hours');
    const minsEl = document.getElementById('hero-mins');
    const secsEl = document.getElementById('hero-secs');

    if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(m).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(s).padStart(2, '0');
}

function getTimeRemaining(targetDate) {
    const total = Date.parse(targetDate) - Date.parse(new Date());
    if (total <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { d: days, h: hours, m: minutes, s: seconds };
}

function getTimeRemainingString(targetDate) {
    const { d, h, m } = getTimeRemaining(targetDate);
    return `${String(d).padStart(2, '0')}d : ${String(h).padStart(2, '0')}h : ${String(m).padStart(2, '0')}m`;
}

// --- Actions ---
function activateEvent(id) {
    state.events.forEach(e => e.isActive = (e.id === id));
    renderApp();
}

function deleteEvent(id, e) {
    e.stopPropagation();
    if (confirm('Delete this event?')) {
        state.events = state.events.filter(ev => ev.id !== id);
        renderApp();
    }
}

function saveEvent() {
    const titleInput = document.getElementById('event-title-input');
    const dateInput = document.getElementById('event-date-input');
    const timeInput = document.getElementById('event-time-input');
    const descInput = document.getElementById('event-desc-input');

    if (!titleInput || !dateInput || !timeInput || !descInput) return;

    if (!titleInput.value || !dateInput.value) {
        alert('Please provide a title and date.');
        return;
    }

    const dateTimeStr = `${dateInput.value}T${timeInput.value || '00:00'}:00`;
    const newEvent = {
        id: Date.now(),
        title: titleInput.value,
        description: descInput.value,
        targetDate: new Date(dateTimeStr),
        isActive: state.events.length === 0
    };

    state.events.push(newEvent);
    
    // Clear inputs
    titleInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
    descInput.value = '';

    navigateTo('dashboard');
}

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI state setups
    const dashboard = document.getElementById('dashboard-view');
    if (dashboard) {
        dashboard.style.display = 'block';
        dashboard.classList.remove('hidden-view');
    }
    renderApp();
});