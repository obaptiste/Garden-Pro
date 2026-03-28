export async function getSatelliteImage(address: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set");
    return null;
  }

  try {
    // First, geocode the address to get lat/lng
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.status !== "OK" || !geoData.results[0]) {
      return null;
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // Now get the static satellite image
    const staticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=640x640&maptype=satellite&key=${apiKey}`;
    const imageRes = await fetch(staticUrl);
    const buffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error fetching satellite image:", error);
    return null;
  }
}
