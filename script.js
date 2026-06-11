// ーーー 🌟マスターデータ（ピックアップ設定付き） ーーー
const CHARACTER_LIST = [
    // 💡 新しく「pickupWeight」を追加しました！
    // 同じレア度の中で、この数字が大きいキャラほど「ピックアップ（当たりやすい）」になります。
    // 特に指定しない（通常確率）なら「1」にしておけばOKです。
    { id: "", name: "", rarity: "ssr", image: "images/SSR/.png", pickupWeight: 1 },
    { id: "", name: "", rarity: "sr", image: "images/SR/.png", pickupWeight: 1 },
    { id: "", name: "", rarity: "r", image: "images/R/.png", pickupWeight: 1 },
];

// 獲得した回数を記録するデータ
let collectionCounters = {};
CHARACTER_LIST.forEach(char => { collectionCounters[char.id] = 0; });

let hasSsrInThisGacha = false;
let totalGachaCount = 0;

let seClick = new Audio('sounds/Koukaonn.mp3');
let seFanfare = new Audio('sounds/Kakuhenn.mp3');
let bgm = new Audio('sounds/Wanikann.mp3');
bgm.loop = true; 
let isBgmPlaying = false;

// 起動時に図鑑を自動で作る
createZukanHTML();

function toggleBGM() {
    if (isBgmPlaying) { bgm.pause(); isBgmPlaying = false; } else { bgm.play(); isBgmPlaying = true; }
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

function startGacha(count) {
    seClick.currentTime = 0; seClick.play();
    if (!isBgmPlaying) { bgm.play(); isBgmPlaying = true; }

    totalGachaCount = totalGachaCount + count;
    document.getElementById("total-count").innerText = totalGachaCount;

    let resultArea = document.getElementById("result-area");
    resultArea.innerHTML = "<div class='loading-text'>⏳ 召喚中...</div>";
    hasSsrInThisGacha = false; 
    
    setTimeout(() => {
        resultArea.innerHTML = ""; 
        for (let i = 0; i < count; i++) {
            let isTenjo = (count === 10 && i === 9);
            let cardHtml = pullOneGacha(isTenjo);
            resultArea.innerHTML += cardHtml;
        }
        updateZukanDisplay();

        if (hasSsrInThisGacha) { triggerCutin("images/dragon.png"); }
    }, 800);
}

// ーーー 🌟 変更：ピックアップ（重み）対応の2段階抽選 ーーー
function pullOneGacha(isTenjo) {
    let selectedRarity = "r"; 
    let randomNumber = Math.floor(Math.random() * 100) + 1; 

    // 【第1段階】レア度だけを固定確率で決める（ここは前回と同じ）
    if (isTenjo) {
        if (randomNumber <= 3) { selectedRarity = "ssr"; } else { selectedRarity = "sr"; }
    } else {
        if (randomNumber <= 3) { selectedRarity = "ssr"; } 
        else if (randomNumber <= 21) { selectedRarity = "sr"; } 
        else { selectedRarity = "r"; }
    }

    // 【第2段階】選ばれたレア度のキャラを集めて、「pickupWeight」を元に抽選する
    let matchedChars = CHARACTER_LIST.filter(char => char.rarity === selectedRarity);

    if (matchedChars.length === 0) { matchedChars = CHARACTER_LIST; }

    // 対象キャラの pickupWeight の合計値を計算する
    let totalPickupWeight = 0;
    matchedChars.forEach(char => totalPickupWeight += char.pickupWeight);

    // 合計値の中でサイコロを振る
    let charRandomNumber = Math.floor(Math.random() * totalPickupWeight) + 1;
    
    let selectedChar = null;
    let currentSum = 0;
    
    // サイコロの目がどこに落ちたかでキャラを決定
    for (let char of matchedChars) {
        currentSum += char.pickupWeight;
        if (charRandomNumber <= currentSum) {
            selectedChar = char;
            break;
        }
    }

    // 獲得記録を増やす
    collectionCounters[selectedChar.id]++;
    if (selectedChar.rarity === "ssr") { hasSsrInThisGacha = true; }

    let rarityText = selectedChar.rarity.toUpperCase();
    if (selectedChar.rarity === "ssr") rarityText = "✨SSR✨";
    if (selectedChar.rarity === "sr") rarityText = "⭐SR⭐";

    return `
        <div class="char-card rarity-${selectedChar.rarity}">
            <div>${rarityText}</div>
            <div><img src="${selectedChar.image}" class="char-img"></div>
            <div style="font-size: 11px;">${selectedChar.name}</div>
            ${isTenjo ? "<div style='font-size:9px; background:#e1f5fe; color:#0288d1; border-radius:3px;'>確定枠</div>" : ""}
        </div>
    `;
}

function triggerCutin(imagePath) {
    bgm.volume = 0.3; seFanfare.currentTime = 0; seFanfare.play(); 
    let cutinScreen = document.getElementById("cutin-screen");
    let cutinImage = document.getElementById("cutin-image");
    cutinImage.src = imagePath; cutinScreen.style.display = "flex"; 
}

function closeCutin() {
    document.getElementById("cutin-screen").style.display = "none"; bgm.volume = 1.0;
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
