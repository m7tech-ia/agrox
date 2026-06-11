(function () {
    'use strict';

    var config = window.AGROX_CHAT_CONFIG || {};
    var enviando = false;

    var chatForm = document.getElementById('chatSimForm');
    var chatInput = document.getElementById('chatSimInput');
    var chatLog = document.getElementById('chatSimLog');
    var chatBtn = document.getElementById('chatSimBtn');

    if (!chatForm || !chatInput || !chatLog || !chatBtn) return;

    function obterBaseUrl() {
        var base = (config.apiBaseUrl || 'https://ommnascimento.pythonanywhere.com').replace(/\/+$/, '');
        return base;
    }

    function removerPlaceholder() {
        var ph = document.getElementById('chatSimPlaceholder');
        if (ph && ph.parentNode) {
            ph.parentNode.removeChild(ph);
        }
    }

    function criarBubble(texto, tipo) {
        var row = document.createElement('div');
        row.className = 'mb-2 clearfix';

        var bubble = document.createElement('div');
        bubble.className = 'small rounded px-2 py-2 ' + (tipo === 'usuario'
            ? 'chat-sim-bubble-user float-right'
            : 'chat-sim-bubble-bot float-left');
        bubble.textContent = texto;

        row.appendChild(bubble);
        return row;
    }

    function appendMensagem(texto, tipo) {
        removerPlaceholder();
        chatLog.appendChild(criarBubble(texto, tipo));
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function appendCarregando() {
        removerPlaceholder();
        var row = document.createElement('div');
        row.id = 'chatSimCarregando';
        row.className = 'mb-2 clearfix';

        var bubble = document.createElement('div');
        bubble.className = 'small rounded px-2 py-2 chat-sim-bubble-bot float-left text-muted font-italic';
        bubble.textContent = 'Aguarde, consultando o assistente…';

        row.appendChild(bubble);
        chatLog.appendChild(row);
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    function removerCarregando() {
        var el = document.getElementById('chatSimCarregando');
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    function extrairErroApi(data) {
        if (data && data.error && data.error.message) {
            return data.error.message;
        }
        return null;
    }

    function extrairTextoResposta(data) {
        if (data && data.data && typeof data.data.message === 'string') {
            return data.data.message.trim();
        }
        return '';
    }

    function perguntarAssistente(pergunta) {
        return fetch(obterBaseUrl() + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: pergunta })
        })
            .then(function (resposta) {
                return resposta.json().then(function (data) {
                    if (!resposta.ok) {
                        var msg = extrairErroApi(data) || ('Erro HTTP ' + resposta.status);
                        throw new Error(msg);
                    }
                    return data;
                });
            })
            .then(function (data) {
                var texto = extrairTextoResposta(data);
                if (!texto) {
                    throw new Error('A API não retornou texto na resposta.');
                }
                return texto;
            });
    }

    function definirEstadoFormulario(ativo) {
        enviando = !ativo;
        chatBtn.disabled = !ativo;
        chatInput.disabled = !ativo;
    }

    chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (enviando) return;

        var texto = chatInput.value.replace(/^\s+|\s+$/g, '');
        if (!texto) return;

        appendMensagem(texto, 'usuario');
        chatInput.value = '';
        definirEstadoFormulario(false);
        appendCarregando();

        perguntarAssistente(texto)
            .then(function (resposta) {
                removerCarregando();
                appendMensagem(resposta, 'bot');
            })
            .catch(function (err) {
                removerCarregando();
                var detalhe = err.message || 'Erro desconhecido.';
                if (err.message === 'Failed to fetch') {
                    detalhe = 'Não foi possível conectar à API em ' + obterBaseUrl()
                        + '. Verifique se o servidor Flask está em execução.';
                }
                appendMensagem('Não foi possível obter resposta: ' + detalhe, 'bot');
            })
            .finally(function () {
                definirEstadoFormulario(true);
                chatInput.focus();
            });
    });
})();
