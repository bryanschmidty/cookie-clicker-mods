# Cookie Clicker Mods

This repository is meant to be a collection of non-cheating mods for the best browser game on the internet: Cookie Clicker. The goal of these mods is to enhance the gameplay without breaking original game logic or cheating.

Each mod is explained below

---

## Wrinkler Complaints Mod

Each time you click a wrinkler, it will say something.

---

## Drop Egg Mod

This will give you more information on possible Egg Drops you could have received.

---

## Draw Mod

This rewrites part of the Game.Draw function. You will need to load the Epic Cookie mod as this uses some of the functions of that mod. 

This displays the number of cookies you have including what the Wrinklers have eaten. Also the prestige points you would have if you popped all the wrinklers.

---

## Epic Cookie

This is actually a collection of a few mods into one JS object, `epicCookie`. 

### Cookie Shield

The initial feature of the EpicCookie mod was a Cookie Shield. It raises a shield over the big cookie when Shimmering Veil is active, to prevent any accidental clicks.

### Wrinkler Popper

[incomplete] This feature of EpicCookie will give you the option to pop all wrinklers with one click, with the option of leaving any shiny wrinklers alone.

### Additional functions

Additional useful functions are included in the EpicCookie mod. These can be called with `epicCookie.functions.{functionName}()`

 - `cookiesFromWrinklers()`: The number of cookies you will have if you pop all wrinklers now
 - `cookiesToSpendWithWrinklers()`: This addes the result from `cookiesFromWrinklers()` to the current number of cookies you have
 - `prestigeWithWrinklers()`: The amount of prestige you will have after popping all wrinklers
 
 ---
 
 If you would like to modify or submit any new mods to this repository, please feel free to submit a Pull Request
