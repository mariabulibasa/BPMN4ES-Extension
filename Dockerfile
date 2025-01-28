FROM node:23.6.1-alpine3.20
WORKDIR /usr/src/app
EXPOSE 5000
RUN --mount=type=bind,source=package.json,target=package.json \
    npm install

RUN chown node /usr/src/app

USER node
COPY . .
CMD npm run dev
