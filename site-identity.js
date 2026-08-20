(() => {
  const update = () => {
    document.querySelectorAll('[href="mailto:hello@predict-a-trade.com"]').forEach(link => { link.href = 'mailto:predictatrade@gmail.com'; });
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.replaceAll('hello@predict-a-trade.com', 'predictatrade@gmail.com');
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
  };
  new MutationObserver(update).observe(document.documentElement, {childList: true, subtree: true});
  update();
})();
