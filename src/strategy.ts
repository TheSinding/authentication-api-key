import { Params } from "@feathersjs/feathers";
import { InvalidAPIError } from "./InvalidAPIKeyError";
import { NotAuthenticated } from "@feathersjs/errors";
import { IncomingMessage, ServerResponse } from "http";
import {
  AuthenticationBaseStrategy,
  AuthenticationResult,
} from "@feathersjs/authentication";

interface Configuration {
  entity: string;
  service: string;
  key: string;
  revokedField: string;
  headerField: string;
}

export class ApiKeyStrategy extends AuthenticationBaseStrategy {
  private serviceBased: boolean = false;
  constructor() {
    super();
  }

  get configuration(): Configuration {
    const config = super.configuration || {};
    return { entity: "api-key", ...config };
  }

  verifyConfiguration() {
    this.serviceBased = ["service", "entity"].every(
      (prop) => prop in this.configuration
    );
    if (!this.serviceBased) {
      if (!("key" in this.configuration)) {
        throw new Error(
          `A static key is missing, when strategy '${this.name}', is not service based`
        );
      }
    }
    ["headerField"].forEach((prop) => {
      if (prop in this.configuration) return;
      throw new Error(`'${prop}' is missing from configuration`);
    });
  }

  async findEntity(apiKey: string, params: Params) {
    const { entity } = this.configuration;
    try {
      const result = await this.entityService.find({
        query: { [entity]: apiKey, $limit: 1 },
        paginate: false,
      });
      if (result.length === 0) {
        throw new InvalidAPIError();
      }
      return result[0];
    } catch (error) {
      throw new InvalidAPIError();
    }
  }

  async authenticate(authRequest: AuthenticationResult, params: Params) {
    const { key, entity, revokedField, headerField } = this.configuration;
    const apiKey = authRequest[entity];
    const response = {
      authentication: {
        strategy: this.name,
        [entity]: apiKey,
      },
      headers: {
        ...params.headers,
        [headerField]: apiKey,
      },
      apiKey: true,
      [entity]: {},
    };

    if (!this.serviceBased) {
      if (key !== apiKey) throw new InvalidAPIError();
      return response;
    }

    const apiKeyData = await this.findEntity(apiKey, params);
    if (revokedField in apiKeyData) {
      if (apiKeyData[revokedField]) {
        throw new NotAuthenticated("API Key has been revoked");
      }
    }

    response[entity] = apiKeyData;
    return response;
  }

  async parse(req: IncomingMessage, res: ServerResponse) {
    const { headerField, entity } = this.configuration;
    const apiKey = req.headers[headerField];
    if (apiKey) {
      return {
        strategy: this.name,
        [entity]: apiKey,
      };
    }

    return null;
  }
}
