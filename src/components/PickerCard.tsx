import React from 'react'
import Image from './Image'

type collectionCardProps = {
    data?: any
}

const PickerCard = ({
    data,
}: collectionCardProps) => {

    if (!data) return null

    const product = data.node;

    const handleize = (str : string) => {
      return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
    }

    const relativeLink = `https://amplience-extension.myshopify.com/products/${product.handle}`

    return (
        <article className={`block h-full w-auto`}>
             <a className="block" href={relativeLink}>
      <div className="relative aspect-5x4">
        <Image
          src={product.featuredImage?.url}
          alt={product.featuredImage?.altText}
          layout="fill"
          objectFit="cover"
        />
      </div>
      {product.title && (
        <h3 className="mb-1 text-black font-bold text-base whitespace-pre-line">
          {product.title}
        </h3>
      )}
      {product.vendor && (
        <a className="text-gray-400 text-base whitespace-pre-line" href={`https://amplience-extension.myshopify.com/collections/${handleize(product.vendor)}`}>
          {product.vendor}
        </a>
      )}
      {product.priceRange && (
        <p className="text-gray-900 text-base whitespace-pre-line">
          ${product.priceRange.minVariantPrice.amount}
        </p>
      )}
    </a>
        </article>
    )
}

export default PickerCard
