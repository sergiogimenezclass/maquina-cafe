/*
  Este objeto guarda el estado actual del pedido.
  Cada propiedad representa una elección o un valor de la máquina.
*/
const order = {
  drink: null,
  basePrice: 0,
  size: "Mediano",
  sizeExtra: 300,
  intensity: "Media",
  sugar: 0,
  extraMilk: false,
  credit: 0,
  total: 0,
  preparing: false,
  completed: false,
};

/* querySelector y querySelectorAll conectan JavaScript con el HTML. */
const drinkCards = document.querySelectorAll(".drink-card");
const sizeButtons = document.querySelectorAll(".size-buttons button");
const intensityButtons = document.querySelectorAll(".intensity-buttons button");
const milkButtons = document.querySelectorAll(".milk-buttons button");
const moneyButtons = document.querySelectorAll(".money-buttons button");
const decreaseSugarButton = document.querySelector("#decrease-sugar");
const increaseSugarButton = document.querySelector("#increase-sugar");
const prepareButton = document.querySelector("#prepare-button");
const resetButton = document.querySelector("#reset-button");
const sugarCount = document.querySelector("#sugar-count");
const orderTitle = document.querySelector("#order-title");
const orderSize = document.querySelector("#order-size");
const orderIntensity = document.querySelector("#order-intensity");
const orderSugar = document.querySelector("#order-sugar");
const orderMilk = document.querySelector("#order-milk");
const orderTotal = document.querySelector("#order-total");
const orderCredit = document.querySelector("#order-credit");
const creditHelp = document.querySelector("#credit-help");
const machineMessage = document.querySelector("#machine-message");
const changeMessage = document.querySelector("#change-message");
const pickupTray = document.querySelector(".pickup-tray");
const pickupDrink = document.querySelector("#pickup-drink");
const pickupMessage = document.querySelector("#pickup-message");

/* Intl.NumberFormat muestra los precios con el formato usado en Argentina. */
function formatMoney(amount) {
  return `$${new Intl.NumberFormat("es-AR").format(amount)}`;
}

/* Conservamos la luz verde y cambiamos solamente el texto de estado. */
function showMachineMessage(message) {
  machineMessage.innerHTML = '<span class="status-light" aria-hidden="true"></span>' + message;
}

/* Esta función deja una sola opción visualmente activa dentro de un grupo. */
function markSelected(buttons, selectedButton) {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button === selectedButton);
    button.setAttribute("aria-pressed", button === selectedButton);
  });
}

/* El total combina el precio de la bebida, el tamaño y la leche extra. */
function calculateTotal() {
  if (!order.drink) {
    order.total = 0;
    return;
  }

  const milkExtra = order.extraMilk ? 300 : 0;
  order.total = order.basePrice + order.sizeExtra + milkExtra;
}

/* Actualizamos juntos todos los textos que describen el pedido. */
function updateSummary() {
  calculateTotal();
  orderTitle.textContent = order.drink || "Sin selección";
  orderSize.textContent = order.size;
  orderIntensity.textContent = `Intensidad ${order.intensity.toLowerCase()}`;
  orderSugar.textContent = order.sugar === 0 ? "Sin azúcar" : `${order.sugar} de azúcar`;
  orderMilk.textContent = order.extraMilk ? "Con leche extra" : "Sin leche extra";
  orderTotal.textContent = formatMoney(order.total);
  orderCredit.textContent = formatMoney(order.credit);
  updatePurchaseState();
}

/*
  Preparar requiere dos condiciones al mismo tiempo:
  una bebida elegida y crédito igual o mayor que el total.
*/
function updatePurchaseState() {
  const hasDrink = order.drink !== null;
  const hasEnoughCredit = order.credit >= order.total;
  const canPrepare = hasDrink && hasEnoughCredit && !order.preparing && !order.completed;

  prepareButton.disabled = !canPrepare;

  if (!hasDrink) {
    creditHelp.textContent = "Elegí una bebida";
    changeMessage.textContent = "Elegí una bebida para comenzar.";
    showMachineMessage("Elegí una bebida");
  } else if (!hasEnoughCredit) {
    const missing = order.total - order.credit;
    creditHelp.textContent = `Faltan ${formatMoney(missing)}`;
    changeMessage.textContent = "Completá el pago para continuar.";
    showMachineMessage("Crédito insuficiente");
  } else if (!order.preparing && !order.completed) {
    const change = order.credit - order.total;
    creditHelp.textContent = "Pago completo";
    changeMessage.textContent = change > 0 ? `Vuelto estimado: ${formatMoney(change)}` : "Ingresaste el importe exacto.";
    showMachineMessage("Lista para preparar");
  }
}

/* Al hacer clic, dataset permite leer el nombre y el precio desde el HTML. */
drinkCards.forEach((card) => {
  const chooseButton = card.querySelector("button");

  chooseButton.addEventListener("click", () => {
    if (order.preparing || order.completed) return;

    drinkCards.forEach((drinkCard) => drinkCard.classList.remove("is-selected"));
    card.classList.add("is-selected");
    order.drink = card.dataset.drink;
    order.basePrice = Number(card.dataset.price);
    updateSummary();
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (order.preparing || order.completed) return;
    markSelected(sizeButtons, button);
    order.size = button.dataset.size;
    order.sizeExtra = Number(button.dataset.extra);
    updateSummary();
  });
});

intensityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (order.preparing || order.completed) return;
    markSelected(intensityButtons, button);
    order.intensity = button.dataset.intensity;
    updateSummary();
  });
});

/* Los condicionales impiden elegir menos de 0 o más de 5 cucharaditas. */
decreaseSugarButton.addEventListener("click", () => {
  if (order.sugar > 0 && !order.preparing && !order.completed) {
    order.sugar -= 1;
    sugarCount.textContent = order.sugar;
    updateSummary();
  }
});

increaseSugarButton.addEventListener("click", () => {
  if (order.sugar < 5 && !order.preparing && !order.completed) {
    order.sugar += 1;
    sugarCount.textContent = order.sugar;
    updateSummary();
  }
});

milkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (order.preparing || order.completed) return;
    markSelected(milkButtons, button);
    order.extraMilk = button.dataset.milk === "true";
    updateSummary();
  });
});

/* dataset devuelve texto; Number lo convierte antes de sumarlo al crédito. */
moneyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (order.preparing || order.completed) return;
    order.credit += Number(button.dataset.amount);
    updateSummary();
  });
});

/* Activamos o desactivamos todos los controles del pedido al mismo tiempo. */
function setControlsDisabled(disabled) {
  const controls = document.querySelectorAll(".drink-card button, .customize-panel button, .money-buttons button");
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

/*
  setTimeout ejecuta una tarea después de una espera.
  Los cuatro tiempos simulan las etapas de preparación de una cafetera.
*/
function prepareCoffee() {
  if (prepareButton.disabled) return;

  order.preparing = true;
  document.body.classList.add("is-preparing");
  setControlsDisabled(true);
  resetButton.disabled = true;
  prepareButton.disabled = true;
  showMachineMessage("Calentando agua...");

  setTimeout(() => showMachineMessage("Moliendo café..."), 1000);
  setTimeout(() => showMachineMessage("Preparando tu bebida..."), 2200);
  setTimeout(finishOrder, 3800);
}

/* Al terminar mostramos la bebida, calculamos el vuelto y bloqueamos el pedido. */
function finishOrder() {
  const change = order.credit - order.total;
  order.preparing = false;
  order.completed = true;
  document.body.classList.remove("is-preparing");
  resetButton.disabled = false;
  pickupTray.classList.add("is-ready");
  pickupDrink.textContent = order.drink;
  pickupMessage.textContent = `Tu ${order.drink.toLowerCase()} está listo. ¡Que lo disfrutes!`;
  creditHelp.textContent = `Vuelto: ${formatMoney(change)}`;
  changeMessage.textContent = `Tu vuelto es ${formatMoney(change)}.`;
  showMachineMessage("¡Tu bebida está lista!");
}

prepareButton.addEventListener("click", prepareCoffee);

/* Reiniciar significa devolver el estado y la interfaz a sus valores iniciales. */
function resetMachine() {
  order.drink = null;
  order.basePrice = 0;
  order.size = "Mediano";
  order.sizeExtra = 300;
  order.intensity = "Media";
  order.sugar = 0;
  order.extraMilk = false;
  order.credit = 0;
  order.total = 0;
  order.preparing = false;
  order.completed = false;

  drinkCards.forEach((card) => card.classList.remove("is-selected"));
  markSelected(sizeButtons, sizeButtons[1]);
  markSelected(intensityButtons, intensityButtons[1]);
  markSelected(milkButtons, milkButtons[0]);
  sugarCount.textContent = "0";
  pickupTray.classList.remove("is-ready");
  pickupDrink.textContent = "";
  pickupMessage.textContent = "La bandeja se iluminará cuando tu bebida esté lista.";
  document.body.classList.remove("is-preparing");
  setControlsDisabled(false);
  updateSummary();
}

resetButton.addEventListener("click", resetMachine);

/* Dibujamos el estado inicial apenas termina de cargar la página. */
updateSummary();
