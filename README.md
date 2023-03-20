# Frontend BurgerNabije Besluitendatabank

The backend for BNB, a site that uses linked data to empower everyone in Flanders to consult the decisions made by their local authorities.

Important notes:
- This documentation will only contain information specific to the frontend
- For information on the project itself as well as the backend, check out [the backend repo here](https://github.com/lblod/frontend-burgernabije-besluitendatabank)
- This project is built on the [Ember.js](https://emberjs.com/) framework. In case you wish to make changes, familiarity with this might be useful.

## How-to
### Install locally
Running this project requires `git`, `node.js` & `yarn` to be installed.

```bash
git clone https://github.com/lblod/frontend-burgernabije-besluitendatabank.git
cd frontend-burgernabije-besluitendatabank
yarn install  # Installs dependencies
yarn start  # Runs the front-end on localhost:4200 
```

## Reference
### Project structure
- [.woodpecker/](.woodpecker/): woodpecker CI/CD
- [app/](app/): ember.js src
- [config/](config/): ember.js configuration
- *dist/*: build directory (created during runtime)
- [mirage/](mirage): mirage configuration (backend mocking/stubbing for testing)
- [public/](public/): static assets
- [tests/](tests/): tests
- [types](types/): typing for TypeScript support
- \[[.watchmanconfig](.watchmanconfig),[ember-cli-build](ember-cli-build.js), [testem.js](testem.js)\]: additional Ember configuration
- [tsconfig.json](tsconfig.json): TypeScript configuration
