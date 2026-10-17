// ===== Configuración =====
const CLAVE = '1810';
const INICIO = new Date(2025, 9, 18, 0, 0, 0);        // 18/10/2025 (los meses empiezan en 0)
const ANIVERSARIO = new Date(2026, 9, 18, 0, 0, 0);   // 18/10/2026

const $ = (id) => document.getElementById(id);
const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== Corazones que vuelan (clics y celebraciones) =====
function lanzarCorazones(x, y, cantidad) {
    if (reducir) return;
    const colores = ['#c4546e', '#d98b9a', '#c9a063', '#8c2d47'];
    for (let i = 0; i < cantidad; i++) {
        const c = document.createElement('span');
        c.className = 'corazon-vuelo';
        c.textContent = '♥';
        c.style.left = x + 'px';
        c.style.top = y + 'px';
        c.style.color = colores[Math.floor(Math.random() * colores.length)];
        c.style.fontSize = (0.9 + Math.random() * 1.4) + 'rem';
        c.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
        c.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px');
        c.style.setProperty('--giro', (Math.random() * 120 - 60) + 'deg');
        document.body.appendChild(c);
        c.addEventListener('animationend', () => c.remove());
    }
}

// Pequeños corazones al hacer clic en cualquier parte (menos en controles)
document.addEventListener('click', function (e) {
    if (document.body.classList.contains('bloqueado')) return;
    if (e.target.closest('button, a, input')) return;
    lanzarCorazones(e.clientX, e.clientY, 5);
});

// ===== Clave de acceso (4 casillas) =====
const body = document.body;
const acceso = $('acceso');
const formAcceso = $('form-acceso');
const errorClave = $('acceso-error');
const pines = Array.from(document.querySelectorAll('.pin'));

function desbloquear() {
    body.classList.remove('bloqueado');
    acceso.classList.add('oculto');
    window.scrollTo(0, 0);
}

function comprobar() {
    const valor = pines.map((p) => p.value).join('');
    if (valor.length < 4) {
        errorClave.textContent = 'Escribe los 4 números.';
        return;
    }
    if (valor === CLAVE) {
        try { sessionStorage.setItem('acceso-ok', '1'); } catch (err) {}
        errorClave.textContent = '';
        desbloquear();
        setTimeout(() => lanzarCorazones(window.innerWidth / 2, window.innerHeight / 2, 22), 300);
    } else {
        errorClave.textContent = 'Clave incorrecta, inténtalo de nuevo.';
        formAcceso.classList.remove('error');
        void formAcceso.offsetWidth; // reinicia la animación
        formAcceso.classList.add('error');
        pines.forEach((p) => (p.value = ''));
        pines[0].focus();
    }
}

try {
    if (sessionStorage.getItem('acceso-ok') === '1') {
        body.classList.remove('bloqueado');
        acceso.classList.add('oculto');
    }
} catch (e) { /* sin almacenamiento: se pedirá la clave */ }

pines.forEach((pin, i) => {
    pin.addEventListener('input', () => {
        pin.value = pin.value.replace(/\D/g, '').slice(0, 1);
        if (pin.value && i < pines.length - 1) pines[i + 1].focus();
        if (pines.every((p) => p.value)) comprobar();
    });
    pin.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !pin.value && i > 0) pines[i - 1].focus();
    });
    pin.addEventListener('paste', (e) => {
        const texto = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
        if (!texto) return;
        e.preventDefault();
        texto.split('').forEach((d, k) => { if (pines[k]) pines[k].value = d; });
        if (texto.length === 4) comprobar();
    });
});

formAcceso.addEventListener('submit', (e) => { e.preventDefault(); comprobar(); });

// ===== Pétalos y corazones flotando de fondo =====
(function () {
    const canvas = $('petalos');
    if (!canvas || reducir) return;
    const ctx = canvas.getContext('2d');
    let w, h, parts = [];

    function medir() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function nueva(arriba) {
        return {
            x: Math.random() * w,
            y: arriba ? -20 : Math.random() * h,
            s: 5 + Math.random() * 8,
            v: 0.35 + Math.random() * 0.8,
            d: Math.random() * Math.PI * 2,
            r: Math.random() * Math.PI * 2,
            rv: (Math.random() - 0.5) * 0.02,
            a: 0.12 + Math.random() * 0.22,
            c: Math.random() < 0.25 ? '201,160,99' : '196,84,110'
        };
    }

    function corazon(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.scale(p.s, p.s);
        ctx.beginPath();
        ctx.moveTo(0, -0.35);
        ctx.bezierCurveTo(0, -0.9, -1, -0.9, -1, -0.2);
        ctx.bezierCurveTo(-1, 0.4, -0.2, 0.7, 0, 1);
        ctx.bezierCurveTo(0.2, 0.7, 1, 0.4, 1, -0.2);
        ctx.bezierCurveTo(1, -0.9, 0, -0.9, 0, -0.35);
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.fill();
        ctx.restore();
    }

    function animar() {
        ctx.clearRect(0, 0, w, h);
        parts.forEach((p, i) => {
            p.y += p.v;
            p.d += 0.012;
            p.x += Math.sin(p.d) * 0.6;
            p.r += p.rv;
            if (p.y > h + 20) parts[i] = nueva(true);
            corazon(p);
        });
        requestAnimationFrame(animar);
    }

    medir();
    const cantidad = window.innerWidth < 600 ? 14 : 26;
    for (let i = 0; i < cantidad; i++) parts.push(nueva(false));
    window.addEventListener('resize', medir);
    animar();
})();

// ===== Aparición al hacer scroll =====
(function () {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reducir) {
        items.forEach((el) => el.classList.add('visto'));
        return;
    }
    const obs = new IntersectionObserver((entradas) => {
        entradas.forEach((en) => {
            if (en.isIntersecting) {
                en.target.classList.add('visto');
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.15 });
    items.forEach((el, i) => {
        el.style.transitionDelay = (i % 4) * 90 + 'ms';
        obs.observe(el);
    });
})();

// ===== Botón de corazón (contador de amor) =====
let amor = 0;
$('btn-corazon').addEventListener('click', function (e) {
    amor++;
    $('contador-amor').textContent = amor;
    const r = this.getBoundingClientRect();
    lanzarCorazones(r.left + 28, r.top + r.height / 2, 7);
});

// ===== Tarjetas que se voltean =====
document.querySelectorAll('.giro').forEach((t) => {
    t.addEventListener('click', () => {
        const abierta = t.classList.toggle('abierta');
        t.setAttribute('aria-pressed', abierta);
    });
});

// ===== Sobre y carta =====
const sobre = $('sobre');
const carta = $('carta-papel');
sobre.addEventListener('click', function () {
    const abierto = this.classList.toggle('abierto');
    this.setAttribute('aria-expanded', abierto);
    if (abierto) {
        carta.hidden = false;
        void carta.offsetWidth;
        carta.classList.add('leer');
        const r = this.getBoundingClientRect();
        lanzarCorazones(r.left + r.width / 2, r.top + 40, 10);
        setTimeout(() => carta.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'center' }), 400);
    } else {
        carta.hidden = true;
        carta.classList.remove('leer');
    }
});

// ===== Pregunta: el "No" se escapa =====
(function () {
    const btnNo = $('btn-no');
    const btnSi = $('btn-si');
    const sub = $('pregunta-sub');
    const frases = ['No', '¿Seguro?', 'Piénsalo bien…', '¿De verdad?', 'Mejor di que sí ♥', 'Última oportunidad'];
    let intentos = 0;

    function escapar() {
        intentos++;
        const x = (Math.random() * 2 - 1) * Math.min(140, window.innerWidth / 3);
        const y = (Math.random() * 2 - 1) * 55;
        btnNo.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        btnNo.textContent = frases[Math.min(intentos, frases.length - 1)];
        const crecer = Math.min(1 + intentos * 0.12, 1.8);
        btnSi.style.transform = 'scale(' + crecer + ')';
        sub.textContent = intentos > 3 ? 'Elige una opcion' : 'Piénsalo bien…';
    }

    btnNo.addEventListener('mouseenter', escapar);
    btnNo.addEventListener('touchstart', function (e) { e.preventDefault(); escapar(); }, { passive: false });
    btnNo.addEventListener('click', function (e) { e.preventDefault(); escapar(); });
    btnNo.addEventListener('focus', escapar);

    btnSi.addEventListener('click', function () {
        document.querySelector('.pregunta').classList.add('respondida');
        $('pregunta-final').hidden = false;
        const w = window.innerWidth, h = window.innerHeight;
        for (let i = 0; i < 6; i++) {
            setTimeout(() => lanzarCorazones(Math.random() * w, h * (0.35 + Math.random() * 0.4), 14), i * 220);
        }
    });
})();

// ===== Contador y días juntos =====
function actualizar() {
    const ahora = new Date();

    const dias = Math.max(0, Math.floor((ahora - INICIO) / 86400000));
    $('dias-juntos').textContent = dias;
    $('dias-juntos-texto').textContent = ahora >= INICIO ? 'Llevamos juntos' : 'Nuestra historia empieza el 18/10/2025';

    const falta = ANIVERSARIO - ahora;
    if (falta > 0) {
        $('c-dias').textContent = Math.floor(falta / 86400000);
        $('c-horas').textContent = Math.floor((falta % 86400000) / 3600000);
        $('c-min').textContent = Math.floor((falta % 3600000) / 60000);
        $('c-seg').textContent = Math.floor((falta % 60000) / 1000);
    } else {
        document.querySelector('.contador').classList.add('celebracion');
        $('contador-titulo').textContent = '¡Feliz primer aniversario, amor!';
        $('contador-sub').textContent = 'Hoy cumplimos un año juntos. Gracias por todo. ♥';
    }
}

actualizar();
setInterval(actualizar, 1000);