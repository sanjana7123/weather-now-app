import { useState, useEffect } from 'react';

// Weather code mappings from WMO standards
const weatherCodes = {
  0: { description: 'Clear Sky', icon: '☀️', gradient: 'from-yellow-400 to-orange-500', animation: 'animate-pulse' },
  1: { description: 'Mainly Clear', icon: '🌤️', gradient: 'from-blue-300 to-blue-500', animation: 'animate-pulse' },
  2: { description: 'Partly Cloudy', icon: '⛅', gradient: 'from-blue-200 to-blue-400', animation: 'animate-pulse' },
  3: { description: 'Overcast', icon: '☁️', gradient: 'from-gray-300 to-gray-500', animation: '' },
  45: { description: 'Foggy', icon: '🌫️', gradient: 'from-gray-200 to-gray-400', animation: 'animate-fadeIn' },
  48: { description: 'Depositing Rime Fog', icon: '🌫️', gradient: 'from-gray-200 to-gray-400', animation: 'animate-fadeIn' },
  51: { description: 'Light Drizzle', icon: '🌦️', gradient: 'from-blue-400 to-gray-300', animation: 'animate-rain' },
  53: { description: 'Moderate Drizzle', icon: '🌧️', gradient: 'from-blue-500 to-gray-400', animation: 'animate-rain' },
  55: { description: 'Dense Drizzle', icon: '🌧️', gradient: 'from-blue-600 to-gray-500', animation: 'animate-rain' },
  56: { description: 'Light Freezing Drizzle', icon: '🌧️❄️', gradient: 'from-blue-300 to-purple-300', animation: 'animate-rain' },
  57: { description: 'Dense Freezing Drizzle', icon: '🌧️❄️', gradient: 'from-blue-400 to-purple-400', animation: 'animate-rain' },
  61: { description: 'Slight Rain', icon: '🌧️', gradient: 'from-blue-500 to-gray-500', animation: 'animate-rain' },
  63: { description: 'Moderate Rain', icon: '🌧️', gradient: 'from-blue-600 to-gray-600', animation: 'animate-rain' },
  65: { description: 'Heavy Rain', icon: '🌧️', gradient: 'from-blue-700 to-gray-700', animation: 'animate-rain' },
  66: { description: 'Light Freezing Rain', icon: '🌧️❄️', gradient: 'from-blue-400 to-purple-400', animation: 'animate-rain' },
  67: { description: 'Heavy Freezing Rain', icon: '🌧️❄️', gradient: 'from-blue-500 to-purple-500', animation: 'animate-rain' },
  71: { description: 'Slight Snow', icon: '❄️', gradient: 'from-blue-100 to-gray-100', animation: 'animate-snow' },
  73: { description: 'Moderate Snow', icon: '❄️', gradient: 'from-blue-200 to-gray-200', animation: 'animate-snow' },
  75: { description: 'Heavy Snow', icon: '❄️', gradient: 'from-blue-300 to-gray-300', animation: 'animate-snow' },
  77: { description: 'Snow Grains', icon: '❄️', gradient: 'from-blue-200 to-gray-200', animation: 'animate-snow' },
  80: { description: 'Slight Rain Showers', icon: '🌦️', gradient: 'from-blue-400 to-gray-400', animation: 'animate-rain' },
  81: { description: 'Moderate Rain Showers', icon: '🌧️', gradient: 'from-blue-500 to-gray-500', animation: 'animate-rain' },
  82: { description: 'Violent Rain Showers', icon: '🌧️', gradient: 'from-blue-700 to-gray-700', animation: 'animate-rain' },
  85: { description: 'Slight Snow Showers', icon: '❄️', gradient: 'from-blue-200 to-gray-200', animation: 'animate-snow' },
  86: { description: 'Heavy Snow Showers', icon: '❄️', gradient: 'from-blue-300 to-gray-300', animation: 'animate-snow' },
  95: { description: 'Thunderstorm', icon: '⛈️', gradient: 'from-purple-600 to-gray-700', animation: 'animate-thunder' },
  96: { description: 'Thunderstorm With Slight Hail', icon: '⛈️', gradient: 'from-purple-700 to-gray-800', animation: 'animate-thunder' },
  99: { description: 'Thunderstorm With Heavy Hail', icon: '⛈️', gradient: 'from-purple-800 to-gray-900', animation: 'animate-thunder' },
};

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentWeatherSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recentWeatherSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearch = async (searchCity = city) => {
    if (!searchCity.trim()) return;
    setError(null);
    setWeather(null);
    setLoading(true);

    try {
      // Use proxy for geocoding - note the /api/ prefix
      const geoRes = await fetch(
        `/api/geocoding/v1/search?name=${encodeURIComponent(searchCity)}&count=1&language=en`
      );
      if (!geoRes.ok) throw new Error('Failed to find location');
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try another location.');
      }
      const { latitude, longitude, name, country, admin1 } = geoData.results[0];

      // Use proxy for weather data - note the /api/ prefix
      const weatherRes = await fetch(
        `/api/forecast/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error('Failed to fetch weather data');
      const weatherData = await weatherRes.json();

      // Store relevant data
      const newWeatherData = {
        city: name,
        region: admin1,
        country,
        temperature: weatherData.current.temperature_2m,
        weatherCode: weatherData.current.weather_code,
        windSpeed: weatherData.current.wind_speed_10m,
        humidity: weatherData.current.relative_humidity_2m,
        isDay: weatherData.current.is_day,
        units: weatherData.current_units,
        hourly: weatherData.hourly,
        daily: weatherData.daily
      };

      setWeather(newWeatherData);
      
      // Add to recent searches (limit to 5)
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item.city !== name);
        return [{ city: name, region: admin1, country, timestamp: Date.now() }, ...filtered].slice(0, 5);
      });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherInfo = (code) => {
    return weatherCodes[code] || { description: 'Unknown', icon: '❓', gradient: 'from-gray-400 to-gray-600', animation: '' };
  };

  const handleRecentSearchClick = (recentCity) => {
    setCity(recentCity);
    handleSearch(recentCity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">WeatherNow</h1>
          <p className="opacity-90">Get accurate weather forecasts for any location</p>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter city name..."
              className="flex-grow border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Loading...
                </>
              ) : (
                <>
                  <span>Search</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((recent, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recent.city)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-full transition duration-200"
                  >
                    {recent.city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Weather Display */}
        {weather && (
          <div className="p-6">
            <div className={`rounded-2xl p-6 mb-6 bg-gradient-to-r ${getWeatherInfo(weather.weatherCode).gradient} text-white shadow-lg`}>
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">{weather.city}</h2>
                  {weather.region && <p className="text-lg opacity-90">{weather.region}, {weather.country}</p>}
                  <p className="text-6xl font-bold mt-2">{weather.temperature}°{weather.units.temperature_2m.slice(-1)}</p>
                  <p className="text-xl mt-1">{getWeatherInfo(weather.weatherCode).description}</p>
                </div>
                <div className="text-8xl mt-4 md:mt-0">
                  <span className={getWeatherInfo(weather.weatherCode).animation}>
                    {getWeatherInfo(weather.weatherCode).icon}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-gray-600">Wind Speed</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{weather.windSpeed} {weather.units.wind_speed_10m}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className="text-gray-600">Humidity</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{weather.humidity}%</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">Time of Day</span>
                </div>
                <p className="text-2xl font-semibold mt-2">{weather.isDay ? 'Day' : 'Night'}</p>
              </div>
            </div>

            {/* Hourly Forecast */}
            {weather.hourly && weather.hourly.time && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">24-Hour Forecast</h3>
                <div className="flex overflow-x-auto pb-4 space-x-4">
                  {weather.hourly.time.slice(0, 24).map((time, index) => (
                    <div key={index} className="flex-shrink-0 w-20 bg-white rounded-lg shadow-sm p-3 text-center">
                      <p className="text-sm text-gray-600">{new Date(time).getHours()}:00</p>
                      <p className="text-2xl my-2">{getWeatherInfo(weather.hourly.weather_code[index]).icon}</p>
                      <p className="font-semibold">{weather.hourly.temperature_2m[index]}°</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-600">
          <p>Powered by Open-Meteo API • Weather data updates automatically</p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes rain {
          0% { background-position: 0% 0%; }
          100% { background-position: 20% 100%; }
        }
        @keyframes snow {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 500px 1000px, 400px 400px; }
        }
        @keyframes thunder {
          0% { opacity: 1; }
          5% { opacity: 0.5; }
          6% { opacity: 1; }
          7% { opacity: 0.3; }
          8% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .animate-rain {
          animation: rain 5s linear infinite;
          background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .animate-snow {
          animation: snow 20s linear infinite;
          background-image: radial-gradient(2px 2px at 40px 60px, rgba(255,255,255,0.8), transparent),
                            radial-gradient(2px 2px at 20px 20px, rgba(255,255,255,0.8), transparent);
          background-size: 100px 100px;
        }
        .animate-thunder {
          animation: thunder 10s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 3s alternate infinite;
        }
      `}</style>
    </div>
  );
}

export default App;