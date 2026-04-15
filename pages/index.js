import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  async function fetchListings() {
    setLoading(true)

    const { data, error } = await supabase
      .from("listings")
      .select("*")

    if (error) {
      console.log("Error loading data:", error)
    } else {
      setListings(data)
    }

    setLoading(false)
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Housing Voucher Tracker</h1>

      {loading && <p>Loading listings...</p>}

      {!loading && listings.length === 0 && (
        <p>No listings found.</p>
      )}

      <div style={{ marginTop: "20px" }}>
        {listings.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <h3>
              {item.city}, {item.state}
            </h3>

            <p><b>Authority:</b> {item.authority}</p>
            <p><b>Status:</b> {item.status}</p>
            <p>
              <a href={item.url} target="_blank">
                More Info
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
