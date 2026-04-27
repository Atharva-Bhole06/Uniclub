import { useEffect, useRef } from 'react';

// Interactive element selectors that should show the pointer cursor
const POINTER_SELECTORS = 'a, button, input, select, textarea, label, [role="button"], [onclick]';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const isPointer = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const checkTarget = (e) => {
      const el = e.target;
      // Check if element or any ancestor is interactive
      const clickable = el.closest(POINTER_SELECTORS) ||
        window.getComputedStyle(el).cursor === 'pointer' ||
        el.getAttribute('onClick') !== null;

      if (clickable && !isPointer.current) {
        isPointer.current = true;
        cursor.classList.add('is-pointer');
      } else if (!clickable && isPointer.current) {
        isPointer.current = false;
        cursor.classList.remove('is-pointer');
      }
    };

    const handleMouseEnter = () => { cursor.style.opacity = '1'; };
    const handleMouseLeave = () => { cursor.style.opacity = '0'; };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', checkTarget);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', checkTarget);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cursorRef} id="custom-cursor">
      {/* Default arrow */}
      <svg className="cursor-arrow" width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 10 L26 16 L18 19 L14 28 Z" fill="#c9f28f" opacity="0.35"/>
        <path d="M5 5 L23 11 L15 14 L11 23 Z" fill="#0a0a0a" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      {/* Pointer / click cursor */}
      <svg className="cursor-pointer" width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {/* Rays */}
        <line x1="5" y1="1" x2="5" y2="4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="1" y1="5" x2="4" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2.5" y1="2.5" x2="4.5" y2="4.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="7.5" y1="2.5" x2="5.5" y2="4.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="2.5" y1="7.5" x2="4.5" y2="5.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        {/* Shadow */}
        <path d="M8 10 L26 16 L18 19 L14 28 Z" fill="#000000" opacity="0.35"/>
        {/* Arrow */}
        <path d="M5 5 L23 11 L15 14 L11 23 Z" fill="#c9f28f" stroke="#000000" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
