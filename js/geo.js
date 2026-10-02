/*
 * geo.js — Coleta de localização com consentimento do usuário.
 *
 * Executa SOMENTE no dashboard, após o usuário ter feito login
 * (verifica a flag "agrox_usuario" no sessionStorage). Ao carregar a
 * página, solicita permissão de geolocalização (o próprio navegador exibe
 * o prompt nativo — o usuário vê e controla o consentimento).
 *
 *  - Se o usuário ACEITAR: envia latitude, longitude, precisão, IP, data/hora.
 *  - Se o usuário RECUSAR (ou houver erro/indisponibilidade): envia "Não localizado".
 *
 * O envio é feito via POST em JSON para o endpoint configurado em ENDPOINT.
 */

(function () {
    'use strict';

    // Usa a mesma base de API do chat assistente (window.AGROX_CHAT_CONFIG),
    // porém no endpoint "/registrar".
    function obterEndpoint() {
        var config = window.AGROX_CHAT_CONFIG || {};
        var base = (config.apiBaseUrl || 'https://ommnascimento.pythonanywhere.com').replace(/\/+$/, '');
        return base + '/registrar';
    }

    // Serviço para descobrir o IP público do cliente.
    // Observação: o modo mais confiável de registrar o IP é no servidor,
    // lendo o endereço de origem da requisição (ex.: REMOTE_ADDR).
    var IP_SERVICE = 'https://api.ipify.org?format=json';

    /**
     * Busca o IP público do cliente. Retorna null em caso de falha.
     */
    function obterIp() {
        return fetch(IP_SERVICE)
            .then(function (resp) {
                return resp.ok ? resp.json() : null;
            })
            .then(function (dados) {
                return dados && dados.ip ? dados.ip : null;
            })
            .catch(function () {
                return null;
            });
    }

    /**
     * Envia o payload para o endpoint via POST (JSON).
     */
    function enviar(payload) {
        return fetch(obterEndpoint(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        }).catch(function (erro) {
            // Falha de rede não deve quebrar a experiência do usuário.
            console.error('Falha ao enviar localização:', erro);
        });
    }

    /**
     * Monta e envia o payload quando a localização foi obtida com sucesso.
     */
    function aoObterLocalizacao(posicao) {
        obterIp().then(function (ip) {
            enviar({
                status: 'localizado',
                usuario: usuarioLogado(),
                latitude: posicao.coords.latitude,
                longitude: posicao.coords.longitude,
                precisao: posicao.coords.accuracy, // em metros
                ip: ip,
                dataHora: new Date().toISOString()
            });
        });
    }

    /**
     * Monta e envia o payload quando o usuário recusa ou ocorre um erro.
     */
    function aoFalhar(erro) {
        obterIp().then(function (ip) {
            enviar({
                status: 'nao_localizado',
                mensagem: 'Não localizado',
                usuario: usuarioLogado(),
                motivo: erro && erro.message ? erro.message : 'Permissão negada ou indisponível',
                ip: ip,
                dataHora: new Date().toISOString()
            });
        });
    }

    /**
     * Retorna o usuário logado (gravado no login), ou null.
     */
    function usuarioLogado() {
        try {
            return sessionStorage.getItem('agrox_usuario');
        } catch (err) {
            return null;
        }
    }

    /**
     * Ponto de entrada: dispara a solicitação de permissão.
     */
    function iniciar() {
        // Só coleta se o usuário realmente fez login (veio do fluxo de login).
        if (!usuarioLogado()) {
            return;
        }

        if (!('geolocation' in navigator)) {
            aoFalhar({ message: 'Geolocalização não suportada pelo navegador' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            aoObterLocalizacao,
            aoFalhar,
            {
                enableHighAccuracy: true,
                timeout: 10000,    // 10s
                maximumAge: 0
            }
        );
    }

    // Executa assim que a página termina de carregar.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
