document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // ELEMENTS
    // =====================
    const input = document.querySelector("input");
    const searchBtn = document.querySelector(".search-btn");
    const cityButtons = document.querySelectorAll(".popular-cities button");
    const locationBtn = document.querySelector("#location-btn");

    const cityName = document.querySelector("#city-name");
    const countryEl = document.querySelector("#country");
    const temp = document.querySelector("#C");
    const condition = document.querySelector("#pc");
    const tempMax = document.querySelector("#temp-max");
    const tempMin = document.querySelector("#temp-min");
    const weatherImg = document.querySelector("#weather-img");
    const ppEl = document.querySelector("#pp");

    const humidity = document.querySelector("#humidity");
    const wind = document.querySelector("#wind");
    const feelsLike = document.querySelector("#feels-like");

    // =====================
    // API KEY
    // =====================
    const apiKey = "c3234ce41007ebcdafad854362281975";

    // =====================
    // WEATHER ICON MAPPER
    // =====================
    function getWeatherIcon(weatherId) {
        if (weatherId >= 200 && weatherId < 300) return "https://cdn-icons-png.flaticon.com/512/1146/1146860.png"; // storm
        if (weatherId >= 300 && weatherId < 400) return "https://cdn-icons-png.flaticon.com/512/3351/3351979.png"; // drizzle
        if (weatherId >= 500 && weatherId < 600) return "https://cdn-icons-png.flaticon.com/512/3351/3351979.png"; // rain
        if (weatherId >= 600 && weatherId < 700) return "https://cdn-icons-png.flaticon.com/512/642/642102.png"; // snow
        if (weatherId === 800) return "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // sunny
        if (weatherId > 800) return "https://cdn-icons-png.flaticon.com/512/414/414825.png"; // cloudy
        return "https://cdn-icons-png.flaticon.com/512/414/414825.png";
    }
    // =====================
    // GET CURRENT WEATHER
    // =====================
    async function getWeather(city) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.status === 401) {
                alert("API key is invalid or not yet activated.");
                return;
            }
            if (response.status === 404 || data.cod == 404) {
                alert(`City not found: "${city}". Please check the spelling.`);
                return;
            }
            if (!response.ok) {
                alert(`API error ${response.status}: ${data.message || "Unknown error"}`);
                return;
            }

            updateUI(data);
            getForecast(city);

        } catch (error) {
            console.error("Fetch error:", error);
            alert("Could not reach the weather API. Use Live Server, not file://");
        }
    }

    // =====================
    // UPDATE MAIN CARD UI
    // =====================
    function updateUI(data) {
        cityName.textContent = data.name;
        countryEl.textContent = data.sys.country;
        temp.textContent = Math.round(data.main.temp) + "°";
        condition.textContent = data.weather[0].description;

        tempMax.textContent = "↑ " + Math.round(data.main.temp_max) + "°";
        tempMin.textContent = "↓ " + Math.round(data.main.temp_min) + "°";

        // BUG FIX: show the image (was hidden on load) and set correct icon
        weatherImg.style.display = "block";
        weatherImg.src = getWeatherIcon(data.weather[0].id);
        weatherImg.alt = data.weather[0].description;

        humidity.textContent = data.main.humidity + "%";
        wind.textContent = Math.round(data.wind.speed * 3.6) + " km/h";
        feelsLike.textContent = Math.round(data.main.feels_like) + "°C";

        // BUG FIX: update the timestamp with real time instead of "just now"
        const now = new Date();
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        ppEl.innerHTML = `<span id="country">${data.sys.country}</span> · Updated at ${hours}:${minutes}`;
    }

    // =====================
    // GET 5-DAY FORECAST
    // =====================
    async function getForecast(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) return;

        const dailyMap = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            const time = item.dt_txt.split(" ")[1];
            if (!dailyMap[date] || time === "12:00:00") {
                dailyMap[date] = item;
            }
        });

        const today = new Date().toISOString().split("T")[0];
        const forecastDays = Object.keys(dailyMap)
            .filter(date => date !== today)
            .slice(0, 5);

        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const container = document.querySelector(".container");
        container.innerHTML = "";

        forecastDays.forEach(date => {
            const day = dailyMap[date];
            const d = new Date(date);
            const dayName = days[d.getDay()];
            const shortDate = months[d.getMonth()] + " " + d.getDate();
            const rain = Math.round((day.pop || 0) * 100);
            const high = Math.round(day.main.temp_max);
            const low = Math.round(day.main.temp_min);
            const desc = day.weather[0].description;
            const icon = getWeatherIcon(day.weather[0].id);

            container.innerHTML += `
                <div class="card">
                    <p><strong>${dayName}</strong></p>
                    <p>${shortDate}</p>
                    <img src="${icon}" alt="${desc}" style="width:55px;height:55px;">
                    <p style="text-transform:capitalize;">${desc}</p>
                    <p>${rain}% rain</p>
                    <span class="temp-high">↑ ${high}°</span>
                    <span class="temp-low">↓ ${low}°</span>
                </div>
            `;
        });
    }

    // =====================
    // SEARCH BUTTON
    // =====================
    searchBtn.addEventListener("click", () => {
        const city = input.value.trim();
        if (city) getWeather(city);
    });

    // =====================
    // ENTER KEY SEARCH
    // =====================
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const city = input.value.trim();
            if (city) getWeather(city);
        }
    });

    // =====================
    // POPULAR CITIES
    // =====================
    cityButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const city = btn.textContent.replace("📍", "").trim();
            getWeather(city);
        });
    });

    // =====================
    // MY LOCATION BUTTON
    // =====================
    locationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        locationBtn.textContent = "⏳ Locating...";

        navigator.geolocation.getCurrentPosition(
            async(position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (!response.ok) {
                        alert("Could not get weather for your location.");
                        return;
                    }

                    updateUI(data);
                    getForecast(data.name);

                } catch (error) {
                    alert("Failed to fetch weather for your location.");
                } finally {
                    locationBtn.textContent = "📍 My Location";
                }
            },
            () => {
                locationBtn.textContent = "📍 My Location";
                alert("Location access denied. Please allow location in your browser settings.");
            }
        );
    });

    // =====================
    // DEFAULT CITY ON LOAD
    // =====================
    getWeather("Rabat");

});