import express from "express";
import cors from "cors";

import { PrismaClient } from "@prisma/client";
import { convertHoursStringToMinutes } from "./utils/convert-hours-string-to-minutes";
import { convertMinutesToHoursString } from "./utils/convert-minutes-to-hours-string";

const app = express();

app.use(express.json());
app.use(cors());

const prisma = new PrismaClient({
  log: ["query"],
});

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return res.json(games);
});

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const body: any = req.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      useVoiceChannel: body.useVoiceChannel,
      yearsPlaying: body.yearsPlaying,
      hourStart: convertHoursStringToMinutes(body.hourStart),
      hourEnd: convertHoursStringToMinutes(body.hourEnd),
    },
  });

  return res.status(201).json(ad);
});

app.get("/games/:id/ads", async (req, res) => {
  const { id: gameId } = req.params;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedAds = ads.map((ad) => ({
    ...ad,
    weekDays: ad.weekDays.split(","),
    hourStart: convertMinutesToHoursString(ad.hourStart),
    hourEnd: convertMinutesToHoursString(ad.hourEnd),
  }));

  return res.send(formattedAds);
});

app.get("/ads/:id/discord", async (req, res) => {
  const { id: adsId } = req.params;

  const { discord } = await prisma.ad.findFirstOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adsId,
    },
  });

  return res.send({ discord });
});

app.listen(3333);
