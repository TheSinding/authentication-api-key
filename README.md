# API key Strategy for Feathers Authentication

This strategy adds api keys to feathersjs authentication.

## Requirements

Currently it only supports when it's used in conjunction with the "Local Strategy" aswell.

## Installation

To install and use the strategy, first run `npm install @thesinding/authentication-api-key`

Now add the strategy to your `authentication.(ts|js)` like so:

```javascript
... // other imports
const { ApiKeyStrategy } =  require('@thesinding/authentication-api-key');

module.exports  =  app  => {
	... // Other authentications strategies
	authentication.register('api-key', new  ApiKeyStrategy()); // add the strategy
	... // Rest of the file
};
```

```javascript
... // other imports

export default {
  before: {
    all: [authenticate("jwt", "api-key")], // Add the api-key to the authenticate hook
    ... // other hooks
};
```

Now, there are two ways of using this strategy:

- With a static API key (Not really recommended, but up to you)
- With a serivce based method. (Recommended)

#### First Method. Static key (Not recommened)

To configure this method, just add the key under the config like so

```jsonc
{
  "host": "localhost",
  "port": 3030,
  "public": "../public/",
  "paginate": {
    "default": 10,
    "max": 50
  },
  "authentication": {
	 // other settings
    "authStrategies": [
      "jwt",
      "local",
      "api-key" // Add the api key as a strategy
    ],
    "jwtOptions": {  // Your JWT options  },
    // other strategies,
    "api-key": {
      "headerField": "x-api-key", // Required
      "key": "KEY HERE" // Required
    }
   }
}

```

#### Second Method. Service based (Recommended)

Firsly create a service which should handle the API keys. Thats up to you.
Optionally you can add a field to keep track if a key is revoked. eg `revoked`.

Now just add `entity` and `service` to the config like so.

```jsonc
{
  "host": "localhost",
  "port": 3030,
  "public": "../public/",
  "paginate": {
    "default": 10,
    "max": 50
  },
  "authentication": {
	 // other settings
    "authStrategies": [
      "jwt",
      "local",
      "api-key" // Add the api key as a strategy
    ],
    "jwtOptions": {  // Your JWT options  },
    // other strategies,
    "api-key": {
      "headerField": "x-api-key", // Required
      "entity": "api-key", // Required - The name of the key field
      "service": "api-keys", // Required - The name of the service to use.
      "revokedField": "revoked" // Optional - The name of the revoked field
    }
   }
}

```

Now just add `x-api-key: "KEY HERE"` to your headers, and it should be authenicated.

Done.

## Changelog:

```text
0.0.1 - initial release
```
