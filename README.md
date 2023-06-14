# BurgerNabijeBesluitendatabank (front-end)

[The front-end for BNB](https://burgernabije-besluitendatabank-dev.s.redhost.be/), a site that uses linked data to empower everyone in Flanders to consult the decisions made by their local authorities.

You can check out more info on besluitendatabanken [here](https://lokaalbestuur.vlaanderen.be/besluitendatabank), and the [app repo](https://github.com/lblod/app-burgernabije-besluitendatabank) here. The app repo will also contain general project information; this repo should only contain information needed specifically for the front-end itself.

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

From there, you can use `npm run dev` in order to use the mock API, `npm run prod` in order to use a local BNB api, or `npm run --proxy=https://burgernabije-besluitendatabank-dev.s.redhost.be/` to run using the BNB API on [the external dev server](https://burgernabije-besluitendatabank-dev.s.redhost.be/).

### Automated builds

The project uses woodpecker to automate builds. The configuration files can be found in the `.woodpecker` folder. Builds are available [here](https://build.redpencil.io/lblod/frontend-burgernabije-besluitendatabank/).

- Latest master build : `lblod/frontend-burgernabije-besluitendatabank:latest` 
- Feature branch build : `lblod/frontend-burgernabije-besluitendatabank:feature-<branch-name>`
- Version tag build : `lblod/frontend-burgernabije-besluitendatabank:<version-tag>` tag like v1.2.3 would be published as 1.2.3 (so the v is dropped)

## Discussions

### Data Alignment

Due to the intricacies of levels of Flemish bureaucratic units a data alignment meeting had to be planned.
The reason for this confusion was due to the levels of municipal governance in Flanders. After properly outlining the importance and nuance of each level it was decided that citizens should be able to see both the administrative unit.
The levels are as follows:

- Governing Body (Bestuursorgaan) (Algemene Vergadering Boom Plus)
- Administrative Unit (Bestuurseenheid) (Boom Plus)
- Location (Boom)

![Data Alignment Analysis]("./../docs/analysis-bnb.png)

### Ember-Data@3

For some reason beyond human comprehension, Ember-Data refused to work as is documented in the _latest documentation_ when using v4, but it did on v3. So guess what. It's v3 now.
