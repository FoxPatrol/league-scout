# League Scout

Project about displaying statistical information about league of legends accounts.

# Tech Stack

## Backend

The backend is built using node.js and uses express for routing. Needs a **.env** file to hold imporant values like Riot's API key, which can be generated [here](https://developer.riotgames.com/), and other information that is useful across the app such as endpoints, ports, etc.

## Frontend

The frontend is built using React + Typescript + TailwindCss.

It needs the `assets` folder, which houses the image assets from riot. These are documented in their [data dragon page](https://developer.riotgames.com/docs/lol). Most assets can be downloaded from the [Data Dragon section](https://developer.riotgames.com/docs/lol#:~:text=api.riotgames.com-,Data%20Dragon,-Data%20Dragon%20is). Assets regarding `rank` and `wings` can be downloaded from the [Icons and Emblems section](https://developer.riotgames.com/docs/lol#:~:text=any%20ranked%20queue.-,Icons%20and%20Emblems,-The%20most%20recent) and have to be resorted and renamed. To download the runes' assets use `npm run download-perk-assets`.

All in all, the `assets` directory should have these:

- champion ------------- (from data dragon)
- item ----------------- (from data dragon)
- map ------------------ (from data dragon)
- perk-images ---------- (from npm download script)
- profileicon ---------- (from data dragon)
- rank ----------------- (from data dragon rank&wings)
- spell ---------------- (from data dragon)
- wings ---------------- (from data dragon rank&wings)
- item.json ------------ (from data dragon)
- runesReforged.json --- (from data dragon)
- summoner.json -------- (from data dragon)

## Data fetching and storing

Data is stored in a MongoDB database. The data is gathered from [Riot Games' API](https://developer.riotgames.com/apis), accessed through their [developer portal](https://developer.riotgames.com/).

# Deployment in development mode

To deploy locally in development mode, firstly open a terminal and deploy the backend with:

- cd backend
- npm run dev

Secondly, open a new terminal and deploy the frontend with:

- cd league-scout-app
- npm run dev
