import * as THREE from 'three';

export function createMaterials(tex) {
  return {
    floorMarble: new THREE.MeshStandardMaterial({
      map: tex.creamMarble,
      roughness: 0.16,
      metalness: 0.04
    }),
    wallOffWhite: new THREE.MeshStandardMaterial({
      color: 0xe9e7e2,
      roughness: 0.84,
      metalness: 0.0
    }),
    wallTaupeLower: new THREE.MeshStandardMaterial({
      color: 0x8f8474,
      roughness: 0.78,
      metalness: 0.0
    }),
    wallGreyPanel: new THREE.MeshStandardMaterial({
      map: tex.greyWallpaper,
      roughness: 0.85,
      metalness: 0.0
    }),
    ceilingMatte: new THREE.MeshStandardMaterial({
      color: 0xf1f0ec,
      roughness: 0.9,
      metalness: 0.0
    }),
    warmWood: new THREE.MeshStandardMaterial({
      map: tex.warmWood,
      roughness: 0.56,
      metalness: 0.02
    }),
    darkWalnut: new THREE.MeshStandardMaterial({
      map: tex.darkWalnut,
      roughness: 0.48,
      metalness: 0.04
    }),
    glossGreyDrawer: new THREE.MeshStandardMaterial({
      color: 0x7e8082,
      roughness: 0.22,
      metalness: 0.08
    }),
    kitchenTaupe: new THREE.MeshStandardMaterial({
      color: 0xb19b82,
      roughness: 0.55,
      metalness: 0.03
    }),
    blackGranite: new THREE.MeshStandardMaterial({
      map: tex.blackGranite,
      roughness: 0.28,
      metalness: 0.08
    }),
    blackMarble: new THREE.MeshStandardMaterial({
      map: tex.blackMarble,
      roughness: 0.18,
      metalness: 0.06
    }),
    greyMarble: new THREE.MeshStandardMaterial({
      map: tex.greyMarble,
      roughness: 0.18,
      metalness: 0.05
    }),
    smokedGlassCabinet: new THREE.MeshPhysicalMaterial({
      color: 0x2b2f34,
      roughness: 0.12,
      metalness: 0.18,
      transmission: 0.25,
      transparent: true,
      opacity: 0.78
    }),
    clearWindowGlass: new THREE.MeshPhysicalMaterial({
      color: 0xdff0f5,
      roughness: 0.05,
      metalness: 0.0,
      transparent: true,
      opacity: 0.22
    }),
    sheerCurtain: new THREE.MeshStandardMaterial({
      color: 0xf6f6f4,
      roughness: 0.88,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide
    }),
    sofaFabric: new THREE.MeshStandardMaterial({
      color: 0x6f7780,
      roughness: 0.88,
      metalness: 0.0
    }),
    pillowPatternA: new THREE.MeshStandardMaterial({
      color: 0xc8c3b8,
      roughness: 0.86
    }),
    pillowPatternB: new THREE.MeshStandardMaterial({
      color: 0xa5a79e,
      roughness: 0.88
    }),
    chairFabric: new THREE.MeshStandardMaterial({
      color: 0x9b9282,
      roughness: 0.85
    }),
    brassMetal: new THREE.MeshStandardMaterial({
      color: 0xcba152,
      roughness: 0.26,
      metalness: 0.88
    }),
    matteBlackMetal: new THREE.MeshStandardMaterial({
      color: 0x1d1e20,
      roughness: 0.38,
      metalness: 0.65
    }),
    brushedSteel: new THREE.MeshStandardMaterial({
      color: 0x878b90,
      roughness: 0.32,
      metalness: 0.78
    }),
    fridgeGrey: new THREE.MeshStandardMaterial({
      color: 0x6e7275,
      roughness: 0.34,
      metalness: 0.55
    }),
    whiteCeramic: new THREE.MeshStandardMaterial({
      color: 0xfafaf8,
      roughness: 0.18,
      metalness: 0.04
    }),
    mirrorGlass: new THREE.MeshStandardMaterial({
      color: 0xd8dfe3,
      roughness: 0.04,
      metalness: 0.94
    }),
    rattanWicker: new THREE.MeshStandardMaterial({
      color: 0xc2935b,
      roughness: 0.76,
      metalness: 0.02
    }),
    fanWhite: new THREE.MeshStandardMaterial({
      color: 0xf4f4f2,
      roughness: 0.32,
      metalness: 0.12
    }),
    ledStrip: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfff5e4,
      emissiveIntensity: 2.2,
      roughness: 0.2
    }),
    ledCoveWarm: new THREE.MeshStandardMaterial({
      color: 0xfff0d4,
      emissive: 0xffd79b,
      emissiveIntensity: 2.0,
      roughness: 0.3
    }),
    tvScreen: new THREE.MeshStandardMaterial({
      map: tex.tvScreen,
      emissiveMap: tex.tvScreen,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.14
    }),
    poojaMural: new THREE.MeshStandardMaterial({
      map: tex.poojaMural,
      emissiveMap: tex.poojaMural,
      emissive: 0xffffff,
      emissiveIntensity: 0.22,
      roughness: 0.6
    }),
    citrusArt: new THREE.MeshStandardMaterial({
      map: tex.citrusArt,
      roughness: 0.62
    }),
    sofaArt: new THREE.MeshStandardMaterial({
      map: tex.sofaArt,
      roughness: 0.52
    }),
    circleArts: tex.circleArts.map(
      (map) => new THREE.MeshStandardMaterial({ map, roughness: 0.55 })
    ),
    foliageBackdrop: new THREE.MeshStandardMaterial({
      map: tex.foliage,
      emissiveMap: tex.foliage,
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.9
    })
  };
}
