export class Hall {
    constructor(id) {
      this.id = id;
      this.machines = [];
    }
  
    addMachine(machine) {
      this.machines.push(machine);
    }
  }
  