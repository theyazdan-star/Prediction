// app.js - WC 2026 Knockout Predictor
const matches = {
    left: [
        { id: "r16-1", home: "Germany", away: "Paraguay", flagH: "🇩🇪", flagA: "🇵🇾" },
        { id: "r16-2", home: "France", away: "Sweden", flagH: "🇫🇷", flagA: "🇸🇪" },
        { id: "r16-3", home: "South Africa", away: "Canada", flagH: "🇿🇦", flagA: "🇨🇦" },
        { id: "r16-4", home: "Netherlands", away: "Morocco", flagH: "🇳🇱", flagA: "🇲🇦" },
        { id: "r16-5", home: "Portugal", away: "Croatia", flagH: "🇵🇹", flagA: "🇭🇷" },
        { id: "r16-6", home: "Spain", away: "Algeria", flagH: "🇪🇸", flagA: "🇩🇿" },
        { id: "r16-7", home: "USA", away: "Bosnia and Herzegovina", flagH: "🇺🇸", flagA: "🇧🇦" },
        { id: "r16-8", home: "Belgium", away: "Senegal", flagH: "🇧🇪", flagA: "🇸🇳" }
    ],
    right: [
        { id: "r16-9",  home: "Brazil", away: "Japan", flagH: "🇧🇷", flagA: "🇯🇵" },
        { id: "r16-10", home: "Ivory Coast", away: "Norway", flagH: "🇨🇮", flagA: "🇳🇴" },
        { id: "r16-11", home: "Mexico", away: "Ecuador", flagH: "🇲🇽", flagA: "🇪🇨" },
        { id: "r16-12", home: "England", away: "DR Congo", flagH: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagA: "🇨🇩" },
        { id: "r16-13", home: "Argentina", away: "Uzbekistan", flagH: "🇦🇷", flagA: "🇺🇿" },
        { id: "r16-14", home: "Australia", away: "Egypt", flagH: "🇦🇺", flagA: "🇪🇬" },
        { id: "r16-15", home: "Switzerland", away: "Austria", flagH: "🇨🇭", flagA: "🇦🇹" },
        { id: "r16-16", home: "Colombia", away: "Ghana", flagH: "🇨🇴", flagA: "🇬🇭" }
    ]
};

let currentUser = null;
let predictions = {};

function startPrediction() {
    const input = document.getElementById('username-input');
    const username = input.value.trim();
    
    if (!username) {
        alert("Please enter a username!");
        return;
    }

    currentUser = username;
    predictions = {};

    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    renderBrackets();
}

function selectWinner(matchId, winner) {
    predictions[matchId] = winner;
    renderBrackets();
    
    const count = Object.keys(predictions).length;
    document.getElementById('progress').textContent = `${count}/16 matches predicted`;
}

function createMatchElement(match) {
    const selected = predictions[match.id];
    return `
        <div class="match-card bg-zinc-900 border ${selected ? 'border-emerald-500' : 'border-zinc-700'} rounded-3xl p-6">
            <div class="flex items-center justify-between">
                <!-- Home -->
                <div onclick="selectWinner('\( {match.id}', ' \){match.home}')" 
                     class="flex-1 flex items-center gap-4 cursor-pointer p-4 rounded-2xl transition-all ${selected === match.home ? 'selected' : 'hover:bg-zinc-800'}">
                    <span class="text-5xl flag">${match.flagH}</span>
                    <span class="font-semibold text-lg">${match.home}</span>
                </div>
                
                <div class="px-8 text-zinc-500 font-bold text-xl">VS</div>
                
                <!-- Away -->
                <div onclick="selectWinner('\( {match.id}', ' \){match.away}')" 
                     class="flex-1 flex items-center gap-4 cursor-pointer p-4 rounded-2xl transition-all ${selected === match.away ? 'selected' : 'hover:bg-zinc-800'}">
                    <span class="text-5xl flag">${match.flagA}</span>
                    <span class="font-semibold text-lg">${match.away}</span>
                </div>
            </div>
        </div>
    `;
}

function renderBrackets() {
    const leftHTML = matches.left.map(match => createMatchElement(match)).join('');
    const rightHTML = matches.right.map(match => createMatchElement(match)).join('');
    
    document.getElementById('left-bracket').innerHTML = leftHTML;
    document.getElementById('right-bracket').innerHTML = rightHTML;
}

function generateBracketImage() {
    if (Object.keys(predictions).length < 16) {
        alert("Please predict all 16 matches first!");
        return;
    }

    const element = document.createElement('div');
    element.style.cssText = `background: linear-gradient(135deg, #18181b, #27272a); color: white; padding: 40px; width: 1000px; font-family: system-ui;`;
    
    element.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;">
            <h1 style="font-size:42px;">🏆 WC 2026 Knockout Predictions</h1>
            <p style="font-size:22px; color:#a1a1aa;">by <strong>${currentUser}</strong></p>
        </div>
        <div style="display:flex; gap:60px;">
            <div style="flex:1">
                <h2 style="color:#60a5fa; text-align:center; margin-bottom:15px;">LEFT SIDE</h2>
                ${matches.left.map(m => `
                    <div style="background:rgba(39,39,42,0.9); padding:16px; margin:10px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:28px;">${m.flagH} ${m.home}</span>
                        <span style="color:#4ade80; font-weight:bold;">→ ${predictions[m.id]}</span>
                    </div>
                `).join('')}
            </div>
            <div style="flex:1">
                <h2 style="color:#c084fc; text-align:center; margin-bottom:15px;">RIGHT SIDE</h2>
                ${matches.right.map(m => `
                    <div style="background:rgba(39,39,42,0.9); padding:16px; margin:10px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:28px;">${m.flagH} ${m.home}</span>
                        <span style="color:#4ade80; font-weight:bold;">→ ${predictions[m.id]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(element);

    html2canvas(element, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${currentUser}_wc2026_bracket.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.body.removeChild(element);
    });
         }
