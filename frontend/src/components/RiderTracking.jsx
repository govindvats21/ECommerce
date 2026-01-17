import React, { useEffect } from 'react';
import home from "../assets/home.png";
import scooter from "../assets/scooter.png";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

const boyIcon = new L.Icon({ iconUrl: scooter, iconSize: [40, 40], iconAnchor: [20, 40] });
const custIcon = new L.Icon({ iconUrl: home, iconSize: [40, 40], iconAnchor: [20, 40] });

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => { if (center[0]) map.setView(center, 15); }, [center]);
    return null;
}

const RiderTracking = ({ data }) => {
    const boyLat = data?.shop?.location?.coordinates[1] || 28.61;
    const boyLon = data?.shop?.location?.coordinates[0] || 77.20;
    const custLat = data?.deliveryAddress?.latitude;
    const custLon = data?.deliveryAddress?.longitude;

    if (!custLat) return <div className="h-full w-full bg-gray-50 flex items-center justify-center">Map Loading...</div>;

    const boyPos = [boyLat, boyLon];
    const custPos = [custLat, custLon];

    return (
        <MapContainer center={custPos} zoom={15} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <RecenterMap center={custPos} />
            <Marker position={boyPos} icon={boyIcon} />
            <Marker position={custPos} icon={custIcon} />
            <Polyline positions={[boyPos, custPos]} color='#ff4d2d' weight={4} dashArray="5, 10" />
        </MapContainer>
    );
};

export default RiderTracking;