// ============================================================
// script.js — Login, Registro e Redirecionamento
// ============================================================

// ---- ALTERNAR ABAS (Login ↔ Registro) ----------------------
const container    = document.querySelector('.container');
const registerBtn  = document.querySelector('.register-btn');
const loginBtn     = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => container.classList.add('active'));
loginBtn.addEventListener('click',    () => container.classList.remove('active'));


// ---- UTILITÁRIO: exibir mensagem de erro -------------------
/**
 * showError(inputElement, mensagem)
 * Adiciona borda vermelha no input e exibe um <p> de erro logo abaixo.
 * Remove o erro automaticamente quando o usuário começa a digitar.
 */
function showError(input, message) {
  // Remove erro anterior se houver
  clearError(input);

  input.style.border = '2px solid #e74c3c';

  const p = document.createElement('p');
  p.className = 'input-error';
  p.textContent = message;
  p.style.cssText = 'color:#e74c3c;font-size:12px;margin:-20px 0 10px;text-align:left;';
  input.parentElement.insertAdjacentElement('afterend', p);

  // Limpa o erro quando o usuário começar a digitar
  input.addEventListener('input', () => clearError(input), { once: true });
}

function clearError(input) {
  input.style.border = '';
  const next = input.parentElement.nextElementSibling;
  if (next && next.classList.contains('input-error')) next.remove();
}


// ---- LOGIN -------------------------------------------------
/**
 * handleLogin()
 * Chamado pelo onclick do botão de Login no HTML.
 * 1. Valida os campos
 * 2. Verifica as credenciais no localStorage
 * 3. Se correto, salva sessão e redireciona para a home
 */
function handleLogin() {
  // Pega os inputs pelo ID (definidos no index.html)
  const username = document.getElementById('login-user');
  const password = document.getElementById('login-pass');

  let valido = true;

  // Validação: campos não podem estar vazios
  if (!username.value.trim()) {
    showError(username, 'Informe seu e-mail ou usuário.');
    valido = false;
  }
  if (!password.value) {
    showError(password, 'Informe sua senha.');
    valido = false;
  }
  if (!valido) return;

  // Busca o usuário salvo no localStorage
  const chave    = 'usuario_' + username.value.trim().toLowerCase();
  const salvo    = localStorage.getItem(chave);

  if (!salvo) {
    showError(username, 'Usuário não encontrado. Crie uma conta.');
    return;
  }

  const usuario = JSON.parse(salvo);

  if (usuario.senha !== password.value) {
    showError(password, 'Senha incorreta. Tente novamente.');
    return;
  }

  // ✅ Credenciais corretas — salva a sessão
  // sessionStorage dura enquanto a aba do navegador estiver aberta
  sessionStorage.setItem('logado', JSON.stringify({
    nome:  usuario.nome,
    email: usuario.email
  }));

  // ✅ REDIRECIONA para a tela home (mapa)
  window.location.href = '../pasta_home/index.html';
}


// ---- REGISTRO ----------------------------------------------
/**
 * handleRegister()
 * Chamado pelo onclick do botão de Registro no HTML.
 * 1. Valida os campos
 * 2. Verifica se o e-mail já está cadastrado
 * 3. Salva o novo usuário no localStorage
 * 4. Loga automaticamente e redireciona para a home
 */
function handleRegister() {
  // Pega os inputs pelo ID (definidos no index.html)
  const nome  = document.getElementById('reg-nome');
  const email = document.getElementById('reg-email');
  const senha = document.getElementById('reg-pass');

  let valido = true;

  if (!nome.value.trim()) {
    showError(nome, 'Informe seu nome.');
    valido = false;
  }
  if (!email.value.trim() || !email.value.includes('@')) {
    showError(email, 'Informe um e-mail válido.');
    valido = false;
  }
  if (senha.value.length < 6) {
    showError(senha, 'A senha precisa ter pelo menos 6 caracteres.');
    valido = false;
  }
  if (!valido) return;

  const chave = 'usuario_' + email.value.trim().toLowerCase();

  // Verifica se o e-mail já existe
  if (localStorage.getItem(chave)) {
    showError(email, 'Este e-mail já está cadastrado. Faça login.');
    return;
  }

  // Salva o novo usuário
  localStorage.setItem(chave, JSON.stringify({
    nome:  nome.value.trim(),
    email: email.value.trim().toLowerCase(),
    senha: senha.value
  }));

  // Loga automaticamente após o registro
  sessionStorage.setItem('logado', JSON.stringify({
    nome:  nome.value.trim(),
    email: email.value.trim().toLowerCase()
  }));

  // ✅ REDIRECIONA para a tela home (mapa)
  window.location.href = '../pasta_home/index.html';
}
