const CHARACTER_LIST = [
    { id: "",name: "", rarity: "ssr", image: "images/SSR/.png", pickupWeight: 1 },
    { id: "",name: "", rarity: "sr", image: "images/SR/.png", pickupWeight: 1 },
    { id: "",name: "", rarity: "r", image: "images/R/.png", pickupWeight: 1 },
    { id: "",name: "", rarity: "r", image: "images/R/.png", pickupWeight: 1 }
];

let collectionCounters = {};
CHARACTER_LIST.forEach(char => { collectionCounters[char.id] = 0; });

let hasSsrInThisGacha = false;
let totalGachaCount = 0;

let currentGachaResults = []; 
let currentCardIndex = 0;     

// 効果音の準備
let seClick = new Audio('sounds/Koukaonn.mp3');
let seFanfare = new Audio('sounds/Kakuhenn.mp3');

// ーーー 🌟変更：2種類のBGMを用意する ーーー
let bgm = new Audio('sounds/Wanikann.mp3'); // 通常時のBGM
bgm.loop = true; 

let gachaBgm = new Audio('sounds/gacha-bgm.mp3'); // 👈 追加：ガチャ演出中の専用BGM
gachaBgm.loop = true;

let isBgmPlaying = false;

createZukanHTML();

// BGMボタンが押されたとき（通常BGMの再生・停止）
function toggleBGM() {
    if (isBgmPlaying) { 
        bgm.pause(); 
        gachaBgm.pause(); // 念のため両方止める
        isBgmPlaying = false; 
    } else { 
        // ガチャ画面（通常時）なら通常のBGMを再生
        bgm.play(); 
        isBgmPlaying = true; 
    }
}

function createZukanHTML() {
    let zukanBox = document.getElementById("zukan-box");
    zukanBox.innerHTML = "";
    CHARACTER_LIST.forEach(char => {
        zukanBox.innerHTML += `
            <div class="zukan-item" id="zukan-${char.id}">
                <img src="${char.image}" class="zukan-img">
                <div>${char.name}</div>
                <div class="zukan-count">× <span id="count-${char.id}">0</span></div>
            </div>
        `;
    });
}

// ガチャボタンが押されたとき
function startGacha(count) {
    seClick.currentTime = 0; seClick.play();

    // ーーー 🌟重要：ガチャを引いた瞬間、通常BGMを止めて演出用BGMへ切り替える ーーー
    bgm.pause(); // 通常BGMをストップ
    bgm.currentTime = 0; // 曲の最初に戻しておく

    if (isBgmPlaying) {
        gachaBgm.currentTime = 0; // ガチャBGMを最初から
        gachaBgm.volume = 1.0;     // 音量を100%にする
        gachaBgm.play();           // ガチャBGMを再生開始！
    }

    totalGachaCount = totalGachaCount + count;
    document.getElementById("total-count").innerText = totalGachaCount;

    let resultArea = document.getElementById("result-area");
    resultArea.innerHTML = "<div class='loading-text'>⏳ 召喚中...</div>";
    hasSsrInThisGacha = false; 
    
    currentGachaResults = [];
    currentCardIndex = 0;

    setTimeout(() => {
        for (let i = 0; i < count; i++) {
            let isTenjo = (count === 10 && i === 9);
            let resultData = pullOneGachaLogic(isTenjo);
            currentGachaResults.push(resultData);
        }
        openAnimationScreen();
    }, 800);
}

function pullOneGachaLogic(isTenjo) {
    let selectedRarity = "r"; 
    let randomNumber = Math.floor(Math.random() * 100) + 1; 

    if (isTenjo) {
        if (randomNumber <= 3) { selectedRarity = "ssr"; } else { selectedRarity = "sr"; }
    } else {
        if (randomNumber <= 3) { selectedRarity = "ssr"; } 
        else if (randomNumber <= 21) { selectedRarity = "sr"; } 
        else { selectedRarity = "r"; }
    }

    let matchedChars = CHARACTER_LIST.filter(char => char.rarity === selectedRarity);
    if (matchedChars.length === 0) { matchedChars = CHARACTER_LIST; }

    let totalPickupWeight = 0;
    matchedChars.forEach(char => totalPickupWeight += char.pickupWeight);

    let charRandomNumber = Math.floor(Math.random() * totalPickupWeight) + 1;
    let selectedChar = null;
    let currentSum = 0;
    
    for (let char of matchedChars) {
        currentSum += char.pickupWeight;
        if (charRandomNumber <= currentSum) {
            selectedChar = char;
            break;
        }
    }

    collectionCounters[selectedChar.id]++;
    if (selectedChar.rarity === "ssr") { hasSsrInThisGacha = true; }

    return {
        char: selectedChar,
        isTenjo: isTenjo
    };
}

function openAnimationScreen() {
    let animScreen = document.getElementById("gacha-animation-screen");
    animScreen.style.display = "flex";
    renderBigCard();
}

function renderBigCard() {
    let currentData = currentGachaResults[currentCardIndex];
    let char = currentData.char;
    
    let cardElement = document.getElementById("big-char-card");
    let rarityElement = document.getElementById("big-rarity");
    let imgElement = document.getElementById("big-img");
    let nameElement = document.getElementById("big-name");
    let tenjoElement = document.getElementById("big-tenjo");

    let rarityText = char.rarity.toUpperCase();
    if (char.rarity === "ssr") rarityText = "✨SSR✨";
    if (char.rarity === "sr") rarityText = "⭐SR⭐";
    rarityElement.innerText = rarityText;

    imgElement.src = char.image;
    nameElement.innerText = char.name;

    if (currentData.isTenjo) { tenjoElement.style.display = "block"; } else { tenjoElement.style.display = "none"; }

    cardElement.className = `char-card rarity-${char.rarity}`;
    
    cardElement.style.animation = 'none';
    cardElement.offsetHeight; 
    cardElement.style.animation = '';
}

function showNextCard() {
    seClick.currentTime = 0; seClick.play();
    
    let currentData = currentGachaResults[currentCardIndex];
    if (currentData.char.rarity === "ssr") {
        triggerCutin(currentData.char.image);
    }

    currentCardIndex++;

    if (currentCardIndex < currentGachaResults.length) {
        renderBigCard();
    } else {
        finishAnimation();
    }
}

function skipAnimation(event) {
    event.stopPropagation();
    seClick.currentTime = 0; seClick.play();
    finishAnimation();
}

// ーーー 🌟変更：演出が終わったら、BGMを通常版に戻す ーーー
function finishAnimation() {
    document.getElementById("gacha-animation-screen").style.display = "none";

    // 1. ガチャ演出用BGMをストップ
    gachaBgm.pause();
    gachaBgm.currentTime = 0;

    // 2. プレイヤーが「BGM再生オン」にしていた場合だけ、通常BGMを鳴らし直す
    if (isBgmPlaying) {
        bgm.currentTime = 0;
        bgm.volume = 1.0;
        bgm.play();
    }

    let resultArea = document.getElementById("result-area");
    resultArea.innerHTML = "";

    currentGachaResults.forEach(data => {
        let char = data.char;
        let rarityText = char.rarity.toUpperCase();
        if (char.rarity === "ssr") rarityText = "✨SSR✨";
        if (char.rarity === "sr") rarityText = "⭐SR⭐";

        resultArea.innerHTML += `
            <div class="char-card rarity-${char.rarity}">
                <div>${rarityText}</div>
                <div><img src="${char.image}" class="char-img"></div>
                <div style="font-size: 11px;">${char.name}</div>
                ${data.isTenjo ? "<div style='font-size:9px; background:#e1f5fe; color:#0288d1; border-radius:3px;'>確定枠</div>" : ""}
            </div>
        `;
    });

    updateZukanDisplay();

    if (hasSsrInThisGacha) {
        triggerCutin("images/dragon.png");
    }
}

// ーーー 🌟変更：SSRカットイン中はガチャBGMだけ音量を下げる ーーー
function triggerCutin(imagePath) {
    gachaBgm.volume = 0.3; // ガチャBGMをうっすら小さくする
    bgm.volume = 0.3;      // スキップでリザルト画面に直行したとき用に通常BGMも小さくする

    seFanfare.currentTime = 0; 
    seFanfare.play(); 
    
    let cutinScreen = document.getElementById("cutin-screen");
    let cutinImage = document.getElementById("cutin-image");
    cutinImage.src = imagePath; 
    cutinScreen.style.display = "flex"; 
}

function closeCutin() {
    document.getElementById("cutin-screen").style.add
    document.getElementById("cutin-screen").style.display = "none"; 
    
    // カットインが閉じたら音量を元に戻す
    gachaBgm.volume = 1.0;
    bgm.volume = 1.0;
}

function updateZukanDisplay() {
    CHARACTER_LIST.forEach(char => {
        let count = collectionCounters[char.id];
        if (count > 0) {
            document.getElementById(`zukan-${char.id}`).classList.add("owned");
            document.getElementById(`count-${char.id}`).innerText = count;
        }
    });
}
