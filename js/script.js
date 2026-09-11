/* BARBEARIA PREMIUM - interatividade principal do site. */

const header = document.querySelector('.header');
const menuToggle = document.querySelector('.header__menu-toggle');
const navMenu = document.querySelector('.header__nav');
const navLinks = document.querySelectorAll('a[href^="#"]');
const botaoVoltarTopo = document.querySelector('.botao-voltar-topo');
const formContato = document.querySelector('#contato form');

/* Limita chamadas frequentes durante a rolagem. */
function throttle(callback, delay = 150) {
    let ultimaExecucao = 0;
    return (...args) => {
        const agora = Date.now();
        if (agora - ultimaExecucao >= delay) {
            ultimaExecucao = agora;
            callback(...args);
        }
    };
}

/* Rola até a seção descontando a altura do cabeçalho. */
function rolarAte(elemento) {
    if (!elemento) return;
    const alturaHeader = header?.offsetHeight ?? 0;
    const destino = elemento.getBoundingClientRect().top + window.scrollY - alturaHeader;
    window.scrollTo({ top: destino, behavior: 'smooth' });
}

/* Abre, fecha e atualiza o estado acessível do menu móvel. */
function definirMenu(aberto) {
    if (!menuToggle || !navMenu) return;
    navMenu.classList.toggle('header__nav--aberta', aberto);
    menuToggle.classList.toggle('header__menu-toggle--ativo', aberto);
    menuToggle.setAttribute('aria-expanded', String(aberto));
    menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
}

menuToggle?.addEventListener('click', () => {
    definirMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const seletor = link.getAttribute('href');
        if (!seletor || seletor === '#') return;
        const alvo = document.querySelector(seletor);
        if (!alvo) return;
        event.preventDefault();
        definirMenu(false);
        rolarAte(alvo);
    });
});

/* Ajusta o cabeçalho e o botão de retorno durante a rolagem. */
const atualizarRolagem = throttle(() => {
    header?.classList.toggle('header--rolagem', window.scrollY > 50);
    botaoVoltarTopo?.classList.toggle('visivel', window.scrollY > 400);
}, 100);

window.addEventListener('scroll', atualizarRolagem, { passive: true });
botaoVoltarTopo?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Revela cada seção uma vez ao entrar na área visível. */
function iniciarAnimacoes() {
    const secoes = document.querySelectorAll('main section');
    if (!('IntersectionObserver' in window)) {
        secoes.forEach((secao) => secao.classList.add('secao-visivel'));
        return;
    }

    const observer = new IntersectionObserver((entradas, observador) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            entrada.target.classList.add('secao-visivel');
            observador.unobserve(entrada.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    secoes.forEach((secao) => {
        secao.classList.add('secao-oculta');
        observer.observe(secao);
    });
}

/* Alterna os depoimentos e pausa durante a interação. */
function iniciarCarrossel() {
    const secao = document.querySelector('.depoimentos');
    const lista = document.querySelector('.depoimentos__lista');
    const itens = [...document.querySelectorAll('.depoimentos__item')];
    if (!secao || !lista || itens.length < 2) return;

    let indice = 0;
    let intervalo;
    const mostrar = (novoIndice) => {
        indice = novoIndice;
        itens.forEach((item, posicao) => {
            item.classList.toggle('depoimento-ativo', posicao === indice);
        });
    };
    const iniciar = () => {
        window.clearInterval(intervalo);
        intervalo = window.setInterval(() => mostrar((indice + 1) % itens.length), 6000);
    };

    secao.classList.add('depoimentos--carrossel');
    mostrar(0);
    iniciar();
    lista.addEventListener('mouseenter', () => window.clearInterval(intervalo));
    lista.addEventListener('mouseleave', iniciar);
    lista.addEventListener('focusin', () => window.clearInterval(intervalo));
    lista.addEventListener('focusout', iniciar);
}

/* Cria um lightbox acessível para ampliar as imagens. */
function iniciarLightbox() {
    const imagens = document.querySelectorAll('.galeria__lista img');
    if (!imagens.length) return;

    const overlay = document.createElement('div');
    const imagemAmpliada = document.createElement('img');
    const fechar = document.createElement('button');
    let elementoAnterior;

    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Visualização ampliada da galeria');
    imagemAmpliada.className = 'lightbox-imagem';
    fechar.className = 'lightbox-fechar';
    fechar.type = 'button';
    fechar.setAttribute('aria-label', 'Fechar imagem ampliada');
    fechar.textContent = '×';
    overlay.append(imagemAmpliada, fechar);
    document.body.appendChild(overlay);

    const fecharLightbox = () => {
        overlay.classList.remove('lightbox-ativo');
        elementoAnterior?.focus();
    };

    imagens.forEach((imagem) => {
        imagem.tabIndex = 0;
        imagem.setAttribute('role', 'button');
        imagem.setAttribute('aria-label', `Ampliar: ${imagem.alt}`);
        const abrir = () => {
            elementoAnterior = document.activeElement;
            imagemAmpliada.src = imagem.src;
            imagemAmpliada.alt = imagem.alt;
            overlay.classList.add('lightbox-ativo');
            fechar.focus();
        };
        imagem.addEventListener('click', abrir);
        imagem.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                abrir();
            }
        });
    });

    fechar.addEventListener('click', fecharLightbox);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) fecharLightbox();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('lightbox-ativo')) {
            fecharLightbox();
        }
    });
}

/* Marca a linha correspondente ao dia atual. */
function destacarDiaAtual() {
    const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = dias[new Date().getDay()];
    document.querySelectorAll('.horario__tabela tbody tr[data-dias]').forEach((linha) => {
        const atual = linha.dataset.dias.split(' ').includes(hoje);
        linha.classList.toggle('horario__linha--atual', atual);
        if (atual) linha.setAttribute('aria-current', 'date');
    });
}

function telefoneValido(valor) {
    const digitos = valor.replace(/\D/g, '');
    return digitos.length === 10 || digitos.length === 11;
}

/* Retorna a data local sem sofrer deslocamento causado pelo fuso horário. */
function dataLocalISO() {
    const agora = new Date();
    const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
}

function limparErro(campo) {
    campo.classList.remove('campo-invalido');
    campo.removeAttribute('aria-invalid');
    campo.removeAttribute('aria-describedby');
    const mensagem = campo.nextElementSibling;
    if (mensagem?.classList.contains('mensagem-erro')) mensagem.remove();
}

function mostrarErro(campo, texto) {
    limparErro(campo);
    const mensagem = document.createElement('span');
    mensagem.className = 'mensagem-erro';
    mensagem.id = `${campo.id}-erro`;
    mensagem.textContent = texto;
    campo.classList.add('campo-invalido');
    campo.setAttribute('aria-invalid', 'true');
    campo.setAttribute('aria-describedby', mensagem.id);
    campo.insertAdjacentElement('afterend', mensagem);
}

function mostrarSucesso() {
    document.querySelector('.mensagem-sucesso')?.remove();
    const mensagem = document.createElement('p');
    mensagem.className = 'mensagem-sucesso';
    mensagem.setAttribute('role', 'status');
    mensagem.textContent = 'Agendamento preparado. Confirme o envio no WhatsApp.';
    formContato.insertAdjacentElement('beforebegin', mensagem);
    window.setTimeout(() => mensagem.remove(), 5000);
}

/* Valida os dados e prepara a solicitação no WhatsApp. */
function iniciarFormulario() {
    if (!formContato) return;
    const data = formContato.elements.data;
    data.min = dataLocalISO();

    formContato.addEventListener('submit', (event) => {
        event.preventDefault();
        const nome = formContato.elements.nome;
        const telefone = formContato.elements.telefone;
        const servico = formContato.elements.servico;
        const hora = formContato.elements.hora;
        let valido = true;

        if (nome.value.trim().length < 3) {
            mostrarErro(nome, 'Digite seu nome completo.');
            valido = false;
        } else limparErro(nome);
        if (!telefoneValido(telefone.value)) {
            mostrarErro(telefone, 'Digite um telefone válido com DDD.');
            valido = false;
        } else limparErro(telefone);
        if (!servico.value) {
            mostrarErro(servico, 'Selecione um serviço.');
            valido = false;
        } else limparErro(servico);
        if (!data.value || data.value < data.min) {
            mostrarErro(data, 'Escolha uma data válida, a partir de hoje.');
            valido = false;
        } else limparErro(data);
        if (!hora.value) {
            mostrarErro(hora, 'Escolha um horário.');
            valido = false;
        } else limparErro(hora);

        if (!valido) {
            formContato.querySelector('.campo-invalido')?.focus();
            return;
        }

        const numeroBarbearia = '5511999999999';
        const dataFormatada = new Date(`${data.value}T00:00:00`).toLocaleDateString('pt-BR');
        const texto = [
            'Olá! Gostaria de agendar um horário.',
            `Nome: ${nome.value.trim()}`,
            `Telefone: ${telefone.value.trim()}`,
            `Serviço: ${servico.options[servico.selectedIndex].text}`,
            `Data: ${dataFormatada}`,
            `Horário: ${hora.value}`
        ].join('\n');

        mostrarSucesso();
        window.open(`https://wa.me/${numeroBarbearia}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
        formContato.reset();
        data.min = dataLocalISO();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarAnimacoes();
    iniciarCarrossel();
    iniciarLightbox();
    destacarDiaAtual();
    iniciarFormulario();
    atualizarRolagem();
});
