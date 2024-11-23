const anilistQuery = {
  InfoQuery: (id) => `
  query Query {
    Media (id: ${id}, type: ANIME) {
    id
    idMal
    countryOfOrigin
    title {
      romaji
      english
      native
      userPreferred
    }
    description
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    genres
    tags {
      id
      name
    }
    format
    type
    status
    isAdult
    episodes
    duration
    averageScore
    popularity
    season
    seasonYear
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    nextAiringEpisode {
      airingAt
      episode
    }
    siteUrl
    trailer {
      id
      site
      thumbnail
    }
    studios {
      nodes {
        name
      }
    }
    airingSchedule {
      nodes {
        episode
        airingAt
      }
    }
  }
}
`,

  InfoQueryByMalId: (idMal) => `
  query Query {
    Media (idMal: ${idMal}, type: ANIME) {
    id
    idMal
    countryOfOrigin
    title {
      romaji
      english
      native
      userPreferred
    }
    description
    coverImage {
      extraLarge
      large
      medium
      color
    }
    bannerImage
    genres
    tags {
      id
      name
    }
    format
    type
    status
    isAdult
    episodes
    duration
    averageScore
    popularity
    season
    seasonYear
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    nextAiringEpisode {
      airingAt
      episode
    }
    siteUrl
    trailer {
      id
      site
      thumbnail
    }
    studios {
      nodes {
        name
      }
    }
    airingSchedule {
      nodes {
        episode
        airingAt
      }
    }
  }
}
`,

  InfoQueryByPage: (page = 1, perPage = 50) => `
  query {
    Page(page: ${page}, perPage: ${perPage}) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME) {
      id
      idMal
      countryOfOrigin
      title {
        romaji
        english
        native
        userPreferred
      }
      description
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
      tags {
        id
        name
      }
      format
      type
      status(version: 2)
      isAdult
      episodes
      duration
      averageScore
      popularity
      season
      seasonYear
      startDate {
        year
        month
        day
       }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      siteUrl
      trailer {
        id
        site
        thumbnail
      }
      studios {
        nodes {
          name
        }
      }
      airingSchedule {
        nodes {
          episode
          airingAt
        }
      } 
    }
  }
}`,

  InfoQueryByStatus: (page = 1, perPage = 50, status) => `
  query {
    Page(page: ${page}, perPage: ${perPage}) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, status: ${status}) {
      id
      idMal
      countryOfOrigin
      title {
        romaji
        english
        native
        userPreferred
      }
      description
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
      tags {
        id
        name
      }
      format
      type
      status(version: 2)
      isAdult
      episodes
      duration
      averageScore
      popularity
      season
      seasonYear
      startDate {
        year
        month
        day
       }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      siteUrl
      trailer {
        id
        site
        thumbnail
      }
      studios {
        nodes {
          name
        }
      }
      airingSchedule {
        nodes {
          episode
          airingAt
        }
      } 
    }
  }
}`,

  TrendingQuery: (page = 1, perPage = 50) => `
  query {
    Page(page: ${page}, perPage: ${perPage}) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, sort: [TRENDING_DESC, POPULARITY_DESC]) {
        id
        idMal
        countryOfOrigin
        title {
        romaji
        english
        native
        userPreferred
      }
      description
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
      tags {
        id
        name
      }
      format
      type
      status(version: 2)
      isAdult
      episodes
      duration
      averageScore
      popularity
      season
      seasonYear
      startDate {
        year
        month
        day
       }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      siteUrl
      trailer {
        id
        site
        thumbnail
      }
      studios {
        nodes {
          name
        }
      }
      airingSchedule {
        nodes {
          episode
          airingAt
        }
      } 
    }
  }
}`,

  PopularQuery: (page = 1, perPage = 50) => `
  query { 
    Page(page: ${page}, perPage: ${perPage}) {
      pageInfo {
        total
        perPage
        currentPage
        lastPage
        hasNextPage
      }
      media(type: ANIME, sort: [POPULARITY_DESC]) { 
      id
      idMal
      countryOfOrigin
      title {
        romaji
        english
        native
        userPreferred
      }
      description
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
      tags {
        id
        name
      }
      format
      type
      status(version: 2)
      isAdult
      episodes
      duration
      averageScore
      popularity
      season
      seasonYear
      startDate {
        year
        month
        day
       }
      endDate {
        year
        month
        day
      }
      nextAiringEpisode {
        airingAt
        episode
      }
      siteUrl
      trailer {
        id
        site
        thumbnail
      }
      studios {
        nodes {
          name
        }
      }
      airingSchedule {
        nodes {
          episode
          airingAt
        }
      }  
    }
  }
}`,
};

export default anilistQuery;
