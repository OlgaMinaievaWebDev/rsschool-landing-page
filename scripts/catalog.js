(() => {
  const list = document.querySelector('.menu__products');
  const categories = [...document.querySelectorAll('.menu__category')];
  const status = document.querySelector('.menu__status');
  if (!list || !categories.length || !status) return;

  let products = [];
  const createCard = (product) => {
    const item = document.createElement('li');
    item.className = 'menu__item';
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.productId = product.id;

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
    categories.forEach((button) => {
      button.setAttribute('aria-pressed', String(button === selected));
    });
    const matching = products.filter((product) => product.category === category);
    list.replaceChildren(...matching.map(createCard));
    list.setAttribute('aria-label', `${category} products`);
    status.textContent = `${matching.length} ${category} products`;
    status.classList.add('menu__status--loaded');
  };

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
