/**
 * Video Background Controls
 * Handles video loading, play/pause, and optimization
 */

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initVideoControls();
        handleResponsiveVideoBackground();
    });
    
    // Handle responsive switching between video and static background
    function handleResponsiveVideoBackground() {
        function checkScreenSize() {
            const isMobile = window.innerWidth <= 768;
            const video = document.querySelector('.hero-video');
            const videoControls = document.querySelector('.video-controls');
            const heroBackground = document.querySelector('.hero-background');
            
            if (isMobile) {
                // Mobile: Hide video, show static background
                if (video) {
                    video.style.display = 'none';
                    video.pause();
                }
                if (videoControls) {
                    videoControls.style.display = 'none';
                }
                if (heroBackground) {
                    heroBackground.style.background = 'linear-gradient(135deg, #fff8ee 0%, #f7f3ec 100%)';
                }
                console.log('Switched to mobile view - static background');
            } else {
                // Desktop: Show video, hide static background
                if (video) {
                    video.style.display = 'block';
                    if (!video.hasAttribute('data-user-paused')) {
                        video.play().catch(e => console.log('Auto-play prevented:', e));
                    }
                }
                if (videoControls) {
                    videoControls.style.display = 'block';
                }
                if (heroBackground) {
                    heroBackground.style.background = '';
                }
                console.log('Switched to desktop view - video background');
            }
        }
        
        // Check on load
        checkScreenSize();
        
        // Check on resize with throttling
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkScreenSize, 250);
        });
    }
    
    function initVideoControls() {
        const video = document.querySelector('.hero-video');
        const pauseBtn = document.getElementById('videoPauseBtn');
        const playPauseIcon = document.getElementById('playPauseIcon');
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        if (isMobile) {
            console.log('Mobile device detected - using static background instead of video');
            
            // Hide video and controls on mobile
            if (video) {
                video.style.display = 'none';
                video.remove();
            }
            if (pauseBtn) {
                pauseBtn.style.display = 'none';
            }
            
            // Set original gradient background for mobile
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.background = 'linear-gradient(135deg, #fff8ee 0%, #f7f3ec 100%)';
            }
            
            return; // Exit function - no video functionality on mobile
        }
        
        if (!video || !pauseBtn) {
            console.warn('Video or controls not found');
            return;
        }
        
        // Handle video loading
        video.addEventListener('loadeddata', function() {
            video.setAttribute('data-loaded', 'true');
            console.log('Video loaded successfully');
        });
        
        // Handle video load error - fallback to image background (desktop only)
        video.addEventListener('error', function() {
            console.warn('Video failed to load, using fallback background');
            video.style.display = 'none';
            
            // Add fallback to original gradient background
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.background = 'linear-gradient(135deg, #fff8ee 0%, #f7f3ec 100%)';
            }
            
            // Hide video controls
            if (pauseBtn) {
                pauseBtn.style.display = 'none';
            }
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
        
        // Note: Mobile devices will use static background instead of video
        
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