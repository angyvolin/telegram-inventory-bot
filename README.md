# Superb template for building Telegram Bots
## It's based on a couple of pretty cool technologies:
* [Typescript](https://www.typescriptlang.org) ❤
* [Telegraf](https://telegraf.js.org)📡
* [MongoDB](https://www.mongodb.com/what-is-mongodb) 🔮
* [Mongoose](https://github.com/Automattic/mongoose/) 🐿️

`src` folder has the next structure:  
```bash
├───index.ts
├───config.json
├───texts.json
├───controllers/
├───handlers/
├───helpers/
├───init/
├───middlewares/
├───models/
└───scenes/
```
### So, let's learn how to build bots with TS-Bot-Template!
Firstly, you should insert your connection data into `config.json`  
There are `dev` and `prod` objects. Using them depends on your `NODE_ENV`
```javascript
{
    "dev": {
        "token": "<TOKEN>",
        "dbUrl": "mongodb://127.0.0.1:27017/tsbot",
        "port": 80
    },
    "prod": {
        "token": "<TOKEN>",
        "dbUrl": "mongodb://127.0.0.1:27017/tsbot",
        "port": 8080
    }
}
```
At `index.ts` we configure our bot and initialize [Telegraf middlewares](https://telegraf.js.org/#/?id=middleware), [scenes](https://telegraf.js.org/#/?id=stage), message handlers and DB connection.

```typescript
import Bot from './init/bot'
import DB from './init/db'
import Handlers from './init/handlers'
import Middlewares from './init/middlewares'
import Scenes from './init/scenes'

const bot = Bot.configure() // configuring bot

Middlewares.init(bot)       // initializing middlewares
Scenes.init(bot)            // initializing scenes
Handlers.init(bot)          // initializing handlers
DB.connect()                // connecting to DB
```
You can use `texts.json` to put here texts for your messages.

#### Let's explore our folders
* `init` folder keeps modules, that help us init everything we need;
* `middlewares` folder keeps our custom middlewares;
* `controllers` folder keeps routes files. They represents a class of Message with their own keyboard;
* `handlers` folder keeps message handlers;
* `helpers` folder keeps additional functions you may need during development. You can expand existing files and create new;
* `scenes` folder keeps scenes (dialog scripts);
* `models` folder keeps models and schemas for Mongoose.

#### How to create custom handlers, scenes, middlewares etc?
You should create new file as in example and register it in the relevant file in `init` folder. Import it and call `init` function with bot instance as argument.  
```typescript
import * as api from 'telegraf'
import YourHandler from '../handlers/yourHandler'

export default class Handlers {
    public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
        try {
            // ...
            YourHandler.init(bot)
        }
        catch {
            // ...
        }
    }
}
```
What about scenes, import it in `init/scenes.ts` and call `stage.register` with your scene as argument.
```typescript
import * as api from 'telegraf'
import YourScene from '../scenes/yourScene'

export default class Scenes {
    public static init(bot: api.Telegraf<api.ContextMessageUpdate>): void {
        try {
            // ...
            stage.register(YourScene)
            // ...
        }
        catch {
            // ...
        }
    }
}
```

### You have working bot from the box!
Put your connection data and use a bot. You have an admin panel inside the bot from the box.  
Use `/admin` command to access it.  
**Important!** Admin must have `isAdmin: true` in his DB document.
## Happy coding!

P.S Comments and logs are in Russian, but you can rewrite it ;)