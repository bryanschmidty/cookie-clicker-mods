var epicCookie = {
	version: 0.6,
	cookieClickerVersion: 2.031,
	loopInterval: 1000,
	init: function() {
		if (typeof Game !== "object") return console.log("The Cookie Clicker 'Game' object is not available");
		if (Game.version !== this.cookieClickerVersion) return console.log(`EpicCookie only supports Cookie Clicker v${this.cookieClickerVersion}`);

		for (var obj in epicCookie) {
			if (epicCookie[obj].init) {
				epicCookie[obj].init();
			}
		}

		this.loop();
	},
	loop: function() {
		for (var obj in epicCookie) {
			if (epicCookie[obj].loop && epicCookie[obj].enabled) {
				epicCookie[obj].loop();
			}
		}

		setTimeout(() => this.loop(), this.loopInterval);
	},
	settings: {
		data: {},
		getMenu: function() {
			return '<div class="section">EpicCookie Settings</div>' +
				'<div class="subsection">'+
					'<div class="title">Main Features</div>' +
					'<div class="listing">'+
						Game.WriteButton('epicUpgrades', 'epicUpgrades', 'Auto Upgrades ON', 'Auto Upgrades OFF', 'epicCookie.autoBuyUpgrades.toggle();') +
						'<label>Will automatically buy upgrades when you can afford them</label><br />' +
						Game.WriteButton('epicBuildings', 'epicBuildings', 'Auto Buildings ON', 'Auto Buildings OFF', 'epicCookie.autoBuyBuildings.toggle();') +
						'<label>Will automatically buy buildings when you can afford them</label><br />' +
						Game.WriteButton('epicDragon', 'epicDragon', 'Auto Dragon ON', 'Auto Dragon OFF', 'epicCookie.autoBuyDragonLevels.toggle();') +
						'<label>Will automatically buy dragon levels when you can afford them</label><br />' +
						Game.WriteButton('epicSanta', 'epicSanta', 'Auto Santa ON', 'Auto Santa OFF', 'epicCookie.autoBuySantaLevels.toggle();') +
						'<label>Will automatically buy santa levels when you can afford them</label><br />' +
						Game.WriteButton('epicWrinklerPopper', 'epicWrinklerPopper', 'Wrinkler Popper ON', 'Wrinkler Popper OFF', 'epicCookie.wrinklerPopper.toggle();') +
						'<label>[Doesn\'t work yet] Gives you a button to pop all wrinklers.</label><br />' +
						Game.WriteButton('epicCookieShield', 'epicCookieShield', 'Cookie Shield ON', 'Cookie Shield OFF', 'epicCookie.cookieShield.toggle();') +
						'<label>Places a shield over the big cookie when you have Shimmering Veil. Prevents accidental clicks.</label><br />' +
						Game.WriteButton('epicAutoWizardry', 'epicAutoWizardry', 'Auto Wizardry ON', 'Auto Wizardry OFF', 'epicCookie.wizardry.toggle();') +
						'<label>Automatically casts a spell of your choice when your magic meter is full.</label><br />' +
						Game.WriteButton('epicSugarFrenzy', 'epicSugarFrenzy', 'Sugar Frenzy Protect ON', 'Sugar Frenzy Protect OFF', 'epicCookie.sugarFrenzy.toggle();') +
						'<label>Won\'t let you ascend if you haven\'t run Sugar Frenzy yet.</label><br />' +
					'</div>'+
				'</div>'+

				'<div class="subsection">'+
					'<div class="title">Misc</div>'+
				'</div>' +
				'<div class="subsection update">'+
					'<div class="title">To-do List</div>'+
					'<div class="listing">&bull; Wrinkler Popper: finish. add option to save shiny wrinklers</div>'+
					'<div class="listing">&bull; Auto Wizardry: Allow for selection of spell that is cast</div>'+
					'<div class="listing">&bull; Auto Upgrades: auto select "Yes" on One Mind updrade</div>'+
					'<div class="listing">&bull; Auto Buildings: Set chunk size</div>'+
					'<div class="listing">&bull; Auto Dragon: automatically equip user-selected Dragon Auras</div>'+
					'<div class="listing">&bull; Add Auto-Season feature</div>'+
					'<div class="listing">&bull; Integrate <a href="https://github.com/Acharvak/Cookie-Clicker-Agronomicon">Agronomicon mod</a></div>'+
					'<div class="listing">&bull; Auto-backup save in cloud</div>'+
					'<div class="listing">&bull; Run Idle in cloud (small service fee for servers - $1/month?)</div>'+
				'</div>';
		},
		get: function(name) {

		}
	},
	functionUpdates: {
		init: () => {
			epicCookie.functionUpdates.updates.forEach((obj, i) => {
				let functionToHash = obj.oldFunction;
				let oldHash = eval('epicCookie.functionUpdates.hash(btoa(' + functionToHash + '))');
				if (oldHash !== obj.hash) {
					console.error('unable to enable ' + obj.name, 'oldHash: ' + oldHash, 'hash: ' + obj.hash);
				} else {
					if (typeof epicCookie.functionUpdates.updates[i].override === 'function') {
						epicCookie.functionUpdates.updates[i].override();
					} else {
						eval(obj.oldFunction + '=epicCookie.functionUpdates.updates[' + i + '].newFunction');
					}
				}
			});
		},
		hash: str => {
			// source: https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
			var hash = 0;
			if (str.length == 0) return hash;
			for (i = 0; i < str.length; i++) {
				char = str.charCodeAt(i);
				hash = ((hash<<5)-hash)+char;
				hash = hash & hash; // Convert to 32bit integer
			}
			return hash;
		},
		updates: [
			{
				name: 'Building Buy Update',
				oldFunction: 'Game.ObjectsById[0].buy',
				hash: -1185965051,
				override: () => {
					for (var i in Game.ObjectsById) {
						eval('Game.ObjectsById[' + i + '].buy = epicCookie.functionUpdates.updates[0].newFunction')
					}
				},
				// can't use arrow function here. for some reason it doesn't work after function substitution
				newFunction: function(amount) {
					if (Game.buyMode == -1) {
						this.sell(Game.buyBulk, 1);
						return 0;
					}
					var success = 0;
					var moni = 0;
					var bought = 0;
					if (!amount) amount = Game.buyBulk;
					if (amount == -1) amount = 1000;
					var price = this.getSumPrice(Game.buyBulk);
					if (Game.cookies >= price) {
						for (var i = 0; i < amount; i++) {
							bought++;
							moni += price;
							Game.Spend(this.getPrice());
							this.amount++;
							this.bought++;
							price = this.getPrice();
							this.price = price;
							if (this.buyFunction) this.buyFunction();
							Game.recalculateGains = 1;
							if (this.amount == 1 && this.id != 0) l('row' + this.id).classList.add('enabled');
							this.highest = Math.max(this.highest, this.amount);
							Game.BuildingsOwned++;
							success = 1;
						}
					}
					if (success) {
						PlaySound('snd/buy' + choose([1, 2, 3, 4]) + '.mp3', 0.75);
						this.refresh();
					}
					//if (moni>0 && amount>1) Game.Notify(this.name,'Bought <b>'+bought+'</b> for '+Beautify(moni)+' cookies','',2);
				}
			},
			{
				name: 'Draw Function Update',
				oldFunction: 'Game.Draw',
				hash: -804573738,
				newFunction: () => {
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
			},
			{
				name: 'Update Menu Update',
				oldFunction: 'Game.UpdateMenu',
				hash: 1793001438,
				newFunction: function()
				{
					var str='';
					if (Game.onMenu!='')
					{
						str+='<div class="close menuClose" '+Game.clickStr+'="Game.ShowMenu();">x</div>';
						//str+='<div style="position:absolute;top:8px;right:8px;cursor:pointer;font-size:16px;" '+Game.clickStr+'="Game.ShowMenu();">X</div>';
					}
					if (Game.onMenu=='prefs')
					{
						str+='<div class="section">Options</div>'+
							'<div class="subsection">'+
							'<div class="title">General</div>'+
							'<div class="listing"><a class="option" '+Game.clickStr+'="Game.toSave=true;PlaySound(\'snd/tick.mp3\');">Save</a><label>Save manually (the game autosaves every 60 seconds; shortcut : ctrl+S)</label></div>'+
							'<div class="listing"><a class="option" '+Game.clickStr+'="Game.ExportSave();PlaySound(\'snd/tick.mp3\');">Export save</a><a class="option" '+Game.clickStr+'="Game.ImportSave();PlaySound(\'snd/tick.mp3\');">Import save</a><label>You can use this to backup your save or to transfer it to another computer (shortcut for import : ctrl+O)</label></div>'+
							'<div class="listing"><a class="option" '+Game.clickStr+'="Game.FileSave();PlaySound(\'snd/tick.mp3\');">Save to file</a><a class="option" style="position:relative;"><input id="FileLoadInput" type="file" style="cursor:pointer;opacity:0;position:absolute;left:0px;top:0px;width:100%;height:100%;" onchange="Game.FileLoad(event);" '+Game.clickStr+'="PlaySound(\'snd/tick.mp3\');"/>Load from file</a><label>Use this to keep backups on your computer</label></div>'+

							'<div class="listing"><a class="option warning" '+Game.clickStr+'="Game.HardReset();PlaySound(\'snd/tick.mp3\');">Wipe save</a><label>Delete all your progress, including your achievements</label></div>'+
							'<div class="title">Settings</div>'+
							'<div class="listing">'+
							Game.WriteSlider('volumeSlider','Volume','[$]%',function(){return Game.volume;},'Game.setVolume(Math.round(l(\'volumeSlider\').value));l(\'volumeSliderRightText\').innerHTML=Game.volume+\'%\';')+'<br>'+
							Game.WriteButton('fancy','fancyButton','Fancy graphics ON','Fancy graphics OFF','Game.ToggleFancy();')+'<label>(visual improvements; disabling may improve performance)</label><br>'+
							Game.WriteButton('filters','filtersButton','CSS filters ON','CSS filters OFF','Game.ToggleFilters();')+'<label>(cutting-edge visual improvements; disabling may improve performance)</label><br>'+
							Game.WriteButton('particles','particlesButton','Particles ON','Particles OFF')+'<label>(cookies falling down, etc; disabling may improve performance)</label><br>'+
							Game.WriteButton('numbers','numbersButton','Numbers ON','Numbers OFF')+'<label>(numbers that pop up when clicking the cookie)</label><br>'+
							Game.WriteButton('milk','milkButton','Milk ON','Milk OFF')+'<label>(only appears with enough achievements)</label><br>'+
							Game.WriteButton('cursors','cursorsButton','Cursors ON','Cursors OFF')+'<label>(visual display of your cursors)</label><br>'+
							Game.WriteButton('wobbly','wobblyButton','Wobbly cookie ON','Wobbly cookie OFF')+'<label>(your cookie will react when you click it)</label><br>'+
							Game.WriteButton('cookiesound','cookiesoundButton','Alt cookie sound ON','Alt cookie sound OFF')+'<label>(how your cookie sounds when you click on it)</label><br>'+
							Game.WriteButton('crates','cratesButton','Icon crates ON','Icon crates OFF')+'<label>(display boxes around upgrades and achievements in stats)</label><br>'+
							Game.WriteButton('monospace','monospaceButton','Alt font ON','Alt font OFF')+'<label>(your cookies are displayed using a monospace font)</label><br>'+
							Game.WriteButton('format','formatButton','Short numbers OFF','Short numbers ON','BeautifyAll();Game.RefreshStore();Game.upgradesToRebuild=1;',1)+'<label>(shorten big numbers)</label><br>'+
							Game.WriteButton('notifs','notifsButton','Fast notes ON','Fast notes OFF')+'<label>(notifications disappear much faster)</label><br>'+
							//Game.WriteButton('autoupdate','autoupdateButton','Offline mode OFF','Offline mode ON',0,1)+'<label>(disables update notifications)</label><br>'+
							Game.WriteButton('warn','warnButton','Closing warning ON','Closing warning OFF')+'<label>(the game will ask you to confirm when you close the window)</label><br>'+
							Game.WriteButton('focus','focusButton','Defocus OFF','Defocus ON',0,1)+'<label>(the game will be less resource-intensive when out of focus)</label><br>'+
							Game.WriteButton('extraButtons','extraButtonsButton','Extra buttons ON','Extra buttons OFF','Game.ToggleExtraButtons();')+'<label>(add Mute buttons on buildings)</label><br>'+
							Game.WriteButton('askLumps','askLumpsButton','Lump confirmation ON','Lump confirmation OFF')+'<label>(the game will ask you to confirm before spending sugar lumps)</label><br>'+
							Game.WriteButton('customGrandmas','customGrandmasButton','Custom grandmas ON','Custom grandmas OFF')+'<label>(some grandmas will be named after Patreon supporters)</label><br>'+
							Game.WriteButton('timeout','timeoutButton','Sleep mode timeout ON','Sleep mode timeout OFF')+'<label>(on slower computers, the game will put itself in sleep mode when it\'s inactive and starts to lag out; offline CpS production kicks in during sleep mode)</label><br>'+
							'</div>'+
							//'<div class="listing">'+Game.WriteButton('autosave','autosaveButton','Autosave ON','Autosave OFF')+'</div>'+
							'<div class="listing"><a class="option" '+Game.clickStr+'="Game.CheckModData();PlaySound(\'snd/tick.mp3\');">Check mod data</a><label>(view and delete save data created by mods)</label></div>'+

							'<div style="padding-bottom:128px;"></div>'+
							'</div>'
						;
					}
					else if (Game.onMenu=='main')
					{
						str+=
							'<div class="listing">This isn\'t really finished</div>'+
							'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'prefs\');">Menu</a></div>'+
							'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'stats\');">Stats</a></div>'+
							'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(\'log\');">Updates</a></div>'+
							'<div class="listing"><a class="option big title" '+Game.clickStr+'="">Quit</a></div>'+
							'<div class="listing"><a class="option big title" '+Game.clickStr+'="Game.ShowMenu(Game.onMenu);">Resume</a></div>';
					}
					else if (Game.onMenu=='log')
					{
						str+=replaceAll('[bakeryName]',Game.bakeryName,Game.updateLog);
						if (!Game.HasAchiev('Olden days')) str+='<div style="text-align:right;width:100%;"><div '+Game.clickStr+'="Game.SparkleAt(Game.mouseX,Game.mouseY);PlaySound(\'snd/tick.mp3\');PlaySound(\'snd/shimmerClick.mp3\');Game.Win(\'Olden days\');Game.UpdateMenu();" class="icon" style="display:inline-block;transform:scale(0.5);cursor:pointer;width:48px;height:48px;background-position:'+(-12*48)+'px '+(-3*48)+'px;"></div></div>';
					}
					else if (Game.onMenu=='stats')
					{
						var buildingsOwned=0;
						buildingsOwned=Game.BuildingsOwned;
						var upgrades='';
						var cookieUpgrades='';
						var hiddenUpgrades='';
						var prestigeUpgrades='';
						var upgradesTotal=0;
						var upgradesOwned=0;
						var prestigeUpgradesTotal=0;
						var prestigeUpgradesOwned=0;

						var list=[];
						//sort the upgrades
						for (var i in Game.Upgrades){list.push(Game.Upgrades[i]);}//clone first
						var sortMap=function(a,b)
						{
							if (a.order>b.order) return 1;
							else if (a.order<b.order) return -1;
							else return 0;
						}
						list.sort(sortMap);
						for (var i in list)
						{
							var str2='';
							var me=list[i];

							str2+=Game.crate(me,'stats');

							if (me.bought)
							{
								if (Game.CountsAsUpgradeOwned(me.pool)) upgradesOwned++;
								else if (me.pool=='prestige') prestigeUpgradesOwned++;
							}

							if (me.pool=='' || me.pool=='cookie' || me.pool=='tech') upgradesTotal++;
							if (me.pool=='debug') hiddenUpgrades+=str2;
							else if (me.pool=='prestige') {prestigeUpgrades+=str2;prestigeUpgradesTotal++;}
							else if (me.pool=='cookie') cookieUpgrades+=str2;
							else if (me.pool!='toggle' && me.pool!='unused') upgrades+=str2;
						}
						var achievements=[];
						var achievementsOwned=0;
						var achievementsOwnedOther=0;
						var achievementsTotal=0;

						var list=[];
						for (var i in Game.Achievements)//sort the achievements
						{
							list.push(Game.Achievements[i]);
						}
						var sortMap=function(a,b)
						{
							if (a.order>b.order) return 1;
							else if (a.order<b.order) return -1;
							else return 0;
						}
						list.sort(sortMap);


						for (var i in list)
						{
							var me=list[i];
							//if (me.pool=='normal' || me.won>0) achievementsTotal++;
							if (Game.CountsAsAchievementOwned(me.pool)) achievementsTotal++;
							var pool=me.pool;
							if (!achievements[pool]) achievements[pool]='';
							achievements[pool]+=Game.crate(me,'stats');

							if (me.won)
							{
								if (Game.CountsAsAchievementOwned(me.pool)) achievementsOwned++;
								else achievementsOwnedOther++;
							}
						}

						var achievementsStr='';
						var pools={
							'dungeon':'<b>Dungeon achievements</b> <small>(Not technically achievable yet.)</small>',
							'shadow':'<b>Shadow achievements</b> <small>(These are feats that are either unfair or difficult to attain. They do not give milk.)</small>'
						};
						for (var i in achievements)
						{
							if (achievements[i]!='')
							{
								if (pools[i]) achievementsStr+='<div class="listing">'+pools[i]+'</div>';
								achievementsStr+='<div class="listing crateBox">'+achievements[i]+'</div>';
							}
						}

						var milkStr='';
						for (var i=0;i<Game.Milks.length;i++)
						{
							if (Game.milkProgress>=i)
							{
								var milk=Game.Milks[i];
								milkStr+='<div '+Game.getTooltip(
									'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px;padding-bottom:96px;"><h3 style="margin:6px 32px 0px 32px;">'+milk.name+'</h3><div style="opacity:0.75;font-size:9px;">('+(i==0?'starter milk':('for '+Beautify(i*25)+' achievements'))+')</div><div class="line"></div><div style="width:100%;height:96px;position:absolute;left:0px;bottom:0px;background:url(img/'+milk.pic+'.png);"></div></div>'
									,'top')+' style="background:url(img/icons.png?v='+Game.version+') '+(-milk.icon[0]*48)+'px '+(-milk.icon[1]*48)+'px;margin:2px 0px;" class="trophy"></div>';
							}
						}
						milkStr+='<div style="clear:both;"></div>';

						var santaStr='';
						var frames=15;
						if (Game.Has('A festive hat'))
						{
							for (var i=0;i<=Game.santaLevel;i++)
							{
								santaStr+='<div '+Game.getTooltip(
									'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/santa.png) '+(-i*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+Game.santaLevels[i]+'</h3></div>'
									,'top')+' style="background:url(img/santa.png) '+(-i*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
							}
							santaStr+='<div style="clear:both;"></div>';
						}
						var dragonStr='';
						var frames=9;
						var mainLevels=[0,4,8,23,24,25];
						if (Game.Has('A crumbly egg'))
						{
							for (var i=0;i<=mainLevels.length;i++)
							{
								if (Game.dragonLevel>=mainLevels[i])
								{
									var level=Game.dragonLevels[mainLevels[i]];
									dragonStr+='<div '+Game.getTooltip(
										//'<div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*96)+'px 0px;"></div><div class="line"></div><div style="min-width:200px;text-align:center;margin-bottom:6px;">'+level.name+'</div>'
										'<div class="prompt" style="text-align:center;padding-bottom:6px;white-space:nowrap;margin:0px 32px;"><div style="width:96px;height:96px;margin:4px auto;background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*96)+'px 0px;filter:drop-shadow(0px 3px 2px #000);-webkit-filter:drop-shadow(0px 3px 2px #000);"></div><div class="line"></div><h3>'+level.name+'</h3></div>'
										,'top')+' style="background:url(img/dragon.png?v='+Game.version+') '+(-level.pic*48)+'px 0px;background-size:'+(frames*48)+'px 48px;" class="trophy"></div>';
								}
							}
							dragonStr+='<div style="clear:both;"></div>';
						}
						var ascensionModeStr='';
						var icon=Game.ascensionModes[Game.ascensionMode].icon;
						if (Game.resets>0) ascensionModeStr='<span style="cursor:pointer;" '+Game.getTooltip(
							'<div style="min-width:200px;text-align:center;font-size:11px;">'+Game.ascensionModes[Game.ascensionMode].desc+'</div>'
							,'top')+'><div class="icon" style="display:inline-block;float:none;transform:scale(0.5);margin:-24px -16px -19px -8px;'+(icon[2]?'background-image:url('+icon[2]+');':'')+'background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+Game.ascensionModes[Game.ascensionMode].name+'</span>';

						var milkName=Game.Milk.name;

						var researchStr=Game.sayTime(Game.researchT,-1);
						var pledgeStr=Game.sayTime(Game.pledgeT,-1);
						var wrathStr='';
						if (Game.elderWrath==1) wrathStr='awoken';
						else if (Game.elderWrath==2) wrathStr='displeased';
						else if (Game.elderWrath==3) wrathStr='angered';
						else if (Game.elderWrath==0 && Game.pledges>0) wrathStr='appeased';

						var date=new Date();
						date.setTime(Date.now()-Game.startDate);
						var timeInSeconds=date.getTime()/1000;
						var startDate=Game.sayTime(timeInSeconds*Game.fps,-1);
						date.setTime(Date.now()-Game.fullDate);
						var fullDate=Game.sayTime(date.getTime()/1000*Game.fps,-1);
						if (!Game.fullDate || !fullDate || fullDate.length<1) fullDate='a long while';
						/*date.setTime(new Date().getTime()-Game.lastDate);
                        var lastDate=Game.sayTime(date.getTime()/1000*Game.fps,2);*/

						var heavenlyMult=Game.GetHeavenlyMultiplier();

						var seasonStr=Game.sayTime(Game.seasonT,-1);

						str+='<div class="section">Statistics</div>'+
							'<div class="subsection">'+
							'<div class="title">General</div>'+
							'<div class="listing"><b>Cookies in bank :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookies)+'</div></div>'+
							'<div class="listing"><b>Cookies baked (this ascension) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned)+'</div></div>'+
							'<div class="listing"><b>Cookies baked (all time) :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesEarned+Game.cookiesReset)+'</div></div>'+
							(Game.cookiesReset>0?'<div class="listing"><b>Cookies forfeited by ascending :</b> <div class="price plain">'+Game.tinyCookie()+Beautify(Game.cookiesReset)+'</div></div>':'')+
							(Game.resets?('<div class="listing"><b>Legacy started :</b> '+(fullDate==''?'just now':(fullDate+' ago'))+', with '+Beautify(Game.resets)+' ascension'+(Game.resets==1?'':'s')+'</div>'):'')+
							'<div class="listing"><b>Run started :</b> '+(startDate==''?'just now':(startDate+' ago'))+'</div>'+
							'<div class="listing"><b>Buildings owned :</b> '+Beautify(buildingsOwned)+'</div>'+
							'<div class="listing"><b>Cookies per second :</b> '+Beautify(Game.cookiesPs,1)+' <small>'+
							'(multiplier : '+Beautify(Math.round(Game.globalCpsMult*100),1)+'%)'+
							(Game.cpsSucked>0?' <span class="warning">(withered : '+Beautify(Math.round(Game.cpsSucked*100),1)+'%)</span>':'')+
							'</small></div>'+
							'<div class="listing"><b>Raw cookies per second :</b> '+Beautify(Game.cookiesPsRaw,1)+' <small>'+
							'(highest this ascension : '+Beautify(Game.cookiesPsRawHighest,1)+')'+
							'</small></div>'+
							'<div class="listing"><b>Cookies per click :</b> '+Beautify(Game.computedMouseCps,1)+'</div>'+
							'<div class="listing"><b>Cookie clicks :</b> '+Beautify(Game.cookieClicks)+'</div>'+
							'<div class="listing"><b>Hand-made cookies :</b> '+Beautify(Game.handmadeCookies)+'</div>'+
							'<div class="listing"><b>Golden cookie clicks :</b> '+Beautify(Game.goldenClicksLocal)+' <small>(all time : '+Beautify(Game.goldenClicks)+')</small></div>'+//' <span class="hidden">(<b>Missed golden cookies :</b> '+Beautify(Game.missedGoldenClicks)+')</span></div>'+
							'<br><div class="listing"><b>Running version :</b> '+Game.version+'</div>'+

							((researchStr!='' || wrathStr!='' || pledgeStr!='' || santaStr!='' || dragonStr!='' || Game.season!='' || ascensionModeStr!='' || Game.canLumps())?(
								'</div><div class="subsection">'+
								'<div class="title">Special</div>'+
								(ascensionModeStr!=''?'<div class="listing"><b>Challenge mode :</b>'+ascensionModeStr+'</div>':'')+
								(Game.season!=''?'<div class="listing"><b>Seasonal event :</b> '+Game.seasons[Game.season].name+
									(seasonStr!=''?' <small>('+seasonStr+' remaining)</small>':'')+
									'</div>':'')+
								(Game.season=='fools'?
									'<div class="listing"><b>Money made from selling cookies :</b> '+Beautify(Game.cookiesEarned*0.08,2)+' cookie dollars</div>'+
									(Game.Objects['Portal'].highest>0?'<div class="listing"><b>TV show seasons produced :</b> '+Beautify(Math.floor((timeInSeconds/60/60)*(Game.Objects['Portal'].highest*0.13)+1))+'</div>':'')
									:'')+
								(researchStr!=''?'<div class="listing"><b>Research :</b> '+researchStr+' remaining</div>':'')+
								(wrathStr!=''?'<div class="listing"><b>Grandmatriarchs status :</b> '+wrathStr+'</div>':'')+
								(pledgeStr!=''?'<div class="listing"><b>Pledge :</b> '+pledgeStr+' remaining</div>':'')+
								(Game.wrinklersPopped>0?'<div class="listing"><b>Wrinklers popped :</b> '+Beautify(Game.wrinklersPopped)+'</div>':'')+
								((Game.canLumps() && Game.lumpsTotal>-1)?'<div class="listing"><b>Sugar lumps harvested :</b> <div class="price lump plain">'+Beautify(Game.lumpsTotal)+'</div></div>':'')+
								//(Game.cookiesSucked>0?'<div class="listing warning"><b>Withered :</b> '+Beautify(Game.cookiesSucked)+' cookies</div>':'')+
								(Game.reindeerClicked>0?'<div class="listing"><b>Reindeer found :</b> '+Beautify(Game.reindeerClicked)+'</div>':'')+
								(santaStr!=''?'<div class="listing"><b>Santa stages unlocked :</b></div><div>'+santaStr+'</div>':'')+
								(dragonStr!=''?'<div class="listing"><b>Dragon training :</b></div><div>'+dragonStr+'</div>':'')+
								''
							):'')+
							((Game.prestige>0 || prestigeUpgrades!='')?(
								'</div><div class="subsection">'+
								'<div class="title">Prestige</div>'+
								'<div class="listing"><div class="icon" style="float:left;background-position:'+(-19*48)+'px '+(-7*48)+'px;"></div>'+
								'<div style="margin-top:8px;"><span class="title" style="font-size:22px;">Prestige level : '+Beautify(Game.prestige)+'</span> at '+Beautify(heavenlyMult*100,1)+'% of its potential <b>(+'+Beautify(parseFloat(Game.prestige)*Game.heavenlyPower*heavenlyMult,1)+'% CpS)</b><br>Heavenly chips : <b>'+Beautify(Game.heavenlyChips)+'</b></div>'+
								'</div>'+
								(prestigeUpgrades!=''?(
									'<div class="listing" style="clear:left;"><b>Prestige upgrades unlocked :</b> '+prestigeUpgradesOwned+'/'+prestigeUpgradesTotal+' ('+Math.floor((prestigeUpgradesOwned/prestigeUpgradesTotal)*100)+'%)</div>'+
									'<div class="listing crateBox">'+prestigeUpgrades+'</div>'):'')+
								''):'')+

							'</div><div class="subsection">'+
							'<div class="title">Upgrades</div>'+
							(hiddenUpgrades!=''?('<div class="listing"><b>Debug</b></div>'+
								'<div class="listing crateBox">'+hiddenUpgrades+'</div>'):'')+
							'<div class="listing"><b>Upgrades unlocked :</b> '+upgradesOwned+'/'+upgradesTotal+' ('+Math.floor((upgradesOwned/upgradesTotal)*100)+'%)</div>'+
							'<div class="listing crateBox">'+upgrades+'</div>'+
							(cookieUpgrades!=''?('<div class="listing"><b>Cookies</b></div>'+
								'<div class="listing crateBox">'+cookieUpgrades+'</div>'):'')+
							'</div><div class="subsection">'+
							'<div class="title">Achievements</div>'+
							'<div class="listing"><b>Achievements unlocked :</b> '+achievementsOwned+'/'+achievementsTotal+' ('+Math.floor((achievementsOwned/achievementsTotal)*100)+'%)'+(achievementsOwnedOther>0?('<span style="font-weight:bold;font-size:10px;color:#70a;"> (+'+achievementsOwnedOther+')</span>'):'')+'</div>'+
							(Game.cookiesMultByType['kittens']>1?('<div class="listing"><b>Kitten multiplier :</b> '+Beautify((Game.cookiesMultByType['kittens'])*100)+'%</div>'):'')+
							'<div class="listing"><b>Milk :</b> '+milkName+'</div>'+
							(milkStr!=''?'<div class="listing"><b>Milk flavors unlocked :</b></div><div>'+milkStr+'</div>':'')+
							'<div class="listing"><small style="opacity:0.75;">(Milk is gained with each achievement. It can unlock unique upgrades over time.)</small></div>'+
							achievementsStr+
							'</div>'+
							'<div style="padding-bottom:128px;"></div>'
						;
					}
					else if (Game.onMenu=='epic') {
						str += epicCookie.settings.getMenu();
					}
					//str='<div id="selectionKeeper" class="selectable">'+str+'</div>';
					l('menu').innerHTML=str;
					/*AddEvent(l('selectionKeeper'),'mouseup',function(e){
                        console.log('selection:',window.getSelection());
                    });*/
				}
			},
			{
				name: 'Show Menu Update',
				oldFunction: 'Game.ShowMenu',
				hash: 1816169584,
				newFunction: what => {
					if (!what || what=='') what=Game.onMenu;
					if (Game.onMenu=='' && what!='') Game.addClass('onMenu');
					else if (Game.onMenu!='' && what!=Game.onMenu) Game.addClass('onMenu');
					else if (what==Game.onMenu) {Game.removeClass('onMenu');what='';}
					//if (what=='log') l('donateBox').className='on'; else l('donateBox').className='';
					Game.onMenu=what;

					l('prefsButton').className=(Game.onMenu=='prefs')?'button selected':'button';
					l('statsButton').className=(Game.onMenu=='stats')?'button selected':'button';
					l('logButton').className=(Game.onMenu=='log')?'button selected':'button';
					l('epicButton').className=(Game.onMenu=='epic')?'button selected':'button';

					if (Game.onMenu=='') PlaySound('snd/clickOff.mp3');
					else PlaySound('snd/clickOn.mp3');

					Game.UpdateMenu();

					if (what=='')
					{
						for (var i in Game.Objects)
						{
							var me=Game.Objects[i];
							if (me.minigame && me.minigame.onResize) me.minigame.onResize();
						}
					}
				}
			},
			{
				name: 'Sugar Frenzy Protection',
				oldFunction: 'Game.Ascend',
				hash: 900140325,
				newFunction: bypass =>
				{
					if (!epicCookie.sugarFrenzy.canAscend()) {
						Game.Notify('Sugar Frenzy Block','You have not used Sugar Frenzy yet this ascension! (You can turn off Sugar Frenzy Protect in the Epic Settings menu.)',[22,17],4);
						return;
					}
					if (!bypass) Game.Prompt('<h3>Ascend</h3><div class="block">Do you REALLY want to ascend?<div class="line"></div>You will lose your progress and start over from scratch.<div class="line"></div>All your cookies will be converted into prestige and heavenly chips.<div class="line"></div>You will keep your achievements'+(Game.canLumps()?', building levels and sugar lumps':'')+'.</div>',[['Yes!','Game.ClosePrompt();Game.Ascend(1);'],'No']);
					else
					{
						if (Game.prefs.popups) Game.Popup('Ascending');
						else Game.Notify('Ascending','So long, cookies.',[20,7],4);
						Game.OnAscend=0;Game.removeClass('ascending');
						Game.addClass('ascendIntro');
						//trigger the ascend animation
						Game.AscendTimer=1;
						Game.killShimmers();
						l('toggleBox').style.display='none';
						l('toggleBox').innerHTML='';
						Game.choiceSelectorOn=-1;
						Game.ToggleSpecialMenu(0);
						Game.AscendOffX=0;
						Game.AscendOffY=0;
						Game.AscendOffXT=0;
						Game.AscendOffYT=0;
						Game.AscendZoomT=1;
						Game.AscendZoom=0.2;
					}
				}
			},
			{
				name: 'Wrinkler Complaints',
				oldFunction: 'Game.UpdateWrinklers',
				hash: -1997174827,
				newFunction: () => {
					const wrinklerComplaints = ['What do you want!?','Ouch!','Oh, the humanity!','That tickled!','Oof','Stop that!','NoooOOOOoooo!','oh well','ugh!'];
					var inRect = (x, y, rect) => {
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
			},
			{
				name: 'Easter Egg Notifications',
				oldFunction: 'Game.DropEgg',
				hash: -1994923900,
				newFunction: failRate => {
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
					} else {
						Game.Notify('No Egg Drop For You!',Beautify(random*100)+'/'+Beautify(failRate*100),[0,12], 6);
					}
				}
			},
		]
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
	styleUpdater: {
		sheetIndex: 0,
		init: function() {
			this.sheetIndex = this.getStyleSheet();
		},
		getStyleSheet: function() {
			const regex = new RegExp('orteil\.dashnet\.org\/cookieclicker');
			for (sheet in document.styleSheets) {
				if (regex.test(document.styleSheets[sheet].href)) {
					return sheet;
				}
			}
		},
		findRule: function(selector) {
			for (rule in document.styleSheets[this.sheetIndex].rules) {
				if (document.styleSheets[this.sheetIndex].rules[rule].selectorText == selector) {
					return rule;
				}
			}
			return false;
		},
		addStyle: function(selector, rules) {
			const rule = this.findRule(selector);
			if (rule !== false) {
				console.error('unable to edit existing rules yet');
			} else {
				document.styleSheets[this.sheetIndex].insertRule(selector + '{' + rules + '}');
			}
		}
	},
	epicButton: {
		init: function() {
			epicCookie.styleUpdater.addStyle('#epicButton', 'background-position: -100px 0px; top: 47px; left: 96px; border-radius: 14px; padding: 16px 17px; display: inline-block; text-align: center;');
			epicCookie.styleUpdater.addStyle('#epicButton:hover, #epicButton.selected', 'background-position: -100px -96px;');
			l('statsButton').insertAdjacentHTML('afterend', '<div id="epicButton" class="button">Epic</div>');
			AddEvent(l('epicButton'),'click',function(){Game.ShowMenu('epic');});
		}
	},
	wrinklerPopper: {
		enabled: false,
		wrinklerPopperId: "wrinklerPopper",
		popperImage: "https://i.pinimg.com/originals/6a/aa/80/6aaa806cc939c049ed9c2bf4e99c9303.png",
		init: function() {
			Game.prefs.epicWriklerPopper = this.enabled;
			this.update();
		},
		toggle: function() {
			this.enabled = !this.enabled;
			this.update();
		},
		update: function() {
			let exists = this.exists();
			if (!this.enabled && exists) this.destroy();
			else if (this.enabled && !exists) this.create();
		},
		create: function() {
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
			document.getElementById(this.wrinklerPopper).remove();
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
		enabled: true,
		cookieShieldId: "cookieShield",
		shieldImages: [
			"https://cdn1.iconfinder.com/data/icons/arms-and-armor-color/300/17-512.png"
		],
		currentShield: 0,
		autoCheckShimmeringVeil: 1,
		checkedCount: 0,
		init: function() {
			Game.prefs.epicCookieShield = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
			if (!this.enabled && this.exists()) this.destroy();
		},
		loop: function() {
			let exists = this.exists();
			if ((!Game.Has('Shimmering veil') || Game.Has('Shimmering veil [on]')) && exists) this.destroy();
			if (Game.Has('Shimmering veil [off]') && !exists) this.create();
		},
		exists: function() {
			return document.getElementById(this.cookieShieldId) !== null;
		},
		create: function() {
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
			document.getElementById(this.cookieShieldId).remove();
		}
	},
	wizardry: {
		enabled: true,
		miniGame: Game.Objects["Wizard tower"].minigame,
		spellOfChoice: 'conjure baked goods',
		init: function() {
			Game.prefs.epicAutoWizardry = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
		},
		loop: function() {
			if (!Game.Objects["Wizard tower"].minigameLoaded) {
				this.enabled = false;
				return;
			}
			if (this.miniGame.magic == this.miniGame.magicM) {
				this.cast();
			}
		},
		cast: function() {
			spell = Game.Objects["Wizard tower"].minigame.spells[this.spellOfChoice];
			Game.Objects["Wizard tower"].minigame.castSpell(spell);
		}
	},
	stats: {
		init: function() {
			if (!!l('epicStats')) l('epicStats').remove();
			var str = '<div id="epicStats" style="position:absolute; right:1px; bottom:50px; overflow:hidden; z-index:10;">';
			str += '<div style="float: right;">Season Switches: <span id="epicSeasonSwitches"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Santa\'s Gifts: <span id="epicSantaDropsHas"></span> / <span id="epicSantaDropsTotal"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Reindeer Cookies: <span id="epicReindeerCookiesHas"></span> / <span id="epicReindeerCookiesTotal"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Halloween Cookies: <span id="epicHalloweenCookiesHas"></span> / <span id="epicHalloweenCookiesTotal"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Heart Biscuits: <span id="epicHeartBiscuitsHas"></span> / <span id="epicHeartBiscuitsTotal"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Easter Eggs: <span id="epicEasterEggsHas"></span> / <span id="epicEasterEggsTotal"></span></div>';
			str += '<div style="clear: both;"></div>';
			str += '<div style="float: right;">Fortunes: <span id="epicFortuneHas"></span> / <span id="epicFortuneTotal"></span></div>';
			str += '</div>';
			l('sectionLeftExtra').innerHTML=l('sectionLeftExtra').innerHTML+str;

			this.update();
		},
		update: function() {

			l('epicSeasonSwitches').innerHTML = Game.seasonUses;

			l('epicSantaDropsHas').innerHTML = Game.GetHowManySantaDrops();
			l('epicSantaDropsTotal').innerHTML = Game.santaDrops.length;

			l('epicReindeerCookiesHas').innerHTML = Game.GetHowManyReindeerDrops();
			l('epicReindeerCookiesTotal').innerHTML = Game.reindeerDrops.length;

			l('epicHalloweenCookiesHas').innerHTML = Game.GetHowManyHalloweenDrops();
			l('epicHalloweenCookiesTotal').innerHTML = Game.halloweenDrops.length;

			l('epicHeartBiscuitsHas').innerHTML = Game.GetHowManyHeartDrops();
			l('epicHeartBiscuitsTotal').innerHTML = Game.heartDrops.length;

			l('epicEasterEggsHas').innerHTML = Game.GetHowManyEggs();
			l('epicEasterEggsTotal').innerHTML = Game.easterEggs.length;

			// get fortune data
			var list = Game.Tiers['fortune'].upgrades;
			var fortunes=0;
			for (var i in list)
			{
				if (Game.Has(list[i].name)) fortunes++;
			}

			l('epicFortuneHas').innerHTML = fortunes;
			l('epicFortuneTotal').innerHTML = list.length;

			setTimeout(() => { this.update(); }, 1000);
		}
	},
	autoBuyUpgrades: {
		enabled: false,
		init: function() {
			Game.prefs.epicUpgrades = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
		},
		loop: function() {
			for (var i in Game.UpgradesInStore) {
				var me = Game.UpgradesById[Game.UpgradesInStore[i].id];
				if (me.pool !== 'toggle' && me.canBuy()) {
					me.click();
				}
			}
		}
	},
	autoBuyBuildings: {
		enabled: false,
		currentBuilding: 0,
		round: 100,
		init: function() {
			Game.prefs.epicBuildings = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
		},
		loop: function() {
			var building = Game.ObjectsById[this.currentBuilding];
			if (typeof building !== "undefined" && building.locked !== 1) {
				var round = this.round;
				Game.buyBulk = round - (building.amount % round);
				if (building.bulkPrice < Game.cookies) {
					building.buy()
				}

				this.currentBuilding += 1;
			} else {
				this.currentBuilding = 0;
			}
		}
	},
	autoBuyDragonLevels: {
		enabled: false,
		init: function() {
			Game.prefs.epicDragon = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
		},
		loop: function() {
			if (Game.Has('A crumbly egg')) Game.UpgradeDragon();
		}
	},
	autoBuySantaLevels: {
		enabled: false,
		init: function() {
			Game.prefs.epicSanta = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled;
		},
		loop: function() {
			if (Game.Has('A festive hat')) Game.UpgradeSanta();
		}
	},
	sugarFrenzy: {
		enabled: true,
		init: function() {
			Game.prefs.epicSugarFrenzy = this.enabled;
		},
		toggle: function() {
			this.enabled = !this.enabled
		},
		canAscend: function() {
			if (!this.enabled || !Game.Upgrades['Sugar frenzy'].unlocked) return true;
			return Game.Upgrades['Sugar frenzy'].bought;
		}
	}
};
epicCookie.init()

