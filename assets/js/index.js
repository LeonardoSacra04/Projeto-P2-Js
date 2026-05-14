// // ─── HOME.JS ─────────────────────────────────────────────────────────────────

// (async function () {

//     // ── CAROUSEL BUTTONS ───────────────────────────────────────────────────
//     document.querySelectorAll('.btnCarousel').forEach(btn => {
//         btn.addEventListener('click', () => {
//             const targetId = btn.dataset.target;
//             const carousel = document.getElementById(targetId);
//             if (!carousel) return;
//             const scrollAmount = 240 * 2;
//             if (btn.classList.contains('carousel-btn--left')) {
//                 carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
//             } else {
//                 carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
//             }
//         });
//     });

// })();

