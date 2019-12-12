var epicCookie = {
	cookieClickerVersion: 2.022,
	init: function() {
		if (typeof Game !== "object") return console.log("The Cookie Clicker 'Game' object is not available");
		if (Game.version !== this.cookieClickerVersion) return console.log(`EpicCookie only supports Cookie Clicker v${this.cookieClickerVersion}`);
		
		this.cookieShield.init();
		//this.wrinklerPopper.init();	
	},
	settings: {
		data: {},
		get: function(name) {
			
		}
	},
	functions: {
		format: function(number, beautify) {
			if (beautify || false) return Beautify(number);
			return number;
		},
		countWrinklers: function() {
			return Game.wrinklers.length;	
		},
		countShinyWrinklers: function() {
			return Game.wrinklers.reduce((a, b) => { return a += b.type; }, 0);	
		},
		allMultiplier: function() {
			return 1 + ((this.wrinklerMultiplier() - 1) * (this.countWrinklers() + (this.countShinyWrinklers() * 2)));
		},
		wrinklerMultiplier: function(type) {
			// alogrithm taken from main.js?v=2.061:11454
			var multiplier = 1.1;
			if (Game.Has('Sacrilegious corruption')) multiplier *= 1.05;
			if (type == 1) multiplier *= 3;
			if (Game.Has('Wrinklerspawn')) multiplier *= 1.05;
			if (Game.hasGod) {
				var godLvl = Game.hasGod('scorn');
				if (godLvl == 1) multiplier *= 1.15;
				else if (godLvl == 2) multiplier *= 1.1;
				else if (godLvl == 3) multiplier *= 1.05;
			}
			return multiplier;
		},
		cookiesFromWrinklers: function(beautify) {
			var cookies = Game.wrinklers.reduce((function(a,b) {
				return a + (b.sucked * this.wrinklerMultiplier(b.type));
			}).bind(this), 0);
			return this.format(cookies, beautify);
		},
		cookiesToSpendWithWrinklers: function(beautify) {
			var cookies = Game.cookies + this.cookiesFromWrinklers();
			return this.format(cookies, beautify);
		},
		cookiesEarnedWithWrinklers: function(beautify) {
			var cookies = Game.cookiesEarned + this.cookiesFromWrinklers();
			return this.format(cookies, beautify);
		},
		cookiesAllTimeWithWrinklers: function(beautify) {
			var cookies = Game.cookiesReset + this.cookiesEarnedWithWrinklers();
			return this.format(cookies, beautify);
		},
		prestigeWithWrinklers: function(beautify) {
			var prestige = Game.HowMuchPrestige(Game.cookiesReset + Game.cookiesEarned + this.cookiesFromWrinklers());
			return this.format(prestige, beautify);
		},
		timeToCookies: function(cookies) {
			
		},
		cookiesToPrestige: function(prestige, beautify) {
			prestige = prestige || 1000000000000;
			var cookiesLeft = Game.HowManyCookiesReset(prestige) - (Game.cookiesEarned+Game.cookiesReset+epicCookie.functions.cookiesFromWrinklers());
			return this.format(cookiesLeft, beautify);
		}
	},
	wrinklerPopper: {
		wrinklerPopperId: "wrinklerPopper",
		popperImage: "https://i.pinimg.com/originals/6a/aa/80/6aaa806cc939c049ed9c2bf4e99c9303.png",
		init: function() {
			this.create();
		},
		create: function() {
			if (this.exists()) return false;
			
			var wrinklerPopper = document.createElement('div');
			wrinklerPopper.id = this.wrinklerPopperId;

			Object.assign(wrinklerPopper.style, {
				zIndex: 11000,
				position: "absolute",
				right: "50px",
				bottom: "50px",
				width: "50px",
				height: "50px",
				backgroundImage: "url('" + this.popperImage + "')",
				backgroundSize: "cover"
			});
			
			document.getElementById("sectionLeft").appendChild(wrinklerPopper);	
		},
		destroy: function() {
			if (!this.exists()) return false;
			
			var wrinklerPopper = document.getElementById(this.wrinklerPopper);
			cookieShield.parentNode.removeChild(wrinklerPopper);
		},
		exists: function() {
			return document.getElementById(this.wrinklerPopperId) !== null;	
		},
		pop: function() {
			Game.CollectWrinklers();
		},
		popNonShiny: function() {
			Game.wrinklers.forEach(wrinkler => { if (wrinkler.type !== 1) wrinkler.hp = 0; })
		}
	},
	cookieShield: {
		cookieShieldId: "cookieShield",
		shieldImages: [
			"https://cdn1.iconfinder.com/data/icons/arms-and-armor-color/300/17-512.png"
		],
		currentShield: 0,
		autoCheckShimmeringVeil: 1,
		checkedCount: 0,
		init: function() {
			if (this.autoCheckShimmeringVeil !== 1) return false;
			
			setTimeout(() => { this.checkShimmeringVeil(); }, 1000);		
		},
		turnOff: function() {
			this.autoCheckShimmeringVeil = 0;
			this.destroy();
		},
		checkShimmeringVeil: function() {
			this.checkedCount += 1;
			if (!Game.Has('Shimmering veil')) return false;
			if (Game.Has('Shimmering veil [on]')) this.destroy();
			if (Game.Has('Shimmering veil [off]')) this.create();
			
			this.init();
		},
		exists: function() {
			return document.getElementById(this.cookieShieldId) !== null;
		},
		create: function() {
			if (this.exists()) return false;
			
			var cookieShield = document.createElement('div');
			cookieShield.id = this.cookieShieldId;

			Object.assign(cookieShield.style, {
				zIndex: 11000,
				position: "absolute",
				left: "calc(50% - 130px)",
				top: "calc(40% - 130px)",
				width: "260px",
				height: "260px",
				backgroundImage: "url('" + this.shieldImages[this.currentShield] + "')",
				backgroundSize: "cover"
			});
			
			document.getElementById("sectionLeft").appendChild(cookieShield);
		},
		destroy: function() {
			if (!this.exists()) return false;
			var cookieShield = document.getElementById(this.cookieShieldId);
			cookieShield.parentNode.removeChild(cookieShield);
		}
	}
};
epicCookie.init()
