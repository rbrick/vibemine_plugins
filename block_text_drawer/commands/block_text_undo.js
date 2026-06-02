(function(ctx, state) {
  var sender = ctx.getSender();
  if (!sender.isPlayer()) {
    sender.sendMessage("&cPlayers only.");
    return;
  }

  var player = sender.asPlayer();
  var id = player.getId();
  var stack = state.undo[id];
  if (!stack || stack.length === 0) {
    sender.sendMessage("&cNothing to undo.");
    return;
  }

  var snapshots = stack.pop();
  for (var i = snapshots.length - 1; i >= 0; i--) {
    snapshots[i].restore(false);
  }
  player.playSound("minecraft:block.note_block.bass", 0.7, 0.8);
  sender.sendMessage("&aUndid the last block text drawing.");
})