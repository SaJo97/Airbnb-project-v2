export async function geocode(location: string) {
  const query = encodeURIComponent(location);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=se&email=contact@example.com`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "MyHousingApp-Server/1.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status}`);
  }

  const data = await res.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}