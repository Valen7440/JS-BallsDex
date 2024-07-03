# Contributing
Thanks for your contribution! Here's a tutorial that shows how to set up
your environment.

## Setting the environment

Contrary to [Ballsdex](https://github.com/laggron42/BallsDex-DiscordBot.git), this bot **does not require Docker** in order to run.

Should work in any OS that supports Node.js

### Install dependencies

1. Install [Node.js](https://nodejs.org) v16 or later.
2. Clone this repo.
4. Run the command `npm run setup`

### Setting up your bot

When the `setup` command finished executing. A new `config.yml` file will be created.

The config file has a similar syntax to the original BallsDex `config.yml` file.

So, if you've experience with configuring BallsDex environments, will not be hard.

There are also comments in the file that will help you.

### Adding collectibles.

For now, we haven't created a web interface, so you'll need to manually add collectibles in a json file located in `/config/countryballs.json`

Add all your collectibles in the `"countryballs"` array in the file and please follow this syntax to add balls.

```json
{
    "names": ["hola", "hello"],
    "renderedName": "Hola",
    "capacity": {
        "name": "q",
        "description": "q el más poderozo"
    },
    "rarity": 1,
    "regime": "democracy",
    "economy": "capitalist",
    "defaultHp": 10,
    "defaultAtk": 10,
    "emoji": "1153077521785557114"
}
```

#### Variable definitions
* names: array with the possible names that the user can type in to catch the countryball.
* renderedName: the display name users will see on the bot while viewing info, trading, catching, etc.
* capacity: object with name and description strings for the card.
* rarity: integer or float, lower number the lower chance will have to spawn.
* regime: one of default regimes or custom
* economy: one of default economies or custom
* defaultHp: default health points
* defaultAtk: default atk points
* emoji: emoji id for display

Replace the values with the required values your collectible needs.

Next, add an image to your collectible, both wild and collection card.

The image filename has to match with the first element in `"names"` array.

Example:

If your array has these elements.

```json
"names": ["hola", "hello"]
```

Then the filename must be `hola.png`. Where it must be saved in `/assets/cards/` and `/assets/spawns/`

This rule also applies to custom regimes and economies. 

### Data management

This bot saves data in a SQLite local database, located in `/data` directory as default.

This makes easier to manage and delete data and migrations.

### Conclusion

If you've made it to here, thank you for your contribution.  

If there's any issue, post it in the issues forum for this repo.  

Bot made by Valen7440.

Documentation made by PwLDev.  

Original bot credits go to Laggron42.