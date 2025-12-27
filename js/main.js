// --- 変数 ---
let currentMode = 'hira';
let currentChar = '';
let dmakInstance = null;
let currentScale = 1.0;
let isMuted = false;

const canvas = document.getElementById('drawingBoard');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const guideCanvas = document.createElement('canvas');
guideCanvas.width = canvas.width;
guideCanvas.height = canvas.height;
const guideCtx = guideCanvas.getContext('2d', { willReadFrequently: true });

const GUIDE_COLOR = "#DDDDDD"; 
const BRUSH_COLOR = "#333333";
const BRUSH_SIZE = 24; 

// --- 初期化 ---
window.onload = function() {
    // ページ読み込み時にひらがなモードで初期化（並び順を確定させる）
    switchMode('hira');
};

// --- モード切り替え ---
function switchMode(mode) {
    currentMode = mode;
    
    // ボタンのアクティブ状態更新
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.mode === mode) btn.classList.add('active');
    });

    const title = document.getElementById('app-title');
    const container = document.getElementById('gojuon-container');

    // クラスリセット
    container.className = 'gojuon-container';

    // モード別の設定（クラス付与で並び順などを制御）
    if (mode === 'hira') {
        title.textContent = "🎈 ひらがな れんしゅう 🎈";
        container.classList.add('border-hira', 'layout-kana');
    } else if (mode === 'kata') {
        title.textContent = "🚀 カタカナ れんしゅう 🚀";
        container.classList.add('border-kata', 'layout-kana');
    } else if (mode === 'kanji1') {
        title.textContent = "🎒 1ねんせい の かんじ 🎒";
        container.classList.add('border-kanji1', 'layout-kanji');
    } else if (mode === 'kanji2') {
        title.textContent = "📘 2ねんせい の かんじ 📘";
        container.classList.add('border-kanji2', 'layout-kanji');
    } else if (mode === 'kanji3') {
        title.textContent = "📙 3ねんせい の かんじ 📙";
        container.classList.add('border-kanji3', 'layout-kanji');
    }

    createList();
}

// --- リスト生成 ---
function createList() {
    const container = document.getElementById('gojuon-container');
    container.innerHTML = ""; 

    let columnsData = [];

    // モードに応じたデータ準備
    if (currentMode === 'hira') {
        columnsData = hiraColumns;
    } else if (currentMode === 'kata') {
        columnsData = kataColumns;
    } else {
        // 漢字モード：文字列を5文字ずつのチャンクに分割してカラム化する
        let charString = "";
        if(currentMode === 'kanji1') charString = kanji1_list;
        else if(currentMode === 'kanji2') charString = kanji2_list;
        else if(currentMode === 'kanji3') charString = kanji3_list;

        const chars = charString.split('');
        const chunkSize = 5; 
        for (let i = 0; i < chars.length; i += chunkSize) {
            columnsData.push(chars.slice(i, i + chunkSize));
        }
    }

    // カラム生成ループ (共通処理)
    columnsData.forEach((colChars, index) => {
        const colDiv = document.createElement('div');
        colDiv.className = 'column';
        colChars.forEach(char => {
            const btn = createCharBtn(char, index);
            colDiv.appendChild(btn);
        });
        container.appendChild(colDiv);
    });
}

function createCharBtn(char, index) {
    const btn = document.createElement('div');
    btn.className = 'char-btn';
    const colors = ['#FF8BA7', '#FFB74D', '#FFF176', '#AED581', '#8BE3FF', '#BA68C8', '#FF8A65', '#90A4AE', '#DCE775', '#4DB6AC'];
    
    if (char === '') {
        btn.classList.add('empty');
        const randomImg = stampImages[Math.floor(Math.random() * stampImages.length)];
        const img = document.createElement('img');
        img.src = `images/${randomImg}`;
        img.alt = "stamp";
        btn.appendChild(img);
    } else {
        btn.style.borderColor = colors[index % colors.length];
        btn.style.boxShadow = `0 3px 0 ${colors[index % colors.length]}`;
        btn.textContent = char;
        btn.onclick = () => startPractice(char);
    }
    return btn;
}

// --- 画面遷移 ---
function startPractice(char) {
    currentChar = char;
    
    document.getElementById('screen-list').classList.remove('active');
    document.getElementById('screen-practice').classList.add('active');
    document.getElementById('result-msg').innerHTML = ""; 

    // 漢字情報の表示制御
    const infoPanels = document.querySelectorAll('.info-panel');
    const isKanjiMode = currentMode.startsWith('kanji');

    if (isKanjiMode) {
        // 漢字情報をセット（なければハイフン）
        const details = kanjiDetails[char] || { on: "-", kun: "-", ex: "-" };
        document.getElementById('val-onyomi').textContent = details.on;
        document.getElementById('val-kunyomi').textContent = details.kun;
        document.getElementById('val-example').textContent = details.ex;

        // パネルを表示
        infoPanels.forEach(el => el.style.display = 'flex');
    } else {
        // かなモードなら非表示
        infoPanels.forEach(el => el.style.display = 'none');
    }

    resetCanvas();
}

function goBack() {
    document.getElementById('screen-practice').classList.remove('active');
    document.getElementById('screen-list').classList.add('active');
}

// --- 描画ロジック ---
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "bold 230px 'BIZ UDPMincho', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = GUIDE_COLOR;
    ctx.fillText(currentChar, canvas.width / 2, canvas.height / 2);

    guideCtx.clearRect(0, 0, canvas.width, canvas.height);
    guideCtx.fillStyle = "white";
    guideCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    guideCtx.font = "bold 230px 'BIZ UDPMincho', serif";
    guideCtx.textAlign = "center";
    guideCtx.textBaseline = "middle";
    guideCtx.fillStyle = GUIDE_COLOR;
    guideCtx.fillText(currentChar, canvas.width / 2, canvas.height / 2);
    
    document.getElementById('result-msg').innerHTML = "";
}

// --- お絵かき機能 ---
let isDrawing = false;
let lastX = 0, lastY = 0;

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // ズーム対応: キャンバスの表示サイズと実サイズの比率を計算して座標を補正
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return { 
        x: (clientX - rect.left) * scaleX, 
        y: (clientY - rect.top) * scaleY 
    };
}

function startD(e) {
    e.preventDefault();
    isDrawing = true;
    const p = getPos(e);
    lastX = p.x; lastY = p.y;
    moveD(e);
}

function moveD(e) {
    if(!isDrawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = BRUSH_COLOR;
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastX = p.x; lastY = p.y;
}

function endD() { isDrawing = false; }

canvas.addEventListener('mousedown', startD);
canvas.addEventListener('mousemove', moveD);
canvas.addEventListener('mouseup', endD);
canvas.addEventListener('mouseout', endD);
canvas.addEventListener('touchstart', startD, {passive:false});
canvas.addEventListener('touchmove', moveD, {passive:false});
canvas.addEventListener('touchend', endD);

// --- 判定ロジック ---
function checkScore() {
    const w = canvas.width, h = canvas.height;
    const uData = ctx.getImageData(0,0,w,h).data;
    const gData = guideCtx.getImageData(0,0,w,h).data;

    let match = 0, guideArea = 0, out = 0;

    for(let i=0; i<uData.length; i+=4) {
        const isGuide = gData[i] < 240; 
        const isUser  = uData[i] < 150;

        if(isGuide) {
            guideArea++;
            if(isUser) match++;
        } else {
            if(isUser) out++;
        }
    }

    if(guideArea === 0) return;

    let score = (match / guideArea) * 100;
    let penalty = (out / guideArea) * 40; 
    
    let finalScore = Math.round(score - penalty);
    if(finalScore < 0) finalScore = 0;
    if(finalScore > 100) finalScore = 100;

    const resDiv = document.getElementById('result-msg');
    
    if(finalScore >= 60) {
        resDiv.innerHTML = `<span style="color:#E91E63">💮 ${finalScore}てん！ じょうず！</span>`;
        playSound();
    } else {
        resDiv.innerHTML = `<span style="color:#1976D2">💧 ${finalScore}てん。 もうすこし！</span>`;
    }
}

function playSound() {
    if (isMuted) return;
    const audio = document.getElementById('se-success');
    audio.currentTime = 0;
    audio.play().catch(e => console.log("SE再生エラー: " + e));
}

// --- 書き順アニメーション機能 ---
function openAnimModal() {
    if (!currentChar) return;
    document.getElementById('modal-anim').classList.add('active');
    
    const container = document.getElementById('anim-container');
    container.innerHTML = "";

    dmakInstance = new Dmak(currentChar, {
        'element': "anim-container",
        'uri': "https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/",
        'width': 200,
        'height': 200,
        'step': 0.02,   
        'stroke': {
            'order': { 'visible': true, 'attr': { 'fill': '#999', 'font-size': '8px' } }, 
            'attr': { 'active': '#FF4081', 'stroke': '#555' } 
        }
    });

    dmakInstance.render();
}

function closeAnimModal() {
    document.getElementById('modal-anim').classList.remove('active');
    if (dmakInstance) {
        dmakInstance = null;
    }
    document.getElementById('anim-container').innerHTML = "";
}

// --- ツールバー機能 ---

function applyZoom() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(el => {
        el.style.transform = `scale(${currentScale})`;
        el.style.transformOrigin = 'top center';
        el.style.transition = 'transform 0.2s ease-out';
    });
}

function zoomIn() {
    if (currentScale < 2.0) {
        currentScale += 0.1;
        applyZoom();
    }
}

function zoomOut() {
    if (currentScale > 0.5) {
        currentScale -= 0.1;
        applyZoom();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function toggleSound() {
    isMuted = !isMuted;
    const btn = document.getElementById('btn-sound');
    if (isMuted) {
        btn.textContent = '🔇';
        btn.style.backgroundColor = '#eee';
    } else {
        btn.textContent = '🔊';
        btn.style.backgroundColor = '#fff';
    }
}