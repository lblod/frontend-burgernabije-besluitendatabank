FROM madnificent/ember:4.9.2 as builder

LABEL maintainer="info@redpencil.io"

WORKDIR /app
RUN npm install -g npm@18
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN ember build -prod

FROM semtech/static-file-service:0.2.0
COPY --from=builder /app/dist /data
