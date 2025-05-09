export const AppState = {
    ingredients: [],
    pots: [],
    machines: [],
    halls: [],
    activeHallId: 1,
    potsInMachines: {}, // Track which pots are in which machines
  
    addIngredient(ingredient) {
      this.ingredients.push(ingredient);
    },
  
    addPot(pot) {
      this.pots.push(pot);
    },
  
    addMachine(machine) {
      this.machines.push(machine);
      const hall = this.halls.find(h => h.id === this.activeHallId);
      if (hall) {
        hall.addMachine(machine);
      }
      // Initialize empty array for this machine's pots
      this.potsInMachines[machine.id] = [];
    },
  
    createHall(id) {
      const hall = {
        id,
        machines: [],
        addMachine(machine) {
          this.machines.push(machine);
        },
        getMachines() {
          return this.machines;
        },
      };
      this.halls.push(hall);
      return hall;
    },
  
    switchHall(id) {
      this.activeHallId = id;
    },
  
    getActiveHall() {
      return this.halls.find(h => h.id === this.activeHallId);
    },
  
    getPotById(potId) {
      // Extract the numeric ID from the pot ID (format: pot-{id})
      const numericId = parseInt(potId.split('-')[1]);      
      const pot = this.pots.find(p => p.id === numericId);

      return pot;
    },
    
    // Add a pot to a machine
    addPotToMachine(potId, machineId) {
      if (!this.potsInMachines[machineId]) {
        this.potsInMachines[machineId] = [];
      }
      if (!this.potsInMachines[machineId].includes(potId)) {
        this.potsInMachines[machineId].push(potId);
      }
    },
    
    // Remove a pot from a machine
    removePotFromMachine(potId, machineId) {
      if (this.potsInMachines[machineId]) {
        this.potsInMachines[machineId] = this.potsInMachines[machineId].filter(id => id !== potId);
      }
    },
    
    // Get all pots in a machine
    getPotsInMachine(machineId) {
      return this.potsInMachines[machineId] || [];
    }
  };
  