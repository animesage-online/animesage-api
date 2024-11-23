export const getIdFieldForProvider = (provider, isDub = false) => {
  const providerMap = {
    anilist: "idAni",
    mal: "idMal",
    gogo: isDub ? "idGogoDub" : "idGogo",
    zoro: "idZoro",
    pahe: "idPahe",
    notifymoe: "idNotifyMoe",
    kitsu: "idKitsu",
    anidb: "idAnidb",
    livechart: "idLivechart",
    anisearch: "idAnisearch",
    animeplanet: "idAnimePlanet",
  };

  return providerMap[provider] || "idAni";
};
