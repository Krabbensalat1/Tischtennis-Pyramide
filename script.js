let players = JSON.parse(localStorage.getItem("players")) || [];
let stats = JSON.parse(localStorage.getItem("stats")) || {};

const pyramidLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const maxPlayers = pyramidLevels.reduce((a, b) => a + b, 0);

// Passwortschutz für Reset-Buttons
const correctPasswordAll = "allesLoeschen123"; // Passwort für Alles Löschen
const correctPasswordSeason = "saisonZuruecksetzen456"; // Passwort für Saison zurücksetzen

function renderPyramid() {
    let pyramidDiv = document.getElementById("pyramid");
    pyramidDiv.innerHTML = "";

    let index = 0;
    pyramidLevels.forEach((rowSize) => {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        for (let i = 0; i < rowSize; i++) {
            let playerDiv = document.createElement("div");
            playerDiv.classList.add("player");
            playerDiv.textContent = players[index] || "-";
            rowDiv.appendChild(playerDiv);
            index++;
        }
        pyramidDiv.appendChild(rowDiv);
    });

    updatePlayerDropdowns();
    renderStats();
    renderLeaderboard();
    renderRankingTable();
}

function addPlayer() {
    let name = document.getElementById("playerName").value;
    if (name && players.length < maxPlayers) {
        players.push(name);
        stats[name] = { wins: 0, losses: 0 };
        localStorage.setItem("players", JSON.stringify(players));
        localStorage.setItem("stats", JSON.stringify(stats));
        renderPyramid();
    }
}

function updatePlayerDropdowns() {
    let player1 = document.getElementById("player1");
    player1.innerHTML = "";
    players.forEach((player, index) => {
        let option = new Option(player, index);
        player1.add(option);
    });
    updateChallengers();
}

function updateChallengers() {
    let player1Index = document.getElementById("player1").value;
    let player2 = document.getElementById("player2");
    player2.innerHTML = "";

    let rowIndex = getRowIndex(parseInt(player1Index));

    players.forEach((player, index) => {
        if (getRowIndex(index) === rowIndex - 1) {
            let option = new Option(player, index);
            player2.add(option);
        }
    });
}

function getRowIndex(playerIndex) {
    let sum = 0;
    for (let i = 0; i < pyramidLevels.length; i++) {
        sum += pyramidLevels[i];
        if (playerIndex < sum) return i;
    }
    return pyramidLevels.length;
}

function recordMatch() {
    let p1 = document.getElementById("player1").value;
    let p2 = document.getElementById("player2").value;

    if (p1 !== p2) {
        let winner = players[p1];
        let loser = players[p2];

        stats[winner].wins += 1;
        stats[loser].losses += 1;

        if (parseInt(p1) > parseInt(p2)) {
            [players[p1], players[p2]] = [players[p2], players[p1]];
        }

        localStorage.setItem("players", JSON.stringify(players));
        localStorage.setItem("stats", JSON.stringify(stats));
        renderPyramid();
    }
}

function renderLeaderboard() {
    let leaderboardDiv = document.getElementById("leaderboard");
    leaderboardDiv.innerHTML = players
        .sort((a, b) => stats[b].wins - stats[a].wins)
        .slice(0, 10)
        .map(player => `<div>${player}: ${stats[player].wins} Siege</div>`)
        .join("");
}

function renderRankingTable() {
    let tableBody = document.querySelector("#rankingTable tbody");
    tableBody.innerHTML = players
        .map((player, index) => `<tr><td>${index + 1}</td><td>${player}</td><td>${stats[player].wins}</td><td>${stats[player].losses}</td></tr>`)
        .join("");
}

function resetData() {
    if (confirm("Möchtest du wirklich alle Daten löschen?")) {
        players = [];
        stats = {};
        localStorage.removeItem("players");
        localStorage.removeItem("stats");
        renderPyramid();
    }
}

// Passwortprüfung für "Alles Löschen"-Button
function checkPasswordAll() {
    const password = document.getElementById("resetPasswordAll").value;
    if (password === correctPasswordAll) {
        resetData(); // Ruft die Reset-Funktion auf
    } else {
        alert("Falsches Passwort für 'Alles Löschen'!");
    }
}

// Passwortprüfung für "Saison Zurücksetzen"-Button
function checkPasswordSeason() {
    const password = document.getElementById("resetPasswordSeason").value;
    if (password === correctPasswordSeason) {
        resetSeason(); // Ruft die Saison-Reset-Funktion auf
    } else {
        alert("Falsches Passwort für 'Saison Zurücksetzen'!");
    }
}

// Saison-Rücksetzung: Statistiken löschen, Spieler behalten
function resetSeason() {
    if (confirm("Möchtest du die Saison zurücksetzen? Alle Siege und Niederlagen werden gelöscht!")) {
        players.forEach(player => {
            stats[player] = { wins: 0, losses: 0 };
        });

        localStorage.setItem("stats", JSON.stringify(stats));
        renderPyramid();
    }
}

// Funktion zum Aktivieren der Buttons bei richtiger Passwort-Eingabe
function enableResetButtons() {
    const passwordAll = document.getElementById("resetPasswordAll").value;
    const passwordSeason = document.getElementById("resetPasswordSeason").value;

    // Überprüfen, ob die Passwörter korrekt sind und Buttons aktivieren
    if (passwordAll === correctPasswordAll) {
        document.getElementById("resetButtonAll").disabled = false;
    } else {
        document.getElementById("resetButtonAll").disabled = true;
    }

    if (passwordSeason === correctPasswordSeason) {
        document.getElementById("resetButtonSeason").disabled = false;
    } else {
        document.getElementById("resetButtonSeason").disabled = true;
    }
}

// Event Listener, um die Eingabe zu überwachen und Buttons bei richtiger Passwort-Eingabe zu aktivieren
document.getElementById("resetPasswordAll").addEventListener("input", enableResetButtons);
document.getElementById("resetPasswordSeason").addEventListener("input", enableResetButtons);
