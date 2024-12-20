FROM node:23.3.0
WORKDIR /usr/src/app
EXPOSE 5000
RUN --mount=type=bind,source=package.json,target=package.json \
    npm install

RUN chown node /usr/src/app

USER node
COPY . .
CMD npm run dev
