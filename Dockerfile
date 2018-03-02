FROM node:9.5
WORKDIR /app
COPY . /app
CMD [ "sh",  "-c", "./start.sh" ]
