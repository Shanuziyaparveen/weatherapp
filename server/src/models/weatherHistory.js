import mongoose from 'mongoose';

const weatherHistorySchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  temperature: {
    type: Number,
    required: true
  },
  weatherDescription: {
    type: String,
    required: true
  },
  weatherIcon: {
    type: String,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  windSpeed: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const WeatherHistory = mongoose.model('WeatherHistory', weatherHistorySchema);

export default WeatherHistory;