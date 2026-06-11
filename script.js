const CHARACTER_LIST = [
    { id: "ituiyo", name: "いついよ", rarity: "ssr", weight: 0.5, image: "images/SSR/Ituiyo.png" },
    { id: "oidonn", name: "おいどん", rarity: "ssr", weight: 0.5, image: "images/SSR/Oidonn.png" },
    { id: "oiko", name: "おい子", rarity: "ssr", weight: 0.5, image: "images/SSR/Oiko.png" },
    { id: "odekunn", name: "おでくん", rarity: "ssr", weight: 0.5, image: "images/SSR/Odekunn.png" },
    { id: "wanikani", name: "わにかに", rarity: "ssr", weight: 0.5, image: "images/SSR/Wanikani.png" },
    { id: "wanipann", name: "わにパン", rarity: "ssr", weight: 0.5, image: "images/SSR/Wanipann.png" },
    { id: "", name: "", rarity: "ssr", weight: , image: "images/SSR/.png" },
    { id: "", name: "", rarity: "ssr", weight: , image: "images/SSR/.png" },
    
    { id: "gachihomo1", name: "ガチホモ1", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo1.png" },
    { id: "gachihomo2", name: "ガチホモ2", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo2.png" },
    { id: "gachihomo3", name: "ガチホモ3", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo3.png" },
    { id: "gachihomo4", name: "ガチホモ4", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo4.png" },
    { id: "gachihomo5", name: "ガチホモ5", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo5.png" },
    { id: "gachihomo6", name: "ガチホモ6", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo6.png" },
    { id: "gachihomo7", name: "ガチホモ7", rarity: "sr", weight: 2.57, image: "images/SR/Gachihomo7.png" },
    { id: "", name: "", rarity: "sr", weight: , image: "images/SR/.png" },

    { id: "inumontann", name: "犬もんたん", rarity: "r", weight: 79, image: "images/R/Inumontann.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },
    { id: "", name: "", rarity: "r", weight: , image: "images/R/.png" },

];

let collectionCounters = {};
CHARACTER_LIST.forEach(char => { collectionCounters[char.id] = 0; });

let hasSsrInThisGacha = false;
let totalGachaCount = 0;

let seClick = new Audio('sounds/Koukaonn.mp3');
let seFanfare = new Audio('sounds/Kakuhenn.mp3');
let bgm = new Audio('sounds/Wanikann.mp3');
bgm.loop = true; 
let isBgmPlaying = false;

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

function pullOneGacha(isTenjo) {
    let randomNumber = Math.floor(Math.random() * 100) + 1;
    let selectedChar = null;
    let currentSum = 0;
    
    let availableChars = CHARACTER_LIST;
    if (isTenjo) {
        availableChars = CHARACTER_LIST.filter(char => char.rarity !== "r");
    }

    let totalWeight = 0;
    availableChars.forEach(char => totalWeight += char.weight);
    randomNumber = Math.floor(Math.random() * totalWeight) + 1;

    for (let char of availableChars) {
        currentSum += char.weight;
        if (randomNumber <= currentSum) {
            selectedChar = char;
            break;
        }
    }

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
