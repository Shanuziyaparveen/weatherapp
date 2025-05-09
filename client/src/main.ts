import { createApp, provide, h } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import App from './App.vue';
import './index.css';

// Import routes
import HomeView from './views/HomeView.vue';
import HistoryView from './views/HistoryView.vue';

// Create Apollo Client
const httpLink = createHttpLink({
  uri: '/graphql',
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/history', component: HistoryView },
  ],
});

// Create and mount the app
const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.use(router);
app.mount('#root');