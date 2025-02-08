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
