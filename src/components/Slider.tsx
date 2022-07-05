import React, { useCallback, useEffect, useRef, useState } from 'react'
import '@splidejs/splide/css'
import Splide from '@splidejs/splide'
import CollectionCard from './CollectionCard'
import { useRouter } from 'next/router'

type sliderProps = {
    data?: any
    shop?: string
}

const Slider = ({ data, shop }: sliderProps) => {
    const splideEl = useRef<HTMLDivElement>(null)
    const [sliderItems, setSliderItems] = useState([])
    const router = useRouter()
    const contentType = router.query.contentType
        ? router.query.contentType.toString()
        : ''

    let collectionQuery = () => {
        switch (contentType) {
            case 'collection-picker':
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
            case 'product-picker':
                if(data.productPicker)
                return data.productPicker.queryString
            case 'product-filter':
                if(data['product-filter'])
                return data['product-filter'].queryString
            default:
                return <h2> Schema Name Mismatch. </h2>
        }
    }

    const getCollectionProducts = async () => {
        const queryString = collectionQuery()
        let queryData: any = ''

        queryString.query
            ? (queryData = {
                  query: queryString.query,
                  variables: queryString.variables,
              })
            : (queryData = { query: queryString })

            console.log('try')
            try {
                const dbRes = await fetch(`/api/shop-session?shop=${shop}`)
                const dbData = await dbRes.json()
                const req = await fetch(
                    `/api/fetch-storefront-token?shop=${shop}&key=${
                        dbData.accessToken
                    }&query=${JSON.stringify(queryData)}`
                )
                const res = await req.json()
                console.log(res)

                if (res == null) return

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
                console.error(error.message)
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
