const apiKey = "8d14752e475d4669568e9efd5708b5f2";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");

async function checkWeather(city) {
    try {
        const response = await fetch(
            `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        showError();
    }
}

function updateUI(data) {
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = Math.round(data.wind.speed) + " km/h";

    // Update weather icon based on condition
    const weatherCondition = data.weather[0].main.toLowerCase();
    const validConditions = ["clouds", "clear", "rain", "drizzle", "mist"];
    
    if (validConditions.includes(weatherCondition)) {
        weatherIcon.src = `images/${weatherCondition}.png`;
    } else {
        weatherIcon.src = "images/clear.png"; // Default fallback
    }

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}

function showError() {
    document.querySelector(".weather").style.display = "none";
    document.querySelector(".error").style.display = "block";
}

// Event Listeners
searchBtn.addEventListener("click", () => {
    const city = searchBox.value.trim();
    if (city) {
        checkWeather(city);
    }
});

searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const city = searchBox.value.trim();
        if (city) {
            checkWeather(city);
        }
    }
});

// Initial focus on search box
searchBox.focus();