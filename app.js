function displayWeather(data) {
    errorMessage.style.display = 'none';
    
    document.getElementById('cityName').innerHTML = `<h2>${data.name}, ${data.sys.country}</h2>`;
    document.getElementById('temperature').innerHTML = `<h1>${Math.round(data.main.temp)}°C</h1>`;
    document.getElementById('weatherDescription').innerHTML = `<p>${data.weather[0].description}</p>`;

    // Added details
    document.getElementById('feelsLike').innerText = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById('wind').innerText = `Wind: ${data.wind.speed} m/s`;
    document.getElementById('pressure').innerText = `Pressure: ${data.main.pressure} hPa`;
}
