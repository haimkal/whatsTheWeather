import { createAsyncThunk } from "@reduxjs/toolkit";
import { ACTION_ADD_FAVORITE_CITY, ACTION_GET_CURRENT_WEATHER, ACTION_GET_FAVORITE_WEATHER } from "./Actions"
import Cache from "../Cache"

const citiesCache = new Cache(24)
const weatherCache = new Cache(6)
const forcastCache = new Cache(12)

const api = {
    key: "WeVUl2QFRQElk6hje5DWfLTry9TPbg9G",
    base: "http://dataservice.accuweather.com",
}

const getCity = async (input) => {
    const url = `${api.base}/locations/v1/cities/autocomplete?apikey=${api.key}&q=${input}`
    let cityResult = citiesCache.getCache(`City_${input}`)

    if (!cityResult) {
        try {
            cityResult = await fetch(url)
            cityResult = await cityResult.json()
        } catch (e) {
            throw e
        }
        citiesCache.setCache(`City_${input}`, cityResult[0])
        cityResult = cityResult[0]
    }
    return cityResult
}

const getWeather = async (cityKey, input) => {
    const url = `${api.base}/currentconditions/v1/${cityKey}?apikey=${api.key}&details=true`
    let weatherResult = weatherCache.getCache(`Weather_${input}`)
    if (!weatherResult) {
        try {
            weatherResult = await fetch(url)
            weatherResult = await weatherResult.json()
        } catch (e) {
            throw e
        }
        if (weatherResult && weatherResult[0]) {
            weatherResult = {
                WeatherText: weatherResult[0].WeatherText,
                Temperature: weatherResult[0].Temperature,
            }

        }
        weatherCache.setCache(`Weather_${input}`, weatherResult)
    }
    return weatherResult
}

const getForecast = async (cityKey, input, unit) => {
    const url = `${api.base}/forecasts/v1/daily/5day/${cityKey}?apikey=${api.key}&metric=${unit === "Metric"}`
    let forecast = forcastCache.getCache(`Forecast_${input}_${unit}`)
    if (!forecast) {
        try {
            forecast = await fetch(url)
            forecast = await forecast.json()
        } catch (e) {
            throw e
        }
        if (forecast) {
            forecast = forecast.DailyForecasts.map(daily => ({
                day: daily.Date,
                maxTemp: daily.Temperature.Maximum.Value,
                minTemp: daily.Temperature.Minimum.Value,
                description: daily.Day.IconPhrase
            }))
        }
        forcastCache.setCache(`Forecast_${input}_${unit}`, forecast)
    }
    return forecast
}

export const getCurrentWeather = createAsyncThunk(
    ACTION_GET_CURRENT_WEATHER.type,
    async ({ input, unit }, { rejectWithValue }) => {
        try {
            let weatherResult
            let forecastResult
            let cityResult = await getCity(input)

            if (cityResult) {
                weatherResult = await getWeather(cityResult.Key, input)
            }
            if (cityResult) {
                forecastResult = await getForecast(cityResult.Key, input, unit)
            }
            return {
                city: cityResult,
                weather: weatherResult,
                forecast: forecastResult,
            }
        }
        catch (e) {
            return rejectWithValue(e.message)
        }
    }
)
export const addFavoriteCity = createAsyncThunk(
    ACTION_ADD_FAVORITE_CITY.type,
    async (input) => input
)
export const getFavoritesWeather = createAsyncThunk(
    ACTION_GET_FAVORITE_WEATHER.type,
    async (_, { rejectWithValue, getState }) => {
        const arrOfCityNames = (({ favoriteList }) => favoriteList)(getState())
        const results = []
        try {
            arrOfCityNames.forEach(async (input) => {
                let weatherResult
                let cityResult = await getCity(input)

                if (cityResult) {
                    weatherResult = await getWeather(cityResult.Key, input)
                }
                results.push({
                    city: cityResult,
                    weather: weatherResult,
                })
            })
            return results
        }
        catch (e) {
            return rejectWithValue(e.message)
        }
    }
)