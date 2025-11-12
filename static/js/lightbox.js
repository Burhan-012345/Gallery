// Lightbox functionality for Romantic Photo Gallery

class RomanticLightbox {
  constructor() {
    this.currentIndex = 0;
    this.photos = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    this.setupLightboxTriggers();
    this.setupKeyboardNavigation();
    this.setupTouchGestures();
  }

  // Setup click triggers for all photos
  setupLightboxTriggers() {
    document.addEventListener("click", (e) => {
      const photoCard = e.target.closest(".photo-card");
      if (photoCard) {
        const photoId = this.getPhotoIdFromCard(photoCard);
        if (photoId) {
          this.openLightbox(photoId);
        }
      }
    });
  }

  // Get photo ID from card element
  getPhotoIdFromCard(card) {
    const favoriteBtn = card.querySelector(".favorite-btn");
    return favoriteBtn ? parseInt(favoriteBtn.dataset.photoId) : null;
  }

  // Open lightbox with specific photo
  openLightbox(photoId) {
    // Get all photos from the current page
    this.photos = this.getAllPhotosFromPage();
    this.currentIndex = this.photos.findIndex((photo) => photo.id === photoId);

    if (this.currentIndex === -1) return;

    this.isOpen = true;
    this.createLightbox();
    this.showPhoto(this.currentIndex);
    this.disableBodyScroll();
  }

  // Get all photos from current page
  getAllPhotosFromPage() {
    const photoCards = document.querySelectorAll(".photo-card");
    return Array.from(photoCards)
      .map((card) => {
        const favoriteBtn = card.querySelector(".favorite-btn");
        const img = card.querySelector("img");
        const caption = card.querySelector(".line-clamp-2")?.textContent || "";
        const location =
          card.querySelector(".text-pink-500")?.textContent || "";
        const date = card.querySelector(".text-gray-500")?.textContent || "";

        return {
          id: favoriteBtn ? parseInt(favoriteBtn.dataset.photoId) : null,
          src: img ? img.src : "",
          caption: caption,
          location: location,
          date: date,
        };
      })
      .filter((photo) => photo.id !== null);
  }

  // Create lightbox HTML structure
  createLightbox() {
    // Remove existing lightbox
    this.removeLightbox();

    const lightboxHTML = `
            <div id="romanticLightbox" class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-500">
                <div class="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
                    <!-- Close Button -->
                    <button id="lightboxClose" class="absolute top-4 right-4 z-10 text-white hover:text-pink-300 transition-colors duration-300 transform hover:scale-110">
                        <i class="fas fa-times text-3xl"></i>
                    </button>

                    <!-- Navigation Arrows -->
                    <button id="lightboxPrev" class="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-pink-300 transition-colors duration-300 p-4">
                        <i class="fas fa-chevron-left text-3xl"></i>
                    </button>
                    <button id="lightboxNext" class="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-pink-300 transition-colors duration-300 p-4">
                        <i class="fas fa-chevron-right text-3xl"></i>
                    </button>

                    <!-- Photo Container -->
                    <div class="relative w-full h-full flex items-center justify-center">
                        <img id="lightboxImage" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl transform transition-all duration-500" 
                             src="" alt="">
                        
                        <!-- Loading Spinner -->
                        <div id="lightboxLoading" class="absolute inset-0 flex items-center justify-center">
                            <div class="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>

                    <!-- Photo Info -->
                    <div id="lightboxInfo" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white transform transition-transform duration-300">
                        <div class="max-w-4xl mx-auto">
                            <h3 id="lightboxCaption" class="text-xl font-semibold mb-2"></h3>
                            <div class="flex flex-wrap items-center justify-between text-sm opacity-90">
                                <div class="flex items-center space-x-4">
                                    <span id="lightboxLocation" class="flex items-center">
                                        <i class="fas fa-map-marker-alt mr-1"></i>
                                        <span></span>
                                    </span>
                                    <span id="lightboxDate" class="flex items-center">
                                        <i class="fas fa-calendar mr-1"></i>
                                        <span></span>
                                    </span>
                                </div>
                                <button id="lightboxFavorite" class="text-white hover:text-red-400 transition-colors duration-300 transform hover:scale-110">
                                    <i class="fas fa-heart text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Photo Counter -->
                    <div id="lightboxCounter" class="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        <span id="currentIndex">1</span> / <span id="totalPhotos">1</span>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", lightboxHTML);
    this.setupLightboxEvents();

    // Animate entrance
    setTimeout(() => {
      const lightbox = document.getElementById("romanticLightbox");
      if (lightbox) {
        lightbox.style.opacity = "1";
      }
    }, 10);
  }

  // Setup lightbox event listeners
  setupLightboxEvents() {
    // Close button
    document.getElementById("lightboxClose").addEventListener("click", () => {
      this.closeLightbox();
    });

    // Navigation buttons
    document.getElementById("lightboxPrev").addEventListener("click", () => {
      this.previousPhoto();
    });

    document.getElementById("lightboxNext").addEventListener("click", () => {
      this.nextPhoto();
    });

    // Favorite button
    document
      .getElementById("lightboxFavorite")
      .addEventListener("click", () => {
        this.toggleFavorite();
      });

    // Close on background click
    document
      .getElementById("romanticLightbox")
      .addEventListener("click", (e) => {
        if (e.target.id === "romanticLightbox") {
          this.closeLightbox();
        }
      });
  }

  // Show photo at specific index
  showPhoto(index) {
    if (index < 0 || index >= this.photos.length) return;

    this.currentIndex = index;
    const photo = this.photos[this.currentIndex];

    // Show loading
    const loading = document.getElementById("lightboxLoading");
    const image = document.getElementById("lightboxImage");
    loading.style.display = "flex";
    image.style.opacity = "0";

    // Load image
    const img = new Image();
    img.onload = () => {
      image.src = photo.src;
      image.alt = photo.caption;
      image.style.opacity = "1";
      loading.style.display = "none";

      // Update info
      this.updatePhotoInfo(photo);
      this.updateCounter();

      // Add entrance animation
      if (typeof gsap !== "undefined") {
        gsap.fromTo(
          image,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      }
    };
    img.onerror = () => {
      loading.style.display = "none";
      image.alt = "Failed to load image";
    };
    img.src = photo.src;
  }

  // Update photo information
  updatePhotoInfo(photo) {
    document.getElementById("lightboxCaption").textContent =
      photo.caption || "Our beautiful memory";
    document
      .getElementById("lightboxLocation")
      .querySelector("span").textContent =
      photo.location || "Somewhere special";
    document.getElementById("lightboxDate").querySelector("span").textContent =
      photo.date || "";

    // Update favorite button
    const favoriteBtn = document.getElementById("lightboxFavorite");
    // You would need to check if this photo is favorited from your data
    // For now, we'll assume it's not favorited
    favoriteBtn.querySelector("i").className = "fas fa-heart text-xl";
  }

  // Update photo counter
  updateCounter() {
    document.getElementById("currentIndex").textContent = this.currentIndex + 1;
    document.getElementById("totalPhotos").textContent = this.photos.length;
  }

  // Navigate to next photo
  nextPhoto() {
    if (this.currentIndex < this.photos.length - 1) {
      this.showPhoto(this.currentIndex + 1);
    } else {
      // Loop to first photo
      this.showPhoto(0);
    }
  }

  // Navigate to previous photo
  previousPhoto() {
    if (this.currentIndex > 0) {
      this.showPhoto(this.currentIndex - 1);
    } else {
      // Loop to last photo
      this.showPhoto(this.photos.length - 1);
    }
  }

  // Toggle favorite status
  async toggleFavorite() {
    const photo = this.photos[this.currentIndex];
    if (!photo) return;

    try {
      const response = await fetch(`/toggle_favorite/${photo.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const favoriteBtn = document.getElementById("lightboxFavorite");
      const icon = favoriteBtn.querySelector("i");

      if (data.is_favorite) {
        icon.className = "fas fa-heart text-xl text-red-500";
        // Add heart animation
        favoriteBtn.classList.add("animate-pulse");
        setTimeout(() => favoriteBtn.classList.remove("animate-pulse"), 600);
      } else {
        icon.className = "fas fa-heart text-xl";
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  // Close lightbox
  closeLightbox() {
    const lightbox = document.getElementById("romanticLightbox");
    if (lightbox) {
      lightbox.style.opacity = "0";
      setTimeout(() => {
        this.removeLightbox();
      }, 500);
    }
    this.enableBodyScroll();
    this.isOpen = false;
  }

  // Remove lightbox from DOM
  removeLightbox() {
    const existingLightbox = document.getElementById("romanticLightbox");
    if (existingLightbox) {
      existingLightbox.remove();
    }
  }

  // Disable body scroll when lightbox is open
  disableBodyScroll() {
    document.body.style.overflow = "hidden";
  }

  // Enable body scroll
  enableBodyScroll() {
    document.body.style.overflow = "";
  }

  // Keyboard navigation
  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
        case "Escape":
          this.closeLightbox();
          break;
        case "ArrowLeft":
          this.previousPhoto();
          break;
        case "ArrowRight":
          this.nextPhoto();
          break;
        case " ":
          e.preventDefault();
          this.toggleFavorite();
          break;
      }
    });
  }

  // Touch gestures for mobile
  setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener("touchstart", (e) => {
      if (this.isOpen) {
        touchStartX = e.changedTouches[0].screenX;
      }
    });

    document.addEventListener("touchend", (e) => {
      if (this.isOpen) {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }
    });

    this.handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          this.nextPhoto(); // Swipe left
        } else {
          this.previousPhoto(); // Swipe right
        }
      }
    };
  }
}

// Initialize lightbox when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.romanticLightbox = new RomanticLightbox();
});

// CSS for lightbox
const lightboxStyles = `
    #romanticLightbox {
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    #romanticLightbox .animate-pulse {
        animation: pulse 0.6s ease-in-out;
    }

    #lightboxInfo {
        transform: translateY(100%);
    }

    #romanticLightbox:hover #lightboxInfo {
        transform: translateY(0);
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
        #lightboxPrev, #lightboxNext {
            display: none;
        }
        
        #lightboxInfo {
            transform: translateY(0);
        }
    }
`;

// Add styles to document
if (!document.getElementById("lightboxStyles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "lightboxStyles";
  styleSheet.textContent = lightboxStyles;
  document.head.appendChild(styleSheet);
}
