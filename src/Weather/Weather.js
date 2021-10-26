import React, { useEffect, useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { addFavoriteCity, getCurrentWeather } from '../redux/AsyncThunk'
import { dateBuilder } from './assets/helpers/dateFunctions';
import WeatherCard from './WeatherCard/WeatherCard';
import { UnitContext } from '../unit-context';
import { InputContext } from '../input-context';
import './Weather.scss'
import Favorties from '../Favorites/Favorties';
import systemConfig from '../SystemConfig'

export default function Weather() {
    const dispatch = useDispatch()
    const { unit, setUnit } = useContext(UnitContext)
    const { input, setInput } = useContext(InputContext)
    const currentWeather = useSelector(({ currentWeather }) => currentWeather)
    const favoriteList = useSelector(({ favoriteList }) => favoriteList)
    const currentCity = useSelector(({ currentCity }) => currentCity)
    const currentForecast = useSelector(({ currentForecast }) => currentForecast)
    const favorites = useSelector(({ favorites }) => favorites)
    const error = useSelector(({ error }) => error)
    const getWeather = async (args) => {
        dispatch(getCurrentWeather(args))
    }


    const changeUnit = (e) => {
        if (unit === 'Imperial') {
            setUnit('Metric')
        } else {
            setUnit('Imperial')
        }
        console.log(unit);
    }

    const onSearchKeyDown = (e) => {
        if (e.key !== "Enter") return
        setInput(e.target.value)
    }

    const addToFavorites = (cityName) => () =>
        dispatch(addFavoriteCity(cityName))

    useEffect(() => {
        getWeather({ unit, input })
    }, [unit, input])
    return (
        <div className="weather-container">
            <div className={(currentWeather) ? ((currentWeather.Temperature.Metric.Value > 16) ? "weather-container warm" : "weather-container") : "weather-container"}>
                <main>
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-bar"
                            placeholder="Search..."
                            onKeyDown={onSearchKeyDown} />
                    </div>
                    {error ? <span style={{ "color": "red" }}>{error}</span> : null}
                    {!currentWeather ? <span style={{ "color": "red" }}>Type again!</span> : null}
                    {(currentWeather) ? (
                        <div className="location-weather-time-container">
                            <div className="location-box">
                                <div className="location">{currentCity.LocalizedName}, {currentCity.Country.LocalizedName}</div>
                            </div>
                            <div className="date-box">
                                <div className="date">{dateBuilder(new Date())}</div>
                            </div>
                            <div className="weather-box">
                                <div className="temp">
                                    {Math.round(currentWeather.Temperature[systemConfig[unit].fieldName].Value)}{systemConfig[unit].symbol}
                                </div>
                                <div className="description">
                                    {currentWeather.WeatherText}
                                </div>
                                <div className="changeUnit" onClick={changeUnit}> Change unit </div>
                            </div>
                            {(currentWeather) && <button onClick={addToFavorites(currentCity.LocalizedName)}> Add to Favorites! </button>}
                            {favoriteList.includes(currentCity.LocalizedName) && <div> this city exists </div>}
                            <div className="weatherCard-container">
                                <div className="row justify-content-center">
                                    {(currentWeather) ? currentForecast.map((daily, index) => (
                                        <WeatherCard key={index} symbol={systemConfig[unit].symbol} day={daily.day} maxTemp={daily.maxTemp} minTemp={daily.minTemp} description={daily.description} />))
                                        : null}
                                </div>
                                {/* <div className="row justify-content-center">
                                    {(currentWeather) ? favoriteList.map((item, index) => (
                                        <Favorites key={index} symbol={systemConfig[unit].symbol} name={favoriteList.name} />))
                                        : null}
                                </div> */}
                            </div>
                        </div>
                    ) : null}
                </main>
            </div>
        </div>
    )

}
