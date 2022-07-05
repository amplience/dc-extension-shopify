import React from 'react'
import Image from './Image'

type pickerCardProps = {
    data?: any
    showPrice?: boolean
    shop?: string
}

const PickerCard = ({ data, showPrice, shop }: pickerCardProps) => {
    if (!data) return null

    const product = data.node

    const handleize = (str: string) => {
        return str
            .toLowerCase()
            .replace(/[^\w\u00C0-\u024f]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const relativeLink = `${shop}/products/${product.handle}`

    const shopifyImage =
        product.featuredImage != null &&
        typeof product.featuredImage?.url !== undefined
            ? {
                  src: product.featuredImage?.url,
                  alt: product.featuredImage?.altText,
              }
            : { src: 'https://bigcontent.io/cms/icons/ca-types-image.png', alt: 'placeholder product image' }

    return (
        <article className={`block h-full w-auto`}>
            <a className="block" href={relativeLink}>
                <div className="relative aspect-5x4">
                    <Image
                        src={shopifyImage.src}
                        alt={shopifyImage.alt}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
            </a>
            {product.title && (
                <a className="block" href={relativeLink}>
                    <h3 className="mb-1 text-black font-bold text-base whitespace-pre-line">
                        {product.title}
                    </h3>
                </a>
            )}
            {product.vendor && (
                <a
                    className="text-gray-400 text-base whitespace-pre-line"
                    href={`${shop}/collections/${handleize(product.vendor)}`}
                >
                    {product.vendor}
                </a>
            )}
            {!showPrice && (
                <a className="block" href={relativeLink}>
                    <p className="text-gray-900 text-base whitespace-pre-line">
                        ${product.priceRange.minVariantPrice.amount}
                    </p>
                </a>
            )}
        </article>
    )
}

export default PickerCard
