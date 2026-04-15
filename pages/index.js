import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")

    if (!error) {
      setListings(data || [])
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Housing Tracker</h1>

      {loading && <p>Loading...</p>}

      {listings.map((item) => (
        <div key={item.id}>
          <p>{item.city}, {item.state}</p>
          <p>{item.authority}</p>
          <p>{item.status}</p>
        </div>
      ))}
    </div>
  )
}
