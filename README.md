# ft_transcendence
we will we will make it

## file structure

- backend/ >> everything that goes inside the docker container, thats the api files and backend and all public files like scripts and styles
	- node_modules/ >> packages
	- public/ >> static files including ts scripts to transpile
	- src/ >> the backend and api
	- dist/ >> transpiled .js files
		- public/ >> transpiled from public directory, for requests: "backend/public/index.ts" = "/index.js"
- logs/ >> logs visible at http://localhost:5601
- frontend/ >> currently unused frontend files