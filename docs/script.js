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


    /* Rotating Home photos using Cireng Indi's four archived product banners. */
    const ciCarousel = document.getElementById("ciHomeCarousel");
    if (ciCarousel) {
        const ciSlides = Array.from(ciCarousel.querySelectorAll(".ci-home-banner-slide"));
        const ciDots = Array.from(ciCarousel.querySelectorAll(".ci-home-banner-dot"));
        const ciCurrent = ciCarousel.querySelector("[data-ci-current]");
        const ciReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let ciIndex = 0;
        let ciPointerX = null;
        let ciMouseHover = false;
        let ciFocusWithin = false;

        function ciSetActive(next) {
            if (!ciSlides.length) return;
            ciIndex = (next + ciSlides.length) % ciSlides.length;
            ciSlides.forEach((slide, i) => {
                const active = i === ciIndex;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
                const cta = slide.querySelector(".ci-home-banner-link");
                if (cta) cta.tabIndex = active ? 0 : -1;
            });
            ciDots.forEach((dot, i) => {
                const active = i === ciIndex;
                dot.classList.toggle("is-active", active);
                dot.setAttribute("aria-pressed", active ? "true" : "false");
            });
            if (ciCurrent) ciCurrent.textContent = String(ciIndex + 1).padStart(2, "0");
        }

        ciCarousel.addEventListener("click", (event) => {
            const arrow = event.target.closest("[data-ci-dir]");
            const dot = event.target.closest("[data-ci-goto]");
            const open = event.target.closest("[data-ci-open]");
            if (arrow) ciSetActive(ciIndex + Number(arrow.dataset.ciDir));
            else if (dot) ciSetActive(Number(dot.dataset.ciGoto));
            else if (open) {
                const target = open.dataset.ciOpen;
                if (document.getElementById(target)) {
                    showSlide(target);
                    history.replaceState(null, "", "#" + target);
                }
            }
        });

        ciCarousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                event.stopPropagation();
                ciSetActive(ciIndex + 1);
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                event.stopPropagation();
                ciSetActive(ciIndex - 1);
            }
        });
        ciCarousel.addEventListener("pointerenter", event => {
            if (event.pointerType === "mouse") ciMouseHover = true;
        });
        ciCarousel.addEventListener("pointerleave", () => { ciMouseHover = false; });
        ciCarousel.addEventListener("focusin", () => { ciFocusWithin = true; });
        ciCarousel.addEventListener("focusout", event => {
            if (!ciCarousel.contains(event.relatedTarget)) ciFocusWithin = false;
        });
        ciCarousel.addEventListener("touchstart", event => {
            ciPointerX = event.touches[0]?.clientX ?? null;
        }, {passive:true});
        ciCarousel.addEventListener("touchend", event => {
            if (ciPointerX === null) return;
            const endX = event.changedTouches[0]?.clientX;
            const delta = (typeof endX === "number") ? endX - ciPointerX : 0;
            ciPointerX = null;
            if (Math.abs(delta) > 45) ciSetActive(ciIndex + (delta < 0 ? 1 : -1));
        }, {passive:true});

        // Move every 4.5 seconds; pause when Home is hidden or actively controlled.
        if (!ciReducedMotion && ciSlides.length > 1) {
            window.setInterval(() => {
                if (document.hidden || ciMouseHover || ciFocusWithin) return;
                if (ciCarousel.getClientRects().length === 0) return;
                ciSetActive(ciIndex + 1);
            }, 4500);
        }
        ciSetActive(0);
    }

});
