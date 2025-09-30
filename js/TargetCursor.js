class TargetCursor {
  constructor({ targetSelector = '.cursor-target', spinDuration = 2, hideDefaultCursor = true } = {}) {
    this.targetSelector = targetSelector;
    this.spinDuration = spinDuration;
    this.hideDefaultCursor = hideDefaultCursor;

    this.cursorRef = null;
    this.cornersRef = null;
    this.spinTl = null;
    this.dotRef = null;

    this.constants = {
      borderWidth: 6,
      cornerSize: 12,
      parallaxStrength: 0.00005
    };

    this.activeTarget = null;
    this.currentTargetMove = null;
    this.currentLeaveHandler = null;
    this.isAnimatingToTarget = false;
    this.resumeTimeout = null;

    this.init();
  }

  init() {
    this.createCursorElement();
    this.setupEventListeners();
    this.createSpinTimeline();
  }

  createCursorElement() {
    const wrapper = document.createElement('div');
    wrapper.className = 'target-cursor-wrapper';

    const dot = document.createElement('div');
    dot.className = 'target-cursor-dot';

    const cornerTL = document.createElement('div');
    cornerTL.className = 'target-cursor-corner corner-tl';

    const cornerTR = document.createElement('div');
    cornerTR.className = 'target-cursor-corner corner-tr';

    const cornerBR = document.createElement('div');
    cornerBR.className = 'target-cursor-corner corner-br';

    const cornerBL = document.createElement('div');
    cornerBL.className = 'target-cursor-corner corner-bl';

    wrapper.appendChild(dot);
    wrapper.appendChild(cornerTL);
    wrapper.appendChild(cornerTR);
    wrapper.appendChild(cornerBR);
    wrapper.appendChild(cornerBL);

    document.body.appendChild(wrapper);

    this.cursorRef = wrapper;
    this.dotRef = dot;
    this.cornersRef = [cornerTL, cornerTR, cornerBR, cornerBL];

    if (this.hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    gsap.set(this.cursorRef, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
  }

  moveCursor(x, y) {
    if (!this.cursorRef) return;
    gsap.to(this.cursorRef, {
      x,
      y,
      duration: 0.1,
      ease: 'power3.out'
    });
  }

  createSpinTimeline() {
    if (this.spinTl) {
      this.spinTl.kill();
    }
    this.spinTl = gsap
      .timeline({ repeat: -1 })
      .to(this.cursorRef, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });
  }

  cleanupTarget(target) {
    if (this.currentTargetMove) {
      target.removeEventListener('mousemove', this.currentTargetMove);
    }
    if (this.currentLeaveHandler) {
      target.removeEventListener('mouseleave', this.currentLeaveHandler);
    }
    this.currentTargetMove = null;
    this.currentLeaveHandler = null;
  }

  updateCorners(target, mouseX, mouseY) {
    const rect = target.getBoundingClientRect();
    const cursorRect = this.cursorRef.getBoundingClientRect();

    const cursorCenterX = cursorRect.left + cursorRect.width / 2;
    const cursorCenterY = cursorRect.top + cursorRect.height / 2;

    const [tlc, trc, brc, blc] = this.cornersRef;

    const { borderWidth, cornerSize, parallaxStrength } = this.constants;

    let tlOffset = {
      x: rect.left - cursorCenterX - borderWidth,
      y: rect.top - cursorCenterY - borderWidth
    };
    let trOffset = {
      x: rect.right - cursorCenterX + borderWidth - cornerSize,
      y: rect.top - cursorCenterY - borderWidth
    };
    let brOffset = {
      x: rect.right - cursorCenterX + borderWidth - cornerSize,
      y: rect.bottom - cursorCenterY + borderWidth - cornerSize
    };
    let blOffset = {
      x: rect.left - cursorCenterX - borderWidth,
      y: rect.bottom - cursorCenterY + borderWidth - cornerSize
    };

    if (mouseX !== undefined && mouseY !== undefined) {
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;
      const mouseOffsetX = (mouseX - targetCenterX) * parallaxStrength;
      const mouseOffsetY = (mouseY - targetCenterY) * parallaxStrength;

      tlOffset.x += mouseOffsetX;
      tlOffset.y += mouseOffsetY;
      trOffset.x += mouseOffsetX;
      trOffset.y += mouseOffsetY;
      brOffset.x += mouseOffsetX;
      brOffset.y += mouseOffsetY;
      blOffset.x += mouseOffsetX;
      blOffset.y += mouseOffsetY;
    }

    const tl = gsap.timeline();
    const corners = [tlc, trc, brc, blc];
    const offsets = [tlOffset, trOffset, brOffset, blOffset];

    corners.forEach((corner, index) => {
      tl.to(
        corner,
        {
          x: offsets[index].x,
          y: offsets[index].y,
          duration: 0.2,
          ease: 'power2.out'
        },
        0
      );
    });
  }

  setupEventListeners() {
    const moveHandler = (e) => {
      // Nascondi il cursore custom quando si è sul canvas
      if (e.target.id === 'drawingCanvas' || e.target.closest('.canvas-wrapper')) {
        if (this.cursorRef) {
          this.cursorRef.style.opacity = '0';
        }
      } else {
        if (this.cursorRef) {
          this.cursorRef.style.opacity = '1';
        }
        this.moveCursor(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', moveHandler);

    const scrollHandler = () => {
      if (!this.activeTarget || !this.cursorRef) return;

      const mouseX = gsap.getProperty(this.cursorRef, 'x');
      const mouseY = gsap.getProperty(this.cursorRef, 'y');

      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === this.activeTarget ||
         elementUnderMouse.closest(this.targetSelector) === this.activeTarget);

      if (!isStillOverTarget) {
        if (this.currentLeaveHandler) {
          this.currentLeaveHandler();
        }
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!this.dotRef) return;
      gsap.to(this.dotRef, { scale: 0.85, duration: 0.3 });
      gsap.to(this.cursorRef, { scale: 0.95, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (!this.dotRef) return;
      gsap.to(this.dotRef, { scale: 1, duration: 0.3 });
      gsap.to(this.cursorRef, { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    const enterHandler = (e) => {
      const directTarget = e.target;

      const allTargets = [];
      let current = directTarget;
      while (current && current !== document.body) {
        if (current.matches(this.targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }

      const target = allTargets[0] || null;
      if (!target || !this.cursorRef || !this.cornersRef) return;

      if (this.activeTarget === target) return;

      if (this.activeTarget) {
        this.cleanupTarget(this.activeTarget);
      }

      if (this.resumeTimeout) {
        clearTimeout(this.resumeTimeout);
        this.resumeTimeout = null;
      }

      this.activeTarget = target;
      const corners = this.cornersRef;
      corners.forEach(corner => {
        gsap.killTweensOf(corner);
      });

      gsap.killTweensOf(this.cursorRef, 'rotation');
      this.spinTl?.pause();

      gsap.set(this.cursorRef, { rotation: 0 });

      this.isAnimatingToTarget = true;
      this.updateCorners(target);

      setTimeout(() => {
        this.isAnimatingToTarget = false;
      }, 1);

      let moveThrottle = null;
      const targetMove = (ev) => {
        if (moveThrottle || this.isAnimatingToTarget) return;
        moveThrottle = requestAnimationFrame(() => {
          this.updateCorners(target, ev.clientX, ev.clientY);
          moveThrottle = null;
        });
      };

      const leaveHandler = () => {
        this.activeTarget = null;
        this.isAnimatingToTarget = false;

        if (this.cornersRef) {
          const corners = this.cornersRef;
          gsap.killTweensOf(corners);

          const { cornerSize } = this.constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
          ];

          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              {
                x: positions[index].x,
                y: positions[index].y,
                duration: 0.3,
                ease: 'power3.out'
              },
              0
            );
          });
        }

        this.resumeTimeout = setTimeout(() => {
          if (!this.activeTarget && this.cursorRef && this.spinTl) {
            const currentRotation = gsap.getProperty(this.cursorRef, 'rotation');
            const normalizedRotation = currentRotation % 360;

            this.spinTl.kill();
            this.spinTl = gsap
              .timeline({ repeat: -1 })
              .to(this.cursorRef, { rotation: '+=360', duration: this.spinDuration, ease: 'none' });

            gsap.to(this.cursorRef, {
              rotation: normalizedRotation + 360,
              duration: this.spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => {
                this.spinTl?.restart();
              }
            });
          }
          this.resumeTimeout = null;
        }, 50);

        this.cleanupTarget(target);
      };

      this.currentTargetMove = targetMove;
      this.currentLeaveHandler = leaveHandler;

      target.addEventListener('mousemove', targetMove);
      target.addEventListener('mouseleave', leaveHandler);
    };

    window.addEventListener('mouseover', enterHandler, { passive: true });
  }

  destroy() {
    if (this.spinTl) {
      this.spinTl.kill();
    }
    if (this.cursorRef) {
      this.cursorRef.remove();
    }
    document.body.style.cursor = '';
  }
}