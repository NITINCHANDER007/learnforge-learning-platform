import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor - Interactive Ambient Spotlight & Illuminated Grid FX
 *
 * Keeps the cursor as the natural, simple small OS arrow (from user reference),
 * while rendering the smooth moving ambient spotlight and illuminated grid lines
 * behind the arrow as the user moves their mouse.
 */
export default function CustomCursor() {
  const spotlightRef = useRef(null);
  const gridIlluminatedRef = useRef(null);
  const ripplesContainerRef = useRef(null);

  // Position states
  const mousePos = useRef({ x: -200, y: -200 });
  const spotlightPos = useRef({ x: -200, y: -200 });
  const rafId = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      if (isTouch) return false;
      return localStorage.getItem('custom_cursor_enabled') !== 'false';
    }
    return true;
  });

  // Listen to toggle events from Navbar or settings
  useEffect(() => {
    const handleToggle = () => {
      setIsEnabled(prev => {
        const next = !prev;
        localStorage.setItem('custom_cursor_enabled', String(next));
        return next;
      });
    };
    window.addEventListener('toggle-custom-cursor', handleToggle);
    return () => window.removeEventListener('toggle-custom-cursor', handleToggle);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => {
      createClickRipple(mousePos.current.x, mousePos.current.y);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth Ambient Spotlight Animation Loop
    const render = () => {
      // Ambient spotlight glides with smooth fluid easing across the grid behind the arrow
      spotlightPos.current.x += (mousePos.current.x - spotlightPos.current.x) * 0.16;
      spotlightPos.current.y += (mousePos.current.y - spotlightPos.current.y) * 0.16;

      // Update ambient spotlight on the dark grid
      if (spotlightRef.current) {
        spotlightRef.current.style.background = `radial-gradient(650px circle at ${spotlightPos.current.x}px ${spotlightPos.current.y}px, rgba(30, 64, 175, 0.32) 0%, rgba(30, 58, 138, 0.18) 32%, rgba(15, 23, 42, 0.06) 65%, transparent 75%)`;
      }

      // Update illuminated grid lines mask
      if (gridIlluminatedRef.current) {
        const mask = `radial-gradient(550px circle at ${spotlightPos.current.x}px ${spotlightPos.current.y}px, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.6) 40%, transparent 75%)`;
        gridIlluminatedRef.current.style.maskImage = mask;
        gridIlluminatedRef.current.style.webkitMaskImage = mask;
      }

      rafId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isEnabled, isVisible]);

  // Click shockwave particle effect
  const createClickRipple = (x, y) => {
    if (!ripplesContainerRef.current) return;
    const ripple = document.createElement('div');
    ripple.className = 'cursor-click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripplesContainerRef.current.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };

  if (!isEnabled) return null;

  return (
    <>
      {/* 1. Global Ambient Spotlight illuminating the grid behind the arrow cursor */}
      <div
        ref={spotlightRef}
        className={`cursor-ambient-spotlight ${isVisible ? 'visible' : ''}`}
      />

      {/* 2. Illuminated Grid Lines under the spotlight */}
      <div
        ref={gridIlluminatedRef}
        className={`cursor-grid-illuminated ${isVisible ? 'visible' : ''}`}
      />

      {/* 3. Click shockwave ripples */}
      <div ref={ripplesContainerRef} className="cursor-ripples-container" />

      <style>{`
        /* -------------------------------------------------------------
           INTERACTIVE BACKGROUND GRID SPOTLIGHT (BEHIND SIMPLE ARROW CURSOR)
           ------------------------------------------------------------- */
        .cursor-ambient-spotlight {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
          mix-blend-mode: screen;
        }

        .cursor-ambient-spotlight.visible {
          opacity: 1;
        }

        .cursor-grid-illuminated {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          background-image:
            linear-gradient(to right, rgba(96, 165, 250, 0.28) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(96, 165, 250, 0.28) 1px, transparent 1px);
          background-size: 80px 80px;
          transition: opacity 0.5s ease;
        }

        .cursor-grid-illuminated.visible {
          opacity: 1;
        }

        /* Click Ripple Container */
        .cursor-ripples-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 99998;
          overflow: hidden;
        }

        .cursor-click-ripple {
          position: absolute;
          width: 24px;
          height: 24px;
          margin-left: -12px;
          margin-top: -12px;
          border-radius: 50%;
          border: 1.5px solid rgba(96, 165, 250, 0.9);
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.7);
          animation: rippleExpand 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          pointer-events: none;
        }

        @keyframes rippleExpand {
          0% {
            transform: scale(0.4);
            opacity: 1;
          }
          100% {
            transform: scale(4.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
