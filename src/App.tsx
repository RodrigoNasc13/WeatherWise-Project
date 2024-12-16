import { Cloud, CloudRain, LoaderCircle, Sun } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/select'
import { weatherAPI, cscAPI } from './config/api'
import type { CountryCSC } from './models/countries'
import type { StateCSC } from './models/states'
import type { CityCSC } from './models/cities'
import type { WeatherData } from './models/weather'
import type { WeatherCondition } from './models/weather_condition'
import { Card, CardContent, CardHeader } from './components/card'
import { Skeleton } from './components/skeleton'

export function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [countries, setCountries] = useState<CountryCSC[] | null>(null)
  const [states, setStates] = useState<StateCSC[] | null>(null)
  const [cities, setCities] = useState<CityCSC[] | null>(null)
  const [country, setCountry] = useState('')

  const weatherIconMap: Record<WeatherCondition, JSX.Element> = {
    'heavy rain': <CloudRain className="h-6 w-6 text-blue-400" />,
    'light rain': <CloudRain className="h-6 w-6 text-blue-300" />,
    cloudy: <Cloud className="h-6 w-6 text-gray-600" />,
    'partly cloudy': <Cloud className="h-6 w-6 text-gray-400" />,
    sunny: <Sun className="h-6 w-6 text-yellow-400" />,
    undefined: <div />,
  }

  const determineCondition = useCallback(
    (
      values: WeatherData['timelines']['daily'][0]['values']
    ): WeatherCondition => {
      const {
        cloudCoverAvg,
        precipitationProbabilityAvg,
        rainIntensityAvg,
        temperatureAvg,
      } = values

      if (precipitationProbabilityAvg > 50) {
        return rainIntensityAvg > 2 ? 'heavy rain' : 'light rain'
      }
      if (cloudCoverAvg > 70) {
        return 'cloudy'
      }
      if (cloudCoverAvg > 30) {
        return 'partly cloudy'
      }
      if (temperatureAvg > 25) {
        return 'sunny'
      }

      return 'undefined'
    },
    []
  )

  const getWeatherIcon = useCallback(
    (values: WeatherData['timelines']['daily'][0]['values']) => {
      const condition = determineCondition(values)
      return weatherIconMap[condition]
    },
    [determineCondition]
  )

  const getStates = useCallback(async (country: string) => {
    setStates(null)
    setCities(null)
    await cscAPI
      .get<StateCSC[]>(`countries/${country}/states`)
      .then(response => {
        setStates(response.data)
        setCountry(country)
      })
  }, [])

  const getCities = useCallback(
    async (state: string) => {
      setCities(null)
      await cscAPI
        .get<CityCSC[]>(`countries/${country}/states/${state}/cities`)
        .then(response => {
          setCities(response.data)
        })
    },
    [country]
  )

  const getWeather = useCallback(async (location: string) => {
    setIsLoading(true)
    setWeatherData(null)

    await new Promise(resolve => setTimeout(resolve, 500))

    await weatherAPI
      .get<WeatherData>('forecast', {
        params: {
          timesteps: 'daily',
          location: location,
          apikey: import.meta.env.VITE_TOMORROWIO_API_KEY,
        },
      })
      .then(response => {
        setWeatherData(response.data)
      })
      .catch(error => console.log(error))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    cscAPI
      .get<CountryCSC[]>('countries')
      .then(response => {
        setCountries(response.data)
      })
      .catch(error => console.log(error))
  }, [])

  if (!countries) {
    return
  }

  return (
    <div className="flex h-screen flex-col justify-center gap-8">
      <Card className="mx-auto">
        <CardHeader>
          <div className="flex items-center gap-6">
            <CardTitle>
              <p>Weather Dashboard</p>
            </CardTitle>

            <Select onValueChange={value => getStates(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>

              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.iso2}>
                    {country.iso2} - {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={value => {
                getCities(value)
              }}
              disabled={!states}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a State" />
              </SelectTrigger>

              <SelectContent>
                {states?.map(state => (
                  <SelectItem key={state.id} value={state.iso2}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={value => setLocationQuery(value)}
              disabled={!cities}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a City" />
              </SelectTrigger>

              <SelectContent>
                {cities?.map(town => (
                  <SelectItem key={town.id} value={town.name}>
                    {town.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <CardDescription>Tuesday, October 29, 2024</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="mx-auto flex w-[32rem] flex-col gap-4">
        <span className="text-center font-bold text-2xl">5-Day Forecast</span>

        <div className="flex justify-between">
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Mon</p>
                <Sun className="text-yellow-400" />
                <p>75°F</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Mon</p>
                <Sun className="text-yellow-400" />
                <p>75°F</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Mon</p>
                <Sun className="text-yellow-400" />
                <p>75°F</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Mon</p>
                <Sun className="text-yellow-400" />
                <p>75°F</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="flex flex-col items-center gap-1">
                <p className="font-semibold">Mon</p>
                <Sun className="text-yellow-400" />
                <p>75°F</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
