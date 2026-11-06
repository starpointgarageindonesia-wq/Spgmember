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


});
