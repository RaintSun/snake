// Snake AI v2 - BFS + Hamiltonian Cycle shortcuts for high scores
(() => {
  const N = 20;
  const TOTAL = N * N;
  const k = (x,y) => x + ',' + y;

  // === Build Hamiltonian cycle for 20x20 grid ===
  const cycle = Array.from({length: N}, () => new Array(N).fill(0));
  const pos = new Array(TOTAL);
  let rank = 0;
  // Row 0: left to right (cols 0-19)
  for (let x = 0; x < N; x++) { cycle[x][0] = rank; pos[rank] = {x, y:0}; rank++; }
  // Rows 1-19: zigzag through cols 1-19
  for (let y = 1; y < N; y++) {
    if (y % 2 === 1) {
      for (let x = N-1; x >= 1; x--) { cycle[x][y] = rank; pos[rank] = {x, y}; rank++; }
    } else {
      for (let x = 1; x < N; x++) { cycle[x][y] = rank; pos[rank] = {x, y}; rank++; }
    }
  }
  // Col 0: bottom to top (rows 19-1)
  for (let y = N-1; y >= 1; y--) { cycle[0][y] = rank; pos[rank] = {x:0, y}; rank++; }

  function cycleDist(a, b) { return (b - a + TOTAL) % TOTAL; }

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
        const path = [];
        let kk = k(c.x,c.y);
        while (kk !== null) {
          const [x,y] = kk.split(',').map(Number);
          path.unshift({x,y});
          kk = p.get(kk);
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

  function decide() {
    if (gameOver) return null;
    const h = snake[0];
    const obs = bodySet(snake, false);
    const headRank = cycle[h.x][h.y];
    const foodRank = cycle[food.x][food.y];

    // 1. BFS shortest path to food with safety verification
    const pf = bfs(h, food, obs);
    if (pf && pf.length > 1) {
      const sim = simulate(snake, pf);
      if (reachTail(sim)) return pf[1];
    }

    // 2. Hamiltonian cycle shortcut: safe forward move closest to food
    let bestShortcut = null;
    let bestFoodDist = Infinity;
    for (const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx=h.x+dx, ny=h.y+dy;
      if (nx<0||nx>=N||ny<0||ny>=N) continue;
      if (obs.has(k(nx,ny))) continue;
      if (snake.length>1 && nx===snake[1].x && ny===snake[1].y) continue;
      const targetRank = cycle[nx][ny];
      if (cycleDist(headRank, targetRank) === 0) continue;
      // Safety check after this single step
      const simSnake = [{x:nx,y:ny}, ...snake];
      simSnake.pop();
      if (reachTail(simSnake)) {
        const fd = cycleDist(targetRank, foodRank);
        if (fd < bestFoodDist) { bestFoodDist = fd; bestShortcut = {x:nx,y:ny}; }
      }
    }
    if (bestShortcut) return bestShortcut;

    // 3. Follow Hamiltonian cycle strictly
    const nextCell = pos[(headRank + 1) % TOTAL];
    if (!obs.has(k(nextCell.x, nextCell.y))) return nextCell;

    // 4. Fallback: safest move by flood fill
    let best=null, bestSp=-1;
    for (const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx=h.x+dx, ny=h.y+dy;
      if (nx<0||nx>=N||ny<0||ny>=N) continue;
      if (obs.has(k(nx,ny))) continue;
      if (snake.length>1 && nx===snake[1].x && ny===snake[1].y) continue;
      const sp = flood({x:nx,y:ny}, obs);
      if (sp>bestSp){bestSp=sp;best={x:nx,y:ny};}
    }
    return best;
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
  window.__snakeAI = setInterval(() => apply(decide()), 20);
  document.title = 'AI v2 PLAYING - Codex可玩贪吃蛇';
  console.log('%c Snake AI v2 (Hamiltonian) ACTIVATED ', 'background:#00ff00;color:#000;font-size:16px;font-weight:bold');
})();
