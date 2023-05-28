# League Scout
Project about displaying statistical information about league of legends accounts.

# Tech Stack
## Backend
The backend is built using node.js and uses express for routing. Needs a **.env** file to hold imporant values like Riot's API key, which can be generated [here](https://developer.riotgames.com/), and other information that is useful across the app such as endpoints, ports, etc.

## Frontend
The frontend is built using React + Typescript + TailwindCss.

## Database
Data is stored in a MongoDB database. The data is gathered from [Riot Games' API](https://developer.riotgames.com/apis), accessed through their [developer portal](https://developer.riotgames.com/).

# Deployment in development mode
To deploy locally in development mode, firstly open a terminal and deploy the backend with:
- cd backend
- npm run dev

Secondly, open a new terminal and deploy the frontend with:
- cd league-scout-app
- npm run dev
