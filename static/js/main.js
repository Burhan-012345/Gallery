// Main JavaScript for Romantic Photo Gallery

class RomanticGallery {
  constructor() {
    this.init();
  }

  init() {
    this.setupThemeToggle();
    this.setupMusicToggle();
    this.setupFloatingHearts();
    this.setupSmoothScrolling();
    this.setupParallax();
    this.setupLoadingAnimations();
  }

  // Theme Toggle
  setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");

    // Check for saved theme or prefer color scheme
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    document.documentElement.classList.toggle("dark", savedTheme === "dark");
    themeIcon.className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";

    themeToggle?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";

      // Add transition class for smooth theme change
      document.body.classList.add("theme-transition");
      setTimeout(() => document.body.classList.remove("theme-transition"), 300);
    });
  }

  // Background Music
  setupMusicToggle() {
    const musicToggle = document.getElementById("musicToggle");
    const musicIcon = document.getElementById("musicIcon");
    const backgroundMusic = document.getElementById("backgroundMusic");

    let musicEnabled = localStorage.getItem("musicEnabled") === "true";

    if (backgroundMusic) {
      if (musicEnabled) {
        backgroundMusic
          .play()
          .catch((e) => console.log("Autoplay prevented:", e));
        musicIcon?.classList.add("text-pink-500");
      }

      musicToggle?.addEventListener("click", () => {
        musicEnabled = !musicEnabled;
        localStorage.setItem("musicEnabled", musicEnabled);

        if (musicEnabled) {
          backgroundMusic.play();
          musicIcon?.classList.add("text-pink-500");
          this.showNotification("🎵 Romantic music enabled");
        } else {
          backgroundMusic.pause();
          musicIcon?.classList.remove("text-pink-500");
          this.showNotification("🔇 Music disabled");
        }
      });
    }
  }

  // Floating Hearts Animation
  setupFloatingHearts() {
    if (document.getElementById("floatingHearts")) {
      setInterval(() => {
        this.createFloatingHeart();
      }, 2000);
    }
  }

  createFloatingHeart() {
    const heart = document.createElement("div");
    heart.innerHTML = "💖";
    heart.className = "floating-heart text-2xl";

    // Random position and animation
    const startPosition = Math.random() * window.innerWidth;
    const duration = 6 + Math.random() * 4;
    const size = 1 + Math.random();

    heart.style.left = `${startPosition}px`;
    heart.style.fontSize = `${size}rem`;
    heart.style.animationDuration = `${duration}s`;

    document.body.appendChild(heart);

    // Remove heart after animation
    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }

  // Smooth Scrolling
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }

  // Parallax Effect
  setupParallax() {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll(".parallax");

      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
      });
    });
  }

  // Loading Animations
  setupLoadingAnimations() {
    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-up");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Observe all photo items
    document.querySelectorAll(".photo-item").forEach((item) => {
      observer.observe(item);
    });
  }

  // Notification System
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === "info"
        ? "bg-blue-500"
        : type === "success"
        ? "bg-green-500"
        : type === "error"
        ? "bg-red-500"
        : "bg-purple-500"
    } text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add("translate-x-0", "opacity-100");
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("translate-x-0", "opacity-100");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Search Functionality
  setupSearch() {
    const searchInput = document.querySelector('input[name="q"]');
    const photoItems = document.querySelectorAll(".photo-item");

    searchInput?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();

      photoItems.forEach((item) => {
        const tags = item.dataset.tags?.toLowerCase() || "";
        const caption = item.dataset.caption?.toLowerCase() || "";

        if (tags.includes(query) || caption.includes(query)) {
          item.style.display = "block";
          item.classList.add("fade-in-up");
        } else {
          item.style.display = "none";
        }
      });
    });
  }
}

// Initialize the gallery when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.romanticGallery = new RomanticGallery();
});

// Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/static/js/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Handle online/offline status
window.addEventListener("online", () => {
  document.body.classList.remove("offline");
  window.romanticGallery?.showNotification("🌐 Back online!", "success");
});

window.addEventListener("offline", () => {
  document.body.classList.add("offline");
  window.romanticGallery?.showNotification("⚠️ You are offline", "error");
});
