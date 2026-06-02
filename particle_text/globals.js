(function(){
  var font = {
    "A":["01110","10001","10001","11111","10001","10001","10001"],
    "B":["11110","10001","10001","11110","10001","10001","11110"],
    "C":["01111","10000","10000","10000","10000","10000","01111"],
    "D":["11110","10001","10001","10001","10001","10001","11110"],
    "E":["11111","10000","10000","11110","10000","10000","11111"],
    "F":["11111","10000","10000","11110","10000","10000","10000"],
    "G":["01111","10000","10000","10011","10001","10001","01111"],
    "H":["10001","10001","10001","11111","10001","10001","10001"],
    "I":["11111","00100","00100","00100","00100","00100","11111"],
    "J":["00111","00010","00010","00010","10010","10010","01100"],
    "K":["10001","10010","10100","11000","10100","10010","10001"],
    "L":["10000","10000","10000","10000","10000","10000","11111"],
    "M":["10001","11011","10101","10101","10001","10001","10001"],
    "N":["10001","11001","10101","10011","10001","10001","10001"],
    "O":["01110","10001","10001","10001","10001","10001","01110"],
    "P":["11110","10001","10001","11110","10000","10000","10000"],
    "Q":["01110","10001","10001","10001","10101","10010","01101"],
    "R":["11110","10001","10001","11110","10100","10010","10001"],
    "S":["01111","10000","10000","01110","00001","00001","11110"],
    "T":["11111","00100","00100","00100","00100","00100","00100"],
    "U":["10001","10001","10001","10001","10001","10001","01110"],
    "V":["10001","10001","10001","10001","10001","01010","00100"],
    "W":["10001","10001","10001","10101","10101","10101","01010"],
    "X":["10001","10001","01010","00100","01010","10001","10001"],
    "Y":["10001","10001","01010","00100","00100","00100","00100"],
    "Z":["11111","00001","00010","00100","01000","10000","11111"],
    "0":["01110","10001","10011","10101","11001","10001","01110"],
    "1":["00100","01100","00100","00100","00100","00100","01110"],
    "2":["01110","10001","00001","00010","00100","01000","11111"],
    "3":["11110","00001","00001","01110","00001","00001","11110"],
    "4":["00010","00110","01010","10010","11111","00010","00010"],
    "5":["11111","10000","10000","11110","00001","00001","11110"],
    "6":["01110","10000","10000","11110","10001","10001","01110"],
    "7":["11111","00001","00010","00100","01000","01000","01000"],
    "8":["01110","10001","10001","01110","10001","10001","01110"],
    "9":["01110","10001","10001","01111","00001","00001","01110"],
    "!":["00100","00100","00100","00100","00100","00000","00100"],
    "?":["01110","10001","00001","00010","00100","00000","00100"],
    ".":["00000","00000","00000","00000","00000","01100","01100"],
    ",":["00000","00000","00000","00000","01100","01100","01000"],
    ":":["00000","01100","01100","00000","01100","01100","00000"],
    "-":["00000","00000","00000","11111","00000","00000","00000"],
    "+":["00000","00100","00100","11111","00100","00100","00000"],
    "<":["00010","00100","01000","10000","01000","00100","00010"],
    ">":["01000","00100","00010","00001","00010","00100","01000"],
    "/":["00001","00010","00100","01000","10000","00000","00000"],
    "#":["01010","11111","01010","01010","11111","01010","00000"],
    " ":["000","000","000","000","000","000","000"]
  };

  function clampColor(v, fallback){
    var n = parseInt(v, 10);
    if (isNaN(n)) return fallback;
    if (n < 0) return 0;
    if (n > 255) return 255;
    return n;
  }

  function colorFor(mode, index, total, rgb){
    if (mode !== "rainbow") return rgb;
    var t = total <= 1 ? 0 : index / total;
    var phase = t * Math.PI * 2;
    return {
      r: Math.floor(127 + 128 * Math.sin(phase)),
      g: Math.floor(127 + 128 * Math.sin(phase + 2.094)),
      b: Math.floor(127 + 128 * Math.sin(phase + 4.188))
    };
  }

  function buildPoints(text){
    var points = [];
    var cursor = 0;
    var upper = String(text).toUpperCase();
    for (var i = 0; i < upper.length; i++) {
      var ch = upper.charAt(i);
      var glyph = font[ch] || font["?"];
      var width = glyph[0].length;
      for (var row = 0; row < glyph.length; row++) {
        var line = glyph[row];
        for (var col = 0; col < line.length; col++) {
          if (line.charAt(col) === "1") points.push({x: cursor + col, y: row});
        }
      }
      cursor += width + 1;
    }
    return {points: points, width: Math.max(0, cursor - 1), height: 7};
  }

  function makeParticleText(player, text, rgb, mode, state){
    var loc = player.getLocation();
    var world = player.getWorld();
    var yaw = loc.getYaw() * Math.PI / 180.0;
    var forwardX = -Math.sin(yaw);
    var forwardZ = Math.cos(yaw);
    var rightX = Math.cos(yaw);
    var rightZ = Math.sin(yaw);
    var built = buildPoints(text);
    var scale = state.pixelScale;
    var distance = state.distance;
    var centerX = loc.getX() + forwardX * distance;
    var centerY = loc.getY() + 2.25;
    var centerZ = loc.getZ() + forwardZ * distance;
    var leftOffset = -built.width / 2.0;
    var upOffset = built.height / 2.0;
    var pts = [];

    for (var i = 0; i < built.points.length; i++) {
      var p = built.points[i];
      var localX = (leftOffset + p.x) * scale;
      var localY = (upOffset - p.y) * scale;
      pts.push({
        x: centerX + rightX * localX,
        y: centerY + localY,
        z: centerZ + rightZ * localX,
        index: i
      });
    }

    var ownerId = player.getId ? player.getId() : player.getName();
    state.nextId++;
    return {
      id: state.nextId,
      ownerId: ownerId,
      worldName: world.getName(),
      text: text,
      rgb: {r: rgb.r, g: rgb.g, b: rgb.b},
      mode: mode,
      points: pts,
      createdAt: Date.now()
    };
  }

  function makeRainbowArch(player, size, state){
    var loc = player.getLocation();
    var world = player.getWorld();
    var yaw = loc.getYaw() * Math.PI / 180.0;
    var forwardX = -Math.sin(yaw);
    var forwardZ = Math.cos(yaw);
    var rightX = Math.cos(yaw);
    var rightZ = Math.sin(yaw);
    var distance = state.archDistance;
    var centerX = loc.getX() + forwardX * distance;
    var centerY = loc.getY() + state.archBaseYOffset;
    var centerZ = loc.getZ() + forwardZ * distance;
    var scale = 1.0;
    if (size === "small") scale = 0.70;
    else if (size === "large") scale = 1.35;
    else if (size === "huge") scale = 1.75;

    var colors = [
      {r:255,g:35,b:35},
      {r:255,g:140,b:20},
      {r:255,g:235,b:35},
      {r:55,g:220,b:65},
      {r:45,g:210,b:255},
      {r:65,g:95,b:255},
      {r:180,g:70,b:255}
    ];
    var pts = [];
    var outer = state.archOuterRadius * scale;
    var spacing = state.archBandSpacing * scale;
    var step = state.archAngleStep;
    var idx = 0;

    for (var band = 0; band < colors.length; band++) {
      var radius = outer - band * spacing;
      for (var a = 0; a <= Math.PI + 0.0001; a += step) {
        var localX = Math.cos(a) * radius;
        var localY = Math.sin(a) * radius;
        pts.push({
          x: centerX + rightX * localX,
          y: centerY + localY,
          z: centerZ + rightZ * localX,
          index: idx,
          rgb: colors[band]
        });
        idx++;
      }
    }

    var ownerId = player.getId ? player.getId() : player.getName();
    state.nextId++;
    return {
      id: state.nextId,
      ownerId: ownerId,
      worldName: world.getName(),
      kind: "rainbow_arch",
      text: "rainbow arch",
      rgb: {r:255,g:255,b:255},
      mode: "per_point",
      points: pts,
      createdAt: Date.now()
    };
  }

  function sizeScale(size){
    if (size === "tiny") return 0.45;
    if (size === "small") return 0.70;
    if (size === "large") return 1.35;
    if (size === "huge") return 1.75;
    return 1.0;
  }

  function isShapeName(shape){
    return shape === "circle" || shape === "sphere" || shape === "cube" || shape === "spiral" || shape === "helix" || shape === "heart" || shape === "star" || shape === "ring";
  }

  function pushLocal(pts, basis, lx, ly, lz, idx){
    pts.push({
      x: basis.centerX + basis.rightX * lx + basis.forwardX * lz,
      y: basis.centerY + ly,
      z: basis.centerZ + basis.rightZ * lx + basis.forwardZ * lz,
      index: idx
    });
  }

  function makeShape(player, shape, size, rgb, mode, state){
    shape = String(shape || "circle").toLowerCase();
    if (shape === "ring") shape = "circle";
    if (shape === "helix") shape = "spiral";
    var loc = player.getLocation();
    var world = player.getWorld();
    var yaw = loc.getYaw() * Math.PI / 180.0;
    var forwardX = -Math.sin(yaw);
    var forwardZ = Math.cos(yaw);
    var rightX = Math.cos(yaw);
    var rightZ = Math.sin(yaw);
    var scale = sizeScale(size);
    var radius = state.shapeRadius * scale;
    var basis = {
      centerX: loc.getX() + forwardX * state.shapeDistance,
      centerY: loc.getY() + state.shapeYOffset,
      centerZ: loc.getZ() + forwardZ * state.shapeDistance,
      forwardX: forwardX,
      forwardZ: forwardZ,
      rightX: rightX,
      rightZ: rightZ
    };
    var pts = [];
    var idx = 0;

    if (shape === "circle") {
      var circleSteps = Math.max(36, Math.floor(150 * scale));
      for (var c = 0; c < circleSteps; c++) {
        var ca = c * Math.PI * 2 / circleSteps;
        pushLocal(pts, basis, Math.cos(ca) * radius, Math.sin(ca) * radius, 0, idx++);
      }
    } else if (shape === "sphere") {
      var latSteps = Math.max(7, Math.floor(12 * scale));
      var lonSteps = Math.max(16, Math.floor(28 * scale));
      for (var la = 1; la < latSteps; la++) {
        var theta = -Math.PI / 2 + la * Math.PI / latSteps;
        var ringR = Math.cos(theta) * radius;
        var y = Math.sin(theta) * radius;
        for (var lo = 0; lo < lonSteps; lo++) {
          var phi = lo * Math.PI * 2 / lonSteps;
          pushLocal(pts, basis, Math.cos(phi) * ringR, y, Math.sin(phi) * ringR, idx++);
        }
      }
      pushLocal(pts, basis, 0, radius, 0, idx++);
      pushLocal(pts, basis, 0, -radius, 0, idx++);
    } else if (shape === "cube") {
      var half = radius;
      var edgeSteps = Math.max(8, Math.floor(18 * scale));
      var corners = [[-half,-half,-half],[half,-half,-half],[half,half,-half],[-half,half,-half],[-half,-half,half],[half,-half,half],[half,half,half],[-half,half,half]];
      var edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      for (var e = 0; e < edges.length; e++) {
        var a0 = corners[edges[e][0]];
        var b0 = corners[edges[e][1]];
        for (var es = 0; es <= edgeSteps; es++) {
          var t = es / edgeSteps;
          pushLocal(pts, basis, a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t, a0[2] + (b0[2] - a0[2]) * t, idx++);
        }
      }
    } else if (shape === "spiral") {
      var turns = 3.25;
      var spiralSteps = Math.max(90, Math.floor(220 * scale));
      for (var s = 0; s < spiralSteps; s++) {
        var st = s / (spiralSteps - 1);
        var sa = st * Math.PI * 2 * turns;
        var sy = (st - 0.5) * radius * 2.2;
        pushLocal(pts, basis, Math.cos(sa) * radius, sy, Math.sin(sa) * radius, idx++);
      }
    } else if (shape === "heart") {
      var heartSteps = Math.max(80, Math.floor(180 * scale));
      for (var h = 0; h < heartSteps; h++) {
        var ht = h * Math.PI * 2 / heartSteps;
        var hx = 16 * Math.pow(Math.sin(ht), 3) / 16 * radius;
        var hy = (13 * Math.cos(ht) - 5 * Math.cos(2 * ht) - 2 * Math.cos(3 * ht) - Math.cos(4 * ht)) / 18 * radius;
        pushLocal(pts, basis, hx, hy, 0, idx++);
      }
    } else if (shape === "star") {
      var tips = 5;
      var vertices = [];
      for (var v = 0; v < tips * 2; v++) {
        var vr = (v % 2 === 0) ? radius : radius * 0.42;
        var va = -Math.PI / 2 + v * Math.PI / tips;
        vertices.push([Math.cos(va) * vr, Math.sin(va) * vr]);
      }
      var segSteps = Math.max(8, Math.floor(16 * scale));
      for (var sv = 0; sv < vertices.length; sv++) {
        var p0 = vertices[sv];
        var p1 = vertices[(sv + 1) % vertices.length];
        for (var ss = 0; ss < segSteps; ss++) {
          var u = ss / segSteps;
          pushLocal(pts, basis, p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u, 0, idx++);
        }
      }
    } else {
      throw "Unknown shape: " + shape;
    }

    var ownerId = player.getId ? player.getId() : player.getName();
    state.nextId++;
    return {
      id: state.nextId,
      ownerId: ownerId,
      worldName: world.getName(),
      kind: "shape",
      shape: shape,
      text: shape,
      rgb: {r: rgb.r, g: rgb.g, b: rgb.b},
      mode: mode,
      points: pts,
      createdAt: Date.now()
    };
  }

  function spawnOne(world, p, color, state){
    var loc = world.location(p.x, p.y, p.z);
    world.spawnDustParticle(loc, state.particleCount, color.r, color.g, color.b, state.particleSize);
  }

  function refreshText(world, entry, state){
    var total = entry.points.length;
    for (var i = 0; i < total; i++) {
      var point = entry.points[i];
      var c = point.rgb ? point.rgb : colorFor(entry.mode, point.index, total, entry.rgb);
      spawnOne(world, point, c, state);
    }
    return total;
  }

  function refreshWorldForPlayer(player, state, force){
    var now = Date.now();
    var pid = player.getId ? player.getId() : player.getName();
    if (!force && state.lastRefreshByPlayer[pid] && now - state.lastRefreshByPlayer[pid] < state.refreshMillis) return 0;
    state.lastRefreshByPlayer[pid] = now;
    var world = player.getWorld();
    var worldName = world.getName();
    var spawned = 0;
    for (var i = 0; i < state.activeTexts.length; i++) {
      var entry = state.activeTexts[i];
      if (entry.worldName === worldName) spawned += refreshText(world, entry, state);
    }
    return spawned;
  }

  function eachOnlinePlayer(fn){
    var list = null;
    try { list = server.getOnlinePlayers(); } catch (e) { return; }
    if (!list) return;
    if (typeof list.size === "function") {
      for (var i = 0; i < list.size(); i++) fn(list.get(i));
      return;
    }
    for (var j = 0; j < list.length; j++) fn(list[j]);
  }

  function refreshAllOnline(state, force){
    if (!state.activeTexts || state.activeTexts.length === 0) return 0;
    var now = Date.now();
    if (!force && state.lastGlobalRefresh && now - state.lastGlobalRefresh < state.refreshMillis) return 0;
    state.lastGlobalRefresh = now;
    var spawned = 0;
    eachOnlinePlayer(function(player){
      if (player) spawned += refreshWorldForPlayer(player, state, true);
    });
    return spawned;
  }

  function startRepeatingTask(state){
    if (state.taskStarted) return true;

    var runner = function(){
      if (state.taskRunning) return;
      state.taskRunning = true;
      try {
        refreshAllOnline(state, true);
      } catch (e) {
        state.lastTaskError = String(e);
      }
      state.taskRunning = false;
    };

    state.lastTaskError = null;

    try {
      if (typeof setInterval === "function") {
        state.taskHandle = setInterval(runner, state.refreshMillis);
        state.taskKind = "setInterval";
        state.taskStarted = true;
        return true;
      }
    } catch (e1) {
      state.lastTaskError = String(e1);
    }

    try {
      if (typeof scheduler !== "undefined" && scheduler && typeof scheduler.runTaskTimer === "function") {
        state.taskHandle = scheduler.runTaskTimer(runner, 1, state.refreshTicks);
        state.taskKind = "scheduler.runTaskTimer";
        state.taskStarted = true;
        return true;
      }
    } catch (e2) {
      state.lastTaskError = String(e2);
    }

    try {
      if (typeof scheduler !== "undefined" && scheduler && typeof scheduler.runRepeating === "function") {
        state.taskHandle = scheduler.runRepeating(runner, 1, state.refreshTicks);
        state.taskKind = "scheduler.runRepeating";
        state.taskStarted = true;
        return true;
      }
    } catch (e3) {
      state.lastTaskError = String(e3);
    }

    state.taskHandle = null;
    state.taskKind = "none";
    state.taskStarted = false;
    return false;
  }

  function stopRepeatingTask(state){
    if (!state.taskStarted) return;
    try {
      if (state.taskKind === "setInterval" && typeof clearInterval === "function") clearInterval(state.taskHandle);
      else if (state.taskHandle && typeof state.taskHandle.cancel === "function") state.taskHandle.cancel();
      else if (typeof scheduler !== "undefined" && scheduler && state.taskHandle && typeof scheduler.cancelTask === "function") scheduler.cancelTask(state.taskHandle);
    } catch (e) {
      state.lastTaskError = String(e);
    }
    state.taskHandle = null;
    state.taskKind = "none";
    state.taskStarted = false;
    state.taskRunning = false;
  }

  function rememberEntry(player, entry, state){
    if (state.activeTexts.length >= state.maxActiveTexts) state.activeTexts.shift();
    state.activeTexts.push(entry);
    if (!state.undoByPlayer[entry.ownerId]) state.undoByPlayer[entry.ownerId] = [];
    state.undoByPlayer[entry.ownerId].push(entry.id);
    if (state.undoByPlayer[entry.ownerId].length > state.maxUndo) state.undoByPlayer[entry.ownerId].shift();
    startRepeatingTask(state);
    refreshText(player.getWorld(), entry, state);
    return {points: entry.points.length, id: entry.id};
  }

  function addText(player, text, rgb, mode, state){
    var entry = makeParticleText(player, text, rgb, mode, state);
    return rememberEntry(player, entry, state);
  }

  function addRainbowArch(player, size, state){
    var entry = makeRainbowArch(player, size, state);
    return rememberEntry(player, entry, state);
  }

  function addShape(player, shape, size, rgb, mode, state){
    var entry = makeShape(player, shape, size, rgb, mode, state);
    return rememberEntry(player, entry, state);
  }

  function undoLast(player, state){
    var id = player.getId ? player.getId() : player.getName();
    var stack = state.undoByPlayer[id];
    if (!stack || stack.length === 0) return 0;
    var textId = stack.pop();
    for (var i = state.activeTexts.length - 1; i >= 0; i--) {
      if (state.activeTexts[i].id === textId) {
        var pts = state.activeTexts[i].points.length;
        state.activeTexts.splice(i, 1);
        return pts;
      }
    }
    return 0;
  }

  return {
    maxChars: 18,
    maxUndo: 10,
    maxActiveTexts: 25,
    pixelScale: 0.28,
    distance: 4.0,
    particleSize: 1.15,
    particleCount: 1,
    archDistance: 6.0,
    archBaseYOffset: 0.4,
    archOuterRadius: 4.2,
    archBandSpacing: 0.32,
    archAngleStep: 0.085,
    shapeDistance: 5.0,
    shapeYOffset: 2.2,
    shapeRadius: 2.0,
    refreshMillis: 300,
    refreshTicks: 6,
    defaultColor: {r: 255, g: 80, b: 210},
    activeTexts: [],
    undoByPlayer: {},
    lastRefreshByPlayer: {},
    lastGlobalRefresh: 0,
    taskStarted: false,
    taskRunning: false,
    taskHandle: null,
    taskKind: "none",
    lastTaskError: null,
    nextId: 0,
    clampColor: clampColor,
    addText: addText,
    addRainbowArch: addRainbowArch,
    addShape: addShape,
    isShapeName: isShapeName,
    undoLast: undoLast,
    refreshWorldForPlayer: refreshWorldForPlayer,
    refreshAllOnline: refreshAllOnline,
    startRepeatingTask: startRepeatingTask,
    stopRepeatingTask: stopRepeatingTask
  };
})