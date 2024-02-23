import { Character, CharacterStatsInput } from './characters'
import { Ability } from './ability'
import { ClassSpec, equalSpecs } from './classes'
import { augmentAbilities, enemyAbilityToDetails } from './utils'
import { Dungeon, dungeonAbilities } from './dungeons'
import { willOfTheNecropolis } from './classAbilities/deathKnight'
import { dampenHarm } from './classAbilities/monk'
import { avoidanceRawToPercent, staminaToHp, versRawToPercent } from './stats'

export interface Result {
  main: AbilityResult
  dungeon: AbilityResult[]
}

export interface AbilityResult {
  damageScaling: number
  scaledDamage: number
  enemyAbilityDetails: EnemyAbilityDetails
  characters: CharacterResult[]
}

export interface CharacterStats {
  stamina: number
  versatility: number
  avoidance: number
}

export interface CharacterPartialResult {
  spec: ClassSpec
  adjustedStats: CharacterStats
  abilities: Ability[]
  startingHealth: number
}

export interface CharacterResult {
  spec: ClassSpec
  adjustedStats: CharacterStats
  abilities: Ability[]
  damageReduction: number
  mitigatedDamage: number
  actualDamageTaken: number
  startingHealth: number
  absorbs: number
  totalHealth: number
  healthRemaining: number
}

export interface KeyDetails {
  keyLevel: number
  isTyran: boolean
}

export interface EnemyAbilityDetails {
  name?: string
  damage: number
  isAoe: boolean
  isTrashAbility?: boolean
  isPhysical?: boolean
  isReducedByArmor?: boolean
}

interface Input {
  characters: Character[]
  groupAbilities: Ability[]
  customDrs: number[]
  customAbsorbs: number[]
  keyDetails: KeyDetails
  enemyAbilityDetails: EnemyAbilityDetails
  dungeon: Dungeon | null
}

function getScalingFactor({ keyLevel, isTyran }: KeyDetails, isTrashAbility: boolean) {
  let scalingFactor = 1
  for (let i = 3; i <= keyLevel; ++i) {
    scalingFactor *= i <= 10 ? 1.08 : 1.1
  }

  if (!isTyran && isTrashAbility) {
    scalingFactor *= 1.3
  } else if (isTyran && !isTrashAbility) {
    scalingFactor *= 1.15
  }

  return Math.round(scalingFactor * 100) / 100
}

function getAdjustedStats(characterStats: CharacterStatsInput, abilities: Ability[]) {
  let adjustedStats: CharacterStats = {
    stamina: characterStats.stamina ?? 0,
    versatility: 0,
    avoidance: avoidanceRawToPercent(characterStats.avoidanceRaw ?? 0) / 100,
  }

  for (const ability of abilities) {
    if (ability.staminaIncrease) {
      adjustedStats.stamina *= 1 + ability.staminaIncrease
    }
  }

  adjustedStats.stamina = Math.floor(adjustedStats.stamina)

  let rawVers = characterStats.versatilityRaw ?? 0
  for (const ability of abilities) {
    if (ability.versRawIncrease) {
      rawVers += ability.versRawIncrease
    }
  }

  adjustedStats.versatility = versRawToPercent(rawVers) / 100
  for (const ability of abilities) {
    if (ability.versIncrease) {
      adjustedStats.versatility += ability.versIncrease
    }
  }

  return adjustedStats
}

function getStartingHealth(characterStats: CharacterStats, abilities: Ability[]) {
  let startingHealth = staminaToHp(characterStats.stamina)

  for (const ability of abilities) {
    if (ability.healthIncrease) {
      startingHealth *= 1 + ability.healthIncrease
    }
  }

  return Math.round(startingHealth)
}

export function findAssociatedCharacter<T extends { spec: ClassSpec }>(
  ability: Ability,
  items: Array<T>
) {
  return items.find(
    ({ spec }) =>
      (ability.associatedClass && spec.class === ability.associatedClass) ||
      (ability.associatedSpec && equalSpecs(spec, ability.associatedSpec))
  )
}

export function calculateAbsorb(
  absorbHealthMultiplier: number,
  absorbVersAffected: boolean,
  health: number,
  versatility: number
) {
  const versMultiplier = absorbVersAffected ? versatility : 0
  return Math.round(absorbHealthMultiplier * health * (1 + versMultiplier))
}

export function getHealthMultiplierAbsorb(
  ability: Ability,
  characterStats: CharacterStats | null,
  startingHealth: number | null,
  charPartialResults: CharacterPartialResult[]
) {
  if (!ability.absorbHealthMultiplier) return 0

  if (ability.associatedClass || ability.associatedSpec) {
    const associatedCharacter = findAssociatedCharacter(ability, charPartialResults)
    if (associatedCharacter) {
      return calculateAbsorb(
        ability.absorbHealthMultiplier,
        !!ability.absorbVersAffected,
        associatedCharacter.startingHealth,
        associatedCharacter.adjustedStats.versatility
      )
    } else if (ability.absorbBackup) {
      return ability.absorbBackup
    }
  } else if (characterStats && startingHealth) {
    return calculateAbsorb(
      ability.absorbHealthMultiplier,
      !!ability.absorbVersAffected,
      startingHealth,
      characterStats.versatility
    )
  }

  return 0
}

function getAbsorbs(
  characterStats: CharacterStats,
  abilities: Ability[],
  customAbsorbs: number[],
  enemyAbilityDetails: EnemyAbilityDetails,
  startingHealth: number,
  charPartialResults: CharacterPartialResult[]
) {
  let absorbs = 0

  for (const ability of abilities) {
    if (
      (ability.absorbType === 'magic' && enemyAbilityDetails.isPhysical) ||
      (ability.absorbType === 'physical' && !enemyAbilityDetails.isPhysical)
    ) {
      continue
    }

    if (ability.rawAbsorb) {
      let absorb = ability.rawAbsorb
      if (ability.absorbVersAffected) absorb *= 1 + characterStats.versatility
      absorbs += absorb
    } else if (ability.absorbHealthMultiplier) {
      absorbs += getHealthMultiplierAbsorb(
        ability,
        characterStats,
        startingHealth,
        charPartialResults
      )
    }
  }

  absorbs += customAbsorbs.reduce((acc, val) => acc + val, 0)

  return Math.round(absorbs)
}

function getExtraAbsorbs(
  abilities: Ability[],
  startingHealth: number,
  absorbs: number,
  actualDamageTaken: number
) {
  let extraAbsorbs = 0

  for (const ability of abilities) {
    if (ability.spellId === willOfTheNecropolis.spellId) {
      const damageToReach30 = startingHealth + absorbs - startingHealth * 0.3
      const damageTakenBelow30 = actualDamageTaken - damageToReach30
      if (damageTakenBelow30 <= 0) continue

      extraAbsorbs += damageTakenBelow30 * 0.35
    }
  }

  return Math.round(extraAbsorbs)
}

function getDamageReduction(
  characterStats: CharacterStats,
  abilities: Ability[],
  customDrs: number[],
  enemyAbilityDetails: EnemyAbilityDetails,
  startingHealth: number,
  damageTaken: number
) {
  let inverseDr = 1 - characterStats.versatility / 2

  if (enemyAbilityDetails.isAoe) {
    inverseDr *= 1 - characterStats.avoidance
  }

  for (const ability of abilities) {
    let dr = ability.dr
    if (
      (ability.drType === 'magic' && enemyAbilityDetails.isPhysical) ||
      (ability.drType === 'physical' && !enemyAbilityDetails.isPhysical)
    ) {
      dr = 0
    }

    if (dr && ability.aoeDr && enemyAbilityDetails.isAoe) {
      inverseDr *= 1 - Math.max(dr, ability.aoeDr)
    } else if (dr) {
      inverseDr *= 1 - dr
    } else if (ability.aoeDr && enemyAbilityDetails.isAoe) {
      inverseDr *= 1 - ability.aoeDr
    } else if (ability.spellId === dampenHarm.spellId) {
      const dampenDr = 0.2 + (damageTaken / startingHealth) * 0.3
      inverseDr *= 1 - Math.min(dampenDr, 0.5)
    }
  }

  for (const dr of customDrs) {
    inverseDr *= 1 - dr * 0.01
  }

  return 1 - inverseDr
}

function getPartialResults(
  characters: Character[],
  groupAbilities: Ability[]
): CharacterPartialResult[] {
  const augmentedGroupAbilities = augmentAbilities(groupAbilities, groupAbilities)

  return characters.map<CharacterPartialResult>((character) => {
    const augmentedSelectedAbilities = augmentAbilities(
      character.abilities,
      character.abilities
    )

    const abilities = [
      ...augmentedSelectedAbilities,
      ...character.externals,
      ...augmentedGroupAbilities,
    ]

    const adjustedStats = getAdjustedStats(character.stats, abilities)
    const startingHealth = getStartingHealth(adjustedStats, abilities)

    return {
      spec: character.classSpec,
      abilities,
      adjustedStats,
      startingHealth,
    }
  })
}

function getAbilityResult(
  keyDetails: KeyDetails,
  charPartialResults: CharacterPartialResult[],
  enemyAbilityDetails: EnemyAbilityDetails,
  customAbsorbs: number[],
  customDrs: number[]
): AbilityResult {
  const damageScaling = getScalingFactor(keyDetails, !!enemyAbilityDetails.isTrashAbility)
  const scaledDamage = Math.round(enemyAbilityDetails.damage * damageScaling)

  return {
    enemyAbilityDetails,
    damageScaling,
    scaledDamage,
    characters: charPartialResults.map<CharacterResult>(
      ({ spec, startingHealth, adjustedStats, abilities }) => {
        const absorbs = getAbsorbs(
          adjustedStats,
          abilities,
          customAbsorbs,
          enemyAbilityDetails,
          startingHealth,
          charPartialResults
        )

        const damageReduction = getDamageReduction(
          adjustedStats,
          abilities,
          customDrs,
          enemyAbilityDetails,
          startingHealth,
          scaledDamage
        )

        const healthWithAbsorbs = startingHealth + absorbs
        const mitigatedDamage = Math.round(scaledDamage * damageReduction)
        const actualDamageTaken = Math.round(scaledDamage - mitigatedDamage)

        const extraAbsorbs = getExtraAbsorbs(
          abilities,
          startingHealth,
          absorbs,
          actualDamageTaken
        )
        const totalHealth = healthWithAbsorbs + extraAbsorbs

        const healthRemaining = totalHealth - actualDamageTaken

        return {
          spec,
          adjustedStats,
          abilities,
          damageReduction,
          mitigatedDamage,
          actualDamageTaken,
          startingHealth,
          absorbs: absorbs + extraAbsorbs,
          totalHealth,
          healthRemaining,
        }
      }
    ),
  }
}

export function simulate({
  characters,
  groupAbilities,
  customDrs,
  customAbsorbs,
  keyDetails,
  enemyAbilityDetails,
  dungeon,
}: Input): Result {
  const charPartialResults = getPartialResults(characters, groupAbilities)

  const mainResults = getAbilityResult(
    keyDetails,
    charPartialResults,
    enemyAbilityDetails,
    customAbsorbs,
    customDrs
  )

  const dungeonResults = dungeon
    ? dungeonAbilities[dungeon].map((enemyAbility) =>
        getAbilityResult(
          keyDetails,
          charPartialResults,
          enemyAbilityToDetails(enemyAbility),
          customAbsorbs,
          customDrs
        )
      )
    : []

  return {
    main: mainResults,
    dungeon: dungeonResults,
  }
}
