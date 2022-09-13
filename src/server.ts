import express from "express";

const app = express();

app.get("/ads", (req, res) => {
  return res.send([
    { id: 1, name: "jogo 1" },
    { id: 2, name: "jogo 2" },
    { id: 3, name: "jogo 3" },
    { id: 4, name: "jogo 4" },
  ]);
});

app.listen(3333);
