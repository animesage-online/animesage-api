import axios from "axios";
import { ANILIST_API_URL } from "../constants/constants.js";

export const anilistClient = axios.create({
  baseURL: ANILIST_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
