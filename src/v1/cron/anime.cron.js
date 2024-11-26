import cron from "node-cron";
import { APP_CONFIG } from "../constants/constants.js";
import { AppErrorTypes } from "../utils/appError.js";

class AnimeCron {
  async _executeCronJob(func) {
    try {
      if (APP_CONFIG.isUseCronJob) {
        await func();
      }
    } catch (error) {
      throw AppErrorTypes.CRON.CRON_JOB_FAILED();
    }
  }

  async everyMinute(func) {
    cron.schedule("* * * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyFiveMinute(func) {
    cron.schedule("*/5 * * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everySeventeenMinute(func) {
    cron.schedule("*/17 * * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyHour(func) {
    cron.schedule("0 * * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyFourHour(func) {
    cron.schedule("0 */4 * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyFiveHour(func) {
    cron.schedule("0 */5 * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyDay(func) {
    cron.schedule("0 0 * * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async everySunday(func) {
    cron.schedule("0 0 * * 0", async () => {
      await this._executeCronJob(func);
    });
  }

  async everyMonth(func) {
    cron.schedule("0 0 1 * *", async () => {
      await this._executeCronJob(func);
    });
  }

  async updateEveryYear(func) {
    cron.schedule("0 0 1 1 *", async () => {
      await this._executeCronJob(func);
    });
  }
}

export const animeCron = new AnimeCron();
