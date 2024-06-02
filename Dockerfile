# use the official Bun image
FROM oven/bun:1-alpine as base
WORKDIR /usr/src/app

# install deps into temp dir
# allows them to be cached and speed up new builds
FROM base as install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp (for deps)
# then copy all (non-ignored) project files into the image
FROM base as prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/package.json .
# for simplicity, emulate the src structure
COPY --from=prerelease /usr/src/app/src/ ./src

# run the app
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]