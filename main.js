let events = {};

let player = {
    name: "Player Name",
    health: 100,
    energy: 100,
    hunger: 100,
    thirst: 100,
    sick: false,
    inventory: {}
};

let worldTime = {
    hour: 12,
    day: 1,
    season: "Verano"
};

fetch("events.json")
    .then(res => res.json())
    .then(data => {
        events = data;
        showEvent("intro");
        updateUI();
    });

function typeWriter(element, text, speed = 20, callback = null) {
    element.innerText = "";
    let index = 0;

    const interval = setInterval(() => {
        element.innerText += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, speed);
}

function showEvent(eventId) {
    const event = events[eventId];
    const narrativeBox = document.getElementById("narrative-box");
    const optionsDiv = document.getElementById("options");

    optionsDiv.innerHTML = "";

    // 👉 CASO ESPECIAL: menú diario
    if (event.menu === "daily") {
        showDailyMenu(event.text);
        return;
    }

    // 👉 flujo normal de eventos
    typeWriter(narrativeBox, event.text, 40, () => {
        if (!event.options) return;

        event.options.forEach((option, index) => {
            const btn = document.createElement("button");
            btn.innerText = option.text;
            btn.classList.add("option-btn");
            btn.onclick = () => selectOption(option);

            optionsDiv.appendChild(btn);

            setTimeout(() => {
                btn.classList.add("show");
            }, index * 200);
        });
    });
}

function selectOption(option) {
    advanceTime(1);

    if (option.effects) {
        applyEffects(option.effects);
    }

    updateUI();

    if (player.energy <= 0) {
        showEvent("collapse");
        return;
    }

    showEvent(option.next);
}


function applyEffects(effects) {
    for (let key in effects) {
        if (player[key] !== undefined) {
            player[key] += effects[key];
            player[key] = Math.max(0, Math.min(100, player[key]));
        }
    }
}

function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return "Mañana";
  if (hour >= 12 && hour < 18) return "Día";
  if (hour >= 18 && hour < 21) return "Tarde";
  return "Noche";
}

const seasons = {
    Verano: { baseTemp: 28 },
    Primavera: { baseTemp: 18 },
    Otoño: { baseTemp: 15 },
    Invierno: { baseTemp: 5 } // más adelante
};

const timeTempModifiers = {
    "Mañana": -3,
    "Día": +4,
    "Tarde": +2,
    "Noche": -5
};

function calculateTemperature() {
    const base = seasons[worldTime.season].baseTemp;
    const timeOfDay = getTimeOfDay(worldTime.hour);
    return base + timeTempModifiers[timeOfDay];
}

function advanceTime(hours = 1) {
    for (let i = 0; i < hours; i++) {
        worldTime.hour++;

        // cambio de día
        if (worldTime.hour >= 24) {
            worldTime.hour = 0;
            worldTime.day++;
        }

        // temperatura actual
        const temperature = calculateTemperature();

        // sed base + modificador por temperatura
        let thirstLoss = 5;
        if (temperature >= 30) thirstLoss += 3;
        else if (temperature >= 24) thirstLoss += 2;
        else if (temperature <= 8) thirstLoss -= 1;

        player.thirst -= thirstLoss;
        player.hunger -= 2;

        player.thirst = Math.max(0, player.thirst);
        player.hunger = Math.max(0, player.hunger);

        applySurvivalEffects();
    }

    updateUI();
}

function applySurvivalEffects() {
    if (player.thirst <= 0) {
        player.health -= 5;
        player.energy -= 5;
    }

    if (player.hunger <= 0) {
        player.energy -= 3;
    }

    player.health = Math.max(0, player.health);
    player.energy = Math.max(0, player.energy);
}

function updateUI() {
    const timeOfDay = getTimeOfDay(worldTime.hour);
    const temperature = calculateTemperature();

    document.getElementById("playerName").innerText = player.name;

    document.getElementById("timeInfo").innerText =
        `${formatHour(worldTime.hour)} · ${timeOfDay} · ${temperature}°C`;

    document.getElementById("dayInfo").innerText = `Día ${worldTime.day}`;
    document.getElementById("seasonInfo").innerText = worldTime.season;

    document.getElementById("health").innerText = player.health;
    document.getElementById("energy").innerText = player.energy;
    document.getElementById("hunger").innerText = player.hunger;
    document.getElementById("thirst").innerText = player.thirst;
}

function formatHour(hour) {
    return hour.toString().padStart(2, "0") + ":00";
}

function tryGetSick(probability = 0.1) {
  if (!player.sick && Math.random() < probability) {
    player.sick = true;
    showEvent("sick");
  }
}

function showDailyMenu(text) {
    const narrativeBox = document.getElementById("narrative-box");
    const optionsDiv = document.getElementById("options");

    narrativeBox.innerText = text;
    optionsDiv.innerHTML = "";

    const menuOptions = [
        { text: "Explorar", action: "explore" },
        { text: "Crear", action: "craft" },
        { text: "Inventario", action: "inventory" },
        { text: "Otro", action: "other" }
    ];

    menuOptions.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt.text;
        btn.classList.add("option-btn");
        btn.onclick = () => handleDailyMenu(opt.action);

        optionsDiv.appendChild(btn);

        setTimeout(() => {
            btn.classList.add("show");
        }, index * 150);
    });
}

function handleDailyMenu(action) {
    switch (action) {
        case "explore":
            advanceTime(4);
            showEvent("explore-forest");
            break;

        case "craft":
            showEvent("craft-menu");
            break;

        case "inventory":
            showEvent("inventory-menu");
            break;

        case "other":
            showEvent("other-menu");
            break;
    }
}