import fetch from 'node-fetch';
import WeatherHistory from './models/weatherHistory.js';

const OPENWEATHER_API_KEY = 'c92b33f4cf2eb9ac37d61a9dfb560303';

// Helper function to get coordinates for a city
async function getCoordinates(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error(`Location not found: ${city}`);
    }
    
    return {
      lat: data[0].lat,
      lon: data[0].lon,
      country: data[0].country,
    };
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw new Error('Failed to fetch location data');
  }
}

export const resolvers = {
  Query: {
    getWeather: async (_, { location }) => {
      try {
        // Get coordinates for the city
        const { lat, lon, country } = await getCoordinates(location);
        
        // Fetch weather data using coordinates
        const response = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.cod && data.cod !== 200) {
          throw new Error(data.message || 'Failed to fetch weather data');
        }
        
        return {
          location,
          country,
          current: data.current,
          hourly: data.hourly.slice(0, 24), // Limit to 24 hours
        };
      } catch (error) {
        console.error('Error fetching weather:', error);
        throw new Error('Failed to fetch weather data');
      }
    },
    
    getWeatherHistory: async (_, { location, fromDate, toDate }) => {
      try {
        const query = {};
        
        if (location) {
          query.location = location;
        }
        
        if (fromDate && toDate) {
          query.date = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate)
          };
        }
        
        const historyData = await WeatherHistory.find(query)
          .sort({ date: -1 })
          .limit(100);
        
        return historyData;
      } catch (error) {
        console.error('Error fetching weather history:', error);
        throw new Error('Failed to fetch weather history');
      }
    }
  },
  
  Mutation: {
    saveWeather: async (_, { location }) => {
      try {
        // Get weather data
        const { lat, lon } = await getCoordinates(location);
        
        const response = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.cod && data.cod !== 200) {
          throw new Error(data.message || 'Failed to fetch weather data');
        }
        
        // Create new history record
        const weatherData = new WeatherHistory({
          location,
          date: new Date(),
          temperature: data.current.temp,
          weatherDescription: data.current.weather[0].description,
          weatherIcon: data.current.weather[0].icon,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_speed
        });
        
        await weatherData.save();
        
        return { id: weatherData._id };
      } catch (error) {
        console.error('Error saving weather data:', error);
        throw new Error('Failed to save weather data');
      }
    }
  }
};