NODE_MODULES := ./node_modules
DB_CONTAINER := meetup-db

.PHONY: stop start up up-db prod dev down restart reboot rebuild install yarn-install build clean build-containers

stop:
	docker/compose stop

start:
	docker/compose start

up:
	docker/compose up -d

up-db:
	docker/compose up -d $(DB_CONTAINER)

prod: build reboot

dev: $(NODE_MODULES) up-db
	docker/yarn dev || exit 0
	$(MAKE) down

down:
	docker/compose down

restart: stop start

reboot: down up

rebuild: build restart

install: clean yarn-install

yarn-install:
	docker/yarn install

build: yarn-install
	docker/yarn build

clean:
	rm -rf $(NODE_MODULES) .nuxt

build-containers:
	docker/compose build

$(NODE_MODULES): yarn-install
