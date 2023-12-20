﻿import { CharacterStats } from '../backend/characterStats'
import { Result, simulate } from '../backend/sim'
import { NumericInput } from './NumericInput'
import { Toggle } from './Toggle'
import { CharacterStatsForm } from './CharacterStatsForm'
import { Dropdown } from './Dropdown'
import { classAbilities, classes, WowClass } from '../backend/classes'
import { AbilitySelect } from './AbilitySelect'
import { Results } from './Results'
import { useEffect, useState } from 'react'
import { Ability } from '../backend/ability'
import { groupAbilities } from '../backend/groupAbilities'
import { BossAbilities } from './BossAbilities'

const defaultCharacterStats: CharacterStats = {
  stamina: 40_000,
  versatilityDrPercent: 5,
  avoidancePercent: 0,
}

export function Simulator() {
  const [characterStats, setCharacterStats] = useState(defaultCharacterStats)
  const [wowClass, setClass] = useState<WowClass | null>('Monk (Mistweaver)')
  const [selectedClassAbilities, setSelectedClassAbilities] = useState<
    Ability[]
  >([])
  const [selectedGroupAbilities, setSelectedGroupAbilities] = useState<
    Ability[]
  >([])

  const [baseDamage, setBaseDamage] = useState(100_000)
  const [keyLevel, setKeyLevel] = useState(25)
  const [isAoe, setIsAoe] = useState(false)
  const [fortAmp, setFortAmp] = useState(false)
  const [tyranAmp, setTyranAmp] = useState(true)

  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    setSelectedClassAbilities(
      wowClass
        ? classAbilities[wowClass].filter(({ alwaysOn }) => alwaysOn)
        : []
    )
  }, [wowClass])

  useEffect(() => {
    const newResult = simulate({
      characterStats,
      abilities: [...selectedClassAbilities, ...selectedGroupAbilities],
      baseDamage,
      keyLevel,
      isAoe,
      fortAmp,
      tyranAmp,
    })
    setResult(newResult)
  }, [
    characterStats,
    baseDamage,
    keyLevel,
    isAoe,
    fortAmp,
    tyranAmp,
    selectedClassAbilities,
    selectedGroupAbilities,
  ])

  return (
    <div className="flex gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 flex-wrap">
          <NumericInput
            label="Base Damage taken"
            onChange={setBaseDamage}
            value={baseDamage}
          />
          <NumericInput
            label="Key Level"
            max={30}
            min={2}
            onChange={setKeyLevel}
            value={keyLevel}
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {/*<Toggle*/}
          {/*  label="Fort amplifier"*/}
          {/*  checked={fortAmp}*/}
          {/*  onChange={setFortAmp}*/}
          {/*/>*/}
          <Toggle label="AoE damage" checked={isAoe} onChange={setIsAoe} />
          <Toggle
            label="Tyran amplifier"
            checked={tyranAmp}
            onChange={setTyranAmp}
          />
        </div>

        <div className="border-2 my-2" />

        <CharacterStatsForm
          characterStats={characterStats}
          onChange={setCharacterStats}
        />

        <div className="flex gap-4 items-center">
          <Dropdown
            options={classes}
            label="Class"
            onChange={(value) => setClass(value as WowClass)}
            value={wowClass}
          />

          {wowClass && (
            <AbilitySelect
              allAbilities={classAbilities[wowClass]}
              selectedAbilities={selectedClassAbilities}
              setSelectedAbilities={setSelectedClassAbilities}
            />
          )}
        </div>

        <div className="flex gap-4 items-center">
          <div className="text-white bg-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-teal-600">
            Other buffs
          </div>
          <AbilitySelect
            allAbilities={groupAbilities}
            selectedAbilities={selectedGroupAbilities}
            setSelectedAbilities={setSelectedGroupAbilities}
          />
        </div>

        <div className="border-2 my-2" />

        <BossAbilities
          onSelect={(ability) => {
            setIsAoe(ability.isAoe)
            setBaseDamage(ability.damage)
          }}
        />
      </div>

      <Results result={result} />
    </div>
  )
}