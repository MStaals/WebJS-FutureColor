class WeatherService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    }

    async getCurrentWeather(latitude, longitude) {
        try {
            const response = await fetch(
                `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric&lang=nl`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Weather API error: ${errorData.message || 'Unknown error'}`);
            }

            const data = await response.json();
            return {
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw error;
        }
    }

    async getWeatherForecast(latitude, longitude) {
        try {
            const response = await fetch(
                `${this.baseUrl}/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error('Weather forecast could not be fetched');
            }

            const data = await response.json();
            return data.list.map(item => ({
                date: new Date(item.dt * 1000),
                temperature: item.main.temp,
                feelsLike: item.main.feels_like,
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            }));
        } catch (error) {
            console.error('Error fetching weather forecast:', error);
            throw error;
        }
    }
}

export default WeatherService; 