import { authenticatedFetch } from '@shopify/app-bridge-utils'
import { useAppBridge } from '@shopify/app-bridge-react'

export const useAuthFetch = () => {
    const app = useAppBridge()
    return authenticatedFetch(app)
}

export default useAuthFetch