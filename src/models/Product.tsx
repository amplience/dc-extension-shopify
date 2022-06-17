export interface Product {
    id: string
    title: string
    status: string
    vendor: string
    priceRangeV2: {
        maxVariantPrice: {
            amount: number
            currencyCode: string
        }
        minVariantPrice: {
            amount: number
            currencyCode: string
        }
    }
    featuredImage: {
        src: string,
        altText: string
        transformedSrc: string
    }
    cursor?:string
}