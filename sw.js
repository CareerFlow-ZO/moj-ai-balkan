const CACHE='dbs-servis-v5';
const CORE=[
  '/',
  '/index.html',
  '/assets/dbs-openhood-desktop-hq.webp?v=1',
  '/assets/dbs-openhood-mobile-hq.webp?v=1'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{})
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith('dbs-servis-')&&key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const req=event.request;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req)
        .then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('/index.html',copy));return res})
        .catch(()=>caches.match('/index.html'))
    );
    return;
  }

  if(url.pathname.startsWith('/assets/')){
    event.respondWith(
      caches.match(req).then(cached=>{
        const fresh=fetch(req).then(res=>{
          if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}
          return res;
        }).catch(()=>cached);
        return cached||fresh;
      })
    );
    return;
  }

  event.respondWith(
    fetch(req).catch(()=>caches.match(req))
  );
});
