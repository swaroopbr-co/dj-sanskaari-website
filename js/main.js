/**
 * DJ Sanskaari x Broken Logic
 * Main JavaScript Logic
 */

// Fetch and Render Events
async function loadEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        console.log('Events loaded:', events);

        if (events.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No upcoming events found.</div>';
            return;
        }

        container.innerHTML = events.map(event => {
            // Parse date to get Day and Month
            const dateObj = new Date(event.date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('default', { month: 'short' });

            // Status Logic
            const statusMap = {
                'coming': { text: 'Upcoming', class: 'status-coming' },
                'available': { text: 'Tickets Available', class: 'status-available' },
                'filling': { text: 'Filling Fast', class: 'status-filling' },
                'soldout': { text: 'Sold Out', class: 'status-soldout' },
                'concluded': { text: 'Concluded', class: 'status-soldout' } // Re-use soldout style or add new one
            };

            const statusInfo = statusMap[event.status] || statusMap['coming']; // Default to coming

            const showBookButton = event.ticketLink && event.status !== 'concluded';
            const locationDisplay = event.location ? `<i class="fas fa-map-marker-alt"></i> ${event.location}` : '';

            return `
            <div class="event-card">
                <div class="event-date">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
                <div class="event-details" style="flex: 1;">
                    <div class="event-header">
                        <h3>${event.title}</h3>
                        <span class="event-status ${statusInfo.class}">${statusInfo.text}</span>
                    </div>
                    <div class="event-venue">
                        ${locationDisplay}
                    </div>
                    <div class="event-actions">
                        ${showBookButton ? `<a href="${event.ticketLink}" target="_blank" class="btn btn-sm btn-book">Book Now</a>` : ''}
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
        const response = await fetch('/api/mixes');
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

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI components first
    initNavigation();
    initSmoothScroll();
    initParallax();
    initScrollAnimations();
    initBookingForm();

    // Load Data Sequentially to prevent server overload
    try {
        await loadEvents();
    } catch (e) { console.error('Events failed', e); }

    try {
        await loadMixes();
    } catch (e) { console.error('Mixes failed', e); }

    try {
        await initGallery();
    } catch (e) { console.error('Gallery failed', e); }
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

    // const observer = new IntersectionObserver((entries) => {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             entry.target.style.opacity = '1';
    //             entry.target.style.transform = 'translateY(0)';
    //         } else {
    //             // Reset for re-animation
    //             // entry.target.style.opacity = '0';
    //             // entry.target.style.transform = 'translateY(50px)';
    //         }
    //     });
    // }, observerOptions);

    // document.querySelectorAll('[data-scroll]').forEach(el => {
    //     // el.style.opacity = '0'; // DISABLED: Ensure visibility
    //     // el.style.transform = 'translateY(50px)';
    //     // "Butter" smooth transition
    //     el.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
    //     // observer.observe(el);
    // });
}

// Content Loading - REMOVED (Replaced by loadEvents and loadMixes)

// Gallery Logic
async function initGallery() {
    try {
        const response = await fetch('/api/gallery');
        const items = await response.json();
        console.log('Gallery items loaded:', items);
        const track = document.getElementById('gallery-track');
        const modal = document.getElementById('gallery-modal');
        const modalContent = modal.querySelector('.modal-media-container');
        const modalClose = modal.querySelector('.modal-close');

        // No duplication for static gallery
        const allItems = items;

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

        // Manual Navigation
        const scroller = document.querySelector('.gallery-scroller');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');

        if (prevBtn && nextBtn && scroller) {
            prevBtn.addEventListener('click', () => {
                scroller.scrollBy({ left: -300, behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                scroller.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }
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
