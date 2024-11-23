import cron from "node-cron";

class AnimeCron {
  async everyMinute(func) {
    cron.schedule("* * * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyFiveMinute(func) {
    cron.schedule("*/5 * * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everySeventeenMinute(func) {
    cron.schedule("*/17 * * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyHour(func) {
    cron.schedule("0 * * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyFourHour(func) {
    cron.schedule("0 */4 * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyFiveHour(func) {
    cron.schedule("0 */5 * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyDay(func) {
    cron.schedule("0 0 * * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everySunday(func) {
    cron.schedule("0 0 * * 0", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async everyMonth(func) {
    cron.schedule("0 0 1 * *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }

  async updateEveryYear(func) {
    cron.schedule("0 0 1 1 *", async () => {
      try {
        await func();
      } catch (error) {}
    });
  }
}

export const animeCron = new AnimeCron();
