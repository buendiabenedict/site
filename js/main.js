document.addEventListener('DOMContentLoaded', function() {
    const welcomeScreen = document.querySelector('.welcome-screen');
    const mainContent = document.querySelector('.main-content');
    const loadingProgress = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');
    
    // Function to preload all media
    function preloadMedia() {
        const media = [];
        let loaded = 0;
        
        // Get all images and videos
        const images = document.querySelectorAll('img[data-src]');
        const videos = document.querySelectorAll('video');
        const totalMedia = images.length + videos.length;
        
        if (totalMedia === 0) {
            showContent();
            return;
        }
        
        // Update progress function
        function updateProgress() {
            loaded++;
            const progress = Math.min(Math.round((loaded / totalMedia) * 100), 100);
            loadingProgress.style.width = `${progress}%`;
            loadingText.textContent = `Loading media... ${progress}%`;
            
            if (loaded >= totalMedia) {
                setTimeout(showContent, 500);
            }
        }
        
        // Load images
        images.forEach(img => {
            const image = new Image();
            image.onload = updateProgress;
            image.onerror = updateProgress;
            image.src = img.getAttribute('data-src');
            img.src = image.src;
            img.classList.add('loaded');
        });
        
        // Handle videos
        videos.forEach(video => {
            // Make sure video sources are properly set
            const sources = video.querySelectorAll('source');
            let sourcesLoaded = 0;
            
            sources.forEach(source => {
                const sourceVideo = document.createElement('video');
                sourceVideo.preload = 'auto';
                
                sourceVideo.onloadeddata = function() {
                    sourcesLoaded++;
                    if (sourcesLoaded >= sources.length) {
                        video.classList.add('loaded');
                        updateProgress();
                    }
                };
                
                sourceVideo.onerror = function() {
                    sourcesLoaded++;
                    updateProgress();
                };
                
                sourceVideo.src = source.src;
            });
            
            // If no sources, still count it as loaded
            if (sources.length === 0) {
                updateProgress();
            }
        });
    }
    
    // Function to show content
    function showContent() {
        loadingText.textContent = 'Almost there...';
        loadingProgress.style.width = '100%';
        
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            mainContent.style.display = 'block';
            void mainContent.offsetWidth;
            mainContent.classList.add('visible');
            
            // Play videos that should autoplay
            document.querySelectorAll('video[autoplay]').forEach(video => {
                video.muted = true; // Required for autoplay in most browsers
                video.playsInline = true; // For iOS
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.log('Autoplay prevented:', error);
                        video.controls = true;
                    });
                }
            });
            
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
            }, 1000);
        }, 500);
    }
    
    // Start preloading when DOM is ready
    preloadMedia();
    
    // Fallback in case preloading takes too long
    const loadTimeout = setTimeout(() => {
        if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            showContent();
        }
    }, 10000); // 10 second timeout
    
    // Clean up
    window.addEventListener('load', () => {
        clearTimeout(loadTimeout);
    });

    const navItems = document.querySelectorAll('.nav-item');
    
    // Function to update active nav item
    function updateActiveNav() {
        const scrollPosition = window.scrollY + 100;
        const sections = document.querySelectorAll('section[id]');
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // If at the very top, highlight home
        if (window.scrollY < 100) {
            currentSection = 'home';
        }
        
        // Update nav items
        document.querySelectorAll('.nav-item a, nav a').forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href && href.includes(currentSection)) {
                item.classList.add('active');
            }
        });
    }
    
    // Handle scroll events
    let isScrolling;
    window.addEventListener('scroll', function() {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(updateActiveNav, 100);
    }, { passive: true });
    
    // Handle click events for smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetId === '#home' ? 0 : targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active class immediately
                document.querySelectorAll('.nav-item a, nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
    
    // Initialize active nav on page load
    updateActiveNav();

    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .sample-item, .about-content > *');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial styles for animation
    document.querySelectorAll('.service-card, .sample-item, .about-content > *').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load

    // Email Copy Functionality
    const emailLink = document.getElementById('emailLink');
    const emailModal = document.getElementById('emailModal');
    const email = 'buendiabenedict08@gmail.com';
    let modalTimeout;

    // Function to show modal with smooth transition
    function showModal() {
        // Fade out main content
        mainContent.classList.add('fade-out');
        // Show modal
        emailModal.style.display = 'flex';
        // Trigger reflow to enable transition
        void emailModal.offsetWidth;
        emailModal.classList.add('active');
    }

    // Function to hide modal with smooth transition
    function hideModal() {
        // Remove fade from main content
        mainContent.classList.remove('fade-out');
        // Hide modal
        emailModal.classList.remove('active');
        clearTimeout(modalTimeout);
        // Wait for transition to complete before hiding
        setTimeout(() => {
            if (!emailModal.classList.contains('active')) {
                emailModal.style.display = 'none';
            }
        }, 400); // Match this with CSS transition duration
    }

    // Copy email to clipboard and show modal
    emailLink.addEventListener('click', function(e) {
        e.preventDefault();
        showModal();
        
        // Copy email to clipboard
        navigator.clipboard.writeText(email).then(function() {
            // Hide modal after 3 seconds
            modalTimeout = setTimeout(hideModal, 3000);
        }).catch(function(err) {
            // If copy fails, open default email client
            window.location.href = `mailto:${email}`;
            console.error('Could not copy text: ', err);
            hideModal();
        });
    });

    // Close modal when clicking outside
    emailModal.addEventListener('click', function(e) {
        if (e.target === emailModal) {
            hideModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModal();
        }
    });

    // Video initialization
    document.addEventListener('DOMContentLoaded', function() {
        const videos = document.querySelectorAll('.media-container video');
        
        // Function to handle video playback
        const handleVideoPlayback = (video) => {
            // Ensure video is muted for autoplay
            video.muted = true;
            video.playsInline = true;
            video.loop = true;
            
            // Try to play the video
            const playPromise = video.play();
            
            // Handle autoplay restrictions
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Autoplay prevented, showing play button');
                    // Add play button overlay if needed
                    const playButton = document.createElement('div');
                    playButton.className = 'play-button';
                    playButton.innerHTML = '▶';
                    playButton.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 3rem;
                        color: white;
                        cursor: pointer;
                        z-index: 10;
                        background: rgba(0,0,0,0.5);
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0.8;
                        transition: opacity 0.3s;
                    `;
                    playButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        video.play();
                        playButton.style.display = 'none';
                    });
                    video.parentNode.appendChild(playButton);
                });
            }
        };

        // Initialize each video
        videos.forEach(video => {
            // Set video attributes
            video.muted = true;
            video.playsInline = true;
            video.loop = true;
            
            // Handle click to play/pause
            video.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
            
            // Try to play when video is ready
            video.addEventListener('loadeddata', () => handleVideoPlayback(video));
            
            // Also try to play when the page is fully loaded
            window.addEventListener('load', () => handleVideoPlayback(video));
        });
        
        // Handle visibility changes (when tab becomes active)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                videos.forEach(video => {
                    if (isElementInViewport(video)) {
                        handleVideoPlayback(video);
                    }
                });
            }
        });
        
        // Check if element is in viewport
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    });
});
