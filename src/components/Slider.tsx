import React, { useCallback, useEffect, useRef, useState } from 'react'
import '@splidejs/splide/css'
import Splide from '@splidejs/splide'
import CollectionCard from './CollectionCard'
import { Product } from 'src/models/Product'

type sliderProps = {
    data?: any
}

const Slider = ({ data }: sliderProps) => {
    const splideEl = useRef<HTMLDivElement>(null)
    const [sliderItems, setSliderItems] = useState([])
    const [collectionHandle, setCollectionHandle] = useState('')
    const schemaURL = 'https://schema.amplience-extension.myshopify.com/'

    let collectionQuery = () => {
        switch (data._meta.schema.replace(schemaURL, '')) {
            case 'collection-carousel':
                return `
          {
              collection(id: "${data.collection.id}") {
              handle
                products(first: 5){
                      edges{
                  node{
                    title
                    featuredImage {
                      url
                      altText
                    }
                    handle
                    priceRange{
                      minVariantPrice{
                        amount
                        currencyCode
                      }
                    }
                    vendor
                  }
                }
              }
              }
          }
          `
            case 'product-picker-carousel':
                console.log(data)
                return data.productPicker.queryString
            case 'product-filter-carousel':
                console.log(data)
                return data['product-filter'].queryString
            default:
                return <h2> Schema Name Mismatch. </h2>
        }
    }

    const generateStorefrontQuery = (query: string) => {
        let storeFrontQuery = query.replace('status', '')
        return (storeFrontQuery = storeFrontQuery.replace(
            'priceRangeV2',
            'priceRange'
        ))
    }

    const getCollectionProducts = async () => {
        const queryString = collectionQuery()
        let queryData: any = ''

        queryString.query ?
        queryData = { query:queryString.query, variables:queryString.variables } : queryData = { query: queryString }


        console.log(queryData)

        const GRAPHQL_BODY = () => {
            return {
                async: true,
                method: 'POST',
                headers: {
                    'X-Shopify-Storefront-Access-Token':
                        '1e400b6d291268c0fdf94f8592b4e7e6',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(queryData),
            }
        }

        try {
            const req = await fetch(
                'https://amplience-extension.myshopify.com/api/2022-04/graphql.json',
                GRAPHQL_BODY()
            )
            const res = await req.json()

            console.log(res)

            res.data.collection != undefined
                ? setSliderItems(res.data.collection.products.edges)
                : res.data.nodes
                ? setSliderItems(res.data.nodes)
                : res.data.products
                ? setSliderItems(res.data.products.edges)
                : console.log('incorrect response')

            //setCollectionHandle(res.data.collection.handle)
            generateSplide('max', false)
        } catch (error: any) {
            console.log(error)
        }
    }

    const slideRender = (data: any, showPrice: boolean) => {
        return <CollectionCard data={data} showPrice={showPrice} />
    }

    const generateSplide = (
        mediaQuery: 'min' | 'max' | undefined,
        destroy: boolean
    ) => {
        if (splideEl.current) {
            const slider = new Splide(splideEl.current, {
                arrows: false,
                autoWidth: true,
                autoHeight: true,
                pagination: false,
                mediaQuery: mediaQuery,
                gap: '.75rem',
                breakpoints: {
                    990: {
                        destroy: destroy,
                    },
                },
            })

            slider.mount()
        }
    }

    const renderSplide = useCallback(() => {
        getCollectionProducts()
    }, [data])

    useEffect(() => {
        renderSplide()
    }, [renderSplide])

    if (!data) return null

    return (
        <>
            <div ref={splideEl} className="splide">
                <div className="splide__track">
                    <div className={`splide__list`}>
                        {sliderItems.map((slide: any, index: any) => {
                            return (
                                <div
                                    className={`splide__slide w-[30rem]`}
                                    key={`${index}`}
                                >
                                    {slideRender(slide, data.showPrice)}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Slider
