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

    if (currentData.cod!== 200) {
      alert('City not found!');
      document.getElementById('loading').style.display = 'none';
      return;
    }

    // 5-day forecast - ye free plan me chalta hai
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
    const forecastData = await forecastRes.json();

    // Display current weather
    document.getElementById('cityName').textContent = currentData.name + ', ' + currentData.sys.country;
    document.getElementById('temp').textContent = Math.round(currentData.main.temp) + '°C';
    document.getElementById('desc').textContent = currentData.weather[0].description;
    document.getElementById('humidity').textContent = currentData.main.humidity + '%';
    document.getElementById('wind').textContent = currentData.wind.speed + ' km/h';
    document.getElementById('pressure').textContent = currentData.main.pressure + ' hPa';
    document.getElementById('feelsLike').textContent = Math.round(currentData.main.feels_like) + '°C';
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png`;

    // Display hourly forecast - 24 hours from 5-day data
    const hourlyHtml = forecastData.list.slice(0, 8).map(item => {
      const time = new Date(item.dt * 1000).getHours() + ':00';
      return `
        <div class="hourly-item">
          <div class="hourly-time">${time}</div>
          <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="">
          <div class="hourly-temp">${Math.round(item.main.temp)}°C</div>
        </div>
      `;
    }).join('');
    document.getElementById('hourlyForecast').innerHTML = hourlyHtml;

    // Display daily forecast - 5 days
    const dailyMap = {};
    forecastData.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) dailyMap[date] = item;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyHtml = Object.values(dailyMap).slice(0, 5).map(day => {
      const dayName = days[new Date(day.dt * 1000).getDay()];
      return `
        <div class="daily-item">
          <div class="daily-day">${dayName}</div>
          <img class="daily-icon" src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
          <div class="daily-temp">${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°C</div>
        </div>
      `;
    }).join('');
    document.getElementById('dailyForecast').innerHTML = dailyHtml;

    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherWrapper').style.display = 'flex';

  } catch (error) {
    alert('Error fetching weather data');
    console.log(error);
    document.getElementById('loading').style.display = 'none';
  }
}
