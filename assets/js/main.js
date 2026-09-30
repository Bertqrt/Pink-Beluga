/*
 * Pink Beluga — shared behaviour for every page:
 * mobile menu, product grids, shopping bag, and form handling.
 */
(function () {
  'use strict';

  var CONFIG = window.PB_CONFIG || {};
  var PRODUCTS = window.PB_PRODUCTS || [];
  var BAG_KEY = 'pb-bag';

  var money = new Intl.NumberFormat(CONFIG.locale || 'en-GH', {
    style: 'currency',
    currency: CONFIG.currency || 'GHS'
  });

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === 'text') node.textContent = attrs[key];
      else if (key === 'class') node.className = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  /* ---------- Toast ---------- */

  var toastTimer;
  function toast(message) {
    var box = $('.toast');
    if (!box) {
      box = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      box.setAttribute('data-show', 'false');
    }, 2600);
  }

  /* ---------- Mobile navigation ---------- */

  function initNav() {
    var toggle = $('.nav-toggle');
    var links = $('#nav-links');
    if (!toggle || !links) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      links.setAttribute('data-open', String(open));
    }

    setOpen(false);
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- Small page details ---------- */

  function initDetails() {
    $all('[data-year]').forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });

    var social = CONFIG.social || {};
    $all('[data-social]').forEach(function (link) {
      var url = social[link.getAttribute('data-social')];
      if (url) link.href = url;
    });

    $all('[data-email]').forEach(function (node) {
      if (CONFIG.email) {
        node.textContent = CONFIG.email;
        if (node.tagName === 'A') node.href = 'mailto:' + CONFIG.email;
      } else {
        var row = node.closest('[data-optional]');
        if (row) row.hidden = true;
      }
    });

    $all('[data-whatsapp]').forEach(function (node) {
      if (CONFIG.whatsapp) {
        node.textContent = '+' + CONFIG.whatsapp;
        if (node.tagName === 'A') node.href = 'https://wa.me/' + CONFIG.whatsapp;
      } else {
        var row = node.closest('[data-optional]');
        if (row) row.hidden = true;
      }
    });
  }

  /* ---------- Bag storage ---------- */

  function readBag() {
    try {
      var data = JSON.parse(localStorage.getItem(BAG_KEY) || '{}');
      return data && typeof data === 'object' ? data : {};
    } catch (err) {
      return {};
    }
  }

  var bag = readBag();

  function saveBag() {
    try {
      localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    } catch (err) {
      /* Storage can be unavailable (private mode); the bag still works for this page view. */
    }
    renderBag();
  }

  function bagLines() {
    return Object.keys(bag)
      .map(function (id) {
        var product = findProduct(id);
        return product && bag[id] > 0 ? { product: product, qty: bag[id] } : null;
      })
      .filter(Boolean);
  }

  function bagCount() {
    return bagLines().reduce(function (sum, line) {
      return sum + line.qty;
    }, 0);
  }

  function bagTotal() {
    return bagLines().reduce(function (sum, line) {
      return sum + line.qty * line.product.price;
    }, 0);
  }

  function addToBag(id) {
    var product = findProduct(id);
    if (!product) return;
    bag[id] = (bag[id] || 0) + 1;
    saveBag();
    toast(product.name + ' added to your bag');
  }

  function setQty(id, qty) {
    if (qty <= 0) delete bag[id];
    else bag[id] = qty;
    saveBag();
  }

  /* ---------- Bag drawer ---------- */

  var drawer;
  var lastFocus;

  function buildDrawer() {
    drawer = el('div', { class: 'bag-drawer', hidden: '' });
    drawer.innerHTML =
      '<div class="bag-panel" role="dialog" aria-modal="true" aria-labelledby="bag-title">' +
      '  <div class="bag-head">' +
      '    <h2 id="bag-title">Your bag</h2>' +
      '    <button type="button" class="icon-button" data-close-bag aria-label="Close bag">&times;</button>' +
      '  </div>' +
      '  <div class="bag-items" aria-live="polite"></div>' +
      '  <div class="bag-foot">' +
      '    <div class="bag-total"><span>Total</span><span data-bag-total></span></div>' +
      '    <div data-checkout></div>' +
      '    <p class="bag-note">We confirm every order, delivery fee and payment method personally.</p>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(drawer);

    drawer.addEventListener('click', function (event) {
      if (event.target === drawer || event.target.closest('[data-close-bag]')) closeBag();

      var qtyButton = event.target.closest('[data-qty]');
      if (qtyButton) {
        var id = qtyButton.getAttribute('data-id');
        setQty(id, (bag[id] || 0) + Number(qtyButton.getAttribute('data-qty')));
      }

      var remove = event.target.closest('[data-remove]');
      if (remove) setQty(remove.getAttribute('data-id'), 0);
    });

    drawer.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeBag();
      if (event.key !== 'Tab') return;
      // Keep keyboard focus inside the open drawer.
      var focusable = $all('button, a[href]', drawer).filter(function (node) {
        return !node.disabled && node.offsetParent !== null;
      });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    });
  }

  function openBag() {
    lastFocus = document.activeElement;
    var note = $('.toast');
    if (note) note.setAttribute('data-show', 'false');
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    $('[data-close-bag]', drawer).focus();
  }

  function closeBag() {
    if (drawer.hidden) return;
    drawer.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function orderMessage() {
    var lines = bagLines().map(function (line) {
      return '- ' + line.qty + ' x ' + line.product.name + ' (' + money.format(line.product.price * line.qty) + ')';
    });
    return (
      'Hello Pink Beluga! I would like to order:\n' +
      lines.join('\n') +
      '\n\nTotal: ' +
      money.format(bagTotal()) +
      '\n\nMy name:\nDelivery location:'
    );
  }

  function renderCheckout(container) {
    container.textContent = '';
    if (!bagLines().length) return;

    var message = orderMessage();
    if (CONFIG.whatsapp) {
      container.appendChild(
        el('a', {
          class: 'button',
          href: 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(message),
          target: '_blank',
          rel: 'noopener',
          text: 'Order on WhatsApp'
        })
      );
    }
    if (CONFIG.email) {
      container.appendChild(
        el('a', {
          class: 'button ' + (CONFIG.whatsapp ? 'button-outline' : ''),
          href:
            'mailto:' +
            CONFIG.email +
            '?subject=' +
            encodeURIComponent('New order') +
            '&body=' +
            encodeURIComponent(message),
          text: 'Order by email'
        })
      );
    }
    if (!CONFIG.whatsapp && !CONFIG.email) {
      container.appendChild(
        el('a', { class: 'button', href: 'contact.html', text: 'Contact us to order' })
      );
    }
  }

  function renderBag() {
    var count = bagCount();
    $all('.bag-count').forEach(function (badge) {
      badge.textContent = count;
    });
    $all('[data-open-bag]').forEach(function (link) {
      link.setAttribute('aria-label', 'Open bag, ' + count + (count === 1 ? ' item' : ' items'));
    });

    if (!drawer) return;
    var list = $('.bag-items', drawer);
    list.textContent = '';

    var lines = bagLines();
    if (!lines.length) {
      list.appendChild(el('p', { class: 'bag-empty', text: 'Your bag is empty. Time to find something pink!' }));
    }

    lines.forEach(function (line) {
      var p = line.product;
      list.appendChild(
        el('div', { class: 'bag-item' }, [
          el('img', { src: p.image, alt: '', width: '64', height: '64' }),
          el('div', {}, [
            el('h3', { text: p.name }),
            el('div', { class: 'muted', text: money.format(p.price) }),
            el('div', { class: 'qty' }, [
              el('button', { type: 'button', 'data-qty': '-1', 'data-id': p.id, 'aria-label': 'Decrease ' + p.name, text: '−' }),
              el('span', { 'aria-label': 'Quantity', text: String(line.qty) }),
              el('button', { type: 'button', 'data-qty': '1', 'data-id': p.id, 'aria-label': 'Increase ' + p.name, text: '+' })
            ])
          ]),
          el('button', { type: 'button', class: 'remove', 'data-remove': '', 'data-id': p.id, text: 'Remove' })
        ])
      );
    });

    $('[data-bag-total]', drawer).textContent = money.format(bagTotal());
    renderCheckout($('[data-checkout]', drawer));
  }

  function initBag() {
    buildDrawer();
    $all('[data-open-bag]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        openBag();
      });
    });
    document.addEventListener('click', function (event) {
      var add = event.target.closest('[data-add]');
      if (add) addToBag(add.getAttribute('data-add'));
    });
    window.addEventListener('storage', function (event) {
      if (event.key === BAG_KEY) {
        bag = readBag();
        renderBag();
      }
    });
    renderBag();
  }

  /* ---------- Product grids ---------- */

  function productCard(p) {
    return el('article', { class: 'product-card', 'data-category': p.category }, [
      el('img', { src: p.image, alt: p.name, width: '300', height: '200', loading: 'lazy' }),
      el('div', { class: 'product-body' }, [
        el('span', { class: 'tag', text: p.category }),
        el('h3', { text: p.name }),
        el('p', { text: p.description }),
        el('div', { class: 'product-foot' }, [
          el('span', { class: 'price', text: money.format(p.price) }),
          el('button', {
            type: 'button',
            class: 'button button-small',
            'data-add': p.id,
            'aria-label': 'Add ' + p.name + ' to bag',
            text: 'Add to bag'
          })
        ])
      ])
    ]);
  }

  function initProducts() {
    $all('[data-products]').forEach(function (grid) {
      var onlyFeatured = grid.getAttribute('data-products') === 'featured';
      var list = PRODUCTS.filter(function (p) {
        return !onlyFeatured || p.featured;
      });
      grid.textContent = '';
      list.forEach(function (p) {
        grid.appendChild(productCard(p));
      });
    });

    var filters = $('[data-filters]');
    var grid = $('[data-products="all"]');
    if (!filters || !grid) return;

    var categories = ['All'];
    PRODUCTS.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) categories.push(p.category);
    });

    categories.forEach(function (category) {
      filters.appendChild(
        el('button', { type: 'button', 'data-category': category, 'aria-pressed': String(category === 'All'), text: category })
      );
    });

    var status = $('[data-filter-status]');
    filters.addEventListener('click', function (event) {
      var button = event.target.closest('button');
      if (!button) return;
      var chosen = button.getAttribute('data-category');
      $all('button', filters).forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });
      var shown = 0;
      $all('.product-card', grid).forEach(function (card) {
        var match = chosen === 'All' || card.getAttribute('data-category') === chosen;
        card.hidden = !match;
        if (match) shown++;
      });
      if (status) status.textContent = 'Showing ' + shown + ' ' + (chosen === 'All' ? 'products' : chosen.toLowerCase() + ' products');
    });
  }

  /* ---------- Forms ---------- */

  function setStatus(form, state, message) {
    var status = $('.form-status', form);
    if (!status) return;
    status.setAttribute('data-state', state);
    status.textContent = message;
  }

  function formToObject(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    return data;
  }

  function mailtoFallback(kind, data) {
    var subject = kind === 'newsletter' ? 'Newsletter sign-up' : data.subject || 'Message from the website';
    var body =
      kind === 'newsletter'
        ? 'Please add ' + data.email + ' to the Pink Beluga newsletter.'
        : 'Name: ' + data.name + '\nEmail: ' + data.email + '\n\n' + data.message;
    window.location.href =
      'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function initForms() {
    $all('form[data-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var kind = form.getAttribute('data-form');

        // Honeypot field: real visitors never fill it in, spam bots often do.
        var trap = form.querySelector('[name="_gotcha"]');
        if (trap && trap.value) return;

        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var data = formToObject(form);
        data._form = kind;
        delete data._gotcha;

        var success =
          kind === 'newsletter'
            ? 'Thank you! You are on the list. 💌'
            : 'Thank you! Your message is on its way. We usually reply within a day.';

        if (CONFIG.formEndpoint) {
          var button = $('button[type="submit"]', form);
          button.disabled = true;
          setStatus(form, 'pending', 'Sending…');
          fetch(CONFIG.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
          })
            .then(function (response) {
              if (!response.ok) throw new Error('Request failed');
              form.reset();
              setStatus(form, 'success', success);
            })
            .catch(function () {
              setStatus(form, 'error', 'Sorry, that did not send. Please try again in a moment.');
            })
            .then(function () {
              button.disabled = false;
            });
        } else if (CONFIG.email) {
          mailtoFallback(kind, data);
          setStatus(form, 'success', 'Your email app should open with the message ready to send.');
        } else {
          setStatus(form, 'error', 'Online forms are not switched on yet. Please reach us on social media for now.');
        }
      });
    });
  }

  /* ---------- Start ---------- */

  function start() {
    document.documentElement.classList.add('js');
    initNav();
    initDetails();
    initProducts();
    initBag();
    initForms();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
