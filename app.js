const state = {
  query: "",
  status: "all",
  program: "all",
  stateCode: "all",
  chip: "all",
};

let trackerData = null;

const $ = (selector) => document.querySelector(selector);

function niceStatus(status) {
  if (status === "open") return "Open";
  if (status === "limited") return "Limited";
  return "Closed";
}

function statusClass(status) {
  if (status === "open") return "status-open";
  if (status === "limited") return "status-limited";
  return "status-closed";
}

function formatDate(dateString) {
  if (!dateString) return "Not listed";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function loadData() {
  const sources = ["/api/openings", "/.netlify/functions/openings", "./voucher-data.json"];

  for (const url of sources) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;
      return await response.json();
    } catch (error) {
      // Try the next source so the prototype still works in static hosting scenarios.
    }
  }

  throw new Error("Unable to load tracker data.");
}

function renderStats(records) {
  const totals = {
    total: records.length,
    open: records.filter((item) => item.status === "open").length,
    limited: records.filter((item) => item.status === "limited").length,
    closed: records.filter((item) => item.status === "closed").length,
  };

  $("#stats").innerHTML = `
    <article class="stat">
      <span>Tracked records</span>
      <strong>${totals.total}</strong>
    </article>
    <article class="stat">
      <span>Open now</span>
      <strong>${totals.open}</strong>
    </article>
    <article class="stat">
      <span>Limited access</span>
      <strong>${totals.limited}</strong>
    </article>
    <article class="stat">
      <span>Closed or paused</span>
      <strong>${totals.closed}</strong>
    </article>
  `;
}

function populateFilters(records) {
  const programSelect = $("#programSelect");
  const stateSelect = $("#stateSelect");

  const programs = [...new Set(records.map((item) => item.programType))].sort();
  const states = [...new Set(records.map((item) => item.state))].sort((a, b) => a.localeCompare(b));

  programSelect.innerHTML = '<option value="all">All program types</option>';
  stateSelect.innerHTML = '<option value="all">All states</option>';

  programs.forEach((program) => {
    const option = document.createElement("option");
    option.value = program;
    option.textContent = program;
    programSelect.appendChild(option);
  });

  states.forEach((stateName) => {
    const option = document.createElement("option");
    option.value = stateName;
    option.textContent = stateName;
    stateSelect.appendChild(option);
  });
}

function renderStatusChips(records) {
  const counts = {
    all: records.length,
    open: records.filter((item) => item.status === "open").length,
    limited: records.filter((item) => item.status === "limited").length,
    closed: records.filter((item) => item.status === "closed").length,
  };

  const labels = {
    all: "All records",
    open: "Open",
    limited: "Limited",
    closed: "Closed",
  };

  $("#statusChips").innerHTML = Object.keys(labels).map((key) => `
    <button
      class="status-chip ${state.chip === key ? "active" : ""}"
      type="button"
      data-chip="${key}"
    >${labels[key]} (${counts[key]})</button>
  `).join("");

  document.querySelectorAll("[data-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chip = button.dataset.chip;
      state.status = button.dataset.chip === "all" ? "all" : button.dataset.chip;
      $("#statusSelect").value = state.status;
      renderCards();
      renderStatusChips(trackerData.records);
    });
  });
}

function getFilteredRecords() {
  const query = state.query.trim().toLowerCase();

  return trackerData.records.filter((item) => {
    const haystack = [
      item.authority,
      item.city,
      item.state,
      item.programType,
      item.statusSummary,
      item.notes,
      item.tags.join(" "),
    ].join(" ").toLowerCase();

    const matchesQuery = !query || haystack.includes(query);
    const matchesStatus = state.status === "all" || item.status === state.status;
    const matchesProgram = state.program === "all" || item.programType === state.program;
    const matchesState = state.stateCode === "all" || item.state === state.stateCode;

    return matchesQuery && matchesStatus && matchesProgram && matchesState;
  });
}

function cardTemplate(item) {
  return `
    <article class="card">
      <div class="card-top">
        <div>
          <h3>${item.authority}</h3>
          <p>${item.city}, ${item.state}</p>
        </div>
        <span class="status-pill ${statusClass(item.status)}">${niceStatus(item.status)}</span>
      </div>

      <div class="meta-grid">
        <div class="meta">
          <span>Program</span>
          <strong>${item.programType}</strong>
        </div>
        <div class="meta">
          <span>Last verified</span>
          <strong>${formatDate(item.lastVerified)}</strong>
        </div>
        <div class="meta">
          <span>Current window</span>
          <strong>${item.applicationWindow || "See official source"}</strong>
        </div>
        <div class="meta">
          <span>Research note</span>
          <strong>${item.statusSummary}</strong>
        </div>
      </div>

      <div class="source-box">
        <p>${item.notes}</p>
        <div class="source-actions">
          <a class="primary-link" href="${item.officialSourceUrl}" target="_blank" rel="noreferrer">Official source</a>
          <a class="secondary-link" href="${item.applicationUrl}" target="_blank" rel="noreferrer">Apply or check status</a>
        </div>
      </div>
    </article>
  `;
}

function renderCards() {
  const filtered = getFilteredRecords();
  const lastUpdated = trackerData.meta.lastUpdated;

  $("#resultsNote").textContent = `${filtered.length} record(s) shown. Dataset last refreshed ${formatDate(lastUpdated)}. Verify with the official source before acting.`;

  if (!filtered.length) {
    $("#cards").innerHTML = `
      <div class="empty-state">
        No records match the current filters. Try clearing one or more filters, or search by city, state, agency, or program type.
      </div>
    `;
    return;
  }

  $("#cards").innerHTML = filtered.map(cardTemplate).join("");
}

function attachEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderCards();
  });

  $("#statusSelect").addEventListener("change", (event) => {
    state.status = event.target.value;
    state.chip = event.target.value;
    renderCards();
    renderStatusChips(trackerData.records);
  });

  $("#programSelect").addEventListener("change", (event) => {
    state.program = event.target.value;
    renderCards();
  });

  $("#stateSelect").addEventListener("change", (event) => {
    state.stateCode = event.target.value;
    renderCards();
  });
}

function renderVerificationMessage(meta) {
  $("#verificationMessage").textContent = `${meta.disclaimer} Dataset last refreshed ${formatDate(meta.lastUpdated)}.`;
}

async function init() {
  try {
    trackerData = await loadData();
    renderVerificationMessage(trackerData.meta);
    renderStats(trackerData.records);
    populateFilters(trackerData.records);
    renderStatusChips(trackerData.records);
    attachEvents();
    renderCards();
  } catch (error) {
    $("#stats").innerHTML = "";
    $("#statusChips").innerHTML = "";
    $("#resultsNote").textContent = "Tracker data could not be loaded.";
    $("#cards").innerHTML = `
      <div class="empty-state">
        The tracker could not load its dataset. Please confirm the local server or static hosting environment is serving
        <code>voucher-data.json</code> or <code>/api/openings</code>.
      </div>
    `;
  }
}

init();
