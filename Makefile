DC_FILE := docker-compose.yml

up:
	@echo "Building and starting all containers..."
	@docker compose -f $(DC_FILE) up --build -d

down:
	@echo "Stopping and removing all containers..."
	@docker compose -f $(DC_FILE) down

stop:
	@echo "Stopping containers..."
	@docker compose -f $(DC_FILE) stop

start:
	@echo "Starting containers..."
	@docker compose -f $(DC_FILE) start

elk:
	@echo "Starting the log management system..."
	@docker compose up -d logstash

app:
	@echo "Starting the app..."
	@docker compose up -d nginx

status:
	@echo "Showing status of containers..."
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

clean: clean-containers clean-images clean-volumes

clean-containers:
	@echo "Stopping and removing all containers..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@docker rm $$(docker ps -qa) 2>/dev/null || true

clean-images:
	@echo "Removing all images..."
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true

clean-volumes:
	@echo "Removing all volumes..."
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true

fclean: down clean
	@echo "Performing system-wide cleanup of Docker resources..."
	@docker system prune -f
	@rm -rf ./backend/src/transcend.db

.PHONY: up down stop start status clean clean-images clean-volumes fclean elk app