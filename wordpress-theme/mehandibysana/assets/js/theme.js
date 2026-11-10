/**
 * Mehandi by Sana Atelier — Main Theme Interactivity (Vanilla JS)
 * Handles: Navigation, Mobile StudioMenu, Scroll Reveals, Featured Tabs,
 * Stain Oxidation Simulator, PDP Variants/Gallery, AJAX Bag Drawer,
 * Wildcard PIN Checker, Bridal Booking Form & Order Tracker.
 */
(function () {
  'use strict';

  var CFG = window.MBS_THEME || {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: '',
    currencySymbol: '₹',
    shopUrl: '/shop/',
    cartUrl: '/cart/',
    checkoutUrl: '/checkout/',
    trackOrderUrl: '/track-order/',
    bag: { items: [], itemsCount: 0, subtotal: 0, total: 0, shippingTotal: 0, pincode: '', pincodeResult: null }
  };

  function formatINR(num) {
    var val = Number(num) || 0;
    var neg = val < 0 ? '-' : '';
    val = Math.abs(val);
    var hasDec = Math.abs(val - Math.round(val)) >= 0.01;
    var str = hasDec ? val.toFixed(2) : String(Math.round(val));
    var parts = str.split('.');
    var intPart = parts[0];
    if (intPart.length > 3) {
      var lastThree = intPart.slice(-3);
      var rest = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      intPart = rest + ',' + lastThree;
    }
    return neg + (CFG.currencySymbol || '₹') + intPart + (parts[1] ? '.' + parts[1] : '');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function postAjax(action, params) {
    var body = new URLSearchParams();
    body.append('action', action);
    body.append('nonce', CFG.nonce || '');
    Object.keys(params || {}).forEach(function (k) {
      if (params[k] !== undefined && params[k] !== null) {
        body.append(k, String(params[k]));
      }
    });
    return fetch(CFG.ajaxUrl, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString()
    }).then(function (r) {
      return r.json();
    });
  }

  /* ==========================================================================
     1. TOP ROUTE HAIRLINE PROGRESS BAR
     ========================================================================== */
  function initRouteBar() {
    var bar = document.getElementById('mbs-route-bar');
    if (!bar) return;

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      try {
        var url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin && url.href !== window.location.href) {
          bar.classList.add('is-loading');
        }
      } catch (err) {}
    });

    window.addEventListener('pageshow', function () {
      bar.classList.remove('is-loading');
    });
  }

  /* ==========================================================================
     2. TEXT & BLOCK SCROLL REVEALS
     ========================================================================== */
  function initReveals() {
    var els = document.querySelectorAll('.reveal-fade-block, .reveal-line-inner');
    if (!els.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    // Immediate pass for elements visible on initial paint
    var vh = window.innerHeight || 900;
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95) {
        el.classList.add('is-revealed');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    els.forEach(function (el) {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    // Safety fallback so nothing ever remains invisible
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
    }, 2400);
  }

  /* ==========================================================================
     3. DESKTOP NAV SLIDING PILL & SHOP MEGA-PANEL
     ========================================================================== */
  function initDesktopNav() {
    var pill = document.querySelector('[data-mbs-desktop-nav]');
    var indicator = pill ? pill.querySelector('.nav-hover-indicator') : null;
    if (pill && indicator) {
      var links = pill.querySelectorAll('.desktop-nav-link');
      links.forEach(function (lnk) {
        lnk.addEventListener('mouseenter', function () {
          indicator.style.left = lnk.offsetLeft + 'px';
          indicator.style.width = lnk.offsetWidth + 'px';
          indicator.style.opacity = '1';
        });
      });
      pill.addEventListener('mouseleave', function () {
        indicator.style.opacity = '0';
      });
    }

    var toggle = document.querySelector('[data-mbs-shop-toggle]');
    var mega = document.getElementById('mbs-shop-mega');
    if (!toggle || !mega) return;

    function setOpen(state) {
      mega.classList.toggle('is-open', state);
      mega.setAttribute('aria-hidden', state ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', state ? 'true' : 'false');
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!mega.classList.contains('is-open'));
    });

    document.addEventListener('click', function (e) {
      if (mega.classList.contains('is-open') && !mega.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mega.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  /* ==========================================================================
     4. MOBILE STUDIO MENU DRAWER
     ========================================================================== */
  function initStudioMenu() {
    var menu = document.getElementById('mbs-studio-menu');
    var openers = document.querySelectorAll('[data-mbs-menu-open]');
    var closers = document.querySelectorAll('[data-mbs-menu-close]');
    if (!menu || !openers.length) return;

    var prevEyebrow = menu.querySelector('[data-mbs-preview-eyebrow]');
    var prevDesc = menu.querySelector('[data-mbs-preview-desc]');

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
      openers.forEach(function (btn) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    }

    openers.forEach(function (btn) {
      btn.addEventListener('click', function () { setOpen(true); });
    });
    closers.forEach(function (btn) {
      btn.addEventListener('click', function () { setOpen(false); });
    });

    menu.querySelectorAll('.studio-menu-link').forEach(function (lnk) {
      lnk.addEventListener('mouseenter', function () {
        if (prevEyebrow && lnk.dataset.eyebrow) prevEyebrow.textContent = lnk.dataset.eyebrow;
        if (prevDesc && lnk.dataset.desc) prevDesc.textContent = lnk.dataset.desc;
      });
      lnk.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  /* ==========================================================================
     5. FEATURED PRODUCTS BENTO 3-TAB SWITCHER
     ========================================================================== */
  function initFeaturedTabs() {
    var wrap = document.querySelector('[data-mbs-featured-tabs]');
    if (!wrap) return;
    var btns = wrap.querySelectorAll('[data-mbs-tab-target]');
    var panels = wrap.querySelectorAll('.mbs-bento-panel');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-mbs-tab-target');
        btns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-mbs-tab-panel') === target);
        });
      });
    });
  }

  /* ==========================================================================
     6. INTERACTIVE STAIN OXIDATION SIMULATOR
     ========================================================================== */
  function initStainSimulator() {
    var root = document.querySelector('[data-mbs-stain-guide]');
    if (!root) return;

    var tones = {
      fair:   { base: '#f7decb', shadow: '#dfbba3', crease: '#c89b80' },
      medium: { base: '#dfb18d', shadow: '#bf8b66', crease: '#9c6744' },
      olive:  { base: '#b97e54', shadow: '#945b35', crease: '#734222' },
      deep:   { base: '#79492d', shadow: '#5b331c', crease: '#3d1f0e' }
    };

    var stages = [
      {
        id: 'initial',
        min: 0, max: 33, val: 15,
        hourLabel: 'Hour 0–2',
        stageTitle: 'Tangerine Fresh Paste Removal',
        swatch: '#e86f2c',
        stainStroke: '#e86f2c',
        stainSecondary: '#f3985a',
        shadeText: 'Vibrant Pumpkin & Bright Copper',
        whyText: 'Natural lawsone dye molecules have bound to your upper keratin layer and have not yet reacted with atmospheric oxygen. Water washes away unbound stain—avoid soap for 12 hours.',
        ritualText: 'Scrape paste gently using mustard or eucalyptus oil—never wash under running tap water. Warm hands lightly over clove smoke if desired.'
      },
      {
        id: 'mid',
        min: 34, max: 66, val: 50,
        hourLabel: 'Hour 12–24',
        stageTitle: 'Amber Oxidation Phase',
        swatch: '#a13815',
        stainStroke: '#9c3412',
        stainSecondary: '#be4e22',
        shadeText: 'Warm Terracotta & Spiced Chestnut',
        whyText: 'Body heat and oxygen polymerize lawsone molecules deeper inside the epidermis, darkening every hairline motif noticeably overnight.',
        ritualText: 'Apply Aftercare Henna Balm before bathing or dishes to shield fresh oxidation from chlorinated soap and hard water.'
      },
      {
        id: 'peak',
        min: 67, max: 100, val: 92,
        hourLabel: 'Hour 36–48',
        stageTitle: 'Deep Mahogany Peak Maturity',
        swatch: '#5a1d0d',
        stainStroke: '#5a1d0d',
        stainSecondary: '#7e2a14',
        shadeText: 'Rich Kashmiri Maroon & Espresso Mahogany',
        whyText: 'Complete botanical oxidation achieves its fullest, velvety depth—lasting 10 to 16 days cleanly as natural skin cells renew.',
        ritualText: 'Continue moisturizing palms twice daily with balm; peak color photographs dramatically for bridal ceremonies 48 hours post-application.'
      }
    ];

    var palmBase = root.querySelector('#mbs-palm-base');
    var palmCreatures = root.querySelectorAll('.mbs-palm-crease');
    var motifPrimary = root.querySelectorAll('.mbs-motif-primary');
    var motifSec = root.querySelectorAll('.mbs-motif-secondary');
    var toneBtns = root.querySelectorAll('[data-mbs-tone]');
    var stageBtns = root.querySelectorAll('[data-mbs-stage-idx]');
    var slider = root.querySelector('#mbs-stain-slider');

    var uiHour = root.querySelector('[data-mbs-ui-hour]');
    var uiTitle = root.querySelector('[data-mbs-ui-title]');
    var uiShade = root.querySelector('[data-mbs-ui-shade]');
    var uiSwatch = root.querySelector('[data-mbs-ui-swatch]');
    var uiWhy = root.querySelector('[data-mbs-ui-why]');
    var uiRitual = root.querySelector('[data-mbs-ui-ritual]');

    function applyTone(key) {
      var t = tones[key] || tones.medium;
      if (palmBase) {
        palmBase.setAttribute('fill', t.base);
        palmBase.setAttribute('stroke', t.shadow);
      }
      palmCreatures.forEach(function (el) {
        el.setAttribute('stroke', t.crease);
      });
      toneBtns.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-mbs-tone') === key);
      });
    }

    function applyStageByIdx(idx) {
      var st = stages[idx] || stages[2];
      stageBtns.forEach(function (b, i) {
        b.classList.toggle('is-active', i === idx);
      });
      motifPrimary.forEach(function (el) {
        if (el.tagName === 'circle' && el.getAttribute('data-fill')) {
          el.setAttribute('fill', st.stainStroke);
        } else {
          el.setAttribute('stroke', st.stainStroke);
        }
      });
      motifSec.forEach(function (el) {
        el.setAttribute('stroke', st.stainSecondary);
      });
      if (uiHour) uiHour.textContent = st.hourLabel;
      if (uiTitle) uiTitle.textContent = st.stageTitle;
      if (uiShade) uiShade.textContent = st.shadeText;
      if (uiSwatch) uiSwatch.style.backgroundColor = st.swatch;
      if (uiWhy) uiWhy.textContent = st.whyText;
      if (uiRitual) uiRitual.textContent = st.ritualText;
      if (slider && Math.abs(Number(slider.value) - st.val) > 16) {
        slider.value = String(st.val);
      }
    }

    toneBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyTone(btn.getAttribute('data-mbs-tone'));
      });
    });

    stageBtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        applyStageByIdx(idx);
        if (slider) slider.value = String(stages[idx].val);
      });
    });

    if (slider) {
      slider.addEventListener('input', function () {
        var v = Number(slider.value);
        var idx = v <= 33 ? 0 : (v <= 66 ? 1 : 2);
        applyStageByIdx(idx);
      });
    }

    applyTone('medium');
    applyStageByIdx(2);
  }

  /* ==========================================================================
     7. SINGLE PRODUCT GALLERY & VARIANT SELECTOR
     ========================================================================== */
  function initPdp() {
    var gallery = document.querySelector('[data-mbs-pdp-gallery]');
    if (gallery) {
      var mainImg = document.getElementById('mbs-pdp-main-img');
      var thumbs = gallery.querySelectorAll('.mbs-pdp-thumb');
      thumbs.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var src = btn.getAttribute('data-src');
          var alt = btn.getAttribute('data-alt') || '';
          if (mainImg && src) {
            mainImg.src = src;
            mainImg.alt = alt;
          }
          thumbs.forEach(function (t) { t.classList.remove('is-active'); });
          btn.classList.add('is-active');
        });
      });
    }

    var buybox = document.querySelector('[data-mbs-pdp-buybox]');
    if (!buybox) return;

    var qty = 1;
    var qtyVal = buybox.querySelector('#mbs-pdp-qty-val');
    var addBtn = buybox.querySelector('#mbs-pdp-add-btn');

    buybox.querySelectorAll('[data-mbs-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var delta = Number(btn.getAttribute('data-mbs-qty-step')) || 0;
        qty = Math.max(1, Math.min(20, qty + delta));
        if (qtyVal) qtyVal.textContent = String(qty);
        if (addBtn) addBtn.setAttribute('data-quantity', String(qty));
      });
    });

    var variationsRaw = buybox.getAttribute('data-variations');
    if (!variationsRaw) return;
    var variations = [];
    try { variations = JSON.parse(variationsRaw); } catch (e) { variations = []; }
    if (!variations.length) return;

    var selected = {};
    buybox.querySelectorAll('[data-mbs-attr-key]').forEach(function (group) {
      var key = group.getAttribute('data-mbs-attr-key');
      var activeBtn = group.querySelector('.mbs-variant-pill.is-selected');
      if (activeBtn) selected[key] = activeBtn.getAttribute('data-mbs-attr-val');
    });

    function syncSelectedVariation() {
      var match = variations.find(function (v) {
        return v.attributes.every(function (a) {
          return !selected[a.key] || selected[a.key] === a.value || selected[a.key] === a.slug;
        });
      }) || variations[0];

      if (!match) return;

      var priceEl = document.getElementById('mbs-pdp-price');
      var regEl = document.getElementById('mbs-pdp-reg-price');
      var stockEl = document.getElementById('mbs-pdp-stock-pill');
      var skuEl = document.getElementById('mbs-pdp-sku');

      if (priceEl) priceEl.textContent = formatINR(match.price);
      if (regEl) {
        if (match.regularPrice && match.regularPrice > match.price) {
          regEl.textContent = formatINR(match.regularPrice);
          regEl.style.display = 'inline';
        } else {
          regEl.style.display = 'none';
        }
      }
      if (stockEl) {
        stockEl.textContent = match.inStock ? 'In Stock · Fresh Batch' : 'Currently Out of Stock';
        stockEl.style.color = match.inStock ? 'var(--color-accent)' : 'var(--color-error)';
      }
      if (skuEl) {
        skuEl.textContent = match.sku ? 'SKU: ' + match.sku : '';
      }
      if (match.image && match.image.src) {
        var mImg = document.getElementById('mbs-pdp-main-img');
        if (mImg) mImg.src = match.image.src;
      }
      if (addBtn) {
        addBtn.setAttribute('data-variation-id', String(match.id));
        addBtn.disabled = !match.inStock;
        addBtn.textContent = match.inStock ? 'Add to Bag — ' + formatINR(match.price * qty) : 'Out of Stock';
      }
    }

    buybox.querySelectorAll('.mbs-variant-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var group = pill.closest('[data-mbs-attr-key]');
        if (!group) return;
        var key = group.getAttribute('data-mbs-attr-key');
        selected[key] = pill.getAttribute('data-mbs-attr-val');
        group.querySelectorAll('.mbs-variant-pill').forEach(function (b) {
          b.classList.toggle('is-selected', b === pill);
        });
        syncSelectedVariation();
      });
    });

    buybox.querySelectorAll('[data-mbs-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', syncSelectedVariation);
    });

    syncSelectedVariation();
  }

  /* ==========================================================================
     8. SLIDE-OVER BAG DRAWER + AJAX ADD / UPDATE / REMOVE
     ========================================================================== */
  function openDrawer() {
    var drawer = document.getElementById('mbs-bag-drawer');
    var backdrop = document.getElementById('mbs-bag-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('is-open');
    backdrop.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    var drawer = document.getElementById('mbs-bag-drawer');
    var backdrop = document.getElementById('mbs-bag-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderBag(bag) {
    CFG.bag = bag;
    var count = Number(bag.itemsCount) || 0;

    document.querySelectorAll('[data-mbs-bag-badge]').forEach(function (badge) {
      badge.textContent = String(count);
      badge.classList.toggle('is-empty', count === 0);
    });

    var countTitle = document.getElementById('mbs-drawer-count-title');
    if (countTitle) {
      countTitle.textContent = count === 1 ? '1 item' : count + ' items';
    }

    var listWrap = document.getElementById('mbs-drawer-items');
    var emptyWrap = document.getElementById('mbs-drawer-empty');
    var dockWrap = document.getElementById('mbs-drawer-dock');

    if (listWrap && emptyWrap && dockWrap) {
      if (!bag.items || !bag.items.length) {
        listWrap.innerHTML = '';
        listWrap.style.display = 'none';
        emptyWrap.style.display = 'flex';
        dockWrap.style.display = 'none';
      } else {
        emptyWrap.style.display = 'none';
        listWrap.style.display = 'flex';
        dockWrap.style.display = 'block';

        listWrap.innerHTML = bag.items.map(function (it) {
          var thumbHtml = it.image && it.image.src
            ? '<img src="' + escapeHtml(it.image.src) + '" alt="' + escapeHtml(it.name) + '" />'
            : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#737373;">MBS</div>';
          var varBadge = it.variationLabel
            ? '<div style="font-size:11px;color:#525252;margin-top:2px;">' + escapeHtml(it.variationLabel) + '</div>'
            : '';

          return (
            '<div class="mbs-bag-item-row" data-key="' + escapeHtml(it.key) + '">' +
              '<a href="' + escapeHtml(it.permalink) + '" class="mbs-bag-thumb">' + thumbHtml + '</a>' +
              '<div style="flex:1;min-width:0;">' +
                '<div style="display:flex;justify-content:space-between;gap:8px;">' +
                  '<a href="' + escapeHtml(it.permalink) + '" style="font-family:var(--font-serif);font-size:1.08rem;font-weight:600;line-height:1.25;">' + escapeHtml(it.name) + '</a>' +
                  '<span style="font-weight:600;font-size:0.875rem;white-space:nowrap;">' + escapeHtml(formatINR(it.lineTotal)) + '</span>' +
                '</div>' +
                varBadge +
                '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">' +
                  '<div class="mbs-qty-stepper" style="height:32px;">' +
                    '<button type="button" data-mbs-bag-qty="' + (it.quantity - 1) + '" data-key="' + escapeHtml(it.key) + '" aria-label="Decrease quantity">&minus;</button>' +
                    '<span>' + it.quantity + '</span>' +
                    '<button type="button" data-mbs-bag-qty="' + (it.quantity + 1) + '" data-key="' + escapeHtml(it.key) + '" aria-label="Increase quantity">+</button>' +
                  '</div>' +
                  '<button type="button" data-mbs-bag-remove="' + escapeHtml(it.key) + '" style="background:none;border:0;font-size:12px;color:#525252;text-decoration:underline;cursor:pointer;">Remove</button>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }
    }

    var subEl = document.getElementById('mbs-drawer-subtotal');
    var shipEl = document.getElementById('mbs-drawer-shipping');
    var totEl = document.getElementById('mbs-drawer-total');

    var sub = Number(bag.subtotal) || 0;
    var ship = bag.pincodeResult && bag.pincodeResult.serviceable
      ? Number(bag.pincodeResult.deliveryCharge)
      : (Number(bag.shippingTotal) || 0);

    if (subEl) subEl.textContent = formatINR(sub);
    if (shipEl) {
      if (bag.pincodeResult && bag.pincodeResult.serviceable) {
        shipEl.textContent = ship > 0
          ? formatINR(ship) + ' (PIN ' + bag.pincodeResult.pincode + ')'
          : 'FREE (PIN ' + bag.pincodeResult.pincode + ')';
      } else if (ship > 0) {
        shipEl.textContent = formatINR(ship);
      } else {
        shipEl.textContent = 'Estimated via PIN / Checkout';
      }
    }
    if (totEl) {
      var computedTotal = bag.pincodeResult && bag.pincodeResult.serviceable ? sub + ship : (Number(bag.total) || sub);
      totEl.textContent = formatINR(computedTotal);
    }
  }

  function initBagSystem() {
    document.querySelectorAll('[data-mbs-open-bag]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openDrawer();
      });
    });

    document.querySelectorAll('[data-mbs-close-bag]').forEach(function (btn) {
      btn.addEventListener('click', closeDrawer);
    });

    var backdrop = document.getElementById('mbs-bag-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      var drawer = document.getElementById('mbs-bag-drawer');
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    // Global delegated Add to Bag click
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-mbs-add-to-bag]');
      if (!btn) return;
      e.preventDefault();
      if (btn.disabled) return;

      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Adding…';

      postAjax('mbs_add_to_bag', {
        product_id: btn.getAttribute('data-product-id') || '0',
        variation_id: btn.getAttribute('data-variation-id') || '0',
        quantity: btn.getAttribute('data-quantity') || '1'
      })
        .then(function (res) {
          btn.disabled = false;
          btn.textContent = origText;
          if (res && res.success && res.data) {
            renderBag(res.data);
            openDrawer();
            if (window.jQuery) {
              window.jQuery(document.body).trigger('wc_fragment_refresh');
            }
          } else {
            alert((res && res.data && res.data.message) || 'Unable to add item.');
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = origText;
          alert('Connection error. Please try again.');
        });
    });

    // Drawer item qty / remove delegation
    var drawerList = document.getElementById('mbs-drawer-items');
    if (drawerList) {
      drawerList.addEventListener('click', function (e) {
        var qtyBtn = e.target.closest('[data-mbs-bag-qty]');
        if (qtyBtn) {
          var key = qtyBtn.getAttribute('data-key');
          var newQty = Number(qtyBtn.getAttribute('data-mbs-bag-qty'));
          postAjax('mbs_update_bag_item', { key: key, quantity: newQty }).then(function (res) {
            if (res && res.success && res.data) {
              renderBag(res.data);
              if (window.jQuery && (CFG.isCart || CFG.isCheckout)) {
                window.jQuery(document.body).trigger('wc_update_cart');
                window.jQuery(document.body).trigger('update_checkout');
              }
            }
          });
          return;
        }

        var remBtn = e.target.closest('[data-mbs-bag-remove]');
        if (remBtn) {
          var rKey = remBtn.getAttribute('data-mbs-bag-remove');
          postAjax('mbs_remove_bag_item', { key: rKey }).then(function (res) {
            if (res && res.success && res.data) {
              renderBag(res.data);
              if (window.jQuery && (CFG.isCart || CFG.isCheckout)) {
                window.jQuery(document.body).trigger('wc_update_cart');
                window.jQuery(document.body).trigger('update_checkout');
              }
            }
          });
        }
      });
    }

    if (CFG.bag) {
      renderBag(CFG.bag);
    }
  }

  /* ==========================================================================
     9. WILDCARD PIN CHECKER WIDGETS (PDP, DRAWER, CART)
     ========================================================================== */
  function renderPinResultIntoAll(res) {
    document.querySelectorAll('[data-mbs-pin-checker]').forEach(function (box) {
      var input = box.querySelector('input[name="pincode"]');
      var resultBox = box.querySelector('[data-mbs-pin-output]');
      if (input && res.pincode) input.value = res.pincode;
      if (!resultBox) return;

      if (res.serviceable) {
        var feeStr = Number(res.deliveryCharge) === 0 ? 'FREE' : formatINR(res.deliveryCharge);
        var codBadge = res.codAvailable
          ? '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#111111;color:#fceee3;font-size:11px;font-weight:600;margin-left:6px;">COD Available</span>'
          : '<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:#f5f5f5;color:#525252;font-size:11px;margin-left:6px;">Prepaid Only</span>';
        resultBox.className = 'mbs-pin-result is-ok';
        resultBox.innerHTML =
          '<div><strong>' + escapeHtml(res.label) + '</strong> ' + codBadge + '</div>' +
          '<div style="margin-top:4px;color:#525252;">Dispatch Fee: <strong style="color:#111111;">' + escapeHtml(feeStr) + '</strong> &middot; ETA: <strong style="color:#111111;">' + escapeHtml(res.estimatedDays) + '</strong></div>';
      } else {
        resultBox.className = 'mbs-pin-result is-err';
        resultBox.textContent = res.message || 'Please enter a valid 6-digit Indian PIN code.';
      }
      resultBox.style.display = 'block';
    });
  }

  function initPinCheckers() {
    var widgets = document.querySelectorAll('[data-mbs-pin-checker]');
    if (!widgets.length) return;

    function runPinLookup(pin) {
      var sub = (CFG.bag && CFG.bag.subtotal) ? CFG.bag.subtotal : 0;
      postAjax('mbs_check_pincode', { pincode: pin, subtotal: sub }).then(function (resp) {
        if (!resp || !resp.data) return;
        var data = resp.data;
        renderPinResultIntoAll(data);
        if (data.serviceable) {
          CFG.bag = CFG.bag || {};
          CFG.bag.pincode = data.pincode;
          CFG.bag.pincodeResult = data;
          renderBag(CFG.bag);

          // Sync checkout postcode field if present
          var shipPin = document.getElementById('shipping_postcode');
          var billPin = document.getElementById('billing_postcode');
          if (shipPin) shipPin.value = data.pincode;
          if (billPin && !billPin.value) billPin.value = data.pincode;
          if (window.jQuery && (CFG.isCheckout || CFG.isCart)) {
            window.jQuery(document.body).trigger('update_checkout');
            window.jQuery(document.body).trigger('wc_update_cart');
          }
        }
      });
    }

    widgets.forEach(function (box) {
      var form = box.querySelector('form');
      var input = box.querySelector('input[name="pincode"]');
      if (form && input) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var cleaned = (input.value || '').replace(/\D/g, '').slice(0, 6);
          input.value = cleaned;
          runPinLookup(cleaned);
        });
      }
      box.querySelectorAll('[data-mbs-pin-sample]').forEach(function (sampleBtn) {
        sampleBtn.addEventListener('click', function () {
          var p = sampleBtn.getAttribute('data-mbs-pin-sample');
          if (input) input.value = p;
          runPinLookup(p);
        });
      });
    });

    if (CFG.bag && CFG.bag.pincodeResult) {
      renderPinResultIntoAll(CFG.bag.pincodeResult);
    }
  }

  /* ==========================================================================
     10. BRIDAL BOOKING INQUIRY FORM
     ========================================================================== */
  function initBookingForm() {
    var form = document.getElementById('mbs-booking-form');
    if (!form) return;

    var statusEl = document.getElementById('mbs-booking-error');
    var successCard = document.getElementById('mbs-booking-success');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.style.display = 'none'; statusEl.textContent = ''; }

      var fd = new FormData(form);
      var name = String(fd.get('name') || '').trim();
      var email = String(fd.get('email') || '').trim();
      var msg = String(fd.get('message') || '').trim();

      if (!name) {
        if (statusEl) { statusEl.textContent = 'Please enter your full name.'; statusEl.style.display = 'block'; }
        return;
      }
      if (!email || email.indexOf('@') === -1) {
        if (statusEl) { statusEl.textContent = 'Please enter a valid email address.'; statusEl.style.display = 'block'; }
        return;
      }
      if (msg.length < 10) {
        if (statusEl) { statusEl.textContent = 'Please include a short note (at least 10 characters).'; statusEl.style.display = 'block'; }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending Inquiry…'; }

      postAjax('mbs_submit_booking', {
        name: name,
        email: email,
        phone: String(fd.get('phone') || ''),
        service: String(fd.get('service') || 'bridal'),
        eventDate: String(fd.get('eventDate') || ''),
        location: String(fd.get('location') || ''),
        message: msg,
        companyWebsite: String(fd.get('companyWebsite') || '')
      })
        .then(function (resp) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Inquiry'; }
          if (resp && resp.success && resp.data) {
            form.style.display = 'none';
            if (successCard) {
              var refEl = successCard.querySelector('[data-mbs-ref]');
              var mailEl = successCard.querySelector('[data-mbs-client-email]');
              if (refEl) refEl.textContent = resp.data.referenceId || 'INQ-STUDIO';
              if (mailEl) mailEl.textContent = email;
              successCard.style.display = 'block';
            }
          } else {
            if (statusEl) {
              statusEl.textContent = (resp && resp.data && resp.data.message) || 'Could not submit inquiry.';
              statusEl.style.display = 'block';
            }
          }
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Inquiry'; }
          if (statusEl) {
            statusEl.textContent = 'Network issue. Please reach us directly on WhatsApp.';
            statusEl.style.display = 'block';
          }
        });
    });

    var resetBtn = document.getElementById('mbs-booking-reset');
    if (resetBtn && successCard) {
      resetBtn.addEventListener('click', function () {
        form.reset();
        form.style.display = 'block';
        successCard.style.display = 'none';
      });
    }
  }

  /* ==========================================================================
     11. ORDER TRACKER AJAX LOOKUP
     ========================================================================== */
  function renderTrackedOrderHtml(order) {
    var stages = [
      { key: 'received', num: '01', title: 'Order Received', sub: 'Logged in queue' },
      { key: 'preparing', num: '02', title: 'Small-Batch Prep', sub: 'Hand-rolled & packed' },
      { key: 'dispatched', num: '03', title: 'Dispatched', sub: order.courierName || 'Courier handed over' },
      { key: 'delivered', num: '04', title: 'Delivered', sub: 'Completed at door' }
    ];
    var orderRank = { received: 0, preparing: 1, dispatched: 2, delivered: 3, cancelled: -1 };
    var currentIdx = orderRank[order.fulfillmentStage] !== undefined ? orderRank[order.fulfillmentStage] : 0;

    var timelineHtml = stages.map(function (st, idx) {
      var cls = 'mbs-timeline-step';
      if (idx < currentIdx) cls += ' is-done';
      else if (idx === currentIdx) cls += ' is-current';
      return (
        '<div class="' + cls + '">' +
          '<div class="eyebrow" style="margin-bottom:4px;' + (idx === currentIdx ? 'color:var(--color-accent);' : '') + '">' + st.num + '</div>' +
          '<div style="font-family:var(--font-serif);font-size:1.25rem;font-weight:600;">' + escapeHtml(st.title) + '</div>' +
          '<div style="font-size:0.78rem;margin-top:4px;opacity:0.8;">' + escapeHtml(st.sub) + '</div>' +
        '</div>'
      );
    }).join('');

    var payBadgeColor = order.paymentStatus === 'paid' ? '#d9541e' : '#737373';
    var itemsRows = (order.items || []).map(function (item) {
      return (
        '<div style="display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border);">' +
          '<div>' +
            '<div style="font-weight:600;">' + escapeHtml(item.title) + ' &times; ' + item.quantity + '</div>' +
            (item.variantTitle ? '<div style="font-size:12px;color:#525252;">' + escapeHtml(item.variantTitle) + '</div>' : '') +
          '</div>' +
          '<div style="font-weight:600;">' + escapeHtml(formatINR(item.unitPrice * item.quantity)) + '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div style="border:1px solid var(--color-border);border-radius:var(--radius-xl);overflow:hidden;background:#ffffff;margin-top:2rem;">' +
        '<div style="background:#111111;color:#fceee3;padding:1.75rem 2rem;border-top:3px solid #d9541e;display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;align-items:center;">' +
          '<div>' +
            '<div class="eyebrow">Parcel Dossier &middot; ' + escapeHtml(order.createdDisplay || '') + '</div>' +
            '<h2 style="font-size:2rem;margin-top:6px;">Order ' + escapeHtml(order.orderNumber) + '</h2>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
            '<span style="padding:5px 12px;border-radius:999px;background:' + payBadgeColor + ';color:#ffffff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">' +
              escapeHtml(order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment') +
            '</span>' +
            '<span style="padding:5px 12px;border-radius:999px;border:1px solid rgba(252,238,227,0.3);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">' +
              escapeHtml(order.paymentMethod) +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div style="padding:1.75rem 2rem;">' +
          '<div class="mbs-timeline-grid">' + timelineHtml + '</div>' +
          (order.dispatchNote ? '<div style="background:var(--color-surface);border-left:3px solid var(--color-accent);padding:12px 16px;border-radius:6px;margin-bottom:1.5rem;"><strong>Dispatch Note:</strong> ' + escapeHtml(order.dispatchNote) + '</div>' : '') +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;margin-top:1rem;">' +
            '<div style="background:var(--color-surface);padding:1.25rem;border-radius:var(--radius-lg);border:1px solid var(--color-border);">' +
              '<div class="eyebrow eyebrow-muted">Courier & Tracking</div>' +
              '<p style="margin-top:8px;font-weight:600;">' + escapeHtml(order.courierName) + '</p>' +
              (order.trackingNumber ? '<p style="margin-top:4px;font-family:var(--font-mono);font-size:0.875rem;">AWB: ' + escapeHtml(order.trackingNumber) + '</p>' : '<p style="margin-top:4px;font-size:0.85rem;color:#525252;">Consignment ID assigned at handover</p>') +
              (order.trackingUrl ? '<p style="margin-top:10px;"><a href="' + escapeHtml(order.trackingUrl) + '" target="_blank" rel="noopener noreferrer" class="mbs-btn mbs-btn-secondary mbs-btn-sm">Track via Courier &rarr;</a></p>' : '') +
            '</div>' +
            '<div style="background:var(--color-surface);padding:1.25rem;border-radius:var(--radius-lg);border:1px solid var(--color-border);">' +
              '<div class="eyebrow eyebrow-muted">Shipping Destination</div>' +
              '<p style="margin-top:8px;font-weight:600;">' + escapeHtml((order.shippingAddress.firstName || '') + ' ' + (order.shippingAddress.lastName || '')) + '</p>' +
              '<p style="font-size:0.875rem;color:#525252;margin-top:2px;">' + escapeHtml([order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.postalCode].filter(Boolean).join(', ')) + '</p>' +
              '<p style="font-size:0.78rem;color:#525252;margin-top:6px;">Zone: ' + escapeHtml(order.pincodeRule || '') + '</p>' +
            '</div>' +
          '</div>' +
          '<div style="margin-top:1.75rem;">' +
            '<div class="eyebrow eyebrow-muted" style="margin-bottom:8px;">Packed Items</div>' +
            itemsRows +
            '<div style="display:flex;justify-content:space-between;padding-top:12px;font-size:0.9rem;color:#525252;"><span>Subtotal</span><span>' + escapeHtml(formatINR(order.subtotal)) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding-top:6px;font-size:0.9rem;color:#525252;"><span>Dispatch Fee</span><span>' + escapeHtml(formatINR(order.shippingFee)) + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;padding-top:10px;margin-top:10px;border-top:1px solid var(--color-ink);font-weight:700;font-size:1.1rem;"><span>Total Paid / Payable</span><span>' + escapeHtml(formatINR(order.total)) + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function initOrderTracker() {
    var form = document.getElementById('mbs-track-order-form');
    var resultWrap = document.getElementById('mbs-track-order-result');
    var errWrap = document.getElementById('mbs-track-order-error');
    if (!form || !resultWrap) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errWrap) errWrap.style.display = 'none';
      var fd = new FormData(form);
      var ref = String(fd.get('orderNumber') || '').trim();
      var email = String(fd.get('email') || '').trim();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Locating Parcel…'; }

      postAjax('mbs_track_order', { orderNumber: ref, email: email })
        .then(function (resp) {
          if (btn) { btn.disabled = false; btn.textContent = 'Locate My Order'; }
          if (resp && resp.success && resp.data && resp.data.found && resp.data.order) {
            resultWrap.innerHTML = renderTrackedOrderHtml(resp.data.order);
            resultWrap.style.display = 'block';
          } else {
            resultWrap.style.display = 'none';
            if (errWrap) {
              errWrap.textContent = (resp && resp.data && resp.data.message) || 'No matching order found.';
              errWrap.style.display = 'block';
            }
          }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Locate My Order'; }
          if (errWrap) {
            errWrap.textContent = 'Network error. Please try again.';
            errWrap.style.display = 'block';
          }
        });
    });
  }

  /* ==========================================================================
     BOOTSTRAP
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initRouteBar();
    initReveals();
    initDesktopNav();
    initStudioMenu();
    initFeaturedTabs();
    initStainSimulator();
    initPdp();
    initBagSystem();
    initPinCheckers();
    initBookingForm();
    initOrderTracker();
  });
})();

