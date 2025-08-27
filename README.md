# Weather Now App

## Overview
This is a simple web app built for Jamie, an outdoor enthusiast, to quickly check current weather conditions for any city. Enter a city name, and it displays temperature, weather description, and wind speed. Built with React and Tailwind CSS, using Open-Meteo APIs for geocoding and weather data.

## Features
- Search by city name.
- Displays current temperature, weather condition, and wind speed.
- Responsive design for desktop and mobile.
- Error handling for invalid cities or network issues.

## Technologies
- React (state management with useState).
- Tailwind CSS for styling.
- Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
- Open-Meteo Weather API: https://api.open-meteo.com/v1/forecast

## How to Run
1. Clone the repo or copy files.
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.
4. Open http://localhost:5174.

## Deployment
- Deployed on StackBlitz/CodeSandbox for quick hosting (paste files into a new React sandbox).
- For production: `npm run build` and host on Vercel/Netlify.

## Notes
- No additional features added to keep it core-focused, but could extend with forecasts or units toggle.
- Tested for basic functionality; handles empty inputs gracefully.
- Code is commented for readability.

Good luck with the submission!