(function(ctx,state){
  var sender = ctx.getSender();
  var args = ctx.getArgs();
  function msg(text){ sender.sendMessage(minimessage.toLegacy(text)); }

  if(args.length > 0 && (String(args[0]).toLowerCase() === "info" || String(args[0]).toLowerCase() === "help")){
    msg("<dark_purple><bold>Void Planets</bold></dark_purple><gray>:</gray> <light_purple>/void_planets</light_purple> <gray>creates/enters an always-night void dimension full of hollow resource planets, rings, and moons.</gray>");
    return;
  }

  var world = state.getOrCreateWorld();
  if(!world){
    msg("<red>Could not create the void planets dimension.</red>");
    return;
  }

  if(sender.isPlayer()){
    var player = sender.asPlayer();
    try { player.teleport(world.location(state.spawnX + 0.5, state.spawnY, state.spawnZ + 0.5)); } catch(e) {
      msg("<yellow>The world was created, but teleport failed: " + String(e) + "</yellow>");
      return;
    }
    msg("<dark_purple><bold>Entering Void Planets...</bold></dark_purple> <gray>Always night. Hollow planets. Resource-rich shells. Watch your step.</gray>");
  } else {
    msg("<green>Void Planets world is ready:</green> <aqua>" + state.worldName + "</aqua>");
  }
})