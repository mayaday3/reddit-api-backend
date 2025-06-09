const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000; // Use Render's port

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
        limit: 5
      }
    });

    const posts = response.data.data.children.map(post => ({
      title: post.data.title,
      selftext: post.data.selftext,
      permalink: post.data.permalink,
      url: `https://reddit.com${post.data.permalink}`
    }));

    res.json({ results: posts });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch Reddit posts", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
