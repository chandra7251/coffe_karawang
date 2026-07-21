type IconProps = {
  name: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  filled?: boolean
  className?: string
  [key: string]: unknown
}

const symbols: Record<string, string> = {
  coffee: "local_cafe", search: "search", mapPin: "location_on", star: "star", user: "person", person: "person", info: "info", check: "check_circle", arrowLeft: "arrow_back", heart: "favorite", bookmark: "bookmark", moon: "dark_mode", sun: "light_mode", smoking: "smoking_rooms", toilet: "wc", clock: "schedule", phone: "phone", directions: "directions", edit: "edit", notifications: "notifications", logout: "logout", parking: "local_parking", rate_review: "rate_review", home: "home", map: "map", directionsCar: "directions_car", wifi: "wifi", warning: "warning", verified: "verified", menuBook: "menu_book", close: "close", power: "power", mosque: "mosque", tune: "tune", share: "share", chevronRight: "chevron_right", chevronDown: "expand_more", dashboard: "dashboard", storefront: "storefront", analytics: "analytics", group: "group", settings: "settings", add: "add",
}

export function Icon({ name, size = "md", filled = false, className = "", ...props }: IconProps) {
  const sizeClasses = { xs: "text-[14px]", sm: "text-[18px]", md: "text-[22px]", lg: "text-[30px]", xl: "text-[40px]" }
  const symbol = symbols[name]
  if (!symbol) return null
  return <span aria-hidden="true" className={`material-symbols-outlined icon leading-none ${sizeClasses[size]} ${className}`} style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }} {...props}>{symbol}</span>
}




