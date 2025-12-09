export interface HistoricalWeatherPoint {
  year: number
  date: string
  cloudCover: number // 0-100
  precipitation: number // mm
  temperature: number // celsius
  isClear: boolean // < 20% clouds
}

export interface WeatherStats {
  averageCloudCover: number
  clearSkyProbability: number // 0-100
  yearsAnalyzed: number
  history: HistoricalWeatherPoint[]
}

export async function getHistoricalWeather(
  lat: number,
  lng: number,
  targetMonth: number, // 0-11 (Jan-Dec)
  targetDay: number,
  targetHour: number // 0-23
): Promise<WeatherStats> {
  const currentYear = new Date().getFullYear()
  const yearsToAnalyze = 5
  const startYear = currentYear - yearsToAnalyze - 1 // Start from last year back
  
  const years = Array.from({ length: yearsToAnalyze }, (_, i) => startYear + i)
  
  const promises = years.map(async (year) => {
    // Format date YYYY-MM-DD
    const month = (targetMonth + 1).toString().padStart(2, "0")
    const day = targetDay.toString().padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`
    
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,cloudcover,precipitation&timezone=auto`
    
    try {
      const response = await fetch(url)
      const data = await response.json()
      
      if (!data.hourly) return null
      
      // Find the index for the target hour
      // Open-Meteo returns hourly arrays starting at 00:00
      const hourIndex = targetHour
      
      return {
        year,
        date: dateStr,
        cloudCover: data.hourly.cloudcover[hourIndex] || 0,
        precipitation: data.hourly.precipitation[hourIndex] || 0,
        temperature: data.hourly.temperature_2m[hourIndex] || 0,
        isClear: (data.hourly.cloudcover[hourIndex] || 0) < 20
      } as HistoricalWeatherPoint
    } catch (error) {
      console.error(`Error fetching weather for ${dateStr}:`, error)
      return null
    }
  })
  
  const results = (await Promise.all(promises)).filter((r): r is HistoricalWeatherPoint => r !== null)
  
  if (results.length === 0) {
    return {
      averageCloudCover: 0,
      clearSkyProbability: 0,
      yearsAnalyzed: 0,
      history: []
    }
  }
  
  const totalCloudCover = results.reduce((acc, curr) => acc + curr.cloudCover, 0)
  const clearDays = results.filter(r => r.isClear).length
  
  return {
    averageCloudCover: Math.round(totalCloudCover / results.length),
    clearSkyProbability: Math.round((clearDays / results.length) * 100),
    yearsAnalyzed: results.length,
    history: results.sort((a, b) => b.year - a.year)
  }
}
