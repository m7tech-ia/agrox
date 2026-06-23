(function () {
    var USUARIO_OK = 'admin';
    var SENHA_OK = '123';

    var form = document.getElementById('formLogin');
    var erro = document.getElementById('loginErro');
    var btn = document.getElementById('btnEntrar');

    function mostrarErro(msg) {
        erro.textContent = msg;
        erro.classList.remove('d-none');
    }

    function esconderErro() {
        erro.classList.add('d-none');
        erro.textContent = '';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        esconderErro();

        var usuario = document.getElementById('usuario').value.trim();
        var senha = document.getElementById('senha').value;

        if (!usuario || !senha) {
            mostrarErro('Preencha usuário e senha.');
            return;
        }

        if (usuario === USUARIO_OK && senha === SENHA_OK) {
            btn.disabled = true;
            btn.textContent = 'Entrando…';
            try {
                sessionStorage.setItem('agrox_usuario', usuario);
            } catch (err) { }
            window.location.href = 'dashboard.html';
            return;
        }

        mostrarErro('Usuário ou senha incorretos.');
    });
})();
