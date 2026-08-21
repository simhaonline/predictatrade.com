(() => {
  const update = () => {
    document.querySelectorAll('[href="mailto:hello@predict-a-trade.com"]').forEach(link => { link.href = 'mailto:predictatrade@gmail.com'; });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.replaceAll('hello@predict-a-trade.com', 'predictatrade@gmail.com').replaceAll('Simha Online', 'Simha FinTech').replaceAll('PAT / ', '').replaceAll('Forward with context', 'Make decisions with context');
    });
    document.querySelectorAll('[href="https://simhaonline.com"]').forEach(link => { link.href = 'https://predictatrade.com/'; });
    document.querySelectorAll('.hero-visual img').forEach(image => {
      image.src = '/media/predict-a-trade-static-hero.webp';
      image.alt = 'Abstract gold-market signal and analytical context';
    });
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
        const status = document.querySelector('#newsletter-status');
        status.textContent = 'Sending your request…';
        fetch('/api/contact.php', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'newsletter', email, consent: true})})
          .then(response => response.json().then(result => ({ok: response.ok && result.ok, message: result.message})))
          .then(result => { status.textContent = result.ok ? result.message : result.message || 'Unable to send your request.'; if (result.ok) newsletterForm.reset(); })
          .catch(() => { status.textContent = 'Unable to send your request. Please email predictatrade@gmail.com.'; });
      });
    }
    const contactPanel = document.querySelector('.contact-panel');
    if (contactPanel && !contactPanel.querySelector('.contact-form')) {
      const oldButton = contactPanel.querySelector('a[href^="mailto:"]');
      if (oldButton) oldButton.remove();
      const form = document.createElement('form');
      form.className = 'contact-form';
      form.innerHTML = '<input name="name" type="text" placeholder="Your name" autocomplete="name" required><input name="email" type="email" placeholder="Your email" autocomplete="email" required><textarea name="message" placeholder="How can we help?" rows="4" required></textarea><label><input name="consent" type="checkbox" required> I agree to be contacted about this message.</label><input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" class="contact-honeypot"><button type="submit">Send message</button><p class="contact-status" role="status" aria-live="polite"></p>';
      form.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(form);
        const status = form.querySelector('.contact-status');
        status.textContent = 'Sending your message…';
        fetch('/api/contact.php', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({kind: 'contact', name: formData.get('name'), email: formData.get('email'), message: formData.get('message'), consent: formData.get('consent') === 'on', website: formData.get('website')})})
          .then(response => response.json().then(result => ({ok: response.ok && result.ok, message: result.message})))
          .then(result => { status.textContent = result.ok ? result.message : result.message || 'Unable to send your message.'; if (result.ok) form.reset(); })
          .catch(() => { status.textContent = 'Unable to send your message. Please email predictatrade@gmail.com.'; });
      });
      contactPanel.appendChild(form);
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
