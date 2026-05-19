const API_KEY = "c8a4bc4d3c964a22098e0e4f979f0a9a";

document.getElementById('themeBtn').addEventListener('click', () => {
  const body = document.body;
  const btn = document.getElementById('themeBtn');
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    btn.textContent = '🌙 Dark';
  } else {
    body.setAttribute('data-theme', 'dark');
    btn.textContent = '☀️ Light';
  }
});

document.getElementById('searchBtn').addEventListener('click', getWeather);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeather();
});

async function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) return alert('Please enter a city name');

  document.getElementById('loading').style.display = 'block';
  document.getElementById('weatherWrapper').style.display = 'none';

  try {
    // Current weather
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const currentData = await currentRes.json();
    
    if (currentData.cod !== 200) {
      alert('City not found!');
      document.getElementById('loading').style.display = 'none';
      return;
    }

    // One Call API for hourly and daily
    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&appid=${API_KEY}&units=metric`);
    const forecastData = await forecastRes.json();

    // Display current weather
    document.getElementBy
