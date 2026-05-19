const API_KEY = "c8a4bc4d3c964a22098e0e4f979f0a9a";

async function getWeather() {
  const city = document.getElementById('city').value.trim();
  const resultDiv = document.getElementById('result');

  if (!city) {
    alert("Please enter a city name");
    return;
  }

  resultDiv.innerHTML = "Loading...";
  resultDiv.classList.remove("hide");

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    const icon = getWeatherIcon(data.weather[0].main);

    resultDiv.innerHTML = `
      <div class="weather-icon">${icon}</div>
      <h2>${data.name}, ${data.sys.country}</h2>
      <h1>${Math.round(data.main.temp)}°C</h1>
      <p><b>${data.weather[0].description}</b></p>
      <p>💧 Humidity: ${data.main.humidity}%</p>
      <p>💨 Wind: ${data.wind.speed} m/s</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

function getWeatherIcon(condition) {
  switch(condition.toLowerCase()) {
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    case 'rain': return '🌧️';
    case 'thunderstorm': return '⛈️';
    case 'snow': return '❄️';
    case 'mist':
    case 'fog': return '🌫️';
    default: return '🌤️';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const btn = document.getElementById('themeBtn');
  btn.textContent = document.body.classList.contains('dark')? '☀️ Light' : '🌙 Dark';
}