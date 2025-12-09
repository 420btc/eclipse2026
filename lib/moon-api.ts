"use server"

interface MoonData {
  timestamp: number
  datestamp: string
  sun: {
    sunrise: number
    sunrise_timestamp: string
    sunset: number
    sunset_timestamp: string
    solar_noon: string
    day_length: string
    position: {
      altitude: number
      azimuth: number
      distance: number
    }
  }
  moon: {
    phase: number
    phase_name: string
    stage: string
    illumination: string
    age_days: number
    lunar_cycle: string
    emoji: string
    moonrise: string
    moonset: string
  }
}

export async function getMoonData(lat: number, lng: number, date: string): Promise<MoonData | null> {
  const url = `https://moon-phase.p.rapidapi.com/advanced?lat=${lat}&lon=${lng}&date=${date}`
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
      "x-rapidapi-host": "moon-phase.p.rapidapi.com",
    },
  }

  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`Error fetching moon data: ${response.statusText}`)
    }
    const result = await response.json()
    return result as MoonData
  } catch (error) {
    console.error(error)
    return null
  }
}
