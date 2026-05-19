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
  document.getElementById('weatherCard').style.display = 'none';

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    const data = await response.json();

    if (data.cod === 200) {
      document.getElementById('cityName').textContent = data.name + ', ' + data.sys.country;
      document.getElementById('temp').textContent = Math.round(data.main.temp) + '°C';
      document.getElementById('desc').textContent = data.weather[0].description;
      document.getElementById('humidity').textContent = data.main.humidity + '%';
      document.getElementById('wind').textContent = data.wind.speed + ' km/h';
      document.getElementById('pressure').textContent = data.main.pressure + ' hPa';
      document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like) + '°C';
      document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

      document.getElementById('loading').style.display = 'none';
      document.getElementById('weatherCard').style.display = 'block';
    } else {
      alert('City not found!');
      document.getElementById('loading').style.display = 'none';
    }
  } catch (error) {
    alert('Error fetching weather data');
    document.getElementById('loading').style.display = 'none';
  }
      }
