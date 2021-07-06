# pull official Cypress image
FROM cypress/base:14.16.0

# set working directory
RUN mkdir /app
WORKDIR /app

# copy our test application
COPY . /app

# install NPM dependencies
RUN npm install

# copy all files into the container
#COPY . /app

# check if the binary was installed successfully
RUN $(npm bin)/cypress verify

# run tests
RUN ["npm", "run", "cypress:e2e"]