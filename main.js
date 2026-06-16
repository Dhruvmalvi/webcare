// Custom Cursor
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Add slight delay for the outline for a smooth trailing effect
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 150, fill: 'forwards' });
});

// Add hover effect to interactive elements for the custom cursor
const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-item');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorOutline.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
        cursorOutline.style.borderColor = 'rgba(168, 85, 247, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorOutline.style.backgroundColor = 'transparent';
        cursorOutline.style.borderColor = 'rgba(168, 85, 247, 0.5)';
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.add('scrolled'); // Force glass effect even at top or remove class based on preference.
        // Actually, let's keep it dynamic:
        if(window.scrollY === 0) navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger icon (optional enhancement)
    const bars = mobileMenuBtn.querySelectorAll('.bar');
    if (navLinks.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const bars = mobileMenuBtn.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    });
});

// Typing Effect
const typingTextElement = document.getElementById('typing-text');
const roles = ['Frontend Developer', 'UI/UX Enthusiast', 'Web Architect', 'Freelancer'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;

function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        typingTextElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingDelay = 50; // Delete faster
    } else {
        typingTextElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingDelay = 100; // Type slower
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingDelay = 2000; // Pause at the end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingDelay = 500; // Pause before typing next
    }

    setTimeout(typeEffect, typingDelay);
}

// Start typing effect
setTimeout(typeEffect, 1000);

// Scroll Reveal Animations using Intersection Observer
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: unobserve if you only want the animation to happen once
            // observer.unobserve(entry.target); 
        } else {
            // Remove active class when scrolling up to allow re-animation
            entry.target.classList.remove('active');
        }
    });
};

const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Trigger slightly before the element is in view
    threshold: 0.1
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});

// Form submission handler
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalContent = btn.innerHTML;
    
    // Extract form data
    const nameInput = document.getElementById('name').value;
    const emailInput = document.getElementById('email').value;
    const messageInput = document.getElementById('message').value;

    // Create message object
    const newMessage = {
        name: nameInput,
        email: emailInput,
        message: messageInput
    };

    try {
        // Send to backend
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newMessage)
        });

        if (response.ok) {
            const savedMessage = await response.json();
            
            // Also save to localStorage for the admin dashboard
            const messages = JSON.parse(localStorage.getItem('webcare_messages')) || [];
            messages.push(savedMessage);
            localStorage.setItem('webcare_messages', JSON.stringify(messages));
            
            // Animate button on success
            btn.innerHTML = '<span>Message Sent!</span> <i class="fa-solid fa-check"></i>';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.background = '';
                e.target.reset();
            }, 3000);
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error:', error);
        btn.innerHTML = '<span>Error! Try again.</span>';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        
        setTimeout(() => {
            btn.innerHTML = originalContent;
            btn.style.background = '';
        }, 3000);
    }
});

// Track page view
fetch('/api/views/increment', { method: 'POST' }).catch(err => console.error('Failed to increment views', err));
