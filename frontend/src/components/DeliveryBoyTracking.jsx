import React, { useEffect } from 'react';
import home from "../assets/home.png";
import scooter from "../assets/scooter.png";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [45, 45],
    iconAnchor: [22, 45]
});

const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [45, 45],
    iconAnchor: [22, 45]
});

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center[0] && center[1]) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const DeliveryBoyTracking = ({ data }) => {
    const boyLat = data?.deliveryBoyLocation?.lat;
    const boyLon = data?.deliveryBoyLocation?.lon;
    const custLat = data?.customerLocation?.lat;
    const custLon = data?.customerLocation?.lon;

    if (!boyLat || !custLat) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed">
                <p className="text-gray-400 font-bold">FETCHING LIVE LOCATION...</p>
            </div>
        );
    }

    const deliveryBoyPos = [boyLat, boyLon];
    const customerPos = [custLat, custLon];
    const path = [deliveryBoyPos, customerPos];

    return (
        <div className='w-full h-[350px] mt-3 rounded-2xl overflow-hidden shadow-inner border-2 border-orange-500 relative z-0'>
            <MapContainer 
                className='w-full h-full' 
                center={deliveryBoyPos} 
                zoom={15} 
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />
                <RecenterMap center={deliveryBoyPos} />
                <Marker position={deliveryBoyPos} icon={deliveryBoyIcon} />
                <Marker position={customerPos} icon={customerIcon} />
                <Polyline positions={path} color='#f97316' weight={5} dashArray="10, 15" opacity={0.7} />
            </MapContainer>
        </div>
    );
};

export default DeliveryBoyTracking;