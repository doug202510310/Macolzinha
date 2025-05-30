/* filepath: c:\Users\dougl\Desktop\Gestão de rotina\login.js */

document.addEventListener("DOMContentLoaded", () => {
    // Verificar se já está logado nesta sessão
    if (sessionStorage.getItem('logado') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('error-msg');

    // Focar no campo de usuário ao carregar
    if (usernameInput) usernameInput.focus();

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            // Limpar mensagem de erro anterior
            if (errorMsg) errorMsg.textContent = '';

            // Usuário e senha definidos no código
            if (username === 'mariacarolina' && password === 'douglas0708') {
                // Salvar login apenas para esta sessão (expira ao fechar navegador)
                sessionStorage.setItem('logado', 'true');
                
                console.log('✅ Login realizado com sucesso');
                
                // Feedback visual de sucesso
                if (errorMsg) {
                    errorMsg.style.color = '#4caf50';
                    errorMsg.textContent = 'Login realizado! Redirecionando...';
                }
                
                // Redirecionar após breve delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
                
            } else {
                // Credenciais inválidas
                if (errorMsg) {
                    errorMsg.style.color = '#ff4444';
                    errorMsg.textContent = 'Usuário ou senha inválidos!';
                }
                
                // Limpar campos após erro
                passwordInput.value = '';
                usernameInput.focus();
                
                console.log('❌ Tentativa de login inválida');
            }
        });
    }
});