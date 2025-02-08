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
