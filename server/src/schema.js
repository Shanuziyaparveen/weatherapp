export const typeDefs = `#graphql
  type Weather {
    id: ID
    location: String!
    country: String
    current: WeatherCurrent!
    hourly: [WeatherHourly!]!
  }

  type WeatherCurrent {
    temp: Float!
    feels_like: Float!
    humidity: Int!
    pressure: Int!
    wind_speed: Float!
    uvi: Float
    sunset: Int!
    weather: [WeatherCondition!]!
  }

  type WeatherHourly {
    dt: Int!
    temp: Float!
    weather: [WeatherCondition!]!
  }

  type WeatherCondition {
    id: Int
    main: String
    description: String
    icon: String
  }

  type WeatherHistory {
    id: ID!
    location: String!
    date: String!
    temperature: Float!
    weatherDescription: String!
    weatherIcon: String!
    humidity: Int!
    windSpeed: Float!
  }

  type SaveResult {
    id: ID!
  }

  type Query {
    getWeather(location: String!): Weather
    getWeatherHistory(location: String, fromDate: String!, toDate: String!): [WeatherHistory!]!
  }

  type Mutation {
    saveWeather(location: String!): SaveResult
  }
`;