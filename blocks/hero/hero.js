export default function decorate(block) {
  const isFoundation = document.body.classList.contains('foundation');
  if (!isFoundation) return;

  const children = [...block.children];
  if (children.length < 2) return;

  const imageDiv = children[0];
  const contentDiv = children[1];

  imageDiv.classList.add('hero-image');
  contentDiv.classList.add('hero-body');
}
