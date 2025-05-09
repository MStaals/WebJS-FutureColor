// Export both functions
export { createGrid, showTriadicPopup };

function createGrid(size = 6, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Set up container styles
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${size}, 48px)`;
    container.style.gridTemplateRows = `repeat(${size}, 48px)`;
    container.style.gap = '2px';
    container.style.width = 'max-content';
    container.style.padding = '4px';
    container.style.backgroundColor = '#f3f4f6';
    container.style.borderRadius = '4px';
  
    for (let i = 0; i < size * size; i++) {
      const squareContainer = document.createElement('div');
      squareContainer.style.display = 'flex';
      squareContainer.style.flexDirection = 'column';
      squareContainer.style.alignItems = 'center';
      
      const square = document.createElement('div');
      square.className = 'bg-gray-200 border cursor-pointer relative group';
      square.style.width = '48px';
      square.style.height = '48px';
      
      const label = document.createElement('div');
      label.style.fontSize = '10px';
      label.style.marginTop = '2px';
      label.style.textAlign = 'center';
      label.style.width = '48px';
      label.textContent = `Box ${i + 1}`;
      
      squareContainer.appendChild(square);
      squareContainer.appendChild(label);
      
      // Make squares droppable
      square.addEventListener('dragover', (e) => {
        e.preventDefault();
        square.classList.add('border-2', 'border-blue-500');
      });
      
      square.addEventListener('dragleave', () => {
        square.classList.remove('border-2', 'border-blue-500');
      });
      
      square.addEventListener('drop', (e) => {
        e.preventDefault();
        square.classList.remove('border-2', 'border-blue-500');
        
        const data = e.dataTransfer.getData('text/plain');
        if (data.startsWith('mixed-color:')) {
          const color = data.split(':')[1];
          square.style.backgroundColor = color;
          
          // Update label color with triadic scheme
          const { h, s, l } = rgbToHsl(color);
          const triadic1 = `hsl(${(h + 120) % 360}, ${s}%, ${l}%)`;
          const triadic2 = `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`;
          
          // Alternate between triadic colors for the text
          label.style.color = (i % 2 === 0) ? triadic1 : triadic2;
          
          // Show triadic popup immediately after dropping a color
          showTriadicPopup(color);
        }
      });
      
      // Click handler for triadic color scheme
      square.addEventListener('click', (e) => {
        const backgroundColor = square.style.backgroundColor;
        if (!backgroundColor || backgroundColor === 'rgb(229, 231, 235)') return;
        
        // Create a semi-transparent overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-40';
        document.body.appendChild(overlay);
        
        showTriadicPopup(backgroundColor);
        
        // Remove overlay when popup is closed
        const popup = document.getElementById('triadic-popup');
        if (popup) {
            popup.addEventListener('remove', () => {
                overlay.remove();
            });
        }
        
        e.stopPropagation();
      });
      
      container.appendChild(squareContainer);
    }
}

// Helper function to convert RGB to HSL
function rgbToHsl(color) {
    const temp = document.createElement('div');
    temp.style.backgroundColor = color;
    document.body.appendChild(temp);
    const computedColor = window.getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);
    
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return { h: 0, s: 0, l: 0 };
    
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    
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
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    return { h, s, l };
}

function showTriadicPopup(color) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('triadic-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.id = 'triadic-popup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '24px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '9999';
    popup.style.width = '600px';
    popup.style.maxWidth = '90vw';
    popup.style.maxHeight = '90vh';
    popup.style.overflowY = 'auto';
    
    // Parse the color to HSL
    const temp = document.createElement('div');
    temp.style.backgroundColor = color;
    document.body.appendChild(temp);
    const computedColor = window.getComputedStyle(temp).backgroundColor;
    document.body.removeChild(temp);
    
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!rgbMatch) return;
    
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    
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
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    // Calculate triadic colors (120° apart)
    const triadic1 = `hsl(${(h + 120) % 360}, ${s}%, ${l}%)`;
    const triadic2 = `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`;
    
    // Convert HSL colors to RGB for display
    function hslToRgb(hsl) {
        const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) return '';
        
        const h = parseInt(match[1]);
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c/2;
        let r = 0, g = 0, b = 0;
        
        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Create popup content with both HSL and RGB values
    popup.innerHTML = `
        <div class="text-center mb-4">
            <h3 class="text-xl font-bold mb-4">Triadic Color Scheme</h3>
            <div class="flex justify-center mb-6">
                <div class="relative w-48 h-48">
                    <!-- Color wheel background -->
                    <div class="absolute inset-0 rounded-full" style="background: conic-gradient(
                        from 0deg,
                        hsl(0, 100%, 50%),
                        hsl(60, 100%, 50%),
                        hsl(120, 100%, 50%),
                        hsl(180, 100%, 50%),
                        hsl(240, 100%, 50%),
                        hsl(300, 100%, 50%),
                        hsl(360, 100%, 50%)
                    );"></div>
                    
                    <!-- Lines connecting triadic colors -->
                    <svg class="absolute inset-0" viewBox="0 0 100 100" style="transform: rotate(${h}deg)">
                        <path d="M50,50 L50,10 M50,50 L93.3,70 M50,50 L6.7,70" 
                              stroke="white" 
                              stroke-width="2"
                              fill="none"/>
                        <!-- Color dots -->
                        <circle cx="50" cy="10" r="4" fill="${color}"/>
                        <circle cx="93.3" cy="70" r="4" fill="${triadic1}"/>
                        <circle cx="6.7" cy="70" r="4" fill="${triadic2}"/>
                    </svg>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="w-32 h-32 mx-auto mb-3 rounded-lg shadow-md" style="background-color: ${color}"></div>
                    <p class="text-lg font-semibold mb-1">Originele Kleur</p>
                    <p class="text-sm text-gray-600 mb-1">RGB: ${computedColor}</p>
                    <p class="text-sm text-gray-600">HSL: hsl(${h}, ${s}%, ${l}%)</p>
                </div>
                <div class="text-center">
                    <div class="w-32 h-32 mx-auto mb-3 rounded-lg shadow-md" style="background-color: ${triadic1}"></div>
                    <p class="text-lg font-semibold mb-1">Triadic 1</p>
                    <p class="text-sm text-gray-600 mb-1">RGB: ${hslToRgb(triadic1)}</p>
                    <p class="text-sm text-gray-600">HSL: ${triadic1}</p>
                </div>
                <div class="text-center">
                    <div class="w-32 h-32 mx-auto mb-3 rounded-lg shadow-md" style="background-color: ${triadic2}"></div>
                    <p class="text-lg font-semibold mb-1">Triadic 2</p>
                    <p class="text-sm text-gray-600 mb-1">RGB: ${hslToRgb(triadic2)}</p>
                    <p class="text-sm text-gray-600">HSL: ${triadic2}</p>
                </div>
            </div>
            <p class="mt-4 text-sm text-gray-500">Triadic kleuren liggen 120° uit elkaar op de kleurencirkel</p>
        </div>
        <button class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none" onclick="this.parentElement.remove()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    document.body.appendChild(popup);
    
    // Add click outside to close
    document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
        }
    });
}
  