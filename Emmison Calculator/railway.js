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
