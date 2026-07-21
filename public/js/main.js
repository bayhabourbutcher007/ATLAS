// Main JavaScript file for ATLAS frontend
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');

    const header = document.querySelector('header');
    const nav = header.querySelector('nav');

    if (nav) {
        nav.insertAdjacentElement('beforebegin', mobileMenuBtn);

        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('nav-open');
            this.classList.toggle('active');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                e.preventDefault();

                // Close mobile menu if open
                if (nav && nav.classList.contains('nav-open')) {
                    nav.classList.remove('nav-open');
                    mobileMenuBtn.classList.remove('active');
                }

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active navigation link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    function updateActiveNav() {
        let scrollPos = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < (top + sectionHeight)) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    // Call once on load to set initial state
    updateActiveNav();

    // Simple animation trigger for elements entering viewport
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    function checkIfInView() {
        const windowHeight = window.innerHeight;

        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    }

    window.addEventListener('scroll', checkIfInView);
    // Check on load in case elements are already in view
    checkIfInView();

    // Form handling (if any forms exist)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Basic form validation example
            const requiredInputs = form.querySelectorAll('[required]');
            let valid = true;

            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.classList.add('invalid');
                } else {
                    input.classList.remove('invalid');
                }
            });

            if (!valid) {
                e.preventDefault();
                alert('Please fill in all required fields');
            }
        });
    });

    // Add hover effect to feature cards for touch devices
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('hover');
        });

        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('hover');
            }, 500);
        });
    });

    // Add hover effect to module cards for touch devices
    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach(card => {
        card.addEventListener('touchstart', function() {
            this.classList.add('hover');
        });

        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('hover');
            }, 500);
        });
    });

    console.log('ATLAS frontend initialized');
});