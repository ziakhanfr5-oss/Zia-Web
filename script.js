const API_KEY = "c8a4bc4d3c964a22098e0e4f979f0a9a";

async function getWeather() {
  const city = document.getElementById('city').value.trim();
  const resultDiv = document.getElementById('result');

  if (!city) {
    resultDiv.innerHTML = `<p style="color:red;">Please enter a city name</p>`;
    return;
  }

  resultDiv.innerHTML = "Loading...";

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error("City not found. Check spelling.");
    }
    
    const data = await response.json();
    
    resultDiv.innerHTML = `
      <h3>${data.name}, ${data.sys.country}</h3>
      <p><b>Temperature:</b> ${data.main.temp}°C</p>
      <p><b>Weather:</b> ${data.weather[0].description}</p>
      <p><b>Humidity:</b> ${data.main.humidity}%</p>
      <p><b>Wind:</b> ${data.wind.speed} m/s</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
}