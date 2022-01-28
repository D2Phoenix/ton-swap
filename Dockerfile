# pull official base image
FROM node:14.17.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --silent
RUN yarn add react-scripts@5.0.0 -g --silent

# add app
COPY . ./

# start app
CMD ["npm", "start"]
