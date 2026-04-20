/* ========================================================================
   AMIBUCK — GSAP Animations & Interactions
   Editorial motion: large, confident, slow-in-fast-out reveals
   ======================================================================== */

(function () {
  "use strict";

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // =====================================================================
  // 1. CUSTOM CURSOR
  // =====================================================================
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  const isTouchDevice =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth <= 768;

  if (cursorDot && cursorRing && !isTouchDevice) {
    let mouseX = -100;
    let mouseY = -100;
    let cursorActive = false;

    // Activate custom cursor on first real mouse movement
    function activateCursor() {
      if (cursorActive) return;
      cursorActive = true;
      document.body.classList.add("has-custom-cursor");
    }

    // Dot follows mouse instantly via RAF for buttery smoothness
    function renderDot() {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      requestAnimationFrame(renderDot);
    }
    requestAnimationFrame(renderDot);

    // Track mouse position
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      activateCursor();

      // Ring follows with smooth GSAP lag
      gsap.to(cursorRing, {
        x: mouseX,
        y: mouseY,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    // Hover detection on interactive elements
    const hoverTargets = document.querySelectorAll(
      "a, button, .service-card, .work-card, .testimonial-card, .form-input, .tag"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursorDot.classList.add("is-hovering");
        cursorRing.classList.add("is-hovering");
      });
      el.addEventListener("mouseleave", () => {
        cursorDot.classList.remove("is-hovering");
        cursorRing.classList.remove("is-hovering");
      });
    });

    // Hide when mouse leaves browser window
    document.addEventListener("mouseleave", () => {
      document.body.classList.add("cursor-hidden");
    });
    document.addEventListener("mouseenter", () => {
      document.body.classList.remove("cursor-hidden");
    });

    // Also handle window blur/focus
    window.addEventListener("blur", () => {
      document.body.classList.add("cursor-hidden");
    });
    window.addEventListener("focus", () => {
      document.body.classList.remove("cursor-hidden");
    });
  } else {
    // Touch device or missing elements — hide cursor elements, keep default
    if (cursorDot) cursorDot.style.display = "none";
    if (cursorRing) cursorRing.style.display = "none";
  }

  // =====================================================================
  // 2. PRELOADER
  // =====================================================================
  const loader = document.getElementById("loader");
  const loaderBarFill = document.getElementById("loaderBarFill");
  const loaderCounter = document.getElementById("loaderCounter");

  function runPreloader() {
    const tl = gsap.timeline({
      onComplete: () => {
        // Reveal navbar
        gsap.to(".nav", {
          y: 0,
          duration: 0.8,
          ease: "expo.out",
        });
        // Start hero animations
        animateHero();
      },
    });

    // Counter + bar fill
    tl.to(
      { val: 0 },
      {
        val: 100,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: function () {
          const v = Math.round(this.targets()[0].val);
          if (loaderCounter) loaderCounter.textContent = v + "%";
          if (loaderBarFill) loaderBarFill.style.width = v + "%";
        },
      }
    );

    // Reveal — wipe up
    tl.to(
      loader,
      {
        yPercent: -100,
        duration: 1.2,
        ease: "expo.inOut",
      },
      "+=0.3"
    );
  }

  // =====================================================================
  // 3. HERO ANIMATIONS
  // =====================================================================
  function animateHero() {
    const heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // Split hero heading into characters for stagger
    const heroHeading = document.getElementById("heroHeading");
    if (heroHeading) {
      // Manual character split
      const originalText = heroHeading.innerHTML;
      const lines = originalText.split("<br");
      let charHTML = "";

      lines.forEach((line, i) => {
        // Handle lines that start with /> or >
        let cleanLine = line;
        if (i > 0) {
          cleanLine = line.replace(/^\s*\/?>?\s*/, "");
          charHTML += "<br />";
        }

        // Handle span elements
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = cleanLine;

        function processNode(node) {
          let result = "";
          node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const chars = child.textContent.split("");
              chars.forEach((char) => {
                if (char === " ") {
                  result += " ";
                } else {
                  result += `<span class="hero-char" style="display:inline-block;opacity:0;transform:translateY(80px)">${char}</span>`;
                }
              });
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              const tag = child.tagName.toLowerCase();
              const className = child.className;
              const innerProcessed = processNode(child);
              result += `<${tag} class="${className}">${innerProcessed}</${tag}>`;
            }
          });
          return result;
        }

        charHTML += processNode(tempDiv);
      });

      heroHeading.innerHTML = charHTML;
      gsap.set(heroHeading, { opacity: 1 });

      const chars = heroHeading.querySelectorAll(".hero-char");
      heroTl.to(
        chars,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.02,
          ease: "expo.out",
        },
        0
      );
    }

    // Eyebrow tags
    heroTl.to(
      ".hero-eyebrow",
      {
        opacity: 1,
        duration: 0.8,
      },
      0.3
    );

    // Bottom section
    heroTl.to(
      ".hero-bottom",
      {
        opacity: 1,
        duration: 0.8,
      },
      0.6
    );

    // Scroll indicator
    heroTl.to(
      ".hero-scroll-indicator",
      {
        opacity: 1,
        duration: 0.8,
      },
      1
    );
  }

  // =====================================================================
  // 4. CINEMATIC SCROLL ANIMATIONS
  // =====================================================================
  function initScrollReveals() {
    // --- Base reveals for .section-reveal elements ---
    const reveals = document.querySelectorAll(".section-reveal");
    reveals.forEach((el) => {
      gsap.fromTo(el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // --- Section heading wipe-in ---
    const headings = document.querySelectorAll(".section-heading");
    headings.forEach((heading) => {
      gsap.fromTo(heading,
        { clipPath: "inset(0 100% 0 0)", opacity: 0 },
        {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          duration: 1.4,
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: heading,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // --- Eyebrow labels slide in from left ---
    const eyebrows = document.querySelectorAll(".eyebrow-label");
    eyebrows.forEach((label) => {
      gsap.fromTo(label,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: label,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // --- Service cards cascade stagger ---
    const serviceCards = document.querySelectorAll(".service-card");
    if (serviceCards.length) {
      gsap.fromTo(serviceCards,
        { y: 80, opacity: 0, scale: 0.92 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Work cards slide in alternating ---
    const workCards = document.querySelectorAll(".work-card");
    workCards.forEach((card, i) => {
      const fromX = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card,
        { x: fromX, opacity: 0, rotateY: i % 2 === 0 ? 5 : -5 },
        {
          x: 0,
          opacity: 1,
          rotateY: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // --- Process steps sequential cascade ---
    const processSteps = document.querySelectorAll(".process-step");
    if (processSteps.length) {
      gsap.fromTo(processSteps,
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: processSteps[0],
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Stats counter reveal with scale ---
    const statItems = document.querySelectorAll(".stat-item");
    if (statItems.length) {
      gsap.fromTo(statItems,
        { y: 40, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "back.out(1.5)",
          scrollTrigger: {
            trigger: statItems[0],
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Team cards rise up from bottom ---
    const teamCards = document.querySelectorAll(".team-card");
    if (teamCards.length) {
      gsap.fromTo(teamCards,
        { y: 100, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".team-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- CTA section dramatic entry ---
    const ctaContent = document.querySelector(".cta-content");
    if (ctaContent) {
      gsap.fromTo(ctaContent,
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaContent,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Stagger testimonials container scale reveal ---
    const staggerTestimonials = document.querySelector(".stagger-testimonials");
    if (staggerTestimonials) {
      gsap.fromTo(staggerTestimonials,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: staggerTestimonials,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Footer slide up ---
    const footer = document.querySelector(".footer");
    if (footer) {
      gsap.fromTo(footer,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Section parallax backgrounds (subtle) ---
    const sections = document.querySelectorAll(".section");
    sections.forEach((section) => {
      gsap.fromTo(section,
        { backgroundPositionY: "0%" },
        {
          backgroundPositionY: "30%",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );
    });

    // --- Parallax for tags ---
    const tags = document.querySelectorAll(".tag");
    if (tags.length) {
      gsap.fromTo(tags,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power1.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // --- Multi-layer parallax depth effect ---
    const parallaxTrigger = document.querySelector("[data-parallax-layers]");
    if (parallaxTrigger) {
      const layerConfigs = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 },
      ];

      const plxTl = gsap.timeline({
        scrollTrigger: {
          trigger: parallaxTrigger,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      layerConfigs.forEach((cfg, idx) => {
        const els = parallaxTrigger.querySelectorAll(`[data-parallax-layer="${cfg.layer}"]`);
        if (els.length) {
          plxTl.to(els, { yPercent: cfg.yPercent, ease: "none" }, idx === 0 ? undefined : "<");
        }
      });
    }
  }

  // =====================================================================
  // 5. MARQUEE
  // =====================================================================
  function initMarquee() {
    const marqueeTrack = document.getElementById("marqueeTrack");
    if (!marqueeTrack) return;

    gsap.set(marqueeTrack, { xPercent: 0 });
    gsap.to(marqueeTrack, {
      xPercent: -50,
      repeat: -1,
      duration: 20,
      ease: "none",
    });
  }

  // =====================================================================
  // 6. COUNTER ANIMATIONS
  // =====================================================================
  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute("data-target"), 10);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: function () {
          counter.textContent = Math.round(obj.val).toLocaleString();
        },
        scrollTrigger: {
          trigger: counter,
          start: "top 85%",
          once: true,
        },
      });
    });
  }

  // =====================================================================
  // 7. HORIZONTAL SCROLL SECTION
  // =====================================================================
  function initHorizontalScroll() {
    const track = document.getElementById("horizontalTrack");
    if (!track) return;

    const panels = gsap.utils.toArray(".panel");
    if (panels.length <= 1) return;

    let mm = gsap.matchMedia();

    // Only apply horizontal scroll effect on desktop (above 768px)
    mm.add("(min-width: 769px)", () => {
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: ".horizontal-section",
          pin: true,
          scrub: 1,
          end: () => "+=" + track.scrollWidth,
          invalidateOnRefresh: true,
        },
      });
    });
  }

  // =====================================================================
  // 8. SERVICE CARD GLOW FOLLOW
  // =====================================================================
  function initCardGlow() {
    const cards = document.querySelectorAll(".service-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mouse-x", x + "%");
        card.style.setProperty("--mouse-y", y + "%");
      });
    });
  }

  // =====================================================================
  // 9. IMAGE PARALLAX
  // =====================================================================
  function initParallax() {
    const aboutImage = document.getElementById("aboutImage");
    if (!aboutImage) return;

    gsap.to(aboutImage, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: aboutImage,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // =====================================================================
  // 10. NAVIGATION
  // =====================================================================
  function initNavigation() {
    const hamburger = document.getElementById("navHamburger");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-menu-link");

    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
        document.body.style.overflow = mobileMenu.classList.contains("active")
          ? "hidden"
          : "";
      });

      mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileMenu.classList.remove("active");
          document.body.style.overflow = "";
        });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          e.preventDefault();
          const offset = 80; // nav height
          const top =
            target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });

    // Nav background on scroll
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
      const nav = document.getElementById("mainNav");
      if (!nav) return;
      const scrollY = window.scrollY;

      // Hide/show on scroll direction
      if (scrollY > lastScroll && scrollY > 50) {
        gsap.to(nav, {
          y: "-100%",
          duration: 0.4,
          ease: "power2.inOut",
          overwrite: "auto"
        });
      } else if (scrollY < lastScroll || scrollY <= 50) {
        gsap.to(nav, { y: 0, duration: 0, overwrite: "auto" });
      }

      lastScroll = scrollY;
    });
  }

  // =====================================================================
  // 11. CONTACT FORM
  // =====================================================================
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    // Service chip toggle
    const chips = form.querySelectorAll(".service-chip");
    const hiddenInput = document.getElementById("formServices");
    const selectedServices = new Set();

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const service = chip.getAttribute("data-service");
        if (selectedServices.has(service)) {
          selectedServices.delete(service);
          chip.classList.remove("active");
        } else {
          selectedServices.add(service);
          chip.classList.add("active");
        }
        if (hiddenInput) {
          hiddenInput.value = Array.from(selectedServices).join(", ");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const btn = document.getElementById("formSubmit");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Sending...</span>';
      btn.disabled = true;

      // Simulate send
      setTimeout(() => {
        form.innerHTML = `
          <div class="form-success">
            <div class="form-success-icon">✦</div>
            <p class="form-success-text">Message sent! We'll be in touch shortly.</p>
          </div>
        `;

        gsap.from(".form-success", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
        });
      }, 1500);
    });

    // Input focus animations
    const inputs = form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.addEventListener("focus", () => {
        gsap.to(input, {
          scale: 1.01,
          duration: 0.3,
          ease: "power1.out",
        });
      });
      input.addEventListener("blur", () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.3,
          ease: "power1.out",
        });
      });
    });
  }

  // =====================================================================
  // 12. WORK CARD HOVER PARALLAX
  // =====================================================================
  function initWorkCardHover() {
    const workCards = document.querySelectorAll(".work-card");
    workCards.forEach((card) => {
      const image = card.querySelector(".work-card-image");
      if (!image) return;

      card.addEventListener("mouseenter", () => {
        gsap.to(image, {
          scale: 1.05,
          duration: 0.6,
          ease: "power2.out",
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(image, {
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
        });
      });
    });
  }

  // =====================================================================
  // 13. THEME TOGGLE
  // =====================================================================
  function initThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    // Theme always starts 'light'.

    toggle.addEventListener("click", () => {
      document.body.classList.add("theme-switching");
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";

      document.documentElement.setAttribute("data-theme", next);
      
      // Clean up transition class
      setTimeout(() => {
        document.body.classList.remove("theme-switching");
      }, 500);

      // Spin the button for flair
      gsap.fromTo(toggle, { rotate: 0 }, { rotate: 360, duration: 0.5, ease: "power2.out" });
    });
  }

  // =====================================================================
  // INIT EVERYTHING
  // =====================================================================
  function init() {
    initThemeToggle();
    runPreloader();
    initScrollReveals();
    initMarquee();
    initCounters();
    initHorizontalScroll();
    initCardGlow();
    initParallax();
    initNavigation();
    initContactForm();
    initWorkCardHover();
    initAnimatedDock();
    initStaggerTestimonials();
  }

  // =====================================================================
  // 13.5. ANIMATED DOCK
  // =====================================================================
  function initAnimatedDock() {
    const dock = document.getElementById("animatedDock");
    if (!dock) return;
    const items = dock.querySelectorAll(".dock-item");
    if (!items.length) return;

    let baseWidth = window.innerWidth <= 768 ? 56 : 40;
    let maxWidth = window.innerWidth <= 768 ? 75 : 80;
    const maxDist = 150;
    let isHovering = false;
    let mousePos = Infinity;

    window.addEventListener("resize", () => {
      baseWidth = window.innerWidth <= 768 ? 56 : 40;
      maxWidth = window.innerWidth <= 768 ? 75 : 80;
      if (!isHovering) resetDock();
    });

    const isVertical = () => window.innerWidth > 768 && dock.classList.contains("vertical-dock");

    dock.addEventListener("mousemove", (e) => {
      isHovering = true;
      mousePos = isVertical() ? e.clientY : e.clientX;
      updateDock();
    });

    dock.addEventListener("mouseleave", () => {
      isHovering = false;
      mousePos = Infinity;
      resetDock();
    });

    function updateDock() {
      if (!isHovering) return;
      const vertical = isVertical();
      items.forEach(item => {
        const bounds = item.getBoundingClientRect();
        const itemCenter = vertical
          ? bounds.y + (bounds.height / 2)
          : bounds.x + (bounds.width / 2);

        let dist = mousePos - itemCenter;

        if (dist > maxDist) dist = maxDist;
        if (dist < -maxDist) dist = -maxDist;

        const absDist = Math.abs(dist);
        const progress = 1 - (absDist / maxDist);
        const targetSize = baseWidth + (maxWidth - baseWidth) * progress;
        const targetScale = 1 + (0.5 * progress);

        gsap.to(item, {
          width: targetSize,
          height: targetSize, // Scale height too
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto"
        });

        const svg = item.querySelector("svg");
        if (svg) {
          gsap.to(svg, {
            scale: targetScale,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    }

    function resetDock() {
      items.forEach(item => {
        gsap.to(item, {
          width: baseWidth,
          height: baseWidth,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
          overwrite: "auto"
        });
        const svg = item.querySelector("svg");
        if (svg) {
          gsap.to(svg, {
            scale: 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
            overwrite: "auto"
          });
        }
      });
    }
  }

  // =====================================================================
  // 14. STAGGER TESTIMONIALS
  // =====================================================================
  function initStaggerTestimonials() {
    const container = document.getElementById("staggerCardsContainer");
    const prevBtn = document.getElementById("staggerPrev");
    const nextBtn = document.getElementById("staggerNext");
    if (!container) return;

    const testimonials = [
      { quote: "AMIBUCK transformed our brand from forgettable to unforgettable. The attention to detail is obsessive — in the best way.", by: "Priya Sharma, CEO at Luxe Fashion", img: "https://i.pravatar.cc/150?img=1" },
      { quote: "They don't just build websites — they build experiences. Our conversion rate jumped 340% after the redesign.", by: "Rahul Verma, Founder at Nova Fintech", img: "https://i.pravatar.cc/150?img=2" },
      { quote: "Working with AMIBUCK felt like having a world-class in-house team. Responsive, creative, and razor-sharp on deadlines.", by: "Ananya Desai, CMO at Echo Music", img: "https://i.pravatar.cc/150?img=3" },
      { quote: "AMIBUCK's products make planning for the future seamless. Can't recommend them enough!", by: "Neha Gupta, CFO at FuturePlanning", img: "https://i.pravatar.cc/150?img=4" },
      { quote: "If I could give 11 stars, I'd give 12.", by: "Vikram Singh, Head of Design at CreativeSolutions", img: "https://i.pravatar.cc/150?img=5" },
      { quote: "SO HAPPY WE FOUND YOU GUYS! I'd bet you've saved me 100 hours so far.", by: "Karan Malhotra, Product Manager at TimeWise", img: "https://i.pravatar.cc/150?img=6" },
      { quote: "Took some convincing, but now that we're with AMIBUCK, we're never going back.", by: "Sneha Iyer, Marketing Director at BrandBuilders", img: "https://i.pravatar.cc/150?img=7" },
      { quote: "I would be lost without AMIBUCK's in-depth analytics. The ROI is EASILY 100X for us.", by: "Aditya Joshi, Data Scientist at AnalyticsPro", img: "https://i.pravatar.cc/150?img=8" },
      { quote: "It's just the best agency we've ever worked with. Period.", by: "Rohan Mehta, UX Designer at UserFirst", img: "https://i.pravatar.cc/150?img=9" },
      { quote: "I switched to AMIBUCK 2 years ago and never looked back.", by: "Arjun Reddy, DevOps Engineer at CloudMasters", img: "https://i.pravatar.cc/150?img=10" },
      { quote: "I've been searching for an agency like AMIBUCK for YEARS. So glad I finally found one!", by: "Suresh Nair, Sales Director at RevenueRockets", img: "https://i.pravatar.cc/150?img=11" },
      { quote: "It's so seamless and professional — we got the whole rebrand done in 2 weeks.", by: "Kavya Menon, HR Manager at TalentForge", img: "https://i.pravatar.cc/150?img=12" },
      { quote: "AMIBUCK's customer support is unparalleled. They're always there when we need them.", by: "Pooja Banerjee, CSM at ClientCare", img: "https://i.pravatar.cc/150?img=13" },
      { quote: "The efficiency gains we've seen since working with AMIBUCK are off the charts!", by: "Raj Patel, Operations Manager at StreamlineSolutions", img: "https://i.pravatar.cc/150?img=14" },
      { quote: "AMIBUCK has revolutionized how we handle our digital presence. It's a game-changer!", by: "Ishaan Kapoor, Workflow Specialist at ProcessPro", img: "https://i.pravatar.cc/150?img=15" },
      { quote: "The scalability of their solutions is impressive. It grows with our business seamlessly.", by: "Varun Chatterjee, Scaling Officer at GrowthGurus", img: "https://i.pravatar.cc/150?img=16" },
      { quote: "I appreciate how AMIBUCK continually innovates. They're always one step ahead.", by: "Riya Chakraborty, Innovation Lead at FutureTech", img: "https://i.pravatar.cc/150?img=17" },
      { quote: "The ROI we've seen with AMIBUCK is incredible. It's paid for itself many times over.", by: "Siddharth Rao, Finance Analyst at ProfitPeak", img: "https://i.pravatar.cc/150?img=18" },
      { quote: "Their platform is so robust, yet easy to use. It's the perfect balance.", by: "Aarav Pillai, Tech Lead at BalancedTech", img: "https://i.pravatar.cc/150?img=19" },
      { quote: "We've tried many agencies, but AMIBUCK stands out in terms of reliability and performance.", by: "Diya Agarwal, Performance Manager at ReliableSystems", img: "https://i.pravatar.cc/150?img=20" },
    ];

    let list = [...testimonials];
    let cardSize = window.matchMedia("(min-width: 640px)").matches ? 365 : 280;

    function renderCards() {
      container.innerHTML = "";
      const half = Math.floor(list.length / 2);

      list.forEach((t, index) => {
        const position = index - half;
        const isCenter = position === 0;

        const card = document.createElement("div");
        card.className = "stagger-card" + (isCenter ? " is-center" : "");
        card.style.width = cardSize + "px";
        card.style.height = cardSize + "px";

        const translateX = (cardSize / 1.5) * position;
        const translateY = isCenter ? -65 : (position % 2 ? 15 : -15);
        const rotate = isCenter ? 0 : (position % 2 ? 2.5 : -2.5);

        card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg)`;
        card.style.boxShadow = isCenter ? "0px 8px 0px 4px " + getComputedStyle(document.documentElement).getPropertyValue("--border").trim() : "none";

        card.innerHTML = `
          <img src="${t.img}" alt="${t.by.split(',')[0]}" class="stagger-card-avatar" />
          <h3 class="stagger-card-quote">"${t.quote}"</h3>
          <p class="stagger-card-author">- ${t.by}</p>
        `;

        card.addEventListener("click", () => handleMove(position));
        container.appendChild(card);
      });
    }

    function handleMove(steps) {
      if (steps === 0) return;
      if (steps > 0) {
        for (let i = 0; i < steps; i++) {
          list.push(list.shift());
        }
      } else {
        for (let i = 0; i < Math.abs(steps); i++) {
          list.unshift(list.pop());
        }
      }
      renderCards();
    }

    if (prevBtn) prevBtn.addEventListener("click", () => handleMove(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => handleMove(1));

    window.addEventListener("resize", () => {
      cardSize = window.matchMedia("(min-width: 640px)").matches ? 365 : 280;
      renderCards();
    });

    renderCards();
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
