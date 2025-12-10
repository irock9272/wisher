// Minimal SPA for Wisher — vanilla JS
(function () {
  const API = '/wishes'

  // State
  let wishes = []
  let filterPerson = null
  let sortMode = 'newest'

  const el = (id) => document.getElementById(id)

  function fmtPrice(p) { return `$${Number(p).toFixed(2)}` }

  function load() {
    fetch(API).then(r => r.json()).then(data => {
      wishes = data
      render()
    }).catch(err => console.error(err))
  }

  function render() {
    const container = el('wishes')
    container.innerHTML = ''

    let list = wishes.slice()
    const q = el('search').value.trim().toLowerCase()
    if (q) list = list.filter(w => (w.name||'').toLowerCase().includes(q) || (w.item||'').toLowerCase().includes(q))
    if (filterPerson) list = list.filter(w => w.name === filterPerson)

    if (sortMode === 'newest') list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
    else if (sortMode === 'price_asc') list.sort((a,b)=> a.price - b.price)
    else if (sortMode === 'price_desc') list.sort((a,b)=> b.price - a.price)

    if (!list.length) {
      container.innerHTML = '<div class="text-slate-500">No wishes yet.</div>'
      renderChips()
      return
    }

    for (const w of list) {
      const card = document.createElement('div')
      card.className = 'p-3 border rounded flex items-start justify-between'

      const left = document.createElement('div')
      left.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-icons text-sky-500">card_giftcard</span>
          <div>
            <div class="text-slate-800 font-semibold">${escapeHtml(w.item)}</div>
            <div class="text-slate-500 text-sm">for <strong>${escapeHtml(w.name)}</strong> • ${fmtPrice(w.price)}</div>
          </div>
        </div>
      `

      const right = document.createElement('div')
      right.className = 'text-right'

      // reveal date logic
      const now = new Date()
      let revealNote = ''
      if (w.revealDate) {
        const d = new Date(w.revealDate)
        if (d > now && w.bought) {
          revealNote = `<div class="text-yellow-600 text-sm">Bought — revealed on ${d.toLocaleDateString()}</div>`
        }
      }

      const boughtBy = (w.bought && (!w.revealDate || new Date(w.revealDate) <= now)) ? (`<div class="text-sm text-slate-700">Bought by: <strong>${escapeHtml(w.boughtBy || 'anonymous')}</strong></div>`) : ''

      right.innerHTML = `
        <div class="mb-2">${boughtBy}${revealNote}</div>
      `

      const actions = document.createElement('div')
      actions.className = 'flex gap-2'
      if (!w.bought) {
        const buy = document.createElement('button')
        buy.className = 'px-2 py-1 bg-emerald-600 text-white rounded text-sm'
        buy.textContent = 'Mark bought'
        buy.onclick = () => markBought(w.id)
        actions.appendChild(buy)
      } else {
        const bought = document.createElement('span')
        bought.className = 'px-2 py-1 bg-gray-200 rounded text-sm'
        bought.textContent = 'Bought'
        actions.appendChild(bought)
      }

      right.appendChild(actions)

      card.appendChild(left)
      card.appendChild(right)
      container.appendChild(card)
    }

    renderChips()
  }

  function renderChips() {
    const chips = el('chips')
    chips.innerHTML = ''
    const people = Array.from(new Set(wishes.map(w=>w.name))).sort()
    for (const p of people) {
      const btn = document.createElement('button')
      btn.className = 'px-3 py-1 rounded-full border text-sm flex items-center gap-2'
      if (p === filterPerson) btn.classList.add('bg-sky-600','text-white')
      btn.innerHTML = `<span class="material-icons text-sm">person</span> ${escapeHtml(p)}`
      btn.onclick = () => { filterPerson = (filterPerson === p) ? null : p; render() }
      chips.appendChild(btn)
    }
  }

  function escapeHtml(s) { return (s||'').toString().replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":"&#39;"}[c] }) }

  function markBought(id) {
    const name = prompt('Optional: who bought it? Leave blank for anonymous')
    const anonymous = !name
    fetch(`/wishes/${id}/buy`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ boughtBy: name, anonymous }) })
      .then(r=>r.json()).then(() => load())
  }

  function setup() {
    el('refresh').addEventListener('click', load)
    el('sort').addEventListener('change', (e) => { sortMode = e.target.value; render() })
    el('search').addEventListener('input', () => render())
    el('clearFilters').addEventListener('click', () => { filterPerson = null; el('search').value = ''; render() })

    el('addForm').addEventListener('submit', (ev) => {
      ev.preventDefault()
      const f = ev.target
      const data = {
        name: f.name.value.trim(),
        item: f.item.value.trim(),
        price: parseFloat(f.price.value) || 0,
        revealDate: f.revealDate.value || null
      }
      if (!data.name || !data.item) return alert('name and item required')
      fetch(API, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })
        .then(r=>r.json()).then(() => { f.reset(); load() }).catch(err=>console.error(err))
    })

    load()
  }

  // Init when DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup)
  else setup()
})();
