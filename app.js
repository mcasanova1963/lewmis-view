const SUPABASE_URL = "https://unpxicyojsymrjyyjidj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucHhpY3lvanN5bXJqeXlqaWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjAwMDIsImV4cCI6MjA5MjYzNjAwMn0.hKY-YWk7FxZ_YGWL5zSlG1Ube8PcU8FXXx4Xbzgv4Lc";

// =========================
// IDIOMA WEB
// Por ahora manual porque Supabase aún no tiene campo lang.
// Cambiar a "EN" para inglés o "ES" para español.
// =========================
let currentLang = "EN";
// =========================
// DASHBOARD MULTI-CAJA
// Controla si estamos viendo:
//
// false = vista individual
// true  = dashboard multi-caja
// =========================
let dashboardMode = false;
// =========================
// RETAIL INTERACTIVO
// Carrito temporal multi-caja.
//
// retailCart:
// lista de productos agregados.
//
// processedRetailEvents:
// evita agregar el mismo evento
// varias veces.
// =========================
// =========================
// RETAIL INTERACTIVO
// Estado limpio por caja.
//
// Controla que cada caja agregue
// solo una compra por ciclo:
//
// LISTO/IDLE/EMPTY -> armada
// A PAGAR          -> agrega una vez
// =========================
let retailCart = [];
let processedRetailEvents = new Set();
// =========================
// RETAIL INTERACTIVO
// Control de ciclo por caja.
//
// Evita agregar varias veces
// la misma compra.
// =========================
let retailBoxCycle = {};
// =========================
// RETAIL - PESO REFERENCIAL
// Tabla local de pesos promedio
// por unidad de producto.
// Sirve para filtrar compras falsas
// causadas por ruido o micro-saltos.
//
// avg_g = peso promedio por unidad en gramos
// min_factor = fracción mínima aceptable
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
// =========================
// TRADUCCION WEB
// Devuelve texto según idioma.
// =========================
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

    "Evento": en ? "Event" : "Evento",
    "RETIRO": en ? "REMOVED" : "RETIRO",
    "ADICION": en ? "ADDED" : "ADICION",
    "MANIPULADA": en ? "HANDLED" : "MANIPULADA",

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

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
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
   // =========================
   // DASHBOARD MULTI-CAJA
   // Si estamos en dashboard:
   //
   // - leer varias cajas
   //
   // Si estamos en vista individual:
   //
   // - leer solo la más reciente
   // =========================
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

    // =========================
    // DASHBOARD MULTI-CAJA
    // Si estamos en modo dashboard,
    // mandamos todas las filas a la tabla
    // y detenemos aquí la vista individual.
    // =========================
    if (dashboardMode) {
    renderDashboard(data);
    return;
    }
  
    if (!data || data.length === 0) {
      document.getElementById("state").innerText = "SIN DATOS";
      return;
    }
    console.log("SUPABASE DATA:", data);
      
    const box = data[0];

    // =========================
    // RETAIL INTERACTIVO
    // Muestra el botón "Ver compra"
    // solo cuando la caja actual
    // está en modo Retail.
    // =========================
    const btnRetailView = document.getElementById("btnRetailView");

    if (btnRetailView) {
    btnRetailView.style.display =
    Number(box.mode) === 4 ? "block" : "none";
    }

    // =========================
    // RETAIL INTERACTIVO
    // Detecta eventos de compra.
    //
    // Cuando una caja Retail entra en:
    // PAGAR AHORA / A PAGAR / TO PAY
    //
    // se agrega automáticamente
    // al carrito multi-caja.
    // =========================
    const retailState =
  (box.state || "")
    .toString()
    .trim()
    .toUpperCase();


// =========================
// RETAIL - FILTRO DINAMICO
// Calcula peso mínimo válido
// según el producto.
// =========================
const productKey =
  (box.product || "")
    .toString()
    .trim()
    .toLowerCase();

const productRef =
  productWeightReference[productKey];

// valor por defecto:
// 30 gramos
let minRetailKg = 0.03;

// si existe referencia,
// usamos cálculo dinámico
if (productRef) {

  minRetailKg =
    (
      productRef.avg_g *
      productRef.min_factor
    ) / 1000;

}

// =========================
// RETAIL INTERACTIVO
// CAPTURA AUTOMATICA LIMPIA
//
// Regla:
// - No capturar PESANDO.
// - Capturar solo al entrar en A PAGAR.
// - Capturar una sola vez por ciclo.
// - Rearmar solo cuando vuelve a LISTO/IDLE/EMPTY
//   o cuando peso/monto caen casi a cero.
// =========================
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

// =========================
// RESET / REARMADO
// La caja queda lista para una nueva compra
// solo cuando vuelve a estado de reposo
// o cuando el monto/peso cae casi a cero.
// =========================
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

// =========================
// EVENTO REAL DE COMPRA
// Solo cuando entra en A PAGAR.
// No en PESANDO.
// No por monto > 0.
// =========================
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

  console.log(
    "RETAIL AGREGADO POR EVENTO A PAGAR:",
    box
  );
}

// =========================
// Guardar último estado visto
// para detectar transición.
// =========================
cycle.lastState =
  rawRetailState;
    
      const demoSensor = box.demo_sensor || "OFF";
      const demoValue = box.demo_sensor_value || "-";
    
      const unit = (box.unit || "kg").toLowerCase();
      // =========================
      // WEB - IDIOMA DESDE SUPABASE
      // Lee ES/EN enviado por Android.
      // =========================
      currentLang = (box.lang || "ES").toString().trim().toUpperCase();
      // =========================
      // WEB - ETIQUETAS FIJAS TRADUCIDAS
      // Traduce textos que vienen escritos en index.html.
      // =========================
      // =========================
 // WEB - HELPER SEGURO PARA TEXTOS
 // Evita que la página se rompa si falta un id en index.html.
 // =========================

 // =========================
 // WEB - ETIQUETAS FIJAS TRADUCIDAS
 // Traduce textos escritos en index.html.
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
 document.getElementById("serialNumber").innerText =
  box.serial_number || "-";
 setText("labelBattery", tr("Batería"));
 setText("labelInventoryEvent", tr("Evento"));
// =========================
// DASHBOARD - ENCABEZADOS
// Traducción de columnas
// multi-caja.
// =========================
setText("thBox", tr("Caja"));
setText("thProduct", tr("Producto"));
setText("thMode", tr("Modo"));
setText("thWeight", tr("Peso"));
setText("thState", tr("Estado"));
setText("thBattery", tr("Batería"));

    console.log("UNIT FROM DB:", box.unit);

   // =========================
   // TITULO WEB - MODO TRADUCIDO
   // Traduce Campo / Transporte / Inventario / Retail.
   // =========================
    // =========================
   // TITULO PRINCIPAL
   // Dashboard multi-caja usa
   // un título general.
   // Vista individual usa modo.
   // =========================
   document.getElementById("title").innerText =
  dashboardMode
    ? "LEWMIS Dashboard"
    : "LEWMIS - " + tr(getModeLabel(box.mode));
    document.getElementById("product").innerText = box.product || "-";
    // =========================
    // WEB - BOX ID
    // Muestra el identificador único de la caja.
    // =========================
    document.getElementById("boxId").innerText = box.box_id || "-";
    

    document.getElementById("price").innerText =
    box.price_per_kg ? formatMoney(box.price_per_kg) + " / " + unit : "-";

// =========================
// HTML - PESO PRINCIPAL
// En Retail, weight_kg representa
// lo que el cliente lleva.
// =========================
const formattedWeight =
  formatWeight(box.weight_kg, unit);

console.log("FORMATTED WEIGHT:", formattedWeight);

if (
  Number(box.mode) === 4 &&
  rawRetailState !== "A PAGAR" &&
  rawRetailState !== "TO PAY"
) {
  document.getElementById("weight").innerText = "-";
} else {
  document.getElementById("weight").innerText = formattedWeight;
}

    // =========================
    // ETIQUETA PRINCIPAL DE PESO
    // Traduce Peso / Actual / Llevas según idioma web.
    // =========================
    document.getElementById("weightLabel").innerText =tr(getWeightLabel(box.mode));
    

    const fieldExtra = document.getElementById("fieldExtra");
    const weightBlock = document.getElementById("weightBlock");
    
    if (
    Number(box.mode) === 1 ||
    Number(box.mode) === 4
    ) {
    weightBlock.style.display = "block";
    } else {
    weightBlock.style.display = "none";
    }
    

    const transportExtra = document.getElementById("transportExtra");
    const transportActualBlock = document.getElementById("transportActualBlock");
    const transportDeltaBlock = document.getElementById("transportDeltaBlock");
    
    let transportStateVisual = (box.state || "-").toString().trim().toUpperCase();

   if (transportStateVisual === "IDLE") {
   transportStateVisual = "ESPERA";
   }

  if (Number(box.mode) === 2) {
  transportExtra.style.display = "block";
  transportActualBlock.style.display = "block";
  transportDeltaBlock.style.display = "block";

  document.getElementById("transportBase").innerText =
    formatWeight(box.transport_base_kg || 0, unit);
  document.getElementById("transportActual").innerText =
    formatWeight(box.transport_actual_kg ?? box.weight_kg ?? 0, unit);

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
  transportActualBlock.style.display = "none";
  transportDeltaBlock.style.display = "none";
}

const inventoryExtra = document.getElementById("inventoryExtra");

if (Number(box.mode) === 3) {
  inventoryExtra.style.display = "block";

  document.getElementById("inventoryBase").innerText =
    formatWeight(box.inventory_base_kg || 0, unit);

  document.getElementById("inventoryWeight").innerText =
  formatWeight(box.weight_kg || 0, unit);

  document.getElementById("inventoryDelta").innerText =
    formatWeight(box.inventory_delta_kg || 0, unit);

  document.getElementById("inventoryEvent").innerText =
  tr((box.inventory_event || "-").toString().trim().toUpperCase());

} else {
  inventoryExtra.style.display = "none";
}

const amountBlock = document.getElementById("amountBlock");
const amountLabel = document.getElementById("amountLabel");

if (Number(box.mode) === 1) {

  amountBlock.style.display = "block";
  amountLabel.innerText = tr("Valor");
  document.getElementById("amount").innerText = formatMoney(box.amount_to_pay);

  // =========================
  // CAMPO - MOSTRAR META
  // =========================
  fieldExtra.style.display = "block";

  document.getElementById("fieldTarget").innerText =
    formatWeight(box.target_kg || 0, unit);

} else if (Number(box.mode) === 4) {

  amountBlock.style.display = "block";
  amountLabel.innerText = tr("A pagar");
  document.getElementById("amount").innerText =
    formatMoney(box.amount_to_pay);

  // =========================
  // RETAIL - BASE DE VENTA HTML
  // En modo Retail reutilizamos el
  // bloque de Meta para mostrar la
  // Base Retail recibida desde Supabase.
  //
  // retail_base_kg viene en kg.
  // retail_base_set indica si la base
  // está activa.
  // =========================
  fieldExtra.style.display = "block";

  // =========================
  // RETAIL - TEXTO HTML
  // La base Retail es técnica.
  // En pantalla mostramos cuánto
  // queda disponible en la caja.
  // =========================
  document.getElementById("labelFieldTarget").innerText =
  tr("En caja");

  // =========================
// RETAIL - EN CAJA HTML
// Muestra el peso vivo disponible
// físicamente en la caja.
//
// Este valor viene de Supabase como:
// retail_queda_kg
//
// Importante:
// retail_base_kg es base técnica.
// weight_kg es lo que el cliente lleva.
// retail_queda_kg es lo que queda en caja.
// =========================
const retailQuedaKg =
  Number(box.retail_queda_kg || 0);

document.getElementById("fieldTarget").innerText =
  formatWeight(retailQuedaKg, unit);
} else {

  amountBlock.style.display = "none";
  fieldExtra.style.display = "none";
}
  // =========================
  // WEB - ESTADO VISUAL
  // Calcula siempre un estado visible.
  // Traduce solo después de tener un valor seguro.
  // =========================
  const rawState = (box.state || "-").toString().trim().toUpperCase();

let stateVisual = "-";
if (Number(box.mode) === 2) {
  stateVisual = transportStateVisual || "-";

} else if (rawState === "IDLE") {

  stateVisual = "ESPERA";

} else {

  stateVisual = rawState;
}

const stateEl = document.getElementById("state");

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
  // =========================
  // WEB - ULTIMA ACTUALIZACION TRADUCIDA
  // Usa el idioma manual actual de la web.
  // =========================
  document.getElementById("updated").innerText =tr("Última actualización:") + " " + d.toLocaleString("es-CO");
  }
  // =========================
  // BOTON DASHBOARD
  // Alterna entre:
  //
  // - Vista individual
  // - Dashboard multi-caja
  // =========================
  document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btnDashboard");
  // =========================
  // BOTON RETAIL VIEW
  // Abre la pantalla de compra
  // interactiva multi-caja.
  // =========================
  const btnRetailView =
  document.getElementById("btnRetailView");
  // =========================
  // BOTON LIMPIAR CARRITO
  // =========================
  const btnClearCart =
  document.getElementById("btnClearCart");
  // =========================
  // BOTON PAGAR AHORA
  // Simula pago demo por TDC.
  // =========================
  const btnPayNow =
  document.getElementById("btnPayNow");

  if (!btn) return;

 btn.addEventListener("click", () => {

  // =========================
  // SI ESTAMOS EN RETAIL VIEW
  // volvemos a la compra normal.
  // =========================
  const retailView =
    document.getElementById("retailView");

  if (retailView.style.display === "block") {

    retailView.style.display = "none";

    document.getElementById("singleView").style.display =
      "block";

    document.getElementById("title").innerText =
      "LEWMIS - Retail";

    btn.innerText = "Dashboard";

    return;
  }

  dashboardMode = !dashboardMode;

    // =========================
    // MOSTRAR / OCULTAR VISTAS
    // =========================
    document.getElementById("singleView").style.display =
      dashboardMode ? "none" : "block";

    document.getElementById("dashboardView").style.display =
      dashboardMode ? "block" : "none";

    // =========================
    // CAMBIAR TEXTO BOTON
    // =========================
    // =========================
    // TEXTO BOTON PRINCIPAL
    // =========================
    if (dashboardMode) {
    btn.innerText = "Vista individual";
    } else {
    btn.innerText = "Dashboard";
    }
    // =========================
    // TITULO SEGUN VISTA
    // En dashboard no mostramos modo,
    // porque es una vista general multi-caja.
   // =========================
   document.getElementById("title").innerText =
  dashboardMode
    ? "LEWMIS Dashboard"
    : "LEWMIS";
  });
    // =========================
   // RETAIL INTERACTIVO
   // Cambia desde vista individual
   // hacia el carrito multi-caja.
   // =========================
if (btnRetailView) {
  btnRetailView.addEventListener("click", () => {
    document.getElementById("singleView").style.display =
      "none";
    document.getElementById("dashboardView").style.display =
      "none";
    document.getElementById("retailView").style.display =
  "block";
    document.getElementById("title").innerText =
      "Retail interactivo";
    // =========================
    // RETAIL INTERACTIVO
    // Al entrar a la vista de compra,
    // actualizamos el carrito en pantalla.
    // =========================
    renderRetailCart();
    // UX RETAIL
    // El botón principal ahora
    // permite volver a la compra.
btn.innerText = "Seguir comprando";
  });
}
// =========================
// RETAIL INTERACTIVO
// Limpia toda la compra demo.
// =========================
if (btnClearCart) {
  btnClearCart.addEventListener("click", () => {
    retailCart = [];
    processedRetailEvents.clear();
    renderRetailCart();
    console.log(
      "CARRITO LIMPIADO"
    );
  });
}

// =========================
// RETAIL INTERACTIVO
// Simulación de pago con TDC.
// =========================
// =========================
// RETAIL INTERACTIVO
// Simulación visual de pago TDC.
// =========================
if (btnPayNow) {

  btnPayNow.addEventListener("click", () => {

    const checkoutMsg =
      document.getElementById(
        "retailCheckoutMessage"
      );

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

    // =========================
    // PROCESANDO PAGO
    // =========================
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

    // =========================
    // PAGO APROBADO
    // =========================
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
  // RETAIL INTERACTIVO
  // Agrega una compra al carrito.
  //
  // Solo guarda:
  // - caja
  // - producto
  // - peso tomado
  // - valor a pagar
  // - momento del evento
  //
  // eventKey evita duplicados.
  // =========================
  function addRetailCartItem(box) {
  console.log("INTENTO AGREGAR AL CARRITO:", box);
    
 const eventKey =
  `${box.box_id || "-"}|${box.updated_at || "-"}|${box.amount_to_pay || 0}`;

console.log("EVENT KEY:", eventKey);

if (processedRetailEvents.has(eventKey)) {
  console.log("EVENTO YA EXISTE, NO AGREGO:", eventKey);
  return;
}

  

  processedRetailEvents.add(eventKey);

 retailCart.push({
  box_id: box.box_id || "-",
  product: box.product || "-",
  weight_kg: Number(box.weight_kg || 0),
  amount_to_pay: Number(box.amount_to_pay || 0),
  unit: (box.unit || "kg").toLowerCase(),
  updated_at: box.updated_at || Date.now()
});

// =========================
// ACTUALIZAR UI DEL CARRITO
// inmediatamente después
// de agregar una compra.
// =========================
renderRetailCart();

console.log("CARRITO ACTUAL:", retailCart);
}

// =========================
// RETAIL INTERACTIVO
// Renderiza el carrito visual.
// =========================
function renderRetailCart() {

  const cart =
    document.getElementById("retailCart");

  const totalEl =
    document.getElementById("retailTotal");

  if (!cart || !totalEl) return;

  // =========================
  // CARRITO VACIO
  // =========================
  if (retailCart.length === 0) {

    cart.innerHTML = `
      <div class="small">
        No hay productos agregados
      </div>
    `;

    totalEl.innerText = "$ 0,00";

    return;
  }

  // =========================
  // LIMPIAR CONTENIDO
  // =========================
  cart.innerHTML = "";
  console.log("RENDER RETAIL CART LENGTH:", retailCart.length);
  console.log("RENDER RETAIL CART DATA:", retailCart);

  let total = 0;

  // =========================
  // UNA FILA POR PRODUCTO
  // =========================
  retailCart.forEach(item => {

    total += Number(item.amount_to_pay || 0);

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
            ${formatWeight(
              item.weight_kg,
              item.unit
            )}
          </div>

          <div style="
            color:#ffd54f;
            margin-top:4px;
          ">
            ${formatMoney(
              item.amount_to_pay
            )}
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
    // RENDER DASHBOARD
    // Llena la tabla multi-caja
    // usando todas las filas recibidas
    // desde Supabase.
    // =========================
    function renderDashboard(rows) {

    const tbody = document.getElementById("dashboardRows");

    if (!tbody) return;

    // =========================
    // LIMPIAR TABLA
    // =========================
    tbody.innerHTML = "";

    // =========================
    // SIN DATOS
    // =========================
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

  // =========================
  // CREAR UNA FILA POR CAJA
  // =========================
  rows.forEach(box => {

    const unit =
      (box.unit || "kg").toLowerCase();

    const modeLabel =
      tr(getModeLabel(box.mode));

    const weight =
      formatWeight(box.weight_kg || 0, unit);

    const state =
      tr((box.state || "-")
      .toString()
      .trim()
      .toUpperCase());

    const battery =
      box.battery_percent >= 0
        ? box.battery_percent + "%"
        : "-";

    // =========================
    // CREAR FILA HTML
    // =========================
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
  loadBoxStatus(); 
  setInterval(loadBoxStatus, 1000);
