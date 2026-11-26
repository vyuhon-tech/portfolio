/* Dinesh Doddaga — portfolio runtime. No dependencies. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const btn = $('#theme-btn');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const paint = () => { if (btn) { btn.innerHTML = isDark() ? ICON.sun : ICON.moon; btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'); } };
  const ICON = {
    moon: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 9.6A5.8 5.8 0 016.4 2.5a5.8 5.8 0 107.1 7.1z"/></svg>',
    sun: '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.4M8 13.1v1.4M14.5 8h-1.4M2.9 8H1.5M12.6 3.4l-1 1M4.4 11.6l-1 1M12.6 12.6l-1-1M4.4 4.4l-1-1"/></svg>'
  };
  if (btn) {
    paint();
    btn.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('dd-theme', root.dataset.theme); } catch (e) { }
      paint();
    });
  }

  /* ---------- nav + progress ---------- */
  const nav = $('.nav'), prog = $('.prog');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
    if (prog) { const h = document.documentElement.scrollHeight - innerHeight; prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'; }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- reveal (content is visible without JS; this only adds motion) ---------- */
  // Only elements that start below the fold get the entrance animation, and only once they scroll in.
  // If the observer never fires (hash jump, background tab), content simply stays visible.
  if ('IntersectionObserver' in window && !reduce && !location.hash) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(el => { if (el.getBoundingClientRect().top > innerHeight) io.observe(el); });
  }

  /* ---------- decision index filter ---------- */
  $$('[data-filters]').forEach(bar => {
    const list = $(bar.dataset.filters);
    const items = $$('li', list);
    $$('button', bar).forEach(b => {
      const f = b.dataset.f;
      const n = f === 'all' ? items.length : items.filter(li => li.dataset.tags.includes(f)).length;
      b.insertAdjacentHTML('beforeend', `<span>${n}</span>`);
      b.addEventListener('click', () => {
        $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b));
        items.forEach(li => li.hidden = !(f === 'all' || li.dataset.tags.includes(f)));
      });
    });
  });

  /* ---------- helpers ---------- */
  const seg = (el, cb) => $$('button', el).forEach(b => b.addEventListener('click', () => {
    $$('button', el).forEach(x => x.setAttribute('aria-pressed', x === b)); cb(b.dataset.v, b);
  }));
  const fmt = s => {
    s = Math.max(0, Math.round(s));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };
  const flip = (list, reorder, animate = true) => {
    const kids = [...list.children];
    const first = new Map(kids.map(k => [k, k.getBoundingClientRect().top]));
    reorder();
    if (reduce || !animate) return;
    kids.forEach(k => {
      const d = first.get(k) - k.getBoundingClientRect().top;
      if (!d) return;
      k.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.75,.2,1)' });
    });
  };

  const DEMOS = {};

  /* ---------- TAT Genie: the queue ---------- */
  DEMOS.queue = el => {
    const T = [
      { t: 'VPN dropping every 10 minutes — whole floor', s: 'INC-4821 · Finance · 14 users', p: 1, age: 12 * 60, sla: 9 * 60 },
      { t: 'New joiner account provisioning — starts Monday', s: 'INC-4779 · HR · onboarding', p: 2, age: 5 * 3600, sla: 35 * 60 },
      { t: 'Payroll portal returns 500 on timesheet submit', s: 'INC-4830 · HR', p: 1, age: 22 * 60, sla: 47 * 60 },
      { t: 'Outlook calendar not syncing across devices', s: 'INC-4788 · Finance', p: 3, age: 3 * 3600, sla: 118 * 60 },
      { t: 'Cannot access the shared drive', s: 'INC-4802 · Engineering', p: 3, age: 9 * 3600, sla: 890 * 60 },
      { t: 'Laptop replacement request', s: 'INC-4795 · Sales', p: 4, age: 36 * 3600, sla: 2200 * 60 }
    ];
    const list = $('.queue', el), foot = $('[data-out]', el), colLabel = $('[data-col]', el);
    T.forEach(x => {
      x.li = document.createElement('li');
      x.li.innerHTML = `<span class="q-time"></span><div><div class="q-title">${x.t}</div><div class="q-sub">${x.s}</div></div><span class="q-p p${x.p}">P${x.p}</span>`;
      list.appendChild(x.li);
    });
    let mode = el.dataset.start || 'age';
    const render = () => {
      T.forEach(x => {
        $('.q-time', x.li).textContent = mode === 'age' ? fmt(x.age).replace(/:\d\d$/, 'm').replace(/^0m$/, '<1m') : fmt(x.sla);
        x.li.classList.toggle('hot', mode === 'risk' && x.sla < 15 * 60);
      });
      if (colLabel) colLabel.textContent = mode === 'age' ? 'Open for' : 'SLA left';
    };
    const sort = (animate = true) => {
      flip(list, () => {
        const sorted = [...T].sort((a, b) => mode === 'age' ? b.age - a.age : a.sla - b.sla);
        sorted.forEach(x => list.appendChild(x.li));
        T.forEach(x => x.li.classList.toggle('first', x === sorted[0] && mode === 'risk'));
      }, animate);
      render();
      const outage = [...list.children].indexOf(T[0].li) + 1;
      foot.innerHTML = mode === 'age'
        ? `The whole-floor outage is <strong>row ${outage} of 6</strong>, under a laptop request. Agents scrolled and re-prioritised in their heads on every refresh.`
        : `The outage is <strong>row 1</strong>. Same tickets, same data — one ordering decision. A new joiner now works the queue like a senior agent.`;
    };
    seg($('.seg', el), v => { mode = v; sort(); });
    sort(false);
    setInterval(() => { T.forEach(x => { x.sla = Math.max(0, x.sla - 1); x.age += 1; }); render(); }, 1000);
  };

  /* ---------- MDM Genie: blast radius ---------- */
  DEMOS.blast = el => {
    const ACT = { lock: { n: 'Lock', sev: 1, rev: 'Reversible — the user unlocks with their credentials.' }, retire: { n: 'Retire', sev: 2, rev: 'Removes work data only. Personal data untouched.' }, wipe: { n: 'Remote wipe', sev: 3, rev: 'Irreversible. Device returns to factory state.' } };
    const TGT = { one: { n: 1, label: 'Dell XPS 15 — Tom V.', people: ['Tom V. · Finance'] }, field: { n: 12, label: 'Field Team', people: ['Arun K. · Field', 'Leela S. · Field', 'Imran P. · Field'] }, all: { n: 340, label: 'All Windows devices', people: ['Priya M. · HR', 'Ravi S. · Engineering', 'Meera K. · Sales'] } };
    let a = 'lock', t = 'one', timer = null;
    const out = $('[data-out]', el), conf = $('[data-confirm]', el);
    const render = () => {
      clearInterval(timer);
      const A = ACT[a], G = TGT[t];
      const level = A.sev === 3 && G.n > 1 ? 3 : (A.sev >= 2 || G.n > 1 ? 2 : 1);
      const word = `${A.n.split(' ').pop().toUpperCase()} ${G.n}`;
      out.innerHTML = `
        <div class="spread"><div><div class="label-s">Blast radius</div><div class="big-n" style="color:${level === 3 ? 'var(--risk)' : 'inherit'}">${G.n}</div><div class="muted" style="font-size:14px">device${G.n > 1 ? 's' : ''} · ${G.label}</div></div>
        <div style="text-align:right;font-size:13.5px;max-width:24ch" class="${A.sev === 3 ? 'no-ic' : 'muted'}">${A.rev}</div></div>
        <div style="margin-top:12px;display:grid;gap:6px">${G.people.map(p => `<div class="chip" style="justify-self:start">${p}</div>`).join('')}${G.n > 3 ? `<div class="muted mono" style="font-size:11px;text-transform:none">+ ${G.n - 3} more, each named before you confirm</div>` : ''}</div>`;
      if (level === 1) conf.innerHTML = `<button class="btn-s go" data-run>${A.n}</button><span class="muted" style="font-size:13.5px">Low consequence — one click.</span>`;
      else if (level === 2) conf.innerHTML = `<label class="row" style="font-size:14px"><input type="checkbox" data-ck> I've reviewed the ${G.n} affected device${G.n > 1 ? 's' : ''}</label><button class="btn-s go" data-run disabled>${A.n}</button>`;
      else conf.innerHTML = `<div style="width:100%"><div class="muted" style="font-size:13.5px;margin-bottom:6px">Type <strong style="color:var(--ink);font-family:var(--mono)">${word}</strong> to confirm</div><div class="row"><input class="input" style="max-width:220px" data-type aria-label="Type ${word} to confirm" autocomplete="off"><button class="btn-s danger" data-run disabled>${A.n}</button></div></div>`;
      const run = $('[data-run]', conf), ck = $('[data-ck]', conf), ty = $('[data-type]', conf);
      if (ck) ck.addEventListener('change', () => run.disabled = !ck.checked);
      if (ty) ty.addEventListener('input', () => run.disabled = ty.value.trim().toUpperCase() !== word);
      run.addEventListener('click', () => {
        let s = 10;
        const tick = () => {
          conf.innerHTML = `<div class="spread" style="width:100%"><span style="font-size:14px">Dispatching to ${G.n} device${G.n > 1 ? 's' : ''} in <strong class="mono" style="font-size:14px">${s}s</strong></span><button class="btn-s" data-undo>Undo</button></div>`;
          $('[data-undo]', conf).addEventListener('click', () => { clearInterval(timer); render(); });
        };
        tick();
        timer = setInterval(() => { s--; if (s <= 0) { clearInterval(timer); conf.innerHTML = `<span style="font-size:14px"><span class="ok-ic">●</span> Sent. Logged to the audit trail with your name.</span><button class="btn-s" data-reset>Reset</button>`; $('[data-reset]', conf).addEventListener('click', render); } else tick(); }, 1000);
      });
    };
    seg($('[data-act]', el), v => { a = v; render(); });
    seg($('[data-tgt]', el), v => { t = v; render(); });
    render();
  };

  /* ---------- TAT Genie: confidence-gated triage ---------- */
  DEMOS.triage = el => {
    const K = {
      pw: { q: '“Outlook keeps asking for my password since yesterday’s update. I’ve typed it correctly twenty times.”', who: 'Sneha K. · HR & Admin', c: 94, cat: 'Email & collaboration', route: 'Workplace Support', sig: ['outlook', 'password prompt', 'after update', 'known pattern ×37'] },
      pay: { q: '“Payroll portal gives a 500 error when I submit my timesheet. Deadline is today.”', who: 'Priya M. · HR', c: 71, cat: '?', route: '?', sig: ['500 error', 'payroll', 'deadline'], alt: ['Business applications', 'HR systems'] },
      fig: { q: '“Need admin rights on my laptop to install Figma plugins for the design review.”', who: 'Karthik R. · Product', c: 58, cat: '?', route: '?', sig: ['admin rights', 'install', 'policy-sensitive'], alt: ['Service request — software', 'Security exception'] }
    };
    const out = $('[data-out]', el);
    let n = 412;
    const show = k => {
      const x = K[k], auto = x.c >= 80;
      out.innerHTML = `
        <div class="box" style="margin-bottom:12px"><div style="font-size:15px;line-height:1.45">${x.q}</div><div class="mono muted" style="margin-top:8px;text-transform:none">${x.who}</div></div>
        <div class="spread" style="margin-bottom:6px"><span class="label-s">Model confidence</span><span class="mono" style="font-size:13px">${x.c}% <span class="muted">/ threshold 80%</span></span></div>
        <div class="conf-bar"><i style="width:0;background:${auto ? 'var(--ok)' : 'var(--warn)'}"></i></div>
        <div class="row" style="margin:12px 0">${x.sig.map(s => `<span class="chip">${s}</span>`).join('')}</div>
        <div data-res></div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => $('.conf-bar i', out).style.width = x.c + '%'));
      const res = $('[data-res]', out);
      if (auto) res.innerHTML = `<div class="principle" style="margin:0"><span class="mono">AUTO</span><p>Routed to <strong>${x.route}</strong>. Above threshold, so the SLA clock starts now and nobody spends time on a decision the model is sure about.</p></div>`;
      else {
        res.innerHTML = `<div class="box" style="border-color:var(--warn)"><h5 style="color:var(--warn)">Needs a human — the model is unsure between</h5><div class="row">${x.alt.map(a => `<button class="btn-s" data-pick="${a}">${a}</button>`).join('')}</div></div>`;
        $$('[data-pick]', res).forEach(b => b.addEventListener('click', () => {
          n++;
          res.innerHTML = `<div class="principle" style="margin:0"><span class="mono">LEARNED</span><p>Routed to <strong>${b.dataset.pick}</strong>. Your choice is saved as labelled example <span class="mono" style="font-size:12px">#${n}</span>, so correcting the model teaches it.</p></div>`;
        }));
      }
    };
    seg($('.seg', el), v => show(v));
    show('pw');
  };

  /* ---------- HRM Genie: sandwich-leave counter ---------- */
  DEMOS.leave = el => {
    const cal = $('.cal', el), out = $('[data-out]', el);
    const sel = new Set(); let type = 'casual';
    const BAL = { casual: 8, earned: 12 };
    // April 2026 starts on a Wednesday; grid starts Monday.
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(d => cal.insertAdjacentHTML('beforeend', `<div class="dow">${d}</div>`));
    cal.insertAdjacentHTML('beforeend', '<button class="blank" tabindex="-1" aria-hidden="true"></button>'.repeat(2));
    const dow = d => (d + 1) % 7; // 0=Mon … 5=Sat 6=Sun
    for (let d = 1; d <= 30; d++) {
      const we = dow(d) >= 5;
      cal.insertAdjacentHTML('beforeend', `<button data-d="${d}" class="${we ? 'we' : ''}" ${we ? 'aria-disabled="true"' : ''} aria-label="April ${d}">${d}</button>`);
    }
    const render = () => {
      const sand = new Set();
      if (type === 'casual') for (let d = 1; d <= 30; d++) if (dow(d) === 5) { // Saturday
        const fri = d - 1, mon = d + 2;
        if (sel.has(fri) && sel.has(mon)) { sand.add(d); sand.add(d + 1); }
      }
      $$('[data-d]', cal).forEach(b => { const d = +b.dataset.d; b.classList.toggle('sel', sel.has(d)); b.classList.toggle('sand', sand.has(d)); b.setAttribute('aria-pressed', sel.has(d)); });
      const total = sel.size + sand.size;
      out.innerHTML = `
        <div class="label-s">Deducted</div>
        <div class="big-n" style="margin:6px 0 4px">${total}<span style="font-size:18px;letter-spacing:0" class="muted"> day${total === 1 ? '' : 's'}</span></div>
        <div style="font-size:14px" class="muted">${sel.size} picked${sand.size ? ` + <span class="no-ic" style="font-weight:600">${sand.size} weekend days (sandwich rule)</span>` : ''}</div>
        <div style="margin-top:16px" class="label-s">${type === 'casual' ? 'Casual' : 'Earned'} balance after</div>
        <div style="font-size:22px;font-weight:600;letter-spacing:-.02em;margin-top:4px;color:${BAL[type] - total < 0 ? 'var(--risk)' : 'inherit'}">${BAL[type] - total} left</div>`;
    };
    cal.addEventListener('click', e => {
      const b = e.target.closest('[data-d]'); if (!b || b.classList.contains('we')) return;
      const d = +b.dataset.d; sel.has(d) ? sel.delete(d) : sel.add(d); render();
    });
    seg($('.seg', el), v => { type = v; render(); });
    render();
  };

  /* ---------- QA Genie: batch review that can't sweep flagged cases ---------- */
  DEMOS.review = el => {
    const G = [
      ['Functional', [['Valid credentials redirect to dashboard'], ['Session persists across refresh'], ['Sign out clears the session cookie'], ['Reset email is sent on request']]],
      ['Negative', [['Wrong password shows a generic error', 'DOMAIN JUDGEMENT'], ['Expired reset token is rejected'], ['SQL injection in email is sanitised']]],
      ['Boundary', [['Password at 8 characters is accepted'], ['Password at 128 characters is accepted'], ['Email at 254 characters is accepted', 'NEAR-DUPLICATE']]],
      ['Validation', [['Malformed email rejected before submit'], ['Required-field message on empty submit', 'LOW CONFIDENCE']]]
    ];
    const box = $('[data-groups]', el), stat = $('[data-out]', el);
    let clicks = 0;
    const state = new Map();
    const draw = () => {
      box.innerHTML = G.map(([name, cs], gi) => {
        const open = cs.filter((c, i) => !c[1] && !state.has(`${gi}-${i}`)).length;
        return `<div class="rv-group"><header><span style="font-weight:600;font-size:14px">${name} <span class="muted mono" style="font-size:11px">${cs.length} generated</span></span>
          <button class="btn-s" data-g="${gi}" ${open ? '' : 'disabled'} style="padding:6px 10px;font-size:13px">${open ? `Approve ${open} unflagged` : 'Batch done'}</button></header>
          ${cs.map((c, i) => {
          const k = `${gi}-${i}`, s = state.get(k); return `<div class="rv-item ${s === 'ok' ? 'ok' : ''}"><span>${c[0]}${c[1] ? `<span class="flag">${c[1]}</span>` : ''}</span>
            <span class="row" style="gap:4px">${s ? `<span class="mono" style="font-size:11px;color:${s === 'ok' ? 'var(--ok)' : 'var(--risk)'}">${s === 'ok' ? 'APPROVED' : 'REJECTED'}</span>` : `<button class="btn-s" data-i="${k}" data-s="ok" aria-label="Approve" style="padding:4px 9px">✓</button><button class="btn-s" data-i="${k}" data-s="no" aria-label="Reject" style="padding:4px 9px">✕</button>`}</span></div>`;
        }).join('')}</div>`;
      }).join('');
      const total = G.reduce((n, g) => n + g[1].length, 0), ok = [...state.values()].filter(v => v === 'ok').length, no = state.size - ok;
      stat.innerHTML = `<strong>${ok}</strong> approved · <strong>${no}</strong> rejected · <strong>${total - state.size}</strong> left · <strong>${clicks}</strong> clicks` + (total === state.size ? ` — <span class="ok-ic">12 cases reviewed in ${clicks} clicks, and every flagged one had a human look at it.</span>` : '');
    };
    box.addEventListener('click', e => {
      const g = e.target.closest('[data-g]'), i = e.target.closest('[data-i]');
      if (g) { clicks++; G[+g.dataset.g][1].forEach((c, k) => { if (!c[1]) state.set(`${g.dataset.g}-${k}`, 'ok'); }); draw(); }
      if (i) { clicks++; state.set(i.dataset.i, i.dataset.s); draw(); }
    });
    $('[data-reset]', el).addEventListener('click', () => { state.clear(); clicks = 0; draw(); });
    draw();
  };

  /* ---------- Sendcrux: spinner vs verified checklist ---------- */
  DEMOS.setup = el => {
    const C = [['Domain ownership', 'sales.company.com'], ['SPF record', 'v=spf1 include:_sc.io ~all'], ['DKIM record', 'sc._domainkey · 2048-bit'], ['DMARC policy', 'p=quarantine'], ['MX records', 'priority 10, 20'], ['Mailbox provisioned', 'Google Workspace · 3 seats'], ['Test send', 'delivered to inbox in 1.4s']];
    const out = $('[data-out]', el), go = $('[data-run]', el), foot = $('[data-foot]', el);
    let mode = 'v2', timers = [];
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const idle = () => {
      clear(); go.disabled = false;
      out.innerHTML = mode === 'v1'
        ? `<div style="text-align:center;padding:28px 0" class="muted">One button. One spinner.</div>`
        : `<ul class="checks">${C.map(c => `<li><span class="ic"></span><span>${c[0]}<code>${c[1]}</code></span><span class="st">waiting</span></li>`).join('')}</ul>`;
      foot.innerHTML = 'Run both. They take <strong>exactly the same time</strong>.';
    };
    const run = () => {
      go.disabled = true; const step = 500;
      if (mode === 'v1') {
        out.innerHTML = `<div style="text-align:center;padding:4px 0 20px"><div class="spinner-big"></div><div class="muted" style="font-size:14px">Setting up your domain…</div></div>`;
        timers.push(setTimeout(() => { out.innerHTML = `<div style="text-align:center;padding:28px 0"><div style="font-size:18px;font-weight:600">✓ All set</div><div class="muted" style="font-size:14px;margin-top:6px">…but is it? Which records? Did DMARC actually propagate?</div></div>`; foot.innerHTML = 'Done — and the user still can’t answer <strong>“is my infrastructure correct?”</strong> without contacting support.'; go.disabled = false; }, step * C.length + 300));
      } else {
        out.innerHTML = `<ul class="checks">${C.map(c => `<li><span class="ic"></span><span>${c[0]}<code>${c[1]}</code></span><span class="st">waiting</span></li>`).join('')}</ul>`;
        const lis = $$('li', out);
        lis.forEach((li, i) => {
          timers.push(setTimeout(() => { li.classList.add('run'); $('.st', li).textContent = 'checking'; }, i * step));
          timers.push(setTimeout(() => { li.classList.remove('run'); li.classList.add('done'); $('.ic', li).textContent = '✓'; $('.st', li).textContent = 'verified'; }, i * step + step - 60));
        });
        timers.push(setTimeout(() => { foot.innerHTML = 'Same duration. The work is automated — <strong>the reasoning isn’t hidden</strong>. Users can verify their own setup.'; go.disabled = false; }, step * C.length + 300));
      }
    };
    seg($('.seg', el), v => { mode = v; idle(); });
    go.addEventListener('click', run);
    idle();
  };

  $$('[data-demo]').forEach(el => { try { DEMOS[el.dataset.demo] && DEMOS[el.dataset.demo](el); } catch (e) { console.error(e); } });


  /* ---------- Stacked work cards: a covered card recedes ---------- */
  (function stackCards() {
    const rows = $$('.work-row');
    if (rows.length < 2 || reduce) return;
    const mq = matchMedia('(min-width: 900px)');
    let ticking = false;
    const update = () => {
      ticking = false;
      if (!mq.matches || document.documentElement.dataset.brand !== 'd') { rows.forEach(r => r.classList.remove('is-stacked')); return; }
      rows.forEach((r, i) => {
        const next = rows[i + 1];
        const covered = next && next.getBoundingClientRect().top - r.getBoundingClientRect().top < 120;
        r.classList.toggle('is-stacked', !!covered);
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();
  })();

  /* ---------- Shipped-products marquee: accessible pause ---------- */
  $$('.ship-strip').forEach(strip => {
    const btn = $('.mq-pause', strip); if (!btn) return;
    const PAUSE = '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3" height="10" rx="1"/><rect x="8" y="2" width="3" height="10" rx="1"/></svg>';
    const PLAY = '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M4 2.5v9l7.5-4.5z"/></svg>';
    const set = paused => { strip.classList.toggle('paused', paused); btn.innerHTML = paused ? PLAY : PAUSE; btn.setAttribute('aria-label', paused ? 'Play product marquee' : 'Pause product marquee'); };
    set(reduce);
    btn.addEventListener('click', () => set(!strip.classList.contains('paused')));
  });


  /* ---------- Case-study chapter bar: scrollspy + reading progress ---------- */
  (function chapterBar() {
    const bar = $('.chap-bar'); if (!bar) return;
    const links = $$('a', bar), prog = $('.chap-progress', bar);
    const secs = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = innerHeight * 0.28;
      let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= y) cur = i; });
      links.forEach((a, i) => {
        const on = i === cur;
        if (on && a.getAttribute('aria-current') !== 'true') {
          a.setAttribute('aria-current', 'true');
          const ol = a.closest('ol'); const r = a.getBoundingClientRect(), o = ol.getBoundingClientRect();
          if (r.left < o.left || r.right > o.right) ol.scrollBy({ left: r.left - o.left - 16, behavior: reduce ? 'auto' : 'smooth' });
        } else if (!on) a.removeAttribute('aria-current');
      });
      const first = secs[0].getBoundingClientRect().top + scrollY, last = secs[secs.length - 1];
      const end = last.getBoundingClientRect().bottom + scrollY - innerHeight;
      if (prog) prog.style.width = Math.min(100, Math.max(0, (scrollY - first + innerHeight * .3) / (end - first + innerHeight * .3) * 100)) + '%';
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();
  })();


  /* ---------- Contact page: clock, copy, composer, chat shortcut ---------- */
  (function contactPage() {
    const clock = $('#ct-clock');
    if (clock) {
      const fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
      const tick = () => { clock.textContent = fmt.format(new Date()) + ' IST'; };
      tick(); setInterval(tick, 30000);
    }
    $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
      const text = btn.dataset.copy, out = $('.ct-copied');
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); try { ok = document.execCommand('copy'); } catch (e2) { } ta.remove();
      }
      const label = btn.textContent;
      btn.textContent = ok ? 'Copied ✓' : 'Copy failed';
      if (out) out.textContent = ok ? 'Email address copied to your clipboard.' : 'Couldn’t copy. Select the address above instead.';
      setTimeout(() => { btn.textContent = label; if (out) out.textContent = ''; }, 2200);
    }));
    $$('[data-open-ask]').forEach(b => b.addEventListener('click', () => { const l = $('.pp-launch'); if (l) l.click(); }));
    const form = $('[data-compose]');
    if (form) {
      const to = form.dataset.compose, send = $('.ct-send', form), subj = $('[data-subject]', form);
      let topic = $('[data-topic][aria-pressed="true"]', form).dataset.topic;
      const build = () => {
        const name = form.name.value.trim(), company = form.company.value.trim(), msg = form.message.value.trim();
        const subject = topic + (company ? ' · ' + company : '') + (name ? ' — from ' + name : '');
        const body = (msg || 'Hi Dinesh,\n\n') + (name ? '\n\n— ' + name + (company ? ', ' + company : '') : '');
        subj.textContent = subject;
        send.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      };
      $$('[data-topic]', form).forEach(b => b.addEventListener('click', () => {
        $$('[data-topic]', form).forEach(x => x.setAttribute('aria-pressed', x === b)); topic = b.dataset.topic; build();
      }));
      form.addEventListener('input', build);
      form.addEventListener('submit', e => { e.preventDefault(); send.click(); });
      build();
    }
  })();

  /* ---------- "Ask Dinesh": docked assistant panel (every portfolio page) ----------
     Pattern: pill launcher bottom-right -> tall panel docked right, with a portrait
     card, greeting, conversation, suggestion chips, a text box and a disclaimer.
     Not an AI: typed questions are matched to pre-written answers by keywords,
     and nothing typed leaves the page. */
  (function askDinesh() {
    if (!$('.actionbar')) return; // not on the private strategy page

    /* ===== Knowledge base =====
       Every answer is written from Dinesh's own portfolio, case studies, contact page
       and LinkedIn recommendations. Nothing here is generated.
       k: keywords (multi-word phrases score higher; words of 3 letters or fewer match whole-word only)
       chip: if present, offered as a suggested question */
    const RESUME = 'https://drive.google.com/file/d/1SwlCIj8xUU9p1UfvICVA8wsCw5PXuMBz/view?usp=sharing';
    const LINKEDIN = 'https://www.linkedin.com/in/dinesh-doddaga-579a3a19a/';
    const MAIL = 'mailto:dineshdoddaga@gmail.com';
    const KB = [
      /* ---------- small talk ---------- */
      {
        id: 'hello', k: ['hi', 'hello', 'hey', 'hii', 'hola', 'namaste', 'good morning', 'good afternoon', 'good evening', 'yo'],
        a: 'Hi! 👋 Ask me anything about my work, experience, skills or availability. Each answer links to the proof.'
      },
      {
        id: 'howareyou', k: ['how are you', 'how are you doing', 'how r u', 'how is it going', 'how’s it going', "how's it going", 'hows it going', 'whats up', "what's up", 'wassup', 'sup', 'how do you do', 'how have you been', 'are you there', 'you there'],
        a: 'All good, thanks for asking! 😊 I’m happy to walk you through my work. Try “Tell me about yourself”, “What projects have you worked on?”, or ask about my experience, skills or availability.'
      },
      {
        id: 'thanks', k: ['thanks', 'thank you', 'thx', 'great', 'awesome', 'cool', 'nice', 'perfect', 'helpful'],
        a: 'Glad it helped. If you’d like to keep talking, email me and I’ll reply myself.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Email me directly', href: MAIL }
      },

      /* ---------- who I am ---------- */
      {
        id: 'intro', chip: 'What kind of designer are you?',
        k: ['kind of designer', 'what kind', 'who are you', 'about you', 'about yourself', 'yourself', 'introduce', 'introduction', 'tell me about you', 'your name', 'what do you do', 'describe yourself', 'summary', 'elevator pitch', 'specialis', 'speciali', 'type of designer', 'designer are you'],
        a: 'I’m Dinesh Doddaga, a product designer in Bengaluru. I design software that makes decisions people can trust: AI ticket triage, device security, HR policy engines and email infrastructure. I map the rules and the data model before I draw a screen. I was usually the only designer, so I also wrote the specs, made scope calls as acting PM, and shipped front-end code.',
        proof: { kind: 'link', label: 'Five case studies', sub: 'MDM · TAT · HRM · QA Genie · Sendcrux', href: 'index.html#work' }
      },
      {
        id: 'experience', chip: 'How many years of experience do you have?',
        k: ['years of experience', 'how many years', 'experience', 'how long', 'yoe', 'seniority', 'level', 'senior', 'career', 'journey', 'background', 'work history', 'trajectory', 'timeline'],
        a: 'About four years. I started as a UI/UX design intern in December 2022, did contract product design in 2023, was Product Designer at Sendcrux Labs from August 2023 to November 2024, and have been Product Designer and acting PM at Brilyant IT Solutions since December 2024. The scope I was given kept growing faster than my years: I went from scoping projects alone to owning whole product suites.',
        proof: { kind: 'link', label: 'Full trajectory', sub: 'About page · every role with dates', href: 'about' }
      },
      {
        id: 'current', chip: 'Where do you work now?',
        k: ['!current company', 'currently', '!current role', 'where do you work', 'working now', '!brilyant', 'employer', 'job now', 'right now', 'current job', 'which company', 'present company', '!where are you working', '!working currently', 'at brilyant'],
        a: 'Since December 2024 I’ve been Product Designer and acting Product Manager at Brilyant IT Solutions in Bengaluru. I’m the sole designer across the company’s enterprise suite: HRM Genie, MDM Genie, TAT Genie, QA Genie, a Sales CRM, IT asset management, purchase and benefits portals, and an intranet. I write the requirements, design end to end, and ship production UI. I also built the design system the product teams use.',
        proof: { kind: 'link', label: 'Brilyant work', sub: 'MDM · TAT · HRM · QA Genie case studies', href: 'index.html#work' }
      },
      {
        id: 'sendcrux-role', k: ['!sendcrux labs', '!previous company', '!previous job', '!last company', '!before brilyant', 'hyderabad', 'prior role'],
        a: 'Before Brilyant, I was Product Designer at Sendcrux Labs in Hyderabad, from August 2023 to November 2024. I owned design across web, dashboard and mobile for a full email-infrastructure stack. I took WarmupIP from concept to production and then designed the Sendcrux platform around it. Both are live. I also worked on client projects there: a luxury fashion e-commerce store and hospital operations tooling.',
        proof: { kind: 'link', label: 'Sendcrux & WarmupIP', sub: 'Case study 05 · live at sendcrux.com', href: 'sendcrux' }
      },
      {
        id: 'freelance', k: ['!freelance', '!freelancing', '!contract', '!contractor', 'independent', 'clients', 'client work', 'consulting', 'side project'],
        a: 'From April to July 2023 I worked independently as a contract product designer, taking projects from brief to production handoff on my own. They included an employee purchase portal with multi-level approvals and four role-based dashboards, a mentoring platform (discovery, booking, live events, payments), a freelancer recruitment portal, a hospitality management suite and a dockyard ship-services platform. That’s where I learned to scope ruthlessly, because nobody else was going to do it.',
        proof: { kind: 'link', label: 'Trajectory', sub: 'About page', href: 'about' }
      },
      {
        id: 'early', k: ['!intern', '!internship', '!first job', 'start your career', 'started', 'beginning', '!victaman', '!aureum', 'fresher', 'early career', 'how did you start'],
        a: 'I started in December 2022 as a UI/UX designer and design intern at VictaMan Services and Aureum Network, across Bengaluru and Hyderabad. I worked on a 3D home-modelling and contractor-booking app (DesignMyHouse), a property marketplace (ePropertyMall), digital billboard booking (DSmart Ads) and a crypto investment dashboard. That’s where I learned to ship rather than polish.',
        proof: { kind: 'link', label: 'Trajectory', sub: 'About page', href: 'about' }
      },
      {
        id: 'education', chip: 'What’s your education?',
        k: ['!education', '!degree', '!college', '!university', 'study', 'studied', '!qualification', 'graduat', '!b.tech', '!btech', '!bachelor', 'computer science', 'cse', 'school'],
        a: 'I have a B.Tech in Computer Science & Engineering from Sri Venkatesa Perumal College (2022). A CS background is a big part of why I can ship front-end code and talk through data models with engineers.',
        proof: { kind: 'link', label: 'About me', sub: 'Background and trajectory', href: 'about' }
      },
      {
        id: 'location', chip: 'Are you open to remote or relocation?',
        k: ['location', '!where are you based', 'based', 'city', 'bengaluru', 'bangalore', 'india', '!remote', '!hybrid', 'onsite', 'on-site', 'office', '!relocat', 'move', '!timezone', 'time zone', 'ist', 'abroad', 'visa', 'country'],
        a: 'I’m based in Bengaluru, India (IST, UTC+5:30). Remote, hybrid or relocation all work for me, and I’ve shipped entirely remote before.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Tell me about the role', href: MAIL }
      },
      {
        id: 'availability', chip: 'When can you start?',
        k: ['available', 'availability', '!notice', '!notice period', '!join', '!joining', 'start date', '!when can you start', 'immediately', 'how soon', 'open to work', 'actively looking', 'job search'],
        a: 'I’m open to senior product design roles and available to talk now. I’m currently at Brilyant IT Solutions, so standard notice applies. Email me with your timeline and I’ll give you an exact date.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Share your timeline', href: MAIL }
      },
      {
        id: 'salary', k: ['!salary', '!ctc', '!compensation', 'pay', 'expected salary', 'expectation', 'package', '!lpa', 'rate', 'hourly', 'budget', 'money', 'stipend'],
        a: 'I’d rather talk compensation directly than put a number in a chatbot, because it depends on the role, level and location. Email me and I’ll answer straight away.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'I’ll reply personally', href: MAIL }
      },
      {
        id: 'contact', chip: 'How can I contact you?',
        k: ['!contact', 'reach you', 'reach out', 'email', 'mail', 'phone', 'call', '!whatsapp', '!phone number', 'mobile number', '!linkedin', '!behance', 'dribbble', 'social', 'profiles', '!resume', '!résumé', '!cv', 'get in touch', 'talk to you', 'connect', 'schedule', 'meeting'],
        a: 'Email is the best way to reach me, and I reply personally. You can also check my résumé, my LinkedIn recommendations and my Behance.',
        proof: {
          kind: 'links', items: [
            { label: 'Contact page →', sub: 'Résumé, LinkedIn, email and a quick composer', href: 'contact.html' },
            { label: 'dineshdoddaga@gmail.com', sub: 'Email · best for detail', href: MAIL },
            { label: 'Résumé (PDF) ↗', sub: 'One page: history, tools, education', href: RESUME, ext: true },
            { label: 'LinkedIn ↗', sub: 'Recommendations and full role detail', href: LINKEDIN, ext: true },
            { label: 'Behance ↗', sub: 'Visual work and project shots', href: 'https://www.behance.net/dineshdoddaga', ext: true }]
        }
      },
      {
        id: 'next', chip: 'What are you looking for next?',
        k: ['!looking for', 'next role', 'what next', 'next', 'ideal role', 'dream job', 'what kind of role', 'kind of company', 'type of company', 'domain', 'industry', 'goal', 'goals', 'future', 'career goal', 'why are you leaving', '!why leave', 'why switch', 'why change', '!leaving'],
        a: 'A senior product design role where I own a surface end to end, on a product that has to earn trust: AI-native tools, security, infrastructure or complex B2B. Being the only designer taught me speed and ownership. Now I want depth, and colleagues who are better than me at things I’m not good at yet.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Email me directly', href: MAIL }
      },
      {
        id: 'whyhire', chip: 'Why should we hire you?',
        k: ['!why should we hire', '!why hire', 'why you', '!what makes you different', '!how are you different', '!different from other', '!different from others', 'unique', 'stand out', 'value', 'bring to', 'fit', 'convince', 'sell yourself', 'best at'],
        a: 'Three things. First, I find the real problem: on MDM Genie research showed the issue was trust, not complexity, and adding one honest step took opt-in from 42% to 79% in testing. Second, I own product calls: I traded two features to build HRM Genie’s rule engine and defended it in planning. Third, I ship: I write specs and production front-end code, so less is lost between design and what goes live.',
        proof: { kind: 'link', label: 'The Decision Index', sub: '16 decisions I’d defend in an interview', href: 'index.html#decisions' }
      },

      /* ---------- how I work ---------- */
      {
        id: 'ai', chip: 'How do you design for AI?',
        k: ['!ai', '!artificial intelligence', '!machine learning', '!ml', '!llm', '!gpt', 'model', 'automation', 'automate', 'agent', '!agentic', 'confidence', 'human in the loop', '!genai', 'generative'],
        a: 'I treat trust as the design material. Let the model act on its own only above a confidence threshold. Show what it matched and what it missed. Let people edit the inputs. Make every correction count as training data. I’ve shipped this in three products: AI ticket triage (TAT Genie), AI candidate ranking (HRM Genie) and AI test generation (QA Genie). People ignore an AI output they can’t question, however accurate it is.',
        proof: { kind: 'link', label: 'Confidence-gated AI triage', sub: 'TAT Genie · Decision 02 · 25,000+ tickets', href: 'tat#d2' }
      },
      {
        id: 'process', chip: 'What’s your design process?',
        k: ['process', 'approach', 'methodology', 'how do you work', 'how you work', 'workflow', 'framework', 'philosophy', 'principles', 'belief', 'way of working', 'design thinking', 'how do you design', 'start a project'],
        a: 'I start with the rules, not the screens. In enterprise software, the policy, the exceptions and the data model are the product, so I map them before drawing a frame. Then I research with the people who actually operate the tool, prototype, test, and argue for trade-offs with evidence. I give admin and configuration screens the same care as user-facing flows, and I build what I design, because implementing a design shows me which decisions were expensive.',
        proof: { kind: 'link', label: 'Four beliefs, each from a mistake', sub: 'Home · How I work', href: 'index.html#decisions' }
      },
      {
        id: 'research', chip: 'How do you do user research?',
        k: ['!research', '!user research', 'interview', 'interviews', '!usability', 'user testing', 'testing', 'survey', 'contextual inquiry', 'shadowing', 'synthesis', 'affinity', 'personas', 'discovery', 'insights', 'participants'],
        a: 'Mostly in context: watching people work in their real tools rather than asking them to describe it. On HRM Genie I interviewed 32 people (8 HR managers and 24 employees) and ran 12 moderated usability sessions. On MDM Genie I did contextual inquiry with 5 IT admins and synthesised about 180 observations. For Sendcrux I researched 62 users (15 interviews and 47 survey responses). I always state sample sizes and limitations, because a small study can show direction but not size.',
        proof: { kind: 'link', label: 'Research that reversed the brief', sub: 'MDM Genie · the finding', href: 'mdm' }
      },
      {
        id: 'tools', chip: 'What tools and skills do you use?',
        k: ['!tools', 'tool', '!figma', 'software', '!skills', 'skill', 'stack', 'tech stack', 'tech', 'proficient', 'expertise', 'competenc', 'framer', 'prototype', 'prototyping', 'adobe', 'sketch', 'what do you use', 'design tools', 'capabilities'],
        a: 'Figma for design and prototyping. I also ship production front-end code, turning my Figma specs into working components with AI-assisted development tools. My core skills are product strategy and PRDs, research and usability testing, information architecture, design systems and shipping production UI. The interactive demos on this site are code I wrote myself. My résumé lists the full toolset.',
        proof: {
          kind: 'links', items: [
            { label: 'Résumé (PDF) ↗', sub: 'Full tools and education', href: RESUME, ext: true },
            { label: 'Live demos I coded', sub: 'Try the blast-radius demo in MDM Genie', href: 'mdm#d2' }]
        }
      },
      {
        id: 'code', k: ['!code', '!coding', 'developer', 'develop', 'front-end', 'frontend', 'html', 'css', '!javascript', '!react', 'engineering skills', 'technical', 'build', 'ship code', 'implement', 'programming'],
        a: 'Yes, I write front-end code. I ship production UI alongside the Figma work, turning specs into working components with AI-assisted development tools, and I have a computer science degree. Building what I design shows me which decisions are expensive before engineering has to tell me. Every interactive demo on this site is code I wrote.',
        proof: { kind: 'link', label: 'A demo I built', sub: 'MDM Genie · blast-radius preview', href: 'mdm#d2' }
      },
      {
        id: 'pm', chip: 'Have you worked as a product manager?',
        k: ['!product manager', '!acting pm', 'pm', 'product management', 'requirements', '!prd', '!prds', '!roadmap', 'scope', 'scoping', 'prioriti', 'backlog', 'strategy', 'product strategy', 'business', 'product thinking', 'stakeholder'],
        a: 'Yes, as acting PM on HRM Genie, MDM Genie and QA Genie. I ran discovery, wrote requirements, sequenced releases and made scope trade-offs with engineering. Two examples: on MDM Genie I cut several hundred possible device controls down to 73 that map to real compliance audits. On HRM Genie I traded two features to fund a rule engine. On TAT Genie a separate PM owned the backlog, and I changed the roadmap by showing evidence.',
        proof: { kind: 'link', label: 'Rule engine trade-off', sub: 'HRM Genie · Decision 03', href: 'hrm#d3' }
      },
      {
        id: 'collab', chip: 'How do you work with PMs and engineers?',
        k: ['work with', '!collaborat', 'team', 'teamwork', 'engineers', 'engineer', 'developers', '!cross-functional', 'cross functional', 'handoff', 'hand off', 'communication', 'communicate', 'influence', 'disagree with pm', 'work with others', '!work with engineers'],
        a: 'On TAT Genie I didn’t own the backlog; the product had its own PM. A research finding about how the queue was ordered still changed the roadmap, because I could show it working instead of just arguing for it. With engineers, the fact that I ship code means my specs are realistic and I can talk through data models and edge cases in their terms.',
        proof: { kind: 'quote', label: '“…the design force that brought every single idea to life.”', sub: 'S Jagadesh · my product manager for about a year' }
      },
      {
        id: 'designsystem', k: ['!design system', '!component library', 'components', 'tokens', 'ui kit', 'consistency', 'style guide'],
        a: 'I built the design system at Brilyant from scratch, with a component library and tokens that the company’s product teams use. Its value is what it enabled: one designer could keep five enterprise platforms consistent, and specs became working components faster.',
        proof: { kind: 'link', label: 'Trajectory', sub: 'About page · Brilyant', href: 'about' }
      },
      {
        id: 'decision', chip: 'Tell me about a decision you had to defend.',
        k: ['decision', '!defend', '!trade-off', '!tradeoff', 'trade off', 'push back', 'pushback', 'conflict', '!disagree', '!tough call', 'hard call', 'difficult decision', 'convinced', 'challenge', 'challenging', 'hardest', '!tough decision'],
        a: 'On HRM Genie, every stakeholder said approvals went “manager, then HR”. Shadowing found at least four routes. I pushed for a rule engine instead of a fixed chain. It roughly tripled the module’s estimate, so I defended it in planning as acting PM and cut two lower-value features to fund it. A fixed chain would have pushed every exception back into email, which was the problem we were solving.',
        proof: { kind: 'link', label: 'Rule engine over a fixed chain', sub: 'HRM Genie · Decision 03', href: 'hrm#d3' }
      },
      {
        id: 'mistake', chip: 'What’s your biggest mistake?',
        k: ['!mistake', '!fail', '!failure', 'failed', 'wrong', 'regret', '!weakness', 'weaknesses', 'learned', 'lesson', 'differently', 'improve', 'area of improvement', 'growth area', 'what went wrong'],
        a: 'On HRM Genie I gave the employee flows my best attention and treated the HR admin screens as a settings dump. Admins struggled most in testing, and I rebuilt those screens in round two. Now I scope the admin surface as a product in its own right. My other recurring lesson: define success metrics before building. Too many of my numbers are stakeholder-reported rather than measured, and I’m fixing that.',
        proof: { kind: 'link', label: 'What I got wrong', sub: 'HRM Genie · In hindsight', href: 'hrm#role' }
      },
      {
        id: 'strength', k: ['!strength', '!strengths', 'good at', 'superpower', 'best skill', 'what are you best'],
        a: 'Turning messy, rule-heavy domains into interfaces people can operate and trust. I spot when the brief is wrong (MDM’s real problem was trust, not complexity), I can make and defend product trade-offs, and I can take a design all the way to production code.',
        proof: { kind: 'link', label: 'MDM Genie', sub: 'When research reversed the brief', href: 'mdm' }
      },
      {
        id: 'numbers', chip: 'Can I trust your numbers?',
        k: ['trust your numbers', 'your numbers', 'numbers', 'metric', 'metrics', 'data', 'impact', 'measure', 'measured', 'result', 'results', 'outcome', 'outcomes', 'kpi', 'proof', 'evidence', 'roi', 'achievement', 'achievements', 'accomplish', 'success'],
        a: 'Every number on this site is graded: measured, usability-tested, stakeholder-reported, or scope. Highlights: 42% → 79% willingness to enrol after one added step (tested, n=5). Time to first campaign cut from 2–3 hours to 15 minutes (measured). 25,000+ tickets on TAT Genie (production). 1,000+ employees on HRM Genie (production). I say where a number is small or self-reported.',
        proof: { kind: 'ev', label: '42% → 79%', sub: 'stated willingness to enrol · MDM Genie', ev: 2, evText: 'Tested · n=5', href: 'mdm#d1' }
      },
      {
        id: 'recs', k: ['!recommendation', 'recommendations', 'reference', '!references', '!testimonial', '!testimonials', 'feedback', 'what do others say', 'what people say', 'manager say', 'colleagues', 'reviews', 'endorse', '!say about you', '!managers say', '!people say'],
        a: 'Six people recommended me on LinkedIn: two managers, my product manager, a strategy director I worked with, and two clients. My PM, S Jagadesh, called me “one of the most well-rounded UX/UI designers” he’d worked with. Nagi Reddy B, founder of WarmupIP, who managed me directly, highlighted how fast I grasp requirements. Pavan Kumar PVS (Director of Strategy at Fiserv) mentioned the speed and quality of my work.',
        proof: {
          kind: 'links', items: [
            { label: 'All recommendations', sub: 'About page · relationship and date on each', href: 'about' },
            { label: 'Verify on LinkedIn ↗', sub: 'Public and checkable', href: LINKEDIN, ext: true }]
        }
      },
      {
        id: 'projects', chip: 'What projects have you worked on?',
        k: ['projects', 'project', 'portfolio', 'work samples', 'case study', 'case studies', 'products', 'what have you built', 'what have you designed', 'shipped', 'best work', 'favourite project', 'favorite project', 'proudest', 'show me'],
        a: 'Five case studies: MDM Genie (cross-platform device security), TAT Genie (AI IT service desk, 25,000+ tickets), HRM Genie (12-module HR platform for 1,000+ people), QA Genie (AI test generation and review) and Sendcrux & WarmupIP (live email infrastructure). I’ve also shipped a Sales CRM, IT asset management for 1,000+ assets, purchase and benefits portals, an intranet and a design system, plus client work in e-commerce, healthcare, mentoring, hospitality and real estate.',
        proof: { kind: 'link', label: 'Five case studies', sub: 'Home · Selected work', href: 'index.html#work' }
      },
      {
        id: 'other', k: ['!crm', 'sales crm', '!asset management', 'it asset', '!intranet', 'benefits portal', 'purchase portal', '!e-commerce', '!ecommerce', 'fashion', '!hospital', '!healthcare', '!mentoring', '!hospitality', '!real estate', 'property', 'ship services', '!crypto', '!mobile app', 'mobile', 'ios', 'android app', 'b2c', 'consumer', '!mobile apps'],
        a: 'Beyond the five case studies: at Brilyant, a Sales CRM, IT asset management for 1,000+ assets, a customer purchase portal that removed the sales team from the transaction, an employee benefits portal and an intranet. At Sendcrux, iOS and Android companion apps, plus client work on luxury fashion e-commerce and hospital operations tooling. Freelance, a mentoring platform, a hospitality suite, a recruitment portal and a ship-services platform. Early on, real estate and crypto products.',
        proof: { kind: 'link', label: 'Trajectory', sub: 'About page · full list', href: 'about' }
      },

      /* ---------- projects ---------- */
      {
        id: 'mdm', k: ['!mdm', '!mdm genie', 'device', 'devices', '!device management', '!byod', 'security', 'enrol', 'enroll', 'enrolment', 'enrollment', 'android', 'windows', 'apple', 'policy builder', 'remote wipe', 'blast radius', 'compliance monitor', 'it admin'],
        a: 'MDM Genie is one console that manages Android, Windows and Apple devices. The brief said admins had a complexity problem. Research showed employees had a trust problem: they finished the enrolment flow and still refused to enrol their phones. I added a step showing what IT can and can never see, and stated willingness rose from 42% to 79%. I also built blast-radius previews for destructive actions and one policy form for three OSes (73 policies).',
        proof: { kind: 'link', label: 'MDM Genie case study', sub: '01 · Device security · 6 min', href: 'mdm' }
      },
      {
        id: 'tat', k: ['!tat', '!tat genie', '!itsm', '!service desk', '!helpdesk', 'help desk', '!ticket', '!tickets', 'queue', 'sla', 'itil', 'incident', 'triage', 'routing'],
        a: 'TAT Genie is an AI IT service desk that has handled 25,000+ tickets. The queue was sorted by arrival, so a whole-floor outage sat under a laptop request. I re-sorted it by time-to-breach. The AI routes tickets only above a confidence threshold, agents decide below it, and every correction becomes training data. It had its own PM, and my research still changed the roadmap.',
        proof: { kind: 'link', label: 'TAT Genie case study', sub: '02 · AI service desk · 6 min', href: 'tat' }
      },
      {
        id: 'hrm', k: ['!hrm', '!hrm genie', '!hrms', 'hr platform', 'hr', 'human resources', '!leave', '!payroll', 'attendance', 'approval', 'approvals', 'policy', 'recruitment', 'hiring tool', 'chatbot', 'sandwich'],
        a: 'HRM Genie is a 12-module HR platform live for 1,000+ employees. The hard part was the rules, not the screens. Highlights: a live leave counter that shows the sandwich-leave cost while dates are being picked, versioned policies so acknowledgements can’t go stale, a rule engine for approval routes (I cut two features to fund it), and AI candidate scores broken into parts HR can edit. Payroll now reads attendance directly, so the manual cross-check is gone.',
        proof: { kind: 'link', label: 'HRM Genie case study', sub: '03 · HR platform · 7 min', href: 'hrm' }
      },
      {
        id: 'qa', k: ['!qa', '!qa genie', 'quality assurance', '!test case', '!test cases', 'test generation', 'playwright', 'automation testing', 'review workspace', 'batch approve', 'batch'],
        a: 'QA Genie is a platform where AI writes test cases and humans decide which ones are real. Generating them was easy; reviewing 40 cases one at a time took two hours. I grouped cases so people can batch-approve the obvious ones, while flagged cases can never be swept into a batch. I also designed one shared record for QA and automation developers, so handoffs stopped happening in chat. It’s the newest product, so there’s no post-launch data yet.',
        proof: { kind: 'link', label: 'QA Genie case study', sub: '04 · AI test generation · 3 min', href: 'qa' }
      },
      {
        id: 'sendcrux', k: ['!sendcrux', '!warmupip', '!warmup', '!warm-up', 'warm up', '!deliverability', '!cold email', 'email infrastructure', '!dns', 'spf', 'dkim', 'dmarc', 'mailbox', 'outreach', 'campaign', 'inbox'],
        a: 'Sendcrux and WarmupIP are live email-infrastructure products for salespeople who are afraid of breaking their domain. I automated DNS setup but showed each record as a verified checklist instead of a spinner. Domain setup dropped from about 2 hours to about 2 minutes, and time to first campaign from 2–3 hours to about 15 minutes, both measured. I designed web, dashboard and the iOS and Android apps.',
        proof: {
          kind: 'links', items: [
            { label: 'Sendcrux case study', sub: '05 · Live product · 3 min', href: 'sendcrux' },
            { label: 'sendcrux.com ↗', sub: 'See it live', href: 'https://sendcrux.com', ext: true }]
        }
      },
      {
        id: 'nda', k: ['!nda', '!screenshots', 'real screens', 'confidential', 'recreation', 'recreations', 'demo', 'demos', 'interactive', 'real product'],
        a: 'The Brilyant products run inside enterprise customers under NDA, so I can’t publish real screenshots. Every interface on this site is a working recreation I built in code from my own specs, with illustrative data. The interactions are real, so you can click them. Sendcrux and WarmupIP are public, so you can see those live.',
        proof: { kind: 'link', label: 'Try a demo', sub: 'MDM Genie · blast-radius preview', href: 'mdm#d2' }
      },
      {
        id: 'bot', k: ['!are you ai', '!are you a bot', 'are you real', '!is this ai', '!chatgpt', 'how does this work', 'how does this chat', 'who wrote', 'real person', 'human', '!this chatbot', '!this chat', '!who is this', '!chatbot work'],
        a: 'This isn’t an AI. I wrote every answer myself from my case studies, and your question is matched to the closest one by keywords. If there’s no good match, it tells you so instead of guessing. Nothing you type is stored or sent anywhere. For anything else, email me and I’ll reply personally.',
        proof: { kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Talk to the real me', href: MAIL }
      }
    ];

    const SMALL_TALK = new Set(['hello', 'howareyou', 'thanks']);
    const FALLBACK_TOPICS = ['experience', 'projects', 'ai', 'tools', 'availability', 'contact'];

    const ICON_SPARK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 2l1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8z"/><path d="M18 13l.9 2.6L21.5 16.5l-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z" opacity=".75"/></svg>';
    const ICON_X = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    const ICON_SEND = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

    const root = document.createElement('div');
    root.className = 'ask';
    root.innerHTML = `
      <section class="pp" id="ask-panel" role="dialog" aria-modal="false" aria-labelledby="ask-title" hidden>
        <header class="pp-head">
          <div><strong id="ask-title">Dinesh</strong><span>Portfolio assistant · answers written by me</span></div>
          <button class="pp-x" type="button" aria-label="Close">${ICON_X}</button>
        </header>
        <div class="pp-body">
          <div class="pp-hero">
            <img src="assets/dinesh.jpg" alt="Dinesh Doddaga at his desk" width="880" height="1100">
            <span class="pp-badge"><i aria-hidden="true">✓</i>Written by Dinesh, not AI</span>
          </div>
          <p class="pp-greet">Hi, I’m Dinesh. I design software that makes decisions people can trust. Ask me about my experience, projects, skills, how I work, or when I can start.</p>
          <div class="pp-thread" role="log" aria-live="polite" aria-label="Conversation"></div>
        </div>
        <footer class="pp-foot">
          <div class="pp-chips" role="group" aria-label="Suggested questions"></div>
          <form class="pp-form" autocomplete="off">
            <label class="sr" for="ask-input">Ask Dinesh a question</label>
            <input id="ask-input" type="text" maxlength="200" placeholder="Ask Dinesh a question">
            <button type="submit" aria-label="Send question" disabled>${ICON_SEND}</button>
          </form>
          <p class="pp-legal">Not an AI. Dinesh wrote every answer from his own work, and your question is matched to one by keywords. Nothing you type is stored or sent anywhere.</p>
        </footer>
      </section>
      <button class="pp-launch" type="button" aria-expanded="false" aria-controls="ask-panel">${ICON_SPARK}<span>Ask Dinesh</span></button>`;
    document.body.appendChild(root);

    const panel = $('.pp', root), launch = $('.pp-launch', root), body = $('.pp-body', root);
    const thread = $('.pp-thread', root), chips = $('.pp-chips', root);
    const form = $('.pp-form', root), input = $('#ask-input', root), send = $('button[type=submit]', form);
    const asked = new Set();
    const byId = Object.fromEntries(KB.map(e => [e.id, e]));
    let busy = false;

    const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const toBottom = () => { body.scrollTop = body.scrollHeight; };
    const add = (cls, html) => { const d = document.createElement('div'); d.className = 'pp-msg ' + cls; d.innerHTML = html; thread.appendChild(d); toBottom(); return d; };
    const ext = x => x.ext ? ' target="_blank" rel="noopener"' : '';
    const proofHTML = p => {
      if (!p) return '';
      if (p.kind === 'quote') return `<div class="pp-proof is-quote"><span class="k">From my PM</span><strong>${p.label}</strong><span>${p.sub}</span></div>`;
      if (p.kind === 'ev') return `<a class="pp-proof" href="${p.href}"><span class="k">The proof</span><strong>${p.label}</strong><span>${p.sub}</span><span class="ev" data-l="${p.ev}"><b><i></i><i></i><i></i></b>${p.evText}</span></a>`;
      if (p.kind === 'cta') return `<a class="pp-proof is-cta" href="${p.href}"><span class="k">Let’s talk</span><strong>${p.label}</strong><span>${p.sub}</span></a>`;
      if (p.kind === 'links') return `<div class="pp-links">${p.items.map(x => `<a class="pp-proof" href="${x.href}"${ext(x)}><strong>${x.label}</strong><span>${x.sub}</span></a>`).join('')}</div>`;
      return `<a class="pp-proof" href="${p.href}"${ext(p)}><span class="k">The proof</span><strong>${p.label} →</strong><span>${p.sub}</span></a>`;
    };

    /* Matching: strong topic keywords (marked !) score 4, phrases 3, words 1. Keywords of 4 letters or fewer must
       match a whole word (so "ai" never matches "said", "hr" never matches "hire").
       Small talk only wins when nothing substantive matched. */
    const normalise = t => ' ' + t.toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9'.+\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
    const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Phrases and short words must sit on word boundaries ("about you" never matches "about your");
    // longer single words match as prefixes/substrings so plurals and tenses still hit.
    const hits = (t, k) => (k.includes(' ') || k.length <= 4)
      ? new RegExp(`(^|[^a-z0-9])${reEsc(k)}([^a-z0-9]|$)`).test(t)
      : t.includes(k);
    const match = text => {
      const t = normalise(text);
      let best = null, bestScore = 0;
      KB.forEach(e => {
        let score = 0;
        e.k.forEach(raw => {
          const strong = raw[0] === '!', k = strong ? raw.slice(1) : raw;
          if (hits(t, k)) score += strong ? 4 : k.includes(' ') ? 3 : 1;
        });
        if (SMALL_TALK.has(e.id)) score *= 0.4;
        if (score > bestScore) { bestScore = score; best = e; }
      });
      return bestScore > 0 ? best : null;
    };

    const renderChips = (topics) => {
      const list = topics
        ? topics.map(id => byId[id]).filter(Boolean)
        : KB.filter(e => e.chip && !asked.has(e.id));
      chips.innerHTML = `<a class="pp-chip is-primary" href="${MAIL}">Email Dinesh</a>` +
        list.map(e => `<button class="pp-chip" type="button" data-id="${e.id}">${e.chip || e.id}</button>`).join('');
      chips.scrollLeft = 0;
    };

    const reply = (question, entry) => {
      if (busy) return; busy = true;
      add('is-user', esc(question));
      const typing = add('is-typing', '<span></span><span></span><span></span>');
      setTimeout(() => {
        typing.remove();
        if (entry) {
          asked.add(entry.id);
          add('is-bot', `<p>${entry.a}</p>${proofHTML(entry.proof)}`);
          renderChips();
        } else {
          add('is-bot', `<p>I haven’t written an answer for that one, and I’d rather not guess. I can tell you about my experience, projects, AI work, tools, education, availability, or how to reach me. Or email me and I’ll answer it myself.</p>${proofHTML({ kind: 'cta', label: 'dineshdoddaga@gmail.com', sub: 'Ask me directly', href: MAIL })}`);
          renderChips();
        }
        busy = false;
      }, reduce ? 0 : 650);
    };

    chips.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) { const en = byId[b.dataset.id]; reply(en.chip || b.textContent, en); } });
    input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = input.value.trim(); if (!q || busy) return;
      input.value = ''; send.disabled = true;
      reply(q, match(q));
    });

    const isOpen = () => root.classList.contains('open');
    const open = () => {
      panel.hidden = false;
      requestAnimationFrame(() => root.classList.add('open'));
      launch.setAttribute('aria-expanded', 'true');
      if (!chips.children.length) renderChips();
      setTimeout(() => input.focus({ preventScroll: true }), reduce ? 0 : 180);
    };
    const close = (refocus = true) => {
      root.classList.remove('open');
      launch.setAttribute('aria-expanded', 'false');
      setTimeout(() => { if (!isOpen()) panel.hidden = true; }, reduce ? 0 : 220);
      if (refocus) launch.focus({ preventScroll: true });
    };
    launch.addEventListener('click', open);
    $('.pp-x', root).addEventListener('click', () => close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
    panel.addEventListener('click', e => {
      const a = e.target.closest('a.pp-proof'); if (!a) return;
      const h = a.getAttribute('href');
      if (!/^(mailto:|tel:|https?:)/.test(h)) close(false);
    });
    // Test hook: lets the site owner check which answer a question maps to.
    window.__askDineshMatch = q => { const e = match(q); return e ? e.id : null; };
  })();
})();
