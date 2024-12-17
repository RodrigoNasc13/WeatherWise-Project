import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudSun,
  LoaderCircle,
  Sun,
  ThermometerSnowflake,
} from 'lucide-react'
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
import { toast, Toaster } from 'sonner'

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
    snowy: <CloudSnow className="h-6 w-6 text-blue-200" />,
    freezing: <ThermometerSnowflake className="h-6 w-6 text-blue-500" />,
    '': <CloudSun className="h-6 w-6 text-gray-400" />,
  }

  const determineCondition = useCallback(
    (
      values?: WeatherData['timelines']['daily'][0]['values']
    ): WeatherCondition => {
      if (!values) return ''

      const {
        cloudCoverAvg,
        precipitationProbabilityAvg,
        rainIntensityAvg,
        temperatureAvg,
        snowAccumulationAvg,
      } = values

      if (temperatureAvg <= 0 || snowAccumulationAvg > 0) {
        return 'snowy'
      }
      if (temperatureAvg <= 10) {
        return 'freezing'
      }
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

      return ''
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
    setWeatherData(null)
    setStates(null)
    setCities(null)
    await cscAPI
      .get<StateCSC[]>(`countries/${country}/states`)
      .then(response => {
        if (response.data.length > 0) {
        setStates(response.data)
        setCountry(country)
          return
        }
        toast.warning('Unable to load these states')
      })
      .catch(() => toast.error('Unable to get states'))
  }, [])

  const getCities = useCallback(
    async (state: string) => {
      setWeatherData(null)
      setCities(null)
      await cscAPI
        .get<CityCSC[]>(`countries/${country}/states/${state}/cities`)
        .then(response => {
          if (response.data.length > 1) {
          setCities(response.data)
            return
          }

          toast.warning('Unable to load these cities')
        })
        .catch(() => toast.error('Unable to get cities'))
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
      .catch(() =>
        toast.error('Unable to capture the weather of this location')
      )
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    cscAPI
      .get<CountryCSC[]>('countries')
      .then(response => {
        setCountries(response.data)
      })
      .catch(() => toast.error('Unable to get countries'))
  }, [])

  if (!countries) {
    return
  }

  const completeDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentWeather = weatherData?.timelines.daily[0].values

  const isLocationFilled = getWeather !== null

  return (
    <div className="flex flex-col justify-center gap-8 px-10 py-4 xl:h-screen xl:px-60 2xl:px-96">
      <div className="text-center xl:flex xl:items-center xl:justify-between">
        <h1 className="font-bold text-3xl">Weather Dashboard</h1>
        <span>Please select a place</span>
      </div>
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center justify-between gap-6 xl:flex-row">
          <div className="flex w-full flex-col items-center gap-6 *:w-full xl:flex-row 2xl:*:w-auto">
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
              onValueChange={value => {
                getWeather(value)
              }}
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

          <p className="xl:text-nowrap">{completeDate}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 sm:flex-row xl:justify-between">
            <div className="flex items-center gap-2">
              {currentWeather && getWeatherIcon(currentWeather)}
              <div>
                {isLoading && <LoaderCircle className="size-4 animate-spin" />}
                {currentWeather && !isLoading && (
                  <span className="font-bold text-4xl">
                    {Math.trunc(currentWeather.temperatureAvg)}ºC
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col text-center xl:items-end">
              <p className="font-bold text-xl">
                {currentWeather
                  ? determineCondition(currentWeather)
                  : isLoading && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
              </p>
              {currentWeather && (
                <>
                  <div className="text-sm text-zinc-500">
                    Humidity:
                    <span> {Math.trunc(currentWeather.humidityAvg)}%</span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    Wind: {currentWeather?.windSpeedAvg} mph
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto flex flex-col gap-6">
        {isLocationFilled && (
          <span className="text-center font-bold text-2xl">5-Day Forecast</span>
        )}
        <div className="flex flex-wrap justify-center gap-4 2xl:gap-12">
          {weatherData?.timelines.daily.slice(1).map(({ values, time }) => {
            const cardDate = new Date(time).toLocaleDateString('pt-BR', {
              weekday: 'short',
            })
            return (
              <Card key={time}>
                <CardContent>
                  <div className="flex flex-col items-center gap-1">
                    <p className="font-semibold">{cardDate}</p>
                    {getWeatherIcon(values)}
                    <p>{Math.trunc(values.temperatureAvg)}ºC</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {isLoading && (
            <div className="flex flex-wrap justify-center gap-4 2xl:gap-12">
              <Skeleton className="h-28 w-20" />
              <Skeleton className="h-28 w-20" />
              <Skeleton className="h-28 w-20" />
              <Skeleton className="h-28 w-20" />
              <Skeleton className="h-28 w-20" />
            </div>
          )}
        </div>
      </div>

      <Toaster position="top-right" expand richColors />
    </div>
  )
}
