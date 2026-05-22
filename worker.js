export default {
  async fetch(request, env) {
    // 1. Handle CORS so your GitHub Pages frontend is allowed to fetch this
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://fayssalz.github.io/entangled/", // e.g., "https://yourusername.github.io"
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. Ask Cloudflare's API for a fresh, temporary TURN token
    const turnResponse = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.CF_TURN_KEY_ID}/credentials/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ttl: 86400 }) // Token expires in 24 hours (86400 seconds)
    });

    const turnData = await turnResponse.json();

    // 3. Format the response exactly how PeerJS wants it (combining STUN and TURN)
    const peerJsConfig = {
      iceServers: [
        { urls: ["stun:stun.cloudflare.com:3478", "stun:stun.cloudflare.com:53"] },
        turnData.iceServers
      ]
    };

    // 4. Send it back to the game!
    return new Response(JSON.stringify(peerJsConfig), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://fayssalz.github.io/entangled/", // e.g., "https://yourusername.github.io"
      },
    });
  },
};