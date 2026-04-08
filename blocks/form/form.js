export default async function decorate(block) {
  // Extract authored content
  const heading = block.querySelector('h4, h3, h2');
  const subtitle = block.querySelector('div:last-child');
  const subtitleText = subtitle ? subtitle.textContent.trim() : '';

  // Build the lead generation form
  block.innerHTML = '';

  // Heading section
  const headingWrapper = document.createElement('div');
  headingWrapper.className = 'form-heading';
  if (heading) headingWrapper.append(heading);
  if (subtitleText) {
    const sub = document.createElement('p');
    sub.className = 'form-subtitle';
    sub.textContent = subtitleText;
    headingWrapper.append(sub);
  }
  block.append(headingWrapper);

  // Form element
  const form = document.createElement('form');
  form.className = 'form-lead-gen';

  // Email field
  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-field';
  emailGroup.innerHTML = `
    <label for="lead-email"><span class="form-required">*</span>EMAIL</label>
    <input type="email" id="lead-email" name="email" required>
  `;

  // Zip code field
  const zipGroup = document.createElement('div');
  zipGroup.className = 'form-field';
  zipGroup.innerHTML = `
    <label for="lead-zip"><span class="form-required">*</span>ZIP/POSTAL CODE</label>
    <input type="text" id="lead-zip" name="zipcode" required>
  `;

  // Submit button
  const submitWrapper = document.createElement('div');
  submitWrapper.className = 'form-submit';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = '* MATCH POINT TO YOU';
  submitWrapper.append(submitBtn);

  // Input row
  const inputRow = document.createElement('div');
  inputRow.className = 'form-input-row';
  inputRow.append(emailGroup, zipGroup, submitWrapper);
  form.append(inputRow);

  // Terms text
  const terms = document.createElement('p');
  terms.className = 'form-terms';
  terms.innerHTML = '* By clicking <strong>MATCH POINT TO YOU</strong> above, you agree to our '
    + '<a href="/en/home/about-usta/who-we-are/national/usta-terms-of-use">USTA Terms of Use</a> '
    + 'and acknowledge that you have read our '
    + '<a href="/en/home/about-usta/who-we-are/national/usta-privacy-policy">USTA Privacy Policy</a>. '
    + 'You must be 13 years of age or older to subscribe to these communications.';
  form.append(terms);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.checkValidity()) {
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'THANK YOU!';
      btn.disabled = true;
    }
  });

  block.append(form);
}
