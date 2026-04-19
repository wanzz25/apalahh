/**
 * Vercel Serverless Function — IP Geo Check
 * Route: /api/ping?ip=103.45.67.12
 *
 * Returns geo info and basic reachability via ip-api.com
 */
export default async function handler(req, res) {
  const { ip } = req.query

  if (!ip) {
    return res.status(400).json({ error: 'IP parameter required' })
  }

  // Allow CORS for same-origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  // Private IP ranges — assumed online (not routable from internet)
  const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|127\.|localhost)/.test(ip)
  if (isPrivate) {
    return res.status(200).json({
      reachable: true,
      private:   true,
      ip,
      info: null,
    })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `https://ip-api.com/json/${ip}?fields=status,country,city,isp,org,as,lat,lon,query`,
      { signal: controller.signal }
    )
    clearTimeout(timeout)

    const data = await response.json()

    return res.status(200).json({
      reachable: data.status === 'success',
      private:   false,
      ip,
      info: data.status === 'success' ? {
        country: data.country,
        city:    data.city,
        isp:     data.isp,
        org:     data.org,
        lat:     data.lat,
        lon:     data.lon,
      } : null,
    })
  } catch (err) {
    return res.status(200).json({
      reachable: false,
      private:   false,
      ip,
      info: null,
      error: err.message,
    })
  }
}
