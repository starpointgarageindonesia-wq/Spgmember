/* =========================================================
   CIRENG INDI - SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SLIDE NAVIGATION
    ===================================================== */

    const slides = document.querySelectorAll(".slide");

    const navItems = document.querySelectorAll(
        ".bottom-nav .nav-item"
    );

    function showSlide(targetId) {

        if (!targetId) return;

        const target = targetId.replace("#", "");

        let found = false;

        slides.forEach((slide) => {

            const slideId = slide.id;

            if (slideId === target) {
                slide.classList.add("active");
                found = true;
            } else {
                slide.classList.remove("active");
            }

        });

        if (!found && slides.length > 0) {
            slides[0].classList.add("active");
            return;
        }

        navItems.forEach((item) => {

            const itemTarget =
                item.getAttribute("href") ||
                (item.dataset.slide ? "#"+item.dataset.slide : item.dataset.target);

            if (itemTarget === `#${target}`) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =====================================================
       NAVIGATION CLICK
    ===================================================== */

    navItems.forEach((item) => {

        item.addEventListener("click", (event) => {

            const target =
                item.getAttribute("href") ||
                (item.dataset.slide ? "#"+item.dataset.slide : item.dataset.target);

            if (!target || !target.startsWith("#")) {
                return;
            }

            event.preventDefault();

            showSlide(target);

            history.replaceState(
                null,
                "",
                target
            );
        });

    });


    /* =====================================================
       LOAD SLIDE DARI URL
    ===================================================== */

    const initialHash = window.location.hash;

    if (initialHash) {
        showSlide(initialHash);
    } else if (slides.length > 0) {

        slides.forEach((slide, index) => {
            slide.classList.toggle(
                "active",
                index === 0
            );
        });

        if (navItems.length > 0) {
            navItems[0].classList.add("active");
        }
    }


    /* =====================================================
       BACK / FORWARD BROWSER
    ===================================================== */

    window.addEventListener("hashchange", () => {
        showSlide(window.location.hash);
    });


    /* Katalog produk menampilkan harga tanpa tombol pesan. Hubungi melalui menu Kontak. */

    /* =====================================================
       INSTAGRAM
    ===================================================== */

    const instagramURL =
        "https://www.instagram.com/indi_fanova_ownercireng/";

    const instagramLinks =
        document.querySelectorAll(
            'a[href*="instagram.com"]'
        );

    instagramLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

            window.open(
                instagramURL,
                "_blank",
                "noopener,noreferrer"
            );

        });

    });


    /* =====================================================
       GOOGLE MAPS
    ===================================================== */

    const mapsURL =
        "https://maps.app.goo.gl/2qNE6KGMzMpn4ZcU8";

    const mapLinks =
        document.querySelectorAll(
            'a[href*="maps"], a[href*="google.com/maps"]'
        );

    mapLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

            window.open(
                mapsURL,
                "_blank",
                "noopener,noreferrer"
            );

        });

    });


    /* Dua katalog terpisah, masing-masing dengan pencarian dalam halamannya sendiri. */
    document.querySelectorAll(".ci-catalog-section").forEach(section => {
        const input = section.querySelector(".ci-catalog-search-input");
        const empty = section.querySelector(".ci-catalog-empty");
        const groups = Array.from(section.querySelectorAll(".ci-catalog-group"));
        if (!input || !empty || !groups.length) return;

        const filterProducts = () => {
            const q = input.value.toLocaleLowerCase("id").trim();
            let visibleTotal = 0;

            groups.forEach(group => {
                const categoryName = (group.dataset.ciGroup || "").toLocaleLowerCase("id");
                let visibleHere = 0;

                group.querySelectorAll(".ci-catalog-card").forEach(card => {
                    const productName = (card.dataset.ciName || "").toLocaleLowerCase("id");
                    const matched = !q || productName.includes(q) || categoryName.includes(q);
                    card.hidden = !matched;
                    if (matched) visibleHere++;
                });

                group.hidden = visibleHere === 0;
                visibleTotal += visibleHere;
            });

            empty.hidden = visibleTotal > 0;
        };

        input.addEventListener("input", filterProducts);
        filterProducts();
    });

    /* Old links to the previously separate Menu Lainnya page lead to the
       combined Cireng & Camilan page. */
    if (window.location.hash === "#lainnya") {
        history.replaceState(null, "", "#cireng");
        showSlide("#cireng");
    }

    /* Dokumentasi owner dan tenant — slideshow header Home */
    const ciStoryCarousel = document.getElementById("ciOwnerTenantSlider");
    if (ciStoryCarousel) {
        const frames = Array.from(ciStoryCarousel.querySelectorAll("[data-ci-story-slide]"));
        const dots = Array.from(ciStoryCarousel.querySelectorAll("[data-ci-to]"));
        const counter = ciStoryCarousel.querySelector("[data-ci-story-count]");
        const prefersReducedMotion = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let currentPhoto = 0;
        let isHovering = false;
        let isFocused = false;
        let startTouchX = null;

        function setPhoto(index) {
            if (!frames.length) return;
            currentPhoto = (index + frames.length) % frames.length;

            frames.forEach((frame, i) => {
                const isCurrent = i === currentPhoto;
                frame.classList.toggle("ci-is-current", isCurrent);
                frame.setAttribute("aria-hidden", isCurrent ? "false" : "true");
            });

            dots.forEach((dot, i) => {
                const isCurrent = i === currentPhoto;
                dot.classList.toggle("ci-is-current", isCurrent);
                dot.setAttribute("aria-pressed", isCurrent ? "true" : "false");
            });

            if (counter) counter.textContent =
                String(currentPhoto + 1).padStart(2, "0");
        }

        ciStoryCarousel.addEventListener("click", (event) => {
            const arrow = event.target.closest("[data-ci-step]");
            const dot = event.target.closest("[data-ci-to]");
            if (arrow) setPhoto(currentPhoto + Number(arrow.dataset.ciStep));
            else if (dot) setPhoto(Number(dot.dataset.ciTo));
        });

        ciStoryCarousel.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            event.stopPropagation();
            setPhoto(currentPhoto + (event.key === "ArrowRight" ? 1 : -1));
        });

        ciStoryCarousel.addEventListener("mouseenter", () => {
            isHovering = true;
        });
        ciStoryCarousel.addEventListener("mouseleave", () => {
            isHovering = false;
        });
        ciStoryCarousel.addEventListener("focusin", () => {
            isFocused = true;
        });
        ciStoryCarousel.addEventListener("focusout", (event) => {
            if (!ciStoryCarousel.contains(event.relatedTarget)) {
                isFocused = false;
            }
        });

        ciStoryCarousel.addEventListener("touchstart", (event) => {
            startTouchX = event.touches[0]?.clientX ?? null;
        }, { passive: true });
        ciStoryCarousel.addEventListener("touchend", (event) => {
            if (startTouchX === null) return;
            const endX = event.changedTouches[0]?.clientX;
            const deltaX = typeof endX === "number" ? endX - startTouchX : 0;
            startTouchX = null;
            if (Math.abs(deltaX) > 40) {
                setPhoto(currentPhoto + (deltaX < 0 ? 1 : -1));
            }
        }, { passive: true });

        if (!prefersReducedMotion && frames.length > 1) {
            window.setInterval(() => {
                // Don't move photos while hidden, hovered, or keyboard-operated.
                if (document.hidden || isHovering || isFocused) return;
                if (ciStoryCarousel.getClientRects().length === 0) return;
                setPhoto(currentPhoto + 1);
            }, 4500);
        }

        setPhoto(0);
    }


    /* CIRENG INDI REVEAL ON SCROLL
       Adds gentle motion only when supported and desired.
       Without JavaScript, or if reduced motion is requested, all content
       remains visible and usable. */
    const ciReduceMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const ciSaveData = Boolean(navigator.connection?.saveData);
    if (ciSaveData) document.body.classList.add("ci-save-data");

    if (!ciReduceMotion && !ciSaveData && "IntersectionObserver" in window) {
        const revealTargets = Array.from(document.querySelectorAll([
            ".ci-catalog-heading",
            ".ci-catalog-subheading",
            ".ci-catalog-card",
            ".ci-paket-heading",
            ".ci-paket-card",
            ".ci-home-overview",
            ".ci-home-details",
            "#kontak .contact-card",
            "#kontak .maps-card"
        ].join(",")));

        if (revealTargets.length) {
            const ciRevealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("ci-inview");
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.06, rootMargin: "0px 0px -5% 0px" });

            revealTargets.forEach((el, index) => {
                const delay = el.classList.contains("ci-catalog-card")
                    ? (index % 4) * 58
                    : el.classList.contains("ci-paket-card") ? (index % 2) * 95 : 0;
                el.style.setProperty("--ci-reveal-delay", delay + "ms");
                el.classList.add("ci-reveal");
                ciRevealObserver.observe(el);
            });
            document.body.classList.add("ci-motion-enabled");
        }
    }

    /* Pause ambient visual effects when the tab is not visible. */
    const ciPauseMotion = () => {
        document.body.classList.toggle("ci-page-paused", document.hidden);
    };
    document.addEventListener("visibilitychange", ciPauseMotion);
    ciPauseMotion();

});
