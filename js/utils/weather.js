export async function fetchWeather(city) {
    const key = "YOUR_API_KEY";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`;
  
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }
  
  export function calculateTimeFactor(weather) {
    const temp = weather.main.temp;
    const desc = weather.weather[0].main.toLowerCase();
  
    if (desc.includes("rain") || desc.includes("snow")) return 1.1;
    if (temp < 10) return 1.15;
    return 1;
  }
  