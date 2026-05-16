const API_KEY = 'c8a4bc4d3c964a22098e0e4f979f0a9a';

// Elements
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const searchInput = document.getElementById('searchInput');
const errorMessage = document.getElementById('errorMessage');
const weatherContainer = document.getElementById('weatherContainer');

// Events
searchBtn.onclick = () => getWeather(searchInput.value.trim());
locationBtn.onclick = getLocation;
searchInput.onkeypress = (e) => e.key === 'Enter' && getWeather(searchInput.value.trim());

// Main function
async function getWeather(city) {
    if (!city) return showError('City name likho');
    
    showLoading();
    
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if (!res.ok) throw new Error('City nahi mili');
        const data = await res.json();
        showWeather(data);
    } catch (err) {
        showError(err.message);
    }
}

// Get location
function getLocation() {
    if (!navigator.geolocation) return showError('Location support nahi hai');
    navigator.geolocation.getCurrentPosition(
        pos => getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        () => showError('Location access denied')
    );
}

// Get weather by coords
async function getWeatherByCoords(lat, lon) {
    showLoading();
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await res.json();
        showWeather(data);
    } catch (err) {
        showError('Error aaya');
    }
}

// Display weather
function showWeather(data) {
    weatherContainer.style.display = 'block';
    errorMessage.style.display = 'none';
    
    document.getElementById('cityName').innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>`;
    document.getElementById('temperature').innerHTML = `<h1>${Math.round(data.main.temp)}°C</h1>`;
    document.getElementById('weatherDescription').innerHTML = `<p>${data.weather[0].description}</p>`;
    document.getElementById('feelsLike').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
    document.getElementById('pressure').
