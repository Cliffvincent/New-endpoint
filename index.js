const helmet = require("helmet");
const express = require("express");
const router = require("./api");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());

app.use(router);

app.get("/myinstant", async function (req, res) {
 res.sendFile(path.join(__dirname, "/cliff/tik.html"));
});

app.get("/soundcloud", async function (req, res) {
 res.sendFile(path.join(__dirname, "/cliff/sc.html"));
});

app.get("/ddos/site/spam", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/ddos"));
});

app.get("/emojimix", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/emojimix"));
});

app.get("/fbshare", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/fbshare"));
});

app.get("/follow", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/follow"));
});

app.get("/tempmail/gen", async function (req, res) {
res.sendFile(path.join(__dirname, "public/disk/gen"));
});

app.get("/guard", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/guard"));
});

app.get("/imgur", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/imgur"));
});

app.get("/lookup", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/lookup"));
});

app.get("/pinterest", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/pinterest"));
});

app.get("/remini", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/remini"));
});

app.get("/removebg", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/removebg"));
});

app.get("/sms", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/sms"));
});

app.get("/translate", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/trans"));
});


app.get("/tempmail/message", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/disk/message"));
});



const UPSTREAM = "https://betadash-api-swordslush-production.up.railway.app";

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

function cleanQuery(obj) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined || v === null) continue;
    const s = String(v);
    if (!s.length) continue;
    u.set(k, s);
  }
  return u.toString();
}

async function proxy(req, res, upstreamPath) {
  const qs = cleanQuery(req.query);
  const url = `${UPSTREAM}${upstreamPath}${qs ? `?${qs}` : ""}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);

  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        "accept": "application/json,text/plain,*/*",
        "user-agent": req.headers["user-agent"] || "proxy"
      },
      signal: ctrl.signal
    });

    clearTimeout(t);

    const ct = r.headers.get("content-type") || "application/json; charset=utf-8";
    res.status(r.status);
    res.setHeader("content-type", ct);
    res.setHeader("cache-control", "no-store");

    const text = await r.text();
    res.send(text);
  } catch (e) {
    clearTimeout(t);
    res.status(502).json({ author: "proxy", results: [], error: "upstream_error" });
  }
}

app.get("/myinstant", async (req, res) => {
  await proxy(req, res, "/myinstant");
});

app.get("/myinstant/api", async (req, res) => {
  await proxy(req, res, "/myinstant/api");
});

app.get("/myinstant/category", async (req, res) => {
  await proxy(req, res, "/myinstant/category");
});






const UNSPLASH_ACCESS_KEY = 'RZEIOVfPhS7vMLkFdd2TSKGFBS4o9_FmcV1Nje3FSjw';

app.get('/unsplash', async (req, res) => {
  const search = req.query.search;
  let count = parseInt(req.query.count) || 1;

  if (!search) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  count = Math.min(count, 5);

  const url = `https://api.unsplash.com/search/photos?query=${search}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await axios.get(url);
    const cleanData = response.data.results.map((image) => ({
      id: image.id,
      description: image.description || 'No description available',
      alt_description: image.alt_description,
      urls: image.urls,
      user: {
        name: image.user.name,
        portfolio_url: image.user.portfolio_url,
      },
    }));

    res.json(cleanData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from Unsplash' });
  }
});

const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 5000;

function formatDuration(ms) {
  if (!ms) return null;
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function artUrl(u) {
  return u ? u.replace("large", "t500x500") : null;
}

let scClientId = null;

async function getSoundCloudClientId() {
  if (scClientId) return scClientId;
  const pageRes = await axios.get("https://soundcloud.com", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
  });
  const $ = cheerio.load(pageRes.data);
  const scriptUrls = [];
  $("script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src && src.includes("sndcdn.com")) scriptUrls.push(src);
  });
  for (const src of scriptUrls) {
    try {
      const r = await axios.get(src);
      const m = r.data.match(/[,{]client_id:"([a-zA-Z0-9]+)"/);
      if (m) { scClientId = m[1]; return scClientId; }
    } catch {}
  }
  throw new Error("Could not extract SoundCloud client_id");
}

async function normalizeSoundCloudUrl(rawUrl) {
  let url = rawUrl.trim();
  if (url.includes("on.soundcloud.com")) {
    const r = await axios.get(url, {
      maxRedirects: 10,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    url = (r.request?.res?.responseUrl || r.config?.url || url).split("?")[0];
  }
  return url.replace("://m.soundcloud.com/", "://soundcloud.com/");
}

async function resolveAudioUrl(transcodings, clientId) {
  const progressive = transcodings.find(
    t => t.format?.protocol === "progressive" && t.format?.mime_type === "audio/mpeg"
  );
  if (!progressive?.url) return null;
  try {
    const r = await axios.get(progressive.url, {
      params: { client_id: clientId },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });
    return r.data?.url || null;
  } catch { return null; }
}

function formatTrack(track, audioUrl) {
  const transcodings = track.media?.transcodings || [];
  const hlsStream = transcodings.find(t => t.format?.protocol === "hls");
  return {
    id: track.id,
    title: track.title,
    description: track.description || null,
    duration_ms: track.duration,
    duration: formatDuration(track.duration),
    genre: track.genre || null,
    tag_list: track.tag_list || null,
    playback_count: track.playback_count,
    likes_count: track.likes_count,
    reposts_count: track.reposts_count,
    comment_count: track.comment_count,
    permalink_url: track.permalink_url,
    audioUrl: audioUrl || null,
    stream_url: hlsStream?.url || null,
    artwork_url: artUrl(track.artwork_url),
    waveform_url: track.waveform_url || null,
    downloadable: track.downloadable,
    created_at: track.created_at,
    user: {
      id: track.user?.id,
      username: track.user?.username,
      full_name: track.user?.full_name,
      avatar_url: artUrl(track.user?.avatar_url),
      followers_count: track.user?.followers_count,
      permalink_url: track.user?.permalink_url
    }
  };
}

// ── Search format helpers ──
function fmtTrack(t) {
  return {
    kind: "track",
    id: t.id,
    title: t.title || null,
    duration_ms: t.duration,
    duration: formatDuration(t.duration),
    artwork_url: artUrl(t.artwork_url),
    permalink_url: t.permalink_url,
    playback_count: t.playback_count || 0,
    likes_count: t.likes_count || 0,
    comment_count: t.comment_count || 0,
    created_at: t.created_at || null,
    genre: t.genre || null,
    media: t.media || null,
    user: t.user ? {
      id: t.user.id,
      username: t.user.username || null,
      full_name: t.user.full_name || null,
      avatar_url: artUrl(t.user.avatar_url),
      permalink_url: t.user.permalink_url || null
    } : null
  };
}

function fmtUser(u) {
  return {
    kind: "user",
    id: u.id,
    username: u.username || null,
    full_name: u.full_name || null,
    followers_count: u.followers_count || 0,
    track_count: u.track_count || 0,
    avatar_url: artUrl(u.avatar_url),
    permalink_url: u.permalink_url || null,
    verified: u.verified || false,
    description: u.description || null
  };
}

function fmtPlaylist(p) {
  return {
    kind: "playlist",
    id: p.id,
    title: p.title || null,
    track_count: p.track_count || 0,
    artwork_url: artUrl(p.artwork_url),
    permalink_url: p.permalink_url || null,
    created_at: p.created_at || null,
    likes_count: p.likes_count || 0,
    user: p.user ? {
      id: p.user.id,
      username: p.user.username || null,
      avatar_url: artUrl(p.user.avatar_url)
    } : null
  };
}

// ── GET /sc — Search ──
app.get("/sc", async (req, res) => {
  const query = req.query.search;
  const type  = req.query.type || "all"; // all | tracks | users | playlists | albums
  const limit = Math.min(parseInt(req.query.limit || "20"), 50);

  if (!query) return res.status(400).json({ error: "search query parameter is required" });

  const SC_HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };

  try {
    const clientId = await getSoundCloudClientId();
    const base = { q: query, client_id: clientId };

    if (type === "all") {
      const [trRes, usRes, plRes, alRes] = await Promise.allSettled([
        axios.get("https://api-v2.soundcloud.com/search/tracks",    { params: { ...base, limit: 10 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/users",     { params: { ...base, limit:  5 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/playlists", { params: { ...base, limit:  5 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/albums",    { params: { ...base, limit:  5 }, headers: SC_HEADERS })
      ]);
      const tracks    = trRes.status === "fulfilled" ? (trRes.value.data.collection || []).map(fmtTrack).filter(t => t.id && t.title) : [];
      const users     = usRes.status === "fulfilled" ? (usRes.value.data.collection || []).map(fmtUser).filter(u => u.id && u.username) : [];
      const playlists = plRes.status === "fulfilled" ? (plRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title) : [];
      const albums    = alRes.status === "fulfilled" ? (alRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title) : [];
      return res.json({ author: "yazky", query, type: "all", tracks, users, playlists, albums });
    }

    const endpoints = { tracks: "tracks", users: "users", playlists: "playlists", albums: "albums" };
    const ep = endpoints[type] || "tracks";
    const { data } = await axios.get(`https://api-v2.soundcloud.com/search/${ep}`, {
      params: { ...base, limit }, headers: SC_HEADERS
    });
    const collection = data.collection || [];
    let results;
    if (type === "users")     results = collection.map(fmtUser).filter(u => u.id && u.username);
    else if (type === "playlists" || type === "albums") results = collection.map(fmtPlaylist).filter(p => p.id && p.title);
    else                      results = collection.map(fmtTrack).filter(t => t.id && t.title);

    res.json({ author: "yazky", query, type, total: results.length, results });

  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      scClientId = null;
      return res.status(401).json({ error: "Auth failed, retry." });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── GET /scdl — Resolve URL ──
app.get("/scdl", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ author: "yazky", error: "'url' query parameter is required" });

  try {
    const clientId = await getSoundCloudClientId();
    const resolvedUrl = await normalizeSoundCloudUrl(url);
    const { data } = await axios.get("https://api-v2.soundcloud.com/resolve", {
      params: { url: resolvedUrl, client_id: clientId },
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
    });

    if (data.kind === "track") {
      const audioUrl = await resolveAudioUrl(data.media?.transcodings || [], clientId);
      return res.json({ author: "yazky", type: "track", results: formatTrack(data, audioUrl) });
    }

    if (data.kind === "playlist") {
      const rawTracks = (data.tracks || []).slice(0, 50);

      // Identify stub tracks (missing title or user — SC returns partial objects for large playlists)
      const stubIds = rawTracks.filter(t => !t.title || !t.user).map(t => t.id).filter(Boolean);

      // Batch-fetch full data for stub tracks (SC allows up to 50 ids per request)
      const fullTrackMap = {};
      if (stubIds.length) {
        try {
          const chunks = [];
          for (let i = 0; i < stubIds.length; i += 50) chunks.push(stubIds.slice(i, i + 50));
          await Promise.all(chunks.map(async chunk => {
            const { data: fetched } = await axios.get("https://api-v2.soundcloud.com/tracks", {
              params: { ids: chunk.join(","), client_id: clientId },
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            (fetched || []).forEach(ft => { fullTrackMap[ft.id] = ft; });
          }));
        } catch (e) { /* fall back to stub data */ }
      }

      const tracks = rawTracks.map(t => {
        const full = fullTrackMap[t.id] || t;
        const userObj = full.user || t.user;
        return {
          id: full.id,
          title: full.title || t.title || null,
          duration_ms: full.duration || t.duration,
          duration: formatDuration(full.duration || t.duration),
          permalink_url: full.permalink_url || t.permalink_url,
          artwork_url: artUrl(full.artwork_url || t.artwork_url) || artUrl(data.artwork_url),
          playback_count: full.playback_count || 0,
          likes_count: full.likes_count || 0,
          comment_count: full.comment_count || 0,
          user: userObj ? {
            id: userObj.id,
            username: userObj.username || null,
            full_name: userObj.full_name || null,
            avatar_url: artUrl(userObj.avatar_url),
            permalink_url: userObj.permalink_url || null
          } : {
            id: data.user?.id,
            username: data.user?.username || null,
            full_name: data.user?.full_name || null,
            avatar_url: artUrl(data.user?.avatar_url),
            permalink_url: data.user?.permalink_url || null
          }
        };
      });

      return res.json({
        author: "yazky", type: "playlist",
        results: {
          id: data.id, title: data.title,
          description: data.description || null,
          track_count: data.track_count,
          duration_ms: data.duration,
          duration: formatDuration(data.duration),
          genre: data.genre || null,
          likes_count: data.likes_count,
          permalink_url: data.permalink_url,
          artwork_url: artUrl(data.artwork_url),
          created_at: data.created_at,
          user: {
            id: data.user?.id, username: data.user?.username,
            full_name: data.user?.full_name,
            avatar_url: artUrl(data.user?.avatar_url),
            permalink_url: data.user?.permalink_url
          },
          tracks
        }
      });
    }

    if (data.kind === "user") {
      const userId = data.id;
      const SC_H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
      let playlists = [], topTracks = [];
      try {
        const [plRes, trRes] = await Promise.allSettled([
          axios.get(`https://api-v2.soundcloud.com/users/${userId}/playlists`, {
            params: { limit: 20, client_id: clientId }, headers: SC_H
          }),
          axios.get(`https://api-v2.soundcloud.com/users/${userId}/tracks`, {
            params: { limit: 10, client_id: clientId }, headers: SC_H
          })
        ]);
        if (plRes.status === "fulfilled")
          playlists = (plRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title);
        if (trRes.status === "fulfilled")
          topTracks = (trRes.value.data.collection || []).map(fmtTrack).filter(t => t.id && t.title);
      } catch {}
      return res.json({
        author: "yazky", type: "user",
        results: {
          id: data.id, username: data.username, full_name: data.full_name,
          description: data.description || null,
          followings_count: data.followings_count, followers_count: data.followers_count,
          track_count: data.track_count, likes_count: data.likes_count,
          playlist_count: data.playlist_count, verified: data.verified || false,
          country: data.country || null, city: data.city || null,
          avatar_url: artUrl(data.avatar_url),
          permalink_url: data.permalink_url, created_at: data.created_at,
          playlists, topTracks
        }
      });
    }

    return res.json({ author: "yazky", type: data.kind, results: data });

  } catch (err) {
    const status = err.response?.status;
    if (status === 401 || status === 403) { scClientId = null; return res.status(401).json({ author: "yazky", error: "Authentication failed. Please retry." }); }
    if (status === 404) return res.status(404).json({ author: "yazky", error: "Not found or private." });
    scClientId = null;
    return res.status(500).json({ author: "yazky", error: err.message });
  }
});

// ── GET /discover — Discover Feed ──
app.get("/discover", async (req, res) => {
  try {
    const response = await axios.get("https://m.soundcloud.com/discover", {
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15" }
    });

    const $ = cheerio.load(response.data);
    const rawJson = $("script#__NEXT_DATA__").html();
    if (!rawJson) return res.status(500).json({ error: "Could not parse discover page" });

    const entities = JSON.parse(rawJson)?.props?.pageProps?.initialStoreState?.entities;
    const playlists = entities?.playlists || {};
    const users     = entities?.users     || {};
    const msc       = entities?.mixedSelectionsCollections || {};

    function resolvePlaylist(urn) {
      const entry = playlists[urn];
      const p = entry?.data || entry;
      if (!p) return null;
      return {
        id: p.id,
        title: p.title,
        track_count: p.track_count,
        likes_count: p.likes_count,
        duration_ms: p.duration,
        duration: formatDuration(p.duration),
        artwork_url: artUrl(p.artwork_url),
        permalink_url: p.permalink_url,
        genre: p.genre || null,
        user: p.user ? {
          id: p.user.id,
          username: p.user.username,
          avatar_url: artUrl(p.user.avatar_url),
          permalink_url: p.user.permalink_url
        } : null
      };
    }

    function resolveUser(urn) {
      const entry = users[urn];
      const u = entry?.data || entry;
      if (!u) return null;
      return {
        id: u.id,
        username: u.username,
        full_name: u.full_name || null,
        followers_count: u.followers_count,
        track_count: u.track_count,
        avatar_url: artUrl(u.avatar_url),
        permalink_url: u.permalink_url
      };
    }

    const sections = Object.values(msc).map(entry => {
      const sel = entry?.data || entry;
      const items = (sel?.collection || []).map(item => {
        if (item.schema === "playlist") return { type: "playlist", ...resolvePlaylist(item.id) };
        if (item.schema === "user")     return { type: "user",     ...resolveUser(item.id) };
        return null;
      }).filter(Boolean);

      return {
        title: sel.title,
        urn: sel.urn,
        items
      };
    });

    res.json({ author: "yazky", sections });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /feed — Who to follow ──
app.get("/feed", async (req, res) => {
  try {
    // Fetch both feed and discover pages in parallel for more artists
    const [feedRes, discoverRes] = await Promise.allSettled([
      axios.get("https://m.soundcloud.com/feed", {
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15" }
      }),
      axios.get("https://m.soundcloud.com/discover", {
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15" }
      })
    ]);

    const userMap = {};

    function extractUsers(html) {
      try {
        const $ = cheerio.load(html);
        const rawJson = $("script#__NEXT_DATA__").html();
        if (!rawJson) return;
        const entities = JSON.parse(rawJson)?.props?.pageProps?.initialStoreState?.entities;
        const users = entities?.users || {};
        Object.values(users).forEach(entry => {
          const u = entry?.data || entry;
          if (!u?.id || !u?.username) return;
          userMap[u.id] = {
            id: u.id,
            username: u.username,
            full_name: u.full_name || null,
            followers_count: u.followers_count || 0,
            track_count: u.track_count || 0,
            avatar_url: artUrl(u.avatar_url),
            permalink_url: u.permalink_url,
            verified: u.verified || false,
            description: u.description || null
          };
        });
      } catch {}
    }

    if (feedRes.status === "fulfilled") extractUsers(feedRes.value.data);
    if (discoverRes.status === "fulfilled") extractUsers(discoverRes.value.data);

    // Scrape genre chart pages for real artists
    const genrePages = [
      "hip-hop-rap", "indie", "pop", "electronic", "alternative-rock",
      "dance-edm", "r-b-soul", "classical", "jazz", "reggae"
    ];
    const chartPageResults = await Promise.allSettled(
      genrePages.map(g => axios.get(`https://m.soundcloud.com/charts/top/${g}`, {
        headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15" }
      }))
    );

    function extractUsersFromChartPage(html) {
      try {
        const $ = cheerio.load(html);
        const rawJson = $("script#__NEXT_DATA__").html();
        if (!rawJson) return;
        const nextData = JSON.parse(rawJson);
        const entities = nextData?.props?.pageProps?.initialStoreState?.entities || {};
        // Extract from entities.users
        const users = entities?.users || {};
        Object.values(users).forEach(entry => {
          const u = entry?.data || entry;
          if (!u?.id || !u?.username) return;
          if (userMap[u.id]) return;
          userMap[u.id] = {
            id: u.id, username: u.username, full_name: u.full_name || null,
            followers_count: u.followers_count || 0, track_count: u.track_count || 0,
            avatar_url: artUrl(u.avatar_url), permalink_url: u.permalink_url,
            verified: u.verified || false, description: u.description || null
          };
        });
        // Also extract from tracks embedded in the chart
        const tracks = entities?.tracks || {};
        Object.values(tracks).forEach(entry => {
          const t = entry?.data || entry;
          const u = t?.user;
          if (!u?.id || !u?.username) return;
          if (userMap[u.id]) return;
          userMap[u.id] = {
            id: u.id, username: u.username, full_name: u.full_name || null,
            followers_count: u.followers_count || 0, track_count: u.track_count || 0,
            avatar_url: artUrl(u.avatar_url), permalink_url: u.permalink_url,
            verified: u.verified || false, description: u.description || null
          };
        });
      } catch {}
    }

    chartPageResults.forEach(r => {
      if (r.status === "fulfilled") extractUsersFromChartPage(r.value.data);
    });

    // Fetch followings of SC genre curator accounts — these are real popular artists
    try {
      const clientId = await getSoundCloudClientId();
      const SC_H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
      // Well-known SC genre curator account IDs
      const curatorSlugs = [
        "soundcloud-scenes",   // indie/bedroom pop
        "soundcloudmusicuk",   // UK artists
        "soundcloud-damedame", // Japanese artists
        "soundcloud-hustle",   // rap/hip-hop
        "soundcloud-peak",     // EDM
      ];
      // Resolve curator IDs (we already know scenes: 603473631)
      const curatorIds = [603473631];
      const slugResults = await Promise.allSettled(
        curatorSlugs.slice(1).map(s => axios.get(`https://api-v2.soundcloud.com/resolve`, {
          params: { url: `https://soundcloud.com/${s}`, client_id: clientId }, headers: SC_H
        }))
      );
      slugResults.forEach(r => {
        if (r.status === "fulfilled" && r.value.data?.id) curatorIds.push(r.value.data.id);
      });

      const followingResults = await Promise.allSettled(
        curatorIds.map(id => axios.get(`https://api-v2.soundcloud.com/users/${id}/followings`, {
          params: { limit: 50, client_id: clientId }, headers: SC_H
        }))
      );
      followingResults.forEach(r => {
        if (r.status !== "fulfilled") return;
        (r.value.data.collection || []).forEach(u => {
          if (!u?.id || !u?.username) return;
          if (userMap[u.id]) return;
          userMap[u.id] = {
            id: u.id, username: u.username, full_name: u.full_name || null,
            followers_count: u.followers_count || 0, track_count: u.track_count || 0,
            avatar_url: artUrl(u.avatar_url), permalink_url: u.permalink_url,
            verified: u.verified || false, description: u.description || null
          };
        });
      });
    } catch {}

    if (!Object.keys(userMap).length) {
      return res.status(500).json({ error: "Could not parse feed page" });
    }

    const artists = Object.values(userMap)
      .sort((a, b) => b.followers_count - a.followers_count);

    res.json({ author: "yazky", artists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
