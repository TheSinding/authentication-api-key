import { FeathersError } from "@feathersjs/errors";

export class InvalidAPIError extends FeathersError {
  constructor() {
    super("Invalid API key", "InvalidAPIKey", 401, "InvalidAPIKey", {});
  }
}
