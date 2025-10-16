  // Close mobile menu when clicking a link
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse.classList.contains('show')) {
            bootstrap.Collapse.getInstance(navbarCollapse).hide();
        }
    });
});

// Smooth scroll for anchor links
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

// Animate stats on scroll
const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.stats-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach((stat, index) => {
                    const text = stat.textContent;
                    const hasPlus = text.includes('+');
                    const number = parseInt(text.replace(/\D/g, ''));
                    
                    let current = 0;
                    const increment = number / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            if (index === 3) {
                                stat.textContent = '4.8';
                            } else {
                                stat.textContent = number + (hasPlus ? 'K+' : '');
                            }
                            clearInterval(timer);
                        } else {
                            if (index === 3) {
                                stat.textContent = (current / 10).toFixed(1);
                            } else {
                                stat.textContent = Math.floor(current) + (hasPlus ? 'K+' : '');
                            }
                        }
                    }, 30);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    if (statsSection) {
        observer.observe(statsSection);
    }
};

// Initialize animations
animateStats();

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.value-card, .team-card, .mv-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    fadeObserver.observe(el);
});

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroAbout = document.querySelector('.hero-about');
    if (heroAbout && scrolled < 500) {
        heroAbout.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Team card hover effect enhancement
document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.team-image').style.transform = 'scale(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.querySelector('.team-image').style.transform = 'scale(1)';
    });
});