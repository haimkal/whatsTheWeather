import React, { useContext } from 'react'
import systemConfig from '../../SystemConfig';
import { UnitContext } from '../../unit-context';
import './FavoriteCard.scss'

export default function FavoriteCard(
    { city, country, temperature, description }
) {
    const { unit } = useContext(UnitContext)

    return (
        <div className="col-12 col-lg-3">
            <div className="favoriteCard">
                <div className="favoriteCard__location-box">
                    <div className="favoriteCard__location-box__location">{city}, {country}</div>
                </div>
                <div className="favoriteCard__weather-box">
                    <div className="favoriteCard__weather-box__temp">
                        {Math.round(temperature)}{systemConfig[unit].symbol}
                    </div>
                    <div className="favoriteCard__weather-box__description">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    )
}
