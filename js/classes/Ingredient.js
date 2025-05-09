export class Ingredient {
    constructor({ id, color, structure, speed, minTime }) {
      this.id = id;
      this.color = color;
      this.structure = structure;
      this.speed = speed;
      this.minTime = minTime;
      
      // Assign shapes based on structure
      this.shape = this.getShapeForStructure(structure);

      // Assign patterns based on speed
      this.pattern = this.getPatternForSpeed(speed);
    }

    getShapeForStructure(structure) {
      const shapes = {
        'grove_korrel': 'rough',    // Ruwe, onregelmatige vorm
        'korrel': 'grain',          // Ronde korrel
        'slijmerig': 'slimy',       // Druppelachtige vorm
        'glad': 'ovale'            // Gladde, ronde vorm
      };
      const shape = shapes[structure] || 'grain';
      return shape;
    }

    getPatternForSpeed(speed) {
      const patterns = {
        'easy': 'wave',
        'medium': 'striped',
        'hard': 'dotted'
      };
      return patterns[speed] || 'solid';
    }
  
    render() {
      const el = document.createElement("div");
      el.classList.add("p-2", "rounded", "text-white", "text-sm", "cursor-move", "shadow", "relative");
      el.style.backgroundColor = this.color;
      el.draggable = true;
      el.id = `ingredient-${this.id}`;
      el.dataset.speed = this.speed;
      
      // Set processing time based on speed
      let timeText = '';
      if (this.speed === 'easy') {
        timeText = '2s';
      } else if (this.speed === 'medium') {
        timeText = '4s';
      } else if (this.speed === 'hard') {
        timeText = '6s';
      }
      
      // Create a container for the structure name and canvas
      const contentContainer = document.createElement("div");
      contentContainer.classList.add("flex", "items-center", "gap-2");
      
      // Add the structure name and processing time
      const structureText = document.createElement("span");
      structureText.textContent = `${this.structure} (${this.speed}, ${timeText})`;
      structureText.classList.add("font-medium");
      contentContainer.appendChild(structureText);
      
      // Create a canvas for the shape
      const canvas = document.createElement("canvas");
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext("2d");
      
      // Draw the shape
      ctx.fillStyle = this.color;
      switch(this.shape) {
        case 'grain':
          // Ronde korrel
          ctx.beginPath();
          ctx.arc(20, 20, 15, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rough':
          // Ruwe, onregelmatige vorm (hexagonaal)
          ctx.beginPath();
          ctx.moveTo(20, 5);
          ctx.lineTo(35, 12);
          ctx.lineTo(35, 28);
          ctx.lineTo(20, 35);
          ctx.lineTo(5, 28);
          ctx.lineTo(5, 12);
          ctx.closePath();
          ctx.fill();
          break;
        case 'slimy':
          // Druppelachtige vorm
          ctx.beginPath();
          ctx.moveTo(20, 5);
          ctx.quadraticCurveTo(35, 20, 20, 35);
          ctx.quadraticCurveTo(5, 20, 20, 5);
          ctx.fill();
          break;
        case 'smooth':
          // Gladde, ronde vorm met highlight
          ctx.beginPath();
          ctx.arc(20, 20, 15, 0, Math.PI * 2);
          ctx.fill();
          // Highlight voor glad effect
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.arc(12, 12, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      // Apply pattern
      ctx.globalCompositeOperation = 'destination-out';
      switch(this.pattern) {
        case 'wave':
          // Draw wavy lines
          ctx.beginPath();
          for(let i = 0; i < 40; i += 2) {
            const y = 20 + Math.sin(i * 0.2) * 8;
            if (i === 0) {
              ctx.moveTo(i, y);
            } else {
              ctx.lineTo(i, y);
            }
          }
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
        case 'striped':
          for(let i = 0; i < 40; i += 6) {
            ctx.fillRect(i, 0, 3, 40);
          }
          break;
        case 'dotted':
          for(let i = 8; i < 32; i += 10) {
            for(let j = 8; j < 32; j += 10) {
              ctx.beginPath();
              ctx.arc(i, j, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
      }
      
      // Add the canvas
      contentContainer.appendChild(canvas);
      
      el.appendChild(contentContainer);
      
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", el.id);
      });
    
      return el;
    }
}
  