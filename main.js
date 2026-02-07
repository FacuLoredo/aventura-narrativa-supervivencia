let events = {};

let player = {
    name: "Player Name",
    health: 100,
    energy: 100,
    hunger: 100,
    thirst: 100,
    inventory: {}
};

let worldTime = {
    hour: 12,
    day: 1,
    season: "Verano",
    temperature: 33
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

    typeWriter(narrativeBox, event.text, 40, () => {
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

function advanceTime(hours) {
    worldTime.hour += hours;

    if (worldTime.hour >= 24) {
        worldTime.hour -= 24;
        worldTime.day += 1;
    }
}

function updateUI() {
    document.getElementById("playerName").innerText = player.name;
    document.getElementById("timeInfo").innerText =
        `${formatHour(worldTime.hour)} | ${worldTime.temperature}°C`;

    document.getElementById("dayInfo").innerText = `Día: ${worldTime.day}`;
    document.getElementById("seasonInfo").innerText = worldTime.season;

    document.getElementById("health").innerText = player.health;
    document.getElementById("energy").innerText = player.energy;
    document.getElementById("hunger").innerText = player.hunger;
    document.getElementById("thirst").innerText = player.thirst;
}

function formatHour(hour) {
    return hour.toString().padStart(2, "0") + ":00";
}
