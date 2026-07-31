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

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
bookingDate.min = tomorrow.toISOString().split('T')[0];
bookingDate.value = bookingDate.min;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
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

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  savedOnly = false;
  openSaved.classList.remove('active');
  updateResults();
}));

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  savedOnly = false;
  updateResults();
  document.querySelector('#spaces').scrollIntoView({ behavior: 'smooth' });
});

searchInput.addEventListener('input', updateResults);

document.querySelectorAll('.heart').forEach((button) => button.addEventListener('click', () => {
  const isSaved = button.classList.toggle('saved');
  button.setAttribute('aria-pressed', String(isSaved));
  button.textContent = isSaved ? '♥' : '♡';
  savedCount.textContent = document.querySelectorAll('.heart.saved').length;
  const name = button.closest('.space-card').querySelector('h3').textContent;
  showToast(isSaved ? `${name} saved` : `${name} removed`);
  if (savedOnly) updateResults();
}));

openSaved.addEventListener('click', () => {
  savedOnly = !savedOnly;
  activeFilter = 'all';
  filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
  updateResults();
  document.querySelector('#spaces').scrollIntoView({ behavior: 'smooth' });
  if (savedOnly && Number(savedCount.textContent) === 0) showToast('Save a space with the heart button');
});

function updateTotal() {
  const hours = Number(bookingDuration.value);
  bookingTotal.textContent = currentPrice === 0 ? 'Free' : `$${currentPrice * hours}`;
}

function openBooking(name, price) {
  currentPrice = Number(price);
  bookingSpace.textContent = name;
  bookingForm.hidden = false;
  successMessage.hidden = true;
  updateTotal();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  closeDrawer.focus();
}

function hideBooking() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.style.overflow = '';
}

document.querySelectorAll('.book-button').forEach((button) => button.addEventListener('click', () => {
  openBooking(button.dataset.space, button.dataset.price);
}));

bookingDuration.addEventListener('change', updateTotal);
closeDrawer.addEventListener('click', hideBooking);
backdrop.addEventListener('click', hideBooking);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideBooking(); });

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  bookingForm.hidden = true;
  successMessage.hidden = false;
});
