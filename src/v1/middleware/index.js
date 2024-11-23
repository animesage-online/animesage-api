import { errorHandler } from "./error.middleware.js";
import { checkDomain, limiter } from "./security.middleware.js";

const empty = (req, res, next) => next();

export { errorHandler, checkDomain, limiter, empty };
