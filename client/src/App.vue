<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <header class="flex flex-col md:flex-row justify-between items-center mb-8">
        <div class="flex items-center mb-4 md:mb-0">
          <CloudSun class="text-white h-10 w-10 mr-2" />
          <h1 class="text-3xl font-bold text-white">Weather App</h1>
        </div>
        <nav>
          <router-link
            to="/"
            class="mr-4 px-4 py-2 text-white hover:bg-blue-500 rounded-md transition-colors"
            :class="{ 'bg-blue-500': $route.path === '/' }"
          >
            Current Weather
          </router-link>
          <router-link
            to="/history"
            class="px-4 py-2 text-white hover:bg-blue-500 rounded-md transition-colors"
            :class="{ 'bg-blue-500': $route.path === '/history' }"
          >
            History
          </router-link>
        </nav>
      </header>
      <main>
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloudSun } from 'lucide-vue-next';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
}
</style>