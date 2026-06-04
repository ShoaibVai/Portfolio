/**
 * TargetCursor — vanilla JS port of the React Bits <TargetCursor /> component.
 *
 * Renders a custom targeting cursor (dot + spinning corner brackets) that
 * locks onto any element matching `targetSelector` (default: ".cursor-target").
 *
 * Options (passed to TargetCursor.init):
 *   - targetSelector   string   CSS selector for hover targets (default ".cursor-target")
 *   - spinDuration     number   seconds per full spin (default 2)
 *   - hideDefaultCursor boolean hide the OS cursor while active (default true)
 *   - hoverDuration    number   seconds to lock onto a target (default 0.2)
 *   - parallaxOn       boolean  subtle parallax of corners over a target (default true)
 *
 * Usage:
 *   <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
 *   <link rel="stylesheet" href="css/TargetCursor.min.css">
 *   <script src="js/TargetCursor.min.js" defer></script>
 *   <script>window.addEventListener('load', () => TargetCursor.init());</script>
 */
(function (global) {
  'use strict';

  const DEFAULTS = {
    targetSelector: '.cursor-target',
    spinDuration: 2,
    hideDefaultCursor: true,
    hoverDuration: 0.2,
    parallaxOn: true
  };

  const CONSTANTS = {
    borderWidth: 3,
    cornerSize: 12
  };

  // A position: fixed element is positioned relative to the viewport UNLESS an
  // ancestor establishes a containing block (transform, perspective, filter,
  // will-change of those, or contain). When that happens, the cursor's translate
  // no longer maps to viewport coordinates, so we measure and compensate for it.
  function getContainingBlock(element) {
    let node = element && element.parentElement;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (
        style.transform !== 'none' ||
        style.perspective !== 'none' ||
        style.filter !== 'none' ||
        style.willChange.indexOf('transform') !== -1 ||
        style.willChange.indexOf('perspective') !== -1 ||
        style.willChange.indexOf('filter') !== -1 ||
        /paint|layout|strict|content/.test(style.contain)
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function getContainingBlockOffset(block) {
    if (!block) return { x: 0, y: 0 };
    const rect = block.getBoundingClientRect();
    return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
  }

  function isMobileDevice() {
    if (typeof window === 'undefined') return false;
    const hasTouchScreen = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent);
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }

  function createCursorDOM() {
    const wrapper = document.createElement('div');
    wrapper.className = 'target-cursor-wrapper';

    const dot = document.createElement('div');
    dot.className = 'target-cursor-dot';

    const corners = ['tl', 'tr', 'br', 'bl'].map((pos) => {
      const corner = document.createElement('div');
      corner.className = 'target-cursor-corner corner-' + pos;
      return corner;
    });

    wrapper.appendChild(dot);
    corners.forEach((c) => wrapper.appendChild(c));
    return { wrapper, dot, corners };
  }

  function init(options) {
    if (typeof gsap === 'undefined') {
      console.warn('[TargetCursor] GSAP is not loaded; cursor disabled.');
      return null;
    }
    if (isMobileDevice()) {
      return null;
    }

    const opts = Object.assign({}, DEFAULTS, options || {});
    const { wrapper, dot, corners } = createCursorDOM();
    document.body.appendChild(wrapper);

    const state = {
      cursor: wrapper,
      dot: dot,
      corners: corners,
      containingBlock: getContainingBlock(wrapper),
      spinTl: null,
      tickerFn: null,
      activeTarget: null,
      currentLeaveHandler: null,
      resumeTimeout: null,
      targetCornerPositions: null,
      // Wrapper object so gsap can tween the `current` property (mirrors React's useRef).
      activeStrengthRef: { current: 0 },
      moveHandler: null,
      enterHandler: null,
      scrollHandler: null,
      mouseDownHandler: null,
      mouseUpHandler: null,
      resizeHandler: null,
      originalCursor: document.body.style.cursor
    };

    function getOffset() {
      state.containingBlock = getContainingBlock(state.cursor);
      return getContainingBlockOffset(state.containingBlock);
    }

    function moveCursor(x, y) {
      if (!state.cursor) return;
      const off = getContainingBlockOffset(state.containingBlock);
      gsap.to(state.cursor, {
        x: x - off.x,
        y: y - off.y,
        duration: 0.1,
        ease: 'power3.out'
      });
    }

    function cleanupTarget(target) {
      if (state.currentLeaveHandler) {
        target.removeEventListener('mouseleave', state.currentLeaveHandler);
      }
      state.currentLeaveHandler = null;
    }

    function createSpinTimeline() {
      if (state.spinTl) {
        state.spinTl.kill();
      }
      state.spinTl = gsap
        .timeline({ repeat: -1 })
        .to(state.cursor, { rotation: '+=360', duration: opts.spinDuration, ease: 'none' });
    }

    function tickerFn() {
      if (!state.targetCornerPositions || !state.cursor || !state.corners) return;
      const strength = state.activeStrengthRef.current;
      if (strength === 0) return;

      const cursorX = gsap.getProperty(state.cursor, 'x');
      const cursorY = gsap.getProperty(state.cursor, 'y');

      state.corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');
        const targetX = state.targetCornerPositions[i].x - cursorX;
        const targetY = state.targetCornerPositions[i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? (opts.parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    }

    if (opts.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const initialOffset = getOffset();
    gsap.set(state.cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y
    });

    createSpinTimeline();
    state.tickerFn = tickerFn;

    state.moveHandler = function (e) { moveCursor(e.clientX, e.clientY); };
    window.addEventListener('mousemove', state.moveHandler);

    state.scrollHandler = function () {
      if (!state.activeTarget || !state.cursor) return;
      const off = getOffset();
      const mouseX = gsap.getProperty(state.cursor, 'x') + off.x;
      const mouseY = gsap.getProperty(state.cursor, 'y') + off.y;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === state.activeTarget ||
          elementUnderMouse.closest(opts.targetSelector) === state.activeTarget);
      if (!isStillOverTarget && state.currentLeaveHandler) {
        state.currentLeaveHandler();
      }
    };
    window.addEventListener('scroll', state.scrollHandler, { passive: true });

    state.mouseDownHandler = function () {
      if (!state.dot) return;
      gsap.to(state.dot, { scale: 0.7, duration: 0.3 });
      gsap.to(state.cursor, { scale: 0.9, duration: 0.2 });
    };
    state.mouseUpHandler = function () {
      if (!state.dot) return;
      gsap.to(state.dot, { scale: 1, duration: 0.3 });
      gsap.to(state.cursor, { scale: 1, duration: 0.2 });
    };
    window.addEventListener('mousedown', state.mouseDownHandler);
    window.addEventListener('mouseup', state.mouseUpHandler);

    state.enterHandler = function (e) {
      const directTarget = e.target;
      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches && current.matches(opts.targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !state.cursor || !state.corners) return;
      if (state.activeTarget === target) return;
      if (state.activeTarget) {
        cleanupTarget(state.activeTarget);
      }
      if (state.resumeTimeout) {
        clearTimeout(state.resumeTimeout);
        state.resumeTimeout = null;
      }

      state.activeTarget = target;
      state.corners.forEach((corner) => gsap.killTweensOf(corner));

      gsap.killTweensOf(state.cursor, 'rotation');
      if (state.spinTl) state.spinTl.pause();
      gsap.set(state.cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const off = getOffset();
      const cursorX = gsap.getProperty(state.cursor, 'x');
      const cursorY = gsap.getProperty(state.cursor, 'y');

      state.targetCornerPositions = [
        { x: rect.left - CONSTANTS.borderWidth - off.x, y: rect.top - CONSTANTS.borderWidth - off.y },
        { x: rect.right + CONSTANTS.borderWidth - CONSTANTS.cornerSize - off.x, y: rect.top - CONSTANTS.borderWidth - off.y },
        { x: rect.right + CONSTANTS.borderWidth - CONSTANTS.cornerSize - off.x, y: rect.bottom + CONSTANTS.borderWidth - CONSTANTS.cornerSize - off.y },
        { x: rect.left - CONSTANTS.borderWidth - off.x, y: rect.bottom + CONSTANTS.borderWidth - CONSTANTS.cornerSize - off.y }
      ];

      state.activeStrengthRef.current = 0;
      gsap.ticker.add(state.tickerFn);

      gsap.to(state.activeStrengthRef, {
        current: 1,
        duration: opts.hoverDuration,
        ease: 'power2.out'
      });

      state.corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: state.targetCornerPositions[i].x - cursorX,
          y: state.targetCornerPositions[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = function () {
        gsap.ticker.remove(state.tickerFn);
        state.activeTarget = null;
        state.targetCornerPositions = null;
        gsap.set(state.activeStrengthRef, { current: 0, overwrite: true });
        state.activeStrengthRef.current = 0;

        if (state.corners) {
          const positions = [
            { x: -CONSTANTS.cornerSize * 1.5, y: -CONSTANTS.cornerSize * 1.5 },
            { x: CONSTANTS.cornerSize * 0.5, y: -CONSTANTS.cornerSize * 1.5 },
            { x: CONSTANTS.cornerSize * 0.5, y: CONSTANTS.cornerSize * 0.5 },
            { x: -CONSTANTS.cornerSize * 1.5, y: CONSTANTS.cornerSize * 0.5 }
          ];
          const tl = gsap.timeline();
          state.corners.forEach((corner, index) => {
            tl.to(
              corner,
              { x: positions[index].x, y: positions[index].y, duration: 0.3, ease: 'power3.out' },
              0
            );
          });
        }

        state.resumeTimeout = setTimeout(function () {
          if (!state.activeTarget && state.cursor && state.spinTl) {
            const currentRotation = gsap.getProperty(state.cursor, 'rotation');
            const normalizedRotation = currentRotation % 360;
            state.spinTl.kill();
            state.spinTl = gsap
              .timeline({ repeat: -1 })
              .to(state.cursor, { rotation: '+=360', duration: opts.spinDuration, ease: 'none' });
            gsap.to(state.cursor, {
              rotation: normalizedRotation + 360,
              duration: opts.spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: function () {
                if (state.spinTl) state.spinTl.restart();
              }
            });
          }
          state.resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      state.currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };
    window.addEventListener('mouseover', state.enterHandler, { passive: true });

    state.resizeHandler = function () {
      state.containingBlock = getContainingBlock(state.cursor);
    };
    window.addEventListener('resize', state.resizeHandler);

    // Tear-down helper so dev tools / SPA navigation can dispose cleanly.
    state.destroy = function () {
      if (state.tickerFn) gsap.ticker.remove(state.tickerFn);
      window.removeEventListener('mousemove', state.moveHandler);
      window.removeEventListener('mouseover', state.enterHandler);
      window.removeEventListener('scroll', state.scrollHandler);
      window.removeEventListener('resize', state.resizeHandler);
      window.removeEventListener('mousedown', state.mouseDownHandler);
      window.removeEventListener('mouseup', state.mouseUpHandler);
      if (state.activeTarget) cleanupTarget(state.activeTarget);
      if (state.spinTl) state.spinTl.kill();
      if (state.resumeTimeout) clearTimeout(state.resumeTimeout);
      document.body.style.cursor = state.originalCursor;
      if (state.cursor && state.cursor.parentNode) {
        state.cursor.parentNode.removeChild(state.cursor);
      }
    };

    return state;
  }

  global.TargetCursor = {
    init: init,
    defaults: DEFAULTS
  };
})(typeof window !== 'undefined' ? window : this);
