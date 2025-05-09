import { Ingredient } from './classes/Ingredient.js';
import { Pot } from './classes/Pot.js';
import { Machine } from './classes/Machine.js';
import { AppState } from './classes/AppState.js';
import { renderIngredient, renderPot, renderMachine, renderHall } from './ui/render.js';
import { createGrid } from './ui/grid.js';
import WeatherService from './utils/weatherService.js';
import config from './utils/config.js';

const locations = {
    riyadh: { lat: 24.7136, lon: 46.6753 }
};

// Initialize weather service
const weatherService = new WeatherService(config.weatherApi.apiKey);

// Function to update weather information for all machines
async function updateWeatherForMachines() {
    try {
        // Get user's location for Hall A
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
        
        let latitude, longitude;
        if (AppState.activeHallId === 2) {
            // Hall B (Riyadh)
            latitude = locations.riyadh.lat;
            longitude = locations.riyadh.lon;
        } else {
            // Hall A (User's location)
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        }
        const weather = await weatherService.getCurrentWeather(latitude, longitude);
        
        // Update weather display
        const weatherDisplay = document.getElementById('weather-display');
        if (weatherDisplay) {
            weatherDisplay.innerHTML = `
                <div class="flex items-center gap-4 p-2 bg-white/20 rounded-lg shadow-sm backdrop-blur-sm text-white">
                    <img src="http://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}" class="w-12 h-12 brightness-0 invert">
                    <div class="flex flex-col gap-1">
                        <p class="text-lg font-bold m-0">${Math.round(weather.temperature)}°C</p>
                        <p class="text-sm m-0">${weather.description}</p>
                    </div>
                </div>
            `;
        }

        // Update weather for all machines in all halls
        AppState.halls.forEach(hall => {
            hall.getMachines().forEach(machine => {
                machine.setWeather({
                    main: { temp: weather.temperature },
                    weather: [{ main: weather.description }]
                });
                // Re-render the machine to show updated status
                const machineEl = document.getElementById(`machine-${machine.id}`);
                if (machineEl) {
                    machineEl.replaceWith(machine.render());
                }
            });
        });

    } catch (error) {
        console.error('Error updating weather:', error);
        const weatherDisplay = document.getElementById('weather-display');
        if (weatherDisplay) {
            let errorMessage = 'Weer info niet beschikbaar';
            
            if (error.message.includes('Weather API error')) {
                errorMessage = 'API fout: ' + error.message.split('error: ')[1];
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Locatie timeout - probeer opnieuw';
            } else if (error.message.includes('denied')) {
                errorMessage = 'Locatie toegang geweigerd';
            }
            
            weatherDisplay.innerHTML = `
                <div class="flex items-center gap-4 p-2 bg-white/20 rounded-lg shadow-sm backdrop-blur-sm text-white">
                    <p class="m-0">${errorMessage}</p>
                </div>
            `;
        }
    }
}

// Unieke ID's
let ingredientId = 0;
let potId = 0;
let machineId = 0;

// Init halls
AppState.createHall(1);
AppState.createHall(2);

// Wacht tot de DOM geladen is
document.addEventListener('DOMContentLoaded', () => {
    // DOM refs
    const ingredientBtn = document.getElementById('create-ingredient');
    const potBtn = document.getElementById('create-pot');
    const machineBtn = document.getElementById('create-machine');
    const hallToggle = document.getElementById('hall-toggle');
    const hallContainer = document.getElementById('machines-container');
    const createGridBtn = document.getElementById('create-grid');
    const gridSizeInput = document.getElementById('grid-size');

    // Initial weather update
    updateWeatherForMachines().catch(error => {
        console.error('Error updating initial weather:', error);
        const weatherDisplay = document.getElementById('weather-display');
        if (weatherDisplay) {
            weatherDisplay.innerHTML = `
                <div class="flex items-center gap-4 p-2 bg-white/20 rounded-lg shadow-sm backdrop-blur-sm text-white">
                    <p class="m-0">Weer info niet beschikbaar</p>
                </div>
            `;
        }
    });

    // Update weather every 5 minutes
    setInterval(() => {
        updateWeatherForMachines().catch(error => {
            console.error('Error updating weather:', error);
        });
    }, 5 * 60 * 1000);

    // Ingrediënt maken
    if (ingredientBtn) {
        ingredientBtn.addEventListener('click', () => {
            const structures = ['korrel', 'grove_korrel', 'glad', 'slijmerig'];
            const speeds = ['easy', 'medium', 'hard'];
            
            const ingredient = new Ingredient({
                id: ++ingredientId,
                color: `hsl(${Math.random() * 360}, 80%, 60%)`,
                structure: structures[Math.floor(Math.random() * structures.length)],
                speed: speeds[Math.floor(Math.random() * speeds.length)],
                minTime: 2000
            });
            AppState.addIngredient(ingredient);
            renderIngredient(ingredient);
        });
    }

    // Pot maken
    if (potBtn) {
        potBtn.addEventListener('click', () => {
            const pot = new Pot(++potId);
            Pot.prototype._ingredientClass = Ingredient;
            AppState.addPot(pot);
            renderPot(pot);

            const ctx = document.getElementById("visual-canvas").getContext("2d");
            ctx.fillStyle = "gray";
            ctx.fillRect(Math.random() * 500, Math.random() * 200, 50, 50);
        });
    }

    // Machine maken
    if (machineBtn) {
        machineBtn.addEventListener('click', async () => {
            // Get current weather for the active hall
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                });
            });
            
            let latitude, longitude;
            if (AppState.activeHallId === 2) {
                latitude = locations.riyadh.lat;
                longitude = locations.riyadh.lon;
            } else {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            }
            
            const weather = await weatherService.getCurrentWeather(latitude, longitude);
            const temperature = weather.temperature;
            
            // Check if we can create a new machine
            const activeHall = AppState.getActiveHall();
            const currentMachines = activeHall.getMachines();
            
            if (temperature > 35 && currentMachines.length >= 1) {
                alert("Kan geen extra machine aanmaken: temperatuur is boven 35°C en er is al een machine in deze hall");
                return;
            }
            
            const speeds = ['easy', 'medium', 'hard'];
            const machine = new Machine(++machineId, speeds[Math.floor(Math.random() * speeds.length)], 1000);
            AppState.addMachine(machine);
            renderHall(AppState.getActiveHall(), false);
            
            // Update weather for the new machine
            machine.setWeather({
                main: { temp: temperature },
                weather: [{ main: weather.description }]
            });
            
            // If temperature is above 35, disable all machines except the first one
            if (temperature > 35) {
                const machines = activeHall.getMachines();
                machines.forEach((machine, index) => {
                    machine.setEnabled(index === 0);
                    const machineEl = document.getElementById(`machine-${machine.id}`);
                    if (machineEl) {
                        machineEl.replaceWith(machine.render());
                    }
                });
            }
        });
    }

    // Wissel tussen hallen
    if (hallToggle) {
        hallToggle.addEventListener('click', () => {
            const nieuweId = AppState.activeHallId === 1 ? 2 : 1;
            AppState.switchHall(nieuweId);
            renderHall(AppState.getActiveHall(), true);
            updateWeatherForMachines(); // Update weather when switching halls
        });
    }

    // Kleurentest grid
    if (createGridBtn && gridSizeInput) {
        createGridBtn.addEventListener('click', () => {
            const size = parseInt(gridSizeInput.value) || 6;
            createGrid(size, 'color-grid');
        });
    }
});

