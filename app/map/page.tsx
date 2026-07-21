"use client"

import MapDirectory from "./MapDirectory"
import UserBottomNav from "@/app/components/UserBottomNav"

export default function MapPage() {
  return <div className="map-page"><main className="map-main"><MapDirectory /></main><UserBottomNav active="map" /></div>
}
