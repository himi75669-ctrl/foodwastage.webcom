/**
 * FoodGuard AI — Frontend Interactions Script
 * Designed for beginner CSE student clarity & hackathon prototype excellence.
 *
 * Core Features Handled:
 * 1. Mobile Menu Navigation & Active Scroll Spy
 * 2. Animated Numerical Counters (Impact Dashboard)
 * 3. Food Waste Tracker (Form Handling, Dynamic Table Logs, Stat Increment)
 * 4. Surplus Food Donation (Form Handling, Success Banner, Live Feed Addition)
 * 5. Food Safety Assistant (Algorithmic rule-based evaluation & HACCP feedback)
 * 6. Partner Organizations Filter & Pickup Request Modal
 * 7. Reusable Toast Notification System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Default States
  initCurrentDates();
  initNavbar();
  initCounterAnimations();
  initWasteTracker();
  initDonationForm();
  initSafetyAssistant();
  initOrgFiltersAndModal();
});

/* ==========================================================================
   1. UTILITY & HELPERS
   ========================================================================== */

/**
 * Pre-fills date inputs with today's date & sets datetime-local default.
 */
function initCurrentDates() {
  const wasteDateInput = document.getElementById('wasteDate');
  const availableUntilInput = document.getElementById('availableUntil');

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  if (wasteDateInput) {
    wasteDateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  if (availableUntilInput) {
    // Default available until + 4 hours from now
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const hours = String(later.getHours()).padStart(2, '0');
    const mins = String(later.getMinutes()).padStart(2, '0');
    availableUntilInput.value = `${yyyy}-${mm}-${dd}T${hours}:${mins}`;
  }
}

/**
 * Shows an accessible floating toast notification.
 */
function showToast(title, message, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast) return;

  toastTitle.textContent = title;
  toastMsg.textContent = message;

  if (isSuccess) {
    toastIcon.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #22c55e;"></i>';
    toast.style.borderLeftColor = 'var(--primary-500)';
  } else {
    toastIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #f59e0b;"></i>';
    toast.style.borderLeftColor = 'var(--accent-amber)';
  }

  toast.classList.add('show');

  // Auto hide after 4.5 seconds
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// Toast close button listener
const toastCloseBtn = document.getElementById('toastClose');
if (toastCloseBtn) {
  toastCloseBtn.addEventListener('click', () => {
    document.getElementById('toast').classList.remove('show');
  });
}

/* ==========================================================================
   2. NAVBAR & NAVIGATION SCROLL SPY
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const bars = document.querySelectorAll('.hamburger-bar');

  // Navbar background change on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveNavLink();
  });

  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      bars.forEach(bar => bar.classList.toggle('active', isOpen));
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        bars.forEach(bar => bar.classList.remove('active'));
      });
    });
  }

  // Active section indicator using Scroll position
  function highlightActiveNavLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const activeLink = document.querySelector(`.nav-links a[href*='${sectionId}']`);

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }
}

/* ==========================================================================
   3. IMPACT DASHBOARD COUNTER ANIMATION
   ========================================================================== */
function initCounterAnimations() {
  const statNumbers = document.querySelectorAll('.stat-number');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1800; // ms
          const increment = target / (duration / 25);
          let current = 0;

          const updateCount = () => {
            current += increment;
            if (current < target) {
              counter.innerText = Math.ceil(current);
              setTimeout(updateCount, 25);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.35 });

  const impactSection = document.getElementById('impact');
  if (impactSection) {
    observer.observe(impactSection);
  }
}

/* ==========================================================================
   4. FOOD WASTE TRACKER LOGIC
   ========================================================================== */
function initWasteTracker() {
  const trackerForm = document.getElementById('wasteTrackerForm');
  const tableBody = document.getElementById('trackerTableBody');
  const logCountBadge = document.getElementById('logCountBadge');

  // Stats elements
  const metricSaved = document.getElementById('metricSaved');
  const metricReduced = document.getElementById('metricReduced');
  const metricMeals = document.getElementById('metricMeals');

  let entryCount = 4; // initially 4 sample rows

  if (!trackerForm) return;

  trackerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Field references
    const foodName = document.getElementById('foodName');
    const foodCategory = document.getElementById('foodCategory');
    const quantityKg = document.getElementById('quantityKg');
    const wasteDate = document.getElementById('wasteDate');
    const wasteReason = document.getElementById('wasteReason');
    const wasteLocation = document.getElementById('wasteLocation');

    // Validation check
    let isValid = true;
    [foodName, foodCategory, quantityKg, wasteDate, wasteReason, wasteLocation].forEach(input => {
      const parent = input.closest('.form-group');
      if (!input.value.trim()) {
        parent.classList.add('has-error');
        isValid = false;
      } else {
        parent.classList.remove('has-error');
      }
    });

    if (!isValid) {
      showToast('Form Incomplete', 'Please fill in all mandatory waste tracker fields.', false);
      return;
    }

    const qty = parseFloat(quantityKg.value);

    // Create new table row dynamically
    const tr = document.createElement('tr');
    tr.style.animation = 'fadeIn 0.4s ease';
    tr.innerHTML = `
      <td><strong>${escapeHtml(foodName.value.trim())}</strong></td>
      <td>${escapeHtml(foodCategory.value)}</td>
      <td><span class="qty-pill">${qty.toFixed(1)} kg</span></td>
      <td>${escapeHtml(wasteReason.value)}</td>
      <td>${escapeHtml(wasteLocation.value.trim())}</td>
    `;

    // Prepend to top of table
    tableBody.insertBefore(tr, tableBody.firstChild);

    // Update log counter badge
    entryCount++;
    logCountBadge.textContent = `${entryCount} records logged`;

    // Increment metrics dynamically
    if (metricReduced) {
      const currentReduced = parseInt(metricReduced.textContent, 10) || 180;
      metricReduced.textContent = currentReduced + Math.round(qty);
    }
    if (metricSaved) {
      const currentSaved = parseInt(metricSaved.textContent, 10) || 250;
      metricSaved.textContent = currentSaved + Math.round(qty * 0.75); // portion saved via logging feedback
    }
    if (metricMeals) {
      const currentMeals = parseInt(metricMeals.textContent, 10) || 420;
      metricMeals.textContent = currentMeals + Math.round(qty * 2.2); // ~2.2 meals per kg
    }

    showToast('Entry Recorded', `Successfully logged ${qty} kg of ${foodName.value} to dashboard.`);

    // Reset form fields
    trackerForm.reset();
    initCurrentDates();
  });
}

/* ==========================================================================
   5. DONATE SURPLUS FOOD LOGIC
   ========================================================================== */
function initDonationForm() {
  const donationForm = document.getElementById('donationForm');
  const successBanner = document.getElementById('donationSuccessMessage');
  const activeFeed = document.getElementById('activeDonationsFeed');

  // Stats elements
  const metricDonations = document.getElementById('metricDonations');
  const metricSaved = document.getElementById('metricSaved');
  const metricMeals = document.getElementById('metricMeals');

  if (!donationForm) return;

  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const donateFoodName = document.getElementById('donateFoodName');
    const donateQuantity = document.getElementById('donateQuantity');
    const pickupLocation = document.getElementById('pickupLocation');
    const availableUntil = document.getElementById('availableUntil');
    const contactInfo = document.getElementById('contactInfo');
    const dietaryNotes = document.getElementById('dietaryNotes');

    let isValid = true;
    [donateFoodName, donateQuantity, pickupLocation, availableUntil, contactInfo].forEach(input => {
      const parent = input.closest('.form-group');
      if (!input.value.trim()) {
        parent.classList.add('has-error');
        isValid = false;
      } else {
        parent.classList.remove('has-error');
      }
    });

    if (!isValid) {
      showToast('Required Information Missing', 'Please fill all required donation pickup fields.', false);
      return;
    }

    // Show inline success message
    if (successBanner) {
      successBanner.style.display = 'flex';
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Format Available Time
    let formattedTime = 'Today';
    try {
      const d = new Date(availableUntil.value);
      formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      formattedTime = availableUntil.value;
    }

    // Add to Community Rescue Board dynamically
    if (activeFeed) {
      const feedCard = document.createElement('div');
      feedCard.className = 'feed-card';
      feedCard.style.animation = 'fadeIn 0.5s ease';
      feedCard.innerHTML = `
        <div class="feed-card-header">
          <div class="feed-title-wrap">
            <h5>${escapeHtml(donateFoodName.value.trim())}</h5>
            <span class="feed-meta"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(pickupLocation.value.trim())} &bull; Safe until ${formattedTime}</span>
          </div>
          <span class="badge badge-warning">Broadcast Active</span>
        </div>
        <div class="feed-card-footer">
          <span><i class="fa-solid fa-weight-scale"></i> ${escapeHtml(donateQuantity.value.trim())}</span>
          <button class="btn btn-xs btn-outline claim-demo-btn" onclick="claimDonation(this)">Claim for NGO</button>
        </div>
      `;
      activeFeed.insertBefore(feedCard, activeFeed.firstChild);
    }

    // Increment Global Stats
    if (metricDonations) {
      const currentDonations = parseInt(metricDonations.textContent, 10) || 75;
      metricDonations.textContent = currentDonations + 1;
    }
    if (metricSaved) {
      const currentSaved = parseInt(metricSaved.textContent, 10) || 250;
      metricSaved.textContent = currentSaved + 15;
    }
    if (metricMeals) {
      const currentMeals = parseInt(metricMeals.textContent, 10) || 420;
      metricMeals.textContent = currentMeals + 30;
    }

    showToast('Surplus Listed!', 'Your surplus food has been listed for redistribution.');

    // Clear inputs
    donateFoodName.value = '';
    donateQuantity.value = '';
    pickupLocation.value = '';
    contactInfo.value = '';
    if (dietaryNotes) dietaryNotes.value = '';
  });
}

/**
 * Demo handler when an NGO user clicks "Claim for NGO" on the feed card.
 */
window.claimDonation = function(btn) {
  const card = btn.closest('.feed-card');
  const badge = card.querySelector('.badge');
  badge.className = 'badge badge-success';
  badge.textContent = 'Claimed by Local NGO';

  btn.outerHTML = '<span class="text-muted"><i class="fa-solid fa-circle-check text-emerald"></i> Volunteer Dispatched</span>';
  showToast('Pickup Dispatched', 'A local partner NGO has claimed this surplus donation package!');
};

/* ==========================================================================
   6. FOOD SAFETY ASSISTANT (HACCP RULE-BASED ENGINE)
   ========================================================================== */
function initSafetyAssistant() {
  const btnEvaluate = document.getElementById('btnEvaluateSafety');
  const resultContainer = document.getElementById('safetyResultContainer');

  const foodTypeSelect = document.getElementById('safetyFoodType');
  const storageSelect = document.getElementById('safetyStorage');
  const timeSelect = document.getElementById('safetyTime');

  if (!btnEvaluate) return;

  btnEvaluate.addEventListener('click', () => {
    const foodType = foodTypeSelect.value;
    const storage = storageSelect.value;
    const time = timeSelect.value;

    const evaluation = evaluateFoodSafety(foodType, storage, time);
    renderSafetyResult(evaluation);
  });
}

/**
 * Algorithmic safety logic based on USDA/FSSAI HACCP temperature danger zone.
 */
function evaluateFoodSafety(foodType, storage, time) {
  // Case 1: Extreme danger — Left at room temperature for over 4 hours for high-risk foods
  if ((storage === 'ambient-open' || storage === 'ambient-covered') && (time === '4-to-6' || time === 'over-6')) {
    if (foodType === 'cooked-gravy' || foodType === 'cooked-meat' || foodType === 'dairy-custard') {
      return {
        status: 'danger',
        badge: 'Do Not Redistribute',
        headline: 'Safety Risk: Temperature Danger Zone Exceeded',
        desc: 'Perishable cooked meals or dairy left at room temperature past 4 hours are prone to rapid bacterial proliferation (Bacillus cereus, Salmonella). It is unsafe for vulnerable community redistribution.',
        checklist: [
          { valid: false, text: 'Exceeded safe 2–4 hour ambient threshold' },
          { valid: false, text: 'Reheating does NOT destroy heat-stable bacterial toxins' },
          { valid: false, text: 'Recommend composting or organic biogas disposal instead' }
        ]
      };
    }
  }

  // Case 2: Open uncovered ambient storage
  if (storage === 'ambient-open') {
    return {
      status: 'caution',
      badge: 'Check Carefully / Potential Contamination',
      headline: 'Uncovered Ambient Exposure',
      desc: 'Food left uncovered at ambient conditions may have been exposed to airborne particulates, insects, or cross-contamination. Conduct a strict sensory check.',
      checklist: [
        { valid: false, text: 'Lack of lid/cover increases physical contamination risk' },
        { valid: true, text: 'If under 2 hours, transfer into clean airtight containers immediately' },
        { valid: false, text: 'Check odour, colour, and surface consistency' }
      ]
    };
  }

  // Case 3: Hot-held or refrigerated properly within 4 hours
  if ((storage === 'hot-held' || storage === 'refrigerated') && (time === 'under-2' || time === '2-to-4')) {
    return {
      status: 'good',
      badge: 'Suitable for Redistribution',
      headline: 'Optimal Freshness & Temperature Safe',
      desc: 'Food has been maintained outside the danger zone (<4°C or >60°C) and is within the recommended redistribution window. Ready for clean packing and NGO dispatch.',
      checklist: [
        { valid: true, text: 'Cold/hot chain maintained adequately' },
        { valid: true, text: 'Minimal microbial growth probability' },
        { valid: true, text: 'Pack in food-grade insulated containers for transit' }
      ]
    };
  }

  // Case 4: Dry bakery or raw produce (lower immediate risk)
  if (foodType === 'bakery-dry' || foodType === 'raw-produce') {
    if (time !== 'over-6' || storage === 'refrigerated') {
      return {
        status: 'good',
        badge: 'Suitable for Redistribution',
        headline: 'Low-Risk Category Surplus',
        desc: 'Dry breads and whole raw fruits possess lower moisture/water activity, making them resilient. Ensure packaging is intact without mold or moisture accumulation.',
        checklist: [
          { valid: true, text: 'Dry items have extended ambient stability' },
          { valid: true, text: 'Verify absence of mold spots or physical bruising' },
          { valid: true, text: 'Suitable for shelter food banks' }
        ]
      };
    }
  }

  // Default caution fallback
  return {
    status: 'caution',
    badge: 'Check Carefully Before Redistribution',
    headline: 'Marginal Freshness Window',
    desc: 'The item is nearing the limit of safe distribution. Conduct sensory tests (smell, touch, steam check) and prioritize urgent distribution within 60 minutes.',
    checklist: [
      { valid: false, text: 'Time window approaching critical 4-hour threshold' },
      { valid: true, text: 'Requires immediate pickup and consumption upon arrival' },
      { valid: true, text: 'Ensure recipient is notified to consume immediately' }
    ]
  };
}

function renderSafetyResult(evalData) {
  const badge = document.getElementById('safetyBadge');
  const headline = document.getElementById('safetyHeadline');
  const desc = document.getElementById('safetyExplanation');
  const checklist = document.getElementById('safetyChecklist');

  // Update badge class & content
  badge.className = `safety-status-badge status-${evalData.status}`;
  const icon = evalData.status === 'good'
    ? '<i class="fa-solid fa-circle-check"></i>'
    : evalData.status === 'caution'
      ? '<i class="fa-solid fa-triangle-exclamation"></i>'
      : '<i class="fa-solid fa-circle-xmark"></i>';
  badge.innerHTML = `${icon} ${evalData.badge}`;

  headline.textContent = evalData.headline;
  desc.textContent = evalData.desc;

  // Render checklist items
  checklist.innerHTML = evalData.checklist.map(item => `
    <div class="check-item">
      ${item.valid
        ? '<i class="fa-solid fa-check text-success"></i>'
        : '<i class="fa-solid fa-xmark" style="color: #ef4444;"></i>'}
      <span>${escapeHtml(item.text)}</span>
    </div>
  `).join('');

  showToast('Safety Assessment Complete', `Status: ${evalData.badge}`);
}

/* ==========================================================================
   7. PARTNER ORGANIZATIONS FILTER & CONNECT MODAL
   ========================================================================== */
function initOrgFiltersAndModal() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const orgCards = document.querySelectorAll('.org-card');

  // Filter Buttons
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterVal = pill.getAttribute('data-filter');

      orgCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Modal References
  const modal = document.getElementById('orgModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const connectBtns = document.querySelectorAll('.connect-org-btn');
  const modalOrgName = document.getElementById('modalOrgName');
  const connectOrgForm = document.getElementById('connectOrgForm');

  connectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const orgName = btn.getAttribute('data-org') || 'Partner Organization';
      modalOrgName.textContent = orgName;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
    });
  });

  const closeModal = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };

  if (modalClose) modalClose.addEventListener('click', closeModal);

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle modal submit
  if (connectOrgForm) {
    connectOrgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const org = modalOrgName.textContent;
      closeModal();
      connectOrgForm.reset();
      showToast('Request Dispatched', `Pickup handover request sent to ${org}! Their coordinator will contact you shortly.`);
    });
  }
}

/* ==========================================================================
   8. SECURITY HELPER
   ========================================================================== */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
