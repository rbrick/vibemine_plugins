(function(ctx, state) {
  var sender = ctx.getSender();
  if (!sender.isPlayer()) {
    sender.sendMessage("&cPlayers only.");
    return;
  }

  var args = ctx.getArgs();
  if (args.size() < 2 || String(args.get(0)).toLowerCase() === "help") {
    sender.sendMessage("&eUsage: &f/block_text <material> <text...>");
    sender.sendMessage("&7Example: &f/block_text glowstone HELLO WORLD");
    sender.sendMessage("&7Draws 5x7 block letters centered in front of you. Use &f/block_text_undo &7to restore.");
    return;
  }

  var material = String(args.get(0)).toUpperCase();
  var text = "";
  for (var i = 1; i < args.size(); i++) {
    if (i > 1) text += " ";
    text += String(args.get(i));
  }
  text = text.toUpperCase();
  if (text.length > state.maxChars) {
    sender.sendMessage("&cText is too long. Max " + state.maxChars + " characters.");
    return;
  }

  var player = sender.asPlayer();
  var world = player.getWorld();
  var loc = player.getLocation();
  var dir = state.facing(loc.getYaw());
  var width = text.length * 6 - 1;
  var start = -Math.floor(width / 2);
  var centerX = Math.floor(loc.getX()) + dir.fx * 6;
  var centerZ = Math.floor(loc.getZ()) + dir.fz * 6;
  var baseY = Math.floor(loc.getY()) + 2;

  var snapshots = [];
  var seen = {};
  var placed = 0;

  function putAt(offset, y, materialName) {
    var x = centerX + dir.rx * offset;
    var z = centerZ + dir.rz * offset;
    var key = x + "," + y + "," + z;
    var block = world.getBlockAt(x, y, z);
    if (!seen[key]) {
      snapshots.push(block.captureState());
      seen[key] = true;
    }
    block.setType(materialName, false);
    placed++;
  }

  try {
    var cursor = 0;
    for (var c = 0; c < text.length; c++) {
      var ch = text.charAt(c);
      var glyph = state.font[ch] || state.font["?"];
      for (var row = 0; row < 7; row++) {
        var line = glyph[row];
        for (var col = 0; col < 5; col++) {
          if (line.charAt(col) === "1") {
            putAt(start + cursor + col, baseY + (6 - row), material);
          }
        }
      }
      cursor += 6;
    }
  } catch (e) {
    for (var r = snapshots.length - 1; r >= 0; r--) {
      snapshots[r].restore(false);
    }
    sender.sendMessage("&cCould not draw text. Check the material name, e.g. GLOWSTONE, OAK_PLANKS, BLACK_CONCRETE.");
    return;
  }

  var id = player.getId();
  if (!state.undo[id]) state.undo[id] = [];
  state.undo[id].push(snapshots);
  if (state.undo[id].length > 5) state.undo[id].shift();

  player.playSound("minecraft:block.note_block.bell", 0.8, 1.2);
  sender.sendMessage("&aDrew &f\"" + text + "\" &ain &f" + placed + " &ablocks. Undo with &f/block_text_undo&a.");
})