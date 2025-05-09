<template>
  <div>
    <h2 class="text-2xl font-semibold text-white mb-6">Weather History</h2>

    <!-- Filters -->
    <div class="bg-white rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            v-model="filters.location"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            v-model="filters.fromDate"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            v-model="filters.toDate"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :max="maxToDate"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="fetchHistory"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          :disabled="loading"
        >
          <RefreshCw v-if="loading" class="animate-spin h-4 w-4 mr-2" />
          <Search v-else class="h-4 w-4 mr-2" />
          Apply Filters
        </button>
      </div>

      <div v-if="dateRangeError" class="mt-2 text-red-600 text-sm">
        {{ dateRangeError }}
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-lg overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Loading history data...</p>
      </div>

      <div v-else-if="error" class="p-6 text-red-600">
        {{ error }}
      </div>

      <div v-else-if="historyData && historyData.length > 0">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wind Speed</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(record, index) in historyData" :key="index" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(record.date) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.location }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ Math.round(record.temperature) }}°C
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  <div class="flex items-center">
                    <component :is="getWeatherIcon(record.weatherIcon)" class="h-5 w-5 mr-2 text-gray-600" />
                    {{ record.weatherDescription }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.humidity }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ record.windSpeed }} m/s
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="p-8 text-center text-gray-600">
        No history data found. Try changing your filters.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import gql from 'graphql-tag';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Cloudy, CloudDrizzle, RefreshCw, Search } from 'lucide-vue-next';

const locations = ['Delhi', 'Moscow', 'Paris', 'New York', 'Sydney', 'Riyadh'];
const historyData = ref([]);
const loading = ref(false);
const error = ref('');
const dateRangeError = ref('');

const filters = ref({
  location: '',
  fromDate: format(addDays(new Date(), -7), 'yyyy-MM-dd'),
  toDate: format(new Date(), 'yyyy-MM-dd')
});

const GET_HISTORY = gql`
  query GetWeatherHistory($location: String, $fromDate: String!, $toDate: String!) {
    getWeatherHistory(location: $location, fromDate: $fromDate, toDate: $toDate) {
      id
      location
      date
      temperature
      weatherDescription
      weatherIcon
      humidity
      windSpeed
    }
  }
`;

const maxToDate = computed(() => {
  return format(new Date(), 'yyyy-MM-dd');
});

watch([() => filters.value.fromDate, () => filters.value.toDate], ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate) {
    const fromDate = parseISO(newFromDate);
    const toDate = parseISO(newToDate);
    
    if (differenceInDays(toDate, fromDate) > 30) {
      dateRangeError.value = 'Date range cannot exceed 30 days';
    } else {
      dateRangeError.value = '';
    }
  }
});

function formatDate(dateString) {
  return format(new Date(dateString), 'MMM d, yyyy');
}

function getWeatherIcon(iconCode) {
  const icons = {
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
    '50n': Cloud
  };
  
  return icons[iconCode] || Cloud;
}

async function fetchHistory() {
  // Validate date range
  if (filters.value.fromDate && filters.value.toDate) {
    const fromDate = parseISO(filters.value.fromDate);
    const toDate = parseISO(filters.value.toDate);
    
    if (differenceInDays(toDate, fromDate) > 30) {
      dateRangeError.value = 'Date range cannot exceed 30 days';
      return;
    }
    
    dateRangeError.value = '';
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: GET_HISTORY.loc.source.body,
        variables: {
          location: filters.value.location || null,
          fromDate: filters.value.fromDate,
          toDate: filters.value.toDate
        }
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    historyData.value = result.data.getWeatherHistory;
  } catch (err) {
    console.error('Error fetching history data:', err);
    error.value = 'Failed to fetch history data. Please try again.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchHistory();
});
</script>