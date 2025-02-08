// Carbon Emission Factors (kg CO₂ per km per passenger)
const EMISSION_FACTORS = {
  flight_short: 0.251,     // < 1500 km (Domestic)
  flight_medium: 0.178,    // 1500 - 4000 km (Regional)
  flight_long: 0.151,      // > 4000 km (International)
  train_regular: 0.041,    // Normal Train
  train_highspeed: 0.017,  // High-Speed Train
  metro: 0.005,            // Metro/Subway
  car_petrol_short: 0.192, // Petrol car (<100 km)
  car_petrol_long: 0.142,  // Petrol car (>100 km)
  car_diesel_short: 0.171, // Diesel car (<100 km)
  car_diesel_long: 0.128,  // Diesel car (>100 km)
  car_electric: 0.050,     // Electric car
  motorbike_petrol: 0.094,
  motorbike_electric: 0.020,
  bicycle: 0.0,
  jogging: 0.0
};

function getEmissionFactor(mode, distance, fuelType = null) {
  mode = mode.toLowerCase();

  if (mode.includes("flight")) {
    if (distance < 1500) return EMISSION_FACTORS.flight_short;
    if (distance < 4000) return EMISSION_FACTORS.flight_medium;
    return EMISSION_FACTORS.flight_long;
  }

  if (["train_regular", "train_highspeed", "metro"].includes(mode)) {
    return EMISSION_FACTORS[mode];
  }

  if (mode === "car") {
    if (!fuelType) throw new Error("Please specify the fuel type for car: petrol, diesel, or electric.");
    if (fuelType === "electric") return EMISSION_FACTORS.car_electric;
    return distance < 100 ? EMISSION_FACTORS[`car_${fuelType}_short`] : EMISSION_FACTORS[`car_${fuelType}_long`];
  }

  if (mode === "motorbike") {
    if (!fuelType) throw new Error("Please specify the fuel type for motorbike: petrol or electric.");
    return EMISSION_FACTORS[`motorbike_${fuelType}`];
  }

  if (mode === "bicycle" || mode === "jogging") {
    return EMISSION_FACTORS[mode];
  }

  throw new Error("Invalid transport mode.");
}

function calculateEmission(mode, distance, fuelType = null) {
  const emissionFactor = getEmissionFactor(mode, distance, fuelType);
  return emissionFactor * distance;
}

// Example usage
/*(function() {
  try {
    const mode = prompt("Enter transport mode (flight, train_regular, train_highspeed, metro, car, motorbike, bicycle, jogging): ").trim().toLowerCase();
    const distance = parseFloat(prompt("Enter distance traveled (km): "));
    let fuelType = null;

    if (mode === "car" || mode === "motorbike") {
      fuelType = prompt("Enter fuel type (petrol, diesel, electric): ").trim().toLowerCase();
    }

    const emission = calculateEmission(mode, distance, fuelType);
    console.log(`Total CO₂ emission for ${distance} km by ${mode}: ${emission.toFixed(3)} kg`);
    alert(`Total CO₂ emission for ${distance} km by ${mode}: ${emission.toFixed(3)} kg`);
  } catch (error) {
    console.error("Error:", error.message);
    alert(`Error: ${error.message}`);
  }
})();*/

async function getAirportCoordinates(iataCode) {
  const url = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

  try {
      const response = await fetch(url);
      const data = await response.text();
      const lines = data.split("\n");

      for (let line of lines) {
          let fields = line.split(",");
          if (fields.length > 7 && fields[4].replace(/"/g, '') === iataCode.toUpperCase()) {
              return {
                  lat: parseFloat(fields[6]),
                  lon: parseFloat(fields[7])
              };
          }
      }

      throw new Error(`Invalid IATA code or airport not found: ${iataCode}`);
  } catch (error) {
      console.error("Error fetching airport coordinates:", error);
      return null;
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const toRadians = deg => deg * (Math.PI / 180);
  
  let dlat = toRadians(lat2 - lat1);
  let dlon = toRadians(lon2 - lon1);
  
  let a = Math.sin(dlat / 2) ** 2 +
          Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dlon / 2) ** 2;
  
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // Distance in km
}

async function calculateAirportDistance() {
  const airport1 = document.getElementById("airport1").value.trim().toUpperCase();
  const airport2 = document.getElementById("airport2").value.trim().toUpperCase();
  const resultElement = document.getElementById("airportResult");

  if (!airport1 || !airport2) {
      resultElement.innerText = "❌ Please enter both IATA codes.";
      return;
  }

  resultElement.innerText = "🔍 Fetching airport coordinates...";
  const coord1 = await getAirportCoordinates(airport1);
  const coord2 = await getAirportCoordinates(airport2);

  if (!coord1 || !coord2) {
      resultElement.innerText = "❌ Could not find one or both airports.";
      return;
  }

  const distanceKm = haversine(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
  const distanceMiles = (distanceKm * 0.621371).toFixed(2);

  resultElement.innerHTML = `✈️ Distance: <strong>${distanceKm} km</strong> / <strong>${distanceMiles} miles</strong>`;
}

function showModal() {
  document.getElementById("airportModal").classList.add("active");
}

function closeModal() {
  document.getElementById("airportModal").classList.remove("active");
}

async function getStationCoordinates(stationName) {
  const url = "https://nominatim.openstreetmap.org/search";
  const params = new URLSearchParams({
      q: `${stationName} railway station, India`,
      format: "json",
      limit: 1
  });

  try {
      const response = await fetch(`${url}?${params.toString()}`, {
          headers: { "User-Agent": "railway-distance-calculator" }
      });
      const data = await response.json();

      if (data.length > 0) {
          return {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon)
          };
      } else {
          throw new Error(`Railway station not found: ${stationName}`);
      }
  } catch (error) {
      console.error("Error fetching station coordinates:", error);
      return null;
  }
}

async function getRailDistance(coord1, coord2) {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}?overview=false`;

  try {
      const response = await fetch(osrmUrl, {
          headers: { "User-Agent": "railway-distance-calculator" }
      });
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
          return (data.routes[0].distance / 1000).toFixed(2); // Convert meters to km
      } else {
          throw new Error("Could not calculate railway distance.");
      }
  } catch (error) {
      console.error("Error fetching rail distance:", error);
      return null;
  }
}

async function calculateRailwayDistance() {
  const station1 = document.getElementById("station1").value.trim();
  const station2 = document.getElementById("station2").value.trim();
  const resultElement = document.getElementById("railwayResult");

  if (!station1 || !station2) {
      resultElement.innerText = "❌ Please enter both station names.";
      return;
  }

  resultElement.innerText = "🔍 Fetching railway station coordinates...";
  const coord1 = await getStationCoordinates(station1);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent API rate limit
  const coord2 = await getStationCoordinates(station2);

  if (!coord1 || !coord2) {
      resultElement.innerText = "❌ Could not find one or both railway stations.";
      return;
  }

  resultElement.innerText = "🚆 Calculating railway distance...";
  const distanceKm = await getRailDistance(coord1, coord2);
  const distanceMiles = (distanceKm * 0.621371).toFixed(2);

  if (distanceKm) {
      resultElement.innerHTML = `🚆 Distance: <strong>${distanceKm} km</strong> / <strong>${distanceMiles} miles</strong>`;
  } else {
      resultElement.innerText = "❌ Unable to calculate distance.";
  }
}

function showModal() {
  document.getElementById("railwayModal").classList.add("active");
}

function closeModal() {
  document.getElementById("railwayModal").classList.remove("active");
}

async function getCoordinatesroad(location) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  const headers = { 'User-Agent': 'road-distance-app' };

  try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      } else {
          throw new Error(`Location not found: ${location}`);
      }
  } catch (error) {
      console.error("Error fetching coordinates:", error);
      return null;
  }
}

async function getRoadDistance(coord1, coord2) {
  const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}?overview=false`;
  const headers = { 'User-Agent': 'road-distance-app' };

  try {
      const response = await fetch(osrmUrl, { headers });
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
          const distanceMeters = data.routes[0].distance;
          return (distanceMeters / 1000).toFixed(2); // Convert meters to kilometers
      } else {
          throw new Error("Could not calculate road distance.");
      }
  } catch (error) {
      console.error("Error calculating road distance:", error);
      return null;
  }
}

async function calculateDistance() {
  const location1 = document.getElementById("input1").value;
  const location2 = document.getElementById("input2").value;
  const resultElement = document.getElementById("result");

  if (!location1 || !location2) {
      resultElement.innerText = "❌ Please enter both locations.";
      return;
  }

  resultElement.innerText = "🔍 Fetching coordinates...";
  const coord1 = await getCoordinates(location1);
  const coord2 = await getCoordinates(location2);

  if (!coord1 || !coord2) {
      resultElement.innerText = "❌ Could not find one or both locations.";
      return;
  }

  resultElement.innerText = "🚦 Calculating road distance...";
  const roadDistance = await getRoadDistance(coord1, coord2);

  if (roadDistance) {
      resultElement.innerHTML = `📍 Distance: <strong>${roadDistance} km</strong>`;
  } else {
      resultElement.innerText = "❌ Error calculating distance.";
  }
}

function showModal() {
  document.getElementById("distanceModal").classList.add("active");
}

function closeModal() {
  document.getElementById("distanceModal").classList.remove("active");
}

