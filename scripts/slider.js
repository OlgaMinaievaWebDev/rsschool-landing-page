(() => {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const track = slider.querySelector('.slider__track');
  const slides = [...slider.querySelectorAll('.slider__slide')];
  const indicators = [...slider.querySelectorAll('.slider__indicator')];
  let current = 0;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.hidden = false;
      slide.setAttribute('aria-hidden', String(!active));
      slide.classList.toggle('slider__slide--active', active);
      slide.inert = !active;
      indicators[slideIndex]?.classList.toggle('slider__indicator--active', active);
    });
  };

  slider.querySelector('.slider__control--previous').addEventListener('click', () => {
    showSlide(current - 1);
  });
  slider.querySelector('.slider__control--next').addEventListener('click', () => {
    showSlide(current + 1);
  });

  showSlide(0);
})();
