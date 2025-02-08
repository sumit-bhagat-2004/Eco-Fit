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
