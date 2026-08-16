(() => {
  const KEYS = {
    transactions: 'casa-transactions',
    openingBalances: 'casa-opening-balances',
    debts: 'casa-debts',
    celesteMigration: 'casa-celeste-payment-v1'
  };
  const $ = selector => document.querySelector(selector);
  const money = (value, currency) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency, maximumFractionDigits: currency === 'ARS' ? 0 : 2
  }).format(Number(value || 0));
  const read = key => JSON.parse(localStorage.getItem(key) || '[]');
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const id = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const esc = value => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);

  function migrateCelestePayment() {
    const debts = read(KEYS.debts);
    const celeste = debts.find(debt => debt.id === 'celeste');
    if (!celeste) return false;
    const transactions = read(KEYS.transactions);
    const paymentExists = transactions.some(transaction => transaction.description === 'Pago de tarjeta Celeste' && transaction.currency === 'EUR');
    let changed = false;
    if (!paymentExists) {
      transactions.push({
        id: id(), date: new Date().toISOString().slice(0, 10), description: 'Pago de tarjeta Celeste',
        category: 'Pago de deuda', account: 'Efectivo', currency: 'EUR', type: 'Gasto', amount: Number(celeste.amount || 1000)
      });
      write(KEYS.transactions, transactions);
      localStorage.setItem(KEYS.celesteMigration, 'done');
      changed = true;
    }
    if (celeste.status !== 'Pagado') {
      celeste.status = 'Pagado';
      celeste.completedAt = new Date().toISOString().slice(0, 10);
      write(KEYS.debts, debts);
    }
    return changed;
  }

  function accountChoices(currency) {
    const balances = read(KEYS.openingBalances);
    const transactionAccounts = read(KEYS.transactions)
      .filter(transaction => transaction.currency === currency)
      .map(transaction => transaction.account);
    const names = new Set([...balances.filter(balance => balance.currency === currency).map(balance => balance.name), ...transactionAccounts]);
    return [...names].sort();
  }

  function totalAvailable(currency) {
    const opening = read(KEYS.openingBalances)
      .filter(balance => balance.currency === currency)
      .reduce((sum, balance) => sum + Number(balance.amount), 0);
    const movementEffect = read(KEYS.transactions)
      .filter(transaction => transaction.currency === currency)
      .reduce((sum, transaction) => sum + (transaction.type === 'Ingreso' ? Number(transaction.amount) : -Number(transaction.amount)), 0);
    return opening + movementEffect;
  }

  function refreshExecutiveMetrics() {
    const root = $('#executiveMetrics');
    if (!root) return;
    const debts = read(KEYS.debts);
    const availableEUR = totalAvailable('EUR');
    const activeDebtEUR = debts.filter(debt => debt.currency === 'EUR' && debt.status !== 'Pagado').reduce((sum, debt) => sum + Number(debt.amount), 0);
    const paidDebtEUR = debts.filter(debt => debt.currency === 'EUR' && debt.status === 'Pagado').reduce((sum, debt) => sum + Number(debt.amount), 0);
    const netWorthEUR = availableEUR - activeDebtEUR;
    root.innerHTML = `
      <article class="executive-card featured"><div class="executive-label">Patrimonio neto <span>↗</span></div><div class="executive-value">${money(netWorthEUR, 'EUR')}</div><div class="executive-note">Disponible menos deuda pendiente</div></article>
      <article class="executive-card"><div class="executive-label">Dinero disponible <span>€</span></div><div class="executive-value">${money(availableEUR, 'EUR')}</div><div class="executive-note">Cuentas y efectivo en euros</div></article>
      <article class="executive-card"><div class="executive-label">Deuda pendiente <span>↓</span></div><div class="executive-value">${money(activeDebtEUR, 'EUR')}</div><div class="executive-note">Tarjetas y préstamos activos</div></article>
      <article class="executive-card"><div class="executive-label">Deuda liquidada <span>✓</span></div><div class="executive-value">${money(paidDebtEUR, 'EUR')}</div><div class="executive-note">Reducción histórica registrada</div></article>`;
  }

  function paymentModal(debt) {
    const accounts = accountChoices(debt.currency);
    const modal = document.createElement('div');
    modal.className = 'modal open';
    modal.id = 'paymentDebtModal';
    modal.innerHTML = `
      <div class="modal-card">
        <h2>Registrar pago</h2>
        <p>El pago se guardará como gasto y reducirá automáticamente el saldo de la cuenta elegida.</p>
        <form id="paymentDebtForm">
          <div class="form-grid">
            <div class="field"><label>Deuda</label><input value="${esc(debt.name)}" disabled></div>
            <div class="field"><label>Importe (${esc(debt.currency)})</label><input id="paymentAmount" type="number" min="0.01" max="${Number(debt.amount)}" step="0.01" value="${Number(debt.amount)}" required></div>
            <div class="field"><label>Cuenta desde la que se paga</label><select id="paymentAccount" required>${accounts.map(account => `<option ${account === 'Efectivo' ? 'selected' : ''}>${esc(account)}</option>`).join('')}</select></div>
            <div class="field"><label>Fecha</label><input id="paymentDate" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div>
          </div>
          <label class="payment-check"><input id="paymentComplete" type="checkbox" checked> Marcar como pagada por completo</label>
          <div class="modal-actions"><button class="btn" type="button" id="cancelPaymentBtn">Cancelar</button><button class="btn primary" type="submit">Registrar pago</button></div>
        </form>
      </div>`;
    document.body.append(modal);
    $('#cancelPaymentBtn').onclick = () => modal.remove();
    modal.onclick = event => { if (event.target === modal) modal.remove(); };
    $('#paymentDebtForm').onsubmit = event => {
      event.preventDefault();
      const amount = Math.abs(Number($('#paymentAmount').value));
      if (!Number.isFinite(amount) || amount <= 0 || amount > Number(debt.amount)) return;
      const debts = read(KEYS.debts);
      const current = debts.find(item => item.id === debt.id);
      if (!current) return;
      const complete = $('#paymentComplete').checked || amount === Number(current.amount);
      if (complete) current.status = 'Pagado';
      else { current.amount = Math.max(0, Number(current.amount) - amount); current.status = 'Pendiente'; }
      current.completedAt = complete ? $('#paymentDate').value : undefined;
      write(KEYS.debts, debts);
      const transactions = read(KEYS.transactions);
      transactions.push({ id: id(), date: $('#paymentDate').value, description: `Pago de ${current.type.toLowerCase()} ${current.name}`,
        category: 'Pago de deuda', account: $('#paymentAccount').value, currency: current.currency, type: 'Gasto', amount });
      write(KEYS.transactions, transactions);
      location.reload();
    };
  }

  function adjustBalance(account, currency, currentBalance) {
    const desired = window.prompt(`Saldo actual para “${account}” (${currency}).\nEl saldo visible ahora es ${money(currentBalance, currency)}.`, currentBalance);
    if (desired === null) return;
    const target = Number(String(desired).replace(',', '.'));
    if (!Number.isFinite(target)) return alert('Introduce un importe válido.');
    const difference = target - currentBalance;
    if (Math.abs(difference) < 0.001) return;
    const transactions = read(KEYS.transactions);
    transactions.push({ id: id(), date: new Date().toISOString().slice(0, 10), description: `Ajuste manual de saldo · ${account}`,
      category: 'Ajuste de saldo', account, currency, type: difference > 0 ? 'Ingreso' : 'Gasto', amount: Math.abs(difference) });
    write(KEYS.transactions, transactions);
    location.reload();
  }

  function refreshDebtSummary() {
    const debts = read(KEYS.debts);
    const byStatus = status => ['ARS', 'USD', 'EUR'].map(currency => [currency, debts.filter(debt => debt.status === status && debt.currency === currency).reduce((sum, debt) => sum + Number(debt.amount), 0)]).filter(([, amount]) => amount > 0);
    const pending = byStatus('Pendiente').concat(byStatus('Próxima a cancelar'));
    const paid = byStatus('Pagado');
    const summary = pending.length ? `Pendiente · ${pending.map(([currency, amount]) => money(amount, currency)).join(' · ')}` : 'Sin deuda pendiente';
    $('#debtSummary').textContent = `${summary}${paid.length ? ` · Pagado históricamente ${paid.map(([currency, amount]) => money(amount, currency)).join(' · ')}` : ''}`;
    document.querySelectorAll('#debtGrid .debt-card').forEach(card => {
      const debt = debts.find(item => item.name === card.querySelector('h3')?.textContent.trim());
      if (!debt) return;
      const details = card.querySelector('.debt-card-head p');
      const amount = card.querySelector('.debt-amount');
      if (details) details.textContent = `${debt.type} · ${debt.currency} · ${debt.status}`;
      if (amount) {
        amount.textContent = `${debt.status === 'Pagado' ? 'Pagado · ' : debt.status === 'Próxima a cancelar' ? 'Próxima · ' : ''}${money(debt.amount, debt.currency)}`;
        amount.style.color = debt.status === 'Pagado' ? 'var(--green)' : debt.status === 'Próxima a cancelar' ? '#a77c2b' : 'var(--terracotta)';
      }
    });
  }

  function enhanceCards() {
    document.querySelectorAll('#accountsGrid .account').forEach(card => {
      if (card.querySelector('.balance-edit')) return;
      const account = card.querySelector('.account-name')?.textContent.trim();
      const currency = card.querySelector('.account-top span:last-child')?.textContent.trim();
      const raw = card.querySelector('.account-value')?.textContent || '';
      const current = Number(raw.replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(',', '.'));
      if (!account || !currency || !Number.isFinite(current)) return;
      const button = document.createElement('button');
      button.className = 'link-btn balance-edit'; button.textContent = 'Ajustar saldo';
      button.onclick = () => adjustBalance(account, currency, current);
      card.append(button);
    });
    const debts = read(KEYS.debts);
    document.querySelectorAll('#debtGrid .debt-card').forEach(card => {
      if (card.querySelector('.payment-debt')) return;
      const name = card.querySelector('h3')?.textContent.trim();
      const debt = debts.find(item => item.name === name && item.status !== 'Pagado');
      if (!debt) return;
      const button = document.createElement('button');
      button.className = 'btn payment-debt'; button.textContent = 'Registrar pago';
      button.onclick = () => paymentModal(debt);
      card.append(button);
    });
  }

  function init() {
    const paymentAdded = migrateCelestePayment();
    if (paymentAdded) { location.reload(); return; }
    refreshDebtSummary();
    refreshExecutiveMetrics();
    enhanceCards();
    new MutationObserver(() => { enhanceCards(); refreshExecutiveMetrics(); })
      .observe($('#debtGrid'), { childList: true, subtree: true });
    new MutationObserver(() => refreshExecutiveMetrics())
      .observe($('#accountsGrid'), { childList: true, subtree: true });
    const style = document.createElement('style');
    style.textContent = `.account .balance-edit{margin-top:10px}.debt-card .payment-debt{margin-top:14px;width:100%;padding:9px 10px;font-size:12px}.payment-check{display:block;margin-top:4px;color:var(--muted);font-size:13px}.payment-check input{accent-color:var(--green)}@media(max-width:480px){.debt-card .payment-debt{font-size:11px}}`;
    document.head.append(style);
  }
  init();
})();
