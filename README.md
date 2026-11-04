# IDN Prez UI v4 Theme
The [Prez UI](https://github.com/RDFLib/prez-ui) v4 theme for the IDN, available at [data.idnau.org](https://data.idnau.org/).

## Development
> [!IMPORTANT]
> Installing this repo locally requires installing `@idn-au` NPM packages on the GitHub registry, which requires a token with permissions to access.
> Read the [GitHub docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package) for more info.

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

## Prez profile authority

`prez-profiles.trig` is the source of truth for profiles deployed with IDN Prez. Project repositories and Prez Workbench may keep local mirrors for testing, but changes intended for deployment must be made here first and then copied to those mirrors. The current ATNS profile continues to treat an ATNS CreativeWork and a related ODRL Agreement as separate resources; the proposed future dual-type model is not implemented by this profile.
