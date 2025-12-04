/**
 * DJ Sanskaari x Broken Logic
 * Main JavaScript Logic
 */

// Fetch and Render Events
async function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const response = await fetch('data/events.json');
        const events = await response.json();

        if (events.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No upcoming events found.</div>';
            return;
        }

        container.innerHTML = events.map(event => {
            // Parse date to get Day and Month
            const dateObj = new Date(event.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' });

            return `
            <div class="event-card">
                <div class="event-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
                <div class="event-details" style="flex: 1;">
                    <div class="event-header">
                        <h3>${event.title}</h3>
                        <span class="event-status status-coming">Upcoming</span>
                    </div>
                    <div class="event-venue">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </div>
                    <div class="event-actions">
                        <a href="${event.ticketLink}" target="_blank" class="btn btn-sm btn-book">Book Now</a>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<div class="status-error">Failed to load events.</div>';
    }
}

// Fetch and Render Mixes
async function loadMixes() {
    const container = document.getElementById('mixes-container');
    if (!container) return;

    try {
        const response = await fetch('data/mixes.json');
        const mixes = await response.json();

        if (mixes.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No mixes found.</div>';
            return;
        }

        container.innerHTML = mixes.map(mix => `
            <div class="mix-card">
                <div class="mix-cover-wrapper">
                    <img src="${mix.imageUrl}" alt="${mix.title}" class="mix-cover">
                </div>
                <div class="mix-info">
                    <h3 class="mix-title">${mix.title}</h3>
                    <p class="mix-genre">${mix.genre}</p>
                    <a href="${mix.link}" target="_blank" class="mix-link">
                        <i class="fas fa-play"></i> Listen
                    </a>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading mixes:', error);
        container.innerHTML = '<div class="status-error">Failed to load mixes.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    loadMixes();

    // Existing code...
    // Initialize components
    initNavigation();
    initSmoothScroll();
    initParallax();
    initScrollAnimations();
    loadContent();
    initGallery();
    initBookingForm();
});

// Navigation Logic
function initNavigation() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileBtn.querySelector('i').classList.remove('fa-times');
            mobileBtn.querySelector('i').classList.add('fa-bars');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.padding = '0';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.8)';
        }
    });
}

// Smooth Scroll & Parallax
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        parallaxElements.forEach(el => {
            const speed = el.dataset.speed;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            } else {
                // Reset for re-animation
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(50px)'; // Increased distance for more dramatic effect
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-scroll]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        // "Butter" smooth transition
        el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
        observer.observe(el);
    });
}

// Content Loading
async function loadContent() {
    // Load Mixes
    try {
        const mixesResponse = await fetch('data/playlists.json');
        const mixes = await mixesResponse.json();
        const mixesContainer = document.getElementById('mixes-container');

        mixes.forEach(mix => {
            const mixCard = document.createElement('div');
            mixCard.className = 'mix-card';
            mixCard.setAttribute('data-scroll', ''); // Add scroll animation attribute
            mixCard.innerHTML = `
                <a href="${mix.link}" target="_blank">
                    <img src="${mix.cover}" alt="${mix.title}" class="mix-cover">
                    <div class="mix-info">
                        <h3 class="mix-title">${mix.title}</h3>
                        <span class="mix-link">Listen Now <i class="fas fa-play"></i></span>
                    </div>
                </a>
            `;
            mixesContainer.appendChild(mixCard);
        });

        // Re-init scroll animations for new elements
        initScrollAnimations();
    } catch (error) {
        console.error('Error loading mixes:', error);
    }

    // Load Events
    try {
        const eventsResponse = await fetch('data/events.json');
        const events = await eventsResponse.json();
        const eventsContainer = document.getElementById('events-container');

        events.forEach(event => {
            const date = new Date(event.date);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });

            // Determine status class
            let statusClass = 'status-available';
            let statusText = event.status || 'Available';
            let btnDisabled = '';
            let btnText = 'Book Now';
            let btnUrl = event.bookingUrl || '#';

            if (statusText === 'Sold Out') {
                statusClass = 'status-soldout';
                btnDisabled = 'disabled';
                btnText = 'Sold Out';
            } else if (statusText === 'Filling Fast') {
                statusClass = 'status-filling';
            } else if (statusText === 'Coming Soon') {
                statusClass = 'status-coming';
                btnDisabled = 'disabled';
                btnText = 'Coming Soon';
            }

            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.setAttribute('data-scroll', '');
            eventCard.innerHTML = `
                <div class="event-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
                <div class="event-details">
                    <div class="event-header">
                        <h3>${event.title}</h3>
                        <span class="event-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="event-venue">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue}</span>
                    </div>
                    <p>${event.description}</p>
                    ${event.bookingUrl || statusText === 'Sold Out' || statusText === 'Coming Soon' ? `
                    <div class="event-actions">
                        <a href="${btnUrl}" target="_blank" class="btn btn-sm btn-book ${btnDisabled}">
                            ${btnText} <i class="fas fa-ticket-alt"></i>
                        </a>
                    </div>
                    ` : ''}
                </div>
            `;
            eventsContainer.appendChild(eventCard);
        });

        // Re-init scroll animations for new elements
        initScrollAnimations();
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Gallery Logic
async function initGallery() {
    try {
        const response = await fetch('data/gallery.json');
        const items = await response.json();
        const track = document.getElementById('gallery-track');
        const modal = document.getElementById('gallery-modal');
        const modalContent = modal.querySelector('.modal-media-container');
        const modalClose = modal.querySelector('.modal-close');

        // Duplicate items for seamless scrolling
        const allItems = [...items, ...items];

        allItems.forEach(item => {
            const el = document.createElement('div');
            el.className = 'gallery-item';
            el.innerHTML = `
                <img src="${item.thumbnail}" alt="${item.caption}" class="gallery-media">
            `;

            el.addEventListener('click', () => {
                modal.classList.add('active');
                if (item.type === 'video') {
                    modalContent.innerHTML = `
                        <video controls autoplay class="modal-media" style="max-width:100%; max-height:80vh">
                            <source src="${item.url}" type="video/mp4">
                        </video>
                    `;
                } else {
                    modalContent.innerHTML = `
                        <img src="${item.url}" alt="${item.caption}" style="max-width:100%; max-height:80vh">
                    `;
                }
            });

            track.appendChild(el);
        });

        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            modalContent.innerHTML = '';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                modalContent.innerHTML = '';
            }
        });

        // Auto-Scroll Logic with Manual Override
        let scrollSpeed = 1; // Pixels per frame
        let isPaused = false;
        let animationId;

        const startAutoScroll = () => {
            if (!animationId) {
                autoScroll();
            }
        };

        const stopAutoScroll = () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        };

        const autoScroll = () => {
            if (!isPaused) {
                const scroller = document.querySelector('.gallery-scroller');
                if (scroller) {
                    scroller.scrollLeft += scrollSpeed;

                    // Reset if reached halfway (since we duplicated items)
                    // We need to calculate the width of a single set of items
                    // Approximate check: if scrollLeft is very large, reset?
                    // Better: Check if we are near the end.
                    // Since we have 2 sets, we can reset to 0 when we reach the start of the second set.
                    // However, exact pixel calculation might be tricky with dynamic content.
                    // Simple infinite loop approach:
                    if (scroller.scrollLeft >= (scroller.scrollWidth - scroller.clientWidth) - 10) {
                        scroller.scrollLeft = 0; // Snap back to start (imperfect but works for simple marquee)
                        // A better approach for seamless loop requires exact width measurement, 
                        // but let's try a simple "reset when end reached" first.
                        // Actually, for seamless, we should reset when we've scrolled past the first set.
                        // Let's assume the user has enough items.
                    }
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        };

        // Pause on interaction
        const scroller = document.querySelector('.gallery-scroller');
        scroller.addEventListener('mouseenter', () => isPaused = true);
        scroller.addEventListener('mouseleave', () => isPaused = false);
        scroller.addEventListener('touchstart', () => isPaused = true);
        scroller.addEventListener('touchend', () => {
            setTimeout(() => isPaused = false, 2000); // Resume after 2s delay
        });

        // Start
        startAutoScroll();

    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

// Booking Form Logic
function initBookingForm() {
    // Initialize Date Picker
    flatpickr("#date", {
        dateFormat: "d/m/Y",
        minDate: "today",
        theme: "dark",
        disableMobile: "true"
    });

    const form = document.getElementById('booking-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const statusDiv = document.getElementById('form-status');
        const originalBtnText = submitBtn.innerHTML;

        // Basic Validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
        });

        if (!isValid) {
            statusDiv.textContent = 'Please fill in all required fields.';
            statusDiv.className = 'form-status status-error';
            return;
        }

        // Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            // Call the Google Sheets integration function
            if (window.submitToGoogleSheets) {
                const result = await window.submitToGoogleSheets(new FormData(form));

                if (result.success) {
                    statusDiv.textContent = 'Request sent successfully! We will contact you soon.';
                    statusDiv.className = 'form-status status-success';
                    form.reset();
                } else {
                    throw new Error(result.message);
                }
            } else {
                console.warn('Google Sheets integration not loaded');
                // Fallback for demo
                setTimeout(() => {
                    statusDiv.textContent = 'Demo mode: Request simulated successfully.';
                    statusDiv.className = 'form-status status-success';
                    form.reset();
                }, 1000);
            }
        } catch (error) {
            console.error('Submission error:', error);
            statusDiv.textContent = 'Something went wrong. Please try again later.';
            statusDiv.className = 'form-status status-error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}
