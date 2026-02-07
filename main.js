/* ===============================
   ESTADO DEL JUGADOR
================================ */
const player = {
    health: 100,
    energy: 60,
    hunger: 80,
    thirst: 50,
    temperature: "Normal",
    inventory: {
        "Piedra": 3,
        "Rama": 2
    }
};

/* ===============================
   EVENTOS (DESDE JSON)
================================ */
let events = {};
let currentEvent = "intro";

/* ===============================
   REFERENCIAS DOM
================================ */
const narrationEl = document.getElementById("narration");
const optionsEl = document.getElementById("options");

const healthEl = document.getElementById("health");
const energyEl = document.getElementById("energy");
const hungerEl = document.getElementById("hunger");
const thirstEl = document.getElementById("thirst");
const temperatureEl = document.getElementById("temperature");
const inventoryEl = document.getElementById("inventory");

/* ===============================
   CARGA DEL JSON
================================ */
async function loadEvents() {
    try {
        const response = await fetch("events.json");
        events = await response.json();
        startGame();
    } catch (error) {
        narrationEl.textContent = "ERROR: No se pudo cargar events.json";
        console.error(error);
    }
}

/* ===============================
   INICIO DEL JUEGO
================================ */
function startGame() {
    updateUI();
    showEvent(currentEvent);
}

/* ===============================
   MOSTRAR EVENTO
================================ */
function showEvent(eventId) {
    currentEvent = eventId;
    const event = events[eventId];

    if (!event) {
        narrationEl.textContent = "ERROR: Evento no encontrado: " + eventId;
        return;
    }

    narrationEl.textContent = event.text;
    optionsEl.innerHTML = "";

    event.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option.text;
        btn.onclick = () => selectOption(option);
        optionsEl.appendChild(btn);
    });
}

/* ===============================
   AL ELEGIR OPCIÓN
================================ */
function selectOption(option) {
    if (option.effects) {
        applyEffects(option.effects);
    }

    updateUI();

    // CHEQUEO GLOBAL DE COLAPSO
    if (player.energy <= 0) {
        showEvent("collapse");
        return;
    }

    showEvent(option.next);
}

/* ===============================
   EFECTOS
================================ */
function applyEffects(effects) {
    for (let key in effects) {
        if (typeof player[key] === "number") {
            player[key] += effects[key];
            player[key] = Math.max(0, Math.min(100, player[key]));
        }
    }
}

/* ===============================
   ACTUALIZAR UI
================================ */
function updateUI() {
    healthEl.textContent = `Salud: ${player.health}/100`;
    energyEl.textContent = `Energía: ${player.energy}/100`;
    hungerEl.textContent = `Hambre: ${player.hunger}/100`;
    thirstEl.textContent = `Sed: ${player.thirst}/100`;
    temperatureEl.textContent = `Temperatura: ${player.temperature}`;

    let invText = "";
    for (let item in player.inventory) {
        invText += `${item} x${player.inventory[item]}\n`;
    }
    inventoryEl.textContent = invText;
}

/* ===============================
   CARGAR TODO
================================ */
loadEvents();
