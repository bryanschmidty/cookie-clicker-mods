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