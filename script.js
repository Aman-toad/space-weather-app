// planet api request getting the data
async function fetchPlanetData(planetName, targetId) {
  const textContainer = document.getElementById(targetId)
  textContainer.textContent = 'Fetching Latest Data...'
  try {
    const response = await fetch(`${CONFIG.SOLAR_SYSTEM_API}/${planetName} `, {
      method: 'GET'
    });

    const data = await response.json();

    displayPlanetData(data, targetId);
  } catch (err) {
    textContainer.textContent = 'failed to fetch the data! Try Again !!'
    console.error("failed to fetch planet data", err);
  }
}

function displayPlanetData(planet, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <p><strong>Mass:</strong> ${planet.mass.massValue} × 10^${planet.mass.massExponent} kg</p>
    <p><strong>Radius:</strong> ${planet.meanRadius} km</p>
    <p><strong>Orbital Period:</strong> ${planet.sideralOrbit} days</p>
    <p><strong>Average Temperature:</strong> ${planet.avgTemp} K</p>
  `;
}


window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const main = document.querySelector('.main');
    const stars = document.querySelector('.stars');
    const movingStars = document.querySelector('.moving-stars')

    if (stars && main && movingStars) {
      stars.style.transform = `translateY(${scrolled * 0.5}px)`;
      movingStars.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
  })

  // observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  const animateElements = document.querySelectorAll(".weather-card, .eclipse-card, .planet-card, .event-item")
  animateElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // loading all the content on scrolling and show

  //main image
  loadAstronomyPictureOfDay();

  // space weather data
  loadSpaceWeatherData();

  // event recent data
  loadRecentEvents();
})

async function loadAstronomyPictureOfDay() {
  try {
    const res = await fetch(`${CONFIG.APOD_API}?api_key=${CONFIG.NASA_API_KEY}`)
    const data = await res.json();

    if (data.media_type === "image") {
      const mainSection = document.querySelector('.main')
      mainSection.style.backgroundImage = `linear-gradient(rgba(10, 10, 20, 0.8), rgba(10, 10, 20, 0.9)), url(${data.url})`
      mainSection.style.backgroundSize = 'cover';
      mainSection.style.backgroundPosition = 'center';

      // image attributes
      const solarSystemINfo = document.querySelector('.solar-system-info');
      const attribution = document.createElement("div")
      attribution.className = "apod-attribution";
      attribution.innerHTML = `
          <p>Background: NASA APOD - ${data.title}</p>
          <p>Date: ${data.date}</p>
        `
      solarSystemINfo.appendChild(attribution)
    }
  } catch (err) {
    console.error("Error Loading APOD: ", err)
  }
}

async function loadSpaceWeatherData() {
  //loading state
  document.querySelectorAll('.card-data').forEach((card) => {
    card.innerHTML = `
      <div class="loading-animation">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <p>Fetching data from NASA...</p>
    `
  })

  loadSolarFlareData();

  // loadAuroraForecast();

  // loadSolarWindData();

  loadGeomagneticStormData();
}

function getDateRange(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days)
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  }
}

function formatFlareClass(flareClass) {
  const flareLevels = {
    X: { level: "Extreme", color: "#ef4444" },
    M: { level: "Severe", color: "#f97316" },
    C: { level: "Moderate", color: "#fbbf24" },
    B: { level: "Minor", color: "#4ade80" },
    A: { level: "Minimal", color: "#60a5fa" },
  }
  const level = flareLevels[flareClass.charAt(0)] || flareLevels["A"]
  return {
    class: flareClass,
    level: level.level,
    color: level.color,
  }
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

//time ago 
function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  const intervals = [
    { label: "seconds", seconds: 60 },
    { label: "minutes", seconds: 60 * 60 },
    { label: "hours", seconds: 60 * 60 * 24 },
    { label: "days", seconds: 60 * 60 * 24 * 30 },
    { label: "months", seconds: 60 * 60 * 24 * 30 * 12 },
    { label: "years", seconds: 60 * 60 * 24 * 30 * 12 * 10 },
  ]
  for (let i = 0; i < intervals.length; i++) {
    if (seconds < intervals[i].seconds) {
      const count = Math.floor(seconds / intervals[i - 1].seconds)
      return `${count} ${intervals[i - 1].label}${count !== 1 ? "s" : ""} ago`
    }
  }
  const count = Math.floor(seconds / intervals[intervals.length - 1].seconds)
  return `${count} ${intervals[intervals.length - 1].label}${count !== 1 ? "s" : ""} ago`
}

// load solar flare data
async function loadSolarFlareData() {
  try {
    const dateRange = getDateRange(7)
    const res = await fetch(`${CONFIG.DONKI_FLARE_API}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&api_key=${CONFIG.NASA_API_KEY}`)

    const data = await res.json();

    const solarFlareCard = document.querySelector(".solar-flare .card-data");
    const statusIndicator = document.querySelector(".solar-flare .status-indicator");
    const statusText = document.querySelector('.solar-flare .card-status span:last-child')

    if (data.length > 0) {
      //most recent first
      data.sort((a, b) => new Date(b.beginTime) - new Date(a.beginTime))

      const latestFlare = data[0]
      const flareInfo = formatFlareClass(latestFlare.classType)

      // Update status indicator
      statusIndicator.style.background = flareInfo.color
      statusText.textContent = flareInfo.level.charAt(0).toUpperCase() + flareInfo.level.slice(1)

      // Format the data for display
      solarFlareCard.innerHTML = `
        <div class="data-item">
          <span class="data-label">Latest Flare:</span>
          <span class="data-value flare-class ${flareInfo.level}">${flareInfo.class}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Begin:</span>
          <span class="data-value">${formatDisplayDate(latestFlare.beginTime)}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Peak:</span>
          <span class="data-value">${formatDisplayDate(latestFlare.peakTime)}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Source:</span>
          <span class="data-value">${latestFlare.sourceLocation || "Unknown"}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Active Region:</span>
          <span class="data-value">${latestFlare.activeRegionNum || "N/A"}</span>
        </div>
      `
    } else {
      solarFlareCard.innerHTML = `<p>No recent solar flare data available.</p>`
      statusText.textContent = "Quiet"
    }

  } catch (err) {
    console.error("Error loading solar flare data:", err)
    document.querySelector(".solar-flare .card-data").innerHTML = `
      <p class="error-message">Error loading solar flare data. Please try again later.</p>
    `
  }
}

// load aurora forecast
async function loadAuroraForecast() {
  try {
    const res = await fetch(CONFIG.AURORA_API);
    const data = await res.json();

    const auroraCard = document.querySelector(".aurora .card-data");
    const statusIndicator = document.querySelector(".aurora .status-indicator");
    const statusText = document.querySelector(".aurora .card-status . span:last-child");

    if (data && data.coordinates) {
      const observations = data.coordinates.map((coord) => coord[2]);
      const maxActivity = Math.max(...observations);

      //activity level color
      let activityLevel = "Low";
      let activityColor = "#4ade80";

      if (maxActivity > 70) {
        activityLevel = "Extreme";
        activityColor = "#ef4444"
      } else if (maxActivity > 50) {
        activityLevel = "High"
        activityColor = "#f97316"
      } else if (maxActivity > 30) {
        activityLevel = "Moderate"
        activityColor = "#fbbf24"
      }

      statusIndicator.style.background = activityColor;
      statusText.textContent = activityLevel;

      // displaying the data in page
      auroraCard.innerHTML = `
        <div class="data-item">
          <span class="data-label">Activity Level:</span>
          <span class="data-value">${activityLevel}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Observation Time:</span>
          <span class="data-value">${formatDisplayDate(data.Observation_Time)}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Forecast:</span>
          <span class="data-value">Visible in ${activityLevel === "Low" ? "high latitude regions" : activityLevel === "Moderate" ? "northern US and Canada" : "mid-latitudes"}</span>
        </div>
        <div class="aurora-map">
          <img src="https://services.swpc.noaa.gov/images/aurora-forecast-northern-hemisphere.jpg" alt="Aurora Forecast Map" class="forecast-map">
          <small>Northern Hemisphere Aurora Forecast</small>
        </div>
      `
    } else {
      auroraCard.innerHTML = `<p>No Aurora Forecast Data Available.</p>`
      statusText.textContent = "Unknown"
    }
  } catch (err) {
    console.error("Error in Loading the Forecast Data:", err)
    document.querySelector(".aurora .card-data").innerHTML = `
      <p class="error-message">⚠️ Unable to load Aurora Forecast data. The source may have changed or is currently unavailable. Please try again later.</p>
      <div class="loading-animation">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `
  }
}

// load solar wind speed data
async function loadSolarWindData() {
  try {
    const res = await fetch(CONFIG.SOLAR_WIND_API);
    const data = await res.json();

  }
  catch (err) {
    console.error("Error loading Wind Data", err);
    document.querySelector(".solar-wind .card-data").innerHTML = `
      <p class="error-message">⚠️ Unable to load solar wind speed data. The source may have changed or is currently unavailable. Please try again later.</p>
      <div class="loading-animation">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `
  }
}

async function loadGeomagneticStormData() {
  try {
    const dateRange = getDateRange(7);
    const res = await fetch(`${CONFIG.DONKI_GST_API}?startDate=${getDateRange.startDate}&endDate=${getDateRange.endDate}&api_key=${CONFIG.NASA_API_KEY}`)

    const data = await res.json();

    const geomagneticCard = document.querySelector('.geomagnetic .card-data')
    const statusIndicator = document.querySelector(".geomagnetic .status-indicator")
    const statusText = document.querySelector(".geomagnetic .card-status span:last-child")

    if (data.length > 0) {
      data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

      const latestStorm = data[0]

      const kpIndex = latestStorm.allKpIndex.reduce((max, kp) => Math.max(max, kp.kpIndex), 0)
      let stormLevel = "G1 (Minor)"
      let stormColor = "#fbbf24"

      if (kpIndex >= 9) {
        stormLevel = "G5 (Extreme)"
        stormColor = "#ef4444"
      } else if (kpIndex >= 8) {
        stormLevel = "G4 (Severe)"
        stormColor = "#f97316"
      } else if (kpIndex >= 7) {
        stormLevel = "G3 (Strong)"
        stormColor = "#fb923c"
      } else if (kpIndex >= 6) {
        stormLevel = "G2 (Moderate)"
        stormColor = "#fbbf24"
      }

      statusIndicator.style.background = stormColor
      statusText.textContent = stormLevel.split(" ")[0]

      // Format the data for display
      geomagneticCard.innerHTML = `
        <div class="data-item">
          <span class="data-label">Storm Level:</span>
          <span class="data-value">${stormLevel}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Start Time:</span>
          <span class="data-value">${formatDisplayDate(latestStorm.startTime)}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Max Kp Index:</span>
          <span class="data-value">${kpIndex}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Duration:</span>
          <span class="data-value">${Math.round((new Date(latestStorm.endTime) - new Date(latestStorm.startTime)) / 3600000)} hours</span>
        </div>
      `}

  } catch (err) {
    console.error("Error loading Wind Data", err);
    document.querySelector(".solar-wind .card-data").innerHTML = `
      <p class="error-message">⚠️ Unable to load solar wind speed data. The source may have changed or is currently unavailable. Please try again later.</p>
      <div class="loading-animation">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `
  }
}

// Recent Events
async function loadRecentEvents() {
  try {
    const dateRange = getDateRange(5); // increase the day iyw
    const res = await fetch(`${CONFIG.DONKI_EVENT_API}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&api_key=${CONFIG.NASA_API_KEY}`)

    const data = await res.json();
    const eventsTimeline = document.querySelector(".events-timeline");

    eventsTimeline.innerHTML = `
      <div class="event-item">
        <div class="event-date">Error</div>
        <div class="event-content">
          <h4>Data Unavailable</h4>
          <p class="error-message">Error loading recent events. Please try again later.</p>
        </div>      
    `

    if (data.length > 0) {
      data.sort((a, b) => new Date(b.messageIssueTime) - new Date(a.messageIssueTime))

      // 5 most recent events
      const recentEvents = data.slice(0, 5)

      eventsTimeline.innerHTML = ""

      // Add events 
      recentEvents.forEach((event) => {
        const eventItem = document.createElement("div")
        eventItem.className = "event-item"

        let eventIcon = "🔔"
        let eventTypeDisplay = "Notification"

        if (event.messageType.includes("FLR")) {
          eventIcon = "🌟"
          eventTypeDisplay = "Solar Flare"
        } else if (event.messageType.includes("CME")) {
          eventIcon = "💨"
          eventTypeDisplay = "Coronal Mass Ejection"
        } else if (event.messageType.includes("GST")) {
          eventIcon = "🧲"
          eventTypeDisplay = "Geomagnetic Storm"
        } else if (event.messageType.includes("SEP")) {
          eventIcon = "☢️"
          eventTypeDisplay = "Solar Energetic Particle"
        } else if (event.messageType.includes("IPS")) {
          eventIcon = "🌀"
          eventTypeDisplay = "Interplanetary Shock"
        }

        eventItem.innerHTML = `
          <div class="event-date">${timeAgo(event.messageIssueTime)}</div>
          <div class="event-content">
            <h4>${eventIcon} ${eventTypeDisplay}</h4>
            <p>${event.messageBody.split(".")[0]}.</p>
            <small>${formatDisplayDate(event.messageIssueTime)}</small>
          </div>
        `

        eventsTimeline.appendChild(eventItem)
      })
    } else {
      eventsTimeline.innerHTML = `
        <div class="event-item">
          <div class="event-date">Now</div>
          <div class="event-content">
            <h4>No Recent Events</h4>
            <p>No space weather events have been reported in the last 30 days.</p>
          </div>
        </div>
      `
    }
  } catch (err) {
    console.error("Error loading recent events:", err)
    document.querySelector(".events-timeline").innerHTML = `
      <div class="event-item">
        <div class="event-date">Error</div>
        <div class="event-content">
          <h4>Data Unavailable</h4>
          <p class="error-message">Error loading recent events. Please try again later.</p>
        </div>
      </div>
    `
  }
}