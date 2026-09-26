// --- CANVAS ĐA TẦNG PHÔNG NỀN (TÍM - XANH - HỒNG) ---
const canvas = document.getElementById('worldCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Star {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02 + 0.005;
        this.color = Math.random() > 0.5 ? '#ff758f' : '#00f2fe';
    }
    update() {
        this.alpha += this.speed;
        if (this.alpha > 1 || this.alpha < 0.2) this.speed = -this.speed;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class Meteor {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * width * 1.5 - width * 0.25;
        this.y = -10;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.alpha = 1;
    }
    update() {
        this.x -= this.speed * 0.6;
        this.y += this.speed;
        this.alpha -= 0.015;
        if (this.alpha <= 0) this.reset();
    }
    draw() {
        ctx.strokeStyle = `rgba(0, 242, 254, ${this.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.length * 0.6, this.y - this.length);
        ctx.stroke();
    }
}

let stardust = [];
const handlePointerMove = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    stardust.push({ x, y, size: Math.random() * 3 + 1, alpha: 1 });
};
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('touchmove', handlePointerMove);

const stars = Array.from({ length: 80 }, () => new Star());
const meteors = Array.from({ length: 2 }, () => new Meteor());

function animateWorld() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => { s.update(); s.draw(); });
    meteors.forEach(m => { m.update(); m.draw(); });

    stardust.forEach((p, index) => {
        p.alpha -= 0.025;
        if (p.alpha <= 0) stardust.splice(index, 1);
        else {
            ctx.fillStyle = `rgba(255, 117, 143, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    requestAnimationFrame(animateWorld);
}
animateWorld();


// --- CHUYỂN TRANG TUYẾN TÍNH ---
const pages = document.querySelectorAll('.page');

function goToPage(pageId) {
    pages.forEach(p => {
        if (p.id === pageId) p.classList.add('active');
        else p.classList.remove('active');
    });
}


// --- BƯỚC 1: KHÓA TÌNH YÊU NGUYỆT QUANG ---
const btnHold = document.getElementById('btnHoldLock');
const circle = document.querySelector('.progress-ring__circle');
const circumference = 2 * Math.PI * 65;
circle.style.strokeDasharray = `${circumference} ${circumference}`;

let holdTimer = null;
let holdProgress = 0;
let isLockedSuccess = false;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

btnHold.addEventListener('mousedown', startHold);
btnHold.addEventListener('touchstart', startHold);
window.addEventListener('mouseup', endHold);
window.addEventListener('touchend', endHold);

function startHold(e) {
    if (isLockedSuccess) return;
    if (e.type === 'touchstart') e.preventDefault();

    holdProgress = 0;
    holdTimer = setInterval(() => {
        holdProgress += 4;
        setProgress(holdProgress);
        if (holdProgress >= 100) {
            clearInterval(holdTimer);
            lockSuccess();
        }
    }, 50);
}

function endHold() {
    if (!isLockedSuccess && holdProgress < 100) {
        clearInterval(holdTimer);
        holdProgress = 0;
        setProgress(0);
    }
}

function triggerLockFireworks() {
    const lockRect = document.getElementById('lockContainer').getBoundingClientRect();
    const cx = lockRect.left + lockRect.width / 2;
    const cy = lockRect.top + lockRect.height / 2;

    for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        stardust.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            alpha: 1,
            color: ['#ff758f', '#00f2fe', '#ffd166', '#b5179e'][Math.floor(Math.random() * 4)]
        });
    }
}

function lockSuccess() {
    isLockedSuccess = true;
    triggerLockFireworks();

    // Kết ấn 100% -> Nhảy ngay sang Khắc Tên Vĩnh Cửu
    goToPage('page-signature');
}


// --- BƯỚC 2: KHẮC TÊN VĨNH CỬU ---
const inputNames = document.getElementById('inputNames');
const btnSaveSig = document.getElementById('btnSaveSig');
const btnEditSig = document.getElementById('btnEditSig');
const btnGoToSecret = document.getElementById('btnGoToSecret');
const sigFormContainer = document.getElementById('sigFormContainer');
const sigDisplayContainer = document.getElementById('sigDisplayContainer');
const savedNamesText = document.getElementById('savedNamesText');
const savedDateText = document.getElementById('savedDateText');

btnSaveSig.addEventListener('click', () => {
    const names = inputNames.value.trim();

    if (!names) {
        showToast("⚠️ Vui lòng nhập tên bạn muốn khắc!");
        return;
    }

    const currentDate = new Date().toLocaleDateString('vi-VN');
    savedNamesText.innerText = names;
    savedDateText.innerText = `Khắc ngày: ${currentDate}`;

    sigFormContainer.style.display = 'none';
    sigDisplayContainer.style.display = 'block';

    showToast("✨ Đã khắc tên thành công!");
});

btnGoToSecret.addEventListener('click', () => {
    goToPage('page-mooncake');
});

btnEditSig.addEventListener('click', () => {
    inputNames.value = '';
    sigFormContainer.style.display = 'block';
    sigDisplayContainer.style.display = 'none';
    showToast("✏️ Bạn có thể nhập lại tên mới.");
});


// --- BƯỚC 3: THẢM NGUYỆT BÍ MẬT ---
const mooncakeWrapper = document.getElementById('mooncakeWrapper');
mooncakeWrapper.addEventListener('click', () => {
    // Tách đôi bánh ra ngay lập tức
    mooncakeWrapper.classList.add('sliced');

    // Nhảy ngay sang trang sakura.html khi bánh tách ra (chờ 0.5s đủ thấy bánh tách)
    setTimeout(() => {
        window.location.href = "sakura.html";
    }, 500);
});


// TOAST THÔNG BÁO
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}