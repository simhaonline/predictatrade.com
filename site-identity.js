(() => {
  const update = () => {
    document.querySelectorAll('[href="mailto:hello@predict-a-trade.com"]').forEach(link => { link.href = 'mailto:predictatrade@gmail.com'; });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.replaceAll('hello@predict-a-trade.com', 'predictatrade@gmail.com').replaceAll('Simha Online', 'Simha FinTech');
    });
    document.querySelectorAll('[href="https://simhaonline.com"]').forEach(link => { link.href = 'https://predictatrade.com/'; });
    document.querySelectorAll('.module-strip').forEach(node => node.remove());
    const footerNav = document.querySelector('.footer-nav');
    if (footerNav && !footerNav.querySelector('a[href="/features/"]')) {
      const link = document.createElement('a');
      link.href = '/features/';
      link.textContent = 'Capabilities';
      footerNav.appendChild(link);
    }
    const capabilities = document.querySelector('#public-capabilities');
    const siteFooter = document.querySelector('.site-footer');
    if (capabilities && siteFooter && siteFooter.parentNode !== capabilities.parentNode) {
      siteFooter.parentNode.insertBefore(capabilities, siteFooter);
    }
    if (capabilities && siteFooter) capabilities.classList.add('is-ready');
    const newsletter = document.querySelector('#newsletter-signup');
    if (newsletter && siteFooter && siteFooter.parentNode !== newsletter.parentNode) {
      siteFooter.parentNode.insertBefore(newsletter, siteFooter);
    }
    if (newsletter && siteFooter) newsletter.classList.add('is-ready');
    const newsletterForm = document.querySelector('#newsletter-form');
    if (newsletterForm && !newsletterForm.dataset.bound) {
      newsletterForm.dataset.bound = 'true';
      newsletterForm.addEventListener('submit', event => {
        event.preventDefault();
        const email = document.querySelector('#newsletter-email').value.trim();
        const subject = encodeURIComponent('Predict-A-Trade newsletter subscription');
        const body = encodeURIComponent('Please add ' + email + ' to the Predict-A-Trade newsletter.');
        document.querySelector('#newsletter-status').textContent = 'Opening your email app to confirm the request…';
        window.location.href = 'mailto:predictatrade@gmail.com?subject=' + subject + '&body=' + body;
      });
    }
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand && !footerBrand.dataset.rebranded) {
      footerBrand.dataset.rebranded = 'true';
      footerBrand.replaceChildren();
      const lockup = document.createElement('img');
      lockup.src = '/media/predict-a-trade_primary-vertical.png';
      lockup.alt = 'Predict-A-Trade';
      lockup.className = 'footer-brand-lockup';
      footerBrand.append(lockup);
    }
    const scrollTop = document.querySelector('#scroll-top');
    if (scrollTop && !scrollTop.dataset.bound) {
      scrollTop.dataset.bound = 'true';
      const toggleScrollTop = () => scrollTop.classList.toggle('is-visible', window.scrollY > 420);
      window.addEventListener('scroll', toggleScrollTop, {passive: true});
      scrollTop.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      });
      toggleScrollTop();
    }
  };
  new MutationObserver(update).observe(document.documentElement, {childList: true, subtree: true});
  update();
})();
