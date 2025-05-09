<template>
  <div>
    <div class="mb-6 flex flex-col md:flex-row md:justify-between md:items-center">
      <h2 class="text-2xl font-semibold text-white mb-4 md:mb-0">Current Weather</h2>
      <div class="bg-white bg-opacity-20 rounded-lg p-2 flex">
        <select
          v-model="selectedLocation"
          class="bg-transparent text-white p-2 border-none outline-none"
          @change="fetchWeather"
        >
          <option v-for="location in locations" :key="location" :value="location" class="text-black">
            {{ location }}
          </option>
        </select>
        <RefreshCw
          class="text-white h-6 w-6 ml-2 cursor-pointer"
          :class="{ 'animate-spin': loading }"
          @click="fetchWeather"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="weatherData" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Main Weather Card -->
      <div class="weather-card col-span-1 lg:row-span-2 flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl text-orange-400">Today</h3>
          <div class="text-sm text-gray-500">{{ formattedDate }}</div>
        </div>
        
        <div class="flex items-center justify-center flex-grow my-6">
          <div class="text-center">
            <div class="flex items-center justify-center mb-2 animated-icon">
              <component :is="getWeatherIcon(weatherData.current.weather[0].icon)" class="h-20 w-20 text-orange-400" />
            </div>
            <div class="flex items-start justify-center">
              <span class="text-8xl font-light text-orange-400">{{ Math.round(weatherData.current.temp) }}</span>
              <span class="text-2xl text-orange-400">°</span>
            </div>
            <div class="text-xl capitalize text-orange-400 mb-2">{{ weatherData.current.weather[0].description }}</div>
            <div class="text-gray-600">{{ weatherData.location }}, {{ weatherData.country }}</div>
          </div>
        </div>
        
        <div class="mt-auto grid grid-cols-2 gap-4 text-sm">
          <div class="text-gray-600">
            Feels like {{ Math.round(weatherData.current.feels_like) }}°
          </div>
          <div class="text-gray-600 text-right">
            Sunset {{ formatTime(weatherData.current.sunset) }}
          </div>
        </div>
      </div>

      <!-- Hourly Forecast Card -->
      <div class="weather-card col-span-1">
        <h3 class="text-xl text-gray-700 mb-4">Hourly Forecast</h3>
        <div class="grid grid-cols-5 gap-2">
          <div v-for="(hour, index) in weatherData.hourly.slice(0, 5)" :key="index" class="text-center">
            <div class="text-gray-600 mb-1">{{ formatHour(hour.dt) }}</div>
            <component :is="getWeatherIcon(hour.weather[0].icon)" class="h-6 w-6 mx-auto text-gray-600" />
            <div class="text-gray-700 font-medium">{{ Math.round(hour.temp) }}°</div>
          </div>
        </div>
      </div>

      <!-- Additional Info Card -->
      <div class="weather-card col-span-1">
        <h3 class="text-xl text-gray-700 mb-4">Details</h3>
        <div class="grid grid-cols-2 gap-y-4">
          <div>
            <div class="text-gray-500 text-sm">Humidity</div>
            <div class="text-gray-700 font-medium">{{ weatherData.current.humidity }}%</div>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Wind</div>
            <div class="text-gray-700 font-medium">{{ Math.round(weatherData.current.wind_speed) }} m/s</div>
          </div>
          <div>
            <div class="text-gray-500 text-sm">Pressure</div>
            <div class="text-gray-700 font-medium">{{ weatherData.current.pressure }} hPa</div>
          </div>
          <div>
            <div class="text-gray-500 text-sm">UV Index</div>
            <div class="text-gray-700 font-medium">{{ Math.round(weatherData.current.uvi) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-white p-8">
      <p>Select a location to view weather information</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { format, fromUnixTime } from 'date-fns';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Cloudy, CloudDrizzle, RefreshCw } from 'lucide-vue-next';

const locations = ['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh'];
const selectedLocation = ref(locations[0]);
interface WeatherData {
  location: string;
  country: string;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    uvi: number;
    sunset: number;
    weather: {
      icon: string;
      description: string;
    }[];
  };
  hourly: {
    dt: number;
    temp: number;
    weather: {
      icon: string;
      description: string;
    }[];
  }[];
}

const weatherData = ref<WeatherData | null>(null);
const loading = ref(false);
const error = ref('');

const GET_WEATHER = gql`
  query GetWeather($location: String!) {
    getWeather(location: $location) {
      location
      country
      current {
        temp
        feels_like
        humidity
        pressure
        wind_speed
        uvi
        sunset
        weather {
          icon
          description
        }
      }
      hourly {
        dt
        temp
        weather {
          icon
          description
        }
      }
    }
  }
`;

const SAVE_WEATHER = gql`
  mutation SaveWeather($location: String!) {
    saveWeather(location: $location) {
      id
    }
  }
`;

const { mutate: saveWeather } = useMutation(SAVE_WEATHER);

const formattedDate = computed(() => {
  return format(new Date(), 'd MMM yyyy');
});
function getWeatherIcon(iconCode: string | number) {
  const icons: Record<string, any> = {
    '01d': Sun,
    '01n': Sun,
    '02d': Cloudy,
    '02n': Cloudy,
    '03d': Cloud,
    '03n': Cloud,
    '04d': Cloud,
    '04n': Cloud,
    '09d': CloudDrizzle,
    '09n': CloudDrizzle,
    '10d': CloudRain,
    '10n': CloudRain,
    '11d': CloudLightning,
    '11n': CloudLightning,
    '13d': CloudSnow,
    '13n': CloudSnow,
    '50d': Cloud,
    '50n': Cloud,
  };

  return icons[String(iconCode)] || Cloud;
}
function formatTime(timestamp: number): string {
  return format(fromUnixTime(timestamp), 'HH:mm');
}

function formatHour(timestamp: number): string {
  return format(fromUnixTime(timestamp), 'h a');
}


async function fetchWeather() {
  if (!selectedLocation.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {const RAW_GET_WEATHER_QUERY = `
  query GetWeather($location: String!) {
    getWeather(location: $location) {
      location
      country
      current {
        temp
        feels_like
        humidity
        pressure
        wind_speed
        uvi
        sunset
        weather {
          icon
          description
        }
      }
      hourly {
        dt
        temp
        weather {
          icon
          description
        }
      }
    }
  }
`;

    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
  query: RAW_GET_WEATHER_QUERY,
  variables: { location: selectedLocation.value }
})

    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    weatherData.value = result.data.getWeather;
    
    // Save weather data to database
    saveWeather({ location: selectedLocation.value });
  } catch (err) {
    console.error('Error fetching weather data:', err);
    error.value = 'Failed to fetch weather data. Please try again.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchWeather();
});
</script>