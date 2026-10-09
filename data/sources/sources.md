# data sources

## enem-api

**repo**: https://github.com/yunger7/enem-api/tree/main/public

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/yunger7/enem-api.git enem-api
cd enem-api
git sparse-checkout set public
find . -mindepth 1 -maxdepth 1 ! -name '.git' ! -name 'public' -exec rm -rf -- {} +
rm -rf .git
shopt -s dotglob nullglob
mv public/* ./
rmdir public
shopt -u dotglob nullglob
```