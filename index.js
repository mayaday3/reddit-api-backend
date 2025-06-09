const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");
let redditAccessToken = null;

async function fetchRedditAccessToken() {
  const auth = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "password",
        username: process.env.REDDIT_USERNAME,
        password: process.env.REDDIT_PASSWORD,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "harm-reduction-gpt/0.1"
        }
      }
    );

    redditAccessToken = response.data.access_token;
    console.log("✅ New Reddit access token fetched");
  } catch (err) {
    console.error("❌ Failed to fetch Reddit access token:", err.message);
  }
}
app.get("/", (req, res) => {
  res.send("Harm Reduction Reddit API is live!");
});

app.get("/reddit-search", async (req, res) => {
  const { q, subreddit } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing q" });
  }

  const baseUrl = subreddit
    ? `https://oauth.reddit.com/r/${subreddit}/search`
    : `https://oauth.reddit.com/search`;

  try {
    const response = await axios.get(baseUrl, {
      headers: {
        Authorization: `Bearer ${process.env.REDDIT_ACCESS_TOKEN}`,
        "User-Agent": "harm-reduction-gpt/0.1"
      },
      params: {
        q,
        sort: "relevance",
        limit: 5,
        restrict_sr: subreddit ? 1 : undefined
      }
    });

    console.log("📦 Reddit response:", JSON.stringify(response.data, null, 2));

    const posts = response.data.data.children.map(post => ({
      title: post.data.title,
      selftext: post.data.selftext,
      permalink: post.data.permalink,
      url: `https://reddit.com${post.data.permalink}`
    }));

    res.json({ results: posts });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch Reddit posts",
      details: error.response?.data || error.message
    });
  }
});

app.listen(port, async () => {
  console.log(`🚀 Server running on port ${port}`);
  await fetchRedditAccessToken(); // 🔐 Get your first token when app starts
});
