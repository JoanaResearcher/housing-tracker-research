import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from("listings")
      .select("*")

    setListings(data || [])
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Housing Tracker</h1>

      {listings.map((item) => (
        <div key={item.id}>
          <p>{item.city}, {item.state}</p>
          <p>{item.status}</p>
        </div>
      ))}
    </div>
  )
}
