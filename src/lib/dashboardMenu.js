const ADMIN = [
  { label: "Dashboard", icon: "grid-outline", path: "/", ready: true },
  { label: "Orders", icon: "receipt-outline", path: "/orders" },
  { label: "Products", icon: "bag-handle-outline", path: "/products" },
  { label: "Services", icon: "construct-outline", path: "/services" },
  { label: "Categories", icon: "albums-outline", path: "/categories" },
  { label: "Sellers", icon: "storefront-outline", path: "/sellers" },
  { label: "Users / Customers", icon: "people-outline", path: "/users" },
  { label: "Reviews & Ratings", icon: "star-outline", path: "/reviews" },
  { label: "Coupons & Offers", icon: "pricetag-outline", path: "/coupons" },
  { label: "Banners", icon: "image-outline", path: "/banners" },
  { label: "Map", icon: "map-outline", path: "/map" },
];

const SELLER = [
  { label: "Dashboard", icon: "grid-outline", path: "/", ready: true },
  { label: "Orders", icon: "receipt-outline", path: "/orders" },
  {
    label: "Products",
    icon: "bag-handle-outline",
    path: "/products",
    hideFor: "service",
  },
  {
    label: "Services",
    icon: "construct-outline",
    path: "/services",
    hideFor: "product",
  },
  { label: "My Store", icon: "storefront-outline", path: "/store" },
  { label: "Reviews & Ratings", icon: "star-outline", path: "/reviews" },
  { label: "Banners", icon: "image-outline", path: "/banners" },
  { label: "Coupons & Offers", icon: "pricetag-outline", path: "/coupons" },
  { label: "Payouts & Earnings", icon: "wallet-outline", path: "/payouts" },
];

const VENDOR = [
  { label: "Dashboard", icon: "grid-outline", path: "/", ready: true },
  { label: "Orders", icon: "receipt-outline", path: "/orders" },
  { label: "Fresh Delivery", icon: "flash-outline", path: "/fresh-delivery" },
  { label: "My Store", icon: "storefront-outline", path: "/store" },
  { label: "Reviews & Ratings", icon: "star-outline", path: "/reviews" },
  { label: "Banners", icon: "image-outline", path: "/banners" },
  { label: "Payouts & Earnings", icon: "wallet-outline", path: "/payouts" },
];

export const getMenu = (user) => {
  if (user?.role === "SUPER_ADMIN") return ADMIN;
  if (user?.role === "VENDOR") return VENDOR;
  return SELLER.filter((item) => item.hideFor !== user?.seller_type);
};
