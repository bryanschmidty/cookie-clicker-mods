var epicCookie = {
	cookieClickerVersion: 2.031,
	init: function() {
		if (typeof Game !== "object") return console.log("The Cookie Clicker 'Game' object is not available");
		if (Game.version !== this.cookieClickerVersion) return console.log(`EpicCookie only supports Cookie Clicker v${this.cookieClickerVersion}`);
		
		this.cookieShield.init();
		//this.wrinklerPopper.init();	
		this.wizardry.init();
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
	},
	wizardry: {
		miniGame: Game.Objects["Wizard tower"].minigame,
		autoCheckMana: 1,
		init: function() {
			if (this.autoCheckMana !== 1) return false;
			
			setTimeout(() => { this.checkMana(); }, 1000);		
		},

		cast: function() {
			spell = Game.Objects["Wizard tower"].minigame.spells['conjure baked goods'];
			Game.Objects["Wizard tower"].minigame.castSpell(spell);
		},
		checkMana: function() {
			if (this.miniGame.magic == this.miniGame.magicM) {
				this.cast();
			}
			
			this.init();
		}
	}
};
epicCookie.init()

Game.Draw=function()
{
	Game.DrawBackground();Timer.track('end of background');
	
	if (!Game.OnAscend)
	{
		
		var unit=(Math.round(Game.cookiesd)==1?' cookie':' cookies');
		var str=Beautify(Math.round(Game.cookiesd));
		if (Game.cookiesd>=1000000)//dirty padding
		{
			var spacePos=str.indexOf(' ');
			var dotPos=str.indexOf('.');
			var add='';
			if (spacePos!=-1)
			{
				if (dotPos==-1) add+='.000';
				else
				{
					if (spacePos-dotPos==2) add+='00';
					if (spacePos-dotPos==3) add+='0';
				}
			}
			str=[str.slice(0, spacePos),add,str.slice(spacePos)].join('');
		}
		//if (str.length>11 && !Game.mobile) unit='<br>cookies';
		//str+=unit;
		str+='<br><span style="font-size:15px">Wrinklers: ' + Beautify(Math.round(epicCookie.functions.cookiesToSpendWithWrinklers())) + '</span>';
		str+='<br><span style="font-size:15px">Prestige: ' + Beautify(Math.round(epicCookie.functions.prestigeWithWrinklers()-Game.prestige)) + '</span>'
		if (Game.prefs.monospace) str='<span class="monospace">'+str+'</span>';
		str=str+'<div style="font-size:50%;">CPS : '+Beautify(Game.cookiesPs)+ (Game.cpsSucked>0?' <div style="color:#bfff00">('+Beautify(Game.cookiesPs*(1-Game.cpsSucked),1)+')</div>':'')+'</div>';//display cookie amount
		l('cookies').innerHTML=str;
		l('compactCookies').innerHTML=str;
		l('cookies').style.top = 'calc(10% - 5px)';
		Timer.track('cookie amount');
		
		for (var i in Game.Objects)
		{
			var me=Game.Objects[i];
			if (me.onMinigame && me.minigame.draw && !me.muted) me.minigame.draw();
		}
		Timer.track('draw minigames');
		
		if (Game.drawT%5==0)
		{
			//if (Game.prefs.monospace) {l('cookies').className='title monospace';} else {l('cookies').className='title';}
			var lastLocked=0;
			for (var i in Game.Objects)
			{
				var me=Game.Objects[i];
				
				//make products full-opacity if we can buy them
				var classes='product';
				var price=me.bulkPrice;
				if (Game.cookiesEarned>=me.basePrice || me.bought>0) {classes+=' unlocked';lastLocked=0;me.locked=0;} else {classes+=' locked';lastLocked++;me.locked=1;}
				if ((Game.buyMode==1 && Game.cookies>=price) || (Game.buyMode==-1 && me.amount>0)) classes+=' enabled'; else classes+=' disabled';
				if (lastLocked>2) classes+=' toggledOff';
				me.l.className=classes;
				//if (me.id>0) {l('productName'+me.id).innerHTML=Beautify(me.storedTotalCps/Game.ObjectsById[me.id-1].storedTotalCps,2);}
			}
			
			//make upgrades full-opacity if we can buy them
			var lastPrice=0;
			for (var i in Game.UpgradesInStore)
			{
				var me=Game.UpgradesInStore[i];
				if (!me.bought)
				{
					var price=me.getPrice();
					var canBuy=me.canBuy();//(Game.cookies>=price);
					var enabled=(l('upgrade'+i).className.indexOf('enabled')>-1);
					if ((canBuy && !enabled) || (!canBuy && enabled)) Game.upgradesToRebuild=1;
					if (price<lastPrice) Game.storeToRefresh=1;//is this upgrade less expensive than the previous one? trigger a refresh to sort it again
					lastPrice=price;
				}
				if (me.timerDisplay)
				{
					var T=me.timerDisplay();
					if (T!=-1)
					{
						if (!l('upgradePieTimer'+i)) l('upgrade'+i).innerHTML=l('upgrade'+i).innerHTML+'<div class="pieTimer" id="upgradePieTimer'+i+'"></div>';
						T=(T*144)%144;
						l('upgradePieTimer'+i).style.backgroundPosition=(-Math.floor(T%18))*48+'px '+(-Math.floor(T/18))*48+'px';
					}
				}
				
				//if (me.canBuy()) l('upgrade'+i).className='crate upgrade enabled'; else l('upgrade'+i).className='crate upgrade disabled';
			}
		}
		Timer.track('store');
		
		if (Game.PARTY)//i was bored and felt like messing with CSS
		{
			var pulse=Math.pow((Game.T%10)/10,0.5);
			Game.l.style.filter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
			Game.l.style.webkitFilter='hue-rotate('+((Game.T*5)%360)+'deg) brightness('+(150-50*pulse)+'%)';
			Game.l.style.transform='scale('+(1.02-0.02*pulse)+','+(1.02-0.02*pulse)+') rotate('+(Math.sin(Game.T*0.5)*0.5)+'deg)';
			l('wrapper').style.overflowX='hidden';
			l('wrapper').style.overflowY='hidden';
		}
		
		Timer.clean();
		if (Game.prefs.animate && ((Game.prefs.fancy && Game.drawT%1==0) || (!Game.prefs.fancy && Game.drawT%10==0)) && Game.AscendTimer==0 && Game.onMenu=='') Game.DrawBuildings();Timer.track('buildings');
		
		Game.textParticlesUpdate();Timer.track('text particles');
	}
	
	Game.NotesDraw();Timer.track('notes');
	//Game.tooltip.update();//changed to only update when the mouse is moved
	
	for (var i in Game.customDraw) {Game.customDraw[i]();}
	
	Game.drawT++;
	//if (Game.prefs.altDraw) requestAnimationFrame(Game.Draw);
}

var wrinklerComplaints = ['What do you want!?','Ouch!','Oh, the humanity!','That tickled!','Oof','Stop that!','NoooOOOOoooo!','oh well','ugh!'];
function inRect(x,y,rect)
{
	//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
	//I found this somewhere online I guess
	var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
	var h1 = Math.sqrt(dx*dx + dy*dy);
	var currA = Math.atan2(dy,dx);
	var newA = currA - rect.r;
	var x2 = Math.cos(newA) * h1;
	var y2 = Math.sin(newA) * h1;
	if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
	return false;
}
Game.UpdateWrinklers=function()
{
	var xBase=0;
	var yBase=0;
	var onWrinkler=0;
	if (Game.LeftBackground)
	{
		xBase=Game.cookieOriginX;
		yBase=Game.cookieOriginY;
	}
	var max=Game.getWrinklersMax();
	var n=0;
	for (var i in Game.wrinklers)
	{
		if (Game.wrinklers[i].phase>0) n++;
	}
	for (var i in Game.wrinklers)
	{
		var me=Game.wrinklers[i];
		if (me.phase==0 && Game.elderWrath>0 && n<max && me.id<max)
		{
			var chance=0.00001*Game.elderWrath;
			chance*=Game.eff('wrinklerSpawn');
			if (Game.Has('Unholy bait')) chance*=5;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('scorn');
				if (godLvl==1) chance*=2.5;
				else if (godLvl==2) chance*=2;
				else if (godLvl==3) chance*=1.5;
			}
			if (Game.Has('Wrinkler doormat')) chance=0.1;
			if (Math.random()<chance)//respawn
			{
				Game.SpawnWrinkler(me);
			}
		}
		if (me.phase>0)
		{
			if (me.close<1) me.close+=(1/Game.fps)/10;
			if (me.close>1) me.close=1;
		}
		else me.close=0;
		if (me.close==1 && me.phase==1)
		{
			me.phase=2;
			Game.recalculateGains=1;
		}
		if (me.phase==2)
		{
			me.sucked+=(((Game.cookiesPs/Game.fps)*Game.cpsSucked));//suck the cookies
		}
		if (me.phase>0)
		{
			if (me.type==0)
			{
				if (me.hp<Game.wrinklerHP) me.hp+=0.04;
				me.hp=Math.min(Game.wrinklerHP,me.hp);
			}
			else if (me.type==1)
			{
				if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;
				me.hp=Math.min(Game.wrinklerHP*3,me.hp);
			}
			var d=128*(2-me.close);//*Game.BigCookieSize;
			if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
			me.r=(me.id/max)*360;
			if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
			me.x=xBase+(Math.sin(me.r*Math.PI/180)*d);
			me.y=yBase+(Math.cos(me.r*Math.PI/180)*d);
			if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
			var rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
			if (Math.random()<0.01) me.hurt=Math.max(me.hurt,Math.random());
			if (Game.T%5==0 && Game.CanClick) {if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect)) me.selected=1; else me.selected=0;}
			if (me.selected && onWrinkler==0 && Game.CanClick)
			{
				me.hurt=Math.max(me.hurt,0.25);
				//me.close*=0.99;
				if (Game.Click && Game.lastClickedEl==l('backgroundLeftCanvas'))
				{
					if (Game.keys[17] && Game.sesame) {me.type=!me.type;PlaySound('snd/shimmerClick.mp3');}//ctrl-click on a wrinkler in god mode to toggle its shininess
					else
					{
						Game.playWrinklerSquishSound();
						me.hurt=1;
						me.hp-=0.75;
						if (Game.prefs.particles && !(me.hp<=0.5 && me.phase>0))
						{
							var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
							var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
							for (var ii=0;ii<3;ii++)
							{
								//Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
								var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
								part.r=-me.r;
							}
						}
						if (me.hp > 0.5) Game.Notify(choose(wrinklerComplaints),'<b>HP: '+me.hp+'</b>',[19,8],6);
					}
					Game.Click=0;
				}
				onWrinkler=1;
			}
		}
		
		if (me.hurt>0)
		{
			me.hurt-=5/Game.fps;
			//me.close-=me.hurt*0.05;
			//me.x+=Math.random()*2-1;
			//me.y+=Math.random()*2-1;
			me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;
		}
		if (me.hp<=0.5 && me.phase>0)
		{
			Game.playWrinklerSquishSound();
			PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
			Game.wrinklersPopped++;
			Game.recalculateGains=1;
			me.phase=0;
			me.close=0;
			me.hurt=0;
			me.hp=3;
			var toSuck=1.1;
			if (Game.Has('Sacrilegious corruption')) toSuck*=1.05;
			if (me.type==1) toSuck*=3;//shiny wrinklers are an elusive, profitable breed
			me.sucked*=toSuck;//cookie dough does weird things inside wrinkler digestive tracts
			if (Game.Has('Wrinklerspawn')) me.sucked*=1.05;
			if (Game.hasGod)
			{
				var godLvl=Game.hasGod('scorn');
				if (godLvl==1) me.sucked*=1.15;
				else if (godLvl==2) me.sucked*=1.1;
				else if (godLvl==3) me.sucked*=1.05;
			}
			if (me.sucked>0.5)
			{
				if (Game.prefs.popups) Game.Popup('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler : found '+Beautify(me.sucked)+' cookies!');
				else Game.Notify('Exploded a '+(me.type==1?'shiny ':'')+'wrinkler','Found <b>'+Beautify(me.sucked)+'</b> cookies!',[19,8],6);
				Game.Popup('<div style="font-size:80%;">+'+Beautify(me.sucked)+' cookies</div>',Game.mouseX,Game.mouseY);
				
				if (Game.season=='halloween')
				{
					//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
					var failRate=0.95;
					if (Game.HasAchiev('Spooky cookies')) failRate=0.8;
					if (Game.Has('Starterror')) failRate*=0.9;
					failRate*=1/Game.dropRateMult();
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('seasons');
						if (godLvl==1) failRate*=0.9;
						else if (godLvl==2) failRate*=0.95;
						else if (godLvl==3) failRate*=0.97;
					}
					if (me.type==1) failRate*=0.9;
					var random = Math.random();
					if (random>failRate)//halloween cookie drops
					{
						var cookie=choose(['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies']);
						if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
						{
							Game.Unlock(cookie);
							if (Game.prefs.popups) Game.Popup('Found : '+cookie+'!');
							else Game.Notify(cookie,'You also found <b>'+cookie+'</b>!',Game.Upgrades[cookie].icon, 6);
						} else Game.Notify('Almost Got One!','You already have a <b>'+cookie+'</b>',Game.Upgrades[cookie].icon, 6)
					} else Game.Notify('No spooky biscuit for you!',Beautify(random*100)+'/'+Beautify(failRate*100),[0,12], 6)
				}
				Game.DropEgg(0.98);
			}
			if (me.type==1) Game.Win('Last Chance to See');
			Game.Earn(me.sucked);
			/*if (Game.prefs.particles)
			{
				var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
				var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
				for (var ii=0;ii<6;ii++)
				{
					Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
				}
			}*/
			if (Game.prefs.particles)
			{
				var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
				var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
				if (me.sucked>0)
				{
					for (var ii=0;ii<5;ii++)
					{
						Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1.5,2);
					}
				}
				for (var ii=0;ii<8;ii++)
				{
					var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
					part.r=-me.r;
				}
			}
			me.sucked=0;
		}
	}
	if (onWrinkler)
	{
		Game.mousePointer=1;
	}
}

Game.DropEgg=function(failRate)
{
	failRate*=1/Game.dropRateMult();
	if (Game.season!='easter') return;
	if (Game.HasAchiev('Hide & seek champion')) failRate*=0.7;
	if (Game.Has('Omelette')) failRate*=0.9;
	if (Game.Has('Starspawn')) failRate*=0.9;
	if (Game.hasGod)
	{
		var godLvl=Game.hasGod('seasons');
		if (godLvl==1) failRate*=0.9;
		else if (godLvl==2) failRate*=0.95;
		else if (godLvl==3) failRate*=0.97;
	}
	var random = Math.random();
	if (random>=failRate)
	{
		var drop='';
		if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
		else drop=choose(Game.eggDrops);
		if (Game.Has(drop) || Game.HasUnlocked(drop))//reroll if we have it
		{
			Game.Notify('Almost Got One!','You already have a <b>'+drop+'</b>',Game.Upgrades[drop].icon, 6)
			if (Math.random()<0.1) drop=choose(Game.rareEggDrops);
			else drop=choose(Game.eggDrops);

		}
		if (Game.Has(drop) || Game.HasUnlocked(drop)) {
			Game.Notify('Almost Got One!','You already have a <b>'+drop+'</b>',Game.Upgrades[drop].icon, 6)
			return;
		};
		Game.Unlock(drop);
		if (Game.prefs.popups) Game.Popup('You find :<br>'+drop+'!');
		else Game.Notify('You found an egg!','<b>'+drop+'</b>',Game.Upgrades[drop].icon, 6);
	} else Game.Notify('No Egg Drop For You!',Beautify(random*100)+'/'+Beautify(failRate*100),[0,12], 6);
};
Game.failRateEaster=function(failRate)
{
	failRate*=1/Game.dropRateMult();
	if (Game.season!='easter') return;
	if (Game.HasAchiev('Hide & seek champion')) failRate*=0.7;
	if (Game.Has('Omelette')) failRate*=0.9;
	if (Game.Has('Starspawn')) failRate*=0.9;
	if (Game.hasGod)
	{
		var godLvl=Game.hasGod('seasons');
		if (godLvl==1) failRate*=0.9;
		else if (godLvl==2) failRate*=0.95;
		else if (godLvl==3) failRate*=0.97;
	}
	return failRate
}
