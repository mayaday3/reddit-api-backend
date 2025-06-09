const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Harm Reduction Reddit API is live!");
});



const axios = require("axios");

app.get("/reddit-search", async (req, res) => {
  const { q, subreddit } = req.query;

  if (!q || !subreddit) {
    return res.status(400).json({ error: "Missing q or subreddit" });
  }

  try {
    const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/search`, {
      headers: {
        Authorization: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IlNIQTI1NjpzS3dsMnlsV0VtMjVmcXhwTU40cWY4MXE2OWFFdWFyMnpLMUdhVGxjdWNZIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyIiwianRpIjoic0N6Mkl5cGVLZjltQlV3SXNYR01WRFUzUUV4LXJBIiwiZXhwIjoxNzQ5NTc4MzI3LjU4Nzg5LCJpYXQiOjE3NDk0OTE5MjcuNTg3ODksImNpZCI6Im5VdEVveGROaXM4TkhfeVl3c0VfU3ciLCJsaWQiOiJ0Ml8xN284eDk4aWY1IiwiYWlkIjoidDJfMTdvOHg5OGlmNSIsInNjcCI6ImVKeUtWaXBLVFV4UmlnVUVBQURfX3d2RUFwayIsImxjYSI6MTcyNDkzMTA1OTc3NiwiZmxvIjo5fQ.Hhg9bDApZWhQD4LDsHj-_QA48u67PWk6iY3PvT4uUKlu_D8hfcP6PTyDMXPcCOV_5XgS2-xShpGX4vF2Sa21KKj6pfq2ww3h-5qb6onkCvICbQd_ei8ZAqFdIIwCi89R0E7qAR38jCFY-WfSiNqnlGIsUplLwM5I1SpSOsrDCfN6ZXalBCQluNu_kuN5scy-ouBTou4sue7MmdP65QPeyoYvn3B9V8UZaxaCTceu28Tc937OY3J4k7eMrxkeDK2U8qI5g-awJE3L2axHoyEEoKshc-e3pN9cbkqcL28ZnwXTGrCpWU0-ESMJji51kEWUkmt2tOurzNh8LQZPcr0BIA",
        "User-Agent": "harm-reduction-gpt/0.1"
      },
      params: {
        q: q,
        sort: "relevance",
        limit: 5,
      }
    });

    console.log(JSON.stringify(response.data, null, 2));
    
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
    res.status(500).json({ error: "Failed to fetch Reddit posts", details: error.message });
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});