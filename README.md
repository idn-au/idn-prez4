# IDN Prez Instance
This repository contains the [Prez UI](https://github.com/RDFLib/prez-ui) theme for the IDN Prez instance, as well as [Prez API](https://github.com/RDFLib/prez) configuration.

Available at - [data.idnau.org](https://data.idnau.org/)

## Development
> [!IMPORTANT]
> Installing this repo locally requires installing `@idn-au` NPM packages on the GitHub registry, which requires a token with permissions to access.
> Read the [GitHub docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package) for more info.

> [!NOTE]
> The UI requires [PNPM](https://pnpm.io/) to be installed on your machine to install & run locally

To install:

```bash
pnpm install
```

To run locally:

```bash
pnpm dev
```

### Theming
See the [theming docs](https://github.com/RDFLib/prez-ui/blob/main/docs/theming.md) for more info.

## Prez Configuration
The [`prez_config/`](./prez_config) directory contains the configuration files for the API endpoints, profiles & prefixes. See the [Prez API](https://github.com/RDFLib/prez) documentation for more info.

### ATNS Profile
The current ATNS profile continues to treat an ATNS CreativeWork and a related ODRL Agreement as separate resources; the proposed future dual-type model is not implemented by this profile.
