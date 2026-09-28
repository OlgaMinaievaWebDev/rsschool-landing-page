(() => {
  const list = document.querySelector('.menu__products');
  const categories = [...document.querySelectorAll('.menu__category')];
  const status = document.querySelector('.menu__status');
  const showMore = document.querySelector('.menu__show-more');
  if (!list || !categories.length || !status || !showMore) return;

  let products = [];
  let selectedCategory = categories[0].dataset.category;
  let expanded = false;
  const mobile = window.matchMedia('(max-width: 768px)');
  const modal = document.querySelector('.product-modal');
  let modalTrigger = null;

  const openProduct = (card) => {
    const product = products.find((item) => item.id === card.dataset.productId);
    if (!product || !modal || modal.open) return;
    modalTrigger = card;
    modal.querySelector('#product-modal-title').textContent = product.name;
    modal.querySelector('#product-modal-description').textContent = product.description;
    modal.querySelector('.product-modal__price').textContent = `$${Number(product.price).toFixed(2)}`;
    const image = modal.querySelector('.product-modal__image');
    image.src = product.image;
    image.alt = product.name;
    const sizes = modal.querySelector('.product-modal__sizes');
    const additives = modal.querySelector('.product-modal__additives');
    sizes.replaceChildren();
    additives.replaceChildren();
    const createOption = (type, value, badge, text, checked = false) => {
      const label = document.createElement('label');
      label.className = 'product-modal__option';
      const input = document.createElement('input');
      input.type = type;
      input.name = type === 'radio' ? 'product-size' : 'product-additive';
      input.value = value;
      input.checked = checked;
      const pill = document.createElement('span');
      pill.className = 'product-modal__pill';
      const marker = document.createElement('span');
      marker.className = 'product-modal__badge';
      marker.textContent = badge;
      pill.append(marker, document.createTextNode(text));
      label.append(input, pill);
      return label;
    };
    Object.entries(product.sizes).forEach(([key, size], index) => {
      sizes.append(createOption('radio', key, key.toUpperCase(), size.size, index === 0));
    });
    product.additives.forEach((additive, index) => {
      additives.append(createOption('checkbox', String(index), String(index + 1), additive.name));
    });
    const updateTotal = () => {
      const size = sizes.querySelector('input:checked').value;
      let cents = Math.round(Number(product.price) * 100)
        + Math.round(Number(product.sizes[size]['add-price']) * 100);
      additives.querySelectorAll('input:checked').forEach((input) => {
        cents += Math.round(Number(product.additives[Number(input.value)]['add-price']) * 100);
      });
      modal.querySelector('.product-modal__price').textContent = `$${(cents / 100).toFixed(2)}`;
    };
    sizes.onchange = updateTotal;
    additives.onchange = updateTotal;
    updateTotal();
    document.documentElement.classList.add('product-modal-open');
    modal.showModal();
  };

  if (modal) {
    modal.querySelector('.product-modal__close').addEventListener('click', () => modal.close());
    // Dialog backdrop events target the dialog itself; its padded interior stays open.
    let startedOutside = false;
    const outside = (event) => {
      const rect = modal.getBoundingClientRect();
      return event.clientX < rect.left || event.clientX > rect.right
        || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    modal.addEventListener('pointerdown', (event) => { startedOutside = outside(event); });
    modal.addEventListener('click', (event) => {
      if (event.target === modal && startedOutside && outside(event)) modal.close();
      startedOutside = false;
    });
    modal.addEventListener('close', () => {
      document.documentElement.classList.remove('product-modal-open');
      if (modalTrigger?.getClientRects().length) modalTrigger.focus({ preventScroll: true });
      else categories.find((button) => button.getAttribute('aria-pressed') === 'true')?.focus();
    });
  }

  list.addEventListener('click', (event) => {
    const card = event.target.closest('.product-card');
    if (card) openProduct(card);
  });
  list.addEventListener('keydown', (event) => {
    const card = event.target.closest('.product-card');
    if (card && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openProduct(card);
    }
  });

  const updateVisibility = () => {
    const items = [...list.children];
    const limit = mobile.matches && !expanded ? 4 : items.length;
    items.forEach((item, index) => { item.hidden = index >= limit; });
    showMore.hidden = items.length <= limit;
    status.textContent = `${Math.min(limit, items.length)} of ${items.length} ${selectedCategory} products shown`;
  };
  const createCard = (product) => {
    const item = document.createElement('li');
    item.className = 'menu__item';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', `View ${product.name}`);

    if (product.image) {
      const image = document.createElement('img');
      image.className = 'product-card__image';
      image.src = product.image;
      image.alt = product.name;
      image.width = 340;
      image.height = 340;
      image.loading = 'lazy';
      card.append(image);
    }

    const content = document.createElement('div');
    content.className = 'product-card__content';
    for (const [tag, className, text] of [
      ['h2', 'product-card__title', product.name],
      ['p', 'product-card__description', product.description],
      ['p', 'product-card__price', `$${Number(product.price).toFixed(2)}`],
    ]) {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = text;
      content.append(element);
    }
    card.append(content);
    item.append(card);
    return item;
  };

  const selectCategory = (selected) => {
    const category = selected.dataset.category;
    selectedCategory = category;
    expanded = false;
    categories.forEach((button) => {
      button.setAttribute('aria-pressed', String(button === selected));
    });
    const matching = products.filter((product) => product.category === category);
    list.replaceChildren(...matching.map(createCard));
    list.setAttribute('aria-label', `${category} products`);
    updateVisibility();
    status.classList.add('menu__status--loaded');
  };

  showMore.addEventListener('click', () => {
    expanded = true;
    updateVisibility();
    // Keep keyboard users at the first newly revealed product.
    const firstNewCard = list.children[4]?.querySelector('.product-card');
    firstNewCard?.focus({ preventScroll: true });
  });

  mobile.addEventListener('change', () => {
    expanded = false;
    if (products.length) updateVisibility();
  });

  categories.forEach((button) => {
    button.disabled = true;
    button.addEventListener('click', () => selectCategory(button));
  });

  fetch('./scripts/products.json')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load product data');
      return response.json();
    })
    .then((data) => {
      const counts = {};
      products = data.map((product) => {
        const index = counts[product.category] = (counts[product.category] || 0) + 1;
        return {
          ...product,
          id: `${product.category}-${index}`,
          image: `./assets/images/${product.category}-${index}.jpg`,
        };
      });
      selectCategory(categories[0]);
      categories.forEach((button) => { button.disabled = false; });
    })
    .catch(() => {
      status.textContent = 'Products could not be loaded. Please reload the page to try again.';
    });
})();
