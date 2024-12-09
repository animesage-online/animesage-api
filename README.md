# 🌟 Animesage API

[![Version](https://img.shields.io/badge/version-1.3.0-blue)](./package.json) [![Status](https://img.shields.io/badge/status-active-brightgreen)](./README.md) [![License](https://img.shields.io/badge/license-Custom%20BY--NC-lightgrey)](./LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![npm](https://img.shields.io/badge/npm-10.9.0-red)](https://www.npmjs.com/)
[![Node.js](https://img.shields.io/badge/node-v22.11.0-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-blue)](https://expressjs.com/)

Welcome to the Animesage API documentation. This API provides various endpoints to access anime-related data.

## 📖 Table of Contents

- [🌐 Base URL](#-base-url)
- [📚 Endpoints (v1)](#-endpoints-v1)
- [🚦 Rate Limits (v1)](#-rate-limits-v1)
- [📧 Contact for Higher Rate Limits](#-contact-for-higher-rate-limits)
- [👤 Developer](#-Developer)
- [📖 Documentation](#-documentation)
- [🙏 Thanks/Credits](#-thankscredits)
- [📜 License](#-license)

## 🌐 Base URL

- **Base URL:** `https://api.animesage.online/`
- **Version 1 Base URL:** `https://api.animesage.online/api/public/v1/`

## 📚 Endpoints (v1)

### 1. 🎥 Get Detailed Information About a Specific Anime

- **Endpoint:** `GET /v1/anime/:animeId/info`
- **Description:** Retrieve comprehensive details about a specific anime.
- **Path Parameters:**

  | Parameter | Type           | Required | Description                          |
  | --------- | -------------- | -------- | ------------------------------------ |
  | `animeId` | integer/string | Yes      | The unique identifier for the anime. |

- **Query Parameters:**

  | Parameter  | Type   | Default   | Required | Options                                                                                                | Description                             |
  | ---------- | ------ | --------- | -------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
  | `idProvider` | string | `animesage` | No       | `animesage` `anilist` `mal` `gogo` `zoro` `pahe` `notifymoe` `kitsu` `anidb` `livechart` `anisearch` `animeplanet` | Specifies the provider of the anime ID. |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/1/info?idProvider=anilist"
  ```

### 2. 📺 Get All Episodes Info of a Specific Anime

- **Endpoint:** `GET /v1/anime/:animeId/episodes`
- **Description:** Fetch information on all episodes of a specific anime.
- **Path Parameters:**

  | Parameter | Type           | Required | Description                          |
  | --------- | -------------- | -------- | ------------------------------------ |
  | `animeId` | integer/string | Yes      | The unique identifier for the anime. |

- **Query Parameters:**

  | Parameter  | Type   | Default   | Required | Options                                                                                                | Description                             |
  | ---------- | ------ | --------- | -------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
  | `idProvider` | string | `animesage` | No       | `animesage` `anilist` `mal` `gogo` `zoro` `pahe` `notifymoe` `kitsu` `anidb` `livechart` `anisearch` `animeplanet` | Specifies the provider of the anime ID. |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/1/episodes?idProvider=anilist"
  ```

### 3. 📄 Get All Anime Information by Page

- **Endpoint:** `GET /v1/anime/info/page/:page`
- **Description:** Access a paginated list of anime information.
- **Path Parameters:**

  | Parameter | Type    | Required | Description                  |
  | --------- | ------- | -------- | ---------------------------- |
  | `page`    | integer | Yes      | The page number to retrieve. |

- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `limit`   | integer | `20`    | No       | Number of results per page. Min: 1, Max: 50 |
  | `year`    | integer |         | No       | Filter by release year.                     |
  | `season`  | string  |         | No       | Options: `winter` `spring` `summer` `fall`  |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/info/page/1?limit=50&year=2023&season=winter"
  ```

### 4. 🔍 Search for an Anime by Title

- **Endpoint:** `GET /v1/anime/search-by-title/:title`
- **Description:** Look up an anime using its title.
- **Path Parameters:**

  | Parameter | Type   | Required | Description                           |
  | --------- | ------ | -------- | ------------------------------------- |
  | `title`   | string | Yes      | The title of the anime to search for. |

- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `page`    | integer | `1`     | No       | The page number to retrieve.                |
  | `limit`   | integer | `20`    | No       | Number of results per page. Min: 1, Max: 50 |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/search-by-title/reincarnated as slime?page=1&limit=50"
  ```

### 5. 🔥 Get Trending Anime

- **Endpoint:** `GET /v1/anime/trending`
- **Description:** Discover currently trending anime.
- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `page`    | integer | `1`     | No       | The page number to retrieve.                |
  | `limit`   | integer | `20`    | No       | Number of results per page. Min: 1, Max: 50 |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/trending?page=1&limit=50"
  ```

### 6. 🌟 Get Popular Anime

- **Endpoint:** `GET /v1/anime/popular`
- **Description:** Explore popular anime titles.
- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `page`    | integer | `1`     | No       | The page number to retrieve.                |
  | `limit`   | integer | `20`    | No       | Number of results per page. Min: 1, Max: 50 |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/popular?page=1&limit=50"
  ```

### 7. 🎬 Get Stream Links for a Specific Anime Episode

- **Endpoint:** `GET /v1/anime/:animeId/stream/:episodeNumber`
- **Description:** Obtain streaming links for a specific episode of an anime.
- **Path Parameters:**

  | Parameter       | Type           | Required | Description                          |
  | --------------- | -------------- | -------- | ------------------------------------ |
  | `animeId`       | integer/string | Yes      | The unique identifier for the anime. |
  | `episodeNumber` | integer        | Yes      | The episode number.                  |

- **Query Parameters:**

  | Parameter  | Type   | Default   | Required | Options                                                                                                | Description                             |
  | ---------- | ------ | --------- | -------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- |
  | `idProvider` | string | `animesage` | No       | `animesage` `anilist` `mal` `gogo` `zoro` `pahe` `notifymoe` `kitsu` `anidb` `livechart` `anisearch` `animeplanet` | Specifies the provider of the anime ID. |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/1/stream/1?idProvider=anilist"
  ```

### 8. 🎲 Get a Random Anime

- **Endpoint:** `GET /v1/anime/random`
- **Description:** Fetch a random anime title.

- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `isStreamable` | boolean | `false` | No       | If true, the anime has streaming links. |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/random?isStreamable=true"
  ```

### 9. 📅 Get All Latest Airing Anime

- **Endpoint:** `GET /v1/anime/latest-anime`
- **Description:** Access a list of the latest airing anime.
- **Query Parameters:**

  | Parameter | Type    | Default | Required | Description                                 |
  | --------- | ------- | ------- | -------- | ------------------------------------------- |
  | `page`    | integer | `1`     | No       | The page number to retrieve.                |
  | `limit`   | integer | `20`    | No       | Number of results per page. Min: 1, Max: 50 |

- **Example:**

  ```bash
  curl -X GET "https://api.animesage.online/api/public/v1/anime/latest-anime?page=1&limit=50"
  ```

## 🚦 Rate Limits (v1)

To ensure fair usage and maintain performance, the Animesage API enforces the following rate limits:

| 🕒 Time Frame | 🚀 Requests Allowed | 🌟 Description                                 |
| ------------- | ------------------- | ---------------------------------------------- |
| ⏱️ Per Minute | 120 requests        | Maximum number of requests allowed per minute. |
| ⏰ Per Second | 10 requests         | Maximum number of requests allowed per second. |

> **Note:** Exceeding these limits will result in a 1-minute timeout from accessing the API. Please ensure your application handles rate limit responses gracefully.

## 📧 Contact for Higher Rate Limits

If you are a developer creating an app, website, or project and require a higher rate limit, please feel free to contact me at [animesage@animesage.online](mailto:animesage@animesage.online) for further discussion.

## 👤 Developer

- **Name:** Sandipan
- **GitHub:** [Sandipan Singh GitHub](https://github.com/sandipansingh)
- **Email:** [animesage@animesage.online](mailto:animesage@animesage.online)

## 📖 Documentation

For more detailed documentation, visit [Animesage API Docs](https://docs.animesage.online).

## 🙏 Thanks/Credits

- **Special thanks to the following projects and contributors for their support and resources:**

- [Anilist-ApiV2](https://github.com/AniList/ApiV2-GraphQL-Docs) by [AniList](https://anilist.co/)
- [jikan-rest](https://github.com/jikan-me/jikan-rest) by [Jikan](https://github.com/jikan-me/)
- [consumet.ts](https://github.com/consumet/consumet.ts) by [consumet](https://github.com/consumet)
- [mal-backup](https://github.com/bal-mackup/mal-backup) by [bal-mackup](https://github.com/bal-mackup)
- [anime-lists](https://github.com/Fribb/anime-lists) by [Fribb](https://github.com/Fribb)
- [gogoanime-I](https://anitaku.bz/) & [gogoanime-II](https://gogoanime3.cc/)
- [amvstrm](https://github.com/amvstrm/) for the inspiration and ideas on how to structure the project.

## 📜 License

This project is licensed under the [Custom BY-NC License](./LICENSE).

---

© 2024 Animesage-Online. All Rights Reserved.

---
