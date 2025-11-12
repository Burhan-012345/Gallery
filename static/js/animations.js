// Custom animations for Romantic Photo Gallery

class RomanticAnimations {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupPageTransitions();
    this.setupLoveEffects();
  }

  // Scroll animations using GSAP and ScrollTrigger
  setupScrollAnimations() {
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Animate photo cards on scroll
      gsap.utils.toArray(".photo-item").forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 60,
            rotationY: -5,
          },
          {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
            ease: "power2.out",
          }
        );
      });

      // Parallax effect for background elements
      gsap.to(".parallax-bg", {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: ".parallax-bg",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

  // Hover effects for interactive elements
  setupHoverEffects() {
    // Photo card hover effects
    const photoCards = document.querySelectorAll(".photo-card");
    photoCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        this.animateCardHover(card, true);
      });

      card.addEventListener("mouseleave", () => {
        this.animateCardHover(card, false);
      });
    });

    // Button hover effects
    const buttons = document.querySelectorAll(".btn-romantic, button, a");
    buttons.forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        this.createRipple(e);
      });
    });
  }

  // Card hover animation
  animateCardHover(card, isHovering) {
    if (typeof gsap !== "undefined") {
      if (isHovering) {
        gsap.to(card, {
          y: -8,
          rotationY: 2,
          rotationX: 2,
          duration: 0.3,
          ease: "power2.out",
        });

        // Animate the heart icon
        const heart = card.querySelector(".favorite-btn");
        if (heart) {
          gsap.to(heart, {
            scale: 1.1,
            duration: 0.2,
            ease: "back.out(1.7)",
          });
        }
      } else {
        gsap.to(card, {
          y: 0,
          rotationY: 0,
          rotationX: 0,
          duration: 0.3,
          ease: "power2.out",
        });

        const heart = card.querySelector(".favorite-btn");
        if (heart) {
          gsap.to(heart, {
            scale: 1,
            duration: 0.2,
          });
        }
      }
    }
  }

  // Ripple effect for buttons
  createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${
      event.clientX - button.getBoundingClientRect().left - radius
    }px`;
    circle.style.top = `${
      event.clientY - button.getBoundingClientRect().top - radius
    }px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  }

  // Page transition animations
  setupPageTransitions() {
    // Animate page load
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        "main",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
    }

    // Add loading animation for images
    this.setupImageLoading();
  }

  // Image loading animations
  setupImageLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach((img) => {
      // Add loading class
      img.classList.add("loading-image");

      img.addEventListener("load", () => {
        img.classList.remove("loading-image");
        img.classList.add("loaded-image");

        // Add subtle scale animation when image loads
        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            img,
            { scale: 1.1 },
            { scale: 1, duration: 0.5, ease: "power2.out" }
          );
        }
      });

      img.addEventListener("error", () => {
        img.classList.remove("loading-image");
        img.classList.add("error-image");
      });
    });
  }

  // Romantic love effects
  setupLoveEffects() {
    // Create floating hearts occasionally
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.createFloatingHeart();
      }
    }, 5000);

    // Add romantic cursor effect
    this.setupRomanticCursor();
  }

  // Create floating heart animation
  createFloatingHeart() {
    const heart = document.createElement("div");
    heart.innerHTML = "💖";
    heart.style.cssText = `
            position: fixed;
            top: 100%;
            left: ${Math.random() * 100}%;
            font-size: ${1 + Math.random()}rem;
            pointer-events: none;
            z-index: 1000;
            opacity: 0.8;
            animation: floatHeart 8s linear forwards;
        `;

    document.body.appendChild(heart);

    // Remove after animation
    setTimeout(() => {
      heart.remove();
    }, 8000);
  }

  // Romantic cursor effect
  setupRomanticCursor() {
    if (window.innerWidth > 768) {
      // Only on desktop
      document.addEventListener("mousemove", (e) => {
        this.createCursorTrail(e);
      });
    }
  }

  // Cursor trail effect
  createCursorTrail(event) {
    const trail = document.createElement("div");
    trail.innerHTML = "•";
    trail.style.cssText = `
            position: fixed;
            left: ${event.clientX}px;
            top: ${event.clientY}px;
            color: #ec4899;
            pointer-events: none;
            z-index: 10000;
            font-size: 12px;
            opacity: 0.6;
            animation: cursorTrail 0.6s linear forwards;
        `;

    document.body.appendChild(trail);

    setTimeout(() => {
      trail.remove();
    }, 600);
  }

  // Romantic text animation for headers
  animateRomanticText(element) {
    if (typeof gsap !== "undefined") {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }
  }

  // Celebration animation for special events
  celebrate() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.createFloatingHeart();
      }, i * 100);
    }
  }
}

// CSS for animations
const style = document.createElement("style");
style.textContent = `
    @keyframes floatHeart {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes cursorTrail {
        0% {
            transform: scale(1);
            opacity: 0.6;
        }
        100% {
            transform: scale(0.1);
            opacity: 0;
        }
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .loading-image {
        opacity: 0;
        transform: scale(0.9);
    }

    .loaded-image {
        opacity: 1;
        transform: scale(1);
        transition: all 0.5s ease;
    }

    .error-image {
        opacity: 0.5;
        background: #f3f4f6;
    }
`;

document.head.appendChild(style);

// Initialize animations when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.romanticAnimations = new RomanticAnimations();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = RomanticAnimations;
}
