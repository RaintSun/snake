// Snake AI v3 - Fast BFS for short snake, pure Hamiltonian for long snake (no deadlock)
(() => {
  const N = 20;
  const TOTAL = N * N;
  const k = (x,y) => x + ',' + y;
  const SWITCH_LEN = 70; // switch to pure Hamiltonian at 70 segments (700 pts)

  // === Hamiltonian cycle ===
  const cycle = Array.from({length: N}, () => new Array(N).fill(0));
  const pos = new Array(TOTAL);
  let rank = 0;
  for (let x = 0; x < N; x++) { cycle[x][0] = rank; pos[rank] = {x, y:0}; rank++; }
  for (let y = 1; y < N; y++) {
    if (y % 2 === 1) {
      for (let x = N-1; x >= 1; x--) { cycle[x][y] = rank; pos[rank] = {x, y}; rank++; }
    } else {
      for (let x = 1; x < N; x++) { cycle[x][y] = rank; pos[rank] = {x, y}; rank++; }
    }
  }
  for (let y = N-1; y >= 1; y--) { cycle[0][y] = rank; pos[rank] = {x:0, y}; rank++; }

  function cdist(a, b) { return (b - a + TOTAL) % TOTAL; }
  function bodySet(snk, exclTail) {
    const s = new Set();
    const end = exclTail ? snk.length-1 : snk.length;
    for (let i=0;i<end;i++) s.add(k(snk[i].x,snk[i].y));
    return s;
  }
  function bfs(s, g, obs) {
    const q = [s], v = new Set([k(s.x,s.y)]), p = new Map();
    p.set(k(s.x,s.y), null);
    while (q.length) {
      const c = q.shift();
      if (c.x===g.x && c.y===g.y) {
        const path = []; let kk = k(c.x,c.y);
        while (kk !== null) {
          const [x,y] = kk.split(',').map(Number);
          path.unshift({x,y}); kk = p.get(kk);
        }
        return path;
      }
      for (const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nx=c.x+dx, ny=c.y+dy, nk=k(nx,ny);
        if (nx>=0&&nx<N&&ny>=0&&ny<N&&!v.has(nk)&&!obs.has(nk)) {
          v.add(nk); p.set(nk, k(c.x,c.y)); q.push({x:nx,y:ny});
        }
      }
    }
    return null;
  }
  function simulate(snk, path) {
    const ns = snk.map(s=>({...s}));
    for (let i=1;i<path.length;i++) {
      ns.unshift({...path[i]});
      if (i < path.length-1) ns.pop();
    }
    return ns;
  }
  function reachTail(snk) {
    if (snk.length<=1) return true;
    return bfs(snk[0], snk[snk.length-1], bodySet(snk,true)) !== null;
  }
  function flood(s, obs) {
    const v=new Set([k(s.x,s.y)]), q=[s]; let n=0;
    while(q.length){
      const c=q.shift(); n++;
      for(const[dx,dy]of[[0,-1],[0,1],[-1,0],[1,0]]){
        const nx=c.x+dx, ny=c.y+dy, nk=k(nx,ny);
        if(nx>=0&&nx<N&&ny>=0&&ny<N&&!v.has(nk)&&!obs.has(nk)){
          v.add(nk); q.push({x:nx,y:ny});
        }
      }
    }
    return n;
  }
  function safeMoves(h, obs) {
    const moves = [];
    for (const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx=h.x+dx, ny=h.y+dy;
      if (nx<0||nx>=N||ny<0||ny>=N) continue;
      if (obs.has(k(nx,ny))) continue;
      if (snake.length>1 && nx===snake[1].x && ny===snake[1].y) continue;
      moves.push({x:nx,y:ny});
    }
    return moves;
  }

  function decide() {
    if (gameOver) return null;
    const h = snake[0];
    const obs = bodySet(snake, false);
    const headRank = cycle[h.x][h.y];

    // === LONG SNAKE: pure Hamiltonian cycle (guaranteed no deadlock) ===
    if (snake.length >= SWITCH_LEN) {
      // Strict next cycle cell
      const nextCell = pos[(headRank + 1) % TOTAL];
      if (!obs.has(k(nextCell.x, nextCell.y))) return nextCell;
      // Blocked: pick safe move farthest ahead in cycle to keep unwinding
      const moves = safeMoves(h, obs);
      if (moves.length === 0) return null;
      moves.sort((a,b) => cdist(headRank, cycle[b.x][b.y]) - cdist(headRank, cycle[a.x][a.y]));
      return moves[0];
    }

    // === SHORT/MEDIUM SNAKE: fast BFS + shortcuts ===
    // 1. BFS shortest path to food with safety check
    const pf = bfs(h, food, obs);
    if (pf && pf.length > 1) {
      const sim = simulate(snake, pf);
      if (reachTail(sim)) return pf[1];
    }
    // 2. Hamiltonian cycle shortcut (safe forward move closest to food)
    let bestSc = null, bestFd = Infinity;
    for (const m of safeMoves(h, obs)) {
      const tr = cycle[m.x][m.y];
      if (cdist(headRank, tr) === 0) continue;
      const sim = [{x:m.x,y:m.y}, ...snake]; sim.pop();
      if (reachTail(sim)) {
        const fd = cdist(tr, cycle[food.x][food.y]);
        if (fd < bestFd) { bestFd = fd; bestSc = m; }
      }
    }
    if (bestSc) return bestSc;
    // 3. Follow cycle strictly
    const nc = pos[(headRank + 1) % TOTAL];
    if (!obs.has(k(nc.x, nc.y))) return nc;
    // 4. Fallback: safest move by flood fill (v2 proven logic)
    const moves = safeMoves(h, obs);
    if (moves.length === 0) return null;
    moves.sort((a,b) => flood(b, obs) - flood(a, obs));
    return moves[0];
  }

  function apply(t) {
    if (!t) return;
    const h = snake[0];
    const ddx = t.x-h.x, ddy = t.y-h.y;
    let keyName;
    if (ddx===1) keyName='ArrowRight';
    else if (ddx===-1) keyName='ArrowLeft';
    else if (ddy===1) keyName='ArrowDown';
    else if (ddy===-1) keyName='ArrowUp';
    if (keyName) document.dispatchEvent(new KeyboardEvent('keydown',{key:keyName}));
  }

  if (window.__snakeAI) clearInterval(window.__snakeAI);
  window.__snakeAI = setInterval(() => apply(decide()), 15);
  document.title = 'AI v3 PLAYING - Codex可玩贪吃蛇';
  console.log('%c Snake AI v3 (BFS+Hamiltonian hybrid) ACTIVATED ', 'background:#00ff00;color:#000;font-size:16px;font-weight:bold');
})();
