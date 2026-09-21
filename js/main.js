document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // ICON VARIATIONS DATABASE
    // ==========================================
    const iconVariants = {
        'solid': {
            name: 'Solid',
            breadcrumb: 'Heart icon - Solid',
            collectionTitle: 'Basic Miscellany Solid',
            svg: `<svg id="masterIconSvg" class="master-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" fill="#1e293b"/>
                <path d="M42 371.5l56 56 30-30-56-56-30 30z" fill="#1e293b"/>
                <path d="M455.5 96.5l-28-28-50 50 28 28 50-50z" fill="#1e293b"/>
                <path d="M377 175l-50-50m84-34l-50-50m-21 71l50 50m-134 134l-120 120" stroke="#f8fafc" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M220 305.5c-44-31-48-93-9-130 36-34 94-27 121 16" stroke="#f8fafc" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        },
        'line': {
            name: 'Line / Outline',
            breadcrumb: 'Heart icon - Line / Outline',
            collectionTitle: 'Basic Miscellany Line',
            svg: `<svg id="masterIconSvg" class="master-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" stroke="#1e293b" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M377 175l-50-50m84-34l-50-50m-21 71l50 50m-134 134l-120 120" stroke="#1e293b" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M220 305.5c-44-31-48-93-9-130 36-34 94-27 121 16" stroke="#1e293b" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M42 371.5l56 56 30-30-56-56-30 30z" stroke="#1e293b" stroke-width="28" stroke-linejoin="round"/>
                <path d="M455.5 96.5l-28-28-50 50 28 28 50-50z" stroke="#1e293b" stroke-width="28" stroke-linejoin="round"/>
            </svg>`
        },
        'flat': {
            name: 'Flat Color',
            breadcrumb: 'Heart icon - Flat Color',
            collectionTitle: 'Basic Miscellany Flat Color',
            svg: `<svg id="masterIconSvg" class="master-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" fill="#EF4444"/>
                <path d="M377 175l-50-50m84-34l-50-50m-21 71l50 50m-134 134l-120 120" stroke="#DC2626" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M220 305.5c-44-31-48-93-9-130 36-34 94-27 121 16" stroke="#B91C1C" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M42 371.5l56 56 30-30-56-56-30 30z" fill="#64748B"/>
                <path d="M455.5 96.5l-28-28-50 50 28 28 50-50z" fill="#F59E0B"/>
            </svg>`
        },
        'blue': {
            name: 'Lineal Blue',
            breadcrumb: 'Heart icon - Lineal Blue',
            collectionTitle: 'Basic Miscellany Lineal Blue',
            svg: `<svg id="masterIconSvg" class="master-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" fill="#DBEAFE"/>
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" stroke="#2563EB" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M377 175l-50-50m84-34l-50-50m-21 71l50 50m-134 134l-120 120" stroke="#2563EB" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M220 305.5c-44-31-48-93-9-130 36-34 94-27 121 16" stroke="#2563EB" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M42 371.5l56 56 30-30-56-56-30 30z" fill="#93C5FD" stroke="#2563EB" stroke-width="28" stroke-linejoin="round"/>
                <path d="M455.5 96.5l-28-28-50 50 28 28 50-50z" fill="#BFDBFE" stroke="#2563EB" stroke-width="28" stroke-linejoin="round"/>
            </svg>`
        },
        'lineal': {
            name: 'Lineal Color',
            breadcrumb: 'Heart icon - Lineal Color',
            collectionTitle: 'Basic Miscellany Lineal Color',
            svg: `<svg id="masterIconSvg" class="master-icon" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" fill="#E91E63"/>
                <path d="M455.5 96.5l-56-56-78.5 78.5c-35-13.5-75.5-9-106.5 14-36.5 27-56 71-50.5 116.5L42 371.5l56 56L220 305.5c45.5 5.5 89.5-14 116.5-50.5 23-31 27.5-71.5 14-106.5l105-105z" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M377 175l-50-50m84-34l-50-50m-21 71l50 50m-134 134l-120 120" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M220 305.5c-44-31-48-93-9-130 36-34 94-27 121 16" stroke="#111827" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M42 371.5l56 56 30-30-56-56-30 30z" fill="#64748B" stroke="#111827" stroke-width="28" stroke-linejoin="round"/>
                <path d="M455.5 96.5l-28-28-50 50 28 28 50-50z" fill="#FFC107" stroke="#111827" stroke-width="28" stroke-linejoin="round"/>
            </svg>`
        }
    };

    let currentVariantKey = 'lineal';

    // UI Elements
    const variantButtons = document.querySelectorAll('.variant-btn');
    const mainPreviewBox = document.getElementById('mainPreviewBox');
    const badgeStyleName = document.getElementById('badgeStyleName');
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    const collectionTitle = document.getElementById('collectionTitle');
    const toastNotification = document.getElementById('toastNotification');
    const iconSizeSelect = document.getElementById('iconSizeSelect');
    const btnCopySvg = document.getElementById('btnCopySvg');
    const btnDownloadSvg = document.getElementById('btnDownloadSvg');
    const btnDownloadPng = document.getElementById('btnDownloadPng');

    // ==========================================
    // TOAST NOTIFICATION HELPER
    // ==========================================
    let toastTimeout = null;
    function showToast(message) {
        if (!toastNotification) return;
        if (toastTimeout) clearTimeout(toastTimeout);
        
        toastNotification.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${message}</span>
        `;
        toastNotification.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 2500);
    }

    // ==========================================
    // VARIATION SWITCHING LOGIC
    // ==========================================
    function switchVariant(variantKey, triggerElement = null) {
        if (!iconVariants[variantKey] || !mainPreviewBox) return;

        currentVariantKey = variantKey;
        const variantData = iconVariants[variantKey];

        // 1. Update Active State on Buttons
        variantButtons.forEach(btn => {
            const isActive = (btn.dataset.variant === variantKey);
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // 2. Animate preview transition
        mainPreviewBox.classList.add('switching');

        setTimeout(() => {
            // Replace SVG
            mainPreviewBox.innerHTML = variantData.svg;

            // Apply active size if custom
            const masterSvg = document.getElementById('masterIconSvg');
            if (masterSvg && iconSizeSelect) {
                const selectedSize = iconSizeSelect.value;
                if (selectedSize !== '512') {
                    masterSvg.style.maxWidth = `${selectedSize}px`;
                    masterSvg.style.maxHeight = `${selectedSize}px`;
                } else {
                    masterSvg.style.maxWidth = '';
                    masterSvg.style.maxHeight = '';
                }
            }

            // Update Labels
            if (badgeStyleName) badgeStyleName.textContent = variantData.name;
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = variantData.breadcrumb;
            if (collectionTitle) collectionTitle.textContent = variantData.collectionTitle;
            document.title = `${variantData.breadcrumb} - IconBaba`;

            mainPreviewBox.classList.remove('switching');
        }, 120);
    }

    // Attach click listeners to variation buttons
    if (variantButtons.length > 0) {
        variantButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const variant = btn.dataset.variant;
                switchVariant(variant, btn);
            });

            // Keyboard navigation (Up/Down arrow support)
            btn.addEventListener('keydown', (e) => {
                let targetIndex = -1;
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                    targetIndex = (index + 1) % variantButtons.length;
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                    targetIndex = (index - 1 + variantButtons.length) % variantButtons.length;
                }

                if (targetIndex !== -1) {
                    e.preventDefault();
                    variantButtons[targetIndex].focus();
                    const nextVariant = variantButtons[targetIndex].dataset.variant;
                    switchVariant(nextVariant, variantButtons[targetIndex]);
                }
            });
        });
    }

    // ==========================================
    // SIZE SELECTOR
    // ==========================================
    if (iconSizeSelect) {
        iconSizeSelect.addEventListener('change', (e) => {
            const size = e.target.value;
            const masterSvg = document.getElementById('masterIconSvg');
            if (masterSvg) {
                if (size === '512') {
                    masterSvg.style.maxWidth = '';
                    masterSvg.style.maxHeight = '';
                } else {
                    masterSvg.style.maxWidth = `${size}px`;
                    masterSvg.style.maxHeight = `${size}px`;
                }
            }
            showToast(`Preview size changed to ${size}px`);
        });
    }

    // ==========================================
    // COPY SVG TO CLIPBOARD
    // ==========================================
    if (btnCopySvg) {
        btnCopySvg.addEventListener('click', async () => {
            const variantData = iconVariants[currentVariantKey];
            if (!variantData) return;

            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(variantData.svg.trim());
                    showToast(`${variantData.name} SVG copied to clipboard!`);
                } else {
                    // Fallback
                    const textarea = document.createElement('textarea');
                    textarea.value = variantData.svg.trim();
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    showToast(`${variantData.name} SVG copied!`);
                }
            } catch (err) {
                showToast('Failed to copy SVG');
            }
        });
    }

    // ==========================================
    // DOWNLOAD SVG
    // ==========================================
    if (btnDownloadSvg) {
        btnDownloadSvg.addEventListener('click', () => {
            const variantData = iconVariants[currentVariantKey];
            if (!variantData) return;

            const blob = new Blob([variantData.svg.trim()], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `heart-${currentVariantKey}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast(`Downloading heart-${currentVariantKey}.svg`);
        });
    }

    // ==========================================
    // DOWNLOAD PNG (Canvas Rasterizer)
    // ==========================================
    if (btnDownloadPng) {
        btnDownloadPng.addEventListener('click', () => {
            const variantData = iconVariants[currentVariantKey];
            if (!variantData) return;

            const size = iconSizeSelect ? parseInt(iconSizeSelect.value, 10) : 512;
            const svgString = variantData.svg.trim();
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, 0, 0, size, size);

                canvas.toBlob((pngBlob) => {
                    if (!pngBlob) return;
                    const pngUrl = URL.createObjectURL(pngBlob);
                    const a = document.createElement('a');
                    a.href = pngUrl;
                    a.download = `heart-${currentVariantKey}-${size}px.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(pngUrl);
                    URL.revokeObjectURL(url);

                    showToast(`Downloaded heart-${currentVariantKey}-${size}px.png`);
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                showToast('Error exporting PNG');
            };

            img.src = url;
        });
    }

    // ==========================================
    // INTERACTIVE COLLECTION & RELATED PREVIEWS
    // ==========================================
    const collectionMiniGrid = document.getElementById('collectionMiniGrid');
    if (collectionMiniGrid) {
        collectionMiniGrid.querySelectorAll('.mini-icon').forEach(item => {
            item.addEventListener('click', () => {
                const colorTitle = item.dataset.title || 'Icon';
                showToast(`Loaded ${colorTitle} from collection`);
            });
        });
    }

    document.querySelectorAll('.related-card').forEach((card, idx) => {
        card.addEventListener('click', () => {
            showToast(`Selected related icon #${idx + 1}`);
        });
    });

    // ==========================================
    // LANDING SEARCH FOCUS & ICON CLICK
    // ==========================================
    const searchInputs = document.querySelectorAll('.search-input, .search-input-small');
    searchInputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (input.parentElement) {
                input.parentElement.style.transform = 'scale(1.01)';
            }
        });
        input.addEventListener('blur', () => {
            if (input.parentElement) {
                input.parentElement.style.transform = 'scale(1)';
            }
        });
    });

    // Make icon cards on index page link to icon.php
    document.querySelectorAll('.icon-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            if (e.target.closest('.download-btn') || e.target.closest('.icon-btn')) {
                return; // Let download/save button handle its own event
            }
            window.location.href = 'icon.php';
        });
    });
});


