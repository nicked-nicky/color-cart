import type { ColorBasketApi } from './index'

declare global {
  interface Window {
    api: ColorBasketApi
  }
}
