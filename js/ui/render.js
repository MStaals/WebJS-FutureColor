import { AppState } from '../classes/AppState.js';

export function renderIngredient(ingredient) {
    const container = document.getElementById('ingredients-container');
    const el = ingredient.render();
    el.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', el.id);
    });
    container.appendChild(el);
  }
  
  export function renderPot(pot) {
    const container = document.getElementById('pots-container');
    const el = pot.render();
    el.id = `pot-${pot.id}`;
    el.draggable = true;
  
    el.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.id);
    });
  
    container.appendChild(el);
  }  
  
  export function renderMachine(machine) {
    const el = machine.render();
    return el;
  }
  
  export function renderHall(hall, isHallSwitch = false) {
    const container = document.getElementById("machines-container");
    
    if (isHallSwitch) {
      // If switching halls, clear everything and re-render
      container.innerHTML = "";
      hall.machines.forEach(machine => {
        const machineEl = machine.render();
        container.appendChild(machineEl);
      });
    } else {
      // For normal updates (like adding new machines), only add new ones
      hall.machines.forEach(machine => {
        // Check if this machine is already rendered
        const existingMachine = document.getElementById(`machine-${machine.id}`);
        if (!existingMachine) {
          // Only render and append new machines
          const machineEl = machine.render();
          container.appendChild(machineEl);
        }
      });
    }
  }

  