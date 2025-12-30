/*!
 *  Jacked-GPT - An AI-powered fitness routine generator
 *  https://github.com/evoluteur/jacked-gpt
 *  (c) 2024 Olivier Giulieri & Phil Rosace
 */

import express from "express";
import config from "./config.js";
import getRoutine from "./ask-gpt.js";

const getHello = async (req, res) => {
  res.json({ hello: "Hello JackedGPT" });
};

const router = express.Router();

router.get(config.apiPath + "routine", getRoutine);
router.get(config.apiPath + "hello", getHello);

export default router;
