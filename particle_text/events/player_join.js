(function(ctx,state){
  var player = ctx.getPlayer();
  if (!player) return;
  state.startRepeatingTask(state);
  state.refreshWorldForPlayer(player, state, true);
})