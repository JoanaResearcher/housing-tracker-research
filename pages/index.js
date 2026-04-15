import { useState } from "react";

export default function Home() {
  const [filter, setFilter] = useState("all");

  const listings = [
    {
      city: "Richmond",
      state: "VA",
      authority: "Richmond Redevelopment & Housing Authority",
      status: "open",
      url: "#"
    },
    {
      city: "Norfolk",
      state: "VA",
      authority: "Norfolk Redevelopment & Housing Authority",
      status: "waitlist",
      url: "#"
    },
    {
      city: "Virginia Beach",
      state: "VA",
      authority: "Virginia Beach Housing & Neighborhood Preservation",
      status: "closed",
      url: "#"
    }
  ];

  const filtered = listings.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Housing Voucher Tracker</h1>
      <p>ODU Living Lab Research Project</p>

      <hr />

      {/* FILTERS */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("open")}>Open</button>
        <button onClick={() => setFilter("waitlist")}>Waitlist</button>
        <button onClick={() => setFilter("closed")}>Closed</button>
      </div>

      {/* LISTINGS */}
      {filtered.map((item, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8
          }}
        >
          <h3>
            {item.city}, {item.state}
          </h3>

          <p>{item.authority}</p>

          <p>
            Status:{" "}
            <strong>
              {item.status.toUpperCase()}
            </strong>
          </p>

          <a href={item.url}>View Source</a>
        </div>
      ))}
    </div>
  );
}
