﻿import { Ability } from '../ability'

export const tepidVersatility: Ability = {
  name: 'Phial of Tepid Versatility',
  spellId: 371172,
  versRawIncrease: 745,
  iconName: 'inv_10_alchemy_bottle_shape2_black',
  notes: '3.63% vers = 1.82% DR when below 30% vers',
}

export const icyPreservation: Ability = {
  name: 'Phial of Icy Preservation',
  spellId: 191326,
  dr: 0.06,
  iconName: 'inv_10_alchemy_bottle_shape2_blue',
  wowheadLink: 'https://www.wowhead.com/item=191326/phial-of-icy-preservation',
}

export const blessingOfSacrifice: Ability = {
  name: 'Blessing of Sacrifice',
  spellId: 6940,
  dr: 0.3,
  associatedClass: 'Paladin',
  iconName: 'spell_holy_sealofsacrifice',
  wowheadLink: 'https://www.wowhead.com/spell=6940/blessing-of-sacrifice',
  notes: 'Wrong for holy paladin where it is actually 32%',
}

export const ironBark: Ability = {
  name: 'Ironbark',
  spellId: 102342,
  dr: 0.2,
  associatedSpec: { class: 'Druid', spec: 'Restoration' },
  iconName: 'spell_druid_ironbark',
  wowheadLink: 'https://www.wowhead.com/spell=102342/ironbark',
}

export const painSuppression: Ability = {
  name: 'Pain Suppression',
  spellId: 33206,
  dr: 0.4,
  associatedSpec: { class: 'Priest', spec: 'Discipline' },
  iconName: 'spell_holy_painsupression',
  wowheadLink: 'https://www.wowhead.com/spell=33206/pain-suppression',
}

export const lifeCocoon: Ability = {
  name: 'Life Cocoon',
  spellId: 116849,
  associatedSpec: { class: 'Monk', spec: 'Mistweaver' },
  absorbHealthMultiplier: 0.8,
  absorbVersAffected: true,
  absorbBackup: 900_000,
  iconName: 'ability_monk_chicocoon',
  notes: 'Assumes 900K absorb if you have no mistweaver selected',
}

export const twinGuardian: Ability = {
  name: 'Twin Guardian (Rescue)',
  associatedClass: 'Evoker',
  absorbHealthMultiplier: 0.3,
  absorbVersAffected: true,
  absorbBackup: 300_000,
  spellId: 370888,
  iconName: 'ability_skyreach_shielded',
  notes: 'Assumes 300K absorb if you have no evoker selected',
}

export const leafOfTheAncientProtectors: Ability = {
  name: 'Leaf of the Ancient Protectors',
  rawAbsorb: 348_500,
  absorbVersAffected: true,
  spellId: 110009,
  iconName: 'inv_misc_plant_01',
  notes: 'Assumes ilvl 483, Hero 6/6',
}

export const fyrakksTaintedRageheart: Ability = {
  name: "Fyrakk's Tainted Rageheart",
  rawAbsorb: 922_410,
  absorbVersAffected: true,
  spellId: 422750,
  iconName: 'inv_ragnaros_heart_shadowflame',
  notes: 'Assumes ilvl 489, Myth 4/4',
}

export const ancestralVigor: Ability = {
  name: 'Ancestral Vigor',
  healthIncrease: 0.1,
  spellId: 207401,
  associatedSpec: { class: 'Shaman', spec: 'Restoration' },
  iconName: 'spell_shaman_blessingoftheeternals',
}

export const earthenHarmony: Ability = {
  name: 'Earthen Harmony',
  dr: 0.06,
  spellId: 382020,
  associatedSpec: { class: 'Shaman', spec: 'Restoration' },
  iconName: 'spell_shaman_improvedearthshield',
}

export const externals: Ability[] = [
  tepidVersatility,
  icyPreservation,
  twinGuardian,
  ancestralVigor,
  earthenHarmony,
  ironBark,
  blessingOfSacrifice,
  painSuppression,
  lifeCocoon,
  leafOfTheAncientProtectors,
  fyrakksTaintedRageheart,
]
