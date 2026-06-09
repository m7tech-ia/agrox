(function () {
    var nomeUsuario = null;
    try {
        nomeUsuario = sessionStorage.getItem('agrox_usuario');
    } catch (e) { }
    if (!nomeUsuario) {
        window.location.replace('index.html');
        return;
    }

    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var btnMenu = document.getElementById('btnMenu');
    var navLinks = document.querySelectorAll('.dashboard-sidebar .nav-link');
    var tituloPagina = document.getElementById('tituloPagina');

    var textoBoasVindas = 'Bem-vindo(a), ' + nomeUsuario + '!';
    var msgBoasVindas = document.getElementById('msgBoasVindas');
    if (msgBoasVindas) {
        msgBoasVindas.textContent = textoBoasVindas;
        msgBoasVindas.setAttribute('title', textoBoasVindas);
    }

    var btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', function () {
            try {
                sessionStorage.removeItem('agrox_usuario');
            } catch (e2) { }
            window.location.href = 'index.html';
        });
    }

    var titulos = {
        inicio: 'Início',
        plantio: 'Plantio',
        insumos: 'Insumos',
        'manejo-atividades': 'Manejo e atividades',
        'maquinas-equipamentos': 'Máquinas e equipamentos',
        'producao-colheita': 'Produção e colheita',
        solo: 'Solo'
    };

    function isMobile() {
        return window.matchMedia('(max-width: 767.98px)').matches;
    }

    function fecharMenuMobile() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');
        btnMenu.setAttribute('aria-expanded', 'false');
    }

    function abrirMenuMobile() {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');
        btnMenu.setAttribute('aria-expanded', 'true');
    }

    function alternarMenuMobile() {
        if (sidebar.classList.contains('is-open')) {
            fecharMenuMobile();
        } else {
            abrirMenuMobile();
        }
    }

    btnMenu.addEventListener('click', alternarMenuMobile);
    overlay.addEventListener('click', fecharMenuMobile);

    window.addEventListener('resize', function () {
        if (!isMobile()) {
            fecharMenuMobile();
        }
    });

    function mostrarSecao(id) {
        var secoes = document.querySelectorAll('.content-section');
        for (var i = 0; i < secoes.length; i++) {
            secoes[i].classList.remove('is-active');
        }
        var alvo = document.getElementById('section-' + id);
        if (alvo) {
            alvo.classList.add('is-active');
        }
        tituloPagina.textContent = titulos[id] || id;
    }

    function definirAtivo(link) {
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].classList.remove('active');
        }
        link.classList.add('active');
    }

    for (var j = 0; j < navLinks.length; j++) {
        navLinks[j].addEventListener('click', function (e) {
            e.preventDefault();
            var sec = this.getAttribute('data-section');
            if (!sec) return;
            definirAtivo(this);
            mostrarSecao(sec);
            if (isMobile()) {
                fecharMenuMobile();
            }
        });
    }

    function climaCodigoDescricao(code) {
        var map = {
            0: 'Céu limpo',
            1: 'Predominantemente limpo',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Névoa',
            48: 'Névoa com geada',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa densa',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            71: 'Neve leve',
            73: 'Neve moderada',
            75: 'Neve forte',
            80: 'Pancadas leves',
            81: 'Pancadas moderadas',
            82: 'Pancadas violentas',
            95: 'Trovoadas',
            96: 'Trovoadas com granizo leve',
            99: 'Trovoadas com granizo forte'
        };
        return map[code] != null ? map[code] : 'Condição variável';
    }

    var calMesRef = new Date();
    calMesRef.setDate(1);

    function calFormatarIso(ano, mes, dia) {
        var mm = mes + 1;
        return ano + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dia < 10 ? '0' : '') + dia;
    }

    function calEscHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;');
    }

    function calMontarMarcadores(iso, indice) {
        var eventos = indice[iso];
        if (!eventos || !eventos.length) return '';
        var html = '<div class="cal-marcadores">';
        for (var e = 0; e < eventos.length; e++) {
            var ev = eventos[e];
            html += '<span class="cal-icone" title="' + calEscHtml(ev.rotulo) + '">' + ev.icone + '</span>';
        }
        html += '</div>';
        return html;
    }

    function calMontarCelula(dia, classes, iso, indice) {
        var marcadores = calMontarMarcadores(iso, indice);
        var cls = classes;
        if (marcadores) {
            cls = (cls ? cls + ' ' : '') + 'cal-com-evento';
        }
        return '<td' + (cls ? ' class="' + cls + '"' : '') + '>' +
            '<span class="cal-dia-num">' + dia + '</span>' + marcadores + '</td>';
    }

    function renderCalendario() {
        var titulo = document.getElementById('calTitulo');
        var corpo = document.getElementById('calCorpo');
        if (!titulo || !corpo) return;

        var indice = typeof calMontarIndiceEventos === 'function' ? calMontarIndiceEventos() : {};

        var y = calMesRef.getFullYear();
        var m = calMesRef.getMonth();
        titulo.textContent = calMesRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        var primeiroDiaSemana = new Date(y, m, 1).getDay();
        var diasNoMes = new Date(y, m + 1, 0).getDate();
        var diasMesAnterior = new Date(y, m, 0).getDate();
        var hoje = new Date();
        var prevM = m === 0 ? 11 : m - 1;
        var prevY = m === 0 ? y - 1 : y;
        var nextM = m === 11 ? 0 : m + 1;
        var nextY = m === 11 ? y + 1 : y;

        var celulas = [];
        var i;
        for (i = 0; i < primeiroDiaSemana; i++) {
            var numPrev = diasMesAnterior - primeiroDiaSemana + i + 1;
            var isoPrev = calFormatarIso(prevY, prevM, numPrev);
            celulas.push(calMontarCelula(numPrev, 'cal-dia-outro', isoPrev, indice));
        }
        for (var d = 1; d <= diasNoMes; d++) {
            var isHoje = hoje.getFullYear() === y && hoje.getMonth() === m && hoje.getDate() === d;
            var isoAtual = calFormatarIso(y, m, d);
            celulas.push(calMontarCelula(d, isHoje ? 'cal-hoje' : '', isoAtual, indice));
        }
        var prox = 1;
        while (celulas.length % 7 !== 0) {
            var isoProx = calFormatarIso(nextY, nextM, prox);
            celulas.push(calMontarCelula(prox, 'cal-dia-outro', isoProx, indice));
            prox++;
        }

        var html = '';
        for (var k = 0; k < celulas.length; k += 7) {
            html += '<tr>' + celulas.slice(k, k + 7).join('') + '</tr>';
        }
        corpo.innerHTML = html;
    }

    function calRenderLegenda() {
        var el = document.getElementById('calLegenda');
        if (!el || typeof CAL_EVENTOS === 'undefined') return;
        var html = '';
        for (var i = 0; i < CAL_EVENTOS.length; i++) {
            var ev = CAL_EVENTOS[i];
            html += '<span class="cal-legenda-item"><span class="cal-icone" aria-hidden="true">' +
                ev.icone + '</span>' + calEscHtml(ev.rotulo) + '</span>';
        }
        el.innerHTML = html;
    }

    document.getElementById('calPrev').addEventListener('click', function () {
        calMesRef.setMonth(calMesRef.getMonth() - 1);
        renderCalendario();
    });
    document.getElementById('calNext').addEventListener('click', function () {
        calMesRef.setMonth(calMesRef.getMonth() + 1);
        renderCalendario();
    });

    var TEMPO_CIDADES = [
        { nome: 'Bom Retiro do Sul', lat: -29.6058, lon: -51.9442 },
        { nome: 'Estrela', lat: -29.5000, lon: -51.9689 }
    ];

    function tempoMontarUrl(lat, lon) {
        return 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
            '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
            '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
            '&forecast_days=5&timezone=America%2FSao_Paulo';
    }

    var tempoDadosCache = null;

    function tempoRenderCidade(data) {
        var cur = data.current;
        var daily = data.daily;
        if (!cur || !daily || !daily.time) throw new Error('Dados incompletos.');

        var html = '<div class="tempo-cidade">' +
            '<div class="d-flex flex-wrap align-items-baseline mb-2">' +
            '<span class="tempo-atual-num mr-2">' + Math.round(cur.temperature_2m) + ' °C</span>' +
            '<span class="text-muted small">Sensação ' + Math.round(cur.apparent_temperature) + ' °C</span>' +
            '</div>' +
            '<p class="small mb-2">' + climaCodigoDescricao(cur.weather_code) + '</p>' +
            '<p class="small text-muted mb-2">Umidade ' + Math.round(cur.relative_humidity_2m) + '% · Vento ' +
            Math.round(cur.wind_speed_10m) + ' km/h</p>' +
            '<p class="small font-weight-bold text-muted mb-1">Próximos dias</p>';

        for (var d = 0; d < daily.time.length; d++) {
            var t = new Date(daily.time[d] + 'T12:00:00');
            var label = t.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
            var tmin = Math.round(daily.temperature_2m_min[d]);
            var tmax = Math.round(daily.temperature_2m_max[d]);
            var prob = daily.precipitation_probability_max && daily.precipitation_probability_max[d] != null
                ? Math.round(daily.precipitation_probability_max[d])
                : '—';
            html += '<div class="tempo-lista-dia d-flex justify-content-between align-items-center">' +
                '<span>' + label + '</span>' +
                '<span class="text-muted">' + tmin + '° / ' + tmax + '° · chuva ' + prob + '%</span></div>';
        }
        html += '</div>';
        return html;
    }

    function tempoMostrarCidade(indice) {
        var elCidades = document.getElementById('tempoCidades');
        var elSeletor = document.getElementById('tempoSeletor');
        if (!elCidades || !tempoDadosCache || !tempoDadosCache[indice]) return;

        elCidades.innerHTML = tempoRenderCidade(tempoDadosCache[indice].data);

        if (elSeletor) {
            var btns = elSeletor.querySelectorAll('[data-tempo-idx]');
            for (var i = 0; i < btns.length; i++) {
                var ativo = parseInt(btns[i].getAttribute('data-tempo-idx'), 10) === indice;
                btns[i].classList.toggle('active', ativo);
                btns[i].setAttribute('aria-pressed', ativo ? 'true' : 'false');
            }
        }
    }

    function carregarTempoRS() {
        var elLoad = document.getElementById('tempoCarregando');
        var elErr = document.getElementById('tempoErro');
        var elCont = document.getElementById('tempoConteudo');
        var elCidades = document.getElementById('tempoCidades');
        var elSeletor = document.getElementById('tempoSeletor');
        if (!elLoad || !elErr || !elCont || !elCidades) return;

        if (elSeletor && !elSeletor.dataset.bound) {
            elSeletor.dataset.bound = '1';
            elSeletor.addEventListener('click', function (e) {
                var btn = e.target.closest('[data-tempo-idx]');
                if (!btn) return;
                tempoMostrarCidade(parseInt(btn.getAttribute('data-tempo-idx'), 10));
            });
        }

        var promessas = TEMPO_CIDADES.map(function (cidade) {
            return fetch(tempoMontarUrl(cidade.lat, cidade.lon))
                .then(function (r) {
                    if (!r.ok) throw new Error('Falha na resposta do serviço.');
                    return r.json();
                })
                .then(function (data) {
                    return { nome: cidade.nome, data: data };
                });
        });

        Promise.all(promessas)
            .then(function (resultados) {
                tempoDadosCache = resultados;
                tempoMostrarCidade(0);
                elLoad.classList.add('d-none');
                elErr.classList.add('d-none');
                elCont.classList.remove('d-none');
                if (elSeletor) elSeletor.classList.remove('d-none');
            })
            .catch(function (err) {
                elLoad.classList.add('d-none');
                elCont.classList.add('d-none');
                if (elSeletor) elSeletor.classList.add('d-none');
                elErr.textContent = 'Não foi possível carregar a previsão. ' + (err.message || 'Tente mais tarde.');
                elErr.classList.remove('d-none');
            });
    }

    var chatForm = document.getElementById('chatSimForm');
    var chatInput = document.getElementById('chatSimInput');
    var chatLog = document.getElementById('chatSimLog');
    var chatBtn = document.getElementById('chatSimBtn');
    var chatMsgServidorOffline = 'O servidor está fora do ar. Não foi possível obter uma resposta agora. Tente novamente mais tarde.';

    if (chatForm && chatInput && chatLog && chatBtn) {
        function chatRemoverPlaceholder() {
            var ph = document.getElementById('chatSimPlaceholder');
            if (ph && ph.parentNode) {
                ph.parentNode.removeChild(ph);
            }
        }

        function chatAppendMensagem(texto, tipo) {
            var row = document.createElement('div');
            row.className = 'mb-2 clearfix';
            var bubble = document.createElement('div');
            bubble.className = 'small rounded px-2 py-2 ' + (tipo === 'usuario'
                ? 'chat-sim-bubble-user float-right'
                : 'chat-sim-bubble-bot float-left');
            bubble.textContent = texto;
            row.appendChild(bubble);
            chatLog.appendChild(row);
            chatLog.scrollTop = chatLog.scrollHeight;
        }

        chatForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var texto = chatInput.value.replace(/^\s+|\s+$/g, '');
            if (!texto) return;
            chatRemoverPlaceholder();
            chatAppendMensagem(texto, 'usuario');
            chatInput.value = '';
            chatBtn.disabled = true;
            window.setTimeout(function () {
                chatAppendMensagem(chatMsgServidorOffline, 'bot');
                chatBtn.disabled = false;
                chatInput.focus();
            }, 900);
        });
    }

    var LS_AGRO = 'agrox_';

    function agroLerLista(chave) {
        try {
            var raw = localStorage.getItem(LS_AGRO + chave);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function agroGravarLista(chave, arr) {
        localStorage.setItem(LS_AGRO + chave, JSON.stringify(arr));
    }

    var CAL_EVENTOS = [
        { id: 'plantio-data', chave: 'plantio', campo: 'dataPlantio', icone: '🌱', rotulo: 'Plantio' },
        { id: 'plantio-colheita', chave: 'plantio', campo: 'previsaoColheita', icone: '🌾', rotulo: 'Previsão de colheita' },
        { id: 'insumos', chave: 'insumos', campo: 'dataAplicacao', icone: '🧪', rotulo: 'Aplicação de insumo' },
        { id: 'manejo', chave: 'manejo', campo: 'dataAtividade', icone: '🚜', rotulo: 'Manejo / atividade' },
        { id: 'solo', chave: 'solo', campo: 'dataAmostra', icone: '🪨', rotulo: 'Amostra de solo' }
    ];

    function calMontarIndiceEventos() {
        var indice = {};
        for (var i = 0; i < CAL_EVENTOS.length; i++) {
            var ev = CAL_EVENTOS[i];
            var lista = agroLerLista(ev.chave);
            for (var j = 0; j < lista.length; j++) {
                var raw = lista[j][ev.campo];
                if (!raw) continue;
                var iso = String(raw).slice(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue;
                if (!indice[iso]) indice[iso] = [];
                var jaTem = false;
                for (var k = 0; k < indice[iso].length; k++) {
                    if (indice[iso][k].id === ev.id) {
                        jaTem = true;
                        break;
                    }
                }
                if (!jaTem) indice[iso].push(ev);
            }
        }
        return indice;
    }

    function agroFormatarDataBR(iso) {
        if (!iso) return '';
        var s = String(iso);
        var p = s.split('-');
        if (p.length !== 3) return s;
        return p[2] + '/' + p[1] + '/' + p[0];
    }

    function agroPreencherTabela(tbodyId, linhas, colunas, chavesData) {
        var tbody = document.getElementById(tbodyId);
        if (!tbody) return;
        tbody.innerHTML = '';
        if (!linhas.length) {
            var tr0 = document.createElement('tr');
            var td0 = document.createElement('td');
            td0.colSpan = colunas.length;
            td0.className = 'text-muted text-center small py-3';
            td0.textContent = 'Nenhum registro. Use “Novo registro” para adicionar.';
            tr0.appendChild(td0);
            tbody.appendChild(tr0);
            return;
        }
        for (var i = 0; i < linhas.length; i++) {
            var tr = document.createElement('tr');
            var row = linhas[i];
            for (var j = 0; j < colunas.length; j++) {
                var td = document.createElement('td');
                var k = colunas[j];
                var val = row[k];
                if (chavesData[k] && val) {
                    td.textContent = agroFormatarDataBR(String(val));
                } else {
                    td.textContent = val != null && val !== '' ? String(val) : '—';
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }

    function agroFormParaObjeto(form) {
        var obj = {};
        var els = form.querySelectorAll('[name]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (el.type === 'checkbox' && !el.checked) continue;
            if (el.type === 'radio' && !el.checked) continue;
            obj[el.name] = el.value.replace(/^\s+|\s+$/g, '');
        }
        return obj;
    }

    var PLANTIO_COLS = ['cultura', 'talhao', 'dataPlantio', 'qtdSementes', 'variedade', 'espacamento', 'previsaoColheita'];
    var INSUMOS_COLS = ['tipoInsumo', 'estoqueAtual', 'entradaSaida', 'custo', 'dataAplicacao', 'qtdUsada', 'fornecedor'];
    var MANEJO_COLS = ['dataAtividade', 'tipoAtividade', 'quemExecutou', 'maquina', 'tempoGasto', 'custoOperacional', 'clima'];
    var MAQUINAS_COLS = ['nome', 'tipoEquipamento', 'horasTrabalhadas', 'manutencaoPreventiva', 'trocaOleo', 'consumoCombustivel', 'custosManutencao'];
    var PRODUCAO_COLS = ['talhao', 'cultura', 'qtdColhida', 'produtividadeHa', 'qualidade', 'perdas', 'armazenamento'];

    var DATA_KEYS = {
        dataPlantio: true,
        previsaoColheita: true,
        dataAplicacao: true,
        dataAtividade: true
    };

    function agroRenderPlantio() {
        agroPreencherTabela('tbody-plantio', agroLerLista('plantio'), PLANTIO_COLS, DATA_KEYS);
    }
    function agroRenderInsumos() {
        agroPreencherTabela('tbody-insumos', agroLerLista('insumos'), INSUMOS_COLS, DATA_KEYS);
    }
    function agroRenderManejo() {
        agroPreencherTabela('tbody-manejo', agroLerLista('manejo'), MANEJO_COLS, DATA_KEYS);
    }
    function agroRenderMaquinas() {
        agroPreencherTabela('tbody-maquinas', agroLerLista('maquinas'), MAQUINAS_COLS, {});
    }
    function agroRenderProducao() {
        agroPreencherTabela('tbody-producao', agroLerLista('producao'), PRODUCAO_COLS, {});
    }

    function soloRevogarPreviewBlob() {
        var prev = document.getElementById('solo_foto_preview');
        if (prev && prev.src && prev.src.indexOf('blob:') === 0) {
            URL.revokeObjectURL(prev.src);
        }
    }

    function soloImagemParaStorage(arquivo, callback) {
        var reader = new FileReader();
        reader.onerror = function () {
            callback(null);
        };
        reader.onload = function (e) {
            var dataUrl = e.target.result;
            var img = new Image();
            img.onload = function () {
                var maxLado = 960;
                var w = img.width;
                var h = img.height;
                var nw = w;
                var nh = h;
                if (w > maxLado || h > maxLado) {
                    if (w >= h) {
                        nw = maxLado;
                        nh = Math.round(h * (maxLado / w));
                    } else {
                        nh = maxLado;
                        nw = Math.round(w * (maxLado / h));
                    }
                }
                var canvas = document.createElement('canvas');
                canvas.width = nw;
                canvas.height = nh;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, nw, nh);
                var out;
                try {
                    out = canvas.toDataURL('image/jpeg', 0.82);
                } catch (err1) {
                    out = dataUrl;
                }
                callback(out);
            };
            img.onerror = function () {
                callback(dataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(arquivo);
    }

    function agroRenderSolo() {
        var tbody = document.getElementById('tbody-solo');
        if (!tbody) return;
        var linhas = agroLerLista('solo');
        tbody.innerHTML = '';
        if (!linhas.length) {
            var tr0 = document.createElement('tr');
            var td0 = document.createElement('td');
            td0.colSpan = 4;
            td0.className = 'text-muted text-center small py-3';
            td0.textContent = 'Nenhum registro. Use “Novo registro” para adicionar.';
            tr0.appendChild(td0);
            tbody.appendChild(tr0);
            return;
        }
        for (var i = 0; i < linhas.length; i++) {
            var row = linhas[i];
            var tr = document.createElement('tr');
            var tdImg = document.createElement('td');
            var img = document.createElement('img');
            img.className = 'solo-thumb-img';
            img.alt = 'Foto da amostra';
            if (row.imagemBase64 && String(row.imagemBase64).indexOf('data:') === 0) {
                img.src = row.imagemBase64;
            } else {
                img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect fill="#eee" width="72" height="72"/><text x="36" y="42" text-anchor="middle" fill="#999" font-size="11">—</text></svg>');
            }
            tdImg.appendChild(img);
            tr.appendChild(tdImg);
            var tdEst = document.createElement('td');
            tdEst.textContent = row.estadoSolo || '—';
            tr.appendChild(tdEst);
            var tdObs = document.createElement('td');
            tdObs.className = 'solo-obs-celula';
            tdObs.textContent = row.observacao || '—';
            tr.appendChild(tdObs);
            var tdData = document.createElement('td');
            tdData.textContent = row.dataAmostra ? agroFormatarDataBR(String(row.dataAmostra)) : '—';
            tr.appendChild(tdData);
            tbody.appendChild(tr);
        }
    }

    function agroBindSalvar(modalSelector, formId, storageKey, renderFn) {
        var form = document.getElementById(formId);
        if (!form) return;
        $(modalSelector).on('shown.bs.modal', function () {
            form.reset();
        });
        var btnId = {
            formPlantio: 'btnSalvarPlantio',
            formInsumos: 'btnSalvarInsumos',
            formManejo: 'btnSalvarManejo',
            formMaquinas: 'btnSalvarMaquinas',
            formProducao: 'btnSalvarProducao'
        }[formId];
        var btn = document.getElementById(btnId);
        if (!btn) return;
        btn.addEventListener('click', function () {
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var o = agroFormParaObjeto(form);
            o.id = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
            var list = agroLerLista(storageKey);
            list.push(o);
            agroGravarLista(storageKey, list);
            renderFn();
            renderCalendario();
            $(modalSelector).modal('hide');
            form.reset();
        });
    }

    agroBindSalvar('#modalPlantio', 'formPlantio', 'plantio', agroRenderPlantio);
    agroBindSalvar('#modalInsumos', 'formInsumos', 'insumos', agroRenderInsumos);
    agroBindSalvar('#modalManejo', 'formManejo', 'manejo', agroRenderManejo);
    agroBindSalvar('#modalMaquinas', 'formMaquinas', 'maquinas', agroRenderMaquinas);
    agroBindSalvar('#modalProducao', 'formProducao', 'producao', agroRenderProducao);

    if (document.getElementById('modalSolo')) {
        $('#modalSolo').on('shown.bs.modal', function () {
            document.getElementById('formSolo').reset();
            soloRevogarPreviewBlob();
            var prev = document.getElementById('solo_foto_preview');
            prev.classList.add('d-none');
            prev.removeAttribute('src');
        });
        $('#modalSolo').on('hidden.bs.modal', function () {
            soloRevogarPreviewBlob();
        });
        var soloFotoInp = document.getElementById('solo_foto');
        if (soloFotoInp) {
            soloFotoInp.addEventListener('change', function () {
                soloRevogarPreviewBlob();
                var prev = document.getElementById('solo_foto_preview');
                var f = this.files && this.files[0];
                if (!f || f.type.indexOf('image/') !== 0) {
                    prev.classList.add('d-none');
                    prev.removeAttribute('src');
                    return;
                }
                prev.src = URL.createObjectURL(f);
                prev.classList.remove('d-none');
            });
        }
        var btnSalvarSolo = document.getElementById('btnSalvarSolo');
        if (btnSalvarSolo) {
            btnSalvarSolo.addEventListener('click', function () {
                var form = document.getElementById('formSolo');
                var inp = document.getElementById('solo_foto');
                if (!inp.files || !inp.files[0]) {
                    window.alert('Selecione ou tire uma foto da amostra.');
                    return;
                }
                if (inp.files[0].type.indexOf('image/') !== 0) {
                    window.alert('O arquivo precisa ser uma imagem.');
                    return;
                }
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                var file = inp.files[0];
                soloImagemParaStorage(file, function (base64) {
                    if (!base64) {
                        window.alert('Não foi possível ler a imagem.');
                        return;
                    }
                    var o = {
                        id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                        imagemBase64: base64,
                        estadoSolo: document.getElementById('solo_estado').value.replace(/^\s+|\s+$/g, ''),
                        observacao: document.getElementById('solo_obs').value.replace(/^\s+|\s+$/g, ''),
                        dataAmostra: document.getElementById('solo_data').value
                    };
                    var list = agroLerLista('solo');
                    list.push(o);
                    agroGravarLista('solo', list);
                    agroRenderSolo();
                    renderCalendario();
                    $('#modalSolo').modal('hide');
                    form.reset();
                    soloRevogarPreviewBlob();
                    var prev = document.getElementById('solo_foto_preview');
                    prev.classList.add('d-none');
                    prev.removeAttribute('src');
                });
            });
        }
    }

    agroRenderPlantio();
    agroRenderInsumos();
    agroRenderManejo();
    agroRenderMaquinas();
    agroRenderProducao();
    agroRenderSolo();
    calRenderLegenda();
    renderCalendario();

    carregarTempoRS();
})();