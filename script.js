const CHARACTER_LIST = [
    { id: "1",name: "いついよ", rarity: "ssr", image: "images/SSR/Ituiyo.png", pickupWeight: 1 },
    { id: "2",name: "おいどん", rarity: "ssr", image: "images/SSR/Oidonn.png", pickupWeight: 1 },
    { id: "3",name: "おいこ", rarity: "ssr", image: "images/SSR/Oiko.png", pickupWeight: 1 },
    { id: "4",name: "おでくん", rarity: "ssr", image: "images/SSR/Odekunn.png", pickupWeight: 1 },
    { id: "5",name: "ワニカニ", rarity: "ssr", image: "images/SSR/Wanikani.png", pickupWeight: 1 },
    { id: "6",name: "ワニパン", rarity: "ssr", image: "images/SSR/Wanipann.png", pickupWeight: 1 },
    
    { id: "7",name: "郷田好男", rarity: "sr", image: "images/SR/Gachihomo1.png", pickupWeight: 1 },
    { id: "8",name: "祭田武", rarity: "sr", image: "images/SR/Gachihomo2.png", pickupWeight: 1 },
    { id: "9",name: "美神雄咲", rarity: "sr", image: "images/SR/Gachihomo3.png", pickupWeight: 1 },
    { id: "10",name: "肩幅広三", rarity: "sr", image: "images/SR/Gachihomo4.png", pickupWeight: 1 },
    { id: "11",name: "ギルティ村松", rarity: "sr", image: "images/SR/Gachihomo5.png", pickupWeight: 1 },
    { id: "12",name: "ゴッド四宮", rarity: "sr", image: "images/SR/Gachihomo6.png", pickupWeight: 1 },
    { id: "13",name: "山下光源", rarity: "sr", image: "images/SR/Gachihomo7.png", pickupWeight: 1 },
    
    { id: "14",name: "犬もんたん", rarity: "r", image: "images/R/Inumontann.png", pickupWeight: 1 },
    { id: "15",name: "豚男", rarity: "r", image: "images/R/Butao.png", pickupWeight: 1 },
    { id: "16",name: "ミニいついよ", rarity: "r", image: "images/R/MiniItuiyo.png", pickupWeight: 1 },
    { id: "17",name: "もんた鹿", rarity: "r", image: "images/R/Montajika.png", pickupWeight: 1 },
    { id: "18",name: "モンタニウス", rarity: "r", image: "images/R/Montaniusu.png", pickupWeight: 1 },
    { id: "19",name: "ニコニコくん", rarity: "r", image: "images/R/Nikoniko.png", pickupWeight: 1 },
];

let collectionCounters = {};
CHARACTER_LIST.forEach(char => { collectionCounters[char.id] = 0; });

let hasSsrInThisGacha = false;
let totalGachaCount = 0;

let currentGachaResults = []; 
let currentCardIndex = 0;     

let seClick = new Audio('sounds/Koukaonn1.mp3');
let seFanfare = new Audio('sounds/Kakuhenn.mp3');

let bgm = new Audio('sounds/Wanikann.mp3'); 
bgm.loop = true; 

let gachaBgm = new Audio('sounds/Gachabgm.mp3'); 
gachaBgm.loop = true;

let isBgmPlaying = false;

createZukanHTML();

function toggleBGM() {
    if (isBgmPlaying) { bgm.pause(); gachaBgm.pause(); isBgmPlaying = false; } else { bgm.play(); isBgmPlaying = true; }
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

    bgm.pause(); 
    bgm.currentTime = 0; 

    if (isBgmPlaying) {
        gachaBgm.currentTime = 0; 
        gachaBgm.volume = 1.0;     
        gachaBgm.play();           
    }

    totalGachaCount = totalGachaCount + count;
    document.getElementById("total-count").innerText = totalGachaCount;

    let resultArea = document.getElementById("result-area");
    resultArea.innerHTML = "<div class='loading-text'>⏳ 召喚中...</div>";
    hasSsrInThisGacha = false; 
    
    currentGachaResults = [];
    currentCardIndex = 0;

    setTimeout(() => {
        // 1. 内部で一気にガチャの結果を生成
        for (let i = 0; i < count; i++) {
            let isTenjo = (count === 10 && i === 9);
            let resultData = pullOneGachaLogic(isTenjo);
            currentGachaResults.push(resultData);
        }

        // ーーー 🌟ここが最大の変更点：1枚目を出す前の「確定演出」ジャッジ ーーー
        if (hasSsrInThisGacha) {
            // SSRが1枚でもあるなら、まずは確定前兆画面を表示！
            openKakuteiScreen();
        } else {
            // SSRがなければ、通常通りそのまま1体目の大画面を開く
            openAnimationScreen();
        }

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
        if (charRandomNumber <= currentSum) { selectedChar = char; break; }
    }

    collectionCounters[selectedChar.id]++;
    
    // 🌟ここで今回の10連の中にSSRがあるかを検知！
    if (selectedChar.rarity === "ssr") { 
        hasSsrInThisGacha = true; 
    }

    return { char: selectedChar, isTenjo: isTenjo };
}

// ーーー 🌟追加：確定前兆画面を表示する ーーー
function openKakuteiScreen() {
    // ファンファーレ（または専用の効果音）を鳴らす
    seFanfare.currentTime = 0;
    seFanfare.play();

    let kakuteiScreen = document.getElementById("kakutei-screen");
    kakuteiScreen.style.display = "flex";
}

// ーーー 🌟追加：確定前兆画面をタップして閉じた時、ガチャ本編を開始する ーーー
function closeKakuteiAndStart() {
    document.getElementById("kakutei-screen").style.display = "none";
    // ガチャ本編（1枚ずつの表示画面）へ
    openAnimationScreen();
}

function openAnimationScreen() {
    let animScreen = document.getElementById("gacha-animation-screen");
    animScreen.style.display = "flex";
    
    // ーーー 🌟重要：SSRがある場合は、スキップボタンを非表示にして強制的に見せる！ ーーー
    let skipBtn = document.getElementById("skip-btn");
    if (hasSsrInThisGacha) {
        skipBtn.style.display = "none";  // 👈 スキップ不可にする！
    } else {
        skipBtn.style.display = "block"; // 通常は表示
    }

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
    
    // 🌟変更：1枚前のジャッジではなく、SSRのカードそのものが表示された「まさにその瞬間」に個別カットインを出す
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

function finishAnimation() {
    document.getElementById("gacha-animation-screen").style.display = "none";

    gachaBgm.pause();
    gachaBgm.currentTime = 0;

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
    // 🌟変更：個別演出を完璧にしたため、リザルト画面でのカットイン重複は削除しました
}

function triggerCutin(imagePath) {
    gachaBgm.volume = 0.3; 
    bgm.volume = 0.3;      

    seFanfare.currentTime = 0; 
    seFanfare.play(); 
    
    let cutinScreen = document.getElementById("cutin-screen");
    let cutinImage = document.getElementById("cutin-image");
    cutinImage.src = imagePath; 
    cutinScreen.style.display = "flex"; 
}

function closeCutin() {
    document.getElementById("cutin-screen").style.display = "none"; 
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
