Beautify(Game.cookies) + " + " + Beautify(Game.wrinklers.reduce(function(a,b){return a + b.sucked;}, 0)) + " = " + Beautify(Game.cookies + Game.wrinklers.reduce(function(a,b){return a + b.sucked;}, 0))

// get new NewsTiker with chance of fortune cookie
Game.getNewTicker(false);$('#commentsText').innerHTML

// spawn all wrinklers
Game.wrinklers.forEach(wrinkler => Game.SpawnWrinkler(wrinkler))

// pop all wrinklers
Game.wrinklers.forEach(wrinkler => wrinkler.hp = 0)

// pop all but shiny wrinklers
Game.wrinklers.forEach(wrinkler => { if (wrinkler.type !== 1) wrinkler.hp = 0; })



// spawn reindeer
let reindeerInterval = setInterval(()=>{new Game.shimmer('reindeer')},1000);
clearInterval(reindeerInterval);


let wrinklerInterval = setInterval(() => {
	Game.wrinklers.forEach(wrinkler => {
		if (wrinkler.sucked == 0) Game.SpawnWrinkler(wrinkler);
		else if (wrinkler.sucked > 0.5 && wrinkler.type !== 1) wrinkler.hp = 0;
	})
},1000);
clearInterval(wrinklerInterval);

// farm for shiny wrinklers
let shinyInterval = setInterval(() => {
	Game.wrinklers.forEach(wrinkler => {
		if (wrinkler.phase == 0) Game.SpawnWrinkler(wrinkler);
		else if (wrinkler.type !== 1) wrinkler.hp = 0;
	})
}, 100);
clearInterval(shinyInterval);

// Hours since run started
(Date.now()-Game.startDate)*Game.fps/108000000