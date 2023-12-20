﻿export type Ability = {
  name: string
  spellId: number
  alwaysOn?: boolean
  dr?: number
  avoidance?: number
  staminaIncrease?: number
  healthIncrease?: number
  absorb?: number
  iconName: string
  wowheadLink: string
  notes?: string
}