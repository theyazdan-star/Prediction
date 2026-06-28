// app.js - WC 2026 Knockout Predictor (full bracket: R32 -> R16 -> QF -> SF -> Final)

// ---- Round of 32 (starting data) ----
const round0Left = [
    { id: "l-0-1", home: "Germany", away: "Paraguay", flagH: "🇩🇪", flagA: "🇵🇾" },
    { id: "l-0-2", home: "France", away: "Sweden", flagH: "🇫🇷", flagA: "🇸🇪" },
    { id: "l-0-3", home: "South Africa", away: "Canada", flagH: "🇿🇦", flagA: "🇨🇦" },
    { id: "l-0-4", home: "Netherlands", away: "Morocco", flagH: "🇳🇱", flagA: "🇲🇦" },
    { id: "l-0-5", home: "Portugal", away: "Croatia", flagH: "🇵🇹", flagA: "🇭🇷" },
    { id: "l-0-6", home: "Spain", away: "Algeria", flagH: "🇪🇸", flagA: "🇩🇿" },
    { id: "l-0-7", home: "USA", away: "Bosnia and Herzegovina", flagH: "🇺🇸", flagA: "🇧🇦" },
    { id: "l-0-8", home: "Belgium", away: "Senegal", flagH: "🇧🇪", flagA: "🇸🇳" }
];

const round0Right = [
    { id: "r-0-1", home: "Brazil", away: "Japan", flagH: "🇧🇷", flagA: "🇯🇵" },
    { id: "r-0-2", home: "Ivory Coast", away: "Norway", flagH: "🇨🇮", flagA: "🇳🇴" },
    { id: "r-0-3", home: "Mexico", away: "Ecuador", flagH: "🇲🇽", flagA: "🇪🇨" },
    { id: "r-0-4", home: "England", away: "DR Congo", flagH: "🇬🇧", flagA: "🇨🇩" },
    { id: "r-0-5", home: "Argentina", away: "Uzbekistan", flagH: "🇦🇷", flagA: "🇺🇿" },
    { id: "r-0-6", home: "Australia", away: "Egypt", flagH: "🇦🇺", flagA: "🇪🇬" },
    { id: "r-0-7", home: "Switzerland", away: "Austria", flagH: "🇨🇭", flagA: "🇦🇹" },
    { id: "r-0-8", home: "Colombia", away: "Ghana", flagH: "🇨🇴", flagA: "🇬🇭" }
];

// ---- Auto-generate every later round from the previous one ----
// Each generated match references the two previous-round match IDs whose
// winners will fill its home/away slots.
function buildRounds(round0, prefix) {
    const rounds = [round0];
    let prev = round0;
    let roundIndex = 1;
    while (prev.length > 1) {
        const next = [];
        for (let i = 0; i < prev.length; i += 2) {
            next.push({
                id: `${prefix}-${roundIndex}-${next.length + 1}`,
                homeRef: prev[i].id,
                awayRef: prev[i + 1].id
            });
        }
        rounds.push(next);
        prev = next;
        roundIndex++;
    }
    return rounds;
}

const leftRounds = buildRounds(round0Left, "l");   // [8, 4, 2, 1]
const rightRounds = buildRounds(round0Right, "r"); // [8, 4, 2, 1]

const finalMatch = {
    id: "final",
    homeRef: leftRounds[leftRounds.length - 1][0].id,
    awayRef: rightRounds[rightRounds.length - 1][0].id
};

const ROUND_LABELS = ["Round of 32", "Round of 16", "Quarterfinals", "Semifinals"];

// Flat list of every match in the whole bracket (used for progress count + dependency lookups)
const allMatches = [].concat(...leftRounds, ...rightRounds, [finalMatch]);

// Lookup table: team name -> flag emoji (needed once a team is just a "winner of match X")
const teamFlags = {};
[...round0Left, ...round0Right].forEach(m => {
    teamFlags[m.home] = m.flagH;
    teamFlags[m.away] = m.flagA;
});

let currentUser = null;
let predictions = {}; // matchId -> winner team name

// ---------------------------------------------------------------------------

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

// Resolves the team (name + flag) sitting in a given slot of a match.
// Returns null if that slot isn't decided yet (still TBD).
function getTeam(match, slot) {
    if (slot === 'home' && match.home) return { name: match.home, flag: match.flagH };
    if (slot === 'away' && match.away) return { name: match.away, flag: match.flagA };

    const ref = slot === 'home' ? match.homeRef : match.awayRef;
    if (!ref) return null;

    const winner = predictions[ref];
    if (!winner) return null;

    return { name: winner, flag: teamFlags[winner] || "🏳️" };
}

// Finds every match that depends on matchId's winner (i.e. has it as homeRef/awayRef)
function findDependents(matchId) {
    return allMatches
        .filter(m => m.homeRef === matchId || m.awayRef === matchId)
        .map(m => m.id);
}

// If a pick changes, any later picks that were based on the old winner are no longer valid
function clearDownstream(matchId) {
    findDependents(matchId).forEach(depId => {
        if (predictions[depId]) {
            delete predictions[depId];
        }
        clearDownstream(depId);
    });
}

function selectWinner(matchId, winner) {
    predictions[matchId] = winner;
    clearDownstream(matchId);
    renderBrackets();
}

// Escapes a string for safe use inside a single-quoted HTML attribute value
// (handles apostrophes in team names like "Côte d'Ivoire")
function escapeForAttr(str) {
    return String(str).replace(/'/g, "&#39;");
}

function teamSlotHTML(match, team) {
    const locked = !team;
    if (locked) {
        return `
            <div class="flex-1 flex items-center gap-3 px-3 py-4 rounded-2xl opacity-30">
                <span class="text-5xl flag bg-zinc-800 flex items-center justify-center text-2xl">❔</span>
                <span class="font-semibold text-lg text-zinc-500 leading-tight">TBD</span>
            </div>
        `;
    }

    const attr = escapeForAttr(team.name);
    const isSelected = predictions[match.id] === team.name;

    return `
        <div onclick="selectWinner('${match.id}', '${attr}')"
             class="flex-1 flex items-center gap-3 cursor-pointer px-3 py-4 rounded-2xl transition-all ${isSelected ? 'selected' : 'hover:bg-zinc-800'}">
            <span class="text-5xl flag">${team.flag}</span>
            <span class="font-semibold text-lg leading-tight">${team.name}</span>
        </div>
    `;
}

function createMatchElement(match) {
    const homeTeam = getTeam(match, 'home');
    const awayTeam = getTeam(match, 'away');
    const locked = !homeTeam || !awayTeam;
    const selected = predictions[match.id];

    return `
        <div class="match-card bg-zinc-900 border ${selected ? 'border-emerald-500' : 'border-zinc-700'} rounded-3xl p-6 ${locked ? 'opacity-60' : ''}">
            <div class="flex items-center justify-between">
                ${teamSlotHTML(match, homeTeam)}
                <div class="px-4 text-zinc-500 font-bold text-xl shrink-0">VS</div>
                ${teamSlotHTML(match, awayTeam)}
            </div>
        </div>
    `;
}

function renderRoundSection(label, leftMatches, rightMatches) {
    return `
        <div>
            <h2 class="text-2xl font-bold text-center text-amber-400 mb-6">${label}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                    <h3 class="text-lg font-bold text-blue-400 text-center mb-4">LEFT</h3>
                    <div class="space-y-5">${leftMatches.map(createMatchElement).join('')}</div>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-purple-400 text-center mb-4">RIGHT</h3>
                    <div class="space-y-5">${rightMatches.map(createMatchElement).join('')}</div>
                </div>
            </div>
        </div>
    `;
}

function renderBrackets() {
    let html = '';

    for (let i = 0; i < ROUND_LABELS.length; i++) {
        html += renderRoundSection(ROUND_LABELS[i], leftRounds[i], rightRounds[i]);
    }

    html += `
        <div>
            <h2 class="text-2xl font-bold text-center text-amber-400 mb-6">🏆 FINAL</h2>
            <div class="max-w-xl mx-auto">${createMatchElement(finalMatch)}</div>
        </div>
    `;

    document.getElementById('bracket-container').innerHTML = html;
    updateProgress();
}

function updateProgress() {
    const count = Object.keys(predictions).length;
    document.getElementById('progress').textContent = `${count}/${allMatches.length} matches predicted`;
}

// ---------------------------------------------------------------------------
// Image export

function imageMatchRowHTML(match) {
    const homeTeam = getTeam(match, 'home');
    const awayTeam = getTeam(match, 'away');
    const winner = predictions[match.id];

    return `
        <div style="background:rgba(39,39,42,0.9); padding:14px; margin:8px 0; border-radius:12px; display:flex; justify-content:space-between; align-items:center; gap:16px;">
            <span style="font-size:18px;">${homeTeam.flag} ${homeTeam.name} <span style="color:#71717a">vs</span> ${awayTeam.flag} ${awayTeam.name}</span>
            <span style="color:#4ade80; font-weight:bold; font-size:16px; white-space:nowrap;">🏆 ${winner}</span>
        </div>
    `;
}

function generateBracketImage() {
    if (Object.keys(predictions).length < allMatches.length) {
        alert("Please predict all matches first, all the way to the Final!");
        return;
    }

    const champion = predictions['final'];

    const element = document.createElement('div');
    // Positioned off-screen (not display:none) so html2canvas can still render it correctly
    element.style.cssText = `position: fixed; top: -9999px; left: -9999px; background: linear-gradient(135deg, #18181b, #27272a); color: white; padding: 40px; width: 1100px; font-family: system-ui; border-radius: 20px;`;

    element.innerHTML = `
        <div style="text-align:center; margin-bottom:30px;">
            <h1 style="font-size:38px;">🏆 WC 2026 Knockout Predictions</h1>
            <p style="font-size:20px; color:#a1a1aa;">by <strong>${currentUser}</strong></p>
            <div style="margin-top:20px; background:linear-gradient(135deg,#f59e0b,#fbbf24); color:#1c1917; padding:16px 32px; border-radius:16px; display:inline-block;">
                <div style="font-size:16px; font-weight:600;">CHAMPION</div>
                <div style="font-size:30px; font-weight:800;">${champion}</div>
            </div>
        </div>
        ${ROUND_LABELS.map((label, i) => `
            <div style="margin-bottom:26px;">
                <h2 style="text-align:center; color:#fbbf24; font-size:22px; margin-bottom:10px;">${label}</h2>
                <div style="display:flex; gap:40px;">
                    <div style="flex:1">${leftRounds[i].map(imageMatchRowHTML).join('')}</div>
                    <div style="flex:1">${rightRounds[i].map(imageMatchRowHTML).join('')}</div>
                </div>
            </div>
        `).join('')}
        <div>
            <h2 style="text-align:center; color:#fbbf24; font-size:22px; margin-bottom:10px;">Final</h2>
            <div style="max-width:600px; margin:0 auto;">${imageMatchRowHTML(finalMatch)}</div>
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
      
