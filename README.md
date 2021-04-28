# setup-buf

![setup-buf](https://github.com/mu-io/setup-buf/workflows/CD/badge.svg)

This action sets up a buf environment for use in actions by:

- optionally downloading and caching a version of Buf by version and adding to PATH

It will first check the local cache for a version match. If version is not found locally, it will download directly from the [bufbuild/buf](https://github.com/bufbuild/buf/releases) repository.

Matching by semver spec:

```yaml
steps:
- uses: actions/checkout@v2
- uses: mu-io/setup-buf@v1beta
  with:
    buf-version: '0.36.0' # The Buf version to download (if necessary) and use.
    token: ${{ secrets.GITHUB_TOKEN }} # Default token in GitHub Action to wave API request limits
- run: buf --version
```

## Usage

See [action.yml](action.yml)

> Note: We reserve the `buf-version` `latest` for the latest release. Hence to obtain the latest release, just use `latest`.
> At this time, it is recommended to fix a version as Buf is still in pre-release.

Basic:

```yaml
steps:
- uses: actions/checkout@master
- uses: mu-io/setup-buf@v1beta
  with:
    buf-version: '0.36.0' # The Buf version to download (if necessary) and use.
- run: buf generate
```

Matrix Testing:

```yaml
jobs:
  build:
    runs-on: ubuntu-16.04
    strategy:
      matrix:
        buf: [ '0.36.0', '0.35.0' ]
    name: Buf ${{ matrix.buf }} sample
    steps:
      - uses: actions/checkout@v2
      - uses: mu-io/setup-buf@v1beta
        with:
          buf-version: ${{ matrix.buf }}
          token: ${{ secrets.GITHUB_TOKEN }} # Default token in GitHub Action to wave API request limits
      - run: buf generate
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).

## Contributions

Contributions are welcome!  See [Contributor's Guide](docs/contributors.md).

### Code of Conduct

:wave: Be nice.  See [our code of conduct](CONDUCT).
