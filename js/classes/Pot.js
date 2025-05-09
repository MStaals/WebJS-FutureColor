import { AppState } from './AppState.js';

export class Pot {
    constructor(id) {
      this.id = id;
      this.ingredients = [];
      this.processed = false;
      this.canvas = document.getElementById("visual-canvas");
      this.ctx = this.canvas.getContext("2d");
    }
  
    canAdd(ingredient) {
      if (this.ingredients.length === 0) return true;
      return this.ingredients.every(i => i.speed === ingredient.speed);
    }
  
    addIngredient(ingredient) {
      if (this.canAdd(ingredient)) {
        this.ingredients.push(ingredient);
        Pot.drawAllPots();
        return true;
      }
      return false;
    }
  
    // Get the speed of ingredients in this pot
    getSpeed() {
      if (this.ingredients.length === 0) return null;
      return this.ingredients[0].speed; // All ingredients have the same speed
    }
  
    // Convert HSL color to RGB
    hslToRgb(h, s, l) {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
  
    // Parse HSL color string to values
    parseHsl(color) {
      // If the color is already a direct HSL value
      if (typeof color === 'string' && color.startsWith('hsl')) {
        const values = color.match(/\d+/g);
        if (values && values.length >= 3) {
          return {
            h: parseInt(values[0]),
            s: parseInt(values[1]),
            l: parseInt(values[2])
          };
        }
      }
      
      // Try to parse RGB format (most common case for ingredients)
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]) / 255;
        const g = parseInt(rgbMatch[2]) / 255;
        const b = parseInt(rgbMatch[3]) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          
          h = Math.round(h * 60);
        }
        
        return {
          h: h,
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        };
      }
      
      // Try to parse hex color format
      const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (hexMatch) {
        const r = parseInt(hexMatch[1], 16) / 255;
        const g = parseInt(hexMatch[2], 16) / 255;
        const b = parseInt(hexMatch[3], 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          
          h = Math.round(h * 60);
        }
        
        return {
          h: h,
          s: Math.round(s * 100),
          l: Math.round(l * 100)
        };
      }
      
      // Default fallback for debugging
      console.warn("Could not parse color:", color);
      return { h: 0, s: 50, l: 50 }; // Default gray color
    }
  
    // Calculate mixed color from multiple colors
    calculateMixedColor() {
      if (this.ingredients.length === 0) return null;
      
      // Initialize RGB totals
      let totalR = 0, totalG = 0, totalB = 0;
      let validColors = 0;
      
      this.ingredients.forEach(ingredient => {        
        // Extract RGB values from the color
        let r, g, b;
        
        // Try to parse RGB format
        const rgbMatch = ingredient.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          r = parseInt(rgbMatch[1]);
          g = parseInt(rgbMatch[2]);
          b = parseInt(rgbMatch[3]);
        } 
        // Try to parse hex color format
        else if (ingredient.color.startsWith('#')) {
          const hex = ingredient.color.substring(1);
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        }
        // Try to parse named colors
        else {
          // Create a temporary element to get computed color
          const temp = document.createElement('div');
          temp.style.color = ingredient.color;
          document.body.appendChild(temp);
          const computedColor = window.getComputedStyle(temp).color;
          document.body.removeChild(temp);
          
          const rgbValues = computedColor.match(/\d+/g);
          if (rgbValues && rgbValues.length >= 3) {
            r = parseInt(rgbValues[0]);
            g = parseInt(rgbValues[1]);
            b = parseInt(rgbValues[2]);
          }
        }
        
        // If we successfully extracted RGB values, add them to the totals
        if (r !== undefined && g !== undefined && b !== undefined) {
          totalR += r;
          totalG += g;
          totalB += b;
          validColors++;
        }
      });
      
      if (validColors === 0) return null;
      
      // Calculate average RGB values
      const avgR = Math.round(totalR / validColors);
      const avgG = Math.round(totalG / validColors);
      const avgB = Math.round(totalB / validColors);
      
      // Return a valid RGB color string
      const mixedColor = `rgb(${avgR}, ${avgG}, ${avgB})`;
      return mixedColor;
    }
  
    drawColors() {
      const verticalSpacing = 100;
      const potHeight = 80; // Height of each pot visualization
      const y = 20 + ((this.id - 1) * (verticalSpacing + potHeight));
      
      // Draw pot label
      this.ctx.fillStyle = '#000';
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`Pot #${this.id}:`, 10, y + 25);
      
      // Draw a background rectangle for the pot
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(50, y, 300, potHeight);
      this.ctx.strokeStyle = '#000';
      this.ctx.strokeRect(50, y, 300, potHeight);
      
      // If there's only one ingredient, draw it
      if (this.ingredients.length === 1) {
        const ingredient = this.ingredients[0];
        const x = 50;
        const size = potHeight;
        
        this.drawIngredient(this.ctx, ingredient, x, y, size);
      }
      // If there are multiple ingredients, draw both individual ingredients and mixed color
      else if (this.ingredients.length > 1) {
        // Calculate the size for individual ingredients based on the number of ingredients
        const numIngredients = this.ingredients.length;
        const ingredientSize = Math.min(potHeight, 300 / (numIngredients + 1)); // +1 for the mixed color
        
        // Draw individual ingredients
        this.ingredients.forEach((ingredient, index) => {
          const x = 50 + (index * (ingredientSize + 5)); // Add 5px spacing between ingredients
          const size = ingredientSize;
          
          this.drawIngredient(this.ctx, ingredient, x, y + (potHeight - size) / 2, size);
        });
        
        // Draw the mixed color
        const mixedColor = this.calculateMixedColor();
        if (mixedColor) {
          const x = 50 + (numIngredients * (ingredientSize + 5)) + 10; // Position after individual colors with spacing
          const size = ingredientSize;
          
          // Draw an arrow
          this.ctx.beginPath();
          this.ctx.moveTo(x - 10, y + potHeight/2);
          this.ctx.lineTo(x + 10, y + potHeight/2);
          this.ctx.strokeStyle = '#000';
          this.ctx.stroke();
          
          // Draw the mixed color
          this.ctx.fillStyle = mixedColor;
          this.ctx.fillRect(x + 20, y + (potHeight - size) / 2, size, size);
          this.ctx.strokeStyle = '#000';
          this.ctx.strokeRect(x + 20, y + (potHeight - size) / 2, size, size);
          
          // Add labels
          this.ctx.fillStyle = '#000';
          this.ctx.font = '12px Arial';
          this.ctx.fillText('Ingrediënten', 50, y - 5);
          this.ctx.fillText('Gemengd resultaat', x + 20, y - 5);
        }
      }
    }
  
    drawIngredient(ctx, ingredient, x, y, size) {      
      ctx.save();
      
      // Draw the shape
      ctx.fillStyle = ingredient.color;
      switch(ingredient.shape) {
        case 'grain':
          // Ronde korrel
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'rough':
          // Ruwe, onregelmatige vorm (hexagonaal)
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.lineTo(x + size, y + size/4);
          ctx.lineTo(x + size, y + 3*size/4);
          ctx.lineTo(x + size/2, y + size);
          ctx.lineTo(x, y + 3*size/4);
          ctx.lineTo(x, y + size/4);
          ctx.closePath();
          ctx.fill();
          break;
        case 'slimy':
          // Druppelachtige vorm
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.quadraticCurveTo(x + size, y + size/2, x + size/2, y + size);
          ctx.quadraticCurveTo(x, y + size/2, x + size/2, y);
          ctx.fill();
          break;
        case 'ovale':
          // Ovale vorm
            ctx.beginPath();
            ctx.ellipse(x + size / 2, y + size / 2, size / 2, size / 3, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
      }
      
      // Apply pattern
      ctx.globalCompositeOperation = 'destination-out';
      switch(ingredient.pattern) {
        case 'wave':
          // gegolfd
          ctx.beginPath();
          for(let i = 0; i < size; i += 2) {
            const waveY = y + size/2 + Math.sin(i * 0.2) * (size/4);
            if (i === 0) {
              ctx.moveTo(x + i, waveY);
            } else {
              ctx.lineTo(x + i, waveY);
            }
          }
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
        case 'striped':
          // Gestreept
          for(let i = 0; i < size; i += 6) {
            ctx.fillRect(x + i, y, 3, size);
          }
          break;
        case 'dotted':
          // gestipt
          for(let i = x + size/4; i < x + 3*size/4; i += 10) {
            for(let j = y + size/4; j < y + 3*size/4; j += 10) {
              ctx.beginPath();
              ctx.arc(i, j, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
      }
      
      ctx.restore();
      
      // Draw border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, size, size);
      
      // Draw speed and time text
      ctx.font = '10px Arial';
      ctx.fillStyle = '#000';
      
      // Display speed and processing time
      const speedText = ingredient.speed;
      let timeText = '';
      
      // Set processing time based on speed
      if (ingredient.speed === 'easy') {
        timeText = '2s';
      } else if (ingredient.speed === 'medium') {
        timeText = '7s';
      } else if (ingredient.speed === 'hard') {
        timeText = '15s';
      }
      
      // Draw speed and time text
      ctx.fillText(`${speedText} (${timeText})`, x, y + size + 15);
    }
  
    static drawAllPots() {
      // Get the canvas and its container
      const canvas = document.getElementById("visual-canvas");
      const ctx = canvas.getContext("2d");
      
      // Calculate required canvas height based on number of pots
      const verticalSpacing = 100;
      const potHeight = 80;
      const numPots = AppState.pots.length;
      const requiredHeight = Math.max(
        300, // Minimum height
        (numPots * (verticalSpacing + potHeight)) + 40 // Dynamic height based on pots
      );
      
      // Set canvas dimensions
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = requiredHeight;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw all pots
      AppState.pots.forEach(pot => pot.drawColors());
    }
  
    render() {
      const pot = document.createElement("div");
      pot.classList.add("bg-gray-300", "p-4", "rounded", "min-h-[100px]", "shadow");
      pot.id = `pot-${this.id}`;
      pot.textContent = `Pot #${this.id}`;
      
      pot.draggable = true;
      pot.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", `pot-${this.id}`);
      });
      
      pot.addEventListener("dragover", (e) => e.preventDefault());
      
      pot.addEventListener("drop", (e) => {
        e.preventDefault();
        const ingredientId = e.dataTransfer.getData("text/plain");
        
        if (!ingredientId.startsWith('ingredient-')) return;
        
        const el = document.getElementById(ingredientId);
        const speed = el.dataset.speed;
        const structure = el.querySelector('span').textContent.split(' ')[0];
        const ing = {
          id: ingredientId,
          speed,
          color: el.style.backgroundColor,
          structure: structure,
          minTime: 1000
        };
  
        const ingredient = new Pot.prototype._ingredientClass(ing);
  
        if (this.addIngredient(ingredient)) {
          pot.appendChild(el);
          Pot.drawAllPots();
        } else {
          alert("Ingrediënt heeft een andere snelheid dan de rest in deze pot.");
        }
      });
  
      // Voeg de drag-and-drop logica toe voor gemengde kleuren.
      if (this.processed) {
        const mixedColor = this.calculateMixedColor();
        if (mixedColor) {
          const colorLabel = document.createElement("div");
          colorLabel.classList.add("mt-2", "p-2", "rounded", "text-white", "text-center", "font-bold");
          colorLabel.style.backgroundColor = mixedColor;
          colorLabel.textContent = "Gemengd resultaat";
          colorLabel.draggable = true;
  
          colorLabel.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', `mixed-color:${mixedColor}`);
          });
  
          pot.appendChild(colorLabel);
        }
      }
    
      return pot;
    }    
  }
  