# Set Env &nbsp; [![Actions](https://img.shields.io/badge/qoomon-GitHub%20Actions-blue)](https://github.com/qoomon/actions)

This action exports scoped `vars` and `secrets`.

It automtically replace unsupported variable characters of the action input `export` value with `_` characters.

### Usage
```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: qoomon/actions--set-env@v1
        with:
          vars: ${{ toJson(vars) }}
          # optional - prefer scoped variables over unscoped ones e.g.,
          # PROD__MAGIC_NUMBER or MAGIC_NUMBER__PROD would be chosen over MAGIC_NUMBER
          scope: PROD
          export: |
            MAGIC_NUMBER

      - run: |
          echo "$MAGIC_NUMBER"
```

### Alternative without this Action
```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    env:
      MAGIC_NUMBER: ${{ vars[format('MAGIC_NUMBER__{0}', inputs.env )] }}
    steps:
      - run: |
          echo "$MAGIC_NUMBER"
```


#### Release New Action Version
- Trigger the [Release workflow](../../actions/workflows/release.yaml)
  - The workflow will create a new release with the given version and also move the related major version tag e.g. `v1` to point to this new release
