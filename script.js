const API_KEY = "c8a4bc4d3c964a22098e0e4f979f0a9a";

// Dark/Light mode ka button
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

// Search button aur Enter key
document.getElementById('searchBtn').addEventListener('click', () => getWeather(document.getElementById('cityInput').value));
document.getElementById('locationBtn').addEventListener('click', getWeatherByLocation);
document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') getWeather(document.getElementById('cityInput').value);
});

// Location se mausam nikalna
function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert('Tumhara browser location support nahi karta');
    return;
  }

  document.getElementById('loading').style.display = 'block';
  document.getElementById('weatherWrapper').style.display = 'none';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert('Location nahi mil saki. Permission allow karo aur dobara try karo.');
      document.getElementById('loading').style.display = 'none';
    }
  );
}

// Sheher ke naam se mausam
async function getWeather(city) {
  if (!city) return alert('Pehlay sheher ka naam likho');
  document.getElementById('loading').style.display = 'block';
  document.getElementById('weatherWrapper').style.display = 'none';

  try {
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const currentData = await currentRes.json();

    if (currentData.cod!== 200) {
      alert('Sheher nahi mila!');
      document.getElementById('loading').style.display = 'none';
      return;
    }
    displayWeather(currentData);
  } catch (error) {
    alert('Mausam ka data lane me error aayi');
    document.getElementById('loading').style.display = 'none';
  }
}

// Latitude/Longitude se mausam
async function getWeatherByCoords(lat, lon) {
  try {
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const currentData = await currentRes.json();
    displayWeather(currentData);
  } catch (error) {
    alert('Mausam ka data lane me error aayi');
    document.getElementById('loading').style.display = 'none';
  }
}

// Data ko screen par dikhana
async function displayWeather(currentData) {
  const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${API_KEY}&units=metric`);
  const forecastData = await forecastRes.json();

  document.getElementById('cityName').textContent = currentData.name + ', ' + currentData.sys.country;
  document.getElementById('temp').textContent = Math.round(currentData.main.temp) + '°C';
  document.getElementById('desc').textContent = currentData.weather[0].description;
  document.getElementById('humidity').textContent = currentData.main.humidity + '%';
  document.getElementById('wind').textContent = currentData.wind.speed + ' km/h';
  document.getElementById('pressure').textContent = currentData.main.pressure + ' hPa';
  document.getElementById('feelsLike').textContent = Math.round(currentData.main.feels_like) + '°C';
  document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@4x.png`;

  // Hourly forecast
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

  // 5 din ka forecast
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
    }
