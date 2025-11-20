import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Activity = {
  name: string;
  location: string;
  coords?: { lat: number; lon: number } | null;
};

type MapProps = {
  location: string;
  coords: { lat: number; lon: number };
  zoom?: number;
  activities?: Activity[];
  description?: string;
};

export const HousingMap = ({ location, coords, zoom = 11, activities = [], description }: MapProps) => {

  if (!coords) {
    return (
      <div className="h-72 w-full flex items-center justify-center text-gray-500">
        🗺 Loading map...
      </div>
    );
  }
  
  const centerPosition: [number, number] = [coords.lat, coords.lon];

  return (
    <div className="h-100 w-full rounded-4xl overflow-hidden shadow-md">
      <MapContainer center={centerPosition} zoom={zoom} className="h-full w-full rounded-lg shadow-md">
        
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* MAIN MARKER */}
        <Marker position={centerPosition}>
          <Popup>
            <strong>{location}</strong>
            {description && <p className="text-sm text-gray-700">{description}</p>}
          </Popup>
        </Marker>

        {/* ACTIVITY MARKERS */}
        {activities
          .filter(a => a.coords) // only if backend geocoded it
          .map((act, i) => (
            <Marker key={i} position={[act.coords!.lat, act.coords!.lon]}>
              <Popup>
                <strong>{act.name}</strong>
                <p className="text-sm text-gray-700">{act.location}</p>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
    </div>
  );
};
