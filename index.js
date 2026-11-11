const helmet = require("helmet");
const express = require("express");
const router = require("./api");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());

app.use(router);

app.get("/", async function (req, res) {
  res.sendFile(path.join(__dirname, "/cliff/sc.html"));
});

app.get("/sc.png", async function (req, res) {
  res.sendFile(path.join(__dirname, "/public/dsk/sc.png"));
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
  res.sendFile(path.join(__dirname, "public/disk/follow"));
});

app.get("/tempmail/gen", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/gen"));
});

app.get("/guard", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/guard"));
});

app.get("/imgur", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/imgur"));
});

app.get("/lookup", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/lookup"));
});

app.get("/pinterest", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/pinterest"));
});

app.get("/remini", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/remini"));
});

app.get("/removebg", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/removebg"));
});

app.get("/sms", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/sms"));
});

app.get("/translate", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/trans"));
});

app.get("/tempmail/message", async function (req, res) {
  res.sendFile(path.join(__dirname, "public/disk/message"));
});

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const UNSPLASH_ACCESS_KEY = "RZEIOVfPhS7vMLkFdd2TSKGFBS4o9_FmcV1Nje3FSjw";

app.get("/unsplash", async (req, res) => {
  const search = req.query.search;
  let count = parseInt(req.query.count) || 1;

  if (!search) {
    return res.status(400).json({ error: "Search query is required" });
  }

  count = Math.min(count, 5);

  const url = `https://api.unsplash.com/search/photos?query=${search}&per_page=${count}&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const response = await axios.get(url);
    const cleanData = response.data.results.map((image) => ({
      id: image.id,
      description: image.description || "No description available",
      alt_description: image.alt_description,
      urls: image.urls,
      user: {
        name: image.user.name,
        portfolio_url: image.user.portfolio_url
      }
    }));

    res.json(cleanData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data from Unsplash" });
  }
});

function formatDuration(ms) {
  if (!ms) return null;
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

function artUrl(u) {
  return u ? u.replace("large", "t500x500") : null;
}

const SC_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Accept-Language": "en-US,en;q=0.9"
};

const MOBI_HEADERS = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
};

let scClientId = null;

async function getSoundCloudClientId() {
  if (scClientId) return scClientId;
  try {
    const pageRes = await axios.get("https://soundcloud.com", { headers: SC_HEADERS });
    const $ = cheerio.load(pageRes.data);
    const scriptUrls = [];
    $("script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src) scriptUrls.push(src);
    });

    const targetScripts = scriptUrls.reverse();
    for (const src of targetScripts) {
      try {
        const r = await axios.get(src, { headers: SC_HEADERS });
        const patterns = [
          /client_id:"([a-zA-Z0-9]{32})"/,
          /client_id=([a-zA-Z0-9]{32})/,
          /"client_id":"([a-zA-Z0-9]{32})"/
        ];
        for (const pat of patterns) {
          const m = r.data.match(pat);
          if (m && m[1]) {
            scClientId = m[1];
            return scClientId;
          }
        }
      } catch {}
    }
  } catch {}

  throw new Error("Could not extract SoundCloud client_id");
}

async function normalizeSoundCloudUrl(rawUrl) {
  let url = rawUrl.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  try {
    const r = await axios.get(url, {
      maxRedirects: 10,
      headers: SC_HEADERS,
      validateStatus: false
    });
    if (r.request?.res?.responseUrl) {
      url = r.request.res.responseUrl;
    } else if (r.config?.url) {
      url = r.config.url;
    }
  } catch {}

  url = url.split("?")[0];
  return url.replace("://m.soundcloud.com/", "://soundcloud.com/");
}

async function resolveAudioUrl(transcodings, clientId) {
  if (!transcodings || !Array.isArray(transcodings) || transcodings.length === 0) {
    return null;
  }

  const progressive = transcodings.find(
    t => t.format?.protocol === "progressive" && t.format?.mime_type === "audio/mpeg"
  );

  if (progressive?.url) {
    try {
      const r = await axios.get(progressive.url, {
        params: { client_id: clientId },
        headers: SC_HEADERS
      });
      if (r.data?.url) return r.data.url;
    } catch {}
  }

  const hls = transcodings.find(t => t.format?.protocol === "hls");
  if (!hls?.url) return null;

  try {
    const r = await axios.get(hls.url, {
      params: { client_id: clientId },
      headers: SC_HEADERS
    });

    const playlistUrl = r.data?.url;
    if (!playlistUrl) return null;

    if (playlistUrl.includes(".m3u8")) {
      try {
        const plRes = await axios.get(playlistUrl, { headers: SC_HEADERS });
        const lines = String(plRes.data).split("\n").map(l => l.trim());
        const segmentLine = lines.find(l => l && !l.startsWith("#"));
        if (segmentLine) {
          return new URL(segmentLine, playlistUrl).href;
        }
      } catch {}
    }

    return playlistUrl;
  } catch {
    return null;
  }
}

async function scrapeHydratedTrack(url, clientId) {
  try {
    const pageRes = await axios.get(url, { headers: SC_HEADERS });
    const $ = cheerio.load(pageRes.data);

    let hydratedData = null;
    $("script").each((_, el) => {
      const html = $(el).html() || "";
      if (html.includes("__sc_hydration")) {
        try {
          const jsonText = html.substring(html.indexOf("[{"));
          const parsed = JSON.parse(jsonText);
          const trackObj = parsed.find(item => item.hydratable === "sound" || item.kind === "track");
          if (trackObj && trackObj.data) {
            hydratedData = trackObj.data;
          }
        } catch {}
      }
    });

    if (hydratedData) {
      const audioUrl = await resolveAudioUrl(hydratedData.media?.transcodings || [], clientId);
      return formatTrackObject(hydratedData, audioUrl);
    }
  } catch {}
  return null;
}

function formatTrackObject(track, audioUrl) {
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
    playback_count: track.playback_count || 0,
    likes_count: track.likes_count || 0,
    reposts_count: track.reposts_count || 0,
    comment_count: track.comment_count || 0,
    permalink_url: track.permalink_url,
    audioUrl: audioUrl || null,
    stream_url: hlsStream?.url || null,
    artwork_url: artUrl(track.artwork_url),
    waveform_url: track.waveform_url || null,
    downloadable: !!track.downloadable,
    created_at: track.created_at,
    user: {
      id: track.user?.id || null,
      username: track.user?.username || null,
      full_name: track.user?.full_name || null,
      avatar_url: artUrl(track.user?.avatar_url),
      followers_count: track.user?.followers_count || 0,
      permalink_url: track.user?.permalink_url || null
    }
  };
}

async function buildTrackList(rawTracks, clientId, ownerUser, fallbackArtwork) {
  const stubIds = rawTracks.filter(t => !t.title || !t.user || !t.media).map(t => t.id).filter(Boolean);

  const fullTrackMap = {};
  if (stubIds.length) {
    try {
      const chunks = [];
      for (let i = 0; i < stubIds.length; i += 50) chunks.push(stubIds.slice(i, i + 50));
      await Promise.all(chunks.map(async chunk => {
        const { data: fetched } = await axios.get("https://api-v2.soundcloud.com/tracks", {
          params: { ids: chunk.join(","), client_id: clientId },
          headers: SC_HEADERS
        });
        (fetched || []).forEach(ft => { fullTrackMap[ft.id] = ft; });
      }));
    } catch {}
  }

  return await Promise.all(rawTracks.map(async t => {
    const full = fullTrackMap[t.id] || t;
    const userObj = full.user || t.user || ownerUser;
    const audioUrl = await resolveAudioUrl(full.media?.transcodings || t.media?.transcodings || [], clientId);
    const hlsStream = (full.media?.transcodings || t.media?.transcodings || []).find(tr => tr.format?.protocol === "hls");

    return {
      id: full.id || t.id,
      title: full.title || t.title || null,
      description: full.description || t.description || null,
      duration_ms: full.duration || t.duration,
      duration: formatDuration(full.duration || t.duration),
      genre: full.genre || t.genre || null,
      tag_list: full.tag_list || t.tag_list || null,
      playback_count: full.playback_count || t.playback_count || 0,
      likes_count: full.likes_count || t.likes_count || 0,
      reposts_count: full.reposts_count || t.reposts_count || 0,
      comment_count: full.comment_count || t.comment_count || 0,
      permalink_url: full.permalink_url || t.permalink_url,
      audioUrl: audioUrl || null,
      stream_url: hlsStream?.url || null,
      artwork_url: artUrl(full.artwork_url || t.artwork_url) || artUrl(fallbackArtwork),
      waveform_url: full.waveform_url || t.waveform_url || null,
      downloadable: !!(full.downloadable || t.downloadable),
      created_at: full.created_at || t.created_at || null,
      user: userObj ? {
        id: userObj.id || null,
        username: userObj.username || null,
        full_name: userObj.full_name || null,
        avatar_url: artUrl(userObj.avatar_url),
        followers_count: userObj.followers_count || 0,
        permalink_url: userObj.permalink_url || null
      } : null
    };
  }));
}

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

app.get("/sc", async (req, res) => {
  const query = req.query.search;
  const type = req.query.type || "all";
  const limit = Math.min(parseInt(req.query.limit || "20"), 50);

  if (!query) return res.status(400).json({ error: "search query parameter is required" });

  try {
    const clientId = await getSoundCloudClientId();
    const base = { q: query, client_id: clientId };

    if (type === "all") {
      const [trRes, usRes, plRes, alRes] = await Promise.allSettled([
        axios.get("https://api-v2.soundcloud.com/search/tracks", { params: { ...base, limit: 10 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/users", { params: { ...base, limit: 5 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/playlists", { params: { ...base, limit: 5 }, headers: SC_HEADERS }),
        axios.get("https://api-v2.soundcloud.com/search/albums", { params: { ...base, limit: 5 }, headers: SC_HEADERS })
      ]);
      const tracks = trRes.status === "fulfilled" ? (trRes.value.data.collection || []).map(fmtTrack).filter(t => t.id && t.title) : [];
      const users = usRes.status === "fulfilled" ? (usRes.value.data.collection || []).map(fmtUser).filter(u => u.id && u.username) : [];
      const playlists = plRes.status === "fulfilled" ? (plRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title) : [];
      const albums = alRes.status === "fulfilled" ? (alRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title) : [];
      return res.json({ author: "yazky", query, type: "all", tracks, users, playlists, albums });
    }

    const endpoints = { tracks: "tracks", users: "users", playlists: "playlists", albums: "albums" };
    const ep = endpoints[type] || "tracks";
    const { data } = await axios.get(`https://api-v2.soundcloud.com/search/${ep}`, {
      params: { ...base, limit }, headers: SC_HEADERS
    });
    const collection = data.collection || [];
    let results;
    if (type === "users") results = collection.map(fmtUser).filter(u => u.id && u.username);
    else if (type === "playlists" || type === "albums") results = collection.map(fmtPlaylist).filter(p => p.id && p.title);
    else results = collection.map(fmtTrack).filter(t => t.id && t.title);

    res.json({ author: "yazky", query, type, total: results.length, results });

  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      scClientId = null;
      return res.status(401).json({ error: "Auth failed, retry." });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get("/scdl", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ author: "yazky", error: "'url' query parameter is required" });

  try {
    const clientId = await getSoundCloudClientId();

    const sysMatch = url.match(/trending-by-genre:[A-Za-z0-9_-]+/) || url.match(/discover\/sets\/(system-playlists:[^\/?#]+)/);
    if (sysMatch) {
      const sysId = sysMatch[0].startsWith("trending-by-genre:") || sysMatch[0].startsWith("system-playlists:")
        ? sysMatch[0]
        : sysMatch[1];
      const { data: sys } = await axios.get(
        `https://api-v2.soundcloud.com/system-playlists/${encodeURIComponent(sysId)}`,
        { params: { client_id: clientId }, headers: SC_HEADERS }
      );

      let rawTracks = sys.tracks || [];
      let nextHref = sys.next_href || null;
      let pages = 0;
      while (nextHref && pages < 4 && rawTracks.length < 200) {
        try {
          const sep = nextHref.includes("?") ? "&" : "?";
          const pr = await axios.get(`${nextHref}${sep}client_id=${clientId}`, { headers: SC_HEADERS });
          rawTracks = rawTracks.concat(pr.data.tracks || pr.data.collection || []);
          nextHref = pr.data.next_href || null;
          pages++;
        } catch { break; }
      }
      rawTracks = rawTracks.slice(0, 200);

      const tracks = await buildTrackList(rawTracks, clientId, sys.user || null, sys.calculated_artwork_url || sys.artwork_url);

      const genreLabel = String(sys.title || sysId).replace(/^.*?trending-by-genre:/, "").replace(/[-:]/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      return res.json({
        author: "yazky",
        type: "playlist",
        results: {
          id: sys.id || sysId,
          title: sys.title || genreLabel,
          description: sys.description || null,
          track_count: sys.track_count || rawTracks.length,
          duration_ms: sys.duration,
          duration: formatDuration(sys.duration),
          genre: sys.genre || null,
          likes_count: sys.likes_count || 0,
          permalink_url: url,
          artwork_url: artUrl(sys.calculated_artwork_url || sys.artwork_url),
          created_at: sys.created_at || null,
          user: sys.user ? {
            id: sys.user.id,
            username: sys.user.username,
            full_name: sys.user.full_name,
            avatar_url: artUrl(sys.user.avatar_url),
            permalink_url: sys.user.permalink_url
          } : { id: null, username: "SoundCloud", full_name: null, avatar_url: null, permalink_url: null },
          tracks
        }
      });
    }

    const resolvedUrl = await normalizeSoundCloudUrl(url);

    let data = null;
    try {
      const resolveRes = await axios.get("https://api-v2.soundcloud.com/resolve", {
        params: { url: resolvedUrl, client_id: clientId },
        headers: SC_HEADERS
      });
      data = resolveRes.data;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        scClientId = null;
      }
    }

    if (!data) {
      const fallbackTrack = await scrapeHydratedTrack(resolvedUrl, clientId);
      if (fallbackTrack) {
        return res.json({ author: "yazky", type: "track", results: fallbackTrack });
      }
      return res.status(404).json({ author: "yazky", error: "Track or resource not found." });
    }

    if (data.kind === "track") {
      const audioUrl = await resolveAudioUrl(data.media?.transcodings || [], clientId);
      let resultObj = formatTrackObject(data, audioUrl);

      if (!resultObj.audioUrl) {
        const fallbackTrack = await scrapeHydratedTrack(resolvedUrl, clientId);
        if (fallbackTrack && fallbackTrack.audioUrl) {
          resultObj = fallbackTrack;
        }
      }

      return res.json({ author: "yazky", type: "track", results: resultObj });
    }

    if (data.kind === "playlist" || data.kind === "album" || (data.is_album && data.tracks)) {
      const rawTracks = (data.tracks || []).slice(0, 100);
      const tracks = await buildTrackList(rawTracks, clientId, data.user, data.artwork_url);

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
      let playlists = [], topTracks = [];
      try {
        const [plRes, trRes] = await Promise.allSettled([
          axios.get(`https://api-v2.soundcloud.com/users/${userId}/playlists`, {
            params: { limit: 20, client_id: clientId }, headers: SC_HEADERS
          }),
          axios.get(`https://api-v2.soundcloud.com/users/${userId}/tracks`, {
            params: { limit: 10, client_id: clientId }, headers: SC_HEADERS
          })
        ]);
        if (plRes.status === "fulfilled")
          playlists = (plRes.value.data.collection || []).map(fmtPlaylist).filter(p => p.id && p.title);
        if (trRes.status === "fulfilled") {
          const rawTop = (trRes.value.data.collection || []);
          topTracks = await buildTrackList(rawTop, clientId, data, data.artwork_url);
        }
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

app.get("/discover", async (req, res) => {
  try {
    const response = await axios.get("https://m.soundcloud.com/discover", {
      headers: MOBI_HEADERS
    });

    const $ = cheerio.load(response.data);
    const rawJson = $("script#__NEXT_DATA__").html();
    if (!rawJson) return res.status(500).json({ error: "Could not parse discover page" });

    const parsedData = JSON.parse(rawJson);

    res.json({
      author: "yazky",
      ...parsedData.props.pageProps
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/feed", async (req, res) => {
  try {
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

    try {
      const clientId = await getSoundCloudClientId();
      const curatorSlugs = [
        "soundcloud-scenes",
        "soundcloudmusicuk",
        "soundcloud-damedame",
        "soundcloud-hustle",
        "soundcloud-peak"
      ];
      const curatorIds = [603473631];
      const slugResults = await Promise.allSettled(
        curatorSlugs.slice(1).map(s => axios.get("https://api-v2.soundcloud.com/resolve", {
          params: { url: `https://soundcloud.com/${s}`, client_id: clientId }, headers: SC_HEADERS
        }))
      );
      slugResults.forEach(r => {
        if (r.status === "fulfilled" && r.value.data?.id) curatorIds.push(r.value.data.id);
      });

      const followingResults = await Promise.allSettled(
        curatorIds.map(id => axios.get(`https://api-v2.soundcloud.com/users/${id}/followings`, {
          params: { limit: 50, client_id: clientId }, headers: SC_HEADERS
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

app.get("/suggestions", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter 'q'" });
    }

    const limit = req.query.limit || "5";
    const clientId = await getSoundCloudClientId();

    const targetUrl = `https://api-mobi.soundcloud.com/search/queries?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}&client_id=${encodeURIComponent(clientId)}&stage=`;

    const response = await axios.get(targetUrl, { headers: MOBI_HEADERS });

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
