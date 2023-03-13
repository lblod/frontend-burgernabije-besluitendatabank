FROM madnificent/ember:3.28.5 as builder

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=16384

LABEL maintainer="info@redpencil.io"

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN ember build -prod

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
