(function(ctx,state){
  var sender = ctx.getSender();
  if (!sender.isPlayer()) {
    sender.sendMessage(minimessage.toLegacy("<red>Only players can use particle text because it needs your location.</red>"));
    return;
  }

  var args = ctx.getArgs();
  if (!args || args.length === 0 || String(args[0]).toLowerCase() === "help") {
    sender.sendMessage(minimessage.toLegacy("<gradient:#ff66ff:#66ffff><bold>Particle Text</bold></gradient>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text <message></yellow> <gray>- place real dust-particle text in front of you</gray>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text color <r> <g> <b> <message></yellow> <gray>- colored dust particles</gray>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text rainbow <message></yellow> <gray>- rainbow dust particles</gray>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text arch [small|normal|large|huge]</yellow> <gray>- draw a persistent-looking rainbow particle arch</gray>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text shape <circle|sphere|cube|spiral|heart|star> [tiny|small|normal|large|huge] [rainbow|r g b]</yellow> <gray>- draw particle shapes</gray>"));
    sender.sendMessage(minimessage.toLegacy("<yellow>/particle_text undo</yellow> <gray>- stop refreshing your last particle drawing</gray>"));
    sender.sendMessage(minimessage.toLegacy("<gray>Note: Minecraft particles are temporary client visuals, so a repeating task keeps them looking persistent.</gray>"));
    return;
  }

  var player = sender.asPlayer();
  var first = String(args[0]).toLowerCase();

  if (first === "undo") {
    var undone = state.undoLast(player, state);
    if (undone <= 0) sender.sendMessage(minimessage.toLegacy("<red>You do not have any particle drawings to undo.</red>"));
    else sender.sendMessage(minimessage.toLegacy("<green>Stopped refreshing your last particle drawing.</green> <gray>The old particles will fade naturally.</gray>"));
    return;
  }

  if (first === "arch" || first === "rainbow_arch") {
    var size = "normal";
    if (args.length >= 2) size = String(args[1]).toLowerCase();
    if (size !== "small" && size !== "normal" && size !== "large" && size !== "huge") {
      sender.sendMessage(minimessage.toLegacy("<red>Usage: /particle_text arch [small|normal|large|huge]</red>"));
      return;
    }
    try {
      var arch = state.addRainbowArch(player, size, state);
      player.playSound("minecraft:block.note_block.pling", 0.8, 1.8);
      sender.sendMessage(minimessage.toLegacy("<rainbow>Drawn a rainbow particle arch!</rainbow> <gray>(" + arch.points + " dust points, size " + size + "). Use <yellow>/particle_text undo</yellow> to stop refreshing it.</gray>"));
    } catch (eArch) {
      sender.sendMessage(minimessage.toLegacy("<red>Could not draw the rainbow arch safely: " + String(eArch) + "</red>"));
    }
    return;
  }

  if (first === "shape" || state.isShapeName(first)) {
    var shape = first === "shape" ? (args.length >= 2 ? String(args[1]).toLowerCase() : "") : first;
    var pos = first === "shape" ? 2 : 1;
    if (!state.isShapeName(shape)) {
      sender.sendMessage(minimessage.toLegacy("<red>Usage: /particle_text shape <circle|sphere|cube|spiral|heart|star> [tiny|small|normal|large|huge] [rainbow|r g b]</red>"));
      return;
    }

    var shapeSize = "normal";
    if (args.length > pos) {
      var maybeSize = String(args[pos]).toLowerCase();
      if (maybeSize === "tiny" || maybeSize === "small" || maybeSize === "normal" || maybeSize === "large" || maybeSize === "huge") {
        shapeSize = maybeSize;
        pos++;
      }
    }

    var shapeMode = "solid";
    var shapeRgb = {r: state.defaultColor.r, g: state.defaultColor.g, b: state.defaultColor.b};
    if (args.length > pos) {
      var colorWord = String(args[pos]).toLowerCase();
      if (colorWord === "rainbow") {
        shapeMode = "rainbow";
        pos++;
      } else if (args.length >= pos + 3) {
        shapeRgb = {
          r: state.clampColor(args[pos], state.defaultColor.r),
          g: state.clampColor(args[pos + 1], state.defaultColor.g),
          b: state.clampColor(args[pos + 2], state.defaultColor.b)
        };
        pos += 3;
      } else {
        sender.sendMessage(minimessage.toLegacy("<red>Shape color must be either <yellow>rainbow</yellow> or <yellow>r g b</yellow>.</red>"));
        return;
      }
    }

    try {
      var shapeResult = state.addShape(player, shape, shapeSize, shapeRgb, shapeMode, state);
      player.playSound("minecraft:block.note_block.pling", 0.8, 1.65);
      var nice = shapeMode === "rainbow" ? "<rainbow>" + shape + "</rainbow>" : "<aqua>" + shape + "</aqua>";
      sender.sendMessage(minimessage.toLegacy("<green>Drawn a " + nice + " particle shape.</green> <gray>(" + shapeResult.points + " dust points, size " + shapeSize + "). Use <yellow>/particle_text undo</yellow> to stop refreshing it.</gray>"));
    } catch (eShape) {
      sender.sendMessage(minimessage.toLegacy("<red>Could not draw that particle shape safely: " + String(eShape) + "</red>"));
    }
    return;
  }

  var mode = "solid";
  var rgb = {r: state.defaultColor.r, g: state.defaultColor.g, b: state.defaultColor.b};
  var start = 0;

  if (first === "color") {
    if (args.length < 5) {
      sender.sendMessage(minimessage.toLegacy("<red>Usage: /particle_text color <r> <g> <b> <message></red>"));
      return;
    }
    rgb = {
      r: state.clampColor(args[1], state.defaultColor.r),
      g: state.clampColor(args[2], state.defaultColor.g),
      b: state.clampColor(args[3], state.defaultColor.b)
    };
    start = 4;
  } else if (first === "rainbow") {
    if (args.length < 2) {
      sender.sendMessage(minimessage.toLegacy("<red>Usage: /particle_text rainbow <message></red>"));
      return;
    }
    mode = "rainbow";
    start = 1;
  }

  var text = Array.prototype.slice.call(args, start).join(" ");
  text = minimessage.strip(text);
  text = text.replace(/[\r\n\t]/g, " ");
  text = text.replace(/[^A-Za-z0-9 !?.,:\-+<>\/#]/g, "?");
  text = text.replace(/\s+/g, " ").trim();

  if (text.length === 0) {
    sender.sendMessage(minimessage.toLegacy("<red>Please include a message to draw.</red>"));
    return;
  }
  if (text.length > state.maxChars) {
    text = text.substring(0, state.maxChars);
    sender.sendMessage(minimessage.toLegacy("<yellow>Message was shortened to " + state.maxChars + " characters so the particle refresh stays lightweight.</yellow>"));
  }

  try {
    var result = state.addText(player, text, rgb, mode, state);
    player.playSound("minecraft:block.note_block.pling", 0.7, 1.6);
    sender.sendMessage(minimessage.toLegacy("<green>Placed real persistent-looking particle text with <aqua>" + result.points + "</aqua> dust points.</green> <gray>A repeating task refreshes it; no glass blocks were placed. Use <yellow>/particle_text undo</yellow> to stop it.</gray>"));
  } catch (e) {
    sender.sendMessage(minimessage.toLegacy("<red>Could not spawn the particle text safely: " + String(e) + "</red>"));
  }
})