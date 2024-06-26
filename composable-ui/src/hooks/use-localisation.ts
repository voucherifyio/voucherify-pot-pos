import {
  deleteFromStorage,
  useLocalStorage,
  writeStorage,
} from 'utils/local-storage'

const LOCAL_STORAGE_LOCALISATION = 'pos_localisation_id'

export const LOCALISATIONS = [
  'New York',
  'London',
  'Paris',
  'Warsaw',
  'Vancouver',
  'Lima',
]

export const useLocalisation = () => {
  const [localisation] = useLocalStorage(
    LOCAL_STORAGE_LOCALISATION,
    LOCALISATIONS[0]
  )

  const updateLocalisation = (newLocalisation: string) => {
    if (!LOCALISATIONS.includes(newLocalisation)) {
      throw new Error(
        '[useLocalisation][updateLocalisation] newLocalisation not from acceptable range'
      )
    }
    writeStorage(LOCAL_STORAGE_LOCALISATION, newLocalisation)
  }

  return {
    updateLocalisation,
    localisation,
  }
}
