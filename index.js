const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");

app.get("/", (req, res) => {
  res.send("Harm Reduction Reddit API is live!");
});

app.get("/reddit-search", async (req, res) => {
  const { q, subreddit } = req.query;

  if (!q || !subreddit) {
    return res.status(400).json({ error: "Missing q or subreddit" });
  }

  try {
    const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/search`, {
      headers: {
        Authorization: `Bearer ${process.env.REDDIT_ACCESS_TOKEN}`,
        "User-Agent": "harm-reduction-gpt/0.1"
      },
      params: {
        q: q,
        sort: "relevance",
        limit: 5,
        restrict_sr: 1
      }
    });

    // 🧪 DEBUG LOGGING
    console.log("🔍 Search Parameters:", { q, subreddit });
    console.log("📦 Full Reddit API response:", JSON.stringify(response.data, null, 2));

    const posts = response.data.data.children.map(post => {
      return {
        title: post.data.title,
        selftext: post.data.selftext,
        permalink: post.data.permalink,
        url: `https://reddit.com${post.data.permalink}`
      };
    });

    res.json({ results: posts });
  } catch (error) {
    console.error("❌ Error fetching from Reddit:", error.message);
    res.status(500).json({
      error: "Failed to fetch Reddit posts",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
