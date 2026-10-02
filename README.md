# IDN Prez Instance
This repository contains the [Prez UI](https://github.com/RDFLib/prez-ui) theme for the IDN Prez instance, as well as [Prez API](https://github.com/RDFLib/prez) configuration.

Available at - [data.idnau.org](https://data.idnau.org/)

## Development

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
