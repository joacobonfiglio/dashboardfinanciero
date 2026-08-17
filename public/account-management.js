(() => {
  const KEYS = { balances: 'casa-opening-balances', transactions: 'casa-transactions' };
  const $ = selector => document.querySelector(selector);
  const read = key => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const currencies = ['EUR', 'ARS', 'USD'];
  const defaultCategories = ['Ingresos', 'Alimentación', 'Vivienda', 'Servicios', 'Transporte', 'Salud', 'Educación', 'Ocio', 'Compras', 'Negocio', 'Impuestos', 'Ahorro', 'Transferencias', 'Pago de deuda', 'Ajuste de saldo', 'Otros'];

  function accounts() { return read(KEYS.balances); }
  function categories() { return [...new Set([...defaultCategories, ...read(KEYS.transactions).map(transaction => transaction.category).filter(Boolean)])].sort(); }
  function accountOptions(currency, selected = '') {
    const rows = accounts().filter(account => !currency || account.currency === currency);
    return rows.map(account => `<option value="${esc(account.name)}" ${account.name === selected ? 'selected' : ''}>${esc(account.name)}</option>`).join('');
  }

  function replaceTransactionFields() {
    const accountInput = $('#transactionAccount');
    const categoryInput = $('#transactionCategory');
    const currency = $('#transactionCurrency')?.value || 'EUR';
    if (accountInput && accountInput.tagName === 'INPUT') {
      const select = document.createElement('select');
      select.id = 'transactionAccount'; select.required = true;
      select.dataset.currency = currency;
      select.innerHTML = `<option value="">Selecciona una cuenta</option>${accountOptions(currency, accountInput.value)}`;
      accountInput.replaceWith(select);
    } else if (accountInput?.tagName === 'SELECT' && accountInput.dataset.currency !== currency) {
      const value = accountInput.value;
      accountInput.dataset.currency = currency;
      accountInput.innerHTML = `<option value="">Selecciona una cuenta</option>${accountOptions(currency, value)}`;
    }
    if (categoryInput && categoryInput.tagName === 'INPUT') {
      const select = document.createElement('select');
      select.id = 'transactionCategory'; select.required = true;
      select.innerHTML = `<option value="">Selecciona una categoría</option>${categories().map(category => `<option value="${esc(category)}" ${category === categoryInput.value ? 'selected' : ''}>${esc(category)}</option>`).join('')}`;
      categoryInput.replaceWith(select);
    }
    $('#transactionCurrency')?.addEventListener('change', () => replaceTransactionFields(), { once: true });
  }

  function ensureManageButton() {
    const head = $('#cuentas .panel-head');
    if (!head || $('#manageAccountsBtn')) return;
    const button = document.createElement('button');
    button.id = 'manageAccountsBtn'; button.className = 'btn'; button.textContent = 'Gestionar cuentas';
    button.onclick = openManager;
    head.append(button);
  }

  function accountForm(account = null) {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.innerHTML = `<div class="modal-card"><h2>${account ? 'Editar cuenta' : 'Nueva cuenta'}</h2><p>Las cuentas creadas aquí aparecerán al registrar cualquier movimiento.</p><form id="accountForm"><div class="form-grid"><div class="field"><label for="accountName">Nombre de la cuenta</label><input id="accountName" maxlength="100" value="${esc(account?.name || '')}" placeholder="Ej. Mediolanum · Joaquín" required></div><div class="field"><label for="accountCurrency">Moneda</label><select id="accountCurrency">${currencies.map(currency => `<option ${currency === (account?.currency || 'EUR') ? 'selected' : ''}>${currency}</option>`).join('')}</select></div><div class="field"><label for="accountBalance">Saldo actual</label><input id="accountBalance" type="number" step="0.01" inputmode="decimal" value="${account?.amount ?? ''}" placeholder="0" required></div></div><div class="modal-actions"><button class="btn" type="button" id="cancelAccountBtn">Cancelar</button><button class="btn primary" type="submit">Guardar cuenta</button></div></form></div>`;
    document.body.append(modal);
    $('#cancelAccountBtn').onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
    $('#accountForm').onsubmit = event => {
      event.preventDefault();
      const name = $('#accountName').value.trim();
      const currency = $('#accountCurrency').value;
      const amount = Number(String($('#accountBalance').value).replace(',', '.'));
      if (!name || !Number.isFinite(amount)) return;
      const list = accounts();
      if (account) {
        const duplicate = list.some(item => item.id !== account.id && item.name.toLowerCase() === name.toLowerCase() && item.currency === currency);
        if (duplicate) return alert('Ya existe una cuenta con ese nombre y moneda.');
        const transactions = read(KEYS.transactions).map(transaction => transaction.account === account.name && transaction.currency === account.currency ? { ...transaction, account: name, currency } : transaction);
        write(KEYS.transactions, transactions);
        const index = list.findIndex(item => item.id === account.id);
        list[index] = { ...list[index], name, currency, amount };
      } else {
        if (list.some(item => item.name.toLowerCase() === name.toLowerCase() && item.currency === currency)) return alert('Ya existe una cuenta con ese nombre y moneda.');
        list.push({ id: uid(), name, currency, amount });
      }
      write(KEYS.balances, list);
      location.reload();
    };
  }

  function deleteAccount(account) {
    const linked = read(KEYS.transactions).filter(transaction => transaction.account === account.name && transaction.currency === account.currency);
    const message = linked.length ? `Esta cuenta tiene ${linked.length} movimiento(s). Al eliminarla se borrarán también del dashboard. ¿Quieres continuar?` : `¿Eliminar la cuenta “${account.name}”?`;
    if (!window.confirm(message)) return;
    write(KEYS.balances, accounts().filter(item => item.id !== account.id));
    if (linked.length) write(KEYS.transactions, read(KEYS.transactions).filter(transaction => !(transaction.account === account.name && transaction.currency === account.currency)));
    location.reload();
  }

  function openManager() {
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.id = 'accountsManager';
    const render = () => {
      const list = accounts();
      modal.innerHTML = `<div class="modal-card accounts-manager"><div class="manager-head"><div><h2>Gestionar cuentas</h2><p>Crea, edita o elimina las cuentas disponibles para tus movimientos.</p></div><button class="btn primary" id="newAccountBtn">Nueva cuenta</button></div><div class="manager-list">${list.map(account => `<article class="manager-row"><div><strong>${esc(account.name)}</strong><span>${esc(account.currency)} · Saldo base ${Number(account.amount).toLocaleString('es-AR')}</span></div><div><button class="btn manager-edit" data-id="${esc(account.id)}">Editar</button><button class="btn manager-delete" data-id="${esc(account.id)}">Eliminar</button></div></article>`).join('') || '<p class="manager-empty">Aún no hay cuentas creadas.</p>'}</div><div class="modal-actions"><span></span><button class="btn" id="closeManagerBtn">Cerrar</button></div></div>`;
      $('#newAccountBtn').onclick = () => accountForm();
      $('#closeManagerBtn').onclick = () => modal.remove();
      modal.querySelectorAll('.manager-edit').forEach(button => button.onclick = () => accountForm(accounts().find(account => account.id === button.dataset.id)));
      modal.querySelectorAll('.manager-delete').forEach(button => button.onclick = () => deleteAccount(accounts().find(account => account.id === button.dataset.id)));
    };
    document.body.append(modal); render();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
  }

  function init() {
    ensureManageButton();
    replaceTransactionFields();
    $('#newTransactionBtn')?.addEventListener('click', () => setTimeout(replaceTransactionFields, 0));
    $('#txBody')?.addEventListener('click', event => { if (event.target.closest('button[data-action="edit"]')) setTimeout(replaceTransactionFields, 0); });
    new MutationObserver(() => { ensureManageButton(); replaceTransactionFields(); })
      .observe(document.body, { childList: true, subtree: true });
    const style = document.createElement('style');
    style.textContent = `.manager-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.manager-list{display:grid;gap:9px;margin-top:18px}.manager-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px;border:1px solid var(--line);border-radius:13px;background:#fafcff}.manager-row strong{display:block;font-size:13px}.manager-row span{display:block;margin-top:4px;color:var(--muted);font-size:11px}.manager-row>div:last-child{display:flex;gap:7px}.manager-row .btn{padding:8px 10px;font-size:11px}.manager-delete{color:var(--terracotta)}.manager-empty{padding:16px 0}@media(max-width:520px){.manager-head,.manager-row{align-items:stretch;flex-direction:column}.manager-head .btn{width:100%}.manager-row>div:last-child .btn{flex:1}}`;
    document.head.append(style);
  }
  init();
})();
