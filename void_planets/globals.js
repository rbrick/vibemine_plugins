(function(){
  var state = {};

  state.worldName = "void_planets";
  state.spawnX = 0;
  state.spawnY = 167;
  state.spawnZ = 0;
  state.nightTime = 18000;

  state.applyNight = function(world){
    if(!world) return false;
    try { world.setTime(state.nightTime); } catch(e) {}
    try { world.freezeTime(state.nightTime); } catch(e) {}
    try { world.setDaylightCycleEnabled(false); } catch(e) {}
    try { world.setStorm(false); } catch(e) {}
    try { world.setWeatherCycleEnabled(false); } catch(e) {}
    try { world.freezeWeather(false); } catch(e) {}
    return true;
  };

  state.getOrCreateWorld = function(){
    var world = server.getWorld(state.worldName);
    if(!world){
      world = server.createWorld(state.worldName, {
        seed: 8675309,
        environment: "NORMAL",
        generator: "void_planets:planet_generator"
      });
      try { world.setSpawnLocation(state.spawnX, state.spawnY, state.spawnZ); } catch(e) {}
    }
    state.applyNight(world);
    return world;
  };

  state.createGenerator = function(){
    var columnSource = `(function(x,z,seed,chunkX,chunkZ){
      var spans = [];
      var floor = Math.floor;
      var ceil = Math.ceil;
      var sqrt = Math.sqrt;
      var sin = Math.sin;
      var cos = Math.cos;
      var abs = Math.abs;
      var min = Math.min;
      var max = Math.max;

      function fract(v){ return v - floor(v); }
      function rnd(a,b,c){ return fract(sin(a * 127.1 + b * 311.7 + c * 74.7 + seed * 0.000001) * 43758.5453123); }
      function add(from,to,block){
        from = floor(from);
        to = floor(to);
        if(to >= from){ spans.push({from:from, to:to, block:block}); }
      }

      function pickOre(hash,type){
        if(type < 0.20){
          if(hash < 0.012) return 'diamond_ore';
          if(hash < 0.035) return 'gold_ore';
          if(hash < 0.075) return 'iron_ore';
          if(hash < 0.115) return 'copper_ore';
          if(hash < 0.155) return 'coal_ore';
          if(hash < 0.178) return 'redstone_ore';
          if(hash < 0.198) return 'lapis_ore';
          return 'deepslate';
        }
        if(type < 0.40){
          if(hash < 0.018) return 'emerald_ore';
          if(hash < 0.052) return 'diamond_ore';
          if(hash < 0.095) return 'gold_ore';
          if(hash < 0.145) return 'iron_ore';
          if(hash < 0.205) return 'coal_ore';
          return 'tuff';
        }
        if(type < 0.62){
          if(hash < 0.020) return 'amethyst_block';
          if(hash < 0.055) return 'lapis_ore';
          if(hash < 0.100) return 'redstone_ore';
          if(hash < 0.160) return 'copper_ore';
          if(hash < 0.210) return 'iron_ore';
          return 'calcite';
        }
        if(type < 0.82){
          if(hash < 0.018) return 'ancient_debris';
          if(hash < 0.060) return 'nether_quartz_ore';
          if(hash < 0.120) return 'gold_ore';
          if(hash < 0.175) return 'redstone_ore';
          return 'blackstone';
        }
        if(hash < 0.025) return 'diamond_ore';
        if(hash < 0.070) return 'emerald_ore';
        if(hash < 0.120) return 'gold_ore';
        if(hash < 0.190) return 'iron_ore';
        return 'end_stone';
      }

      function pickSurface(hash,type){
        if(type < 0.20) return hash < 0.16 ? 'moss_block' : (hash < 0.32 ? 'clay' : 'stone');
        if(type < 0.40) return hash < 0.18 ? 'deepslate' : (hash < 0.30 ? 'basalt' : 'tuff');
        if(type < 0.62) return hash < 0.22 ? 'calcite' : (hash < 0.34 ? 'amethyst_block' : 'smooth_basalt');
        if(type < 0.82) return hash < 0.18 ? 'magma_block' : (hash < 0.34 ? 'blackstone' : 'netherrack');
        return hash < 0.24 ? 'purpur_block' : (hash < 0.38 ? 'end_stone_bricks' : 'end_stone');
      }

      function addChunkySpan(from,to,type,cellA,cellB,surfaceBias){
        from = floor(from);
        to = floor(to);
        if(to < from) return;
        var y = from;
        while(y <= to){
          var stepHash = rnd(floor(x / 5) + cellA * 17, floor(z / 5) + cellB * 19, floor(y / 4));
          var y2 = min(to, y + 2 + floor(stepHash * 4));
          var h = rnd(floor(x / 3) + cellA * 31, floor(z / 3) - cellB * 23, floor(y / 3));
          var block = surfaceBias ? pickSurface(h,type) : pickOre(h,type);
          add(y,y2,block);
          y = y2 + 1;
        }
      }

      function addLining(y,type,cellA,cellB){
        var h = rnd(floor(x / 4) + cellA * 7, floor(z / 4) - cellB * 5, floor(y / 2));
        if(h < 0.035) add(y,y,'glowstone');
        else if(h < 0.060) add(y,y,'melon');
        else if(h < 0.085) add(y,y,'oak_log');
        else if(type < 0.22) add(y,y,'moss_block');
        else if(type < 0.62) add(y,y,'calcite');
        else add(y,y,'smooth_basalt');
      }

      function addPlanet(cx,cy,cz,r,type,ringFlag,isMoon,cellA,cellB){
        var dx = x - cx;
        var dz = z - cz;
        var horiz2 = dx * dx + dz * dz;
        var rr = r * r;

        if(horiz2 <= rr){
          var outer = sqrt(rr - horiz2);
          var shell = max(6, floor(r * 0.34));
          var inner = r - shell;
          var inner2 = inner * inner;
          var bottomOuter = ceil(cy - outer);
          var topOuter = floor(cy + outer);
          var surfaceEdge = outer < 4 || horiz2 > (r - 3) * (r - 3);

          if(horiz2 < inner2){
            var innerY = sqrt(inner2 - horiz2);
            var bottomInner = floor(cy - innerY);
            var topInner = ceil(cy + innerY);
            addChunkySpan(bottomOuter,bottomInner,type,cellA,cellB,surfaceEdge);
            addChunkySpan(topInner,topOuter,type,cellA,cellB,surfaceEdge);
            addLining(bottomInner,type,cellA,cellB);
            addLining(topInner,type,cellA,cellB);
          } else {
            addChunkySpan(bottomOuter,topOuter,type,cellA,cellB,true);
          }
        }

        if(ringFlag && !isMoon){
          var radial = sqrt(horiz2);
          if(radial > r + 7 && radial < r + 34){
            var gap = rnd(floor(radial / 4), cellA, cellB);
            if(gap > 0.18){
              var ringY = floor(cy - dx * 0.09 + dz * 0.04);
              var rh = rnd(floor(x / 4), floor(z / 4), cellA - cellB);
              var block = rh < 0.34 ? 'packed_ice' : (rh < 0.68 ? 'light_gray_concrete' : 'amethyst_block');
              var thickness = rh > 0.90 ? 2 : 1;
              add(ringY - thickness, ringY + thickness, block);
            }
          }
        }
      }

      // The central planet sits directly below the spawn pad.
      addPlanet(0,120,0,45,0.08,true,false,0,0);

      // Small safe pad at spawn so players never appear inside a hollow shell or in empty void.
      if(abs(x) <= 6 && abs(z) <= 6){
        add(166,166,'smooth_stone');
        if(abs(x) === 6 || abs(z) === 6){ add(167,168,'stone_brick_wall'); }
        if((abs(x) === 4 && abs(z) === 4) || (abs(x) === 0 && abs(z) === 5) || (abs(x) === 5 && abs(z) === 0)){ add(167,167,'glowstone'); }
      }

      var size = 224;
      var cx0 = floor(x / size);
      var cz0 = floor(z / size);
      for(var ox = -1; ox <= 1; ox++){
        for(var oz = -1; oz <= 1; oz++){
          var cellX = cx0 + ox;
          var cellZ = cz0 + oz;
          if(cellX === 0 && cellZ === 0) continue;

          var cx = cellX * size + 38 + floor(rnd(cellX,cellZ,1) * 148);
          var cz = cellZ * size + 38 + floor(rnd(cellX,cellZ,2) * 148);
          var cy = 82 + floor(rnd(cellX,cellZ,3) * 84);
          var r = 24 + floor(rnd(cellX,cellZ,4) * 38);
          var type = rnd(cellX,cellZ,5);
          var rings = rnd(cellX,cellZ,6) > 0.62;

          addPlanet(cx,cy,cz,r,type,rings,false,cellX,cellZ);

          if(rnd(cellX,cellZ,7) > 0.50){
            var ang = rnd(cellX,cellZ,8) * 6.28318530718;
            var md = r + 30 + floor(rnd(cellX,cellZ,9) * 34);
            var mr = 9 + floor(rnd(cellX,cellZ,10) * 15);
            var mx = cx + floor(cos(ang) * md);
            var mz = cz + floor(sin(ang) * md);
            var my = cy - 18 + floor(rnd(cellX,cellZ,11) * 42);
            addPlanet(mx,my,mz,mr,type * 0.73 + 0.13,false,true,cellX + 31,cellZ - 17);
          }
        }
      }
      return spans;
    })`;

    return {
      type: "column",
      minY: -16,
      maxY: 240,
      column: columnSource
    };
  };

  return state;
})