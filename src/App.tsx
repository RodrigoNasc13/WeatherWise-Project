import { ChevronDown, Cloud } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/select'
import { universalAPI, weatherAPI } from './config/api'
import type { Country } from './models/countries'
import type { State } from './models/states'
import type { City } from './models/cities'

export function App() {
  const [weatherData, setWeatherData] = useState(null)
  const [locationQuery, setLocationQuery] = useState('')
  const [countries, setCountries] = useState<Country[] | null>(null)
  const [states, setStates] = useState<State[] | null>(null)
  const [cities, setCities] = useState<City[] | null>(null)

  const getStates = useCallback(async (country: string) => {
    await universalAPI.get<State[]>(`states/${country}`).then(response => {
      setStates(response.data)
    })
  }, [])

  const getCities = useCallback(async (state: string) => {
    await universalAPI.get<City[]>(`cities/${state}`).then(response => {
      setCities(response.data)
    })
  }, [])

  useEffect(() => {
    weatherAPI
      .get('current', {
        params: {
          query: locationQuery,
        },
      })
      .then(response => setWeatherData(response.data))
      .catch(error => console.log(error))
  }, [locationQuery])

  useEffect(() => {
    universalAPI
      .get<Country[]>('countries')
      .then(response => setCountries(response.data))
      .catch(error => console.log(error))
  }, [])

  if (!countries) {
    return
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg border p-6 shadow">
        <div className="flex gap-8">
          <div>
            <p className="font-bold text-3xl">Weather Dashboard</p>
            <p className="text-sm text-zinc-500">Tuesday, October 29, 2024</p>
          </div>
          <div className="flex gap-4">
            <Select onValueChange={value => getStates(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>

              <SelectContent>
                {countries.map(country => (
                  <SelectItem
                    key={country.country_short_name}
                    value={country.country_name}
                  >
                    {country.country_short_name} - {country.country_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={value => getCities(value)}
              disabled={!states}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a State" />
              </SelectTrigger>

              <SelectContent>
                {states?.map(state => (
                  <SelectItem key={state.state_name} value={state.state_name}>
                    {state.state_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select disabled={!cities}>
              <SelectTrigger>
                <SelectValue placeholder="Select a City" />
              </SelectTrigger>

              <SelectContent>
                {cities?.map(town => (
                  <SelectItem key={town.city_name} value={town.city_name}>
                    {town.city_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="text-zinc-500" />
            <span className="font-bold text-4xl">62°F</span>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-bold text-xl">Cloudy</p>
            <p className="text-sm text-zinc-500">Humidity: 70%</p>
            <p className="text-sm text-zinc-500">Wind: 12 mph</p>
          </div>
        </div>
      </div>
    </div>
  )
}
