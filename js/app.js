let reviews = [];

async function load() {
  const res = await fetch('data/reviews.json');
  reviews = await res.json();
  initFilters();
  render();
}

function initFilters() {
  const cities = [...new Set(reviews.map(r => r.city))].sort();
  const select = document.getElementById('cityFilter');
  cities.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    select.appendChild(opt);
  });
  select.addEventListener('change', render);
  document.getElementById('minScore').addEventListener('input', render);
  document.getElementById('addSample').addEventListener('click', addSample);
}

function filtered() {
  const city = document.getElementById('cityFilter').value;
  const min = Number(document.getElementById('minScore').value || 0);
  return reviews.filter(r => (!city || r.city === city) && r.score >= min);
}

let chart;
function renderChart(rows) {
  const byCity = {};
  rows.forEach(r => {
    byCity[r.city] ||= [];
    byCity[r.city].push(r.score);
  });
  const labels = Object.keys(byCity);
  const data = labels.map(c => (byCity[c].reduce((a,b)=>a+b,0)/byCity[c].length).toFixed(2));

  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Avg Score', data }] },
    options: { responsive: true }
  });
}

function renderList(rows) {
  const el = document.getElementById('list');
  el.innerHTML = rows.map(r => `
    <div class="card">
      <strong>${r.place}</strong> — ${r.city}
      <div>${r.score}/10 • ${new Date(r.date).toLocaleDateString()}</div>
    </div>
  `).join('');
}

function render() {
  const rows = filtered().sort((a,b)=>b.score-a.score);
  renderChart(rows);
  renderList(rows);
}

function addSample() {
  reviews.push({
    date: new Date().toISOString().slice(0,10),
    place: "Sample Slice",
    city: "Boston",
    score: +(Math.random()*3+6).toFixed(1)
  });
  render();
}

load();
