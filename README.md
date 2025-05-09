# Weather App

A full-stack weather application built with Vue.js, Node.js, GraphQL, and MongoDB.

## Features

- Current weather display with temperature, condition, and visual indicators
- Historical weather data table with location and date range filtering
- Responsive design optimized for mobile and desktop viewing
- GraphQL API with Node.js backend and MongoDB integration
- Real-time weather updates with appropriate weather icons

## Tech Stack

- **Frontend**: Vue.js, Tailwind CSS, Apollo Client
- **Backend**: Node.js, Express, Apollo Server
- **Database**: MongoDB
- **API**: GraphQL
- **External API**: OpenWeatherMap

## Prerequisites

- Node.js and npm
- MongoDB (local or cloud instance)

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=4000
     MONGODB_URI=mongodb://localhost:27017/weatherapp
     OPENWEATHER_API_KEY=c92b33f4cf2eb9ac37d61a9dfb560303
     ```

## Running the Application

To start both the client and server:
```
npm run dev
```

To start only the client:
```
npm run dev:client
```

To start only the server:
```
npm run dev:server
```

## Building for Production

```
npm run build
```

## Project Structure

- `/client` - Vue.js frontend application
- `/server` - Node.js backend application with GraphQL
  - `/src/models` - MongoDB models
  - `/src/resolvers.js` - GraphQL resolvers
  - `/src/schema.js` - GraphQL schema
