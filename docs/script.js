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


    /* Pencarian cepat berdasarkan nama produk dan kategori di Menu Lainnya. */
    const ciCatalogSearch = document.getElementById("ciCatalogSearch");
    const ciCatalogEmpty = document.getElementById("ciCatalogEmpty");

    if (ciCatalogSearch && ciCatalogEmpty) {
        const groups = Array.from(document.querySelectorAll("#lainnya .ci-catalog-group"));

        function filterCatalog() {
            const q = ciCatalogSearch.value.toLocaleLowerCase("id").trim();
            let totalShown = 0;
            groups.forEach(group => {
                let shown = 0;
                group.querySelectorAll(".ci-catalog-card").forEach(card => {
                    const title = (card.dataset.ciName || "").toLocaleLowerCase("id");
                    const category = (group.dataset.ciGroup || "").toLocaleLowerCase("id");
                    const match = !q || title.includes(q) || category.includes(q);
                    card.hidden = !match;
                    if (match) shown++;
                });
                group.hidden = shown === 0;
                totalShown += shown;
            });
            ciCatalogEmpty.hidden = totalShown !== 0;
        }

        ciCatalogSearch.addEventListener("input", filterCatalog);
        filterCatalog();
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

});
