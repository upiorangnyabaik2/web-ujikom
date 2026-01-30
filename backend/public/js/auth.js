document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    const parent = input.parentElement;
    parent.style.position = parent.style.position || 'relative';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle';
    btn.innerText = 'Show';
    btn.setAttribute('aria-label', 'Show password');
    Object.assign(btn.style, {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '700',
      color: 'var(--primary)'
    });

    btn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = 'Hide';
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        btn.innerText = 'Show';
        btn.setAttribute('aria-label', 'Show password');
      }
    });

    parent.appendChild(btn);
  });
});
