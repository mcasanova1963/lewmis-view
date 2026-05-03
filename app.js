const SUPABASE_URL = "https://unpxicyojsymrjyyjidj.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucHhpY3lvanN5bXJqeXlqaWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAwMDIsImV4cCI6MjA5MjYzNjAwMn0.hKY-YWk7FxZ_YGWL5zSlG1Ube8PcU8FXXx4Xbzgv4Lc";


  function formatMoney(value) {
    const n = Number(value || 0);
    return "$ " + n.toLocaleString("es-CO") + ",00";
  }

  function formatWeight(kg, unit) {
  console.log("FORMAT UNIT:", unit);
  const v = Number(kg || 0);

  if (unit === "lb") {
    const lb = v * 2.20462;
    return lb.toFixed(2) + " lb";
  }

  if (Math.abs(v) < 1) return Math.round(v * 1000) + " g";
  return v.toFixed(2) + " kg";
}

  function getWeightLabel(mode) {
    switch (Number(mode)) {
      case 1: return "Peso";
      case 2: return "Actual";
      case 3: return "Peso";
      case 4: return "Llevas";
      default: return "Peso";
    }
  }

  function getModeLabel(mode) {
    switch (Number(mode)) {
      case 1: return "Campo";
      case 2: return "Transporte";
      case 3: return "Inventario";
      case 4: return "Retail";
      default: return "-";
    }
  }

  async function loadBoxStatus() {
    const url = SUPABASE_URL + "/rest/v1/box_status?select=%2A&order=updated_at.desc&limit=1";

    const res = await fetch(url, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const data = await res.json();
  
    if (!data || data.length === 0) {
      document.getElementById("state").innerText = "SIN DATOS";
      return;
    }
    console.log("SUPABASE DATA:", data);
      
    const box = data[0];
      const demoSensor = box.demo_sensor || "OFF";
      const demoValue = box.demo_sensor_value || "-";
    
      const unit = (box.unit || "kg").toLowerCase();

    console.log("UNIT FROM DB:", box.unit);

    document.getElementById("title").innerText = "LEWMIS - " + getModeLabel(box.mode);
    document.getElementById("product").innerText = box.product || "-";
    

    document.getElementById("price").innerText =
    box.price_per_kg ? formatMoney(box.price_per_kg) + " / " + unit : "-";

    const formattedWeight = formatWeight(box.weight_kg, unit);
    console.log("FORMATTED WEIGHT:", formattedWeight);
    document.getElementById("weight").innerText = formattedWeight;

    document.getElementById("weightLabel").innerText = getWeightLabel(box.mode);
    

    const fieldExtra = document.getElementById("fieldExtra");
    
    if (Number(box.mode) === 1) {
    fieldExtra.style.display = "block";

    const fieldTarget = document.getElementById("fieldTarget");
    fieldTarget.innerText = formatWeight(box.target_kg || 0, unit);

    if ((box.state || "").toUpperCase() === "META") {
    fieldTarget.style.color = "#66bb6a"; // verde
    } else {
    fieldTarget.style.color = "#ffd54f"; // amarillo
    }

    } else {
    fieldExtra.style.display = "none";
    }

   const transportExtra = document.getElementById("transportExtra");
   const transportDeltaBlock = document.getElementById("transportDeltaBlock");
    let transportStateVisual = (box.state || "-").toString().trim().toUpperCase();

   if (transportStateVisual === "IDLE") {
   transportStateVisual = "ESPERA";
   }

  if (Number(box.mode) === 2) {
  transportExtra.style.display = "block";
  transportDeltaBlock.style.display = "block";

  document.getElementById("transportBase").innerText =
    formatWeight(box.transport_base_kg || 0, unit);

  const transportState = (box.state || "").toString().trim().toUpperCase();

 const deltaKg = Number(box.transport_delta_kg || 0);
const deltaGrams = Math.round((deltaKg * 1000) / 10) * 10;


if (transportState === "IDLE") {
  transportStateVisual = "ESPERA";
}

if (
  transportState === "OK" ||
  transportState === "FALTANTE" ||
  transportState === "EXCESO" ||
  transportState === "RECIBIDO" ||
  transportState === "VACIA"
) {
  if (unit === "kg" && Math.abs(deltaKg) < 1) {
    document.getElementById("transportDelta").innerText = deltaGrams + " g";
  } else {
    document.getElementById("transportDelta").innerText =
      formatWeight(deltaKg, unit);
  }

  if (transportState !== "RECIBIDO") {
    if (Math.abs(deltaGrams) <= 10) {
      transportStateVisual = "OK";
    } else if (deltaGrams < 0) {
      transportStateVisual = "FALTANTE";
    } else {
      transportStateVisual = "EXCESO";
    }
  }
} else {
  document.getElementById("transportDelta").innerText = "-";
}

} else {
  transportExtra.style.display = "none";
  transportDeltaBlock.style.display = "none";
}

const inventoryExtra = document.getElementById("inventoryExtra");

if (Number(box.mode) === 3) {
  inventoryExtra.style.display = "block";

  document.getElementById("inventoryBase").innerText =
    formatWeight(box.inventory_base_kg || 0, unit);

  document.getElementById("inventoryDelta").innerText =
    formatWeight(box.inventory_delta_kg || 0, unit);

} else {
  inventoryExtra.style.display = "none";
}

const amountBlock = document.getElementById("amountBlock");
const amountLabel = document.getElementById("amountLabel");

if (Number(box.mode) === 1) {
  amountBlock.style.display = "block";
  amountLabel.innerText = "Valor";
  document.getElementById("amount").innerText = formatMoney(box.amount_to_pay);
} else if (Number(box.mode) === 4) {
  amountBlock.style.display = "block";
  amountLabel.innerText = "A pagar";
  document.getElementById("amount").innerText = formatMoney(box.amount_to_pay);
} else {
  amountBlock.style.display = "none";
}

 const rawState = (box.state || "").toString().trim().toUpperCase();

const stateVisual =
  Number(box.mode) === 2
    ? transportStateVisual
    : (rawState === "IDLE" ? "ESPERA" : (box.state || "-"));

document.getElementById("state").innerText = stateVisual;

const sensorEl = document.getElementById("sensor");

if (sensorEl) {
  if (demoSensor !== "OFF") {
    sensorEl.innerText = demoSensor + ": " + demoValue;
  } else {
    sensorEl.innerText = "-";
  }
}

  document.getElementById("battery").innerText =
  box.battery_percent >= 0 ? box.battery_percent + "%" : "-";

  const d = new Date(Number(box.updated_at));
  document.getElementById("updated").innerText =
  "Última actualización: " + d.toLocaleString("es-CO");
  }
  loadBoxStatus(); 
  setInterval(loadBoxStatus, 1000);
