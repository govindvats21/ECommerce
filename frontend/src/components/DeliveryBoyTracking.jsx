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
            map.setView(center, 15);
        }
    }, [center, map]);
    return null;
}

const DeliveryBoyTracking = ({ data }) => {
    // Live Location (from socket)
    const boyLat = data?.deliveryBoyLocation?.lat;
    const boyLon = data?.deliveryBoyLocation?.lon;
    
    // Static Order Location (from deliveryAddress object)
    const custLat = data?.deliveryAddress?.latitude;
    const custLon = data?.deliveryAddress?.longitude;

    const mapCenter = [boyLat || custLat || 28.6139, boyLon || custLon || 77.2090];

    if (!custLat || !custLon) {
        return (
            <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Waiting for Coordinates...</p>
            </div>
        );
    }

    return (
        <div className='w-full h-[350px] mt-3 rounded-2xl overflow-hidden shadow-inner border-2 border-orange-500 relative z-0'>
            <MapContainer className='w-full h-full' center={mapCenter} zoom={15} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap center={mapCenter} />

                {boyLat && <Marker position={[boyLat, boyLon]} icon={deliveryBoyIcon} />}
                <Marker position={[custLat, custLon]} icon={customerIcon} />

                {boyLat && (
                    <Polyline positions={[[boyLat, boyLon], [custLat, custLon]]} color='#f97316' weight={5} dashArray="10, 15" opacity={0.7} />
                )}
            </MapContainer>
        </div>
    );
};

export default DeliveryBoyTracking;