// System Next IT - Landing Page Scripts

document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Chat button functionality
    const chatButton = document.querySelector('.chat-button');
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            // Add your chat functionality here
            alert('Chat feature coming soon!');
        });
    }

    // Pagination dots functionality
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            // Add your carousel logic here
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.main-nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.showcase-card, .step-card, .pricing-card, .feature-badge').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Book a Call button handlers
    document.querySelectorAll('.btn-primary, .btn-hero-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            // Add your booking logic here
            window.location.href = '/book-call'; // Or open a modal
        });
    });

    // Subscribe button handlers
    document.querySelectorAll('.btn-subscribe').forEach(btn => {
        btn.addEventListener('click', function() {
            const planName = this.closest('.pricing-card').querySelector('.plan-name').textContent;
            // Add your subscription logic here
            console.log('Subscribe to:', planName);
            // window.location.href = `/subscribe?plan=${planName.toLowerCase()}`;
        });
    });

    // View Website button handlers
    document.querySelectorAll('.btn-showcase').forEach(btn => {
        btn.addEventListener('click', function() {
            // Add your website view logic here
            alert('Opening website preview...');
        });
    });

    console.log('System Next IT Landing Page Loaded Successfully!');
});
