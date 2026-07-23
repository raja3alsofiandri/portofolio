/* ============================================================
   CHATBOT WIDGET — RTA Asisten
   Logika chatbot portfolio: keyword/intent matching + toleransi
   typo (Dice's Coefficient) + memori konteks jangka pendek untuk
   pertanyaan yang menggantung (mis. "tanggal?"). Data pengetahuan
   ada di chatbot/portfolio.json, daftar kata kunci intent ada di
   chatbot/config.js.

   DAFTAR ISI:
     1. Memuat Basis Pengetahuan (portfolio.json)
     2. Animasi Launcher Chibi (buka/tutup + auto-cycle gambar)
     3. Anti-Typo & Pencocokan Kemiripan Kata
     4. Intent Mapper
     5. Pemrosesan Respons & Memori Konteks
     6. Reset Chat
     7. UI: Kirim Pesan & Render Bubble Chat
   ============================================================ */

const isSubfolder = window.location.pathname.includes('/industrial/');
const basePath = isSubfolder ? '../' : '';

let knowledgeBase = {};

let chatContext = {
    waitingForClarification: false,
    lastIncompleteKeyword: ""
};

/* ============================================================
   1. MEMUAT BASIS PENGETAHUAN (portfolio.json)
   ============================================================ */
async function loadKnowledgeBase() {
    try {
        const response = await fetch(basePath + 'chatbot/portfolio.json');
        knowledgeBase = await response.json();
        console.log("Chatbot Knowledge Base sukses dimuat.");
    } catch (error) {
        console.error("Gagal memuat data portfolio.json:", error);
    }
}

/* ============================================================
   2. ANIMASI LAUNCHER CHIBI
   ============================================================ */
const CHIBI_IMAGES = {
    dark: {
        closed: ['images/chatbot/dark-closed-1.png', 'images/chatbot/dark-closed-2.png'],
        opened: ['images/chatbot/dark-open-1.png', 'images/chatbot/dark-open-2.png']
    },
    light: {
        closed: ['images/chatbot/light-closed-1.png', 'images/chatbot/light-closed-2.png'],
        opened: ['images/chatbot/light-open-1.png', 'images/chatbot/light-open-2.png']
    },
    headerAvatar: 'images/chatbot/profile.jpeg'
};

let chibiInterval = null;
let currentChibiIndex = 0;

function toggleChatbot() {
    const chatWindow = document.getElementById('chatbot-window');
    const launcher = document.getElementById('chatbot-launcher');

    chatWindow.classList.toggle('chatbot-hidden');
    launcher.classList.toggle('active');

    currentChibiIndex = 0;

    updateLauncherDisplay();

    clearInterval(chibiInterval);
    startChibiAnimation();

    if (!chatWindow.classList.contains('chatbot-hidden')) {
        document.getElementById('chatbot-input').focus();
    }
}

function updateLauncherDisplay() {
    const chatWindow = document.getElementById('chatbot-window');
    const launcherImg = document.getElementById('launcher-img');

    if (!launcherImg) return;

    const isDarkMode = !document.body.classList.contains('light-mode');
    const theme = isDarkMode ? 'dark' : 'light';

    const isClosed = chatWindow.classList.contains('chatbot-hidden');
    const currentMode = isClosed ? 'closed' : 'opened';

    launcherImg.src = basePath + CHIBI_IMAGES[theme][currentMode][currentChibiIndex];
}

function startChibiAnimation() {
    chibiInterval = setInterval(() => {
        currentChibiIndex = currentChibiIndex === 0 ? 1 : 0;
        updateLauncherDisplay();
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    const headerImg = document.querySelector('.bot-avatar img');
    if (headerImg) {
        headerImg.src = basePath + CHIBI_IMAGES.headerAvatar;
    }
    startChibiAnimation();
});

function handleKeyPress(event) {
    if (event.key === 'Enter') { sendMessage(); }
}

/* ============================================================
   3. ANTI-TYPO & PENCOCOKAN KEMIRIPAN KATA
   ============================================================ */
function getSimilarity(s1, s2) {
    let longer = s1.toLowerCase(); let shorter = s2.toLowerCase();
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    let longerLength = longer.length; if (longerLength === 0) return 1.0;
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue; lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/* ============================================================
   4. INTENT MAPPER
   ============================================================ */
function detectIntent(userInput) {
    const text = userInput.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    const words = text.split(/\s+/);

    let bestIntent = 'unknown';
    let highestScore = 0;

    for (const [intent, keywords] of Object.entries(CHATBOT_CONFIG.intents)) {
        for (const keyword of keywords) {

            if (keyword.length <= 3) {
                if (words.includes(keyword)) {
                    return intent;
                }
            } else {
                if (text.includes(keyword)) {
                    return intent;
                }
            }

            for (const word of words) {
                const score = getSimilarity(word, keyword);
                if (score > highestScore) {
                    highestScore = score;
                    if (highestScore >= CHATBOT_CONFIG.similarityThreshold) {
                        bestIntent = intent;
                    }
                }
            }
        }
    }
    return bestIntent;
}

/* ============================================================
   5. PEMROSESAN RESPONS & MEMORI KONTEKS
   ============================================================ */
function getBotResponse(userInput) {
    const text = userInput.toLowerCase().trim();

    if (text === "clear" || text === "reset" || text === "ulang") {
        chatContext.waitingForClarification = false;
        chatContext.lastIncompleteKeyword = "";
        return "Oke, memori percakapan kita sudah di-reset! Ada yang bisa saya bantu dari awal? 😊";
    }

    if (chatContext.waitingForClarification) {
        const gabunganKalimat = chatContext.lastIncompleteKeyword + " " + text;
        const intentGabungan = detectIntent(gabunganKalimat);

        chatContext.waitingForClarification = false;
        chatContext.lastIncompleteKeyword = "";

        if (intentGabungan !== 'unknown') {
            const responseList = knowledgeBase.responses[intentGabungan];
            return responseList[Math.floor(Math.random() * responseList.length)];
        }
    }

    if (text === "tanggal" || text === "kapan" || text === "tanggal berapa") {
        chatContext.waitingForClarification = true;
        chatContext.lastIncompleteKeyword = text;
        return "Mau tahu tanggal apa ya? Tanggal pengerjaan proyek atau tanggal Industrial Visit (dudi)? 🤔";
    }

    const intent = detectIntent(userInput);
    if (!knowledgeBase.responses) return "Sedang memuat data, mohon tunggu sebentar...";

    let responseList = knowledgeBase.responses[intent];

    if (!responseList || intent === 'unknown') {
        responseList = knowledgeBase.responses['fallback'];
    }

    return responseList[Math.floor(Math.random() * responseList.length)];
}

/* ============================================================
   6. RESET CHAT
   ============================================================ */
function clearChatCache() {
    const messagesContainer = document.getElementById('chatbot-messages');
    messagesContainer.innerHTML = `
        <div class="message bot-msg">
            <p>Memori chat telah direset! Ada lagi yang bisa saya bantu? 👋</p>
        </div>
    `;

    chatContext.waitingForClarification = false;
    chatContext.lastIncompleteKeyword = "";

    playSound('receive');
    console.log("Chat cache & context cleared.");
}

function sendQuickMessage(message){
    const quick = document.querySelector("#chatbot-messages .chatbot-quick-replies:last-child");
    if(quick){ quick.remove(); }
    document.getElementById("chatbot-input").value = message;
    sendMessage();
}

/* ============================================================
   7. UI: KIRIM PESAN & RENDER BUBBLE CHAT
   ============================================================ */
function playSound(type) {
    if (!CHATBOT_CONFIG.soundEnabled) return;
    try { new Audio(basePath + `chatbot/sounds/${type}.mp3`).play(); } catch (e) {}
}

function appendQuickReplies() {
    const container = document.getElementById("chatbot-messages");
    const quick = document.createElement("div");
    quick.className = "chatbot-quick-replies";

    quick.innerHTML = `
        <button class="quick-btn" onclick="sendQuickMessage('Proyek')">💼 Proyek</button>
        <button class="quick-btn" onclick="sendQuickMessage('Skills')">🧠 Skills</button>
        <button class="quick-btn" onclick="sendQuickMessage('Kunjungan Industri')">🏭 Visit</button>
        <button class="quick-btn" onclick="sendQuickMessage('Kontak')">📞 Kontak</button>
    `;
    container.appendChild(quick);
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const inputEl = document.getElementById('chatbot-input');
    const userText = inputEl.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user-msg');
    inputEl.value = '';
    playSound('send');

    setTimeout(() => {
        const botReply = getBotResponse(userText);
        appendMessage(botReply, "bot-msg");
        appendQuickReplies();
        playSound('receive');
    }, 650);
}

function appendMessage(text, className) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

window.addEventListener('DOMContentLoaded', loadKnowledgeBase);

const gallery = document.querySelectorAll(".gallery img");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const close = document.getElementById("close");

gallery.forEach(img => {
    img.onclick = () => {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;
    }
});

close.onclick = () => {
    lightbox.style.display = "none";
}

lightbox.onclick = (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = "none";
    }
}