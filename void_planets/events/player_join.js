(function(ctx,state){
  var world = server.getWorld(state.worldName);
  if(world) state.applyNight(world);
})