/**
 * Video Background Controls
 * Handles video loading, play/pause, and optimization
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initVideoControls();
    });
    
    function initVideoControls() {
        const video = document.querySelector('.hero-video');
        const pauseBtn = document.getElementById('videoPauseBtn');
        const playPauseIcon = document.getElementById('playPauseIcon');
        
        if (!video || !pauseBtn) {
            console.warn('Video or controls not found');
            return;
        }
        
        // Handle video loading
        video.addEventListener('loadeddata', function() {
            video.setAttribute('data-loaded', 'true');
            console.log('Video loaded successfully');
        });
        
        // Handle video load error - fallback to image background
        video.addEventListener('error', function() {
            console.warn('Video failed to load, using fallback background');
            video.style.display = 'none';
            
            // Add fallback background image to hero-background
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.backgroundImage = 'url("img/gallery/hero.jpg")';
                heroBackground.style.backgroundSize = 'cover';
                heroBackground.style.backgroundPosition = 'center';
                heroBackground.style.backgroundRepeat = 'no-repeat';
            }
            
            // Hide video controls
            pauseBtn.style.display = 'none';
        });
        
        // Play/Pause functionality
        pauseBtn.addEventListener('click', function() {
            if (video.paused) {
                video.play();
                playPauseIcon.className = 'fas fa-pause';
                pauseBtn.setAttribute('aria-label', 'Pause video');
            } else {
                video.pause();
                playPauseIcon.className = 'fas fa-play';
                pauseBtn.setAttribute('aria-label', 'Play video');
            }
        });
        
        // Auto-pause when page is not visible (performance optimization)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                video.pause();
            } else if (!video.paused) {
                // Only auto-resume if it wasn't manually paused
                if (!video.hasAttribute('data-user-paused')) {
                    video.play();
                }
            }
        });
        
        // Track user-initiated pause
        video.addEventListener('pause', function() {
            if (!document.hidden) {
                video.setAttribute('data-user-paused', 'true');
            }
        });
        
        video.addEventListener('play', function() {
            video.removeAttribute('data-user-paused');
        });
        
        // Intersection Observer to pause video when hero is not visible
        if ('IntersectionObserver' in window) {
            const heroSection = document.querySelector('.hero-section');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Hero section is visible
                        if (!video.hasAttribute('data-user-paused')) {
                            video.play().catch(e => {
                                console.log('Auto-play prevented:', e);
                            });
                        }
                    } else {
                        // Hero section is not visible - pause for performance
                        video.pause();
                    }
                });
            }, {
                threshold: 0.1
            });
            
            if (heroSection) {
                observer.observe(heroSection);
            }
        }
        
        // Reduce motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            video.pause();
            pauseBtn.style.display = 'none';
            
            // Show message about reduced motion
            const reducedMotionNotice = document.createElement('div');
            reducedMotionNotice.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 20;
            `;
            reducedMotionNotice.textContent = 'Video paused due to reduced motion preference';
            document.querySelector('.hero-background').appendChild(reducedMotionNotice);
        }
        
        // Mobile-specific optimizations
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // On mobile, video might not autoplay due to browser policies
            video.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                }
            });
            
            // Show a play button overlay on mobile if video doesn't start
            setTimeout(() => {
                if (video.paused) {
                    showMobilePlayButton();
                }
            }, 1000);
        }
        
        function showMobilePlayButton() {
            const playOverlay = document.createElement('div');
            playOverlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(139, 21, 56, 0.9);
                color: white;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                cursor: pointer;
                z-index: 15;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                transition: all 0.3s ease;
            `;
            playOverlay.innerHTML = '<i class="fas fa-play"></i>';
            
            playOverlay.addEventListener('click', function() {
                video.play().then(() => {
                    playOverlay.remove();
                }).catch(e => {
                    console.log('Play failed:', e);
                });
            });
            
            document.querySelector('.hero-background').appendChild(playOverlay);
        }
        
        // Keyboard accessibility
        pauseBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pauseBtn.click();
            }
        });
        
        console.log('Video background controls initialized');
    }
})();