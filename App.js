const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const searchInput = document.getElementById('searchInput');
const errorMessage = document.getElementById('errorMessage');
const weatherContainer = document.getElementById('weatherContainer');

const API_KEY = 'YOUR_API_KEY';

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if(city) {
        getWeatherByCity(city);
    }
});

locationBtn.addEventListener('click', () => {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
            () => showError('Location access denied')
        );
    } else {
        showError('Geolocation not supported');
    }
});

async function getWeatherByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if(!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
    } catch(error) {
        showError(error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);
    } catch(error) {
        showError(error.message);
    }
}

function displayWeather(data) {
    errorMessage.style.display = 'none';
    document.getElementById('cityName').innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>`;
    document.getElementById('temperature').innerHTML = `<h1>${Math.round(data.main.temp)}°C</h1>`;
    document.getElementById('weatherDescription').innerHTML = `<p>${data.weather[0].description}</p>`;
}

function showError(msg) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = msg;
              }
