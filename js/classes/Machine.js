import { AppState } from './AppState.js';
import { calculateTimeFactor } from '../utils/weather.js';

export class Machine {
    constructor(id, speed, mixTime) {
      this.id = id;
      this.speed = speed;
      this.mixTime = mixTime;
      this.busy = false;
      this.weather = null;
      this.pots = []; // Track pots in this machine
    }

    setWeather(weather) {
      this.weather = weather;
    }

    getTimeFactorLabel() {
      if (!this.weather) return null;
      
      const temp = this.weather.main.temp;
      const desc = this.weather.weather[0].main.toLowerCase();
      
      if (desc.includes("rain") || desc.includes("snow")) return { text: "+10% mengtijd", class: "bg-blue-500" };
      if (temp < 10) return { text: "+15% mengtijd", class: "bg-blue-500" };
      return null;
    }
  
    processPot(pot, callback) {
      if (this.busy) return;
      
      this.busy = true;
  
      // Calculate base duration based on ingredients and machine speed
      let totalTime = 0;
      
      // Add time for each ingredient based on its speed
      pot.ingredients.forEach(ingredient => {
        if (ingredient.speed === 'easy') {
          totalTime += 2000; // 2 seconds
        } else if (ingredient.speed === 'medium') {
          totalTime += 7000; // 7 seconds
        } else if (ingredient.speed === 'hard') {
          totalTime += 15000; // 15 seconds
        }
      });
      
      // Add machine mix time
      totalTime += this.mixTime;
      
      // Apply weather factor if available
      if (this.weather) {
        const timeFactor = calculateTimeFactor(this.weather);
        totalTime *= timeFactor;
      }
      
      // Update status display with processing time
      const statusDisplay = document.getElementById(`machine-status-${this.id}`);
      if (statusDisplay) {
        statusDisplay.textContent = `Verwerking: ${Math.round(totalTime/1000)}s`;
      }

      const machineEl = document.getElementById(`machine-${this.id}`);
      machineEl.classList.add("animate-pulse");
  
      setTimeout(() => {
        machineEl.classList.remove("animate-pulse");
        this.busy = false;
        callback(pot);
      }, totalTime);
    }
  
    render() {
      const el = document.createElement("div");
      el.classList.add("bg-yellow-100", "p-4", "rounded", "shadow", "relative");
      el.id = `machine-${this.id}`;
      
      // Create container for machine info
      const infoContainer = document.createElement("div");
      infoContainer.classList.add("mb-4");
      
      // Update display text to include weather status
      let statusText = `Machine #${this.id} (speed: ${this.speed})`;
      if (this.weather) {
        const temp = this.weather.main.temp;
        const desc = this.weather.weather[0].main;
        statusText += ` | ${temp}°C, ${desc}`;
      }
      infoContainer.textContent = statusText;

      // Add time factor label if applicable
      const timeFactorLabel = this.getTimeFactorLabel();
      if (timeFactorLabel) {
        const label = document.createElement("div");
        label.classList.add("mt-2", "p-2", "rounded", "text-white", timeFactorLabel.class);
        label.textContent = timeFactorLabel.text;
        infoContainer.appendChild(label);
      }

      // Create status display
      const statusDisplay = document.createElement("div");
      statusDisplay.id = `machine-status-${this.id}`;
      statusDisplay.classList.add("mt-2", "text-sm");
      infoContainer.appendChild(statusDisplay);

      // Create start button
      const startButton = document.createElement("button");
      startButton.textContent = "Start Machine";
      startButton.classList.add("mt-2", "px-4", "py-2", "bg-green-500", "text-white", "rounded", "hover:bg-green-600");
      startButton.addEventListener("click", () => this.startProcessing());
      infoContainer.appendChild(startButton);

      el.appendChild(infoContainer);

      // Create container for pots
      const potsContainer = document.createElement("div");
      potsContainer.id = `machine-pots-${this.id}`;
      potsContainer.classList.add("mt-4", "space-y-2");
      el.appendChild(potsContainer);

      // Restore pots from AppState
      const potIds = AppState.getPotsInMachine(this.id);
      potIds.forEach(potId => {
        const pot = AppState.getPotById(potId);
        if (pot) {
          const potElement = document.createElement("div");
          potElement.classList.add("machine-pot", "p-4", "rounded", "bg-white", "shadow", "mb-4");
          potElement.id = `machine-pot-${pot.id}`;

          // Add ingredients to the pot only if not processed
          if (!pot.processed) {
            pot.ingredients.forEach(ingredient => {
              const ingredientEl = document.createElement("div");
              ingredientEl.classList.add("p-2", "rounded", "text-white", "text-sm", "shadow", "mb-2");
              ingredientEl.style.backgroundColor = ingredient.color;
              ingredientEl.textContent = `${ingredient.structure} (${ingredient.speed})`;
              potElement.appendChild(ingredientEl);
            });
          }

          // If the pot has been processed, show the mixed color
          if (pot.processed) {
            const mixedColor = pot.calculateMixedColor();
            if (mixedColor) {
              // Add a label for the mixed color
              const colorLabel = document.createElement("div");
              colorLabel.classList.add("p-2", "rounded", "text-white", "text-center", "font-bold", "cursor-move", "shadow-md", "hover:shadow-lg", "transition-shadow");
              colorLabel.style.backgroundColor = mixedColor;
              colorLabel.textContent = "Gemengd resultaat";
              
              // Make colorLabel draggable with visual feedback
              colorLabel.draggable = true;
              colorLabel.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', `mixed-color:${mixedColor}`);
                colorLabel.classList.add('opacity-50');
              });
              
              colorLabel.addEventListener('dragend', () => {
                colorLabel.classList.remove('opacity-50');
              });
              
              potElement.appendChild(colorLabel);
            }
          }

          potsContainer.appendChild(potElement);
        }
      });

      // Make the machine a drop target
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("bg-yellow-200");
      });

      el.addEventListener("dragleave", () => {
        el.classList.remove("bg-yellow-200");
      });

      el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("bg-yellow-200");
        
        const data = e.dataTransfer.getData("text/plain");
        if (data.startsWith('pot-')) {
          const potId = data;
          const pot = AppState.getPotById(potId);
          if (!pot) return;
          
          if (pot.getSpeed() !== this.speed) {
            alert("Pot speed doesn't match machine speed!");
            return;
          }
          
          // Only add if not already in machine
          if (!this.pots.includes(pot)) {
            // Remove from main pots container
            const mainPotsContainer = document.getElementById("pots-container");
            if (mainPotsContainer) {
              const originalPot = mainPotsContainer.querySelector(`#${potId}`);
              if (originalPot) {
                originalPot.remove();
              }
            }
            
            // Add pot to machine's pots array and AppState
            this.pots.push(pot);
            AppState.addPotToMachine(potId, this.id);
            
            // Re-render the machine to show the new pot
            const newMachine = this.render();
            el.replaceWith(newMachine);
          }
        }
      });

      return el;
    }
  
    startProcessing() {
      if (this.busy) {
        alert("Machine is already processing!");
        return;
      }
      if (this.pots.length === 0) {
        alert("No pots in machine!");
        return;
      }
      this.busy = true;
      const statusDisplay = document.getElementById(`machine-status-${this.id}`);
      const machineEl = document.getElementById(`machine-${this.id}`);
      
      // Process each pot in the machine
      this.pots.forEach(pot => {
        // Calculate base duration based on ingredients and machine speed
        let totalTime = 0;
        
        // Add time for each ingredient based on its speed
        pot.ingredients.forEach(ingredient => {
          if (ingredient.speed === 'easy') {
            totalTime += 2000; // 2 seconds
          } else if (ingredient.speed === 'medium') {
            totalTime += 4000; // 4 seconds
          } else if (ingredient.speed === 'hard') {
            totalTime += 6000; // 6 seconds
          }
        });
        
        // Add machine mix time
        totalTime += this.mixTime;
        
        // Apply weather factor if available
        if (this.weather) {
          const timeFactor = calculateTimeFactor(this.weather);
          totalTime *= timeFactor;
        }
        // Update status display with processing time
        if (statusDisplay) {
          statusDisplay.textContent = `Verwerking: ${Math.round(totalTime/1000)}s`;
        }
        
        machineEl.classList.add("animate-pulse");
    
        setTimeout(() => {
          // Mark the pot as processed
          pot.processed = true;
          
          // Re-render the machine to update the display
          const machineContainer = document.getElementById(`machine-${this.id}`);
          if (machineContainer) {
            const newMachine = this.render();
            machineContainer.replaceWith(newMachine);
          }
          
          machineEl.classList.remove("animate-pulse");
          this.busy = false;
          if (statusDisplay) {
            statusDisplay.textContent = "Verwerking voltooid!";
          }
        }, totalTime);
      });
    }
  }
  