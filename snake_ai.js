// Snake AI Controller - BFS pathfinding with safety check
(() => {
  const N = 20;
  const k = (x,y) => x + ',' + y;

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

  function bodySet(snk, exclTail) {
    const s = new Set();
    const end = exclTail ? snk.length-1 : snk.length;
    for (let i=0;i<end;i++) s.add(k(snk[i].x,snk[i].y));
    return s;
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

    // 1. Shortest path to food, verify safe after eating
    const pf = bfs(h, food, obs);
    if (pf && pf.length > 1) {
      const sim = simulate(snake, pf);
      if (reachTail(sim)) return pf[1];
    }

    // 2. Follow tail (survival)
    if (snake.length > 1) {
      const pt = bfs(h, snake[snake.length-1], bodySet(snake,true));
      if (pt && pt.length > 1) return pt[1];
    }

    // 3. Any safe move, pick largest open space
    let best=null, bestSp=-1;
    for (const [ddx,ddy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
      const nx=h.x+ddx, ny=h.y+ddy;
      if (nx<0||nx>=N||ny<0||ny>=N) continue;
      if (obs.has(k(nx,ny))) continue;
      // prevent reverse
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
  window.__snakeAI = setInterval(() => apply(decide()), 25);
  document.title = 'AI PLAYING - ' + document.title;
  console.log('%c Snake AI ACTIVATED ', 'background:#00ff00;color:#000;font-size:16px;font-weight:bold');
})();
