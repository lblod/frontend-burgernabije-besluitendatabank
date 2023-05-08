# BurgerNabijeBesluitendatabank (front-end)

[The front-end for BNB](https://burgernabije-besluitendatabank-dev.s.redhost.be/), a site that uses linked data to empower everyone in Flanders to consult the decisions made by their local authorities.

You can check out more info on besluitendatabanken [here](https://lokaalbestuur.vlaanderen.be/besluitendatabank), and the [back-end](https://github.com/lblod/app-burgernabije-besluitendatabank) here. The back-end repo will also contain general project information.

## Tutorial: Getting Started
### Prerequisites

- [Node.js](https://nodejs.org/) v10 or later
- [Ember CLI](https://www.npmjs.com/package/ember-cli) v3.15 or later

### Installation
```bash
git clone https://github.com/lblod/frontend-burgernabije-besluitendatabank
cd frontend-burgernabije-besluitendatabank
npm install
```
From there, you can use `npm run dev` in order to use the mock API,  `npm run prod` in order to use a local BNB api, or `npm run proxy` to run using the BNB API on [the external dev server](https://burgernabije-besluitendatabank-dev.s.redhost.be/).


## Discussions
### Ember-Data@3
For some reason beyond human comprehension, Ember-Data refused to work as is documented in the *latest documentation* when using v4, but it did on v3. So guess what. It's v3 now.
