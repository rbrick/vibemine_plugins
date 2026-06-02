(function(ctx,state){
  var player = ctx.getPlayer();
  if (!player) return;
  state.refreshWorldForPlayer(player, state, false);
})