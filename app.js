const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const searchInput = document.getElementById('searchInput');
const errorMessage = document.getElementById('errorMessage');
const weatherContainer = document.getElementById('weatherContainer');

// Tumhari API Key
const API_KEY = 'c8a4bc4d3c964a22098e0e4f979f0a9a';

// Search button click
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if(city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
});

// Enter key press
searchInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        const city = searchInput.value.trim();
        if(city) getWeatherByCity(city);
    }
});

// Location button click
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

// Get weather by city name
async function getWeatherByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=en`);
        if(!response.ok) throw new Error('City not found');
        const data = await response.json();
        displayWeather(data);
    } catch(error) {
        showError(error.message);
    }
}

// Get weather by coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`);
        if(!response.ok) throw new Error('Location not found');
        const data = await response.json();
        displayWeather(data);
    } catch(error) {
        showError(error.message);
    }
}

// Display all weather details
function displayWeather(data) {
    weatherContainer.style.display = 'block';
    errorMessage.style.display = 'none';
    
    // Main details
    document.getElementById('cityName').innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>`;
    document.getElementById('temperature').innerHTML = `<h1>${Math.round(data.main.temp)}°C</h1>`;
    document.getElementById('weatherDescription').innerHTML = `<p>${data.weather[0].description}</p>`;
    
    // Additional details
    document.getElementById('feelsLike').innerText = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').innerText = `Wind: ${data.wind.speed} m/s`;
    document.getElementById('pressure').innerText = `Pressure: ${data.main.pressure} hPa`;
}

// Show error message
function showError(msg) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = msg;
    weatherContainer.style.display = 'none';
}
