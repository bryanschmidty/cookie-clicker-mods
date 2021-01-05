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
