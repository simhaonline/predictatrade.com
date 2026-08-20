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
  };
  new MutationObserver(update).observe(document.documentElement, {childList: true, subtree: true});
  update();
})();
