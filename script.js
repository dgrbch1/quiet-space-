const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const cards = [...document.querySelectorAll('.space-card')];
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const emptyState = document.querySelector('#empty-state');
const savedCount = document.querySelector('#saved-count');
const openSaved = document.querySelector('#open-saved');
const drawer = document.querySelector('#booking-drawer');
const backdrop = document.querySelector('#drawer-backdrop');
const closeDrawer = document.querySelector('#close-drawer');
const bookingSpace = document.querySelector('#booking-space');
const bookingDuration = document.querySelector('#booking-duration');
const bookingTotal = document.querySelector('#booking-total');
const bookingForm = document.querySelector('#booking-form');
const successMessage = document.querySelector('#success-message');
const bookingDate = document.querySelector('#booking-date');
const toast = document.querySelector('#toast');

let activeFilter = 'all';
let currentPrice = 0;
let savedOnly = false;
let lastFocusedElement = null;

// Timezone-safe YYYY-MM-DD
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Minimum booking date = tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
bookingDate.min = formatLocalDate(tomorrow);
bookingDate.value = bookingDate.min;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function closeMenu() {
  mainNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}

function updateResults() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  cards.forEach((card) => {
    const matchesType = activeFilter === 'all' || card.dataset.type === activeFilter;
    const matchesSearch = !query || card.dataset.name.toLowerCase().includes(query);
    const matchesSaved = !savedOnly || card.querySelector('.heart').classList.contains('saved');
    const shouldShow = matchesType && matchesSearch && matchesSaved;

    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  emptyState.hidden = visible !== 0;
}

function updateSavedCount() {
  const totalSaved = document.querySelectorAll('.heart.saved').length;
  savedCount.textContent = totalSaved;
}

function setSavedMode(isSavedMode) {
  savedOnly = isSavedMode;
  openSaved.classList.toggle('active', savedOnly);
  openSaved.setAttribute('aria-pressed', String(savedOnly));
}

function setActiveFilter(filter) {
  activeFilter = filter;
  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', closeMenu)
);

// close mobile nav on outside click
document.addEventListener('click', (event) => {
  const navOpen = mainNav.classList.contains('open');
  if (!navOpen) return;
  const clickedInsideNav = mainNav.contains(event.target);
  const clickedMenuBtn = menuButton.contains(event.target);
  if (!clickedInsideNav && !clickedMenuBtn) closeMenu();
});

filterButtons.forEach((button) =>
  button.addEventListener('click', () => {
    setActiveFilter(button.dataset.filter);
    setSavedMode(false);
    updateResults();
  })
);

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  setSavedMode(false);
  updateResults();
  document.querySelector('#spaces').scrollIntoView({ behavior: 'smooth' });
});

searchInput.addEventListener('input', updateResults);

document.querySelectorAll('.heart').forEach((button) =>
  button.addEventListener('click', () => {
    const isSaved = button.classList.toggle('saved');
    button.setAttribute('aria-pressed', String(isSaved));
    button.textContent = isSaved ? '♥' : '♡';

    updateSavedCount();

    const name = button.closest('.space-card').querySelector('h3').textContent;
    showToast(isSaved ? `${name} saved` : `${name} removed`);

    if (savedOnly) updateResults();
  })
);

openSaved.addEventListener('click', () => {
  setSavedMode(!savedOnly);
  setActiveFilter('all');
  updateResults();
  document.querySelector('#spaces').scrollIntoView({ behavior: 'smooth' });

  if (savedOnly && Number(savedCount.textContent) === 0) {
    showToast('Save a space with the heart button');
  }
});

function updateTotal() {
  const hours = Number(bookingDuration.value);
  bookingTotal.textContent = currentPrice === 0 ? 'Free' : `$${currentPrice * hours}`;
}

function getFocusableInDrawer() {
  return [...drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

function trapFocus(event) {
  if (!drawer.classList.contains('open') || event.key !== 'Tab') return;

  const focusable = getFocusableInDrawer();
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openBooking(name, price, triggerEl) {
  lastFocusedElement = triggerEl || document.activeElement;

  currentPrice = Number(price);
  bookingSpace.textContent = name;

  // Reset to booking form state each time
  bookingForm.hidden = false;
  successMessage.hidden = true;
  bookingForm.reset();
  bookingDuration.value = '1';
  bookingDate.value = bookingDate.min;

  updateTotal();

  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  closeDrawer.focus();
}

function hideBooking() {
  if (!drawer.classList.contains('open')) return;

  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.style.overflow = '';

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

document.querySelectorAll('.book-button').forEach((button) =>
  button.addEventListener('click', () => {
    openBooking(button.dataset.space, button.dataset.price, button);
  })
);

bookingDuration.addEventListener('change', updateTotal);
closeDrawer.addEventListener('click', hideBooking);
backdrop.addEventListener('click', hideBooking);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    // Close drawer first if open, else close mobile menu if open
    if (drawer.classList.contains('open')) {
      hideBooking();
      return;
    }
    if (mainNav.classList.contains('open')) {
      closeMenu();
    }
  }

  trapFocus(event);
});

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Basic guard
  if (!bookingDate.value) {
    showToast('Please choose a date');
    return;
  }

  bookingForm.hidden = true;
  successMessage.hidden = false;
  showToast(`Reserved: ${bookingSpace.textContent}`);
});

// initial sync
setSavedMode(false);
updateSavedCount();
updateResults();
