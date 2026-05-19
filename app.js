const SUPABASE_URL = "https://unpxicyojsymrjyyjidj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucHhpY3lvanN5bXJqeXlqaWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAwMDIsImV4cCI6MjA5MjYzNjAwMn0.hKY-YWk7FxZ_YGWL5zSlG1Ube8PcU8FXXx4Xbzgv4Lc";

console.log("APP.JS LEWMIS CARGADO");

// =========================
// ESTADO GLOBAL WEB
// =========================
let currentLang = "EN";
let dashboardMode = false;
let currentScreen = "single"; // single | admin | dashboard | retail

// =========================
// RETAIL INTERACTIVO
// =========================
let retailCart = [];
let processedRetailEvents = new Set();
let retailBoxCycle = {};

// =========================
// RETAIL - PESO REFERENCIAL
// =========================
const productWeightReference = {
  "tomate":  { avg_g: 120, min_factor: 0.30 },
  "tomates": { avg_g: 120, min_factor: 0.30 },

  "papa":  { avg_g: 180, min_factor: 0.15 },
  "papas": { avg_g: 180, min_factor: 0.15 },

  "pera":  { avg_g: 170, min_factor: 0.30 },
  "peras": { avg_g: 170, min_factor: 0.30 },

  "banano":  { avg_g: 120, min_factor: 0.30 },
  "bananos": { avg_g: 120, min_factor: 0.30 },

  "yuca": { avg_g: 500, min_factor: 0.25 },

  "cebolla":  { avg_g: 150, min_factor: 0.30 },
  "cebollas": { avg_g: 150, min_factor: 0.30 },

  "zanahoria":  { avg_g: 90, min_factor: 0.30 },
  "zanahorias": { avg_g: 90, min_factor: 0.30 },

  "manzana":  { avg_g: 180, min_factor: 0.30 },
  "manzanas": { avg_g: 180, min_factor: 0.30 },

  "naranja":  { avg_g: 220, min_factor: 0.30 },
  "naranjas": { avg_g: 220, min_factor: 0.30 },

  "limon":  { avg_g: 80, min_factor: 0.30 },
  "limones": { avg_g: 80, min_factor: 0.30 },

  "fresa":  { avg_g: 20, min_factor: 0.50 },
  "fresas": { avg_g: 20, min_factor: 0.50 },

  "uva":  { avg_g: 5, min_factor: 1.00 },
  "uvas": { avg_g: 5, min_factor: 1.00 }
};

// =========================
// HELPERS
// =========================
function formatMoney(value) {
  const n = Number(value || 0);
  return "$ " + n.toLocaleString("es-CO") + ",00";
}

function formatWeight(kg, unit) {
  const rawKg = Number(kg || 0);

  const roundedKg =
    Math.round((rawKg * 1000) / 10) * 10 / 1000;

  if (unit === "lb") {
    const lb = roundedKg * 2.20462;
    return lb.toFixed(2) + " lb";
  }

  if (Math.abs(roundedKg) < 1) {
    return Math.round(roundedKg * 1000) + " g";
  }

  return roundedKg.toFixed(2) + " kg";
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function tr(key) {
  const en = currentLang === "EN";

  const map = {
    "Modo": en ? "Mode" : "Modo",
    "Campo": en ? "Field" : "Campo",
    "Transporte": en ? "Transport" : "Transporte",
    "Inventario": en ? "Inventory" : "Inventario",
    "Retail": "Retail",

    "Peso": en ? "Weight" : "Peso",
    "Actual": en ? "Current" : "Actual",
    "Llevas": en ? "Taken" : "Llevas",
    "En caja": en ? "In box" : "En caja",
    "Valor": en ? "Value" : "Valor",
    "A pagar": en ? "To pay" : "A pagar",
    "A PAGAR": en ? "TO PAY" : "A PAGAR",
    "PAGAR_AHORA": en ? "PAY NOW" : "PAGAR AHORA",
    "AGREGADO_COMPRA": en ? "ADDED TO CART" : "AGREGADO A COMPRA",
    "PESANDO": en ? "WEIGHING" : "PESANDO",
    "LISTO": en ? "READY" : "LISTO",

    "Meta": en ? "Target" : "Meta",
    "Base": en ? "Base" : "Base",
    "Delta": "Delta",
    "Estado": en ? "Status" : "Estado",

    "ESPERA": en ? "WAIT" : "ESPERA",
    "OK": "OK",
    "FALTANTE": en ? "MISSING" : "FALTANTE",
    "EXCESO": en ? "EXCESS" : "EXCESO",
    "RECIBIDO": en ? "RECEIVED" : "RECIBIDO",
    "VACIA": en ? "EMPTY" : "VACIA",
    "IDLE": en ? "WAIT" : "ESPERA",
    "SIN_BASE": en ? "NO_BASE" : "SIN_BASE",

    "RECEPCIÓN OK": en ? "RECEIPT OK" : "RECEPCIÓN OK",
    "Evento": en ? "Event" : "Evento",
    "RETIRO": en ? "REMOVED" : "RETIRO",
    "ADICION": en ? "ADDED" : "ADICION",
    "MANIPULADA": en ? "HANDLED" : "MANIPULADA",
    "FALTANTE EN RECEPCIÓN": en ? "MISSING AT RECEIPT" : "FALTANTE EN RECEPCIÓN",
    "EXCESO EN RECEPCIÓN": en ? "EXCESS AT RECEIPT" : "EXCESO EN RECEPCIÓN",

    "Producto": en ? "Product" : "Producto",
    "Precio": en ? "Price" : "Precio",
    "Salida": en ? "Out" : "Salida",
    "Sensor": en ? "Sensor" : "Sensor",
    "Caja": en ? "Box" : "Caja",
    "Batería": en ? "Battery" : "Batería",

    "META": en ? "TARGET" : "META",
    "CARGANDO": en ? "LOADING" : "CARGANDO",

    "Última actualización:": en
      ? "Last update:"
      : "Última actualización:"
  };

  return map[key] || key;
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

// =========================
// TRANSPORTE - EVENTO VISUAL HTML
// =========================
function getTransportVisualEvent(box) {
  const mode =
    Number(box.mode || 0);

  if (mode !== 2) {
    return box.event || box.inventory_event || "-";
  }

  const rawEvent =
    String(
      box.transport_event ||
      box.event ||
      "-"
    ).trim();

  if (rawEvent !== "-" && rawEvent !== "") {
    return tr(rawEvent.toUpperCase());
  }

  const state =
    String(box.state || "").trim().toUpperCase();

  const deltaKg =
    Number(box.transport_delta_kg || 0);

  const deltaGrams =
    Math.round((deltaKg * 1000) / 10) * 10;

  if (
    state === "FALTANTE" ||
    state === "MISSING" ||
    state === "EXCESO" ||
    state === "EXCESS" ||
    state === "OK" ||
    state === "ESPERA" ||
    state === "WAIT" ||
    state === "ARMED"
  ) {
    return "-";
  }

  if (state === "RECIBIDO" || state === "RECEIVED") {
    if (deltaGrams < -10) {
      return tr("FALTANTE EN RECEPCIÓN");
    }

    if (deltaGrams > 10) {
      return tr("EXCESO EN RECEPCIÓN");
    }

    return tr("RECEPCIÓN OK");
  }

  return "-";
}

// =========================
// ADMIN - ENVIAR COMANDO A SUPABASE
// =========================
async function sendBoxCommand(command) {
  const boxId =
    document.getElementById("boxId")?.innerText?.trim();

  if (!boxId || boxId === "-") {
    console.error("No hay caja activa.");
    return false;
  }

  const payload = {
    box_id: boxId,
    command: command,
    status: "pending"
  };

  console.log("ENVIANDO COMANDO ADMIN:", payload);

  try {
    const res = await fetch(
      SUPABASE_URL + "/rest/v1/box_commands",
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify(payload)
      }
    );

    const txt = await res.text();

    console.log("RESPUESTA COMANDO ADMIN:", res.status, txt);

    if (!res.ok) {
      console.error("Error enviando comando:", txt);
      return false;
    }

    return true;

  } catch (err) {
    console.error("Error de red enviando comando:", err);
    return false;
  }
}

// =========================
// ADMIN - BOTON CON ESTADO
// =========================
async function runAdminButtonCommand(button, command, normalText) {
  if (!button) return;

  const originalBackground =
    button.style.background || "#4fc3f7";

  button.disabled = true;
  button.innerText = "Enviando...";

  const ok =
    await sendBoxCommand(command);

  if (ok) {
    button.innerText = "Enviado ✓";
    button.style.background = "#66bb6a";
  } else {
    button.innerText = "Error";
    button.style.background = "#ef5350";
  }

  setTimeout(() => {
    button.disabled = false;
    button.innerText = normalText;
    button.style.background = originalBackground;
  }, 1500);
}

// =========================
// CARGA DESDE SUPABASE
// =========================
async function loadBoxStatus() {
  const url = dashboardMode
    ? SUPABASE_URL +
      "/rest/v1/box_status?select=%2A&order=updated_at.desc&limit=50"
    : SUPABASE_URL +
      "/rest/v1/box_status?select=%2A&order=updated_at.desc&limit=1";

  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  const data = await res.json();

  if (dashboardMode) {
    renderDashboard(data);
    return;
  }

  if (!data || data.length === 0) {
    setText("state", "SIN DATOS");
    return;
  }

  const box = data[0];

  console.log("SUPABASE DATA:", data);

  const unit =
    (box.unit || "kg").toLowerCase();

  currentLang =
    (box.lang || "ES").toString().trim().toUpperCase();

  // =========================
  // RETAIL INTERACTIVO
  // =========================
  const btnRetailView =
    document.getElementById("btnRetailView");

  if (btnRetailView) {
    btnRetailView.style.display =
      Number(box.mode) === 4 && currentScreen === "single"
        ? "block"
        : "none";
  }

  const productKey =
    (box.product || "")
      .toString()
      .trim()
      .toLowerCase();

  const productRef =
    productWeightReference[productKey];

  let minRetailKg = 0.03;

  if (productRef) {
    minRetailKg =
      (productRef.avg_g * productRef.min_factor) / 1000;
  }

  const boxKey =
    box.box_id || "UNKNOWN_BOX";

  const currentWeight =
    Number(box.weight_kg || 0);

  const currentAmount =
    Number(box.amount_to_pay || 0);

  const rawRetailState =
    (box.state || "")
      .toString()
      .trim()
      .toUpperCase();

  if (!retailBoxCycle[boxKey]) {
    retailBoxCycle[boxKey] = {
      armed: false,
      added: false,
      lastState: ""
    };
  }

  const cycle =
    retailBoxCycle[boxKey];

  const isResetState =
    rawRetailState === "LISTO" ||
    rawRetailState === "IDLE" ||
    rawRetailState === "EMPTY" ||
    rawRetailState === "SIN CARGA" ||
    rawRetailState === "SIN_CARGA";

  const isNearZero =
    currentAmount <= 2 ||
    currentWeight < minRetailKg;

  if (
    Number(box.mode) === 4 &&
    (
      isResetState ||
      isNearZero
    )
  ) {
    cycle.armed = true;
    cycle.added = false;
  }

  const isPayState =
    rawRetailState === "A PAGAR" ||
    rawRetailState === "TO PAY";

  const enteredPayState =
    isPayState &&
    cycle.lastState !== rawRetailState;

  if (
    Number(box.mode) === 4 &&
    cycle.armed === true &&
    cycle.added === false &&
    enteredPayState &&
    currentAmount > 0 &&
    currentWeight >= minRetailKg
  ) {
    addRetailCartItem(box);

    cycle.added = true;
    cycle.armed = false;

    console.log("RETAIL AGREGADO POR EVENTO A PAGAR:", box);
  }

  cycle.lastState =
    rawRetailState;

  const demoSensor =
    box.demo_sensor || "OFF";

  const demoValue =
    box.demo_sensor_value || "-";

  // =========================
  // ETIQUETAS
  // =========================
  setText("labelProduct", tr("Producto"));
  setText("labelPrice", tr("Precio"));
  setText("labelTransportBase", tr("Salida"));
  setText("labelTransportDelta", tr("Delta"));
  setText("labelFieldTarget", tr("Meta"));
  setText("labelInventoryBase", tr("Base"));
  setText("labelInventoryWeight", tr("Peso"));
  setText("labelTransportActual", tr("Actual"));
  setText("labelInventoryDelta", tr("Delta"));
  setText("labelState", tr("Estado"));
  setText("labelSensor", tr("Sensor"));
  setText("labelBox", tr("Caja"));
  setText("labelSerial", "SN");
  setText("labelBattery", tr("Batería"));
  setText("labelInventoryEvent", tr("Evento"));

  setText("thBox", tr("Caja"));
  setText("thProduct", tr("Producto"));
  setText("thMode", tr("Modo"));
  setText("thWeight", tr("Peso"));
  setText("thState", tr("Estado"));
  setText("thBattery", tr("Batería"));

  setText("serialNumber", box.serial_number || "-");

  if (currentScreen === "single") {
    setText(
      "title",
      "LEWMIS - " + tr(getModeLabel(box.mode))
    );
  }

  setText("product", box.product || "-");
  setText("boxId", box.box_id || "-");

  setText(
    "price",
    box.price_per_kg
      ? formatMoney(box.price_per_kg) + " / " + unit
      : "-"
  );

  // =========================
  // PESO PRINCIPAL
  // =========================
  const weightForDisplay =
    Number(box.mode) === 4
      ? (box.retail_llevas_visual_kg ?? box.weight_kg)
      : box.weight_kg;

  const formattedWeight =
    formatWeight(weightForDisplay, unit);

  setText("weight", formattedWeight);
  setText("weightLabel", tr(getWeightLabel(box.mode)));

  const fieldExtra =
    document.getElementById("fieldExtra");

  const weightBlock =
    document.getElementById("weightBlock");

  if (weightBlock) {
    weightBlock.style.display =
      Number(box.mode) === 1 || Number(box.mode) === 4
        ? "block"
        : "none";
  }

  // =========================
  // TRANSPORTE
  // =========================
  const transportExtra =
    document.getElementById("transportExtra");

  const transportActualBlock =
    document.getElementById("transportActualBlock");

  const transportDeltaBlock =
    document.getElementById("transportDeltaBlock");

  let transportStateVisual =
    (box.state || "-").toString().trim().toUpperCase();

  if (transportStateVisual === "IDLE") {
    transportStateVisual = "ESPERA";
  }

  if (Number(box.mode) === 2) {
    transportExtra.style.display = "block";
    transportActualBlock.style.display = "block";
    transportDeltaBlock.style.display = "block";

    setText(
      "transportBase",
      formatWeight(box.transport_base_kg || 0, unit)
    );

    setText(
      "transportActual",
      formatWeight(box.transport_actual_kg ?? box.weight_kg ?? 0, unit)
    );

    const transportState =
      (box.state || "").toString().trim().toUpperCase();

    const deltaKg =
      Number(box.transport_delta_kg || 0);

    const deltaGrams =
      Math.round((deltaKg * 1000) / 10) * 10;

    if (
      transportState === "OK" ||
      transportState === "FALTANTE" ||
      transportState === "EXCESO" ||
      transportState === "RECIBIDO" ||
      transportState === "VACIA"
    ) {
      if (unit === "kg" && Math.abs(deltaKg) < 1) {
        setText("transportDelta", deltaGrams + " g");
      } else {
        setText("transportDelta", formatWeight(deltaKg, unit));
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
      setText("transportDelta", "-");
    }

  } else {
    transportExtra.style.display = "none";
    transportActualBlock.style.display = "none";
    transportDeltaBlock.style.display = "none";
  }

  // =========================
  // INVENTARIO
  // =========================
  const inventoryExtra =
    document.getElementById("inventoryExtra");

  if (Number(box.mode) === 3) {
    inventoryExtra.style.display = "block";

    setText(
      "inventoryBase",
      formatWeight(box.inventory_base_kg || 0, unit)
    );

    setText(
      "inventoryWeight",
      formatWeight(box.weight_kg || 0, unit)
    );

    setText(
      "inventoryDelta",
      formatWeight(box.inventory_delta_kg || 0, unit)
    );

  } else {
    inventoryExtra.style.display = "none";
  }

  // =========================
  // EVENTO GENERAL
  // =========================
  const eventLabel =
    document.getElementById("labelInventoryEvent");

  const eventValue =
    document.getElementById("inventoryEvent");

  if (eventLabel && eventValue) {
    if (Number(box.mode) === 2) {
      eventLabel.style.display = "block";
      eventValue.style.display = "block";
      eventLabel.innerText = tr("Evento");
      eventValue.innerText = getTransportVisualEvent(box);

    } else if (Number(box.mode) === 3) {
      eventLabel.style.display = "block";
      eventValue.style.display = "block";
      eventLabel.innerText = tr("Evento");
      eventValue.innerText =
        tr((box.inventory_event || "-").toString().trim().toUpperCase());

    } else {
      eventLabel.style.display = "none";
      eventValue.style.display = "none";
    }
  }

  // =========================
  // VALOR / A PAGAR / META
  // =========================
  const amountBlock =
    document.getElementById("amountBlock");

  const amountLabel =
    document.getElementById("amountLabel");

  if (Number(box.mode) === 1) {
    amountBlock.style.display = "block";
    amountLabel.innerText = tr("Valor");
    setText("amount", formatMoney(box.amount_to_pay));

    fieldExtra.style.display = "block";
    setText("labelFieldTarget", tr("Meta"));
    setText("fieldTarget", formatWeight(box.target_kg || 0, unit));

  } else if (Number(box.mode) === 4) {
    amountBlock.style.display = "block";
    amountLabel.innerText = tr("A pagar");

    const retailLlevasVisualKg =
      Number(
        box.retail_llevas_visual_kg ??
        box.weight_kg ??
        0
      );

    const retailPrice =
      Number(box.price_per_kg || 0);

    const amountVisual =
      retailLlevasVisualKg * retailPrice;

    setText("amount", formatMoney(amountVisual));

    fieldExtra.style.display = "block";
    setText("labelFieldTarget", tr("En caja"));

    const retailQuedaKg =
      Number(
        box.retail_queda_visual_kg ??
        box.retail_queda_kg ??
        0
      );

    setText("fieldTarget", formatWeight(retailQuedaKg, unit));

  } else {
    amountBlock.style.display = "none";
    fieldExtra.style.display = "none";
  }

  // =========================
  // ESTADO
  // =========================
  const rawState =
    (box.state || "-").toString().trim().toUpperCase();

  let stateVisual = "-";

  if (Number(box.mode) === 2) {
    stateVisual = transportStateVisual || "-";
  } else if (rawState === "IDLE") {
    stateVisual = "ESPERA";
  } else {
    stateVisual = rawState;
  }

  const stateEl =
    document.getElementById("state");

  if (stateEl) {
    stateEl.classList.remove("pay-alert");

    if (
      Number(box.mode) === 4 &&
      (
        stateVisual === "A PAGAR" ||
        stateVisual === "TO PAY"
      )
    ) {
      stateEl.innerText = tr("AGREGADO_COMPRA");
      stateEl.classList.add("pay-alert");
    } else {
      stateEl.innerText = tr(stateVisual);
    }
  }

  // =========================
  // SENSOR / BATERIA / UPDATED
  // =========================
  const sensorEl =
    document.getElementById("sensor");

  if (sensorEl) {
    if (demoSensor !== "OFF") {
      sensorEl.innerText = demoSensor + ": " + demoValue;
    } else {
      sensorEl.innerText = "-";
    }
  }

  setText(
    "battery",
    box.battery_percent >= 0
      ? box.battery_percent + "%"
      : "-"
  );

  const d =
    new Date(Number(box.updated_at));

  setText(
    "updated",
    tr("Última actualización:") + " " + d.toLocaleString("es-CO")
  );
}

// =========================
// DOM READY / BOTONES
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const btn =
    document.getElementById("btnDashboard");

  const btnOpenDashboard =
    document.getElementById("btnOpenDashboard");

  const btnBackFromAdmin =
    document.getElementById("btnBackFromAdmin");

  const btnBackFromDashboard =
    document.getElementById("btnBackFromDashboard");

  const btnAdminTare =
    document.getElementById("btnAdminTare");

  const btnAdminMode1 =
  document.getElementById("btnAdminMode1");

const btnAdminMode2 =
  document.getElementById("btnAdminMode2");

const btnAdminMode3 =
  document.getElementById("btnAdminMode3");

const btnAdminMode4 =
  document.getElementById("btnAdminMode4");

  const btnRetailView =
    document.getElementById("btnRetailView");

  const btnClearCart =
    document.getElementById("btnClearCart");

  const btnPayNow =
    document.getElementById("btnPayNow");

  console.log("BTN ADMIN TARE =", btnAdminTare);

  // =========================
  // ABRIR ADMIN
  // =========================
  if (btn) {
    btn.addEventListener("click", () => {
      currentScreen = "admin";
      dashboardMode = false;

      setText("title", "LEWMIS Administración");

      document.getElementById("singleView").style.display =
        "none";

      document.getElementById("dashboardView").style.display =
        "none";

      const retailView =
        document.getElementById("retailView");

      if (retailView) {
        retailView.style.display =
          "none";
      }

      const adminView =
        document.getElementById("adminView");

      if (adminView) {
        adminView.style.display =
          "block";
      }

      btn.style.display =
        "none";
    });
  }

  // =========================
  // ADMIN - DASHBOARD
  // =========================
  if (btnOpenDashboard) {
    btnOpenDashboard.addEventListener("click", () => {
      currentScreen = "dashboard";
      dashboardMode = true;

      setText("title", "LEWMIS Dashboard");

      document.getElementById("adminView").style.display =
        "none";

      document.getElementById("singleView").style.display =
        "none";

      document.getElementById("dashboardView").style.display =
        "block";

      const retailView =
        document.getElementById("retailView");

      if (retailView) {
        retailView.style.display =
          "none";
      }

      loadBoxStatus();
    });
  }

  // =========================
  // DASHBOARD - VOLVER A ADMIN
  // =========================
  if (btnBackFromDashboard) {
    btnBackFromDashboard.addEventListener("click", () => {
      currentScreen = "admin";
      dashboardMode = false;

      setText("title", "LEWMIS Administración");

      document.getElementById("dashboardView").style.display =
        "none";

      document.getElementById("adminView").style.display =
        "block";

      document.getElementById("singleView").style.display =
        "none";

      const retailView =
        document.getElementById("retailView");

      if (retailView) {
        retailView.style.display =
          "none";
      }
    });
  }

  // =========================
  // ADMIN - VOLVER
  // =========================
  if (btnBackFromAdmin) {
    btnBackFromAdmin.addEventListener("click", () => {
      currentScreen = "single";
      dashboardMode = false;

      document.getElementById("adminView").style.display =
        "none";

      document.getElementById("dashboardView").style.display =
        "none";

      document.getElementById("singleView").style.display =
        "block";

      const retailView =
        document.getElementById("retailView");

      if (retailView) {
        retailView.style.display =
          "none";
      }

      if (btn) {
        btn.style.display =
          "block";

        btn.innerText =
          "Administración";
      }

      setText("title", "LEWMIS");
      loadBoxStatus();
    });
  }

  // =========================
  // ADMIN - TARE REMOTO
  // =========================
  if (btnAdminTare) {
    btnAdminTare.addEventListener("click", () => {
      runAdminButtonCommand(
        btnAdminTare,
        "t",
        "TARE"
      );
    });
  }
// =========================
// ADMIN - CAMBIAR MODO REMOTO
// Usa los mismos comandos que Android.
// =========================
if (btnAdminMode1) {
  btnAdminMode1.addEventListener("click", () => {
    runAdminButtonCommand(
      btnAdminMode1,
      "m=1",
      "Modo Campo"
    );
  });
}

if (btnAdminMode2) {
  btnAdminMode2.addEventListener("click", () => {
    runAdminButtonCommand(
      btnAdminMode2,
      "m=2",
      "Modo Transporte"
    );
  });
}

if (btnAdminMode3) {
  btnAdminMode3.addEventListener("click", () => {
    runAdminButtonCommand(
      btnAdminMode3,
      "m=3",
      "Modo Inventario"
    );
  });
}

if (btnAdminMode4) {
  btnAdminMode4.addEventListener("click", () => {
    runAdminButtonCommand(
      btnAdminMode4,
      "m=4",
      "Modo Retail"
    );
  });
}
  // =========================
  // RETAIL - VER COMPRA
  // =========================
  if (btnRetailView) {
    btnRetailView.addEventListener("click", () => {
      currentScreen = "retail";
      dashboardMode = false;

      document.getElementById("singleView").style.display =
        "none";

      document.getElementById("dashboardView").style.display =
        "none";

      const adminView =
        document.getElementById("adminView");

      if (adminView) {
        adminView.style.display =
          "none";
      }

      document.getElementById("retailView").style.display =
        "block";

      setText("title", "Retail interactivo");

      renderRetailCart();

      if (btn) {
        btn.innerText =
          "Volver";
      }
    });
  }

  // =========================
  // RETAIL - LIMPIAR CARRITO
  // =========================
  if (btnClearCart) {
    btnClearCart.addEventListener("click", () => {
      retailCart = [];
      processedRetailEvents.clear();
      renderRetailCart();
      console.log("CARRITO LIMPIADO");
    });
  }

  // =========================
  // RETAIL - PAGO DEMO
  // =========================
  if (btnPayNow) {
    btnPayNow.addEventListener("click", () => {
      const checkoutMsg =
        document.getElementById("retailCheckoutMessage");

      if (retailCart.length === 0) {
        if (checkoutMsg) {
          checkoutMsg.style.display =
            "block";

          checkoutMsg.style.background =
            "#5c1f1f";

          checkoutMsg.style.color =
            "#ff8a80";

          checkoutMsg.innerText =
            "No hay productos para pagar.";

          setTimeout(() => {
            checkoutMsg.style.display =
              "none";
          }, 2500);
        }

        return;
      }

      if (checkoutMsg) {
        checkoutMsg.style.display =
          "block";

        checkoutMsg.style.background =
          "#1b2733";

        checkoutMsg.style.color =
          "#4fc3f7";

        checkoutMsg.innerText =
          "Pagando vía TDC...";
      }

      setTimeout(() => {
        if (checkoutMsg) {
          checkoutMsg.style.background =
            "#1b4332";

          checkoutMsg.style.color =
            "#95d5b2";

          checkoutMsg.innerText =
            "Pago aprobado.";

          setTimeout(() => {
            checkoutMsg.style.display =
              "none";
          }, 2500);
        }

        retailCart = [];
        processedRetailEvents.clear();
        renderRetailCart();

      }, 1500);
    });
  }
});

// =========================
// RETAIL - AGREGAR AL CARRITO
// =========================
function addRetailCartItem(box) {
  console.log("INTENTO AGREGAR AL CARRITO:", box);

  const eventTimeBucket =
    Math.floor(Number(box.updated_at || Date.now()) / 3000);

  const eventWeight =
    Number(box.weight_kg || 0).toFixed(3);

  const eventAmount =
    Number(box.amount_to_pay || 0).toFixed(0);

  const eventKey =
    `${box.box_id || "-"}|${eventTimeBucket}|${eventWeight}|${eventAmount}`;

  console.log("EVENT KEY:", eventKey);

  if (processedRetailEvents.has(eventKey)) {
    console.log("EVENTO YA EXISTE, NO AGREGO:", eventKey);
    return;
  }

  processedRetailEvents.add(eventKey);

  const cartWeightKg =
    Number(
      box.retail_llevas_visual_kg ??
      box.weight_kg ??
      0
    );

  const cartPrice =
    Number(box.price_per_kg || 0);

  const cartAmount =
    cartWeightKg * cartPrice;

  retailCart.push({
    box_id: box.box_id || "-",
    product: box.product || "-",
    weight_kg: cartWeightKg,
    amount_to_pay: cartAmount,
    unit: (box.unit || "kg").toLowerCase(),
    updated_at: box.updated_at || Date.now()
  });

  renderRetailCart();

  console.log("CARRITO ACTUAL:", retailCart);
}

// =========================
// RETAIL - RENDER CARRITO
// =========================
function renderRetailCart() {
  const cart =
    document.getElementById("retailCart");

  const totalEl =
    document.getElementById("retailTotal");

  if (!cart || !totalEl) return;

  if (retailCart.length === 0) {
    cart.innerHTML = `
      <div class="small">
        No hay productos agregados
      </div>
    `;

    totalEl.innerText =
      "$ 0,00";

    return;
  }

  cart.innerHTML =
    "";

  let total =
    0;

  retailCart.forEach(item => {
    total +=
      Number(item.amount_to_pay || 0);

    const row =
      document.createElement("div");

    row.style.borderTop =
      "1px solid #263238";

    row.style.padding =
      "12px 0";

    row.innerHTML = `
      <div style="
        display:flex;
        justify-content:space-between;
        gap:12px;
      ">
        <div>
          <div style="
            font-weight:bold;
            font-size:18px;
          ">
            ${item.product}
          </div>

          <div style="
            color:#90a4ae;
            font-size:13px;
            margin-top:4px;
          ">
            ${item.box_id}
          </div>
        </div>

        <div style="text-align:right;">
          <div style="
            font-weight:bold;
          ">
            ${formatWeight(item.weight_kg, item.unit)}
          </div>

          <div style="
            color:#ffd54f;
            margin-top:4px;
          ">
            ${formatMoney(item.amount_to_pay)}
          </div>
        </div>
      </div>
    `;

    cart.appendChild(row);
  });

  totalEl.innerText =
    formatMoney(total);
}

// =========================
// DASHBOARD MULTI-CAJA
// =========================
function renderDashboard(rows) {
  const tbody =
    document.getElementById("dashboardRows");

  if (!tbody) return;

  tbody.innerHTML =
    "";

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="
          padding:12px;
          color:#90a4ae;
        ">
          Sin cajas activas
        </td>
      </tr>
    `;
    return;
  }

  rows.forEach(box => {
    const unit =
      (box.unit || "kg").toLowerCase();

    const modeLabel =
      tr(getModeLabel(box.mode));

    const weight =
      formatWeight(box.weight_kg || 0, unit);

    const state =
      tr(
        (box.state || "-")
          .toString()
          .trim()
          .toUpperCase()
      );

    const battery =
      box.battery_percent >= 0
        ? box.battery_percent + "%"
        : "-";

    const trRow =
      document.createElement("tr");

    trRow.style.borderTop =
      "1px solid #263238";

    trRow.innerHTML = `
      <td style="
        padding:8px;
        white-space:nowrap;
        min-width:110px;
        font-weight:bold;
      ">
        ${box.box_id || "-"}
      </td>

      <td style="
        padding:8px;
        white-space:nowrap;
        min-width:90px;
      ">
        ${box.product || "-"}
      </td>

      <td style="
        padding:8px;
        white-space:nowrap;
      ">
        ${modeLabel}
      </td>

      <td style="
        padding:8px;
        white-space:nowrap;
        min-width:80px;
      ">
        ${weight}
      </td>

      <td style="
        padding:8px;
        white-space:nowrap;
      ">
        ${state}
      </td>

      <td style="
        padding:8px;
        white-space:nowrap;
      ">
        ${battery}
      </td>
    `;

    tbody.appendChild(trRow);
  });
}

// =========================
// START
// =========================
loadBoxStatus();
setInterval(loadBoxStatus, 1000);
