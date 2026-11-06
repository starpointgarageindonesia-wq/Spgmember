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


    /* =====================================================
       WHATSAPP
    ===================================================== */

    const whatsappNumber = "6282254710903";

    function openWhatsApp(message) {

        const encodedMessage =
            encodeURIComponent(message);

        const url =
            `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }


    /* =====================================================
       PRODUCT ORDER BUTTON
    ===================================================== */

    const orderButtons =
        document.querySelectorAll(".order-btn");

    orderButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const card =
                button.closest(".product-card");

            if (!card) return;

            const productName =
                card.querySelector("h3")?.textContent.trim()
                || "Produk Cireng Indi";

            const price =
                card.querySelector(".price")?.textContent.trim()
                || "";

            const select =
                card.querySelector("select");

            let option = "";

            if (select) {
                option =
                    select.options[
                        select.selectedIndex
                    ]?.textContent.trim()
                    || "";
            }

            let message =
                `Halo Cireng Indi, saya ingin memesan:\n\n` +
                `Produk: ${productName}`;

            if (option) {
                message +=
                    `\nPilihan: ${option}`;
            }

            if (price) {
                message +=
                    `\nHarga: ${price}`;
            }

            message +=
                `\n\nMohon informasi selanjutnya. Terima kasih.`;

            openWhatsApp(message);

        });

    });


    /* WhatsApp links retain the phone numbers in original HTML. */

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


    /* =====================================================
       SELECT PRODUK
       UPDATE HARGA OTOMATIS
    ===================================================== */

    const productCards =
        document.querySelectorAll(".product-card");

    productCards.forEach((card) => {

        const select =
            card.querySelector("select");

        const priceElement =
            card.querySelector(".price");

        if (!select || !priceElement) {
            return;
        }

        function updatePrice() {

            const selectedOption =
                select.options[
                    select.selectedIndex
                ];

            if (!selectedOption) return;

            const price = selectedOption.dataset.price ||
                (selectedOption.value.match(/Rp\s*[\d.]+/) || [])[0];

            if (price) {
                priceElement.textContent =
                    price;
            }
        }

        select.addEventListener(
            "change",
            updatePrice
        );

        updatePrice();

    });


    /* =====================================================
       KEYBOARD ACCESS
       ← → UNTUK PINDAH SLIDE
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (
            event.key !== "ArrowLeft" &&
            event.key !== "ArrowRight"
        ) {
            return;
        }

        const activeSlide =
            document.querySelector(".slide.active");

        if (!activeSlide) return;

        const currentIndex =
            Array.from(slides).indexOf(activeSlide);

        let nextIndex = currentIndex;

        if (event.key === "ArrowRight") {
            nextIndex =
                Math.min(
                    currentIndex + 1,
                    slides.length - 1
                );
        }

        if (event.key === "ArrowLeft") {
            nextIndex =
                Math.max(
                    currentIndex - 1,
                    0
                );
        }

        const nextSlide =
            slides[nextIndex];

        if (nextSlide) {

            const target =
                `#${nextSlide.id}`;

            showSlide(target);

            history.replaceState(
                null,
                "",
                target
            );
        }

    });



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
