// ============================================================
// ETAPA 1 — Enviar código para o e-mail
// ============================================================

/**
 * sendCode()
 * Valida o e-mail digitado e avança para a Etapa 2 (inserção do código).
 */
function sendCode() {
  const input = document.getElementById('emailInput');
  const email = input.value.trim();

  // Validação simples: campo não vazio, contém "@" e "."
  if (!email || !email.includes('@') || !email.includes('.')) {
    input.classList.add('error'); // borda vermelha via CSS
    return;
  }

  input.classList.remove('error');

  // Exibe o e-mail como "tag" no topo da Etapa 2
  document.getElementById('emailTag').textContent = email;

  // Oculta a Etapa 1 e exibe a Etapa 2
  document.getElementById('step1').style.display = 'none';
  const step2 = document.getElementById('step2');
  step2.style.display = 'flex';

  // Prepara os campos de código
  setupCodeInputs();
}

// ============================================================
// ETAPA 2 — Configurar campos de código
// ============================================================

/**
 * setupCodeInputs()
 * Limpa e configura os 6 campos de dígito:
 *  - Avança o foco automaticamente ao digitar
 *  - Volta o foco ao pressionar Backspace em campo vazio
 */
function setupCodeInputs() {
  const inputs = document.querySelectorAll('.code-digit');

  inputs.forEach((inp, i) => {
    // Reseta o campo
    inp.value = '';
    inp.disabled = false;
    inp.className = 'code-digit';

    // Ao digitar: aceita só números e avança para o próximo campo
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, ''); // remove não-dígitos
      if (inp.value && i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
    });

    // Ao pressionar Backspace num campo já vazio, volta ao anterior
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && i > 0) {
        inputs[i - 1].focus();
      }
    });
  });

  // Foca no primeiro campo automaticamente
  inputs[0].focus();

  // Reseta o botão de verificar
  const btn = document.getElementById('verifyBtn');
  btn.textContent = 'Verificar código';
  btn.className = 'btn-primary';
}

// ============================================================
// ETAPA 2 — Verificar o código digitado
// ============================================================

/**
 * verifyCode()
 * Junta os 6 dígitos e valida se estão todos preenchidos.
 * Em produção, substituir o bloco comentado pela chamada real à API.
 */
function verifyCode() {
  const inputs = document.querySelectorAll('.code-digit');
  const code = [...inputs].map(i => i.value).join('');

  // Se algum campo estiver vazio, marca todos com erro
  if (code.length < 6) {
    inputs.forEach(i => i.classList.add('error'));
    return;
  }

  // TODO: chamar o back-end para validar o código
  // fetch('/api/verify-code', {
  //   method: 'POST',
  //   body: JSON.stringify({ code })
  // })

  // Feedback visual de sucesso
  inputs.forEach(i => {
    i.classList.remove('error');
    i.classList.add('success');
    i.disabled = true;
  });

  const btn = document.getElementById('verifyBtn');
  btn.textContent = 'Código verificado!';
  btn.classList.add('success');

  // Redireciona para a tela de nova senha após 1,5 segundos
  setTimeout(() => {
    window.location.href = 'nova-senha.html'; // ajuste o caminho conforme necessário
  }, 1500);
}

// ============================================================
// Auxiliares
// ============================================================

/**
 * resendCode()
 * Reseta os campos para que o usuário possa tentar novamente.
 */
function resendCode() {
  setupCodeInputs();
}

/**
 * goBack()
 * Volta da Etapa 2 para a Etapa 1, permitindo alterar o e-mail.
 */
function goBack() {
  document.getElementById('step2').style.display = 'none';
  document.getElementById('step1').style.display = 'block';
}
